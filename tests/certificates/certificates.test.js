import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../backend/server.js";
import {
  courses,
  assessments,
  assignments,
  attempts,
  issuedCertificates,
  users,
  now,
} from "../../backend/src/core.js";
import {
  signCertificatePayload,
  verifyCertificateSignature,
  buildLinkedInShareUrl,
} from "../../backend/src/modules/certificates/signatures.js";
import { testUsers, getCsrfPair, authCookieFor, stepUpCookieFor } from "../helpers/auth.js";

describe("Sprint 10: Cryptographic Certificates & Public QR Verification", () => {
  let csrf;
  const courseId = "CRS-SPRINT10-BLOCKCHAIN";
  const assessmentId = "ASM-S10-EXAM";
  let sampleCertId;
  const autoCourseId = "CRS-S10-AUTO-ISSUE";
  const autoAssessmentId = "ASM-S10-AUTO-ISSUE";

  const graduate = {
    id: "EMP-S10-GRADUATE",
    role: "Learner",
    name: "Arya Stark",
    email: "arya@nalanda.edu",
    status: "Active",
  };
  const faculty = {
    id: "EMP-S10-FACULTY",
    role: "Instructor",
    name: "Dean Syrio",
    email: "syrio@nalanda.edu",
    status: "Active",
  };

  beforeAll(async () => {
    process.env.CERTIFICATE_ISSUANCE_APPROVAL_ROLE = "Admin";
    csrf = await getCsrfPair();

    if (!users.some((u) => u.id === graduate.id)) users.push(graduate);
    if (!users.some((u) => u.id === faculty.id)) users.push(faculty);

    courses.push({
      id: courseId,
      title: "Sprint 10 Applied Cryptography & Distributed Systems",
      status: "Active",
      approval: "Approved",
      ownerId: faculty.id,
      estimatedHours: 24,
      thumbnailColor: "#0ea5e9",
      priceCents: 0,
      isFree: true,
      createdAt: now(),
      updatedAt: now(),
    });

    assessments.push({
      id: assessmentId,
      courseId,
      title: "Cryptographic Engineering Certification Screening",
      type: "MCQ",
      approval: "Approved",
      status: "Active",
      durationMinutes: 20,
      passScore: 70,
      ownerId: faculty.id,
      questions: [
        {
          id: "Q-CERT-01",
          type: "MCQ",
          prompt: "Which curve is widely utilized in EdDSA digital signatures?",
          options: ["Curve25519 / Ed25519", "secp256k1", "NIST P-256", "RSA-4096"],
          answer: 0,
          points: 100,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });

    courses.push({
      id: autoCourseId,
      title: "Sprint 10 Auto-Issued Quantum Security Specialization",
      status: "Active",
      approval: "Approved",
      ownerId: faculty.id,
      estimatedHours: 40,
      thumbnailColor: "#10b981",
      priceCents: 0,
      isFree: true,
      createdAt: now(),
      updatedAt: now(),
    });

    assessments.push({
      id: autoAssessmentId,
      courseId: autoCourseId,
      title: "Quantum Security Screening",
      type: "MCQ",
      approval: "Approved",
      status: "Active",
      durationMinutes: 20,
      passScore: 70,
      ownerId: faculty.id,
      questions: [
        {
          id: "Q-AUTO-01",
          type: "MCQ",
          prompt: "Which protocol provides post-quantum key encapsulation?",
          options: ["ML-KEM / Kyber", "RSA-2048", "Diffie-Hellman", "DES"],
          answer: 0,
          points: 100,
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    });

    assignments.push({
      id: "ENR-S10-002",
      courseId: autoCourseId,
      userId: graduate.id,
      assignedBy: faculty.id,
      status: "AssessmentEligible",
      progress: 100,
      completedChapters: [],
      timeSpentSeconds: 6000,
      timeSpentMinutes: 100,
      chapterTimeSpentSeconds: {},
      startedAt: now(),
      completedAt: null,
      createdAt: now(),
    });

    assignments.push({
      id: "ENR-S10-001",
      courseId,
      userId: graduate.id,
      assignedBy: faculty.id,
      status: "Passed",
      progress: 100,
      completedChapters: [],
      timeSpentSeconds: 5000,
      timeSpentMinutes: 83,
      chapterTimeSpentSeconds: {},
      startedAt: now(),
      completedAt: null,
      createdAt: now(),
    });
  });

  describe("1. Cryptographic Digital Signature & Tamper Detection", () => {
    it("Signs a canonical certificate payload and verifies successfully", () => {
      const rawCert = {
        id: "NLD-CERT-2026-TEST-001",
        employeeId: graduate.id,
        recipientName: graduate.name,
        courseId,
        courseTitle: "Applied Cryptography",
        issuedAt: "2026-10-30T09:00:00.000Z",
        proctoringVerified: true,
      };

      const sig = signCertificatePayload(rawCert);
      expect(sig).toMatch(/^[a-f0-9]{64}$/); // 64-char SHA256 hex string

      rawCert.signature = sig;
      const valid = verifyCertificateSignature(rawCert);
      expect(valid).toBe(true);
    });

    it("Tampering with recipient name or course title fails cryptographic signature verification", () => {
      const legitCert = {
        id: "NLD-CERT-2026-LEGIT",
        employeeId: graduate.id,
        recipientName: "Arya Stark",
        courseId,
        courseTitle: "Applied Cryptography",
        issuedAt: "2026-10-30T09:00:00.000Z",
        proctoringVerified: true,
      };

      const validSig = signCertificatePayload(legitCert);
      legitCert.signature = validSig;

      // Impersonator alters the recipient name
      const forgedCert = {
        ...legitCert,
        recipientName: "Fraudulent Impersonator",
      };

      const check = verifyCertificateSignature(forgedCert);
      expect(check).toBe(false);
    });

    it("Version 2 signatures bind assessment evidence while legacy signatures remain verifiable", () => {
      const credential = {
        id: "NLD-CERT-2026-V2-EVIDENCE",
        signatureVersion: 2,
        employeeId: graduate.id,
        recipientName: graduate.name,
        recipientEmail: graduate.email,
        courseId,
        courseTitle: "Applied Cryptography",
        attemptId: "ATTEMPT-EVIDENCE-1",
        title: "Certificate of Cryptographic Mastery",
        duration: "24 Hours",
        subtitle: "Verified completion",
        footer: "Nalanda Academic Board",
        issuedBy: testUsers.admin.id,
        issuedByName: testUsers.admin.name,
        issuedAt: "2026-11-03T09:00:00.000Z",
        proctoringVerified: true,
        examScore: 92,
      };
      credential.signature = signCertificatePayload(credential);
      expect(verifyCertificateSignature(credential)).toBe(true);
      expect(verifyCertificateSignature({ ...credential, examScore: 99 })).toBe(false);
      expect(verifyCertificateSignature({ ...credential, attemptId: "ATTEMPT-SWAPPED" })).toBe(false);

      const legacy = { ...credential, signatureVersion: 1 };
      legacy.signature = signCertificatePayload(legacy);
      expect(verifyCertificateSignature(legacy)).toBe(true);
    });
  });

  describe("2. Public Verification Portal (Zero Auth Required)", () => {
    beforeAll(async () => {
      // Issue a certificate via Admin API
      const res = await request(app)
        .post("/api/certificates")
        .set("Cookie", [csrf.cookie, authCookieFor(testUsers.admin), stepUpCookieFor(testUsers.admin)])
        .set("x-csrf-token", csrf.token)
        .send({
          employeeId: graduate.id,
          courseId,
          title: "Certificate of Cryptographic Mastery",
        });

      sampleCertId = res.body.data.id;
    });

    it("Public client verifies certificate without authentication token or CSRF", async () => {
      const res = await request(app).get(`/api/certificates/verify/${sampleCertId}`);

      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.isValidSignature).toBe(true);

      const cert = res.body.certificate;
      expect(cert.certificateId).toBe(sampleCertId);
      expect(cert.recipientName).toBe(graduate.name);
      expect(cert.courseTitle).toContain("Cryptography");
      expect(cert.signatureHash).toBeDefined();
      expect(cert.linkedinShareUrl).toContain("linkedin.com/profile/add");
    });

    it("Public client receives 404 for non-existent certificate ID", async () => {
      const res = await request(app).get("/api/certificates/verify/NLD-CERT-INVALID-999");

      expect(res.status).toBe(404);
      expect(res.body.error).toContain("not found");
    });

    it("Revokes with step-up and makes public verification fail closed", async () => {
      const revokeRes = await request(app)
        .post(`/api/certificates/${sampleCertId}/revoke`)
        .set("Cookie", [csrf.cookie, authCookieFor(testUsers.admin), stepUpCookieFor(testUsers.admin)])
        .set("x-csrf-token", csrf.token)
        .send({ reason: "Confirmed credential issuance error" });

      expect(revokeRes.status).toBe(200);
      expect(revokeRes.body.data).toMatchObject({
        id: sampleCertId,
        status: "Revoked",
        revocationReason: "Confirmed credential issuance error",
      });

      const verifyRes = await request(app).get(`/api/certificates/verify/${sampleCertId}`);
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body).toMatchObject({
        verified: false,
        isActive: false,
        isValidSignature: true,
        certificate: {
          certificateId: sampleCertId,
          status: "Revoked",
          revocationReason: "Confirmed credential issuance error",
        },
      });
    });
  });

  describe("3. LinkedIn Credential Share Integration", () => {
    it("Generates valid pre-filled LinkedIn certification URL", () => {
      const url = buildLinkedInShareUrl({
        certificateId: "NLD-CERT-2026-XYZ",
        recipientName: "Arya Stark",
        courseTitle: "Autonomous Defense",
        issuedAt: "2026-10-30T09:00:00.000Z",
      });

      expect(url).toContain("https://www.linkedin.com/profile/add");
      expect(url).toContain("name=Autonomous+Defense");
      expect(url).toContain("organizationName=Nalanda+Institute");
      expect(url).toContain("certId=NLD-CERT-2026-XYZ");
    });
  });

  describe("4. Automatic Issuance upon Passing Proctored Screening Exam", () => {
    it("Passing screening exam automatically issues signed certificate and updates enrollment", async () => {
      // Start exam attempt
      const startRes = await request(app)
        .post(`/api/assessments/${autoAssessmentId}/attempts/start`)
        .set("Cookie", [csrf.cookie, authCookieFor(graduate)])
        .set("x-csrf-token", csrf.token);

      const attemptId = startRes.body.data.id;
      expect(attemptId).toBeDefined();

      // Retrieve blind questions to find correct shuffled index for "Curve25519 / Ed25519"
      const qRes = await request(app)
        .get(`/api/assessments/attempts/${attemptId}/questions`)
        .set("Cookie", authCookieFor(graduate));

      const q = qRes.body.data.questions[0];
      const correctIdx = q.options.indexOf("ML-KEM / Kyber");
      expect(correctIdx).toBeGreaterThanOrEqual(0);

      // Submit attempt with correct answer
      const submitRes = await request(app)
        .post(`/api/assessments/attempts/${attemptId}/submit`)
        .set("Cookie", [csrf.cookie, authCookieFor(graduate)])
        .set("x-csrf-token", csrf.token)
        .send({
          answers: { [q.id]: correctIdx },
        });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.data.score).toBe(100);
      expect(submitRes.body.data.status).toBe("Passed");

      // Verify certificate was automatically generated in issuedCertificates
      const autoCert = issuedCertificates.find(
        (c) => c.employeeId === graduate.id && c.courseId === autoCourseId
      );
      expect(autoCert).toBeDefined();
      expect(autoCert.id).toMatch(/^NLD-CERT-\d{4}-[A-F0-9]{8}$/);
      expect(autoCert.signature).toBeDefined();
      expect(verifyCertificateSignature(autoCert)).toBe(true);

      // Verify candidate enrollment was promoted to Certified
      const assignment = assignments.find(
        (a) => a.courseId === autoCourseId && a.userId === graduate.id
      );
      expect(assignment.status).toBe("Certified");
      expect(assignment.certificateId).toBe(autoCert.id);
    });
  });
});
