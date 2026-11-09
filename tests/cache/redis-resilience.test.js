import { describe, expect, it } from "vitest";
import { redisRetryDelay } from "../../backend/src/cache/redis.js";

describe("Redis reconnect resilience", () => {
  it("keeps returning a finite reconnect delay after the old three-attempt cutoff", () => {
    for (const attempt of [1, 2, 3, 4, 20, 1000]) {
      const delay = redisRetryDelay(attempt, () => 0.5);
      expect(Number.isFinite(delay)).toBe(true);
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThanOrEqual(5199);
    }
  });

  it("uses capped exponential backoff with bounded jitter", () => {
    expect(redisRetryDelay(1, () => 0)).toBe(50);
    expect(redisRetryDelay(2, () => 0)).toBe(100);
    expect(redisRetryDelay(3, () => 0)).toBe(200);
    expect(redisRetryDelay(20, () => 0)).toBe(5000);
    expect(redisRetryDelay(20, () => 0.999999)).toBe(5199);
  });
});
