import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

/**
 * Decorator to set cache key
 */
export const CacheKey = (key: string) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(CACHE_KEY_METADATA, key, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(CACHE_KEY_METADATA, key, target);
  };
};

/**
 * Decorator to set cache TTL (in seconds)
 */
export const CacheTTL = (ttl: number) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(CACHE_TTL_METADATA, ttl, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(CACHE_TTL_METADATA, ttl, target);
  };
};

/**
 * Cache interceptor for HTTP responses
 * Caches GET requests automatically
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Get cache configuration
    const cacheKey = this.getCacheKey(context, request);
    const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) || 60; // Default 60 seconds

    // Try to get from cache
    const cachedResponse = await this.cacheManager.get(cacheKey);
    
    if (cachedResponse) {
      console.log(`Cache HIT: ${cacheKey}`);
      return of(cachedResponse);
    }

    console.log(`Cache MISS: ${cacheKey}`);

    // Execute request and cache response
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(cacheKey, response, ttl * 1000);
      }),
    );
  }

  /**
   * Generate cache key from request
   */
  private getCacheKey(context: ExecutionContext, request: any): string {
    // Check for custom cache key
    const customKey = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());
    
    if (customKey) {
      return `custom:${customKey}`;
    }

    // Generate automatic key from URL and query params
    const url = request.url;
    const userId = request.user?.sub || 'anonymous';
    
    return `cache:${userId}:${url}`;
  }
}
