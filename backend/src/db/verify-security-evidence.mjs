import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query } from "./pool.js";
import { securityEvidenceRepository } from "../repositories/security-evidence.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for security evidence verification");
}

const suffix = crypto.randomBytes(5).toString("hex");
const auditId = crypto.randomUUID();
const securityId = crypto.randomUUID();
const actorId = `VERIFY-EVIDENCE-${suffix}`;
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

try {
  const schema = await query(
    `SELECT
       to_regclass('public.audit_logs') IS NOT NULL AS audit_logs,
       to_regclass('public.security_events') IS NOT NULL AS security_events,
       to_regclass('public.uq_audit_logs_ingest_key') IS NOT NULL AS audit_idempotency,
       to_regclass('public.uq_security_events_ingest_key') IS NOT NULL AS security_idempotency,
       to_regclass('public.idx_security_events_created') IS NOT NULL AS security_ordering,
       EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_scrub_audit_metadata' AND NOT tgisinternal)
         AS audit_metadata_scrub,
       EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_scrub_security_metadata' AND NOT tgisinternal)
         AS security_metadata_scrub`,
  );
  ok("security evidence schema and indexes exist", Object.values(schema.rows[0] || {}).every(Boolean));

  const audit = await securityEvidenceRepository.appendAudit({
    id: auditId,
    actorId,
    action: "VERIFY_AUDIT_EVIDENCE",
    entityType: "SYSTEM",
    entityId: suffix,
    metadata: { synthetic: true, email: "must-not-persist@example.invalid", nested: { passwordHash: "must-not-persist" } },
  });
  ok("audit evidence is durable", audit?.id === auditId && audit.actorId === actorId);
  ok("audit metadata is recursively scrubbed", audit.metadata.synthetic === true
    && audit.metadata.email === undefined && audit.metadata.nested?.passwordHash === undefined);

  const duplicateAudit = await securityEvidenceRepository.appendAudit({
    id: auditId,
    actorId,
    action: "MUST_NOT_DUPLICATE",
    entityType: "SYSTEM",
    entityId: suffix,
    metadata: {},
  });
  ok("audit evidence ID is idempotent", duplicateAudit === undefined);

  const security = await securityEvidenceRepository.appendSecurityEvent({
    id: securityId,
    type: "VERIFY_SECURITY_EVIDENCE",
    actorId,
    ip: "127.0.0.1",
    method: "GET",
    path: "/verify/security-evidence",
    userAgent: "nalanda-verifier",
    requestId: suffix,
    metadata: { synthetic: true, candidateEmail: "must-not-persist@example.invalid" },
  });
  ok("security event is durable", security?.id === securityId && security.requestId === suffix);
  ok("security metadata is recursively scrubbed", security.metadata.synthetic === true
    && security.metadata.candidateEmail === undefined);

  const rows = await query(
    `SELECT
       (SELECT count(*) FROM audit_logs WHERE id = $1) AS audit_count,
       (SELECT count(*) FROM security_events WHERE id = $2) AS security_count`,
    [auditId, securityId],
  );
  ok("one row exists for each synthetic event", Number(rows.rows[0].audit_count) === 1 && Number(rows.rows[0].security_count) === 1);

  checks.forEach((check) => console.log(`ok - ${check}`));
  console.log(`Security evidence verification passed (${checks.length} checks).`);
} finally {
  await query("DELETE FROM security_events WHERE id = $1", [securityId]).catch(() => {});
  await query("DELETE FROM audit_logs WHERE id = $1", [auditId]).catch(() => {});
  await closePool();
}
