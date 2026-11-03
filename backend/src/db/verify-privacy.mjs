import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, withTransaction } from "./pool.js";
import { createPrivacyPgRepository } from "../repositories/privacy.repository.pg.js";
import { runPrivacyErasureBatch } from "../workers/privacy-erasure.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for privacy verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const adminId = `VERIFY-PRIVACY-ADMIN-${suffix}`;
const subjectId = `VERIFY-PRIVACY-SUBJECT-${suffix}`;
const courseId = `VERIFY-PRIVACY-COURSE-${suffix}`;
const chapterId = `VERIFY-PRIVACY-CHAPTER-${suffix}`;
const assessmentId = `VERIFY-PRIVACY-ASSESSMENT-${suffix}`;
const attemptId = `VERIFY-PRIVACY-ATTEMPT-${suffix}`;
const enrollmentId = `VERIFY-PRIVACY-ENROLLMENT-${suffix}`;
const feedbackId = `VERIFY-PRIVACY-FEEDBACK-${suffix}`;
const ratingId = `VERIFY-PRIVACY-RATING-${suffix}`;
const linkId = `VERIFY-PRIVACY-LINK-${suffix}`;
const submissionId = `VERIFY-PRIVACY-SUBMISSION-${suffix}`;
const requestId = `VERIFY-PRIVACY-REQUEST-${suffix}`;
const subjectEmail = `privacy.subject.${suffix}@example.invalid`;
const objectKeys = [
  `proctoring/${attemptId}/chunk.webm`,
  `proctoring/${attemptId}/capture.jpg`,
  `reports/${subjectId}/export.json`,
];
const checks = [];

const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = { query: client.query.bind(client), withTransaction: (fn) => fn(client) };
    const repository = createPrivacyPgRepository(db, `verify-privacy-${"p".repeat(64)}`);

    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES
         ($1, 'Privacy verifier admin', $2, 'Admin', 'Active'),
         ($3, 'Privacy verifier subject', $4, 'Learner', 'Active')`,
      [adminId, `${adminId}@example.invalid`, subjectId, subjectEmail]
    );
    await client.query(
      `INSERT INTO courses (id, title, description, owner_id, status, approval)
       VALUES ($1, 'Privacy verification', 'Synthetic erasure evidence', $2, 'Active', 'Approved')`,
      [courseId, adminId]
    );
    await client.query(
      `INSERT INTO chapters (id, course_id, sequence, title)
       VALUES ($1, $2, 1, 'Privacy verification chapter')`,
      [chapterId, courseId]
    );
    await client.query(
      `INSERT INTO assessments (
         id, course_id, chapter_id, title, type, duration_minutes,
         pass_score, approval, status, owner_id
       ) VALUES ($1, $2, $3, 'Privacy verification assessment', 'MCQ', 30, 70, 'Approved', 'Active', $4)`,
      [assessmentId, courseId, chapterId, adminId]
    );
    const question = await client.query(
      `INSERT INTO questions (assessment_id, question_type, prompt, options, correct_answer, points)
       VALUES ($1, 'MCQ', 'Synthetic question', '["No","Yes"]'::jsonb, '1'::jsonb, 10)
       RETURNING id`,
      [assessmentId]
    );
    await client.query(
      `INSERT INTO enrollments (id, course_id, user_id, assigned_by, status)
       VALUES ($1, $2, $3, $4, 'InProgress')`,
      [enrollmentId, courseId, subjectId, adminId]
    );
    await client.query(
      `INSERT INTO assessment_attempts (
         id, assessment_id, chapter_id, course_id, user_id, status,
         answers, question_map, flags, warnings, video_chunks, submitted_at
       ) VALUES (
         $1, $2, $3, $4, $5, 'Passed',
         '{"synthetic":"answer"}'::jsonb, '{"synthetic":"map"}'::jsonb,
         '[{"synthetic":true}]'::jsonb, '[{"synthetic":true}]'::jsonb,
         $6::jsonb, now()
       )`,
      [attemptId, assessmentId, chapterId, courseId, subjectId,
        JSON.stringify([{ key: objectKeys[0], chunkIndex: 0 }])]
    );
    await client.query(
      `INSERT INTO assessment_answers (attempt_id, question_id, answer)
       VALUES ($1, $2, '{"synthetic":"answer"}'::jsonb)`,
      [attemptId, question.rows[0].id]
    );
    await client.query(
      `INSERT INTO proctoring_logs (
         id, attempt_id, user_id, event_type, severity, capture_key, metadata
       ) VALUES ($1, $2, $3, 'TAB_SWITCH', 'high', $4, '{"synthetic":true}'::jsonb)`,
      [`VERIFY-PRIVACY-LOG-${suffix}`, attemptId, subjectId, objectKeys[1]]
    );
    await client.query(
      `INSERT INTO proctor_captures (assessment_id, course_id, chapter_id, user_id, image_data_url)
       VALUES ($1, $2, $3, $4, 'data:image/jpeg;base64,c3ludGhldGlj')`,
      [assessmentId, courseId, chapterId, subjectId]
    );
    await client.query(
      `INSERT INTO chapter_feedbacks (
         id, chapter_id, course_id, user_id, rating, clarity, relevance, comments
       ) VALUES ($1, $2, $3, $4, 5, 5, 5, 'Synthetic personal feedback')`,
      [feedbackId, chapterId, courseId, subjectId]
    );
    await client.query(
      `INSERT INTO skill_ratings (id, user_id, skill, score)
       VALUES ($1, $2, 'Synthetic privacy skill', 80)`,
      [ratingId, subjectId]
    );
    await client.query(
      `INSERT INTO learning_time_events (
         user_id, course_id, chapter_id, assessment_id, event_type, seconds_spent
       ) VALUES ($1, $2, $3, $4, 'ASSESSMENT_TIME', 60)`,
      [subjectId, courseId, chapterId, assessmentId]
    );
    await client.query(
      `INSERT INTO report_exports (requested_by, report_type, format, storage_key)
       VALUES ($1, 'User', 'PDF', $2)`,
      [subjectId, objectKeys[2]]
    );
    await client.query(
      `INSERT INTO candidate_assessment_links (
         id, token_hash, token_hint, assessment_id, title, course_id, course_title,
         duration_minutes, pass_score, question_limit, question_snapshot,
         created_by, created_by_name
       ) VALUES (
         $1, $2, 'verifier', $3, 'Privacy candidate link', $4, 'Privacy verification',
         30, 70, 1, $5::jsonb, $6, 'Privacy verifier subject'
       )`,
      [linkId, crypto.createHash("sha256").update(`link-${suffix}`).digest("hex"),
        assessmentId, courseId,
        JSON.stringify([{ id: "Q-1", prompt: "Synthetic", type: "MCQ", answer: 1, points: 10 }]),
        subjectId]
    );
    await client.query(
      `INSERT INTO candidate_assessment_submissions (
         id, link_id, attempt_token_hash, candidate_name, candidate_email,
         expires_at, status, question_ids, max_score
       ) VALUES ($1, $2, $3, 'Privacy verifier subject', $4, now() + interval '1 hour',
                 'InProgress', ARRAY['Q-1'], 10)`,
      [submissionId, linkId,
        crypto.createHash("sha256").update(`attempt-${suffix}`).digest("hex"), subjectEmail]
    );

    const exported = await repository.exportUserData(subjectId);
    ok(
      "portable export covers normalized profile, learning, transactions and candidate data",
      exported?.profile?.email === subjectEmail
        && exported.learning.examAttempts.length === 1
        && exported.candidateAssessments.length === 1
    );

    const requested = await repository.requestErasure({
      id: requestId,
      userId: subjectId,
      confirmEmail: subjectEmail.toUpperCase(),
      reason: "Synthetic verified request for complete account erasure",
      graceDays: 30,
    });
    ok(
      "request intake is durable and starts in review",
      requested.created === true && requested.request.status === "PendingReview"
    );
    const idempotent = await repository.requestErasure({
      id: `${requestId}-DUPLICATE`,
      userId: subjectId,
      confirmEmail: subjectEmail,
      reason: "Synthetic duplicate account erasure request",
      graceDays: 30,
    });
    ok("one active request is enforced", idempotent.created === false && idempotent.request.id === requestId);

    await client.query(
      "UPDATE privacy_requests SET grace_ends_at = now() - interval '1 second' WHERE id = $1",
      [requestId]
    );
    const approved = await repository.review({
      requestId,
      actorId: adminId,
      decision: "APPROVE",
      reason: "Synthetic legal-basis and retention review completed",
    });
    ok("administrator review creates an approved durable state", approved.status === "Approved");

    const deletedKeys = [];
    const batch = await runPrivacyErasureBatch({
      limit: 1,
      repository,
      deleteFn: async (key) => { deletedKeys.push(key); return true; },
    });
    ok(
      "worker deletes every discovered object before finalization",
      batch.completed === 1
        && batch.objectsDeleted === objectKeys.length
        && objectKeys.every((key) => deletedKeys.includes(key))
    );

    const completed = await repository.getForUser(subjectId);
    const subject = await client.query("SELECT * FROM users WHERE id = $1", [subjectId]);
    const attempt = await client.query("SELECT * FROM assessment_attempts WHERE id = $1", [attemptId]);
    const removed = await client.query(
      `SELECT
         (SELECT count(*) FROM assessment_answers WHERE attempt_id = $1)::integer AS answers,
         (SELECT count(*) FROM proctoring_logs WHERE user_id = $2)::integer AS proctor_logs,
         (SELECT count(*) FROM proctor_captures WHERE user_id = $2)::integer AS captures,
         (SELECT count(*) FROM chapter_feedbacks WHERE user_id = $2)::integer AS feedbacks,
         (SELECT count(*) FROM skill_ratings WHERE user_id = $2)::integer AS ratings,
         (SELECT count(*) FROM report_exports WHERE requested_by = $2)::integer AS reports`,
      [attemptId, subjectId]
    );
    const candidate = await client.query(
      "SELECT * FROM candidate_assessment_submissions WHERE id = $1",
      [submissionId]
    );
    const objectEvidence = await client.query(
      "SELECT status, object_key, object_key_sha256 FROM privacy_erasure_objects WHERE request_id = $1",
      [requestId]
    );
    ok(
      "identity is pseudonymized and every session is revoked",
      completed?.status === "Completed"
        && subject.rows[0]?.status === "Inactive"
        && String(subject.rows[0]?.email).endsWith("@privacy.invalid")
        && subject.rows[0]?.password_hash === null
        && Number(subject.rows[0]?.session_version) > 0
    );
    ok(
      "assessment evidence is minimized and direct personal stores are erased",
      Object.keys(attempt.rows[0]?.answers || {}).length === 0
        && Object.values(removed.rows[0] || {}).every((count) => Number(count) === 0)
    );
    ok(
      "candidate identity and responses are pseudonymized",
      String(candidate.rows[0]?.candidate_email).endsWith("@privacy.invalid")
        && Object.keys(candidate.rows[0]?.answers || {}).length === 0
    );
    ok(
      "object keys are removed while non-PII deletion hashes remain",
      objectEvidence.rows.length === objectKeys.length
        && objectEvidence.rows.every((row) => row.status === "Deleted"
          && row.object_key === null
          && /^[a-f0-9]{64}$/.test(row.object_key_sha256))
    );
    ok(
      "completion evidence is durable and contains no original email",
      completed?.reason === "[erased after completion]"
        && completed?.completionEvidence?.policyVersion === "normalized-v1"
        && !JSON.stringify(completed.completionEvidence).includes(subjectEmail)
    );

    await client.query(
      `DELETE FROM audit_logs
       WHERE actor_id = ANY($1::text[])
          OR (entity_type = 'PRIVACY_REQUEST' AND entity_id = $2)`,
      [[adminId, subjectId], requestId]
    );
    await client.query("DELETE FROM candidate_assessment_links WHERE id = $1", [linkId]);
    await client.query("DELETE FROM privacy_requests WHERE id = $1", [requestId]);
    await client.query("DELETE FROM assessment_attempts WHERE id = $1", [attemptId]);
    await client.query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]);
    await client.query("DELETE FROM questions WHERE id = $1", [question.rows[0].id]);
    await client.query("DELETE FROM assessments WHERE id = $1", [assessmentId]);
    await client.query("DELETE FROM chapters WHERE id = $1", [chapterId]);
    await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[subjectId, adminId]]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Privacy verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
