import crypto from "node:crypto";
import { z } from "zod";
import { authenticate, requireRole } from "../../middleware.js";
import {
  AssignmentAuthorityError,
  assignmentAuthorityRepository as repository,
} from "../../repositories/assignment-authority.repository.pg.js";

const id = z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9._:-]+$/);
const schema = z.object({
  courseId: id,
  userIds: z.array(id).min(1).max(500),
  dueAt: z.iso.date().nullable().optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  mandatory: z.boolean().default(false),
}).strict();

const statusFor = (error) => {
  if (!(error instanceof AssignmentAuthorityError)) return 500;
  if (error.code === "COURSE_NOT_FOUND") return 404;
  if (["FORBIDDEN", "ASSIGNEE_FORBIDDEN"].includes(error.code)) return 403;
  if (error.code === "ALREADY_ASSIGNED") return 409;
  return 500;
};

export function registerEnrollmentsPgRoutes(app) {
  app.post("/api/assignments", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const uniqueUserIds = [...new Set(parsed.data.userIds)];
    try {
      const data = await repository.assignCourse({
        courseId: parsed.data.courseId,
        actor: req.user,
        assignees: uniqueUserIds.map((userId) => ({
          userId,
          enrollmentId: `ENR-${crypto.randomBytes(10).toString("hex").toUpperCase()}`,
        })),
        dueAt: parsed.data.dueAt || null,
        priority: parsed.data.priority,
        mandatory: parsed.data.mandatory,
      });
      return res.status(201).json({ data });
    } catch (error) {
      if (!(error instanceof AssignmentAuthorityError)) throw error;
      return res.status(statusFor(error)).json({
        error: error.message,
        code: error.code,
        ...(Object.keys(error.details || {}).length ? { details: error.details } : {}),
      });
    }
  });
}
