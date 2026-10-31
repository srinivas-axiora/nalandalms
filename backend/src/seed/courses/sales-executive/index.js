import { phase1 } from './phase1.js';
import { phase2 } from './phase2.js';
import { phase3 } from './phase3.js';
import { phase4 } from './phase4.js';
import { phase5 } from './phase5.js';

export const salesExecutiveCourse = {
  id: "CRS-SLS-001",
  title: "Sales Executive Masterclass: Enterprise B2B Methodologies, Pipeline Architecture, Negotiation & Revenue Acceleration",
  slug: "sales-executive-masterclass",
  description: "The definitive masterclass for Enterprise Account Executives, B2B Sales Directors, and Revenue Leaders. Master modern sales methodologies (MEDDPICC, Challenger, SPIN, Sandler), multi-stakeholder account mapping, executive discovery, high-impact demonstrations, commercial negotiation, and net revenue retention.",
  category: "Business & Revenue Operations",
  level: "Advanced",
  duration: "32 Hours",
  thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
  instructor: "Nalanda Global Executive Sales Academy",
  status: "published",
  skillsCovered: [
    "SKILL-SLS-METHODOLOGIES-PROSPECTING",
    "SKILL-SLS-DISCOVERY-PIPELINE",
    "SKILL-SLS-NEGOTIATION-EXPANSION"
  ],
  prerequisites: [
    "Foundational commercial business acumen",
    "Basic understanding of B2B sales cycles and corporate purchasing"
  ],
  learningObjectives: [
    "Master enterprise B2B sales methodologies including MEDDPICC, Challenger, SPIN, and Sandler Submarine",
    "Construct data-driven Ideal Customer Profiles (ICPs) and orchestrate high-converting outbound multi-channel cadences",
    "Conduct deep-dive executive discovery to uncover latent business pain and quantify negative economic consequences",
    "Design and deliver irresistible 'Demo to Win' product presentations tailored to C-suite and technical stakeholders",
    "Multi-thread complex accounts, identify true Economic Buyers, and cultivate powerful internal Champions",
    "Architect enterprise CRM pipelines, enforce stage criteria hygiene, and produce highly accurate revenue forecasts",
    "Execute principled commercial negotiations, combat procurement aggressive discount plays, and draft bulletproof Mutual Action Plans (MAPs)",
    "Convert bottom-up Product-Led Growth (PLG) usage into 6-figure enterprise agreements and accelerate Net Revenue Retention (NRR > 130%)",
    "Defend complex RFP responses and orchestrate winning vendor defense presentations",
    "Build a sustainable high-earning career as a Strategic Enterprise Account Executive or Sales Director"
  ]
};

export const salesExecutiveSkills = [
  {
    id: "SKILL-SLS-METHODOLOGIES-PROSPECTING",
    name: "Enterprise B2B Sales Methodologies, ICP Modeling & Outbound Prospecting",
    category: "Sales & Revenue Operations",
    description: "Deep mastery of MEDDPICC, Challenger, SPIN, ICP definitions, multi-channel cadences, and account-based prospecting."
  },
  {
    id: "SKILL-SLS-DISCOVERY-PIPELINE",
    name: "Discovery Excellence, High-Impact Demos & CRM Pipeline Architecture",
    category: "Sales & Revenue Operations",
    description: "Rigorous executive discovery, demo choreography, multi-threading, champion enablement, and CRM pipeline hygiene."
  },
  {
    id: "SKILL-SLS-NEGOTIATION-EXPANSION",
    name: "Procurement Negotiation, Mutual Action Plans & Account Expansion",
    category: "Sales & Revenue Operations",
    description: "Principled enterprise negotiations, discount governance, cloud marketplace co-selling, and land-and-expand NRR acceleration."
  }
];

export const salesExecutiveChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters
];

export const salesExecutiveAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments
];

