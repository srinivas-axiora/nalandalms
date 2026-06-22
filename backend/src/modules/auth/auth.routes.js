// Module: Authentication (login, logout, step-up reauth, session identity).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import bcrypt from "bcryptjs";

export function registerAuth(app, ctx) {
  const {
    authenticate, rateLimitCheck, rateLimitRecord, loginSecurity, MAX_LOGIN_ATTEMPTS, LOCKOUT_MS,
    users, signToken, signStepUpToken, audit, publicUser, securityEvent, now,
    COOKIE_SECURE, COOKIE_SAMESITE, CSRF_COOKIE, STEP_UP_COOKIE,
  } = ctx;

  app.post("/api/auth/login", (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    if (rateLimitCheck(ip, "/api/auth/login")) {
      return res.status(429).json({ error: "Too many login attempts. Please try again later." });
    }
    rateLimitRecord(ip, "/api/auth/login");

    const schema = z.object({ email: z.string().min(2), password: z.string().min(8) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const identifier = parsed.data.email.trim();
    const normalizedIdentifier = identifier.toLowerCase();
    const security = loginSecurity[normalizedIdentifier] || { failedAttempts: 0, lockedUntil: null, lastFailedAt: null };

    if (security.lockedUntil && new Date(security.lockedUntil).getTime() > Date.now()) {
      return res.status(403).json({ error: "Account locked due to too many failed attempts", lockedUntil: security.lockedUntil });
    }

    const user = users.find((item) => (
      item.email.toLowerCase() === normalizedIdentifier
      || (item.role === "Super Admin" && normalizedIdentifier === "super admin")
    ) && item.status === "Active");
    if (!user || !bcrypt.compareSync(parsed.data.password, user.passwordHash)) {
      security.failedAttempts += 1;
      security.lastFailedAt = now();
      if (security.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        security.lockedUntil = new Date(Date.now() + LOCKOUT_MS).toISOString();
      }
      loginSecurity[normalizedIdentifier] = security;
      return res.status(401).json({ error: "Invalid credentials", failedAttempts: security.failedAttempts, lockedUntil: security.lockedUntil });
    }

    loginSecurity[normalizedIdentifier] = { failedAttempts: 0, lockedUntil: null, lastFailedAt: null };
    audit(user.id, "LOGIN", "USER", user.id);
    res.cookie("token", signToken(user), { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE, maxAge: 30 * 60 * 1000 });
    return res.json({ user: publicUser(user) });
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE });
    res.clearCookie(CSRF_COOKIE, { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE });
    res.clearCookie(STEP_UP_COOKIE, { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE });
    res.json({ ok: true });
  });

  app.post("/api/auth/reauth", authenticate, (req, res) => {
    const schema = z.object({ password: z.string().min(8) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (!bcrypt.compareSync(parsed.data.password, req.user.passwordHash)) {
      securityEvent(req, "STEP_UP_FAILED");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    securityEvent(req, "STEP_UP_GRANTED");
    res.cookie(STEP_UP_COOKIE, signStepUpToken(req.user), {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      maxAge: 10 * 60 * 1000,
    });
    res.json({ ok: true, expiresInSeconds: 600 });
  });

  app.get("/api/auth/me", authenticate, (req, res) => {
    res.json({ user: publicUser(req.user), permissions: req.user.role });
  });
}
