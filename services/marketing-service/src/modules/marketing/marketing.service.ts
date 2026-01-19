import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { SEOMetadata, SEOMetadataDocument } from '@/entities/seo-metadata.schema';
import { TagConfig, TagConfigDocument } from '@/entities/tag-config.schema';
import { ConversionEvent, ConversionEventDocument } from '@/entities/conversion-event.schema';
import {
  CreateSeoMetadataDto,
  UpdateTagConfigDto,
  TrackConversionDto,
  TrackingPlatform,
} from './dto/marketing.dto';

@Injectable()
export class MarketingService {
  private logger = new Logger(MarketingService.name);

  constructor(
    @InjectModel(SEOMetadata.name)
    private seoMetadataModel: Model<SEOMetadataDocument>,
    @InjectModel(TagConfig.name)
    private tagConfigModel: Model<TagConfigDocument>,
    @InjectModel(ConversionEvent.name)
    private conversionEventModel: Model<ConversionEventDocument>,
  ) {}

  // ============== SEO MANAGEMENT ==============

  async createOrUpdateSeoMetadata(
    tenantId: string,
    dto: CreateSeoMetadataDto,
  ): Promise<SEOMetadataDocument> {
    return this.seoMetadataModel.findOneAndUpdate(
      { tenantId, slug: dto.slug },
      {
        ...dto,
        tenantId,
        lastModified: new Date(),
      },
      { upsert: true, new: true },
    );
  }

  async getSeoMetadata(tenantId: string, slug: string): Promise<SEOMetadataDocument | null> {
    return this.seoMetadataModel.findOne({ tenantId, slug });
  }

  async getSeoMetadataByContentId(
    tenantId: string,
    contentType: string,
    contentId: string,
  ): Promise<SEOMetadataDocument | null> {
    return this.seoMetadataModel.findOne({ tenantId, contentType, contentId });
  }

  async generatePageMetaTags(tenantId: string, slug: string): Promise<string> {
    const metadata = await this.getSeoMetadata(tenantId, slug);
    if (!metadata) return '';

    const tags = [
      `<title>${metadata.metaTitle}</title>`,
      `<meta name="description" content="${metadata.metaDescription}" />`,
      `<link rel="canonical" href="${metadata.canonicalUrl}" />`,
      metadata.robotsRules ? `<meta name="robots" content="${metadata.robotsRules}" />` : '',
      metadata.ogTitle ? `<meta property="og:title" content="${metadata.ogTitle}" />` : '',
      metadata.ogDescription
        ? `<meta property="og:description" content="${metadata.ogDescription}" />`
        : '',
      metadata.ogImage ? `<meta property="og:image" content="${metadata.ogImage}" />` : '',
      metadata.twitterCard ? `<meta name="twitter:card" content="${metadata.twitterCard}" />` : '',
      metadata.schemaMarkup
        ? `<script type="application/ld+json">${JSON.stringify(metadata.schemaMarkup)}</script>`
        : '',
    ];

    return tags.filter((tag) => tag).join('\n');
  }

  // ============== TAG MANAGEMENT ==============

  async updateTagConfig(
    tenantId: string,
    platform: TrackingPlatform,
    environment: string,
    dto: UpdateTagConfigDto,
  ): Promise<TagConfigDocument> {
    return this.tagConfigModel.findOneAndUpdate(
      { tenantId, platform, environment },
      {
        tenantId,
        platform,
        environment,
        ...dto,
      },
      { upsert: true, new: true },
    );
  }

  async getTagConfig(
    tenantId: string,
    platform: TrackingPlatform,
    environment: string,
  ): Promise<TagConfigDocument | null> {
    return this.tagConfigModel.findOne({ tenantId, platform, environment });
  }

  async getAllTagConfigs(tenantId: string, environment: string): Promise<TagConfigDocument[]> {
    return this.tagConfigModel.find({
      tenantId,
      environment,
      isEnabled: true,
    });
  }

  async getStorefrontTrackingConfig(tenantId: string): Promise<Record<string, any>> {
    const configs = await this.getAllTagConfigs(tenantId, 'production');
    const trackingConfig: Record<string, any> = {};

    for (const config of configs) {
      if (config.platform === TrackingPlatform.GTM && config.containerId) {
        trackingConfig.gtm = { containerId: config.containerId };
      }
      if (config.platform === TrackingPlatform.GA4 && config.measurementId) {
        trackingConfig.ga4 = { measurementId: config.measurementId };
      }
      if (config.platform === TrackingPlatform.META_PIXEL && config.pixelId) {
        trackingConfig.metaPixel = { pixelId: config.pixelId };
      }
      if (config.platform === TrackingPlatform.TIKTOK_PIXEL && config.pixelId) {
        trackingConfig.tiktokPixel = { pixelId: config.pixelId };
      }
    }

    return trackingConfig;
  }

  // ============== CONVERSION TRACKING ==============

  async trackConversion(tenantId: string, dto: TrackConversionDto): Promise<void> {
    const event = await this.conversionEventModel.create({
      tenantId,
      ...dto,
      status: 'pending',
      retryCount: 0,
    });

    // Send to all enabled platforms
    for (const platform of dto.platforms) {
      await this.sendConversionEvent(tenantId, event, platform);
    }
  }

  private async sendConversionEvent(
    tenantId: string,
    event: ConversionEventDocument,
    platform: TrackingPlatform,
  ): Promise<void> {
    try {
      const config = await this.getTagConfig(tenantId, platform, 'production');
      if (!config || !config.isEnabled) return;

      switch (platform) {
        case TrackingPlatform.META_PIXEL:
          await this.sendToMetaConversionsAPI(config, event);
          break;
        case TrackingPlatform.GA4:
          await this.sendToGA4MeasurementProtocol(config, event);
          break;
        case TrackingPlatform.TIKTOK_PIXEL:
          await this.sendToTikTokEventsAPI(config, event);
          break;
      }

      await this.conversionEventModel.updateOne(
        { _id: event._id },
        { status: 'sent', sentAt: new Date() },
      );
    } catch (error) {
      this.logger.error(`Failed to send conversion to ${platform}:`, error);
      await this.conversionEventModel.updateOne(
        { _id: event._id },
        {
          status: 'failed',
          errorMessage: error.message,
          retryCount: event.retryCount + 1,
        },
      );
    }
  }

  private async sendToMetaConversionsAPI(
    config: TagConfigDocument,
    event: ConversionEventDocument,
  ): Promise<void> {
    const pixelId = config.pixelId;
    const accessToken = config.apiToken;

    const payload = {
      data: [
        {
          event_name: event.eventType,
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            em: event.eventData.email ? this.hashEmail(event.eventData.email) : undefined,
            ph: event.eventData.phone ? this.hashPhone(event.eventData.phone) : undefined,
            fn: event.eventData.firstName ? this.hashValue(event.eventData.firstName) : undefined,
            ln: event.eventData.lastName ? this.hashValue(event.eventData.lastName) : undefined,
          },
          custom_data: {
            value: event.eventData.value,
            currency: event.eventData.currency || 'USD',
            content_type: 'product',
            content_ids: event.eventData.contentIds || [],
          },
        },
      ],
    };

    await axios.post(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      payload,
    );
  }

  private async sendToGA4MeasurementProtocol(
    config: TagConfigDocument,
    event: ConversionEventDocument,
  ): Promise<void> {
    const measurementId = config.measurementId;
    const apiSecret = config.config?.apiSecret;

    const payload = {
      client_id: event.sessionId || event.userId,
      timestamp_micros: Date.now() * 1000,
      events: [
        {
          name: event.eventType,
          params: {
            ...event.eventData,
            currency: event.eventData.currency || 'USD',
          },
        },
      ],
    };

    await axios.post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      payload,
    );
  }

  private async sendToTikTokEventsAPI(
    config: TagConfigDocument,
    event: ConversionEventDocument,
  ): Promise<void> {
    const pixelId = config.pixelId;
    const accessToken = config.apiToken;

    const payload = {
      pixel_code: pixelId,
      data: [
        {
          event: event.eventType,
          event_id: event.referenceId,
          timestamp: new Date().toISOString(),
          properties: {
            value: event.eventData.value,
            currency: event.eventData.currency || 'USD',
          },
          user: {
            email: event.eventData.email,
            phone: event.eventData.phone,
          },
        },
      ],
    };

    await axios.post('https://track.tiktok.com/v1/conversion/api/event/track', payload, {
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  private hashEmail(email: string): string {
    return require('crypto').createHash('sha256').update(email.toLowerCase()).digest('hex');
  }

  private hashPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    return require('crypto').createHash('sha256').update(cleaned).digest('hex');
  }

  private hashValue(value: string): string {
    return require('crypto').createHash('sha256').update(value.toLowerCase()).digest('hex');
  }

  // ============== RETRY FAILED EVENTS ==============

  async retryFailedConversions(): Promise<void> {
    const failedEvents = await this.conversionEventModel.find({
      status: 'failed',
      retryCount: { $lt: 3 },
    });

    for (const event of failedEvents) {
      for (const platform of event.platforms) {
        await this.sendConversionEvent(event.tenantId, event, platform as TrackingPlatform);
      }
    }
  }

  async getSeoHealthMetrics(tenantId: string): Promise<any> {
    const totalPages = await this.seoMetadataModel.countDocuments({ tenantId });
    const pagesWithoutCanonical = await this.seoMetadataModel.countDocuments({
      tenantId,
      canonicalUrl: { $exists: false },
    });
    const pagesWithoutKeywords = await this.seoMetadataModel.countDocuments({
      tenantId,
      keywords: { $exists: false, $size: 0 },
    });

    return {
      totalPages,
      pagesWithoutCanonical,
      pagesWithoutKeywords,
      healthScore:
        totalPages > 0
          ? Math.round(
              ((totalPages - pagesWithoutCanonical - pagesWithoutKeywords) / totalPages) * 100,
            )
          : 0,
    };
  }
}
