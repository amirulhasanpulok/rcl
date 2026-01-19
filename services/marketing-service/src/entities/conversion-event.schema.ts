import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversionEventDocument = ConversionEvent & Document;

@Schema({ timestamps: true, collection: 'conversion_events' })
export class ConversionEvent {
  @Schema.Raw() tenantId: string;
  @Schema.Raw() eventType: 'page_view' | 'add_to_cart' | 'checkout_complete' | 'purchase' | 'custom';
  @Schema.Raw() customEventName?: string;
  @Schema.Raw() source: 'order.created' | 'payment.completed' | 'shipment.delivered' | 'user.action';
  @Schema.Raw() referenceId: string;
  @Schema.Raw() userId?: string;
  @Schema.Raw() sessionId?: string;
  @Schema.Raw() eventData: Record<string, any>;
  @Schema.Raw() platforms: Array<'meta' | 'ga4' | 'tiktok' | 'google_ads'>;
  @Schema.Raw() sentAt?: Date;
  @Schema.Raw() status: 'pending' | 'sent' | 'failed';
  @Schema.Raw() errorMessage?: string;
  @Schema.Raw() retryCount: number;
}

export const ConversionEventSchema = SchemaFactory.createForClass(ConversionEvent);
ConversionEventSchema.index({ tenantId: 1, eventType: 1, createdAt: -1 });
ConversionEventSchema.index({ tenantId: 1, status: 1 });
