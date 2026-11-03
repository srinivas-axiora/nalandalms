import { rateLimitCheckAndIncr } from "./cache/redis.js";
// Foundation layer: HTTP middleware (CSRF, rate limiting, auth/authz, persistence
// gate, security-event logging, error handler). Wired onto `app` by server.js.
import jwt from "jsonwebtoken";
import { JWT_SECRET, CSRF_COOKIE, STEP_UP_COOKIE } from "./config.js";
import { timingSafeEqual } from "./lib.js";
import { users, sessionVersions, saveDb } from "./core.js";
import { securityEvent } from "./domain.js";

// ── CSRF protection (double-submit cookie) ──
export const verifyCsrf = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  // These mutations authenticate with route-scoped, high-entropy tokens rather
  // than ambient browser cookies. No other state-changing path is exempt.
  const candidateTokenMutation = /^\/api\/public\/candidate-assessments\/[^/]+\/(?:start|event|submit)$/.test(req.path);
  const companionPair = req.path === "/api/proctoring/companion/pair";
  const companionMutation = /^\/api\/proctoring\/attempts\/[^/]+\/(?:companion\/ping|chunks)$/.test(req.path)
    && typeof req.headers["x-companion-token"] === "string";
  const verifiedWebhook = req.path === "/api/payments/webhook";
  if (candidateTokenMutation || companionPair || companionMutation || verifiedWebhook) return next();
  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  if (!headerToken || !cookieToken || !timingSafeEqual(headerToken, cookieToken)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
};

// ── In-memory sliding-window rate limiter ──
const rateBuckets = new Map();
const RATE_BUCKET_LIMIT = 50000;
export const rateLimit = ({ windowMs = 60_000, max = 600, scope = "ip", name = "" } = {}) => (req, res, next) => {
  const who = scope === "user" ? (req.user?.id || req.ip || "anon") : (req.ip || "anon");
  const key = `${name}|${scope}|${who}`;
  const cutoff = Date.now() - windowMs;
  const hits = (rateBuckets.get(key) || []).filter((t) => t > cutoff);
  if (hits.length >= max) {
    res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
    return res.status(429).json({ error: "Too many requests. Please slow down and try again shortly." });
  }
  hits.push(Date.now());
  rateBuckets.set(key, hits);
  if (rateBuckets.size > RATE_BUCKET_LIMIT) rateBuckets.clear();
  next();
};
// Stricter per-user budget for cost-bearing AI endpoints; applied after authenticate.
export const aiRateLimit = rateLimit({ windowMs: 60_000, max: 15, scope: "user", name: "ai" });

export const authenticate = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((item) => item.id === payload.sub);
    if (!user) return res.status(401).json({ error: "Unknown user" });
    if (user.status !== "Active") return res.status(401).json({ error: "Account deactivated — session revoked" });
    const currentSv = sessionVersions[user.id] || 0;
    if (payload.sv !== currentSv) {
      return res.status(401).json({ error: "Session revoked — please sign in again" });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (...allowed) => (req, res, next) => {
  // Super Admin has access to everything Admin can do
  const effective = req.user.role === "Super Admin" && allowed.includes("Admin") ? true : allowed.includes(req.user.role);
  if (!effective) return res.status(403).json({ error: "Forbidden" });
  return next();
};

export const requireStepUp = (req, res, next) => {
  const token = req.cookies?.[STEP_UP_COOKIE];
  if (!token) {
    securityEvent(req, "STEP_UP_REQUIRED");
    return res.status(412).json({ error: "Recent re-authentication required", code: "STEP_UP_REQUIRED" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const currentSv = sessionVersions[req.user.id] || 0;
    if (payload.sub !== req.user.id || payload.purpose !== "step-up" || payload.sv !== currentSv) {
      securityEvent(req, "STEP_UP_INVALID");
      return res.status(412).json({ error: "Recent re-authentication required", code: "STEP_UP_REQUIRED" });
    }
    return next();
  } catch {
    securityEvent(req, "STEP_UP_EXPIRED");
    return res.status(412).json({ error: "Recent re-authentication required", code: "STEP_UP_REQUIRED" });
  }
};

// Blocking persistence gate: on a successful mutating response, flush state to
// durable storage before the response is sent; fail closed (503) if save fails.
export const persistResponseMiddleware = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode >= 200 && res.statusCode < 400 && !res.headersSent) {
      try {
        await saveDb();
      } catch (err) {
        console.error("[persist] blocking response after save failure:", err?.message || err);
        res.status(503);
        return originalJson({ error: "Data could not be saved. Please retry shortly." });
      }
    }
    return originalJson(body);
  };
  next();
};

// Records authentication/authorization/rate-limit outcomes as security events.
export const securityLoggingMiddleware = (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode === 401) securityEvent(req, "AUTHENTICATION_FAILED", { statusCode: res.statusCode });
    if (res.statusCode === 403) securityEvent(req, "AUTHORIZATION_DENIED", { statusCode: res.statusCode });
    if (res.statusCode === 429) securityEvent(req, "RATE_LIMITED", { statusCode: res.statusCode });
  });
  next();
};

// Centralized error handler (registered last).
export const errorHandler = (err, _req, res, _next) => {
  if (err?.message === "Origin not allowed by CORS") {
    if (!res.headersSent) res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    if (!res.headersSent) res.status(413).json({ error: "Uploaded file is too large (max 15MB)." });
    return;
  }
  if (err?.type === "entity.too.large") {
    if (!res.headersSent) res.status(413).json({ error: "Uploaded file is too large (max 15MB)." });
    return;
  }
  if (err?.message === "Unsupported file type") {
    if (!res.headersSent) res.status(415).json({ error: "Unsupported file type." });
    return;
  }
  console.error("[error]", err.stack || err);
  if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
};
