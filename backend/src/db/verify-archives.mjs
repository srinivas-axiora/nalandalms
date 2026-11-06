import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, withTransaction } from "./pool.js";
import { createCourseAuthorityRepository } from "../repositories/courses-authority.repository.pg.js";
import { createArchiveAuthorityRepository } from "../repositories/archive-authority.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for archive authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const actorId = `VERIFY-ARCHIVE-ADMIN-${suffix}`;
const courseId = `VERIFY-ARCHIVE-COURSE-${suffix}`;
const chapterId = `VERIFY-ARCHIVE-CHAPTER-${suffix}`;
const assessmentId = `VERIFY-ARCHIVE-ASSESSMENT-${suffix}`;
const checks = [];
const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = { query: client.query.bind(client), withTransaction: (fn) => fn(client) };
    const courses = createCourseAuthorityRepository(db);
    const archives = createArchiveAuthorityRepository(db);
    const actor = { id: actorId, name: "Archive verifier", role: "Super Admin" };

    const shape = await client.query(
      `SELECT
         to_regclass('public.uq_deleted_archives_source_key') IS NOT NULL AS source_index,
         to_regclass('public.idx_deleted_archives_order') IS NOT NULL AS order_index,
         EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deleted_archives_json_shape') AS shape_constraint`
    );
    ok("archive integrity and ordering controls exist", Object.values(shape.rows[0] || {}).every(Boolean));

    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES ($1, 'Archive verifier', $2, 'Super Admin', 'Active')`,
      [actorId, `${actorId}@example.invalid`]
    );
    await client.query(
      `INSERT INTO courses (
         id, title, description, owner_id, status, approval, current_version
       ) VALUES ($1, 'Archive authority verification', 'Synthetic restore drill', $2, 'Active', 'Approved', 1)`,
      [courseId, actorId]
    );
    await client.query(
      `INSERT INTO chapters (id, course_id, title, body)
       VALUES ($1, $2, 'Archived chapter', 'Synthetic protected content')`,
      [chapterId, courseId]
    );
    await client.query(
      `INSERT INTO assessments (
         id, course_id, chapter_id, title, type, duration_minutes, pass_score,
         approval, status, owner_id
       ) VALUES ($1, $2, $3, 'Archived assessment', 'MCQ', 20, 70, 'Approved', 'Active', $4)`,
      [assessmentId, courseId, chapterId, actorId]
    );
    await client.query(
      `INSERT INTO questions (
         assessment_id, question_type, prompt, options, correct_answer, points, sort_order
       ) VALUES ($1, 'MCQ', 'Synthetic question?', '["yes","no"]'::jsonb, '0'::jsonb, 10, 0)`,
      [assessmentId]
    );

    await courses.archiveAndDelete({
      id: courseId,
      actor,
      expectedVersion: 1,
      deletionComment: "Synthetic complete archive and restore verification",
    });
    const listed = await archives.listArchives({ entityTypes: ["Course"] });
    const archived = listed.find((item) => item.entityId === courseId);
    ok("course archive is durable and discoverable", Boolean(archived));
    ok(
      "course archive captures chapters, assessments and questions",
      archived?.relatedData?.archiveVersion === 2
        && archived.relatedData.chapters.length === 1
        && archived.relatedData.assessments.length === 1
        && archived.relatedData.questions.length === 1
    );

    const restored = await archives.restoreAuthoringArchive({ archiveId: archived.id, actor });
    ok("archive restore returns the original entity identity", restored?.entityId === courseId);
    const state = await client.query(
      `SELECT
         (SELECT count(*) FROM deleted_archives WHERE id = $1)::integer AS archives,
         (SELECT count(*) FROM courses WHERE id = $2 AND status = 'Inactive' AND approval = 'Draft')::integer AS courses,
         (SELECT count(*) FROM chapters WHERE id = $3)::integer AS chapters,
         (SELECT count(*) FROM assessments WHERE id = $4 AND status = 'Inactive' AND approval = 'Draft')::integer AS assessments,
         (SELECT count(*) FROM questions WHERE assessment_id = $4)::integer AS questions,
         (SELECT count(*) FROM audit_logs WHERE action = 'RESTORE_ARCHIVE' AND entity_id = $2)::integer AS audits`,
      [archived.id, courseId, chapterId, assessmentId]
    );
    ok(
      "restore is complete, review-gated and consumes the archive",
      Number(state.rows[0].archives) === 0
        && Number(state.rows[0].courses) === 1
        && Number(state.rows[0].chapters) === 1
        && Number(state.rows[0].assessments) === 1
        && Number(state.rows[0].questions) === 1
        && Number(state.rows[0].audits) === 1
    );

    await client.query("DELETE FROM assessments WHERE id = $1", [assessmentId]);
    await client.query("DELETE FROM course_versions WHERE course_id = $1", [courseId]);
    await client.query("DELETE FROM chapters WHERE course_id = $1", [courseId]);
    await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
    await client.query("DELETE FROM audit_logs WHERE entity_id = ANY($1::text[])", [[courseId, assessmentId]]);
    await client.query("DELETE FROM users WHERE id = $1", [actorId]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Archive authority verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
