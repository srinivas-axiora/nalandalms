// Foundation layer: domain/business helpers (operate on shared state from core).
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from "./config.js";
import { tokenize } from "./lib.js";
import { redactAuditMetadata, redactSensitive } from "./security/redaction.js";
import { safeRequestPath } from "./security/request-path.js";
import { securityEvidenceRepository } from "./repositories/security-evidence.repository.pg.js";
import { trackEvidenceWrite } from "./security/evidence-write-context.js";
import {
  now, isAdmin, sessionVersions, auditLogs, securityEvents, users, courses,
  assessments, assignments, attempts, chapters, acharyaFeedbackMemory, learningTimeEvents,
} from "./core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const publicUser = (user) => {
  const safe = redactSensitive(user);
  const sessionVersion = Number(user.sessionVersion ?? user.sv ?? sessionVersions[user.id] ?? 0);
  return { ...safe, sessionVersion, sv: sessionVersion };
};

const AUDIT_LOG_CAP = 5000;
export const audit = (actorId, action, entityType, entityId, metadata = {}) => {
  const event = { id: uuid(), actorId, action, entityType, entityId, metadata: redactAuditMetadata(metadata), createdAt: now() };
  if (process.env.USE_PG_AUDIT === "1") {
    return trackEvidenceWrite(securityEvidenceRepository.appendAudit(event));
  }
  auditLogs.unshift(event);
  if (auditLogs.length > AUDIT_LOG_CAP) auditLogs.length = AUDIT_LOG_CAP;
  return event;
};

const SECURITY_EVENT_CAP = 10000;
export const securityEvent = (req, type, metadata = {}) => {
  const event = {
    id: uuid(),
    type,
    actorId: req?.user?.id || null,
    ip: req?.ip || null,
    method: req?.method || null,
    path: safeRequestPath(req?.originalUrl || req?.url || ""),
    userAgent: req?.headers?.["user-agent"] || null,
    requestId: req?.id || req?.headers?.["x-request-id"] || null,
    metadata: redactAuditMetadata(metadata),
    createdAt: now(),
  };
  if (process.env.USE_PG_AUDIT === "1") {
    return trackEvidenceWrite(securityEvidenceRepository.appendSecurityEvent(event));
  }
  securityEvents.unshift(event);
  if (securityEvents.length > SECURITY_EVENT_CAP) securityEvents.length = SECURITY_EVENT_CAP;
  return event;
};

export const signToken = (user) => {
  const sv = Number(user.sessionVersion ?? user.sv ?? sessionVersions[user.id] ?? 0);
  return jwt.sign({ sub: user.id, role: user.role, department: user.department, sv }, JWT_SECRET, {
    expiresIn: "30m",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

export const signStepUpToken = (user) => {
  const sv = Number(user.sessionVersion ?? user.sv ?? sessionVersions[user.id] ?? 0);
  return jwt.sign({ sub: user.id, sv, purpose: "step-up" }, JWT_SECRET, {
    expiresIn: "10m",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
};

export const canManageCourse = (user, course) => isAdmin(user.role) || course.ownerId === user.id;

export const visibleUserIdsFor = (user) => {
  if (isAdmin(user.role)) return users.map((item) => item.id);
  if (user.role === "Manager") return users.filter((item) => item.managerId === user.id || item.id === user.id).map((item) => item.id);
  return [user.id];
};

export const questionPointsTotal = (assessment) => {
  const questions = assessment?.questions || [];
  return questions.length ? questions.reduce((sum, question) => sum + Number(question.points || 0), 0) || 100 : 100;
};

// Strip answer keys before returning an assessment to a non-owner learner.
export const stripAnswerKeys = (assessment) => {
  if (!assessment || !Array.isArray(assessment.questions)) return assessment;
  const questions = assessment.questions.map((q) => {
    const { answer, correctAnswer, expectedAnswer, rubric, ...safe } = q;
    return safe;
  });
  return { ...assessment, questions };
};
export const assessmentForUser = (assessment, user) =>
  (isAdmin(user.role) || assessment.ownerId === user.id) ? assessment : stripAnswerKeys(assessment);

export const assignmentVisibleTo = (assignment, user) => {
  if (isAdmin(user.role)) return true;
  if (user.role === "Manager") return visibleUserIdsFor(user).includes(assignment.userId);
  return assignment.userId === user.id;
};

export const coursesVisibleTo = (user) => {
  if (isAdmin(user.role)) return courses;
  if (user.role === "Manager") {
    return courses.filter((course) => course.ownerId === user.id || (course.approval === "Approved" && course.status === "Active"));
  }
  const assignedCourseIds = new Set(assignments.filter((assignment) => assignment.userId === user.id).map((assignment) => assignment.courseId));
  return courses.filter((course) => assignedCourseIds.has(course.id) && course.approval === "Approved" && course.status === "Active");
};

export const assessmentsVisibleTo = (user) => {
  const visibleCourseIds = new Set(coursesVisibleTo(user).map((course) => course.id));
  if (isAdmin(user.role)) return assessments;
  if (user.role === "Manager") {
    return assessments.filter((assessment) => assessment.ownerId === user.id || (visibleCourseIds.has(assessment.courseId) && assessment.approval === "Approved" && assessment.status === "Active"));
  }
  return assessments.filter((assessment) => visibleCourseIds.has(assessment.courseId) && assessment.approval === "Approved" && assessment.status === "Active");
};

export const targetSkillVisibleTo = (target, user) => {
  if (isAdmin(user.role)) return true;
  if (target.scope === "Organization") return true;
  if (target.scope === "Employee") return target.userId === user.id;
  if (target.scope === "Role") return target.designation === user.designation;
  if (target.scope === "Department") return target.department === user.department || target.department === `Team:${user.team}`;
  return false;
};

export const getRelevantAcharyaFeedback = ({ text = "", skillName = "", courseLevel = "" }) => {
  const queryTokens = tokenize(`${text} ${skillName} ${courseLevel}`);
  return acharyaFeedbackMemory
    .map((item) => {
      const itemTokens = tokenize(`${item.skillName} ${item.courseLevel} ${item.feedbackType} ${item.comment}`);
      let score = 0;
      queryTokens.forEach((token) => {
        if (itemTokens.has(token)) score += 1;
      });
      if (item.skillName === skillName) score += 4;
      if (item.courseLevel === courseLevel) score += 2;
      return { ...item, score };
    })
    .filter((item) => item.score > 0 || item.rating <= 3)
    .sort((a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
};

export const buildFeedbackGuidance = (feedbackItems) => {
  if (!feedbackItems.length) return "No prior generation feedback is available yet.";
  return feedbackItems
    .map((item, index) => `${index + 1}. ${item.feedbackType} feedback, rating ${item.rating}/5: ${item.comment}`)
    .join("\n");
};

const acharyaFeedbackPath = path.resolve(__dirname, "..", "..", "database", "acharya-feedback.json");
const loadAcharyaFeedbackMemory = () => {
  try {
    if (!fs.existsSync(acharyaFeedbackPath)) return [];
    const parsed = JSON.parse(fs.readFileSync(acharyaFeedbackPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
export const saveAcharyaFeedbackMemory = () => {
  fs.mkdirSync(path.dirname(acharyaFeedbackPath), { recursive: true });
  fs.writeFileSync(acharyaFeedbackPath, JSON.stringify(acharyaFeedbackMemory.slice(0, 100), null, 2));
};
acharyaFeedbackMemory.push(...loadAcharyaFeedbackMemory());

export const ensureAssignment = ({ courseId, userId, assignedBy = userId }) => {
  let assignment = assignments.find((item) => item.courseId === courseId && item.userId === userId);
  if (!assignment) {
    assignment = {
      id: uuid(),
      courseId,
      userId,
      assignedBy,
      progress: 0,
      completedChapters: [],
      timeSpentMinutes: 0,
      timeSpentSeconds: 0,
      chapterTimeSpentSeconds: {},
      completedAt: null,
      createdAt: now()
    };
    assignments.unshift(assignment);
  }
  assignment.chapterTimeSpentSeconds = assignment.chapterTimeSpentSeconds || {};
  assignment.completedChapters = assignment.completedChapters || [];
  assignment.timeSpentSeconds = assignment.timeSpentSeconds || Math.round((assignment.timeSpentMinutes || 0) * 60);
  assignment.timeSpentMinutes = Math.ceil((assignment.timeSpentSeconds || 0) / 60);
  return assignment;
};

export const addLearningTimeEvent = ({ userId, courseId, chapterId = null, assessmentId = null, eventType, seconds }) => {
  if (!seconds || seconds <= 0) return null;
  const event = { id: uuid(), userId, courseId, chapterId, assessmentId, eventType, secondsSpent: seconds, recordedAt: now() };
  learningTimeEvents.unshift(event);
  if (learningTimeEvents.length > 20000) learningTimeEvents.length = 20000;
  return event;
};

export const addChapterTime = ({ courseId, chapterId, userId, seconds }) => {
  const assignment = ensureAssignment({ courseId, userId });
  assignment.timeSpentSeconds = (assignment.timeSpentSeconds || 0) + seconds;
  assignment.timeSpentMinutes = Math.ceil(assignment.timeSpentSeconds / 60);
  assignment.chapterTimeSpentSeconds = {
    ...(assignment.chapterTimeSpentSeconds || {}),
    [chapterId]: ((assignment.chapterTimeSpentSeconds || {})[chapterId] || 0) + seconds
  };
  addLearningTimeEvent({ userId, courseId, chapterId, eventType: "CHAPTER_TIME", seconds });
  return assignment;
};

export const addAssessmentTime = ({ attempt, assessment, seconds }) => {
  if (!seconds || seconds <= 0) return null;
  const assignment = ensureAssignment({ courseId: attempt.courseId, userId: attempt.userId });
  assignment.timeSpentSeconds = (assignment.timeSpentSeconds || 0) + seconds;
  assignment.timeSpentMinutes = Math.ceil(assignment.timeSpentSeconds / 60);
  addLearningTimeEvent({ userId: attempt.userId, courseId: attempt.courseId, chapterId: attempt.chapterId || null, assessmentId: assessment?.id || attempt.assessmentId, eventType: "ASSESSMENT_TIME", seconds });
  return assignment;
};

export const assessmentTimeFor = ({ userId, courseId, chapterId }) => attempts
  .filter((attempt) => attempt.userId === userId && attempt.courseId === courseId && (!chapterId || attempt.chapterId === chapterId))
  .reduce((sum, attempt) => sum + (attempt.timeSpentSeconds || 0), 0);

export const chapterTimeFor = (assignment, chapterId) => Number((assignment.chapterTimeSpentSeconds || {})[chapterId] || 0);

export const buildTimeRows = (requester) => {
  const visibleUserIds = visibleUserIdsFor(requester);
  return assignments
    .filter((assignment) => visibleUserIds.includes(assignment.userId))
    .flatMap((assignment) => {
      const chapterIds = new Set([
        ...Object.keys(assignment.chapterTimeSpentSeconds || {}),
        ...attempts
          .filter((attempt) => attempt.userId === assignment.userId && attempt.courseId === assignment.courseId && attempt.chapterId)
          .map((attempt) => attempt.chapterId)
      ]);

      if (chapterIds.size === 0) {
        return [{
          userId: assignment.userId,
          courseId: assignment.courseId,
          chapterId: null,
          chapterTitle: null,
          minimumTimeSeconds: 0,
          minimumTimeMet: true,
          chapterTimeSeconds: 0,
          assessmentTimeSeconds: assessmentTimeFor({ userId: assignment.userId, courseId: assignment.courseId }),
          courseTimeSeconds: assignment.timeSpentSeconds || 0
        }];
      }

      return Array.from(chapterIds).map((chapterId) => {
        const chapter = chapters.find((item) => item.id === chapterId);
        const chapterSeconds = chapterTimeFor(assignment, chapterId);
        const minimumTimeSeconds = Math.max(0, Math.round((chapter?.minimumTimeMinutes || 0) * 60));
        return {
          userId: assignment.userId,
          courseId: assignment.courseId,
          chapterId,
          chapterTitle: chapter?.title || null,
          minimumTimeSeconds,
          minimumTimeMet: chapterSeconds >= minimumTimeSeconds,
          chapterTimeSeconds: chapterSeconds,
          assessmentTimeSeconds: assessmentTimeFor({ userId: assignment.userId, courseId: assignment.courseId, chapterId }),
          courseTimeSeconds: assignment.timeSpentSeconds || 0
        };
      });
    });
};

export const buildReportRows = ({ reportType, filters = {}, requester }) => {
  const visibleUserIds = new Set(visibleUserIdsFor(requester));
  const filteredAssignments = assignments.filter((assignment) => {
    if (!visibleUserIds.has(assignment.userId)) return false;
    if (filters.userId && assignment.userId !== filters.userId) return false;
    if (filters.courseId && assignment.courseId !== filters.courseId) return false;
    const user = users.find((item) => item.id === assignment.userId);
    if (filters.team && user?.team !== filters.team) return false;
    if (filters.department && user?.department !== filters.department) return false;
    return true;
  });

  if (reportType === "User" || reportType === "Team" || reportType === "Course") {
    return filteredAssignments.map((assignment) => {
      const user = users.find((item) => item.id === assignment.userId);
      const course = courses.find((item) => item.id === assignment.courseId);
      const chapterSeconds = Object.values(assignment.chapterTimeSpentSeconds || {}).reduce((sum, seconds) => sum + Number(seconds || 0), 0);
      const assessmentSeconds = assessmentTimeFor({ userId: assignment.userId, courseId: assignment.courseId });
      return {
        userId: assignment.userId,
        employeeName: user?.name || assignment.userId,
        team: user?.team || "",
        department: user?.department || "",
        courseId: assignment.courseId,
        courseTitle: course?.title || assignment.courseId,
        progress: assignment.progress || 0,
        chapterTimeSeconds: chapterSeconds,
        assessmentTimeSeconds: assessmentSeconds,
        courseTimeSeconds: assignment.timeSpentSeconds || 0,
        chapterTimeSpentSeconds: assignment.chapterTimeSpentSeconds || {}
      };
    });
  }

  return [];
};
