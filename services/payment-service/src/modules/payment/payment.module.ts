import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentIntent } from '@/entities/payment-intent.entity';
import { Transaction } from '@/entities/transaction.entity';
import { Refund } from '@/entities/refund.entity';
import { WebhookEvent } from '@/entities/webhook-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentIntent, Transaction, Refund, WebhookEvent]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
