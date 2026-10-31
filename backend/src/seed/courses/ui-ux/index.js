// Course 12: UI/UX Designer Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const uiUxCourse = {
  id: "CRS-UIX-001",
  title: "UI/UX Design Masterclass: User Research, Interaction Design, Design Systems & Usability",
  description: "Comprehensive 30-chapter masterclass covering the modern end-to-end product design lifecycle: cognitive psychology and Don Norman's mental models (affordances, signifiers, mapping, feedback, constraints, Gulfs of Execution and Evaluation) and the British Design Council's Double Diamond; qualitative and quantitative discovery research (generative vs evaluative, semi-structured interviews, 'The Mom Test', contextual inquiry, ethnographic observation, screener surveys, bias mitigation); research synthesis (affinity diagramming, empirical UX personas vs marketing demographics, four-quadrant empathy maps, customer journey maps with emotional valence curves); problem framing and product strategy (Jobs-to-be-Done framework, Four Forces of Progress, Value Proposition Canvas, 'How Might We' reframing, Impact-Effort and RICE prioritization); Information Architecture (IA), Richard Saul Wurman's LATCH taxonomy, open vs closed card sorting, tree testing directness, navigation paradigms (hierarchical, faceted, hub-and-spoke), and sitemaps; task flows vs user flows vs wireflows, standard ANSI flowchart symbology, Google Ventures Crazy Eights rapid sketching, and low-fidelity grayscale wireframing with content-first copy; visual hierarchy (F and Z eye-tracking scan patterns, visual weight levers), digital typography anatomy (x-height, baseline, leading, tracking, measure), modular scales, and the 8pt spatial grid system; color theory, color spaces (RGB, HSL, OKLCH perceptual uniformity), the 60-30-10 distribution rule, semantic token ramps, WCAG 2.2 contrast math (4.5:1, 3:1), and dark mode surface elevation tinting; layout grids (12-column desktop, 4-column mobile, gutters, margins), responsive breakpoints, Steven Hoober's mobile thumb zone ergonomics, safe area insets, and minimum touch targets (44x44pt Apple, 48x48dp Google); Figma deep dive: Vector Networks, Boolean operations, Frames vs Groups, Master Components (❖) and Instances (◇), Component Sets, Variants, and Component Properties (Boolean, Text, Instance Swap, Variant); Auto Layout mastery (horizontal, vertical, wrap, gap, padding, fixed vs hug contents vs fill container, absolute positioning within flex, nested card blueprints); micro-interactions and motion design (Dan Saffer's trigger-rules-feedback-loops model, physics of motion, cubic-bezier easing curves [Ease-Out entry, Ease-In exit], duration benchmarks [200-300ms], Smart Animate layer matching, and interactive component state choreography [default, hover, pressed, focused, disabled, loading]); interactive high-fidelity prototyping in Figma (triggers, navigation, overlays, variables [Color, Number, String, Boolean], conditional logic [if/else], expressions, and persistent state); evaluative usability testing (moderated vs unmoderated, think-aloud protocol, avoiding leading questions, neutral moderation, realistic task scenarios without keyword clues); quantitative usability metrics and System Usability Scale (SUS calculation, scoring formula, percentile grading, 68 average baseline), Single Ease Question (SEQ), Task Completion Rate, Time on Task geometric means, and Net Promoter Score (NPS) correlation; Heuristic Evaluation and expert UX audits (Jakob Nielsen's 10 Usability Heuristics, Jakob's Law, severity rating scale 0 to 4, audit report structuring); Accessibility and Inclusive Design (WCAG 2.2 Level AA/AAA, the four POUR principles, color independence, screen reader accessibility, semantic heading hierarchy, landmark roles, accessible alt text, aria-labels on icon buttons, skip-to-content links, visible focus indicators, European Accessibility Act [EAA 2025]); Design Systems architecture (Brad Frost's Atomic Design: Atoms, Molecules, Organisms, Templates, Pages; component composability, the Slot pattern, centralized vs federated vs hybrid governance, Semantic Versioning SemVer, and Storybook integration); Design Tokens architecture (3-tier taxonomy: Global/Reference, Semantic/Alias, Component-specific; W3C Design Tokens Community Group JSON spec, Figma Variables & Modes, automated pipelines with Amazon Style Dictionary and GitHub); developer handoff and DesignOps (Figma Dev Mode, token-mapped code inspection, box-model overlays, documenting edge states [loading skeletons, empty/zero states, partial, extreme overflow, errors], Figma branching and merging, DesignOps maturity); frictionless form design (single-column superiority, top-aligned vs floating labels, inline validation on blur, progressive disclosure, multi-step stepper wizards, and human-centered error recovery psychology); enterprise SaaS dashboard design (KPI summary cards, temporal baselines, sparklines, chart selection heuristics [line, horizontal bar, scatter, donut vs 3D pie anti-pattern], data tables [left text, right numbers, sticky headers, row density toggles, hover actions]); e-commerce checkout UX and cart abandonment optimization (~70% benchmark, slide-out cart drawers, guest checkout non-negotiables, enclosed checkout flows, 1-click express wallets [Apple Pay], Google Places autocomplete, card formatting); Conversion-Centered Design (CCD) and growth psychology (Fitts's Law, Hick's Law, Miller's Law 7±2, Zeigarnik Effect progress bars, ethical persuasion vs FTC-regulated deceptive dark patterns [Confirmshaming, Roach Motel, Sneak into Basket]); AI-Native UI/UX and conversational experience design (outcome-based declaration, generative UI widgets, split-pane canvas patterns, token streaming latency choreography, interactive footnote citations, Human-in-the-Loop staging); native mobile UI: Apple Human Interface Guidelines (San Francisco, Tab Bar, sheet modals, Dynamic Island) vs Google Material Design 3 (Roboto, Top App Bar, FAB, Material You dynamic color tinting); Service Design and Blueprinting (frontstage vs backstage, Line of Visibility, Line of Interaction, support processes, cross-channel customer journeys); Design Leadership (Google Ventures 5-day Design Sprint, the Product Triad [PM, Engineering, Design], calculating and communicating UX ROI to CFOs, InVision design maturity model); the AuraDesign comprehensive multi-platform design system capstone project; and Staff / Senior Product Designer interview mastery (SCQA case study storytelling, live slide deck presentations, whiteboard challenges [PEDAL framework], and app critique interviews).",
  skill: "UI/UX & Product Design",
  skillIds: [
    "SKILL-UIX-RESEARCH-STRATEGY",
    "SKILL-UIX-VISUAL-DESIGN-SYSTEMS",
    "SKILL-UIX-USABILITY-ACCESSIBILITY"
  ],
  targetLevel: "Comprehensive",
  prerequisites: [],
  category: "Design & Creative",
  tags: [
    "UI/UX Design",
    "Product Design",
    "Figma",
    "Design Systems",
    "Design Tokens",
    "User Research",
    "Usability Testing",
    "WCAG Accessibility",
    "Interaction Design",
    "Information Architecture",
    "Mobile UX",
    "SaaS Dashboards"
  ],
  thumbnailColor: "#8b5cf6",
  ownerId: "EMP-1002",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const uiUxSkills = [
  {
    id: "SKILL-UIX-RESEARCH-STRATEGY",
    name: "UX Research, Information Architecture & Product Strategy",
    category: "Functional",
    description: "Deep mastery of cognitive psychology, mental models, generative & evaluative research, contextual inquiry, personas, empathy maps, journey mapping, Jobs-to-be-Done, and information architecture.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-UIX-VISUAL-DESIGN-SYSTEMS",
    name: "Visual UI Design, Figma & Design Systems",
    category: "Functional",
    description: "Production proficiency in typography, 8pt grids, OKLCH color palettes, dark mode, responsive layouts, Figma Vectors, Components, Variants, Component Props, Auto Layout flexbox, Atomic Design, and Design Tokens.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-UIX-USABILITY-ACCESSIBILITY",
    name: "Usability Testing, WCAG Accessibility & DesignOps",
    category: "Functional",
    description: "Expertise in interactive prototyping, think-aloud usability testing, SUS benchmarking, heuristic evaluations, WCAG 2.2 AA accessibility, Dev Mode handoff, micro-interactions, form psychology, and design leadership.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const uiUxChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const uiUxAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

