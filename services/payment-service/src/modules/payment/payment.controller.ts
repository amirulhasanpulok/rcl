import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  RawBodyRequest,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto, RefundDto } from './dto/payment.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intents')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent with gateway selection' })
  async createPaymentIntent(
    @Request() req,
    @Body() dto: CreatePaymentIntentDto,
    @Query('gateway') gateway: 'stripe' | 'ssl_commerce' | 'paypal' = 'stripe',
  ) {
    const paymentIntent = await this.paymentService.createPaymentIntent(req.user.sub, dto, gateway);
    return {
      success: true,
      data: paymentIntent,
    };
  }

  @Get('intents/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment intent by ID' })
  async getPaymentIntent(@Param('id') id: string) {
    const paymentIntent = await this.paymentService.getPaymentIntent(id);
    return {
      success: true,
      data: paymentIntent,
    };
  }

  @Post('webhooks/stripe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<any>,
  ) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.rawBody.toString();

    const event = this.paymentService.verifyWebhookSignature(rawBody, signature);

    await this.paymentService.processWebhookEvent(event.type, event);

    return { success: true };
  }

  @Post('webhooks/ssl-commerce')
  @HttpCode(200)
  @ApiOperation({ summary: 'SSLCommerce webhook endpoint' })
  async handleSSLCommerceWebhook(@Body() payload: any) {
    // SSLCommerce validation happens via returnUrl, not webhooks
    // This endpoint can be used for payment status updates
    return { success: true };
  }

  @Post('webhooks/paypal')
  @HttpCode(200)
  @ApiOperation({ summary: 'PayPal webhook endpoint' })
  async handlePayPalWebhook(@Body() payload: any) {
    // PayPal IPN webhook handling
    return { success: true };
  }

  @Post('refund')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a transaction' })
  async refundTransaction(
    @Request() req,
    @Body() dto: RefundDto,
  ) {
    const refund = await this.paymentService.refundTransaction(req.user.sub, dto);
    return {
      success: true,
      data: refund,
    };
  }

  @Get('transactions/order/:orderId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transactions by order' })
  async getTransactionsByOrder(@Param('orderId') orderId: string) {
    const transactions = await this.paymentService.getTransactionsByOrder(orderId);
    return {
      success: true,
      data: transactions,
      total: transactions.length,
    };
  }

  @Get('refunds/order/:orderId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get refunds by order' })
  async getRefundsByOrder(@Param('orderId') orderId: string) {
    const refunds = await this.paymentService.getRefundsByOrder(orderId);
    return {
      success: true,
      data: refunds,
      total: refunds.length,
    };
  }
}
