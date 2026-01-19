import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { PaymentIntent, PaymentIntentStatus } from '@/entities/payment-intent.entity';
import { Transaction, TransactionType, TransactionStatus } from '@/entities/transaction.entity';
import { Refund, RefundStatus } from '@/entities/refund.entity';
import { WebhookEvent } from '@/entities/webhook-event.entity';
import { CreatePaymentIntentDto, RefundDto } from './dto/payment.dto';
import { SSLCommerceGateway } from '@/gateways/ssl-commerce.gateway';
import { PayPalGateway } from '@/gateways/paypal.gateway';
import { randomBytes } from 'crypto';

export type PaymentGateway = 'stripe' | 'ssl_commerce' | 'paypal';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private sslCommerce: SSLCommerceGateway;
  private paypal: PayPalGateway;

  constructor(
    @InjectRepository(PaymentIntent)
    private readonly paymentIntentRepository: Repository<PaymentIntent>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    this.sslCommerce = new SSLCommerceGateway();
    this.paypal = new PayPalGateway();
  }

  async createPaymentIntent(
    userId: string,
    dto: CreatePaymentIntentDto,
    gateway: PaymentGateway = 'stripe',
  ): Promise<PaymentIntent> {
    const idempotencyKey = `${dto.orderId}-${Date.now()}`;

    try {
      let stripeIntentId: string;

      if (gateway === 'stripe') {
        const stripeIntent = await this.stripe.paymentIntents.create(
          {
            amount: Math.round(dto.amount * 100), // Convert to cents
            currency: dto.currency.toLowerCase(),
            metadata: {
              orderId: dto.orderId,
              userId,
              gateway: 'stripe',
              ...dto.metadata,
            },
          },
          { idempotencyKey },
        );
        stripeIntentId = stripeIntent.id;
      } else if (gateway === 'ssl_commerce') {
        // For SSLCommerce, generate a temporary ID
        stripeIntentId = `ssl-${Date.now()}-${randomBytes(8).toString('hex')}`;
      } else if (gateway === 'paypal') {
        // For PayPal, generate a temporary ID
        stripeIntentId = `paypal-${Date.now()}-${randomBytes(8).toString('hex')}`;
      }

      const paymentIntent = this.paymentIntentRepository.create({
        orderId: dto.orderId,
        userId,
        stripeIntentId,
        amount: dto.amount,
        currency: dto.currency,
        status: PaymentIntentStatus.INITIATED,
        stripePublishableKey: gateway === 'stripe' ? process.env.STRIPE_PUBLISHABLE_KEY : undefined,
        metadata: { ...dto.metadata, gateway },
      });

      await this.paymentIntentRepository.save(paymentIntent);

      this.eventEmitter.emit('payment.initiated', {
        paymentIntentId: paymentIntent.id,
        orderId: dto.orderId,
        userId,
        amount: dto.amount,
        gateway,
        timestamp: new Date(),
      });

      return paymentIntent;
    } catch (error) {
      throw new BadRequestException(`Failed to create payment intent: ${error.message}`);
    }
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent> {
    const paymentIntent = await this.paymentIntentRepository.findOne({ where: { id } });
    if (!paymentIntent) {
      throw new NotFoundException('Payment intent not found');
    }
    return paymentIntent;
  }

  async processWebhookEvent(eventType: string, payload: Record<string, any>): Promise<void> {
    const stripeEventId = payload.id;

    // Check if event already processed
    const existingEvent = await this.webhookEventRepository.findOne({
      where: { stripeEventId },
    });

    if (existingEvent?.processed) {
      return; // Event already processed
    }

    const webhookEvent = existingEvent || this.webhookEventRepository.create({
      stripeEventId,
      eventType,
      payload,
    });

    try {
      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(payload.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(payload.data.object);
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(payload.data.object);
          break;
      }

      webhookEvent.processed = true;
      webhookEvent.processedAt = new Date();
      await this.webhookEventRepository.save(webhookEvent);
    } catch (error) {
      webhookEvent.errorMessage = error.message;
      await this.webhookEventRepository.save(webhookEvent);
      throw error;
    }
  }

  private async handlePaymentSucceeded(chargeData: any): Promise<void> {
    const paymentIntent = await this.paymentIntentRepository.findOne({
      where: { stripeIntentId: chargeData.id },
    });

    if (!paymentIntent) return;

    paymentIntent.status = PaymentIntentStatus.SUCCEEDED;
    await this.paymentIntentRepository.save(paymentIntent);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      transactionId: `TXN-${Date.now()}-${randomBytes(4).toString('hex')}`,
      orderId: paymentIntent.orderId,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      type: TransactionType.CHARGE,
      status: TransactionStatus.SUCCEEDED,
      stripeChargeId: chargeData.id,
      metadata: chargeData.metadata,
    });

    await this.transactionRepository.save(transaction);

    this.eventEmitter.emit('payment.completed', {
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.orderId,
      userId: paymentIntent.userId,
      amount: paymentIntent.amount,
      transactionId: transaction.id,
      timestamp: new Date(),
    });
  }

  private async handlePaymentFailed(chargeData: any): Promise<void> {
    const paymentIntent = await this.paymentIntentRepository.findOne({
      where: { stripeIntentId: chargeData.id },
    });

    if (!paymentIntent) return;

    paymentIntent.status = PaymentIntentStatus.FAILED;
    await this.paymentIntentRepository.save(paymentIntent);

    this.eventEmitter.emit('payment.failed', {
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.orderId,
      userId: paymentIntent.userId,
      reason: chargeData.failure_message || 'Payment failed',
      timestamp: new Date(),
    });
  }

  private async handleChargeRefunded(chargeData: any): Promise<void> {
    const transaction = await this.transactionRepository.findOne({
      where: { stripeChargeId: chargeData.id },
    });

    if (!transaction) return;

    const refund = await this.refundRepository.findOne({
      where: { stripeRefundId: chargeData.refunds.data[0]?.id },
    });

    if (!refund) return;

    refund.status = RefundStatus.SUCCEEDED;
    await this.refundRepository.save(refund);

    this.eventEmitter.emit('refund.processed', {
      refundId: refund.id,
      orderId: refund.orderId,
      amount: refund.amount,
      timestamp: new Date(),
    });
  }

  async refundTransaction(userId: string, dto: RefundDto): Promise<Refund> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: dto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.type !== TransactionType.CHARGE) {
      throw new BadRequestException('Only charged transactions can be refunded');
    }

    const refundAmount = dto.amount || transaction.amount;

    if (refundAmount > transaction.amount) {
      throw new BadRequestException('Refund amount cannot exceed transaction amount');
    }

    const idempotencyKey = `refund-${transaction.id}-${Date.now()}`;

    try {
      const stripeRefund = await this.stripe.refunds.create(
        {
          charge: transaction.stripeChargeId,
          amount: Math.round(refundAmount * 100),
          metadata: {
            reason: dto.reason,
            transactionId: transaction.id,
          },
        },
        { idempotencyKey },
      );

      const refund = this.refundRepository.create({
        refundId: `REF-${Date.now()}-${randomBytes(4).toString('hex')}`,
        transactionId: transaction.id,
        orderId: transaction.orderId,
        amount: refundAmount,
        reason: dto.reason,
        stripeRefundId: stripeRefund.id,
        status: RefundStatus.PENDING,
      });

      await this.refundRepository.save(refund);

      return refund;
    } catch (error) {
      throw new BadRequestException(`Failed to refund transaction: ${error.message}`);
    }
  }

  async getTransactionsByOrder(orderId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async getRefundsByOrder(orderId: string): Promise<Refund[]> {
    return this.refundRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  verifyWebhookSignature(body: string, signature: string): Record<string, any> {
    try {
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      ) as Record<string, any>;
    } catch (error) {
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }
  }
}
