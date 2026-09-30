import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error(JSON.stringify({ level: 'error', service: 'redis', error: err.message, timestamp: new Date().toISOString() }));
});

redis.on('connect', () => {
  console.log('Redis connected');
});

/**
 * Get a cached value, or compute and cache it.
 * Returns null (skips cache) if Redis is unavailable — the app degrades gracefully.
 */
export async function cached<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) {
      return JSON.parse(hit) as T;
    }
  } catch {
    // Redis unavailable — fall through to compute
  }

  const value = await compute();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Redis unavailable — value still returned, just not cached
  }

  return value;
}

/**
 * Invalidate cache keys matching a pattern.
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Redis unavailable — skip invalidation
  }
}
