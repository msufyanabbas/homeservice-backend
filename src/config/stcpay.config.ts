import { registerAs } from '@nestjs/config';

export default registerAs('stcpay', () => ({
  merchantId: process.env.STCPAY_MERCHANT_ID,
  merchantKey: process.env.STCPAY_MERCHANT_KEY,
  branchId: process.env.STCPAY_BRANCH_ID,
  baseUrl: process.env.STCPAY_BASE_URL || 'https://api.stcpay.com.sa',
}));