import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
  relationalAttemptsEnabled,
  relationalCertificatesEnabled,
  relationalCandidateAssessmentsEnabled,
} from "../../backend/src/runtime-modes.js";

describe("relational runtime invariants", () => {
  const previousAttempts = process.env.USE_PG_ATTEMPTS;
  const previousCourses = process.env.USE_PG_COURSES;
  const previousCertificates = process.env.USE_PG_CERTIFICATES;
  const previousCandidateAssessments = process.env.USE_PG_CANDIDATE_ASSESSMENTS;

  afterEach(() => {
    if (previousAttempts === undefined) delete process.env.USE_PG_ATTEMPTS;
    else process.env.USE_PG_ATTEMPTS = previousAttempts;
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousCertificates === undefined) delete process.env.USE_PG_CERTIFICATES;
    else process.env.USE_PG_CERTIFICATES = previousCertificates;
    if (previousCandidateAssessments === undefined) delete process.env.USE_PG_CANDIDATE_ASSESSMENTS;
    else process.env.USE_PG_CANDIDATE_ASSESSMENTS = previousCandidateAssessments;
  });

  it.each([
    ["0", "0", false],
    ["1", "0", true],
    ["0", "1", true],
    ["1", "1", true],
  ])("maps candidate assessments=%s courses=%s to relational candidates=%s", (candidates, courses, expected) => {
    process.env.USE_PG_CANDIDATE_ASSESSMENTS = candidates;
    process.env.USE_PG_COURSES = courses;
    expect(relationalCandidateAssessmentsEnabled()).toBe(expected);
  });

  it.each([
    ["0", "0", false],
    ["1", "0", true],
    ["0", "1", true],
    ["1", "1", true],
  ])("maps certificates=%s courses=%s to relational certificates=%s", (certificates, courses, expected) => {
    process.env.USE_PG_CERTIFICATES = certificates;
    process.env.USE_PG_COURSES = courses;
    expect(relationalCertificatesEnabled()).toBe(expected);
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
    const server = readFileSync("backend/server.js", "utf8");
    const certificateRoutes = readFileSync("backend/src/modules/certificates/certificates.routes.js", "utf8");
    const candidateRoutes = readFileSync("backend/src/modules/assessments/candidate-assessments.routes.js", "utf8");
    expect(server).toContain("relationalCertificatesEnabled");
    expect(certificateRoutes).toContain("relationalCertificatesEnabled");
    expect(server).not.toContain("process.env.USE_PG_CERTIFICATES");
    expect(certificateRoutes).not.toContain("process.env.USE_PG_CERTIFICATES");
    expect(server).toContain("relationalCandidateAssessmentsEnabled");
    expect(candidateRoutes).toContain("relationalCandidateAssessmentsEnabled");
    expect(server).not.toContain("process.env.USE_PG_CANDIDATE_ASSESSMENTS");
    expect(candidateRoutes).not.toContain("process.env.USE_PG_CANDIDATE_ASSESSMENTS");
  });
});
