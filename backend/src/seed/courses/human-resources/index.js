// Course 16: Human Resources Operations & Generalist Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const humanResourcesCourse = {
  id: "CRS-HRO-001",
  title: "Human Resources Operations & People Generalist Masterclass: Talent Lifecycle, Labor Compliance, HRIS & People Analytics",
  description: "Elite-level 30-chapter masterclass covering the modern People Operations mandate: Dave Ulrich's HR Business Partner model and SHRM/HRCI competencies; strategic workforce planning and job architecture; passive talent sourcing and employer value propositions (EVP); structured behavioral interviewing and bias mitigation; FCRA background checks, reference checking, and offer structuring; 30-60-90 day onboarding roadmaps; federal and state wage compliance (FLSA duties tests, salary basis, overtime calculation); Title VII, ADA interactive accommodation, ADEA, and EEO-1 reporting; leaves of absence (FMLA administration, military caregiver, and paid family leaves); OSHA compliance (Forms 300/301/300A, ergonomics, and workers' compensation); Form I-9, E-Verify, and global immigration sponsorship (H-1B, L-1, TN); employee handbook drafting and NLRA Section 7 concerted activity protections; total rewards philosophy (salary bands, Hay point-factors, compa-ratio, and pay transparency); variable pay (annual STI bonus modifiers, sales OTE/accelerators, and equity ISOs vs. RSUs); employee benefits administration (HDHP/PPO medical tiers, HSA/FSA, ERISA fiduciary governance, COBRA, and Safe Harbor 401k); payroll operations, tax withholdings (W-4, W-2, 1099), and multi-state nexus; modern performance management (OKRs, 360 reviews, and calibration sessions); progressive discipline and defensible Performance Improvement Plans (PIPs); employee relations conflict mediation and managing toxic performers; forensic workplace investigations (Faragher-Ellerth defense, EEOC credibility standards, and investigative reporting); involuntary offboarding, reductions in force (WARN Act), and OWBPA severance releases; HRIS ecosystem architecture (Workday, BambooHR, SCIM, and EDI 834 carrier feeds); People Analytics dashboards (turnover formulas, cohort curves, and predictive flight risk scoring); Diversity, Equity, Inclusion & Belonging (Mansfield rule, blind resume reviews, and ERGs); remote and global workforce operations (PEO vs. EOR, permanent establishment, and asynchronous culture); learning and organizational development (ADDIE framework and Kirkpatrick Levels 1-4); retention strategy and stay interviews; crisis management, continuity, and workplace psychological safety; the Project Apex Scale enterprise capstone (scaling HR from 100 to 1,000 employees); and Senior People Leader career blueprints with SHRM-CP and PHR exam mastery.",
  skill: "Human Resources & People Operations",
  skillIds: [
    "SKILL-HRO-TALENT-LIFECYCLE",
    "SKILL-HRO-COMPLIANCE-RELATIONS",
    "SKILL-HRO-COMPENSATION-ANALYTICS"
  ],
  targetLevel: "Comprehensive",
  prerequisites: [],
  category: "Human Resources & Operations",
  tags: [
    "Human Resources",
    "People Operations",
    "FLSA",
    "FMLA",
    "Title VII",
    "Form I-9",
    "Total Rewards",
    "ERISA",
    "HRIS Workday",
    "People Analytics",
    "WARN Act",
    "SHRM-CP",
    "PHR"
  ],
  thumbnailColor: "#DC2626",
  ownerId: "EMP-1001",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const humanResourcesSkills = [
  {
    id: "SKILL-HRO-TALENT-LIFECYCLE",
    name: "Talent Acquisition, Onboarding & Employee Lifecycle Operations",
    category: "Human Resources",
    description: "End-to-end talent lifecycle leadership: strategic workforce planning, job architecture and descriptions, proactive sourcing and employer branding, structured STAR behavioral interviewing, FCRA background screening, offer modeling, and high-impact 30-60-90 day onboarding frameworks.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-HRO-COMPLIANCE-RELATIONS",
    name: "Labor Law Compliance, Statutory Governance & Employee Relations",
    category: "Human Resources",
    description: "Deep statutory expertise in FLSA wage and hour compliance (duties and salary basis tests), Title VII, ADA interactive accommodations, ADEA, FMLA leave administration, OSHA incident logging, Form I-9 and E-Verify audit readiness, employee handbook architecture, conflict mediation, forensic workplace investigations (EEOC credibility), and WARN Act / OWBPA reductions in force.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-HRO-COMPENSATION-ANALYTICS",
    name: "Total Rewards, Performance Systems & People Analytics",
    category: "Human Resources",
    description: "Operational mastery of market salary banding, compa-ratio modeling, executive variable pay, equity administration (Options vs. RSUs), group health plan design (HDHP/HSA), ERISA and COBRA governance, payroll operations and tax withholding, continuous OKR performance systems, progressive discipline PIPs, HRIS integration architecture (SCIM/EDI 834), and People Analytics dashboards.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const humanResourcesChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const humanResourcesAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

