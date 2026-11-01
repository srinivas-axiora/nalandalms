import { afterEach, describe, expect, it } from "vitest";
import { app } from "../../backend/server.js";
import * as core from "../../backend/src/core.js";
import {
  createAuthenticatedAgent,
  createStateSandbox,
  createUserFactory,
} from "../helpers/security-fixtures.js";

const state = createStateSandbox(core);
const createUser = createUserFactory({ roles: core.roles, idPrefix: "PHASE0" });

afterEach(() => {
  state.reset();
  createUser.resetSequence();
});

describe("shared security test helpers", () => {
  it("creates deterministic valid users for every canonical role", () => {
    const usersByRole = createUser.forEveryRole();
    expect(Object.keys(usersByRole)).toEqual(core.roles);
    for (const role of core.roles) {
      expect(usersByRole[role].role).toBe(role);
      expect(usersByRole[role].passwordHash).toMatch(/^\$2[aby]\$/);
    }
  });

  it("creates an authenticated client that handles cookies and CSRF", async () => {
    const user = createUser("Learner");
    core.users.push(user);
    core.sessionVersions[user.id] = 0;
    const agent = await createAuthenticatedAgent(app, user);

    const identity = await agent.get("/api/auth/me").expect(200);
    expect(identity.body.user.id).toBe(user.id);

    await agent
      .patch("/api/users/me/preferences")
      .send({ theme: "dark" })
      .expect(200);
  });

  it("resets mutable application state without replacing exported references", () => {
    const usersReference = core.users;
    const originalCount = core.users.length;
    core.users.push(createUser("Employee"));
    core.sessionVersions["PHASE0-MUTATION"] = 99;

    state.reset();

    expect(core.users).toBe(usersReference);
    expect(core.users).toHaveLength(originalCount);
    expect(core.sessionVersions["PHASE0-MUTATION"]).toBeUndefined();
  });
});
