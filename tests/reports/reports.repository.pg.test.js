import { describe, expect, it, vi } from "vitest";
import {
  MAX_REPORT_ROWS,
  ReportRepositoryError,
  createReportsRepository,
} from "../../backend/src/repositories/reports.repository.pg.js";

const reportRow = {
  id: "8a14967f-687d-4ab0-a253-ae01da76ecb8",
  requested_by: "MGR-1",
  report_type: "Team",
  format: "Excel",
  filters: { team: "Blue" },
  status: "Prepared",
  storage_key: null,
  created_at: new Date("2026-11-05T00:00:00Z"),
  completed_at: new Date("2026-11-05T00:00:01Z"),
};

describe("relational report repository", () => {
  it("prepares scoped relational rows and commits the report with its audit record", async () => {
    const query = vi.fn(async (sql, params) => {
      if (sql.includes("FROM enrollments")) {
        expect(params).toEqual([false, "MGR-1", null, null, "Blue", null, MAX_REPORT_ROWS + 1]);
        expect(sql).toContain("app_user.manager_id = $2");
        expect(sql).not.toContain("app_user.*");
        return { rows: [{
          user_id: "USR-1", employee_name: "Learner", team: "Blue", department: "Engineering",
          course_id: "CRS-1", course_title: "Security", progress: 75,
          chapter_time_seconds: 600, assessment_time_seconds: 120,
          course_time_seconds: 900, chapter_time_spent_seconds: { "CH-1": 600 },
        }] };
      }
      if (sql.includes("INSERT INTO report_exports")) return { rows: [reportRow] };
      return { rows: [], rowCount: 1 };
    });
    const db = { query, withTransaction: vi.fn((fn) => fn({ query })) };
    const repository = createReportsRepository(db);

    const result = await repository.prepareExport({
      actor: { id: "MGR-1", role: "Manager" },
      reportType: "Team",
      format: "Excel",
      filters: { team: "Blue" },
    });

    expect(result).toMatchObject({
      id: reportRow.id, requestedBy: "MGR-1", status: "Prepared",
      artifactAvailable: false, downloadUrl: null, rowCount: 1,
      summary: { chapterTimeSeconds: 600, assessmentTimeSeconds: 120, courseTimeSeconds: 900 },
    });
    expect(result.rows[0]).toMatchObject({ userId: "USR-1", courseId: "CRS-1", progress: 75 });
    expect(query.mock.calls.some(([sql]) => sql.includes("INSERT INTO audit_logs"))).toBe(true);
  });

  it("rejects oversized synchronous exports before writing report or audit state", async () => {
    const query = vi.fn(async (sql) => {
      if (sql.includes("FROM enrollments")) return { rows: Array.from({ length: MAX_REPORT_ROWS + 1 }, () => ({})) };
      throw new Error("unexpected write");
    });
    const db = { query, withTransaction: vi.fn((fn) => fn({ query })) };
    const repository = createReportsRepository(db);

    await expect(repository.prepareExport({
      actor: { id: "ADMIN-1", role: "Admin" },
      reportType: "Course", format: "PDF", filters: {},
    })).rejects.toMatchObject({ code: "REPORT_TOO_LARGE" });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("exports a stable typed error for route-level handling", () => {
    expect(new ReportRepositoryError("X", "message", { field: "value" }))
      .toMatchObject({ name: "ReportRepositoryError", code: "X", details: { field: "value" } });
  });
});
