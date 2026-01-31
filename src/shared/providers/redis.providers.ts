import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProviders: Provider[] = [
  {
    provide: REDIS_CLIENT,
    useFactory: (configService: ConfigService) => {
      const redis = new Redis({
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        keyPrefix: configService.get('REDIS_PREFIX', 'home-services:'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
      });

      return redis;
    },
    inject: [ConfigService],
  },
];