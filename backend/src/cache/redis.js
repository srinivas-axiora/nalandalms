// Redis client wrapper with graceful in-memory fallback.
import Redis from "ioredis";

let redis = null;
let isConnected = false;

const memoryStore = new Map();

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 100, 2000);
      },
    });

    redis.on("connect", () => {
      isConnected = true;
      console.log("[redis] Connected to Redis cluster/instance");
    });

    redis.on("error", (err) => {
      isConnected = false;
      console.warn("[redis] Connection error, falling back to in-memory:", err?.message || err);
    });

    redis.connect().catch(() => {});
  } catch (err) {
    console.warn("[redis] Initialization failed, using in-memory store:", err?.message || err);
  }
}

export function isRedisAvailable() {
  return Boolean(redis && isConnected);
}

export async function rateLimitCheckAndIncr(key, windowSeconds = 60, maxHits = 600) {
  if (isRedisAvailable()) {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }
      return { allowed: current <= maxHits, current, remaining: Math.max(0, maxHits - current) };
    } catch {
      // Fallback to memory on runtime Redis failure
    }
  }

  // In-memory sliding window fallback
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;
  let timestamps = (memoryStore.get(key) || []).filter((t) => t > cutoff);

  if (timestamps.length >= maxHits) {
    return { allowed: false, current: timestamps.length, remaining: 0 };
  }

  timestamps.push(now);
  memoryStore.set(key, timestamps);
  if (memoryStore.size > 20000) {
    // Evict oldest entries
    const firstKey = memoryStore.keys().next().value;
    if (firstKey) memoryStore.delete(firstKey);
  }

  return { allowed: true, current: timestamps.length, remaining: maxHits - timestamps.length };
}

export async function closeRedis() {
  if (redis) {
    await redis.quit().catch(() => {});
    redis = null;
    isConnected = false;
  }
}

