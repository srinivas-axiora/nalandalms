// Course 13: React Developer Masterclass
// Aggregator module for all 5 phases (32 chapters, 32 assessments, 320 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const reactDeveloperCourse = {
  id: "CRS-RCT-001",
  title: "React Developer Masterclass: React 19, TypeScript, Next.js App Router & Architecture",
  description: "Elite-level 32-chapter masterclass covering modern React engineering from ground principles to production scale: Virtual DOM, Fiber architecture, JSX compilation, TypeScript integration, synthetic events, state batching; hooks mastery (useEffect, useLayoutEffect, useRef, useMemo, useCallback, Context API); React 19 Compiler, Actions, useActionState, useOptimistic, the use() Hook, and Concurrent React transitions (useTransition, useDeferredValue); global state architectures (Zustand, Redux Toolkit, RTK Query); server state caching and optimistic mutations with TanStack Query v5; enterprise form validation with React Hook Form and Zod; Compound Components and Headless UI; Next.js 15 App Router deep dive (Server Components vs Client Components, Server Actions, streaming SSR, ISR, route handlers, middleware, SEO metadata); Web Vitals optimization (LCP, INP, CLS), virtualization with TanStack Virtual; unit and integration testing with Vitest and React Testing Library; cross-browser E2E testing with Playwright; enterprise frontend security (XSS, DOMPurify, CSP nonces); the AuraDashboard SaaS capstone; and Staff React Engineer interview mastery with the RADIO system design framework.",
  skill: "React & Next.js Frontend Development",
  skillIds: [
    "SKILL-RCT-CORE-REACT19",
    "SKILL-RCT-STATE-DATA-FETCHING",
    "SKILL-RCT-NEXTJS-PERFORMANCE-TESTING"
  ],
  targetLevel: "Comprehensive",
  prerequisites: [],
  category: "Software Engineering",
  tags: [
    "React",
    "React 19",
    "Next.js",
    "TypeScript",
    "Zustand",
    "TanStack Query",
    "Vitest",
    "Playwright",
    "Web Vitals",
    "System Design"
  ],
  thumbnailColor: "#0ea5e9",
  ownerId: "EMP-1001",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 95,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const reactDeveloperSkills = [
  {
    id: "SKILL-RCT-CORE-REACT19",
    name: "React 19 Core, Hooks & TypeScript",
    category: "Technical",
    description: "Deep mastery of the React 19 reconciliation and Fiber engine, JSX compilation, TypeScript typing patterns, synthetic events, memory management with useRef/useMemo/useCallback, Context API, the React 19 Compiler, Actions, useActionState, useOptimistic, use() hook, and Concurrent React transitions.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-RCT-STATE-DATA-FETCHING",
    name: "State Management, Data Fetching & Architecture",
    category: "Technical",
    description: "Production mastery of global client state with Zustand v5, Redux Toolkit & RTK Query, asynchronous server state orchestration with TanStack Query v5, type-safe form validation with React Hook Form & Zod, and Compound Component design patterns.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-RCT-NEXTJS-PERFORMANCE-TESTING",
    name: "Next.js App Router, Performance & Testing",
    category: "Technical",
    description: "Expertise in Next.js App Router, React Server Components (RSC), Server Actions, streaming SSR, Core Web Vitals (LCP, INP, CLS), virtualization with TanStack Virtual, unit testing with Vitest & RTL, E2E automation with Playwright, enterprise security, and Staff-level frontend system design.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const reactDeveloperChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const reactDeveloperAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

