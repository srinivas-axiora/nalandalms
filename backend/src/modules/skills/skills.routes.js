// Module: Skills, Target Skills, Chapter Feedbacks.
//
// Phase-2/43 cutover (gated): the skills flag, legacy global PostgreSQL flag or
// relational course cutover selects the PostgreSQL competency authority.
// The OFF path (default) is unchanged and verified; the ON path is the migration
// target and chapter-feedback authority (verify against a real DB per
// docs/POSTGRES-MIGRATION.md).
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { now, skills, targetSkills, chapterFeedbacks, users } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import * as skillsRepo from "../../repositories/skills.repository.pg.js";
import { relationalSkillsEnabled } from "../../runtime-modes.js";

const USE_RELATIONAL_SKILLS = relationalSkillsEnabled();

const skillStatusSchema = z.object({
  status: z.enum(["Active", "Inactive"]),
}).strict();

const targetSkillSchema = z.object({
  skillId: z.string().trim().min(1).max(200),
  scope: z.enum(["Organization", "Department", "Role", "Employee"]),
  department: z.string().trim().min(1).max(200).optional(),
  designation: z.string().trim().min(1).max(200).optional(),
  userId: z.string().trim().min(1).max(200).optional(),
  targetLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  targetScore: z.coerce.number().int().min(1).max(100),
  priority: z.enum(["Low", "Medium", "High"]),
}).strict().superRefine((value, ctx) => {
  const required = {
    Department: "department",
    Role: "designation",
    Employee: "userId",
  }[value.scope];
  if (required && !value[required]) {
    ctx.addIssue({
      code: "custom",
      path: [required],
      message: `${required} is required for ${value.scope} scope`,
    });
  }
  for (const field of ["department", "designation", "userId"]) {
    if (field !== required && value[field] !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: `${field} is not permitted for ${value.scope} scope`,
      });
    }
  }
});

const snapshotTargetReferenceError = (target) => {
  const skill = skills.find((item) => item.id === target.skillId);
  if (!skill) return { status: 404, code: "SKILL_NOT_FOUND", error: "Skill not found" };
  if (skill.status !== "Active") {
    return { status: 409, code: "SKILL_INACTIVE", error: "Target rules require an active skill" };
  }
  if (target.scope === "Organization") return null;
  const activeUsers = users.filter((user) => user.status === "Active");
  const exists = target.scope === "Department"
    ? activeUsers.some((user) => user.department === target.department)
    : target.scope === "Role"
      ? activeUsers.some((user) => user.designation === target.designation)
      : activeUsers.some((user) => user.id === target.userId);
  return exists
    ? null
    : { status: 422, code: "TARGET_SCOPE_NOT_FOUND", error: `Active ${target.scope.toLowerCase()} target not found` };
};

export function registerSkills(app) {
  app.post("/api/skills", authenticate, requireRole("Admin"), requireStepUp, async (req, res) => {
    const schema = z.object({
      name: z.string().trim().min(2).max(120),
      category: z.enum(["Technical", "Functional", "Leadership", "Compliance", "Behavioral"]),
      description: z.string().trim().max(2000).default("")
    }).strict();
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const skill = {
      id: `SKILL-${uuid()}`,
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description,
      status: "Active",
      createdAt: now()
    };

    if (USE_RELATIONAL_SKILLS) {
      try {
        const saved = await skillsRepo.createSkill({ actor: req.user, skill });
        return res.status(201).json({ data: saved });
      } catch (error) {
        if (error?.code === "DUPLICATE_SKILL") {
          return res.status(409).json({ error: "Skill name already exists" });
        }
        throw error;
      }
    }

    if (skills.some((item) => item.name.toLowerCase() === skill.name.toLowerCase())) {
      return res.status(409).json({ error: "Skill name already exists" });
    }
    skills.unshift(skill);
    audit(req.user.id, "CREATE_SKILL", "SKILL", skill.id);
    res.status(201).json({ data: skill });
  });

  const updateSkillStatus = async (req, res) => {
    const parsed = skillStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (USE_RELATIONAL_SKILLS) {
      const updated = await skillsRepo.updateSkillStatus({
        actor: req.user,
        id: req.params.id,
        status: parsed.data.status,
      });
      if (!updated) return res.status(404).json({ error: "Skill not found" });
      return res.json({ data: updated });
    }

    const skill = skills.find((item) => item.id === req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    skill.status = parsed.data.status;
    audit(req.user.id, "SKILL_STATUS", "SKILL", skill.id, parsed.data);
    res.json({ data: skill });
  };

  app.patch(
    "/api/skills/:id/status",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    updateSkillStatus,
  );

  const createTargetSkill = async (req, res) => {
    const parsed = targetSkillSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const target = {
      id: `TS-${uuid()}`,
      skillId: parsed.data.skillId,
      scope: parsed.data.scope,
      department: parsed.data.scope === "Department" ? parsed.data.department : undefined,
      designation: parsed.data.scope === "Role" ? parsed.data.designation : undefined,
      userId: parsed.data.scope === "Employee" ? parsed.data.userId : undefined,
      targetLevel: parsed.data.targetLevel,
      targetScore: parsed.data.targetScore,
      priority: parsed.data.priority,
      createdAt: now()
    };

    if (USE_RELATIONAL_SKILLS) {
      try {
        const saved = await skillsRepo.createTargetSkill({ actor: req.user, target });
        return res.status(201).json({ data: saved });
      } catch (error) {
        if (error instanceof skillsRepo.SkillTargetRepositoryError) {
          const status = error.code === "SKILL_NOT_FOUND" ? 404
            : error.code === "SKILL_INACTIVE" ? 409
              : 422;
          return res.status(status).json({ error: error.message, code: error.code });
        }
        throw error;
      }
    }

    const referenceError = snapshotTargetReferenceError(target);
    if (referenceError) return res.status(referenceError.status).json(referenceError);
    targetSkills.unshift(target);
    audit(req.user.id, "CREATE_TARGET_SKILL", "TARGET_SKILL", target.id);
    res.status(201).json({ data: target });
  };

  app.post(
    "/api/skills/targets",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    createTargetSkill,
  );

  // Compatibility aliases use the same strict handlers. They are retained for
  // existing clients but advertise deprecation instead of maintaining a second
  // validation and authorization model.
  app.patch(
    "/api/skills/:id",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    (req, res, next) => {
      res.set("Deprecation", "true");
      res.set("Link", '</api/skills/:id/status>; rel="successor-version"');
      return updateSkillStatus(req, res, next);
    },
  );

  app.post(
    "/api/target-skills",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    (req, res, next) => {
      res.set("Deprecation", "true");
      res.set("Link", '</api/skills/targets>; rel="successor-version"');
      return createTargetSkill(req, res, next);
    },
  );

  app.post("/api/chapter-feedbacks", authenticate, async (req, res) => {
    const schema = z.object({
      chapterId: z.string().trim().min(1).max(200),
      courseId: z.string().trim().min(1).max(200),
      rating: z.number().min(1).max(5),
      clarity: z.number().min(1).max(5),
      relevance: z.number().min(1).max(5),
      comments: z.string().trim().max(2000)
    }).strict();
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const fb = {
      id: `CF-${uuid()}`,
      ...parsed.data,
      userId: req.user.id,
      submittedAt: now()
    };
    if (USE_RELATIONAL_SKILLS) {
      try {
        const saved = await skillsRepo.upsertChapterFeedback({ actor: req.user, feedback: fb });
        return res.status(201).json({ data: saved });
      } catch (error) {
        if (error instanceof skillsRepo.SkillFeedbackRepositoryError) {
          return res.status(403).json({ error: error.message, code: error.code });
        }
        throw error;
      }
    }
    chapterFeedbacks.push(fb);
    audit(req.user.id, "CHAPTER_FEEDBACK", "FEEDBACK", fb.id);
    res.status(201).json({ data: fb });
  });
}
