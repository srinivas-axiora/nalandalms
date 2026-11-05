import { z } from "zod";
import { authenticate, requireRole } from "../../middleware.js";
import { analyticsRepository as repository } from "../../repositories/analytics.repository.pg.js";

const eventQuery = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
}).strict();

const summarizeTime = (rows) => {
  const seenCourses = new Set();
  return rows.reduce((summary, row, index) => {
    const courseKey = row.userId && row.courseId ? `${row.userId}:${row.courseId}` : `row:${index}`;
    const includeCourseTotal = !seenCourses.has(courseKey);
    seenCourses.add(courseKey);
    return {
      chapterTimeSeconds: summary.chapterTimeSeconds + Number(row.chapterTimeSeconds || 0),
      assessmentTimeSeconds: summary.assessmentTimeSeconds + Number(row.assessmentTimeSeconds || 0),
      courseTimeSeconds: summary.courseTimeSeconds + (includeCourseTotal ? Number(row.courseTimeSeconds || 0) : 0),
    };
  }, { chapterTimeSeconds: 0, assessmentTimeSeconds: 0, courseTimeSeconds: 0 });
};

export function registerAnalyticsPgRoutes(app) {
  app.get("/api/analytics/global", authenticate, requireRole("Admin"), async (_req, res) => {
    return res.json(await repository.globalOverview());
  });

  app.get("/api/analytics/team", authenticate, requireRole("Manager"), async (req, res) => {
    return res.json(await repository.teamOverview(req.user.id));
  });

  app.get("/api/analytics/me", authenticate, async (req, res) => {
    return res.json(await repository.personalOverview(req.user.id));
  });

  app.get("/api/analytics/time", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const [data, eventCount] = await Promise.all([
      repository.timeRows(req.user),
      repository.countTimeEvents(req.user),
    ]);
    return res.json({ data, total: data.length, eventCount, summary: summarizeTime(data) });
  });

  app.get("/api/analytics/time/events", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = eventQuery.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const data = await repository.listTimeEvents({ actor: req.user, limit: parsed.data.limit });
    return res.json({ data, total: data.length });
  });
}
