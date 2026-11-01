import { describe, expect, it } from "vitest";
import { app } from "../../backend/server.js";
import {
  loadAuthorizationMatrix,
  registeredExpressRoutes,
} from "../../scripts/authorization-matrix.mjs";

const inventory = loadAuthorizationMatrix();
const runtimeRoutes = registeredExpressRoutes(app);
const policiesByKey = new Map(inventory.map((policy) => [policy.key, policy]));
const runtimeByKey = new Map(runtimeRoutes.map((route) => [route.key, route]));

describe("living authorization matrix", () => {
  it("declares a complete, unique policy for every registered Express route", () => {
    const duplicatePolicies = inventory
      .map((policy) => policy.key)
      .filter((key, index, keys) => keys.indexOf(key) !== index);
    expect(duplicatePolicies).toEqual([]);

    const missingPolicies = [...runtimeByKey.keys()].filter((key) => !policiesByKey.has(key));
    expect(missingPolicies).toEqual([]);
  });

  it("provides every field required for authorization review", () => {
    for (const policy of inventory) {
      expect(policy.method, policy.key).toMatch(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/);
      expect(policy.path, policy.key).toBeTruthy();
      expect(policy.authentication, policy.key).toMatch(/^(none|session|share-token|attempt-token)$/);
      expect(Array.isArray(policy.requiredRoles), policy.key).toBe(true);
      expect(policy.csrf, policy.key).toMatch(/^(required|exempt|not-applicable)$/);
      expect(typeof policy.stepUp, policy.key).toBe("boolean");
      expect(policy.rateLimit, policy.key).toBeTruthy();
      expect(policy.resourceOwnership, policy.key).toBeTruthy();
    }
  });

  it("matches declared session and step-up controls to runtime middleware", () => {
    const mismatches = [];
    for (const [key, route] of runtimeByKey) {
      const policy = policiesByKey.get(key);
      const hasAuthentication = route.middleware.includes("authenticate");
      const hasStepUp = route.middleware.includes("requireStepUp");
      if ((policy.authentication === "session") !== hasAuthentication) {
        mismatches.push(`${key}: authentication`);
      }
      if (policy.stepUp !== hasStepUp) mismatches.push(`${key}: step-up`);
    }
    expect(mismatches).toEqual([]);
  });

  it("declares CSRF behavior for every API mutation and installs global CSRF first", () => {
    const missingCsrf = inventory.filter((policy) => (
      policy.path.startsWith("/api/")
      && ["POST", "PUT", "PATCH", "DELETE"].includes(policy.method)
      && !["required", "exempt"].includes(policy.csrf)
    ));
    expect(missingCsrf).toEqual([]);

    const csrfLayerIndex = app.router.stack.findIndex((layer) => layer.name === "verifyCsrf");
    const firstRouteIndex = app.router.stack.findIndex((layer) => Boolean(layer.route));
    expect(csrfLayerIndex).toBeGreaterThanOrEqual(0);
    expect(csrfLayerIndex).toBeLessThan(firstRouteIndex);
  });
});
