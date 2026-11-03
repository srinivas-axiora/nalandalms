import assert from "node:assert/strict";
import crypto from "node:crypto";
import { withTransaction, closePool } from "./pool.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for certificate verification");
}

process.env.CERTIFICATE_ISSUANCE_APPROVAL_ROLE ||= "Admin";
process.env.CERTIFICATE_SIGNING_SECRET ||= crypto.randomBytes(48).toString("hex");

const [{ createCertificatesPgRepository }, { createCertificatesService }] = await Promise.all([
  import("../repositories/certificates.repository.pg.js"),
  import("../modules/certificates/certificates.service.js"),
]);

const suffix = crypto.randomBytes(6).toString("hex");
const ownerId = `VERIFY-CERT-OWNER-${suffix}`;
const learnerId = `VERIFY-CERT-LEARNER-${suffix}`;
const courseId = `VERIFY-CERT-COURSE-${suffix}`;
const assessmentId = `VERIFY-CERT-ASSESSMENT-${suffix}`;
const enrollmentId = `VERIFY-CERT-ENROLLMENT-${suffix}`;
const attemptId = `VERIFY-CERT-ATTEMPT-${suffix}`;
const checks = [];

const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = {
      query: client.query.bind(client),
      withTransaction: (fn) => fn(client),
    };
    const repository = createCertificatesPgRepository(db);
    const service = createCertificatesService({
      repo: repository,
      audit: () => {
        throw new Error("Relational certificate mutations must audit in the database transaction");
      },
      now: () => new Date().toISOString(),
    });
    const actor = { id: ownerId, name: "Certificate verifier admin", role: "Admin" };

    const existingCredentials = await repository.listAll();
    const existingVerification = await Promise.all(
      existingCredentials.map((credential) => service.verify(credential.id))
    );
    ok(
      "existing credential signatures reconcile with the configured key",
      existingVerification.every((result) => result.data?.isValidSignature === true)
    );
    const bindingState = await client.query(
      `SELECT
         (SELECT count(*)::integer
          FROM enrollments e
          LEFT JOIN issued_certificates c ON c.id = e.certificate_id
          WHERE e.status = 'Certified'
            AND (e.certificate_id IS NULL OR c.id IS NULL OR c.status <> 'Active'))
           AS invalid_enrollments,
         (SELECT count(*)::integer
          FROM issued_certificates c
          LEFT JOIN enrollments e
            ON e.user_id = c.employee_id AND e.course_id = c.course_id
          WHERE c.status = 'Active'
            AND (e.certificate_id IS DISTINCT FROM c.id OR e.status <> 'Certified'))
           AS unbound_certificates`
    );
    ok(
      "existing active credentials and certified enrollments are mutually bound",
      bindingState.rows[0]?.invalid_enrollments === 0
        && bindingState.rows[0]?.unbound_certificates === 0
    );

    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES ($1, 'Certificate verifier admin', $2, 'Admin', 'Active'),
              ($3, 'Certificate verifier learner', $4, 'Learner', 'Active')`,
      [ownerId, `${ownerId}@example.invalid`, learnerId, `${learnerId}@example.invalid`]
    );
    await client.query(
      `INSERT INTO courses (
         id, title, description, skill, owner_id, status, approval, estimated_hours
       ) VALUES (
         $1, 'Certificate authority verification', 'Synthetic live database check',
         'Application Security', $2, 'Active', 'Approved', 12
       )`,
      [courseId, ownerId]
    );
    await client.query(
      `INSERT INTO assessments (
         id, course_id, title, type, duration_minutes, pass_score,
         approval, status, owner_id
       ) VALUES ($1, $2, 'Certificate evidence assessment', 'MCQ', 30, 70, 'Approved', 'Active', $3)`,
      [assessmentId, courseId, ownerId]
    );
    await client.query(
      `INSERT INTO enrollments (id, course_id, user_id, assigned_by, status, progress)
       VALUES ($1, $2, $3, $4, 'Passed', 100)`,
      [enrollmentId, courseId, learnerId, ownerId]
    );
    await client.query(
      `INSERT INTO assessment_attempts (
         id, assessment_id, course_id, user_id, status, score, max_score,
         trust_score, submitted_at, evaluated_by
       ) VALUES ($1, $2, $3, $4, 'Passed', 92, 100, 88, now(), $5)`,
      [attemptId, assessmentId, courseId, learnerId, ownerId]
    );

    const issued = await service.issue(actor, {
      employeeId: learnerId,
      courseId,
      attemptId,
      title: "Verified certificate authority credential",
    });
    ok(
      "eligible issuance commits a signed active credential",
      issued.status === 201
        && issued.data?.attemptId === attemptId
        && issued.data?.status === "Active"
        && /^[a-f0-9]{64}$/.test(issued.data?.signature || "")
    );

    const repeated = await service.issue(actor, {
      employeeId: learnerId,
      courseId,
      attemptId,
      title: "Repeated issue request",
    });
    ok(
      "issuance is idempotent under the subject-course lock",
      repeated.status === 200 && repeated.data?.id === issued.data.id
    );

    const enrollmentAfterIssue = await client.query(
      "SELECT status, certificate_id FROM enrollments WHERE id = $1",
      [enrollmentId]
    );
    ok(
      "issuance and enrollment certification share one transaction",
      enrollmentAfterIssue.rows[0]?.status === "Certified"
        && enrollmentAfterIssue.rows[0]?.certificate_id === issued.data.id
    );

    const verified = await service.verify(issued.data.id);
    ok(
      "public verification validates active signed evidence",
      verified.status === 200
        && verified.data?.verified === true
        && verified.data?.isValidSignature === true
    );

    const revoked = await service.revoke(
      actor,
      issued.data.id,
      "Synthetic live verifier revocation"
    );
    ok(
      "revocation records durable reason and actor",
      revoked.status === 200
        && revoked.data?.status === "Revoked"
        && revoked.data?.revokedBy === ownerId
        && Boolean(revoked.data?.revokedAt)
    );

    const enrollmentAfterRevoke = await client.query(
      "SELECT status, certificate_id FROM enrollments WHERE id = $1",
      [enrollmentId]
    );
    const inactive = await service.verify(issued.data.id);
    ok(
      "revocation rolls enrollment back and verification fails closed",
      enrollmentAfterRevoke.rows[0]?.status === "Passed"
        && enrollmentAfterRevoke.rows[0]?.certificate_id === null
        && inactive.data?.verified === false
        && inactive.data?.isActive === false
        && inactive.data?.isValidSignature === true
    );

    const audits = await client.query(
      `SELECT action FROM audit_logs
       WHERE entity_type = 'CERTIFICATE' AND entity_id = $1
       ORDER BY created_at`,
      [issued.data.id]
    );
    ok(
      "issuance and revocation emit transactional audit evidence",
      audits.rows.some(({ action }) => action === "ISSUE_CERTIFICATE")
        && audits.rows.some(({ action }) => action === "REVOKE_CERTIFICATE")
    );

    await client.query("DELETE FROM audit_logs WHERE entity_id = $1", [issued.data.id]);
    await client.query("DELETE FROM issued_certificates WHERE id = $1", [issued.data.id]);
    await client.query("DELETE FROM assessment_attempts WHERE id = $1", [attemptId]);
    await client.query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]);
    await client.query("DELETE FROM assessments WHERE id = $1", [assessmentId]);
    await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[ownerId, learnerId]]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Certificate-authority verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
