import { query, withTransaction } from "../db/pool.js";

const iso = (value) => (value instanceof Date ? value.toISOString() : value);

export const mapCertificate = (row) => row && ({
  id: row.id,
  certificateId: row.id,
  employeeId: row.employee_id,
  recipientName: row.recipient_name,
  recipientEmail: row.recipient_email,
  courseId: row.course_id,
  courseTitle: row.course_title,
  attemptId: row.attempt_id || null,
  title: row.title,
  template: row.template,
  accent: row.accent,
  duration: row.duration,
  subtitle: row.subtitle,
  footer: row.footer,
  issuedBy: row.issued_by,
  issuedByName: row.issued_by_name,
  issuedAt: iso(row.issued_at),
  proctoringVerified: Boolean(row.proctoring_verified),
  examScore: row.exam_score === null ? null : Number(row.exam_score),
  signatureVersion: Number(row.signature_version || 1),
  signature: row.signature,
  verificationUrl: row.verification_url,
  linkedinShareUrl: row.linkedin_share_url,
  status: row.status,
  revokedBy: row.revoked_by || null,
  revokedAt: row.revoked_at ? iso(row.revoked_at) : null,
  revocationReason: row.revocation_reason || null,
});

export class CertificateRepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CertificateRepositoryError";
    this.code = code;
  }
}

const fail = (code, message) => {
  throw new CertificateRepositoryError(code, message);
};

const audit = (client, actorId, action, certificateId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, 'CERTIFICATE', $3, $4::jsonb)`,
  [actorId, action, certificateId, JSON.stringify(metadata)]
);

export function createCertificatesPgRepository(db = { query, withTransaction }) {
  const findById = async (id, client = db) => {
    const { rows } = await client.query(
      "SELECT * FROM issued_certificates WHERE id = $1 LIMIT 1",
      [id]
    );
    return mapCertificate(rows[0]);
  };

  const listAll = async () => {
    const { rows } = await db.query("SELECT * FROM issued_certificates ORDER BY issued_at DESC");
    return rows.map(mapCertificate);
  };

  const findUser = async (id) => {
    const { rows } = await db.query(
      "SELECT id, name, email::text AS email, role::text AS role, status::text AS status FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  };

  const findCourse = async (id) => {
    const { rows } = await db.query(
      `SELECT id, title, skill, thumbnail_color AS "thumbnailColor",
              estimated_hours AS "estimatedHours", owner_id AS "ownerId"
       FROM courses WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  };

  const listForUser = async (user) => {
    const params = [user.id];
    let predicate = "";
    if (["Super Admin", "Admin", "InstituteAdmin"].includes(user.role)) {
      params.length = 0;
    } else if (user.role === "Manager") {
      predicate = "WHERE c.employee_id = $1 OR recipient.manager_id = $1";
    } else if (user.role === "Instructor") {
      predicate = "WHERE c.employee_id = $1 OR course.owner_id = $1";
    } else {
      predicate = "WHERE c.employee_id = $1";
    }
    const { rows } = await db.query(
      `SELECT c.* FROM issued_certificates c
       JOIN users recipient ON recipient.id = c.employee_id
       JOIN courses course ON course.id = c.course_id
       ${predicate}
       ORDER BY c.issued_at DESC`,
      params
    );
    return rows.map(mapCertificate);
  };

  const resolveEligibility = async ({ employeeId, courseId, attemptId = null, automatic = false }) => {
    const enrollmentResult = await db.query(
      "SELECT status FROM enrollments WHERE user_id = $1 AND course_id = $2",
      [employeeId, courseId]
    );
    const enrollment = enrollmentResult.rows[0] || null;
    if (!enrollment) return { eligible: false, reason: "ENROLLMENT_NOT_FOUND", attempt: null };
    const params = [employeeId, courseId];
    let sql = `SELECT * FROM assessment_attempts
      WHERE user_id = $1 AND course_id = $2 AND status = 'Passed'`;
    if (attemptId) {
      params.push(attemptId);
      sql += " AND id = $3";
    }
    sql += " ORDER BY submitted_at DESC NULLS LAST LIMIT 1";
    const attemptResult = await db.query(sql, params);
    const attempt = attemptResult.rows[0] || null;
    const eligible = automatic
      ? Boolean(attempt)
      : Boolean(attempt || ["Passed", "Certified"].includes(enrollment.status));
    return {
      eligible,
      reason: eligible ? null : "NOT_ELIGIBLE",
      attempt: attempt && {
        id: attempt.id,
        score: attempt.score === null ? null : Number(attempt.score),
        trustScore: Number(attempt.trust_score ?? 100),
        status: attempt.status,
      },
    };
  };

  const issueEligible = async ({ certificate, automatic = false }) =>
    db.withTransaction(async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
        [`certificate:${certificate.employeeId}:${certificate.courseId}`]
      );
      const existingResult = await client.query(
        `SELECT * FROM issued_certificates
         WHERE employee_id = $1 AND course_id = $2 AND status = 'Active'
         ORDER BY issued_at DESC LIMIT 1`,
        [certificate.employeeId, certificate.courseId]
      );
      if (existingResult.rows[0]) {
        return { certificate: mapCertificate(existingResult.rows[0]), created: false };
      }

      const enrollmentResult = await client.query(
        `SELECT * FROM enrollments
         WHERE user_id = $1 AND course_id = $2
         FOR UPDATE`,
        [certificate.employeeId, certificate.courseId]
      );
      const enrollment = enrollmentResult.rows[0];
      if (!enrollment) fail("ENROLLMENT_NOT_FOUND", "Enrollment not found");

      const attemptParams = [certificate.employeeId, certificate.courseId];
      let attemptSql = `SELECT * FROM assessment_attempts
        WHERE user_id = $1 AND course_id = $2 AND status = 'Passed'`;
      if (certificate.attemptId) {
        attemptParams.push(certificate.attemptId);
        attemptSql += " AND id = $3";
      }
      attemptSql += " ORDER BY submitted_at DESC NULLS LAST LIMIT 1";
      const attemptResult = await client.query(attemptSql, attemptParams);
      const attempt = attemptResult.rows[0] || null;
      const enrollmentPassed = ["Passed", "Certified"].includes(enrollment.status);
      if ((automatic && !attempt) || (!automatic && !attempt && !enrollmentPassed)) {
        fail("NOT_ELIGIBLE", "Verified completion is required before certificate issuance");
      }

      const finalCertificate = {
        ...certificate,
        attemptId: attempt?.id || certificate.attemptId || null,
        proctoringVerified: Boolean(attempt && Number(attempt.trust_score ?? 100) >= 70),
        examScore: attempt?.score === null || attempt?.score === undefined ? null : Number(attempt.score),
      };
      if (
        finalCertificate.proctoringVerified !== certificate.proctoringVerified
        || finalCertificate.examScore !== certificate.examScore
        || finalCertificate.attemptId !== (certificate.attemptId || null)
      ) {
        fail("EVIDENCE_CHANGED", "Certificate evidence changed before issuance; retry");
      }
      const inserted = await client.query(
        `INSERT INTO issued_certificates (
           id, employee_id, course_id, attempt_id, recipient_name,
           recipient_email, course_title, title, template, accent, duration,
           subtitle, footer, issued_by, issued_by_name, html_snapshot,
           proctoring_verified, exam_score, signature_version, signature, verification_url,
           linkedin_share_url, status, issued_at
         ) VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8, $9, $10, $11,
           $12, $13, $14, $15, '',
           $16, $17, $18, $19, $20,
           $21, 'Active', $22
         ) RETURNING *`,
        [
          finalCertificate.id, finalCertificate.employeeId, finalCertificate.courseId,
          finalCertificate.attemptId, finalCertificate.recipientName,
          finalCertificate.recipientEmail, finalCertificate.courseTitle,
          finalCertificate.title, finalCertificate.template, finalCertificate.accent,
          finalCertificate.duration, finalCertificate.subtitle, finalCertificate.footer,
          finalCertificate.issuedBy, finalCertificate.issuedByName,
          finalCertificate.proctoringVerified, finalCertificate.examScore,
          finalCertificate.signatureVersion, finalCertificate.signature,
          finalCertificate.verificationUrl, finalCertificate.linkedinShareUrl,
          finalCertificate.issuedAt,
        ]
      );
      await client.query(
        `UPDATE enrollments SET status = 'Certified', certificate_id = $3,
           completed_at = COALESCE(completed_at, $4)
         WHERE user_id = $1 AND course_id = $2`,
        [finalCertificate.employeeId, finalCertificate.courseId, finalCertificate.id, finalCertificate.issuedAt]
      );
      await audit(client, finalCertificate.issuedBy, automatic ? "AUTO_ISSUE_CERTIFICATE" : "ISSUE_CERTIFICATE", finalCertificate.id, {
        employeeId: finalCertificate.employeeId,
        courseId: finalCertificate.courseId,
        attemptId: finalCertificate.attemptId,
        proctoringVerified: finalCertificate.proctoringVerified,
      });
      return { certificate: mapCertificate(inserted.rows[0]), created: true };
    });

  const revoke = async ({ certificateId, actorId, reason }) =>
    db.withTransaction(async (client) => {
      const { rows } = await client.query(
        "SELECT * FROM issued_certificates WHERE id = $1 FOR UPDATE",
        [certificateId]
      );
      const current = rows[0];
      if (!current) fail("CERTIFICATE_NOT_FOUND", "Certificate ID not found");
      if (current.status === "Revoked") return mapCertificate(current);
      const revokedAt = new Date().toISOString();
      const updated = await client.query(
        `UPDATE issued_certificates SET status = 'Revoked', revoked_by = $2,
           revoked_at = $3, revocation_reason = $4
         WHERE id = $1 RETURNING *`,
        [certificateId, actorId, revokedAt, reason]
      );
      await client.query(
        `UPDATE enrollments SET status = 'Passed', certificate_id = NULL
         WHERE user_id = $1 AND course_id = $2 AND certificate_id = $3`,
        [current.employee_id, current.course_id, certificateId]
      );
      await audit(client, actorId, "REVOKE_CERTIFICATE", certificateId, { reason });
      return mapCertificate(updated.rows[0]);
    });

  return {
    isRelational: true,
    findById,
    listAll,
    findUser,
    findCourse,
    listForUser,
    resolveEligibility,
    issueEligible,
    revoke,
  };
}

export const certificatesPgRepository = createCertificatesPgRepository();
