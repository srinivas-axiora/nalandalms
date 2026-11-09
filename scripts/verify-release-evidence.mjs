import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const MAX_EVIDENCE_BYTES = 2 * 1024 * 1024;
const REQUIRED_DOCUMENTS = [
  "attestation",
  "promotion",
  "multiTask",
  "httpSoak",
  "operationalRecovery",
  "backupRestore",
  "rdsFailover",
  "redisFailover",
  "ecsRollback",
  "providerReconciliation",
  "privacyApproval",
];

const reject = (message) => { throw new Error(`Release evidence rejected: ${message}`); };
const requireEvidence = (condition, message) => { if (!condition) reject(message); };
const asArray = (value) => Array.isArray(value) ? value : [];
const allExitZero = (items) => items.length > 0 && items.every((item) => Number(item?.exitCode) === 0);

const parseInstant = (value, label) => {
  const time = Date.parse(String(value || ""));
  requireEvidence(Number.isFinite(time), `${label} has no valid timestamp`);
  return time;
};

const assertFresh = (value, label, { now, maxAgeHours }) => {
  const time = parseInstant(value, label);
  requireEvidence(time <= now + 5 * 60 * 1000, `${label} is dated in the future`);
  requireEvidence(time >= now - maxAgeHours * 60 * 60 * 1000, `${label} is older than ${maxAgeHours} hours`);
  return time;
};

const assertCommon = (document, label, expected, canonicalTaskDefinition, options = {}) => {
  requireEvidence(document?.schemaVersion === 1, `${label} schemaVersion is not 1`);
  if (!options.skipResult) requireEvidence(document?.result === "passed", `${label} did not pass`);
  requireEvidence(document?.region === expected.region, `${label} region mismatch`);
  requireEvidence(document?.stackName === expected.stackName, `${label} stack mismatch`);
  requireEvidence(document?.sourceRevision === expected.sourceRevision, `${label} source revision mismatch`);
  if (!options.skipAccount) requireEvidence(document?.accountId === expected.accountId, `${label} account mismatch`);
  if (!options.skipTask) {
    requireEvidence(document?.taskDefinitionArn === canonicalTaskDefinition, `${label} task definition mismatch`);
  }
};

export function evaluateReleaseEvidence({
  expected,
  documents,
  hashes = {},
  now = Date.now(),
  maxAgeHours = 72,
}) {
  requireEvidence(/^\d{12}$/.test(String(expected?.accountId || "")), "expected account ID is invalid");
  requireEvidence(/^[0-9a-f]{40}$/.test(String(expected?.sourceRevision || "")), "expected source revision is invalid");
  requireEvidence(/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/.test(String(expected?.region || "")), "expected region is invalid");
  requireEvidence(typeof expected?.stackName === "string" && expected.stackName.length > 2, "expected stack name is invalid");
  requireEvidence(/(staging|stage|test|nonprod|dev)/i.test(expected.stackName)
    && !/(^|[-_])prod(uction)?($|[-_])/i.test(expected.stackName), "expected stack must be explicitly non-production");
  requireEvidence(Number.isFinite(maxAgeHours) && maxAgeHours >= 1 && maxAgeHours <= 168, "max evidence age must be 1-168 hours");
  for (const name of REQUIRED_DOCUMENTS) requireEvidence(documents?.[name], `${name} evidence is missing`);

  const attestation = documents.attestation;
  requireEvidence(attestation?.schemaVersion === 1, "attestation schemaVersion is not 1");
  requireEvidence(attestation?.accountId === expected.accountId, "attestation account mismatch");
  requireEvidence(attestation?.region === expected.region, "attestation region mismatch");
  requireEvidence(attestation?.stack?.name === expected.stackName, "attestation stack mismatch");
  requireEvidence(attestation?.application?.ready === true, "attestation readiness is not green");
  requireEvidence(attestation?.runtimeAuthority?.mode === "normalized", "attestation authority is not normalized");
  requireEvidence(attestation?.supplyChain?.sourceRevision === expected.sourceRevision, "attestation source revision mismatch");
  requireEvidence(Number(attestation?.supplyChain?.criticalFindings) === 0, "attestation has critical image findings");
  requireEvidence(Number(attestation?.supplyChain?.highFindings) === 0, "attestation has high image findings");
  requireEvidence(attestation?.supplyChain?.imageScanStatus === "COMPLETE", "attestation image scan is incomplete");
  requireEvidence(attestation?.supplyChain?.rolloutState === "COMPLETED", "attestation rollout is incomplete");
  const canonicalTaskDefinition = String(attestation?.supplyChain?.taskDefinitionArn || "");
  const canonicalImage = String(attestation?.supplyChain?.containerImage || "");
  requireEvidence(canonicalTaskDefinition.includes(`:${expected.accountId}:task-definition/`), "canonical task definition is outside the expected account");
  requireEvidence(canonicalImage.includes(`${expected.accountId}.dkr.ecr.${expected.region}.amazonaws.com/`)
    && /@sha256:[0-9a-f]{64}$/.test(canonicalImage), "canonical container image is not an account-bound digest");

  const times = {
    attestation: assertFresh(attestation.generatedAt, "attestation", { now, maxAgeHours }),
  };

  const promotion = documents.promotion;
  assertCommon(promotion, "promotion", expected, canonicalTaskDefinition, { skipTask: true });
  requireEvidence(promotion.normalizedTaskDefinitionArn === canonicalTaskDefinition, "promotion normalized task definition mismatch");
  requireEvidence(promotion.containerImage === canonicalImage, "promotion image mismatch");
  requireEvidence(promotion.authorityModeAfter === "normalized", "promotion did not finish in normalized authority");
  for (const [field, label] of [
    ["quiescenceResult", "preparation quiescence"],
    ["serviceResumeResult", "preparation service recovery"],
    ["cutoverQuiescenceResult", "cutover quiescence"],
    ["finalReconciliationResult", "final reconciliation"],
  ]) requireEvidence(promotion[field] === "passed", `promotion ${label} did not pass`);
  requireEvidence(promotion.rollbackResult === "not-required", "promotion required rollback");
  times.promotion = assertFresh(promotion.capturedAt, "promotion", { now, maxAgeHours });

  const multiTask = documents.multiTask;
  assertCommon(multiTask, "multi-task", expected, canonicalTaskDefinition);
  requireEvidence(multiTask.containerImage === canonicalImage, "multi-task image mismatch");
  requireEvidence(Number(multiTask.expectedWorkers) === 2, "multi-task evidence did not require two workers");
  requireEvidence(allExitZero(asArray(multiTask.setupTasks)), "multi-task setup task failed");
  requireEvidence(asArray(multiTask.workerTasks).length === 2 && allExitZero(multiTask.workerTasks), "multi-task workers did not both pass");
  requireEvidence(allExitZero(asArray(multiTask.assertionTasks)), "multi-task assertion task failed");
  times.multiTask = assertFresh(multiTask.capturedAt, "multi-task", { now, maxAgeHours });

  const soak = documents.httpSoak;
  assertCommon(soak, "HTTP soak", expected, canonicalTaskDefinition);
  requireEvidence(soak.authorityMode === "normalized", "HTTP soak authority is not normalized");
  requireEvidence(soak.serviceRestored === true && soak.fixtureCleaned === true, "HTTP soak did not restore service and fixtures");
  requireEvidence(asArray(soak.workerTaskArns).length === 2, "HTTP soak did not use two workers");
  requireEvidence(asArray(soak.activeAlarms).length === 0, "HTTP soak recorded active alarms");
  times.httpSoak = assertFresh(soak.capturedAt, "HTTP soak", { now, maxAgeHours });

  const operational = documents.operationalRecovery;
  assertCommon(operational, "operational recovery", expected, canonicalTaskDefinition);
  requireEvidence(operational.authorityMode === "normalized", "operational recovery authority is not normalized");
  requireEvidence(asArray(operational.tasks).length === 3 && allExitZero(operational.tasks), "operational recovery tasks did not all pass");
  requireEvidence(operational?.serviceBefore?.taskDefinition === canonicalTaskDefinition
    && operational?.serviceAfter?.taskDefinition === canonicalTaskDefinition, "operational recovery changed the task definition");
  times.operationalRecovery = assertFresh(operational.capturedAt, "operational recovery", { now, maxAgeHours });

  const backup = documents.backupRestore;
  assertCommon(backup, "backup restore", expected, canonicalTaskDefinition);
  requireEvidence(backup.containerImage === canonicalImage, "backup restore image mismatch");
  requireEvidence(backup.snapshotEncrypted === true && backup.restoredStorageEncrypted === true, "backup restore encryption proof is missing");
  requireEvidence(backup.restoredPubliclyAccessible === false, "backup restore clone was publicly accessible");
  requireEvidence(backup.cleanup === "completed", "backup restore cleanup did not complete");
  times.backupRestore = assertFresh(backup.capturedAt, "backup restore", { now, maxAgeHours });

  const rds = documents.rdsFailover;
  assertCommon(rds, "RDS failover", expected, canonicalTaskDefinition);
  requireEvidence(rds.markerCleaned === true, "RDS failover marker cleanup did not complete");
  requireEvidence(rds.availabilityZoneBefore && rds.availabilityZoneAfter
    && rds.availabilityZoneBefore !== rds.availabilityZoneAfter, "RDS failover did not change Availability Zone");
  requireEvidence(rds.observedReadinessFailure === true, "RDS failover did not observe fail-closed readiness");
  times.rdsFailover = assertFresh(rds.capturedAt, "RDS failover", { now, maxAgeHours });

  const redis = documents.redisFailover;
  assertCommon(redis, "Redis failover", expected, canonicalTaskDefinition);
  requireEvidence(redis.primaryBefore && redis.primaryAfter && redis.primaryBefore !== redis.primaryAfter, "Redis primary did not change");
  requireEvidence(redis.observedReadinessFailure === true, "Redis failover did not observe fail-closed readiness");
  times.redisFailover = assertFresh(redis.capturedAt, "Redis failover", { now, maxAgeHours });

  const rollback = documents.ecsRollback;
  requireEvidence(rollback?.schemaVersion === 1 && rollback?.result === "passed", "ECS rollback did not pass");
  requireEvidence(rollback.accountId === expected.accountId && rollback.region === expected.region
    && rollback.stackName === expected.stackName, "ECS rollback deployment boundary mismatch");
  requireEvidence(rollback?.current?.sourceRevision === expected.sourceRevision, "ECS rollback current revision mismatch");
  requireEvidence(rollback?.current?.taskDefinitionArn === canonicalTaskDefinition
    && rollback?.current?.containerImage === canonicalImage, "ECS rollback current release mismatch");
  requireEvidence(rollback?.restoration?.attempted === true && rollback?.restoration?.completed === true, "ECS rollback did not restore the current release");
  times.ecsRollback = assertFresh(rollback.capturedAt, "ECS rollback", { now, maxAgeHours });

  const provider = documents.providerReconciliation;
  requireEvidence(provider?.schemaVersion === 1 && provider?.evidenceType === "razorpay-reconciliation"
    && provider?.result === "passed", "Razorpay reconciliation did not pass");
  requireEvidence(provider.accountId === expected.accountId && provider.stackName === expected.stackName
    && provider.sourceRevision === expected.sourceRevision && provider.provider === "Razorpay", "Razorpay evidence binding mismatch");
  requireEvidence(["test", "live"].includes(provider.providerMode) && provider.currency === "INR", "Razorpay mode or currency is invalid");
  requireEvidence(Number(provider.ordersCompared) >= 2 && Number(provider.settlementsCompared) >= 1
    && Number(provider.refundsCompared) >= 1 && Number(provider.disputesCompared) >= 1, "Razorpay scenario coverage is incomplete");
  requireEvidence(Number(provider.monetaryVarianceCents) === 0 && Number(provider.unmatchedProviderRecords) === 0
    && Number(provider.unmatchedNalandaRecords) === 0, "Razorpay reconciliation has a variance or unmatched records");
  requireEvidence(provider.replayProtectionVerified === true && provider.crossOrderBindingVerified === true
    && provider.refundParityVerified === true && provider.disputeHandlingVerified === true
    && provider.settlementParityVerified === true, "Razorpay control verification is incomplete");
  requireEvidence(typeof provider.reviewedBy === "string" && provider.reviewedBy.length >= 3
    && asArray(provider.evidenceReferences).length > 0, "Razorpay review evidence is incomplete");
  times.providerReconciliation = assertFresh(provider.capturedAt, "Razorpay reconciliation", { now, maxAgeHours });

  const privacy = documents.privacyApproval;
  requireEvidence(privacy?.schemaVersion === 1 && privacy?.evidenceType === "privacy-retention-approval"
    && privacy?.result === "approved", "privacy approval is missing");
  requireEvidence(privacy.accountId === expected.accountId && privacy.stackName === expected.stackName
    && privacy.sourceRevision === expected.sourceRevision, "privacy approval release binding mismatch");
  requireEvidence(typeof privacy.policyVersion === "string" && privacy.policyVersion.length > 0, "privacy policy version is missing");
  requireEvidence(privacy.retentionScheduleApproved === true && privacy.erasureWorkflowApproved === true
    && privacy.legalHoldProcessApproved === true, "privacy approval coverage is incomplete");
  requireEvidence(typeof privacy.approvedBy === "string" && privacy.approvedBy.length >= 3
    && typeof privacy.approverRole === "string" && privacy.approverRole.length >= 3
    && asArray(privacy.evidenceReferences).length > 0, "privacy approver evidence is incomplete");
  times.privacyApproval = assertFresh(privacy.capturedAt, "privacy approval", { now, maxAgeHours });

  requireEvidence(times.multiTask <= times.promotion, "multi-task evidence was captured after promotion evidence");
  requireEvidence(times.httpSoak <= times.promotion, "HTTP soak evidence was captured after promotion evidence");
  requireEvidence(times.attestation <= times.promotion, "final attestation was captured after promotion evidence");
  for (const name of ["operationalRecovery", "backupRestore", "rdsFailover", "redisFailover", "ecsRollback", "providerReconciliation"]) {
    requireEvidence(times[name] >= times.promotion, `${name} evidence predates normalized promotion`);
  }
  for (const name of REQUIRED_DOCUMENTS) {
    requireEvidence(/^[a-f0-9]{64}$/.test(String(hashes[name] || "")), `${name} evidence hash is missing or invalid`);
  }

  return {
    schemaVersion: 1,
    decision: "GO",
    evaluatedAt: new Date(now).toISOString(),
    maxEvidenceAgeHours: maxAgeHours,
    accountId: expected.accountId,
    region: expected.region,
    stackName: expected.stackName,
    sourceRevision: expected.sourceRevision,
    taskDefinitionArn: canonicalTaskDefinition,
    containerImage: canonicalImage,
    evidenceSha256: Object.fromEntries(REQUIRED_DOCUMENTS.map((name) => [name, hashes[name] || null])),
    gates: Object.fromEntries(REQUIRED_DOCUMENTS.map((name) => [name, "passed"])),
  };
}

const parseArguments = (argv) => {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) reject(`invalid CLI argument near ${key || "end"}`);
    values[key.slice(2)] = value;
  }
  return values;
};

const cliDocumentArguments = {
  attestation: "attestation",
  promotion: "promotion",
  multiTask: "multi-task",
  httpSoak: "http-soak",
  operationalRecovery: "operational-recovery",
  backupRestore: "backup-restore",
  rdsFailover: "rds-failover",
  redisFailover: "redis-failover",
  ecsRollback: "ecs-rollback",
  providerReconciliation: "provider-reconciliation",
  privacyApproval: "privacy-approval",
};

const readDocument = (filePath, label) => {
  const resolved = path.resolve(filePath || "");
  requireEvidence(fs.existsSync(resolved) && fs.statSync(resolved).isFile(), `${label} file is unavailable`);
  requireEvidence(fs.statSync(resolved).size <= MAX_EVIDENCE_BYTES, `${label} file exceeds 2 MiB`);
  const bytes = fs.readFileSync(resolved);
  let document;
  try { document = JSON.parse(bytes.toString("utf8")); } catch { reject(`${label} is not valid JSON`); }
  return { document, hash: crypto.createHash("sha256").update(bytes).digest("hex") };
};

export function evaluateReleaseEvidenceFiles({
  expected,
  paths,
  outputPath,
  maxAgeHours = 72,
  now = Date.now(),
}) {
  requireEvidence(outputPath, "output path is required");
  const documents = {};
  const hashes = {};
  for (const name of REQUIRED_DOCUMENTS) {
    requireEvidence(paths?.[name], `${name} evidence path is required`);
    const loaded = readDocument(paths[name], name);
    documents[name] = loaded.document;
    hashes[name] = loaded.hash;
  }
  const result = evaluateReleaseEvidence({ expected, documents, hashes, maxAgeHours, now });
  const resolvedOutputPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });
  fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(result, null, 2)}\n`, { flag: "wx" });
  return { result, outputPath: resolvedOutputPath };
}

const runCli = () => {
  const args = parseArguments(process.argv.slice(2));
  const expected = {
    accountId: args["account-id"],
    region: args.region,
    stackName: args.stack,
    sourceRevision: args["source-revision"],
  };
  requireEvidence(args.output, "--output is required");
  const paths = {};
  for (const [name, argument] of Object.entries(cliDocumentArguments)) {
    requireEvidence(args[argument], `--${argument} is required`);
    paths[name] = args[argument];
  }
  const { outputPath } = evaluateReleaseEvidenceFiles({
    expected,
    paths,
    outputPath: args.output,
    maxAgeHours: Number(args["max-age-hours"] || 72),
  });
  console.log(`Production release evidence passed: ${outputPath}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { runCli(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
