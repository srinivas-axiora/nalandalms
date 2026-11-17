import { phase1 } from './phase1.js';
import { phase2 } from './phase2.js';
import { phase3 } from './phase3.js';
import { phase4 } from './phase4.js';
import { phase5 } from './phase5.js';

export const payrollComplianceCourse = {
  id: "CRS-AEP-001",
  title: "Account Executive — Payroll & Compliance Masterclass: Gross-to-Net Engines, Multi-Jurisdiction Statutory Law, Benefits Administration & Audit Defense",
  slug: "payroll-compliance-masterclass",
  description: "The definitive masterclass for Enterprise Payroll Directors, Compensation Account Executives, and Statutory Compliance Leaders. Master gross-to-net computation engines, FLSA classification, multi-state and international statutory tax withholdings (FICA, FUTA, PAYE, EPF, ESI), Section 125 cafeteria plans, garnishment priority, global EOR/PEO architectures, SOX internal controls, and statutory audit defense.",
  category: "Business & Revenue Operations",
  level: "Advanced",
  duration: "32 Hours",
  thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  instructor: "Nalanda Global Institute of Payroll & Statutory Compliance",
  status: "published",
  skillsCovered: [
    "SKILL-AEP-GROSS-NET-ENGINES",
    "SKILL-AEP-STATUTORY-COMPLIANCE",
    "SKILL-AEP-GLOBAL-PAYROLL-TECH"
  ],
  prerequisites: [
    "Foundational commercial business acumen",
    "Basic understanding of accounting principles and corporate employee management"
  ],
  learningObjectives: [
    "Architect and audit enterprise Gross-to-Net calculation engines with strict mathematical deduction waterfalls",
    "Enforce FLSA compliance: worker classification (W-2 vs. 1099, Exempt vs. Non-Exempt), and Regular Rate of Pay (RROP) overtime modeling",
    "Administer pre-tax Section 125 cafeteria plans, traditional 401(k), HSA/FSA limits, and post-tax Roth deferrals",
    "Execute statutory wage garnishments compliant with CCPA disposable earnings caps and priority hierarchies",
    "Navigate multi-state payroll nexus, statutory reciprocity agreements, convenience of the employer rules, and municipal taxes",
    "Reconcile and file quarterly Form 941 (with Schedule B precision) and annual Form W-2 / W-3 / 1099-NEC statements",
    "Operate global payroll models: In-Country Providers (ICPs), Aggregators, EOR/PEO co-employment, and international statutory systems (UK PAYE, India EPF/ESI/TDS)",
    "Manage expatriate shadow payrolls, hypothetical tax calculations, and bilateral totalization agreements",
    "Enforce Sarbanes-Oxley (SOX) Section 404 segregation of duties and execute automated ghost employee fraud audits",
    "Lead enterprise payroll cloud migrations with dual-cycle parallel testing and defend against DOL and IRS statutory audits"
  ]
};

export const payrollComplianceSkills = [
  {
    id: "SKILL-AEP-GROSS-NET-ENGINES",
    name: "Gross-to-Net Computation Engines, Payroll Deductions & Remittance Architecture",
    category: "Compliance",
    description: "Deep mastery of gross-to-net waterfalls, FLSA overtime regular rate calculations, Section 125 pre-tax cafeteria plans, and post-tax garnishment priority."
  },
  {
    id: "SKILL-AEP-STATUTORY-COMPLIANCE",
    name: "Multi-Jurisdiction Labor Law, Statutory Tax Withholding & Year-End Reporting",
    category: "Compliance",
    description: "Multi-state tax nexus, federal and state income tax withholding (W-4, 941, Schedule B), FICA/FUTA unemployment frameworks, and annual W-2/1099 reporting."
  },
  {
    id: "SKILL-AEP-GLOBAL-PAYROLL-TECH",
    name: "Global Payroll SaaS, EOR/PEO Frameworks, Benefits Administration & Audit Defense",
    category: "Compliance",
    description: "Multinational payroll architectures, EOR/PEO co-employment, international statutory schemes (UK PAYE, India EPF/ESI/TDS), SOX internal controls, and DOL audit defense."
  }
];

export const payrollComplianceChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters
];

export const payrollComplianceAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments
];

