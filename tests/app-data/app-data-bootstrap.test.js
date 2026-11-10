import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../backend/server.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("decomposed app-data bootstrap projection", () => {
  it("serves minimal bootstrap state without bulky telemetry or audit logs", async () => {
    const employeeCookie = authCookieFor(testUsers.employee);
    const response = await request(app)
      .get("/api/app-data/bootstrap")
      .set("Cookie", employeeCookie);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("users");
    expect(response.body).toHaveProperty("courses");
    expect(response.body).toHaveProperty("chapters");
    expect(response.body).toHaveProperty("assessments");
    expect(response.body).toHaveProperty("assignments");
    expect(response.body).toHaveProperty("attempts");
    expect(response.body).toHaveProperty("skills");
    expect(response.body).toHaveProperty("targetSkills");

    // Bulky / sensitive logs omitted from bootstrap
    expect(response.body.auditLogs).toBeUndefined();
    expect(response.body.securityEvents).toBeUndefined();
    expect(response.body.proctoringLogs).toBeUndefined();
    expect(response.body.reportExports).toBeUndefined();
    expect(response.body.acharyaFeedbackMemory).toBeUndefined();
    expect(response.body.candidateAssessments).toBeUndefined();
  });

  it("serves standard app-data with RFC deprecation and successor headers", async () => {
    const adminCookie = authCookieFor(testUsers.admin);
    const response = await request(app)
      .get("/api/app-data")
      .set("Cookie", adminCookie);

    expect(response.status).toBe(200);
    expect(response.headers.deprecation).toBe("true");
    expect(response.headers.sunset).toBeDefined();
    expect(response.headers.link).toContain('</api/app-data/bootstrap>; rel="successor-version"');
    expect(response.body).toHaveProperty("auditLogs");
  });
});
