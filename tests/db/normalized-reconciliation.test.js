import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  collectExpectedRows,
  stableStringify,
} from "../../backend/src/db/verify-normalized-reconciliation.mjs";

const verifierSource = readFileSync("backend/src/db/verify-normalized-reconciliation.mjs", "utf8");
const deploymentSource = readFileSync("infra/aws/deploy-staging.ps1", "utf8");
const templateSource = readFileSync("infra/aws/staging.yml", "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

describe("normalized source-to-target reconciliation gate", () => {
  it("canonicalizes object keys while preserving array order", () => {
    expect(stableStringify({ z: 1, a: { y: 2, x: [3, 4] } })).toBe(
      '{"a":{"x":[3,4],"y":2},"z":1}',
    );
    expect(stableStringify([2, 1])).not.toBe(stableStringify([1, 2]));
  });

  it("derives row identities for nested, hashed and privacy records", () => {
    const data = {
      users: [{
        id: "USER-1",
        deletionRequestedAt: "2026-11-01T00:00:00.000Z",
        deletionScheduledAt: "2026-12-01T00:00:00.000Z",
      }],
      courses: [{ id: "COURSE-1" }],
      assessments: [{ id: "ASSESSMENT-1", courseId: "COURSE-1", questions: [{ prompt: "Q1" }] }],
      candidateAssessments: [{
        id: "LINK-1",
        assessmentId: "ASSESSMENT-1",
        token: "candidate-token",
        createdBy: "USER-1",
        submissions: [{
          id: "SUBMISSION-1",
          candidateEmail: "Candidate@Example.invalid",
          startedAt: "2026-11-01T00:00:00.000Z",
          submittedAt: "2026-11-01T00:05:00.000Z",
          flags: [{ eventType: "TAB_SWITCH" }],
        }],
      }],
      archives: [{ id: "ARCHIVE-1", entityType: "User", deletedBy: "USER-1" }],
      auditLogs: [{ id: "AUDIT-1", action: "TEST", entityType: "SYSTEM", entityId: "1" }],
      securityEvents: [{ id: "SECURITY-1", type: "TEST" }],
      settings: {},
    };

    const expected = collectExpectedRows(data);
    const rows = Object.fromEntries(expected.direct.map((entry) => [entry.name, entry.values]));
    expect(rows["candidate submissions"]).toEqual(["SUBMISSION-1"]);
    expect(rows["candidate proctor events"]).toEqual([
      `CPE-BACKFILL-${sha256("LINK-1:SUBMISSION-1:0").slice(0, 32).toUpperCase()}`,
    ]);
    expect(rows["privacy requests"]).toEqual([
      `PRIV-BACKFILL-${sha256("USER-1").slice(0, 32).toUpperCase()}`,
    ]);
    expect(rows["deletion archives"]).toEqual([sha256("ARCHIVE-1")]);
    expect(expected.questionCounts.get("ASSESSMENT-1")).toBe(1);
    expect(expected.bindings.candidateLinks[0].tokenHash).toBe(sha256("candidate-token"));
    expect(expected.bindings.candidateSubmissions[0].candidateEmail).toBe("candidate@example.invalid");
    expect(expected.settingsExpected).toBe(true);
  });

  it("fails closed on duplicate identifiers and incomplete privacy scheduling", () => {
    expect(() => collectExpectedRows({ users: [{ id: "U1" }, { id: "U1" }] })).toThrow(
      /duplicate reconciliation identifiers/,
    );
    expect(() => collectExpectedRows({
      users: [{ id: "U1", deletionRequestedAt: "2026-11-01T00:00:00.000Z" }],
    })).toThrow(/invalid deletionScheduledAt/);
  });

  it("uses one repeatable-read snapshot and writes hash-bound audit evidence", () => {
    expect(verifierSource).toContain("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    expect(verifierSource).toContain("sourceSnapshotSha256");
    expect(verifierSource).toContain("NORMALIZED_RECONCILIATION_PASSED");
    expect(verifierSource).toContain('normalized-reconciliation:${sourceSnapshotSha256}:${sourceRevision || "unversioned"}');
    expect(verifierSource).toContain("SOURCE_REVISION must identify the deployed Git commit in production");
  });

  it("runs reconciliation before the remaining relational and concurrency gates", () => {
    expect(templateSource).toContain("Name: SOURCE_REVISION, Value: !Ref SourceRevision");
    expect(deploymentSource).toContain('"verify-normalized-reconciliation.mjs"');
    expect(deploymentSource.indexOf('"verify-normalized-reconciliation.mjs"')).toBeLessThan(
      deploymentSource.indexOf('"verify-identity.mjs"'),
    );
    expect(deploymentSource.indexOf('"verify-normalized-reconciliation.mjs"')).toBeLessThan(
      deploymentSource.indexOf('if ($RunMultiTaskConcurrencyCanary)'),
    );
  });
});
