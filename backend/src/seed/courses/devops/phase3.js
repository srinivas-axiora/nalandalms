// Course 8: DevOps Engineering Masterclass - Phase 3: Kubernetes Orchestration, Storage & GitOps
// Chapters 15 to 21 | Assessments 15 to 21 | 70 MCQs

export const phase3 = {
  chapters: [
    {
      id: "CH-DVO-015",
      courseId: "CRS-DVO-001",
      sequence: 15,
      title: "Kubernetes Configuration & Secrets Management",
      description: "Master ConfigMaps, Secrets, base64 pitfalls, External Secrets Operator (ESO), HashiCorp Vault synchronization, and Sealed Secrets.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Kubernetes Configuration & Secrets Management

Hardcoding configuration and credentials inside application source code or Docker images violates the 12-Factor App methodology and creates acute security vulnerabilities. Modern Kubernetes platform engineering requires clean separation of code, configuration, and encrypted secrets.

---

## 1. ConfigMaps vs. Native Secrets

\`\`\`
+-----------------------+     +-----------------------+
| ConfigMap             |     | Secret (Opaque)       |
+-----------------------+     +-----------------------+
| Plain text key-values |     | Base64 encoded values |
| Environment variables |     | Stored encrypted in   |
| Config file mounts    |     | etcd (at rest)        |
| (nginx.conf, app.env) |     | (API tokens, TLS keys)|
+-----------------------+     +-----------------------+
\`\`\`

> [!WARNING]
> Native Kubernetes Secrets are **NOT encrypted** by default in manifests—they are merely **Base64 encoded** (\`echo -n "password" | base64\`). Storing raw Kubernetes Secret manifests in Git repositories exposes cleartext credentials.

---

## 2. Production Pattern: External Secrets Operator (ESO) & HashiCorp Vault

The industry standard pattern for enterprise secret lifecycle management is synchronizing secrets dynamically from external secret management stores (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault) directly into cluster memory:

\`\`\`
+-----------------------+                    +------------------------------------+
| Enterprise Vault      |                    | Kubernetes Cluster                 |
| (AWS Secrets Manager/ | <--- Pulls via --- | External Secrets Operator (ESO)    |
| HashiCorp Vault)      |      OIDC / IAM    |                                    |
+-----------------------+                    +------------------------------------+
                                                                |
                                                     Creates / Reconciles
                                                                v
                                             +------------------------------------+
                                             | Local Kubernetes Secret (in-memory)|
                                             +------------------------------------+
                                                                |
                                                      Mounted as Volume or Env
                                                                v
                                             +------------------------------------+
                                             | Application Pod (e.g., api-pod)    |
                                             +------------------------------------+
\`\`\`

### ExternalSecret Custom Resource Definition (CRD):
\`\`\`yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: "1h"
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: db-secret # Name of the generated native K8s Secret
    creationPolicy: Owner
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: production/rds/aurora
        property: password
\`\`\`

---

## 3. Sealed Secrets: Cryptographic GitOps Storage

Bitnami **Sealed Secrets** utilizes asymmetric public-key cryptography to allow engineers to safely commit encrypted secrets into public or private Git repositories. Only the controller running inside the cluster possesses the private key required to decrypt the \`SealedSecret\` into a live \`Secret\`.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/H04F_3c5g8c" title="Kubernetes Secrets Management & External Secrets" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-016",
      courseId: "CRS-DVO-001",
      sequence: 16,
      title: "Kubernetes Storage Architecture & Persistent Workloads",
      description: "Deconstruct PersistentVolumes (PV), PersistentVolumeClaims (PVC), StorageClasses, dynamic CSI provisioning, and disaster recovery with Velero.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Kubernetes Storage Architecture & Persistent Workloads

Containers are inherently stateless and ephemeral. To run stateful workloads—such as PostgreSQL clusters, Apache Kafka brokers, or Elasticsearch indices—Kubernetes abstracts physical storage devices behind declarative storage primitives.

---

## 1. Storage Abstraction Layer

\`\`\`
+--------------------------------------------------------------------------+
| PersistentVolumeClaim (PVC)  --> User's request for storage (Capacity,   |
|                                  Access Mode: RWO, RWX, ROX)             |
+--------------------------------------------------------------------------+
                                    |
                        Binds dynamically via
                                    v
+--------------------------------------------------------------------------+
| StorageClass (SC)            --> Defines storage provisioner (AWS EBS,   |
|                                  Azure Disk, Ceph RBD) & volume params   |
+--------------------------------------------------------------------------+
                                    |
                    Triggers CSI Driver to provision
                                    v
+--------------------------------------------------------------------------+
| PersistentVolume (PV)        --> Actual volume resource in the cluster   |
|                                  retained or recycled on release         |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Access Modes Demystified

- **ReadWriteOnce (RWO):** Volume can be mounted as read-write by a **single node** only (standard for block storage like AWS EBS \`gp3\` or GCP \`pd-ssd\`).
- **ReadWriteMany (RWX):** Volume can be mounted as read-write by **many nodes simultaneously** (requires network file storage like NFS, AWS EFS, or CephFS).
- **ReadOnlyMany (ROX):** Volume can be mounted as read-only by many nodes simultaneously.

---

## 3. Dynamic Provisioning with StorageClasses

\`\`\`yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ebs
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer # Binds PV in the same AZ as the scheduled Pod
allowVolumeExpansion: true
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: database
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ebs
  resources:
    requests:
      storage: 100Gi
\`\`\`

---

## 4. Disaster Recovery & Snapshotting with Velero

CNCF **Velero** provides enterprise cluster backup and recovery:
\`\`\`bash
# Backup entire production namespace including persistent volume snapshots
velero backup create prod-backup-$(date +%F) --include-namespaces production

# Restore namespace following catastrophic data center failure
velero restore create --from-backup prod-backup-2026-10-30
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/u_qC_z_LhF4" title="Kubernetes Storage Architecture & Persistent Volumes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-017",
      courseId: "CRS-DVO-001",
      sequence: 17,
      title: "Kubernetes Advanced Scheduling & Multi-Dimensional Autoscaling",
      description: "Master Node Affinity/Anti-Affinity, Taints, Tolerations, Topology Spread Constraints, HPA, VPA, and Karpenter autoscaling.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Kubernetes Advanced Scheduling & Autoscaling

Controlling where pods execute and dynamically sizing cluster compute capacity in response to traffic surges is critical for high availability and cloud cost optimization.

---

## 1. Advanced Scheduling Primitives

\`\`\`
+--------------------------------------------------------------------------+
| SCHEDULING CONSTRAINTS                                                   |
+--------------------------------------------------------------------------+
| 1. Node Selector / Affinity: "I want to run on GPU or Memory nodes"     |
| 2. Pod Anti-Affinity:        "Do NOT place two replicas on the same node"|
| 3. Taints & Tolerations:     "Only dedicated system pods may enter here" |
| 4. Topology Spread:          "Evenly balance pods across AZs (1a, 1b, 1c)"|
+--------------------------------------------------------------------------+
\`\`\`

### High-Availability Pod Topology Spread Constraint:
\`\`\`yaml
spec:
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector:
        matchLabels:
          app: checkout-api
\`\`\`

---

## 2. Multi-Dimensional Autoscaling Spectrum

\`\`\`
HORIZONTAL POD AUTOSCALER (HPA)  --> Adjusts REPLICA COUNT based on CPU / Memory / Custom PromQL
VERTICAL POD AUTOSCALER (VPA)    --> Adjusts POD CPU/RAM REQUESTS dynamically over time
CLUSTER AUTOSCALER / KARPENTER   --> Provisions or terminates PHYSICAL CLOUD WORKER NODES
\`\`\`

### Karpenter: Next-Gen Node Provisioning
Unlike the legacy Kubernetes Cluster Autoscaler which scales predefined node groups slowly, **Karpenter** observes unschedulable pod requirements directly, determines the exact cheapest mix of EC2/Cloud compute types (combining Spot and On-Demand), and spins up custom nodes in under 45 seconds.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/yVwXn0b6K_U" title="Kubernetes Advanced Scheduling & Karpenter Autoscaling" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-018",
      courseId: "CRS-DVO-001",
      sequence: 18,
      title: "Helm Package Management, Templating & Release Lifecycle",
      description: "Master Helm chart architectures, Go template syntax, values.yaml overrides, chart hooks, dependency subcharts, and release lifecycles.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Helm Package Management, Templating & Release Lifecycle

Raw Kubernetes YAML manifests are static and verbose. Managing multi-environment deployments across Development, Staging, and Production requires parameterizing manifests into versioned, distributable application packages called **Helm Charts**.

---

## 1. Helm Chart Directory Topology

\`\`\`
mychart/
  ├── Chart.yaml          # Metadata: chart name, version (SemVer), appVersion
  ├── values.yaml         # Default configuration values
  ├── values-prod.yaml    # Production-specific configuration overrides
  ├── charts/             # Subcharts and dependencies (e.g., redis, postgresql)
  └── templates/          # Go-templated Kubernetes manifest files
      ├── _helpers.tpl    # Reusable named template definitions
      ├── deployment.yaml # Parameterized Deployment manifest
      ├── service.yaml    # Parameterized Service manifest
      └── tests/          # Post-install smoke tests
\`\`\`

---

## 2. Go Templating & Helper Functions

Inside \`templates/deployment.yaml\`:
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
\`\`\`

---

## 3. Helm Release Operations

\`\`\`bash
# Lint chart templates for syntax errors
helm lint ./mychart

# Dry-run template rendering to inspect generated YAML
helm template my-release ./mychart --values values-prod.yaml

# Install or upgrade release atomically with automated rollback on failure
helm upgrade --install my-release ./mychart \\
  --namespace production \\
  --create-namespace \\
  --values values-prod.yaml \\
  --atomic \\
  --timeout 5m
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/-ykwb1d0DXU" title="Helm 3 Tutorial for Beginners" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-019",
      courseId: "CRS-DVO-001",
      sequence: 19,
      title: "GitOps Continuous Delivery with ArgoCD & Flux",
      description: "Implement declarative GitOps delivery using ArgoCD and Flux: pull-based reconciliation, Application CRDs, automated drift healing, and multi-tenant security.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# GitOps Continuous Delivery with ArgoCD & Flux

GitOps is an operational framework where **Git is the single source of truth** for declaratively defined infrastructure and applications. Instead of external CI pipelines pushing changes using broad cluster-admin credentials, in-cluster GitOps operators continuously pull and reconcile state.

---

## 1. Push-Based CI/CD vs. Pull-Based GitOps

\`\`\`
TRADITIONAL PUSH CD:
CI Runner (GitHub Actions) ---> Needs Cluster-Admin Kubeconfig ---> Kube-API
(Major Security Attack Surface: Secret leaked to CI compromises entire cluster)

DECLARATIVE PULL GITOPS:
Developer ---> Pushes Manifests to Git Repository
                      ^
                      | (Pulls over read-only HTTPS/SSH)
ArgoCD Operator (Inside Cluster) ---> Constantly compares Git State vs. Live State
                                 ---> Automatically syncs & self-heals drifts
\`\`\`

---

## 2. ArgoCD Application Custom Resource

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service-prod
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: production-apps
  source:
    repoURL: 'https://github.com/enterprise/fleet-manifests.git'
    targetRevision: HEAD
    path: apps/order-service/overlays/production
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: production
  syncPolicy:
    automated:
      prune: true     # Automatically deletes resources removed from Git
      selfHeal: true  # Automatically reverts manual kubectl edits made by humans!
    syncOptions:
      - CreateNamespace=true
\`\`\`

---

## 3. Automated Self-Healing & Drift Detection

If an engineer attempts an emergency manual edit using \`kubectl edit deployment order-service\` to increase memory limits, ArgoCD immediately detects the divergence between Git and the live cluster, flags the application as **OutOfSync**, and within seconds overwrites the manual edit, restoring the declared Git baseline.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/MeU5_k9ss5Y" title="ArgoCD Tutorial - GitOps on Kubernetes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-020",
      courseId: "CRS-DVO-001",
      sequence: 20,
      title: "Service Meshes with Istio, Envoy & Zero-Trust Security",
      description: "Deploy Istio service mesh: Envoy sidecar proxies, traffic shaping, canary routing, circuit breaking, mTLS encryption, and distributed tracing.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Service Meshes with Istio, Envoy & Zero-Trust Security

As microservice architectures scale to hundreds of interacting services, handling cross-cutting concerns—such as mutual TLS (mTLS) encryption, traffic routing, retries, circuit breaking, and distributed telemetry—inside application code creates unmaintainable library bloat. A **Service Mesh** offloads these capabilities to dedicated network sidecars.

---

## 1. Istio Architecture: Control Plane vs. Data Plane

\`\`\`
+--------------------------------------------------------------------------+
| CONTROL PLANE: istiod (Pilot, Citadel, Galley)                           |
| - Compiles high-level routing rules into Envoy configuration             |
| - Manages CA and issues X.509 certificates for zero-trust mTLS          |
+--------------------------------------------------------------------------+
                                    |
                    gRPC (xDS Protocol: LDS, RDS, CDS, EDS)
                                    v
+--------------------------------------------------------------------------+
| DATA PLANE (In-Pod Envoy Sidecar Proxies)                                |
|                                                                          |
|  [ Pod: Service A ]                         [ Pod: Service B ]           |
|  +-------------+    localhost    +-------+  +-------+    +-------------+ |
|  | App Service | <-------------> | Envoy |  | Envoy | -> | App Service | |
|  +-------------+                 | Proxy |  | Proxy |    +-------------+ |
|                                  +-------+  +-------+                    |
|                                      |          ^                        |
|                                      +----------+                        |
|                                  Mutual TLS (mTLS)                       |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Advanced Traffic Routing: 90/10 Canary Splitting

Using Istio **VirtualService** and **DestinationRule**, traffic can be split deterministically across versions without changing frontend code:

\`\`\`yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: payment-routing
  namespace: payments
spec:
  hosts:
    - payment-service
  http:
    - route:
        - destination:
            host: payment-service
            subset: v1
          weight: 90
        - destination:
            host: payment-service
            subset: v2-canary
          weight: 10
\`\`\`

---

## 3. Circuit Breaking & Fault Injection

Protect upstream services from cascading failures during outages:
\`\`\`yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: payment-circuit-breaker
spec:
  host: payment-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
    outlierDetection:
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/16fgzklcF7Y" title="Istio Service Mesh Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-021",
      courseId: "CRS-DVO-001",
      sequence: 21,
      title: "Kubernetes Security Hardening & Policy Governance",
      description: "Implement Role-Based Access Control (RBAC), Pod Security Standards (PSS), NetworkPolicies, and policy-as-code with Kyverno and OPA Gatekeeper.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Kubernetes Security Hardening & Policy Governance

Securing a multi-tenant Kubernetes cluster requires defense-in-depth across multiple operational layers: user authorization (RBAC), network segmentation (NetworkPolicies), container runtime privileges (Pod Security Standards), and policy-as-code admission gates.

---

## 1. Role-Based Access Control (RBAC) Matrix

\`\`\`
+--------------------+        Bound via        +--------------------+
| Subject            | ----------------------> | Role / ClusterRole |
| (User, Group,      |      RoleBinding or     | (Rules: verbs on   |
| ServiceAccount)    |   ClusterRoleBinding    |  API resources)    |
+--------------------+                         +--------------------+
\`\`\`

### Principle of Least Privilege Role:
\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployment-operator
  namespace: staging
rules:
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets"]
    verbs: ["get", "list", "watch", "update", "patch"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
\`\`\`

---

## 2. Pod Security Standards (PSS) Admission

Kubernetes replaces the legacy PodSecurityPolicy (PSP) with built-in **Pod Security Admission**:
- **Privileged:** Unrestricted; permits hostPID, hostNetwork, privileged containers.
- **Baseline:** Minimally restrictive; blocks known privilege escalations while allowing default configurations.
- **Restricted:** Hardened; mandates non-root execution, drops all capabilities except \`NET_BIND_SERVICE\`, restricts volume types.

Enforced via namespace labels:
\`\`\`yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
\`\`\`

---

## 3. Network Segmentation with NetworkPolicies

By default, Kubernetes pods accept traffic from any source. A **Default Deny** policy establishes zero-trust network boundaries:

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
\`\`\`

---

## 4. Policy-as-Code with Kyverno

Enforce organizational guardrails declaratively in Kubernetes YAML:
\`\`\`yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: disallow-root-user
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-runAsNonRoot
      match:
        resources:
          kinds: [Pod]
      validate:
        message: "Running as root is forbidden! Set runAsNonRoot: true"
        pattern:
          spec:
            containers:
              - securityContext:
                  runAsNonRoot: true
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/Ptz93z_K94Q" title="Kubernetes Security Best Practices & RBAC" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-DVO-015",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-015",
      title: "Kubernetes Configuration & Secrets Management Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-141",
          type: "MCQ",
          prompt: "Why is committing native Kubernetes Secret YAML manifests directly into a Git repository considered a severe security anti-pattern?",
          options: [
            "Because the 'data' fields in native Secrets are merely Base64-encoded plain text, providing zero encryption protection",
            "Because Git repositories cannot store files containing the word 'secret'",
            "Because Kubernetes deletes Secrets if they originate from Git",
            "Because Base64 strings corrupt the Git commit graph"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-142",
          type: "MCQ",
          prompt: "What is the primary role of the External Secrets Operator (ESO) in Kubernetes platforms?",
          options: [
            "It synchronizes secrets securely from enterprise secret management systems (e.g., AWS Secrets Manager, HashiCorp Vault) directly into native Kubernetes Secrets in-memory",
            "It sends database credentials via email to developers",
            "It automatically rotates user passwords every 5 minutes",
            "It compresses ConfigMap files using GZIP"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-143",
          type: "MCQ",
          prompt: "How does Bitnami 'Sealed Secrets' solve the problem of storing credentials in Git repositories?",
          options: [
            "It encrypts secrets using asymmetric public-key cryptography that can only be decrypted by the Sealed Secrets controller running inside the target cluster",
            "It stores secrets on an encrypted USB thumb drive plugged into the master node",
            "It converts credentials into randomized QR codes",
            "It hides secrets inside image EXIF metadata"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-144",
          type: "MCQ",
          prompt: "What happens when a ConfigMap mounted as a Volume into a Pod is updated in the Kubernetes cluster?",
          options: [
            "The mounted configuration files inside the container are automatically updated asynchronously by kubelet within minutes without restarting the Pod",
            "The Pod immediately crashes with a kernel panic",
            "The cluster triggers an emergency rolling reboot of all nodes",
            "The changes are permanently ignored until the cluster is deleted"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-145",
          type: "MCQ",
          prompt: "What happens when a ConfigMap consumed via environment variables ('valueFrom.configMapKeyRef') is updated in the cluster?",
          options: [
            "The running container's environment variables do NOT update dynamically; the Pod must be restarted to inherit updated values",
            "The container environment variables update instantly in real time",
            "The API server throws a validation error and reverts the ConfigMap",
            "The worker node runs an automatic rolling restart"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-146",
          type: "MCQ",
          prompt: "Which Kubernetes feature allows encrypting native Secret resources at rest within the etcd datastore?",
          options: [
            "EncryptionConfiguration (providing KMS, aescbc, or secretbox providers)",
            "Kube-proxy iptables rule",
            "StorageClass volume expansion",
            "CoreDNS encryption plugin"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-147",
          type: "MCQ",
          prompt: "What type of Secret should be used to store SSL/TLS certificates and private keys used by Ingress controllers?",
          options: ["kubernetes.io/tls", "Opaque", "kubernetes.io/service-account-token", "bootstrap.kubernetes.io/token"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-148",
          type: "MCQ",
          prompt: "What is an 'immutable' ConfigMap or Secret (immutable: true)?",
          options: [
            "A resource whose data cannot be modified after creation, reducing kube-apiserver load by disabling watches and preventing accidental config tampering",
            "A resource that can never be deleted from the cluster",
            "A resource that only runs on read-only bare-metal hardware",
            "A secret that expires after 24 hours"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-149",
          type: "MCQ",
          prompt: "How does the HashiCorp Vault Agent Sidecar Injector deliver secrets to Kubernetes Pods?",
          options: [
            "By mutating the Pod to inject a sidecar container that authenticates via Kubernetes ServiceAccount tokens and writes rendered secret files to an in-memory shared volume (tmpfs)",
            "By broadcasting credentials over the Pod network using UDP",
            "By embedding passwords into environment variables during docker build",
            "By sending SMS verification codes to the pod"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-150",
          type: "MCQ",
          prompt: "What CLI utility is used to encrypt secrets locally using the public key of a Sealed Secrets controller?",
          options: ["kubeseal", "kubectl encrypt", "vault push", "trivy seal"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-016",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-016",
      title: "Kubernetes Storage Architecture & Persistent Workloads Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-151",
          type: "MCQ",
          prompt: "What is the difference between a PersistentVolume (PV) and a PersistentVolumeClaim (PVC)?",
          options: [
            "A PV is the actual provisioned storage resource in the cluster; a PVC is a user's request for storage with specific capacity and access modes",
            "A PV is temporary RAM; a PVC is persistent disk",
            "A PVC is created by cloud administrators; a PV is created by end users",
            "PVs are used for Windows; PVCs are used for Linux"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-152",
          type: "MCQ",
          prompt: "Which Persistent Volume access mode permits multiple nodes to mount the volume simultaneously for read and write operations?",
          options: ["ReadWriteMany (RWX)", "ReadWriteOnce (RWO)", "ReadOnlyMany (ROX)", "ReadWriteOncePod (RWOP)"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-153",
          type: "MCQ",
          prompt: "Why should AWS EBS gp3 volumes be mounted using 'ReadWriteOnce (RWO)' rather than 'ReadWriteMany (RWX)'?",
          options: [
            "Because AWS EBS is a block device that can only be attached to a single virtual machine instance at a time",
            "Because gp3 volumes do not support write operations",
            "Because RWO is 50% cheaper than RWX on AWS",
            "Because EBS volumes require optical fiber cables"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-154",
          type: "MCQ",
          prompt: "What does setting 'volumeBindingMode: WaitForFirstConsumer' in a StorageClass accomplish?",
          options: [
            "It delays volume provisioning until a Pod requesting the PVC is scheduled, ensuring the volume is created in the exact Availability Zone where the Pod will execute",
            "It prevents pods from writing data until a human user logs into the UI",
            "It waits for the pod to pass all unit tests before provisioning disk",
            "It formats the disk using NTFS file format"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-155",
          type: "MCQ",
          prompt: "What is the Container Storage Interface (CSI)?",
          options: [
            "A standardized specification enabling third-party storage vendors (AWS, NetApp, Portworx, Ceph) to develop storage plugins without modifying core Kubernetes source code",
            "A hardware motherboard slot for connecting SATA hard drives",
            "A graphical desktop user interface for viewing disk space",
            "A command-line tool for formatting flash drives"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-156",
          type: "MCQ",
          prompt: "What is the behavior of the PersistentVolume reclaim policy 'Retain' when its associated PVC is deleted?",
          options: [
            "The PV continues to exist in the cluster with all its data intact, allowing administrators to manually recover or archive the data",
            "The PV and its underlying cloud disk are instantly purged permanently",
            "The data is emailed to the namespace owner",
            "The volume is reformatted and assigned to the next available pod"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-157",
          type: "MCQ",
          prompt: "What Kubernetes feature allows expanding the size of an existing PVC without losing data?",
          options: [
            "Setting 'allowVolumeExpansion: true' in the StorageClass and editing the PVC's storage request spec",
            "Running 'fdisk /dev/sda' inside the application container",
            "Deleting the cluster and recreating it with larger disks",
            "Mounting two separate PVCs to the same directory"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-158",
          type: "MCQ",
          prompt: "Which tool is the industry standard for backing up, restoring, and performing disaster recovery of Kubernetes cluster resources and persistent volume data?",
          options: ["Velero", "Git", "Webpack", "Ansible"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-159",
          type: "MCQ",
          prompt: "What is an 'emptyDir' volume in Kubernetes?",
          options: [
            "An ephemeral volume created when a Pod is assigned to a node that shares the Pod's lifecycle; it is purged when the Pod terminates",
            "A volume reserved exclusively for empty files",
            "A permanent multi-region storage bucket",
            "A virtual optical CD-ROM drive"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-160",
          type: "MCQ",
          prompt: "How does a StatefulSet automatically generate dedicated PersistentVolumeClaims for each of its replicas?",
          options: [
            "Through the 'volumeClaimTemplates' array declared in the StatefulSet specification",
            "By invoking an external bash script during pod startup",
            "By duplicating the master node's root filesystem",
            "By asking the user for confirmation via CLI"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-017",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-017",
      title: "Kubernetes Advanced Scheduling & Multi-Dimensional Autoscaling Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-161",
          type: "MCQ",
          prompt: "What is the relationship between 'Taints' and 'Tolerations' in Kubernetes scheduling?",
          options: [
            "Taints are applied to Nodes to repel Pods; Tolerations are applied to Pods allowing them to be scheduled onto tainted nodes",
            "Taints are applied to Pods to make them run faster; Tolerations are applied to Nodes",
            "Taints delete unhealthy pods; Tolerations restart nodes",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-162",
          type: "MCQ",
          prompt: "What is the primary function of Pod Topology Spread Constraints?",
          options: [
            "To evenly distribute Pod replicas across failure domains (e.g., Availability Zones, regions, or racks) to prevent single-point-of-failure outages",
            "To compress pod network packets across wide area networks",
            "To schedule pods only during off-peak night hours",
            "To restrict pods to single-core CPUs"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-163",
          type: "MCQ",
          prompt: "What is the primary difference between Horizontal Pod Autoscaler (HPA) and Vertical Pod Autoscaler (VPA)?",
          options: [
            "HPA scales the number of Pod replicas up and down; VPA scales the CPU and Memory resource requests/limits of individual Pods",
            "HPA scales database disks; VPA scales network bandwidth",
            "HPA works on AWS; VPA works on GCP",
            "HPA requires manual human intervention; VPA is fully automatic"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-164",
          type: "MCQ",
          prompt: "Why should you exercise caution when running HPA and VPA simultaneously on the same metric (e.g., CPU utilization)?",
          options: [
            "They will enter a conflicting race condition where both try to scale the application simultaneously, causing thrashing and unstable oscillations",
            "Kubernetes API server will crash immediately",
            "VPA will delete the HPA controller",
            "It will consume 100% of node disk space"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-165",
          type: "MCQ",
          prompt: "How does Karpenter improve upon the traditional Kubernetes Cluster Autoscaler?",
          options: [
            "Karpenter bypasses cloud node groups, directly evaluating unscheduled pod specs and provisioning right-sized EC2 instances in under 45 seconds",
            "Karpenter runs without an AWS account",
            "Karpenter converts containers into virtual machines",
            "Karpenter eliminates the need for container images"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-166",
          type: "MCQ",
          prompt: "What is Pod Anti-Affinity commonly used for in production architectures?",
          options: [
            "Ensuring that replicas of the same critical microservice are never scheduled onto the same physical node or availability zone",
            "Preventing pods from communicating over the network",
            "Forcing pods to run only on master nodes",
            "Deleting pods if memory exceeds 50%"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-167",
          type: "MCQ",
          prompt: "What does the taint effect 'NoExecute' do to existing running pods that lack a matching toleration?",
          options: [
            "It immediately evicts them from the node",
            "It allows them to keep running, but blocks new pods from scheduling",
            "It reboots the container inside the pod",
            "It pauses the pod's CPU execution"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-168",
          type: "MCQ",
          prompt: "What metric provider must be deployed in the cluster to enable HPA to scale based on CPU and Memory usage?",
          options: ["metrics-server", "kube-state-metrics", "etcd-monitor", "cAdvisor standalone"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-169",
          type: "MCQ",
          prompt: "What is a Pod Disruption Budget (PDB)?",
          options: [
            "A policy limiting the number of Pod replicas of an application that can be voluntarily taken offline simultaneously during node draining or cluster upgrades",
            "A financial budget tracking cloud spend per pod",
            "A limit on how many log lines a pod can print per minute",
            "A quota on the total number of pods an engineer can create"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-170",
          type: "MCQ",
          prompt: "In Karpenter, what is 'Node Consolidation'?",
          options: [
            "Actively terminating underutilized nodes or replacing expensive instances with cheaper alternatives when workload demands decrease",
            "Merging two physical motherboards in a datacenter",
            "Compressing node log files into a zip archive",
            "Combining multiple Git branches into one"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-018",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-018",
      title: "Helm Package Management & Templating Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-171",
          type: "MCQ",
          prompt: "What is the primary role of the 'Chart.yaml' file in a Helm chart directory?",
          options: [
            "It specifies metadata about the chart, including its name, description, chart version (SemVer), and application version",
            "It stores database root passwords",
            "It contains the compiled binary of the application",
            "It configures the local developer's terminal color scheme"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-172",
          type: "MCQ",
          prompt: "What is the difference between 'chart version' and 'appVersion' in Helm's Chart.yaml?",
          options: [
            "'chart version' tracks the SemVer of the packaging templates; 'appVersion' tracks the version of the underlying application software being deployed",
            "'chart version' is for frontend code; 'appVersion' is for backend code",
            "'chart version' must match the Kubernetes cluster version",
            "There is no difference; they must always be identical"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-173",
          type: "MCQ",
          prompt: "What Go template pipeline function converts a YAML structure into indented text matching Kubernetes manifest requirements?",
          options: ["toYaml <values> | nindent <spaces>", "printYaml <values>", "indent <values> --format=yaml", "jsonToYaml <values>"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-174",
          type: "MCQ",
          prompt: "What does the command 'helm upgrade --install my-app ./chart --atomic' ensure?",
          options: [
            "If any resource fails to become ready within the timeout period, Helm automatically rolls back the release to the previous successful release revision",
            "It splits the deployment atom into nuclear energy",
            "It deletes all secrets in the namespace before installing",
            "It bypasses all Kubernetes admission controllers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-175",
          type: "MCQ",
          prompt: "What is the purpose of Helm Chart Hooks (e.g., 'helm.sh/hook: post-install')?",
          options: [
            "They allow triggering specialized actions (like running database migration jobs or clearing caches) at specific points in a release lifecycle",
            "They hook into the operating system kernel to capture packets",
            "They attach audio headphones to the server rack",
            "They automatically bill the client's credit card"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-176",
          type: "MCQ",
          prompt: "Which command renders the templates of a Helm chart locally to stdout without connecting to or mutating a live Kubernetes cluster?",
          options: ["helm template <release-name> ./chart", "helm render --local ./chart", "helm dry-run --no-k8s ./chart", "helm print ./chart"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-177",
          type: "MCQ",
          prompt: "Where does Helm 3 store release state and historical revision metadata inside the Kubernetes cluster?",
          options: [
            "In native Kubernetes Secrets within the release's target namespace",
            "In an external MySQL database",
            "Inside the Tiller master pod",
            "On local text files in /tmp on the developer's laptop"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-178",
          type: "MCQ",
          prompt: "Why was 'Tiller' removed in Helm 3?",
          options: [
            "Tiller ran with broad cluster-admin privileges, posing severe security risks; Helm 3 interacts directly with the Kubernetes API using the client's kubeconfig permissions",
            "Tiller was incompatible with 64-bit operating systems",
            "Tiller consumed more than 16 GB of memory per chart",
            "Google purchased Tiller and made it proprietary"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-179",
          type: "MCQ",
          prompt: "How can you pass values to override defaults in values.yaml directly from the command line?",
          options: ["--set key=value", "--override key=value", "--var key=value", "-param key=value"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-180",
          type: "MCQ",
          prompt: "What file in a Helm chart is used to define reusable partial templates and template helpers?",
          options: ["_helpers.tpl", "templates/main.go", "values.schema.json", "Chart.lock"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-019",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-019",
      title: "GitOps Continuous Delivery with ArgoCD & Flux Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-181",
          type: "MCQ",
          prompt: "What is the defining operational principle of GitOps?",
          options: [
            "Git is the single source of truth for declaratively desired infrastructure and applications, with in-cluster agents automatically synchronizing state",
            "Developers must write all deployment code in Git commit messages",
            "Deployments only happen once a year during holiday seasons",
            "Kubernetes clusters are prohibited from using container images"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-182",
          type: "MCQ",
          prompt: "Why is pull-based GitOps (ArgoCD/Flux) more secure than traditional push-based CI/CD pipelines (Jenkins/GitHub Actions)?",
          options: [
            "In GitOps, the in-cluster agent pulls changes; no broad cluster-admin credentials or kubeconfig tokens ever leave the cluster or get stored in external CI systems",
            "Pull-based GitOps encrypts all network packets using RSA-4096",
            "CI runners cannot execute bash scripts",
            "Git repositories require retinal scans to push code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-183",
          type: "MCQ",
          prompt: "What does the ArgoCD 'selfHeal: true' policy do when someone manually modifies a Deployment using 'kubectl edit'?",
          options: [
            "It immediately detects the configuration drift and reverts the live resource back to match the declared state in Git",
            "It sends a slack notification and deletes the entire cluster",
            "It commits the manual changes back into the Git repository automatically",
            "It pauses all network traffic for 10 minutes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-184",
          type: "MCQ",
          prompt: "What does setting 'prune: true' in an ArgoCD automated sync policy achieve?",
          options: [
            "It automatically deletes resources in the live Kubernetes cluster that have been removed from the Git repository",
            "It deletes old Docker images from the worker node disk",
            "It clears the browser cache of all developers",
            "It purges git history older than 30 days"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-185",
          type: "MCQ",
          prompt: "What is the primary Custom Resource Definition (CRD) used in ArgoCD to represent a deployed project?",
          options: ["Application", "GitRepoSync", "ClusterDeploy", "KubeWorkflow"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-186",
          type: "MCQ",
          prompt: "What pattern allows managing multi-environment Kubernetes manifests (dev, staging, prod) cleanly without code duplication in GitOps?",
          options: [
            "Kustomize overlays referencing a shared base manifest",
            "Creating 50 separate Git repositories for every environment",
            "Hardcoding IP addresses in README files",
            "Editing YAML files directly in the Kubernetes dashboard"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-187",
          type: "MCQ",
          prompt: "What is the role of an ArgoCD 'AppProject' resource?",
          options: [
            "It provides multi-tenant logical boundaries, restricting which Git source repositories, target clusters, and namespaces an Application can deploy to",
            "It tracks developer billing hours for client invoicing",
            "It compiles TypeScript source code into JavaScript",
            "It manages DNS records on Cloudflare"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-188",
          type: "MCQ",
          prompt: "How does the 'ApplicationSet' controller extend ArgoCD in enterprise multi-cluster environments?",
          options: [
            "It automates the generation of multiple ArgoCD Applications across hundreds of clusters and repositories using dynamic generators (e.g., Git, Matrix, Cluster)",
            "It sets the screen resolution for the ArgoCD web UI",
            "It connects ArgoCD to mobile phones via Bluetooth",
            "It runs automated security penetration tests against web servers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-189",
          type: "MCQ",
          prompt: "What tool is the primary GitOps alternative to ArgoCD, built as a set of composable Kubernetes controllers maintained by CNCF?",
          options: ["Flux (Flux v2)", "Spinnaker", "Chef", "Puppet"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-190",
          type: "MCQ",
          prompt: "What health status does ArgoCD display when all pod replicas in a Deployment are running and pass their readiness probes?",
          options: ["Healthy", "Synced", "Progressing", "Degraded"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-020",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-020",
      title: "Service Meshes with Istio, Envoy & Zero-Trust Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-191",
          type: "MCQ",
          prompt: "What is the core architectural division in an Istio Service Mesh?",
          options: [
            "The Control Plane (istiod) managing configuration and certificates, and the Data Plane consisting of Envoy sidecar proxies running alongside applications",
            "Frontend React UI and Backend Python Flask API",
            "Bare-metal hardware and cloud virtualization",
            "Master database and read replicas"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-192",
          type: "MCQ",
          prompt: "How does Istio achieve zero-trust encryption for all service-to-service communication?",
          options: [
            "Through automatic mutual TLS (mTLS), where Envoy sidecars authenticate each other using short-lived X.509 certificates issued and rotated by istiod",
            "By encrypting the physical Ethernet cables in the datacenter",
            "By requiring users to enter passwords on every HTTP request",
            "By tunneling all traffic through an external commercial VPN"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-193",
          type: "MCQ",
          prompt: "What is the difference between an Istio 'VirtualService' and a 'DestinationRule'?",
          options: [
            "VirtualService defines traffic routing rules (paths, canary weights, headers); DestinationRule defines policies applied to traffic after routing occurs (subsets, mTLS, circuit breaking)",
            "VirtualService runs on VMs; DestinationRule runs in containers",
            "DestinationRule is for ingress; VirtualService is for egress only",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-194",
          type: "MCQ",
          prompt: "How does Istio enable canary deployments without deploying separate ingress hostnames?",
          options: [
            "By assigning percentage-based traffic weights (e.g., 90% v1, 10% v2) inside a VirtualService routing specification",
            "By rebooting the cluster until the new version takes over",
            "By changing DNS A records every 10 seconds",
            "By blocking users with odd-numbered IP addresses"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-195",
          type: "MCQ",
          prompt: "What is 'Circuit Breaking' in service mesh resilience patterns?",
          options: [
            "A pattern where Envoy stops forwarding requests to a failing service instance after consecutive errors, allowing it time to recover and preventing cascading cluster failure",
            "A physical safety breaker that cuts electrical power to the server rack",
            "A software bug that disconnects network cables",
            "A tool that permanently deletes broken code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-196",
          type: "MCQ",
          prompt: "What high-performance open-source C++ proxy forms the data plane foundation of Istio?",
          options: ["Envoy", "Apache HTTP Server", "HAProxy", "Squid"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-197",
          type: "MCQ",
          prompt: "What protocol does istiod use to dynamically stream routing tables, endpoints, and cluster configurations to Envoy sidecars?",
          options: ["Envoy Discovery Service (xDS) over gRPC", "FTP file transfer", "HTTP/1.0 polling", "BGP routing tables"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-198",
          type: "MCQ",
          prompt: "How does Istio inject Envoy sidecars into application pods automatically?",
          options: [
            "Via a Mutating Admission Webhook that intercepts pod creation requests when the namespace has the label 'istio-injection: enabled'",
            "By requiring developers to manually write the Envoy container in every deployment YAML",
            "By compiling Envoy into the Linux kernel",
            "Through a scheduled cron job"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-199",
          type: "MCQ",
          prompt: "What distributed tracing headers must application code propagate between microservices to enable Istio tracing (e.g., in Jaeger/Zipkin)?",
          options: [
            "W3C Trace Context (traceparent, tracestate) or B3 headers (x-request-id, x-b3-traceid, x-b3-spanid)",
            "Authorization: Bearer tokens only",
            "Content-Type: application/json",
            "User-Agent headers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-200",
          type: "MCQ",
          prompt: "What is 'Fault Injection' in Istio testing strategies?",
          options: [
            "Deliberately injecting artificial HTTP delays (e.g., 5-second latency) or error codes (e.g., HTTP 503) via Envoy to verify application fault tolerance",
            "Injecting SQL syntax errors into the database",
            "Unplugging network switches during business hours",
            "Overheating the CPU to test cooling fans"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-021",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-021",
      title: "Kubernetes Security Hardening & Policy Governance Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-201",
          type: "MCQ",
          prompt: "What is the difference between a Kubernetes 'Role' and a 'ClusterRole' in RBAC?",
          options: [
            "A Role grants permissions within a specific namespace; a ClusterRole grants cluster-wide permissions across all namespaces or on non-namespaced resources (like Nodes)",
            "A Role is for developers; a ClusterRole is for project managers",
            "A Role requires an SSL certificate; a ClusterRole uses a password",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-202",
          type: "MCQ",
          prompt: "Under the Kubernetes Pod Security Standards (PSS), which profile provides the highest level of security hardening (disallowing root, dropping capabilities)?",
          options: ["Restricted", "Baseline", "Privileged", "Default"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-203",
          type: "MCQ",
          prompt: "What is the default network security posture in a Kubernetes cluster before any NetworkPolicies are applied?",
          options: [
            "All Pods can communicate with all other Pods across all namespaces without restriction (Allow All)",
            "All Pod communication is blocked until an administrator approves it (Deny All)",
            "Pods can only communicate with pods on the same worker node",
            "Only pods with matching labels can talk to each other"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-204",
          type: "MCQ",
          prompt: "How can you establish a 'Default Deny All Ingress' security posture for a namespace using NetworkPolicy?",
          options: [
            "Create a NetworkPolicy selecting all pods ('podSelector: {}') with 'policyTypes: [Ingress]' and an empty 'ingress: []' rules list",
            "Delete the CNI plugin from the cluster",
            "Set namespace quota to zero pods",
            "Turn off the power to the network switch"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-205",
          type: "MCQ",
          prompt: "What is the primary difference between Kyverno and OPA (Open Policy Agent) Gatekeeper for Kubernetes policy-as-code?",
          options: [
            "Kyverno allows writing policies in standard Kubernetes YAML; OPA Gatekeeper requires learning a specialized domain-specific query language called Rego",
            "Kyverno is written in Python; OPA is written in Java",
            "OPA Gatekeeper cannot enforce policies at admission",
            "Kyverno only functions on Google Cloud"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-206",
          type: "MCQ",
          prompt: "In a container securityContext, what does setting 'readOnlyRootFilesystem: true' prevent?",
          options: [
            "It prevents attackers or compromised code from writing, altering, or executing binaries in the container root filesystem, enforcing storage immutability",
            "It prevents the container from reading database records",
            "It disables application logs from being output to stdout",
            "It prevents users from downloading files via HTTP"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-207",
          type: "MCQ",
          prompt: "Why should you explicitly set 'allowPrivilegeEscalation: false' in production Pod security contexts?",
          options: [
            "It ensures that child processes cannot gain more privileges than their parent process (blocking SUID binary exploits)",
            "It prevents developers from requesting salary raises in the portal",
            "It turns off Kubernetes rolling updates",
            "It limits container CPU utilization to 1 core"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-208",
          type: "MCQ",
          prompt: "Which command runs an automated CIS Kubernetes Benchmark audit against a live cluster to detect security misconfigurations?",
          options: ["kube-bench", "kube-lint", "kubectl audit", "trivy k8s --all"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-209",
          type: "MCQ",
          prompt: "What is a ServiceAccount in Kubernetes?",
          options: [
            "An identity created within the cluster that processes running inside a Pod can use to authenticate with the kube-apiserver",
            "A corporate billing account for paying AWS invoices",
            "An email address assigned to customer support agents",
            "A user login for accessing the Kubernetes Slack community"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-210",
          type: "MCQ",
          prompt: "Why should 'automountServiceAccountToken: false' be configured on Pods that do not require access to the Kubernetes API?",
          options: [
            "To prevent compromised containers from harvesting the ServiceAccount JWT token from /var/run/secrets/kubernetes.io/serviceaccount and querying the cluster API",
            "To speed up container boot time by 30 seconds",
            "Because mounting tokens consumes 1 GB of memory",
            "Because tokens expire every 60 seconds"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

