import { phase1 } from './phase1.js';
import { phase2 } from './phase2.js';
import { phase3 } from './phase3.js';
import { phase4 } from './phase4.js';
import { phase5 } from './phase5.js';

export const sixSigmaCourse = {
  id: "CRS-SSM-001",
  title: "Manager — Six Sigma & Lean Operations Masterclass: DMAIC, Statistical Quality Engineering, Value Stream Architecture & Operational Excellence",
  slug: "manager-six-sigma-lean-operations",
  description: "Comprehensive masterclass for operations managers, Black Belts, and continuous improvement directors covering DMAIC methodology, applied statistics, Gage R&R, process capability (Cp/Cpk), Value Stream Mapping, DOE, cellular flow, SMED, SPC, and executive operational leadership.",
  category: "Operations & Quality Management",
  level: "Advanced / Executive",
  duration: "30 weeks",
  skills: [
    "SKILL-SSM-DMAIC",
    "SKILL-SSM-LEAN-OPS",
    "SKILL-SSM-LEADERSHIP"
  ],
  prerequisites: [
    "Operations Supervisor, Industrial Engineer, or Team Lead experience",
    "Basic college-level algebra and familiarity with operational workflows",
    "Foundational understanding of manufacturing or service delivery processes"
  ],
  learningOutcomes: [
    "Lead end-to-end Lean Six Sigma Black Belt operational transformations utilizing the 5-phase DMAIC framework",
    "Formulate rigorous Project Charters and translate Voice of Customer (VOC) into Critical to Quality (CTQ) specifications",
    "Conduct Measurement System Analysis (MSA / Gage R&R) and Process Capability studies (Cp, Cpk, Pp, Ppk)",
    "Map Current and Future State Value Stream Maps (VSM) and synchronize production lines to customer Takt Time",
    "Execute inferential statistical hypothesis tests (t-tests, ANOVA) and regression models to prove root cause drivers (Y = f(X))",
    "Design and analyze multi-factor experimental designs (DOE) to discover multi-variable global operating optimums",
    "Eliminate waste via 5S, Quick Changeover (SMED), Poka-Yoke error-proofing, and Cellular Workcells",
    "Institutionalize real-time Statistical Process Control (SPC) and OEE metrics to permanently sustain operational gains"
  ]
};

export const sixSigmaSkills = [
  {
    id: "SKILL-SSM-DMAIC",
    name: "Lean Six Sigma DMAIC Lifecycle, Statistical Process Control (SPC) & Quality Engineering",
    category: "Operations & Quality Management",
    description: "Leading data-driven process improvement through DMAIC, statistical hypothesis testing, Gage R&R measurement systems, capability analysis, and real-time SPC control charting."
  },
  {
    id: "SKILL-SSM-LEAN-OPS",
    name: "Value Stream Mapping (VSM), Waste Elimination (Muda/Muri/Mura) & Just-In-Time (JIT)",
    category: "Operations & Quality Management",
    description: "Designing Lean value streams, eliminating the 8 deadly wastes, sizing pull Kanban loops, and balancing cellular manufacturing lines to customer Takt Time."
  },
  {
    id: "SKILL-SSM-LEADERSHIP",
    name: "Kaizen Leadership, Total Productive Maintenance (TPM) & Design for Six Sigma (DFSS)",
    category: "Operations & Quality Management",
    description: "Leading rapid Kaizen blitzen, optimizing asset reliability via TPM and OEE, designing 6-Sigma products via DMADV/QFD, and delivering executive A3 presentations."
  }
];

export const sixSigmaChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters
];

export const sixSigmaAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments
];

