import { Controller, Get, Post, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/strategies/jwt.guard';
import { MarketingService } from './marketing.service';
import {
  CreateSeoMetadataDto,
  UpdateTagConfigDto,
  TrackConversionDto,
  TrackingPlatform,
} from './dto/marketing.dto';

@ApiTags('Marketing - Growth & SEO Brain')
@Controller('marketing')
export class MarketingController {
  constructor(private marketingService: MarketingService) {}

  // ============== SEO ENDPOINTS ==============

  @Post('seo/metadata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update SEO metadata for content' })
  async createSeoMetadata(@Body() dto: CreateSeoMetadataDto) {
    return this.marketingService.createOrUpdateSeoMetadata(dto.tenantId, dto);
  }

  @Get('seo/metadata/:slug')
  @ApiOperation({ summary: 'Get SEO metadata by slug (public for SSR)' })
  async getSeoMetadata(@Query('tenant') tenantId: string, @Param('slug') slug: string) {
    return this.marketingService.getSeoMetadata(tenantId, slug);
  }

  @Get('seo/page/:slug')
  @ApiOperation({ summary: 'Get HTML meta tags for page' })
  async getPageMetaTags(@Query('tenant') tenantId: string, @Param('slug') slug: string) {
    return {
      metaTags: await this.marketingService.generatePageMetaTags(tenantId, slug),
    };
  }

  @Get('seo/health')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SEO health metrics' })
  async getSeoHealth(@Query('tenant') tenantId: string) {
    return this.marketingService.getSeoHealthMetrics(tenantId);
  }

  // ============== TAG MANAGER ENDPOINTS ==============

  @Put('tags/:platform')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tag configuration (GTM, GA4, Meta Pixel, TikTok, Google Ads)' })
  async updateTagConfig(
    @Query('tenant') tenantId: string,
    @Param('platform') platform: TrackingPlatform,
    @Query('env') environment: string,
    @Body() dto: UpdateTagConfigDto,
  ) {
    return this.marketingService.updateTagConfig(tenantId, platform, environment, dto);
  }

  @Get('tags/:platform')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tag configuration' })
  async getTagConfig(
    @Query('tenant') tenantId: string,
    @Param('platform') platform: TrackingPlatform,
    @Query('env') environment: string = 'production',
  ) {
    return this.marketingService.getTagConfig(tenantId, platform, environment);
  }

  @Get('tracking/config/storefront')
  @ApiOperation({ summary: 'Get all tracking configs for storefront (public)' })
  async getStorefrontConfig(@Query('tenant') tenantId: string) {
    return this.marketingService.getStorefrontTrackingConfig(tenantId);
  }

  // ============== CONVERSION TRACKING ENDPOINTS ==============

  @Post('conversions/track')
  @ApiOperation({ summary: 'Track conversion event (ad-blocker proof, server-side)' })
  async trackConversion(@Query('tenant') tenantId: string, @Body() dto: TrackConversionDto) {
    await this.marketingService.trackConversion(tenantId, dto);
    return { success: true };
  }

  @Post('conversions/retry-failed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retry failed conversion events' })
  async retryFailed() {
    await this.marketingService.retryFailedConversions();
    return { success: true };
  }
}
