import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { relationalAttemptsEnabled } from "../../backend/src/runtime-modes.js";

describe("relational runtime invariants", () => {
  const previousAttempts = process.env.USE_PG_ATTEMPTS;
  const previousCourses = process.env.USE_PG_COURSES;

  afterEach(() => {
    if (previousAttempts === undefined) delete process.env.USE_PG_ATTEMPTS;
    else process.env.USE_PG_ATTEMPTS = previousAttempts;
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
  });

  it.each([
    ["0", "0", false],
    ["1", "0", true],
    ["0", "1", true],
    ["1", "1", true],
  ])("maps attempts=%s courses=%s to relational=%s", (attempts, courses, expected) => {
    process.env.USE_PG_ATTEMPTS = attempts;
    process.env.USE_PG_COURSES = courses;
    expect(relationalAttemptsEnabled()).toBe(expected);
  });

  it("routes every attempt mutation surface through the shared invariant", () => {
    const files = [
      "backend/server.js",
      "backend/src/security/authorization.js",
      "backend/src/modules/assessments/assessments.routes.js",
      "backend/src/modules/proctoring/cockpit.routes.js",
      "backend/src/modules/proctoring/proctoring.routes.js",
      "backend/src/modules/proctoring/pairing.js",
    ];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).toContain("relationalAttemptsEnabled");
      expect(source, file).not.toContain("process.env.USE_PG_ATTEMPTS");
    }
  });
});
