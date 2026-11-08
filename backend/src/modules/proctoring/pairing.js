// Mobile Companion Camera Pairing Engine (Dual-Angle Proctoring)
import crypto from "node:crypto";
import { attempts, now, sessionVersions, users } from "../../core.js";
import { COMPANION_TOKEN_TTL_SECONDS } from "../../config.js";
import { identityRepository } from "../../repositories/identity.repository.pg.js";
import {
  claimCompanionPairing,
  deleteCompanionPairing,
  getCompanionPairing,
  storeCompanionPairing,
} from "../../cache/redis.js";
import { attemptsRepository } from "../../repositories/attempts.repository.pg.js";
import { upsertAttemptProjection } from "../../attempt-projection.js";
import { relationalAttemptsEnabled, relationalIdentityEnabled } from "../../runtime-modes.js";

const USE_RELATIONAL_IDENTITY = relationalIdentityEnabled();
const USE_RELATIONAL_ATTEMPTS = relationalAttemptsEnabled();
const tokenDigest = (token) => crypto.createHash("sha256").update(token).digest("hex");

const getCandidate = (id) => USE_RELATIONAL_IDENTITY
  ? identityRepository.findUserById(id)
  : Promise.resolve(users.find((user) => user.id === id));

export async function createPairingToken(attemptId, candidateUserId) {
  const token = `NLD-PAIR-${crypto.randomBytes(16).toString("hex").toUpperCase()}`;
  const expiresAt = Date.now() + COMPANION_TOKEN_TTL_SECONDS * 1000;
  const candidate = await getCandidate(candidateUserId);
  if (!candidate || candidate.status !== "Active") {
    const err = new Error("Candidate account is unavailable");
    err.status = 401;
    throw err;
  }

  await storeCompanionPairing(tokenDigest(token), {
    attemptId,
    candidateUserId,
    sessionVersion: Number(candidate.sessionVersion ?? candidate.sv ?? sessionVersions[candidateUserId] ?? 0),
    expiresAt,
    paired: false,
  }, COMPANION_TOKEN_TTL_SECONDS);

  const pairUrl = `/mobile-proctor?token=${token}`;

  return {
    pairingToken: token,
    expiresAt: new Date(expiresAt).toISOString(),
    pairUrl,
  };
}

export async function verifyAndPairCompanion(pairingToken, deviceMetadata = {}) {
  const digest = tokenDigest(pairingToken);
  const data = await getCompanionPairing(digest);
  if (!data) {
    const err = new Error("Invalid or expired mobile pairing token");
    err.status = 404;
    throw err;
  }

  if (data.expiresAt < Date.now()) {
    await deleteCompanionPairing(digest);
    const err = new Error("Mobile pairing token has expired");
    err.status = 410;
    throw err;
  }

  if (data.paired) {
    const err = new Error("Mobile pairing token has already been used");
    err.status = 409;
    throw err;
  }

  const attempt = USE_RELATIONAL_ATTEMPTS
    ? await attemptsRepository.findById(data.attemptId)
    : attempts.find((a) => a.id === data.attemptId);
  if (!attempt) {
    const err = new Error("Associated exam attempt not found");
    err.status = 404;
    throw err;
  }

  const candidate = await getCandidate(data.candidateUserId);
  const currentSessionVersion = Number(candidate?.sessionVersion ?? candidate?.sv ?? sessionVersions[data.candidateUserId] ?? 0);
  if (!candidate || candidate.status !== "Active" || currentSessionVersion !== data.sessionVersion) {
    await deleteCompanionPairing(digest);
    const err = new Error("Mobile pairing token has been revoked");
    err.status = 401;
    throw err;
  }

  const claim = await claimCompanionPairing(digest);
  if (claim.status === "paired") {
    const err = new Error("Mobile pairing token has already been used");
    err.status = 409;
    throw err;
  }
  if (claim.status !== "claimed") {
    const err = new Error("Invalid or expired mobile pairing token");
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

  if (USE_RELATIONAL_ATTEMPTS) {
    try {
      const saved = await attemptsRepository.save(attempt, {
        expectedVersion: attempt.version,
        actorId: attempt.userId,
        action: "PAIR_COMPANION_DEVICE",
        metadata: { deviceName: attempt.companion.deviceName },
      });
      upsertAttemptProjection(saved);
      attempt.version = saved.version;
    } catch (error) {
      await deleteCompanionPairing(digest);
      throw error;
    }
  }

  return {
    attemptId: attempt.id,
    courseId: attempt.courseId,
    candidateUserId: data.candidateUserId,
    companionToken: pairingToken,
    companion: attempt.companion,
  };
}

export async function authorizeCompanionToken(token, attemptId) {
  const digest = tokenDigest(token);
  const data = await getCompanionPairing(digest);
  if (!data || !data.paired || data.attemptId !== attemptId || data.expiresAt < Date.now()) return null;
  const candidate = await getCandidate(data.candidateUserId);
  const currentSessionVersion = Number(candidate?.sessionVersion ?? candidate?.sv ?? sessionVersions[data.candidateUserId] ?? 0);
  if (!candidate || candidate.status !== "Active" || currentSessionVersion !== data.sessionVersion) {
    await deleteCompanionPairing(digest);
    return null;
  }
  const candidateAttempt = USE_RELATIONAL_ATTEMPTS
    ? await attemptsRepository.findById(attemptId)
    : attempts.find((item) => item.id === attemptId);
  const attempt = candidateAttempt?.userId === data.candidateUserId ? candidateAttempt : null;
  if (attempt && USE_RELATIONAL_ATTEMPTS) upsertAttemptProjection(attempt);
  return attempt ? { attempt, candidate, tokenData: data } : null;
}

export async function updateCompanionHeartbeat(token, attemptId, metadata = {}) {
  const authorized = await authorizeCompanionToken(token, attemptId);
  const attempt = authorized?.attempt;
  if (!attempt || !attempt.companion) return false;

  if (USE_RELATIONAL_ATTEMPTS) {
    const saved = await attemptsRepository.saveCompanionHeartbeat({
      attemptId: attempt.id,
      at: now(),
      batteryLevel: metadata.batteryLevel,
      actorId: attempt.userId,
    });
    upsertAttemptProjection(saved);
  } else {
    attempt.companion.lastPingAt = now();
    if (metadata.batteryLevel !== undefined) {
      attempt.companion.batteryLevel = metadata.batteryLevel;
    }
  }
  return true;
}

