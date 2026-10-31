// Module: Courses (list, create w/upload, update, duplicate, approval, status, delete).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { upload } from "../../config.js";
import { courses, chapters, assessments, assignments, archives, users, now, nextCourseId } from "../../core.js";
import { audit, canManageCourse, coursesVisibleTo } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";

export function registerCourses(app) {
  // ── Public Course Catalog (No Auth Required) ──
  app.get("/api/catalog", (req, res) => {
    const { skill, category, difficulty, search } = req.query;
    let list = courses.filter((c) => c.status === "Active" && c.approval === "Approved");

    if (skill) list = list.filter((c) => c.skill === skill || c.skillIds?.includes(skill));
    if (category) list = list.filter((c) => c.category === category);
    if (difficulty) list = list.filter((c) => c.difficulty === difficulty);
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter((c) => (c.title || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
    }

    const catalogItems = list.map((c) => {
      const instructor = users.find((u) => u.id === c.ownerId);
      const courseChapters = chapters.filter((ch) => ch.courseId === c.id);
      const enrollmentCount = assignments.filter((a) => a.courseId === c.id).length;
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        skill: c.skill,
        skillIds: c.skillIds || [],
        targetLevel: c.targetLevel,
        difficulty: c.difficulty,
        estimatedHours: c.estimatedHours,
        category: c.category,
        tags: c.tags || [],
        thumbnailColor: c.thumbnailColor || "#22d3ee",
        priceCents: c.priceCents ?? 0,
        currency: c.currency || "INR",
        isFree: c.isFree ?? (c.priceCents ? c.priceCents === 0 : true),
        instructorName: instructor?.name || "Nalanda Faculty",
        instructorTitle: instructor?.designation || "Instructor",
        chapterCount: courseChapters.length,
        enrollmentCount,
        createdAt: c.createdAt,
      };
    });

    res.json({ data: catalogItems, total: catalogItems.length });
  });

  // ── Self-Enrollment for Learners ──
  app.post("/api/courses/:id/enroll", authenticate, (req, res) => {
    const course = courses.find((c) => c.id === req.params.id && c.status === "Active" && c.approval === "Approved");
    if (!course) return res.status(404).json({ error: "Approved course not found" });

    const existing = assignments.find((a) => a.courseId === course.id && a.userId === req.user.id);
    if (existing) {
      return res.status(200).json({ data: existing, message: "Already enrolled in this course" });
    }

    const isFree = course.isFree ?? (course.priceCents ? course.priceCents === 0 : true);
    if (!isFree) {
      return res.status(402).json({
        error: "Payment required to enroll in this course",
        priceCents: course.priceCents,
        currency: course.currency || "INR",
      });
    }

    const newEnrollment = {
      id: `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
      courseId: course.id,
      userId: req.user.id,
      assignedBy: req.user.id,
      dueAt: null,
      priority: "Medium",
      mandatory: false,
      progress: 0,
      completedChapters: [],
      timeSpentMinutes: 0,
      timeSpentSeconds: 0,
      chapterTimeSpentSeconds: {},
      startedAt: now(),
      completedAt: null,
      createdAt: now(),
    };

    assignments.push(newEnrollment);
    audit(req.user.id, "SELF_ENROLL", "COURSE", course.id);
    res.status(201).json({ data: newEnrollment });
  });

  app.get("/api/courses", authenticate, (req, res) => {
    const { skill, approval, status = "Active" } = req.query;
    let visible = coursesVisibleTo(req.user);
    if (skill) visible = visible.filter((course) => course.skill === skill);
    if (approval) visible = visible.filter((course) => course.approval === approval);
    if (status !== "All") visible = visible.filter((course) => course.status === status);
    res.json({ data: visible, total: visible.length });
  });

  app.post("/api/courses", authenticate, requireRole("Admin", "Manager"), upload.fields([{ name: "pdf" }, { name: "video" }]), (req, res) => {
    let body;
    try {
      body = typeof req.body.payload === "string" ? JSON.parse(req.body.payload) : req.body;
    } catch {
      return res.status(400).json({ error: "Invalid course payload JSON" });
    }
    const schema = z.object({
      title: z.string().min(4),
      description: z.string().min(10),
      skill: z.string().min(2),
      skillIds: z.array(z.string()).default([]),
      targetLevel: z.string().default("Beginner"),
      difficulty: z.string().default("Beginner"),
      estimatedHours: z.number().default(4),
      category: z.string().default("Technical"),
      prerequisites: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      contentTypes: z.array(z.string()).default(["Rich Text"])
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const course = {
      id: nextCourseId(parsed.data.skill),
      ...parsed.data,
      approval: req.user.role === "Admin" ? "Approved" : "Pending",
      status: "Active",
      ownerId: req.user.id,
      version: 1,
      createdAt: now(),
      updatedAt: now(),
      storage: {
        files: Object.values(req.files || {}).flat().map((f) => ({
          field: f.fieldname,
          originalName: f.originalname,
          filename: f.filename,
          path: `/uploads/${f.filename}`,
          size: f.size,
          mimetype: f.mimetype,
        })),
      }
    };
    courses.unshift(course);
    audit(req.user.id, "CREATE_COURSE", "COURSE", course.id, { approval: course.approval });
    res.status(201).json({ data: course });
  });

  app.put("/api/courses/:id", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const course = courses.find((item) => item.id === req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });
    const schema = z.object({
      title: z.string().min(4).optional(),
      description: z.string().min(10).optional(),
      skill: z.string().min(2).optional(),
      skillIds: z.array(z.string()).optional(),
      targetLevel: z.string().optional(),
      difficulty: z.string().optional(),
      estimatedHours: z.coerce.number().optional(),
      category: z.string().optional(),
      prerequisites: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      thumbnailColor: z.string().optional(),
      contentTypes: z.array(z.string()).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    Object.assign(course, parsed.data, { version: course.version + 1, approval: req.user.role === "Admin" ? "Approved" : "Pending", updatedAt: now() });
    audit(req.user.id, "UPDATE_COURSE", "COURSE", course.id, { version: course.version });
    res.json({ data: course });
  });

  app.post("/api/courses/:id/duplicate", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const source = courses.find((item) => item.id === req.params.id);
    if (!source) return res.status(404).json({ error: "Course not found" });
    const copy = { ...source, id: nextCourseId(source.skill), title: `${source.title} Copy`, approval: req.user.role === "Admin" ? "Approved" : "Pending", ownerId: req.user.id, version: 1, createdAt: now(), updatedAt: now() };
    courses.unshift(copy);
    audit(req.user.id, "DUPLICATE_COURSE", "COURSE", copy.id, { sourceId: source.id });
    res.status(201).json({ data: copy });
  });

  app.patch("/api/courses/:id/approval", authenticate, requireRole("Admin"), (req, res) => {
    const schema = z.object({ approval: z.enum(["Approved", "Rejected"]), reason: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const course = courses.find((item) => item.id === req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    course.approval = parsed.data.approval;
    if (parsed.data.approval === "Rejected") course.status = "Inactive";
    audit(req.user.id, "COURSE_APPROVAL", "COURSE", course.id, parsed.data);
    res.json({ data: course });
  });

  app.patch("/api/courses/:id/status", authenticate, requireRole("Admin"), requireStepUp, (req, res) => {
    const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const course = courses.find((item) => item.id === req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    course.status = parsed.data.status;
    audit(req.user.id, "COURSE_STATUS", "COURSE", course.id, parsed.data);
    res.json({ data: course });
  });

  app.delete("/api/courses/:id", authenticate, requireRole("Admin", "Manager"), requireStepUp, (req, res) => {
    const schema = z.object({ deletionComment: z.string().min(10) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const idx = courses.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Course not found" });
    const course = courses[idx];
    if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });

    const relatedChapters = chapters.filter((ch) => ch.courseId === course.id);
    const relatedAssessments = assessments.filter((a) => a.courseId === course.id);
    const relatedAssignments = assignments.filter((e) => e.courseId === course.id);

    const archived = {
      id: uuid(),
      entityType: "Course",
      entityId: course.id,
      entityData: { ...course },
      relatedData: {
        chapters: relatedChapters,
        assessments: relatedAssessments,
        enrollments: relatedAssignments,
      },
      deletedBy: req.user.id,
      deletedByName: req.user.name,
      deletionComment: parsed.data.deletionComment,
      deletedAt: now()
    };

    archives.unshift(archived);

    courses.splice(idx, 1);
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (chapters[i].courseId === course.id) chapters.splice(i, 1);
    }
    for (let i = assessments.length - 1; i >= 0; i--) {
      if (assessments[i].courseId === course.id) assessments.splice(i, 1);
    }
    for (let i = assignments.length - 1; i >= 0; i--) {
      if (assignments[i].courseId === course.id) assignments.splice(i, 1);
    }

    audit(req.user.id, "DELETE_COURSE", "COURSE", course.id);
    res.json({ success: true, message: "Course permanently deleted and archived" });
  });
}
