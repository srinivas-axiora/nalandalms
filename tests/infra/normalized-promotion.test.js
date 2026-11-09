import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deployment = readFileSync("infra/aws/deploy-staging.ps1", "utf8");
const template = readFileSync("infra/aws/staging.yml", "utf8");

describe("guarded normalized-authority promotion", () => {
  it("keeps snapshot authority as the template default", () => {
    expect(template).toContain("AuthorityMode:");
    expect(template).toContain("Default: snapshot");
    expect(template).toContain("AllowedValues: [snapshot, normalized]");
  });

  it("requires preparation, all verifiers, concurrency and two explicit confirmations", () => {
    expect(deployment).toContain("PromoteNormalizedAuthority requires database preparation, every relational verifier and the multi-task concurrency canary");
    expect(deployment).toContain("-not $ConfirmNormalizedPromotion");
    expect(deployment).toContain("-not $ConfirmStagingTrafficStopped");
    expect(deployment.indexOf("PromoteNormalizedAuthority requires")).toBeLessThan(
      deployment.indexOf('Invoke-StackDeployment $initialAuthorityMode'),
    );
  });

  it("forces the preparation deployment to snapshot mode before data work", () => {
    expect(deployment).toContain('$initialAuthorityMode = if ($PromoteNormalizedAuthority) { "snapshot" } else { "" }');
    expect(deployment.indexOf('Invoke-StackDeployment $initialAuthorityMode')).toBeLessThan(
      deployment.indexOf('if ($PrepareRelationalDatabase)'),
    );
    expect(deployment.indexOf('if ($RunMultiTaskConcurrencyCanary)')).toBeLessThan(
      deployment.indexOf('Invoke-StackDeployment "normalized"'),
    );
  });

  it("requires fail-closed source-to-target reconciliation before promotion", () => {
    expect(deployment).toContain('"verify-normalized-reconciliation.mjs"');
    expect(deployment.indexOf('"verify-normalized-reconciliation.mjs"')).toBeLessThan(
      deployment.indexOf('Invoke-StackDeployment "normalized"'),
    );
    expect(template).toContain("Name: SOURCE_REVISION, Value: !Ref SourceRevision");
    expect(deployment).toContain("Re-running source-to-target reconciliation inside the final write-quiescence window");
    expect(deployment.indexOf("Re-running source-to-target reconciliation")).toBeLessThan(
      deployment.indexOf("create-db-snapshot"),
    );
  });

  it("enforces and recovers write quiescence around preparation and final cutover", () => {
    expect(deployment).toContain("Set-StagingServiceCount 0");
    expect(deployment).toContain("services-stable");
    expect(deployment).toContain("Staging service count attestation failed");
    expect(deployment).toContain("Restoring the pre-promotion staging service count");
    expect(deployment).toContain("Pre-cutover gate failed; restoring the snapshot-mode staging service");
    expect(deployment).toContain("quiescenceOriginalDesiredCount");
    expect(deployment).toContain("finalReconciliationResult");
  });

  it("creates and attests an encrypted source-bound RDS snapshot before cutover", () => {
    expect(deployment).toContain("create-db-snapshot");
    expect(deployment).toContain("db-snapshot-available");
    expect(deployment).toContain("normalized-authority-promotion");
    expect(deployment).toContain("$promotionSnapshotEncrypted");
    expect(deployment).toContain("DBInstanceIdentifier -ne $databaseIdentifier");
    expect(deployment.indexOf("create-db-snapshot")).toBeLessThan(
      deployment.indexOf('Invoke-StackDeployment "normalized"'),
    );
  });

  it("requires a new normalized task definition, readiness and deployed attestation", () => {
    expect(deployment).toContain('Invoke-StackDeployment "normalized"');
    expect(deployment).toContain('$authorityModeAfter -ne "normalized"');
    expect(deployment).toContain("Promotion did not produce a new normalized task definition");
    expect(deployment).toContain("Wait-ApplicationReady");
    expect(deployment).toContain("Invoke-StagingAttestation $EvidencePath");
  });

  it("makes the two-task HTTP soak gate mandatory before accepting promotion", () => {
    expect(deployment).toContain('Join-Path $PSScriptRoot "verify-http-soak.ps1"');
    expect(deployment).toContain("-ConfirmLoadTest");
    expect(deployment).toContain("-DurationSeconds $SoakDurationSeconds");
    expect(deployment).toContain("-RequestsPerSecondPerWorker $SoakRequestsPerSecondPerWorker");
    expect(deployment.indexOf('verify-http-soak.ps1')).toBeLessThan(
      deployment.lastIndexOf('Write-PromotionEvidence "passed"'),
    );
  });

  it("automatically restores and attests snapshot authority after a failed cutover gate", () => {
    expect(deployment).toContain("Normalized promotion failed; restoring snapshot authority");
    expect(deployment).toContain('Invoke-StackDeployment "snapshot"');
    expect(deployment).toContain('$authorityModeAfter -ne "snapshot"');
    expect(deployment).toContain("automatic authority rollback also failed");
    expect(deployment).toContain('Write-PromotionEvidence "failed"');
    expect(deployment).toContain("rollbackTaskDefinitionArn");
  });
});
