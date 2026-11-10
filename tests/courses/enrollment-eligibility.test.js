import { describe, expect, it } from "vitest";
import {
  assertSnapshotEnrollmentEligibility,
  enrollmentIsComplete,
} from "../../backend/src/enrollment-eligibility.js";

describe("enrollment prerequisite policy", () => {
  it("recognizes only completed enrollment evidence", () => {
    expect(enrollmentIsComplete({ progress: 99, status: "Enrolled" })).toBe(false);
    expect(enrollmentIsComplete({ progress: 100 })).toBe(true);
    expect(enrollmentIsComplete({ status: "Passed" })).toBe(true);
    expect(enrollmentIsComplete({ completedAt: "2026-11-10T00:00:00.000Z" })).toBe(true);
  });

  it("returns the exact unmet prerequisite set for the current learner", () => {
    const result = assertSnapshotEnrollmentEligibility({
      course: { prerequisites: ["CRS-A", "CRS-B", "CRS-B"] },
      userId: "USER-1",
      enrollments: [
        { userId: "USER-1", courseId: "CRS-A", progress: 100 },
        { userId: "USER-2", courseId: "CRS-B", progress: 100 },
      ],
    });

    expect(result).toEqual({ eligible: false, unmetPrerequisiteIds: ["CRS-B"] });
  });
});
