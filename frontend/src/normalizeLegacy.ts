// Some seeded course packs (backend/src/seed/courses/*) use an older content
// schema (level/duration/order/content/estimatedMinutes, question text/
// correctAnswer, ...). The UI expects the canonical Course/Chapter/Assessment
// shapes from types.ts, so map legacy fields here before any page renders.
import type { Assessment, Chapter, Course, Question } from "./types";

type Loose = Record<string, any>;

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;
const FALLBACK_COLORS = ["#0891b2", "#7c3aed", "#ea580c", "#16a34a", "#db2777", "#2563eb"];

const toDifficulty = (value: unknown): Course["difficulty"] =>
  (DIFFICULTIES as readonly string[]).includes(String(value)) ? (value as Course["difficulty"]) : "Intermediate";

const toStatus = (value: unknown): Course["status"] =>
  String(value || "").toLowerCase() === "inactive" ? "Inactive" : "Active";

const hoursFromDuration = (duration: unknown): number | null => {
  const match = /^\s*([\d.]+)\s*(hours?|hrs?|h)\b/i.exec(String(duration ?? ""));
  return match ? Number(match[1]) : null;
};

export function normalizeChapter(raw: Chapter): Chapter {
  const ch = raw as Chapter & Loose;
  return {
    ...ch,
    sequence: ch.sequence ?? ch.order ?? ch.chapterNumber ?? 0,
    description: ch.description ?? ch.summary ?? "",
    contentType: ch.contentType || "Rich Text",
    body: ch.body ?? ch.content ?? "",
    durationMinutes: ch.durationMinutes ?? ch.estimatedMinutes ?? ch.readingTimeMinutes ?? 10,
  };
}

export function normalizeCourse(raw: Course, ctx: { chapters: Chapter[]; skillNameById: Map<string, string>; courseIds: Set<string>; index: number }): Course {
  const c = raw as Course & Loose;
  const legacySkillIds: string[] = c.skillIds ?? c.skillsCovered ?? c.skills ?? [];
  const chapterMinutes = ctx.chapters.filter((ch) => ch.courseId === c.id).reduce((sum, ch) => sum + (ch.durationMinutes || 0), 0);
  const isLegacyPublished = String(c.status || "").toLowerCase() === "published" || c.status === undefined;
  return {
    ...c,
    difficulty: c.difficulty ? toDifficulty(c.difficulty) : toDifficulty(c.level),
    estimatedHours: c.estimatedHours ?? hoursFromDuration(c.duration) ?? Math.max(1, Math.round(chapterMinutes / 60)),
    skillIds: legacySkillIds,
    skill: c.skill || ctx.skillNameById.get(legacySkillIds[0]) || c.category || "General",
    // Legacy packs list free-text prerequisites; only course IDs are enforceable.
    prerequisites: (c.prerequisites || []).filter((p: string) => ctx.courseIds.has(p)),
    tags: c.tags ?? [],
    thumbnailColor: c.thumbnailColor || FALLBACK_COLORS[ctx.index % FALLBACK_COLORS.length],
    ownerId: c.ownerId || "SAnalanda",
    approval: c.approval || (isLegacyPublished ? "Approved" : "Pending"),
    status: toStatus(c.status),
    version: c.version ?? 1,
    createdAt: c.createdAt || "2024-01-01T00:00:00.000Z",
    updatedAt: c.updatedAt || c.createdAt || "2024-01-01T00:00:00.000Z",
  };
}

function normalizeQuestion(raw: Question): Question {
  const q = raw as Question & Loose;
  return {
    ...q,
    type: q.type || (Array.isArray(q.options) && q.options.length ? "MCQ" : "ShortAnswer"),
    prompt: q.prompt ?? q.text ?? q.question ?? "",
    answer: q.answer ?? q.correctAnswer,
    points: q.points ?? 10,
  };
}

export function normalizeAssessment(raw: Assessment): Assessment {
  const a = raw as Assessment & Loose;
  const questions = (a.questions || []).map(normalizeQuestion);
  return {
    ...a,
    type: a.type || (questions.every((q) => q.type === "MCQ") ? "MCQ" : "Mixed"),
    approval: a.approval || "Approved",
    passScore: a.passScore ?? a.passingScore ?? 70,
    durationMinutes: a.durationMinutes ?? Math.max(10, questions.length * 2),
    ownerId: a.ownerId || "SAnalanda",
    questions,
  };
}
