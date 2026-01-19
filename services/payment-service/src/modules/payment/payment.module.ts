import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentIntent } from '@/entities/payment-intent.entity';
import { Transaction } from '@/entities/transaction.entity';
import { Refund } from '@/entities/refund.entity';
import { WebhookEvent } from '@/entities/webhook-event.entity';
import { SSLCommerceGateway } from '@/gateways/ssl-commerce.gateway';
import { PayPalGateway } from '@/gateways/paypal.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentIntent, Transaction, Refund, WebhookEvent]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, SSLCommerceGateway, PayPalGateway],
  exports: [PaymentService, SSLCommerceGateway, PayPalGateway],
})
export class PaymentModule {}
