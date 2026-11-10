import crypto from "node:crypto";
import { z } from "zod";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import {
  CourseAuthorityError,
  courseAuthorityRepository as repository,
} from "../../repositories/courses-authority.repository.pg.js";

const courseFields = {
  title: z.string().trim().min(4).max(240),
  description: z.string().trim().min(10).max(10_000),
  skill: z.string().trim().min(2).max(160),
  skillIds: z.array(z.string().trim().min(1).max(160)).max(100).default([]),
  targetLevel: z.string().trim().min(2).max(80).default("Beginner"),
  difficulty: z.string().trim().min(2).max(80).default("Beginner"),
  estimatedHours: z.coerce.number().positive().max(999).default(4),
  priceCents: z.coerce.number().int().min(0).max(100_000_000).default(0),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).default("INR"),
  category: z.string().trim().min(2).max(160).default("Technical"),
  prerequisites: z.array(z.string().trim().min(1).max(240)).max(100).default([]),
  tags: z.array(z.string().trim().min(1).max(100)).max(100).default([]),
  thumbnailColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).default("#22d3ee"),
  contentTypes: z.array(z.enum(["Rich Text", "PDF", "Video Link"])).min(1).max(3).default(["Rich Text"]),
};

const createSchema = z.object(courseFields).strict();
const updateSchema = z.object({
  version: z.coerce.number().int().positive(),
  title: z.string().trim().min(4).max(240).optional(),
  description: z.string().trim().min(10).max(10_000).optional(),
  skill: z.string().trim().min(2).max(160).optional(),
  skillIds: z.array(z.string().trim().min(1).max(160)).max(100).optional(),
  targetLevel: z.string().trim().min(2).max(80).optional(),
  difficulty: z.string().trim().min(2).max(80).optional(),
  estimatedHours: z.coerce.number().positive().max(999).optional(),
  priceCents: z.coerce.number().int().min(0).max(100_000_000).optional(),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).optional(),
  category: z.string().trim().min(2).max(160).optional(),
  prerequisites: z.array(z.string().trim().min(1).max(240)).max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(100).optional(),
  thumbnailColor: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  contentTypes: z.array(z.enum(["Rich Text", "PDF", "Video Link"])).min(1).max(3).optional(),
}).strict();

const querySchema = z.object({
  skill: z.string().trim().max(160).optional(),
  category: z.string().trim().max(160).optional(),
  difficulty: z.string().trim().max(80).optional(),
  search: z.string().trim().max(200).optional(),
}).passthrough();

const errorStatus = (error) => {
  if (!(error instanceof CourseAuthorityError)) return 500;
  if (error.code === "COURSE_NOT_FOUND") return 404;
  if (error.code === "FORBIDDEN") return 403;
  if (error.code === "PAYMENT_REQUIRED") return 402;
  if (["COURSE_CONFLICT", "VERSION_CONFLICT", "COURSE_HAS_HISTORY", "PREREQUISITES_NOT_MET"].includes(error.code)) return 409;
  if (error.code === "NO_CHANGES") return 400;
  return 500;
};

const sendError = (res, error) => {
  if (!(error instanceof CourseAuthorityError)) throw error;
  return res.status(errorStatus(error)).json({
    error: error.message,
    code: error.code,
    ...(Object.keys(error.details || {}).length ? { details: error.details } : {}),
  });
};

const nextId = (prefix) => `${prefix}-${crypto.randomBytes(10).toString("hex").toUpperCase()}`;
const mapEnrollment = (row) => row && ({
  id: row.id,
  courseId: row.course_id,
  userId: row.user_id,
  assignedBy: row.assigned_by,
  dueAt: row.due_at || null,
  priority: row.priority || "Medium",
  mandatory: Boolean(row.mandatory),
  progress: Number(row.progress || 0),
  completedChapters: row.completed_chapters || [],
  timeSpentMinutes: Number(row.time_spent_minutes || 0),
  timeSpentSeconds: Number(row.time_spent_seconds || 0),
  chapterTimeSpentSeconds: row.chapter_time_spent_seconds || {},
  status: row.status,
  version: Number(row.version || 0),
  startedAt: row.started_at,
  completedAt: row.completed_at || null,
});

export function registerCoursesPgRoutes(app) {
  app.get("/api/catalog", async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const data = await repository.listCatalog(parsed.data);
    return res.json({ data, total: data.length });
  });

  app.post("/api/courses/:id/enroll", authenticate, async (req, res) => {
    try {
      const result = await repository.selfEnroll({
        enrollmentId: nextId("ENR"),
        courseId: req.params.id,
        userId: req.user.id,
      });
      return res.status(result.created ? 201 : 200).json({
        data: mapEnrollment(result.enrollment),
        ...(!result.created ? { message: "Already enrolled in this course" } : {}),
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.get("/api/courses", authenticate, async (req, res) => {
    const filters = z.object({
      skill: z.string().trim().max(160).optional(),
      approval: z.enum(["Draft", "Pending", "Approved", "Rejected"]).optional(),
      status: z.enum(["Active", "Inactive", "All"]).default("Active"),
    }).safeParse(req.query);
    if (!filters.success) return res.status(400).json({ error: filters.error.flatten() });
    const data = await repository.listVisible({ actor: req.user, ...filters.data });
    return res.json({ data, total: data.length });
  });

  app.post("/api/courses", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      const data = await repository.createCourse({
        actor: req.user,
        course: { id: nextId("CRS"), ...parsed.data },
      });
      return res.status(201).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.put("/api/courses/:id", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { version, ...updates } = parsed.data;
    try {
      const data = await repository.updateCourse({
        id: req.params.id,
        actor: req.user,
        expectedVersion: version,
        updates,
      });
      return res.json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.post("/api/courses/:id/duplicate", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    try {
      const data = await repository.duplicateCourse({
        sourceId: req.params.id,
        newId: nextId("CRS"),
        actor: req.user,
      });
      return res.status(201).json({ data });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.patch(
    "/api/courses/:id/approval",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    async (req, res) => {
      const parsed = z.object({
        version: z.coerce.number().int().positive(),
        approval: z.enum(["Approved", "Rejected"]),
        reason: z.string().trim().min(10).max(2000),
      }).strict().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      try {
        const data = await repository.reviewCourse({
          id: req.params.id,
          actor: req.user,
          expectedVersion: parsed.data.version,
          approval: parsed.data.approval,
          reason: parsed.data.reason,
        });
        return res.json({ data });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );

  app.patch(
    "/api/courses/:id/status",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    async (req, res) => {
      const parsed = z.object({
        version: z.coerce.number().int().positive(),
        status: z.enum(["Active", "Inactive"]),
      }).strict().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      try {
        const data = await repository.setCourseStatus({
          id: req.params.id,
          actor: req.user,
          expectedVersion: parsed.data.version,
          status: parsed.data.status,
        });
        return res.json({ data });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );

  app.delete(
    "/api/courses/:id",
    authenticate,
    requireRole("Admin", "Manager"),
    requireStepUp,
    async (req, res) => {
      const parsed = z.object({
        version: z.coerce.number().int().positive(),
        deletionComment: z.string().trim().min(10).max(2000),
      }).strict().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      try {
        await repository.archiveAndDelete({
          id: req.params.id,
          actor: req.user,
          expectedVersion: parsed.data.version,
          deletionComment: parsed.data.deletionComment,
        });
        return res.json({ success: true, message: "Course deleted and archived" });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );
}
