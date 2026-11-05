import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query } from "./pool.js";
import { aiFeedbackRepository as repository } from "../repositories/ai-feedback.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for AI feedback authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const managerId = `VERIFY-AI-MANAGER-${suffix}`;
const otherManagerId = `VERIFY-AI-OTHER-${suffix}`;
const checks = [];
const feedbackIds = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

try {
  await query(
    `INSERT INTO users (id, name, email, role, status)
     VALUES ($1, 'AI manager', $2, 'Manager', 'Active'),
            ($3, 'Other AI manager', $4, 'Manager', 'Active')`,
    [managerId, `${managerId}@example.invalid`, otherManagerId, `${otherManagerId}@example.invalid`],
  );
  const own = await repository.create({
    actor: { id: managerId, role: "Manager" },
    feedback: {
      skillName: "Security", courseLevel: "Advanced", feedbackType: "Overall",
      rating: 2, comment: "Include stronger object authorization examples.",
    },
  });
  const foreign = await repository.create({
    actor: { id: otherManagerId, role: "Manager" },
    feedback: {
      skillName: "Security", courseLevel: "Advanced", feedbackType: "Overall",
      rating: 1, comment: "Foreign feedback must not influence another manager.",
    },
  });
  feedbackIds.push(own.id, foreign.id);

  const managerList = await repository.list({ id: managerId, role: "Manager" });
  const relevant = await repository.findRelevant({
    actor: { id: managerId, role: "Manager" }, skillName: "Security", courseLevel: "Advanced",
  });
  ok("Manager listing contains only creator-scoped feedback",
    managerList.some((item) => item.id === own.id) && !managerList.some((item) => item.id === foreign.id));
  ok("Manager prompt memory excludes another Manager's feedback",
    relevant.some((item) => item.id === own.id) && !relevant.some((item) => item.id === foreign.id));

  const adminList = await repository.list({ id: managerId, role: "Admin" });
  ok("Admin organization scope can review both records",
    adminList.some((item) => item.id === own.id) && adminList.some((item) => item.id === foreign.id));

  const evidence = await query(
    `SELECT count(*)::integer AS count FROM audit_logs
     WHERE action = 'ACHARYA_FEEDBACK' AND entity_id = ANY($1::text[])`,
    [feedbackIds],
  );
  ok("each feedback write has durable audit evidence", evidence.rows[0]?.count === 2);

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`AI feedback authority verification passed (${checks.length} checks).`);
} finally {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    if (feedbackIds.length) {
      await query("DELETE FROM audit_logs WHERE action = 'ACHARYA_FEEDBACK' AND entity_id = ANY($1::text[])", [feedbackIds]).catch(() => {});
      await query("DELETE FROM ai_generation_feedback WHERE id = ANY($1::uuid[])", [feedbackIds]).catch(() => {});
    }
    await query("DELETE FROM users WHERE id = ANY($1::text[])", [[managerId, otherManagerId]]).catch(() => {});
  }
  await closePool();
}
