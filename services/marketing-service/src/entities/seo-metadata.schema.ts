import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SEOMetadataDocument = SEOMetadata & Document;

@Schema({ timestamps: true, collection: 'seo_metadata' })
export class SEOMetadata {
  @Schema.Raw() tenantId: string;
  @Schema.Raw() slug: string;
  @Schema.Raw() contentType: 'product' | 'category' | 'page';
  @Schema.Raw() contentId: string;
  @Schema.Raw() metaTitle: string;
  @Schema.Raw() metaDescription: string;
  @Schema.Raw() canonicalUrl: string;
  @Schema.Raw() robotsRules: string;
  @Schema.Raw() ogTitle?: string;
  @Schema.Raw() ogDescription?: string;
  @Schema.Raw() ogImage?: string;
  @Schema.Raw() twitterCard?: string;
  @Schema.Raw() twitterTitle?: string;
  @Schema.Raw() twitterDescription?: string;
  @Schema.Raw() twitterImage?: string;
  @Schema.Raw() schemaMarkup?: Record<string, any>;
  @Schema.Raw() keywords: string[];
  @Schema.Raw() lastModified: Date;
  @Schema.Raw() publishedAt?: Date;
  @Schema.Raw() author?: string;
}

export const SEOMetadataSchema = SchemaFactory.createForClass(SEOMetadata);
SEOMetadataSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
SEOMetadataSchema.index({ tenantId: 1, contentType: 1, contentId: 1 });
