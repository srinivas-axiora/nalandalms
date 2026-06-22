// Module: Skills, Target Skills, Chapter Feedbacks.
// Handlers moved verbatim from server.js. The duplicate dead `POST /api/skills`
// (second registration, never reached) is intentionally dropped — the live
// first-registered handler is preserved here.
import { z } from "zod";
import { now, skills, targetSkills, chapterFeedbacks } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";

export function registerSkills(app) {
  app.post("/api/skills", authenticate, requireRole("Admin"), (req, res) => {
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

    if (skills.some((item) => item.name.toLowerCase() === skill.name.toLowerCase())) {
      return res.status(409).json({ error: "Skill name already exists" });
    }

    skills.unshift(skill);
    audit(req.user.id, "CREATE_SKILL", "SKILL", skill.id);
    res.status(201).json({ data: skill });
  });

  app.patch("/api/skills/:id/status", authenticate, requireRole("Admin"), (req, res) => {
    const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const skill = skills.find((item) => item.id === req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    skill.status = parsed.data.status;
    audit(req.user.id, "SKILL_STATUS", "SKILL", skill.id, parsed.data);
    res.json({ data: skill });
  });

  app.post("/api/skills/targets", authenticate, requireRole("Admin"), (req, res) => {
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

    targetSkills.unshift(target);
    audit(req.user.id, "CREATE_TARGET_SKILL", "TARGET_SKILL", target.id);
    res.status(201).json({ data: target });
  });

  app.patch("/api/skills/:id", authenticate, requireRole("Admin"), (req, res) => {
    const skill = skills.find((s) => s.id === req.params.id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });
    if (req.body.status) skill.status = req.body.status;
    audit(req.user.id, "UPDATE_SKILL_STATUS", "SKILL", skill.id);
    res.json({ data: skill });
  });

  app.post("/api/target-skills", authenticate, requireRole("Admin"), (req, res) => {
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
    targetSkills.push(target);
    audit(req.user.id, "CREATE_TARGET_SKILL", "TARGET_SKILL", target.id);
    res.status(201).json({ data: target });
  });

  app.post("/api/chapter-feedbacks", authenticate, (req, res) => {
    const schema = z.object({
      chapterId: z.string(),
      courseId: z.string(),
      rating: z.number().min(1).max(5),
      clarity: z.number().min(1).max(5),
      relevance: z.number().min(1).max(5),
      comments: z.string()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const fb = {
      id: `CF-${Math.floor(1000 + Math.random() * 9000)}`,
      ...parsed.data,
      userId: req.user.id,
      submittedAt: now()
    };
    chapterFeedbacks.push(fb);
    audit(req.user.id, "CHAPTER_FEEDBACK", "FEEDBACK", fb.id);
    res.status(201).json({ data: fb });
  });
}
