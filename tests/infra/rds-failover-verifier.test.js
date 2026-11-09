import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const template = readFileSync("infra/aws/staging.yml", "utf8");
const verifier = readFileSync("infra/aws/verify-rds-failover.ps1", "utf8");
const stagingVerifier = readFileSync("infra/aws/verify-staging.ps1", "utf8");
const observer = readFileSync("backend/src/db/verify-rds-failover.mjs", "utf8");
const relationalPool = readFileSync("backend/src/db/pool.js", "utf8");
const snapshotStorage = readFileSync("backend/db.js", "utf8");

describe("RDS Multi-AZ failover rehearsal contract", () => {
  it("deploys and attests a private encrypted Multi-AZ DB instance", () => {
    expect(template).toContain("MultiAZ: true");
    expect(template).toContain("StorageEncrypted: true");
    expect(template).toContain("PubliclyAccessible: false");
    expect(stagingVerifier).toContain("RDS must be configured as a Multi-AZ DB instance");
    expect(stagingVerifier).toContain("databaseResilience = [ordered]@{");
  });

  it("bounds snapshot and relational pool queries during database interruption", () => {
    expect(snapshotStorage).toContain("query_timeout: 10_000");
    expect(relationalPool).toContain("query_timeout: 10_000");
  });

  it("uses a durable revision-bound marker and proves writable recovery", () => {
    expect(observer).toContain("RDS_FAILOVER_MARKER");
    expect(observer).toContain("metadata->>'sourceRevision' = $3");
    expect(observer).toContain("pg_is_in_recovery()");
    expect(observer).toContain("inet_server_addr()::text");
    expect(observer).toContain("the durable failover marker was lost");
    expect(observer).toContain("server address did not change after forced failover");
    expect(observer).toContain("DELETE FROM audit_logs WHERE ingest_key = $1 AND entity_id = $2");
  });

  it("rejects the wrong account, revision, environment, image or database topology before mutation", () => {
    expect(verifier).toContain("ExpectedAccountId");
    expect(verifier).toContain("ExpectedSourceRevision");
    expect(verifier).toContain("restricted to an explicitly non-production environment");
    expect(verifier).toContain("immutable digest-pinned image");
    expect(verifier).toContain("org.opencontainers.image.revision");
    expect(verifier).toContain("not configured for Multi-AZ failover");
    expect(verifier).toContain("task definition PGHOST does not match the stack RDS endpoint");
    expect(verifier.indexOf("restricted to an explicitly non-production environment")).toBeLessThan(
      verifier.indexOf('"rds", "reboot-db-instance"'),
    );
  });

  it("forces failover and proves outage, stable endpoint, unchanged ECS task and recovery", () => {
    expect(verifier).toContain('"rds", "reboot-db-instance"');
    expect(verifier).toContain('"--force-failover"');
    expect(verifier).toContain("RDS_FAILOVER_ARMED");
    expect(verifier).toContain("RDS_FAILOVER_OUTAGE");
    expect(verifier).toContain("RDS_FAILOVER_MARKER_VERIFIED");
    expect(verifier).toContain("Application readiness is not healthy before RDS failover");
    expect(verifier).toContain("statusCode -eq 503");
    expect(verifier).toContain("stable RDS endpoint changed during failover");
    expect(verifier).toContain("ECS service task was replaced instead of reconnecting to RDS in place");
    expect(verifier).toContain('Write-Evidence "passed"');
    expect(verifier).toContain('Write-Evidence "failed"');
  });

  it("attempts exact run-marker cleanup after a failed drill", () => {
    expect(verifier).toContain("Invoke-MarkerCleanup");
    expect(verifier).toContain('"cleanup", $runId');
    expect(verifier).toContain("RDS marker cleanup failed");
    expect(verifier).toContain("markerCleaned");
  });
});
