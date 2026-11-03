import { describe, expect, it } from "vitest";
import {
  blindCandidateQuestions,
  candidateAnalytics,
  evaluateCandidateSubmission,
  summarizeCandidateLink,
} from "../../backend/src/modules/assessments/candidate-assessment.runtime.js";

const questions = [
  { id: "Q-1", prompt: "Choose B", type: "MCQ", options: ["A", "B"], answer: 1, points: 8, category: "Security" },
  { id: "Q-2", prompt: "Explain", type: "Descriptive", points: 2, category: "Writing" },
];

describe("candidate assessment runtime", () => {
  it("delivers blind questions without answer material", () => {
    const blind = blindCandidateQuestions(questions);
    expect(blind).toHaveLength(2);
    expect(blind[0]).not.toHaveProperty("answer");
    expect(blind[0]).not.toHaveProperty("explanation");
  });

  it("grades only selected questions and sends prose to manual review", () => {
    const result = evaluateCandidateSubmission({
      submission: { questionIds: ["Q-1", "Q-2"], trustScore: 90, tabSwitchCount: 0, flags: [] },
      questions,
      answers: { "Q-1": 1, "Q-2": "A detailed response", "Q-INJECTED": 1 },
      passScore: 70,
      maxTabSwitches: 3,
    });
    expect(result).toMatchObject({
      score: 8,
      maxScore: 10,
      percentage: 80,
      passed: null,
      status: "PendingManualReview",
      requiresManualReview: true,
    });
    expect(result.evaluatedResponses).toHaveLength(2);
  });

  it("derives proctor outcome and scoped analytics from server state", () => {
    const link = {
      id: "CAL-1",
      tokenHint: "12345678",
      assessmentId: "ASM-1",
      title: "Hiring assessment",
      courseTitle: "Security",
      durationMinutes: 30,
      passScore: 70,
      questionLimit: 1,
      proctoringRequired: true,
      fullscreenRequired: true,
      tabSwitchAutoSubmit: false,
      maxTabSwitches: 3,
      status: "Active",
      createdBy: "OWNER-1",
      createdByName: "Owner",
      createdAt: "2026-11-03T00:00:00.000Z",
      submissions: [{
        id: "CAS-1", candidateName: "Candidate", candidateEmail: "candidate@example.invalid",
        submittedAt: "2026-11-03T01:00:00.000Z", passed: true, percentage: 90,
        trustScore: 75, timeSpentSeconds: 300, ignoredProctoring: true,
        proctoringStatus: "PROCTORING_VIOLATIONS_DETECTED", hiringRecommendation: "Review",
        flags: [{ eventType: "TAB_SWITCH" }], evaluatedResponses: [], categoryBreakdown: {},
      }],
    };
    expect(summarizeCandidateLink(link)).toMatchObject({
      totalSubmissions: 1,
      passedSubmissions: 1,
      averageScore: 90,
      token: null,
      shareableUrl: null,
    });
    expect(candidateAnalytics(link)).toMatchObject({
      analytics: { attendeesCount: 1, ignoredProctoringCount: 1, averageTrustScore: 75 },
      linkDetails: { token: null },
    });
  });
});
