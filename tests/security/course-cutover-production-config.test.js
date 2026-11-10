import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const productionEnv = (coverage) => ({
  ...process.env,
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://example.invalid/nalanda",
  PGSSL: "require",
  REDIS_URL: "rediss://example.invalid:6379",
  S3_BUCKET: "nalanda-config-test",
  S3_REGION: "ap-south-1",
  RAZORPAY_KEY_ID: "rzp_test_config",
  RAZORPAY_KEY_SECRET: "payment-secret-for-config-test-only",
  RAZORPAY_WEBHOOK_SECRET: "webhook-secret-for-config-test-only",
  CERTIFICATE_ISSUANCE_APPROVAL_ROLE: "Admin",
  PASSWORD_RESET_FROM_EMAIL: "security@example.com",
  PASSWORD_RESET_BASE_URL: "https://learn.example.com",
  PASSWORD_RESET_QUEUE_URL: "https://sqs.ap-south-1.amazonaws.com/123456789012/reset",
  ENABLE_PASSWORD_RESET_WORKER: "1",
  CERTIFICATE_SIGNING_SECRET: "certificate-signing-secret-for-config-test-only",
  JWT_SECRET: "jwt-secret-for-config-test-only-at-least-thirty-two-characters",
  USE_PG_COURSES: "1",
  COURSE_AUTHORITY_COVERAGE_ACK: coverage,
});

const loadProductionConfig = (coverage) => spawnSync(
  process.execPath,
  ["--input-type=module", "--eval", "await import('./backend/src/config.js'); console.log('CONFIG_LOADED')"],
  {
    cwd: process.cwd(),
    env: productionEnv(coverage),
    encoding: "utf8",
  }
);

describe("production course cutover configuration", () => {
  it("fails closed without the exact versioned coverage acknowledgement", () => {
    for (const coverage of ["", "normalized-v0", "normalized-v2"]) {
      const result = loadProductionConfig(coverage);
      expect(result.status, `${coverage}: ${result.stderr}`).not.toBe(0);
      expect(result.stderr).toContain(
        "USE_PG_COURSES requires COURSE_AUTHORITY_COVERAGE_ACK=normalized-v1"
      );
      expect(result.stdout).not.toContain("CONFIG_LOADED");
    }
  });

  it("allows an explicitly acknowledged production-mode canary to reach runtime readiness", () => {
    const result = loadProductionConfig("normalized-v1");
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("CONFIG_LOADED");
  });
});
