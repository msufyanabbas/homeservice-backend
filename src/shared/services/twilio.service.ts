import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

export interface SendSmsOptions {
  to: string;
  body: string;
  from?: string;
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly client: twilio.Twilio;
  private readonly fromNumber: string | undefined;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.fromNumber = this.configService.get<string>('twilio.phoneNumber');

    this.client = twilio(accountSid, authToken);
  }

  /**
   * Send SMS message
   */
  async sendSms(options: SendSmsOptions): Promise<any> {
    try {
      this.logger.log(`Sending SMS to: ${options.to}`);

      const message = await this.client.messages.create({
        body: options.body,
        from: options.from || this.fromNumber,
        to: options.to,
      });

      this.logger.log(`SMS sent successfully. SID: ${message.sid}`);
      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}`, error);
      throw new Error(`SMS sending failed: ${error.message}`);
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOtp(phoneNumber: string, otp: string): Promise<any> {
    const body = `Your verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSms({ to: phoneNumber, body });
  }

  /**
   * Send booking notification SMS
   */
  async sendBookingNotification(phoneNumber: string, bookingNumber: string, message: string): Promise<any> {
    const body = `Booking ${bookingNumber}: ${message}`;
    return this.sendSms({ to: phoneNumber, body });
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid: string): Promise<any> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return {
        sid: message.sid,
        status: message.status,
        to: message.to,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch message status: ${messageSid}`, error);
      throw new Error(`Message status fetch failed: ${error.message}`);
    }
  }
}