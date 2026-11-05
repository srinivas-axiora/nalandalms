import { describe, expect, it, vi } from "vitest";
import { createAnalyticsRepository } from "../../backend/src/repositories/analytics.repository.pg.js";

describe("relational analytics repository", () => {
  it("derives global metrics and performer rankings from database results", async () => {
    const query = vi.fn(async (sql) => {
      if (sql.includes("active_users")) return { rows: [{ users: 10, active_users: 8, courses: 4, approved_courses: 3, completion_rate: 62, average_score: 81 }] };
      return { rows: [{ name: "A" }, { name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }] };
    });
    const repository = createAnalyticsRepository({ query });

    await expect(repository.globalOverview()).resolves.toEqual({
      users: 10, activeUsers: 8, courses: 4, approvedCourses: 3,
      completionRate: 62, averageScore: 81,
      topPerformers: ["A", "B", "C"], lowPerformers: ["E", "D", "C"],
    });
  });

  it("scopes team metrics to the authenticated manager and derives engagement", async () => {
    const query = vi.fn(async (sql, params) => {
      expect(params).toEqual(["MGR-1"]);
      if (sql.includes("FROM skill_ratings")) return { rows: [{ skill: "Security", score: 55 }, { skill: "Writing", score: 80 }] };
      expect(sql).not.toContain("app_user.*");
      expect(sql).not.toContain("password_hash");
      return { rows: [
        { id: "USR-1", name: "User", email: "u@example.invalid", role: "Learner", department: "Engineering", team: "Blue", designation: "Engineer", manager_id: "MGR-1", status: "Active", average_progress: 80, time_spent_seconds: 8000 },
      ] };
    });
    const repository = createAnalyticsRepository({ query });
    const result = await repository.teamOverview("MGR-1");

    expect(result).toMatchObject({ managerId: "MGR-1", completionRate: 80, skillGaps: ["Security"], engagement: "High" });
    expect(result.members[0]).not.toHaveProperty("passwordHash");
  });

  it("derives personal progress, skill bands and course suggestions", async () => {
    const query = vi.fn(async (sql, params) => {
      expect(params).toEqual(["USR-1"]);
      if (sql.includes("completed_courses")) return { rows: [{ progress: 70, completed_courses: 2, pending_courses: 1 }] };
      if (sql.includes("FROM skill_ratings")) return { rows: [{ skill: "Security", score: 90 }, { skill: "Writing", score: 50 }] };
      return { rows: [{ title: "Advanced Security" }] };
    });
    const repository = createAnalyticsRepository({ query });

    await expect(repository.personalOverview("USR-1")).resolves.toEqual({
      userId: "USR-1", progress: 70, completedCourses: 2, pendingCourses: 1,
      strengths: ["Security"], weaknesses: ["Writing"], suggestions: ["Complete Advanced Security"],
    });
  });

  it("passes database-enforced manager scope and maps canonical time rows", async () => {
    const query = vi.fn(async (_sql, params) => {
      expect(params).toEqual([false, "MGR-1"]);
      return { rows: [{
        user_id: "USR-1", course_id: "CRS-1", chapter_id: "CH-1", chapter_title: "Intro",
        minimum_time_seconds: 600, chapter_time_seconds: 700, assessment_time_seconds: 120,
        course_time_seconds: 900,
      }] };
    });
    const repository = createAnalyticsRepository({ query });

    await expect(repository.timeRows({ id: "MGR-1", role: "Manager" })).resolves.toEqual([{
      userId: "USR-1", courseId: "CRS-1", chapterId: "CH-1", chapterTitle: "Intro",
      minimumTimeSeconds: 600, minimumTimeMet: true, chapterTimeSeconds: 700,
      assessmentTimeSeconds: 120, courseTimeSeconds: 900,
    }]);
  });

  it("bounds time event retrieval through a parameterized limit", async () => {
    const query = vi.fn(async (_sql, params) => {
      expect(params).toEqual([true, "ADMIN-1", 25]);
      return { rows: [{ id: "EV-1", user_id: "USR-1", course_id: "CRS-1", chapter_id: null, assessment_id: null, event_type: "CHAPTER_TIME", seconds_spent: 30, recorded_at: new Date("2026-11-05T00:00:00Z") }] };
    });
    const repository = createAnalyticsRepository({ query });
    const result = await repository.listTimeEvents({ actor: { id: "ADMIN-1", role: "Admin" }, limit: 25 });
    expect(result[0]).toMatchObject({ id: "EV-1", secondsSpent: 30, recordedAt: "2026-11-05T00:00:00.000Z" });
  });
});
