import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface MoyasarPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  source: {
    type: string;
    name?: string;
    number?: string;
    cvc?: string;
    month?: string;
    year?: string;
  };
  metadata?: Record<string, any>;
}

export interface MoyasarPaymentResponse {
  id: string;
  status: string;
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  refunded_at: string | null;
  captured: number;
  captured_at: string | null;
  voided_at: string | null;
  description: string;
  amount_format: string;
  fee_format: string;
  refunded_format: string;
  captured_format: string;
  invoice_id: string | null;
  ip: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string;
    token: string;
    message: string | null;
    transaction_url: string;
  };
}

@Injectable()
export class MoyasarService {
  private readonly logger = new Logger(MoyasarService.name);
  private readonly apiClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly publishableKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('moyasar.apiKey') || '';
    this.publishableKey = this.configService.get<string>('moyasar.publishableKey') || '';

    this.apiClient = axios.create({
      baseURL: 'https://api.moyasar.com/v1',
      auth: {
        username: this.apiKey,
        password: '',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a payment
   */
  async createPayment(paymentRequest: MoyasarPaymentRequest): Promise<MoyasarPaymentResponse> {
    try {
      this.logger.log(`Creating Moyasar payment for amount: ${paymentRequest.amount}`);

      const response = await this.apiClient.post<MoyasarPaymentResponse>(
        '/payments',
        paymentRequest,
      );

      this.logger.log(`Moyasar payment created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create Moyasar payment', error);
      throw new Error(`Moyasar payment creation failed: ${error.message}`);
    }
  }

  /**
   * Retrieve payment details
   */
  async getPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
    try {
      const response = await this.apiClient.get<MoyasarPaymentResponse>(
        `/payments/${paymentId}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to retrieve Moyasar payment: ${paymentId}`, error);
      throw new Error(`Moyasar payment retrieval failed: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      this.logger.log(`Refunding Moyasar payment: ${paymentId}`);

      const payload: any = {};
      if (amount) {
        payload.amount = amount;
      }

      const response = await this.apiClient.post(
        `/payments/${paymentId}/refund`,
        payload,
      );

      this.logger.log(`Moyasar payment refunded: ${paymentId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to refund Moyasar payment: ${paymentId}`, error);
      throw new Error(`Moyasar refund failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implement webhook signature verification
    // Moyasar uses HMAC SHA256 for webhook signatures
    return true;
  }

  /**
   * Get publishable key for frontend
   */
  getPublishableKey(): string {
    return this.publishableKey;
  }
}