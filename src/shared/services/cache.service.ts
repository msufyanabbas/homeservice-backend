import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Cache service wrapper for Redis/Memory cache
 */
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  /**
   * Set value in cache
   * @param ttl Time to live in seconds
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      await this.cacheManager.set(key, value, ttl * 1000);
    } else {
      await this.cacheManager.set(key, value);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    // This requires Redis store
    const store: any = this.cacheManager.stores;
    
    if (store.keys) {
      const keys = await store.keys(pattern);
      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key: string) => this.delete(key)));
      }
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null && value !== undefined;
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    
    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.increment(key, -amount);
  }
}