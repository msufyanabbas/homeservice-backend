import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface StcPayPaymentRequest {
  amount: number;
  currency: string;
  merchant_id: string;
  branch_id: string;
  teller_id: string;
  device_id: string;
  ref_num: string;
  bill_number: string;
  mobile_number: string;
  store_id: string;
  terminal_id: string;
}

export interface StcPayPaymentResponse {
  status: string;
  message: string;
  transaction_id: string;
  reference_number: string;
  otp_reference: string;
}

@Injectable()
export class StcPayService {
  private readonly logger = new Logger(StcPayService.name);
  private readonly apiClient: AxiosInstance;
  private readonly merchantId: string;
  private readonly merchantKey: string;
  private readonly branchId: string;

  constructor(private readonly configService: ConfigService) {
    this.merchantId = this.configService.get<string>('stcpay.merchantId') || '';
    this.merchantKey = this.configService.get<string>('stcpay.merchantKey') || '';
    this.branchId = this.configService.get<string>('stcpay.branchId') || '';

    this.apiClient = axios.create({
      baseURL: 'https://api.stcpay.com.sa',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.merchantKey}`,
      },
    });
  }

  /**
   * Initiate STC Pay payment
   */
  async initiatePayment(paymentRequest: Partial<StcPayPaymentRequest>): Promise<StcPayPaymentResponse> {
    try {
      this.logger.log(`Initiating STC Pay payment for amount: ${paymentRequest.amount}`);

      const fullRequest: StcPayPaymentRequest = {
        ...paymentRequest,
        merchant_id: this.merchantId,
        branch_id: this.branchId,
        currency: 'SAR',
        teller_id: '1',
        device_id: '1',
        store_id: '1',
        terminal_id: '1',
      } as StcPayPaymentRequest;

      const response = await this.apiClient.post<StcPayPaymentResponse>(
        '/payment/initiate',
        fullRequest,
      );

      this.logger.log(`STC Pay payment initiated: ${response.data.transaction_id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to initiate STC Pay payment', error);
      throw new Error(`STC Pay payment initiation failed: ${error.message}`);
    }
  }

  /**
   * Confirm STC Pay payment with OTP
   */
  async confirmPayment(transactionId: string, otp: string): Promise<any> {
    try {
      this.logger.log(`Confirming STC Pay payment: ${transactionId}`);

      const response = await this.apiClient.post('/payment/confirm', {
        transaction_id: transactionId,
        otp_value: otp,
      });

      this.logger.log(`STC Pay payment confirmed: ${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to confirm STC Pay payment: ${transactionId}`, error);
      throw new Error(`STC Pay confirmation failed: ${error.message}`);
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/payment/status/${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get STC Pay payment status: ${transactionId}`, error);
      throw new Error(`STC Pay status check failed: ${error.message}`);
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(transactionId: string, amount?: number): Promise<any> {
    try {
      this.logger.log(`Refunding STC Pay payment: ${transactionId}`);

      const response = await this.apiClient.post('/payment/refund', {
        transaction_id: transactionId,
        refund_amount: amount,
      });

      this.logger.log(`STC Pay payment refunded: ${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to refund STC Pay payment: ${transactionId}`, error);
      throw new Error(`STC Pay refund failed: ${error.message}`);
    }
  }
}