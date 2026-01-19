import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface SSLPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productCategory: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface SSLPaymentResponse {
  status: string;
  sessionkey: string;
  GatewayPageURL: string;
  storeName: string;
}

export interface SSLValidationRequest {
  val_id: string;
  amount: number;
  currency: string;
  orderId: string;
}

@Injectable()
export class SSLCommerceGateway {
  private client: AxiosInstance;
  private storeId: string;
  private storePassword: string;
  private baseUrl: string;
  private validationUrl: string;

  constructor() {
    this.storeId = process.env.SSL_COMMERCE_STORE_ID || '';
    this.storePassword = process.env.SSL_COMMERCE_STORE_PASSWORD || '';
    this.baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
        : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
    this.validationUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://securepay.sslcommerz.com/validator/api/validationApi.php'
        : 'https://sandbox.sslcommerz.com/validator/api/validationApi.php';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  async initiatePayment(request: SSLPaymentRequest): Promise<SSLPaymentResponse> {
    if (!this.storeId || !this.storePassword) {
      throw new BadRequestException('SSLCommerce credentials not configured');
    }

    try {
      const payload = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        total_amount: request.amount,
        currency: request.currency,
        tran_id: `${request.orderId}-${Date.now()}`,
        success_url: request.returnUrl,
        fail_url: request.cancelUrl,
        cancel_url: request.cancelUrl,
        customer_name: request.customerName,
        customer_email: request.customerEmail,
        customer_phone: request.customerPhone,
        product_name: request.productName,
        product_category: request.productCategory,
        value_a: request.orderId,
      };

      const response = await this.client.post('', new URLSearchParams(payload).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status !== 'SUCCESS') {
        throw new BadRequestException(`SSLCommerce error: ${response.data.failedreason || 'Unknown error'}`);
      }

      return {
        status: response.data.status,
        sessionkey: response.data.sessionkey,
        GatewayPageURL: response.data.GatewayPageURL,
        storeName: response.data.storeName,
      };
    } catch (error) {
      throw new BadRequestException(`SSLCommerce initiation failed: ${error.message}`);
    }
  }

  async validatePayment(validationRequest: SSLValidationRequest): Promise<any> {
    if (!this.storeId || !this.storePassword) {
      throw new BadRequestException('SSLCommerce credentials not configured');
    }

    try {
      const payload = {
        val_id: validationRequest.val_id,
        store_id: this.storeId,
        store_passwd: this.storePassword,
        amount: validationRequest.amount,
      };

      const response = await axios.post(this.validationUrl, new URLSearchParams(payload).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status !== '1') {
        throw new BadRequestException(`Payment validation failed: ${response.data.status}`);
      }

      return {
        valid: true,
        transactionId: response.data.tran_id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status,
        bankTranId: response.data.bank_tran_id,
        cardBrand: response.data.card_brand,
        cardIssuer: response.data.card_issuer,
        cardType: response.data.card_type,
      };
    } catch (error) {
      throw new BadRequestException(`Payment validation error: ${error.message}`);
    }
  }

  async refund(transactionId: string, amount: number): Promise<any> {
    if (!this.storeId || !this.storePassword) {
      throw new BadRequestException('SSLCommerce credentials not configured');
    }

    try {
      const refundUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://securepay.sslcommerz.com/gwprocess/RefundAPI.php'
          : 'https://sandbox.sslcommerz.com/gwprocess/RefundAPI.php';

      const payload = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        refund_amount: amount,
        bank_tran_id: transactionId,
        reason: 'Refund request from order',
      };

      const response = await axios.post(refundUrl, new URLSearchParams(payload).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.refund_ref_id) {
        return {
          refundId: response.data.refund_ref_id,
          status: 'SUCCESS',
          amount: amount,
        };
      }

      throw new BadRequestException('Refund failed');
    } catch (error) {
      throw new BadRequestException(`SSLCommerce refund error: ${error.message}`);
    }
  }
}
