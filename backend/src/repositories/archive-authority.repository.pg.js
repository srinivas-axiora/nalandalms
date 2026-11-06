import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const asArray = (value) => Array.isArray(value) ? value : [];
const valueOf = (record, snake, camel, fallback = null) => (
  record?.[snake] ?? record?.[camel] ?? fallback
);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ArchiveAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ArchiveAuthorityError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new ArchiveAuthorityError(code, message, details);
};

export const mapArchiveRow = (row) => row && ({
  id: String(row.id),
  entityType: row.entity_type,
  entityId: row.entity_id,
  entityData: row.entity_data,
  relatedData: row.related_data,
  deletedBy: row.deleted_by,
  deletedByName: row.deleted_by_name,
  deletionComment: row.deletion_comment,
  deletedAt: iso(row.deleted_at),
});

const writeAudit = (client, actorId, entityType, entityId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, 'RESTORE_ARCHIVE', $2, $3, $4::jsonb)`,
  [actorId, entityType.toUpperCase(), entityId, JSON.stringify(metadata)]
);

const insertQuestion = async (client, assessmentId, question, index) => {
  const id = valueOf(question, "id", "id");
  const type = valueOf(question, "question_type", "type", "MCQ");
  const correctAnswer = question.correct_answer ?? question.answer ?? question.correctAnswer ?? null;
  const metadata = question.metadata || Object.fromEntries(
    Object.entries(question).filter(([key]) => ![
      "id", "assessment_id", "assessmentId", "question_type", "type", "prompt",
      "options", "correct_answer", "answer", "correctAnswer", "points", "sort_order", "sortOrder",
    ].includes(key))
  );
  if (id && UUID.test(String(id))) {
    await client.query(
      `INSERT INTO questions (
         id, assessment_id, question_type, prompt, options, correct_answer,
         points, sort_order, metadata
       ) VALUES ($1::uuid, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9::jsonb)`,
      [id, assessmentId, type, question.prompt, JSON.stringify(question.options || []),
        JSON.stringify(correctAnswer), Number(question.points || 10),
        Number(valueOf(question, "sort_order", "sortOrder", index)), JSON.stringify(metadata)]
    );
    return;
  }
  await client.query(
    `INSERT INTO questions (
       assessment_id, question_type, prompt, options, correct_answer,
       points, sort_order, metadata
     ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8::jsonb)`,
    [assessmentId, type, question.prompt, JSON.stringify(question.options || []),
      JSON.stringify(correctAnswer), Number(question.points || 10),
      Number(valueOf(question, "sort_order", "sortOrder", index)), JSON.stringify(metadata)]
  );
};

const insertAssessment = async (client, assessment, actorId, questions = []) => {
  const id = assessment.id;
  const courseId = valueOf(assessment, "course_id", "courseId");
  const version = Number(valueOf(assessment, "version", "version", 1)) + 1;
  await client.query(
    `INSERT INTO assessments (
       id, course_id, chapter_id, title, type, strict_mode, duration_minutes,
       pass_score, question_limit, difficulty, approval, status, owner_id,
       version, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5::assessment_type, $6, $7,
       $8, $9, $10, 'Draft', 'Inactive', $11,
       $12, COALESCE($13::timestamptz, now()), now()
     )`,
    [id, courseId, valueOf(assessment, "chapter_id", "chapterId"), assessment.title,
      assessment.type || "MCQ", valueOf(assessment, "strict_mode", "strictMode", true),
      Number(valueOf(assessment, "duration_minutes", "durationMinutes", 15)),
      Number(valueOf(assessment, "pass_score", "passScore", 70)),
      valueOf(assessment, "question_limit", "questionLimit"), assessment.difficulty || "Beginner",
      valueOf(assessment, "owner_id", "ownerId"), version,
      valueOf(assessment, "created_at", "createdAt")]
  );
  for (let index = 0; index < questions.length; index += 1) {
    await insertQuestion(client, id, questions[index], index);
  }
  await client.query(
    `INSERT INTO assessment_versions (
       assessment_id, version, snapshot, change_note, created_by
     ) VALUES (
       $1, $2,
       (SELECT to_jsonb(a) || jsonb_build_object(
          'questions', COALESCE((
            SELECT jsonb_agg(to_jsonb(q) ORDER BY q.sort_order, q.id)
            FROM questions q WHERE q.assessment_id = a.id
          ), '[]'::jsonb)
        ) FROM assessments a WHERE a.id = $1),
       'Restored from deletion archive', $3
     )`,
    [id, version, actorId]
  );
};

export function createArchiveAuthorityRepository(db = { query, withTransaction }) {
  const listArchives = async ({ entityTypes = ["User", "Course", "Assessment"], limit = 500 } = {}) => {
    const { rows } = await db.query(
      `SELECT id, entity_type, entity_id, entity_data, related_data,
              deleted_by, deleted_by_name, deletion_comment, deleted_at
       FROM deleted_archives
       WHERE entity_type = ANY($1::text[])
       ORDER BY deleted_at DESC, id DESC
       LIMIT $2`,
      [entityTypes, limit]
    );
    return rows.map(mapArchiveRow);
  };

  const findArchiveById = async (archiveId) => {
    const { rows } = await db.query(
      `SELECT id, entity_type, entity_id, entity_data, related_data,
              deleted_by, deleted_by_name, deletion_comment, deleted_at
       FROM deleted_archives WHERE id::text = $1`,
      [archiveId]
    );
    return mapArchiveRow(rows[0]);
  };

  const restoreCourse = async (client, archive, actor) => {
    const data = archive.entityData || {};
    const related = archive.relatedData || {};
    if (Number(related.archiveVersion || 0) < 2) {
      fail("ARCHIVE_INCOMPLETE", "Course archive predates complete question snapshots");
    }
    const restoredVersion = Number(valueOf(data, "current_version", "version", 1)) + 1;
    await client.query(
      `INSERT INTO courses (
         id, title, description, skill, skill_ids, target_level, prerequisites,
         category, tags, thumbnail_color, content_types, storage_metadata,
         status, approval, owner_id, current_version, difficulty,
         estimated_hours, price_cents, currency, created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12::jsonb,
         'Inactive', 'Draft', $13, $14, $15,
         $16, $17, $18, COALESCE($19::timestamptz, now()), now()
       )`,
      [archive.entity_id, data.title, data.description, data.skill || "",
        valueOf(data, "skill_ids", "skillIds", []), valueOf(data, "target_level", "targetLevel", "Beginner"),
        data.prerequisites || [], data.category || "General", data.tags || [],
        valueOf(data, "thumbnail_color", "thumbnailColor", "#22d3ee"),
        valueOf(data, "content_types", "contentTypes", ["Rich Text"]),
        JSON.stringify(valueOf(data, "storage_metadata", "storage", { files: [] })),
        valueOf(data, "owner_id", "ownerId"), restoredVersion, data.difficulty || "Beginner",
        Number(valueOf(data, "estimated_hours", "estimatedHours", 1)),
        Number(valueOf(data, "price_cents", "priceCents", 0)), data.currency || "INR",
        valueOf(data, "created_at", "createdAt")]
    );

    for (const chapter of asArray(related.chapters)) {
      await client.query(
        `INSERT INTO chapters (
           id, course_id, sequence, title, description, content_type, body, url,
           file_name, duration_minutes, minimum_time_minutes, version,
           created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12, COALESCE($13::timestamptz, now()), now()
         )`,
        [chapter.id, archive.entity_id, Number(chapter.sequence || 1), chapter.title,
          chapter.description || "", valueOf(chapter, "content_type", "contentType", "Rich Text"),
          chapter.body || "", chapter.url || null, valueOf(chapter, "file_name", "fileName"),
          Number(valueOf(chapter, "duration_minutes", "durationMinutes", 10)),
          Number(valueOf(chapter, "minimum_time_minutes", "minimumTimeMinutes", 1)),
          Number(chapter.version || 1) + 1, valueOf(chapter, "created_at", "createdAt")]
      );
    }

    const questionsByAssessment = new Map();
    for (const question of asArray(related.questions)) {
      const assessmentId = valueOf(question, "assessment_id", "assessmentId");
      if (!questionsByAssessment.has(assessmentId)) questionsByAssessment.set(assessmentId, []);
      questionsByAssessment.get(assessmentId).push(question);
    }
    for (const assessment of asArray(related.assessments)) {
      const questions = questionsByAssessment.get(assessment.id) || asArray(assessment.questions);
      await insertAssessment(client, assessment, actor.id, questions);
    }

    await client.query(
      `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
       VALUES ($1, $2, $3, $4, 'Restored from deletion archive', $5)`,
      [archive.entity_id, restoredVersion, data.title, data.description, actor.id]
    );
    await writeAudit(client, actor.id, "Course", archive.entity_id, {
      restoredStatus: "Inactive", restoredApproval: "Draft", restoredVersion,
    });
  };

  const restoreAssessment = async (client, archive, actor) => {
    const data = archive.entityData || {};
    const courseId = valueOf(data, "course_id", "courseId");
    const course = await client.query("SELECT * FROM courses WHERE id = $1 FOR UPDATE", [courseId]);
    if (!course.rows[0]) fail("ARCHIVE_PARENT_MISSING", "Assessment course no longer exists");
    const questions = asArray(archive.relatedData?.questions).length
      ? archive.relatedData.questions
      : asArray(data.questions);
    await insertAssessment(client, data, actor.id, questions);
    const { rows } = await client.query(
      `UPDATE courses SET current_version = current_version + 1,
         approval = 'Pending', updated_at = now()
       WHERE id = $1 RETURNING *`,
      [courseId]
    );
    await client.query(
      `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [courseId, rows[0].current_version, rows[0].title, rows[0].description,
        `Assessment restored: ${archive.entity_id}`, actor.id]
    );
    await writeAudit(client, actor.id, "Assessment", archive.entity_id, {
      courseId, restoredStatus: "Inactive", restoredApproval: "Draft",
    });
  };

  const restoreAuthoringArchive = async ({ archiveId, actor }) => {
    if (!UUID.test(String(archiveId))) return null;
    try {
      return await db.withTransaction(async (client) => {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [String(archiveId)]);
        const result = await client.query(
          `SELECT * FROM deleted_archives
           WHERE id = $1 AND entity_type IN ('Course', 'Assessment') FOR UPDATE`,
          [archiveId]
        );
        const row = result.rows[0];
        if (!row) return null;
        const archive = mapArchiveRow(row);
        if (archive.entityType === "Course") await restoreCourse(client, archive, actor);
        else await restoreAssessment(client, archive, actor);
        await client.query("DELETE FROM deleted_archives WHERE id = $1", [archiveId]);
        return { entityType: archive.entityType, entityId: archive.entityId };
      });
    } catch (error) {
      if (error instanceof ArchiveAuthorityError) throw error;
      if (error?.code === "23505" || error?.code === "23503") {
        fail("ARCHIVE_CONFLICT", "Archived content conflicts with current relational data");
      }
      throw error;
    }
  };

  return { listArchives, findArchiveById, restoreAuthoringArchive };
}

export const archiveAuthorityRepository = createArchiveAuthorityRepository();
