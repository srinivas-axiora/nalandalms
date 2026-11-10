import { describe, expect, it } from "vitest";
import {
  activeDependentCourseIds,
  validateCoursePrerequisites,
} from "../../backend/src/course-prerequisite-policy.js";

const course = (id, prerequisites = [], overrides = {}) => ({
  id, prerequisites, status: "Active", approval: "Approved", ...overrides,
});

describe("course prerequisite graph policy", () => {
  it("rejects unknown, unavailable and cyclic prerequisites", () => {
    const courses = [
      course("CRS-A", ["CRS-B"]),
      course("CRS-B", ["CRS-C"]),
      course("CRS-C"),
      course("CRS-D", [], { status: "Inactive" }),
    ];
    expect(validateCoursePrerequisites({
      courseId: "CRS-C", prerequisiteIds: ["CRS-MISSING"], courses,
    })).toMatchObject({ valid: false, code: "COURSE_PREREQUISITE_NOT_FOUND" });
    expect(validateCoursePrerequisites({
      courseId: "CRS-C", prerequisiteIds: ["CRS-D"], courses, requireAvailable: true,
    })).toMatchObject({ valid: false, code: "COURSE_PREREQUISITE_UNAVAILABLE" });
    expect(validateCoursePrerequisites({
      courseId: "CRS-C", prerequisiteIds: ["CRS-A"], courses,
    })).toMatchObject({ valid: false, code: "COURSE_PREREQUISITE_CYCLE" });
  });

  it("normalizes valid prerequisites and finds live dependents", () => {
    const courses = [course("CRS-A", ["CRS-B"]), course("CRS-B")];
    expect(validateCoursePrerequisites({
      courseId: "CRS-A", prerequisiteIds: [" CRS-B ", "CRS-B"], courses,
      requireAvailable: true,
    })).toEqual({ valid: true, prerequisites: ["CRS-B"] });
    expect(activeDependentCourseIds({ courseId: "CRS-B", courses })).toEqual(["CRS-A"]);
  });
});
