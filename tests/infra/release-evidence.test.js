import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  evaluateReleaseEvidence,
  evaluateReleaseEvidenceFiles,
} from "../../scripts/verify-release-evidence.mjs";

const accountId = "123456789012";
const region = "ap-south-1";
const stackName = "nalanda-staging";
const sourceRevision = "a".repeat(40);
const taskDefinitionArn = `arn:aws:ecs:${region}:${accountId}:task-definition/nalanda-staging:42`;
const containerImage = `${accountId}.dkr.ecr.${region}.amazonaws.com/nalanda@sha256:${"b".repeat(64)}`;
const prePromotion = "2026-11-09T16:50:00.000Z";
const promotionTime = "2026-11-09T17:00:00.000Z";
const postPromotion = "2026-11-09T17:10:00.000Z";
const expected = { accountId, region, stackName, sourceRevision };
const task = (suffix) => ({ taskArn: `arn:task/${suffix}`, exitCode: 0 });

const common = (capturedAt = postPromotion) => ({
  schemaVersion: 1,
  capturedAt,
  result: "passed",
  accountId,
  region,
  stackName,
  sourceRevision,
  taskDefinitionArn,
});

const fixtures = () => ({
  attestation: {
    schemaVersion: 1,
    generatedAt: prePromotion,
    accountId,
    region,
    stack: { name: stackName },
    application: { ready: true },
    runtimeAuthority: { mode: "normalized" },
    supplyChain: {
      sourceRevision,
      taskDefinitionArn,
      containerImage,
      imageScanStatus: "COMPLETE",
      criticalFindings: 0,
      highFindings: 0,
      rolloutState: "COMPLETED",
    },
  },
  promotion: {
    ...common(promotionTime),
    normalizedTaskDefinitionArn: taskDefinitionArn,
    containerImage,
    authorityModeAfter: "normalized",
    quiescenceResult: "passed",
    serviceResumeResult: "passed",
    cutoverQuiescenceResult: "passed",
    finalReconciliationResult: "passed",
    rollbackResult: "not-required",
  },
  multiTask: {
    ...common(prePromotion),
    containerImage,
    expectedWorkers: 2,
    setupTasks: [task("setup")],
    workerTasks: [task("worker-a"), task("worker-b")],
    assertionTasks: [task("assert")],
  },
  httpSoak: {
    ...common(prePromotion),
    authorityMode: "normalized",
    serviceRestored: true,
    fixtureCleaned: true,
    workerTaskArns: ["arn:worker/a", "arn:worker/b"],
    activeAlarms: [],
  },
  operationalRecovery: {
    ...common(),
    authorityMode: "normalized",
    tasks: [task("payment"), task("privacy"), task("retention")],
    serviceBefore: { taskDefinition: taskDefinitionArn },
    serviceAfter: { taskDefinition: taskDefinitionArn },
  },
  backupRestore: {
    ...common(),
    containerImage,
    snapshotEncrypted: true,
    restoredStorageEncrypted: true,
    restoredPubliclyAccessible: false,
    cleanup: "completed",
  },
  rdsFailover: {
    ...common(),
    markerCleaned: true,
    availabilityZoneBefore: "ap-south-1a",
    availabilityZoneAfter: "ap-south-1b",
    observedReadinessFailure: true,
  },
  redisFailover: {
    ...common(),
    primaryBefore: "cache-a",
    primaryAfter: "cache-b",
    observedReadinessFailure: true,
  },
  ecsRollback: {
    schemaVersion: 1,
    capturedAt: postPromotion,
    result: "passed",
    accountId,
    region,
    stackName,
    current: { sourceRevision, taskDefinitionArn, containerImage },
    restoration: { attempted: true, completed: true },
  },
  providerReconciliation: {
    schemaVersion: 1,
    capturedAt: postPromotion,
    evidenceType: "razorpay-reconciliation",
    result: "passed",
    provider: "Razorpay",
    providerMode: "test",
    accountId,
    stackName,
    sourceRevision,
    currency: "INR",
    ordersCompared: 2,
    settlementsCompared: 1,
    refundsCompared: 1,
    disputesCompared: 1,
    monetaryVarianceCents: 0,
    unmatchedProviderRecords: 0,
    unmatchedNalandaRecords: 0,
    replayProtectionVerified: true,
    crossOrderBindingVerified: true,
    refundParityVerified: true,
    disputeHandlingVerified: true,
    settlementParityVerified: true,
    reviewedBy: "Finance Reviewer",
    evidenceReferences: ["razorpay-export-sha256:abc"],
  },
  privacyApproval: {
    schemaVersion: 1,
    capturedAt: postPromotion,
    evidenceType: "privacy-retention-approval",
    result: "approved",
    accountId,
    stackName,
    sourceRevision,
    policyVersion: "2026-11",
    retentionScheduleApproved: true,
    erasureWorkflowApproved: true,
    legalHoldProcessApproved: true,
    approvedBy: "Privacy Owner",
    approverRole: "Data Protection Officer",
    evidenceReferences: ["policy-sha256:def"],
  },
});

const evaluate = (documents, options = {}) => evaluateReleaseEvidence({
  expected,
  documents,
  hashes: Object.fromEntries(Object.keys(documents).map((name) => [name, "f".repeat(64)])),
  now: Date.parse("2026-11-09T18:00:00.000Z"),
  maxAgeHours: 24,
  ...options,
});

describe("production release evidence evaluator", () => {
  it("accepts one coherent, fresh and complete release evidence set", () => {
    const result = evaluate(fixtures());
    expect(result.decision).toBe("GO");
    expect(result.taskDefinitionArn).toBe(taskDefinitionArn);
    expect(Object.values(result.gates)).toEqual(Array(11).fill("passed"));
    expect(Object.values(result.evidenceSha256)).toEqual(Array(11).fill("f".repeat(64)));
  });

  it("rejects a drill from a different task definition", () => {
    const documents = fixtures();
    documents.backupRestore.taskDefinitionArn = `${taskDefinitionArn}-other`;
    expect(() => evaluate(documents)).toThrow(/backup restore task definition mismatch/);
  });

  it("rejects stale evidence", () => {
    const documents = fixtures();
    documents.redisFailover.capturedAt = "2026-11-01T00:00:00.000Z";
    expect(() => evaluate(documents)).toThrow(/Redis failover is older than 24 hours/);
  });

  it("rejects incomplete provider reconciliation", () => {
    const documents = fixtures();
    documents.providerReconciliation.disputeHandlingVerified = false;
    expect(() => evaluate(documents)).toThrow(/Razorpay control verification is incomplete/);
  });

  it("rejects operational evidence captured before normalized promotion", () => {
    const documents = fixtures();
    documents.rdsFailover.capturedAt = "2026-11-09T16:55:00.000Z";
    expect(() => evaluate(documents)).toThrow(/rdsFailover evidence predates normalized promotion/);
  });

  it("requires immutable output and every evidence input on the CLI", () => {
    const source = readFileSync("scripts/verify-release-evidence.mjs", "utf8");
    expect(source).toContain('flag: "wx"');
    expect(source).toContain('providerReconciliation: "provider-reconciliation"');
    expect(source).toContain('privacyApproval: "privacy-approval"');
    expect(source).toContain("evidenceSha256");
    expect(JSON.parse(readFileSync("docs/examples/RAZORPAY-RECONCILIATION.example.json", "utf8")).result).toBe("pending");
    expect(JSON.parse(readFileSync("docs/examples/PRIVACY-RETENTION-APPROVAL.example.json", "utf8")).result).toBe("pending");
  });

  it("hashes exact files and refuses to overwrite a release decision", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "nalanda-release-evidence-"));
    try {
      const documents = fixtures();
      const paths = {};
      for (const [name, document] of Object.entries(documents)) {
        paths[name] = path.join(directory, `${name}.json`);
        writeFileSync(paths[name], JSON.stringify(document));
      }
      const outputPath = path.join(directory, "decision.json");
      const first = evaluateReleaseEvidenceFiles({
        expected,
        paths,
        outputPath,
        now: Date.parse("2026-11-09T18:00:00.000Z"),
        maxAgeHours: 24,
      });
      const persisted = JSON.parse(readFileSync(outputPath, "utf8"));
      expect(first.result.decision).toBe("GO");
      expect(Object.values(persisted.evidenceSha256)).toHaveLength(11);
      expect(Object.values(persisted.evidenceSha256).every((hash) => /^[a-f0-9]{64}$/.test(hash))).toBe(true);
      expect(() => evaluateReleaseEvidenceFiles({
        expected,
        paths,
        outputPath,
        now: Date.parse("2026-11-09T18:00:00.000Z"),
        maxAgeHours: 24,
      })).toThrow(/EEXIST/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
