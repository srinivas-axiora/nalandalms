// Module: Reports (export generation).
// Handler moved verbatim from server.js; uuid imported directly, other deps via ctx.
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { now, reportExports } from "../../core.js";
import { audit, buildReportRows } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";

export function registerReports(app) {
  app.post("/api/reports/export", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const schema = z.object({ format: z.enum(["PDF", "Excel"]), reportType: z.enum(["User", "Team", "Course"]), filters: z.record(z.string(), z.any()).default({}) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const rows = buildReportRows({ reportType: parsed.data.reportType, filters: parsed.data.filters, requester: req.user });
    const summary = rows.reduce((acc, row) => ({
      chapterTimeSeconds: acc.chapterTimeSeconds + (row.chapterTimeSeconds || 0),
      assessmentTimeSeconds: acc.assessmentTimeSeconds + (row.assessmentTimeSeconds || 0),
      courseTimeSeconds: acc.courseTimeSeconds + (row.courseTimeSeconds || 0)
    }), { chapterTimeSeconds: 0, assessmentTimeSeconds: 0, courseTimeSeconds: 0 });
    const report = { id: uuid(), requestedBy: req.user.id, status: "Ready", downloadUrl: `/exports/${uuid()}.${parsed.data.format === "PDF" ? "pdf" : "xlsx"}`, ...parsed.data, rowCount: rows.length, rows, summary, createdAt: now() };
    reportExports.unshift(report);
    audit(req.user.id, "EXPORT_REPORT", "REPORT", report.id, parsed.data);
    res.status(202).json({ data: report });
  });
}
