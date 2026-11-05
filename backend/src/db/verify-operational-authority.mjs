import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query } from "./pool.js";
import { settingsRepository } from "../repositories/settings.repository.pg.js";
import * as skillsRepository from "../repositories/skills.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for operational authority verification");
}

const suffix = crypto.randomBytes(5).toString("hex");
const managerId = `VERIFY-OPS-MGR-${suffix}`;
const adminId = `VERIFY-OPS-ADMIN-${suffix}`;
const learnerId = `VERIFY-OPS-USR-${suffix}`;
const outsiderId = `VERIFY-OPS-OUT-${suffix}`;
const courseId = `VERIFY-OPS-CRS-${suffix}`;
const chapterId = `VERIFY-OPS-CH-${suffix}`;
const enrollmentId = `VERIFY-OPS-ENR-${suffix}`;
const feedbackId = `VERIFY-OPS-FB-${suffix}`;
const ratingId = `VERIFY-OPS-RATE-${suffix}`;
let originalSettings = null;
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

try {
  originalSettings = await settingsRepository.getProctoring();
  await query(
    `INSERT INTO users (id, name, email, role, status, manager_id)
     VALUES
       ($1, 'Operations manager', $2, 'Manager', 'Active', NULL),
       ($3, 'Operations learner', $4, 'Learner', 'Active', $1),
       ($5, 'Operations outsider', $6, 'Learner', 'Active', NULL),
       ($7, 'Operations admin', $8, 'Admin', 'Active', NULL)`,
    [managerId, `${managerId}@example.invalid`, learnerId, `${learnerId}@example.invalid`, outsiderId, `${outsiderId}@example.invalid`, adminId, `${adminId}@example.invalid`],
  );
  await query(
    `INSERT INTO courses (id, title, description, skill, status, approval, owner_id)
     VALUES ($1, 'Operational verification', 'Synthetic', 'Security', 'Active', 'Approved', $2)`,
    [courseId, managerId],
  );
  await query(
    "INSERT INTO chapters (id, course_id, sequence, title) VALUES ($1, $2, 1, 'Verification chapter')",
    [chapterId, courseId],
  );
  await query(
    `INSERT INTO enrollments (id, course_id, user_id, assigned_by, status)
     VALUES ($1, $2, $3, $4, 'Enrolled')`,
    [enrollmentId, courseId, learnerId, managerId],
  );
  await query(
    `INSERT INTO skill_ratings (id, user_id, skill, score, assessments_based, trend)
     VALUES ($1, $2, 'Security', 82, 2, 'up')`,
    [ratingId, learnerId],
  );

  const feedback = await skillsRepository.upsertChapterFeedback({
    actor: { id: learnerId, role: "Learner" },
    feedback: { id: feedbackId, chapterId, courseId, rating: 5, clarity: 4, relevance: 5, comments: "Synthetic verification" },
  });
  ok("enrolled learner can persist matching chapter feedback", feedback.userId === learnerId);

  await assert.rejects(
    skillsRepository.upsertChapterFeedback({
      actor: { id: outsiderId, role: "Learner" },
      feedback: { id: `${feedbackId}-OUT`, chapterId, courseId, rating: 5, clarity: 5, relevance: 5, comments: "Must fail" },
    }),
    (error) => error?.code === "FEEDBACK_SCOPE_DENIED",
  );
  checks.push("unenrolled learner cannot submit chapter feedback");

  const managerRatings = await skillsRepository.listSkillRatings({ id: managerId, role: "Manager" });
  const outsiderRatings = await skillsRepository.listSkillRatings({ id: outsiderId, role: "Learner" });
  ok("manager rating projection includes direct report", managerRatings.some((item) => item.id === ratingId));
  ok("outsider rating projection excludes foreign learner", !outsiderRatings.some((item) => item.id === ratingId));

  const changedThreshold = originalSettings.noiseThreshold === 99 ? 98 : 99;
  const updated = await settingsRepository.updateProctoring({
    actorId: adminId,
    patch: { noiseThreshold: changedThreshold },
  });
  ok("settings update is durable and bounded", updated.noiseThreshold === changedThreshold);
  const audit = await query(
    `SELECT count(*)::integer AS count FROM audit_logs
     WHERE actor_id = $1 AND action = 'UPDATE_SETTINGS' AND entity_id = 'proctoring'`,
    [adminId],
  );
  ok("settings update commits audit evidence", audit.rows[0]?.count === 1);

  checks.forEach((check) => console.log(`ok - ${check}`));
  console.log(`Operational authority verification passed (${checks.length} checks).`);
} finally {
  if (originalSettings) {
    await query(
      `UPDATE system_settings SET value = $1::jsonb, updated_by = NULL, updated_at = now()
       WHERE key = 'proctoring'`,
      [JSON.stringify(originalSettings)],
    ).catch(() => {});
  }
  await query("DELETE FROM audit_logs WHERE actor_id = ANY($1::text[])", [[adminId, managerId, learnerId, outsiderId]]).catch(() => {});
  await query("DELETE FROM chapter_feedbacks WHERE id LIKE $1", [`${feedbackId}%`]).catch(() => {});
  await query("DELETE FROM skill_ratings WHERE id = $1", [ratingId]).catch(() => {});
  await query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]).catch(() => {});
  await query("DELETE FROM chapters WHERE id = $1", [chapterId]).catch(() => {});
  await query("DELETE FROM courses WHERE id = $1", [courseId]).catch(() => {});
  await query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerId, outsiderId, managerId, adminId]]).catch(() => {});
  await closePool();
}
