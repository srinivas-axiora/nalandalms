export const phase3 = {
  "chapters": [
    {
      "id": "CH-FDE-013",
      "courseId": "CRS-FDE-001",
      "chapterNumber": 13,
      "title": "Containerization & Helm Chart Architecture for Enterprise Packaging",
      "summary": "Package enterprise software: multi-stage Docker builds, non-root security enforcement, CVE vulnerability scanning with Trivy, Helm chart templating, and values.yaml inheritance.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=-yX44O2Q1j4",
      "body": "<h2>1. The Standard Packaging Unit of Enterprise Software</h2>\n<p>Decades ago, software delivery required vendor engineers to manually install dependencies, configure operating system libraries, and pray that client servers matched staging environments. Today, containerization via OCI-compliant container images (Docker) and Kubernetes package management via <strong>Helm Charts</strong> provides reproducible, immutable, and auditable deployment units that run identically on developer laptops, AWS EKS, and air-gapped on-premise OpenShift clusters.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/-yX44O2Q1j4' title='Helm Charts and Enterprise Packaging' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Hardened Multi-Stage Dockerfile Blueprint</h2>\n<p>Enterprise Infosec will immediately reject container images running as <code>root</code> or bloated with compilers, package managers, and shell utilities. Production containers must use multi-stage builds and distroless/scratch base images:</p>\n<pre><code class='language-dockerfile'># Stage 1: Build & Compilation\nFROM node:22-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --ignore-scripts\nCOPY . .\nRUN npm run build && npm prune --production\n\n# Stage 2: Hardened Minimal Runtime\nFROM gcr.io/distroless/nodejs22-debian12:nonroot\nWORKDIR /app\nCOPY --from=builder --chown=nonroot:nonroot /app/dist ./dist\nCOPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules\nCOPY --from=builder --chown=nonroot:nonroot /app/package.json ./\n\n# Security: Run as non-root user (UID 65532)\nUSER nonroot\nEXPOSE 8080\nENV NODE_ENV=production\nCMD [\"dist/server.js\"]</code></pre>\n\n<h2>3. Helm Chart Architecture & Values Hierarchy</h2>\n<p>Helm acts as the package manager for Kubernetes. Rather than hardcoding manifests, Helm parameterizes Kubernetes resources using the Go templating language:</p>\n<pre><code class='language-text'>enterprise-platform-chart/\n├── Chart.yaml              # Chart metadata (version, appVersion, dependencies)\n├── values.yaml             # Default configuration values\n├── values.production.yaml  # High-availability production overrides\n└── templates/\n    ├── _helpers.tpl        # Reusable named template definitions\n    ├── deployment.yaml     # Pod template with resource limits & probes\n    ├── service.yaml        # ClusterIP / LoadBalancer endpoint\n    ├── ingress.yaml        # Ingress routing rules & TLS cert mapping\n    ├── configmap.yaml      # Non-sensitive environment variables\n    └── secrets.yaml        # References to external Vault / SealedSecrets</code></pre>\n\n<h2>4. Automated Vulnerability Scanning with Trivy</h2>\n<p>Before an image is pushed to an enterprise registry, CI pipelines execute vulnerability scans using scanners like Aqua Security Trivy, failing builds that contain Critical or High Common Vulnerabilities and Exposures (CVEs) with known fixes.</p>"
    },
    {
      "id": "CH-FDE-014",
      "courseId": "CRS-FDE-001",
      "chapterNumber": 14,
      "title": "Kubernetes Deployments across EKS, GKE, AKS & OpenShift",
      "summary": "Deploy mission-critical services on Kubernetes: Pod lifecycle, affinity/anti-affinity, taints and tolerations, Horizontal Pod Autoscaling (HPA), and OpenShift Security Context Constraints (SCC).",
      "readingTimeMinutes": 40,
      "videoUrl": "https://www.youtube.com/watch?v=eqfC_yZfWvM",
      "body": "<h2>1. The Multi-Cloud Kubernetes Landscape</h2>\n<p>An FDE cannot assume client infrastructure is identical across accounts. While AWS EKS, Google Cloud GKE, and Microsoft Azure AKS conform to upstream Kubernetes APIs, on-premise enterprise environments frequently run Red Hat OpenShift, VMware Tanzu, or Rancher with strict Security Context Constraints (SCC), proprietary CNI plugins, and air-gapped container registries.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/eqfC_yZfWvM' title='Enterprise Kubernetes Deployment Strategies' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Cloud Kubernetes Comparison Matrix</h2>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Platform</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>IAM / Auth Integration</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Storage Provisioner (CSI)</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>FDE Deployment Peculiarity</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>AWS EKS</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>IRSA (IAM Roles for Service Accounts)</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>EBS / EFS CSI Driver</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>AWS VPC CNI consumes private VPC IPs per pod; beware subnet CIDR exhaustion.</td>\n    </tr>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Azure AKS</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Azure Workload Identity / Entra ID</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Azure Disk / Azure Files CSI</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Azure CNI overlay vs native routing; NSG security rules often block node ports.</td>\n    </tr>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Google GKE</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Workload Identity Federation</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>GCE PD / Filestore CSI</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Autopilot mode restricts node access; requires standard clusters for custom daemonsets.</td>\n    </tr>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Red Hat OpenShift</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>OpenShift OAuth / Red Hat SSO</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>OpenShift Data Foundation / Ceph</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Strict Security Context Constraints (SCC); allocates dynamic random UIDs per namespace.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>3. High Availability Pod Scheduling</h2>\n<p>To survive physical node crashes and cloud Availability Zone (AZ) outages, production deployments must configure <code>podAntiAffinity</code> and <code>topologySpreadConstraints</code>:</p>\n<pre><code class='language-yaml'># deployment.yaml: Zone-redundant pod scheduling\nspec:\n  replicas: 3\n  template:\n    spec:\n      topologySpreadConstraints:\n        - maxSkew: 1\n          topologyKey: topology.kubernetes.io/zone\n          whenUnsatisfiable: DoNotSchedule\n          labelSelector:\n            matchLabels:\n              app.kubernetes.io/name: enterprise-api\n      affinity:\n        podAntiAffinity:\n          preferredDuringSchedulingIgnoredDuringExecution:\n            - weight: 100\n              podAffinityTerm:\n                labelSelector:\n                  matchLabels:\n                    app.kubernetes.io/name: enterprise-api\n                topologyKey: kubernetes.io/hostname</code></pre>\n\n<h2>4. Health Checks: Liveness, Readiness & Startup Probes</h2>\n<p>Misconfigured health checks cause cascading container restart loops. Always distinguish between <code>startupProbe</code> (slow initial boot), <code>readinessProbe</code> (traffic routing), and <code>livenessProbe</code> (process recovery).</p>"
    },
    {
      "id": "CH-FDE-015",
      "courseId": "CRS-FDE-001",
      "chapterNumber": 15,
      "title": "Air-Gapped, VPC Peering & Private Link Infrastructure Deployments",
      "summary": "Deploy into restricted enterprise networks: AWS PrivateLink, Azure Private Endpoint, VPC Peering, offline container registries with Harbor, and air-gapped artifact bundles.",
      "readingTimeMinutes": 39,
      "videoUrl": "https://www.youtube.com/watch?v=Jm2d6v4mP2A",
      "body": "<h2>1. The Restricted Network Frontier</h2>\n<p>In government, defense, intelligence, and tier-1 banking institutions, servers are completely isolated from the public internet. There is no access to Docker Hub, GitHub, public npm, or cloud package mirrors. Forward Deployed Engineers must be proficient in delivering software into <strong>Air-Gapped enclaves</strong> and configuring private networking via <strong>VPC Peering</strong> and <strong>AWS PrivateLink</strong>.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/Jm2d6v4mP2A' title='AWS PrivateLink & VPC Peering Architecture' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Private Networking Architecture Comparison</h2>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Technology</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Routing Mechanism</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>CIDR Overlap Handling</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Enterprise Security Signal</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>VPC Peering</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Bidirectional network-to-network IP routing across AWS/Azure VPCs.</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Forbidden (CIDR blocks must not overlap).</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Exposes wider subnet attack surface; requires strict security groups.</td>\n    </tr>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>AWS PrivateLink</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Unidirectional private endpoint (ENI) exposing a specific Network Load Balancer (NLB).</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Supported (VPC CIDRs can overlap freely).</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Gold standard for enterprise SaaS: only target service port is exposed, zero lateral network movement.</td>\n    </tr>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>True Air-Gap (Offline)</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Physical isolation; zero network connectivity between enclave and outside world.</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>N/A (Isolated network)</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Maximum security; requires physical sneaker-net or cross-domain diode transfers.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>3. The Air-Gapped Packaging Workflow</h2>\n<p>To install software in an air-gapped environment, FDEs package all container images, Helm charts, and database migrations into self-contained tarball archives transferred via secure media:</p>\n<pre><code class='language-bash'># 1. Download and package all container images in connected build environment\ndocker pull enterprise/core-api:v2.4.0\ndocker pull enterprise/worker:v2.4.0\ndocker save enterprise/core-api:v2.4.0 enterprise/worker:v2.4.0 | gzip > airgap-bundle-v2.4.0.tar.gz\n\n# 2. Package Helm dependencies offline\nhelm package ./enterprise-platform-chart\n\n# 3. Inside Air-Gapped enclave: Load into local Harbor registry\ngunzip -c airgap-bundle-v2.4.0.tar.gz | docker load\ndocker tag enterprise/core-api:v2.4.0 harbor.internal.secure/enterprise/core-api:v2.4.0\ndocker push harbor.internal.secure/enterprise/core-api:v2.4.0</code></pre>"
    },
    {
      "id": "CH-FDE-016",
      "courseId": "CRS-FDE-001",
      "chapterNumber": 16,
      "title": "Infrastructure as Code (Terraform) for Repeatable Client Environments",
      "summary": "Standardize client provisioning: Terraform modular architecture, remote state management, DynamoDB state locking, multi-region setups, and policy-as-code validation with Checkov.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=7xngnjfIlK4",
      "body": "<h2>1. The Necessity of Automated Infrastructure</h2>\n<p>When an enterprise deal closes, setting up their VPC, databases, message queues, and Kubernetes node pools manually through the AWS or Azure web console is a recipe for catastrophic configuration drift, missing security tags, and failed audits. Forward Deployed Engineers treat infrastructure as software using <strong>Terraform by HashiCorp</strong>.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/7xngnjfIlK4' title='Terraform for Enterprise Infrastructure' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Enterprise Terraform Module Architecture</h2>\n<p>Production Terraform code separates reusable modules from tenant-specific environment roots:</p>\n<pre><code class='language-text'>terraform-infrastructure/\n├── modules/\n│   ├── vpc/             # Subnets, NAT Gateways, Route Tables\n│   ├── eks_cluster/     # Node groups, OIDC provider, security groups\n│   ├── rds_postgres/    # Multi-AZ database, KMS encryption, subnet groups\n│   └── privatelink/     # VPC Endpoint Services, NLB attachments\n└── environments/\n    ├── tenant-acme-prod/\n    │   ├── main.tf      # Invokes modules with Acme-specific parameters\n    │   ├── variables.tf # CIDR definitions, instance sizes\n    │   └── backend.tf   # Remote S3 state + DynamoDB lock table\n    └── tenant-globex-prod/\n        └── main.tf</code></pre>\n\n<h2>3. Remote State & Locking with S3 and DynamoDB</h2>\n<p>Simultaneous Terraform applies from two engineers corrupt the state file. Production backends mandate cryptographic remote storage and atomic distributed locking:</p>\n<pre><code class='language-hcl'># backend.tf: S3 Remote Backend with DynamoDB Distributed Lock\nterraform {\n  required_version = \">= 1.6.0\"\n  backend \"s3\" {\n    bucket         = \"enterprise-terraform-state-prod\"\n    key            = \"tenants/acme/terraform.tfstate\"\n    region         = \"us-east-1\"\n    encrypt        = true\n    dynamodb_table = \"enterprise-terraform-locks\"\n  }\n}\n</code></pre>\n\n<h2>4. Policy as Code: Enforcing Security with Checkov</h2>\n<p>Before <code>terraform apply</code> runs in CI/CD, static analysis tools like Checkov scan HCL code to catch unencrypted S3 buckets, open security group CIDRs (<code>0.0.0.0/0</code>), and missing backup policies.</p>"
    },
    {
      "id": "CH-FDE-017",
      "courseId": "CRS-FDE-001",
      "chapterNumber": 17,
      "title": "CI/CD Pipeline Automation for Field Delivery (GitLab CI, GitHub Actions, ArgoCD)",
      "summary": "Orchestrate continuous delivery: GitLab CI / GitHub Actions matrix builds, GitOps reconciliation with ArgoCD, blue/green and canary deployments, and automated rollback gates.",
      "readingTimeMinutes": 39,
      "videoUrl": "https://www.youtube.com/watch?v=MeU5_r9V-1E",
      "body": "<h2>1. The Continuous Delivery Lifecycle in the Field</h2>\n<p>Deploying software to 50 distinct enterprise customer environments cannot be done with manual <code>kubectl apply</code> commands from an engineer's laptop. Forward Deployed Engineers build automated CI/CD pipelines and implement <strong>GitOps</strong> using tools like ArgoCD and Flux, where Git serves as the single source of truth for all environment configurations.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/MeU5_r9V-1E' title='GitOps with ArgoCD in Enterprise Kubernetes' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. GitOps with ArgoCD Architecture</h2>\n<p>In a GitOps architecture, an in-cluster operator (ArgoCD) continuously reconciles the desired state declared in Git with the live cluster state, pulling changes automatically and self-healing against configuration drift:</p>\n<pre><code class='language-text'>Developer / FDE PR ──> Merge to Git (tenant-config-repo)\n                             │\n                             ▼\n                    ArgoCD Controller (Polling / Webhook)\n                             │ (Detects Diff)\n                             ▼\n            Automated Canary Rollout (Argo Rollouts)\n            ├── 10% Traffic ──> Validate Prometheus Error Rate\n            ├── 50% Traffic ──> Validate P95 Latency\n            └── 100% Traffic ──> Complete Deployment (or Auto-Rollback)</code></pre>\n\n<h2>3. Progressive Delivery: Blue/Green vs Canary</h2>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Strategy</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Mechanism</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Resource Overhead</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Rollback Speed</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Blue/Green</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Run two complete identical environments; switch router traffic 100% from Blue to Green instantaneously.</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>200% (requires double compute during release)</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Near-instant (switch router back to Blue)</td>\n    </tr>\n    <tr>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Canary</strong></td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Gradually route a small percentage of user traffic (5%, 25%, 50%) to the new release while monitoring metrics.</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Low (only small percentage extra pods)</td>\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Fast (scale down canary pods and reset weight)</td>\n    </tr>\n  </tbody>\n</table>"
    },
    {
      "id": "CH-FDE-018",
      "courseId": "CRS-FDE-001",
      "chapterNumber": 18,
      "title": "Client Configuration Management & Feature Flags",
      "summary": "Control feature delivery: dynamic runtime configuration, feature flags with LaunchDarkly and ConfigCat, kill-switches, entitlement gates, and preventing configuration drift.",
      "readingTimeMinutes": 37,
      "videoUrl": "https://www.youtube.com/watch?v=0kY-2Qj4b_E",
      "body": "<h2>1. Decoupling Code Deployment from Feature Release</h2>\n<p>In enterprise software delivery, shipping code to a cluster should never be synonymous with exposing that capability to end users. Different enterprise tenants have different licensing contracts, compliance clearances, and change management windows. <strong>Feature Flags and dynamic configuration management</strong> allow FDEs to turn capabilities on or off for specific tenants, users, or regions in milliseconds without deploying new code or restarting services.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/0kY-2Qj4b_E' title='Feature Flags & Configuration Management in Enterprise' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Enterprise Feature Flag Architecture</h2>\n<p>Modern feature management platforms (LaunchDarkly, ConfigCat, Unleash) use streaming SSE connections to push rule updates to SDKs within 200 milliseconds. SDKs evaluate rules in-memory locally with zero network round-trip latency during user requests:</p>\n<pre><code class='language-typescript'>import * as LaunchDarkly from '@launchdarkly/node-server-sdk';\n\nexport class EnterpriseFeatureManager {\n  private client: LaunchDarkly.LDClient;\n\n  constructor(sdkKey: string) {\n    this.client = LaunchDarkly.init(sdkKey);\n  }\n\n  async isFeatureEnabledForTenant(featureKey: string, tenantId: string, tier: string): Promise<boolean> {\n    const context: LaunchDarkly.LDContext = {\n      kind: 'tenant',\n      key: tenantId,\n      tier: tier,\n    };\n    // Local in-memory evaluation (< 1 millisecond)\n    return await this.client.variation(featureKey, context, false);\n  }\n}</code></pre>\n\n<h2>3. Operational Kill-Switches</h2>\n<p>When an integration with an external third-party partner degrades or begins timing out, an FDE flips an operational kill-switch flag to disable that specific integration path gracefully (e.g. falling back to cached data or queued mode) without redeploying the entire microservice fleet.</p>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-FDE-013",
      "courseId": "CRS-FDE-001",
      "chapterId": "CH-FDE-013",
      "title": "Enterprise Containerization & Helm Assessment",
      "summary": "Test expertise in multi-stage Docker builds, non-root container security, Trivy vulnerability scans, and Helm chart architecture.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-FDE-121",
          "question": "Why do enterprise security policies strictly forbid running containers as root (UID 0)?",
          "options": [
            "Root containers run out of memory faster.",
            "If a container breakout vulnerability occurs, the attacker immediately gains root superuser privileges on the underlying host operating system.",
            "Root containers cannot connect to databases.",
            "Docker does not support root users."
          ],
          "correctIndex": 1,
          "explanation": "Running as non-root mitigates the impact of potential container escapes, preventing attackers from inheriting host-level root control."
        },
        {
          "id": "Q-FDE-122",
          "question": "What is the primary benefit of multi-stage Docker builds for enterprise delivery?",
          "options": [
            "They make Docker images 10 times larger.",
            "They separate build dependencies (compilers, npm build tools, dev libraries) from the final runtime image, drastically reducing attack surface and image size.",
            "They eliminate the need for Kubernetes.",
            "They automatically run unit tests."
          ],
          "correctIndex": 1,
          "explanation": "Multi-stage builds leave compilers and source code behind in temporary build stages, producing lean production runtime images with fewer CVEs."
        },
        {
          "id": "Q-FDE-123",
          "question": "What is a 'distroless' container image (e.g. gcr.io/distroless/nodejs)?",
          "options": [
            "An image that contains no software.",
            "An image containing only the application and its direct runtime dependencies, completely stripping out package managers, shells (bash/sh), and standard Linux utilities.",
            "An image distributed on floppy disks.",
            "An image that runs without a CPU."
          ],
          "correctIndex": 1,
          "explanation": "Distroless images eliminate shells and system package managers, making it extraordinarily difficult for attackers to execute arbitrary scripts upon compromise."
        },
        {
          "id": "Q-FDE-124",
          "question": "What is the role of values.yaml in a Helm chart?",
          "options": [
            "Storing user passwords in plaintext.",
            "Providing default parameter values that are injected into Helm Go templates, which can be overridden per environment using custom values files.",
            "Configuring developer salaries.",
            "Compiling TypeScript code."
          ],
          "correctIndex": 1,
          "explanation": "values.yaml defines the default configuration variables that template manifests consume, enabling customized per-tenant deployments without altering chart templates."
        },
        {
          "id": "Q-FDE-125",
          "question": "What does an image vulnerability scanner like Trivy scan for?",
          "options": [
            "Spelling errors in comments.",
            "Known Common Vulnerabilities and Exposures (CVEs) in OS package dependencies and language application libraries.",
            "Slow database queries.",
            "CSS layout bugs."
          ],
          "correctIndex": 1,
          "explanation": "Trivy checks OS packages and npm/pip/go dependencies against public vulnerability databases to detect known CVEs before deployment."
        },
        {
          "id": "Q-FDE-126",
          "question": "What is an OCI (Open Container Initiative) compliant container image?",
          "options": [
            "An image that only runs on Oracle computers.",
            "An image packaged according to open industry specifications, guaranteeing interoperability across Docker, Podman, containerd, and Kubernetes runtimes.",
            "An image created by government agencies.",
            "A compressed JPEG image file."
          ],
          "correctIndex": 1,
          "explanation": "OCI standards ensure container images and runtime specifications are completely vendor-agnostic and work seamlessly across modern container engines."
        },
        {
          "id": "Q-FDE-127",
          "question": "Why should production Dockerfiles avoid using the 'latest' tag for base images?",
          "options": [
            "The 'latest' tag is forbidden by law.",
            "'latest' is mutable and non-deterministic; builds will unpredictably pull different base image versions over time, introducing breaking changes and new CVEs without warning.",
            "Because 'latest' images are always corrupted.",
            "Because 'latest' images cost more money."
          ],
          "correctIndex": 1,
          "explanation": "Pinning specific version tags or SHA-256 digests guarantees deterministic, reproducible builds and prevents surprise upstream dependency changes."
        },
        {
          "id": "Q-FDE-128",
          "question": "What is the purpose of the Chart.yaml file in a Helm chart?",
          "options": [
            "Drawing business pie charts.",
            "Declaring top-level metadata about the chart, including its name, description, chart version, appVersion, and external chart dependencies.",
            "Managing database transactions.",
            "Configuring Kubernetes network routes."
          ],
          "correctIndex": 1,
          "explanation": "Chart.yaml is the manifest defining the package name, semantic version of the chart, and the software version (appVersion) packaged inside."
        },
        {
          "id": "Q-FDE-129",
          "question": "How do you override Helm values during command-line deployment?",
          "options": [
            "helm install my-app ./chart -f values.prod.yaml --set replicaCount=5",
            "helm edit text file",
            "helm update database",
            "helm reboot cluster"
          ],
          "correctIndex": 0,
          "explanation": "The <code>-f &lt;file&gt;</code> flag loads environment-specific YAML overrides, while <code>--set key=value</code> modifies individual parameters directly."
        },
        {
          "id": "Q-FDE-130",
          "question": "Why should .dockerignore be used in enterprise builds?",
          "options": [
            "To ignore all Docker instructions.",
            "To prevent copying local sensitive files (.env, git history, credentials, build caches) into the Docker build context and final image.",
            "To disable container networking.",
            "To speed up database indexing."
          ],
          "correctIndex": 1,
          "explanation": ".dockerignore prevents accidental leakage of local secrets, developer keys, and multi-gigabyte node_modules into the build context."
        }
      ]
    },
    {
      "id": "ASM-FDE-014",
      "courseId": "CRS-FDE-001",
      "chapterId": "CH-FDE-014",
      "title": "Enterprise Kubernetes Deployments Assessment",
      "summary": "Evaluate knowledge of multi-cloud Kubernetes (EKS, AKS, GKE, OpenShift), pod affinity, taints/tolerations, and health probes.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-FDE-131",
          "question": "What is the primary difference between a readinessProbe and a livenessProbe in Kubernetes?",
          "options": [
            "readinessProbe restarts the container; livenessProbe does nothing.",
            "readinessProbe determines if the container is ready to accept user traffic (removing it from endpoints if failing); livenessProbe determines if the container is deadlocked and must be restarted.",
            "There is no difference.",
            "livenessProbe is for databases; readinessProbe is for web apps."
          ],
          "correctIndex": 1,
          "explanation": "Failing readiness stops routing traffic to the pod; failing liveness triggers Kubernetes to kill and restart the container."
        },
        {
          "id": "Q-FDE-132",
          "question": "What is podAntiAffinity used for in enterprise Kubernetes deployments?",
          "options": [
            "To prevent pods from communicating with each other.",
            "To instruct the Kubernetes scheduler not to place multiple replicas of the same pod on the same physical node or in the same availability zone, ensuring high availability.",
            "To delete pods when memory is low.",
            "To encrypt pod network traffic."
          ],
          "correctIndex": 1,
          "explanation": "Anti-affinity spreads pod replicas across different physical nodes or failure domains (AZs) so a hardware crash cannot take down the entire service."
        },
        {
          "id": "Q-FDE-133",
          "question": "What is a major architectural constraint when deploying onto Red Hat OpenShift compared to standard EKS/GKE?",
          "options": [
            "OpenShift cannot run Docker containers.",
            "OpenShift enforces strict Security Context Constraints (SCC) that prevent containers from specifying fixed UIDs, dynamically assigning an unpredictable high UID range per namespace.",
            "OpenShift does not support YAML.",
            "OpenShift requires running as root."
          ],
          "correctIndex": 1,
          "explanation": "OpenShift assigns random high UIDs dynamically per project namespace, causing permissions crashes in containers that expect fixed file ownership."
        },
        {
          "id": "Q-FDE-134",
          "question": "What is the role of Kubernetes Taints and Tolerations?",
          "options": [
            "To detect corrupted hard drives.",
            "Taints allow a node to repel a set of pods; tolerations allow (but do not require) pods to be scheduled onto nodes with matching taints (e.g. dedicated GPU nodes).",
            "To delete unauthorized user accounts.",
            "To manage DNS routing."
          ],
          "correctIndex": 1,
          "explanation": "Taints and tolerations ensure dedicated nodes (such as high-memory or GPU-equipped machines) are reserved exclusively for workloads specifically requesting them."
        },
        {
          "id": "Q-FDE-135",
          "question": "What is the Horizontal Pod Autoscaler (HPA) in Kubernetes?",
          "options": [
            "A tool that stretches server monitors horizontally.",
            "A controller that automatically scales the number of pod replicas up or down based on observed CPU utilization, memory usage, or custom metrics (e.g. queue depth).",
            "A database backup schedule.",
            "A network firewall rule."
          ],
          "correctIndex": 1,
          "explanation": "HPA scales pod count dynamically to maintain target utilization thresholds under shifting enterprise workloads."
        },
        {
          "id": "Q-FDE-136",
          "question": "Why should Kubernetes deployments configure 'startupProbe' for slow-starting enterprise Java applications?",
          "options": [
            "Because Java cannot run on Linux.",
            "It gives slow-initializing applications time to warm up caches and establish connections without being prematurely killed by an impatient livenessProbe.",
            "To make Java start 10x faster.",
            "To disable garbage collection."
          ],
          "correctIndex": 1,
          "explanation": "Startup probes disable liveness and readiness checks until the container has successfully booted, preventing premature kill loops during heavy startup routines."
        },
        {
          "id": "Q-FDE-137",
          "question": "What is IRSA (IAM Roles for Service Accounts) in AWS EKS?",
          "options": [
            "A tax filing requirement for AWS users.",
            "A mechanism that maps Kubernetes ServiceAccounts to fine-grained AWS IAM roles via an OIDC identity provider, eliminating hardcoded AWS credentials in pods.",
            "A hardware router in Amazon data centers.",
            "A type of EBS storage volume."
          ],
          "correctIndex": 1,
          "explanation": "IRSA securely injects temporary STS credentials into pods based on Kubernetes ServiceAccount identity, adhering to the principle of least privilege."
        },
        {
          "id": "Q-FDE-138",
          "question": "What is a StatefulSet in Kubernetes, and when should an FDE use it?",
          "options": [
            "For stateless web frontend containers.",
            "For stateful workloads (e.g. Kafka brokers, database clusters) requiring stable unique network identifiers, persistent ordinal index names, and dedicated persistent storage per pod.",
            "For running temporary batch jobs.",
            "For managing DNS servers only."
          ],
          "correctIndex": 1,
          "explanation": "StatefulSets provide persistent identities and stable storage bindings necessary for clustered stateful systems like databases and message brokers."
        },
        {
          "id": "Q-FDE-139",
          "question": "What is a topologySpreadConstraint in Kubernetes pod scheduling?",
          "options": [
            "A map of network cables.",
            "A declarative rule that controls how pods are distributed across failure domains (regions, zones, racks) to achieve high availability and prevent zone concentration.",
            "A limit on how many containers can run in a pod.",
            "A tool for formatting JSON manifests."
          ],
          "correctIndex": 1,
          "explanation": "topologySpreadConstraints ensure balanced distribution across availability zones with bounded skew, preventing catastrophic single-zone outages."
        },
        {
          "id": "Q-FDE-140",
          "question": "What happens if a pod exceeds its configured container memory 'limit'?",
          "options": [
            "The node shuts down.",
            "The Linux kernel terminates the container process immediately with an OOMKilled (Out of Memory Killed) error.",
            "The container is given free extra RAM from the cloud provider.",
            "The container slows down but keeps running."
          ],
          "correctIndex": 1,
          "explanation": "When memory exceeds the hard limit, the kernel OOM killer terminates the container immediately with exit code 137."
        }
      ]
    },
    {
      "id": "ASM-FDE-015",
      "courseId": "CRS-FDE-001",
      "chapterId": "CH-FDE-015",
      "title": "Air-Gapped & PrivateLink Deployments Assessment",
      "summary": "Assess expertise in AWS PrivateLink, Azure Private Endpoints, Harbor registry mirroring, and offline air-gapped installation.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-FDE-141",
          "question": "What is the primary architectural advantage of AWS PrivateLink over VPC Peering for enterprise SaaS?",
          "options": [
            "PrivateLink is 100% free.",
            "PrivateLink allows unidirectional access to a specific service without exposing whole subnets, works with overlapping CIDR blocks, and prevents lateral network movement.",
            "PrivateLink works over Bluetooth.",
            "PrivateLink does not require TCP/IP."
          ],
          "correctIndex": 1,
          "explanation": "PrivateLink exposes only a specific NLB endpoint interface directly inside the customer's VPC, avoiding IP conflicts and eliminating network-level blast radius."
        },
        {
          "id": "Q-FDE-142",
          "question": "In an air-gapped environment with no internet access, how are container images deployed into Kubernetes?",
          "options": [
            "Containers cannot be used in air-gapped environments.",
            "Images are saved as tar archives in a connected environment, transferred via approved secure media, and loaded into an in-enclave private registry (e.g. Harbor).",
            "Images are downloaded over public Wi-Fi on personal phones.",
            "Images are recompiled from source code on paper."
          ],
          "correctIndex": 1,
          "explanation": "Air-gapped deployments rely on sneaker-net or secure diode file transfer of tar archives loaded into an internal private container registry like Harbor."
        },
        {
          "id": "Q-FDE-143",
          "question": "What is Harbor in enterprise container infrastructure?",
          "options": [
            "A parking facility for boats.",
            "An open-source, CNCF-graduated enterprise container registry that provides role-based access control, vulnerability scanning, image signing, and replication.",
            "A software build compiler.",
            "A network firewall hardware appliance."
          ],
          "correctIndex": 1,
          "explanation": "Harbor is the leading enterprise-grade private container registry, featuring image replication, CVE vulnerability gating, and Cosign signature verification."
        },
        {
          "id": "Q-FDE-144",
          "question": "What is a 'VPC Endpoint' in AWS networking?",
          "options": [
            "The physical location where internet cables enter the building.",
            "A private virtual device that enables private connections between your VPC and supported AWS services or PrivateLink partner services without requiring an internet gateway.",
            "A tool for deleting AWS accounts.",
            "A wireless router."
          ],
          "correctIndex": 1,
          "explanation": "VPC Endpoints keep traffic entirely within the AWS private network backbone, avoiding public internet traversal for maximum security."
        },
        {
          "id": "Q-FDE-145",
          "question": "What is CIDR block overlap, and why does it break standard VPC Peering?",
          "options": [
            "When two servers have the same name.",
            "When two VPCs share identical or overlapping IP address ranges (e.g. 10.0.0.0/16), making it impossible for network routers to determine which destination an IP packet belongs to.",
            "A disk partitioning error.",
            "A database primary key conflict."
          ],
          "correctIndex": 1,
          "explanation": "Routers cannot distinguish destinations when IP ranges overlap; PrivateLink bypasses this limitation through private endpoint address translation."
        },
        {
          "id": "Q-FDE-146",
          "question": "What is an 'offline Helm dependency packaging' step?",
          "options": [
            "Turning off the computer before installing software.",
            "Running 'helm dependency build' while connected to download all sub-chart archives (.tgz) into the chart package so it can be deployed without internet access.",
            "Deleting Helm charts from disk.",
            "Writing charts in plain text."
          ],
          "correctIndex": 1,
          "explanation": "Downloading all sub-charts and embedding them directly into the charts/ directory ensures the chart can install cleanly in air-gapped clusters."
        },
        {
          "id": "Q-FDE-147",
          "question": "What is a unidirectional security gateway (data diode) in defense environments?",
          "options": [
            "A one-way glass window in server rooms.",
            "A physical hardware device that allows data to travel in only one direction (via fiber-optic transmitter to receiver with no return path), preventing any reverse data exfiltration.",
            "An electrical fuse.",
            "A software firewall running in Linux."
          ],
          "correctIndex": 1,
          "explanation": "Hardware data diodes enforce absolute one-way data transmission at the physical layer, making reverse leakage physically impossible."
        },
        {
          "id": "Q-FDE-148",
          "question": "How do you verify the cryptographic integrity and provenance of container images in air-gapped environments?",
          "options": [
            "By asking the developer who built it.",
            "By verifying cryptographic digital signatures attached to the image using tools like Sigstore Cosign against a trusted public key.",
            "By looking at the file size.",
            "By renaming the file."
          ],
          "correctIndex": 1,
          "explanation": "Cosign validates that container images have not been tampered with and were signed by the verified vendor build pipeline."
        },
        {
          "id": "Q-FDE-149",
          "question": "What happens if a software package inside an air-gapped enclave attempts to resolve an external DNS address (e.g. google.com)?",
          "options": [
            "The cluster automatically connects to the nearest satellite.",
            "The DNS query fails immediately (NXDOMAIN or timeout), and strict Infosec IDS appliances will trigger high-priority security alerts for anomalous egress attempts.",
            "The computer explodes.",
            "The query is redirected to the internal intranet."
          ],
          "correctIndex": 1,
          "explanation": "Air-gapped networks have no external DNS resolution; rogue DNS attempts fail and alert client cybersecurity monitoring systems."
        },
        {
          "id": "Q-FDE-150",
          "question": "Why do enterprise clients prefer PrivateLink over opening inbound ports on internet-facing load balancers?",
          "options": [
            "PrivateLink has no bandwidth limits.",
            "PrivateLink eliminates public IP addresses entirely, making the service invisible to internet port scanners and immune to distributed denial of service (DDoS) attacks.",
            "Public load balancers are illegal.",
            "PrivateLink works without electricity."
          ],
          "correctIndex": 1,
          "explanation": "Removing public IPs shields enterprise applications completely from internet-based automated scanners, probes, and brute-force attacks."
        }
      ]
    },
    {
      "id": "ASM-FDE-016",
      "courseId": "CRS-FDE-001",
      "chapterId": "CH-FDE-016",
      "title": "Infrastructure as Code (Terraform) Assessment",
      "summary": "Test expertise in Terraform modules, remote state with S3/DynamoDB locking, and policy-as-code security validation.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-FDE-151",
          "question": "What is the purpose of a Terraform State file (terraform.tfstate)?",
          "options": [
            "To store developer personal passwords.",
            "It records the mapping between your declarative code resources and the real-world cloud infrastructure objects created by cloud APIs, tracking metadata and dependencies.",
            "To speed up internet connection speeds.",
            "It is a backup copy of the operating system."
          ],
          "correctIndex": 1,
          "explanation": "Terraform state tracks real-world cloud IDs, attributes, and dependency mappings to calculate execution diffs during plans."
        },
        {
          "id": "Q-FDE-152",
          "question": "Why is DynamoDB state locking mandatory when using an S3 remote backend in enterprise teams?",
          "options": [
            "To pay Amazon more money.",
            "It prevents race conditions by locking the state during an active terraform apply, blocking concurrent runs that would corrupt state and destroy resources.",
            "To format JSON code automatically.",
            "DynamoDB is required to store HCL files."
          ],
          "correctIndex": 1,
          "explanation": "Distributed locking prevents two engineers or CI pipelines from applying infrastructure changes simultaneously and corrupting the state file."
        },
        {
          "id": "Q-FDE-153",
          "question": "What is 'configuration drift' in infrastructure management?",
          "options": [
            "When cloud servers drift across oceans.",
            "When real-world cloud resources are manually modified outside of Terraform (e.g. via AWS Console), causing live infrastructure to diverge from declared code.",
            "A typing mistake in a README file.",
            "When Terraform runs out of memory."
          ],
          "correctIndex": 1,
          "explanation": "Configuration drift occurs when manual out-of-band changes create discrepancies between real cloud state and the version-controlled codebase."
        },
        {
          "id": "Q-FDE-154",
          "question": "What is the primary benefit of creating reusable Terraform modules?",
          "options": [
            "Modules make code execute 100x faster.",
            "Modules encapsulate best-practice configurations (security tags, encryption, logging), enabling repeatable, standardized environment provisioning across dozens of enterprise clients.",
            "Modules eliminate the need to run terraform apply.",
            "Modules turn Terraform into Python."
          ],
          "correctIndex": 1,
          "explanation": "Modules standardize architectural patterns, ensuring all client environments adhere to verified security, networking, and tagging standards."
        },
        {
          "id": "Q-FDE-155",
          "question": "What does 'terraform plan' do before changes are made?",
          "options": [
            "It applies all changes to production immediately.",
            "It compares the declared HCL code against current state and live cloud APIs, outputting an execution plan of exactly what resources will be created, modified, or destroyed.",
            "It writes an invoice for the client.",
            "It scans code for spelling errors."
          ],
          "correctIndex": 1,
          "explanation": "<code>terraform plan</code> generates a preview of changes, allowing engineers to verify actions before committing modifications to live infrastructure."
        },
        {
          "id": "Q-FDE-156",
          "question": "What is Checkov in enterprise Terraform pipelines?",
          "options": [
            "A Russian chess game.",
            "A static code analysis tool that scans Infrastructure as Code for security misconfigurations, compliance violations, and exposed secrets before deployment.",
            "A cloud database provider.",
            "A tool for downloading videos."
          ],
          "correctIndex": 1,
          "explanation": "Checkov enforces Policy-as-Code by scanning Terraform files for security flaws (e.g. unencrypted volumes, open CIDRs) in CI pipelines."
        },
        {
          "id": "Q-FDE-157",
          "question": "Why should sensitive variables (database passwords, API keys) never be hardcoded in main.tf files?",
          "options": [
            "Because Terraform will not compile.",
            "Because hardcoded secrets in version control repositories are permanently exposed in git history to unauthorized developers and potential breach leaks.",
            "Because passwords expire in 5 minutes.",
            "Because Terraform only accepts numbers."
          ],
          "correctIndex": 1,
          "explanation": "Hardcoding secrets in git is a critical vulnerability; secrets should be injected via environment variables (TF_VAR_) or external secret managers (AWS Secrets Manager)."
        },
        {
          "id": "Q-FDE-158",
          "question": "What does the Terraform 'prevent_destroy' lifecycle rule enforce on a database resource?",
          "options": [
            "It makes the database indestructible against physical water damage.",
            "It instructs Terraform to reject any terraform apply that would result in the accidental deletion or replacement of that critical resource.",
            "It disables all SQL DELETE queries.",
            "It stops users from logging out."
          ],
          "correctIndex": 1,
          "explanation": "<code>prevent_destroy = true</code> acts as a safety guardrail, preventing catastrophic accidental deletion of production data stores."
        },
        {
          "id": "Q-FDE-159",
          "question": "How do you import existing pre-created enterprise cloud resources into Terraform management?",
          "options": [
            "By taking a photo of the cloud console.",
            "Using the 'terraform import <resource_address> <cloud_id>' command to associate existing live infrastructure with declared code blocks.",
            "By rebooting the server.",
            "You cannot manage existing resources in Terraform."
          ],
          "correctIndex": 1,
          "explanation": "<code>terraform import</code> brings existing unmanaged cloud resources into the Terraform state file without re-creating them."
        },
        {
          "id": "Q-FDE-160",
          "question": "What is the difference between a Terraform input variable and a local value (locals)?",
          "options": [
            "Variables are for numbers; locals are for text.",
            "Input variables serve as external module parameters configurable by callers; locals are internal constants and computed expressions scoped inside the module.",
            "Locals are stored in browser localStorage.",
            "Variables can only be used once."
          ],
          "correctIndex": 1,
          "explanation": "Input variables expose configurable parameters to callers, while locals define internal computed values to keep code DRY within the module."
        }
      ]
    },
    {
      "id": "ASM-FDE-017",
      "courseId": "CRS-FDE-001",
      "chapterId": "CH-FDE-017",
      "title": "CI/CD & GitOps Field Delivery Assessment",
      "summary": "Evaluate competence in GitOps reconciliation with ArgoCD, progressive canary delivery, and automated rollback gates.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-FDE-161",
          "question": "What is the fundamental philosophy of GitOps?",
          "options": [
            "Writing all software in Git repository README files.",
            "Using Git as the single source of truth for declarative infrastructure and application state, with automated controllers continuously reconciling reality to match Git.",
            "Requiring developers to memorize git CLI commands.",
            "Deleting code that is not hosted on GitHub."
          ],
          "correctIndex": 1,
          "explanation": "GitOps mandates that the desired system state is version-controlled in Git, and automated in-cluster operators pull and enforce that state."
        },
        {
          "id": "Q-FDE-162",
          "question": "How does a 'Pull-based' GitOps agent (like ArgoCD) enhance security over traditional 'Push-based' CI/CD?",
          "options": [
            "It pulls data over Bluetooth.",
            "The cluster does not expose any incoming firewall ports to external CI runners; the in-cluster agent pulls manifests from Git, keeping cluster credentials inside the firewall.",
            "It makes deployments 100 times slower.",
            "It eliminates the need for container images."
          ],
          "correctIndex": 1,
          "explanation": "Pull-based GitOps keeps cluster admin credentials inside the private network rather than distributing sensitive kubeconfigs to external CI servers."
        },
        {
          "id": "Q-FDE-163",
          "question": "What is an automated Canary Rollout?",
          "options": [
            "Releasing software only to pet store websites.",
            "Gradually shifting a small percentage of production user traffic (e.g. 5% -> 25% -> 50% -> 100%) to the new release while monitoring error rates and performance metrics.",
            "Testing software on test computers before releasing.",
            "Deploying software at 5:00 AM."
          ],
          "correctIndex": 1,
          "explanation": "Canary rollouts expose new software to a fraction of live traffic, minimizing blast radius and enabling automated rollback if anomalies arise."
        },
        {
          "id": "Q-FDE-164",
          "question": "What triggers an automated rollback during an Argo Rollouts canary deployment?",
          "options": [
            "A developer pressing Ctrl+C in terminal.",
            "Metric analysis queries (e.g. Prometheus HTTP 5xx error rate > 1% or latency > 500ms) failing the predefined safety threshold criteria.",
            "The clock striking midnight.",
            "A customer sending an email."
          ],
          "correctIndex": 1,
          "explanation": "AnalysisRuns query real-time Prometheus/Datadog metrics during the canary step; if error budgets or latency thresholds are breached, rollback is instantaneous."
        },
        {
          "id": "Q-FDE-165",
          "question": "What is the primary resource trade-off of Blue/Green deployment over Canary deployment?",
          "options": [
            "Blue/Green requires double the compute resources during deployment because two full production environments must run concurrently until traffic switches.",
            "Blue/Green cannot use databases.",
            "Canary deployments are twice as expensive as Blue/Green.",
            "Blue/Green requires physical tape drives."
          ],
          "correctIndex": 0,
          "explanation": "Blue/Green runs two complete production fleets side-by-side during cutover, requiring 200% compute capacity during the release window."
        },
        {
          "id": "Q-FDE-166",
          "question": "What is 'Self-Healing' in ArgoCD?",
          "options": [
            "Servers repairing their own hardware components.",
            "If someone manually modifies or deletes a live cluster resource via kubectl, ArgoCD automatically detects the drift and overwrites the cluster back to the state declared in Git.",
            "Restarting the computer when slow.",
            "Running antivirus software."
          ],
          "correctIndex": 1,
          "explanation": "Self-healing actively eliminates configuration drift by overwriting unauthorized out-of-band manual changes with the canonical Git manifests."
        },
        {
          "id": "Q-FDE-167",
          "question": "What is a 'semantic release' in automated CI/CD pipelines?",
          "options": [
            "Releasing software according to philosophical principles.",
            "Automatically determining the next SemVer version number (major, minor, patch) and generating changelogs based on standardized commit message conventions (e.g. Conventional Commits).",
            "Translating software into multiple languages.",
            "Releasing software on holidays."
          ],
          "correctIndex": 1,
          "explanation": "Semantic release parses commit conventions (fix: for patch, feat: for minor, BREAKING CHANGE for major) to automate versioning and release notes."
        },
        {
          "id": "Q-FDE-168",
          "question": "Why should CI/CD pipelines build container images using immutable image tags (e.g. git commit SHA) rather than mutable branch names?",
          "options": [
            "Because branch names are too long.",
            "To guarantee complete traceability: an engineer can trace the exact running container image back to the specific Git commit SHA that produced it.",
            "Because Docker does not allow letters in image tags.",
            "To make images run faster."
          ],
          "correctIndex": 1,
          "explanation": "Commit SHA tags provide immutable traceability, ensuring you know the exact code snapshot running in every container instance."
        },
        {
          "id": "Q-FDE-169",
          "question": "What is a 'Deployment Freeze' window in enterprise delivery?",
          "options": [
            "When data centers are cooled with liquid nitrogen.",
            "A designated high-traffic or regulatory period (e.g. Black Friday for retail, fiscal year-end for finance) during which all production software deployments are strictly prohibited.",
            "A period when developers do not work.",
            "When all servers are shut down."
          ],
          "correctIndex": 1,
          "explanation": "Change freezes protect revenue-critical high-traffic periods from avoidable operational disruption caused by software releases."
        },
        {
          "id": "Q-FDE-170",
          "question": "How does a GitOps repository structure separate application code from environment configuration?",
          "options": [
            "By putting all code in a single text file.",
            "Using separate repositories: an Application Repository for source code and unit tests, and a dedicated Config/Fleet Repository for environment-specific Helm values and ArgoCD manifests.",
            "By writing code in Microsoft Word.",
            "By never using Git for configuration."
          ],
          "correctIndex": 1,
          "explanation": "Separating app code from environment configs prevents CI loop triggers and allows access control segregation between developers and deployment operators."
        }
      ]
    },
    {
      "id": "ASM-FDE-018",
      "courseId": "CRS-FDE-001",
      "chapterId": "CH-FDE-018",
      "title": "Configuration Management & Feature Flags Assessment",
      "summary": "Assess understanding of dynamic feature flags, operational kill-switches, LaunchDarkly architecture, and tenant entitlement gates.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-FDE-171",
          "question": "How do modern feature flag platforms (LaunchDarkly, ConfigCat) evaluate flag rules without adding network latency to user requests?",
          "options": [
            "They make an asynchronous HTTP call to cloud servers on every user click.",
            "They stream configuration rule sets to the server SDK via persistent connections; the SDK evaluates rules in-memory locally in microseconds without network I/O.",
            "They store all flags in the user's browser cookie.",
            "They evaluate flags using quantum computing."
          ],
          "correctIndex": 1,
          "explanation": "Rules are cached in memory in the application process and updated via background streaming, making evaluation instantaneous (<1ms)."
        },
        {
          "id": "Q-FDE-172",
          "question": "What is an 'Operational Kill-Switch' feature flag?",
          "options": [
            "A physical red button in the office.",
            "A pre-configured feature flag that allows engineers to immediately disable an unhealthy external integration or resource-intensive feature across production in seconds without a redeploy.",
            "A feature that shuts down all company computers.",
            "A tool that deletes user accounts."
          ],
          "correctIndex": 1,
          "explanation": "Kill-switches provide an emergency relief valve to shed problematic features or failing third-party integrations during incidents without deploying code."
        },
        {
          "id": "Q-FDE-173",
          "question": "What is an 'Entitlement Gate' in enterprise B2B SaaS?",
          "options": [
            "A security turnstile at the office entrance.",
            "A feature flag rule that checks the customer's subscription tier or contractual package (e.g. Enterprise vs Standard) to restrict access to premium capabilities.",
            "A legal document signed by lawyers.",
            "An award given to long-time employees."
          ],
          "correctIndex": 1,
          "explanation": "Entitlement gates control feature access dynamically based on commercial contract tiers without maintaining separate codebase forks."
        },
        {
          "id": "Q-FDE-174",
          "question": "What is 'dark launching' in software engineering?",
          "options": [
            "Releasing software only at night.",
            "Deploying a new backend feature to production and routing real background traffic to it with zero UI exposure, allowing engineers to test performance and stability under live load.",
            "Deploying software on the dark web.",
            "Launching an app without marketing."
          ],
          "correctIndex": 1,
          "explanation": "Dark launching exercises new backend infrastructure with production traffic volume before releasing the user-facing interface."
        },
        {
          "id": "Q-FDE-175",
          "question": "What danger arises from accumulating 'stale feature flags' over multiple years?",
          "options": [
            "The flags become physically sticky.",
            "Dead code paths and obsolete conditional branches accumulate, creating massive cognitive load, unpredictable test state combinations, and technical debt.",
            "The server runs out of disk space.",
            "Users are logged out."
          ],
          "correctIndex": 1,
          "explanation": "Uncleaned temporary flags clutter the codebase with dead code branches and create complex combinatorial states that invite bugs."
        },
        {
          "id": "Q-FDE-176",
          "question": "How should an FDE manage environment-specific configurations across Dev, Staging, and Production?",
          "options": [
            "Hardcode strings inside the application source code.",
            "Inject configurations via external environment variables (ConfigMaps/Secrets in Kubernetes) following Twelve-Factor App principles.",
            "Ask developers to change settings manually in production.",
            "Save passwords in text files on the server Desktop."
          ],
          "correctIndex": 1,
          "explanation": "Twelve-Factor App guidelines mandate strict separation of config from code, injecting settings via environment variables at container launch."
        },
        {
          "id": "Q-FDE-177",
          "question": "What is a 'Canary Flag' percentage rollout?",
          "options": [
            "Giving free software to canaries.",
            "Configuring a feature flag rule to evaluate to true for a randomly selected subset of users (e.g. 10%) based on a consistent hash of their user ID.",
            "Releasing software to 100% of users immediately.",
            "Testing software on animal hospital networks."
          ],
          "correctIndex": 1,
          "explanation": "Percentage rollouts use consistent hashing of user keys to ensure an individual user experiences a consistent state while expanding adoption incrementally."
        },
        {
          "id": "Q-FDE-178",
          "question": "Why must feature flag evaluation SDKs handle network disconnects gracefully?",
          "options": [
            "Because the internet is always disconnected.",
            "If the streaming connection to the feature flag service drops, the SDK must fall back to the last-known cached values and local default fallbacks without throwing runtime exceptions.",
            "Because the application must crash when disconnected.",
            "To save mobile battery."
          ],
          "correctIndex": 1,
          "explanation": "Resilient SDKs fall back to safe default values during network outages, ensuring application core availability is never compromised."
        },
        {
          "id": "Q-FDE-179",
          "question": "What is the role of an audit log in enterprise feature flag platforms?",
          "options": [
            "Recording user mouse clicks.",
            "Tracking who toggled which flag, in which environment, at what exact timestamp, and with what business justification, providing non-repudiation for SOC 2 audits.",
            "Tracking software license expiration dates.",
            "Managing billing receipts."
          ],
          "correctIndex": 1,
          "explanation": "Audit logs provide non-repudiation and traceability of configuration changes, which is critical for compliance and incident investigations."
        },
        {
          "id": "Q-FDE-180",
          "question": "What is 'Trunk-Based Development' enabled by feature flags?",
          "options": [
            "Programming inside the trunk of a car.",
            "A development practice where all engineers merge small, frequent code updates directly into the main trunk branch daily, using feature flags to keep incomplete features hidden in production.",
            "Working on long-lived isolated branches for 6 months.",
            "Writing code without version control."
          ],
          "correctIndex": 1,
          "explanation": "Feature flags allow merging code continuously to main without exposing unfinished features, eliminating painful multi-month merge conflicts."
        }
      ]
    }
  ]
};
