// In-Memory WebRTC Signaling Broker for Proctoring Live Feeds & Dual-Camera Streaming
const sessions = new Map(); // attemptId -> { signals: [], updatedAt }

// Cleanup sessions older than 4 hours
setInterval(() => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  for (const [id, session] of sessions.entries()) {
    if (session.updatedAt < cutoff) {
      sessions.delete(id);
    }
  }
}, 30 * 60 * 1000).unref();

export function postSignal(attemptId, { senderId, targetRole, type, data, streamRole = "primary" }) {
  if (!sessions.has(attemptId)) {
    sessions.set(attemptId, { signals: [], updatedAt: Date.now() });
  }

  const session = sessions.get(attemptId);
  session.updatedAt = Date.now();

  const signal = {
    id: `SIG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId,
    targetRole, // "candidate", "proctor", "companion"
    streamRole, // "primary" (webcam) or "companion" (mobile phone)
    type, // "offer", "answer", "ice-candidate", "ping"
    data, // sdp or ice candidate payload
    timestamp: Date.now(),
  };

  session.signals.push(signal);

  // Keep latest 200 signals per attempt
  if (session.signals.length > 200) {
    session.signals.shift();
  }

  return signal;
}

export function getSignals(attemptId, { targetRole = null, sinceTimestamp = 0 }) {
  const session = sessions.get(attemptId);
  if (!session) return [];

  return session.signals.filter((s) => {
    const timeMatch = s.timestamp > sinceTimestamp;
    const targetMatch = !targetRole || s.targetRole === targetRole || s.targetRole === "all";
    return timeMatch && targetMatch;
  });
}

export function clearSignals(attemptId) {
  sessions.delete(attemptId);
}

