// Module: Authentication (login, register, logout, step-up, password reset, session identity).
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  COOKIE_SECURE,
  COOKIE_SAMESITE,
  CSRF_COOKIE,
  STEP_UP_COOKIE,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
  IS_PRODUCTION,
} from "../../config.js";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_MS, users, sessionVersions, now } from "../../core.js";
import { signToken, signStepUpToken, audit, publicUser, securityEvent } from "../../domain.js";
import { authenticate, rateLimit } from "../../middleware.js";
import { identityRepository } from "../../repositories/identity.repository.pg.js";
import { clearLoginFailures, getLoginSecurity, recordLoginFailure } from "../../cache/redis.js";
import { setProjectedSessionVersion, upsertIdentityProjection } from "../../identity-projection.js";
import { relationalIdentityEnabled } from "../../runtime-modes.js";
import { enqueuePasswordResetRequest } from "../../notifications/password-reset-delivery.js";

const USE_RELATIONAL_IDENTITY = relationalIdentityEnabled();
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("nalanda-login-timing-sentinel", 10);

export function registerAuth(app) {
  const throttleIdentity = (identifier) => crypto
    .createHash("sha256")
    .update(String(identifier || "").trim().toLowerCase())
    .digest("hex");
  const registrationRateLimit = rateLimit({ windowMs: 60_000, max: 10, name: "auth-register" });
  const loginIpRateLimit = rateLimit({ windowMs: 60_000, max: 10, name: "auth-login-ip" });
  const passwordResetIpRateLimit = rateLimit({ windowMs: 15 * 60_000, max: 5, name: "auth-reset-ip" });
  const passwordResetPairRateLimit = rateLimit({
    windowMs: 15 * 60_000,
    max: 3,
    name: "auth-reset-pair",
    keyGenerator: (req) => `${req.ip || "anon"}|${throttleIdentity(req.body?.email || "missing")}`,
  });

  // ── Public Self-Registration ──
  app.post("/api/auth/register", registrationRateLimit, async (req, res) => {
    const schema = z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(8).max(128),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const existingUser = USE_RELATIONAL_IDENTITY
      ? await identityRepository.findUserByIdentifier(normalizedEmail)
      : users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const assignedRole = "Learner";
    const newUser = {
      id: `LRN-${Math.floor(1000 + Math.random() * 9000)}`,
      name: parsed.data.name.trim(),
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(parsed.data.password, 10),
      role: assignedRole,
      department: "General",
      team: "Self-Enrolled",
      designation: assignedRole,
      managerId: null,
      status: "Active",
      sessionVersion: 0,
      joinedAt: now().slice(0, 10),
      createdAt: now(),
      updatedAt: now(),
      preferences: {
        theme: "dark",
        language: "en",
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        courseReminders: true,
        fontSize: "medium",
        reducedMotion: false,
        highContrast: false,
      },
    };

    let createdUser = newUser;
    if (USE_RELATIONAL_IDENTITY) {
      try {
        createdUser = await identityRepository.insertUser(newUser, {
          actorId: newUser.id,
          action: "REGISTER",
        });
      } catch (error) {
        if (error?.code === "23505") {
          return res.status(409).json({ error: "An account with this email already exists" });
        }
        throw error;
      }
      upsertIdentityProjection(createdUser);
    } else {
      users.push(newUser);
      sessionVersions[newUser.id] = 0;
      audit(newUser.id, "REGISTER", "USER", newUser.id, { role: newUser.role });
    }

    res.cookie("token", signToken(createdUser), {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      maxAge: 30 * 60 * 1000,
    });

    return res.status(201).json({ user: publicUser(createdUser) });
  });

  // ── Login ──
  app.post("/api/auth/login", loginIpRateLimit, async (req, res, next) => {
    try {
      const ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
      const schema = z.object({ email: z.string().min(2), password: z.string().min(8) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

      const identifier = parsed.data.email.trim();
      const normalizedIdentifier = identifier.toLowerCase();
      const identityKey = throttleIdentity(normalizedIdentifier);
      // Lockouts are scoped to the account/IP pair. An attacker cannot lock a
      // victim out globally by repeatedly submitting that victim's identifier.
      const securityKey = `${identityKey}|${ip}`;
      const candidate = USE_RELATIONAL_IDENTITY
        ? await identityRepository.findUserByIdentifier(normalizedIdentifier)
        : users.find((item) => (
            item.email.toLowerCase() === normalizedIdentifier
            || (item.role === "Super Admin" && normalizedIdentifier === "super admin")
          ));
      const user = candidate?.status === "Active" ? candidate : null;
      // Always perform a bcrypt comparison so unknown/inactive identities have
      // the same expensive credential path as active accounts. A correct
      // password is evaluated before pair throttling, preventing an attacker
      // from turning failed guesses into an account-wide denial of service.
      const passwordMatches = bcrypt.compareSync(
        parsed.data.password,
        user?.passwordHash || DUMMY_PASSWORD_HASH,
      );

      if (user && passwordMatches) {
        await clearLoginFailures(securityKey);
        if (USE_RELATIONAL_IDENTITY) await identityRepository.recordLogin(user.id);
        else audit(user.id, "LOGIN", "USER", user.id);
        res.cookie("token", signToken(user), { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE, maxAge: 30 * 60 * 1000 });
        return res.json({ user: publicUser(user) });
      }

      const security = await getLoginSecurity(securityKey, MAX_LOGIN_ATTEMPTS);
      if (security.lockedUntil && new Date(security.lockedUntil).getTime() > Date.now()) {
        const retryAfter = Math.max(1, Math.ceil((new Date(security.lockedUntil).getTime() - Date.now()) / 1000));
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({ error: "Too many invalid login attempts. Please retry later." });
      }

      const failure = await recordLoginFailure(securityKey, MAX_LOGIN_ATTEMPTS, LOCKOUT_MS);
      if (failure.lockedUntil) {
        const retryAfter = Math.max(1, Math.ceil((new Date(failure.lockedUntil).getTime() - Date.now()) / 1000));
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({ error: "Too many invalid login attempts. Please retry later." });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
      console.error("[auth:login] error:", err);
      next(err);
    }
  });

  // ── Logout ──
  app.post("/api/auth/logout", authenticate, async (req, res) => {
    if (USE_RELATIONAL_IDENTITY) {
      const version = await identityRepository.revokeSessions(req.user.id);
      setProjectedSessionVersion(req.user.id, version);
    } else {
      sessionVersions[req.user.id] = (sessionVersions[req.user.id] || 0) + 1;
      audit(req.user.id, "LOGOUT_AND_REVOKE_SESSION", "USER", req.user.id);
    }
    res.clearCookie("token", { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE });
    res.clearCookie(CSRF_COOKIE, { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE });
    res.clearCookie(STEP_UP_COOKIE, { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE });
    res.json({ ok: true });
  });

  // ── Forgot Password Request ──
  app.post("/api/auth/forgot-password", passwordResetIpRateLimit, passwordResetPairRateLimit, async (req, res) => {
    const schema = z.object({ email: z.string().trim().email().max(320) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    if (IS_PRODUCTION) {
      try {
        // Every syntactically valid request is queued before identity lookup.
        // The worker resolves the account, keeping request timing independent
        // of whether the address exists while making delivery durable.
        await enqueuePasswordResetRequest(normalizedEmail);
      } catch (error) {
        securityEvent(req, "PASSWORD_RESET_QUEUE_FAILED", { errorCode: "QUEUE_UNAVAILABLE" });
        return res.status(503).json({ error: "Password reset is temporarily unavailable. Please retry later." });
      }
      return res.json({
        ok: true,
        message: "If that email is registered, password reset instructions have been sent.",
      });
    }

    const candidate = USE_RELATIONAL_IDENTITY
      ? await identityRepository.findUserByIdentifier(normalizedEmail)
      : users.find((u) => u.email.toLowerCase() === normalizedEmail);
    const user = candidate?.status === "Active" ? candidate : null;

    // Don't leak whether account exists to protect privacy
    if (!user) {
      return res.json({
        ok: true,
        message: "If that email is registered, password reset instructions have been sent.",
      });
    }

    const resetToken = jwt.sign(
      { sub: user.id, email: user.email, purpose: "password-reset", sv: Number(user.sessionVersion ?? sessionVersions[user.id] ?? 0) },
      JWT_SECRET,
      { expiresIn: "15m", issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );

    if (USE_RELATIONAL_IDENTITY) {
      await identityRepository.recordUserAudit({
        actorId: user.id,
        action: "REQUEST_PASSWORD_RESET",
        userId: user.id,
      });
    } else {
      audit(user.id, "REQUEST_PASSWORD_RESET", "USER", user.id);
    }

    return res.json({
      ok: true,
      message: "If that email is registered, password reset instructions have been sent.",
      resetToken,
    });
  });

  // ── Reset Password ──
  app.post("/api/auth/reset-password", async (req, res) => {
    const schema = z.object({
      token: z.string().min(10),
      newPassword: z.string().min(8).max(128),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    let payload;
    try {
      payload = jwt.verify(parsed.data.token, JWT_SECRET, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE });
    } catch {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    if (payload.purpose !== "password-reset") {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const candidate = USE_RELATIONAL_IDENTITY
      ? await identityRepository.findUserById(payload.sub)
      : users.find((u) => u.id === payload.sub);
    const user = candidate?.status === "Active" ? candidate : null;
    if (!user) return res.status(404).json({ error: "User not found" });

    const currentSv = Number(user.sessionVersion ?? sessionVersions[user.id] ?? 0);
    if (payload.sv !== currentSv) {
      return res.status(400).json({ error: "Reset token has expired or already been used" });
    }

    const passwordHash = bcrypt.hashSync(parsed.data.newPassword, 10);
    if (USE_RELATIONAL_IDENTITY) {
      const nextVersion = await identityRepository.resetPassword({
        id: user.id,
        expectedSessionVersion: currentSv,
        passwordHash,
      });
      if (nextVersion === null) {
        return res.status(400).json({ error: "Reset token has expired or already been used" });
      }
      setProjectedSessionVersion(user.id, nextVersion);
    } else {
      user.passwordHash = passwordHash;
      user.updatedAt = now();
      sessionVersions[user.id] = (sessionVersions[user.id] || 0) + 1;
      audit(user.id, "RESET_PASSWORD", "USER", user.id);
    }
    return res.json({ ok: true, message: "Password updated successfully. You can now sign in." });
  });

  // ── Step-up Reauth ──
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

  // ── Current Session ──
  app.get("/api/auth/me", authenticate, (req, res) => {
    res.json({ user: publicUser(req.user), permissions: req.user.role });
  });
}
