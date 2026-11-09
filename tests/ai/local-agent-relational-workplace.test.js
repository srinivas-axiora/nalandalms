import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { workplaceRepository } from "../../backend/src/repositories/workplace.repository.pg.js";

describe("local Copilot relational workplace projection", () => {
  const previousWorkplace = process.env.USE_PG_WORKPLACE;
  const previousCourses = process.env.USE_PG_COURSES;
  const user = {
    id: "WORKER-PG", name: "Relational Worker", role: "Learner",
    designation: "Engineer", managerId: "MANAGER-PG",
  };
  let handleLocalChat;

  beforeAll(async () => {
    process.env.USE_PG_WORKPLACE = "1";
    process.env.USE_PG_COURSES = "0";
    vi.spyOn(workplaceRepository, "clockIn").mockResolvedValue({
      created: true,
      record: {
        id: "ATT-PG", userId: user.id, date: "2026-11-09",
        checkInAt: "2026-11-09T03:30:00.000Z", checkOutAt: null, status: "Present",
      },
    });
    vi.spyOn(workplaceRepository, "listAttendance").mockResolvedValue([{
      id: "ATT-PG", userId: user.id, date: "2026-11-09",
      checkInAt: "2026-11-09T03:30:00.000Z", checkOutAt: null, status: "Present",
    }]);
    vi.spyOn(workplaceRepository, "listPerformanceReviews").mockResolvedValue([{
      id: "REVIEW-PG", userId: user.id, reviewerId: "MANAGER-PG",
      reviewerName: "Database Manager", reviewDate: "2026-11-01", rating: 4.5,
      comments: "Relational review evidence", goals: "1. Preserve transactional integrity",
    }]);
    vi.spyOn(workplaceRepository, "listInbox").mockResolvedValue([{
      id: "MSG-PG", senderId: "MANAGER-PG", senderName: "Database Manager",
      recipientId: user.id, kind: "Direct", content: "Database-backed message",
      sentAt: "2026-11-09T10:00:00.000Z",
    }]);
    vi.spyOn(workplaceRepository, "resolveRecipient").mockResolvedValue({
      user: { id: "MANAGER-PG", name: "Database Manager", designation: "Manager" },
      ambiguous: false,
    });
    vi.spyOn(workplaceRepository, "sendCommunication").mockResolvedValue({ id: "MSG-SENT" });
    ({ handleLocalChat } = await import("../../backend/src/modules/ai/localAgent.js?phase50-relational-workplace"));
  });

  beforeEach(() => vi.clearAllMocks());

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousWorkplace === undefined) delete process.env.USE_PG_WORKPLACE;
    else process.env.USE_PG_WORKPLACE = previousWorkplace;
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
  });

  it("clocks in through the relational attendance repository", async () => {
    const result = await handleLocalChat(user, "check in");
    expect(result.reply).toContain("Attendance Clock In");
    expect(workplaceRepository.clockIn).toHaveBeenCalledWith(expect.objectContaining({ userId: user.id }));
  });

  it("reads attendance and performance evidence from PostgreSQL", async () => {
    const attendance = await handleLocalChat(user, "attendance log");
    const performance = await handleLocalChat(user, "performance review");
    expect(attendance.reply).toContain("2026-11-09");
    expect(performance.reply).toContain("Relational review evidence");
    expect(workplaceRepository.listAttendance).toHaveBeenCalledWith({ userId: user.id, limit: 10 });
    expect(workplaceRepository.listPerformanceReviews).toHaveBeenCalledWith({ userId: user.id, limit: 1 });
  });

  it("reads inbox and sends direct messages through the relational repository", async () => {
    const inbox = await handleLocalChat(user, "inbox");
    const sent = await handleLocalChat(user, "send message to Database Manager: hello from RDS");
    expect(inbox.reply).toContain("Database-backed message");
    expect(sent.reply).toContain("Message Outbox");
    expect(workplaceRepository.resolveRecipient).toHaveBeenCalledWith({
      search: "database manager", senderId: user.id,
    });
    expect(workplaceRepository.sendCommunication).toHaveBeenCalledWith(expect.objectContaining({
      sender: user, recipientId: "MANAGER-PG", content: "hello from RDS", kind: "Direct",
    }));
  });
});
