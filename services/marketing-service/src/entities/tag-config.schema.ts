import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagConfigDocument = TagConfig & Document;

@Schema({ timestamps: true, collection: 'tag_configs' })
export class TagConfig {
  @Schema.Raw() tenantId: string;
  @Schema.Raw() platform: 'google_tag_manager' | 'google_analytics_4' | 'meta_pixel' | 'tiktok_pixel' | 'google_ads';
  @Schema.Raw() isEnabled: boolean;
  @Schema.Raw() containerId?: string;
  @Schema.Raw() measurementId?: string;
  @Schema.Raw() pixelId?: string;
  @Schema.Raw() conversionId?: string;
  @Schema.Raw() apiToken?: string;
  @Schema.Raw() environment: 'development' | 'staging' | 'production';
  @Schema.Raw() config: Record<string, any>;
  @Schema.Raw() lastSyncedAt?: Date;
}

export const TagConfigSchema = SchemaFactory.createForClass(TagConfig);
TagConfigSchema.index({ tenantId: 1, platform: 1, environment: 1 }, { unique: true });
