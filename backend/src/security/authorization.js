import { assessments, attempts, courses, candidateAssessments, assignments } from "../core.js";
import { isAdminRole } from "../roles.js";
import { attemptsRepository } from "../repositories/attempts.repository.pg.js";
import { upsertAttemptProjection } from "../attempt-projection.js";
import { assessmentAuthorityRepository } from "../repositories/assessment-authority.repository.pg.js";

const USE_PG_ATTEMPTS = process.env.USE_PG_ATTEMPTS === "1";
const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";
const USE_RELATIONAL_ATTEMPTS = USE_PG_ATTEMPTS || USE_PG_COURSES;

const assignedProctorId = (attempt) => (
  attempt?.assignedProctorId || attempt?.proctorId || attempt?.proctorUserId || null
);

export const resourcesForAttempt = (attempt) => {
  const assessment = assessments.find((item) => item.id === attempt?.assessmentId) || null;
  const course = courses.find((item) => item.id === (attempt?.courseId || assessment?.courseId)) || null;
  return { assessment, course };
};

export const canManageCourseResource = (user, course) => Boolean(
  user && course && (isAdminRole(user.role) || course.ownerId === user.id)
);

export const canControlProctoring = (user, attempt) => {
  if (!user || !attempt) return false;
  if (isAdminRole(user.role)) return true;
  const { assessment, course } = resourcesForAttempt(attempt);
  return assignedProctorId(attempt) === user.id
    || course?.ownerId === user.id
    || assessment?.ownerId === user.id;
};

export const canViewAttempt = (user, attempt) => Boolean(
  user && attempt && (attempt.userId === user.id || canControlProctoring(user, attempt))
);

export const canGradeAttempt = (user, attempt) => canControlProctoring(user, attempt);

export const canViewQuestionBank = (user) => isAdminRole(user?.role);

export const canViewCandidateAnalytics = (user, link, assessment = null) => {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  const resolvedAssessment = assessment
    || assessments.find((item) => item.id === link?.assessmentId)
    || null;
  const course = courses.find((item) => item.id === (link?.courseId || resolvedAssessment?.courseId));
  return link?.createdBy === user.id
    || resolvedAssessment?.ownerId === user.id
    || course?.ownerId === user.id;
};

export const canCreateCandidateAssessment = (user, assessment) => {
  if (!user || !assessment) return false;
  if (isAdminRole(user.role)) return true;
  const course = courses.find((item) => item.id === assessment.courseId);
  return assessment.ownerId === user.id || course?.ownerId === user.id;
};

export const certificateEligibility = ({ recipientId, courseId, attemptId = null }) => {
  const enrollment = assignments.find((item) => item.userId === recipientId && item.courseId === courseId);
  const attempt = attemptId
    ? attempts.find((item) => item.id === attemptId && item.userId === recipientId && item.courseId === courseId)
    : attempts.find((item) => item.userId === recipientId && item.courseId === courseId && item.status === "Passed");
  const completedEnrollment = Boolean(
    enrollment
    && ["Passed", "Certified", "Completed"].includes(enrollment.status)
  );
  const passedAttempt = Boolean(attempt && attempt.status === "Passed");
  return { eligible: completedEnrollment || passedAttempt, enrollment, attempt };
};

export const canIssueCertificate = ({ actor, recipientId, course, attemptId, approvalRole }) => {
  if (!actor || !course || !approvalRole) return false;
  const approved = actor.role === approvalRole
    || (actor.role === "Super Admin" && approvalRole === "Admin");
  if (!approved) return false;
  if (!canManageCourseResource(actor, course)) return false;
  return certificateEligibility({ recipientId, courseId: course.id, attemptId }).eligible;
};

const ATTEMPT_POLICIES = Object.freeze({
  view: canViewAttempt,
  control: canControlProctoring,
  grade: canGradeAttempt,
});

export const requireAttemptPermission = (permission) => {
  const policy = ATTEMPT_POLICIES[permission];
  if (!policy) throw new TypeError(`Unknown attempt permission: ${permission}`);
  return async (req, res, next) => {
    const attemptId = req.params.attemptId || req.body?.attemptId;
    try {
      const persisted = USE_RELATIONAL_ATTEMPTS
        ? await attemptsRepository.findById(attemptId)
        : attempts.find((item) => item.id === attemptId);
      if (!persisted) return res.status(404).json({ error: "Exam attempt not found" });
      let authorized = policy(req.user, persisted);
      if (!authorized && USE_PG_COURSES && ["view", "control", "grade"].includes(permission)) {
        authorized = await assessmentAuthorityRepository.canManageAssessment({
          id: persisted.assessmentId,
          actor: req.user,
        });
      }
      if (!authorized) return res.status(403).json({ error: "Forbidden" });
      if (USE_RELATIONAL_ATTEMPTS) upsertAttemptProjection(persisted);
      // Keep the request-scoped object detached from the compatibility mirror.
      // Mutations are projected only after a successful database commit.
      req.authorizedAttempt = persisted;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const findCandidateAssessment = (targetId) => candidateAssessments.find(
  (item) => item.id === targetId || item.token === targetId || item.assessmentId === targetId,
);
