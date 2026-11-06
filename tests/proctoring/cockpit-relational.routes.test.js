import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerCockpit } from "../../backend/src/modules/proctoring/cockpit.routes.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("relational proctor cockpit route", () => {
  let app;
  let cockpitAuthority;

  beforeEach(() => {
    cockpitAuthority = { listActiveForActor: vi.fn().mockResolvedValue([{
      attempt: {
        id: "ATT-REL-COCKPIT",
        userId: "LRN-REL",
        courseId: "CRS-REL",
        assessmentId: "ASM-REL",
        status: "InProgress",
        startedAt: new Date(Date.now() - 60_000).toISOString(),
        expiresAt: new Date(Date.now() + 59 * 60_000).toISOString(),
        durationMinutesSnapshot: 60,
        trustScore: 42,
        flags: [{ id: "FLAG-REL", severity: "high" }],
        warnings: [],
        videoChunks: [],
        answers: { "Q-SECRET": { answer: 1 } },
        questionMap: { "Q-SECRET": { correctIndex: 1 } },
      },
      candidate: { name: "Relational Candidate", email: "relational@example.test" },
      assessment: { title: "Relational Assessment" },
      course: { title: "Relational Course" },
    }]) };
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerCockpit(app, { usePgCourses: true, proctorCockpitRepository: cockpitAuthority });
  });

  it("renders only the authority-projected active sessions", async () => {
    const response = await request(app)
      .get("/api/proctoring/cockpit/active")
      .set("Cookie", authCookieFor(testUsers.manager));

    expect(response.status).toBe(200);
    expect(cockpitAuthority.listActiveForActor).toHaveBeenCalledWith(
      expect.objectContaining({ id: testUsers.manager.id })
    );
    expect(response.body.data).toEqual([
      expect.objectContaining({
        attemptId: "ATT-REL-COCKPIT",
        candidateName: "Relational Candidate",
        courseTitle: "Relational Course",
        assessmentTitle: "Relational Assessment",
        riskLevel: "high",
      }),
    ]);
    expect(response.body.data[0]).not.toHaveProperty("answers");
    expect(response.body.data[0]).not.toHaveProperty("questionMap");
  });

  it("rejects non-proctor roles before querying cockpit authority", async () => {
    const response = await request(app)
      .get("/api/proctoring/cockpit/active")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(403);
    expect(cockpitAuthority.listActiveForActor).not.toHaveBeenCalled();
  });
});
