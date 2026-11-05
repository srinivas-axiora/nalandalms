import { z } from "zod";
import { authenticate, requireRole } from "../../middleware.js";
import {
  ReportRepositoryError,
  reportsRepository as repository,
} from "../../repositories/reports.repository.pg.js";
import { getPresignedDownloadUrl } from "../../storage/object-store.js";

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
const reportIdSchema = z.string().uuid();

const contentTypeFor = (format) => format === "PDF"
  ? "application/pdf"
  : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const extensionFor = (format) => format === "PDF" ? "pdf" : "xlsx";

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

  app.get("/api/reports/:reportId", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = reportIdSchema.safeParse(req.params.reportId);
    if (!parsed.success) return res.status(400).json({ error: "Invalid report identifier" });
    const report = await repository.getAccessibleById({ reportId: parsed.data, actor: req.user });
    if (!report) return res.status(404).json({ error: "Report not found" });
    const { storageKey: _storageKey, ...publicReport } = report;
    return res.json({ data: publicReport });
  });

  app.get("/api/reports/:reportId/download", authenticate, requireRole("Admin", "Manager"), async (req, res, next) => {
    const parsed = reportIdSchema.safeParse(req.params.reportId);
    if (!parsed.success) return res.status(400).json({ error: "Invalid report identifier" });
    const report = await repository.getAccessibleById({ reportId: parsed.data, actor: req.user });
    if (!report) return res.status(404).json({ error: "Report not found" });
    if (report.status !== "Ready" || !report.storageKey) {
      return res.status(409).json({ error: "Report artifact is not ready", code: "REPORT_NOT_READY" });
    }
    try {
      const filename = `nalanda-${report.reportType.toLowerCase()}-${report.id}.${extensionFor(report.format)}`;
      const grant = await getPresignedDownloadUrl(report.storageKey, 300, req.user.id, {
        filename,
        contentType: contentTypeFor(report.format),
      });
      await repository.recordDownload({ reportId: report.id, actorId: req.user.id });
      return res.json({ downloadUrl: grant.downloadUrl, expiresInSeconds: 300 });
    } catch (error) {
      return next(error);
    }
  });
}
