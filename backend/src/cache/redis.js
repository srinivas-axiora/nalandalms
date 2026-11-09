// Redis client wrapper with a development-only in-memory fallback.
import Redis from "ioredis";

let redis = null;
let isConnected = false;
let connectionPromise = Promise.resolve(false);
const redisRequired = process.env.NODE_ENV === "production";

const memoryStore = new Map();
const loginSecurityMemory = new Map();
const companionPairingMemory = new Map();
const proctorSignalMemory = new Map();

// Keep retrying for the lifetime of a production task. Returning a non-number
// from ioredis retryStrategy permanently ends reconnection, which would turn a
// transient ElastiCache failover into a task replacement. Exponential backoff
// is capped and jittered so a fleet does not reconnect in lockstep.
export function redisRetryDelay(times, random = Math.random) {
  const attempt = Math.max(1, Math.floor(Number(times) || 1));
  const exponential = Math.min(2 ** Math.min(attempt - 1, 10) * 50, 5000);
  const jitter = Math.floor(Math.max(0, Math.min(0.999999, Number(random()) || 0)) * 200);
  return exponential + jitter;
}

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
      retryStrategy: redisRetryDelay,
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
  if (!isRedisAvailable()) {
    return redisRequired
      ? { ok: false, mode: "redis", status: redis?.status || "unconfigured" }
      : { ok: true, mode: "memory" };
  }
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

const loginKey = (key) => `auth:failures:${key}`;

export async function getLoginSecurity(key, maxAttempts = 5) {
  if (isRedisAvailable()) {
    try {
      const result = await redis.multi().get(loginKey(key)).pttl(loginKey(key)).exec();
      const failedAttempts = Number(result?.[0]?.[1] || 0);
      const ttlMs = Number(result?.[1]?.[1] || -1);
      return {
        failedAttempts,
        lockedUntil: failedAttempts >= maxAttempts && ttlMs > 0
          ? new Date(Date.now() + ttlMs).toISOString()
          : null,
      };
    } catch (err) {
      if (redisRequired) throw new Error(`Redis login security unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis login security unavailable");
  const entry = loginSecurityMemory.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    loginSecurityMemory.delete(key);
    return { failedAttempts: 0, lockedUntil: null };
  }
  return {
    failedAttempts: entry.failedAttempts,
    lockedUntil: entry.failedAttempts >= maxAttempts ? new Date(entry.expiresAt).toISOString() : null,
  };
}

export async function recordLoginFailure(key, maxAttempts = 5, lockoutMs = 15 * 60 * 1000) {
  if (isRedisAvailable()) {
    try {
      const result = await redis.eval(
        "local n=redis.call('INCR',KEYS[1]); redis.call('PEXPIRE',KEYS[1],ARGV[1]); local ttl=redis.call('PTTL',KEYS[1]); return {n,ttl}",
        1,
        loginKey(key),
        lockoutMs,
      );
      const failedAttempts = Number(result?.[0] || 0);
      const ttlMs = Number(result?.[1] || lockoutMs);
      return {
        failedAttempts,
        lockedUntil: failedAttempts >= maxAttempts
          ? new Date(Date.now() + ttlMs).toISOString()
          : null,
      };
    } catch (err) {
      if (redisRequired) throw new Error(`Redis login security unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis login security unavailable");
  const current = loginSecurityMemory.get(key);
  const failedAttempts = current && current.expiresAt > Date.now() ? current.failedAttempts + 1 : 1;
  const expiresAt = Date.now() + lockoutMs;
  loginSecurityMemory.set(key, { failedAttempts, expiresAt });
  return {
    failedAttempts,
    lockedUntil: failedAttempts >= maxAttempts ? new Date(expiresAt).toISOString() : null,
  };
}

export async function clearLoginFailures(key) {
  if (isRedisAvailable()) {
    try {
      await redis.del(loginKey(key));
      return;
    } catch (err) {
      if (redisRequired) throw new Error(`Redis login security unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis login security unavailable");
  loginSecurityMemory.delete(key);
}

const companionKey = (tokenDigest) => `proctor:companion:${tokenDigest}`;

export async function storeCompanionPairing(tokenDigest, value, ttlSeconds) {
  if (isRedisAvailable()) {
    try {
      await redis.set(companionKey(tokenDigest), JSON.stringify(value), "EX", ttlSeconds);
      return;
    } catch (err) {
      if (redisRequired) throw new Error(`Redis companion pairing unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis companion pairing unavailable");
  companionPairingMemory.set(tokenDigest, {
    value: structuredClone(value),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function getCompanionPairing(tokenDigest) {
  if (isRedisAvailable()) {
    try {
      const raw = await redis.get(companionKey(tokenDigest));
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      if (redisRequired) throw new Error(`Redis companion pairing unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis companion pairing unavailable");
  const entry = companionPairingMemory.get(tokenDigest);
  if (!entry || entry.expiresAt <= Date.now()) {
    companionPairingMemory.delete(tokenDigest);
    return null;
  }
  return structuredClone(entry.value);
}

export async function claimCompanionPairing(tokenDigest) {
  if (isRedisAvailable()) {
    try {
      const result = await redis.eval(
        `local raw=redis.call('GET',KEYS[1]);
         if not raw then return {0,''}; end;
         local data=cjson.decode(raw);
         if data.paired then return {2,raw}; end;
         local ttl=redis.call('PTTL',KEYS[1]);
         if ttl <= 0 then return {0,''}; end;
         data.paired=true;
         local claimed=cjson.encode(data);
         redis.call('SET',KEYS[1],claimed,'PX',ttl);
         return {1,claimed};`,
        1,
        companionKey(tokenDigest),
      );
      const status = Number(result?.[0] || 0);
      return {
        status: status === 1 ? "claimed" : status === 2 ? "paired" : "missing",
        data: result?.[1] ? JSON.parse(result[1]) : null,
      };
    } catch (err) {
      if (redisRequired) throw new Error(`Redis companion pairing unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis companion pairing unavailable");
  const entry = companionPairingMemory.get(tokenDigest);
  if (!entry || entry.expiresAt <= Date.now()) {
    companionPairingMemory.delete(tokenDigest);
    return { status: "missing", data: null };
  }
  if (entry.value.paired) return { status: "paired", data: structuredClone(entry.value) };
  entry.value.paired = true;
  return { status: "claimed", data: structuredClone(entry.value) };
}

export async function deleteCompanionPairing(tokenDigest) {
  if (isRedisAvailable()) {
    try {
      await redis.del(companionKey(tokenDigest));
      return;
    } catch (err) {
      if (redisRequired) throw new Error(`Redis companion pairing unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis companion pairing unavailable");
  companionPairingMemory.delete(tokenDigest);
}

const signalKey = (attemptId) => `proctor:signals:${attemptId}`;
const SIGNAL_TTL_SECONDS = 4 * 60 * 60;

export async function appendProctorSignal(attemptId, signal) {
  if (isRedisAvailable()) {
    try {
      await redis.eval(
        `redis.call('RPUSH',KEYS[1],ARGV[1]);
         redis.call('LTRIM',KEYS[1],-200,-1);
         redis.call('EXPIRE',KEYS[1],ARGV[2]);
         return 1;`,
        1,
        signalKey(attemptId),
        JSON.stringify(signal),
        SIGNAL_TTL_SECONDS,
      );
      return signal;
    } catch (err) {
      if (redisRequired) throw new Error(`Redis proctor signaling unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis proctor signaling unavailable");
  const current = proctorSignalMemory.get(attemptId);
  const signals = current?.expiresAt > Date.now() ? current.signals : [];
  signals.push(structuredClone(signal));
  if (signals.length > 200) signals.splice(0, signals.length - 200);
  proctorSignalMemory.set(attemptId, {
    signals,
    expiresAt: Date.now() + SIGNAL_TTL_SECONDS * 1000,
  });
  return signal;
}

export async function listProctorSignals(attemptId) {
  if (isRedisAvailable()) {
    try {
      const values = await redis.lrange(signalKey(attemptId), 0, -1);
      return values.map((value) => JSON.parse(value));
    } catch (err) {
      if (redisRequired) throw new Error(`Redis proctor signaling unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis proctor signaling unavailable");
  const current = proctorSignalMemory.get(attemptId);
  if (!current || current.expiresAt <= Date.now()) {
    proctorSignalMemory.delete(attemptId);
    return [];
  }
  return structuredClone(current.signals);
}

export async function clearProctorSignals(attemptId) {
  if (isRedisAvailable()) {
    try {
      await redis.del(signalKey(attemptId));
      return;
    } catch (err) {
      if (redisRequired) throw new Error(`Redis proctor signaling unavailable: ${err?.message || "unknown error"}`);
    }
  }
  if (redisRequired) throw new Error("Redis proctor signaling unavailable");
  proctorSignalMemory.delete(attemptId);
}

export async function closeRedis() {
  if (redis) {
    await redis.quit().catch(() => {});
    redis = null;
    isConnected = false;
  }
}

