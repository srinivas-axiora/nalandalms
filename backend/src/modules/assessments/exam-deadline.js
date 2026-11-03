import { ASSESSMENT_TIME_GRACE_SECONDS } from "../../core.js";

function timestamp(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : null;
}

export function assessmentAttemptClock(attempt, assessment, at = Date.now()) {
  const durationSeconds = Math.max(60, (Number(assessment?.durationMinutes) || 15) * 60);
  const startedAtMs = timestamp(attempt?.startedAt);
  const explicitDeadlineMs = timestamp(attempt?.expiresAt);
  const fallbackDeadlineMs = startedAtMs === null
    ? null
    : startedAtMs + (durationSeconds + ASSESSMENT_TIME_GRACE_SECONDS) * 1000;
  const deadlineMs = explicitDeadlineMs ?? fallbackDeadlineMs;
  const elapsedSeconds = startedAtMs === null
    ? 0
    : Math.max(0, Math.floor((at - startedAtMs) / 1000));

  return {
    durationSeconds,
    elapsedSeconds,
    timeRemainingSeconds: Math.max(0, durationSeconds - elapsedSeconds),
    deadline: deadlineMs === null ? null : new Date(deadlineMs).toISOString(),
    // An invalid/missing deadline fails closed instead of creating an unlimited exam.
    isExpired: deadlineMs === null || at >= deadlineMs,
  };
}

export function candidateLinkIsExpired(link, at = Date.now()) {
  if (!link?.expiresAt) return false;
  const deadlineMs = timestamp(link.expiresAt);
  return deadlineMs === null || at >= deadlineMs;
}

export function candidateSubmissionClock(submission, link, at = Date.now()) {
  const durationSeconds = Math.max(60, (Number(link?.durationMinutes) || 30) * 60);
  const startedAtMs = timestamp(submission?.startedAt);
  const explicitDeadlineMs = timestamp(submission?.expiresAt);
  const fallbackDeadlineMs = startedAtMs === null
    ? null
    : startedAtMs + (durationSeconds + ASSESSMENT_TIME_GRACE_SECONDS) * 1000;
  const deadlineMs = explicitDeadlineMs ?? fallbackDeadlineMs;

  return {
    durationSeconds,
    deadline: deadlineMs === null ? null : new Date(deadlineMs).toISOString(),
    isExpired: deadlineMs === null || at >= deadlineMs,
  };
}

export function candidateSubmissionExpiresAt(durationMinutes, startedAt = Date.now()) {
  const durationSeconds = Math.max(60, (Number(durationMinutes) || 30) * 60);
  return new Date(startedAt + (durationSeconds + ASSESSMENT_TIME_GRACE_SECONDS) * 1000).toISOString();
}
