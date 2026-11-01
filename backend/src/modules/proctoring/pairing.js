// Mobile Companion Camera Pairing Engine (Dual-Angle Proctoring)
import crypto from "node:crypto";
import { attempts, now, sessionVersions, users } from "../../core.js";
import { COMPANION_TOKEN_TTL_SECONDS } from "../../config.js";

const activePairingTokens = new Map(); // token -> { attemptId, candidateUserId, expiresAt }

// Cleanup expired pairing tokens
setInterval(() => {
  const cutoff = Date.now();
  for (const [token, data] of activePairingTokens.entries()) {
    if (data.expiresAt < cutoff) {
      activePairingTokens.delete(token);
    }
  }
}, 5 * 60 * 1000).unref();

export function createPairingToken(attemptId, candidateUserId) {
  const token = `NLD-PAIR-${crypto.randomBytes(16).toString("hex").toUpperCase()}`;
  const expiresAt = Date.now() + COMPANION_TOKEN_TTL_SECONDS * 1000;

  activePairingTokens.set(token, {
    attemptId,
    candidateUserId,
    sessionVersion: sessionVersions[candidateUserId] || 0,
    expiresAt,
    paired: false,
  });

  const pairUrl = `/mobile-proctor?token=${token}`;

  return {
    pairingToken: token,
    expiresAt: new Date(expiresAt).toISOString(),
    pairUrl,
  };
}

export function verifyAndPairCompanion(pairingToken, deviceMetadata = {}) {
  const data = activePairingTokens.get(pairingToken);
  if (!data) {
    const err = new Error("Invalid or expired mobile pairing token");
    err.status = 404;
    throw err;
  }

  if (data.expiresAt < Date.now()) {
    activePairingTokens.delete(pairingToken);
    const err = new Error("Mobile pairing token has expired");
    err.status = 410;
    throw err;
  }

  if (data.paired) {
    const err = new Error("Mobile pairing token has already been used");
    err.status = 409;
    throw err;
  }

  const attempt = attempts.find((a) => a.id === data.attemptId);
  if (!attempt) {
    const err = new Error("Associated exam attempt not found");
    err.status = 404;
    throw err;
  }

  const candidate = users.find((user) => user.id === data.candidateUserId);
  if (!candidate || candidate.status !== "Active" || (sessionVersions[candidate.id] || 0) !== data.sessionVersion) {
    activePairingTokens.delete(pairingToken);
    const err = new Error("Mobile pairing token has been revoked");
    err.status = 401;
    throw err;
  }

  data.paired = true;

  attempt.companion = {
    paired: true,
    pairedAt: now(),
    lastPingAt: now(),
    deviceName: deviceMetadata.deviceName || "Unknown Mobile Device",
    userAgent: deviceMetadata.userAgent || "",
    batteryLevel: deviceMetadata.batteryLevel ?? null,
  };

  return {
    attemptId: attempt.id,
    courseId: attempt.courseId,
    candidateUserId: data.candidateUserId,
    companionToken: pairingToken,
    companion: attempt.companion,
  };
}

export function authorizeCompanionToken(token, attemptId) {
  const data = activePairingTokens.get(token);
  if (!data || !data.paired || data.attemptId !== attemptId || data.expiresAt < Date.now()) return null;
  const candidate = users.find((user) => user.id === data.candidateUserId);
  if (!candidate || candidate.status !== "Active" || (sessionVersions[candidate.id] || 0) !== data.sessionVersion) {
    activePairingTokens.delete(token);
    return null;
  }
  const attempt = attempts.find((item) => item.id === attemptId && item.userId === data.candidateUserId);
  return attempt ? { attempt, candidate, tokenData: data } : null;
}

export function updateCompanionHeartbeat(token, attemptId, metadata = {}) {
  const authorized = authorizeCompanionToken(token, attemptId);
  const attempt = authorized?.attempt;
  if (!attempt || !attempt.companion) return false;

  attempt.companion.lastPingAt = now();
  if (metadata.batteryLevel !== undefined) {
    attempt.companion.batteryLevel = metadata.batteryLevel;
  }
  return true;
}

