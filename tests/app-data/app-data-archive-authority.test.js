import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { identityRepository } from "../../backend/src/repositories/identity.repository.pg.js";
import { archiveAuthorityRepository } from "../../backend/src/repositories/archive-authority.repository.pg.js";

describe("app-data relational archive projection", () => {
  const previous = process.env.USE_PG_IDENTITY;
  const user = {
    id: "SAnalanda", name: "Super Admin", email: "superadmin@example.invalid",
    role: "Super Admin", status: "Active", sessionVersion: 0, sv: 0,
  };
  let app;
  let cookie;

  beforeAll(async () => {
    process.env.USE_PG_IDENTITY = "1";
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(user);
    vi.spyOn(identityRepository, "listUsers").mockResolvedValue([user]);
    vi.spyOn(archiveAuthorityRepository, "listArchives").mockResolvedValue([{
      id: "11111111-1111-4111-8111-111111111111",
      entityType: "User",
      entityId: "USR-ARCHIVED",
      entityData: { id: "USR-ARCHIVED", status: "Inactive" },
      relatedData: {},
      deletedAt: "2026-11-06T00:00:00.000Z",
    }]);
    ({ app } = await import("../../backend/server.js?phase33-app-data-archives"));
    const { signToken } = await import("../../backend/src/domain.js");
    cookie = `token=${signToken(user)}`;
  }, 30_000);

  afterAll(() => {
    vi.restoreAllMocks();
    if (previous === undefined) delete process.env.USE_PG_IDENTITY;
    else process.env.USE_PG_IDENTITY = previous;
  });

  it("uses the relational identity archive projection for Super Admin", async () => {
    const response = await request(app).get("/api/app-data").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.archives).toEqual([
      expect.objectContaining({ entityType: "User", entityId: "USR-ARCHIVED" }),
    ]);
    expect(archiveAuthorityRepository.listArchives).toHaveBeenCalledWith({ entityTypes: ["User"] });
  });
});
