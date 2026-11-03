import { query, withTransaction } from "../db/pool.js";

const iso = (value) => (value instanceof Date ? value.toISOString() : value);

export const mapAttempt = (row) => row && ({
  id: row.id,
  assessmentId: row.assessment_id,
  chapterId: row.chapter_id || null,
  courseId: row.course_id || null,
  userId: row.user_id,
  status: row.status,
  score: row.score === null ? null : Number(row.score),
  maxScore: row.max_score === null ? null : Number(row.max_score),
  feedback: row.feedback || "",
  answers: row.answers || {},
  selectedQuestionIds: row.selected_question_ids || [],
  questionMap: row.question_map || {},
  manualGrades: row.manual_grades || {},
  flags: row.flags || [],
  warnings: row.warnings || [],
  videoChunks: row.video_chunks || [],
  companion: row.companion || null,
  trustScore: Number(row.trust_score ?? 100),
  tabSwitchWarnings: Number(row.tab_switch_warnings || 0),
  autoSubmittedReason: row.auto_submitted_reason || null,
  expiresAt: row.expires_at ? iso(row.expires_at) : null,
  isPaused: Boolean(row.is_paused),
  pausedAt: row.paused_at ? iso(row.paused_at) : null,
  resumedAt: row.resumed_at ? iso(row.resumed_at) : null,
  terminatedReason: row.terminated_reason || null,
  terminatedBy: row.terminated_by || null,
  terminatedAt: row.terminated_at ? iso(row.terminated_at) : null,
  assignedProctorId: row.assigned_proctor_id || null,
  timeSpentSeconds: Number(row.time_spent_seconds || 0),
  startedAt: iso(row.started_at),
  submittedAt: row.submitted_at ? iso(row.submitted_at) : null,
  evaluatedBy: row.evaluated_by || null,
  version: Number(row.version || 0),
});

export const mapProctorEvent = (row) => row && ({
  id: row.id,
  attemptId: row.attempt_id,
  userId: row.user_id,
  eventType: row.event_type,
  severity: row.severity,
  confidence: row.confidence === null ? null : Number(row.confidence),
  captureKey: row.capture_key || null,
  trustScoreAfter: row.trust_score_after === null ? null : Number(row.trust_score_after),
  metadata: row.metadata || {},
  createdAt: iso(row.created_at),
});

export class AttemptRepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AttemptRepositoryError";
    this.code = code;
  }
}

const fail = (code, message) => {
  throw new AttemptRepositoryError(code, message);
};

const audit = (client, actorId, action, attemptId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, 'ASSESSMENT_ATTEMPT', $3, $4::jsonb)`,
  [actorId || null, action, attemptId, JSON.stringify(metadata)]
);

const updateEnrollment = (client, attempt, enrollment) => {
  if (!enrollment) return Promise.resolve();
  return client.query(
    `UPDATE enrollments SET
       status = COALESCE($3, status),
       time_spent_seconds = time_spent_seconds + $4,
       time_spent_minutes = CEIL((time_spent_seconds + $4) / 60.0)::integer,
       assessment_time_spent_seconds = assessment_time_spent_seconds + $4,
       completed_at = COALESCE(completed_at, $5)
     WHERE user_id = $1 AND course_id = $2`,
    [attempt.userId, attempt.courseId, enrollment.status || null,
      enrollment.addTimeSeconds || 0, enrollment.completedAt || null]
  );
};

export function createAttemptsRepository(db = { query, withTransaction }) {
  const findById = async (id, client = db) => {
    const { rows } = await client.query(
      "SELECT * FROM assessment_attempts WHERE id = $1 LIMIT 1",
      [id]
    );
    return mapAttempt(rows[0]);
  };

  const list = async ({ statuses = null, userId = null } = {}) => {
    const params = [];
    let sql = "SELECT * FROM assessment_attempts WHERE 1=1";
    if (statuses?.length) {
      params.push(statuses);
      sql += ` AND status = ANY($${params.length}::text[])`;
    }
    if (userId) {
      params.push(userId);
      sql += ` AND user_id = $${params.length}`;
    }
    sql += " ORDER BY started_at DESC";
    const { rows } = await db.query(sql, params);
    return rows.map(mapAttempt);
  };

  const listProctorEvents = async ({ userIds = null, attemptId = null } = {}) => {
    const params = [];
    let sql = "SELECT * FROM proctoring_logs WHERE 1=1";
    if (userIds?.length) {
      params.push(userIds);
      sql += ` AND user_id = ANY($${params.length}::text[])`;
    }
    if (attemptId) {
      params.push(attemptId);
      sql += ` AND attempt_id = $${params.length}`;
    }
    sql += " ORDER BY created_at DESC";
    const { rows } = await db.query(sql, params);
    return rows.map(mapProctorEvent);
  };

  const insert = async (attempt, { actorId = attempt.userId, action = "START_BLIND_EXAM" } = {}) =>
    db.withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO assessment_attempts (
           id, assessment_id, chapter_id, course_id, user_id, status, score,
           max_score, feedback, answers, selected_question_ids, question_map,
           manual_grades, flags, warnings, video_chunks, companion, trust_score,
           tab_switch_warnings, auto_submitted_reason, expires_at, is_paused,
           paused_at, resumed_at, terminated_reason, terminated_by, terminated_at,
           assigned_proctor_id, time_spent_seconds, started_at, submitted_at,
           evaluated_by, version
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10::jsonb, $11, $12::jsonb,
           $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18,
           $19, $20, $21, $22,
           $23, $24, $25, $26, $27,
           $28, $29, $30, $31,
           $32, 0
         ) RETURNING *`,
        [
          attempt.id, attempt.assessmentId, attempt.chapterId || null,
          attempt.courseId || null, attempt.userId, attempt.status || "InProgress",
          attempt.score ?? null, attempt.maxScore ?? null, attempt.feedback || "",
          JSON.stringify(attempt.answers || {}), attempt.selectedQuestionIds || [],
          JSON.stringify(attempt.questionMap || {}), JSON.stringify(attempt.manualGrades || {}),
          JSON.stringify(attempt.flags || []), JSON.stringify(attempt.warnings || []),
          JSON.stringify(attempt.videoChunks || []), JSON.stringify(attempt.companion || null),
          attempt.trustScore ?? 100, attempt.tabSwitchWarnings || 0,
          attempt.autoSubmittedReason || null, attempt.expiresAt || null,
          Boolean(attempt.isPaused), attempt.pausedAt || null, attempt.resumedAt || null,
          attempt.terminatedReason || null, attempt.terminatedBy || null,
          attempt.terminatedAt || null, attempt.assignedProctorId || null,
          attempt.timeSpentSeconds || 0, attempt.startedAt,
          attempt.submittedAt || null, attempt.evaluatedBy || null,
        ]
      );
      await audit(client, actorId, action, attempt.id, {
        assessmentId: attempt.assessmentId,
        questionCount: (attempt.selectedQuestionIds || []).length,
      });
      return mapAttempt(rows[0]);
    });

  const updateAttempt = async (client, attempt, { expectedVersion, guard = "none" }) => {
    let predicate = "";
    if (guard === "answer" || guard === "submit") {
      predicate = " AND submitted_at IS NULL AND status = 'InProgress' AND (expires_at IS NULL OR expires_at >= now())";
    }
    const { rows } = await client.query(
      `UPDATE assessment_attempts SET
         status = $3, score = $4, max_score = $5, feedback = $6,
         answers = $7::jsonb, selected_question_ids = $8, question_map = $9::jsonb,
         manual_grades = $10::jsonb, flags = $11::jsonb, warnings = $12::jsonb,
         video_chunks = $13::jsonb, companion = $14::jsonb, trust_score = $15,
         tab_switch_warnings = $16, auto_submitted_reason = $17, expires_at = $18,
         is_paused = $19, paused_at = $20, resumed_at = $21,
         terminated_reason = $22, terminated_by = $23, terminated_at = $24,
         assigned_proctor_id = $25, time_spent_seconds = $26,
         submitted_at = $27, evaluated_by = $28, version = version + 1
       WHERE id = $1 AND version = $2${predicate}
       RETURNING *`,
      [
        attempt.id, expectedVersion, attempt.status, attempt.score ?? null,
        attempt.maxScore ?? null, attempt.feedback || "", JSON.stringify(attempt.answers || {}),
        attempt.selectedQuestionIds || [], JSON.stringify(attempt.questionMap || {}),
        JSON.stringify(attempt.manualGrades || {}), JSON.stringify(attempt.flags || []),
        JSON.stringify(attempt.warnings || []), JSON.stringify(attempt.videoChunks || []),
        JSON.stringify(attempt.companion || null), attempt.trustScore ?? 100,
        attempt.tabSwitchWarnings || 0, attempt.autoSubmittedReason || null,
        attempt.expiresAt || null, Boolean(attempt.isPaused), attempt.pausedAt || null,
        attempt.resumedAt || null, attempt.terminatedReason || null,
        attempt.terminatedBy || null, attempt.terminatedAt || null,
        attempt.assignedProctorId || null, attempt.timeSpentSeconds || 0,
        attempt.submittedAt || null, attempt.evaluatedBy || null,
      ]
    );
    if (rows[0]) return mapAttempt(rows[0]);

    const current = await findById(attempt.id, client);
    if (!current) fail("ATTEMPT_NOT_FOUND", "Assessment attempt not found");
    if (current.version !== expectedVersion) {
      fail("ATTEMPT_CONFLICT", "Assessment attempt changed concurrently; reload and retry");
    }
    if (guard === "answer" || guard === "submit") {
      fail("ATTEMPT_CLOSED", "Assessment attempt is submitted, paused, or expired");
    }
    fail("ATTEMPT_UPDATE_FAILED", "Assessment attempt could not be updated");
  };

  const save = async (attempt, {
    expectedVersion = attempt.version,
    guard = "none",
    actorId = attempt.userId,
    action = "UPDATE_ASSESSMENT_ATTEMPT",
    metadata = {},
    enrollment = null,
  } = {}) => db.withTransaction(async (client) => {
    const saved = await updateAttempt(client, attempt, { expectedVersion, guard });
    await updateEnrollment(client, attempt, enrollment);
    await audit(client, actorId, action, attempt.id, metadata);
    return saved;
  });

  const recordProctorEvent = async ({
    attempt,
    event,
    expectedVersion = attempt.version,
    actorId,
    enrollment = null,
  }) =>
    db.withTransaction(async (client) => {
      const saved = await updateAttempt(client, attempt, { expectedVersion, guard: "none" });
      const inserted = await client.query(
        `INSERT INTO proctoring_logs (
           id, attempt_id, user_id, event_type, severity, confidence,
           capture_key, trust_score_after, metadata, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
         RETURNING *`,
        [
          event.id, event.attemptId, event.userId, event.eventType, event.severity,
          event.confidence ?? null, event.captureKey || null, event.trustScoreAfter ?? null,
          JSON.stringify(event.metadata || {}), event.createdAt,
        ]
      );
      await updateEnrollment(client, attempt, enrollment);
      await audit(client, actorId || event.userId, "PROCTORING_EVENT", attempt.id, {
        eventType: event.eventType,
        severity: event.severity,
        trustScore: attempt.trustScore,
      });
      return { attempt: saved, event: mapProctorEvent(inserted.rows[0]) };
    });

  const appendVideoChunk = async ({ attemptId, chunk, actorId }) =>
    db.withTransaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE assessment_attempts SET
           video_chunks = video_chunks || $2::jsonb,
           version = version + 1
         WHERE id = $1
         RETURNING *`,
        [attemptId, JSON.stringify([chunk])]
      );
      if (!rows[0]) fail("ATTEMPT_NOT_FOUND", "Assessment attempt not found");
      await audit(client, actorId, "STORE_PROCTORING_CHUNK", attemptId, {
        chunkIndex: chunk.chunkIndex,
        streamRole: chunk.streamRole,
        key: chunk.key,
      });
      return mapAttempt(rows[0]);
    });

  const saveCompanionHeartbeat = async ({ attemptId, at, batteryLevel, actorId }) =>
    db.withTransaction(async (client) => {
      const patch = { lastPingAt: at };
      if (batteryLevel !== undefined) patch.batteryLevel = batteryLevel;
      const { rows } = await client.query(
        `UPDATE assessment_attempts SET
           companion = companion || $2::jsonb,
           version = version + 1
         WHERE id = $1 AND companion IS NOT NULL
         RETURNING *`,
        [attemptId, JSON.stringify(patch)]
      );
      if (!rows[0]) fail("ATTEMPT_NOT_FOUND", "Paired assessment attempt not found");
      await audit(client, actorId, "COMPANION_HEARTBEAT", attemptId, {
        batteryLevel: batteryLevel ?? null,
      });
      return mapAttempt(rows[0]);
    });

  return {
    findById,
    list,
    listProctorEvents,
    insert,
    save,
    recordProctorEvent,
    appendVideoChunk,
    saveCompanionHeartbeat,
  };
}

export const attemptsRepository = createAttemptsRepository();
