import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Handlebars from 'handlebars';
import { NotificationTemplate, TemplateCategory } from '@/entities/notification-template.schema';
import { NotificationLog, NotificationStatus, NotificationType } from '@/entities/notification-log.schema';
import { EmailGateway } from '@/gateways/email.gateway';
import { SMSGateway } from '@/gateways/sms.gateway';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  SendEmailDto,
  SendSMSDto,
  BulkSendDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(NotificationTemplate.name)
    private readonly templateModel: Model<NotificationTemplate>,
    @InjectModel(NotificationLog.name)
    private readonly logModel: Model<NotificationLog>,
    private readonly emailGateway: EmailGateway,
    private readonly smsGateway: SMSGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Template Management
  async createTemplate(userId: string, dto: CreateTemplateDto): Promise<NotificationTemplate> {
    const template = new this.templateModel({
      ...dto,
      createdBy: userId,
    });
    return template.save();
  }

  async getTemplate(id: string): Promise<NotificationTemplate> {
    const template = await this.templateModel.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async getTemplateByName(name: string, type?: NotificationType): Promise<NotificationTemplate> {
    const query: any = { name, isActive: true };
    if (type) {
      query.type = type;
    }

    const template = await this.templateModel.findOne(query);
    if (!template) {
      throw new NotFoundException(`Template '${name}' not found`);
    }
    return template;
  }

  async getAllTemplates(category?: TemplateCategory, type?: NotificationType) {
    const query: any = { isActive: true };
    if (category) {
      query.category = category;
    }
    if (type) {
      query.type = type;
    }

    return this.templateModel.find(query).sort({ category: 1, name: 1 });
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<NotificationTemplate> {
    const template = await this.templateModel.findByIdAndUpdate(id, dto, { new: true });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    const result = await this.templateModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Template not found');
    }
  }

  // Email Sending
  async sendEmail(userId: string, dto: SendEmailDto): Promise<NotificationLog> {
    const template = await this.getTemplateByName(dto.templateName, NotificationType.EMAIL);

    // Render template with variables
    const subject = this.renderTemplate(template.subject, dto.variables || {});
    const body = this.renderTemplate(template.body, dto.variables || {});

    const log = new this.logModel({
      userId,
      templateId: template._id,
      recipient: dto.recipient,
      type: NotificationType.EMAIL,
      subject,
      body,
      variables: dto.variables,
      reference: dto.reference,
      status: NotificationStatus.PENDING,
    });

    try {
      const messageId = await this.emailGateway.sendEmail({
        to: dto.recipient,
        subject,
        html: body,
      });

      log.externalId = messageId;
      log.status = NotificationStatus.SENT;
      log.sentAt = new Date();

      this.eventEmitter.emit('notification.sent', {
        userId,
        type: NotificationType.EMAIL,
        recipient: dto.recipient,
        timestamp: new Date(),
      });
    } catch (error) {
      log.status = NotificationStatus.FAILED;
      log.failedAt = new Date();
      log.errorMessage = error.message;

      this.eventEmitter.emit('notification.failed', {
        userId,
        type: NotificationType.EMAIL,
        recipient: dto.recipient,
        error: error.message,
        timestamp: new Date(),
      });
    }

    return log.save();
  }

  // SMS Sending
  async sendSMS(userId: string, dto: SendSMSDto): Promise<NotificationLog> {
    const template = await this.getTemplateByName(dto.templateName, NotificationType.SMS);

    // Render template with variables
    const body = this.renderTemplate(template.body, dto.variables || {});

    const log = new this.logModel({
      userId,
      templateId: template._id,
      recipient: dto.recipient,
      type: NotificationType.SMS,
      body,
      variables: dto.variables,
      reference: dto.reference,
      status: NotificationStatus.PENDING,
    });

    try {
      const messageSid = await this.smsGateway.sendSMS({
        to: dto.recipient,
        body,
      });

      log.externalId = messageSid;
      log.status = NotificationStatus.SENT;
      log.sentAt = new Date();

      this.eventEmitter.emit('notification.sent', {
        userId,
        type: NotificationType.SMS,
        recipient: dto.recipient,
        timestamp: new Date(),
      });
    } catch (error) {
      log.status = NotificationStatus.FAILED;
      log.failedAt = new Date();
      log.errorMessage = error.message;

      this.eventEmitter.emit('notification.failed', {
        userId,
        type: NotificationType.SMS,
        recipient: dto.recipient,
        error: error.message,
        timestamp: new Date(),
      });
    }

    return log.save();
  }

  // Bulk Sending
  async bulkSend(userId: string, dto: BulkSendDto): Promise<NotificationLog[]> {
    const template = await this.getTemplateByName(dto.templateName, dto.type);
    const logs: NotificationLog[] = [];

    for (let i = 0; i < dto.recipients.length; i++) {
      const recipient = dto.recipients[i];
      const variables = dto.variablesList?.[i] || dto.variablesList?.[0] || {};

      if (dto.type === NotificationType.EMAIL) {
        const log = await this.sendEmail(userId, {
          recipient,
          templateName: dto.templateName,
          variables,
          reference: dto.reference,
        });
        logs.push(log);
      } else if (dto.type === NotificationType.SMS) {
        const log = await this.sendSMS(userId, {
          recipient,
          templateName: dto.templateName,
          variables,
          reference: dto.reference,
        });
        logs.push(log);
      }
    }

    return logs;
  }

  // Notification History
  async getNotificationLogs(userId: string, limit: number = 50, skip: number = 0) {
    return this.logModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async getFailedNotifications(limit: number = 50) {
    return this.logModel
      .find({ status: NotificationStatus.FAILED })
      .sort({ failedAt: -1 })
      .limit(limit);
  }

  async retryFailedNotification(logId: string): Promise<NotificationLog> {
    const log = await this.logModel.findById(logId);
    if (!log || log.status !== NotificationStatus.FAILED) {
      throw new NotFoundException('Failed notification not found');
    }

    const template = await this.templateModel.findById(log.templateId);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (log.type === NotificationType.EMAIL) {
      return this.sendEmail(log.userId, {
        recipient: log.recipient,
        templateName: template.name,
        variables: log.variables,
        reference: log.reference,
      });
    } else if (log.type === NotificationType.SMS) {
      return this.sendSMS(log.userId, {
        recipient: log.recipient,
        templateName: template.name,
        variables: log.variables,
        reference: log.reference,
      });
    }
  }

  // Template Rendering
  private renderTemplate(template: string, variables: Record<string, any>): string {
    try {
      const compiledTemplate = Handlebars.compile(template);
      return compiledTemplate(variables);
    } catch (error) {
      console.error('Template rendering error:', error);
      return template;
    }
  }

  // Event Listeners (can be registered elsewhere)
  async handleOrderCreatedEvent(event: any): Promise<void> {
    // Send order confirmation email
    try {
      await this.sendEmail('system', {
        recipient: event.customerEmail,
        templateName: 'order_confirmation',
        variables: {
          orderId: event.orderId,
          customerName: event.customerName,
          orderTotal: event.orderTotal,
          orderDate: new Date(event.timestamp).toLocaleDateString(),
        },
        reference: event.orderId,
      });
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
    }
  }

  async handlePaymentCompletedEvent(event: any): Promise<void> {
    // Send payment confirmation email
    try {
      await this.sendEmail('system', {
        recipient: event.customerEmail,
        templateName: 'payment_confirmation',
        variables: {
          orderId: event.orderId,
          amount: event.amount,
          paymentMethod: event.paymentMethod,
        },
        reference: event.orderId,
      });
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
    }
  }
}
