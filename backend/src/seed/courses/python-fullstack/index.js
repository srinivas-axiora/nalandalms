// Course 2: Python Full Stack Developer Masterclass
// Aggregator module for all 5 phases (33 chapters, 33 assessments, 330 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const pythonFullStackCourse = {
  id: "CRS-PFS-001",
  title: "Python Full Stack Developer Masterclass: Zero to High-Throughput Production Architect",
  description: "Comprehensive 33-chapter master program taking beginners to expert Python Full Stack architects. Covers Python 3.12, CPython internals, AsyncIO, FastAPI, SQLAlchemy 2.0, Alembic, Django & DRF, React 19, Celery, WebSockets, Docker, Pytest, gRPC, and cloud deployment.",
  skill: "Python Full Stack",
  skillIds: ["SKILL-PFS", "SKILL-FASTAPI", "SKILL-DJANGO"],
  targetLevel: "Advanced",
  prerequisites: [],
  category: "Full Stack Development",
  tags: ["Python 3.12", "FastAPI", "Django", "SQLAlchemy 2.0", "React 19", "Celery", "Docker", "AsyncIO", "gRPC"],
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

export const pythonFullStackSkills = [
  {
    id: "SKILL-PFS",
    name: "Python Full Stack Engineering",
    category: "Technical",
    description: "Modern Python 3.12, CPython internals, AsyncIO, and full-stack software architecture.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-FASTAPI",
    name: "FastAPI & Microservices",
    category: "Technical",
    description: "High-performance async APIs, Pydantic v2, Dependency Injection, and gRPC.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-DJANGO",
    name: "Django & Full-Featured Systems",
    category: "Technical",
    description: "Django ORM, Django REST Framework, Celery distributed tasks, and enterprise auth.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const pythonFullStackChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const pythonFullStackAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

