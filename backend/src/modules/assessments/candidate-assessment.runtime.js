export const blindCandidateQuestions = (questions) => questions.map((question, index) => ({
  id: question.id || `Q-${index + 1}`,
  prompt: question.prompt,
  category: question.category || "General",
  type: question.type || "MCQ",
  options: question.options || [],
  points: Number(question.points || 1),
}));

export function evaluateCandidateSubmission({ submission, questions, answers, passScore, maxTabSwitches }) {
  const selected = new Set(submission.questionIds || []);
  let earnedPoints = 0;
  let totalPoints = 0;
  let requiresManualReview = false;
  const evaluatedResponses = [];
  const categoryScores = {};

  questions.forEach((question, index) => {
    const questionId = question.id || `Q-${index + 1}`;
    if (!selected.has(questionId)) return;
    const points = Number(question.points || 1);
    const category = question.category || "General";
    totalPoints += points;
    categoryScores[category] ||= { score: 0, maxScore: 0 };
    categoryScores[category].maxScore += points;

    const candidateAnswer = answers[questionId];
    let isCorrect = false;
    if (candidateAnswer !== undefined && candidateAnswer !== null) {
      if ((question.type || "MCQ") === "MCQ") {
        isCorrect = Number(candidateAnswer) === Number(question.answer)
          || String(candidateAnswer).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
        if (isCorrect) {
          earnedPoints += points;
          categoryScores[category].score += points;
        }
      } else {
        requiresManualReview = true;
      }
    }

    evaluatedResponses.push({
      questionId,
      prompt: question.prompt,
      category,
      points,
      earnedPoints: isCorrect ? points : 0,
      candidateAnswer,
      candidateAnswerText: question.options?.[candidateAnswer] !== undefined
        ? question.options[candidateAnswer]
        : String(candidateAnswer ?? "Unanswered"),
      correctAnswer: (question.type || "MCQ") === "MCQ" ? question.answer : undefined,
      correctAnswerText: (question.type || "MCQ") === "MCQ"
        ? (question.options?.[question.answer] ?? String(question.answer))
        : undefined,
      isCorrect: (question.type || "MCQ") === "MCQ" ? isCorrect : null,
      requiresManualReview: (question.type || "MCQ") !== "MCQ",
      explanation: question.explanation || "",
    });
  });

  const maxScore = totalPoints > 0 ? totalPoints : 100;
  const percentage = Math.round((earnedPoints / maxScore) * 100);
  const passed = requiresManualReview ? null : percentage >= passScore;
  const categoryBreakdown = Object.fromEntries(Object.entries(categoryScores).map(([category, value]) => [
    category,
    {
      score: value.score,
      maxScore: value.maxScore,
      percentage: value.maxScore > 0 ? Math.round((value.score / value.maxScore) * 100) : 0,
    },
  ]));
  const ignoredProctoring = submission.trustScore < 60
    || submission.tabSwitchCount >= maxTabSwitches
    || (submission.flags || []).some((flag) => flag.severity === "high" && flag.eventType === "FULLSCREEN_EXIT");
  const proctoringStatus = ignoredProctoring
    ? "PROCTORING_VIOLATIONS_DETECTED"
    : submission.trustScore < 85 ? "MINOR_WARNINGS" : "CLEAN";
  const hiringRecommendation = requiresManualReview
    ? "Manual Review Required"
    : passed && proctoringStatus === "CLEAN"
      ? "Fast-track Interview"
      : passed ? "Interview with Proctoring Review" : "Not Shortlisted";

  return {
    answers,
    score: earnedPoints,
    maxScore,
    percentage,
    passed,
    status: requiresManualReview ? "PendingManualReview" : passed ? "Passed" : "Failed",
    requiresManualReview,
    ignoredProctoring,
    proctoringStatus,
    hiringRecommendation,
    evaluatedResponses,
    categoryBreakdown,
  };
}

export function summarizeCandidateLink(link) {
  const submissions = link.submissions || [];
  const completed = submissions.filter((submission) => submission.submittedAt);
  const passed = completed.filter((submission) => submission.passed === true);
  return {
    id: link.id,
    token: null,
    tokenHint: link.tokenHint,
    assessmentId: link.assessmentId,
    title: link.title,
    courseTitle: link.courseTitle,
    durationMinutes: link.durationMinutes,
    passScore: link.passScore,
    questionLimit: link.questionLimit,
    proctoringRequired: link.proctoringRequired,
    fullscreenRequired: link.fullscreenRequired,
    tabSwitchAutoSubmit: link.tabSwitchAutoSubmit,
    maxTabSwitches: link.maxTabSwitches,
    expiresAt: link.expiresAt,
    status: link.status,
    createdBy: link.createdBy,
    createdByName: link.createdByName,
    createdAt: link.createdAt,
    totalSubmissions: submissions.length,
    completedSubmissions: completed.length,
    passedSubmissions: passed.length,
    averageScore: completed.length
      ? Math.round(completed.reduce((sum, item) => sum + item.percentage, 0) / completed.length)
      : 0,
    averageTrustScore: completed.length
      ? Math.round(completed.reduce((sum, item) => sum + item.trustScore, 0) / completed.length)
      : 100,
    ignoredProctoringCount: completed.filter((item) => item.ignoredProctoring).length,
    shareableUrl: null,
  };
}

export function candidateAnalytics(link) {
  const submissions = link.submissions || [];
  const completed = submissions.filter((submission) => submission.submittedAt);
  const passed = completed.filter((submission) => submission.passed === true);
  const failed = completed.filter((submission) => submission.passed === false);
  const average = (selector, fallback = 0) => completed.length
    ? Math.round(completed.reduce((sum, item) => sum + selector(item), 0) / completed.length)
    : fallback;
  const ignoredProctoringCount = completed.filter((item) => item.ignoredProctoring).length;
  const bestPerformers = [...completed]
    .sort((a, b) => b.percentage - a.percentage
      || b.trustScore - a.trustScore
      || a.timeSpentSeconds - b.timeSpentSeconds)
    .slice(0, 10)
    .map((submission, index) => ({
      rank: index + 1,
      id: submission.id,
      candidateName: submission.candidateName,
      candidateEmail: submission.candidateEmail,
      score: submission.score,
      maxScore: submission.maxScore,
      percentage: submission.percentage,
      passed: submission.passed,
      trustScore: submission.trustScore,
      timeSpentSeconds: submission.timeSpentSeconds,
      ignoredProctoring: submission.ignoredProctoring,
      proctoringStatus: submission.proctoringStatus,
      hiringRecommendation: submission.hiringRecommendation,
      submittedAt: submission.submittedAt,
    }));
  return {
    analytics: {
      assessmentId: link.assessmentId,
      title: link.title,
      courseTitle: link.courseTitle,
      passScore: link.passScore,
      durationMinutes: link.durationMinutes,
      attendeesCount: submissions.length,
      completedCount: completed.length,
      passedCount: passed.length,
      failedCount: failed.length,
      passRate: completed.length ? Math.round((passed.length / completed.length) * 100) : 0,
      averageScore: average((item) => item.percentage),
      averageTimeSpentSeconds: average((item) => item.timeSpentSeconds),
      averageTrustScore: average((item) => item.trustScore, 100),
      ignoredProctoringCount,
      proctoringIntegrityRate: completed.length
        ? Math.round(((completed.length - ignoredProctoringCount) / completed.length) * 100)
        : 100,
    },
    bestPerformers,
    candidateResponses: submissions.map((submission) => ({
      ...submission,
      attemptToken: undefined,
      flagsCount: submission.flags.length,
    })),
    linkDetails: {
      id: link.id,
      token: null,
      tokenHint: link.tokenHint,
      status: link.status,
      shareableUrl: null,
    },
  };
}
