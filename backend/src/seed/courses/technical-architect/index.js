import { phase1 } from './phase1.js';
import { phase2 } from './phase2.js';
import { phase3 } from './phase3.js';
import { phase4 } from './phase4.js';
import { phase5 } from './phase5.js';

export const technicalArchitectCourse = {
  id: "CRS-TAR-001",
  title: "Technical Architect Masterclass: Distributed Systems, Cloud-Native Topologies, Enterprise Governance & Resilient System Design",
  slug: "technical-architect-masterclass",
  description: "Comprehensive masterclass for principal engineers and enterprise architects covering distributed systems design, CAP/PACELC theorems, consistent hashing, 2PC/Sagas, event sourcing, Kubernetes topologies, zero-trust security, FinOps cloud economics, and executive technical leadership.",
  category: "Architecture & Cloud Engineering",
  level: "Advanced",
  duration: "32 weeks",
  skills: [
    "SKILL-TAR-SYSTEM-DESIGN",
    "SKILL-TAR-CLOUD-INFRA-SECURITY",
    "SKILL-TAR-ENTERPRISE-GOVERNANCE"
  ],
  prerequisites: [],
  learningOutcomes: [
    "Design resilient distributed architectures capable of handling 50k+ TPS with 5-nines availability",
    "Apply foundational architecture laws, the CAP and PACELC theorems, and distributed consensus algorithms (Paxos/Raft)",
    "Architect event-driven systems using Event Sourcing, CQRS, and transactional outbox patterns",
    "Master enterprise Kubernetes multi-cluster topologies, eBPF networking, and service meshes (Istio/Ambient)",
    "Implement Zero Trust Architecture (NIST SP 800-207), OAuth 2.1 PKCE, and SPIFFE/SPIRE workload identities",
    "Lead FinOps cloud cost optimization, technical debt governance, and mainframe/legacy modernization",
    "Communicate architectural vision with executive presence to C-suite and Board stakeholders"
  ]
};

export const technicalArchitectSkills = [
  {
    id: "SKILL-TAR-SYSTEM-DESIGN",
    name: "Distributed Systems Design, High Availability, Fault Tolerance & Microservices",
    category: "Technical",
    description: "Architecting decoupled, highly available, distributed microservices and event-driven topologies with strong consistency models, consensus algorithms, and fault isolation patterns."
  },
  {
    id: "SKILL-TAR-CLOUD-INFRA-SECURITY",
    name: "Cloud Native Topology, Zero Trust, Data Partitioning & Disaster Recovery",
    category: "Technical",
    description: "Designing multi-region cloud infrastructures, Kubernetes control planes, eBPF CNIs, zero trust security fabrics, and disaster recovery failover architectures."
  },
  {
    id: "SKILL-TAR-ENTERPRISE-GOVERNANCE",
    name: "Architecture Decision Records (ADRs), Tech Debt Management & FinOps",
    category: "Technical",
    description: "Leading enterprise architecture governance, quantifying technical debt, managing cloud unit economics, and communicating technical strategy to executive leadership."
  }
];

export const technicalArchitectChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters
];

export const technicalArchitectAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments
];

