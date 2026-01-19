import { Injectable, BadRequestException } from '@nestjs/common';
import paypal from 'paypal-rest-sdk';

export interface PayPalPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalPaymentResponse {
  id: string;
  state: string;
  approvalUrl: string;
  links: Array<{ rel: string; href: string }>;
}

export interface PayPalExecuteRequest {
  payerId: string;
  paymentId: string;
}

@Injectable()
export class PayPalGateway {
  constructor() {
    paypal.configure({
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
      client_id: process.env.PAYPAL_CLIENT_ID || '',
      client_secret: process.env.PAYPAL_CLIENT_SECRET || '',
    });
  }

  async initiatePayment(request: PayPalPaymentRequest): Promise<PayPalPaymentResponse> {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new BadRequestException('PayPal credentials not configured');
    }

    try {
      const paymentDetails = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl,
        },
        transactions: [
          {
            amount: {
              total: request.amount.toString(),
              currency: request.currency.toUpperCase(),
              details: {
                subtotal: request.amount.toString(),
              },
            },
            description: request.description,
            invoice_number: request.orderId,
          },
        ],
      };

      return new Promise((resolve, reject) => {
        paypal.payment.create(paymentDetails, (error, payment) => {
          if (error) {
            reject(new BadRequestException(`PayPal initiation failed: ${error.message}`));
          } else {
            const approvalUrl = payment.links.find((link: any) => link.rel === 'approval_url')?.href;
            resolve({
              id: payment.id,
              state: payment.state,
              approvalUrl: approvalUrl || '',
              links: payment.links,
            });
          }
        });
      });
    } catch (error) {
      throw new BadRequestException(`PayPal payment initiation error: ${error.message}`);
    }
  }

  async executePayment(executeRequest: PayPalExecuteRequest): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const executePaymentDetails = {
          payer_id: executeRequest.payerId,
        };

        paypal.payment.execute(executeRequest.paymentId, executePaymentDetails, (error, payment) => {
          if (error) {
            reject(new BadRequestException(`PayPal execution failed: ${error.message}`));
          } else {
            const transaction = payment.transactions[0]?.related_resources[0]?.sale;
            resolve({
              paymentId: payment.id,
              state: payment.state,
              transactionId: transaction?.id,
              status: transaction?.state,
              amount: transaction?.amount?.total,
              currency: transaction?.amount?.currency,
              createdAt: transaction?.create_time,
            });
          }
        });
      });
    } catch (error) {
      throw new BadRequestException(`PayPal payment execution error: ${error.message}`);
    }
  }

  async refund(saleId: string, amount?: number): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const refundDetails = amount ? { amount: amount.toString() } : {};

        paypal.sale.refund(saleId, refundDetails, (error, refund) => {
          if (error) {
            reject(new BadRequestException(`PayPal refund failed: ${error.message}`));
          } else {
            resolve({
              refundId: refund.id,
              state: refund.state,
              amount: refund.amount?.total,
              currency: refund.amount?.currency,
            });
          }
        });
      });
    } catch (error) {
      throw new BadRequestException(`PayPal refund error: ${error.message}`);
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        paypal.payment.get(paymentId, (error, payment) => {
          if (error) {
            reject(new BadRequestException(`Failed to retrieve payment: ${error.message}`));
          } else {
            resolve(payment);
          }
        });
      });
    } catch (error) {
      throw new BadRequestException(`Error retrieving payment: ${error.message}`);
    }
  }
}
