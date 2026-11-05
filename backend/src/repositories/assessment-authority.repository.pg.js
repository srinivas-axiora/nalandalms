import { query, withTransaction } from "../db/pool.js";
import { createAttemptsRepository } from "./attempts.repository.pg.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isAdmin = (role) => role === "Admin" || role === "Super Admin";
const asObject = (value) => {
  if (!value) return {};
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return { ...value };
};

export class AssessmentAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "AssessmentAuthorityError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new AssessmentAuthorityError(code, message, details);
};

export const mapAuthorityQuestionRow = (row) => {
  const metadata = asObject(row.metadata);
  const answer = row.correct_answer === undefined ? null : row.correct_answer;
  return {
    ...metadata,
    id: String(row.id),
    type: row.question_type,
    prompt: row.prompt,
    options: row.options || [],
    answer,
    correctAnswer: answer,
    points: Number(row.points || 10),
    sortOrder: Number(row.sort_order || 0),
  };
};

export const mapAuthorityAssessmentRow = (row, questions = []) => row && ({
  id: row.id,
  title: row.title,
  courseId: row.course_id,
  courseTitle: row.course_title || undefined,
  chapterId: row.chapter_id || undefined,
  type: row.type,
  strictMode: row.strict_mode !== false,
  durationMinutes: Number(row.duration_minutes),
  passScore: Number(row.pass_score),
  questionLimit: row.question_limit ? Number(row.question_limit) : undefined,
  difficulty: row.difficulty || "Beginner",
  approval: row.approval,
  status: row.status,
  ownerId: row.owner_id,
  version: Number(row.version || 1),
  questions,
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const redactQuestion = (question) => {
  const { answer, correctAnswer, expectedAnswer, rubric, explanation, ...safe } = question;
  return safe;
};

const projectForActor = (assessment, actor) => (
  isAdmin(actor?.role) || assessment.ownerId === actor?.id
    ? assessment
    : { ...assessment, questions: assessment.questions.map(redactQuestion) }
);

const audit = (client, actorId, action, entityId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, 'ASSESSMENT', $3, $4::jsonb)`,
  [actorId || null, action, entityId, JSON.stringify(metadata)]
);

const questionMetadata = (question) => {
  const {
    id, type, prompt, options, answer, correctAnswer, points, sortOrder,
    ...metadata
  } = question;
  return metadata;
};

export function createAssessmentAuthorityRepository(db = { query, withTransaction }) {
  const loadQuestions = async (client, assessmentIds) => {
    if (!assessmentIds.length) return new Map();
    const { rows } = await client.query(
      `SELECT * FROM questions
       WHERE assessment_id = ANY($1::text[])
       ORDER BY assessment_id, sort_order, id`,
      [assessmentIds]
    );
    const grouped = new Map();
    for (const row of rows) {
      if (!grouped.has(row.assessment_id)) grouped.set(row.assessment_id, []);
      grouped.get(row.assessment_id).push(mapAuthorityQuestionRow(row));
    }
    return grouped;
  };

  const loadCourse = async (client, courseId, lock = "") => {
    const { rows } = await client.query(`SELECT * FROM courses WHERE id = $1${lock}`, [courseId]);
    return rows[0] || null;
  };

  const loadAssessment = async (client, id, lock = "") => {
    const { rows } = await client.query(`SELECT * FROM assessments WHERE id = $1${lock}`, [id]);
    return rows[0] || null;
  };

  const canManage = (actor, course, assessment = null) => (
    isAdmin(actor?.role)
      || course?.owner_id === actor?.id
      || assessment?.owner_id === actor?.id
  );

  const assertCourseVersion = (course, expectedVersion) => {
    if (Number(course.current_version) !== Number(expectedVersion)) {
      fail("VERSION_CONFLICT", "Course changed since it was loaded", {
        resource: "course",
        currentVersion: Number(course.current_version),
      });
    }
  };

  const assertAssessmentVersion = (assessment, expectedVersion) => {
    if (Number(assessment.version) !== Number(expectedVersion)) {
      fail("VERSION_CONFLICT", "Assessment changed since it was loaded", {
        resource: "assessment",
        currentVersion: Number(assessment.version),
      });
    }
  };

  const insertQuestions = async (client, assessmentId, questions) => {
    const inserted = [];
    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index];
      const answer = question.answer ?? question.correctAnswer ?? null;
      const result = await client.query(
        `INSERT INTO questions (
           assessment_id, question_type, prompt, options, correct_answer,
           points, sort_order, metadata
         ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8::jsonb)
         RETURNING *`,
        [assessmentId, question.type, question.prompt, JSON.stringify(question.options || []),
          JSON.stringify(answer), question.points ?? 10, index,
          JSON.stringify(questionMetadata(question))]
      );
      inserted.push(mapAuthorityQuestionRow(result.rows[0]));
    }
    return inserted;
  };

  const writeVersion = (client, assessmentRow, questions, actorId, changeNote) => client.query(
    `INSERT INTO assessment_versions (
       assessment_id, version, snapshot, change_note, created_by
     ) VALUES ($1, $2, $3::jsonb, $4, $5)`,
    [assessmentRow.id, assessmentRow.version,
      JSON.stringify(mapAuthorityAssessmentRow(assessmentRow, questions)), changeNote, actorId]
  );

  const bumpCourseVersion = async (client, course, actor, changeNote) => {
    const { rows } = await client.query(
      `UPDATE courses SET current_version = current_version + 1,
         approval = CASE WHEN $2::boolean THEN approval ELSE 'Pending'::approval_status END,
         updated_at = now() WHERE id = $1 RETURNING *`,
      [course.id, isAdmin(actor.role)]
    );
    const updated = rows[0];
    await client.query(
      `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [updated.id, updated.current_version, updated.title, updated.description, changeNote, actor.id]
    );
    return updated;
  };

  const ensureChapter = async (client, courseId, chapterId) => {
    if (!chapterId) return;
    const { rows } = await client.query(
      "SELECT id FROM chapters WHERE id = $1 AND course_id = $2",
      [chapterId, courseId]
    );
    if (!rows[0]) fail("INVALID_CHAPTER", "Chapter does not belong to course");
  };

  const listVisible = async ({ actor, status = "Active", approval, courseId }) => {
    const params = [];
    let sql = `SELECT a.*, c.title AS course_title
      FROM assessments a JOIN courses c ON c.id = a.course_id`;
    if (!isAdmin(actor.role) && actor.role !== "Manager") {
      params.push(actor.id);
      sql += ` JOIN enrollments e ON e.course_id = c.id AND e.user_id = $${params.length}`;
    }
    sql += " WHERE 1=1";
    if (actor.role === "Manager") {
      params.push(actor.id);
      sql += ` AND (a.owner_id = $${params.length} OR c.owner_id = $${params.length}
        OR (a.approval = 'Approved' AND a.status = 'Active'
          AND c.approval = 'Approved' AND c.status = 'Active'))`;
    } else if (!isAdmin(actor.role)) {
      sql += ` AND a.approval = 'Approved' AND a.status = 'Active'
        AND c.approval = 'Approved' AND c.status = 'Active'`;
    }
    if (status && status !== "All") {
      params.push(status);
      sql += ` AND a.status = $${params.length}::lifecycle_status`;
    }
    if (approval) {
      params.push(approval);
      sql += ` AND a.approval = $${params.length}::approval_status`;
    }
    if (courseId) {
      params.push(courseId);
      sql += ` AND a.course_id = $${params.length}`;
    }
    sql += " ORDER BY a.created_at DESC, a.id";
    const { rows } = await db.query(sql, params);
    const questions = await loadQuestions(db, rows.map((row) => row.id));
    return rows.map((row) => projectForActor(
      mapAuthorityAssessmentRow(row, questions.get(row.id) || []),
      actor
    ));
  };

  const findRuntimeById = async (id, client = db) => {
    const { rows } = await client.query(
      `SELECT a.*, c.title AS course_title
       FROM assessments a JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1 AND a.approval = 'Approved' AND a.status = 'Active'
         AND c.approval = 'Approved' AND c.status = 'Active'`,
      [id]
    );
    if (!rows[0]) return null;
    const questions = await loadQuestions(client, [id]);
    return mapAuthorityAssessmentRow(rows[0], questions.get(id) || []);
  };

  const findById = async (id, client = db) => {
    const { rows } = await client.query(
      `SELECT a.*, c.title AS course_title
       FROM assessments a JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    const questions = await loadQuestions(client, [id]);
    return mapAuthorityAssessmentRow(rows[0], questions.get(id) || []);
  };

  const canManageAssessment = async ({ id, actor }) => {
    if (isAdmin(actor?.role)) return true;
    const { rows } = await db.query(
      `SELECT 1 FROM assessments a JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1 AND (a.owner_id = $2 OR c.owner_id = $2) LIMIT 1`,
      [id, actor?.id]
    );
    return Boolean(rows[0]);
  };

  const createAssessment = ({ assessment, actor, expectedCourseVersion }) =>
    db.withTransaction(async (client) => {
      const course = await loadCourse(client, assessment.courseId, " FOR UPDATE");
      if (!course) fail("COURSE_NOT_FOUND", "Course not found");
      if (!canManage(actor, course)) fail("FORBIDDEN", "You cannot manage this course");
      assertCourseVersion(course, expectedCourseVersion);
      await ensureChapter(client, course.id, assessment.chapterId);
      let inserted;
      try {
        inserted = await client.query(
          `INSERT INTO assessments (
             id, course_id, chapter_id, title, type, strict_mode,
             duration_minutes, pass_score, question_limit, difficulty,
             approval, status, owner_id, version
           ) VALUES (
             $1, $2, $3, $4, $5::assessment_type, $6,
             $7, $8, $9, $10, $11::approval_status, 'Active', $12, 1
           ) RETURNING *`,
          [assessment.id, assessment.courseId, assessment.chapterId || null,
            assessment.title, assessment.type, assessment.strictMode,
            assessment.durationMinutes, assessment.passScore,
            assessment.questionLimit || null, assessment.difficulty || "Beginner",
            "Pending", actor.id]
        );
      } catch (error) {
        if (error?.code === "23505") fail("ASSESSMENT_CONFLICT", "Assessment identifier already exists");
        throw error;
      }
      const questions = await insertQuestions(client, assessment.id, assessment.questions);
      await writeVersion(client, inserted.rows[0], questions, actor.id, "Initial assessment version");
      const updatedCourse = await bumpCourseVersion(client, course, actor, `Assessment created: ${assessment.id}`);
      await audit(client, actor.id, "CREATE_ASSESSMENT", assessment.id, {
        assessmentVersion: 1,
        courseId: course.id,
        courseVersion: Number(updatedCourse.current_version),
      });
      return {
        assessment: mapAuthorityAssessmentRow(inserted.rows[0], questions),
        courseVersion: Number(updatedCourse.current_version),
      };
    });

  const updateAssessment = ({ id, actor, expectedCourseVersion, expectedAssessmentVersion, updates }) =>
    db.withTransaction(async (client) => {
      const existing = await loadAssessment(client, id, " FOR UPDATE");
      if (!existing) fail("ASSESSMENT_NOT_FOUND", "Assessment not found");
      const course = await loadCourse(client, existing.course_id, " FOR UPDATE");
      if (!course) fail("COURSE_NOT_FOUND", "Course not found");
      if (!canManage(actor, course, existing)) fail("FORBIDDEN", "You cannot manage this assessment");
      assertCourseVersion(course, expectedCourseVersion);
      assertAssessmentVersion(existing, expectedAssessmentVersion);
      await ensureChapter(client, course.id, updates.chapterId);
      const fields = [];
      const params = [id];
      const allowed = {
        title: "title", chapterId: "chapter_id", type: "type", strictMode: "strict_mode",
        durationMinutes: "duration_minutes", passScore: "pass_score",
        questionLimit: "question_limit", difficulty: "difficulty",
      };
      for (const [key, column] of Object.entries(allowed)) {
        if (updates[key] !== undefined) {
          params.push(updates[key]);
          fields.push(`${column} = $${params.length}${key === "type" ? "::assessment_type" : ""}`);
        }
      }
      if (!fields.length && updates.questions === undefined) fail("NO_CHANGES", "No assessment changes were supplied");
      // Any content/rule mutation invalidates the prior review decision. Even an
      // administrator must traverse the step-up-protected review route again.
      params.push("Pending");
      fields.push(`approval = $${params.length}::approval_status`, "version = version + 1", "updated_at = now()");
      const { rows } = await client.query(
        `UPDATE assessments SET ${fields.join(", ")} WHERE id = $1 RETURNING *`,
        params
      );
      let questions;
      if (updates.questions !== undefined) {
        await client.query("DELETE FROM questions WHERE assessment_id = $1", [id]);
        questions = await insertQuestions(client, id, updates.questions);
      } else {
        const grouped = await loadQuestions(client, [id]);
        questions = grouped.get(id) || [];
      }
      await writeVersion(client, rows[0], questions, actor.id, "Assessment updated");
      const updatedCourse = await bumpCourseVersion(client, course, actor, `Assessment updated: ${id}`);
      await audit(client, actor.id, "UPDATE_ASSESSMENT", id, {
        assessmentVersion: Number(rows[0].version),
        courseId: course.id,
        courseVersion: Number(updatedCourse.current_version),
      });
      return {
        assessment: mapAuthorityAssessmentRow(rows[0], questions),
        courseVersion: Number(updatedCourse.current_version),
      };
    });

  const setStatus = ({ id, actor, expectedCourseVersion, expectedAssessmentVersion, status }) =>
    db.withTransaction(async (client) => {
      const existing = await loadAssessment(client, id, " FOR UPDATE");
      if (!existing) fail("ASSESSMENT_NOT_FOUND", "Assessment not found");
      const course = await loadCourse(client, existing.course_id, " FOR UPDATE");
      if (!canManage(actor, course, existing)) fail("FORBIDDEN", "You cannot manage this assessment");
      assertCourseVersion(course, expectedCourseVersion);
      assertAssessmentVersion(existing, expectedAssessmentVersion);
      const { rows } = await client.query(
        `UPDATE assessments SET status = $2::lifecycle_status,
           version = version + 1, updated_at = now() WHERE id = $1 RETURNING *`,
        [id, status]
      );
      const grouped = await loadQuestions(client, [id]);
      const questions = grouped.get(id) || [];
      await writeVersion(client, rows[0], questions, actor.id, `Assessment status: ${status}`);
      const updatedCourse = await bumpCourseVersion(client, course, actor, `Assessment status changed: ${id}`);
      await audit(client, actor.id, "ASSESSMENT_STATUS", id, { status, assessmentVersion: rows[0].version });
      return { assessment: mapAuthorityAssessmentRow(rows[0], questions), courseVersion: Number(updatedCourse.current_version) };
    });

  const reviewAssessment = ({ id, actor, expectedCourseVersion, expectedAssessmentVersion, approval, feedback }) => {
    if (!isAdmin(actor?.role)) fail("FORBIDDEN", "Administrator role required");
    return db.withTransaction(async (client) => {
      const existing = await loadAssessment(client, id, " FOR UPDATE");
      if (!existing) fail("ASSESSMENT_NOT_FOUND", "Assessment not found");
      const course = await loadCourse(client, existing.course_id, " FOR UPDATE");
      assertCourseVersion(course, expectedCourseVersion);
      assertAssessmentVersion(existing, expectedAssessmentVersion);
      const { rows } = await client.query(
        `UPDATE assessments SET approval = $2::approval_status,
           status = CASE WHEN $2 = 'Rejected' THEN 'Inactive'::lifecycle_status ELSE status END,
           version = version + 1, updated_at = now() WHERE id = $1 RETURNING *`,
        [id, approval]
      );
      const grouped = await loadQuestions(client, [id]);
      const questions = grouped.get(id) || [];
      await writeVersion(client, rows[0], questions, actor.id, `Assessment review: ${approval}`);
      const updatedCourse = await bumpCourseVersion(client, course, actor, `Assessment reviewed: ${id}`);
      await audit(client, actor.id, "ASSESSMENT_APPROVAL", id, {
        approval, feedback, assessmentVersion: rows[0].version,
      });
      return { assessment: mapAuthorityAssessmentRow(rows[0], questions), courseVersion: Number(updatedCourse.current_version) };
    });
  };

  const archiveAndDelete = ({ id, actor, expectedCourseVersion, expectedAssessmentVersion, deletionComment }) =>
    db.withTransaction(async (client) => {
      const existing = await loadAssessment(client, id, " FOR UPDATE");
      if (!existing) fail("ASSESSMENT_NOT_FOUND", "Assessment not found");
      const course = await loadCourse(client, existing.course_id, " FOR UPDATE");
      if (!canManage(actor, course, existing)) fail("FORBIDDEN", "You cannot delete this assessment");
      assertCourseVersion(course, expectedCourseVersion);
      assertAssessmentVersion(existing, expectedAssessmentVersion);
      const history = await client.query(
        `SELECT
           (SELECT count(*) FROM assessment_attempts WHERE assessment_id = $1)::integer AS attempts,
           (SELECT count(*) FROM candidate_assessment_links WHERE assessment_id = $1)::integer AS candidate_links`,
        [id]
      );
      if (Object.values(history.rows[0] || {}).some((count) => Number(count) > 0)) {
        fail("ASSESSMENT_HAS_HISTORY", "Assessment has retained attempt or candidate-link history", history.rows[0]);
      }
      const grouped = await loadQuestions(client, [id]);
      const questions = grouped.get(id) || [];
      await client.query(
        `INSERT INTO deleted_archives (
           entity_type, entity_id, entity_data, related_data,
           deleted_by, deleted_by_name, deletion_comment
         ) VALUES ('Assessment', $1, $2::jsonb, $3::jsonb, $4, $5, $6)`,
        [id, JSON.stringify(mapAuthorityAssessmentRow(existing, questions)),
          JSON.stringify({ questions }), actor.id, actor.name || "", deletionComment]
      );
      await client.query("DELETE FROM assessments WHERE id = $1", [id]);
      const updatedCourse = await bumpCourseVersion(client, course, actor, `Assessment deleted: ${id}`);
      await audit(client, actor.id, "DELETE_ASSESSMENT", id, {
        archived: true,
        courseId: course.id,
        courseVersion: Number(updatedCourse.current_version),
      });
      return { deleted: true, id, courseVersion: Number(updatedCourse.current_version) };
    });

  const eligibleRuntime = async (client, assessmentId, actor) => {
    const { rows } = await client.query(
      `SELECT a.*, c.title AS course_title
       FROM assessments a JOIN courses c ON c.id = a.course_id
       WHERE a.id = $1 AND a.approval = 'Approved' AND a.status = 'Active'
         AND c.approval = 'Approved' AND c.status = 'Active'
       FOR SHARE OF a, c`,
      [assessmentId]
    );
    const row = rows[0];
    if (!row) fail("ASSESSMENT_NOT_FOUND", "Approved assessment not found");
    if (!isAdmin(actor.role)) {
      const enrollment = await client.query(
        `SELECT * FROM enrollments WHERE course_id = $1 AND user_id = $2 FOR SHARE`,
        [row.course_id, actor.id]
      );
      if (!enrollment.rows[0]) fail("ENROLLMENT_REQUIRED", "You are not enrolled in this course");
      const chapters = await client.query(
        "SELECT id FROM chapters WHERE course_id = $1 ORDER BY sequence, created_at, id",
        [row.course_id]
      );
      const completed = enrollment.rows[0].completed_chapters || [];
      const missing = chapters.rows.filter((chapter) => !completed.includes(chapter.id));
      if (missing.length) {
        fail("CHAPTERS_INCOMPLETE", "You must complete all course chapters before attempting the assessment", {
          completedCount: chapters.rows.length - missing.length,
          totalCount: chapters.rows.length,
          nextChapterId: missing[0].id,
        });
      }
    }
    const activeAttempt = await client.query(
      `SELECT id FROM assessment_attempts
       WHERE assessment_id = $1 AND user_id = $2
         AND status IN ('InProgress', 'Paused')
       LIMIT 1`,
      [assessmentId, actor.id]
    );
    if (activeAttempt.rows[0]) {
      fail("ATTEMPT_CONFLICT", "An active attempt already exists for this assessment", {
        attemptId: activeAttempt.rows[0].id,
      });
    }
    const grouped = await loadQuestions(client, [assessmentId]);
    const questions = grouped.get(assessmentId) || [];
    if (!questions.length) fail("ASSESSMENT_EMPTY", "Assessment has no questions available");
    return mapAuthorityAssessmentRow(row, questions);
  };

  const startAttempt = async ({ assessmentId, actor, buildAttempt }) => {
    try {
      return await db.withTransaction(async (client) => {
        const assessment = await eligibleRuntime(client, assessmentId, actor);
        const attempt = buildAttempt(assessment);
        const transactionalAttempts = createAttemptsRepository({
          query: client.query.bind(client),
          withTransaction: (fn) => fn(client),
        });
        const saved = await transactionalAttempts.insert(attempt, {
          actorId: actor.id,
          action: "START_BLIND_EXAM",
        });
        return { assessment, attempt: saved };
      });
    } catch (error) {
      if (error?.code === "23505") fail("ATTEMPT_CONFLICT", "An active attempt already exists for this assessment");
      throw error;
    }
  };

  return {
    listVisible,
    findById,
    findRuntimeById,
    canManageAssessment,
    createAssessment,
    updateAssessment,
    setStatus,
    reviewAssessment,
    archiveAndDelete,
    startAttempt,
  };
}

export const assessmentAuthorityRepository = createAssessmentAuthorityRepository();
