// Module: Cohorts (Batch creation, invite codes, self-joining, progress analytics).
import { z } from "zod";
import crypto from "node:crypto";
import { cohorts, courses, assignments, attempts, users, now, isAdmin } from "../../core.js";
import { audit, canManageCourse } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";
import { registerCohortsPgRoutes } from "./cohorts.pg.routes.js";

const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "NLD-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function registerCohorts(app) {
  if (USE_PG_COURSES) return registerCohortsPgRoutes(app);
  // ── Create Cohort ──
  app.post(
    "/api/cohorts",
    authenticate,
    requireRole("Admin", "Manager", "Instructor"),
    (req, res) => {
      const schema = z.object({
        name: z.string().min(3),
        courseId: z.string().min(2),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        capacity: z.coerce.number().int().positive().default(100),
        description: z.string().default(""),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

      const course = courses.find((c) => c.id === parsed.data.courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      if (!isAdmin(req.user.role) && !canManageCourse(req.user, course) && course.ownerId !== req.user.id) {
        return res.status(403).json({ error: "You do not have permission to create cohorts for this course" });
      }

      // Generate unique invite code
      let inviteCode = generateInviteCode();
      while (cohorts.some((c) => c.inviteCode === inviteCode)) {
        inviteCode = generateInviteCode();
      }

      const cohort = {
        id: `COH-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
        name: parsed.data.name,
        courseId: course.id,
        instructorId: req.user.id,
        startDate: parsed.data.startDate || now(),
        endDate: parsed.data.endDate || null,
        capacity: parsed.data.capacity,
        description: parsed.data.description,
        inviteCode,
        active: true,
        createdAt: now(),
        updatedAt: now(),
      };

      cohorts.push(cohort);
      audit(req.user.id, "CREATE_COHORT", "COHORT", cohort.id, {
        courseId: course.id,
        inviteCode: cohort.inviteCode,
      });

      res.status(201).json({ data: cohort });
    }
  );

  // ── List Cohorts ──
  app.get("/api/cohorts", authenticate, (req, res) => {
    let visible = [];
    if (isAdmin(req.user.role)) {
      visible = cohorts;
    } else if (req.user.role === "Instructor" || req.user.role === "Manager") {
      visible = cohorts.filter((c) => c.instructorId === req.user.id);
    } else {
      // Learner sees cohorts they have joined
      const userCohortIds = new Set(
        assignments.filter((a) => a.userId === req.user.id && a.cohortId).map((a) => a.cohortId)
      );
      visible = cohorts.filter((c) => userCohortIds.has(c.id));
    }

    const decorated = visible.map((c) => {
      const course = courses.find((item) => item.id === c.courseId);
      const memberCount = assignments.filter((a) => a.cohortId === c.id).length;
      return {
        ...c,
        courseTitle: course?.title || "Unknown Course",
        memberCount,
      };
    });

    res.json({ data: decorated, total: decorated.length });
  });

  // ── Get Single Cohort ──
  app.get("/api/cohorts/:id", authenticate, (req, res) => {
    const cohort = cohorts.find((c) => c.id === req.params.id);
    if (!cohort) return res.status(404).json({ error: "Cohort not found" });

    const course = courses.find((c) => c.id === cohort.courseId);
    const memberCount = assignments.filter((a) => a.cohortId === cohort.id).length;

    res.json({
      data: {
        ...cohort,
        courseTitle: course?.title || "Unknown Course",
        memberCount,
      },
    });
  });

  // ── Join Cohort via Invite Code ──
  app.post("/api/cohorts/join", authenticate, (req, res) => {
    const schema = z.object({
      inviteCode: z.string().min(3).trim(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const code = parsed.data.inviteCode.toUpperCase();
    const cohort = cohorts.find((c) => c.inviteCode === code && c.active);
    if (!cohort) {
      return res.status(404).json({ error: "Invalid or expired cohort invite code" });
    }

    const course = courses.find((c) => c.id === cohort.courseId);
    if (!course || course.status !== "Active" || course.approval !== "Approved") {
      return res.status(400).json({ error: "The course associated with this cohort is no longer active" });
    }

    // Check capacity
    const currentMembers = assignments.filter((a) => a.cohortId === cohort.id);
    if (currentMembers.length >= cohort.capacity) {
      return res.status(400).json({ error: "This cohort has reached its maximum capacity" });
    }

    // Check existing enrollment
    let existing = assignments.find((a) => a.courseId === cohort.courseId && a.userId === req.user.id);
    if (existing) {
      if (existing.cohortId === cohort.id) {
        return res.status(200).json({
          message: "You are already a member of this cohort",
          data: { cohort, enrollment: existing },
        });
      }
      // Associate with this cohort
      existing.cohortId = cohort.id;
      audit(req.user.id, "JOIN_COHORT", "COHORT", cohort.id, { existingEnrollmentId: existing.id });
      return res.status(200).json({
        message: "Successfully joined cohort",
        data: { cohort, enrollment: existing },
      });
    }

    const newEnrollment = {
      id: `ENR-${Math.floor(1000 + Math.random() * 9000)}`,
      courseId: cohort.courseId,
      userId: req.user.id,
      assignedBy: cohort.instructorId,
      cohortId: cohort.id,
      status: "Enrolled",
      dueAt: cohort.endDate || null,
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
    audit(req.user.id, "JOIN_COHORT", "COHORT", cohort.id, { enrollmentId: newEnrollment.id });

    res.status(201).json({
      message: "Successfully enrolled and joined cohort",
      data: { cohort, enrollment: newEnrollment },
    });
  });

  // ── Cohort Analytics & Roster ──
  app.get("/api/cohorts/:id/analytics", authenticate, (req, res) => {
    const cohort = cohorts.find((c) => c.id === req.params.id);
    if (!cohort) return res.status(404).json({ error: "Cohort not found" });

    const course = courses.find((c) => c.id === cohort.courseId);
    if (!isAdmin(req.user.role) && cohort.instructorId !== req.user.id && course?.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: Only cohort instructor or admins can view analytics" });
    }

    const memberAssignments = assignments.filter((a) => a.cohortId === cohort.id);
    const totalMembers = memberAssignments.length;

    const progressSum = memberAssignments.reduce((acc, a) => acc + (a.progress || 0), 0);
    const averageProgress = totalMembers > 0 ? Math.round(progressSum / totalMembers) : 0;

    // Status breakdown
    const statusCounts = {
      Enrolled: 0,
      InProgress: 0,
      ChaptersComplete: 0,
      AssessmentEligible: 0,
      Passed: 0,
      Failed: 0,
      Certified: 0,
    };

    const roster = memberAssignments.map((a) => {
      const user = users.find((u) => u.id === a.userId);
      const userAttempts = attempts.filter((att) => att.courseId === cohort.courseId && att.userId === a.userId);
      const latestAttempt = userAttempts[0] || null;

      const effectiveStatus = a.status || (a.progress === 100 ? "ChaptersComplete" : a.progress > 0 ? "InProgress" : "Enrolled");
      if (statusCounts[effectiveStatus] !== undefined) {
        statusCounts[effectiveStatus]++;
      } else {
        statusCounts.Enrolled++;
      }

      return {
        userId: a.userId,
        userName: user?.name || "Unknown",
        email: user?.email || "Unknown",
        progress: a.progress || 0,
        status: effectiveStatus,
        timeSpentMinutes: a.timeSpentMinutes || 0,
        completedChaptersCount: (a.completedChapters || []).length,
        assessmentScore: latestAttempt?.score ?? null,
        assessmentPassed: latestAttempt?.status === "Passed" || latestAttempt?.feedback === "Passed",
        lastActiveAt: a.lastHeartbeatAt || a.startedAt || a.createdAt,
      };
    });

    const passedCount = statusCounts.Passed + statusCounts.Certified;
    const passRate = totalMembers > 0 ? Math.round((passedCount / totalMembers) * 100) : 0;

    res.json({
      data: {
        cohortId: cohort.id,
        name: cohort.name,
        courseTitle: course?.title || "Unknown Course",
        inviteCode: cohort.inviteCode,
        capacity: cohort.capacity,
        totalMembers,
        averageProgress,
        passRate,
        statusCounts,
        roster,
      },
    });
  });
}

