import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import { assessments, courses, chapters, assignments, attempts, users, issuedCertificates, now, ASSESSMENT_TIME_GRACE_SECONDS } from "../../core.js";
import { signCertificatePayload, buildLinkedInShareUrl } from "../certificates/signatures.js";
import { audit } from "../../domain.js";
import { ENROLLMENT_STATUS } from "../enrollments/progress.service.js";
import { assessmentAttemptClock } from "./exam-deadline.js";


function autoIssueCert(attempt, assignment) {
  if (issuedCertificates.some((c) => c.employeeId === attempt.userId && c.courseId === attempt.courseId)) return;
  const employee = users.find((u) => u.id === attempt.userId);
  const course = courses.find((c) => c.id === attempt.courseId);
  if (!employee || !course) return;

  const year = new Date().getFullYear();
  const certId = `NLD-CERT-${year}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const cert = {
    id: certId,
    certificateId: certId,
    employeeId: employee.id,
    recipientName: employee.name,
    recipientEmail: employee.email,
    courseId: course.id,
    courseTitle: course.title,
    title: "Certificate of Professional Mastery",
    template: "Executive",
    accent: course.thumbnailColor || "#0f766e",
    duration: `${course.estimatedHours || 12} Hours`,
    subtitle: `Demonstrating verified proficiency in ${course.skill || course.title}`,
    footer: "Issued under the authority of Nalanda Academic Board",
    issuedBy: course.ownerId || "SYSTEM",
    issuedByName: "Nalanda Academic Board",
    issuedAt: now(),
    proctoringVerified: (attempt.trustScore ?? 100) >= 70,
    examScore: attempt.score,
    verificationUrl: `/verify/${certId}`,
    signatureVersion: 2,
  };
  cert.signature = signCertificatePayload(cert);
  cert.linkedinShareUrl = buildLinkedInShareUrl({
    certificateId: cert.id,
    recipientName: cert.recipientName,
    courseTitle: cert.courseTitle,
    issuedAt: cert.issuedAt,
    certUrl: cert.verificationUrl,
  });

  issuedCertificates.unshift(cert);
  if (assignment) {
    assignment.certificateId = cert.id;
    assignment.status = ENROLLMENT_STATUS.CERTIFIED;
  }
}

// Module: Blind Exam Delivery Engine
// Server-side randomization, option shuffling, blind delivery, exam clock, anti-replay, and grading.

// Fisher-Yates shuffle using cryptographically secure random integers
export function secureShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildBlindExamAttempt({
  assessment,
  userId,
  userRole = "Learner",
  persistSideEffects = true,
}) {
  const course = courses.find((c) => c.id === assessment.courseId);
  const allQuestions = assessment.questions || [];

  if (allQuestions.length === 0) {
    throw new Error("Assessment has no questions available");
  }

  // 1. Question Sampling & Randomization
  const limit = assessment.questionLimit && assessment.questionLimit < allQuestions.length
    ? assessment.questionLimit
    : allQuestions.length;

  const shuffledQuestions = secureShuffle(allQuestions).slice(0, limit);

  // 2. Option Shuffling & Answer Key Segregation
  const questionMap = {};
  let totalMaxScore = 0;

  for (const q of shuffledQuestions) {
    const points = Number(q.points) || 10;
    totalMaxScore += points;

    if (q.type === "MCQ" && Array.isArray(q.options) && q.options.length > 0) {
      // Create indexed options to track original answer after shuffle
      const indexedOptions = q.options.map((opt, idx) => ({ originalIndex: idx, text: opt }));
      const shuffledIndexed = secureShuffle(indexedOptions);

      const shuffledOptions = shuffledIndexed.map((item) => item.text);
      const correctShuffledIndex = shuffledIndexed.findIndex(
        (item) => item.originalIndex === q.answer
      );

      questionMap[q.id] = {
        prompt: q.prompt,
        type: "MCQ",
        points,
        options: shuffledOptions,
        correctIndex: correctShuffledIndex, // strictly retained on server
        originalIndex: q.answer,
      };
    } else {
      // Descriptive or freeform question
      questionMap[q.id] = {
        prompt: q.prompt,
        type: q.type || "Descriptive",
        points,
        rubric: q.rubric || null,
      };
    }
  }

  const durationMinutes = Number(assessment.durationMinutes) || 15;
  const passScore = Number(assessment.passScore) || 70;
  const startedAt = now();
  const expiresAt = new Date(Date.now() + (durationMinutes * 60 + ASSESSMENT_TIME_GRACE_SECONDS) * 1000).toISOString();

  const attempt = {
    id: uuid(),
    assessmentId: assessment.id,
    courseId: assessment.courseId,
    chapterId: assessment.chapterId || null,
    assessmentVersion: Number(assessment.version) || 1,
    durationMinutesSnapshot: durationMinutes,
    passScoreSnapshot: passScore,
    userId,
    startedAt,
    expiresAt,
    submittedAt: null,
    status: "InProgress",
    score: null,
    maxScore: totalMaxScore,
    feedback: "",
    answers: {}, // { [questionId]: { answer, recordedAt } }
    selectedQuestionIds: shuffledQuestions.map((q) => q.id),
    questionMap,
    tabSwitchWarnings: 0,
    autoSubmittedReason: null,
    timeSpentSeconds: 0,
    flags: [],
  };

  if (persistSideEffects) {
    attempts.unshift(attempt);
    audit(userId, "START_BLIND_EXAM", "ASSESSMENT_ATTEMPT", attempt.id, {
      assessmentId: assessment.id,
      questionCount: attempt.selectedQuestionIds.length,
      durationMinutes,
    });
  }

  return attempt;
}

export function getExamClock(attempt, assessment) {
  return assessmentAttemptClock(attempt, assessment);
}

export function getBlindQuestions({
  attempt,
  assessment,
  page = 1,
  limit = 50,
  persistSideEffects = true,
}) {
  const clock = getExamClock(attempt, assessment);

  // If clock expired and not yet submitted, auto-submit
  if (clock.isExpired && attempt.status === "InProgress" && !attempt.submittedAt) {
    finalizeAttempt({
      attempt,
      assessment,
      autoSubmittedReason: "TIME_EXPIRED",
      systemAutoSubmit: true,
      persistSideEffects,
    });
  }

  const allQuestionIds = attempt.selectedQuestionIds || [];
  const startIndex = (page - 1) * limit;
  const paginatedIds = allQuestionIds.slice(startIndex, startIndex + limit);

  const questions = paginatedIds.map((id) => {
    const meta = attempt.questionMap?.[id];
    const studentAnswerRecord = attempt.answers?.[id];

    return {
      id,
      prompt: meta?.prompt || "Question prompt unavailable",
      type: meta?.type || "MCQ",
      points: meta?.points || 10,
      options: meta?.options || [], // Shuffled options only (zero answers!)
      answered: !!studentAnswerRecord,
      currentAnswer: studentAnswerRecord ? studentAnswerRecord.answer : null,
    };
  });

  return {
    questions,
    pagination: {
      totalQuestions: allQuestionIds.length,
      page,
      limit,
      totalPages: Math.ceil(allQuestionIds.length / limit) || 1,
    },
    clock: {
      durationSeconds: clock.durationSeconds,
      elapsedSeconds: clock.elapsedSeconds,
      timeRemainingSeconds: clock.timeRemainingSeconds,
      isExpired: clock.isExpired,
    },
    status: attempt.status,
    submittedAt: attempt.submittedAt,
  };
}

export function recordQuestionAnswer({ attempt, assessment, questionId, answer, userId }) {
  if (attempt.userId !== userId) {
    const err = new Error("Forbidden: Attempt does not belong to user");
    err.status = 403;
    throw err;
  }

  if (attempt.submittedAt || attempt.status !== "InProgress") {
    const err = new Error("Cannot save answer: Exam has already been submitted");
    err.status = 409;
    throw err;
  }

  const clock = getExamClock(attempt, assessment);
  if (clock.isExpired) {
    finalizeAttempt({
      attempt,
      assessment,
      autoSubmittedReason: "TIME_EXPIRED",
      systemAutoSubmit: true,
    });
    const err = new Error("Exam time has expired");
    err.status = 403;
    throw err;
  }

  if (!attempt.selectedQuestionIds.includes(questionId)) {
    const err = new Error("Question does not belong to this exam attempt");
    err.status = 400;
    throw err;
  }

  attempt.answers = attempt.answers || {};
  attempt.answers[questionId] = {
    answer,
    recordedAt: now(),
  };

  return {
    ok: true,
    questionId,
    answeredCount: Object.keys(attempt.answers).length,
    totalQuestions: attempt.selectedQuestionIds.length,
  };
}

export function finalizeAttempt({
  attempt,
  assessment,
  answers = null,
  autoSubmittedReason = null,
  tabSwitchWarnings = null,
  systemAutoSubmit = false,
  persistSideEffects = true,
}) {
  if (attempt.submittedAt) {
    return { attempt, alreadySubmitted: true };
  }

  const clock = getExamClock(attempt, assessment);
  if (clock.isExpired && !systemAutoSubmit) {
    finalizeAttempt({
      attempt,
      assessment,
      autoSubmittedReason: "TIME_EXPIRED",
      systemAutoSubmit: true,
      persistSideEffects,
    });
    const err = new Error("Exam time has expired; saved answers were auto-submitted");
    err.status = 403;
    throw err;
  }

  const timeSpentSeconds = Math.min(
    clock.elapsedSeconds,
    clock.durationSeconds + ASSESSMENT_TIME_GRACE_SECONDS,
  );

  // Merge any bulk final answers if provided
  if (answers && typeof answers === "object") {
    attempt.answers = attempt.answers || {};
    for (const [qId, val] of Object.entries(answers)) {
      if (!attempt.answers[qId] && attempt.selectedQuestionIds.includes(qId)) {
        attempt.answers[qId] = { answer: val, recordedAt: now() };
      }
    }
  }

  if (tabSwitchWarnings !== null) {
    attempt.tabSwitchWarnings = tabSwitchWarnings;
  }

  if (autoSubmittedReason) {
    attempt.autoSubmittedReason = autoSubmittedReason;
  }

  attempt.submittedAt = now();
  attempt.timeSpentSeconds = timeSpentSeconds;

  // ── Server-Side Grading Engine ──
  let earnedPoints = 0;
  let totalMcqPoints = 0;
  let hasDescriptive = false;

  const questionMap = attempt.questionMap || {};
  for (const qId of attempt.selectedQuestionIds) {
    const qMeta = questionMap[qId];
    if (!qMeta) continue;

    if (qMeta.type === "MCQ") {
      totalMcqPoints += qMeta.points;
      const studentAns = attempt.answers?.[qId]?.answer;
      if (studentAns !== undefined && studentAns === qMeta.correctIndex) {
        earnedPoints += qMeta.points;
      }
    } else {
      hasDescriptive = true;
    }
  }

  let finalPercentage = null;
  let passed = false;
  let feedback = "";

  if (hasDescriptive) {
    // Requires manual grading by instructor/admin
    attempt.status = "PendingManualReview";
    attempt.score = earnedPoints; // preliminary MCQ points
    feedback = "Descriptive responses submitted. Awaiting instructor evaluation.";
  } else {
    // Pure MCQ exam
    finalPercentage = totalMcqPoints > 0 ? Math.round((earnedPoints / totalMcqPoints) * 100) : 0;
    passed = finalPercentage >= (assessment.passScore || 70);
    attempt.status = passed ? "Passed" : "Failed";
    attempt.score = finalPercentage;
    feedback = passed ? "Passed" : "Needs improvement";
  }

  attempt.feedback = feedback;

  // ── Sync with Course Enrollment ──
  if (persistSideEffects) {
    const assignment = assignments.find(
      (a) => a.courseId === attempt.courseId && a.userId === attempt.userId
    );
    if (assignment) {
      assignment.timeSpentSeconds = (assignment.timeSpentSeconds || 0) + timeSpentSeconds;
      assignment.timeSpentMinutes = Math.ceil(assignment.timeSpentSeconds / 60);

      if (attempt.status === "Passed") {
        assignment.status = ENROLLMENT_STATUS.PASSED;
        assignment.completedAt = assignment.completedAt || now();
        autoIssueCert(attempt, assignment);
      } else if (attempt.status === "Failed") {
        assignment.status = ENROLLMENT_STATUS.FAILED;
      }
    }

    audit(attempt.userId, "SUBMIT_EXAM_ATTEMPT", "ASSESSMENT_ATTEMPT", attempt.id, {
      score: attempt.score,
      status: attempt.status,
      autoSubmittedReason: attempt.autoSubmittedReason,
      timeSpentSeconds,
    });
  }

  return {
    attempt,
    score: attempt.score,
    passed: attempt.status === "Passed",
    status: attempt.status,
    feedback: attempt.feedback,
  };
}

export function manualGradeAttempt({
  attempt,
  assessment,
  evaluatorId,
  grades,
  overallFeedback,
  persistSideEffects = true,
}) {
  if (attempt.status !== "PendingManualReview" && attempt.status !== "Submitted") {
    const err = new Error("Attempt is not awaiting manual evaluation");
    err.status = 400;
    throw err;
  }

  const questionMap = attempt.questionMap || {};
  let totalEarned = 0;
  let totalPossible = attempt.maxScore || 100;

  // Count existing MCQ points
  for (const qId of attempt.selectedQuestionIds) {
    const qMeta = questionMap[qId];
    if (qMeta && qMeta.type === "MCQ") {
      const studentAns = attempt.answers?.[qId]?.answer;
      if (studentAns !== undefined && studentAns === qMeta.correctIndex) {
        totalEarned += qMeta.points;
      }
    }
  }

  // Add descriptive manual grades
  attempt.manualGrades = attempt.manualGrades || {};
  for (const [qId, gradeData] of Object.entries(grades)) {
    const qMeta = questionMap[qId];
    if (!qMeta || qMeta.type === "MCQ") continue;

    const maxPts = qMeta.points || 20;
    const awarded = Math.min(Math.max(0, Number(gradeData.pointsAwarded) || 0), maxPts);

    attempt.manualGrades[qId] = {
      pointsAwarded: awarded,
      maxPoints: maxPts,
      feedback: gradeData.feedback || "",
      gradedAt: now(),
      gradedBy: evaluatorId,
    };

    totalEarned += awarded;
  }

  const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  const passed = percentage >= (assessment.passScore || 70);

  attempt.score = percentage;
  attempt.status = passed ? "Passed" : "Failed";
  attempt.evaluatedBy = evaluatorId;
  attempt.feedback = overallFeedback || (passed ? "Passed with instructor evaluation" : "Did not meet passing criteria");

  // Sync with course enrollment
  if (persistSideEffects) {
    const assignment = assignments.find(
      (a) => a.courseId === attempt.courseId && a.userId === attempt.userId
    );
    if (assignment) {
      if (passed) {
        assignment.status = ENROLLMENT_STATUS.PASSED;
        assignment.completedAt = assignment.completedAt || now();
      } else {
        assignment.status = ENROLLMENT_STATUS.FAILED;
      }
    }

    audit(evaluatorId, "MANUAL_GRADE_EXAM", "ASSESSMENT_ATTEMPT", attempt.id, {
      score: percentage,
      passed,
      evaluatorId,
    });
  }

  return {
    ok: true,
    attempt,
    score: percentage,
    passed,
    status: attempt.status,
  };
}

