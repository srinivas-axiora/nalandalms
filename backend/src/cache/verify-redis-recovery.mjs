import assert from "node:assert/strict";
import {
  closeRedis,
  ensureRedisReady,
  rateLimitCheckAndIncr,
  redisHealth,
} from "./redis.js";

const [runId, rawTimeoutSeconds = "600"] = process.argv.slice(2);
if (!/^RF-[A-F0-9]{16,64}$/.test(runId || "")) {
  throw new Error("Usage: verify-redis-recovery.mjs RF-<16-64 uppercase hex characters> [timeout-seconds]");
}

const timeoutSeconds = Number(rawTimeoutSeconds);
if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 60 || timeoutSeconds > 1200) {
  throw new Error("Redis recovery timeout must be an integer from 60 through 1200 seconds");
}

const pollMilliseconds = 100;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const marker = (stage, details = {}) => {
  console.log(`REDIS_RECOVERY_${stage}:${runId} ${JSON.stringify(details)}`);
};

let outageStartedAt = null;
let failClosedVerified = false;

try {
  assert.equal(process.env.NODE_ENV, "production", "Redis recovery verification must use production fail-closed mode");
  assert.ok(process.env.REDIS_URL, "REDIS_URL is required for Redis recovery verification");

  await ensureRedisReady();
  const armedHealth = await redisHealth();
  assert.equal(armedHealth.ok, true, "Redis must be healthy before the recovery verifier arms");
  assert.equal(armedHealth.mode, "redis");

  const armedAt = Date.now();
  const deadline = armedAt + timeoutSeconds * 1000;
  marker("ARMED", { timeoutSeconds });

  while (Date.now() < deadline) {
    const health = await redisHealth();

    if (!health.ok && outageStartedAt === null) {
      outageStartedAt = Date.now();
      marker("OUTAGE", { status: health.status || "unavailable" });

      try {
        await rateLimitCheckAndIncr(`verify:redis-recovery:${runId}`, 60, 1);
        throw new Error("Redis-backed request controls did not fail closed during the interruption");
      } catch (error) {
        if (!String(error?.message || error).includes("Redis rate limiter unavailable")) throw error;
        failClosedVerified = true;
        marker("FAIL_CLOSED", { control: "rate-limit" });
      }
    }

    if (outageStartedAt !== null && health.ok) {
      assert.equal(failClosedVerified, true, "The interruption did not prove fail-closed request controls");
      const recoveredAt = Date.now();
      const recoveryMilliseconds = recoveredAt - outageStartedAt;
      marker("RECOVERED", {
        recoveryMilliseconds,
        observationMilliseconds: recoveredAt - armedAt,
      });
      console.log(JSON.stringify({
        result: "passed",
        runId,
        recoveryMilliseconds,
        failClosedVerified,
      }));
      process.exitCode = 0;
      break;
    }

    await delay(pollMilliseconds);
  }

  if (outageStartedAt === null) {
    throw new Error("No Redis interruption was observed before the verification deadline");
  }
  if (process.exitCode !== 0) {
    throw new Error("Redis did not recover before the verification deadline");
  }
} finally {
  await closeRedis();
}
