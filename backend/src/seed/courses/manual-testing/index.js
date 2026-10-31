// Course 5: Manual Testing & Quality Engineering Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const manualTestingCourse = {
  id: "CRS-MNT-001",
  title: "Manual Testing & Quality Assurance: From Fundamentals to ISTQB Mastery",
  description: "Comprehensive 30-chapter masterclass covering quality foundations, SDLC/STLC, Verification vs Validation, RTM, Black-Box Test Design (EP, BVA, Decision Tables, State Transitions, Use Cases), Exploratory Testing (SBTM), Defect Lifecycle & RCA, Telemetry & HAR debugging, TestRail/Zephyr execution cycles, Usability & Cross-Browser Matrices, WCAG 2.2 Accessibility with NVDA/VoiceOver, Chrome DevTools, Manual Postman API testing, SQL Database Verification, Mobile Testing with ADB, OWASP Security validation, L10n/G11n, Agile Scrum (Three Amigos, BDD Gherkin), CI/CD Quality Gates, Regulated Auditing (HIPAA, SOX, GDPR), Enterprise FinTech Capstone, and ISTQB CTFL Certification mastery.",
  skill: "Manual Testing & QA",
  skillIds: ["SKILL-MANUAL-TESTING", "SKILL-TEST-MANAGEMENT", "SKILL-SPECIALIZED-TESTING"],
  targetLevel: "Intermediate",
  prerequisites: [],
  category: "Quality Assurance & Testing",
  tags: [
    "Manual Testing",
    "Quality Assurance",
    "ISTQB",
    "STLC",
    "Test Design",
    "Boundary Value Analysis",
    "Defect Management",
    "Postman API",
    "SQL Database Testing",
    "Mobile Testing",
    "Accessibility WCAG",
    "Security OWASP",
    "Agile Scrum",
    "Zephyr",
    "TestRail"
  ],
  thumbnailColor: "#059669",
  ownerId: "EMP-1002",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const manualTestingSkills = [
  {
    id: "SKILL-MANUAL-TESTING",
    name: "Manual Testing & QA Fundamentals",
    category: "Technical",
    description: "Quality engineering principles, SDLC/STLC models, requirements ambiguity analysis, RTM, and black-box test design techniques (EP, BVA, Decision Tables, State Transition).",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-TEST-MANAGEMENT",
    name: "Defect Triage & Test Management",
    category: "Technical",
    description: "Defect lifecycle state machines, telemetry capture (HAR, video, console), TestRail/Zephyr test cycles, root cause analysis (5 Whys), and executive release sign-off.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-SPECIALIZED-TESTING",
    name: "Specialized & Compliance Testing",
    category: "Technical",
    description: "Manual Postman API testing, SQL data integrity audits, mobile ADB debugging, WCAG 2.2 accessibility, OWASP security basics, and regulatory compliance (HIPAA, SOX, GDPR).",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const manualTestingChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const manualTestingAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

