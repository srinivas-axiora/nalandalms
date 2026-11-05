// Module: Skills, Target Skills, Chapter Feedbacks.
//
// Phase-2 cutover (gated): when USE_PG_SKILLS=1, skills + target-skills use the
// PostgreSQL repository; otherwise the original in-memory behavior runs verbatim.
// The OFF path (default) is unchanged and verified; the ON path is the migration
// target and chapter-feedback authority (verify against a real DB per
// docs/POSTGRES-MIGRATION.md).
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { now, skills, targetSkills, chapterFeedbacks } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";
import * as skillsRepo from "../../repositories/skills.repository.pg.js";

const USE_PG_SKILLS = process.env.USE_PG_SKILLS === "1";

export function registerSkills(app) {
  app.post("/api/skills", authenticate, requireRole("Admin"), async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      category: z.enum(["Technical", "Functional", "Leadership", "Compliance", "Behavioral"]),
      description: z.string().default("")
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const skill = {
      id: `SKILL-${Math.floor(1000 + Math.random() * 9000)}`,
      name: parsed.data.name.trim(),
      category: parsed.data.category,
      description: parsed.data.description,
      status: "Active",
      createdAt: now()
    };

    if (USE_PG_SKILLS) {
      if (await skillsRepo.findSkillByName(skill.name)) {
        return res.status(409).json({ error: "Skill name already exists" });
      }
      const saved = await skillsRepo.insertSkill(skill);
      audit(req.user.id, "CREATE_SKILL", "SKILL", saved.id);
      return res.status(201).json({ data: saved });
    }

    if (skills.some((item) => item.name.toLowerCase() === skill.name.toLowerCase())) {
      return res.status(409).json({ error: "Skill name already exists" });
    }
    skills.unshift(skill);
    audit(req.user.id, "CREATE_SKILL", "SKILL", skill.id);
    res.status(201).json({ data: skill });
  });

  app.patch("/api/skills/:id/status", authenticate, requireRole("Admin"), async (req, res) => {
    const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (USE_PG_SKILLS) {
      const updated = await skillsRepo.setSkillStatus(req.params.id, parsed.data.status);
      if (!updated) return res.status(404).json({ error: "Skill not found" });
      audit(req.user.id, "SKILL_STATUS", "SKILL", updated.id, parsed.data);
      return res.json({ data: updated });
    }

    const skill = skills.find((item) => item.id === req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    skill.status = parsed.data.status;
    audit(req.user.id, "SKILL_STATUS", "SKILL", skill.id, parsed.data);
    res.json({ data: skill });
  });

  app.post("/api/skills/targets", authenticate, requireRole("Admin"), async (req, res) => {
    const schema = z.object({
      skillId: z.string(),
      scope: z.enum(["Organization", "Department", "Role", "Employee"]),
      department: z.string().optional(),
      designation: z.string().optional(),
      userId: z.string().optional(),
      targetLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
      targetScore: z.coerce.number().min(1).max(100),
      priority: z.enum(["Low", "Medium", "High"])
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const target = {
      id: `TS-${Math.floor(1000 + Math.random() * 9000)}`,
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

    if (USE_PG_SKILLS) {
      const saved = await skillsRepo.insertTargetSkill(target);
      audit(req.user.id, "CREATE_TARGET_SKILL", "TARGET_SKILL", saved.id);
      return res.status(201).json({ data: saved });
    }

    targetSkills.unshift(target);
    audit(req.user.id, "CREATE_TARGET_SKILL", "TARGET_SKILL", target.id);
    res.status(201).json({ data: target });
  });

  app.patch("/api/skills/:id", authenticate, requireRole("Admin"), async (req, res) => {
    if (USE_PG_SKILLS) {
      let skill = await skillsRepo.findSkillById(req.params.id);
      if (!skill) return res.status(404).json({ error: "Skill not found" });
      if (req.body.status) skill = await skillsRepo.setSkillStatus(skill.id, req.body.status);
      audit(req.user.id, "UPDATE_SKILL_STATUS", "SKILL", skill.id);
      return res.json({ data: skill });
    }

    const skill = skills.find((s) => s.id === req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    if (req.body.status) skill.status = req.body.status;
    audit(req.user.id, "UPDATE_SKILL_STATUS", "SKILL", skill.id);
    res.json({ data: skill });
  });

  app.post("/api/target-skills", authenticate, requireRole("Admin"), async (req, res) => {
    const schema = z.object({
      skillId: z.string(),
      scope: z.enum(["Organization", "Department", "Role", "Employee"]),
      department: z.string().optional(),
      designation: z.string().optional(),
      userId: z.string().optional(),
      targetLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
      targetScore: z.number().min(0).max(100),
      priority: z.enum(["Low", "Medium", "High"])
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const target = {
      id: `TS-${Math.floor(1000 + Math.random() * 9000)}`,
      ...parsed.data
    };

    if (USE_PG_SKILLS) {
      const saved = await skillsRepo.insertTargetSkill(target);
      audit(req.user.id, "CREATE_TARGET_SKILL", "TARGET_SKILL", saved.id);
      return res.status(201).json({ data: saved });
    }

    targetSkills.push(target);
    audit(req.user.id, "CREATE_TARGET_SKILL", "TARGET_SKILL", target.id);
    res.status(201).json({ data: target });
  });

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
    if (USE_PG_SKILLS) {
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
