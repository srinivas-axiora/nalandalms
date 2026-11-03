import assert from "node:assert/strict";
import crypto from "node:crypto";
import { withTransaction, closePool } from "./pool.js";
import { createIdentityRepository } from "../repositories/identity.repository.pg.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for identity verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const userId = `VERIFY-IDENTITY-${suffix}`;
const email = `verify-identity-${suffix}@example.invalid`;
const department = `Identity verification ${suffix}`;

const checks = [];
const ok = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};

try {
  await withTransaction(async (client) => {
    const db = {
      query: client.query.bind(client),
      withTransaction: (fn) => fn(client),
    };
    const repository = createIdentityRepository(db);

    const created = await repository.insertUser({
      id: userId,
      name: "Identity Verification User",
      email,
      passwordHash: "$2b$10$identity.verification.initial.hash",
      role: "Employee",
      department,
      status: "Active",
      sessionVersion: 0,
      preferences: { theme: "dark" },
      joinedAt: "2026-11-03",
    }, { actorId: userId, action: "VERIFY_CREATE_USER" });
    ok("insert + read normalized identity", created?.id === userId && created.sessionVersion === 0);

    const updated = await repository.updateUser(userId, {
      role: "Manager",
      passwordHash: "$2b$10$identity.verification.changed.hash",
    }, { actorId: userId, action: "VERIFY_TRUST_CHANGE" });
    ok("trust change increments session authority", updated.sessionVersion === 1);

    const auditResult = await client.query(
      "SELECT metadata FROM audit_logs WHERE entity_id = $1 AND action = 'VERIFY_TRUST_CHANGE'",
      [userId]
    );
    const auditJson = JSON.stringify(auditResult.rows[0]?.metadata || {});
    ok("audit excludes credential derivatives", !auditJson.includes("verification.changed.hash"));

    const revokedVersion = await repository.revokeSessions(userId, {
      actorId: userId,
      action: "VERIFY_REVOKE_SESSION",
    });
    ok("explicit revocation increments session authority", revokedVersion === 2);

    await repository.archiveAndDeactivateUser({
      id: userId,
      actor: { id: userId, name: "Identity Verification User" },
      deletionComment: "Synthetic identity verification archive",
      replacementPasswordHash: "$2b$10$identity.verification.archived.hash",
    });
    const archives = await repository.listUserArchives();
    const archive = archives.find((item) => item.entityId === userId);
    ok("archive snapshot excludes password hash", archive && !JSON.stringify(archive.entityData).includes("passwordHash"));

    const restored = await repository.restoreUserArchive({
      archiveId: archive.id,
      actorId: userId,
      replacementPasswordHash: "$2b$10$identity.verification.restored.hash",
    });
    ok("restore is inactive and revokes prior sessions", restored.status === "Inactive" && restored.sessionVersion >= 4);

    await client.query("DELETE FROM audit_logs WHERE actor_id = $1 OR entity_id = $1", [userId]);
    await client.query("DELETE FROM deleted_archives WHERE entity_id = $1", [userId]);
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.query("DELETE FROM departments WHERE name = $1", [department]);
  });

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Identity verification passed (${checks.length} checks).`);
} finally {
  await closePool();
}
