import crypto from "node:crypto";
import { signCertificatePayload, verifyCertificateSignature, buildLinkedInShareUrl } from "./signatures.js";
import { assignments, attempts } from "../../core.js";
import { ENROLLMENT_STATUS } from "../enrollments/progress.service.js";
import { getCertificateIssuanceApprovalRole } from "../../config.js";
import { canIssueCertificate, canManageCourseResource, certificateEligibility } from "../../security/authorization.js";

const roleApproved = (actor, role) => actor?.role === role
  || (actor?.role === "Super Admin" && role === "Admin");
const nextId = () => `NLD-CERT-${new Date().getFullYear()}-${crypto.randomBytes(16).toString("hex").toUpperCase()}`;
const repositoryFailure = (error) => {
  if (error?.code === "ENROLLMENT_NOT_FOUND" || error?.code === "CERTIFICATE_NOT_FOUND") {
    return { status: 404, error: error.message };
  }
  if (error?.code === "NOT_ELIGIBLE") return { status: 403, error: error.message };
  if (error?.code === "EVIDENCE_CHANGED") return { status: 409, error: error.message };
  throw error;
};

export function createCertificatesService({ repo, audit, now }) {
  const issueContext = async (actor, data) => {
    const course = await repo.findCourse(data.courseId);
    if (!course) return { status: 404, error: "Course not found" };
    if (!canManageCourseResource(actor, course)) {
      return { status: 403, error: "Certificate issuance is not authorized" };
    }
    const approvalRole = getCertificateIssuanceApprovalRole();
    if (!approvalRole) return { status: 503, error: "Certificate issuance approval role is not configured" };
    if (!roleApproved(actor, approvalRole)) {
      return { status: 403, error: "Certificate issuance is not authorized" };
    }
    const employee = await repo.findUser(data.employeeId);
    if (!employee) return { status: 404, error: "Employee not found" };
    return { status: 200, employee, course, approvalRole };
  };

  const build = ({ actor, employee, course, attempt, data = {} }) => {
    const id = nextId();
    const cert = {
      id, certificateId: id, employeeId: employee.id,
      recipientName: employee.name, recipientEmail: employee.email,
      courseId: course.id, courseTitle: course.title,
      attemptId: attempt?.id || data.attemptId || null,
      title: data.title || "Certificate of Professional Mastery",
      template: data.template || "Executive",
      accent: data.accent || course.thumbnailColor || "#0f766e",
      duration: data.duration || `${course.estimatedHours || 10} Hours`,
      subtitle: data.subtitle || `Demonstrating verified proficiency in ${course.skill || course.title}`,
      footer: data.footer || "Issued under the authority of Nalanda Academic Board",
      issuedBy: actor.id, issuedByName: actor.name || "Nalanda Academic Board",
      issuedAt: now(),
      proctoringVerified: Boolean(attempt && attempt.status === "Passed" && (attempt.trustScore ?? 100) >= 70),
      examScore: attempt?.score ?? null,
      verificationUrl: `/verify/${id}`,
      signatureVersion: 2,
      status: "Active",
    };
    cert.signature = signCertificatePayload(cert);
    cert.linkedinShareUrl = buildLinkedInShareUrl({
      certificateId: id, recipientName: cert.recipientName,
      courseTitle: cert.courseTitle, issuedAt: cert.issuedAt, certUrl: cert.verificationUrl,
    });
    return cert;
  };

  const listForUser = async (user) => {
    if (repo.isRelational) return repo.listForUser(user);
    let visible = repo.all();
    if (user.role === "Manager") {
      const teamIds = repo.teamMemberIds(user.id);
      visible = visible.filter((cert) => cert.employeeId === user.id || teamIds.has(cert.employeeId));
    } else if (user.role === "Instructor") {
      visible = visible.filter((cert) => cert.employeeId === user.id || repo.findCourse(cert.courseId)?.ownerId === user.id);
    } else if (["Employee", "Learner"].includes(user.role)) {
      visible = visible.filter((cert) => cert.employeeId === user.id);
    }
    return visible;
  };

  const issue = async (actor, data) => {
    const context = await issueContext(actor, data);
    if (context.error) return context;
    const { employee, course, approvalRole } = context;
    let eligibility;
    if (repo.isRelational) {
      eligibility = await repo.resolveEligibility({ employeeId: employee.id, courseId: course.id, attemptId: data.attemptId });
      if (!eligibility.eligible) return { status: eligibility.reason === "ENROLLMENT_NOT_FOUND" ? 404 : 403, error: "Verified completion is required before certificate issuance" };
    } else {
      if (!canIssueCertificate({ actor, recipientId: employee.id, course, attemptId: data.attemptId, approvalRole })) {
        return { status: 403, error: "Certificate issuance is not authorized or the learner is not eligible" };
      }
      eligibility = certificateEligibility({ recipientId: employee.id, courseId: course.id, attemptId: data.attemptId });
    }
    const cert = build({ actor, employee, course, attempt: eligibility.attempt, data });
    if (repo.isRelational) {
      try {
        const result = await repo.issueEligible({ certificate: cert, automatic: false });
        return { status: result.created ? 201 : 200, data: result.certificate };
      } catch (error) {
        return repositoryFailure(error);
      }
    }
    repo.add(cert);
    audit(actor.id, "ISSUE_CERTIFICATE", "CERTIFICATE", cert.id, { employeeId: cert.employeeId, courseId: cert.courseId });
    return { status: 201, data: cert };
  };

  const verify = async (id) => {
    const cert = repo.isRelational ? await repo.findById(id) : repo.all().find((item) => (item.id || item.certificateId) === id);
    if (!cert) return { status: 404, error: "Certificate ID not found" };
    const isValidSignature = verifyCertificateSignature(cert);
    const isActive = (cert.status || "Active") === "Active";
    const recipient = cert.recipientName ? null : await repo.findUser(cert.employeeId);
    const course = cert.courseTitle ? null : await repo.findCourse(cert.courseId);
    const publicData = {
      certificateId: cert.id || cert.certificateId,
      recipientName: cert.recipientName || recipient?.name || "Certified Scholar",
      courseTitle: cert.courseTitle || course?.title || "Verified Specialization",
      issuingAuthority: cert.issuedByName || "Nalanda Academic Board",
      issuedAt: cert.issuedAt, duration: cert.duration, examScore: cert.examScore,
      proctoringVerified: Boolean(cert.proctoringVerified), status: cert.status || "Active",
      revokedAt: cert.revokedAt || null, revocationReason: cert.revocationReason || null,
      isValidSignature, signatureVersion: Number(cert.signatureVersion || 1),
      verificationUrl: `/verify/${cert.id || cert.certificateId}`,
      linkedinShareUrl: cert.linkedinShareUrl || buildLinkedInShareUrl({
        certificateId: cert.id || cert.certificateId, recipientName: cert.recipientName,
        courseTitle: cert.courseTitle, issuedAt: cert.issuedAt,
      }),
      signatureHash: cert.signature || null,
    };
    return { status: 200, data: { verified: isActive && isValidSignature, isActive, isValidSignature, certificate: publicData } };
  };

  const autoIssueCredential = async ({ userId, courseId, attemptId = null }) => {
    if (!repo.isRelational) {
      const existing = repo.all().find((cert) => cert.employeeId === userId && cert.courseId === courseId && (cert.status || "Active") === "Active");
      if (existing) return { status: 200, data: existing };
    }
    const employee = await repo.findUser(userId);
    const course = await repo.findCourse(courseId);
    if (!employee || !course) return { status: 404, error: "Enrollment subject or course not found" };
    let attempt;
    if (repo.isRelational) {
      const eligibility = await repo.resolveEligibility({ employeeId: userId, courseId, attemptId, automatic: true });
      if (!eligibility.eligible) return { status: 403, error: "A passed assessment attempt is required" };
      attempt = eligibility.attempt;
    } else {
      attempt = attemptId
        ? attempts.find((item) => item.id === attemptId && item.userId === userId && item.courseId === courseId && item.status === "Passed")
        : attempts.find((item) => item.userId === userId && item.courseId === courseId && item.status === "Passed");
      if (!attempt) return { status: 403, error: "A passed assessment attempt is required" };
    }
    const actor = { id: course.ownerId, name: "Nalanda Academic Board" };
    const cert = build({ actor, employee, course, attempt, data: { attemptId } });
    if (repo.isRelational) {
      try {
        const result = await repo.issueEligible({ certificate: cert, automatic: true });
        return { status: result.created ? 201 : 200, data: result.certificate };
      } catch (error) {
        return repositoryFailure(error);
      }
    }
    repo.add(cert);
    const assignment = assignments.find((item) => item.courseId === courseId && item.userId === userId);
    if (assignment) {
      assignment.certificateId = cert.id;
      assignment.status = ENROLLMENT_STATUS.CERTIFIED;
      assignment.completedAt = assignment.completedAt || now();
    }
    audit(userId, "AUTO_ISSUE_CERTIFICATE", "CERTIFICATE", cert.id, { courseId, attemptId: attempt.id });
    return { status: 201, data: cert };
  };

  const revoke = async (actor, id, reason) => {
    const cert = repo.isRelational ? await repo.findById(id) : repo.all().find((item) => (item.id || item.certificateId) === id);
    if (!cert) return { status: 404, error: "Certificate ID not found" };
    const course = await repo.findCourse(cert.courseId);
    if (!course || !canManageCourseResource(actor, course)) return { status: 403, error: "Forbidden" };
    if (repo.isRelational) {
      try {
        return { status: 200, data: await repo.revoke({ certificateId: id, actorId: actor.id, reason }) };
      } catch (error) {
        return repositoryFailure(error);
      }
    }
    if ((cert.status || "Active") !== "Revoked") {
      Object.assign(cert, { status: "Revoked", revokedBy: actor.id, revokedAt: now(), revocationReason: reason });
      const assignment = assignments.find((item) => item.userId === cert.employeeId && item.courseId === cert.courseId);
      if (assignment?.certificateId === cert.id) {
        assignment.certificateId = null;
        assignment.status = ENROLLMENT_STATUS.PASSED;
      }
      audit(actor.id, "REVOKE_CERTIFICATE", "CERTIFICATE", cert.id, { reason });
    }
    return { status: 200, data: cert };
  };

  const authorizeIssue = async (actor, data) => {
    const result = await issueContext(actor, data);
    return result.error ? { status: result.status, error: result.error } : { status: 200 };
  };

  return { listForUser, authorizeIssue, issue, verify, autoIssueCredential, revoke };
}
