// Module: Public Shareable Candidate Assessments with Auto-Evaluating Engine,
// Comprehensive Question Library (300+ Qs across 12 domains), and Assessor Analytics.
import crypto from "node:crypto";
import { z } from "zod";
import {
  candidateAssessments,
  assessments,
  courses,
  chapters,
  questionLibrary,
  proctoringLogs,
  now,
  isAdmin,
  persist,
} from "../../core.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import {
  canCreateCandidateAssessment,
  canViewCandidateAnalytics,
  canViewQuestionBank,
} from "../../security/authorization.js";

export function registerCandidateAssessments(app) {
  // ── 1. Question Library API: Browse 300+ Questions across 12 Hiring Categories ──
  app.get("/api/assessments/question-library", authenticate, requireRole("Admin"), (req, res) => {
    if (!canViewQuestionBank(req.user)) return res.status(403).json({ error: "Forbidden" });
    const { category, difficulty, points, search, limit = 50, offset = 0 } = req.query;

    let filtered = [...questionLibrary];

    if (category && category !== "All") {
      filtered = filtered.filter(
        (q) => q.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    if (difficulty) {
      filtered = filtered.filter((q) => Number(q.difficulty) === Number(difficulty));
    }

    if (points) {
      filtered = filtered.filter((q) => Number(q.points) === Number(points));
    }

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.prompt.toLowerCase().includes(s) ||
          q.category.toLowerCase().includes(s) ||
          q.options.some((opt) => opt.toLowerCase().includes(s))
      );
    }

    const categories = Array.from(new Set(questionLibrary.map((q) => q.category)));
    const total = filtered.length;
    const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

    // Summary statistics
    const stats = {
      totalQuestions: questionLibrary.length,
      categoriesCount: categories.length,
      byCategory: categories.reduce((acc, cat) => {
        acc[cat] = questionLibrary.filter((q) => q.category === cat).length;
        return acc;
      }, {}),
      byDifficulty: [1, 2, 3, 4, 5].reduce((acc, d) => {
        acc[`${d} Mark (${d} Diff)`] = questionLibrary.filter((q) => q.points === d).length;
        return acc;
      }, {}),
    };

    return res.json({
      ok: true,
      total,
      categories,
      stats,
      data: paginated,
    });
  });

  // ── 2. Authenticated: Create a shareable assessment link ──
  app.post("/api/candidate-assessments", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    const schema = z.object({
      assessmentId: z.string(),
      durationMinutes: z.coerce.number().min(1).max(360).optional(),
      passScore: z.coerce.number().min(1).max(100).optional(),
      questionLimit: z.coerce.number().int().positive().optional(),
      proctoringRequired: z.boolean().default(true),
      fullscreenRequired: z.boolean().default(true),
      tabSwitchAutoSubmit: z.boolean().default(false),
      maxTabSwitches: z.coerce.number().min(1).max(10).default(3),
      expiresAt: z.string().nullable().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const assessment = assessments.find((item) => item.id === parsed.data.assessmentId);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });
    if (!canCreateCandidateAssessment(req.user, assessment)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const course = courses.find((item) => item.id === assessment.courseId);
    const token = crypto.randomBytes(12).toString("hex");
    const linkId = `CAL-${Math.floor(100000 + Math.random() * 900000)}`;

    const record = {
      id: linkId,
      token,
      assessmentId: assessment.id,
      title: assessment.title,
      courseId: assessment.courseId,
      courseTitle: course?.title || assessment.courseId,
      chapterId: assessment.chapterId || null,
      durationMinutes: parsed.data.durationMinutes || assessment.durationMinutes || 30,
      passScore: parsed.data.passScore || assessment.passScore || 70,
      questionLimit: parsed.data.questionLimit || assessment.questionLimit || assessment.questions.length,
      proctoringRequired: parsed.data.proctoringRequired !== false,
      fullscreenRequired: parsed.data.fullscreenRequired !== false,
      tabSwitchAutoSubmit: Boolean(parsed.data.tabSwitchAutoSubmit),
      maxTabSwitches: parsed.data.maxTabSwitches || 3,
      expiresAt: parsed.data.expiresAt || null,
      status: "Active",
      createdBy: req.user.id,
      createdByName: req.user.name,
      createdAt: now(),
      submissions: [],
    };

    candidateAssessments.unshift(record);
    persist();

    return res.status(201).json({
      ok: true,
      data: record,
      shareableUrl: `/candidate-assessment/${token}`,
    });
  });

  // ── 3. Authenticated: List candidate assessment links ──
  app.get("/api/candidate-assessments", authenticate, (req, res) => {
    const admin = isAdmin(req.user.role);
    const links = candidateAssessments.filter((link) => admin || link.createdBy === req.user.id);

    const summaries = links.map((link) => {
      const submissions = link.submissions || [];
      const completed = submissions.filter((s) => s.submittedAt);
      const passed = completed.filter((s) => s.passed);
      const avgScore = completed.length
        ? Math.round(completed.reduce((acc, s) => acc + (s.percentage || 0), 0) / completed.length)
        : 0;
      const avgTrust = completed.length
        ? Math.round(completed.reduce((acc, s) => acc + (s.trustScore ?? 100), 0) / completed.length)
        : 100;
      const ignoredProctoringCount = completed.filter((s) => s.ignoredProctoring).length;

      return {
        id: link.id,
        token: link.token,
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
        status: link.status,
        createdBy: link.createdBy,
        createdByName: link.createdByName,
        createdAt: link.createdAt,
        totalSubmissions: submissions.length,
        completedSubmissions: completed.length,
        passedSubmissions: passed.length,
        averageScore: avgScore,
        averageTrustScore: avgTrust,
        ignoredProctoringCount,
        shareableUrl: `/candidate-assessment/${link.token}`,
      };
    });

    return res.json({ data: summaries, total: summaries.length });
  });

  // ── 4. Authenticated: Get detailed Assessment Analytics, Best Performers, and Individual Responses ──
  app.get("/api/candidate-assessments/analytics/:id", authenticate, (req, res) => {
    const targetId = req.params.id;
    // Find either by link id, token, or base assessmentId
    const link = candidateAssessments.find(
      (l) => l.id === targetId || l.token === targetId || l.assessmentId === targetId
    );

    const assessment = assessments.find((a) => a.id === targetId || a.id === link?.assessmentId);
    if (!link && !assessment) return res.status(404).json({ error: "Candidate assessment not found" });
    if (!canViewCandidateAnalytics(req.user, link, assessment)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const submissions = link?.submissions || [];
    const completed = submissions.filter((s) => s.submittedAt);
    const passed = completed.filter((s) => s.passed);
    const failed = completed.filter((s) => !s.passed);

    // Compute averages
    const avgScore = completed.length
      ? Math.round(completed.reduce((acc, s) => acc + (s.percentage || 0), 0) / completed.length)
      : 0;
    const avgTimeSpentSeconds = completed.length
      ? Math.round(completed.reduce((acc, s) => acc + (s.timeSpentSeconds || 0), 0) / completed.length)
      : 0;
    const avgTrust = completed.length
      ? Math.round(completed.reduce((acc, s) => acc + (s.trustScore ?? 100), 0) / completed.length)
      : 100;
    const ignoredProctoringCount = completed.filter((s) => s.ignoredProctoring).length;

    // Leaderboard / Best Performers: ranked by score desc, then trust score desc, then time spent asc
    const bestPerformers = [...completed]
      .sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if ((b.trustScore ?? 100) !== (a.trustScore ?? 100)) return (b.trustScore ?? 100) - (a.trustScore ?? 100);
        return (a.timeSpentSeconds || 0) - (b.timeSpentSeconds || 0);
      })
      .slice(0, 10)
      .map((sub, index) => ({
        rank: index + 1,
        id: sub.id,
        candidateName: sub.candidateName,
        candidateEmail: sub.candidateEmail,
        score: sub.score,
        maxScore: sub.maxScore,
        percentage: sub.percentage,
        passed: sub.passed,
        trustScore: sub.trustScore ?? 100,
        timeSpentSeconds: sub.timeSpentSeconds || 0,
        ignoredProctoring: sub.ignoredProctoring || false,
        proctoringStatus: sub.proctoringStatus || (sub.trustScore >= 80 ? "CLEAN" : "FLAGGED"),
        hiringRecommendation: sub.hiringRecommendation || (sub.passed ? "Recommended" : "Not Shortlisted"),
        submittedAt: sub.submittedAt,
      }));

    return res.json({
      ok: true,
      analytics: {
        assessmentId: assessment?.id || link?.assessmentId || targetId,
        title: assessment?.title || link?.title || "Assessment",
        courseTitle: link?.courseTitle || assessment?.courseId || "",
        passScore: link?.passScore || assessment?.passScore || 70,
        durationMinutes: link?.durationMinutes || assessment?.durationMinutes || 30,
        attendeesCount: submissions.length,
        completedCount: completed.length,
        passedCount: passed.length,
        failedCount: failed.length,
        passRate: completed.length ? Math.round((passed.length / completed.length) * 100) : 0,
        averageScore: avgScore,
        averageTimeSpentSeconds: avgTimeSpentSeconds,
        averageTrustScore: avgTrust,
        ignoredProctoringCount,
        proctoringIntegrityRate: completed.length
          ? Math.round(((completed.length - ignoredProctoringCount) / completed.length) * 100)
          : 100,
      },
      bestPerformers,
      candidateResponses: submissions.map((s) => ({
        id: s.id,
        candidateName: s.candidateName,
        candidateEmail: s.candidateEmail,
        status: s.status,
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        passed: s.passed,
        trustScore: s.trustScore,
        tabSwitchCount: s.tabSwitchCount || 0,
        ignoredProctoring: s.ignoredProctoring || false,
        proctoringStatus: s.proctoringStatus || (s.trustScore >= 80 ? "CLEAN" : "FLAGGED"),
        hiringRecommendation: s.hiringRecommendation || (s.passed ? "Recommended" : "Not Shortlisted"),
        timeSpentSeconds: s.timeSpentSeconds,
        startedAt: s.startedAt,
        submittedAt: s.submittedAt,
        categoryBreakdown: s.categoryBreakdown || {},
        flagsCount: (s.flags || []).length,
        flags: s.flags || [],
        evaluatedResponses: s.evaluatedResponses || [],
      })),
      linkDetails: link
        ? {
            id: link.id,
            token: link.token,
            status: link.status,
            shareableUrl: `/candidate-assessment/${link.token}`,
          }
        : null,
    });
  });

  // ── 5. Authenticated: Get detailed results for a link ──
  app.get("/api/candidate-assessments/:id", authenticate, (req, res) => {
    const link = candidateAssessments.find((item) => item.id === req.params.id || item.token === req.params.id);
    if (!link) return res.status(404).json({ error: "Candidate assessment not found" });

    if (!isAdmin(req.user.role) && link.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({ ok: true, data: link });
  });

  // ── 6. Authenticated: Toggle Active / Closed status ──
  app.patch("/api/candidate-assessments/:id/status", authenticate, requireStepUp, (req, res) => {
    const link = candidateAssessments.find((item) => item.id === req.params.id || item.token === req.params.id);
    if (!link) return res.status(404).json({ error: "Candidate assessment not found" });

    if (!isAdmin(req.user.role) && link.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    link.status = link.status === "Active" ? "Closed" : "Active";
    persist();

    return res.json({ ok: true, status: link.status });
  });

  // ── 7. Authenticated: Delete a shareable link ──
  app.delete("/api/candidate-assessments/:id", authenticate, requireStepUp, (req, res) => {
    const idx = candidateAssessments.findIndex((item) => item.id === req.params.id || item.token === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Candidate assessment not found" });

    const link = candidateAssessments[idx];
    if (!isAdmin(req.user.role) && link.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    candidateAssessments.splice(idx, 1);
    persist();

    return res.json({ ok: true, message: "Assessment link deleted successfully" });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // ── PUBLIC CANDIDATE ENDPOINTS (NO AUTH REQUIRED) ──
  // ════════════════════════════════════════════════════════════════════════════

  // Public: Get assessment metadata
  app.get("/api/public/candidate-assessments/:token", (req, res) => {
    const link = candidateAssessments.find((item) => item.token === req.params.token);
    if (!link) return res.status(404).json({ error: "Candidate assessment link not found or expired" });

    if (link.status !== "Active") {
      return res.status(403).json({ error: "This assessment link is currently closed by the administrator." });
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return res.status(403).json({ error: "This assessment link has expired." });
    }

    const assessment = assessments.find((item) => item.id === link.assessmentId);
    const totalQuestions = link.questionLimit || assessment?.questions?.length || 10;

    return res.json({
      ok: true,
      data: {
        id: link.id,
        token: link.token,
        title: link.title,
        courseTitle: link.courseTitle,
        durationMinutes: link.durationMinutes,
        passScore: link.passScore,
        totalQuestions,
        proctoringRequired: link.proctoringRequired,
        fullscreenRequired: link.fullscreenRequired,
        tabSwitchAutoSubmit: link.tabSwitchAutoSubmit,
        maxTabSwitches: link.maxTabSwitches,
        status: link.status,
      },
    });
  });

  // Public: Start assessment (Enforces 1 response per email)
  app.post("/api/public/candidate-assessments/:token/start", (req, res) => {
    const schema = z.object({
      candidateName: z.string().trim().min(2, "Name must be at least 2 characters"),
      candidateEmail: z.string().trim().email("Please provide a valid email address"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const link = candidateAssessments.find((item) => item.token === req.params.token);
    if (!link) return res.status(404).json({ error: "Assessment link not found" });

    if (link.status !== "Active") {
      return res.status(403).json({ error: "This assessment link is currently closed." });
    }

    const normalizedEmail = parsed.data.candidateEmail.toLowerCase();

    // STRICT ONE SUBMISSION PER EMAIL CHECK
    const existing = (link.submissions || []).find((s) => s.candidateEmail.toLowerCase() === normalizedEmail);
    if (existing) {
      if (existing.submittedAt) {
        return res.status(409).json({
          error: "An assessment has already been submitted using this email ID. Only one response per candidate is accepted.",
          code: "DUPLICATE_EMAIL_SUBMITTED",
          submittedAt: existing.submittedAt,
        });
      }
      return res.status(409).json({
        error: "An active assessment session already exists for this email ID. Only one attempt is permitted.",
        code: "SESSION_ALREADY_IN_PROGRESS",
      });
    }

    const assessment = assessments.find((item) => item.id === link.assessmentId);
    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
      return res.status(500).json({ error: "Assessment questions are not configured." });
    }

    const limit = Math.min(link.questionLimit || assessment.questionLimit || 10, assessment.questions.length);
    const selectedQuestions = assessment.questions.slice(0, limit);

    // Blind questions (strip answer, explanation)
    const blindQuestions = selectedQuestions.map((q, idx) => ({
      id: q.id || `Q-${idx + 1}`,
      prompt: q.prompt,
      category: q.category || "General",
      type: q.type || "MCQ",
      options: q.options || [],
      points: q.points || 1,
    }));

    const attemptToken = crypto.randomBytes(24).toString("hex");
    const submissionId = `CAS-${Math.floor(100000 + Math.random() * 900000)}`;

    const submission = {
      id: submissionId,
      attemptToken,
      candidateName: parsed.data.candidateName.trim(),
      candidateEmail: normalizedEmail,
      startedAt: now(),
      submittedAt: null,
      status: "In Progress",
      trustScore: 100,
      tabSwitchCount: 0,
      flags: [],
      answers: {},
      questionIds: selectedQuestions.map((q, idx) => q.id || `Q-${idx + 1}`),
      score: 0,
      maxScore: selectedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
      percentage: 0,
      passed: false,
      ignoredProctoring: false,
      proctoringStatus: "CLEAN",
      evaluatedResponses: [],
      categoryBreakdown: {},
    };

    link.submissions.push(submission);
    persist();

    return res.status(201).json({
      ok: true,
      attemptToken,
      submissionId: submission.id,
      candidateName: submission.candidateName,
      candidateEmail: submission.candidateEmail,
      durationMinutes: link.durationMinutes,
      passScore: link.passScore,
      questions: blindQuestions,
      startedAt: submission.startedAt,
    });
  });

  // Public: Record Proctoring Anomaly Event
  app.post("/api/public/candidate-assessments/:token/event", (req, res) => {
    const schema = z.object({
      attemptToken: z.string(),
      eventType: z.enum([
        "FACE_ABSENT",
        "MULTIPLE_FACES",
        "GAZE_AWAY",
        "DEVICE_DETECTED",
        "TAB_SWITCH",
        "FULLSCREEN_EXIT",
        "AUDIO_SPIKE",
        "CAMERA_OFF",
        "MIC_OFF",
        "COPY_PASTE_ATTEMPT",
        "WINDOW_BLUR",
      ]),
      severity: z.enum(["low", "medium", "high"]).default("medium"),
      confidence: z.number().min(0).max(1).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const link = candidateAssessments.find((item) => item.token === req.params.token);
    if (!link) return res.status(404).json({ error: "Assessment link not found" });

    const submission = (link.submissions || []).find((s) => s.attemptToken === parsed.data.attemptToken);
    if (!submission) return res.status(404).json({ error: "Assessment session not found" });

    if (submission.submittedAt) {
      return res.status(400).json({ error: "Assessment has already been completed" });
    }

    const penalty = parsed.data.severity === "high" ? 15 : parsed.data.severity === "medium" ? 5 : 2;
    submission.trustScore = Math.max(0, (submission.trustScore ?? 100) - penalty);

    if (parsed.data.eventType === "TAB_SWITCH" || parsed.data.eventType === "WINDOW_BLUR") {
      submission.tabSwitchCount = (submission.tabSwitchCount || 0) + 1;
    }

    const flag = {
      id: `FLG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventType: parsed.data.eventType,
      severity: parsed.data.severity,
      confidence: parsed.data.confidence ?? 1.0,
      metadata: parsed.data.metadata || {},
      trustScoreAfter: submission.trustScore,
      createdAt: now(),
    };

    submission.flags = submission.flags || [];
    submission.flags.push(flag);

    // Update proctoring status
    if (submission.trustScore < 60 || submission.tabSwitchCount >= (link.maxTabSwitches || 3)) {
      submission.ignoredProctoring = true;
      submission.proctoringStatus = "PROCTORING_VIOLATIONS_DETECTED";
    } else if (submission.trustScore < 85) {
      submission.proctoringStatus = "MINOR_WARNINGS";
    }

    proctoringLogs.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `LOG-${Date.now()}`,
      attemptId: submission.id,
      userId: submission.candidateEmail,
      eventType: parsed.data.eventType,
      severity: parsed.data.severity,
      confidence: parsed.data.confidence ?? 1.0,
      trustScoreAfter: submission.trustScore,
      metadata: {
        candidateName: submission.candidateName,
        candidateAssessmentId: link.id,
        assessmentTitle: link.title,
        ...(parsed.data.metadata || {}),
      },
      createdAt: now(),
    });

    let autoSubmitted = false;
    if (link.tabSwitchAutoSubmit && submission.tabSwitchCount >= (link.maxTabSwitches || 3)) {
      autoSubmitted = true;
    }

    persist();

    return res.json({
      ok: true,
      trustScore: submission.trustScore,
      tabSwitchCount: submission.tabSwitchCount,
      ignoredProctoring: submission.ignoredProctoring,
      proctoringStatus: submission.proctoringStatus,
      autoSubmitted,
    });
  });

  // Public: Auto-Evaluating Engine: Submit & Immediately Screen Candidate Answers
  app.post("/api/public/candidate-assessments/:token/submit", (req, res) => {
    const schema = z.object({
      attemptToken: z.string(),
      answers: z.record(z.string(), z.any()),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const link = candidateAssessments.find((item) => item.token === req.params.token);
    if (!link) return res.status(404).json({ error: "Assessment link not found" });

    const submission = (link.submissions || []).find((s) => s.attemptToken === parsed.data.attemptToken);
    if (!submission) return res.status(404).json({ error: "Assessment attempt not found" });

    if (submission.submittedAt) {
      return res.status(400).json({
        error: "This assessment attempt has already been submitted.",
        submittedAt: submission.submittedAt,
        score: submission.score,
        percentage: submission.percentage,
      });
    }

    const assessment = assessments.find((item) => item.id === link.assessmentId);
    if (!assessment) return res.status(500).json({ error: "Base assessment not found" });

    // ── Instant Auto-Evaluation Engine ──
    let earnedPoints = 0;
    let totalPoints = 0;
    const evaluatedResponses = [];
    const categoryScores = {};

    const questionMap = new Map((assessment.questions || []).map((q, idx) => [q.id || `Q-${idx + 1}`, q]));

    submission.questionIds.forEach((qId) => {
      const q = questionMap.get(qId);
      if (!q) return;

      const pts = q.points || 1;
      totalPoints += pts;
      const cat = q.category || "General";

      if (!categoryScores[cat]) {
        categoryScores[cat] = { score: 0, maxScore: 0 };
      }
      categoryScores[cat].maxScore += pts;

      const candidateAnswer = parsed.data.answers[qId];
      let isCorrect = false;

      if (candidateAnswer !== undefined && candidateAnswer !== null) {
        if (q.type === "MCQ") {
          const expected = q.answer;
          if (
            Number(candidateAnswer) === Number(expected) ||
            String(candidateAnswer).trim().toLowerCase() === String(expected).trim().toLowerCase()
          ) {
            isCorrect = true;
            earnedPoints += pts;
            categoryScores[cat].score += pts;
          }
        } else {
          // Descriptive / other type
          if (String(candidateAnswer).trim().length > 10) {
            isCorrect = true;
            earnedPoints += pts;
            categoryScores[cat].score += pts;
          }
        }
      }

      evaluatedResponses.push({
        questionId: q.id,
        prompt: q.prompt,
        category: cat,
        points: pts,
        earnedPoints: isCorrect ? pts : 0,
        candidateAnswer,
        candidateAnswerText: q.options?.[candidateAnswer] !== undefined ? q.options[candidateAnswer] : String(candidateAnswer ?? "Unanswered"),
        correctAnswer: q.answer,
        correctAnswerText: q.options?.[q.answer] !== undefined ? q.options[q.answer] : String(q.answer),
        isCorrect,
        explanation: q.explanation || "",
      });
    });

    const maxScore = totalPoints > 0 ? totalPoints : 100;
    const percentage = Math.round((earnedPoints / maxScore) * 100);
    const passed = percentage >= (link.passScore || 70);

    // Compute category percentage breakdown
    const categoryBreakdown = {};
    Object.keys(categoryScores).forEach((cat) => {
      const c = categoryScores[cat];
      categoryBreakdown[cat] = {
        score: c.score,
        maxScore: c.maxScore,
        percentage: c.maxScore > 0 ? Math.round((c.score / c.maxScore) * 100) : 0,
      };
    });

    // Proctoring & Integrity Screening
    const ignoredProctoring =
      submission.trustScore < 60 ||
      (submission.tabSwitchCount || 0) >= (link.maxTabSwitches || 3) ||
      (submission.flags || []).some((f) => f.severity === "high" && f.eventType === "FULLSCREEN_EXIT");

    let proctoringStatus = "CLEAN";
    if (ignoredProctoring) {
      proctoringStatus = "PROCTORING_VIOLATIONS_DETECTED";
    } else if (submission.trustScore < 85) {
      proctoringStatus = "MINOR_WARNINGS";
    }

    // Automated Screening Recommendation
    let hiringRecommendation = "Not Shortlisted";
    if (passed && proctoringStatus === "CLEAN") {
      hiringRecommendation = "Fast-track Interview";
    } else if (passed && proctoringStatus !== "CLEAN") {
      hiringRecommendation = "Interview with Proctoring Review";
    }

    submission.submittedAt = now();
    submission.timeSpentSeconds = Math.max(
      0,
      Math.floor((new Date(submission.submittedAt).getTime() - new Date(submission.startedAt).getTime()) / 1000)
    );
    submission.answers = parsed.data.answers;
    submission.score = earnedPoints;
    submission.maxScore = maxScore;
    submission.percentage = percentage;
    submission.passed = passed;
    submission.status = passed ? "Passed" : "Failed";
    submission.ignoredProctoring = ignoredProctoring;
    submission.proctoringStatus = proctoringStatus;
    submission.hiringRecommendation = hiringRecommendation;
    submission.evaluatedResponses = evaluatedResponses;
    submission.categoryBreakdown = categoryBreakdown;

    persist();

    return res.json({
      ok: true,
      result: {
        submissionId: submission.id,
        candidateName: submission.candidateName,
        candidateEmail: submission.candidateEmail,
        score: submission.score,
        maxScore: submission.maxScore,
        percentage: submission.percentage,
        passed: submission.passed,
        passScore: link.passScore,
        trustScore: submission.trustScore,
        ignoredProctoring: submission.ignoredProctoring,
        proctoringStatus: submission.proctoringStatus,
        hiringRecommendation: submission.hiringRecommendation,
        timeSpentSeconds: submission.timeSpentSeconds,
        submittedAt: submission.submittedAt,
        tabSwitchCount: submission.tabSwitchCount,
        flagsCount: (submission.flags || []).length,
        categoryBreakdown: submission.categoryBreakdown,
      },
    });
  });
}
