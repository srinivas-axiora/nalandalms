import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as enrollmentsRepository from "../../backend/src/repositories/enrollments.repository.pg.js";
import * as chaptersRepository from "../../backend/src/repositories/chapters.repository.pg.js";
import { courseAuthorityRepository } from "../../backend/src/repositories/courses-authority.repository.pg.js";
import { assessmentAuthorityRepository } from "../../backend/src/repositories/assessment-authority.repository.pg.js";

describe("local Copilot relational learning projection", () => {
  const previous = process.env.USE_PG_COURSES;
  const user = {
    id: "LEARNER-PG", name: "Relational Learner", role: "Learner",
    department: "Engineering", designation: "Engineer", managerId: "MGR-1",
  };
  let handleLocalChat;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    vi.spyOn(courseAuthorityRepository, "listVisible").mockResolvedValue([{
      id: "CRS-PG", title: "Relational Security", description: "Database-backed course",
      category: "Technical", skill: "Security", skillIds: ["SK-SEC"], targetLevel: "Advanced",
      estimatedHours: 6, difficulty: "Advanced",
    }]);
    vi.spyOn(enrollmentsRepository, "listEnrollments").mockResolvedValue([{
      id: "ENR-PG", courseId: "CRS-PG", userId: user.id, progress: 45,
      priority: "High", mandatory: true, dueAt: "2026-12-01",
    }]);
    vi.spyOn(chaptersRepository, "listChapterMetadata").mockResolvedValue([{
      id: "CH-PG", courseId: "CRS-PG", sequence: 1, title: "Threat Modeling",
      description: "Model trust boundaries", durationMinutes: 20,
    }]);
    vi.spyOn(assessmentAuthorityRepository, "listVisible").mockResolvedValue([{
      id: "ASM-PG", courseId: "CRS-PG", chapterId: "CH-PG", title: "Secure quiz",
      questions: [{ type: "MCQ", prompt: "Hidden answer question", options: ["A", "B"] }],
    }]);
    ({ handleLocalChat } = await import("../../backend/src/modules/ai/localAgent.js?phase34-relational-learning"));
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("answers my-courses from scoped relational enrollment and course state", async () => {
    const result = await handleLocalChat(user, "my courses");
    expect(result.reply).toContain("Relational Security");
    expect(result.reply).toContain("45%");
    expect(courseAuthorityRepository.listVisible).toHaveBeenCalledWith({ actor: user, status: "Active" });
    expect(enrollmentsRepository.listEnrollments).toHaveBeenCalledWith({ userId: user.id });
    expect(chaptersRepository.listChapterMetadata).not.toHaveBeenCalled();
  });

  it("does not turn an answer-redacted learner assessment into a broken quiz", async () => {
    const result = await handleLocalChat(user, "quiz me", [], {
      courseTitle: "Relational Security",
      chapterTitle: "Threat Modeling",
    });
    expect(result.reply).toContain("Software Threat Model");
    expect(result.reply).not.toContain("Hidden answer question");
  });

  it("builds course detail from relational course and chapter projections", async () => {
    const result = await handleLocalChat(user, "course detail CRS-PG");
    expect(result.reply).toContain("Course Outline: Relational Security");
    expect(result.reply).toContain("Threat Modeling");
    expect(chaptersRepository.listChapterMetadata).toHaveBeenCalledWith("CRS-PG");
  });
});
