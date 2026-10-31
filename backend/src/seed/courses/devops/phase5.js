// Course 8: DevOps Engineering Masterclass - Phase 5: Observability, SRE, Chaos Engineering & Capstone
// Chapters 28 to 33 | Assessments 28 to 33 | 60 MCQs

export const phase5 = {
  chapters: [
    {
      id: "CH-DVO-028",
      courseId: "CRS-DVO-001",
      sequence: 28,
      title: "Observability Fundamentals: Metrics, Logs, Traces & OpenTelemetry",
      description: "Master the Three Pillars of Observability, distributed telemetry pipelines, pull vs push ingestion, and vendor-neutral OpenTelemetry (OTel).",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Observability Fundamentals: Metrics, Logs, Traces & OpenTelemetry

Monitoring tells you *when* a system is broken; **Observability** allows you to infer the internal states of complex distributed systems based on external telemetry outputs—telling you *why* an unprecedented failure occurred.

---

## 1. The Three Pillars of Observability

\`\`\`
+--------------------------------------------------------------------------+
| 1. METRICS (Aggregatable Numbers)                                        |
| - Highly compressible numeric time-series (Counters, Gauges, Histograms) |
| - Answers: "Is latency spiking? What is the current CPU utilization?"   |
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 2. LOGS (Event Context & Text Records)                                   |
| - Timestamped structured JSON records with rich contextual metadata      |
| - Answers: "What exact error message or stack trace did User 104 throw?"|
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 3. TRACES (Distributed Request Journey)                                  |
| - Spans mapping the end-to-end execution path across 20+ microservices   |
| - Answers: "Which specific downstream database query added 4.2s latency?"|
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. The OpenTelemetry (OTel) Standard Architecture

OpenTelemetry is the CNCF standard providing unified, vendor-agnostic APIs, SDKs, and data collectors. Organizations avoid vendor lock-in with Datadog or New Relic by instrumenting code once with OTel:

\`\`\`
+-----------------------+     +-----------------------+
| Microservice A (Go)   |     | Microservice B (Node) |
| OTel SDK              |     | OTel SDK              |
+-----------------------+     +-----------------------+
            \\                             /
             \\   OTLP Protocol (gRPC/HTTP)
              v                         v
+-----------------------------------------------------+
| OpenTelemetry Collector (DaemonSet / Gateway)       |
| - Receivers:    otlp, prometheus, jaeger            |
| - Processors:   batch, memory_limiter, redact_pii   |
| - Exporters:    prometheus, loki, tempo, datadog    |
+-----------------------------------------------------+
        /                 |                 \\
       v                  v                  v
[ Prometheus (Metrics) ] [ Loki (Logs) ] [ Tempo (Traces) ]
\`\`\`

---

## 3. Telemetry Pipeline Configuration (\`otel-collector-config.yaml\`)

\`\`\`yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_percentage: 75
    spike_limit_percentage: 20

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  otlp/tempo:
    endpoint: "tempo:4317"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/r8UvWSX3KA8" title="OpenTelemetry Explained in 15 Minutes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-029",
      courseId: "CRS-DVO-001",
      sequence: 29,
      title: "Prometheus Monitoring Architecture & PromQL Mastery",
      description: "Master Prometheus time-series architecture, scrape discovery, metric types, PromQL operators, vector math, histograms, and recording rules.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Prometheus Monitoring Architecture & PromQL Mastery

CNCF **Prometheus** is the standard time-series database and alerting system for Kubernetes. High-performance site reliability engineering requires writing expressive PromQL queries to detect regressions before customers notice them.

---

## 1. Prometheus Metric Types Taxonomy

1. **Counter:** Monotonically increasing cumulative metric that only increases or resets to zero upon restart (e.g., \`http_requests_total\`). Always analyzed with \`rate()\` or \`increase()\`.
2. **Gauge:** Value that arbitrarily fluctuates up and down (e.g., \`node_memory_utilization_bytes\`, \`active_connections_count\`).
3. **Histogram:** Samples observations (usually request durations or response sizes) and buckets them into configurable bins (\`le\` label), tracking \`_bucket\`, \`_sum\`, and \`_count\`.
4. **Summary:** Computes configurable client-side quantiles ($p50, p90, p99$) directly in application memory.

---

## 2. PromQL Query Engineering

### Calculating Per-Second Request Rate:
\`\`\`promql
# 5-minute per-second rate of HTTP requests per service
rate(http_requests_total{status=~"2.."}[5m])
\`\`\`

### Calculating 99th Percentile Latency ($p99$):
\`\`\`promql
# Compute 99th percentile response latency across all backend pods
histogram_quantile(
  0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
)
\`\`\`

### Calculating Error Rate Percentage:
\`\`\`promql
# Calculate percentage of HTTP 5xx server errors over 5 minutes
(
  sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
  sum(rate(http_requests_total[5m]))
) * 100
\`\`\`

---

## 3. High-Performance Recording Rules

Evaluating complex PromQL queries across millions of samples slows down Grafana dashboards. **Recording Rules** precompute expensive vector calculations on a periodic schedule:

\`\`\`yaml
groups:
  - name: api_latency_rules
    rules:
      - record: job:http_request_duration_seconds:p99
        expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, job))
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/h4Sl21AKiDg" title="PromQL Tutorial - Prometheus Query Language" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-030",
      courseId: "CRS-DVO-001",
      sequence: 30,
      title: "Alertmanager Routing, Grafana Dashboards & Incident Alerting",
      description: "Implement alert routing with Prometheus Alertmanager: grouping, silencing, inhibition, Grafana executive dashboards, and PagerDuty/Slack escalation.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Alertmanager Routing, Grafana Dashboards & Incident Alerting

Alerting on every temporary blip causes alert fatigue, training on-call engineers to ignore alarms. Resilient systems pair actionable, symptom-based alerting via Alertmanager with executive dashboards in Grafana.

---

## 1. Alertmanager Architecture: Grouping, Inhibition & Silencing

\`\`\`
+-----------------------+
| Prometheus Alert Rule | ---> Fires Alert JSON
+-----------------------+
            |
            v
+-----------------------------------------------------+
| Prometheus Alertmanager                             |
| - Grouping:   Aggregates 50 pod alerts into 1 notification |
| - Inhibition: Suppresses warning alerts if parent datacenter |
|               is down (Inhibit pod alerts when node is down) |
| - Silencing:  Mutes alerts during planned maintenance windows|
+-----------------------------------------------------+
            |
    Routes dynamically via Labels
            |
            +------------> [ PagerDuty (Critical / Page On-Call) ]
            +------------> [ Slack #ops-channel (Warning / Info) ]
            +------------> [ Jira / ServiceNow (Low / Ticket) ]
\`\`\`

---

## 2. Production Prometheus Alert Rule Definition

\`\`\`yaml
groups:
  - name: production_sla_alerts
    rules:
      - alert: HighHttpErrorRate
        expr: (sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100 > 1.0
        for: 3m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "API Error rate exceeds 1% on {{ \$labels.service }}"
          description: "Service {{ \$labels.service }} has error rate of {{ \$value }}% over the last 3 minutes."
          runbook_url: "https://wiki.corp.internal/runbooks/high-error-rate"
\`\`\`

---

## 3. Executive Dashboard Engineering in Grafana

- **Use Variables (Templating):** Parameterize dashboards by cluster, namespace, and service name (\`$namespace\`, \`$service\`).
- **Standardize on the RED / USE Method:**
  - **RED Method (Services):** **R**ate (requests/sec), **E**rrors (failures/sec), **D**uration (latency distribution).
  - **USE Method (Infrastructure):** **U**tilization (% busy), **S**aturation (queued work), **E**rrors (hardware/packet drops).

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/C04Y2Xk8f_w" title="Grafana Dashboards & Alertmanager Setup" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-031",
      courseId: "CRS-DVO-001",
      sequence: 31,
      title: "Centralized Logging with Grafana Loki, Promtail & LogQL",
      description: "Deploy high-efficiency log aggregation: Loki chunk storage, Promtail/Fluentbit log scrapers, LogQL query language, and trace-to-log correlation with Tempo.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Centralized Logging with Grafana Loki, Promtail & LogQL

Traditional Elasticsearch / OpenSearch clusters consume massive CPU and RAM because they build inverted indexes across every single word in every log line. **Grafana Loki** takes the Prometheus approach: it only indexes log stream metadata labels, storing the raw compressed log streams in cheap object storage (S3/GCS).

---

## 1. Loki vs. Elasticsearch Architecture

| Attribute | Grafana Loki | Elasticsearch / OpenSearch |
|---|---|---|
| **Indexing Strategy** | Indexes metadata labels only (app, env, pod) | Inverted index on full-text words |
| **Storage Backend** | Cost-effective object storage (S3 / GCS) | Expensive NVMe block storage |
| **Memory Footprint** | Extremely low ($1/10\\text{th}$ of ELK) | High (requires large JVM heaps) |
| **Grafana Integration** | Native; identical UX to Prometheus | Requires dedicated plugin |
| **Trace Correlation** | Automatic via derived fields (TraceID) | Manual JSON lookup |

---

## 2. LogQL Query Engineering

LogQL queries consist of a **Stream Selector** followed by optional **Filter Expressions** and **Metric Converters**:

\`\`\`logql
# Stream Selector: Find all logs from order-service in production
{namespace="production", app="order-service"}

# Line Filter: Filter lines containing error or fatal (case-insensitive)
{namespace="production", app="order-service"} |= "(?i)error" != "timeout"

# JSON Parser: Extract json fields and filter on numeric status
{namespace="production", app="order-service"}
  | json
  | status >= 500
  | line_format "{{.timestamp}} - {{.method}} {{.path}} returned {{.status}}: {{.error_msg}}"
\`\`\`

### Converting Logs into Metrics in Real Time:
\`\`\`logql
# Calculate error rate per second derived directly from raw logs
sum(rate({namespace="production"} |= "panic" [5m])) by (app)
\`\`\`

---

## 3. Correlation: Trace-to-Log Jumping

By extracting the \`trace_id\` field from JSON logs in Grafana, engineers click directly on an error log to jump into the exact distributed trace in Grafana Tempo, viewing the entire microservice call timeline in a single click.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/M9mflP5iK6U" title="Grafana Loki & LogQL Complete Guide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-032",
      courseId: "CRS-DVO-001",
      sequence: 32,
      title: "Site Reliability Engineering (SRE), SLIs, SLOs & Chaos Engineering",
      description: "Implement Google SRE practices: Service Level Indicators, SLOs, Error Budgets, burn rates, blameless postmortems, and Chaos Engineering with Chaos Mesh.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Site Reliability Engineering (SRE), SLIs, SLOs & Chaos Engineering

Site Reliability Engineering (SRE) is what happens when you ask a software engineer to design an operations team. It balances product feature velocity against infrastructure stability using mathematical **Error Budgets**.

---

## 1. The SRE Reliability Hierarchy: SLI, SLO, and SLA

\`\`\`
+--------------------------------------------------------------------------+
| SERVICE LEVEL INDICATOR (SLI)                                            |
| Quantitative measurement of service behavior:                            |
| SLI = (Successful Requests with Latency < 200ms) / (Total Valid Requests)|
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| SERVICE LEVEL OBJECTIVE (SLO)                                            |
| Target reliability percentage agreed upon by Engineering and Product:    |
| Example: "99.9% of requests must meet the SLI over a rolling 30-day window"|
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| ERROR BUDGET & SERVICE LEVEL AGREEMENT (SLA)                             |
| Allowed unreliability = 100% - SLO (99.9% SLO = 0.1% Error Budget)       |
| SLA: Legal contract with customers with financial penalties for breach   |
+--------------------------------------------------------------------------+
\`\`\`

### The Error Budget Policy:
- If Error Budget remains positive ($> 0\\%$): Product engineering can release new risky features rapidly.
- If Error Budget is exhausted ($= 0\\%$): All feature releases are frozen; 100% of engineering bandwidth pivots to reliability, bug fixes, and infrastructure hardening.

---

## 2. Multi-Window Multi-Burn-Rate Alerting

Legacy alerts trigger on momentary blips. Google SRE best practice alerts on **Error Budget Burn Rates**:

| Burn Rate | % of 30-Day Budget Burned | Time to Complete Exhaustion | Alert Severity | Paging Notification |
|---|---|---|---|---|
| **14.4x** | $2\\%$ in 1 hour | 2 days | **Critical** | Page On-Call immediately |
| **6x** | $5\\%$ in 6 hours | 5 days | **High** | Page On-Call |
| **1x** | $100\\%$ in 30 days | 30 days | **Low** | Create Jira ticket during business hours |

---

## 3. Chaos Engineering: Injecting Failure to Build Resilience

Resilience cannot be proven by theory; systems must be tested through intentional, controlled failure injection in staging and production using **Chaos Mesh** or **LitmusChaos**:

\`\`\`yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: simulate-partition
  namespace: payments
spec:
  action: partition
  mode: fixed
  value: "1"
  selector:
    namespaces: [payments]
    labelSelectors:
      app: payment-service
  direction: to
  target:
    selector:
      namespaces: [payments]
      labelSelectors:
        app: database-primary
  duration: "5m"
\`\`\`

---

## 4. The Blameless Postmortem Culture

When production outages occur, high-performing organizations conduct **Blameless Postmortems**:
- Assume every engineer acted in good faith with the information available.
- Focus on systemic failure modes (missing guardrails, unhandled timeouts, insufficient automated tests) rather than human error.
- Action items must have strict assignees and target completion dates.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/tEylfyXvdP8" title="Google SRE: Implementing SLIs and SLOs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-033",
      courseId: "CRS-DVO-001",
      sequence: 33,
      title: "Enterprise DevOps Capstone & Platform Engineering Technical Interviews",
      description: "Capstone project: Architect the end-to-end 'NovaPay Global' multi-region GitOps, Kubernetes, IaC, and SRE platform; platform engineering interview system design.",
      contentType: "Rich Text",
      durationMinutes: 90,
      minimumTimeMinutes: 60,
      body: `
# Enterprise DevOps Capstone & Platform Engineering Interviews

This final capstone synthesizes every foundational, operational, and architectural skill mastered across this course into an enterprise-grade platform architecture.

---

## 1. The Capstone Challenge: "NovaPay Global" Platform

You are the Principal Platform Engineer at **NovaPay Global**, an international payment processing platform handling 50,000 transactions per second across North America and Europe. You must design and present the complete platform architecture.

\`\`\`
+---------------------------------------------------------------------------------------------+
| GLOBAL EDGE & TRAFFIC ROUTING                                                               |
| AWS Route 53 (Latency-based DNS) + CloudFront + AWS WAF (DDoS & OWASP Top 10)              |
+---------------------------------------------------------------------------------------------+
                                       |
                 +---------------------+---------------------+
                 | (Active-Active Multi-Region)              |
                 v                                           v
+------------------------------------+      +------------------------------------+
| REGION 1: us-east-1                |      | REGION 2: eu-central-1             |
| Multi-AZ VPC (10.100.0.0/16)       |      | Multi-AZ VPC (10.200.0.0/16)       |
| EKS Cluster + Karpenter (Spot/OnD) |      | EKS Cluster + Karpenter (Spot/OnD) |
| Cilium CNI (eBPF mesh)             |      | Cilium CNI (eBPF mesh)             |
| Istio Service Mesh (mTLS + Canary) |      | Istio Service Mesh (mTLS + Canary) |
| External Secrets Operator (Vault)  |      | External Secrets Operator (Vault)  |
| Aurora Global PostgreSQL (Primary) | <--> | Aurora Global Read Replica / FastFO|
+------------------------------------+      +------------------------------------+
                 ^                                           ^
                 |                                           |
+---------------------------------------------------------------------------------------------+
| CONTINUOUS DELIVERY & GITOPS CONTROL PLANE                                                  |
| GitHub Enterprise (Trunk-Based) ---> GitHub Actions (OIDC, Trivy, SBOM, Matrix tests)       |
|                             ---> ArgoCD ApplicationSets (Declarative Pull Synchronization)  |
+---------------------------------------------------------------------------------------------+
                                       |
+---------------------------------------------------------------------------------------------+
| FULL-STACK OBSERVABILITY & RELIABILITY FABRIC                                               |
| OpenTelemetry Collectors ---> Prometheus + Alertmanager (Multi-Window Burn-Rate Alerts)      |
|                          ---> Grafana Loki (LogQL) + Grafana Tempo (Distributed Tracing)     |
|                          ---> Grafana Unified Dashboards + Chaos Mesh Scheduled Experiments  |
+---------------------------------------------------------------------------------------------+
\`\`\`

---

## 2. Platform Engineering Technical Interview Framework

In Senior, Staff, and Principal DevOps interviews, candidates are evaluated on:

### 1. Requirements Clarification & Scope:
- Traffic volume (RPS/TPS), latency SLAs ($p99 < 50\\text{ms}$), compliance mandates (PCI-DSS, SOC2, GDPR).
- Disaster recovery objectives: **RTO** (Recovery Time Objective < 15 min) and **RPO** (Recovery Point Objective = 0).

### 2. Edge-to-Data-Store Architecture:
- Step methodically from DNS to CDN, ingress load balancers, Kubernetes CNI routing, service mesh proxies, compute nodes, and stateful databases.

### 3. Failure Mode Analysis & Edge Cases:
- *"What happens if the primary AWS region suffers an availability zone outage?"* (Karpenter rebalances, Route 53 healthchecks reroute, Aurora multi-AZ automatic failover).
- *"How do you prevent a bad deployment from reaching production?"* (Shift-left security, ArgoCD canary rollout with automated Prometheus metrics analysis, instant automated rollback).

### 4. Operational Excellence:
- SRE metrics (SLIs/SLOs), automated runbooks, error budget enforcement, and blameless retrospective processes.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/SZX3q4W7pms" title="DevOps Platform Engineer System Design Interview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-DVO-028",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-028",
      title: "Observability Fundamentals & OpenTelemetry Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-271",
          type: "MCQ",
          prompt: "What is the primary difference between traditional monitoring and modern observability?",
          options: [
            "Monitoring alerts you when a known failure threshold is exceeded; Observability allows you to query and deduce why an unprecedented, complex failure occurred based on external system outputs",
            "Monitoring uses computers; Observability uses pen and paper",
            "Observability is only for frontend applications",
            "There is no difference; they are exact marketing synonyms"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-272",
          type: "MCQ",
          prompt: "What are the Three Pillars of Observability in distributed systems engineering?",
          options: ["Metrics, Logs, and Traces", "CPU, RAM, and Disk", "Docker, Kubernetes, and Helm", "Frontend, Backend, and Database"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-273",
          type: "MCQ",
          prompt: "What is the primary architectural value of OpenTelemetry (OTel)?",
          options: [
            "It provides a single vendor-neutral standard for APIs, SDKs, and data collectors, eliminating vendor lock-in when transmitting telemetry to backend stores",
            "It automatically fixes bugs in application code",
            "It hosts open-source git repositories for free",
            "It replaces the Linux operating system kernel"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-274",
          type: "MCQ",
          prompt: "What are the three core pipeline components defined in an OpenTelemetry Collector configuration?",
          options: ["Receivers, Processors, and Exporters", "Inputs, Compilers, and Outputs", "Sources, Streams, and Sinks", "Scrapers, Databases, and Dashboards"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-275",
          type: "MCQ",
          prompt: "What is a 'Span' in distributed tracing terminology?",
          options: [
            "The fundamental unit of work representing a single operation (e.g., an HTTP request or DB query) with start time, duration, and contextual tags",
            "The physical distance between two datacenters in kilometers",
            "The total number of servers running in an AWS region",
            "The lifespan of a hard drive before failure"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-276",
          type: "MCQ",
          prompt: "What is OTLP in the OpenTelemetry ecosystem?",
          options: [
            "OpenTelemetry Protocol: the standardized high-performance telemetry transport protocol operating over gRPC or HTTP/protobuf",
            "Open Transport Layer Proxy",
            "Online Transaction Log Parser",
            "Open Threat Limitation Policy"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-277",
          type: "MCQ",
          prompt: "Why is context propagation (propagating trace IDs across HTTP/gRPC headers) essential for distributed tracing?",
          options: [
            "Without context propagation, separate microservice spans cannot be stitched together into a coherent end-to-end transaction journey",
            "To prevent network routers from discarding packets",
            "To encrypt the data payload with AES",
            "To bypass corporate firewall rules"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-278",
          type: "MCQ",
          prompt: "What does the 'memory_limiter' processor achieve inside an OpenTelemetry Collector?",
          options: [
            "It monitors collector memory usage, dropping data or applying backpressure if memory exceeds limits to prevent collector OOM crashes",
            "It throttles container RAM on the host",
            "It allocates more RAM to the database",
            "It clears browser cache memory"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-279",
          type: "MCQ",
          prompt: "What is the key advantage of 'Trace Sampling' (e.g., Head-based or Tail-based sampling) in high-throughput systems?",
          options: [
            "It reduces telemetry storage costs and network bandwidth by storing only a representative percentage of traces while retaining 100% of error traces",
            "It makes web applications load twice as fast",
            "It turns off database queries during peak traffic",
            "It randomly restarts slow microservices"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-280",
          type: "MCQ",
          prompt: "What W3C standard defines the canonical HTTP header format for distributed trace context propagation?",
          options: ["W3C Trace Context (traceparent)", "W3C HTML5 Specification", "W3C CORS Header", "W3C WebSocket Frame"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-029",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-029",
      title: "Prometheus Monitoring & PromQL Mastery Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-281",
          type: "MCQ",
          prompt: "What is the defining characteristic of a Prometheus 'Counter' metric?",
          options: [
            "It is a monotonically increasing cumulative metric that can only increase or reset to zero upon process restart",
            "It arbitrarily fluctuates up and down like CPU temperature",
            "It stores customer credit card numbers",
            "It expires after exactly 60 seconds"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-282",
          type: "MCQ",
          prompt: "Why should you always apply 'rate()' or 'irate()' before aggregating Counter metrics with 'sum()' in PromQL?",
          options: [
            "Summing raw counters first obscures counter resets (process restarts), leading to massive artificial negative or positive spikes in calculations",
            "Because Prometheus throws a syntax error if sum is used first",
            "Because rate converts metrics into logarithmic scales",
            "There is no difference; the order of operations does not matter"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-283",
          type: "MCQ",
          prompt: "What PromQL function calculates the 95th percentile request latency from a Prometheus Histogram?",
          options: [
            "histogram_quantile(0.95, sum(rate(http_duration_bucket[5m])) by (le))",
            "quantile(0.95, http_duration_seconds)",
            "percentile(95, http_duration_seconds)",
            "p95(rate(http_duration[5m]))"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-284",
          type: "MCQ",
          prompt: "What is the difference between 'rate()' and 'irate()' in PromQL?",
          options: [
            "'rate()' calculates the average per-second rate of increase across the entire range window; 'irate()' calculates the instantaneous rate based solely on the last two data points",
            "'rate()' works on Gauges; 'irate()' works on Counters",
            "'irate()' only works on Intel CPUs",
            "'rate()' runs on Prometheus; 'irate()' runs on Grafana"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-285",
          type: "MCQ",
          prompt: "What is 'Prometheus Metric Cardinality' and why can high cardinality crash a Prometheus server?",
          options: [
            "The total number of unique time-series generated by label combinations; unbounded labels (like UserIDs or URLs) create millions of active series, consuming all server RAM",
            "The network latency between Prometheus and worker nodes",
            "The number of hard drives attached to the server",
            "The number of CPU cores allocated to the query engine"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-286",
          type: "MCQ",
          prompt: "What is the primary role of Prometheus Recording Rules?",
          options: [
            "Precomputing frequently needed or computationally expensive expressions on a schedule and saving the result as a new time-series for fast dashboard loading",
            "Recording developer audio during meetings",
            "Capturing video recordings of user browser sessions",
            "Logging all shell commands typed by administrators"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-287",
          type: "MCQ",
          prompt: "How does Prometheus discover which target pods or nodes to scrape metrics from in a dynamic Kubernetes cluster?",
          options: [
            "Through Kubernetes Service Discovery (SD), watching the Kubernetes API Server for changes to Pods, Services, and Endpoints",
            "Through a hardcoded static list of IP addresses in a CSV file",
            "By scanning every IP address on the internet sequentially",
            "By waiting for pods to send an email notification"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-288",
          type: "MCQ",
          prompt: "What metric type would you select to measure current memory utilization in megabytes on a node?",
          options: ["Gauge", "Counter", "Histogram", "Summary"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-289",
          type: "MCQ",
          prompt: "In a Prometheus Histogram metric, what does the special label 'le' represent?",
          options: [
            "'Less than or Equal to' boundary for each observation bucket",
            "'Latency Estimator'",
            "'Log Entry'",
            "'Linear Equation'"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-290",
          type: "MCQ",
          prompt: "What data ingestion architecture does Prometheus use natively?",
          options: [
            "Pull model (Prometheus periodically scrapes metrics by initiating HTTP GET requests to target /metrics endpoints)",
            "Push model (Targets send UDP packets directly into Prometheus)",
            "Message queue model (All metrics travel over Apache Kafka)",
            "File polling model (Prometheus reads local text files via NFS)"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-030",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-030",
      title: "Alertmanager Routing & Grafana Dashboards Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-291",
          type: "MCQ",
          prompt: "What is the primary role of Alertmanager 'Grouping' in an enterprise infrastructure outage?",
          options: [
            "Aggregating dozens or hundreds of related firing alerts into a single consolidated notification, preventing notification storms during large-scale failures",
            "Organizing engineers into small discussion circles",
            "Combining multiple Git commits into one",
            "Grouping AWS accounts by credit card limit"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-292",
          type: "MCQ",
          prompt: "How does Alertmanager 'Inhibition' reduce alert noise during cascade infrastructure failures?",
          options: [
            "It suppresses certain alerts if other related alerts are already firing (e.g., silencing 100 'PodUnreachable' alerts if 'NodeNetworkDown' is already active)",
            "It deletes failing pods automatically",
            "It turns off the power to alerting monitors",
            "It prevents developers from submitting code reviews"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-293",
          type: "MCQ",
          prompt: "In a Prometheus alert rule, what is the purpose of the 'for: 5m' clause?",
          options: [
            "It mandates that the alert expression condition must remain true continuously for 5 minutes before the alert changes state from 'Pending' to 'Firing'",
            "It silences the alert after 5 minutes",
            "It causes the alert to repeat every 5 minutes",
            "It limits the alert message to 5 words"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-294",
          type: "MCQ",
          prompt: "What are the three pillars of the RED method used in dashboard design for microservices?",
          options: ["Rate, Errors, and Duration", "Reliability, Efficiency, and Deployment", "RAM, Egress, and Disk", "Readiness, Encryption, and Decryption"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-295",
          type: "MCQ",
          prompt: "What are the three components of the USE method used for monitoring infrastructure resources (CPU, Memory, Disks)?",
          options: ["Utilization, Saturation, and Errors", "Users, Speed, and Efficiency", "Uptime, Security, and Encryption", "Usage, Storage, and Egress"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-296",
          type: "MCQ",
          prompt: "Why should alerting rules prioritize 'Symptom-Based' alerts over 'Cause-Based' alerts?",
          options: [
            "Symptom-based alerts (e.g., users experiencing 5xx errors or high latency) directly indicate customer impact, whereas cause-based alerts (e.g., high CPU) often don't correlate with actual outages",
            "Cause-based alerts are illegal under GDPR regulations",
            "Symptom-based alerts execute 10x faster in PromQL",
            "Cause-based alerts can only be sent via email"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-297",
          type: "MCQ",
          prompt: "What is an Alertmanager 'Silence'?",
          options: [
            "A temporary mute filter defined by matching regex labels that suppresses alert notifications during planned maintenance windows or known outages",
            "A setting that turns off sound on the engineer's laptop",
            "A policy forbidding team members from speaking during meetings",
            "A command that stops Prometheus from scraping metrics"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-298",
          type: "MCQ",
          prompt: "What information MUST be included in the annotations of every production alert to enable effective on-call response?",
          options: [
            "A direct link to an actionable, tested Runbook URL detailing exact triage and mitigation steps",
            "The personal home address of the developer who wrote the code",
            "The company's stock ticker price",
            "A copy of the Git commit history"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-299",
          type: "MCQ",
          prompt: "What feature in Grafana allows creating a single dashboard that dynamically displays data for any selected environment or microservice?",
          options: ["Dashboard Variables (Templating)", "Panel Plugins", "Alertmanager Channels", "Static JSON Grids"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-300",
          type: "MCQ",
          prompt: "How does Alertmanager route alerts with 'severity: critical' to PagerDuty while sending 'severity: warning' to Slack?",
          options: [
            "Through label-based routing trees declared under the 'route:' configuration hierarchy",
            "By writing custom C++ routing extensions",
            "By checking the file extension of the alert",
            "Prometheus alerts cannot be routed based on severity"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-031",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-031",
      title: "Centralized Logging with Loki, Promtail & LogQL Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-301",
          type: "MCQ",
          prompt: "How does Grafana Loki's indexing philosophy differ fundamentally from Elasticsearch / OpenSearch?",
          options: [
            "Loki indexes ONLY stream metadata labels (e.g., namespace, app) and stores compressed raw text in object storage, whereas Elasticsearch indexes every full-text word in an inverted index",
            "Loki only stores binary files; Elasticsearch only stores text",
            "Loki requires a paid enterprise license",
            "Elasticsearch only runs on Windows Server"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-302",
          type: "MCQ",
          prompt: "Why is Loki dramatically cheaper to operate at multi-terabyte scale than an ELK stack?",
          options: [
            "Because it avoids massive memory-hungry inverted indexes and stores raw chunks directly in low-cost cloud object storage (S3/GCS)",
            "Because Loki deletes 90% of logs automatically",
            "Because Loki does not use CPU cores",
            "Because Loki runs on free solar power"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-303",
          type: "MCQ",
          prompt: "What is the LogQL stream selector syntax to query all logs from the 'checkout' pod in the 'production' namespace?",
          options: [
            "{namespace=\"production\", app=\"checkout\"}",
            "SELECT * FROM logs WHERE namespace='production' AND app='checkout'",
            "find.logs(namespace: production, app: checkout)",
            "namespace=production -> app=checkout"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-304",
          type: "MCQ",
          prompt: "What does the LogQL filter expression '|= \"timeout\" != \"redis\"' do?",
          options: [
            "It filters log lines to retain only those containing the substring 'timeout', while excluding any lines containing 'redis'",
            "It replaces 'timeout' with 'redis'",
            "It measures the timeout latency of Redis queries",
            "It throws a syntax error"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-305",
          type: "MCQ",
          prompt: "What agent is commonly deployed as a DaemonSet to tail container log files from /var/log/pods and ship them to Loki?",
          options: ["Promtail (or Fluentbit)", "Kube-proxy", "CoreDNS", "Etcdctl"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-306",
          type: "MCQ",
          prompt: "How can you compute a per-second metric representing the rate of error logs directly inside LogQL?",
          options: [
            "sum(rate({app=\"api\"} |= \"ERROR\" [5m]))",
            "count_over_time({app=\"api\"})",
            "error_rate({app=\"api\"})",
            "metric.convert({app=\"api\", filter: ERROR})"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-307",
          type: "MCQ",
          prompt: "What feature in Grafana allows seamless navigation from an error log entry directly into the corresponding distributed trace in Grafana Tempo?",
          options: [
            "Derived Fields extracting the 'trace_id' or 'traceparent' from the log and generating an internal link to Tempo",
            "Copying the trace ID into an email to customer support",
            "Restarting the pod with trace logging enabled",
            "Searching the GitHub repository for the error message"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-308",
          type: "MCQ",
          prompt: "What is a 'Log Stream' in Grafana Loki?",
          options: [
            "A sequence of log entries sharing the exact same set of metadata labels",
            "A live video stream of a server room",
            "A continuous audio podcast about Linux",
            "A direct TCP socket connection between two users"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-309",
          type: "MCQ",
          prompt: "Why should high-cardinality values (such as IP addresses, User IDs, or email addresses) NEVER be configured as Loki stream labels?",
          options: [
            "Because each unique label combination creates an entirely new log stream, leading to massive chunk fragmentation and severe query degradation",
            "Because Loki cannot store numbers in labels",
            "Because GDPR forbids storing IP addresses in RAM",
            "Because stream labels are visible to the public internet"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-310",
          type: "MCQ",
          prompt: "What parser stage inside LogQL parses structured JSON log lines into extractable key-value properties at query time?",
          options: ["| json", "| parse_json()", "--format=json", "using json_parser"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-032",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-032",
      title: "Site Reliability Engineering (SRE) & Chaos Engineering Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-311",
          type: "MCQ",
          prompt: "What is the relationship between an SLI, an SLO, and an SLA in Google SRE methodology?",
          options: [
            "An SLI is a measurable service metric; an SLO is the internal reliability target agreed upon by engineering/product; an SLA is the external legal contract with financial consequences for breach",
            "An SLA is for developers; an SLO is for managers; an SLI is for QA",
            "An SLI is measured in dollars; an SLO is measured in hours; an SLA is measured in bytes",
            "There is no difference; they are exact synonyms"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-312",
          type: "MCQ",
          prompt: "If a cloud microservice has an agreed SLO of 99.9% availability over a 30-day rolling window, what is its Error Budget?",
          options: [
            "0.1% (approximately 43.2 minutes of allowed downtime or failure over 30 days)",
            "1.0% (approximately 7.2 hours)",
            "0.01% (approximately 4.3 minutes)",
            "Zero downtime is allowed"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-313",
          type: "MCQ",
          prompt: "What is the organizational enforcement action dictated by SRE principles when an application completely exhausts its Error Budget?",
          options: [
            "New feature deployments are temporarily frozen; engineering bandwidth is diverted exclusively to stability, bug fixes, and infrastructure resilience",
            "The engineering team's salaries are deducted",
            "The product is permanently retired",
            "The cloud servers are rebooted"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-314",
          type: "MCQ",
          prompt: "Why is multi-window multi-burn-rate alerting considered superior to simple percentage threshold alerts?",
          options: [
            "It calculates how rapidly the Error Budget is being consumed over multiple time windows (e.g., 14.4x burn rate over 1 hour), alerting on real catastrophic outages while ignoring minor harmless blips",
            "It turns off alerts on weekends automatically",
            "It only sends alerts to senior staff members",
            "It eliminates the need for monitoring databases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-315",
          type: "MCQ",
          prompt: "What is the primary philosophy behind a 'Blameless Postmortem' following a major outage?",
          options: [
            "Assuming people acted in good faith with the information they had, focusing on systemic weaknesses and missing safety guardrails rather than individual human error",
            "Hiding the outage from executive leadership and customers",
            "Deleting all server logs to erase evidence of the crash",
            "Assigning blame to third-party vendors"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-316",
          type: "MCQ",
          prompt: "What is Chaos Engineering?",
          options: [
            "The discipline of intentionally experimenting on a system by injecting controlled failures (e.g., network latency, packet loss, pod kills) to build confidence in its resilience capabilities",
            "Writing messy code without unit tests",
            "Allowing developers to deploy to production without review",
            "Randomly deleting production databases without backups"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-317",
          type: "MCQ",
          prompt: "Which CNCF tool provides declarative Chaos Engineering experiments for Kubernetes clusters via Custom Resource Definitions?",
          options: ["Chaos Mesh (or LitmusChaos)", "Docker Compose", "Kube-router", "Minikube"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-318",
          type: "MCQ",
          prompt: "What is 'Toil' as defined by Google Site Reliability Engineering?",
          options: [
            "Repetitive, manual, tactical operational work that has no enduring engineering value and scales linearly with service growth",
            "Writing automated infrastructure unit tests",
            "Conducting system architecture reviews",
            "Designing database schema migrations"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-319",
          type: "MCQ",
          prompt: "What percentage limit does Google SRE recommend capping an SRE's time spent on operational toil?",
          options: [
            "A maximum of 50% (the remaining 50%+ must be dedicated to pure engineering project work)",
            "100% of their time",
            "A maximum of 5%",
            "Toil time is not measured"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-320",
          type: "MCQ",
          prompt: "In Incident Command System (ICS) operational structures, what is the role of the 'Incident Commander' (IC)?",
          options: [
            "The single individual who leads the incident triage, coordinates tasks, delegates diagnostic roles, and maintains communication, without directly debugging code themselves",
            "The developer who introduced the bug that caused the crash",
            "The executive who decides customer compensation",
            "The legal counsel handling regulatory notifications"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-033",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-033",
      title: "Enterprise DevOps Capstone & Platform Engineering Interviews Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 30,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-321",
          type: "MCQ",
          prompt: "In architecting the NovaPay Global multi-region platform, what is the key difference between RTO (Recovery Time Objective) and RPO (Recovery Point Objective)?",
          options: [
            "RTO is the maximum acceptable duration of system downtime before service is restored; RPO is the maximum acceptable amount of data loss measured in time",
            "RTO measures CPU performance; RPO measures RAM utilization",
            "RPO applies to frontend apps; RTO applies to databases",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-322",
          type: "MCQ",
          prompt: "How does Amazon Aurora Global Database achieve low-latency read replication and rapid disaster recovery across AWS regions?",
          options: [
            "By replicating storage engine writes at the storage layer directly using dedicated AWS network backbones with typical replication latency under 1 second",
            "By taking daily manual snapshots and copying them over the public internet",
            "By running continuous pg_dump scripts every 5 minutes",
            "By routing user queries through an external proxy in Tokyo"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-323",
          type: "MCQ",
          prompt: "In a Platform Engineering technical interview, what should a candidate articulate FIRST when asked to design a resilient global banking platform?",
          options: [
            "Clarifying functional requirements, traffic scale (TPS), latency budgets, availability SLOs (99.99%), and compliance constraints (PCI-DSS)",
            "Immediately writing Kubernetes YAML manifests",
            "Naming specific third-party SaaS vendors",
            "Declaring that the project cannot be completed"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-324",
          type: "MCQ",
          prompt: "How does Karpenter optimize compute infrastructure economics compared to traditional static AWS Auto Scaling Groups?",
          options: [
            "By dynamically selecting the exact cheapest combination of Spot and On-Demand EC2 instance types and sizes required to fit pending pods, consolidating nodes when idle",
            "By shutting down all worker nodes at midnight",
            "By mining Bitcoin to subsidize cloud invoices",
            "By running all containers on a single t3.micro instance"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-325",
          type: "MCQ",
          prompt: "Why is Cilium's eBPF-based service routing superior to iptables kube-proxy in clusters running thousands of services?",
          options: [
            "eBPF uses O(1) in-kernel hash table lookups for endpoint routing, whereas iptables scales with O(N) sequential rule evaluation, incurring massive CPU bottlenecks at scale",
            "Cilium is written in Python and is easier to read",
            "Iptables is blocked by modern Linux kernels",
            "Cilium eliminates the need for IP addresses"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-326",
          type: "MCQ",
          prompt: "In an enterprise GitOps delivery model, how do ApplicationSets in ArgoCD enable scalable multi-cluster deployments?",
          options: [
            "They automatically generate and manage ArgoCD Applications across hundreds of target clusters based on dynamic Git directory structures or cluster labels",
            "They bundle mobile applications for iOS App Store submission",
            "They translate English prompts into Dockerfiles",
            "They generate automated PowerPoint slide decks for executives"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-327",
          type: "MCQ",
          prompt: "What strategy allows high-risk database schema migrations to execute safely in a continuous deployment pipeline without breaking running application pods?",
          options: [
            "The Expand and Contract pattern (Phase 1: Expand schema with backwards-compatible nullable columns; Phase 2: Deploy code writing to both; Phase 3: Contract legacy columns)",
            "Shutting down the entire company for 12 hours on Sunday",
            "Executing raw DROP TABLE commands directly in production",
            "Editing database tables in Microsoft Excel"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-328",
          type: "MCQ",
          prompt: "How does combining AWS WAF (Web Application Firewall) with Route 53 protect financial platforms from automated credential stuffing attacks?",
          options: [
            "WAF enforces rate limiting, IP reputation filtering, and managed bot control rules at the cloud perimeter before requests ever reach backend Kubernetes clusters",
            "Route 53 deletes suspicious domain names from the global DNS registry",
            "WAF prompts every visitor with a phone call verification",
            "WAF turns off TLS handshakes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-329",
          type: "MCQ",
          prompt: "What is an Internal Developer Platform (IDP) in modern platform engineering organizations?",
          options: [
            "A self-service layer enabling application developers to provision infrastructure, spin up preview environments, and deploy workloads independently within Golden Path guardrails",
            "An internal Wikipedia page with outdated links",
            "A private gaming server for engineering employees",
            "A software tool that prevents developers from asking questions"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-330",
          type: "MCQ",
          prompt: "In a Platform Engineer interview system design presentation, what demonstrates true senior-level engineering maturity?",
          options: [
            "Explicitly discussing architectural trade-offs, operational failure modes, blast radius mitigation, cost implications, and disaster recovery strategies rather than presenting an idealized panacea",
            "Claiming that the proposed design is 100% bug-free and will never fail",
            "Memorizing every single CLI flag in Terraform",
            "Refusing to answer questions about budget and financial costs"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

