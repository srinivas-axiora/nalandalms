import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { assessments, courses } from "../../backend/src/core.js";
import { attemptsRepository } from "../../backend/src/repositories/attempts.repository.pg.js";
import { assessmentAuthorityRepository } from "../../backend/src/repositories/assessment-authority.repository.pg.js";

describe("relational attempt authorization", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousAttempts = process.env.USE_PG_ATTEMPTS;
  const staleCourse = { id: "CRS-STALE-AUTHZ", ownerId: "STALE-OWNER" };
  const staleAssessment = {
    id: "ASM-STALE-AUTHZ",
    courseId: staleCourse.id,
    ownerId: "STALE-OWNER",
  };
  const persistedAttempt = {
    id: "ATT-REL-AUTHZ",
    assessmentId: staleAssessment.id,
    courseId: staleCourse.id,
    userId: "LEARNER-REL",
    assignedProctorId: "PROCTOR-REL",
    status: "InProgress",
  };
  let requireAttemptPermission;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_ATTEMPTS = "1";
    courses.push(staleCourse);
    assessments.push(staleAssessment);
    vi.spyOn(attemptsRepository, "findById").mockResolvedValue(persistedAttempt);
    vi.spyOn(assessmentAuthorityRepository, "canManageAssessment").mockResolvedValue(false);
    ({ requireAttemptPermission } = await import("../../backend/src/security/authorization.js?phase35-relational-attempt-authz"));
  });

  beforeEach(() => {
    attemptsRepository.findById.mockClear();
    assessmentAuthorityRepository.canManageAssessment.mockClear();
    assessmentAuthorityRepository.canManageAssessment.mockResolvedValue(false);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    courses.splice(courses.indexOf(staleCourse), 1);
    assessments.splice(assessments.indexOf(staleAssessment), 1);
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousAttempts === undefined) delete process.env.USE_PG_ATTEMPTS;
    else process.env.USE_PG_ATTEMPTS = previousAttempts;
  });

  const invoke = async (permission, user) => {
    const req = { params: { attemptId: persistedAttempt.id }, body: {}, user };
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    const next = vi.fn();
    await requireAttemptPermission(permission)(req, res, next);
    return { req, res, next };
  };

  it("rejects an owner that exists only in the stale snapshot", async () => {
    const { res, next } = await invoke("control", { id: "STALE-OWNER", role: "Instructor" });

    expect(assessmentAuthorityRepository.canManageAssessment).toHaveBeenCalledWith({
      id: staleAssessment.id,
      actor: { id: "STALE-OWNER", role: "Instructor" },
    });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts ownership only when relational assessment authority confirms it", async () => {
    assessmentAuthorityRepository.canManageAssessment.mockResolvedValueOnce(true);
    const { req, next } = await invoke("grade", { id: "REL-OWNER", role: "Instructor" });

    expect(next).toHaveBeenCalledOnce();
    expect(req.authorizedAttempt).toMatchObject({ id: persistedAttempt.id });
  });

  it("allows only the authoritative attempt candidate and assigned proctor directly", async () => {
    const candidate = await invoke("view", { id: persistedAttempt.userId, role: "Learner" });
    const proctor = await invoke("control", { id: persistedAttempt.assignedProctorId, role: "Instructor" });

    expect(candidate.next).toHaveBeenCalledOnce();
    expect(proctor.next).toHaveBeenCalledOnce();
    expect(assessmentAuthorityRepository.canManageAssessment).not.toHaveBeenCalled();
  });

  it("revokes proctor and ownership access after a staff-role downgrade", async () => {
    assessmentAuthorityRepository.canManageAssessment.mockResolvedValueOnce(true);
    const { res, next } = await invoke("view", {
      id: persistedAttempt.assignedProctorId,
      role: "Learner",
    });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(assessmentAuthorityRepository.canManageAssessment).not.toHaveBeenCalled();
  });
});
