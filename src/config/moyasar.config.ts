import { registerAs } from '@nestjs/config';

export default registerAs('moyasar', () => ({
  apiKey: process.env.MOYASAR_API_KEY,
  secretKey: process.env.MOYASAR_SECRET_KEY,
  webhookSecret: process.env.MOYASAR_WEBHOOK_SECRET,
  callbackUrl: process.env.MOYASAR_CALLBACK_URL || 'http://localhost:3000/api/v1/payments/callback',
  
  apiUrl: 'https://api.moyasar.com/v1',
  
  // Supported payment methods
  paymentMethods: ['applepay', 'mada', 'creditcard'],
  
  // Currency
  currency: 'SAR',
  
  // Metadata
  metadata: {
    platform: 'HomeServices Platform',
    environment: process.env.NODE_ENV || 'development',
  },
}));