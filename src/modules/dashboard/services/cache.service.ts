import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default
  private readonly maxSize = 1000; // Maximum cache size

  constructor(private readonly configService: ConfigService) {
    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 60 * 1000); // Clean up every minute
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const timestamp = Date.now();

    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp,
      ttl,
    });

    this.logger.debug(`Cached item: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.logger.debug(`Cache item expired: ${key}`);
      return null;
    }

    this.logger.debug(`Cache hit: ${key}`);
    return item.data;
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove a specific item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Removed cache item: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } {
    const keys = Array.from(this.cache.keys());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      keys,
    };
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.debug(`Invalidated ${deletedCount} cache items matching pattern: ${pattern}`);
    }

    return deletedCount;
  }

  /**
   * Invalidate cache by category
   */
  invalidateCategory(category: string): number {
    return this.invalidatePattern(`^${category}:`);
  }

  /**
   * Set multiple values in cache
   */
  setMultiple<T>(items: Array<{ key: string; data: T; options?: CacheOptions }>): void {
    items.forEach(({ key, data, options }) => {
      this.set(key, data, options);
    });
  }

  /**
   * Get multiple values from cache
   */
  getMultiple<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });

    return result;
  }

  /**
   * Refresh cache item (extend TTL)
   */
  refresh(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    // Extend TTL
    item.timestamp = Date.now();
    this.logger.debug(`Refreshed cache item: ${key}`);
    return true;
  }

  /**
   * Get cache keys by category
   */
  getKeysByCategory(category: string): string[] {
    return Array.from(this.cache.keys()).filter(key => key.startsWith(`${category}:`));
  }

  /**
   * Preload cache with data
   */
  preload<T>(category: string, data: Record<string, T>, options: CacheOptions = {}): void {
    Object.entries(data).forEach(([key, value]) => {
      const cacheKey = `${category}:${key}`;
      this.set(cacheKey, value, options);
    });

    this.logger.debug(`Preloaded ${Object.keys(data).length} items for category: ${category}`);
  }

  /**
   * Private method to evict oldest items when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug(`Evicted oldest cache item: ${oldestKey}`);
    }
  }

  /**
   * Private method to clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired cache items`);
    }
  }

  /**
   * Private method to calculate cache hit rate
   */
  private calculateHitRate(): number {
    // This is a simplified implementation
    // In a real system, you'd track actual hits vs misses
    return this.cache.size > 0 ? 0.8 : 0; // Placeholder value
  }

  /**
   * Generate cache key with category and parameters
   */
  generateKey(category: string, ...params: (string | number)[]): string {
    return `${category}:${params.join(':')}`;
  }

  /**
   * Get cache size for a specific category
   */
  getCategorySize(category: string): number {
    return this.getKeysByCategory(category).length;
  }

  /**
   * Check if cache is healthy
   */
  isHealthy(): boolean {
    return this.cache.size < this.maxSize * 0.9; // Cache is healthy if less than 90% full
  }
}
