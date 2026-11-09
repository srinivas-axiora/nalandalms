import { describe, expect, it, vi } from "vitest";
import { createWorkplaceRepository } from "../../backend/src/repositories/workplace.repository.pg.js";

const attendanceRow = {
  id: "ATT-1",
  user_id: "USR-1",
  attendance_date: new Date("2026-11-09T00:00:00.000Z"),
  check_in_at: new Date("2026-11-09T03:30:00.000Z"),
  check_out_at: null,
  status: "Present",
};

const transactionalDb = (handler) => {
  const client = { query: vi.fn(handler) };
  return { client, db: { query: vi.fn(handler), withTransaction: vi.fn((fn) => fn(client)) } };
};

describe("PostgreSQL workplace authority", () => {
  it("makes clock-in concurrency safe and audits only the winning insert", async () => {
    const { client, db } = transactionalDb(async (sql) => {
      if (sql.includes("INSERT INTO attendance_records")) return { rows: [attendanceRow] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createWorkplaceRepository(db, "Asia/Kolkata");

    const result = await repository.clockIn({ id: "ATT-1", userId: "USR-1" });

    expect(result).toMatchObject({ created: true, record: { id: "ATT-1", userId: "USR-1" } });
    expect(client.query.mock.calls[0][0]).toContain("ON CONFLICT (user_id, attendance_date) DO NOTHING");
    expect(client.query.mock.calls.some(([, params]) => params?.includes("ATTENDANCE_CLOCK_IN"))).toBe(true);
  });

  it("performs clock-out as one conditional update", async () => {
    const checkedOut = { ...attendanceRow, check_out_at: new Date("2026-11-09T12:30:00.000Z") };
    const { client, db } = transactionalDb(async (sql) => {
      if (sql.includes("UPDATE attendance_records")) return { rows: [checkedOut] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createWorkplaceRepository(db);

    const result = await repository.clockOut({ userId: "USR-1" });

    expect(result.updated).toBe(true);
    expect(client.query.mock.calls[0][0]).toContain("AND record.check_out_at IS NULL");
    expect(client.query.mock.calls.some(([, params]) => params?.includes("ATTENDANCE_CLOCK_OUT"))).toBe(true);
  });

  it("refuses to guess when recipient lookup is ambiguous", async () => {
    const db = {
      query: vi.fn().mockResolvedValue({
        rows: [
          { id: "USR-2", name: "Alex One", designation: "Engineer" },
          { id: "USR-3", name: "Alex Two", designation: "Manager" },
        ],
      }),
      withTransaction: vi.fn(),
    };
    const repository = createWorkplaceRepository(db);

    await expect(repository.resolveRecipient({ search: "Alex", senderId: "USR-1" }))
      .resolves.toEqual({ user: null, ambiguous: true });
  });

  it("stores a message and audit evidence transactionally without logging content", async () => {
    const communication = {
      id: "MSG-1", sender_id: "USR-1", sender_name: "Sender", recipient_id: "USR-2",
      kind: "Direct", content: "Private message", sent_at: new Date("2026-11-09T10:00:00.000Z"),
    };
    const { client, db } = transactionalDb(async (sql) => {
      if (sql.includes("SELECT id FROM users")) return { rows: [{ id: "USR-1" }, { id: "USR-2" }] };
      if (sql.includes("INSERT INTO workplace_communications")) return { rows: [communication] };
      return { rows: [], rowCount: 1 };
    });
    const repository = createWorkplaceRepository(db);

    const result = await repository.sendCommunication({
      id: "MSG-1",
      sender: { id: "USR-1", name: "Sender" },
      recipientId: "USR-2",
      content: "Private message",
    });

    expect(result).toMatchObject({ id: "MSG-1", recipientId: "USR-2" });
    const auditCall = client.query.mock.calls.find(([sql]) => sql.includes("INSERT INTO audit_logs"));
    expect(auditCall[1][4]).not.toContain("Private message");
    expect(JSON.parse(auditCall[1][4])).toEqual({ kind: "Direct", recipientId: "USR-2" });
  });
});
