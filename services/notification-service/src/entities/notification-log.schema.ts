import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

@Schema({ timestamps: true })
export class NotificationLog extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  templateId: string;

  @Prop({ required: true })
  recipient: string;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop()
  subject: string;

  @Prop()
  body: string;

  @Prop({ type: Object })
  variables: Record<string, any>;

  @Prop({ nullable: true })
  sentAt: Date;

  @Prop({ nullable: true })
  deliveredAt: Date;

  @Prop({ nullable: true })
  failedAt: Date;

  @Prop({ nullable: true })
  errorMessage: string;

  @Prop({ nullable: true })
  externalId: string;

  @Prop({ nullable: true })
  reference: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);
NotificationLogSchema.index({ userId: 1, createdAt: -1 });
NotificationLogSchema.index({ recipient: 1 });
NotificationLogSchema.index({ status: 1 });
NotificationLogSchema.index({ type: 1 });
