import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  limit: number; // Max requests
  ttl: number; // Time window in seconds
  message?: string;
}

/**
 * Decorator to set rate limit options
 */
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
  };
};

/**
 * Guard to implement rate limiting
 * Uses Redis/Cache to track request counts
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return true; // No rate limit set
    }

    const request = context.switchToHttp().getRequest();
    const identifier = this.getIdentifier(request);
    const key = `rate_limit:${identifier}:${request.url}`;

    // Get current count
    const currentCount: number = (await this.cacheManager.get(key)) || 0;

    if (currentCount >= rateLimitOptions.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: rateLimitOptions.message || 'Too many requests. Please try again later.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment count
    await this.cacheManager.set(key, currentCount + 1, rateLimitOptions.ttl * 1000);

    return true;
  }

  /**
   * Get unique identifier for rate limiting
   * Uses IP address or user ID if authenticated
   */
  private getIdentifier(request: any): string {
    // Use user ID if authenticated
    if (request.user && request.user.sub) {
      return `user:${request.user.sub}`;
    }

    // Use IP address
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress;

    return `ip:${ip}`;
  }
}
