import { z } from "zod";
import { authenticate, requireRole } from "../../middleware.js";
import {
  ReportRepositoryError,
  reportsRepository as repository,
} from "../../repositories/reports.repository.pg.js";

const id = z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9._:-]+$/);
const label = z.string().trim().min(1).max(200);
const filtersSchema = z.object({
  userId: id.optional(),
  courseId: id.optional(),
  team: label.optional(),
  department: label.optional(),
}).strict();
const exportSchema = z.object({
  format: z.enum(["PDF", "Excel"]),
  reportType: z.enum(["User", "Team", "Course"]),
  filters: filtersSchema.default({}),
}).strict();

export function registerReportsPgRoutes(app) {
  app.post("/api/reports/export", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = exportSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      const report = await repository.prepareExport({
        actor: req.user,
        reportType: parsed.data.reportType,
        format: parsed.data.format,
        filters: parsed.data.filters,
      });
      return res.status(202).json({ data: report });
    } catch (error) {
      if (!(error instanceof ReportRepositoryError)) throw error;
      const status = error.code === "REPORT_TOO_LARGE" ? 413 : 409;
      return res.status(status).json({
        error: error.message,
        code: error.code,
        ...(Object.keys(error.details || {}).length ? { details: error.details } : {}),
      });
    }
  });
}
