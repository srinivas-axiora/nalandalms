// Module: Chapters (list, create, update) + learning-time / video-progress endpoints.
// Handlers moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import { sanitizeHtmlServer } from "../../lib.js";
import { courses, chapters, assignments, videoProgress, now, MAX_CHAPTER_TIME_INCREMENT_SECONDS } from "../../core.js";
import { canManageCourse, coursesVisibleTo, addChapterTime, chapterTimeFor, assessmentTimeFor, audit } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";
import { canAccessChapter, recordChapterHeartbeat } from "../enrollments/progress.service.js";

export function registerChapters(app) {
  app.get("/api/courses/:courseId/chapters", authenticate, (req, res) => {
    const course = courses.find((item) => item.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!coursesVisibleTo(req.user).some((item) => item.id === course.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const rawChapters = chapters
      .filter((chapter) => chapter.courseId === req.params.courseId)
      .sort((a, b) => a.sequence - b.sequence);
    const data = rawChapters.map((ch) => {
      const access = canAccessChapter({ courseId: req.params.courseId, chapterId: ch.id, userId: req.user.id, userRole: req.user.role });
      if (access.allowed) return { ...ch, isLocked: false, lockReason: null };
      return {
        id: ch.id,
        courseId: ch.courseId,
        sequence: ch.sequence,
        title: ch.title,
        description: ch.description || "",
        contentType: ch.contentType,
        durationMinutes: ch.durationMinutes,
        minimumTimeMinutes: ch.minimumTimeMinutes,
        isLocked: true,
        lockReason: access.error,
      };
    });
    res.json({ data, total: data.length });
  });

  app.post("/api/courses/:courseId/chapters", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const course = courses.find((item) => item.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });

    const schema = z.object({
      id: z.string().min(2).optional(),
      sequence: z.coerce.number().int().positive().optional(),
      title: z.string().min(2),
      description: z.string().default(""),
      contentType: z.enum(["Rich Text", "PDF", "Video Link"]).default("Rich Text"),
      body: z.string().default(""),
      url: z.string().optional(),
      fileName: z.string().optional(),
      durationMinutes: z.coerce.number().int().min(0).default(10),
      minimumTimeMinutes: z.coerce.number().int().min(0).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const courseChapters = chapters.filter((chapter) => chapter.courseId === course.id);
    const chapter = {
      id: parsed.data.id || `CH-${Math.floor(1000 + Math.random() * 9000)}`,
      courseId: course.id,
      sequence: parsed.data.sequence || courseChapters.length + 1,
      title: parsed.data.title,
      description: parsed.data.description,
      contentType: parsed.data.contentType,
      body: sanitizeHtmlServer(parsed.data.body),
      url: parsed.data.url,
      fileName: parsed.data.fileName,
      durationMinutes: parsed.data.durationMinutes,
      minimumTimeMinutes: parsed.data.minimumTimeMinutes ?? parsed.data.durationMinutes ?? 1,
      createdAt: now(),
      updatedAt: now()
    };

    if (chapters.some((item) => item.id === chapter.id)) return res.status(409).json({ error: "Chapter ID already exists" });
    chapters.push(chapter);
    course.updatedAt = now();
    audit(req.user.id, "CREATE_CHAPTER", "CHAPTER", chapter.id, { courseId: course.id, minimumTimeMinutes: chapter.minimumTimeMinutes });
    res.status(201).json({ data: chapter });
  });

  app.put("/api/courses/:courseId/chapters/:chapterId", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const course = courses.find((item) => item.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });
    const chapter = chapters.find((item) => item.id === req.params.chapterId && item.courseId === course.id);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });

    const schema = z.object({
      sequence: z.coerce.number().int().positive().optional(),
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      contentType: z.enum(["Rich Text", "PDF", "Video Link"]).optional(),
      body: z.string().optional(),
      url: z.string().nullable().optional(),
      fileName: z.string().nullable().optional(),
      durationMinutes: z.coerce.number().int().min(0).optional(),
      minimumTimeMinutes: z.coerce.number().int().min(0).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (typeof parsed.data.body === "string") parsed.data.body = sanitizeHtmlServer(parsed.data.body);
    Object.assign(chapter, parsed.data, { updatedAt: now() });
    course.updatedAt = now();
    audit(req.user.id, "UPDATE_CHAPTER", "CHAPTER", chapter.id, parsed.data);
    res.json({ data: chapter });
  });

  app.post("/api/courses/:courseId/chapters/:chapterId/progress", authenticate, (req, res) => {
    const { currentTime } = req.body;
    if (typeof currentTime !== "number") return res.status(400).json({ error: "Invalid currentTime" });

    const key = `${req.user.id}-${req.params.courseId}-${req.params.chapterId}`;
    videoProgress[key] = { currentTime, updatedAt: now() };

    res.json({ ok: true, currentTime });
  });

  app.post("/api/courses/:courseId/chapters/:chapterId/time", authenticate, (req, res) => {
    const schema = z.object({ seconds: z.number().int().positive().max(MAX_CHAPTER_TIME_INCREMENT_SECONDS) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const course = courses.find((item) => item.id === req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const chapter = chapters.find((item) => item.id === req.params.chapterId && item.courseId === req.params.courseId);
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });
    const access = canAccessChapter({ courseId: req.params.courseId, chapterId: req.params.chapterId, userId: req.user.id, userRole: req.user.role });
    if (!access.allowed) return res.status(access.status || 403).json({ error: access.error, requiredChapterId: access.requiredChapterId });

    const assignment = addChapterTime({ courseId: req.params.courseId, chapterId: req.params.chapterId, userId: req.user.id, seconds: parsed.data.seconds });
    const chapterTimeSeconds = chapterTimeFor(assignment, req.params.chapterId);
    const minimumTimeSeconds = Math.max(0, Math.round((chapter.minimumTimeMinutes || 0) * 60));

    res.json({
      ok: true,
      data: assignment,
      totals: {
        chapterId: req.params.chapterId,
        chapterTimeSeconds,
        minimumTimeSeconds,
        minimumTimeMet: chapterTimeSeconds >= minimumTimeSeconds,
        assessmentTimeSeconds: assessmentTimeFor({ userId: req.user.id, courseId: req.params.courseId, chapterId: req.params.chapterId }),
        courseTimeSeconds: assignment.timeSpentSeconds || 0
      }
    });
  });

  app.get("/api/courses/:courseId/chapters/:chapterId/progress", authenticate, (req, res) => {
    const key = `${req.user.id}-${req.params.courseId}-${req.params.chapterId}`;
    const record = videoProgress[key];
    const assignment = assignments.find((item) => item.courseId === req.params.courseId && item.userId === req.user.id);
    const chapter = chapters.find((item) => item.id === req.params.chapterId && item.courseId === req.params.courseId);
    const chapterTimeSeconds = assignment ? chapterTimeFor(assignment, req.params.chapterId) : 0;
    const minimumTimeSeconds = Math.max(0, Math.round((chapter?.minimumTimeMinutes || 0) * 60));
    res.json({
      currentTime: record ? record.currentTime : 0,
      chapterTimeSeconds,
      minimumTimeSeconds,
      minimumTimeMet: chapterTimeSeconds >= minimumTimeSeconds
    });
  });
  app.post("/api/courses/:courseId/chapters/:chapterId/heartbeat", authenticate, (req, res) => {
    const schema = z.object({
      currentPositionSeconds: z.number().nonnegative().optional(),
      incrementSeconds: z.number().positive().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const result = recordChapterHeartbeat({
        courseId: req.params.courseId,
        chapterId: req.params.chapterId,
        userId: req.user.id,
        userRole: req.user.role,
        currentPositionSeconds: parsed.data.currentPositionSeconds ?? 0,
        incrementSeconds: parsed.data.incrementSeconds ?? 15
      });
      res.json(result);
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message, details: err.details });
    }
  });
}
