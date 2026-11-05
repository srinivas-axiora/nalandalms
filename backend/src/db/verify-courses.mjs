import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, withTransaction } from "./pool.js";
import { createCourseAuthorityRepository } from "../repositories/courses-authority.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for course authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const adminId = `VERIFY-COURSE-ADMIN-${suffix}`;
const ownerId = `VERIFY-COURSE-OWNER-${suffix}`;
const learnerId = `VERIFY-COURSE-LEARNER-${suffix}`;
const courseId = `VERIFY-COURSE-${suffix}`;
const enrollmentId = `VERIFY-ENROLLMENT-${suffix}`;
const checks = [];
const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = { query: client.query.bind(client), withTransaction: (fn) => fn(client) };
    const repository = createCourseAuthorityRepository(db);
    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES
         ($1, 'Course verifier admin', $2, 'Admin', 'Active'),
         ($3, 'Course verifier owner', $4, 'Manager', 'Active'),
         ($5, 'Course verifier learner', $6, 'Learner', 'Active')`,
      [
        adminId, `${adminId}@example.invalid`,
        ownerId, `${ownerId}@example.invalid`,
        learnerId, `${learnerId}@example.invalid`,
      ]
    );

    const owner = { id: ownerId, name: "Course verifier owner", role: "Manager" };
    const admin = { id: adminId, name: "Course verifier admin", role: "Admin" };
    const created = await repository.createCourse({
      actor: owner,
      course: {
        id: courseId,
        title: "Transactional course verification",
        description: "Synthetic production-like verification course",
        skill: "Security",
        priceCents: 0,
        currency: "INR",
        contentTypes: ["Rich Text"],
      },
    });
    ok("manager creation starts pending at version one", created.approval === "Pending" && created.version === 1);

    const reviewed = await repository.reviewCourse({
      id: courseId,
      actor: admin,
      expectedVersion: 1,
      approval: "Approved",
      reason: "Synthetic publishing review completed",
    });
    ok("administrator review increments the authoritative version", reviewed.approval === "Approved" && reviewed.version === 2);

    await assert.rejects(
      repository.updateCourse({
        id: courseId,
        actor: owner,
        expectedVersion: 1,
        updates: { title: "Stale update" },
      }),
      (error) => error?.code === "VERSION_CONFLICT"
    );
    checks.push("stale writer is rejected");

    const updated = await repository.updateCourse({
      id: courseId,
      actor: owner,
      expectedVersion: 2,
      updates: { title: "Transactional course verification v2" },
    });
    ok("owner update is transactional and returns to review", updated.approval === "Pending" && updated.version === 3);
    await repository.reviewCourse({
      id: courseId,
      actor: admin,
      expectedVersion: 3,
      approval: "Approved",
      reason: "Synthetic second publishing review completed",
    });

    const firstEnrollment = await repository.selfEnroll({
      enrollmentId,
      courseId,
      userId: learnerId,
    });
    const repeatedEnrollment = await repository.selfEnroll({
      enrollmentId: `${enrollmentId}-RETRY`,
      courseId,
      userId: learnerId,
    });
    ok(
      "free enrollment is unique and idempotent",
      firstEnrollment.created === true
        && repeatedEnrollment.created === false
        && firstEnrollment.enrollment.id === repeatedEnrollment.enrollment.id
    );

    await assert.rejects(
      repository.archiveAndDelete({
        id: courseId,
        actor: owner,
        expectedVersion: 4,
        deletionComment: "Synthetic safe deletion verification",
      }),
      (error) => error?.code === "COURSE_HAS_HISTORY"
    );
    checks.push("retained enrollment blocks destructive deletion");

    await client.query("DELETE FROM enrollments WHERE id = $1", [enrollmentId]);
    const deleted = await repository.archiveAndDelete({
      id: courseId,
      actor: owner,
      expectedVersion: 4,
      deletionComment: "Synthetic safe deletion verification",
    });
    ok("history-free authoring course is archived before deletion", deleted.deleted === true);

    const evidence = await client.query(
      `SELECT
         (SELECT count(*) FROM courses WHERE id = $1)::integer AS courses,
         (SELECT count(*) FROM deleted_archives WHERE entity_type = 'Course' AND entity_id = $1)::integer AS archives,
         (SELECT count(*) FROM audit_logs WHERE entity_type = 'COURSE' AND entity_id = $1)::integer AS audits`,
      [courseId]
    );
    ok(
      "archive and audit evidence survive course deletion",
      Number(evidence.rows[0].courses) === 0
        && Number(evidence.rows[0].archives) === 1
        && Number(evidence.rows[0].audits) >= 1
    );

    await client.query("DELETE FROM deleted_archives WHERE entity_type = 'Course' AND entity_id = $1", [courseId]);
    await client.query("DELETE FROM audit_logs WHERE entity_type = 'COURSE' AND entity_id = $1", [courseId]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerId, ownerId, adminId]]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Course authority verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
