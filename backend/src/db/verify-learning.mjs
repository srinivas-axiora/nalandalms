import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, withTransaction } from "./pool.js";
import { createLearningAuthorityRepository } from "../repositories/learning-authority.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for learning authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const adminId = `VERIFY-LEARNING-ADMIN-${suffix}`;
const ownerId = `VERIFY-LEARNING-OWNER-${suffix}`;
const learnerId = `VERIFY-LEARNING-LEARNER-${suffix}`;
const courseId = `VERIFY-LEARNING-COURSE-${suffix}`;
const enrollmentId = `VERIFY-LEARNING-ENROLLMENT-${suffix}`;
const firstChapterId = `VERIFY-LEARNING-CH1-${suffix}`;
const secondChapterId = `VERIFY-LEARNING-CH2-${suffix}`;
const idempotencyKey = `verify-heartbeat-${suffix}`;
const checks = [];
const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = { query: client.query.bind(client), withTransaction: (fn) => fn(client) };
    const repository = createLearningAuthorityRepository(db);
    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES
         ($1, 'Learning verifier admin', $2, 'Admin', 'Active'),
         ($3, 'Learning verifier owner', $4, 'Manager', 'Active'),
         ($5, 'Learning verifier learner', $6, 'Learner', 'Active')`,
      [
        adminId, `${adminId}@example.invalid`,
        ownerId, `${ownerId}@example.invalid`,
        learnerId, `${learnerId}@example.invalid`,
      ]
    );
    await client.query(
      `INSERT INTO courses (
         id, title, description, skill, status, approval, owner_id, current_version
       ) VALUES ($1, 'Learning authority verification',
         'Synthetic chapter and progress verification course', 'Security',
         'Active', 'Approved', $2, 1)`,
      [courseId, ownerId]
    );

    const admin = { id: adminId, role: "Admin" };
    const first = await repository.createChapter({
      courseId,
      actor: admin,
      expectedCourseVersion: 1,
      chapter: {
        id: firstChapterId,
        title: "Transactional foundation",
        body: "Protected first chapter body",
        minimumTimeMinutes: 0,
      },
    });
    const second = await repository.createChapter({
      courseId,
      actor: admin,
      expectedCourseVersion: first.courseVersion,
      chapter: {
        id: secondChapterId,
        title: "Transactional advanced chapter",
        body: "Protected second chapter body",
        minimumTimeMinutes: 1,
      },
    });
    ok("chapter writes advance the course version", second.courseVersion === 3);

    await client.query(
      `INSERT INTO enrollments (id, course_id, user_id, assigned_by)
       VALUES ($1, $2, $3, $3)`,
      [enrollmentId, courseId, learnerId]
    );
    const before = await repository.listForActor({
      courseId,
      actor: { id: learnerId, role: "Learner" },
    });
    ok(
      "locked chapter content is redacted",
      before.chapters[1].isLocked === true
        && before.chapters[1].body === undefined
        && before.chapters[1].url === undefined
    );

    const recorded = await repository.recordHeartbeat({
      courseId,
      chapterId: firstChapterId,
      userId: learnerId,
      idempotencyKey,
      incrementSeconds: 30,
      currentPositionSeconds: 9_999,
    });
    ok(
      "server-clamped time completes the first chapter without trusting video position",
      recorded.effectiveIncrement === 15 && recorded.justCompleted === true
    );
    const replay = await repository.recordHeartbeat({
      courseId,
      chapterId: firstChapterId,
      userId: learnerId,
      idempotencyKey,
      incrementSeconds: 30,
      currentPositionSeconds: 9_999,
    });
    ok("heartbeat retry is idempotent", replay.replayed === true && replay.chapterTimeSeconds === 15);

    const after = await repository.listForActor({
      courseId,
      actor: { id: learnerId, role: "Learner" },
    });
    ok("completion unlocks the next chapter", after.chapters[1].isLocked === false);

    await assert.rejects(
      repository.recordHeartbeat({
        courseId,
        chapterId: firstChapterId,
        userId: learnerId,
        idempotencyKey: `${idempotencyKey}-rapid`,
        incrementSeconds: 15,
      }),
      (error) => error?.code === "HEARTBEAT_TOO_SOON"
    );
    checks.push("rapid heartbeat accumulation is rejected by the database clock");

    const evidence = await client.query(
      `SELECT
         (SELECT count(*) FROM learning_time_events
          WHERE user_id = $1 AND course_id = $2)::integer AS events,
         (SELECT time_spent_seconds FROM chapter_time_totals
          WHERE user_id = $1 AND course_id = $2 AND chapter_id = $3) AS total,
         (SELECT count(*) FROM audit_logs
          WHERE actor_id = $1 AND entity_type = 'CHAPTER')::integer AS audits`,
      [learnerId, courseId, firstChapterId]
    );
    ok(
      "canonical totals, one event and audit evidence commit together",
      Number(evidence.rows[0].events) === 1
        && Number(evidence.rows[0].total) === 15
        && Number(evidence.rows[0].audits) >= 1
    );

    await client.query("DELETE FROM learning_time_events WHERE course_id = $1", [courseId]);
    await client.query("DELETE FROM chapter_time_totals WHERE course_id = $1", [courseId]);
    await client.query("DELETE FROM enrollments WHERE course_id = $1", [courseId]);
    await client.query("DELETE FROM audit_logs WHERE entity_id = ANY($1::text[])", [[courseId, firstChapterId, secondChapterId]]);
    await client.query("DELETE FROM course_versions WHERE course_id = $1", [courseId]);
    await client.query("DELETE FROM courses WHERE id = $1", [courseId]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerId, ownerId, adminId]]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Learning authority verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
