// Module: Enrollments / course assignment.
// Handler moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import { courses, users, assignments, now } from "../../core.js";
import { audit, coursesVisibleTo, visibleUserIdsFor } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";
import { registerEnrollmentsPgRoutes } from "./enrollments.pg.routes.js";

const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";

export function registerEnrollments(app) {
  if (USE_PG_COURSES) return registerEnrollmentsPgRoutes(app);
  app.post("/api/assignments", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const schema = z.object({
      courseId: z.string(),
      userIds: z.array(z.string()).min(1),
      dueAt: z.string().nullable().optional(),
      priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
      mandatory: z.boolean().default(false)
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const course = courses.find((item) => item.id === parsed.data.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (req.user.role === "Manager" && !coursesVisibleTo(req.user).some((item) => item.id === course.id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowedUserIds = new Set(visibleUserIdsFor(req.user));
    const uniqueUserIds = [...new Set(parsed.data.userIds)];
    const invalidUserIds = uniqueUserIds.filter((userId) => {
      const user = users.find((item) => item.id === userId && item.status === "Active");
      return !user || !allowedUserIds.has(userId) || userId === req.user.id && req.user.role === "Manager";
    });
    if (invalidUserIds.length) {
      return res.status(403).json({ error: "One or more assignees are outside your permitted scope", userIds: invalidUserIds });
    }

    const duplicates = uniqueUserIds.filter((userId) => assignments.some((assignment) => assignment.courseId === course.id && assignment.userId === userId));
    if (duplicates.length) {
      return res.status(409).json({ error: "One or more users are already assigned to this course", userIds: duplicates });
    }

    const created = uniqueUserIds.map((userId) => ({
      id: `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
      courseId: course.id,
      userId,
      assignedBy: req.user.id,
      progress: 0,
      completedChapters: [],
      timeSpentMinutes: 0,
      timeSpentSeconds: 0,
      chapterTimeSpentSeconds: {},
      dueAt: parsed.data.dueAt || null,
      priority: parsed.data.priority,
      mandatory: parsed.data.mandatory,
      completedAt: null,
      createdAt: now()
    }));
    assignments.push(...created);
    audit(req.user.id, "ASSIGN_COURSE", "COURSE", course.id, { count: created.length });
    res.status(201).json({ data: created });
  });
}
