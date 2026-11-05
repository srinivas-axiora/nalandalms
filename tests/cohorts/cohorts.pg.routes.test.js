import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerCohortsPgRoutes } from "../../backend/src/modules/cohorts/cohorts.pg.routes.js";
import {
  CohortAuthorityError,
  cohortAuthorityRepository,
  hashCohortInviteCode,
} from "../../backend/src/repositories/cohort-authority.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("PostgreSQL cohort routes", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerCohortsPgRoutes(app);
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns an invite code once while persisting only its digest", async () => {
    vi.spyOn(cohortAuthorityRepository, "createCohort").mockResolvedValue({
      id: "COH-1", name: "Secure cohort", courseId: "CRS-1", instructorId: testUsers.manager.id,
    });
    const response = await request(app).post("/api/cohorts")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ name: "Secure cohort", courseId: "CRS-1", capacity: 10 });

    expect(response.status).toBe(201);
    expect(response.body.data.inviteCode).toMatch(/^NLD-[A-HJ-NP-Z2-9]{12}$/);
    const args = cohortAuthorityRepository.createCohort.mock.calls[0][0];
    expect(args.inviteCodeHash).toBe(hashCohortInviteCode(response.body.data.inviteCode));
    expect(JSON.stringify(args)).not.toContain(response.body.data.inviteCode);
  });

  it("rejects malformed invite codes before repository access", async () => {
    const join = vi.spyOn(cohortAuthorityRepository, "joinCohort");
    const response = await request(app).post("/api/cohorts/join")
      .set("Cookie", authCookieFor(testUsers.employee))
      .send({ inviteCode: "guess-me" });
    expect(response.status).toBe(400);
    expect(join).not.toHaveBeenCalled();
  });

  it("maps serialized capacity failures to a stable response", async () => {
    vi.spyOn(cohortAuthorityRepository, "joinCohort").mockRejectedValue(
      new CohortAuthorityError("COHORT_FULL", "This cohort has reached its maximum capacity"),
    );
    const response = await request(app).post("/api/cohorts/join")
      .set("Cookie", authCookieFor(testUsers.employee))
      .send({ inviteCode: "NLD-ABC234DEF567" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("COHORT_FULL");
  });

  it("does not expose invite material in list responses", async () => {
    vi.spyOn(cohortAuthorityRepository, "listCohorts").mockResolvedValue([
      { id: "COH-1", name: "Secure cohort", courseId: "CRS-1", memberCount: 2 },
    ]);
    const response = await request(app).get("/api/cohorts")
      .set("Cookie", authCookieFor(testUsers.manager));
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toContain("inviteCode");
    expect(JSON.stringify(response.body)).not.toContain("invite_code_hash");
  });
});
