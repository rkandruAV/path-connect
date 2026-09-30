import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis before importing redis module
vi.mock('ioredis', () => {
  const store = new Map<string, { value: string; expiresAt?: number }>();

  const MockRedis = vi.fn().mockImplementation(() => ({
    get: vi.fn(async (key: string) => {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    }),
    setex: vi.fn(async (key: string, ttl: number, value: string) => {
      store.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
      return 'OK';
    }),
    keys: vi.fn(async (pattern: string) => {
      const prefix = pattern.replace('*', '');
      return Array.from(store.keys()).filter((k) => k.startsWith(prefix));
    }),
    del: vi.fn(async (...keys: string[]) => {
      keys.forEach((k) => store.delete(k));
      return keys.length;
    }),
    ping: vi.fn(async () => 'PONG'),
    on: vi.fn(),
    _store: store, // expose for test cleanup
  }));

  return { default: MockRedis };
});

import { cached, invalidateCache } from '../lib/redis.js';
import { redis } from '../lib/redis.js';

describe('Redis cache utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (redis as any)._store?.clear();
  });

  describe('cached()', () => {
    it('calls compute function on cache miss', async () => {
      const compute = vi.fn().mockResolvedValue({ data: 'fresh' });

      const result = await cached('test-key', 300, compute);

      expect(compute).toHaveBeenCalledOnce();
      expect(result).toEqual({ data: 'fresh' });
    });

    it('returns cached value on cache hit', async () => {
      const compute = vi.fn().mockResolvedValue({ data: 'fresh' });

      // First call — cache miss, computes
      await cached('test-key', 300, compute);
      // Second call — cache hit, should NOT compute
      const result = await cached('test-key', 300, compute);

      expect(compute).toHaveBeenCalledOnce(); // only the first time
      expect(result).toEqual({ data: 'fresh' });
    });

    it('stores value with correct TTL', async () => {
      await cached('ttl-key', 3600, async () => 'value');

      expect(redis.setex).toHaveBeenCalledWith('ttl-key', 3600, '"value"');
    });

    it('degrades gracefully when Redis get fails', async () => {
      vi.mocked(redis.get).mockRejectedValueOnce(new Error('Redis down'));
      const compute = vi.fn().mockResolvedValue('fallback');

      const result = await cached('fail-key', 300, compute);

      expect(compute).toHaveBeenCalledOnce();
      expect(result).toBe('fallback');
    });

    it('still returns value when Redis set fails', async () => {
      vi.mocked(redis.setex).mockRejectedValueOnce(new Error('Redis down'));
      const compute = vi.fn().mockResolvedValue('computed');

      const result = await cached('set-fail', 300, compute);

      expect(result).toBe('computed');
    });
  });

  describe('invalidateCache()', () => {
    it('deletes keys matching pattern', async () => {
      // Populate cache
      await cached('mentors:active', 3600, async () => [{ id: '1' }]);
      await cached('mentors:other', 3600, async () => [{ id: '2' }]);

      await invalidateCache('mentors:*');

      expect(redis.del).toHaveBeenCalled();
    });

    it('does nothing when no keys match', async () => {
      vi.mocked(redis.keys).mockResolvedValue([]);

      await invalidateCache('nonexistent:*');

      expect(redis.del).not.toHaveBeenCalled();
    });

    it('degrades gracefully when Redis is down', async () => {
      vi.mocked(redis.keys).mockRejectedValue(new Error('Redis down'));

      // Should not throw
      await expect(invalidateCache('any:*')).resolves.toBeUndefined();
    });
  });
});
