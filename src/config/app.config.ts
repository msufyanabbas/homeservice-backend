import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT as string, 10) || 3000,
  appName: process.env.APP_NAME || 'HomeServices Platform',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || 'api',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // Rate Limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL as string, 10) || 60,
    max: parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 100,
  },
  
  // Platform Fees
  platformFees: {
    providerRegistration: parseFloat(process.env.PROVIDER_REGISTRATION_FEE as string) || 900,
    providerMonthlyFee: parseFloat(process.env.PROVIDER_MONTHLY_FEE as string) || 2100,
    commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE as string) || 15,
  },
  
  // Cancellation Policy
  cancellationPolicy: {
    fullRefundHours: parseInt(process.env.FULL_REFUND_HOURS as string, 10) || 4,
    partialRefundHours: parseInt(process.env.PARTIAL_REFUND_HOURS as string, 10) || 2,
  },
  
  // Admin Credentials
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@homeservices.sa',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
}));