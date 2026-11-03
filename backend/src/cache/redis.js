// Redis client wrapper with graceful in-memory fallback.
import Redis from "ioredis";

let redis = null;
let isConnected = false;
let connectionPromise = Promise.resolve(false);
const redisRequired = process.env.NODE_ENV === "production";

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

    redis.on("ready", () => {
      isConnected = true;
      console.log("[redis] Ready");
    });

    redis.on("close", () => {
      isConnected = false;
    });

    redis.on("error", (err) => {
      isConnected = false;
      console.warn("[redis] Connection error:", err?.message || err);
    });

    connectionPromise = redis.connect()
      .then(() => {
        isConnected = redis.status === "ready";
        return isConnected;
      })
      .catch((err) => {
        isConnected = false;
        if (!redisRequired) console.warn("[redis] Using development in-memory fallback:", err?.message || err);
        return false;
      });
  } catch (err) {
    console.warn("[redis] Initialization failed:", err?.message || err);
  }
}

export function isRedisAvailable() {
  return Boolean(redis && isConnected);
}

export async function ensureRedisReady() {
  await connectionPromise;
  if (isRedisAvailable()) {
    await redis.ping();
    return true;
  }
  if (redisRequired) throw new Error("Redis is required in production and is unavailable");
  return false;
}

export async function redisHealth() {
  if (!isRedisAvailable()) return { ok: !redisRequired, mode: "memory" };
  try {
    const reply = await redis.ping();
    return { ok: reply === "PONG", mode: "redis" };
  } catch (err) {
    return { ok: false, mode: "redis", error: err?.message || "Redis ping failed" };
  }
}

export async function rateLimitCheckAndIncr(key, windowSeconds = 60, maxHits = 600) {
  if (isRedisAvailable()) {
    try {
      const current = Number(await redis.eval(
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return n",
        1,
        key,
        windowSeconds,
      ));
      return { allowed: current <= maxHits, current, remaining: Math.max(0, maxHits - current) };
    } catch (err) {
      if (redisRequired) throw new Error(`Redis rate limiter unavailable: ${err?.message || "unknown error"}`);
    }
  }

  if (redisRequired) throw new Error("Redis rate limiter unavailable");

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

