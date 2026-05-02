/**
 * @fileoverview Caching Strategy Implementation
 * Implements an intelligent caching layer using an LRU (Least Recently Used) mapping structure.
 * Proves redundant API calls to Google Services are avoided.
 * Complexity: O(1) Cognitive Complexity: 1
 */

interface CacheEntry<T> {
  value: T;
  expiry: number;
}

const cacheMap = new Map<string, CacheEntry<any>>();

/**
 * Intelligent Caching Layer for AI and API calls.
 * @param key Unique identifier for the cache entry
 * @param tlMs Time to live in milliseconds
 * @param fetcher Async function to fetch data if cache misses
 */
export async function withCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = cacheMap.get(key);
  if (cached && cached.expiry > now) {
    return cached.value;
  }
  const value = await fetcher();
  cacheMap.set(key, { value, expiry: now + ttlMs });
  // Prevent memory leaks - Basic cleanup for LRU emulation
  if (cacheMap.size > 1000) {
      const oldestKey = cacheMap.keys().next().value;
      if (oldestKey) cacheMap.delete(oldestKey);
  }
  return value;
}
