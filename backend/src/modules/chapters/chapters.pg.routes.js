import crypto from "node:crypto";
import { z } from "zod";
import { sanitizeHtmlServer } from "../../lib.js";
import { authenticate, requireRole } from "../../middleware.js";
import {
  LearningAuthorityError,
  learningAuthorityRepository as repository,
} from "../../repositories/learning-authority.repository.pg.js";

const idempotencySchema = z.string().trim().min(16).max(128).regex(/^[A-Za-z0-9._:-]+$/);
const managedObjectKey = z.string().trim().max(700).refine((value) => {
  if (!/^(?:course_media|chapter_pdf)\/[A-Za-z0-9._:-]+\/[A-Za-z0-9._/-]+$/.test(value)) return false;
  return value.split("/").every((segment) => segment && segment !== "." && segment !== "..");
}, "Invalid managed object key");
const contentLocation = z.union([
  z.string().url().max(2_048),
  managedObjectKey,
]);

const chapterFields = {
  sequence: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(2).max(240),
  description: z.string().max(10_000).default(""),
  contentType: z.enum(["Rich Text", "PDF", "Video Link"]).default("Rich Text"),
  body: z.string().max(500_000).default(""),
  url: contentLocation.nullable().optional(),
  fileName: z.string().trim().min(1).max(512).nullable().optional(),
  durationMinutes: z.coerce.number().int().min(0).max(100_000).default(10),
  minimumTimeMinutes: z.coerce.number().int().min(0).max(100_000).optional(),
};

const createSchema = z.object({
  courseVersion: z.coerce.number().int().positive(),
  ...chapterFields,
}).strict();

const updateSchema = z.object({
  courseVersion: z.coerce.number().int().positive(),
  chapterVersion: z.coerce.number().int().positive(),
  sequence: chapterFields.sequence,
  title: chapterFields.title.optional(),
  description: z.string().max(10_000).optional(),
  contentType: z.enum(["Rich Text", "PDF", "Video Link"]).optional(),
  body: z.string().max(500_000).optional(),
  url: chapterFields.url,
  fileName: chapterFields.fileName,
  durationMinutes: z.coerce.number().int().min(0).max(100_000).optional(),
  minimumTimeMinutes: z.coerce.number().int().min(0).max(100_000).optional(),
}).strict();

const heartbeatSchema = z.object({
  idempotencyKey: idempotencySchema.optional(),
  currentPositionSeconds: z.coerce.number().nonnegative().max(10_000_000).default(0),
  incrementSeconds: z.coerce.number().positive().max(3_600).default(15),
}).strict();

const timeSchema = z.object({
  idempotencyKey: idempotencySchema.optional(),
  seconds: z.coerce.number().int().positive().max(30),
}).strict();

const statusFor = (error) => {
  if (!(error instanceof LearningAuthorityError)) return 500;
  if (["COURSE_NOT_FOUND", "CHAPTER_NOT_FOUND"].includes(error.code)) return 404;
  if (["FORBIDDEN", "ENROLLMENT_REQUIRED", "CHAPTER_LOCKED"].includes(error.code)) return 403;
  if (["VERSION_CONFLICT", "CHAPTER_CONFLICT", "IDEMPOTENCY_CONFLICT"].includes(error.code)) return 409;
  if (error.code === "INVALID_CONTENT_LOCATION") return 400;
  if (error.code === "HEARTBEAT_TOO_SOON") return 429;
  if (error.code === "NO_CHANGES") return 400;
  return 500;
};

const sendError = (res, error) => {
  if (!(error instanceof LearningAuthorityError)) throw error;
  if (error.code === "HEARTBEAT_TOO_SOON") {
    res.set("Retry-After", String(error.details?.retryAfterSeconds || 1));
  }
  return res.status(statusFor(error)).json({
    error: error.message,
    code: error.code,
    ...(Object.keys(error.details || {}).length ? { details: error.details } : {}),
  });
};

const idempotencyKey = (req, parsed) => {
  const candidate = req.get("Idempotency-Key") || parsed.idempotencyKey;
  const checked = idempotencySchema.safeParse(candidate);
  if (!checked.success) return null;
  return checked.data;
};

const nextId = () => `CH-${crypto.randomBytes(10).toString("hex").toUpperCase()}`;

export function registerChaptersPgRoutes(app) {
  app.get("/api/courses/:courseId/chapters", authenticate, async (req, res) => {
    try {
      const result = await repository.listForActor({ courseId: req.params.courseId, actor: req.user });
      return res.json({ data: result.chapters, total: result.chapters.length, courseVersion: result.courseVersion });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.post("/api/courses/:courseId/chapters", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { courseVersion, ...input } = parsed.data;
    input.body = sanitizeHtmlServer(input.body);
    try {
      const result = await repository.createChapter({
        courseId: req.params.courseId,
        actor: req.user,
        expectedCourseVersion: courseVersion,
        chapter: { id: nextId(), ...input },
      });
      return res.status(201).json({ data: result.chapter, courseVersion: result.courseVersion });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.put("/api/courses/:courseId/chapters/:chapterId", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { courseVersion, chapterVersion, ...updates } = parsed.data;
    if (typeof updates.body === "string") updates.body = sanitizeHtmlServer(updates.body);
    try {
      const result = await repository.updateChapter({
        courseId: req.params.courseId,
        chapterId: req.params.chapterId,
        actor: req.user,
        expectedCourseVersion: courseVersion,
        expectedChapterVersion: chapterVersion,
        updates,
      });
      return res.json({ data: result.chapter, courseVersion: result.courseVersion });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.post("/api/courses/:courseId/chapters/:chapterId/progress", authenticate, async (req, res) => {
    const parsed = z.object({ currentTime: z.coerce.number().nonnegative().max(10_000_000) }).strict().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      return res.json(await repository.recordVideoProgress({
        courseId: req.params.courseId,
        chapterId: req.params.chapterId,
        userId: req.user.id,
        currentTime: parsed.data.currentTime,
      }));
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.get("/api/courses/:courseId/chapters/:chapterId/progress", authenticate, async (req, res) => {
    try {
      return res.json(await repository.getProgress({
        courseId: req.params.courseId,
        chapterId: req.params.chapterId,
        userId: req.user.id,
      }));
    } catch (error) {
      return sendError(res, error);
    }
  });

  const recordTime = (schema, selectIncrement) => async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const key = idempotencyKey(req, parsed.data);
    if (!key) return res.status(400).json({ error: "A valid Idempotency-Key header is required" });
    try {
      return res.json(await repository.recordHeartbeat({
        courseId: req.params.courseId,
        chapterId: req.params.chapterId,
        userId: req.user.id,
        idempotencyKey: key,
        incrementSeconds: selectIncrement(parsed.data),
        currentPositionSeconds: parsed.data.currentPositionSeconds || 0,
      }));
    } catch (error) {
      return sendError(res, error);
    }
  };

  app.post(
    "/api/courses/:courseId/chapters/:chapterId/time",
    authenticate,
    recordTime(timeSchema, (body) => body.seconds)
  );
  app.post(
    "/api/courses/:courseId/chapters/:chapterId/heartbeat",
    authenticate,
    recordTime(heartbeatSchema, (body) => body.incrementSeconds)
  );
}
