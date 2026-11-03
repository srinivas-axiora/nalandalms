// Redis-backed WebRTC signaling broker. Production fails closed when Redis is
// unavailable; development uses the bounded fallback in cache/redis.js.
import crypto from "node:crypto";
import {
  appendProctorSignal,
  clearProctorSignals,
  listProctorSignals,
} from "../../cache/redis.js";

export async function postSignal(attemptId, { senderId, targetRole, type, data, streamRole = "primary" }) {
  const signal = {
    id: `SIG-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    senderId,
    targetRole, // "candidate", "proctor", "companion"
    streamRole, // "primary" (webcam) or "companion" (mobile phone)
    type, // "offer", "answer", "ice-candidate", "ping"
    data, // sdp or ice candidate payload
    timestamp: Date.now(),
  };

  return appendProctorSignal(attemptId, signal);
}

export async function getSignals(attemptId, { targetRole = null, sinceTimestamp = 0 }) {
  const signals = await listProctorSignals(attemptId);
  return signals.filter((s) => {
    const timeMatch = s.timestamp > sinceTimestamp;
    const targetMatch = !targetRole || s.targetRole === targetRole || s.targetRole === "all";
    return timeMatch && targetMatch;
  });
}

export async function clearSignals(attemptId) {
  await clearProctorSignals(attemptId);
}

