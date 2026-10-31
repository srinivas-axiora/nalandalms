// Course 8: DevOps Engineering Masterclass - Phase 2: Containerization & Cloud Native Architecture
// Chapters 8 to 14 | Assessments 8 to 14 | 70 MCQs

export const phase2 = {
  chapters: [
    {
      id: "CH-DVO-008",
      courseId: "CRS-DVO-001",
      sequence: 8,
      title: "Container Internals, OCI Standards & Linux Primitives",
      description: "Deconstruct container engines to Linux primitives: Namespaces, cgroups v2, OverlayFS union filesystems, OCI specifications, runc, and containerd.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Container Internals, OCI Standards & Linux Primitives

A container is not an emulation hypervisor; it is an ordinary Linux process running in an isolated execution sandbox. Deep mastery of low-level container anatomy—specifically the Open Container Initiative (OCI) standards, runtimes, and union filesystems—is essential for high-performance systems engineering.

---

## 1. The Container Stack Anatomy

\`\`\`
+--------------------------------------------------------------------------+
| High-Level Engine / Orchestrator: Docker CLI / Kubernetes (Kubelet)      |
+--------------------------------------------------------------------------+
                                    |
                    CRI (Container Runtime Interface) / gRPC
                                    v
+--------------------------------------------------------------------------+
| High-Level Runtime: containerd / CRI-O                                   |
| - Image pull & unpack                                                    |
| - Storage & Snapshotter management                                       |
| - Rootfs preparation & networking setup                                  |
+--------------------------------------------------------------------------+
                                    |
                    OCI Runtime Spec / execution invocation
                                    v
+--------------------------------------------------------------------------+
| Low-Level Runtime: runc / crun                                           |
| - Invokes clone(), setns(), pivot_root()                                 |
| - Configures cgroups and security profiles (seccomp, AppArmor)           |
| - Starts user process and exits                                          |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Linux Kernel: Namespaces | cgroups v2 | OverlayFS | Seccomp | Capabilities|
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Union Filesystems: OverlayFS in Action

Docker and containerd use **OverlayFS** to layer read-only image layers under a single mutable read-write container layer:

\`\`\`
+--------------------------------------------------------------------------+
| MERGED VIEW (/merged)  --> Unified filesystem exposed to the container   |
+--------------------------------------------------------------------------+
| UPPER LAYER (/upper)   --> Ephemeral read-write layer (Container changes)|
+--------------------------------------------------------------------------+
| WORKDIR (/work)        --> Internal kernel scratchpad for atomic ops     |
+--------------------------------------------------------------------------+
| LOWER LAYERS (/lower)  --> Immutable read-only image layers (Stacked)    |
|   Layer 3: Application binary & dependencies                             |
|   Layer 2: Python / Node runtime                                         |
|   Layer 1: Base OS (Ubuntu / Alpine / Debian-slim)                       |
+--------------------------------------------------------------------------+
\`\`\`

### Copy-on-Write (CoW) Semantics:
- When a container reads a file, it reads directly from the lowest image layer containing it.
- When a container modifies an existing image file, the kernel copies the entire file up to the **Upper** layer first before applying changes. Modifying massive files (e.g., 10 GB databases) inside an unmounted CoW layer causes severe I/O degradation.

---

## 3. Creating a Container from Scratch with Bash

Understanding the kernel boundaries becomes trivial when inspecting how simple Linux commands assemble a container:

\`\`\`bash
# Create isolated root filesystem
mkdir -p /tmp/mycontainer/rootfs
tar -xf alpine-rootfs.tar.gz -C /tmp/mycontainer/rootfs

# Execute process inside new PID, Mount, UTS, IPC, and Network namespaces
unshare --mount --uts --ipc --net --pid --fork chroot /tmp/mycontainer/rootfs /bin/sh
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/gT5e-lY2g3g" title="What are Containers Really? Linux Namespaces & Cgroups" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-009",
      courseId: "CRS-DVO-001",
      sequence: 9,
      title: "Dockerfile Engineering, Multi-Stage Builds & Distroless Hardening",
      description: "Author minimal, ultra-secure production containers using multi-stage builds, non-root security users, cache mounts, and Trivy CVE scanning.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Dockerfile Engineering, Multi-Stage Builds & Distroless Hardening

Bloated container images consume gigabytes of bandwidth, slow down autoscaling, and expose massive attack surfaces filled with package managers, compilers, and curl utilities that attackers leverage during zero-day exploits.

---

## 1. Multi-Stage Build Pattern with Distroless Base

A multi-stage build separates the heavy compilation environment (SDKs, build tools, package managers) from the lean runtime container:

\`\`\`dockerfile
# ==========================================
# Stage 1: Build & Dependency Resolution
# ==========================================
FROM golang:1.22-alpine AS builder

WORKDIR /build

# Leverage Docker layer caching for dependencies
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \\
    go mod download

COPY . .

# Compile static binary with zero CGO dependencies
RUN --mount=type=cache,target=/root/.cache/go-build \\
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \\
    go build -ldflags="-w -s" -o /build/api-server ./cmd/server

# ==========================================
# Stage 2: Hardened Production Runtime
# ==========================================
# Google Distroless contains only runtime dependencies; zero shell, zero package manager
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

# Copy compiled binary from builder stage
COPY --from=builder --chown=nonroot:nonroot /build/api-server /app/api-server

# Enforce non-root execution (UID 65532)
USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/app/api-server"]
\`\`\`

---

## 2. Dockerfile Optimization Rules & Impact

| Best Practice Directive | Security & Performance Rationale |
|---|---|
| **\`RUN --mount=type=cache\`** | Persists package manager caches across local builds without baking them into final layers. |
| **Order from least to most frequent change** | Put \`COPY package.json\` and \`RUN npm ci\` before \`COPY . .\` so code edits don't invalidate heavy dependency layers. |
| **Combine RUN commands with \`&&\`** | Reduces the total count of intermediate layers created in the image manifest. |
| **Distroless or Scratch bases** | Eliminates package managers (\`apt\`, \`apk\`), shells (\`/bin/sh\`, \`/bin/bash\`), and standard utilities, disabling 99% of script injection vectors. |
| **Explicit Non-Root User** | Prevents container breakouts from inheriting host UID 0 root privileges if an escape vulnerability occurs. |

---

## 3. Automated Vulnerability Scanning with Trivy

Incorporate image security verification directly into the CI pipeline:

\`\`\`bash
# Scan container image and fail build if CRITICAL CVEs exist
trivy image --exit-code 1 --severity CRITICAL,HIGH mycompany/api-server:latest
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/JofsaZ3H1qM" title="Docker Multi-Stage Builds & Best Practices" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-010",
      courseId: "CRS-DVO-001",
      sequence: 10,
      title: "Docker Compose, Microservices Emulation & Local Multi-Service Stacks",
      description: "Orchestrate local microservice ecosystems with Docker Compose: custom bridge networks, volume mounts, dependency healthchecks, and secrets.",
      contentType: "Rich Text",
      durationMinutes: 70,
      minimumTimeMinutes: 45,
      body: `
# Docker Compose, Microservices Emulation & Local Stacks

Developing distributed microservices locally requires replicating real-world network topographies, database instances, and caching layers with deterministic startup orchestration.

---

## 1. Enterprise Docker Compose Architecture

\`\`\`yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: local-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend-net
    secrets:
      - db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: local-redis
    networks:
      - backend-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 2s
      retries: 3

  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: local-api
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://devuser:supersecret@db:5432/appdb
      REDIS_HOST: redis
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend-net
      - frontend-net
    volumes:
      - ./src:/app/src # Hot reload mount

networks:
  backend-net:
    driver: bridge
  frontend-net:
    driver: bridge

volumes:
  pgdata:
    driver: local

secrets:
  db_password:
    file: ./secrets/db_password.txt
\`\`\`

---

## 2. Compose Networking & Service Discovery

Inside Docker Compose custom bridge networks:
1. Docker installs an embedded DNS resolver at \`127.0.0.11\`.
2. Services resolve each other by their **Service Name** (e.g., \`curl http://db:5432\`).
3. Services attached only to \`backend-net\` cannot be addressed from outside the host or from containers situated solely on \`frontend-net\`.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/HG6yLvZZXvw" title="Docker Compose in 20 Minutes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-011",
      courseId: "CRS-DVO-001",
      sequence: 11,
      title: "Container Registry Architecture, Image Signing & Cryptographic Supply Chain",
      description: "Implement secure OCI artifact registries: Harbor, AWS ECR, Cosign cryptographic signing, tag immutability, and admission gating.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Container Registry Architecture, Image Signing & Supply Chain

An enterprise container registry is not just a storage bucket for tarballs; it is the ultimate checkpoint for supply chain security. Untrusted or mutated container images running in production present critical remote code execution vectors.

---

## 1. OCI Image Manifest & Digest Verification

Images are referenced either by **Tags** (which are mutable pointers like \`latest\` or \`v1.2.0\`) or by **Digests** (which are immutable SHA-256 cryptographic hashes).

\`\`\`
MUTABLE POINTER:    myregistry.io/org/api:v1.2.0 (Can be overwritten tomorrow!)
IMMUTABLE DIGEST:   myregistry.io/org/api@sha256:7b9c1e4f... (Byte-for-byte permanent)
\`\`\`

---

## 2. Cryptographic Signing with Sigstore Cosign

**Sigstore Cosign** enables passwordless or key-based signing of container images directly in the registry without needing to rebuild or push extra layers:

\`\`\`bash
# Generate keypair
cosign generate-key-pair

# Sign container image stored in Amazon ECR or Harbor
cosign sign --key cosign.key 123456789012.dkr.ecr.us-east-1.amazonaws.com/core-api:v2.1.0

# Verify signature prior to deployment
cosign verify --key cosign.pub 123456789012.dkr.ecr.us-east-1.amazonaws.com/core-api:v2.1.0
\`\`\`

---

## 3. Enterprise Harbor Registry Governance

When hosting an enterprise registry using CNCF Harbor:
- **Tag Immutability Rules:** Prevent developers or CI pipelines from ever overwriting existing version tags.
- **Vulnerability Scanning Gate:** Automatically reject image pulls in Kubernetes if an image has unfixed CVEs above a CVSS threshold of 7.0.
- **Retention Policies:** Purge untagged development image digests after 14 days to recover storage.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Sigstore Cosign & Container Security" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-012",
      courseId: "CRS-DVO-001",
      sequence: 12,
      title: "Kubernetes Architecture & Core Control Plane Anatomy",
      description: "Master the Kubernetes architecture: API Server, etcd distributed consensus, Scheduler, Controller Manager, kubelet, kube-proxy, and CRI.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Kubernetes Architecture & Core Control Plane Anatomy

Kubernetes is a declarative, state-reconciling distributed operating system. Rather than executing imperative commands, users declare a **Desired State** in YAML, and the control plane constantly executes reconciliation loops to align the **Observed State** with that Desired State.

---

## 1. Master Control Plane & Worker Node Anatomy

\`\`\`
+--------------------------------------------------------------------------+
| CONTROL PLANE (Master Nodes)                                             |
|                                                                          |
|       +----------------------------------------------------------+       |
|       |                     kube-apiserver                       |       |
|       | (Hub of the cluster; validates, mutates, authenticates)  |       |
|       +----------------------------------------------------------+       |
|               ^                      ^                    ^              |
|               |                      |                    |              |
|               v                      v                    v              |
|       +---------------+      +----------------+   +------------------+   |
|       |     etcd      |      | kube-scheduler |   |  kube-controller |   |
|       | (Raft btree)  |      | (Pod placement)|   |  manager         |   |
|       +---------------+      +----------------+   +------------------+   |
+--------------------------------------------------------------------------+
                                    |
                        TLS / HTTPS / gRPC Channels
                                    v
+--------------------------------------------------------------------------+
| WORKER NODES (Compute Capacity)                                          |
|                                                                          |
|   +------------------------------------------------------------------+   |
|   | kubelet (Node Agent; interacts with CRI, executes PodSpecs)      |   |
|   +------------------------------------------------------------------+   |
|   +------------------------------------------------------------------+   |
|   | kube-proxy (Manages IP routing & iptables/IPVS service rules)    |   |
|   +------------------------------------------------------------------+   |
|   +------------------------------------------------------------------+   |
|   | Container Runtime (containerd / CRI-O)                           |   |
|   +------------------------------------------------------------------+   |
|   +------------------------------------------------------------------+   |
|   | CNI Plugin (Calico, Cilium, Flannel)                             |   |
|   +------------------------------------------------------------------+   |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Deep Dive: The etcd Distributed Store

All cluster state (Pods, Secrets, ConfigMaps, CRDs) is stored exclusively in **etcd**, a strongly consistent, distributed key-value store using the **Raft consensus algorithm**.
- **Quorum Requirement:** To survive $F$ node failures, an etcd cluster requires $2F + 1$ members (e.g., 3 nodes can tolerate 1 failure; 5 nodes can tolerate 2 failures).
- **Direct Access Restriction:** No component ever speaks directly to etcd except the \`kube-apiserver\`.

---

## 3. The Kubernetes Reconciliation Loop Paradigm

Every controller (Deployment Controller, ReplicaSet Controller, Node Controller) runs an infinite declarative control loop:

$$\\text{Loop:} \\quad \\text{Observe State} \\longrightarrow \\text{Compute Delta} \\longrightarrow \\text{Reconcile (Actuate)}$$

If a node crashes, taking 10 Pods offline:
1. Node Controller detects lease heartbeat timeout (40s default).
2. ReplicaSet Controller notices current replicas (2) < desired replicas (3).
3. ReplicaSet Controller posts a request to API Server to create a new Pod.
4. Kube-scheduler selects an available, healthy worker node.
5. Kubelet on that target node receives the PodSpec and instructs containerd to pull the image and launch the container.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/umXEmn3cMWY" title="Kubernetes Architecture Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-013",
      courseId: "CRS-DVO-001",
      sequence: 13,
      title: "Core Kubernetes Workloads & Declarative Primitives",
      description: "Master Pods lifecycle, Deployments, rolling updates, rollbacks, DaemonSets, StatefulSets, Jobs, and CronJobs.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Core Kubernetes Workloads & Declarative Primitives

Workload resources define how containers scale, execute, and recover across a compute cluster. Choosing the correct controller determines how state, networking, and rolling deployments behave.

---

## 1. Workload Controller Taxonomy

| Workload Resource | Primary Use Case | State & Scaling Model |
|---|---|---|
| **Pod** | Smallest deployable unit; 1 or more tightly coupled containers sharing network & IPC. | Ephemeral; never created directly in production. |
| **Deployment** | Stateless microservices, APIs, frontend web apps. | Declarative rolling updates, pauses, rollbacks, and horizontal scaling. |
| **StatefulSet** | Databases (PostgreSQL, Kafka, Cassandra, ZooKeeper). | Stable network identity (\`db-0\`, \`db-1\`), ordered deployment, dedicated persistent storage. |
| **DaemonSet** | System agents running on every node (Fluentbit, Promtail, Calico, Datadog). | Exactly 1 copy per matching cluster worker node. |
| **Job / CronJob** | One-off batch processing, DB migrations, scheduled nightly tasks. | Executes to completion (\`restartPolicy: OnFailure\`) rather than running continuously. |

---

## 2. Production Deployment Specification

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: production
  labels:
    app: order-service
spec:
  replicas: 3
  revisionHistoryLimit: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # Allow 25% extra pods during rollout
      maxUnavailable: 0     # Zero downtime guarantee
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: app
          image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/order-service:v2.1.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
          # Health & Liveness Probes
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            failureThreshold: 30
            periodSeconds: 2
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            periodSeconds: 5
\`\`\`

---

## 3. Rollouts & Rollbacks

\`\`\`bash
# Inspect rolling update progress in real-time
kubectl rollout status deployment/order-service -n production

# View historical revisions
kubectl rollout history deployment/order-service -n production

# Roll back immediately to the previous revision
kubectl rollout undo deployment/order-service -n production
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/VnvRFRk_51k" title="Kubernetes Deployment Strategies" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-014",
      courseId: "CRS-DVO-001",
      sequence: 14,
      title: "Kubernetes Networking & Ingress Controllers",
      description: "Master Pod-to-Pod CNI routing (Calico, Cilium), Services (ClusterIP, NodePort, LoadBalancer), and Ingress Controllers.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Kubernetes Networking & Ingress Controllers

Networking in Kubernetes is governed by the **IP-per-Pod** model. Every Pod receives its own routable IP address within the cluster without needing port mappings, allowing containers to treat inter-pod communication identically to VM-to-VM communication.

---

## 1. The Kubernetes Network Model (CNI)

Three fundamental rules enforced by Container Network Interface (CNI) plugins (e.g., Calico, Cilium, AWS VPC CNI):
1. All Pods can communicate with all other Pods on any node without NAT.
2. All agents on a node (kubelet) can communicate with all Pods on that node.
3. The IP that a Pod sees as its own is the same IP that other Pods see for it.

---

## 2. Kubernetes Service Primitives

Pods are ephemeral; their IPs change every time they recreate. **Services** provide a stable virtual IP (ClusterIP) and DNS entry load-balanced across matching Pod endpoints.

\`\`\`
Client Pod ---> Service (ClusterIP: 10.96.0.10:80)
                     |
         +-----------+-----------+ (kube-proxy iptables / IPVS / eBPF)
         |                       |
         v                       v
Pod Endpoints: 10.244.1.5:8080   Pod Endpoints: 10.244.2.9:8080
\`\`\`

### Service Types:
- **ClusterIP (Default):** Exposes service on a cluster-internal virtual IP. Reachable only within the cluster.
- **NodePort:** Allocates a high port (range 30000–32767) on *every* worker node's physical IP address.
- **LoadBalancer:** Requests a cloud-provider external load balancer (AWS NLB/ALB, GCP Cloud LB) that routes to the NodePort.
- **ExternalName:** Maps the service to a CNAME DNS record (e.g., \`database.rds.amazonaws.com\`).

---

## 3. Ingress Controllers & L7 Path Routing

An **Ingress** resource manages HTTP/HTTPS routing into cluster services based on hostnames and URL paths, terminating SSL/TLS certificates at the perimeter.

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - api.enterprise.com
      secretName: api-tls-cert
  rules:
    - host: api.enterprise.com
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service:
                name: order-service
                port:
                  number: 80
          - path: /users
            pathType: Prefix
            backend:
              service:
                name: user-service
                port:
                  number: 80
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/80Ew_fsV4rM" title="Kubernetes Services & Ingress Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-DVO-008",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-008",
      title: "Container Internals & OCI Standards Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-071",
          type: "MCQ",
          prompt: "What is the key functional distinction between high-level container runtimes (e.g., containerd, CRI-O) and low-level runtimes (e.g., runc)?",
          options: [
            "High-level runtimes manage image pulls, unpacking, and API requests; low-level runtimes interface directly with the kernel to configure namespaces, cgroups, and execute containers",
            "High-level runtimes run on Windows; low-level runtimes run on Linux",
            "Low-level runtimes compile source code into machine binaries",
            "High-level runtimes run exclusively inside the CPU BIOS"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-072",
          type: "MCQ",
          prompt: "In the OverlayFS union filesystem, how does Copy-on-Write (CoW) behave when a container modifies a file originating from a read-only lower layer?",
          options: [
            "The file is copied in its entirety from the lower layer up to the upper read-write layer before modifications are written",
            "The lower layer file is modified in-place, affecting all other containers sharing that image",
            "The file is encrypted with a private key and written to RAM",
            "The container throws a segmentation fault"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-073",
          type: "MCQ",
          prompt: "Which Linux system call is invoked by container runtimes to create a new process with its own dedicated namespaces?",
          options: ["clone()", "fork()", "execve()", "malloc()"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-074",
          type: "MCQ",
          prompt: "What is the primary role of the Open Container Initiative (OCI) Image and Runtime Specifications?",
          options: [
            "To establish vendor-neutral industry standards ensuring any OCI-compliant container image can be executed by any OCI-compliant runtime",
            "To provide free cloud hosting for open-source repositories",
            "To replace TCP/IP with an encrypted quantum network protocol",
            "To mandate that all containers must be written in Go"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-075",
          type: "MCQ",
          prompt: "Which Linux security module restricts the specific system calls (e.g., preventing reboot() or ptrace()) that a containerized process can invoke?",
          options: ["Seccomp (Secure Computing Mode)", "Netfilter", "cgroups v2", "Cron"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-076",
          type: "MCQ",
          prompt: "What happens to data written inside a container's writable layer (OverlayFS upperdir) when the container is deleted via 'docker rm'?",
          options: [
            "The writable layer is permanently purged from the host filesystem",
            "The data is automatically committed into a new image layer",
            "The data is archived to an external NFS mount",
            "The data is sent to the Linux kernel ring buffer"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-077",
          type: "MCQ",
          prompt: "What does the 'pivot_root' system call accomplish during container initialization?",
          options: [
            "It moves the current root filesystem to an old directory and makes the new container rootfs directory the current process root",
            "It rotates SSL certificates on the host machine",
            "It switches the active CPU core assigned to the process",
            "It reverses the sorting order of process priority queues"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-078",
          type: "MCQ",
          prompt: "Why should you avoid storing high-throughput relational database data inside a container's root filesystem (OverlayFS)?",
          options: [
            "Because the Copy-on-Write layer introduces significant I/O latency and CPU overhead compared to direct host block volumes",
            "Because OverlayFS only supports files up to 64 kilobytes",
            "Because databases cannot open TCP sockets inside containers",
            "Because relational databases require Windows Server"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-079",
          type: "MCQ",
          prompt: "Which Linux capability is required if a container needs to modify network interface configurations or routing tables?",
          options: ["CAP_NET_ADMIN", "CAP_SYS_ADMIN", "CAP_CHOWN", "CAP_KILL"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-080",
          type: "MCQ",
          prompt: "What tool allows running containers without requiring root daemon privileges on the host machine?",
          options: ["Rootless Podman / Rootless Docker", "Sudoers GUI", "Apache Mesos", "SysV Init"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-009",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-009",
      title: "Dockerfile Engineering & Multi-Stage Builds Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-081",
          type: "MCQ",
          prompt: "What is the primary architectural advantage of using Docker Multi-Stage Builds?",
          options: [
            "It allows discarding compilers, SDKs, and build-time caches from the final image, drastically reducing image size and attack surface",
            "It compiles code simultaneously for Android and iOS",
            "It bypasses corporate proxy firewalls automatically",
            "It merges multiple Git branches during the build step"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-082",
          type: "MCQ",
          prompt: "Why are Google 'Distroless' images considered superior for high-security production deployments?",
          options: [
            "They contain only the application and runtime dependencies, omitting package managers, shells, and system utilities attackers use to expand exploits",
            "They execute without consuming any physical memory",
            "They do not require an operating system kernel",
            "They are completely free from CPU scheduling"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-083",
          type: "MCQ",
          prompt: "Why should you place 'COPY package.json package-lock.json ./' and 'RUN npm ci' BEFORE 'COPY . .' in a Dockerfile?",
          options: [
            "To maximize Docker layer caching so dependency installation is skipped if only application source files have changed",
            "Because npm cannot read files in subdirectories",
            "To prevent the compiler from throwing an out-of-memory error",
            "To enforce code linting rules"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-084",
          type: "MCQ",
          prompt: "What security risk arises from running a container as the default 'root' (UID 0) user?",
          options: [
            "If a container escape vulnerability occurs, the compromised process immediately possesses full root privileges on the underlying host kernel",
            "The container cannot open ports above 1024",
            "The container is limited to 128 MB of memory",
            "Docker CLI refuses to build images without a defined password"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-085",
          type: "MCQ",
          prompt: "What is the difference between 'ENTRYPOINT' and 'CMD' in a Dockerfile?",
          options: [
            "ENTRYPOINT defines the core executable binary; CMD provides default arguments that can be easily overridden via CLI arguments",
            "ENTRYPOINT runs in the background, while CMD runs in the foreground",
            "CMD is executed during 'docker build'; ENTRYPOINT is executed during 'docker push'",
            "There is no difference; they are interchangeable aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-086",
          type: "MCQ",
          prompt: "How does the '--mount=type=cache' flag in BuildKit improve CI compilation performance?",
          options: [
            "It mounts a persistent cache directory on the build host for package managers without baking the cached bytes into the final image layers",
            "It stores the compiled binary in browser cookies",
            "It accelerates network bandwidth using UDP compression",
            "It turns off type checking in TypeScript compilers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-087",
          type: "MCQ",
          prompt: "Which tool scans container images for CVE vulnerabilities and provides automated CI pipeline exit-code gates?",
          options: ["Trivy", "Postman", "Terraform", "Nginx"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-088",
          type: "MCQ",
          prompt: "What does the '.dockerignore' file prevent?",
          options: [
            "It prevents unnecessary files (e.g., node_modules, .git, secrets, tests) from being uploaded to the Docker daemon build context",
            "It prevents developers from downloading untrusted images from Docker Hub",
            "It disables Docker log outputs to stdout",
            "It blocks unauthorized IP addresses from connecting to containers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-089",
          type: "MCQ",
          prompt: "What does compiling a Go application with 'CGO_ENABLED=0' achieve for container packaging?",
          options: [
            "It produces a 100% statically linked binary with zero C library dependencies, allowing execution inside a completely empty 'scratch' image",
            "It enables live hot-reloading in production",
            "It encrypts the Go binary using AES-GCM",
            "It allows the binary to run on ARM architectures only"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-090",
          type: "MCQ",
          prompt: "Why should you avoid using the ':latest' tag for base images in production Dockerfiles?",
          options: [
            "Because ':latest' is a mutable tag that can introduce untested upstream breaking changes or security bugs on subsequent image builds",
            "Because Docker Hub charges fees for pulling ':latest'",
            "Because Kubernetes forbids the deployment of ':latest' images",
            "Because ':latest' images do not support multi-threading"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-010",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-010",
      title: "Docker Compose & Microservices Emulation Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-091",
          type: "MCQ",
          prompt: "How does Docker Compose enable inter-container service discovery within a custom bridge network?",
          options: [
            "It runs an internal DNS server (127.0.0.11) that automatically resolves service names defined in docker-compose.yml to container IP addresses",
            "It writes container IPs into the host's /etc/hosts file on every boot",
            "It requires developers to hardcode IP addresses in environment variables",
            "It broadcasts UDP packets across the physical LAN"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-092",
          type: "MCQ",
          prompt: "Why is 'depends_on' with 'condition: service_healthy' superior to simple 'depends_on: [db]' in Compose?",
          options: [
            "It waits until the dependency service passes its configured healthcheck (e.g., pg_isready) before launching dependent containers, avoiding connection failures",
            "It restarts the host computer if the database crashes",
            "It automatically optimizes SQL queries inside the database",
            "It allocates double CPU cores to the dependency"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-093",
          type: "MCQ",
          prompt: "What is the difference between 'ports' (e.g., '8080:8080') and 'expose' in a docker-compose.yml file?",
          options: [
            "'ports' publishes the container port to the host machine interface; 'expose' makes the port accessible only to other containers on the same Docker network",
            "'expose' opens firewall rules on the AWS VPC",
            "'ports' only works for UDP protocols",
            "There is no difference; they behave identically"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-094",
          type: "MCQ",
          prompt: "What is the function of a named volume declared under the root 'volumes:' key in Docker Compose?",
          options: [
            "It creates a persistent storage volume managed by Docker that survives container restarts and teardowns ('docker compose down')",
            "It mounts the host user's Desktop folder directly into the container",
            "It provides RAM disk storage that is purged every 60 seconds",
            "It measures the audio volume output of the system"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-095",
          type: "MCQ",
          prompt: "Which command completely tears down a Compose stack, including its containers, networks, and named volumes?",
          options: [
            "docker compose down -v",
            "docker compose stop --purge",
            "docker compose rm -f",
            "docker compose destroy --all"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-096",
          type: "MCQ",
          prompt: "How can secrets (such as API keys or database passwords) be safely managed in Docker Compose without committing plain text into Git?",
          options: [
            "By referencing external secret files or environment variables specified in a local untracked .env file via Compose secrets",
            "By embedding passwords directly in the docker-compose.yml comments",
            "By naming the service with the password string",
            "By encrypting the entire hard drive"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-097",
          type: "MCQ",
          prompt: "What is a common pattern for enabling hot-reload development of frontend/backend code inside Docker Compose?",
          options: [
            "Bind mounting the host source directory into the container working directory (e.g., './src:/app/src')",
            "Rebuilding the Docker image on every keystroke",
            "Running an FTP server inside the container",
            "Using SSH to copy files every second"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-098",
          type: "MCQ",
          prompt: "What does the command 'docker compose ps' display?",
          options: [
            "The status, state, health, and port mappings of all containers managed by the current Compose project",
            "A list of running processes inside the host Linux kernel",
            "The billing cost of cloud containers",
            "Git branch merge conflicts in the project"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-099",
          type: "MCQ",
          prompt: "What occurs when two services belong to completely separate Compose networks with no network overlap?",
          options: [
            "They cannot communicate directly or resolve each other's hostnames, providing network-level microservice isolation",
            "Docker throws a YAML syntax validation error",
            "The container runtime terminates with an exception",
            "Packets are automatically routed through the public internet"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-100",
          type: "MCQ",
          prompt: "How can you view real-time streaming logs from all services in a Compose stack simultaneously?",
          options: ["docker compose logs -f", "docker compose stream --tail", "tail -f /var/log/docker-compose", "docker view --logs"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-011",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-011",
      title: "Container Registry Architecture & Image Signing Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-101",
          type: "MCQ",
          prompt: "Why should Kubernetes production manifests reference container images by immutable SHA-256 Digest rather than Tag?",
          options: [
            "Because tags are mutable pointers that can be overwritten or tampered with, whereas cryptographic digests guarantee exact byte-level immutability",
            "Because digests download 50% faster than tags",
            "Because tags require an extra monthly fee on Docker Hub",
            "Because Kubernetes cannot parse tags with periods"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-102",
          type: "MCQ",
          prompt: "What is the primary function of Sigstore 'Cosign' in container supply chain security?",
          options: [
            "It signs and verifies container images and OCI artifacts cryptographically to prove provenance and prevent execution of untrusted images",
            "It compresses Docker images into zip files",
            "It automatically writes Dockerfiles from Python code",
            "It configures SSL certificates on Nginx ingress"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-103",
          type: "MCQ",
          prompt: "What feature in enterprise registries like CNCF Harbor prevents images from being overwritten by subsequent builds with the same tag?",
          options: ["Tag Immutability Rules", "Static Secret Scanning", "Garbage Collection Sweep", "Layer Caching Enforcer"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-104",
          type: "MCQ",
          prompt: "Where does Cosign store image signatures when signing an image in an OCI registry?",
          options: [
            "As standard OCI artifacts directly in the registry alongside the image manifest",
            "Inside a local SQLite file on the developer's laptop",
            "In the Git commit message",
            "Inside the Linux kernel ring buffer"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-105",
          type: "MCQ",
          prompt: "What is an OCI Image Index (multi-architecture manifest)?",
          options: [
            "A manifest pointing to distinct architecture-specific image manifests (e.g., amd64, arm64), allowing clients to pull the correct architecture binary automatically",
            "A search engine index for public Docker repositories",
            "A database indexing all files inside a single container layer",
            "A benchmark rating container startup performance"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-106",
          type: "MCQ",
          prompt: "How does Amazon ECR (Elastic Container Registry) manage access control for pushing and pulling images?",
          options: [
            "Through AWS Identity and Access Management (IAM) policies and short-lived authentication tokens obtained via 'aws ecr get-login-password'",
            "Through permanent hardcoded API keys stored in plain text",
            "By validating public SSH keys stored in GitHub",
            "By checking IP addresses against an open whitelist"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-107",
          type: "MCQ",
          prompt: "What is the purpose of Registry Lifecycle / Retention Policies?",
          options: [
            "To automatically purge untagged, ephemeral, or outdated image digests after a set number of days to prevent runaway cloud storage costs",
            "To automatically reboot the registry server daily",
            "To enforce code reviews before merging Git branches",
            "To renew SSL certificates every 90 days"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-108",
          type: "MCQ",
          prompt: "What Kubernetes admission controller mechanism can enforce that only Cosign-signed images from verified publishers are permitted to run in the cluster?",
          options: ["Kyverno or OPA Gatekeeper verifying image signatures at admission", "Kubelet resource quota", "Horizontal Pod Autoscaler", "CoreDNS filter"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-109",
          type: "MCQ",
          prompt: "What is an 'in-toto' attestation in container supply chain security?",
          options: [
            "A cryptographically verifiable record proving that specific software supply chain steps (e.g., build, test, scan) occurred exactly as specified by authorized agents",
            "A certificate of incorporation for software companies",
            "A license agreement required by the Apache foundation",
            "An error log produced by failing unit tests"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-110",
          type: "MCQ",
          prompt: "What does 'docker manifest inspect <image-name>' output?",
          options: [
            "The JSON metadata describing image layers, media types, architecture compatibility, and cryptographic digests",
            "The application source code inside the container",
            "The list of developers who committed code to the project",
            "The memory usage of the running container"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-012",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-012",
      title: "Kubernetes Architecture & Control Plane Anatomy Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-111",
          type: "MCQ",
          prompt: "Which component serves as the sole entry point for all administrative, internal, and node operations within a Kubernetes cluster?",
          options: ["kube-apiserver", "etcd", "kube-scheduler", "kubelet"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-112",
          type: "MCQ",
          prompt: "What distributed consensus algorithm powers the etcd key-value store, ensuring strong consistency across cluster master nodes?",
          options: ["Raft", "Paxos", "Proof of Work", "Gossip Protocol"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-113",
          type: "MCQ",
          prompt: "What is the primary role of the 'kube-scheduler' component in the Kubernetes control plane?",
          options: [
            "Assigning unscheduled Pods to suitable worker nodes based on resource requests, affinities, taints, and availability",
            "Executing container images on physical CPU hardware",
            "Formatting NVMe disk partitions for persistent volumes",
            "Triggering automated database schema migrations"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-114",
          type: "MCQ",
          prompt: "What is the primary responsibility of the 'kubelet' agent running on each worker node?",
          options: [
            "Communicating with the API server, watching for PodSpecs assigned to its node, and driving the Container Runtime to achieve desired Pod state",
            "Routing external internet traffic into the cluster",
            "Replicating etcd transaction logs across nodes",
            "Compiling container source code into OCI images"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-115",
          type: "MCQ",
          prompt: "How many node failures can a 5-node etcd cluster tolerate while maintaining quorum?",
          options: ["2 nodes (Quorum requires (5/2)+1 = 3 nodes)", "1 node", "3 nodes", "4 nodes"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-116",
          type: "MCQ",
          prompt: "What role does 'kube-proxy' perform on Kubernetes worker nodes?",
          options: [
            "Maintaining network rules (via iptables or IPVS) to route virtual ClusterIP and NodePort Service traffic to backend Pod endpoints",
            "Serving web pages to end users via HTTP/2",
            "Scanning node memory for rootkits",
            "Managing DNS name resolution for external domains"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-117",
          type: "MCQ",
          prompt: "What is the fundamental philosophy behind Kubernetes 'Declarative State' management?",
          options: [
            "Operators declare the 'Desired State' of resources in YAML, and controllers continuously execute reconciliation loops to bring 'Observed State' into alignment",
            "Operators must write shell scripts specifying every imperative step to start and stop containers manually",
            "The cluster only changes state when an engineer clicks buttons in a GUI",
            "Every state change requires rebooting all physical servers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-118",
          type: "MCQ",
          prompt: "Why is direct access to etcd strictly blocked for all components except the kube-apiserver?",
          options: [
            "To ensure that all state mutations undergo strict schema validation, authentication, authorization, and admission controller scrutiny",
            "Because etcd only accepts connections from computers physically inside the server rack",
            "Because etcd is written in Python and cannot handle multiple connections",
            "To prevent etcd from exceeding its 500 MB RAM limit"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-119",
          type: "MCQ",
          prompt: "What component is responsible for orchestrating built-in controllers such as the ReplicaSet, Node, and EndpointSlice controllers?",
          options: ["kube-controller-manager", "kube-dns", "cloud-init", "containerd-shim"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-120",
          type: "MCQ",
          prompt: "What happens if a worker node loses network connectivity to the control plane for longer than the node-monitor-grace-period (default 40s)?",
          options: [
            "The Node Controller marks the node as 'NotReady' and begins evicting Pods to be rescheduled onto surviving healthy worker nodes",
            "The cluster immediately deletes all data stored in etcd",
            "The worker node reboots its hardware motherboard",
            "The control plane shuts down to prevent data corruption"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-013",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-013",
      title: "Core Kubernetes Workloads & Declarative Primitives Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-121",
          type: "MCQ",
          prompt: "Why should production microservices be deployed using a 'Deployment' rather than standalone 'Pods'?",
          options: [
            "Deployments manage ReplicaSets to provide self-healing, declarative rolling updates, zero-downtime rollouts, and rollback capabilities",
            "Pods cannot attach to network interfaces",
            "Standalone Pods consume 10x more memory than Deployments",
            "Kubernetes will delete standalone Pods after 1 hour automatically"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-122",
          type: "MCQ",
          prompt: "Which Kubernetes workload controller is designed for stateful applications requiring stable network hostnames (pod-0, pod-1) and ordered volume provisioning?",
          options: ["StatefulSet", "Deployment", "DaemonSet", "CronJob"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-123",
          type: "MCQ",
          prompt: "When should you deploy a 'DaemonSet' instead of a Deployment?",
          options: [
            "When you need exactly one instance of a pod to run across every worker node in the cluster (e.g., logging daemons, node monitoring agents)",
            "When deploying a stateless web frontend",
            "When running a batch database backup at midnight",
            "When running an app that requires 100 replicas on a single node"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-124",
          type: "MCQ",
          prompt: "What is the critical behavioral difference between a 'Liveness Probe' and a 'Readiness Probe'?",
          options: [
            "A failed Liveness Probe causes kubelet to restart the container; a failed Readiness Probe removes the Pod from Service endpoints so it stops receiving traffic",
            "Liveness probes run in staging; Readiness probes run in production",
            "Readiness probes restart the entire worker node hardware",
            "Liveness probes only test CPU temperature"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-125",
          type: "MCQ",
          prompt: "What role does a 'Startup Probe' serve in Kubernetes workload lifecycle management?",
          options: [
            "It temporarily disables liveness and readiness probes for slow-starting legacy applications until the startup probe succeeds, preventing premature kill cycles",
            "It compiles the source code when the pod boots",
            "It provisions cloud VPC networks before containers launch",
            "It runs automated smoke tests against external APIs"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-126",
          type: "MCQ",
          prompt: "In a Deployment rolling update strategy, what does 'maxSurge: 25%' and 'maxUnavailable: 0' guarantee?",
          options: [
            "Zero downtime: the cluster creates up to 25% new pods before terminating any old pods, ensuring 100% of desired capacity remains available throughout the rollout",
            "The cluster shuts down all old pods before starting any new pods",
            "The cluster scales down memory usage by 25%",
            "Deployments will fail if server CPU exceeds 75%"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-127",
          type: "MCQ",
          prompt: "What is the purpose of 'terminationGracePeriodSeconds' (default 30s) in a Pod specification?",
          options: [
            "It provides the application container time to complete active HTTP requests, flush database transactions, and clean up sockets after receiving SIGTERM before SIGKILL is sent",
            "It delays the startup of a container to conserve power",
            "It dictates how long a pod is allowed to run before being deleted",
            "It specifies how long a developer has to approve a pull request"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-128",
          type: "MCQ",
          prompt: "Which command rolls back an active Deployment to its immediately preceding revision?",
          options: [
            "kubectl rollout undo deployment/<name>",
            "kubectl rollback deployment/<name>",
            "kubectl deployment revert --previous",
            "kubectl reset state deployment/<name>"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-129",
          type: "MCQ",
          prompt: "What is an 'Init Container' in a Kubernetes Pod specification?",
          options: [
            "A specialized container that executes to completion before the main application containers start, ideal for running DB migrations or waiting for dependencies",
            "A container that runs indefinitely in the background to collect metrics",
            "A container used exclusively during 'docker build'",
            "A container that holds the user's login session"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-130",
          type: "MCQ",
          prompt: "What is the primary difference between a Kubernetes 'Job' and a 'CronJob'?",
          options: [
            "A Job executes a task once to completion; a CronJob executes Jobs on a repeating time-based schedule defined by a cron expression",
            "A Job runs in memory, while a CronJob writes to disk",
            "Jobs require root privileges, whereas CronJobs do not",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-014",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-014",
      title: "Kubernetes Networking & Ingress Controllers Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-131",
          type: "MCQ",
          prompt: "What is the foundational IP-per-Pod networking principle mandated by Kubernetes?",
          options: [
            "Every Pod receives a unique, routable IP address within the cluster, and Pods can communicate with all other Pods without requiring Network Address Translation (NAT)",
            "All Pods share the host node's IP address using random port forwarding",
            "Pods communicate exclusively over Unix domain sockets",
            "Only master nodes have IP addresses"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-132",
          type: "MCQ",
          prompt: "What is the default Service type in Kubernetes that provides an internal virtual IP reachable only within the cluster?",
          options: ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-133",
          type: "MCQ",
          prompt: "How does a Kubernetes Service select which Pods should receive inbound traffic?",
          options: [
            "By matching the Service's 'spec.selector' labels against the 'metadata.labels' defined on Pods",
            "By sorting Pods alphabetically by container name",
            "By checking which developer authored the Pod YAML",
            "By allocating traffic to Pods with the lowest CPU temperature"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-134",
          type: "MCQ",
          prompt: "What port range is reserved by default across all worker nodes when creating a 'NodePort' service?",
          options: ["30000 - 32767", "1024 - 4096", "8000 - 8080", "49152 - 65535"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-135",
          type: "MCQ",
          prompt: "What role does an 'Ingress Controller' (such as ingress-nginx or Traefik) play in Kubernetes?",
          options: [
            "It runs as an L7 reverse proxy reverse-routing external HTTP/HTTPS traffic into cluster Services based on hostname and URI path rules",
            "It acts as a hardware firewall in the data center basement",
            "It encrypts hard drives on worker nodes",
            "It replaces the kube-scheduler"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-136",
          type: "MCQ",
          prompt: "What is an 'EndpointSlice' in modern Kubernetes networking?",
          options: [
            "A scalable resource that tracks groups of Pod network endpoints, overcoming the performance bottlenecks of the legacy monolithic Endpoints object in large clusters",
            "A tool for slicing log files into smaller chunks",
            "A network cable splitter used in physical racks",
            "A security tool for intercepting TLS handshakes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-137",
          type: "MCQ",
          prompt: "How does the Kubernetes Gateway API improve upon the traditional Ingress resource specification?",
          options: [
            "It provides role-oriented, expressive, and extensible APIs (GatewayClass, Gateway, HTTPRoute) decoupling cluster infrastructure provisioning from developer routing rules",
            "It eliminates the need for IP addresses entirely",
            "It restricts cluster access to internal corporate networks only",
            "It forces all network traffic to travel over WebSockets"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-138",
          type: "MCQ",
          prompt: "What does CoreDNS provide to containers running inside a Kubernetes cluster?",
          options: [
            "Cluster-internal DNS name resolution, mapping service names (e.g., 'db.production.svc.cluster.local') to their virtual ClusterIP addresses",
            "External public domain registrar services",
            "Automatic renewal of credit cards for cloud hosting",
            "Compression of HTTP responses"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-139",
          type: "MCQ",
          prompt: "What happens when a client sends traffic to a Kubernetes 'Headless Service' (spec.clusterIP: None)?",
          options: [
            "DNS queries return the A records containing the direct individual IP addresses of all backing Pods rather than a single virtual ClusterIP",
            "Traffic is dropped immediately with an ICMP unreachable error",
            "The request is forwarded to Google public DNS (8.8.8.8)",
            "The cluster creates an AWS Elastic Load Balancer"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-140",
          type: "MCQ",
          prompt: "Which modern CNI plugin utilizes Linux eBPF in the kernel to replace iptables kube-proxy routing, drastically accelerating networking performance?",
          options: ["Cilium", "Flannel", "Bridge CNI", "Host-local"],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

