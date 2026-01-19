import { IsString, IsEnum, IsObject, IsOptional, IsArray } from 'class-validator';

export enum SeoContentType {
  PRODUCT = 'product',
  CATEGORY = 'category',
  PAGE = 'page',
}

export class CreateSeoMetadataDto {
  @IsString()
  tenantId: string;

  @IsString()
  slug: string;

  @IsEnum(SeoContentType)
  contentType: SeoContentType;

  @IsString()
  contentId: string;

  @IsString()
  metaTitle: string;

  @IsString()
  metaDescription: string;

  @IsString()
  canonicalUrl: string;

  @IsOptional()
  @IsString()
  robotsRules?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsObject()
  schemaMarkup?: Record<string, any>;
}

export enum TrackingPlatform {
  GTM = 'google_tag_manager',
  GA4 = 'google_analytics_4',
  META_PIXEL = 'meta_pixel',
  TIKTOK_PIXEL = 'tiktok_pixel',
  GOOGLE_ADS = 'google_ads',
}

export class UpdateTagConfigDto {
  @IsOptional()
  @IsString()
  containerId?: string;

  @IsOptional()
  @IsString()
  measurementId?: string;

  @IsOptional()
  @IsString()
  pixelId?: string;

  @IsOptional()
  @IsString()
  apiToken?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  isEnabled?: boolean;
}

export enum EventType {
  PAGE_VIEW = 'page_view',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT_COMPLETE = 'checkout_complete',
  PURCHASE = 'purchase',
  CUSTOM = 'custom',
}

export class TrackConversionDto {
  @IsEnum(EventType)
  eventType: EventType;

  @IsOptional()
  @IsString()
  customEventName?: string;

  @IsString()
  referenceId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsObject()
  eventData: Record<string, any>;

  @IsArray()
  @IsEnum(TrackingPlatform, { each: true })
  platforms: TrackingPlatform[];
}
