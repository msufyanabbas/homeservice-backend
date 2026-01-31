import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB as string, 10) || 0,
  keyPrefix: 'home_services:',
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  lazyConnect: false,
}));