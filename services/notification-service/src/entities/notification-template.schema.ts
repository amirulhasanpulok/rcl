import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum TemplateCategory {
  ORDER = 'order',
  PAYMENT = 'payment',
  SHIPMENT = 'shipment',
  USER = 'user',
  INVENTORY = 'inventory',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class NotificationTemplate extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ enum: TemplateCategory, required: true })
  category: TemplateCategory;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object, default: {} })
  variables: Record<string, string>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, nullable: true })
  metadata: Record<string, any>;

  @Prop()
  createdBy: string;

  @Prop()
  updatedAt: Date;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);
NotificationTemplateSchema.index({ type: 1, category: 1 });
NotificationTemplateSchema.index({ name: 1 });
