import { describe, expect, it, vi } from "vitest";
import { createIdentityRepository } from "../../backend/src/repositories/identity.repository.pg.js";

const userRow = (overrides = {}) => ({
  id: "USR-001",
  name: "Identity User",
  email: "identity@example.com",
  password_hash: "$2b$10$not-a-real-hash",
  role: "Employee",
  department_id: "DEP-001",
  department: "Engineering",
  team: "Platform",
  designation: "Engineer",
  manager_id: null,
  status: "Active",
  session_version: 3,
  preferences: { theme: "dark" },
  joined_at: new Date("2026-11-01T00:00:00.000Z"),
  last_login_at: null,
  created_at: new Date("2026-11-01T08:00:00.000Z"),
  updated_at: new Date("2026-11-02T08:00:00.000Z"),
  ...overrides,
});

const fakeDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return {
    client,
    db: {
      query: vi.fn(handler),
      withTransaction: vi.fn((fn) => fn(client)),
    },
  };
};

describe("PostgreSQL identity repository", () => {
  it("persists a user and its creation audit atomically", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("INSERT INTO departments")) return { rows: [{ id: "DEP-001" }] };
      if (sql.includes("FROM users u")) return { rows: [userRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createIdentityRepository(db);

    const result = await repository.insertUser({
      id: "USR-001",
      name: "Identity User",
      email: "identity@example.com",
      passwordHash: "$2b$10$not-a-real-hash",
      role: "Employee",
      department: "Engineering",
      status: "Active",
      preferences: { theme: "dark" },
    }, { actorId: "USR-001" });

    expect(db.withTransaction).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ id: "USR-001", sessionVersion: 3, department: "Engineering" });
    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements.some((sql) => sql.includes("INSERT INTO users"))).toBe(true);
    expect(statements.some((sql) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("records a password change without putting a hash in audit metadata", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("SELECT * FROM users") && sql.includes("FOR UPDATE")) return { rows: [userRow()] };
      if (sql.includes("FROM users u")) return { rows: [userRow({ session_version: 4 })] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createIdentityRepository(db);

    await repository.updateUser("USR-001", {
      passwordHash: "$2b$10$new-secret-derived-hash",
      role: "Manager",
    }, { actorId: "ADM-001" });

    const auditCall = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO audit_logs"));
    const metadata = JSON.parse(auditCall[1][3]);
    expect(metadata).toEqual({ role: "Manager", passwordChanged: true });
    expect(JSON.stringify(metadata)).not.toContain("secret-derived-hash");
  });

  it("uses optimistic session-version matching for one-time password reset", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("UPDATE users SET password_hash")) return { rows: [{ session_version: 4 }] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createIdentityRepository(db);

    const version = await repository.resetPassword({
      id: "USR-001",
      expectedSessionVersion: 3,
      passwordHash: "$2b$10$new-secret-derived-hash",
    });

    expect(version).toBe(4);
    const resetSql = client.query.mock.calls.find(([sql]) => sql.includes("UPDATE users SET password_hash"))[0];
    expect(resetSql).toContain("session_version = $2");
  });

  it("archives only a redacted identity snapshot before deactivation", async () => {
    const { db, client } = fakeDb(async (sql) => {
      if (sql.includes("FROM users u") && sql.includes("FOR UPDATE")) return { rows: [userRow()] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createIdentityRepository(db);

    await repository.archiveAndDeactivateUser({
      id: "USR-001",
      actor: { id: "ADM-001", name: "Admin" },
      deletionComment: "Approved test archive",
      replacementPasswordHash: "$2b$10$replacement",
    });

    const archiveCall = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO deleted_archives"));
    const archivedData = JSON.parse(archiveCall[1][1]);
    expect(archivedData).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(archivedData)).not.toContain("not-a-real-hash");
    expect(client.query.mock.calls.some(([sql]) => sql.includes("status = 'Inactive'"))).toBe(true);
  });
});
