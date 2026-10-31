// Mobile Companion Camera Pairing Engine (Dual-Angle Proctoring)
import crypto from "node:crypto";
import { attempts, now } from "../../core.js";

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
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  activePairingTokens.set(token, {
    attemptId,
    candidateUserId,
    expiresAt,
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

  const attempt = attempts.find((a) => a.id === data.attemptId);
  if (!attempt) {
    const err = new Error("Associated exam attempt not found");
    err.status = 404;
    throw err;
  }

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
    companion: attempt.companion,
  };
}

export function updateCompanionHeartbeat(attemptId, metadata = {}) {
  const attempt = attempts.find((a) => a.id === attemptId);
  if (!attempt || !attempt.companion) return false;

  attempt.companion.lastPingAt = now();
  if (metadata.batteryLevel !== undefined) {
    attempt.companion.batteryLevel = metadata.batteryLevel;
  }
  return true;
}

