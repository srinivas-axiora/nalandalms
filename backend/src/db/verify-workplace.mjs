import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query, withTransaction } from "./pool.js";
import { workplaceRepository } from "../repositories/workplace.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for workplace verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const subjectId = `VERIFY-WORKPLACE-SUBJECT-${suffix}`;
const managerId = `VERIFY-WORKPLACE-MANAGER-${suffix}`;
const reviewId = `VERIFY-WORKPLACE-REVIEW-${suffix}`;
const messageId = `VERIFY-WORKPLACE-MESSAGE-${suffix}`;
const checks = [];

const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES
         ($1, 'Workplace verifier subject', $2, 'Learner', 'Active'),
         ($3, 'Workplace verifier manager', $4, 'Manager', 'Active')`,
      [subjectId, `${subjectId}@example.invalid`, managerId, `${managerId}@example.invalid`]
    );
    await client.query(
      `INSERT INTO performance_reviews (
         id, user_id, reviewer_id, reviewer_name, review_date, rating, comments, goals
       ) VALUES ($1, $2, $3, 'Workplace verifier manager', current_date, 4.5,
                 'Synthetic workplace review', 'Verify normalized workplace authority')`,
      [reviewId, subjectId, managerId]
    );
  });

  const clockIns = await Promise.all([
    workplaceRepository.clockIn({ id: `VERIFY-WORKPLACE-ATT-A-${suffix}`, userId: subjectId }),
    workplaceRepository.clockIn({ id: `VERIFY-WORKPLACE-ATT-B-${suffix}`, userId: subjectId }),
  ]);
  ok(
    "concurrent clock-in creates exactly one daily record",
    clockIns.filter((result) => result.created).length === 1
      && clockIns.every((result) => result.record?.userId === subjectId)
  );

  const clockOuts = await Promise.all([
    workplaceRepository.clockOut({ userId: subjectId }),
    workplaceRepository.clockOut({ userId: subjectId }),
  ]);
  ok(
    "concurrent clock-out applies exactly one transition",
    clockOuts.filter((result) => result.updated).length === 1
      && clockOuts.every((result) => result.record?.checkOutAt)
  );

  const reviews = await workplaceRepository.listPerformanceReviews({ userId: subjectId });
  ok(
    "performance reviews are subject scoped",
    reviews.length === 1 && reviews[0].reviewerId === managerId
  );

  const resolution = await workplaceRepository.resolveRecipient({
    search: "Workplace verifier manager",
    senderId: subjectId,
  });
  ok("recipient resolution uses active relational identity", resolution.user?.id === managerId);

  await workplaceRepository.sendCommunication({
    id: messageId,
    sender: { id: subjectId, name: "Workplace verifier subject" },
    recipientId: managerId,
    content: "Synthetic private workplace message",
    kind: "Direct",
  });
  const inbox = await workplaceRepository.listInbox({ userId: managerId });
  const auditCount = await query(
    "SELECT count(*)::integer AS count FROM audit_logs WHERE entity_id = $1",
    [messageId]
  );
  ok(
    "communication and audit commit together",
    inbox.some((message) => message.id === messageId)
      && Number(auditCount.rows[0]?.count || 0) === 1
  );

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Workplace verification passed (${checks.length} checks).`);
} finally {
  try {
    await withTransaction(async (client) => {
      await client.query(
        "DELETE FROM audit_logs WHERE actor_id = ANY($1::text[]) OR entity_id = ANY($2::text[])",
        [[subjectId, managerId], [messageId, reviewId]]
      );
      await client.query("DELETE FROM workplace_communications WHERE id = $1", [messageId]);
      await client.query("DELETE FROM performance_reviews WHERE id = $1", [reviewId]);
      await client.query("DELETE FROM attendance_records WHERE user_id = $1", [subjectId]);
      await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[subjectId, managerId]]);
    });
  } catch (error) {
    console.error("[verify-workplace] cleanup failed:", error?.message || error);
  }
  await closePool();
}
