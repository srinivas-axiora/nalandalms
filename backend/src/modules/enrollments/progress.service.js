import { courses, chapters, assessments, assignments, now } from "../../core.js";
import { audit } from "../../domain.js";

export const ENROLLMENT_STATUS = {
  ENROLLED: "Enrolled",
  IN_PROGRESS: "InProgress",
  CHAPTERS_COMPLETE: "ChaptersComplete",
  ASSESSMENT_ELIGIBLE: "AssessmentEligible",
  PASSED: "Passed",
  FAILED: "Failed",
  CERTIFIED: "Certified",
};

export const MAX_HEARTBEAT_INCREMENT = 30; // Max allowable seconds per heartbeat

export function getCourseChapters(courseId) {
  return chapters
    .filter((ch) => ch.courseId === courseId)
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
}

export function getNextChapter(courseChapters, completedChapters = []) {
  return courseChapters.find((ch) => !completedChapters.includes(ch.id)) || null;
}

export function canAccessChapter({ courseId, chapterId, userId, userRole = "Learner" }) {
  if (userRole === "Super Admin" || userRole === "Admin") {
    return { allowed: true };
  }

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return { allowed: false, status: 404, error: "Course not found" };
  }

  if (course.ownerId === userId) {
    return { allowed: true };
  }

  const assignment = assignments.find((a) => a.courseId === courseId && a.userId === userId);
  if (!assignment) {
    return { allowed: false, status: 403, error: "You are not enrolled in this course" };
  }

  const courseChapters = getCourseChapters(courseId);
  const targetIndex = courseChapters.findIndex((ch) => ch.id === chapterId);
  if (targetIndex === -1) {
    return { allowed: false, status: 404, error: "Chapter does not belong to this course" };
  }

  // Chapter 1 (index 0) is always unlocked for enrolled learners
  if (targetIndex === 0) {
    return { allowed: true, assignment };
  }

  // Verify all previous chapters are completed
  const completed = assignment.completedChapters || [];
  for (let i = 0; i < targetIndex; i++) {
    const prev = courseChapters[i];
    if (!completed.includes(prev.id)) {
      return {
        allowed: false,
        status: 403,
        error: "Prerequisite chapter incomplete",
        requiredChapterId: prev.id,
        requiredChapterTitle: prev.title,
        assignment,
      };
    }
  }

  return { allowed: true, assignment };
}

export function recordChapterHeartbeat({
  courseId,
  chapterId,
  userId,
  userRole = "Learner",
  currentPositionSeconds = 0,
  incrementSeconds = 15,
}) {
  const access = canAccessChapter({ courseId, chapterId, userId, userRole });
  if (!access.allowed) {
    const err = new Error(access.error);
    err.status = access.status || 403;
    err.details = access;
    throw err;
  }

  let assignment = assignments.find((a) => a.courseId === courseId && a.userId === userId);
  if (!assignment) {
    const err = new Error("Enrollment not found");
    err.status = 404;
    throw err;
  }

  const courseChapters = getCourseChapters(courseId);
  const chapter = courseChapters.find((ch) => ch.id === chapterId);
  if (!chapter) {
    const err = new Error("Chapter not found");
    err.status = 404;
    throw err;
  }

  // ── Anti-Speedrun / Clamping Engine ──
  const rawInc = Number(incrementSeconds) || 15;
  const clampedIncrement = Math.min(Math.max(1, rawInc), MAX_HEARTBEAT_INCREMENT);

  assignment.lastHeartbeatTimestamps = assignment.lastHeartbeatTimestamps || {};
  const lastTs = assignment.lastHeartbeatTimestamps[chapterId];
  let effectiveIncrement = clampedIncrement;

  if (lastTs) {
    const elapsedWallClockSec = (Date.now() - new Date(lastTs).getTime()) / 1000;
    // If client claimed more time than elapsed in real wall-clock (with 5s buffer), clamp to wall clock
    if (elapsedWallClockSec < clampedIncrement - 5) {
      effectiveIncrement = Math.max(1, Math.round(elapsedWallClockSec + 1));
      audit(userId, "HEARTBEAT_SPEEDRUN_CLAMPED", "CHAPTER", chapterId, {
        claimed: rawInc,
        elapsedWallClockSec,
        clampedTo: effectiveIncrement,
      });
    }
  }

  assignment.lastHeartbeatTimestamps[chapterId] = now();
  assignment.lastHeartbeatAt = now();

  // Accumulate time
  assignment.chapterTimeSpentSeconds = assignment.chapterTimeSpentSeconds || {};
  assignment.chapterTimeSpentSeconds[chapterId] =
    (assignment.chapterTimeSpentSeconds[chapterId] || 0) + effectiveIncrement;
  assignment.timeSpentSeconds = (assignment.timeSpentSeconds || 0) + effectiveIncrement;
  assignment.timeSpentMinutes = Math.ceil(assignment.timeSpentSeconds / 60);

  // ── Completion Threshold Check ──
  const chapterDurationSeconds = Math.max(
    10,
    Math.round((chapter.minimumTimeMinutes ?? chapter.durationMinutes ?? 1) * 60)
  );
  const accumulatedChapterSeconds = assignment.chapterTimeSpentSeconds[chapterId];

  assignment.completedChapters = assignment.completedChapters || [];
  const wasAlreadyCompleted = assignment.completedChapters.includes(chapterId);

  const meetsTimeThreshold = accumulatedChapterSeconds >= chapterDurationSeconds;
  const meetsVideoThreshold =
    chapter.contentType === "Video Link" &&
    currentPositionSeconds >= chapterDurationSeconds * 0.85;

  let justCompleted = false;
  if (!wasAlreadyCompleted && (meetsTimeThreshold || meetsVideoThreshold)) {
    assignment.completedChapters.push(chapterId);
    justCompleted = true;
    audit(userId, "COMPLETE_CHAPTER", "CHAPTER", chapterId, { courseId });
  }

  // ── State Machine Evaluation ──
  const totalChapters = courseChapters.length;
  const completedCount = courseChapters.filter((ch) =>
    assignment.completedChapters.includes(ch.id)
  ).length;

  assignment.progress = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 100;

  if (!assignment.status || assignment.status === ENROLLMENT_STATUS.ENROLLED) {
    assignment.status = ENROLLMENT_STATUS.IN_PROGRESS;
  }

  if (completedCount >= totalChapters && totalChapters > 0) {
    assignment.status = ENROLLMENT_STATUS.CHAPTERS_COMPLETE;
    const screeningAssessments = assessments.filter(
      (a) => a.courseId === courseId && a.approval === "Approved" && a.status === "Active"
    );

    if (screeningAssessments.length > 0) {
      assignment.status = ENROLLMENT_STATUS.ASSESSMENT_ELIGIBLE;
      audit(userId, "COURSE_ASSESSMENT_ELIGIBLE", "COURSE", courseId);
    } else {
      assignment.status = ENROLLMENT_STATUS.PASSED;
      assignment.completedAt = assignment.completedAt || now();
      audit(userId, "COURSE_PASSED_NO_ASSESSMENT", "COURSE", courseId);
    }
  }

  const nextChapter = getNextChapter(courseChapters, assignment.completedChapters);

  return {
    ok: true,
    chapterId,
    chapterTimeSeconds: assignment.chapterTimeSpentSeconds[chapterId],
    isChapterCompleted: assignment.completedChapters.includes(chapterId),
    justCompleted,
    progress: assignment.progress,
    enrollmentStatus: assignment.status,
    effectiveIncrement,
    nextChapterId: nextChapter ? nextChapter.id : null,
  };
}

export function canAttemptAssessment({ courseId, userId, userRole = "Learner" }) {
  if (userRole === "Super Admin" || userRole === "Admin") {
    return { allowed: true };
  }

  const assignment = assignments.find((a) => a.courseId === courseId && a.userId === userId);
  if (!assignment) {
    return { allowed: false, error: "You are not enrolled in this course" };
  }

  const courseChapters = getCourseChapters(courseId);
  const completed = assignment.completedChapters || [];
  const allChaptersCompleted =
    courseChapters.length === 0 ||
    courseChapters.every((ch) => completed.includes(ch.id));

  if (!allChaptersCompleted) {
    return {
      allowed: false,
      error: "You must complete all course chapters before attempting the proctored assessment screening",
      completedCount: completed.length,
      totalCount: courseChapters.length,
    };
  }

  return { allowed: true, assignment };
}

