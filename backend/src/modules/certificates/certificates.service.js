// Service: Cryptographic Certificate Management, Public Verification, and Auto-Issuance.
import crypto from "node:crypto";
import { signCertificatePayload, verifyCertificateSignature, buildLinkedInShareUrl } from "./signatures.js";
import { assignments, attempts } from "../../core.js";
import { ENROLLMENT_STATUS } from "../enrollments/progress.service.js";
import { getCertificateIssuanceApprovalRole } from "../../config.js";
import { canIssueCertificate, certificateEligibility } from "../../security/authorization.js";

export function createCertificatesService({ repo, audit, now }) {
  const listForUser = (user) => {
    let visible = repo.all();
    if (user.role === "Manager") {
      const teamIds = repo.teamMemberIds(user.id);
      visible = visible.filter((cert) => cert.employeeId === user.id || teamIds.has(cert.employeeId));
    } else if (user.role === "Instructor") {
      const ownedCourseIds = new Set(
        repo.all().map((cert) => cert.courseId).filter((cid) => {
          const c = repo.findCourse(cid);
          return c && c.ownerId === user.id;
        })
      );
      visible = visible.filter((cert) => cert.employeeId === user.id || ownedCourseIds.has(cert.courseId));
    } else if (user.role === "Employee" || user.role === "Learner") {
      visible = visible.filter((cert) => cert.employeeId === user.id);
    }
    return visible;
  };

  const issue = (actor, data) => {
    const employee = repo.findUser(data.employeeId);
    const course = repo.findCourse(data.courseId);
    if (!employee || !course) return { status: 404, error: "Employee or Course not found" };
    const approvalRole = getCertificateIssuanceApprovalRole();
    if (!approvalRole) return { status: 503, error: "Certificate issuance approval role is not configured" };
    if (!canIssueCertificate({
      actor,
      recipientId: employee.id,
      course,
      attemptId: data.attemptId,
      approvalRole,
    })) {
      return { status: 403, error: "Certificate issuance is not authorized or the learner is not eligible" };
    }
    const eligibility = certificateEligibility({ recipientId: employee.id, courseId: course.id, attemptId: data.attemptId });
    const verifiedAttempt = eligibility.attempt;

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
      title: data.title || "Certificate of Professional Mastery",
      template: data.template || "Executive",
      accent: data.accent || course.thumbnailColor || "#0f766e",
      duration: data.duration || `${course.estimatedHours || 10} Hours`,
      subtitle: data.subtitle || `Demonstrating verified proficiency in ${course.skill || course.title}`,
      footer: data.footer || "Issued under the authority of Nalanda Academic Board",
      issuedBy: actor.id,
      issuedByName: actor.name || "Nalanda Academic Board",
      issuedAt: now(),
      proctoringVerified: Boolean(verifiedAttempt && verifiedAttempt.status === "Passed" && (verifiedAttempt.trustScore ?? 100) >= 70),
      examScore: verifiedAttempt?.score ?? null,
      verificationUrl: `/verify/${certId}`,
    };

    cert.signature = signCertificatePayload(cert);
    cert.linkedinShareUrl = buildLinkedInShareUrl({
      certificateId: cert.id,
      recipientName: cert.recipientName,
      courseTitle: cert.courseTitle,
      issuedAt: cert.issuedAt,
      certUrl: cert.verificationUrl,
    });

    repo.add(cert);
    audit(actor.id, "ISSUE_CERTIFICATE", "CERTIFICATE", cert.id, {
      employeeId: cert.employeeId,
      courseId: cert.courseId,
      signature: cert.signature,
    });

    return { status: 201, data: cert };
  };

  const verify = (certificateId) => {
    const cert = repo.all().find((c) => (c.id || c.certificateId) === certificateId);
    if (!cert) {
      return { status: 404, error: "Certificate ID not found" };
    }

    const isValidSignature = verifyCertificateSignature(cert);

    // Return sanitized public credential view (never leak private employee IDs or internal notes)
    const publicData = {
      certificateId: cert.id || cert.certificateId,
      recipientName: cert.recipientName || repo.findUser(cert.employeeId)?.name || "Certified Scholar",
      courseTitle: cert.courseTitle || repo.findCourse(cert.courseId)?.title || "Verified Specialization",
      issuingAuthority: cert.issuedByName || "Nalanda Academic Board",
      issuedAt: cert.issuedAt,
      duration: cert.duration,
      examScore: cert.examScore,
      proctoringVerified: !!cert.proctoringVerified,
      isValidSignature,
      verificationUrl: `/verify/${cert.id || cert.certificateId}`,
      linkedinShareUrl: cert.linkedinShareUrl || buildLinkedInShareUrl({
        certificateId: cert.id || cert.certificateId,
        recipientName: cert.recipientName,
        courseTitle: cert.courseTitle,
        issuedAt: cert.issuedAt,
      }),
      signatureHash: cert.signature || null,
    };

    return {
      status: 200,
      data: {
        verified: true,
        isValidSignature,
        certificate: publicData,
      },
    };
  };

  const autoIssueCredential = ({ userId, courseId, attemptId = null }) => {
    const existing = repo.all().find((c) => c.employeeId === userId && c.courseId === courseId);
    if (existing) {
      return existing;
    }

    const employee = repo.findUser(userId);
    const course = repo.findCourse(courseId);
    if (!employee || !course) return null;

    const attempt = attemptId
      ? attempts.find((a) => a.id === attemptId && a.userId === userId && a.courseId === courseId && a.status === "Passed")
      : attempts.find((a) => a.userId === userId && a.courseId === courseId && a.status === "Passed");
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
      proctoringVerified: Boolean(attempt && (attempt.trustScore ?? 100) >= 70),
      examScore: attempt?.score ?? null,
      verificationUrl: `/verify/${certId}`,
    };

    cert.signature = signCertificatePayload(cert);
    cert.linkedinShareUrl = buildLinkedInShareUrl({
      certificateId: cert.id,
      recipientName: cert.recipientName,
      courseTitle: cert.courseTitle,
      issuedAt: cert.issuedAt,
      certUrl: cert.verificationUrl,
    });

    repo.add(cert);

    // Update candidate enrollment status
    const assignment = assignments.find((a) => a.courseId === courseId && a.userId === userId);
    if (assignment) {
      assignment.certificateId = cert.id;
      assignment.status = ENROLLMENT_STATUS.CERTIFIED;
      assignment.completedAt = assignment.completedAt || now();
    }

    audit(userId, "AUTO_ISSUE_CERTIFICATE", "CERTIFICATE", cert.id, {
      courseId,
      examScore: cert.examScore,
      proctoringVerified: cert.proctoringVerified,
      signature: cert.signature,
    });

    return cert;
  };

  return { listForUser, issue, verify, autoIssueCredential };
}
