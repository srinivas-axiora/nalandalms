import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const template = readFileSync("infra/aws/staging.yml", "utf8");
const verifier = readFileSync("infra/aws/verify-redis-failover.ps1", "utf8");
const stagingVerifier = readFileSync("infra/aws/verify-staging.ps1", "utf8");
const observer = readFileSync("backend/src/cache/verify-redis-recovery.mjs", "utf8");
const redisClient = readFileSync("backend/src/cache/redis.js", "utf8");

describe("Redis Multi-AZ failover rehearsal contract", () => {
  it("deploys an encrypted Multi-AZ replication group with automatic failover", () => {
    expect(template).toContain("NumCacheClusters: 2");
    expect(template).toContain("AutomaticFailoverEnabled: true");
    expect(template).toContain("MultiAZEnabled: true");
    expect(template).toContain("AtRestEncryptionEnabled: true");
    expect(template).toContain("TransitEncryptionEnabled: true");
    expect(template).toContain("CacheReplicationGroupId:");
    expect(template).toContain("ApplicationLogGroupName:");
    expect(stagingVerifier).toContain("Redis must have Multi-AZ automatic failover enabled");
    expect(stagingVerifier).toContain("cacheResilience = [ordered]@{");
  });

  it("keeps retrying with capped jitter instead of permanently disconnecting", () => {
    expect(redisClient).toContain("retryStrategy: redisRetryDelay");
    expect(redisClient).toContain("Math.min(2 ** Math.min(attempt - 1, 10) * 50, 5000)");
    expect(redisClient).not.toContain("if (times > 3) return null");
  });

  it("restricts mutation to non-production and requires explicit confirmation", () => {
    expect(verifier).toContain("ConfirmFailover");
    expect(verifier).toContain("ExpectedAccountId");
    expect(verifier).toContain("ExpectedSourceRevision");
    expect(verifier).toContain("authenticated AWS account does not match ExpectedAccountId");
    expect(verifier).toContain("restricted to an explicitly non-production environment");
    expect(verifier.indexOf("restricted to an explicitly non-production environment")).toBeLessThan(
      verifier.indexOf('"elasticache", "test-failover"'),
    );
  });

  it("arms a source-bound ECS observer before triggering managed failover", () => {
    expect(verifier).toContain("SourceRevision");
    expect(verifier).toContain("immutable digest-pinned image");
    expect(verifier).toContain("org.opencontainers.image.revision");
    expect(verifier).toContain("verify-redis-recovery.mjs");
    expect(verifier).toContain("REDIS_RECOVERY_ARMED");
    expect(verifier).toContain("The ECS service is not running the stack-owned task definition");
    expect(verifier).toContain('"elasticache", "test-failover"');
    expect(observer).toContain("await ensureRedisReady()");
  });

  it("proves fail-closed controls, readiness degradation and in-place recovery", () => {
    expect(observer).toContain("rateLimitCheckAndIncr");
    expect(observer).toContain('marker("FAIL_CLOSED"');
    expect(observer).toContain('marker("RECOVERED"');
    expect(verifier).toContain("/api/ready");
    expect(verifier).toContain("statusCode -eq 503");
    expect(verifier).toContain("The ECS service task was replaced instead of reconnecting in place");
    expect(verifier).toContain('Write-Evidence "passed"');
    expect(verifier).toContain('Write-Evidence "failed"');
  });
});
