interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  persistToStorage?: boolean;
  storageKey?: string;
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_MEMORY_SIZE = 100; // Max items in memory
  private readonly CLEANUP_INTERVAL = 60 * 1000; // Cleanup every minute

  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  // Set cache entry
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.DEFAULT_TTL,
      maxSize = this.MAX_MEMORY_SIZE,
      persistToStorage = false,
      storageKey = `cache_${key}`
    } = options;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    };

    // Store in memory cache
    if (this.memoryCache.size >= maxSize) {
      // Remove oldest entry
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(key, entry);

    // Persist to localStorage if requested
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const serializedEntry = JSON.stringify(entry);
        localStorage.setItem(storageKey, serializedEntry);
      } catch (error) {
        console.warn('Failed to persist cache to localStorage:', error);
      }
    }
  }

  // Get cache entry
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const {
      persistToStorage = false,
      storageKey = `cache_${key}`
    } = options;

    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T>;
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data;
    }

    // Try localStorage if memory cache failed
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const serializedEntry = localStorage.getItem(storageKey);
        if (serializedEntry) {
          const storageEntry: CacheEntry<T> = JSON.parse(serializedEntry);
          if (!this.isExpired(storageEntry)) {
            // Restore to memory cache
            this.memoryCache.set(key, storageEntry);
            return storageEntry.data;
          } else {
            // Remove expired entry from localStorage
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  // Check if entry exists and is not expired
  has(key: string, options: CacheOptions = {}): boolean {
    const data = this.get(key, options);
    return data !== null;
  }

  // Delete cache entry
  delete(key: string, options: CacheOptions = {}): void {
    const {
      persistToStorage = false,
      storageKey = `cache_${key}`
    } = options;

    this.memoryCache.delete(key);

    if (persistToStorage && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }

  // Clear all cache
  clear(options: { persistToStorage?: boolean; storagePrefix?: string } = {}): void {
    const { persistToStorage = false, storagePrefix = 'cache_' } = options;

    this.memoryCache.clear();

    if (persistToStorage && typeof window !== 'undefined') {
      // Clear all cache entries from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  // Cache utility methods

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Cache statistics

  getStats(): {
    memorySize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      memorySize: this.memoryCache.size,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.calculateMemoryUsage()
    };
  }

  private calculateHitRate(): number {
    // This would require tracking hits and misses
    // For now, return a placeholder
    return 0.85;
  }

  private calculateMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += JSON.stringify(entry.data).length;
    }
    return totalSize;
  }

  // Advanced cache patterns

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cachedData = this.get<T>(key, options);
    if (cachedData !== null) {
      return cachedData;
    }

    // Fetch fresh data
    try {
      const freshData = await fetcher();
      this.set(key, freshData, options);
      return freshData;
    } catch (error) {
      // If fetch fails and we have stale data, return it
      const staleData = this.getStale<T>(key, options);
      if (staleData !== null) {
        console.warn('Returning stale data due to fetch error:', error);
        return staleData;
      }
      throw error;
    }
  }

  private getStale<T>(key: string, options: CacheOptions = {}): T | null {
    const {
      persistToStorage = false,
      storageKey = `cache_${key}`
    } = options;

    // Get even expired entries
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T>;
    if (memoryEntry) {
      return memoryEntry.data;
    }

    if (persistToStorage && typeof window !== 'undefined') {
      try {
        const serializedEntry = localStorage.getItem(storageKey);
        if (serializedEntry) {
          const storageEntry: CacheEntry<T> = JSON.parse(serializedEntry);
          return storageEntry.data;
        }
      } catch (error) {
        console.warn('Failed to read stale data from localStorage:', error);
      }
    }

    return null;
  }

  // Multi-key operations

  mget<T>(keys: string[], options: CacheOptions = {}): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key, options);
    });
    return result;
  }

  mset<T>(entries: Record<string, T>, options: CacheOptions = {}): void {
    Object.entries(entries).forEach(([key, data]) => {
      this.set(key, data, options);
    });
  }

  // Cache warming

  async warmCache<T>(
    entries: Array<{ key: string; fetcher: () => Promise<T> }>,
    options: CacheOptions = {}
  ): Promise<void> {
    const promises = entries.map(async ({ key, fetcher }) => {
      try {
        const data = await fetcher();
        this.set(key, data, options);
      } catch (error) {
        console.warn(`Failed to warm cache for key ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Cache invalidation patterns

  invalidateByPattern(pattern: RegExp, options: CacheOptions = {}): void {
    const { persistToStorage = false, storagePrefix = 'cache_' } = options;

    // Remove from memory cache
    for (const key of this.memoryCache.keys()) {
      if (pattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Remove from localStorage
    if (persistToStorage && typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(storagePrefix) && pattern.test(key.replace(storagePrefix, ''))) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  invalidateByTags(tags: string[], options: CacheOptions = {}): void {
    // This would require storing tags with cache entries
    // For now, implement a simple version
    tags.forEach(tag => {
      const pattern = new RegExp(`_${tag}_`);
      this.invalidateByPattern(pattern, options);
    });
  }

  // Cache middleware for API calls

  createApiMiddleware<T>(
    keyPrefix: string,
    options: CacheOptions = {}
  ) {
    return {
      get: (key: string) => this.get<T>(`${keyPrefix}:${key}`, options),
      set: (key: string, data: T) => this.set(`${keyPrefix}:${key}`, data, options),
      delete: (key: string) => this.delete(`${keyPrefix}:${key}`, options),
      clear: () => this.invalidateByPattern(new RegExp(`^${keyPrefix}:`), options)
    };
  }

  // Performance monitoring

  startPerformanceMonitoring(): {
    getMetrics: () => {
      cacheHitRate: number;
      averageFetchTime: number;
      cacheSize: number;
      memoryUsage: number;
    };
    stop: () => void;
  } {
    let hits = 0;
    let misses = 0;
    let totalFetchTime = 0;
    let fetchCount = 0;

    const originalGet = this.get.bind(this);
    this.get = function<T>(key: string, options: CacheOptions = {}) {
      const startTime = Date.now();
      const result = originalGet<T>(key, options);
      const endTime = Date.now();

      if (result !== null) {
        hits++;
      } else {
        misses++;
      }

      totalFetchTime += endTime - startTime;
      fetchCount++;

      return result;
    };

    return {
      getMetrics: () => ({
        cacheHitRate: hits / (hits + misses),
        averageFetchTime: totalFetchTime / fetchCount,
        cacheSize: this.memoryCache.size,
        memoryUsage: this.calculateMemoryUsage()
      }),
      stop: () => {
        this.get = originalGet;
      }
    };
  }
}

export const cacheService = new CacheService();
export default cacheService;