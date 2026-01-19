import { Injectable, BadRequestException } from '@nestjs/common';
import * as twilio from 'twilio';

export interface SMSOptions {
  to: string;
  body: string;
}

@Injectable()
export class SMSGateway {
  private twilioClient: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    const fromNumber = process.env.TWILIO_FROM_NUMBER || '';

    this.twilioClient = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  async sendSMS(options: SMSOptions): Promise<string> {
    if (!this.fromNumber || !process.env.TWILIO_ACCOUNT_SID) {
      throw new BadRequestException('SMS gateway not configured');
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: options.body,
        from: this.fromNumber,
        to: options.to,
      });

      return message.sid;
    } catch (error) {
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  async checkBalance(): Promise<any> {
    try {
      const account = await this.twilioClient.api.accounts.list({ limit: 1 });
      return account[0]?.balance;
    } catch (error) {
      throw new BadRequestException(`Failed to check balance: ${error.message}`);
    }
  }
}
