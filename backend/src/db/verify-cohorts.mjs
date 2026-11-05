import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query } from "./pool.js";
import {
  cohortAuthorityRepository as repository,
  hashCohortInviteCode,
} from "../repositories/cohort-authority.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for cohort authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const ownerId = `VERIFY-COHORT-OWNER-${suffix}`;
const foreignManagerId = `VERIFY-COHORT-FOREIGN-${suffix}`;
const learnerOneId = `VERIFY-COHORT-LEARNER1-${suffix}`;
const learnerTwoId = `VERIFY-COHORT-LEARNER2-${suffix}`;
const courseId = `VERIFY-COHORT-COURSE-${suffix}`;
const cohortId = `VERIFY-COHORT-${suffix}`;
const inviteCode = `NLD-${crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
const inviteCodeHash = hashCohortInviteCode(inviteCode);
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

try {
  await query(
    `INSERT INTO users (id, name, email, role, status)
     VALUES
       ($1, 'Cohort owner', $2, 'Manager', 'Active'),
       ($3, 'Foreign manager', $4, 'Manager', 'Active'),
       ($5, 'Cohort learner one', $6, 'Learner', 'Active'),
       ($7, 'Cohort learner two', $8, 'Learner', 'Active')`,
    [
      ownerId, `${ownerId}@example.invalid`, foreignManagerId, `${foreignManagerId}@example.invalid`,
      learnerOneId, `${learnerOneId}@example.invalid`, learnerTwoId, `${learnerTwoId}@example.invalid`,
    ],
  );
  await query(
    `INSERT INTO courses (id, title, description, skill, status, approval, owner_id)
     VALUES ($1, 'Cohort verification', 'Synthetic transactional cohort course',
       'Security', 'Active', 'Approved', $2)`,
    [courseId, ownerId],
  );

  await assert.rejects(
    repository.createCohort({
      actor: { id: foreignManagerId, role: "Manager" },
      cohort: {
        id: `${cohortId}-FOREIGN`, courseId, name: "Foreign cohort", description: "",
        startDate: new Date().toISOString(), endDate: null, capacity: 1,
      },
      inviteCodeHash: hashCohortInviteCode(`${inviteCode}-FOREIGN`),
    }),
    (error) => error?.code === "FORBIDDEN",
  );
  checks.push("foreign Manager cannot create a cohort for the owner's course");

  const cohort = await repository.createCohort({
    actor: { id: ownerId, role: "Manager" },
    cohort: {
      id: cohortId, courseId, name: "Capacity one cohort", description: "",
      startDate: new Date().toISOString(), endDate: null, capacity: 1,
    },
    inviteCodeHash,
  });
  ok("owning Manager creates a cohort", cohort.id === cohortId && cohort.capacity === 1);

  const raced = await Promise.allSettled([
    repository.joinCohort({
      actor: { id: learnerOneId, role: "Learner" }, inviteCodeHash,
      enrollmentId: `VERIFY-COHORT-ENR1-${suffix}`,
    }),
    repository.joinCohort({
      actor: { id: learnerTwoId, role: "Learner" }, inviteCodeHash,
      enrollmentId: `VERIFY-COHORT-ENR2-${suffix}`,
    }),
  ]);
  ok(
    "concurrent final-seat joins produce one commit and one capacity rejection",
    raced.filter((result) => result.status === "fulfilled").length === 1
      && raced.filter((result) => result.status === "rejected" && result.reason?.code === "COHORT_FULL").length === 1,
  );

  const winnerId = raced.find((result) => result.status === "fulfilled")?.value?.enrollment?.userId;
  const loserId = winnerId === learnerOneId ? learnerTwoId : learnerOneId;
  const visible = await repository.findVisibleCohort({ cohortId, actor: { id: winnerId, role: "Learner" } });
  ok("cohort member can read the cohort without invite material", visible.id === cohortId && !("inviteCode" in visible));
  await assert.rejects(
    repository.findVisibleCohort({ cohortId, actor: { id: loserId, role: "Learner" } }),
    (error) => error?.code === "COHORT_NOT_FOUND",
  );
  checks.push("non-member cannot enumerate the cohort");

  const evidence = await query(
    `SELECT
       (SELECT count(*) FROM enrollments WHERE cohort_id = $1)::integer AS members,
       (SELECT count(*) FROM audit_logs
        WHERE entity_type = 'COHORT' AND entity_id = $1)::integer AS audits,
       (SELECT invite_code_hash FROM cohorts WHERE id = $1) AS stored_hash`,
    [cohortId],
  );
  ok(
    "capacity, audit and hashed-invite invariants are durable",
    Number(evidence.rows[0].members) === 1
      && Number(evidence.rows[0].audits) === 2
      && evidence.rows[0].stored_hash === inviteCodeHash
      && evidence.rows[0].stored_hash !== inviteCode,
  );

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Cohort authority verification passed (${checks.length} checks).`);
} finally {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    await query("DELETE FROM audit_logs WHERE entity_type = 'COHORT' AND entity_id LIKE $1", [`${cohortId}%`]).catch(() => {});
    await query("DELETE FROM enrollments WHERE cohort_id = $1", [cohortId]).catch(() => {});
    await query("DELETE FROM cohorts WHERE id LIKE $1", [`${cohortId}%`]).catch(() => {});
    await query("DELETE FROM courses WHERE id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerOneId, learnerTwoId, foreignManagerId, ownerId]]).catch(() => {});
  }
  await closePool();
}
