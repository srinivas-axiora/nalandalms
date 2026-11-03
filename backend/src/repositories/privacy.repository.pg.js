import crypto from "node:crypto";
import { query, withTransaction } from "../db/pool.js";
import { JWT_SECRET } from "../config.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const digest = (value) => crypto.createHash("sha256").update(String(value), "utf8").digest("hex");

export class PrivacyRepositoryError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "PrivacyRepositoryError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new PrivacyRepositoryError(code, message, details);
};

export const mapPrivacyRequest = (row) => row && ({
  id: row.id,
  userId: row.user_id,
  requestType: row.request_type,
  status: row.status,
  reason: row.reason,
  verificationMethod: row.verification_method,
  requestedAt: iso(row.requested_at),
  graceEndsAt: iso(row.grace_ends_at),
  reviewedBy: row.reviewed_by || null,
  reviewedAt: row.reviewed_at ? iso(row.reviewed_at) : null,
  reviewReason: row.review_reason || null,
  processingStartedAt: row.processing_started_at ? iso(row.processing_started_at) : null,
  completedAt: row.completed_at ? iso(row.completed_at) : null,
  cancelledAt: row.cancelled_at ? iso(row.cancelled_at) : null,
  legalHoldReason: row.legal_hold_reason || null,
  attempts: Number(row.attempts || 0),
  nextAttemptAt: row.next_attempt_at ? iso(row.next_attempt_at) : null,
  lastErrorCode: row.last_error_code || null,
  coverageVersion: row.coverage_version,
  completionEvidence: row.completion_evidence || {},
  version: Number(row.version || 0),
});

const audit = (client, actorId, action, entityId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, 'PRIVACY_REQUEST', $3, $4::jsonb)`,
  [actorId || null, action, entityId, JSON.stringify(metadata)]
);

export function createPrivacyPgRepository(
  db = { query, withTransaction },
  pseudonymSecret = process.env.PRIVACY_PSEUDONYM_SECRET || JWT_SECRET,
) {
  const pseudonymFor = (userId) => crypto
    .createHmac("sha256", pseudonymSecret)
    .update(`nalanda-privacy-v1:${userId}`, "utf8")
    .digest("hex");

  const requestErasure = async ({ id, userId, confirmEmail, reason, graceDays = 30 }) => {
    try {
      return await db.withTransaction(async (client) => {
        const userResult = await client.query(
          "SELECT id, email FROM users WHERE id = $1 FOR UPDATE",
          [userId]
        );
        const user = userResult.rows[0];
        if (!user || String(user.email).toLowerCase() !== String(confirmEmail).toLowerCase()) {
          fail("EMAIL_MISMATCH", "Provided confirmation email does not match account");
        }
        const existing = await client.query(
          `SELECT * FROM privacy_requests
           WHERE user_id = $1
             AND status IN ('PendingReview', 'Approved', 'Processing', 'Blocked', 'Failed')
           LIMIT 1 FOR UPDATE`,
          [userId]
        );
        if (existing.rows[0]) return { request: mapPrivacyRequest(existing.rows[0]), created: false };
        const inserted = await client.query(
          `INSERT INTO privacy_requests (
             id, user_id, reason, reason_sha256, requested_at, grace_ends_at
           ) VALUES (
             $1, $2, $3, $4, now(), now() + make_interval(days => $5)
           ) RETURNING *`,
          [id, userId, reason, digest(reason), graceDays]
        );
        await audit(client, userId, "PRIVACY_ERASURE_REQUESTED", id, { graceDays });
        return { request: mapPrivacyRequest(inserted.rows[0]), created: true };
      });
    } catch (error) {
      if (error?.code === "23505") {
        const { rows } = await db.query(
          `SELECT * FROM privacy_requests
           WHERE user_id = $1
             AND status IN ('PendingReview', 'Approved', 'Processing', 'Blocked', 'Failed')
           LIMIT 1`,
          [userId]
        );
        if (rows[0]) return { request: mapPrivacyRequest(rows[0]), created: false };
      }
      throw error;
    }
  };

  const getForUser = async (userId) => {
    const { rows } = await db.query(
      "SELECT * FROM privacy_requests WHERE user_id = $1 ORDER BY requested_at DESC LIMIT 1",
      [userId]
    );
    return mapPrivacyRequest(rows[0]);
  };

  const cancelForUser = async ({ userId }) => db.withTransaction(async (client) => {
    const current = await client.query(
      `SELECT * FROM privacy_requests
       WHERE user_id = $1
         AND status IN ('PendingReview', 'Approved', 'Blocked', 'Failed')
       ORDER BY requested_at DESC LIMIT 1 FOR UPDATE`,
      [userId]
    );
    if (!current.rows[0]) fail("NOT_CANCELLABLE", "No cancellable deletion request exists");
    const { rows } = await client.query(
      `UPDATE privacy_requests SET
         status = 'Cancelled', cancelled_at = now(), legal_hold_reason = NULL,
         next_attempt_at = NULL, last_error_code = NULL, version = version + 1
       WHERE id = $1 RETURNING *`,
      [current.rows[0].id]
    );
    await audit(client, userId, "PRIVACY_ERASURE_CANCELLED", rows[0].id);
    return mapPrivacyRequest(rows[0]);
  });

  const listRequests = async () => {
    const { rows } = await db.query(
      `SELECT request.*, user.name AS subject_name, user.email AS subject_email
       FROM privacy_requests request
       JOIN users user ON user.id = request.user_id
       ORDER BY request.requested_at DESC`
    );
    return rows.map((row) => ({
      ...mapPrivacyRequest(row),
      subjectName: row.subject_name,
      subjectEmail: row.subject_email,
    }));
  };

  const review = async ({ requestId, actorId, decision, reason }) => db.withTransaction(async (client) => {
    const current = await client.query(
      "SELECT * FROM privacy_requests WHERE id = $1 FOR UPDATE",
      [requestId]
    );
    const row = current.rows[0];
    if (!row) fail("REQUEST_NOT_FOUND", "Privacy request not found");
    if (!["PendingReview", "Approved", "Blocked", "Failed"].includes(row.status)) {
      fail("REQUEST_TERMINAL", "Privacy request can no longer be reviewed");
    }
    if (decision === "APPROVE") {
      const issuer = await client.query(
        "SELECT count(*)::integer AS count FROM issued_certificates WHERE issued_by = $1",
        [row.user_id]
      );
      if (Number(issuer.rows[0]?.count || 0) > 0) {
        fail(
          "ISSUER_REASSIGNMENT_REQUIRED",
          "Certificate issuer evidence must be reassigned before this request can be approved"
        );
      }
    }
    const nextStatus = decision === "HOLD" ? "Blocked" : "Approved";
    const { rows } = await client.query(
      `UPDATE privacy_requests SET
         status = $2, reviewed_by = $3, reviewed_at = now(), review_reason = $4,
         legal_hold_reason = $5, next_attempt_at = NULL, last_error_code = NULL,
         version = version + 1
       WHERE id = $1 RETURNING *`,
      [requestId, nextStatus, actorId, reason, decision === "HOLD" ? reason : null]
    );
    await audit(client, actorId, `PRIVACY_ERASURE_${decision}`, requestId, { status: nextStatus });
    return mapPrivacyRequest(rows[0]);
  });

  const claimDue = async () => db.withTransaction(async (client) => {
    const current = await client.query(
      `SELECT * FROM privacy_requests
       WHERE status IN ('Approved', 'Failed')
         AND grace_ends_at <= now()
         AND (next_attempt_at IS NULL OR next_attempt_at <= now())
       ORDER BY grace_ends_at, requested_at
       LIMIT 1 FOR UPDATE SKIP LOCKED`
    );
    const row = current.rows[0];
    if (!row) return null;

    await client.query(
      `UPDATE privacy_erasure_objects SET
         status = 'Pending', last_error_code = NULL, updated_at = now()
       WHERE request_id = $1 AND status = 'Failed'`,
      [row.id]
    );
    await client.query(
      `INSERT INTO privacy_erasure_objects (request_id, object_key, object_key_sha256)
       SELECT $1, source.object_key, encode(digest(source.object_key, 'sha256'), 'hex')
       FROM (
         SELECT chunk->>'key' AS object_key
         FROM assessment_attempts attempt
         CROSS JOIN LATERAL jsonb_array_elements(COALESCE(attempt.video_chunks, '[]'::jsonb)) chunk
         WHERE attempt.user_id = $2 AND length(COALESCE(chunk->>'key', '')) > 0
         UNION
         SELECT capture_key FROM proctoring_logs
         WHERE user_id = $2 AND length(COALESCE(capture_key, '')) > 0
         UNION
         SELECT storage_key FROM report_exports
         WHERE requested_by = $2 AND length(COALESCE(storage_key, '')) > 0
       ) source
       ON CONFLICT (request_id, object_key_sha256) DO NOTHING`,
      [row.id, row.user_id]
    );
    const { rows } = await client.query(
      `UPDATE privacy_requests SET
         status = 'Processing', processing_started_at = COALESCE(processing_started_at, now()),
         attempts = attempts + 1, next_attempt_at = NULL, last_error_code = NULL,
         version = version + 1
       WHERE id = $1 RETURNING *`,
      [row.id]
    );
    await audit(client, null, "PRIVACY_ERASURE_PROCESSING", row.id, {
      attempt: Number(rows[0].attempts),
      coverageVersion: row.coverage_version,
    });
    return mapPrivacyRequest(rows[0]);
  });

  const listObjectTasks = async (requestId) => {
    const { rows } = await db.query(
      `SELECT id, object_key, object_key_sha256, status, attempts
       FROM privacy_erasure_objects
       WHERE request_id = $1 AND status <> 'Deleted'
       ORDER BY id`,
      [requestId]
    );
    return rows.map((row) => ({
      id: row.id,
      objectKey: row.object_key,
      objectKeySha256: row.object_key_sha256,
      status: row.status,
      attempts: Number(row.attempts || 0),
    }));
  };

  const markObjectDeleted = async (id) => {
    await db.query(
      `UPDATE privacy_erasure_objects SET
         status = 'Deleted', object_key = NULL, deleted_at = now(),
         attempts = attempts + 1, last_error_code = NULL, updated_at = now()
       WHERE id = $1`,
      [id]
    );
  };

  const markObjectFailed = async (id, errorCode = "OBJECT_DELETE_FAILED") => {
    await db.query(
      `UPDATE privacy_erasure_objects SET
         status = 'Failed', attempts = attempts + 1,
         last_error_code = $2, updated_at = now()
       WHERE id = $1`,
      [id, errorCode]
    );
  };

  const markRetry = async ({ requestId, errorCode, retrySeconds = 300 }) => db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE privacy_requests SET
         status = 'Failed', last_error_code = $2,
         next_attempt_at = now() + make_interval(secs => $3),
         version = version + 1
       WHERE id = $1 AND status = 'Processing' RETURNING *`,
      [requestId, errorCode, retrySeconds]
    );
    if (rows[0]) await audit(client, null, "PRIVACY_ERASURE_RETRY_SCHEDULED", requestId, { errorCode });
    return mapPrivacyRequest(rows[0]);
  });

  const finalizeErasure = async (requestId) => db.withTransaction(async (client) => {
    const current = await client.query(
      "SELECT * FROM privacy_requests WHERE id = $1 FOR UPDATE",
      [requestId]
    );
    const request = current.rows[0];
    if (!request || request.status !== "Processing") {
      fail("REQUEST_NOT_PROCESSING", "Privacy request is not processing");
    }
    const incomplete = await client.query(
      "SELECT count(*)::integer AS count FROM privacy_erasure_objects WHERE request_id = $1 AND status <> 'Deleted'",
      [requestId]
    );
    if (Number(incomplete.rows[0]?.count || 0) > 0) {
      fail("OBJECTS_PENDING", "Privacy objects are not fully deleted");
    }
    const userResult = await client.query("SELECT * FROM users WHERE id = $1 FOR UPDATE", [request.user_id]);
    const user = userResult.rows[0];
    if (!user) fail("USER_NOT_FOUND", "Privacy subject no longer exists");
    const issuer = await client.query(
      "SELECT count(*)::integer AS count FROM issued_certificates WHERE issued_by = $1",
      [request.user_id]
    );
    if (Number(issuer.rows[0]?.count || 0) > 0) {
      const { rows } = await client.query(
        `UPDATE privacy_requests SET
           status = 'Blocked', legal_hold_reason = 'Certificate issuer reassignment required',
           last_error_code = 'ISSUER_REASSIGNMENT_REQUIRED', version = version + 1
         WHERE id = $1 RETURNING *`,
        [requestId]
      );
      await audit(client, null, "PRIVACY_ERASURE_BLOCKED", requestId, {
        errorCode: "ISSUER_REASSIGNMENT_REQUIRED",
      });
      return { request: mapPrivacyRequest(rows[0]), blocked: true };
    }

    const pseudonym = pseudonymFor(request.user_id);
    const pseudonymName = `Erased user ${pseudonym.slice(0, 12)}`;
    const pseudonymEmail = `erased+${pseudonym.slice(0, 24)}@privacy.invalid`;
    const counts = {};
    const mutate = async (name, sql, params = [request.user_id]) => {
      const result = await client.query(sql, params);
      counts[name] = result.rowCount || 0;
    };

    await mutate("enrollmentsDecertified",
      `UPDATE enrollments SET status = CASE WHEN status = 'Certified' THEN 'Passed' ELSE status END,
         certificate_id = NULL WHERE user_id = $1`);
    await mutate("certificatesDeleted", "DELETE FROM issued_certificates WHERE employee_id = $1");
    await mutate("answersDeleted",
      "DELETE FROM assessment_answers WHERE attempt_id IN (SELECT id FROM assessment_attempts WHERE user_id = $1)");
    await mutate("proctorLogsDeleted", "DELETE FROM proctoring_logs WHERE user_id = $1");
    await mutate("capturesDeleted", "DELETE FROM proctor_captures WHERE user_id = $1");
    await mutate("feedbackDeleted", "DELETE FROM chapter_feedbacks WHERE user_id = $1");
    await mutate("skillRatingsDeleted", "DELETE FROM skill_ratings WHERE user_id = $1");
    await mutate("learningEventsDeleted", "DELETE FROM learning_time_events WHERE user_id = $1");
    await mutate("reportsDeleted", "DELETE FROM report_exports WHERE requested_by = $1");
    await mutate("attemptsScrubbed",
      `UPDATE assessment_attempts SET
         answers = '{}'::jsonb, question_map = '{}'::jsonb, manual_grades = '{}'::jsonb,
         flags = '[]'::jsonb, warnings = '[]'::jsonb, video_chunks = '[]'::jsonb,
         companion = NULL, feedback = NULL, version = version + 1
       WHERE user_id = $1`);
    await mutate("candidateSubmissionsScrubbed",
      `UPDATE candidate_assessment_submissions SET
         candidate_name = $2,
         candidate_email = 'erased+' || substr(md5(id || $3), 1, 24) || '@privacy.invalid',
         answers = '{}'::jsonb, flags = '[]'::jsonb,
         evaluated_responses = '[]'::jsonb, category_breakdown = '{}'::jsonb,
         version = version + 1
       WHERE lower(candidate_email::text) = lower($4)`,
      [request.user_id, pseudonymName, pseudonym, String(user.email)]);
    await mutate("candidateLinksScrubbed",
      "UPDATE candidate_assessment_links SET created_by_name = $2, version = version + 1 WHERE created_by = $1",
      [request.user_id, pseudonymName]);
    await mutate("archivesDeleted",
      "DELETE FROM deleted_archives WHERE entity_type = 'User' AND entity_id = $1");
    await client.query(
      `UPDATE audit_logs SET metadata = metadata - 'email' - 'name' - 'candidateEmail'
       WHERE actor_id = $1 OR (entity_type = 'USER' AND entity_id = $1)`,
      [request.user_id]
    );
    await client.query("DELETE FROM login_security WHERE lower(email::text) = lower($1)", [String(user.email)]);
    await client.query(
      `UPDATE users SET
         name = $2, email = $3, password_hash = NULL, status = 'Inactive',
         preferences = '{}'::jsonb, team = 'Erased', designation = 'Erased',
         manager_id = NULL, last_login_at = NULL,
         session_version = session_version + 1, updated_at = now()
       WHERE id = $1`,
      [request.user_id, pseudonymName, pseudonymEmail]
    );

    const objectCount = await client.query(
      "SELECT count(*)::integer AS count FROM privacy_erasure_objects WHERE request_id = $1 AND status = 'Deleted'",
      [requestId]
    );
    const evidence = {
      policyVersion: "normalized-v1",
      subjectPseudonym: pseudonym.slice(0, 24),
      objectsDeleted: Number(objectCount.rows[0]?.count || 0),
      mutations: counts,
    };
    const { rows } = await client.query(
      `UPDATE privacy_requests SET
         status = 'Completed', completed_at = now(), reason = '[erased after completion]',
         review_reason = '[review completed]',
         legal_hold_reason = NULL, last_error_code = NULL, next_attempt_at = NULL,
         completion_evidence = $2::jsonb, version = version + 1
       WHERE id = $1 RETURNING *`,
      [requestId, JSON.stringify(evidence)]
    );
    await audit(client, null, "PRIVACY_ERASURE_COMPLETED", requestId, evidence);
    return { request: mapPrivacyRequest(rows[0]), blocked: false };
  });

  const exportUserData = async (userId) => {
    const profile = await db.query(
      `SELECT id, name, email, role, team, designation, status, preferences,
              joined_at, last_login_at, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (!profile.rows[0]) return null;
    const queries = await Promise.all([
      db.query("SELECT * FROM enrollments WHERE user_id = $1 ORDER BY started_at", [userId]),
      db.query(
        `SELECT id, assessment_id, chapter_id, course_id, status, score, max_score,
                feedback, answers, selected_question_ids, manual_grades, flags, warnings,
                trust_score, tab_switch_warnings, auto_submitted_reason,
                time_spent_seconds, started_at, submitted_at
         FROM assessment_attempts WHERE user_id = $1 ORDER BY started_at`,
        [userId]
      ),
      db.query("SELECT * FROM issued_certificates WHERE employee_id = $1 ORDER BY issued_at", [userId]),
      db.query("SELECT * FROM chapter_feedbacks WHERE user_id = $1 ORDER BY submitted_at", [userId]),
      db.query("SELECT * FROM skill_ratings WHERE user_id = $1 ORDER BY last_updated", [userId]),
      db.query("SELECT * FROM payment_transactions WHERE user_id = $1 ORDER BY created_at", [userId]),
      db.query(
        `SELECT id, link_id, candidate_name, candidate_email, started_at, submitted_at,
                status, answers, score, max_score, percentage, passed,
                proctoring_status, hiring_recommendation
         FROM candidate_assessment_submissions
         WHERE lower(candidate_email::text) = lower($1) ORDER BY started_at`,
        [String(profile.rows[0].email)]
      ),
      db.query(
        `SELECT action, entity_type, entity_id, created_at FROM audit_logs
         WHERE actor_id = $1 OR (entity_type = 'USER' AND entity_id = $1)
         ORDER BY created_at`,
        [userId]
      ),
    ]);
    return {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        platform: "Nalanda LMS",
        formatVersion: "2.0-PG-PRIVACY",
        userId,
      },
      profile: profile.rows[0],
      learning: { enrollments: queries[0].rows, examAttempts: queries[1].rows },
      credentials: queries[2].rows,
      interactions: { feedbacks: queries[3].rows, skillRatings: queries[4].rows },
      transactions: queries[5].rows,
      candidateAssessments: queries[6].rows,
      auditHistory: queries[7].rows,
    };
  };

  return {
    isRelational: true,
    requestErasure,
    getForUser,
    cancelForUser,
    listRequests,
    review,
    claimDue,
    listObjectTasks,
    markObjectDeleted,
    markObjectFailed,
    markRetry,
    finalizeErasure,
    exportUserData,
  };
}

export const privacyPgRepository = createPrivacyPgRepository();
