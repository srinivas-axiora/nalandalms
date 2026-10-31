// Course 8: DevOps Engineering Masterclass
// Aggregator module for all 5 phases (33 chapters, 33 assessments, 330 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const devopsCourse = {
  id: "CRS-DVO-001",
  title: "DevOps & Platform Engineering: Kubernetes, GitOps, Terraform & SRE Architecture",
  description: "Comprehensive 33-chapter masterclass from Linux kernel subsystems and container runtimes to multi-region Kubernetes clusters, GitOps, Terraform IaC, OpenTelemetry, and SRE resilience. Covers Linux architecture, process states, signals, systemd, cgroups v2, namespaces, network stack internals (sk_buff, iptables, routing, tcpdump), defensive Bash automation, Git object model internals, Trunk-Based Development, SemVer 2.0, CI/CD pipeline economics, GitHub Actions enterprise pipelines with AWS keyless OIDC, Container internals (OverlayFS, runc, containerd), Dockerfile multi-stage optimization, distroless hardening, Trivy scanning, Docker Compose microservice stacks, OCI registry governance, Sigstore Cosign image signing, Kubernetes Control Plane anatomy (etcd Raft, API server, Scheduler, Controller Manager, kubelet, kube-proxy, CNI), Workload controllers (Deployments, StatefulSets, DaemonSets, Jobs), CNI routing (Calico, Cilium eBPF), Services & Ingress NGINX, External Secrets Operator & Vault, StorageClasses & PersistentVolumes, Advanced scheduling (Affinities, Taints, Topology Spread, Karpenter autoscaler), Helm 3 charts & Go templating, ArgoCD & Flux GitOps continuous delivery, Istio Service Mesh (Envoy sidecars, canary traffic splitting, mTLS, circuit breaking), Kubernetes security hardening (RBAC, Pod Security Admission, NetworkPolicies, Kyverno), Terraform HCL2 architecture & execution graphs, Remote state with S3 & DynamoDB locking, Modular DRY design, AWS Multi-AZ VPC networking, Terratest automated Go testing, Observability Three Pillars & OpenTelemetry Collector pipelines, Prometheus monitoring & PromQL mastery, Alertmanager routing & Grafana executive dashboards, Grafana Loki log aggregation with LogQL, Google SRE principles (SLIs, SLOs, Error Budget burn rates, blameless postmortems), Chaos Engineering with Chaos Mesh, NovaPay Global multi-region capstone architecture, and Platform Engineering system design interview mastery.",
  skill: "DevOps & Platform Engineering",
  skillIds: ["SKILL-LINUX-CONTAINERS", "SKILL-KUBERNETES-GITOPS", "SKILL-IAC-OBSERVABILITY-SRE"],
  targetLevel: "Advanced",
  prerequisites: [],
  category: "Cloud & DevOps",
  tags: [
    "DevOps",
    "Platform Engineering",
    "Kubernetes",
    "Docker",
    "Terraform",
    "GitOps",
    "ArgoCD",
    "Prometheus",
    "Grafana",
    "OpenTelemetry",
    "AWS",
    "SRE",
    "CI/CD",
    "Linux"
  ],
  thumbnailColor: "#0284c7",
  ownerId: "EMP-1002",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 115,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const devopsSkills = [
  {
    id: "SKILL-LINUX-CONTAINERS",
    name: "Linux Systems & Container Runtimes",
    category: "Technical",
    description: "Deep Linux OS architecture, kernel cgroups v2, namespaces, packet routing, OCI runtime specifications, containerd, runc, multi-stage Dockerfiles, and Cosign supply chain security.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-KUBERNETES-GITOPS",
    name: "Kubernetes Orchestration & GitOps CI/CD",
    category: "Technical",
    description: "Kubernetes control plane architecture, etcd, CNI plugins (Cilium/Calico), StatefulSets, Karpenter autoscaling, Helm packaging, Istio service mesh, and ArgoCD declarative GitOps delivery.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-IAC-OBSERVABILITY-SRE",
    name: "Infrastructure as Code, Observability & SRE",
    category: "Technical",
    description: "Enterprise Terraform HCL2 modular architectures, remote state locking, AWS VPC networking, OpenTelemetry collector pipelines, Prometheus/PromQL, Loki, and Google SRE error budget engineering.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const devopsChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const devopsAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

