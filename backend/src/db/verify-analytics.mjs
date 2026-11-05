import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query } from "./pool.js";
import { analyticsRepository as repository } from "../repositories/analytics.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for analytics authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const managerId = `VERIFY-ANALYTICS-MANAGER-${suffix}`;
const learnerId = `VERIFY-ANALYTICS-LEARNER-${suffix}`;
const outsiderId = `VERIFY-ANALYTICS-OUTSIDER-${suffix}`;
const courseId = `VERIFY-ANALYTICS-COURSE-${suffix}`;
const chapterId = `VERIFY-ANALYTICS-CHAPTER-${suffix}`;
const assessmentId = `VERIFY-ANALYTICS-ASSESSMENT-${suffix}`;
const enrollmentId = `VERIFY-ANALYTICS-ENROLLMENT-${suffix}`;
const attemptId = `VERIFY-ANALYTICS-ATTEMPT-${suffix}`;
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

try {
  await query(
    `INSERT INTO users (id, name, email, role, status, manager_id)
     VALUES
       ($1, 'Analytics manager', $2, 'Manager', 'Active', NULL),
       ($3, 'Analytics learner', $4, 'Learner', 'Active', $1),
       ($5, 'Analytics outsider', $6, 'Learner', 'Active', NULL)`,
    [managerId, `${managerId}@example.invalid`, learnerId, `${learnerId}@example.invalid`, outsiderId, `${outsiderId}@example.invalid`],
  );
  await query(
    `INSERT INTO courses (id, title, description, skill, status, approval, owner_id)
     VALUES ($1, 'Analytics verification', 'Synthetic relational analytics course',
       'Security', 'Active', 'Approved', $2)`,
    [courseId, managerId],
  );
  await query(
    `INSERT INTO chapters (id, course_id, sequence, title, minimum_time_minutes)
     VALUES ($1, $2, 1, 'Analytics chapter', 10)`,
    [chapterId, courseId],
  );
  await query(
    `INSERT INTO assessments (
       id, course_id, chapter_id, title, type, duration_minutes, pass_score,
       approval, status, owner_id
     ) VALUES ($1, $2, $3, 'Analytics assessment', 'MCQ', 15, 70,
       'Approved', 'Active', $4)`,
    [assessmentId, courseId, chapterId, managerId],
  );
  await query(
    `INSERT INTO enrollments (
       id, course_id, user_id, assigned_by, progress, time_spent_seconds, status
     ) VALUES ($1, $2, $3, $4, 80, 900, 'InProgress')`,
    [enrollmentId, courseId, learnerId, managerId],
  );
  await query(
    `INSERT INTO chapter_time_totals (user_id, course_id, chapter_id, time_spent_seconds)
     VALUES ($1, $2, $3, 700)`,
    [learnerId, courseId, chapterId],
  );
  await query(
    `INSERT INTO learning_time_events (
       user_id, course_id, chapter_id, event_type, seconds_spent, idempotency_key
     ) VALUES ($1, $2, $3, 'CHAPTER_TIME', 30, $4)`,
    [learnerId, courseId, chapterId, `verify-analytics-${suffix}`],
  );
  await query(
    `INSERT INTO assessment_attempts (
       id, assessment_id, chapter_id, course_id, user_id, status, score,
       max_score, time_spent_seconds
     ) VALUES ($1, $2, $3, $4, $5, 'Passed', 80, 100, 120)`,
    [attemptId, assessmentId, chapterId, courseId, learnerId],
  );

  const team = await repository.teamOverview(managerId);
  ok(
    "team analytics are derived from direct-report relational rows",
    team.members.length === 1 && team.members[0].id === learnerId && team.completionRate === 80,
  );

  const personal = await repository.personalOverview(learnerId);
  ok(
    "personal analytics use the subject's enrollment",
    personal.userId === learnerId && personal.progress === 80 && personal.pendingCourses === 1,
  );

  const time = await repository.timeRows({ id: managerId, role: "Manager" });
  const syntheticRow = time.find((row) => row.userId === learnerId && row.courseId === courseId && row.chapterId === chapterId);
  ok(
    "time analytics reconcile canonical chapter, assessment and course totals",
    syntheticRow?.chapterTimeSeconds === 700
      && syntheticRow?.assessmentTimeSeconds === 120
      && syntheticRow?.courseTimeSeconds === 900
      && syntheticRow?.minimumTimeMet === true,
  );

  const eventCount = await repository.countTimeEvents({ id: managerId, role: "Manager" });
  const events = await repository.listTimeEvents({ actor: { id: managerId, role: "Manager" }, limit: 10 });
  ok(
    "event count and listing share manager scope",
    eventCount >= 1 && events.some((event) => event.userId === learnerId && event.courseId === courseId),
  );
  ok(
    "unrelated identities are absent from manager analytics",
    !team.members.some((member) => member.id === outsiderId)
      && !time.some((row) => row.userId === outsiderId)
      && !events.some((event) => event.userId === outsiderId),
  );

  const global = await repository.globalOverview();
  ok("global analytics are database-derived numeric metrics", Number.isInteger(global.users) && Number.isInteger(global.averageScore));

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Analytics authority verification passed (${checks.length} checks).`);
} finally {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    await query("DELETE FROM assessment_attempts WHERE id = $1", [attemptId]).catch(() => {});
    await query("DELETE FROM learning_time_events WHERE course_id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM chapter_time_totals WHERE course_id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]).catch(() => {});
    await query("DELETE FROM assessments WHERE id = $1", [assessmentId]).catch(() => {});
    await query("DELETE FROM chapters WHERE id = $1", [chapterId]).catch(() => {});
    await query("DELETE FROM courses WHERE id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerId, outsiderId, managerId]]).catch(() => {});
  }
  await closePool();
}
