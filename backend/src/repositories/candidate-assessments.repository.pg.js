import crypto from "node:crypto";
import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
export const hashCandidateToken = (token) => crypto
  .createHash("sha256")
  .update(String(token || ""), "utf8")
  .digest("hex");

export class CandidateAssessmentRepositoryError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "CandidateAssessmentRepositoryError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new CandidateAssessmentRepositoryError(code, message, details);
};

export const mapCandidateSubmission = (row) => row && ({
  id: row.id,
  linkId: row.link_id,
  candidateName: row.candidate_name,
  candidateEmail: String(row.candidate_email),
  startedAt: iso(row.started_at),
  expiresAt: iso(row.expires_at),
  submittedAt: row.submitted_at ? iso(row.submitted_at) : null,
  expiredAt: row.expired_at ? iso(row.expired_at) : null,
  status: row.status === "InProgress" ? "In Progress" : row.status,
  trustScore: Number(row.trust_score),
  tabSwitchCount: Number(row.tab_switch_count),
  flags: row.flags || [],
  answers: row.answers || {},
  questionIds: row.question_ids || [],
  score: Number(row.score || 0),
  maxScore: Number(row.max_score || 0),
  percentage: Number(row.percentage || 0),
  passed: row.passed,
  requiresManualReview: Boolean(row.requires_manual_review),
  ignoredProctoring: Boolean(row.ignored_proctoring),
  proctoringStatus: row.proctoring_status,
  hiringRecommendation: row.hiring_recommendation,
  evaluatedResponses: row.evaluated_responses || [],
  categoryBreakdown: row.category_breakdown || {},
  autoSubmittedReason: row.auto_submitted_reason || null,
  timeSpentSeconds: Number(row.time_spent_seconds || 0),
  version: Number(row.version || 0),
});

export const mapCandidateLink = (row) => row && ({
  id: row.id,
  // Bearer material is intentionally not recoverable from PostgreSQL.
  token: null,
  tokenHint: row.token_hint,
  assessmentId: row.assessment_id,
  title: row.title,
  courseId: row.course_id,
  courseTitle: row.course_title,
  chapterId: row.chapter_id || null,
  durationMinutes: Number(row.duration_minutes),
  passScore: Number(row.pass_score),
  questionLimit: Number(row.question_limit),
  questionSnapshot: row.question_snapshot || [],
  proctoringRequired: Boolean(row.proctoring_required),
  fullscreenRequired: Boolean(row.fullscreen_required),
  tabSwitchAutoSubmit: Boolean(row.tab_switch_auto_submit),
  maxTabSwitches: Number(row.max_tab_switches),
  expiresAt: row.expires_at ? iso(row.expires_at) : null,
  status: row.status,
  createdBy: row.created_by,
  createdByName: row.created_by_name,
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
  version: Number(row.version || 0),
  submissions: [],
});

const audit = (client, actorId, action, entityId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, 'CANDIDATE_ASSESSMENT', $3, $4::jsonb)`,
  [actorId, action, entityId, JSON.stringify(metadata)]
);

export function createCandidateAssessmentsPgRepository(db = { query, withTransaction }) {
  const hydrate = async (row, client = db) => {
    if (!row) return null;
    const link = mapCandidateLink(row);
    const result = await client.query(
      `SELECT * FROM candidate_assessment_submissions
       WHERE link_id = $1 ORDER BY started_at DESC`,
      [row.id]
    );
    link.submissions = result.rows.map(mapCandidateSubmission);
    return link;
  };

  const findRowByIdentifier = async (identifier, client = db, lock = false) => {
    const suffix = lock ? " FOR UPDATE" : "";
    const { rows } = await client.query(
      `SELECT *, (expires_at IS NOT NULL AND expires_at <= now()) AS is_expired
       FROM candidate_assessment_links
       WHERE id = $1 OR token_hash = $2
       LIMIT 1${suffix}`,
      [identifier, hashCandidateToken(identifier)]
    );
    return rows[0] || null;
  };

  const findRowByToken = async (token, client = db, lock = false) => {
    const suffix = lock ? " FOR UPDATE" : "";
    const { rows } = await client.query(
      `SELECT *, (expires_at IS NOT NULL AND expires_at <= now()) AS is_expired
       FROM candidate_assessment_links
       WHERE token_hash = $1
       LIMIT 1${suffix}`,
      [hashCandidateToken(token)]
    );
    return rows[0] || null;
  };

  const findByIdentifier = async (identifier) => hydrate(await findRowByIdentifier(identifier));

  const findPublicByToken = async (token) => {
    const row = await findRowByToken(token);
    if (!row) return null;
    const link = mapCandidateLink(row);
    link.isExpired = Boolean(row.is_expired);
    return link;
  };

  const listForUser = async (user) => {
    const admin = ["Super Admin", "Admin", "InstituteAdmin"].includes(user.role);
    const { rows } = await db.query(
      `SELECT * FROM candidate_assessment_links
       ${admin ? "" : "WHERE created_by = $1"}
       ORDER BY created_at DESC`,
      admin ? [] : [user.id]
    );
    return Promise.all(rows.map((row) => hydrate(row)));
  };

  const createLink = async ({ link, token, questions }) => db.withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO candidate_assessment_links (
         id, token_hash, token_hint, assessment_id, title, course_id,
         course_title, chapter_id, duration_minutes, pass_score, question_limit,
         question_snapshot, proctoring_required, fullscreen_required,
         tab_switch_auto_submit, max_tab_switches, expires_at, status,
         created_by, created_by_name, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11,
         $12::jsonb, $13, $14,
         $15, $16, $17, 'Active',
         $18, $19, $20, $20
       ) RETURNING *`,
      [
        link.id, hashCandidateToken(token), token.slice(-8), link.assessmentId,
        link.title, link.courseId, link.courseTitle, link.chapterId,
        link.durationMinutes, link.passScore, link.questionLimit,
        JSON.stringify(questions), link.proctoringRequired,
        link.fullscreenRequired, link.tabSwitchAutoSubmit,
        link.maxTabSwitches, link.expiresAt, link.createdBy,
        link.createdByName, link.createdAt,
      ]
    );
    await audit(client, link.createdBy, "CREATE_CANDIDATE_ASSESSMENT", link.id, {
      assessmentId: link.assessmentId,
      expiresAt: link.expiresAt,
    });
    return mapCandidateLink(inserted.rows[0]);
  });

  const startSubmission = async ({ token, attemptToken, submission, graceSeconds }) => {
    try {
      return await db.withTransaction(async (client) => {
        const linkRow = await findRowByToken(token, client, true);
        if (!linkRow) fail("LINK_NOT_FOUND", "Assessment link not found");
        if (linkRow.status !== "Active") fail("LINK_CLOSED", "This assessment link is currently closed");
        if (linkRow.is_expired) fail("LINK_EXPIRED", "This assessment link has expired");

        const duplicate = await client.query(
          `SELECT status, submitted_at FROM candidate_assessment_submissions
           WHERE link_id = $1 AND candidate_email = $2
           LIMIT 1`,
          [linkRow.id, submission.candidateEmail]
        );
        if (duplicate.rows[0]) {
          fail(
            "DUPLICATE_EMAIL",
            duplicate.rows[0].submitted_at
              ? "An assessment has already been submitted using this email ID"
              : "An active assessment session already exists for this email ID. Only one attempt is permitted",
            { submittedAt: duplicate.rows[0].submitted_at ? iso(duplicate.rows[0].submitted_at) : null }
          );
        }

        const questions = (linkRow.question_snapshot || []).slice(0, Number(linkRow.question_limit));
        if (!questions.length) fail("QUESTIONS_MISSING", "Assessment questions are not configured");
        const questionIds = questions.map((item, index) => item.id || `Q-${index + 1}`);
        const maxScore = questions.reduce((sum, item) => sum + Number(item.points || 1), 0);
        const inserted = await client.query(
          `INSERT INTO candidate_assessment_submissions (
             id, link_id, attempt_token_hash, candidate_name, candidate_email,
             started_at, expires_at, status, question_ids, max_score
           ) VALUES (
             $1, $2, $3, $4, $5,
             now(), now() + make_interval(secs => $6), 'InProgress', $7, $8
           ) RETURNING *`,
          [
            submission.id, linkRow.id, hashCandidateToken(attemptToken),
            submission.candidateName, submission.candidateEmail,
            Number(linkRow.duration_minutes) * 60 + graceSeconds,
            questionIds, maxScore,
          ]
        );
        await audit(client, null, "START_CANDIDATE_SUBMISSION", submission.id, { linkId: linkRow.id });
        return {
          link: mapCandidateLink(linkRow),
          submission: mapCandidateSubmission(inserted.rows[0]),
          questions,
        };
      });
    } catch (error) {
      if (error?.code === "23505") {
        fail("DUPLICATE_EMAIL", "Only one response per candidate email is accepted");
      }
      throw error;
    }
  };

  const loadLockedSession = async (client, token, attemptToken) => {
    const { rows } = await client.query(
      `SELECT s.*, l.id AS runtime_link_id, l.title AS runtime_link_title,
              l.pass_score AS runtime_pass_score,
              l.max_tab_switches AS runtime_max_tab_switches,
              l.tab_switch_auto_submit AS runtime_tab_switch_auto_submit,
              l.question_snapshot AS runtime_question_snapshot,
              (s.expires_at <= now()) AS runtime_is_expired
       FROM candidate_assessment_submissions s
       JOIN candidate_assessment_links l ON l.id = s.link_id
       WHERE l.token_hash = $1 AND s.attempt_token_hash = $2
       FOR UPDATE OF s`,
      [hashCandidateToken(token), hashCandidateToken(attemptToken)]
    );
    return rows[0] || null;
  };

  const expireLockedSubmission = async (client, row) => {
    const { rows } = await client.query(
      `UPDATE candidate_assessment_submissions SET
         status = 'Expired', submitted_at = COALESCE(submitted_at, now()),
         expired_at = COALESCE(expired_at, now()), auto_submitted_reason = 'TIME_EXPIRED',
         time_spent_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::integer),
         version = version + 1
       WHERE id = $1 RETURNING *`,
      [row.id]
    );
    await audit(client, null, "EXPIRE_CANDIDATE_SUBMISSION", row.id, { linkId: row.runtime_link_id });
    return mapCandidateSubmission(rows[0]);
  };

  const recordEvent = async ({ token, attemptToken, event }) => db.withTransaction(async (client) => {
    const row = await loadLockedSession(client, token, attemptToken);
    if (!row) fail("SESSION_NOT_FOUND", "Assessment session not found");
    const clientEventId = event.clientEventId || event.id;
    const existing = await client.query(
      `SELECT id FROM candidate_proctor_events
       WHERE submission_id = $1 AND client_event_id = $2`,
      [row.id, clientEventId]
    );
    if (existing.rows[0]) {
      return {
        expired: false,
        submission: mapCandidateSubmission(row),
        autoSubmitted: row.auto_submitted_reason === "PROCTORING_THRESHOLD",
        replayed: true,
      };
    }
    if (row.status !== "InProgress") fail("SESSION_CLOSED", "Assessment has already been completed");
    if (row.runtime_is_expired) {
      return { expired: true, submission: await expireLockedSubmission(client, row) };
    }

    const penalty = event.severity === "high" ? 15 : event.severity === "medium" ? 5 : 2;
    const trustScore = Math.max(0, Number(row.trust_score) - penalty);
    const tabSwitchCount = Number(row.tab_switch_count) + (
      ["TAB_SWITCH", "WINDOW_BLUR"].includes(event.eventType) ? 1 : 0
    );
    const ignoredProctoring = trustScore < 60 || tabSwitchCount >= Number(row.runtime_max_tab_switches);
    const proctoringStatus = ignoredProctoring
      ? "PROCTORING_VIOLATIONS_DETECTED"
      : trustScore < 85 ? "MINOR_WARNINGS" : "CLEAN";
    const flag = {
      id: event.id,
      eventType: event.eventType,
      severity: event.severity,
      confidence: event.confidence,
      metadata: event.metadata,
      trustScoreAfter: trustScore,
      createdAt: event.createdAt,
    };
    const autoSubmitted = Boolean(row.runtime_tab_switch_auto_submit)
      && tabSwitchCount >= Number(row.runtime_max_tab_switches);
    let updated = await client.query(
      `UPDATE candidate_assessment_submissions SET
         trust_score = $2, tab_switch_count = $3,
         flags = flags || $4::jsonb, ignored_proctoring = $5,
         proctoring_status = $6, version = version + 1
       WHERE id = $1 RETURNING *`,
      [row.id, trustScore, tabSwitchCount, JSON.stringify([flag]), ignoredProctoring, proctoringStatus]
    );
    if (autoSubmitted) {
      updated = await client.query(
        `UPDATE candidate_assessment_submissions SET
           status = 'Failed', submitted_at = now(), passed = false,
           score = 0, percentage = 0, ignored_proctoring = true,
           proctoring_status = 'PROCTORING_VIOLATIONS_DETECTED',
           hiring_recommendation = 'Not Shortlisted',
           auto_submitted_reason = 'PROCTORING_THRESHOLD',
           time_spent_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::integer),
           version = version + 1
         WHERE id = $1 RETURNING *`,
        [row.id]
      );
      await audit(client, null, "AUTO_SUBMIT_CANDIDATE_ASSESSMENT", row.id, {
        reason: "PROCTORING_THRESHOLD",
        tabSwitchCount,
      });
    }
    await client.query(
      `INSERT INTO candidate_proctor_events (
         id, submission_id, client_event_id, event_type, severity, confidence,
         trust_score_after, metadata, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      [event.id, row.id, clientEventId, event.eventType, event.severity,
        event.confidence, trustScore, JSON.stringify(event.metadata || {}), event.createdAt]
    );
    await audit(client, null, "RECORD_CANDIDATE_PROCTOR_EVENT", row.id, {
      eventType: event.eventType,
      severity: event.severity,
      trustScore,
    });
    return {
      expired: false,
      submission: mapCandidateSubmission(updated.rows[0]),
      autoSubmitted,
      replayed: false,
    };
  });

  const submit = async ({ token, attemptToken, evaluate }) => db.withTransaction(async (client) => {
    const row = await loadLockedSession(client, token, attemptToken);
    if (!row) fail("SESSION_NOT_FOUND", "Assessment attempt not found");
    if (row.status !== "InProgress") {
      fail("SESSION_CLOSED", "This assessment attempt has already been submitted", {
        submittedAt: iso(row.submitted_at),
        score: Number(row.score),
        percentage: Number(row.percentage),
      });
    }
    if (row.runtime_is_expired) {
      return { expired: true, submission: await expireLockedSubmission(client, row) };
    }
    const current = mapCandidateSubmission(row);
    const result = evaluate({
      submission: current,
      questions: row.runtime_question_snapshot || [],
      passScore: Number(row.runtime_pass_score),
      maxTabSwitches: Number(row.runtime_max_tab_switches),
    });
    const updated = await client.query(
      `UPDATE candidate_assessment_submissions SET
         submitted_at = now(), status = $2, answers = $3::jsonb,
         score = $4, max_score = $5, percentage = $6, passed = $7,
         requires_manual_review = $8, ignored_proctoring = $9,
         proctoring_status = $10, hiring_recommendation = $11,
         evaluated_responses = $12::jsonb, category_breakdown = $13::jsonb,
         time_spent_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::integer),
         version = version + 1
       WHERE id = $1 RETURNING *`,
      [
        row.id, result.status, JSON.stringify(result.answers), result.score,
        result.maxScore, result.percentage, result.passed,
        result.requiresManualReview, result.ignoredProctoring,
        result.proctoringStatus, result.hiringRecommendation,
        JSON.stringify(result.evaluatedResponses), JSON.stringify(result.categoryBreakdown),
      ]
    );
    await audit(client, null, "SUBMIT_CANDIDATE_ASSESSMENT", row.id, {
      linkId: row.runtime_link_id,
      score: result.score,
      status: result.status,
    });
    return { expired: false, submission: mapCandidateSubmission(updated.rows[0]) };
  });

  const toggleStatus = async ({ identifier, actorId }) => db.withTransaction(async (client) => {
    const row = await findRowByIdentifier(identifier, client, true);
    if (!row) fail("LINK_NOT_FOUND", "Candidate assessment not found");
    const nextStatus = row.status === "Active" ? "Closed" : "Active";
    const updated = await client.query(
      `UPDATE candidate_assessment_links SET status = $2,
         version = version + 1, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [row.id, nextStatus]
    );
    await audit(client, actorId, "CANDIDATE_ASSESSMENT_STATUS", row.id, { status: nextStatus });
    return mapCandidateLink(updated.rows[0]);
  });

  const rotateToken = async ({ identifier, actorId, token }) => db.withTransaction(async (client) => {
    const row = await findRowByIdentifier(identifier, client, true);
    if (!row) fail("LINK_NOT_FOUND", "Candidate assessment not found");
    const updated = await client.query(
      `UPDATE candidate_assessment_links SET
         token_hash = $2, token_hint = $3,
         version = version + 1, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [row.id, hashCandidateToken(token), token.slice(-8)]
    );
    await audit(client, actorId, "ROTATE_CANDIDATE_ASSESSMENT_TOKEN", row.id, {
      previousTokenHint: row.token_hint,
      tokenHint: token.slice(-8),
    });
    return mapCandidateLink(updated.rows[0]);
  });

  const deleteLink = async ({ identifier, actorId }) => db.withTransaction(async (client) => {
    const row = await findRowByIdentifier(identifier, client, true);
    if (!row) fail("LINK_NOT_FOUND", "Candidate assessment not found");
    await audit(client, actorId, "DELETE_CANDIDATE_ASSESSMENT", row.id, {
      assessmentId: row.assessment_id,
    });
    await client.query("DELETE FROM candidate_assessment_links WHERE id = $1", [row.id]);
    return mapCandidateLink(row);
  });

  return {
    isRelational: true,
    findByIdentifier,
    findPublicByToken,
    listForUser,
    createLink,
    startSubmission,
    recordEvent,
    submit,
    toggleStatus,
    rotateToken,
    deleteLink,
  };
}

export const candidateAssessmentsPgRepository = createCandidateAssessmentsPgRepository();
