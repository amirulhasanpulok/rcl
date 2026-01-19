import { IsUUID, IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsUUID()
  orderId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ProcessWebhookDto {
  @IsString()
  type: string;

  @IsObject()
  data: Record<string, any>;
}

export class RefundDto {
  @IsUUID()
  transactionId: string;

  @IsString()
  reason: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  amount?: number;
}

export class PaymentIntentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  stripePublishableKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionResponseDto {
  id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: Date;
}

export class RefundResponseDto {
  id: string;
  refundId: string;
  orderId: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: Date;
}
