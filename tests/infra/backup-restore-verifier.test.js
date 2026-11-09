import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const verifier = readFileSync("backend/src/db/verify-backup-restore.mjs", "utf8");
const orchestrator = readFileSync("infra/aws/verify-backup-restore.ps1", "utf8");
const template = readFileSync("infra/aws/staging.yml", "utf8");

describe("AWS backup/restore verifier contract", () => {
  it("binds a unique source marker to the release revision and restored schema", () => {
    expect(verifier).toContain("BACKUP_RESTORE_MARKER");
    expect(verifier).toContain("metadata->>'sourceRevision' = $3");
    expect(verifier).toContain("schema_migrations");
    expect(verifier).toContain("to_regclass('public.payment_orders')");
    expect(verifier).toContain("pg_is_in_recovery()");
    expect(verifier).toContain("DELETE FROM audit_logs WHERE ingest_key = $1 AND entity_id = $2");
  });

  it("restores an isolated private RDS instance and verifies it from the deployed task", () => {
    expect(orchestrator).toContain("create-db-snapshot");
    expect(orchestrator).toContain("db-snapshot-completed");
    expect(orchestrator).toContain("restore-db-instance-from-db-snapshot");
    expect(orchestrator).toContain("--no-publicly-accessible --no-multi-az --no-deletion-protection");
    expect(orchestrator).toContain("--db-parameter-group-name $databaseParameterGroup");
    expect(orchestrator).toContain("The restore snapshot is not encrypted");
    expect(orchestrator).toContain("The restored database unexpectedly has public network access");
    expect(orchestrator).toContain("The restored database does not use exactly the approved database security group");
    expect(orchestrator).toContain("The restored database does not use the source database parameter group");
    expect(orchestrator).toContain("PGHOST = $restoreEndpoint");
    expect(orchestrator).toContain('"assert", $runId, $sourceRevision');
    expect(orchestrator).toContain("Restore exceeded the $MaxRestoreMinutes minute recovery-time objective");
    expect(orchestrator).toContain('result = "passed"');
  });

  it("limits destructive cleanup to tagged, run-scoped resources", () => {
    expect(orchestrator).toContain("ExpectedAccountId");
    expect(orchestrator).toContain("ExpectedSourceRevision");
    expect(orchestrator).toContain("ConfirmRestoreDrill");
    expect(orchestrator).toContain("restricted to an explicitly non-production stack");
    expect(orchestrator).toContain("authenticated AWS account does not match ExpectedAccountId");
    expect(orchestrator).toContain("requires a digest-pinned Nalanda container");
    expect(orchestrator).toContain("task definition SOURCE_REVISION does not match ExpectedSourceRevision");
    expect(orchestrator.indexOf("ConfirmRestoreDrill.IsPresent")).toBeLessThan(
      orchestrator.indexOf("$outputs = Get-StackOutputs"),
    );
    expect(orchestrator.indexOf("The task definition SOURCE_REVISION does not match ExpectedSourceRevision")).toBeLessThan(
      orchestrator.indexOf('"prepare", $runId, $sourceRevision'),
    );
    expect(orchestrator).toContain("Assert-RunScopedIdentifier");
    expect(orchestrator).toContain("NalandaRestoreRun");
    expect(orchestrator).toContain("Refusing to delete an untagged restored database instance");
    expect(orchestrator).toContain("Refusing to delete an untagged restore snapshot");
    expect(orchestrator).toContain("--skip-final-snapshot --delete-automated-backups");
    expect(orchestrator).toContain("KeepFailedResources");
  });

  it("exports the database identifiers needed by an operator-run restore drill", () => {
    expect(template).toContain("DatabaseIdentifier:");
    expect(template).toContain("DatabaseSubnetGroupName:");
    expect(template).toContain("DatabaseSecurityGroupId:");
    expect(template).toContain("DatabaseName:");
  });
});
