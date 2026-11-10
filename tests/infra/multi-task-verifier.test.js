import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("backend/src/db/verify-multi-task.mjs", "utf8");

describe("multi-task concurrency verifier contract", () => {
  it("uses ECS task identity and a bounded shared-database barrier", () => {
    expect(source).toContain("ECS_CONTAINER_METADATA_URI_V4");
    expect(source).toContain("count(DISTINCT metadata->>'workerId')");
    expect(source).toContain("barrierTimeoutMs = 90_000");
    expect(source).toContain("workerCount = 2");
    expect(source).toContain("refusing an ambiguous multi-task result");
    expect(source).not.toContain("process.pid");
  });

  it("covers uniqueness, active-attempt, work-claim and optimistic-version races", () => {
    expect(source).toContain("courseAuthorityRepository.selfEnroll");
    expect(source).toContain("workplaceRepository.clockIn");
    expect(source).toContain("assessmentAuthorityRepository.startAttempt");
    expect(source).toContain("reportsRepository.claimDue({ reportId })");
    expect(source).toContain("courseAuthorityRepository.updateCourse");
    expect(source).toContain('["created", "conflict"]');
    expect(source).toContain('["claimed", "no_work"]');
    expect(source).toContain('["updated", "conflict"]');
    expect(source).toContain('["updated", "cycle_rejected"]');
  });

  it("asserts durable database and transactional audit outcomes before cleanup", () => {
    expect(source).toContain("database uniqueness retained one enrollment");
    expect(source).toContain("database uniqueness retained one daily attendance row");
    expect(source).toContain("database uniqueness retained one active assessment attempt");
    expect(source).toContain("SKIP LOCKED allowed one report claim");
    expect(source).toContain("optimistic course version advanced exactly once");
    expect(source).toContain("finally {\n    await cleanup();");
  });
});
