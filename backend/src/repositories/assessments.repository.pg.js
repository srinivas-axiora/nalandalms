// PostgreSQL repository for Assessments, Questions & Attempts.
import { query, withTransaction } from "../db/pool.js";

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

const mapQuestion = (r) => ({
  id: r.id,
  type: r.question_type,
  prompt: r.prompt,
  options: r.options || [],
  answer: r.correct_answer !== null && r.correct_answer !== undefined ? Number(r.correct_answer) : undefined,
  correctAnswer: r.correct_answer !== null && r.correct_answer !== undefined ? Number(r.correct_answer) : undefined,
  points: Number(r.points || 10),
  sortOrder: r.sort_order || 0,
});

const mapAssessment = (r, questions = []) => ({
  id: r.id,
  title: r.title,
  courseId: r.course_id,
  chapterId: r.chapter_id || undefined,
  type: r.type,
  strictMode: r.strict_mode ?? true,
  durationMinutes: Number(r.duration_minutes),
  passScore: Number(r.pass_score),
  questionLimit: r.question_limit ? Number(r.question_limit) : undefined,
  difficulty: r.difficulty || "Beginner",
  approval: r.approval,
  status: r.status,
  ownerId: r.owner_id,
  questions,
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

const mapAttempt = (r) => ({
  id: r.id,
  assessmentId: r.assessment_id,
  courseId: r.course_id,
  chapterId: r.chapter_id || null,
  userId: r.user_id,
  status: r.status,
  score: r.score !== null ? Number(r.score) : null,
  maxScore: Number(r.max_score || 100),
  feedback: r.feedback || "",
  answers: r.answers || {},
  selectedQuestionIds: r.selected_question_ids || [],
  tabSwitchWarnings: r.tab_switch_warnings || 0,
  autoSubmittedReason: r.auto_submitted_reason || null,
  timeSpentSeconds: Number(r.time_spent_seconds || 0),
  startedAt: iso(r.started_at),
  submittedAt: r.submitted_at ? iso(r.submitted_at) : null,
});

export async function listAssessments(filters = {}) {
  let sql = "SELECT * FROM assessments WHERE 1=1";
  const params = [];

  if (filters.status && filters.status !== "All") {
    params.push(filters.status);
    sql += ` AND status = $${params.length}::lifecycle_status`;
  }
  if (filters.approval) {
    params.push(filters.approval);
    sql += ` AND approval = $${params.length}::approval_status`;
  }
  if (filters.courseId) {
    params.push(filters.courseId);
    sql += ` AND course_id = $${params.length}`;
  }

  sql += " ORDER BY created_at DESC";
  const { rows } = await query(sql, params);
  if (!rows.length) return [];

  const assessmentIds = rows.map((r) => r.id);
  const qResult = await query(
    "SELECT * FROM questions WHERE assessment_id = ANY($1) ORDER BY sort_order ASC",
    [assessmentIds]
  );
  const questionsByAssessment = new Map();
  for (const q of qResult.rows) {
    if (!questionsByAssessment.has(q.assessment_id)) questionsByAssessment.set(q.assessment_id, []);
    questionsByAssessment.get(q.assessment_id).push(mapQuestion(q));
  }

  return rows.map((r) => mapAssessment(r, questionsByAssessment.get(r.id) || []));
}

export async function findAssessmentById(id) {
  const { rows } = await query("SELECT * FROM assessments WHERE id = $1 LIMIT 1", [id]);
  if (!rows[0]) return null;

  const qResult = await query(
    "SELECT * FROM questions WHERE assessment_id = $1 ORDER BY sort_order ASC",
    [id]
  );
  return mapAssessment(rows[0], qResult.rows.map(mapQuestion));
}

export async function insertAssessment(assessment) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO assessments (
         id, course_id, chapter_id, title, type, strict_mode,
         duration_minutes, pass_score, question_limit, difficulty,
         approval, status, owner_id, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5::assessment_type, $6,
         $7, $8, $9, $10,
         $11::approval_status, $12::lifecycle_status, $13,
         COALESCE($14::timestamptz, now()), now()
       ) RETURNING *`,
      [
        assessment.id,
        assessment.courseId,
        assessment.chapterId || null,
        assessment.title,
        assessment.type || "MCQ",
        assessment.strictMode ?? true,
        assessment.durationMinutes || 15,
        assessment.passScore || 70,
        assessment.questionLimit || null,
        assessment.difficulty || "Beginner",
        assessment.approval || "Pending",
        assessment.status || "Active",
        assessment.ownerId,
        assessment.createdAt || null,
      ]
    );

    const questions = [];
    if (Array.isArray(assessment.questions)) {
      for (let i = 0; i < assessment.questions.length; i++) {
        const q = assessment.questions[i];
        const insertedQ = await client.query(
          `INSERT INTO questions (
             assessment_id, question_type, prompt, options, correct_answer, points, sort_order
           ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            assessment.id,
            q.type || "MCQ",
            q.prompt,
            JSON.stringify(q.options || []),
            JSON.stringify(q.answer ?? q.correctAnswer ?? 0),
            q.points || 10,
            i,
          ]
        );
        questions.push(mapQuestion(insertedQ.rows[0]));
      }
    }

    return mapAssessment(rows[0], questions);
  });
}

export async function createAttempt(attempt) {
  const { rows } = await query(
    `INSERT INTO assessment_attempts (
       id, assessment_id, course_id, chapter_id, user_id, status,
       score, max_score, feedback, answers, selected_question_ids,
       tab_switch_warnings, auto_submitted_reason, time_spent_seconds, started_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6::attempt_status,
       $7, $8, $9, $10, $11,
       $12, $13, $14, COALESCE($15::timestamptz, now())
     ) RETURNING *`,
    [
      attempt.id,
      attempt.assessmentId,
      attempt.courseId,
      attempt.chapterId || null,
      attempt.userId,
      attempt.status || "InProgress",
      attempt.score !== undefined ? attempt.score : null,
      attempt.maxScore || 100,
      attempt.feedback || "",
      JSON.stringify(attempt.answers || {}),
      attempt.selectedQuestionIds || [],
      attempt.tabSwitchWarnings || 0,
      attempt.autoSubmittedReason || null,
      attempt.timeSpentSeconds || 0,
      attempt.startedAt || null,
    ]
  );
  return mapAttempt(rows[0]);
}

export async function findAttemptById(id) {
  const { rows } = await query("SELECT * FROM assessment_attempts WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapAttempt(rows[0]) : null;
}

export async function updateAttempt(id, updates) {
  const fields = [];
  const params = [id];

  if (updates.status !== undefined) {
    params.push(updates.status);
    fields.push(`status = $${params.length}::attempt_status`);
  }
  if (updates.score !== undefined) {
    params.push(updates.score);
    fields.push(`score = $${params.length}`);
  }
  if (updates.feedback !== undefined) {
    params.push(updates.feedback);
    fields.push(`feedback = $${params.length}`);
  }
  if (updates.answers !== undefined) {
    params.push(JSON.stringify(updates.answers));
    fields.push(`answers = $${params.length}`);
  }
  if (updates.selectedQuestionIds !== undefined) {
    params.push(updates.selectedQuestionIds);
    fields.push(`selected_question_ids = $${params.length}`);
  }
  if (updates.tabSwitchWarnings !== undefined) {
    params.push(updates.tabSwitchWarnings);
    fields.push(`tab_switch_warnings = $${params.length}`);
  }
  if (updates.autoSubmittedReason !== undefined) {
    params.push(updates.autoSubmittedReason);
    fields.push(`auto_submitted_reason = $${params.length}`);
  }
  if (updates.timeSpentSeconds !== undefined) {
    params.push(updates.timeSpentSeconds);
    fields.push(`time_spent_seconds = $${params.length}`);
  }
  if (updates.submittedAt !== undefined) {
    params.push(updates.submittedAt);
    fields.push(`submitted_at = $${params.length}::timestamptz`);
  }

  const sql = `UPDATE assessment_attempts SET ${fields.join(", ")} WHERE id = $1 RETURNING *`;
  const { rows } = await query(sql, params);
  return rows[0] ? mapAttempt(rows[0]) : null;
}

export async function listAttempts(filters = {}) {
  let sql = "SELECT * FROM assessment_attempts WHERE 1=1";
  const params = [];
  if (filters.userId) {
    params.push(filters.userId);
    sql += ` AND user_id = $${params.length}`;
  }
  if (filters.courseId) {
    params.push(filters.courseId);
    sql += ` AND course_id = $${params.length}`;
  }
  if (filters.assessmentId) {
    params.push(filters.assessmentId);
    sql += ` AND assessment_id = $${params.length}`;
  }
  sql += " ORDER BY started_at DESC";
  const { rows } = await query(sql, params);
  return rows.map(mapAttempt);
}

