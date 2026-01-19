import { IsString, IsEnum, IsOptional, IsObject, IsEmail } from 'class-validator';
import { NotificationType, TemplateCategory } from '@/entities/notification-template.schema';
import { NotificationStatus } from '@/entities/notification-log.schema';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SendEmailDto {
  @IsEmail()
  recipient: string;

  @IsString()
  templateName: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class SendSMSDto {
  @IsString()
  recipient: string;

  @IsString()
  templateName: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class SendPushDto {
  @IsString()
  userId: string;

  @IsString()
  deviceToken: string;

  @IsString()
  templateName: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class BulkSendDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  templateName: string;

  @IsString()
  recipients: string[];

  @IsOptional()
  @IsObject()
  variablesList?: Record<string, any>[];

  @IsOptional()
  @IsString()
  reference?: string;
}

export class NotificationLogResponseDto {
  id: string;
  userId: string;
  recipient: string;
  type: NotificationType;
  status: NotificationStatus;
  subject: string;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export class TemplateResponseDto {
  id: string;
  name: string;
  type: NotificationType;
  category: TemplateCategory;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: Date;
}
