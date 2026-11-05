import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query } from "./pool.js";
import { assignmentAuthorityRepository as repository } from "../repositories/assignment-authority.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for assignment authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const ownerId = `VERIFY-ASSIGN-OWNER-${suffix}`;
const foreignManagerId = `VERIFY-ASSIGN-FOREIGN-${suffix}`;
const learnerOneId = `VERIFY-ASSIGN-LEARNER1-${suffix}`;
const learnerTwoId = `VERIFY-ASSIGN-LEARNER2-${suffix}`;
const courseId = `VERIFY-ASSIGN-COURSE-${suffix}`;
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

try {
  await query(
    `INSERT INTO users (id, name, email, role, status, manager_id)
     VALUES
       ($1, 'Assignment owner', $2, 'Manager', 'Active', NULL),
       ($3, 'Foreign manager', $4, 'Manager', 'Active', NULL),
       ($5, 'Assignment learner one', $6, 'Learner', 'Active', $1),
       ($7, 'Assignment learner two', $8, 'Learner', 'Active', $1)`,
    [
      ownerId, `${ownerId}@example.invalid`, foreignManagerId, `${foreignManagerId}@example.invalid`,
      learnerOneId, `${learnerOneId}@example.invalid`, learnerTwoId, `${learnerTwoId}@example.invalid`,
    ],
  );
  await query(
    `INSERT INTO courses (id, title, description, skill, status, approval, owner_id)
     VALUES ($1, 'Assignment verification', 'Synthetic transactional assignment course',
       'Security', 'Active', 'Approved', $2)`,
    [courseId, ownerId],
  );

  await assert.rejects(
    repository.assignCourse({
      courseId, actor: { id: foreignManagerId, role: "Manager" },
      assignees: [{ userId: learnerOneId, enrollmentId: `VERIFY-ENR-FOREIGN-${suffix}` }],
      dueAt: null, priority: "Medium", mandatory: false,
    }),
    (error) => error?.code === "FORBIDDEN",
  );
  checks.push("foreign Manager cannot assign the owner's course");

  const first = await repository.assignCourse({
    courseId, actor: { id: ownerId, role: "Manager" },
    assignees: [{ userId: learnerOneId, enrollmentId: `VERIFY-ENR-ONE-${suffix}` }],
    dueAt: "2026-12-01", priority: "High", mandatory: true,
  });
  ok("owning Manager assigns an active direct report", first.length === 1 && first[0].userId === learnerOneId);

  await assert.rejects(
    repository.assignCourse({
      courseId, actor: { id: ownerId, role: "Manager" },
      assignees: [{ userId: learnerOneId, enrollmentId: `VERIFY-ENR-DUP-${suffix}` }],
      dueAt: null, priority: "Medium", mandatory: false,
    }),
    (error) => error?.code === "ALREADY_ASSIGNED",
  );
  checks.push("duplicate assignment is rejected before mutation");

  const raced = await Promise.allSettled([
    repository.assignCourse({
      courseId, actor: { id: ownerId, role: "Manager" },
      assignees: [{ userId: learnerTwoId, enrollmentId: `VERIFY-ENR-RACE-A-${suffix}` }],
      dueAt: null, priority: "Medium", mandatory: false,
    }),
    repository.assignCourse({
      courseId, actor: { id: ownerId, role: "Manager" },
      assignees: [{ userId: learnerTwoId, enrollmentId: `VERIFY-ENR-RACE-B-${suffix}` }],
      dueAt: null, priority: "Medium", mandatory: false,
    }),
  ]);
  ok(
    "concurrent duplicate assignment produces one commit and one stable conflict",
    raced.filter((result) => result.status === "fulfilled").length === 1
      && raced.filter((result) => result.status === "rejected" && result.reason?.code === "ALREADY_ASSIGNED").length === 1,
  );

  const evidence = await query(
    `SELECT
       (SELECT count(*) FROM enrollments WHERE course_id = $1)::integer AS enrollments,
       (SELECT count(*) FROM audit_logs
        WHERE entity_type = 'COURSE' AND entity_id = $1 AND action = 'ASSIGN_COURSE')::integer AS audits`,
    [courseId],
  );
  ok("each committed assignment has durable audit evidence", Number(evidence.rows[0].enrollments) === 2 && Number(evidence.rows[0].audits) === 2);

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Assignment authority verification passed (${checks.length} checks).`);
} finally {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    await query("DELETE FROM audit_logs WHERE entity_type = 'COURSE' AND entity_id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM enrollments WHERE course_id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM courses WHERE id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerOneId, learnerTwoId, foreignManagerId, ownerId]]).catch(() => {});
  }
  await closePool();
}
