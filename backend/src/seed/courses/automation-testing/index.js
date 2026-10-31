// Course 6: Test Automation Engineering Masterclass
// Aggregator module for all 5 phases (32 chapters, 32 assessments, 320 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const automationTestingCourse = {
  id: "CRS-AUT-001",
  title: "Test Automation Engineering: Playwright, Selenium, API & SDET Architecture",
  description: "Comprehensive 32-chapter masterclass from automation economics to enterprise SDET platforms. Covers Testing Pyramid, Locator resilience (CSS, XPath, ARIA), Selenium WebDriver 4 (W3C protocol, Selenium Manager), Dynamic Synchronization & Waits, Page Object Model (POM), JUnit 5 / TestNG parallel execution, Playwright Architecture (BrowserContexts, Auto-waiting, UI mode, Codegen), Network Interception & HAR Replay, Playwright Tracing, Cypress architecture & trade-offs, Component Testing, REST Assured BDD DSL, JSON Schema Validation & Jackson POJOs, OAuth 2.0 & Token Managers, Consumer-Driven Contract Testing with Pact, Service Virtualization with WireMock, GraphQL Automation & Newman CLI, Appium 2.0 Mobile Automation, W3C Touch Gestures, BDD Cucumber with PicoContainer, Selenium Grid 4 & Docker scaling, Performance Testing with k6, Apache JMeter Enterprise Load Testing, GitHub Actions Continuous Testing, Visual AI Regression (Applitools/Percy), Flaky Test Quarantine & Self-Healing, OWASP ZAP Security automation, Test Data Management & Testcontainers, Enterprise E-Commerce Capstone Suite, and SDET System Design & Technical Interviews.",
  skill: "Test Automation Engineering",
  skillIds: ["SKILL-WEB-AUTOMATION", "SKILL-API-CONTRACT-TESTING", "SKILL-SDET-PLATFORMS"],
  targetLevel: "Advanced",
  prerequisites: ["CRS-MNT-001"],
  category: "Quality Assurance & Testing",
  tags: [
    "Test Automation",
    "SDET",
    "Playwright",
    "Selenium WebDriver",
    "Cypress",
    "REST Assured",
    "Appium",
    "Cucumber BDD",
    "Docker",
    "Selenium Grid",
    "k6",
    "JMeter",
    "Pact",
    "WireMock",
    "CI/CD"
  ],
  thumbnailColor: "#0284c7",
  ownerId: "EMP-1003",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 110,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const automationTestingSkills = [
  {
    id: "SKILL-WEB-AUTOMATION",
    name: "Web Test Automation Engineering",
    category: "Technical",
    description: "Modern browser automation architectures with Microsoft Playwright, Selenium WebDriver 4, Cypress, Page Object Model, and resilient selector strategies.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-API-CONTRACT-TESTING",
    name: "API & Contract Automation",
    category: "Technical",
    description: "Enterprise backend API test automation with REST Assured, JSON Schema validation, Consumer-Driven Contract Testing with Pact, and WireMock virtualization.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-SDET-PLATFORMS",
    name: "SDET Infrastructure & Performance",
    category: "Technical",
    description: "Mobile Appium 2.0 automation, Cucumber BDD frameworks, distributed Selenium Grid 4 Docker scaling, k6 load testing, and CI/CD quality gates.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const automationTestingChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const automationTestingAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

