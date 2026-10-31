// Course 8: DevOps Engineering Masterclass - Phase 1: Linux Internals, Networking & GitOps Foundations
// Chapters 1 to 7 | Assessments 1 to 7 | 70 MCQs

export const phase1 = {
  chapters: [
    {
      id: "CH-DVO-001",
      courseId: "CRS-DVO-001",
      sequence: 1,
      title: "Linux Operating System Architecture, Kernel Subsystems & Process Management",
      description: "Master the Linux architecture, monolithic kernel model, system calls, systemd init system, process states, signals, cgroups, and namespaces.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Linux Architecture, Kernel Subsystems & Process Lifecycle

Modern cloud infrastructure, container runtimes, and distributed clusters run almost universally on top of Linux. For a Platform or DevOps engineer, deep systems-level comprehension of the Linux kernel, system call interface, and process model transforms opaque infrastructure failures into transparent, diagnosable events.

---

## 1. The Monolithic Kernel Architecture & Hardware Abstraction

The Linux operating system separates execution privileges into hardware-enforced rings: **Kernel Space (Ring 0)** and **User Space (Ring 3)**.

\`\`\`
+--------------------------------------------------------------------------+
| USER SPACE (Ring 3)                                                      |
|   Applications (Nginx, Node, Python)   |   Standard C Library (glibc)    |
+--------------------------------------------------------------------------+
                                    |
                           System Call Interface (sysenter / syscall)
                                    v
+--------------------------------------------------------------------------+
| KERNEL SPACE (Ring 0)                                                    |
|   +-------------------+  +-------------------+  +--------------------+   |
|   | Process Scheduler |  | Memory Management |  | Virtual Filesystem |   |
|   | (CFS / EEVDF)     |  | (Paging, TLB, MMU)|  | (VFS, Ext4, XFS)   |   |
|   +-------------------+  +-------------------+  +--------------------+   |
|   +-------------------+  +-------------------+  +--------------------+   |
|   | Networking Stack  |  | Device Drivers    |  | IPC & Security     |   |
|   | (TCP/IP, Netfilter|  | (Block, Char, Net)|  | (cgroups, SELinux) |   |
|   +-------------------+  +-------------------+  +--------------------+   |
+--------------------------------------------------------------------------+
                                    |
                           Hardware Instructions
                                    v
+--------------------------------------------------------------------------+
| PHYSICAL HARDWARE: CPU (x86_64, ARM64) | RAM | Storage NVMe | NICs       |
+--------------------------------------------------------------------------+
\`\`\`

### Key Architectural Pillars:
1. **Virtual Filesystem (VFS):** Implements the foundational Unix philosophy: *"Everything is a file"*. Sockets, pipes, devices (\`/dev\`), and process runtime metrics (\`/proc\`, \`/sys\`) present unified POSIX file interfaces (\`open\`, \`read\`, \`write\`, \`close\`, \`ioctl\`).
2. **System Calls (syscalls):** User programs cannot directly address physical hardware or arbitrate CPU cores. They request kernel services via syscalls such as \`fork()\`, \`clone()\`, \`execve()\`, \`read()\`, and \`epoll_create()\`.
3. **Context Switching Overhead:** Transitioning CPU registers between Ring 3 and Ring 0 incurs CPU cycles, TLB (Translation Lookaside Buffer) flushes, and memory cache eviction. High-throughput systems minimize unnecessary context switches.

---

## 2. Process Lifecycle & State Machine

In Linux, processes are represented internally by the kernel structure \`task_struct\` (defined in \`<linux/sched.h>\`). Every process belongs to a parent-child hierarchy anchored at Process ID 1 (\`systemd\` or \`init\`).

\`\`\`
          fork() / clone()
                 |
                 v
           [ TASK_RUNNING ] <------------------------+
           (Ready or Executing)                      |
                 |       ^                           |
      sleep() /  |       | I/O Complete /            |
      Wait I/O   v       | Event Fired               |
          [ TASK_INTERRUPTIBLE ]                     |
          [ TASK_UNINTERRUPTIBLE ] (D state, Disk)   |
                 |                                   |
                 | SIGKILL / exit()                  |
                 v                                   |
           [ TASK_ZOMBIE ] (Exit dead, wait child)   |
                 |                                   |
                 +--- Parent invokes waitpid() ------+
\`\`\`

### Diagnostic Process Commands:
\`\`\`bash
# Trace active process hierarchy with PIDs, users, and threads
ps -ef --forest

# Inspect real-time top CPU and memory consumers with 1-second refresh
top -b -n 1 | head -n 25

# Identify processes stuck in Uninterruptible Sleep (D state)
ps aux | awk '{if ($8 ~ "D") print $0}'

# Trace system calls executed by an active process (PID 1420)
strace -p 1420 -c
\`\`\`

---

## 3. Signal Handling & Process Interruption

Signals are asynchronous notifications dispatched by the kernel or processes to alert an execution thread of an event.

| Signal Name | Number | Default Action | Overridable? | Production Significance |
|---|---|---|---|---|
| **SIGHUP** | 1 | Terminate | Yes | Commonly intercepted by daemons (e.g., Nginx, Prometheus) to reload configuration without stopping. |
| **SIGINT** | 2 | Terminate | Yes | Issued by terminal via \`Ctrl + C\` to gracefully request application termination. |
| **SIGQUIT** | 3 | Core Dump | Yes | Issued via \`Ctrl + \\\`; terminates process and writes core memory snapshot for post-mortem debugging. |
| **SIGKILL** | 9 | Force Kill | **NO** | Uncatchable kernel-level execution termination; leaves no room for cleanup or socket flushing. |
| **SIGSEGV** | 11 | Core Dump | Yes | Segmentation Fault: process attempted unauthorized memory segment access (null pointer dereference). |
| **SIGTERM** | 15 | Terminate | Yes | Standard graceful termination request used by Kubernetes and Docker (\`docker stop\`) before issuing SIGKILL. |

---

## 4. Systemd: Unit Files & Service Orchestration

Modern Linux distributions manage daemons, boot targets, and resource boundaries via **systemd**.

### Production Systemd Unit File (\`/etc/systemd/system/api-gateway.service\`):
\`\`\`ini
[Unit]
Description=Enterprise API Gateway Microservice
Documentation=https://docs.enterprise.internal/gateway
After=network.target remote-fs.target
Wants=network-online.target

[Service]
Type=notify
User=appuser
Group=appgroup
WorkingDirectory=/opt/api-gateway
ExecStart=/opt/api-gateway/bin/gateway --config /etc/gateway/config.yaml
ExecReload=/bin/kill -HUP \$MAINPID
Restart=on-failure
RestartSec=5s

# Hardening & Sandboxing Directives
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/var/log/api-gateway /var/run/api-gateway

# Kernel Resource Limits
LimitNOFILE=65535
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
\`\`\`

---

## 5. Control Groups (cgroups v2) & Namespaces Foundations

Containers are not virtual machines; they are standard Linux processes bound by two kernel isolation primitives:
1. **Namespaces (What you can SEE):**
   - \`pid\`: Isolates process IDs (Container PID 1 maps to Host PID 18450).
   - \`net\`: Isolates network interfaces, IP routing tables, and port allocations.
   - \`mnt\`: Isolates filesystem mount points.
   - \`ipc\`: Isolates inter-process shared memory and semaphores.
   - \`uts\`: Isolates hostname and domain name.
   - \`user\`: Maps container root UID 0 to an unprivileged host UID (e.g., 10001).
2. **Control Groups / cgroups (What you can USE):**
   - Imposes hard boundaries on CPU shares, memory caps, swap limitations, and block I/O throughput. In **cgroups v2**, controllers are unified under a single hierarchical tree (\`/sys/fs/cgroup\`).

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/01w6Usmb3vM" title="Linux Architecture & Kernel Internals" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-002",
      courseId: "CRS-DVO-001",
      sequence: 2,
      title: "Linux Networking Deep Dive, Sockets & Packet Filtering",
      description: "Understand the Linux networking stack, TCP 3-way handshakes, socket buffers, netfilter/iptables, routing tables, and troubleshooting tools.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Linux Networking Internals, Sockets & Packet Filtering

Distributed microservices and Kubernetes pods communicate over software-defined overlays anchored in the Linux kernel networking stack. Troubleshooting network latency, socket exhaustion, and packet drops requires granular insight into kernel packet flow.

---

## 1. The Kernel Network Subsystem & Packet Traversal

\`\`\`
PHYSICAL NIC  --->  Ring Buffer (RX)  --->  Hard IRQ (Hardware Interrupt)
                                                  |
                                                  v
SOCKET RECEIVE BUFFER  <---  TCP/IP Stack  <---  SoftIRQ (NAPI Polling Loop)
     (sk_buff)               (Netfilter /
                             iptables / nft)
\`\`\`

1. **sk_buff (Socket Buffer):** The universal kernel data structure wrapping packets as they traverse network driver layers, firewalls, and routing tables.
2. **NAPI (New API):** An interrupt mitigation technique combining hardware IRQs with high-speed kernel software polling loops to process thousands of ingress frames without overwhelming the CPU.
3. **Socket States (TCP State Machine):**
   - \`LISTEN\`: Kernel socket awaiting inbound connection requests.
   - \`SYN_SENT\` / \`SYN_RECV\`: Active three-way handshake in progress.
   - \`ESTABLISHED\`: Active two-way data streaming channel.
   - \`TIME_WAIT\`: Connection closed; kernel holds socket open (standard 60s) to absorb delayed or duplicate packets before port reuse.

---

## 2. Advanced Socket Diagnostics with \`ss\` and \`ip\`

The legacy \`net-tools\` package (\`netstat\`, \`ifconfig\`, \`route\`) has been fully superseded by the high-performance \`iproute2\` suite.

\`\`\`bash
# Display all listening TCP sockets with process names and numerical ports
ss -tulpn

# Count sockets by state (crucial during connection pool exhaustion)
ss -ant | awk '{print \$1}' | sort | uniq -c | sort -nr

# Inspect network interface details, MTU, and link errors
ip -s link show eth0

# Trace IP routing decisions for a specific destination IP
ip route get 10.244.2.15

# View kernel ARP (Address Resolution Protocol) cache table
ip neigh show
\`\`\`

---

## 3. Netfilter, iptables & Modern nftables

Linux packet filtering, Network Address Translation (NAT), and packet alteration are powered by the **Netfilter** kernel framework.

\`\`\`
                PREROUTING
                     |
         +-----------+-----------+
         |                       |
(Destination is Local)    (Destination is Remote)
         |                       |
       INPUT                  FORWARD
         |                       |
    Local Process                |
         |                       |
       OUTPUT                    |
         |                       |
         +-----------+-----------+
                     |
                POSTROUTING
\`\`\`

### Common iptables Tables:
- **filter:** Default table for firewall policies (\`INPUT\`, \`FORWARD\`, \`OUTPUT\`).
- **nat:** Modifies source or destination IP/Port (\`PREROUTING\` for DNAT, \`POSTROUTING\` for SNAT/Masquerade).
- **mangle:** Modifies IP packet headers (TTL, TOS, QoS flags).

### Hardening Ingress with iptables:
\`\`\`bash
# Set default DROP policy on incoming traffic
iptables -P INPUT DROP
iptables -P FORWARD DROP

# Allow established and related return traffic
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow loopback traffic
iptables -A INPUT -i lo -j ACCEPT

# Allow inbound SSH on port 22 and HTTPS on port 443
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
\`\`\`

---

## 4. Real-Time Packet Capture with \`tcpdump\`

When application logs fail to reveal why HTTP or gRPC calls are resetting, wire-level packet captures provide definitive root-cause evidence.

\`\`\`bash
# Capture 100 packets on interface eth0 matching port 80 or 443 and write to PCAP
tcpdump -i eth0 -nn -s 0 -c 100 'tcp port 80 or tcp port 443' -w /tmp/ingress.pcap

# Live inspect TCP SYN and RST packets (detecting connection resets)
tcpdump -i any -nn 'tcp[tcpflags] & (tcp-syn|tcp-rst) != 0'
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/qiQR5rTSshw" title="Computer Networking Complete Course" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-003",
      courseId: "CRS-DVO-001",
      sequence: 3,
      title: "Advanced Bash Scripting, Automation & POSIX Stream Processing",
      description: "Write defensive, production-ready shell automation using POSIX idioms, trap handling, sed/awk parsing, and robust error traps.",
      contentType: "Rich Text",
      durationMinutes: 70,
      minimumTimeMinutes: 45,
      body: `
# Advanced Bash Scripting, Automation & POSIX Stream Processing

Shell scripts drive deployment pipelines, custom container entrypoints, and disaster recovery runbooks. Poorly authored scripts fail silently, mask exit codes, and introduce catastrophic production regressions.

---

## 1. Defensive Bash Header: The Strict Execution Mode

Every production Bash script must start with strict interpreter safety flags:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'
\`\`\`

### Breakdown of Directives:
- \`-e\` (\`errexit\`): Immediately abort execution if any command exits with a non-zero exit status.
- \`-u\` (\`nounset\`): Treat unset variables as errors and exit immediately, preventing catastrophic bugs like \`rm -rf /\${UNDEFINED_VAR}*\`.
- \`-o pipefail\`: Pipelines fail if *any* command in the pipeline fails (e.g., \`failing_cmd | grep "foo"\` returns \`failing_cmd\`'s exit code instead of grep's success).
- \`IFS=$'\\n\\t'\`: Restricts Internal Field Separator to newlines and tabs, preventing accidental word-splitting on spaces inside file paths.

---

## 2. Resource Cleanup with Signal Traps

Production scripts frequently allocate temporary files, locks, or network tunnels that must be cleaned up on normal exit or sudden aborts (\`SIGINT\`, \`SIGTERM\`).

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail

# Create secure temporary directory
TEMP_DIR=\$(mktemp -d -t deploy-XXXXXX)

# Define idempotency trap
cleanup() {
  local exit_code=\$?
  echo "==> Executing cleanup routine for \${TEMP_DIR} (Exit code: \${exit_code})..."
  rm -rf "\${TEMP_DIR}"
  exit "\${exit_code}"
}

# Trap standard exit, Ctrl+C (SIGINT), and kill (SIGTERM)
trap cleanup EXIT SIGINT SIGTERM

echo "Compiling artifacts into \${TEMP_DIR}..."
touch "\${TEMP_DIR}/payload.tar.gz"
# Simulated work...
\`\`\`

---

## 3. Stream Processing with \`awk\` and \`sed\`

DevOps engineers must rapidly extract structured telemetry from unstructured log files without spinning up heavy scripting runtimes.

### Text Transformation with \`sed\`:
\`\`\`bash
# Replace hostnames in configuration files in-place
sed -i 's/db.internal.dev/db.prod.internal/g' /etc/app/config.ini

# Delete blank lines and comments starting with '#'
sed -i '/^[[:space:]]*#/d; /^[[:space:]]*\$/d' /etc/nginx/nginx.conf
\`\`\`

### Tabular Telemetry Aggregation with \`awk\`:
\`\`\`bash
# Calculate total HTTP 500 response codes from an Nginx access log
# Assuming format: IP - - [Date] "METHOD /path HTTP/1.1" STATUS BYTES
awk '\$9 ~ /^5/ { count++ } END { print "Total 5xx Errors:", count + 0 }' /var/log/nginx/access.log

# Group requests by Client IP and list Top 10 heavy hitters
awk '{print \$1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/e7BufAVwDiM" title="Bash Scripting Tutorial for Beginners" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-004",
      courseId: "CRS-DVO-001",
      sequence: 4,
      title: "Git Internals, Object Model & Advanced Version Control",
      description: "Deconstruct Git internals: blobs, trees, commits, tags, DAG history, interactive rebasing, cherry-picking, and bisect debugging.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Git Internals, Object Model & Advanced Version Control

Git is not merely a tool for code uploads; it is a content-addressable directed acyclic graph (DAG) storage engine. Comprehending its internal anatomy allows engineers to troubleshoot corrupt repositories, perform surgery on broken histories, and automate complex release rebasing.

---

## 1. The Four Fundamental Git Objects

Everything inside the \`.git/objects/\` directory is compressed with zlib and indexed by a 40-character SHA-1 (or SHA-256) hash computed from its header and content.

\`\`\`
   COMMIT OBJECT (SHA: a1b2c3d)
   +---------------------------------------+
   | tree: e4f5g6h                         |
   | parent: z9y8x7w                       |
   | author: Alex <alex@corp.com>          |
   | message: "feat: add payment gateway"  |
   +---------------------------------------+
                     |
                     v
   TREE OBJECT (SHA: e4f5g6h)
   +---------------------------------------+
   | 100644 blob 88aa99... README.md       |
   | 040000 tree bb1122... src/            |
   +---------------------------------------+
         |                     |
         v                     v
   BLOB OBJECT (File)    SUBTREE OBJECT (src/)
   +-----------------+   +-----------------------------------+
   | "# Payment API" |   | 100644 blob 33cc44... server.go   |
   +-----------------+   +-----------------------------------+
\`\`\`

1. **Blob:** Stores raw file data without metadata, filenames, or file permissions.
2. **Tree:** Represents directories; maps file modes, names, and hashes to Blobs or sub-Trees.
3. **Commit:** Captures a snapshot pointer to a root Tree, parent commit SHA(s), author info, committer info, and commit message.
4. **Annotated Tag:** Permanent point-in-time reference pointing to a specific commit, carrying GPG signatures and release notes.

---

## 2. Advanced Historical Surgery: Interactive Rebase

Interactive rebasing allows developers to curate a clean, atomic Git history before submitting code for enterprise integration.

\`\`\`bash
# Interactively rewrite the last 4 commits
git rebase -i HEAD~4
\`\`\`

Inside the interactive rebase editor:
\`\`\`
pick e1a2b3c feat: implement checkout route
squash d4e5f6g fix: linting error in checkout
reword g7h8i9j docs: update API documentation
drop k1l2m3n debug: console logs to inspect payload
\`\`\`

---

## 3. Automated Defect Localization with \`git bisect\`

When a production defect surfaces and its introduction point is unknown across hundreds of merged commits, \`git bisect\` leverages binary search across the commit graph to isolate the breaking commit in $O(\\log N)$ steps.

\`\`\`bash
# Begin bisect session
git bisect start

# Mark current HEAD as broken
git bisect bad

# Mark last known good release tag or commit SHA
git bisect good v2.4.0

# Automatically test commits using an automated test script
git bisect run npm test -- --grep "CheckoutFlow"

# Reset repository to normal state once isolated
git bisect reset
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/2sjqTHE0zok" title="Git Internals Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-005",
      courseId: "CRS-DVO-001",
      sequence: 5,
      title: "Git Branching Strategies, Trunk-Based Development & SemVer",
      description: "Compare GitFlow, GitHub Flow, and Trunk-Based Development. Implement Semantic Versioning 2.0 and automated release tag pipelines.",
      contentType: "Rich Text",
      durationMinutes: 65,
      minimumTimeMinutes: 40,
      body: `
# Git Branching Strategies, Trunk-Based Development & SemVer

Software delivery velocity is governed by branching and merge policies. Misaligned branching strategies cause merge paralysis, long-lived feature drifts, and delayed release cycles.

---

## 1. Branching Strategy Comparison Matrix

| Attribute | GitFlow | GitHub Flow | Trunk-Based Development (TBD) |
|---|---|---|---|
| **Branch Lifespan** | Long (weeks to months) | Short (1–3 days) | Extremely Short (hours to 1 day) |
| **Core Branches** | \`main\`, \`develop\`, release, hotfix | \`main\`, feature branches | Single shared trunk (\`main\`) |
| **Deployment Target** | Periodic scheduled releases | Deploy on merge to \`main\` | Continuous automated deployment |
| **Feature Isolation** | Feature branches | Pull Request branches | **Feature Flags (Toggles)** |
| **Merge Friction** | High (frequent merge conflicts) | Low-Medium | Near-Zero |
| **DevOps Suitability** | Legacy release models | SaaS & Web Apps | **Elite DORA High-Velocity Teams** |

\`\`\`
Trunk-Based Development Workflow:
-------------------------------------------------------------------------
Trunk (main)  o====o====o====o====o====o====o====o====o (Always Deployable)
               \\      /  \\      /  \\      /
Short Branch    o----o    o----o    o----o   (< 24 hour lifespan)
\`\`\`

---

## 2. Semantic Versioning Specification (SemVer 2.0)

Automated release engineering requires strict adherence to Semantic Versioning:

\`\`\`
       MAJOR . MINOR . PATCH - PRERELEASE + BUILDMETADATA
         2   .   4   .   1   -  rc.1      +  sha.7b9c1
\`\`\`

- **MAJOR (Breaking Changes):** Incompatible API changes, deprecated endpoint removals, schema breaking migrations.
- **MINOR (New Features):** Backwards-compatible functionality additions.
- **PATCH (Bug Fixes):** Backwards-compatible bug fixes and internal security patches.

---

## 3. Conventional Commits for Automated Releases

Structuring commit messages enables automated changelog generation and SemVer bumping tools (e.g., Semantic Release, Changesets):

\`\`\`
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
\`\`\`

- \`feat(auth): add OAuth2 PKCE login support\` $\\rightarrow$ Triggers **MINOR** bump.
- \`fix(cart): resolve currency rounding precision bug\` $\\rightarrow$ Triggers **PATCH** bump.
- \`feat(api)!: drop legacy v1 XML payload support\` (or \`BREAKING CHANGE: ...\` in footer) $\\rightarrow$ Triggers **MAJOR** bump.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/8A4nw_Wn-U4" title="Trunk-Based Development vs GitFlow" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-006",
      courseId: "CRS-DVO-001",
      sequence: 6,
      title: "Modern CI/CD Architecture, Quality Gates & Pipeline Economics",
      description: "Design fault-tolerant CI/CD delivery pipelines, implement shift-left security quality gates, and optimize compute economics.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Modern CI/CD Architecture, Quality Gates & Pipeline Economics

Continuous Integration (CI) and Continuous Delivery (CD) are the mechanical backbone of DevOps. A resilient pipeline accelerates lead time for changes while blocking defective or insecure code from ever reaching production.

---

## 1. CI vs. CD: The Spectrum of Delivery

\`\`\`
+-----------------------+     +-----------------------+     +-----------------------+
| CONTINUOUS            |     | CONTINUOUS            |     | CONTINUOUS            |
| INTEGRATION (CI)      |     | DELIVERY (CD)         |     | DEPLOYMENT (CD)       |
+-----------------------+     +-----------------------+     +-----------------------+
| - Code Linting        |     | - Automated Staging   |     | - Fully automated push|
| - Unit & In-Memory    |     |   Deployments         |     |   to Production       |
|   Tests               |     | - Integration Testing |     | - Zero manual gates   |
| - SAST & Secret Scan  |     | - Performance Gates   |     | - Automated Canary &  |
| - Build Image & Push  |     | - Manual Approval to  |     |   Rollback telemetry  |
|                       |     |   Production          |     |                       |
+-----------------------+     +-----------------------+     +-----------------------+
\`\`\`

---

## 2. Shift-Left Security & Pipeline Quality Gates

Security and quality must be validated continuously at the earliest possible stages of the pipeline:

\`\`\`
COMMIT  --->  LINT & SAST  --->  UNIT TESTS  --->  CONTAINER SCAN  --->  DEPLOY
               (SonarQube)       (Jest/PyTest)     (Trivy/Snyk)           (ArgoCD)
\`\`\`

### Enterprise Quality Gate Criteria:
1. **Unit Test Coverage:** Enforce $\\ge 80\\%$ line and branch coverage threshold.
2. **Static Application Security Testing (SAST):** Zero High or Critical severity vulnerabilities allowed to merge.
3. **Secret Scanning:** Blocking commits containing unencrypted private keys, API tokens, or database credentials (e.g., Gitleaks).
4. **Software Bill of Materials (SBOM):** Automated generation of CycloneDX or SPDX dependencies for vulnerability tracking.

---

## 3. Pipeline Economics & Performance Optimization

Slow CI pipelines kill engineering productivity. High-performing organizations optimize CI performance through:
- **Layer & Dependency Caching:** Cache \`npm\`, \`pip\`, and \`go\` vendor modules alongside Docker multi-stage build caches.
- **Test Parallelization & Sharding:** Split unit test execution across matrix runners (e.g., splitting 1,000 integration tests across 4 concurrent nodes cuts runtime by $\\sim 70\\%$).
- **Ephemeral Self-Hosted Runners:** Run dynamic autoscaling build runners on top of Kubernetes (e.g., Actions Runner Controller - ARC) on cloud spot instances, reducing compute expenses by up to $80\\%$.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/scEDHsr3APg" title="CI/CD Pipeline Architecture Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-007",
      courseId: "CRS-DVO-001",
      sequence: 7,
      title: "GitHub Actions Enterprise Pipelines, Reusable Workflows & OIDC",
      description: "Build production GitHub Actions pipelines with matrix builds, composite actions, reusable workflows, cache layers, and keyless AWS OIDC authentication.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# GitHub Actions Enterprise Pipelines, Reusable Workflows & OIDC

GitHub Actions is the premier cloud-native CI/CD orchestration engine. Constructing production pipelines requires mastering workflow composition, matrix testing, and passwordless authentication with cloud providers via OpenID Connect (OIDC).

---

## 1. Enterprise GitHub Actions Pipeline Architecture

\`\`\`yaml
name: Production Delivery Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  id-token: write # Mandatory for AWS OIDC authentication
  contents: read  # Read access to codebase

jobs:
  test:
    name: Test & Lint Suite
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [ 18.x, 20.x ]
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Execute Test Suite
        run: npm test -- --coverage

  build-and-deploy:
    name: Build & Deploy Container
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      # Keyless OIDC Authentication with AWS
      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy-role
          aws-region: us-east-1

      - name: Log in to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and Push Docker Image
        env:
          REGISTRY: \${{ steps.login-ecr.outputs.registry }}
          REPOSITORY: core-api
          IMAGE_TAG: \${{ github.sha }}
        run: |
          docker build -t \$REGISTRY/\$REPOSITORY:\$IMAGE_TAG .
          docker push \$REGISTRY/\$REPOSITORY:\$IMAGE_TAG
\`\`\`

---

## 2. Keyless Authentication via OpenID Connect (OIDC)

Hard-coding long-lived cloud credentials (\`AWS_ACCESS_KEY_ID\` and \`AWS_SECRET_ACCESS_KEY\`) into CI repository secrets exposes organizations to severe credential leakage risks.

\`\`\`
+----------------+      1. Request JWT Token       +----------------+
| GitHub Actions | ------------------------------> | GitHub OIDC IdP|
| Workflow Job   | <------------------------------ |                |
+----------------+      2. Returns signed JWT      +----------------+
        |
        | 3. AssumeRoleWithWebIdentity (passes JWT)
        v
+----------------+      4. Validates JWT Signature +----------------+
| AWS STS        | ------------------------------> | Grants Temp    |
| Security Token | <------------------------------ | Credentials    |
+----------------+     (Valid for 15-60 minutes)   +----------------+
\`\`\`

---

## 3. Reusable Workflows for Organizational Governance

Centralized security teams publish standard, immutable workflows that application repositories inherit:

\`\`\`yaml
# Inside .github/workflows/caller.yaml
jobs:
  call-security-audit:
    uses: enterprise-org/central-workflows/.github/workflows/security-scan.yaml@v1
    with:
      target-path: './src'
    secrets:
      SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/R8_veQiYBjI" title="GitHub Actions Tutorial - CI/CD DevOps" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-DVO-001",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-001",
      title: "Linux Operating System Architecture & Process Management Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-001",
          type: "MCQ",
          prompt: "What is the primary role of the Linux System Call Interface (syscall)?",
          options: [
            "It acts as a controlled gateway allowing User Space (Ring 3) programs to request privileged Kernel Space (Ring 0) services",
            "It compiles C code into machine assembly during runtime execution",
            "It isolates CSS and DOM elements across browser tabs",
            "It provides automated backup of files to remote storage locations"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-002",
          type: "MCQ",
          prompt: "Which Linux kernel signal CANNOT be intercepted, caught, or ignored by an application process?",
          options: ["SIGTERM (15)", "SIGINT (2)", "SIGKILL (9)", "SIGHUP (1)"],
          answer: 2,
          points: 10,
        },
        {
          id: "Q-DVO-003",
          type: "MCQ",
          prompt: "What does a process in the 'D' state (TASK_UNINTERRUPTIBLE) signify in top or ps outputs?",
          options: [
            "The process is waiting on a hardware event or synchronous disk I/O and cannot be interrupted even by SIGKILL",
            "The process has completed execution and is ready for garbage collection",
            "The process is running inside a Docker debug container",
            "The process has crashed and dumped its memory core to /tmp"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-004",
          type: "MCQ",
          prompt: "In Linux process management, what is a 'Zombie' process?",
          options: [
            "A malicious binary executing encrypted payloads in the background",
            "A process that has terminated execution, but its exit status remains in the process table because its parent has not invoked wait()/waitpid()",
            "A process running with an inverted nice value priority",
            "A network socket held open after a timeout event"
          ],
          answer: 1,
          points: 10,
        },
        {
          id: "Q-DVO-005",
          type: "MCQ",
          prompt: "Which Linux kernel namespace isolates IP routing tables, firewall rules, and network port bindings?",
          options: ["pid namespace", "net namespace", "mnt namespace", "user namespace"],
          answer: 1,
          points: 10,
        },
        {
          id: "Q-DVO-006",
          type: "MCQ",
          prompt: "What fundamental role do Linux Control Groups (cgroups) play in container architectures?",
          options: [
            "They enforce hard resource limits and metering on CPU, memory, swap, and I/O usage for a collection of processes",
            "They encrypt files stored on NVMe solid-state storage",
            "They automatically recompile kernel modules upon system reboot",
            "They manage SSL/TLS certificate handshakes for web servers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-007",
          type: "MCQ",
          prompt: "What happens when a daemon receives a SIGHUP (Signal 1) signal under standard POSIX conventions?",
          options: [
            "It drops all database connections and triggers a kernel panic",
            "It reloads its configuration files without stopping or restarting the running process",
            "It forces an immediate memory garbage collection sweep",
            "It exports thread dumps to standard error"
          ],
          answer: 1,
          points: 10,
        },
        {
          id: "Q-DVO-008",
          type: "MCQ",
          prompt: "In a systemd service unit file, which directive ensures that child processes cannot escalate privileges via setuid binaries?",
          options: ["NoNewPrivileges=true", "ProtectSystem=full", "LimitNOFILE=65535", "Restart=always"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-009",
          type: "MCQ",
          prompt: "Which command would you use to trace system calls and execution latency invoked by a live running process with PID 2048?",
          options: ["strace -p 2048 -c", "netstat -tuln 2048", "iptables -L 2048", "lsof -i :2048"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-010",
          type: "MCQ",
          prompt: "What is the key difference between cgroups v1 and cgroups v2?",
          options: [
            "cgroups v2 eliminates the multi-hierarchy model, consolidating all resource controllers under a single unified process tree (/sys/fs/cgroup)",
            "cgroups v2 removes support for memory limits entirely",
            "cgroups v2 only functions on 32-bit CPU architectures",
            "cgroups v2 is written in Rust instead of C"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-002",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-002",
      title: "Linux Networking Deep Dive & Packet Filtering Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-011",
          type: "MCQ",
          prompt: "What is the primary function of the Netfilter framework in the Linux kernel?",
          options: [
            "It provides hooks inside the kernel network stack to inspect, filter, modify, and redirect packets (enabling iptables and NAT)",
            "It compresses TCP payload data using gzip before transmission",
            "It balances disk I/O requests across RAID arrays",
            "It manages SSH authorized keys in user home directories"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-012",
          type: "MCQ",
          prompt: "In the TCP state machine, why does a closing socket remain in the TIME_WAIT state for standard duration (e.g., 60 seconds)?",
          options: [
            "To allow enough time for delayed or out-of-order packets to expire on the network, preventing them from corrupting a new connection reusing the same port",
            "Because the application crashed and memory could not be reclaimed",
            "To wait for a DNS name server to refresh its TTL cache",
            "To allow the CPU to cool down after high-throughput streaming"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-013",
          type: "MCQ",
          prompt: "Which modern iproute2 command displays all listening TCP ports along with process names and numerical port numbers?",
          options: ["ss -tulpn", "netstat -all -ports", "ip route show all", "ifconfig -a --listening"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-014",
          type: "MCQ",
          prompt: "In iptables architecture, which table and chain are responsible for Destination NAT (DNAT) port forwarding before routing decisions occur?",
          options: ["nat table, PREROUTING chain", "filter table, INPUT chain", "mangle table, POSTROUTING chain", "raw table, OUTPUT chain"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-015",
          type: "MCQ",
          prompt: "What is the purpose of NAPI (New API) in the Linux kernel network device driver architecture?",
          options: [
            "To mitigate CPU interrupt storms by switching from hardware IRQ interrupts to kernel software polling during heavy packet floods",
            "To automatically generate OpenAPI REST documentation",
            "To encrypt network traffic with AES-256 in user space",
            "To route HTTP packets based on JSON body parameters"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-016",
          type: "MCQ",
          prompt: "Which command captures 100 raw packets on interface eth0 for ports 80 or 443 and saves them to a file for Wireshark inspection?",
          options: [
            "tcpdump -i eth0 -nn -s 0 -c 100 'tcp port 80 or tcp port 443' -w /tmp/ingress.pcap",
            "iptables -A INPUT -p tcp --dport 80,443 -j LOG --log-prefix 'CAPTURE:'",
            "ss -i eth0 -p 80,443 > /tmp/ingress.pcap",
            "ip link capture eth0 --packets=100 > /tmp/ingress.pcap"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-017",
          type: "MCQ",
          prompt: "What does Maximum Transmission Unit (MTU) represent in Ethernet networking (standard value 1500 bytes)?",
          options: [
            "The largest size protocol data unit (PDU) in bytes that an interface can transmit without requiring fragmentation",
            "The maximum number of connections an Nginx worker can hold open",
            "The bandwidth capacity of a fiber optic cable in megabits",
            "The timeout threshold before a TCP socket enters FIN_WAIT"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-018",
          type: "MCQ",
          prompt: "Which command correctly queries the kernel routing table to determine which interface and gateway will route traffic to 192.168.1.100?",
          options: ["ip route get 192.168.1.100", "traceroute --local-cache 192.168.1.100", "netstat -r --find 192.168.1.100", "route -query 192.168.1.100"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-019",
          type: "MCQ",
          prompt: "What is the function of the kernel structure 'sk_buff' (socket buffer)?",
          options: [
            "It is the fundamental packet representation structure passed across all network stack layers in the Linux kernel",
            "It stores HTML responses before sending to web clients",
            "It holds user credentials for SSH passwordless authentication",
            "It configures DNS nameservers inside /etc/resolv.conf"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-020",
          type: "MCQ",
          prompt: "How does iptables SNAT (Source Network Address Translation) differ from MASQUERADE?",
          options: [
            "SNAT requires specifying a static, fixed outbound IP address, whereas MASQUERADE dynamically checks and uses the interface's current assigned IP (ideal for DHCP)",
            "SNAT operates on inbound traffic, while MASQUERADE operates on outbound traffic",
            "MASQUERADE only works with UDP packets",
            "SNAT requires root privileges but MASQUERADE does not"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-003",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-003",
      title: "Advanced Bash Scripting & Stream Processing Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-021",
          type: "MCQ",
          prompt: "What is the effect of setting 'set -euo pipefail' at the beginning of a Bash automation script?",
          options: [
            "It causes the script to abort on any command error (-e), fail on undefined variables (-u), and propagate pipeline errors (-o pipefail)",
            "It runs the script in multi-threaded background mode with unlimited memory",
            "It disables all log outputs and suppresses stderr streams",
            "It forces the script to execute inside a Docker container"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-022",
          type: "MCQ",
          prompt: "How does 'trap cleanup EXIT SIGINT SIGTERM' enhance the resilience of an infrastructure deployment script?",
          options: [
            "It guarantees that the cleanup function executes when the script completes normally, encounters an error, or receives an interrupt signal",
            "It restarts the script in an infinite retry loop upon failure",
            "It sends an automated SMS alert to the on-call engineer",
            "It captures a memory dump and uploads it to an S3 bucket"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-023",
          type: "MCQ",
          prompt: "In Bash, what is the key difference between single brackets '[ ... ]' and double brackets '[[ ... ]]' for conditions?",
          options: [
            "'[[ ... ]]' is a modern Bash keyword supporting regex matching (=~), logical operators (&&, ||), and avoids word splitting errors",
            "'[ ... ]' executes faster because it runs inside the GPU",
            "'[[ ... ]]' only supports mathematical comparisons of floating-point numbers",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-024",
          type: "MCQ",
          prompt: "Which 'sed' command replaces all occurrences of 'dev.api.internal' with 'prod.api.internal' in-place in /etc/config.json?",
          options: [
            "sed -i 's/dev.api.internal/prod.api.internal/g' /etc/config.json",
            "sed --replace 'dev.api.internal' 'prod.api.internal' /etc/config.json",
            "awk -i 'sub(/dev.api.internal/, prod.api.internal)' /etc/config.json",
            "grep -replace 'dev.api.internal' 'prod.api.internal' /etc/config.json"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-025",
          type: "MCQ",
          prompt: "In awk, what does the special variable 'NF' represent?",
          options: [
            "Number of Fields (columns) in the current record/line",
            "Number of Files currently opened by the script",
            "New File indicator flag",
            "Numerical Float formatting precision"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-026",
          type: "MCQ",
          prompt: "Which awk one-liner aggregates and prints the sum of numerical values in the 3rd column of 'metrics.csv'?",
          options: [
            "awk -F',' '{sum += $3} END {print sum}' metrics.csv",
            "awk '{print sum($3)}' metrics.csv",
            "sed -n 's/.*,//p' metrics.csv | sum",
            "grep -sum 3 metrics.csv"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-027",
          type: "MCQ",
          prompt: "What does the Bash parameter expansion '${DATABASE_PORT:-5432}' accomplish?",
          options: [
            "It evaluates to the value of DATABASE_PORT if set and non-empty; otherwise, it defaults to '5432'",
            "It throws an error if DATABASE_PORT is not equal to 5432",
            "It permanently reassigns DATABASE_PORT to 5432 in the operating system environment",
            "It deletes the variable DATABASE_PORT after reading 5432 bytes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-028",
          type: "MCQ",
          prompt: "What is the purpose of setting 'IFS=$'\\n\\t'' in a Bash script?",
          options: [
            "It limits field splitting strictly to newlines and tabs, preventing spaces in filenames from splitting arguments into separate tokens",
            "It converts all tab characters into 4 spaces automatically",
            "It sets the default timezone to UTC",
            "It enables international language localization"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-029",
          type: "MCQ",
          prompt: "How can you run a background command in Bash while saving its Process ID (PID) for later monitoring?",
          options: [
            "nohup ./worker.sh & WORKER_PID=$!",
            "exec ./worker.sh --save-pid WORKER_PID",
            "WORKER_PID=$(pidof ./worker.sh --bg)",
            "run --async ./worker.sh > WORKER_PID"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-030",
          type: "MCQ",
          prompt: "What does the exit status '$?' represent immediately after running a command?",
          options: [
            "The numeric return code of the most recently executed foreground pipeline (0 indicates success; non-zero indicates error)",
            "The execution duration of the command in milliseconds",
            "The memory consumed by the command in megabytes",
            "The process ID of the parent shell"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-004",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-004",
      title: "Git Internals & Advanced Version Control Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-031",
          type: "MCQ",
          prompt: "What are the four fundamental object types stored inside Git's content-addressable database (.git/objects)?",
          options: [
            "Blob, Tree, Commit, and Annotated Tag",
            "File, Folder, Branch, and Pull Request",
            "Diff, Patch, Index, and Working Tree",
            "Repository, Remote, Stash, and Config"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-032",
          type: "MCQ",
          prompt: "How does a Git 'Tree' object differ from a 'Blob' object?",
          options: [
            "A Blob stores raw file data, while a Tree represents directory structure, mapping filenames, permissions, and hashes to Blobs or sub-Trees",
            "A Tree stores binary images, while a Blob stores plain text code",
            "A Tree holds commit messages, while a Blob holds author email addresses",
            "A Tree only exists on remote servers such as GitHub or GitLab"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-033",
          type: "MCQ",
          prompt: "What algorithm does 'git bisect' employ to identify the commit that introduced a regression across 1,000 commits?",
          options: [
            "Binary search across the commit graph, finding the offending commit in approximately 10 steps (log2 1000)",
            "Linear regression testing from oldest commit to newest commit sequentially",
            "Random sampling of commits until a test failure occurs",
            "Breadth-first search traversing every branch simultaneously"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-034",
          type: "MCQ",
          prompt: "What is the difference between 'git merge' and 'git rebase' when integrating a feature branch into main?",
          options: [
            "Merge creates a new merge commit preserving exact historical commit timestamps and branch geometry; Rebase replays feature commits on top of main, creating a linear history",
            "Rebase deletes the commit history, while merge keeps it",
            "Merge requires cloud connectivity, while rebase works offline",
            "Rebase changes the author of all commits to the person running the command"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-035",
          type: "MCQ",
          prompt: "In Git, what does 'HEAD' fundamentally point to under standard working conditions?",
          options: [
            "A reference pointer to the currently checked-out branch (e.g., refs/heads/main)",
            "The initial root commit created when the repository was initialized",
            "The remote GitHub master repository URL",
            "The last stashed patch in the repository"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-036",
          type: "MCQ",
          prompt: "What is a 'detached HEAD' state in Git?",
          options: [
            "HEAD points directly to a specific commit SHA rather than to a named branch reference",
            "The local Git repository has lost network connectivity to the remote server",
            "The .git directory has been deleted from the filesystem",
            "A commit was created without specifying an author email"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-037",
          type: "MCQ",
          prompt: "Which command allows you to view the historical log of where HEAD and branch references have pointed over time, even for commits deleted by rebase?",
          options: ["git reflog", "git log --all --deleted", "git status --history", "git fsck --lost-found"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-038",
          type: "MCQ",
          prompt: "What does 'git cherry-pick <commit-sha>' execute?",
          options: [
            "It applies the changes introduced by a specific commit from another branch onto the currently active branch as a new commit",
            "It deletes a commit from remote history permanently",
            "It creates an annotated tag with the commit's description",
            "It reverts all files changed in that commit back to empty files"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-039",
          type: "MCQ",
          prompt: "What is stored in the Git 'Index' (also called Staging Area)?",
          options: [
            "A binary cache describing the exact tree structure and SHA references prepared to be recorded into the next commit",
            "A list of all users who have write access to the repository",
            "Full copies of all historical versions of every file in the project",
            "A list of ignored file glob patterns from .gitignore"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-040",
          type: "MCQ",
          prompt: "What happens when you run 'git clean -fd'?",
          options: [
            "It forcefully removes untracked files and directories from the working directory",
            "It reformats all Markdown files according to Prettier standards",
            "It compacts the .git database and deletes old reflogs",
            "It purges all closed branches from the remote origin"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-005",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-005",
      title: "Git Branching Strategies, Trunk-Based Development & SemVer Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-041",
          type: "MCQ",
          prompt: "What is the hallmark architectural principle of Trunk-Based Development (TBD)?",
          options: [
            "Developers merge small, frequent commits directly into a single shared branch ('trunk' or 'main') with branches lasting fewer than 24 hours, often using feature flags",
            "Developers maintain isolated feature branches for 3-6 months until full QA verification is completed",
            "Every developer creates their own permanent private branch that is never merged",
            "Code is only merged into main via quarterly scheduled release ceremonies"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-042",
          type: "MCQ",
          prompt: "According to Semantic Versioning (SemVer 2.0.0), when MUST the MAJOR version number be incremented?",
          options: [
            "When you introduce incompatible API changes or breaking behavioral modifications",
            "When you add backwards-compatible new functionality",
            "When you implement backwards-compatible bug fixes",
            "Every 12 calendar months regardless of codebase changes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-043",
          type: "MCQ",
          prompt: "In Conventional Commits specification, which commit prefix triggers an automated MINOR release bump?",
          options: ["feat:", "fix:", "chore:", "docs:"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-044",
          type: "MCQ",
          prompt: "In Conventional Commits, how do you explicitly denote a breaking change in the commit title?",
          options: [
            "By adding an exclamation mark before the colon (e.g., 'feat(auth)!: replace session cookie with JWT')",
            "By typing the message in ALL CAPS",
            "By tagging @all in the commit description",
            "By appending the tag [CRITICAL] at the end"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-045",
          type: "MCQ",
          prompt: "How do Feature Flags (Toggles) enable Trunk-Based Development in production environments?",
          options: [
            "They allow incomplete or unreleased features to be merged safely into main and deployed to production while hiding them from users behind runtime configuration",
            "They bypass CI unit tests to speed up deployment builds",
            "They automatically rebrand the application UI for different countries",
            "They prevent git merge conflicts by locking files across developers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-046",
          type: "MCQ",
          prompt: "Why has the classic 'GitFlow' model fallen out of favor with high-velocity DevOps and Continuous Deployment teams?",
          options: [
            "Long-lived develop, release, and feature branches lead to painful merge conflicts ('merge hell') and impede continuous automated deployment to production",
            "GitFlow is incompatible with Linux operating systems",
            "GitFlow cannot support more than 5 developers on a team",
            "GitFlow requires expensive proprietary licenses"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-047",
          type: "MCQ",
          prompt: "What is the role of a release candidate version tag like 'v3.2.0-rc.1'?",
          options: [
            "It designates a pre-release build undergoing final user acceptance, soak, or staging testing prior to final production release",
            "It represents an abandoned build that failed security audits",
            "It indicates an emergency hotfix applied directly to production without testing",
            "It is a temporary branch name automatically purged by GitHub"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-048",
          type: "MCQ",
          prompt: "Which DORA (DevOps Research and Assessment) metric measures how long it takes a commit to transition from code review approval to running in production?",
          options: ["Lead Time for Changes", "Deployment Frequency", "Change Failure Rate", "Failed Deployment Recovery Time (MTTR)"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-049",
          type: "MCQ",
          prompt: "What does 'git merge --squash feature-branch' execute?",
          options: [
            "It combines all commits from the feature branch into a single staged change on the current branch, producing a single clean commit when finalized",
            "It compresses all image assets in the feature branch using lossless gzip",
            "It deletes all commit messages and replaces them with random strings",
            "It forces the branch to revert all its changes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-050",
          type: "MCQ",
          prompt: "Which tool can automate version bumping and changelog generation based entirely on Conventional Commits in CI/CD?",
          options: ["Semantic Release", "Ansible", "Kubectl", "Terraform"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-006",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-006",
      title: "Modern CI/CD Architecture & Pipeline Economics Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-051",
          type: "MCQ",
          prompt: "What distinguishes Continuous Deployment from Continuous Delivery?",
          options: [
            "In Continuous Deployment, every change that passes automated tests is automatically deployed straight to production; Continuous Delivery keeps code releasable but requires a manual approval trigger",
            "Continuous Deployment applies only to mobile apps, while Continuous Delivery is for web backends",
            "Continuous Delivery uses Docker, whereas Continuous Deployment uses virtual machines",
            "There is no difference; the terms are synonymous"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-052",
          type: "MCQ",
          prompt: "What is meant by the DevSecOps term 'Shift-Left'?",
          options: [
            "Moving security, compliance, and quality testing earlier into the software development lifecycle (during code review and CI builds) rather than at post-deployment",
            "Moving the development team's office desks to the left wing of the building",
            "Prioritizing frontend styling over backend architecture",
            "Shifting infrastructure hosting from AWS to on-premise data centers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-053",
          type: "MCQ",
          prompt: "Which tool category does 'SonarQube' belong to within a modern CI/CD pipeline?",
          options: [
            "Static Application Security Testing (SAST) and Code Quality Analysis",
            "Dynamic Application Security Testing (DAST)",
            "Container Orchestration Engine",
            "Database Migration Runner"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-054",
          type: "MCQ",
          prompt: "What is an SBOM (Software Bill of Materials) and why is it critical in modern CI/CD security?",
          options: [
            "A comprehensive inventory of all software components, third-party libraries, and dependencies used in a build, enabling rapid vulnerability tracking (e.g., Log4Shell)",
            "A receipt detailing the cloud compute cost of running the pipeline",
            "A list of employee hours billed to a specific client project",
            "A backup copy of source code stored on offline tape storage"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-055",
          type: "MCQ",
          prompt: "How does test parallelization (sharding) improve pipeline economics and developer velocity?",
          options: [
            "By dividing large test suites across concurrent worker nodes, reducing feedback latency from hours to minutes while preventing runner timeout costs",
            "By deleting failing tests automatically so the build passes faster",
            "By only running tests on days when the weather is clear",
            "By executing tests on the user's laptop instead of cloud runners"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-056",
          type: "MCQ",
          prompt: "What is a 'Quality Gate' failure in an enterprise deployment pipeline?",
          options: [
            "A programmatic halt that terminates the pipeline because code failed predefined thresholds (e.g., code coverage dropped below 80% or high-severity CVE detected)",
            "A hardware network cable unplugged in the server rack",
            "A rejected expense report submitted by a developer",
            "An error thrown when a user submits an incorrect password"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-057",
          type: "MCQ",
          prompt: "Which tool is specifically designed to scan Git repositories for accidentally committed credentials, private keys, and API tokens?",
          options: ["Gitleaks", "Prometheus", "Kubectl", "Varnish"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-058",
          type: "MCQ",
          prompt: "Why should build artifacts (such as Docker images or compiled binaries) be built once in CI and promoted across environments rather than rebuilt per environment?",
          options: [
            "To guarantee byte-for-byte immutability and ensure that what was tested in QA is identical to what runs in Production",
            "Because cloud providers charge double for compiling code twice",
            "Because Docker images expire after 24 hours if not deployed",
            "To avoid exceeding GitHub storage quota limits"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-059",
          type: "MCQ",
          prompt: "In CI pipeline caching, what is the primary purpose of caching package manager directories (e.g., ~/.npm, ~/.m2, ~/.cache/pip)?",
          options: [
            "To avoid re-downloading unchanged third-party packages from public registries across every build, dramatically reducing pipeline run time",
            "To store user passwords permanently in the cloud",
            "To bypass package security scanning checks",
            "To allow offline compilation without an internet connection"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-060",
          type: "MCQ",
          prompt: "What strategy allows organizations to run self-hosted CI runners economically while maintaining security isolation?",
          options: [
            "Using Kubernetes-based ephemeral runner autoscalers (e.g., ARC) running on Spot/Preemptible instances that discard the runner pod after each job",
            "Sharing a single bare-metal server root account across all developers",
            "Disabling all firewall rules on runner machines",
            "Keeping 100 dedicated bare-metal servers running 24/7 at full capacity"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-007",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-007",
      title: "GitHub Actions Enterprise Pipelines & OIDC Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-061",
          type: "MCQ",
          prompt: "Why is OpenID Connect (OIDC) preferred over static AWS Access Keys in GitHub Actions workflows?",
          options: [
            "It eliminates long-lived secret storage by exchanging short-lived, cryptographically signed JSON Web Tokens (JWT) for temporary cloud credentials (STS AssumeRole)",
            "It provides free unlimited cloud storage on AWS S3",
            "It runs builds faster by skipping compilation steps",
            "It encrypts Git commit messages using public key cryptography"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-062",
          type: "MCQ",
          prompt: "Which top-level permission directive MUST be explicitly declared in a GitHub Actions workflow to enable OIDC token generation?",
          options: ["permissions: id-token: write", "permissions: admin: true", "permissions: oidc: enable", "permissions: security: root"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-063",
          type: "MCQ",
          prompt: "How does a GitHub Actions 'Matrix Build' optimize testing across multiple runtime environments?",
          options: [
            "It automatically spawns parallel jobs across combinations of operating systems, language versions, and architectures defined in the matrix",
            "It converts all unit tests into 3D visualizations",
            "It connects the pipeline to the matrix chat protocol",
            "It runs the build inside a VR headset"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-064",
          type: "MCQ",
          prompt: "What is the key difference between a GitHub Composite Action and a Reusable Workflow?",
          options: [
            "A Composite Action bundles multiple shell steps into a single reusable action step; A Reusable Workflow invokes an entire multi-job workflow file across repositories",
            "A Composite Action can only be written in Python",
            "A Reusable Workflow cannot accept input parameters",
            "Composite Actions only execute on Windows runners"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-065",
          type: "MCQ",
          prompt: "What does the 'needs' keyword in a GitHub Actions workflow job specification define?",
          options: [
            "Job dependency ordering, ensuring a job does not execute until the specified prerequisite jobs have successfully completed",
            "Hardware CPU and RAM requirements for the runner",
            "Required npm package dependencies to install",
            "Emergency contact information for failed builds"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-066",
          type: "MCQ",
          prompt: "How can you prevent concurrent deployments of the same branch from overwriting each other in GitHub Actions?",
          options: [
            "Using the 'concurrency' group key with 'cancel-in-progress: true'",
            "Setting 'max-parallel: 1' inside the matrix strategy",
            "Pausing all other repositories in the organization",
            "Adding a 10-minute sleep timer to the start of the job"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-067",
          type: "MCQ",
          prompt: "In GitHub Actions expressions, what is the purpose of the 'hashFiles()' function?",
          options: [
            "It generates a SHA-256 hash of matching files (such as 'package-lock.json') to use as a dynamic cache key",
            "It encrypts sensitive files before committing them to the repository",
            "It verifies that files do not contain malware",
            "It calculates file sizes for bandwidth billing"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-068",
          type: "MCQ",
          prompt: "What security best practice should be applied when referencing third-party GitHub Actions (e.g., actions/checkout)?",
          options: [
            "Pin the action to a full immutable commit SHA (e.g., actions/checkout@b4ffde46f3...) rather than a mutable major version tag to prevent supply chain tampering",
            "Always reference the '@latest' branch tag",
            "Copy the action source code directly into your application repository",
            "Disable all security checks when running third-party actions"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-069",
          type: "MCQ",
          prompt: "Where can environment-specific secrets (such as production database credentials) be protected with manual approval gates in GitHub Actions?",
          options: [
            "In GitHub Repository Environments, which support required reviewers, wait timers, and deployment branch restrictions",
            "In public repository README files",
            "Inside hardcoded comments in the workflow YAML",
            "In local .env files uploaded to GitHub releases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-070",
          type: "MCQ",
          prompt: "What is the function of the 'continue-on-error: true' directive on a workflow step?",
          options: [
            "It allows the workflow job to proceed to subsequent steps even if this specific step exits with a non-zero exit code",
            "It suppresses all logs generated by the step",
            "It re-runs the step up to 10 times automatically",
            "It skips unit tests if code coverage is high"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

