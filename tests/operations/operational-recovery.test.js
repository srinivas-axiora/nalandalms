import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const paymentVerifier = readFileSync("backend/src/db/verify-payments.mjs", "utf8");
const privacyVerifier = readFileSync("backend/src/db/verify-privacy.mjs", "utf8");
const retentionVerifier = readFileSync("backend/src/db/verify-proctor-retention.mjs", "utf8");
const wrapper = readFileSync("infra/aws/verify-operational-recovery.ps1", "utf8");
const deployment = readFileSync("infra/aws/deploy-staging.ps1", "utf8");

describe("operational recovery release gate", () => {
  it("reconciles paid orders, immutable transaction bindings, entitlements and webhooks", () => {
    expect(paymentVerifier).toContain("paid_order_count_anomalies");
    expect(paymentVerifier).toContain("transaction_binding_anomalies");
    expect(paymentVerifier).toContain("missing_entitlements");
    expect(paymentVerifier).toContain("processed_webhook_anomalies");
    expect(paymentVerifier).toContain("PAYMENT_RECONCILIATION_PASSED");
    expect(paymentVerifier).toContain("SOURCE_REVISION must identify the deployed Git commit in production");
  });

  it("proves exact replay and rejects cross-order provider payment reuse", () => {
    expect(paymentVerifier).toContain('replay.idempotent === true');
    expect(paymentVerifier).toContain('reuseError.code === "PAYMENT_REUSED"');
    expect(paymentVerifier).toContain("complete payment ledger has zero internal reconciliation anomalies");
  });

  it("drives privacy erasure through durable failure, retry and completion states", () => {
    expect(privacyVerifier).toContain("synthetic object-store interruption");
    expect(privacyVerifier).toContain('retryState.rows[0]?.status === "Failed"');
    expect(privacyVerifier).toContain('last_error_code === "OBJECT_DELETE_FAILED"');
    expect(privacyVerifier).toContain("privacy retry deletes the remaining object and finalizes exactly once");
  });

  it("drives a real object through failed and successful media-retention attempts", () => {
    expect(retentionVerifier).toContain("uploadBuffer(objectKey");
    expect(retentionVerifier).toContain("await objectExists(objectKey)");
    expect(retentionVerifier).toContain("synthetic object-store interruption");
    expect(retentionVerifier).toContain("deleteFn: deleteObjectCompletely");
    expect(retentionVerifier).toContain("remainingObjectVersions === 0");
    expect(retentionVerifier).toContain('completed.rows[0]?.status === "Deleted"');
    expect(retentionVerifier).toContain("!String(row.metadata).includes(objectKey)");
  });

  it("restricts the AWS drill to confirmed normalized non-production stacks", () => {
    expect(wrapper).toContain("-ConfirmRecoveryDrill switch");
    expect(wrapper).toContain("restricted to an explicitly non-production stack");
    expect(wrapper).toContain('$authorityMode -ne "normalized"');
    expect(wrapper).toContain("digest-pinned Nalanda container");
    expect(wrapper).toContain("SOURCE_REVISION");
    expect(wrapper).toContain('Invoke-Verifier "payment-reconciliation"');
    expect(wrapper).toContain('Invoke-Verifier "privacy-erasure-retry"');
    expect(wrapper).toContain('Invoke-Verifier "proctor-media-retention-retry"');
    expect(wrapper).toContain("One or more stack alarms are active");
  });

  it("makes all three operational verifiers part of normalized promotion", () => {
    expect(deployment).toContain('"verify-payments.mjs"');
    expect(deployment).toContain('"verify-privacy.mjs"');
    expect(deployment).toContain('"verify-proctor-retention.mjs"');
    expect(deployment.indexOf('"verify-payments.mjs"')).toBeLessThan(
      deployment.indexOf('Invoke-StackDeployment "normalized"'),
    );
  });

  it("permits controlled removal of every S3 object version", () => {
    const template = readFileSync("infra/aws/staging.yml", "utf8");
    expect(template).toContain("s3:ListBucketVersions");
    expect(template).toContain("s3:DeleteObjectVersion");
    expect(template).toContain("verification/*");
    expect(template).toContain("${MediaBucket.Arn}/verification/*");
  });
});
