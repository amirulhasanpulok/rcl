import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationTemplate, NotificationTemplateSchema } from '@/entities/notification-template.schema';
import { NotificationLog, NotificationLogSchema } from '@/entities/notification-log.schema';
import { EmailGateway } from '@/gateways/email.gateway';
import { SMSGateway } from '@/gateways/sms.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailGateway, SMSGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
