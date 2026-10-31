// Course 1: Java Full Stack Developer Masterclass
// Aggregator module for all 5 phases (35 chapters, 35 assessments, 350 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const javaFullStackCourse = {
  id: "CRS-JFS-001",
  title: "Java Full Stack Developer Masterclass: Zero to Cloud-Native Architect",
  description: "Comprehensive 35-chapter master program taking beginners to expert Java Full Stack engineers. Covers Java 21 LTS, OOP, Concurrency, Spring Boot 3, Spring Data JPA, Microservices, React 19, TypeScript, Docker, CI/CD, AWS, and enterprise system design.",
  skill: "Java Full Stack",
  skillIds: ["SKILL-JFS", "SKILL-SPRING", "SKILL-REACT"],
  targetLevel: "Advanced",
  prerequisites: [],
  category: "Full Stack Development",
  tags: ["Java 21", "Spring Boot 3", "React 19", "PostgreSQL", "Microservices", "Docker", "AWS", "System Design"],
  thumbnailColor: "#ea580c",
  ownerId: "EMP-1003",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 120,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const javaFullStackSkills = [
  {
    id: "SKILL-JFS",
    name: "Java Full Stack",
    category: "Technical",
    description: "Modern Java 21, Spring Boot 3, REST APIs, Microservices, React 19, and cloud-native deployment.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-SPRING",
    name: "Spring Boot & Microservices",
    category: "Technical",
    description: "Enterprise Spring Boot 3, Spring Data JPA, Spring Security, Spring Cloud Gateway, and Resilience4j.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-REACT",
    name: "React & Modern Frontend",
    category: "Technical",
    description: "React 19, Hooks, Context, TanStack Query, Redux Toolkit, and full-stack API integration.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const javaFullStackChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const javaFullStackAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

