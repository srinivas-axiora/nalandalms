// Course 14: Forward Deploy Engineer Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const forwardDeployCourse = {
  id: "CRS-FDE-001",
  title: "Forward Deploy Engineer Masterclass: Solutions Architecture, Enterprise Integration & Field Reliability",
  description: "Elite-level 30-chapter masterclass covering the mission-critical forward deployed engineering mandate: client architecture discovery and Integration Design Documents (IDD); REST, gRPC, GraphQL, and HMAC webhook architectures; custom enterprise SDK generation; reverse proxies and mTLS zero-trust perimeters (Envoy, Nginx, Kong); Kafka event buses and DLQ design; enterprise identity federation (SAML 2.0, OIDC, PKCE, SCIM 2.0); fine-grained authorization with Open Policy Agent (OPA/Rego); multi-tenant isolation architectures and PostgreSQL Row Level Security (RLS); Medallion ETL data pipelines, DuckDB columnar analytics, and GDPR crypto-shredding; hardened distroless containerization and Helm packaging; Kubernetes deployments across EKS, AKS, GKE, and OpenShift; air-gapped and AWS PrivateLink deployments; Terraform Infrastructure as Code; GitOps progressive delivery with ArgoCD; dynamic feature flags (LaunchDarkly); distributed tracing with OpenTelemetry; Prometheus and Grafana APM; Fluent Bit centralized logging; high availability, RTO/RPO, and multi-region disaster recovery; production incident management, SEV escalation matrices, and blameless post-mortems; SLAs, SLOs, and Error Budgets; technical pilot execution (PoC charters); C-suite stakeholder management; k6 distributed load testing; SOC 2 Type II and OWASP API security audit remediation; the OmniConnect Enterprise Capstone; and Staff FDE career blueprints.",
  skill: "Forward Deployed & Solutions Engineering",
  skillIds: [
    "SKILL-FDE-SOLUTIONS-INTEGRATION",
    "SKILL-FDE-IDENTITY-DEPLOYMENT",
    "SKILL-FDE-RELIABILITY-OPERATIONS"
  ],
  targetLevel: "Comprehensive",
  prerequisites: [],
  category: "Software Engineering",
  tags: [
    "Forward Deployed Engineer",
    "Solutions Architecture",
    "SAML SSO",
    "Kubernetes",
    "AWS PrivateLink",
    "OpenTelemetry",
    "Terraform",
    "Kafka",
    "Air-Gapped",
    "Incident Response"
  ],
  thumbnailColor: "#059669",
  ownerId: "EMP-1001",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const forwardDeploySkills = [
  {
    id: "SKILL-FDE-SOLUTIONS-INTEGRATION",
    name: "Client Solutions Architecture & API Integration",
    category: "Technical",
    description: "Production mastery of technical discovery scoping, Integration Design Documents (IDD), REST/gRPC/GraphQL protocols, webhook security (HMAC), custom SDK generation, and reverse proxy perimeter architectures (Envoy, Nginx).",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-FDE-IDENTITY-DEPLOYMENT",
    name: "Identity Federation, Air-Gapped Deployments & Infrastructure",
    category: "Technical",
    description: "Deep expertise in SAML 2.0 XML assertion verification, OIDC/PKCE flows, ABAC with Open Policy Agent (OPA/Rego), multi-tenant data isolation with Postgres RLS, Helm packaging, Kubernetes multi-cloud (EKS, AKS, OpenShift), AWS PrivateLink, and air-gapped enclaves.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-FDE-RELIABILITY-OPERATIONS",
    name: "Observability, Incident Management & Enterprise Delivery",
    category: "Technical",
    description: "Operational mastery of OpenTelemetry distributed tracing, Prometheus/Grafana RED metrics, Fluent Bit log aggregation, multi-region disaster recovery (RTO/RPO), blameless post-mortems, error budgets, k6 load testing, SOC 2 compliance, and Staff FDE leadership.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const forwardDeployChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const forwardDeployAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

