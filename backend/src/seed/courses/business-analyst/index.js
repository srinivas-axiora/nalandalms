// Course 15: Business Analyst Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const businessAnalystCourse = {
  id: "CRS-BSA-001",
  title: "Business Analyst Masterclass: Strategy, Agile Requirements, BPMN Modeling & Valuation",
  description: "Elite-level 30-chapter masterclass covering the strategic and operational mandate of the modern enterprise Business Analyst: IIBA BABOK v3 knowledge areas and core competency framework; business analysis planning, monitoring, and stakeholder engagement; enterprise strategy analysis and gap assessment; requirements elicitation masterclasses across interviews, workshops, and observation; requirements lifecycle management, traceability matrices (RTM), and MoSCoW prioritization; root cause analysis via Ishikawa fishbone, 5 Whys, and Pareto analysis; BPMN 2.0 process modeling, gateways, events, and sub-processes; Agile requirements engineering with Epics, INVEST user stories, and acceptance criteria; Behavior-Driven Development (BDD), Specification by Example, and Gherkin living documentation; Non-Functional Requirements (NFRs) and FURPS+ architecture scoping; UML use cases, Jeff Patton's User Story Mapping, and Gojko Adzic's Impact Mapping; wireframing, clickable prototyping, and modern Functional Requirements Documents (FRD); relational SQL querying, window functions, and data migration reconciliation; conceptual and logical data modeling (ERDs, Crow's Foot notation, 3NF normalization); RESTful API integration analysis, OpenAPI contracts, webhooks, and HTTP status codes; business metrics, North Star metrics, OKRs, and executive dashboard design; financial valuation modeling including TCO, ROI, Net Present Value (NPV), and Internal Rate of Return (IRR); decision analysis using Decision Trees, EMV, and Multi-Criteria Decision Analysis (MCDA); stakeholder governance with Mendelow's Power-Interest matrix and RACI matrices; organizational change management via Prosci ADKAR and Kotter's 8-step framework; enterprise risk registers, probability-impact matrices, and FMEA modeling; User Acceptance Testing (UAT) day-in-the-life design, defect severity SLAs, and sign-off governance; COTS evaluation, RFP development, and scripted vendor demos; regulatory compliance engineering covering GDPR, SOX Section 404, PCI-DSS, and immutable audit logs; digital transformation and strangler fig architecture modernization; AI in business analysis including Celonis process mining and Generative AI workflows; enterprise business architecture capability modeling (BIZBOK); workshop facilitation mastery and principled negotiation; the Apex National Bank digital lending capstone; and Lead BA case interview preparation with the IIBA CBAP blueprint.",
  skill: "Business Analysis & Product Strategy",
  skillIds: [
    "SKILL-BSA-STRATEGY-ELICITATION",
    "SKILL-BSA-PROCESS-AGILE-MODELING",
    "SKILL-BSA-DATA-VALUATION-GOVERNANCE"
  ],
  targetLevel: "Comprehensive",
  prerequisites: [],
  category: "Business Analysis & Strategy",
  tags: [
    "Business Analyst",
    "BABOK v3",
    "BPMN 2.0",
    "Agile User Stories",
    "INVEST",
    "BDD Gherkin",
    "SQL Analytics",
    "ERD Modeling",
    "Financial Valuation",
    "Prosci ADKAR",
    "UAT Governance",
    "Process Mining"
  ],
  thumbnailColor: "#2563EB",
  ownerId: "EMP-1001",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const businessAnalystSkills = [
  {
    id: "SKILL-BSA-STRATEGY-ELICITATION",
    name: "Business Analysis Planning, Strategy & Requirements Elicitation",
    category: "Functional",
    description: "Mastery of IIBA BABOK v3 methodology, business analysis planning, enterprise current-to-future state gap analysis, requirements elicitation techniques (interviews, focus groups, workshops), requirements lifecycle management, traceability matrices (RTM), and root cause analysis (Ishikawa, Pareto, 5 Whys).",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-BSA-PROCESS-AGILE-MODELING",
    name: "Process Modeling (BPMN), Agile User Stories & Solution Design",
    category: "Functional",
    description: "Deep expertise in BPMN 2.0 formal workflow notation, Agile requirements engineering (Themes, Epics, INVEST stories), Behavior-Driven Development (BDD/Gherkin living documentation), Non-Functional Requirements (FURPS+), UML Use Cases, User Story Mapping, and Functional Requirements Documents (FRD).",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-BSA-DATA-VALUATION-GOVERNANCE",
    name: "Data Analytics, Business Valuation & Change Governance",
    category: "Functional",
    description: "Operational mastery of analytical SQL querying and data reconciliation, conceptual and logical data modeling (ERDs, 3NF), API integration contracts (REST/OpenAPI), financial valuation (ROI, NPV, IRR, TCO), decision science (MCDA, Decision Trees), stakeholder RACI governance, Prosci ADKAR change management, UAT execution, regulatory compliance (GDPR, SOX), and Celonis process mining.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const businessAnalystChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const businessAnalystAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

