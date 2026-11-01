import bcrypt from "bcryptjs";
import request from "supertest";
import { signStepUpToken, signToken } from "../../backend/src/domain.js";

export const TEST_PASSWORD = "Test-only-password-42!";
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function createUserFactory({ roles, idPrefix = "TEST", password = TEST_PASSWORD } = {}) {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new TypeError("createUserFactory requires the canonical roles array");
  }
  const allowedRoles = new Set(roles);
  let sequence = 0;

  const createUser = (role, overrides = {}) => {
    if (!allowedRoles.has(role)) throw new TypeError(`Unknown role: ${role}`);
    sequence += 1;
    const roleSlug = slug(role);
    const id = `${idPrefix}-${roleSlug.toUpperCase()}-${sequence}`;
    return {
      id,
      name: `Test ${role} ${sequence}`,
      email: `${id.toLowerCase()}@example.test`,
      passwordHash: bcrypt.hashSync(password, 4),
      role,
      department: "Test",
      team: "Test",
      status: "Active",
      ...overrides,
    };
  };

  createUser.forEveryRole = (overridesByRole = {}) => Object.fromEntries(
    roles.map((role) => [role, createUser(role, overridesByRole[role])]),
  );
  createUser.resetSequence = () => { sequence = 0; };
  return createUser;
}

function cookieValue(setCookieHeader, name) {
  const cookie = setCookieHeader?.find((value) => value.startsWith(`${name}=`));
  if (!cookie) throw new Error(`Expected ${name} cookie was not issued`);
  return cookie.split(";")[0];
}

export async function createAuthenticatedAgent(app, user, { stepUp = false } = {}) {
  const csrfResponse = await request(app).get("/api/csrf-token").expect(200);
  const csrfToken = csrfResponse.body.csrfToken;
  const cookies = [
    cookieValue(csrfResponse.headers["set-cookie"], "csrfToken"),
    `token=${signToken(user)}`,
  ];
  if (stepUp) cookies.push(`stepUpToken=${signStepUpToken(user)}`);

  const invoke = (method, route) => {
    const pending = request(app)[method](route).set("Cookie", cookies);
    if (MUTATING_METHODS.has(method)) pending.set("x-csrf-token", csrfToken);
    return pending;
  };

  return Object.freeze({
    user,
    csrfToken,
    cookies: [...cookies],
    get: (route) => invoke("get", route),
    post: (route) => invoke("post", route),
    put: (route) => invoke("put", route),
    patch: (route) => invoke("patch", route),
    delete: (route) => invoke("delete", route),
  });
}

function clone(value) {
  return structuredClone(value);
}

function isPlainMutableObject(value) {
  if (!value || Object.getPrototypeOf(value) !== Object.prototype) return false;
  return !Object.values(value).some((entry) => typeof entry === "function");
}

function mutableEntries(stateModule) {
  return Object.entries(stateModule).filter(([, value]) => (
    Array.isArray(value)
    || value instanceof Map
    || value instanceof Set
    || isPlainMutableObject(value)
  ));
}

function replaceMutable(target, source) {
  if (Array.isArray(target)) {
    target.splice(0, target.length, ...clone(source));
    return;
  }
  if (target instanceof Map) {
    target.clear();
    for (const [key, value] of source) target.set(clone(key), clone(value));
    return;
  }
  if (target instanceof Set) {
    target.clear();
    for (const value of source) target.add(clone(value));
    return;
  }
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, clone(source));
}

export function createStateSandbox(stateModule) {
  const entries = mutableEntries(stateModule);
  const baseline = new Map(entries.map(([name, value]) => [name, clone(value)]));

  const reset = () => {
    for (const [name, target] of entries) replaceMutable(target, baseline.get(name));
  };

  const seed = (fixtures = {}) => {
    reset();
    for (const [name, value] of Object.entries(fixtures)) {
      const target = stateModule[name];
      if (!baseline.has(name)) throw new TypeError(`${name} is not resettable state`);
      replaceMutable(target, value);
    }
  };

  return Object.freeze({ reset, restore: reset, seed, names: [...baseline.keys()] });
}
