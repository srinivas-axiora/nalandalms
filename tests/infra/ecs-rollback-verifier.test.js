import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("infra/aws/verify-ecs-rollback.ps1", "utf8");

describe("ECS rollback rehearsal contract", () => {
  it("requires an explicit revision-qualified and provenance-bound rollback target", () => {
    expect(source).toContain("RollbackTaskDefinitionArn");
    expect(source).toContain("ExpectedRollbackSourceRevision");
    expect(source).toContain("ExpectedRollbackContainerImage");
    expect(source).toContain("full revision-qualified ECS task definition ARN");
    expect(source).toContain("must be an older revision of the current family");
    expect(source).toContain("org.opencontainers.image.revision");
    expect(source).toContain("Rollback container image must differ from the current release image");
    expect(source).toContain("Rollback source revision must differ from the current stack revision");
  });

  it("rejects configuration drift and vulnerable or mutable images before mutation", () => {
    expect(source).toContain("Assert-EquivalentTaskConfiguration");
    expect(source).toContain("changes protected container configuration");
    expect(source).toContain("immutable ECR sha256 digest URI");
    expect(source).toContain('"ecr", "describe-image-scan-findings"');
    expect(source).toContain("critical -eq 0 -and $high -eq 0");
    expect(source.indexOf("Assert-EquivalentTaskConfiguration")).toBeLessThan(
      source.indexOf("Deploying approved rollback task definition"),
    );
  });

  it("proves service and running-task identity plus application readiness", () => {
    expect(source).toContain('"ecs", "list-tasks"');
    expect(source).toContain('"ecs", "describe-tasks"');
    expect(source).toContain("deploymentCircuitBreaker.enable");
    expect(source).toContain("deploymentCircuitBreaker.rollback");
    expect(source).toContain("/api/ready");
    expect(source).toContain("/api/health");
    expect(source).toContain("observedReadinessChecks");
  });

  it("always restores the stack task definition and records failed evidence", () => {
    expect(source).toContain("} finally {");
    expect(source).toContain("Restoring stack-owned task definition");
    expect(source).toContain("CRITICAL: ECS rollback rehearsal could not restore");
    expect(source).toContain('result = if ($null -eq $drillError');
    expect(source).toContain("Write-Evidence $result $failureMessage");
  });
});
