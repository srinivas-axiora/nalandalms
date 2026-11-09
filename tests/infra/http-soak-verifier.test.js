import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const template = readFileSync("infra/aws/staging.yml", "utf8");
const orchestrator = readFileSync("infra/aws/verify-http-soak.ps1", "utf8");
const stagingVerifier = readFileSync("infra/aws/verify-staging.ps1", "utf8");
const worker = readFileSync("backend/src/load/verify-http-soak.mjs", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

describe("production-shaped two-task HTTP load/soak gate", () => {
  it("exposes an explicit package entry point with bounded source-bound modes", () => {
    expect(packageJson.scripts["load:verify-http"]).toBe("node backend/src/load/verify-http-soak.mjs");
    expect(worker).toContain('new Set(["setup", "worker", "assert", "cleanup"])');
    expect(worker).toContain("a full 40-character source revision is required");
    expect(worker).toContain("ECS task metadata is required for an unambiguous load result");
    expect(worker).toContain("the per-task target must use a private IPv4 address");
  });

  it("exercises authenticated relational reads, a write, dependency readiness and the edge", () => {
    for (const route of [
      "direct-auth", "direct-courses", "direct-chapters", "direct-analytics",
      "direct-progress", "direct-heartbeat", "direct-ready", "edge-ready",
    ]) {
      expect(worker).toContain(`name: "${route}"`);
    }
    expect(worker).toContain('headers["idempotency-key"]');
    expect(worker).toContain('headers["x-csrf-token"]');
    expect(worker).toContain("AbortSignal.timeout(5_000)");
  });

  it("enforces sustained throughput, per-route percentiles and bounded errors", () => {
    expect(worker).toContain("did not sustain at least 90% of its requested throughput");
    expect(worker).toContain("p95Milliseconds < p95ThresholdMs");
    expect(worker).toContain("p99Milliseconds <= p99ThresholdMs");
    expect(worker).toContain("the load profile triggered request throttling");
    expect(worker).toContain("the load profile produced server errors");
    expect(worker).toContain("authenticated load requests lost authorization");
  });

  it("uses revision-bound synthetic evidence and exact fixture cleanup", () => {
    expect(worker).toContain("VERIFY_HTTP_SOAK_WORKER");
    expect(worker).toContain('createHmac("sha256", process.env.JWT_SECRET)');
    expect(worker).toContain("metadata->>'sourceRevision' = $4");
    expect(worker).toContain("DELETE FROM learning_time_events WHERE user_id = ANY($1::text[])");
    expect(worker).toContain("DELETE FROM courses WHERE id = $1");
    expect(worker).toContain("HTTP_SOAK_ASSERT:");
  });

  it("refuses the wrong account, revision, environment, artifact or authority mode", () => {
    expect(orchestrator).toContain("ExpectedAccountId");
    expect(orchestrator).toContain("ExpectedSourceRevision");
    expect(orchestrator).toContain("restricted to an explicitly non-production environment");
    expect(orchestrator).toContain("immutable digest-pinned image");
    expect(orchestrator).toContain("USE_PG_COURSES=1");
    expect(orchestrator).toContain("AuthorityMode=normalized");
    expect(orchestrator).toContain("normalized-v1");
    expect(orchestrator).toContain("normalized-v2");
    expect(orchestrator.indexOf("USE_PG_COURSES=1")).toBeLessThan(
      orchestrator.indexOf('"ecs", "update-service"'),
    );
  });

  it("pins one worker to each cross-AZ task and restores the service and fixture", () => {
    expect(orchestrator).toContain('"--desired-count", "2"');
    expect(orchestrator).toContain("must be distributed across two Availability Zones");
    expect(orchestrator).toContain('"http://$($target.privateIpAddress):8080"');
    expect(orchestrator).toContain("An ECS service task was replaced during the load interval");
    expect(orchestrator).toContain("ECS service did not return to its original size");
    expect(orchestrator).toContain('Write-Evidence "passed"');
    expect(orchestrator).toContain('Write-Evidence "failed"');
  });

  it("attests private verifier ingress, readiness, headroom and alarm state", () => {
    expect(template).toContain("ApplicationSelfIngress:");
    expect(template).toContain("SourceSecurityGroupId: !GetAtt ApplicationSecurityGroup.GroupId");
    expect(stagingVerifier).toContain("Application ingress must be scoped to the ALB and self-referencing verifier traffic");
    expect(orchestrator).toContain("Public readiness was not continuously healthy during load");
    expect(orchestrator).toContain('Get-EcsMetricMaximum "CPUUtilization"');
    expect(orchestrator).toContain('Get-EcsMetricMaximum "MemoryUtilization"');
    expect(orchestrator).toContain("One or more staging alarms entered ALARM during the load gate");
  });
});
