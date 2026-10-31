// Phase 4: Advanced (Chapters 22 to 28) - Java Full Stack Developer
// Full-Stack integration, Microservices, Docker, Redis, CI/CD, and AWS Cloud Architecture.

export const phase4 = {
  chapters: [
    // ── Chapter 22 ──
    {
      id: "CH-JFS-022",
      courseId: "CRS-JFS-001",
      sequence: 22,
      title: "Connecting React to Spring Boot: Full-Stack Integration, Axios Interceptors & JWT Flow",
      description: "End-to-end integration patterns, configuring Axios HTTP client, request/response interceptors, automatic JWT token attachment, refresh token flows, and CORS configuration.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 22</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Full-Stack Integration: React + Spring Boot 3</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Integrating a React single-page frontend with a Spring Boot REST API is where full-stack mastery comes alive. You will establish robust API client layers, handle CORS, automate JWT authentication headers with Axios interceptors, and gracefully handle loading and network error states.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5PdEmeopJVQ" title="React and Spring Boot Full Stack" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Enterprise Axios Client with Interceptors (<code>src/api/client.js</code>)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor: Automatically inject Bearer JWT from secure storage
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Centralized 401 Unauthorized handling & redirection
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login?expired=true';
        }
        return Promise.reject(error);
    }
);</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Create an isolated API client service layer rather than scattering <code>fetch</code> calls across UI components.</li>
      <li>Use Axios Request Interceptors to attach JWT Authorization Bearer headers transparently.</li>
      <li>Handle 401 Unauthorized globally via Response Interceptors to redirect logged-out users cleanly.</li>
      <li>Configure CORS in Spring Boot with explicit allowed origins (never wildcard <code>*</code> when credentials are sent).</li>
      <li>Separate UI presentation components from asynchronous data-fetching hooks.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 23 ──
    {
      id: "CH-JFS-023",
      courseId: "CRS-JFS-001",
      sequence: 23,
      title: "State Management & Asynchronous Data: Redux Toolkit, TanStack Query & Zod",
      description: "Client state vs Server state, Redux Toolkit slices and async thunks, TanStack Query (caching, deduping, optimistic updates), and schema validation with Zod.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 23</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">State Management: Redux Toolkit, TanStack Query & Zod</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Modern frontend architecture strictly distinguishes between <strong>Client State</strong> (UI toggles, modals, dark mode) and <strong>Server State</strong> (asynchronous remote data cached from REST APIs). TanStack Query (React Query) handles server caching, while Redux Toolkit manages complex synchronous client workflows.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Declarative Server State with TanStack Query</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useCourseCatalog() {
    return useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const { data } = await apiClient.get('/catalog');
            return data;
        },
        staleTime: 5 * 60 * 1000, // Cached for 5 minutes without refetching!
        retry: 2,
    });
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Do not store API server data in Redux; use TanStack Query for automatic caching, deduping, and background refetching.</li>
      <li>Use Redux Toolkit (RTK) for complex synchronous client state such as shopping carts or multi-step wizard state.</li>
      <li>Zod guarantees runtime schema validation on form inputs and API responses with TypeScript type inference.</li>
      <li>Optimistic updates provide instant UI feedback by updating cache state before the server HTTP response resolves.</li>
      <li>Use query invalidation (<code>queryClient.invalidateQueries</code>) to automatically refresh stale data after mutations.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 24 ──
    {
      id: "CH-JFS-024",
      courseId: "CRS-JFS-001",
      sequence: 24,
      title: "High-Performance Database Engineering: Index Tuning, EXPLAIN ANALYZE, Liquibase & Redis Caching",
      description: "PostgreSQL query plans, compound indexes, database migration automation with Liquibase, second-level caching, and distributed caching with Redis.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 24</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Database Optimization, Liquibase Migrations & Redis Caching</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In production backends, the database is almost always the first bottleneck. You will learn to inspect query execution plans with <code>EXPLAIN (ANALYZE, BUFFERS)</code>, design high-cardinality composite indexes, automate database schema migrations with Liquibase, and offload read hotspots using Redis.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Declarative Distributed Caching with Spring Data Redis</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>@Service
public class CourseCatalogService {

    private final CourseRepository courseRepository;

    public CourseCatalogService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // Cached in Redis cluster: Sub-millisecond retrieval on cache hit!
    @Cacheable(value = "courses", key = "#courseId", unless = "#result == null")
    public CourseDto getCourseById(String courseId) {
        return courseRepository.findById(courseId)
            .map(CourseMapper::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
    }

    // Cache Eviction: Purges cached entry when course is updated
    @CacheEvict(value = "courses", key = "#courseId")
    public CourseDto updateCourse(String courseId, UpdateCourseRequest req) {
        // ... update database and evict stale cache
    }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Use <code>EXPLAIN ANALYZE</code> in PostgreSQL to detect sequential table scans and index misses.</li>
      <li>Create composite indexes matching the exact filter ordering in SQL WHERE clauses (most selective column first).</li>
      <li>Liquibase manages database migrations as versioned changeset files, eliminating manual DDL alterations in production.</li>
      <li>Redis operates in-memory with sub-millisecond latencies, protecting SQL databases from read saturation.</li>
      <li>Always set a Time-To-Live (TTL) on Redis keys to prevent stale data buildup and memory exhaustion.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 25 ──
    {
      id: "CH-JFS-025",
      courseId: "CRS-JFS-001",
      sequence: 25,
      title: "Cloud-Native Microservices Architecture: Spring Cloud Gateway, Eureka, OpenFeign & Resilience4j",
      description: "Microservice decomposition patterns, API Gateway routing, Eureka service registry, declarative OpenFeign HTTP clients, distributed tracing, and Circuit Breakers.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 25</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Microservices: Spring Cloud Gateway, OpenFeign & Resilience4j</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Monolithic architectures become organizational bottlenecks as engineering teams scale. Distributed microservices decompose applications into independently deployable domain services communicating via REST or event streams, protected by API Gateways and Circuit Breakers.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/9X2eZg5wS_k" title="Spring Boot Microservices Architecture" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Declarative Inter-Service Calls with Spring Cloud OpenFeign</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>@FeignClient(name = "payment-service", fallback = PaymentFallback.class)
public interface PaymentClient {

    @PostMapping("/api/v1/payments/process")
    PaymentConfirmation processPayment(@RequestBody PaymentRequest request);
}

// Resilience4j Circuit Breaker Fallback: Graceful degradation when payment service is down
@Component
public class PaymentFallback implements PaymentClient {
    @Override
    public PaymentConfirmation processPayment(PaymentRequest request) {
        // Enqueue payment request for offline retry queue rather than crashing user checkout!
        return new PaymentConfirmation("QUEUED_FOR_RETRY", false);
    }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Spring Cloud Gateway serves as the single entry point, handling routing, SSL termination, and rate limiting.</li>
      <li>Service Discovery (Eureka / Consul) allows microservices to locate each other dynamically without hardcoded IPs.</li>
      <li>OpenFeign provides declarative REST client interfaces that integrate with load balancers automatically.</li>
      <li>Circuit Breakers (Resilience4j) prevent cascading failures by tripping open when downstream services fail.</li>
      <li>Adopt the Saga Pattern or Outbox Pattern to maintain eventual consistency across distributed database boundaries.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 26 ──
    {
      id: "CH-JFS-026",
      courseId: "CRS-JFS-001",
      sequence: 26,
      title: "Containerization Engineering: Multi-Stage Docker Builds & Docker Compose Orchestration",
      description: "Docker engine architecture, multi-stage Dockerfiles for minimal Alpine images, JVM layer caching, non-root security, and Docker Compose orchestration.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 26</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Containerization with Docker & Multi-Stage Builds</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Containers package applications alongside their exact runtime dependencies, guaranteeing identical behavior across developer laptops, CI pipelines, and production Kubernetes clusters. Multi-stage builds produce tiny, secure, hardened container images.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Production Multi-Stage Dockerfile for Spring Boot 3</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># Stage 1: Build stage with full JDK 21 and Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
# Pre-download dependencies for caching
RUN ./mvnw dependency:go-offline
COPY src src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal hardened production JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Run as unprivileged non-root user for security:
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseZGC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Multi-stage Docker builds separate compile tools from runtime environments, shrinking image sizes from 800MB to ~150MB.</li>
      <li>Always run containers as a non-root user (<code>USER appuser</code>) to mitigate container-escape vulnerabilities.</li>
      <li>Configure JVM container flags (<code>-XX:MaxRAMPercentage=75.0</code>) so the JVM respects Docker cgroup memory limits.</li>
      <li>Docker Compose orchestrates multi-container environments (Spring Boot + React + PostgreSQL + Redis) with a single command.</li>
      <li>Utilize Docker layer caching by copying <code>pom.xml</code> and downloading dependencies before copying application source code.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 27 ──
    {
      id: "CH-JFS-027",
      courseId: "CRS-JFS-001",
      sequence: 27,
      title: "Enterprise CI/CD Automation: GitHub Actions & Zero-Downtime Blue/Green Deployments",
      description: "Continuous integration pipelines, automated container image building, vulnerability scanning (Trivy/Snyk), staging promotion, and zero-downtime blue/green rollouts.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 27</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">CI/CD Pipelines & Zero-Downtime Deployments</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Elite engineering organizations deploy to production multiple times per day without maintenance windows. Continuous Integration (CI) and Continuous Delivery (CD) automate validation, security gating, artifact publishing, and zero-downtime rollouts.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Zero-Downtime Deployment Strategies</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:16px;border-radius:8px;">
      <h4 style="margin-top:0;color:#0284c7;">Blue-Green Deployment</h4>
      <p style="font-size:13px;line-height:1.6;color:#334155;">Maintains two identical production environments (Blue and Green). Traffic routes to Blue. Green deploys new version. Once verified, router instantly flips traffic to Green. Rollback is instantaneous.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:16px;border-radius:8px;">
      <h4 style="margin-top:0;color:#16a34a;">Canary Deployment</h4>
      <p style="font-size:13px;line-height:1.6;color:#334155;">New release routes to 5% of users. Real-time metrics monitor error rates and latency. If error rates remain flat, traffic gradually ramps to 25%, 50%, and 100%.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Continuous Integration verifies every pull request before merging (unit tests, coverage, security scanning).</li>
      <li>Automate container vulnerability scans (Trivy, Grype) to block vulnerable base images from reaching production.</li>
      <li>Blue-Green deployment ensures zero user downtime and instantaneous rollback capabilities.</li>
      <li>Never deploy secrets into container images; inject them via AWS Secrets Manager or HashiCorp Vault.</li>
      <li>Automate database schema migrations in a backward-compatible manner (Expand and Contract pattern).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 28 ──
    {
      id: "CH-JFS-028",
      courseId: "CRS-JFS-001",
      sequence: 28,
      title: "Cloud Infrastructure on AWS: ECS/Fargate, RDS PostgreSQL & CloudFront CDN",
      description: "AWS cloud architecture, container hosting with ECS Fargate, managed RDS PostgreSQL with multi-AZ replication, S3 + CloudFront CDN for React, and Route 53 DNS.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 28</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Cloud Architecture on AWS: ECS, RDS & CloudFront</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Deploying full-stack applications to Amazon Web Services (AWS) ensures global availability, auto-scaling, and enterprise durability. In this chapter, you will master deploying the Spring Boot backend on AWS ECS Fargate, the PostgreSQL database on Amazon RDS, and hosting the React SPA globally on S3 and CloudFront CDN.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/Ia-UEYYR44s" title="Deploy Spring Boot and React to AWS" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Production AWS Full-Stack Topology</h2>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:20px;border-radius:8px;font-family:monospace;font-size:13px;line-height:1.8;">
    <strong>Global Edge:</strong> AWS CloudFront CDN &rarr; S3 Bucket (React SPA Static Assets)<br>
    <strong>API Traffic:</strong> Route 53 DNS &rarr; Application Load Balancer (ALB) &rarr; AWS ECS Fargate (Spring Boot Containers)<br>
    <strong>Persistence:</strong> Amazon RDS PostgreSQL (Multi-AZ) + Amazon ElastiCache (Redis Cluster)
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>AWS ECS Fargate provides serverless container execution without managing underlying EC2 virtual machines.</li>
      <li>Amazon RDS Multi-AZ synchronously replicates database writes to a standby instance for automatic failover.</li>
      <li>Host React static builds (HTML/JS/CSS) on Amazon S3 and distribute via CloudFront CDN for global sub-50ms latency.</li>
      <li>Application Load Balancers (ALB) handle SSL termination and route traffic across healthy container targets.</li>
      <li>Isolate backend services and databases in private subnets within a Virtual Private Cloud (VPC).</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 4 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-JFS-022",
      title: "Full-Stack Integration Assessment",
      chapterId: "CH-JFS-022",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-022-01", type: "MCQ", prompt: "What Axios feature allows executing logic automatically before an HTTP request leaves the browser?", options: ["Request Interceptor", "Web Worker", "Proxy Filter", "URL Hook"], answer: 0, points: 10 },
        { id: "Q-JFS-022-02", type: "MCQ", prompt: "How should an Axios interceptor attach a JWT token to outgoing HTTP requests?", options: ["config.headers.Authorization = `Bearer ${token}`", "config.url += `?token=${token}`", "config.data.token = token", "document.cookie = token"], answer: 0, points: 10 },
        { id: "Q-JFS-022-03", type: "MCQ", prompt: "What HTTP status code triggers a redirect to the login page via Axios response interceptors?", options: ["401 Unauthorized", "404 Not Found", "500 Internal Server Error", "302 Found"], answer: 0, points: 10 },
        { id: "Q-JFS-022-04", type: "MCQ", prompt: "What occurs if a frontend at `https://app.nalanda.edu` makes a request to `https://api.nalanda.edu` without proper CORS headers on the backend?", options: ["The backend executes the query, but the browser blocks JavaScript from reading the response", "The computer restarts", "The request is redirected to Google", "The backend crashes"], answer: 0, points: 10 },
        { id: "Q-JFS-022-05", type: "MCQ", prompt: "Why should you never use `*` as the `allowedOrigins` in Spring Boot when `allowCredentials(true)` is enabled?", options: ["It is invalid according to W3C CORS specification and browsers reject it", "It slows down network transfer", "Spring will throw an out-of-memory error", "It is required for HTTPS"], answer: 0, points: 10 },
        { id: "Q-JFS-022-06", type: "MCQ", prompt: "What tool allows configuring API proxying in Vite development to bypass CORS?", options: ["server.proxy in vite.config.ts", "nginx", "docker", "webpack plugin"], answer: 0, points: 10 },
        { id: "Q-JFS-022-07", type: "MCQ", prompt: "Where should sensitive API keys and backend base URLs be configured in a modern React application?", options: ["Hardcoded in components", "In `.env` environment variables prefixed with `VITE_`", "In HTML comments", "In localStorage"], answer: 1, points: 10 },
        { id: "Q-JFS-022-08", type: "MCQ", prompt: "What is an HTTP Preflight `OPTIONS` request in CORS?", options: ["An automatic request sent by the browser to verify permissions before sending complex cross-origin requests", "A request to compress images", "A server heartbeat ping", "A database query"], answer: 0, points: 10 },
        { id: "Q-JFS-022-09", type: "MCQ", prompt: "What React state pattern tracks whether an API request is currently executing?", options: ["const [loading, setLoading] = useState(false);", "useInterval()", "isBusy()", "const timer = 0;"], answer: 0, points: 10 },
        { id: "Q-JFS-022-10", type: "MCQ", prompt: "What is the recommended storage location for JWT access tokens in high-security web applications?", options: ["HttpOnly, Secure, SameSite cookies", "Plain text file", "URL query parameter", "GitHub repository"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-023",
      title: "State Management & React Query Assessment",
      chapterId: "CH-JFS-023",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-023-01", type: "MCQ", prompt: "What is the fundamental difference between Client State and Server State?", options: ["Server state is remote, asynchronous, and shared; Client state is synchronous and owned purely by the local browser session", "Client state requires SQL; Server state requires HTML", "Server state cannot be cached", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-JFS-023-02", type: "MCQ", prompt: "What major advantage does TanStack Query (React Query) provide over manual useEffect fetching?", options: ["Automatic background refetching, request deduplication, and declarative caching", "Replaces all React components", "Runs backend SQL queries", "Compiles Java bytecode"], answer: 0, points: 10 },
        { id: "Q-JFS-023-03", type: "MCQ", prompt: "What does the `staleTime` property configure in TanStack Query?", options: ["The duration data is considered fresh before a background refetch is triggered", "When to delete the database", "How long the user can stay logged in", "The HTTP timeout threshold"], answer: 0, points: 10 },
        { id: "Q-JFS-023-04", type: "MCQ", prompt: "What Redux Toolkit function simplifies creating state slices, action creators, and reducers in one place?", options: ["createSlice()", "createStore()", "createReducer()", "createAction()"], answer: 0, points: 10 },
        { id: "Q-JFS-023-05", type: "MCQ", prompt: "What library integrates Immer under the hood to allow 'mutative-looking' immutable state updates in reducers?", options: ["Redux Toolkit", "Lodash", "jQuery", "Axios"], answer: 0, points: 10 },
        { id: "Q-JFS-023-06", type: "MCQ", prompt: "What is an optimistic update in UI development?", options: ["Updating the local UI immediately assuming the server mutation will succeed, then rolling back if an error occurs", "Never handling errors", "Displaying a loading spinner forever", "Caching images on CDN"], answer: 0, points: 10 },
        { id: "Q-JFS-023-07", type: "MCQ", prompt: "What is Zod primarily used for in full-stack TypeScript/React applications?", options: ["Declarative runtime schema validation and static type inference", "CSS animations", "Database migrations", "Hosting web servers"], answer: 0, points: 10 },
        { id: "Q-JFS-023-08", type: "MCQ", prompt: "What hook is used in TanStack Query to perform data mutations (POST, PUT, DELETE)?", options: ["useQuery()", "useMutation()", "useFetch()", "useAction()"], answer: 1, points: 10 },
        { id: "Q-JFS-023-09", type: "MCQ", prompt: "What method marks a query as stale, forcing an immediate background refetch across components?", options: ["queryClient.invalidateQueries({ queryKey })", "queryClient.delete()", "queryClient.refreshAll()", "queryClient.wipe()"], answer: 0, points: 10 },
        { id: "Q-JFS-023-10", type: "MCQ", prompt: "When is Redux genuinely needed instead of relying solely on React Context and TanStack Query?", options: ["Only when an application has complex, high-frequency, multi-component synchronous client state workflows (e.g., complex canvas editors, games)", "For every single React app", "Never", "Only for displaying static text"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-024",
      title: "Database Performance & Redis Assessment",
      chapterId: "CH-JFS-024",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-024-01", type: "MCQ", prompt: "What PostgreSQL command displays the query execution plan and actual execution timings?", options: ["SHOW PLAN", "EXPLAIN ANALYZE", "DESCRIBE QUERY", "TRACE EXECUTION"], answer: 1, points: 10 },
        { id: "Q-JFS-024-02", type: "MCQ", prompt: "What is a 'Sequential Scan' (Seq Scan) in database query performance?", options: ["A rapid index lookup", "Reading every single row in the table from disk because no suitable index was available", "A network scan for open ports", "A transaction rollback"], answer: 1, points: 10 },
        { id: "Q-JFS-024-03", type: "MCQ", prompt: "Why is Redis extremely fast compared to relational databases?", options: ["It is written in Python", "It stores all data primarily in in-memory RAM with optimized single-threaded event loops", "It has no data structures", "It ignores write operations"], answer: 1, points: 10 },
        { id: "Q-JFS-024-04", type: "MCQ", prompt: "What Spring annotation caches the return value of a method in Redis?", options: ["@Cacheable", "@RedisStore", "@Memoize", "@FastData"], answer: 0, points: 10 },
        { id: "Q-JFS-024-05", type: "MCQ", prompt: "What is the primary role of Liquibase or Flyway in enterprise applications?", options: ["To execute unit tests", "To manage and version control database schema migrations reproducibly across environments", "To compress SQL tables", "To monitor memory leaks"], answer: 1, points: 10 },
        { id: "Q-JFS-024-06", type: "MCQ", prompt: "What occurs during 'Cache Stampede' (Thundering Herd problem)?", options: ["Redis runs out of disk space", "When a hot cached key expires, and thousands of concurrent requests all hit the underlying database simultaneously to recompute it", "Database tables are locked", "Network cables disconnect"], answer: 1, points: 10 },
        { id: "Q-JFS-024-07", type: "MCQ", prompt: "What does setting a TTL (Time-To-Live) on a Redis key accomplish?", options: ["Encrypts the key", "Ensures the key automatically expires and is evicted after a specified duration", "Prevents reads", "Makes the key permanent"], answer: 1, points: 10 },
        { id: "Q-JFS-024-08", type: "MCQ", prompt: "What index structure should be used on a column with a high volume of range filters (e.g., created_at BETWEEN)?", options: ["B-Tree Index", "Hash Index", "GIN Index", "Full-text Index"], answer: 0, points: 10 },
        { id: "Q-JFS-024-09", type: "MCQ", prompt: "What annotation purges stale entries from the cache when data is updated?", options: ["@CacheEvict", "@CacheDelete", "@PurgeCache", "@CleanRedis"], answer: 0, points: 10 },
        { id: "Q-JFS-024-10", type: "MCQ", prompt: "What does the Liquibase `databaseChangeLog` table track?", options: ["User passwords", "Every changeset ID, author, and execution timestamp that has been applied to that specific database", "Database query execution times", "Server CPU metrics"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-025",
      title: "Microservices Architecture Assessment",
      chapterId: "CH-JFS-025",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-025-01", type: "MCQ", prompt: "What is the primary purpose of an API Gateway in microservices architecture?", options: ["To store database tables", "To act as a reverse proxy, handling routing, authentication, rate limiting, and SSL termination centrally", "To compile frontend React code", "To replace all backend code"], answer: 1, points: 10 },
        { id: "Q-JFS-025-02", type: "MCQ", prompt: "What does a Service Registry (like Eureka or Consul) do?", options: ["Tracks physical IP addresses and ports of dynamically scaled microservice instances so clients can discover them", "Registers software trademarks", "Stores domain names with ICANN", "Monitors employee logins"], answer: 0, points: 10 },
        { id: "Q-JFS-025-03", type: "MCQ", prompt: "What library provides declarative HTTP client interfaces in Spring Cloud?", options: ["Spring Cloud OpenFeign", "HttpClient", "RestTemplate", "Retrofit"], answer: 0, points: 10 },
        { id: "Q-JFS-025-04", type: "MCQ", prompt: "How does a Circuit Breaker (Resilience4j) protect a microservice ecosystem?", options: ["It shuts down the entire data center", "It trips open when downstream failures cross a threshold, failing fast with a fallback response rather than exhausting caller threads", "It encrypts all network packets", "It blocks hacker IP addresses"], answer: 1, points: 10 },
        { id: "Q-JFS-025-05", type: "MCQ", prompt: "What states exist in a standard Circuit Breaker state machine?", options: ["Closed (normal), Open (failing fast), Half-Open (trial calls to test recovery)", "On, Off, Idle", "Active, Inactive, Dormant", "Green, Yellow, Red"], answer: 0, points: 10 },
        { id: "Q-JFS-025-06", type: "MCQ", prompt: "What design pattern manages distributed transactions across microservices using a sequence of local transactions?", options: ["Saga Pattern", "Singleton Pattern", "Factory Pattern", "Decorator Pattern"], answer: 0, points: 10 },
        { id: "Q-JFS-025-07", type: "MCQ", prompt: "What architectural pattern ensures atomic database updates alongside message publishing to message brokers like Kafka?", options: ["Transactional Outbox Pattern", "Repository Pattern", "Proxy Pattern", "Builder Pattern"], answer: 0, points: 10 },
        { id: "Q-JFS-025-08", type: "MCQ", prompt: "Why should microservices have private, independent database schemas rather than sharing a single database?", options: ["To prevent tight database coupling and allow teams to evolve and scale data models independently", "Because SQL does not allow multiple services", "To save license fees", "Sharing databases is forbidden by HTTP"], answer: 0, points: 10 },
        { id: "Q-JFS-025-09", type: "MCQ", prompt: "What tool propagates a unique correlation ID across distributed HTTP calls for end-to-end tracing?", options: ["Distributed Tracing (OpenTelemetry / Micrometer Tracing / Zipkin)", "Docker Compose", "Maven", "Postman"], answer: 0, points: 10 },
        { id: "Q-JFS-025-10", type: "MCQ", prompt: "What is the CAP Theorem trade-off in distributed systems during network partition (P)?", options: ["You must choose between Consistency (C) and Availability (A)", "You get both Consistency and Availability free", "Performance and Price", "CPU and Memory"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-026",
      title: "Docker Containerization Assessment",
      chapterId: "CH-JFS-026",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-026-01", type: "MCQ", prompt: "What is the main benefit of Multi-Stage Docker builds?", options: ["They create separate build and runtime environments, resulting in drastically smaller and more secure production images", "They run multiple operating systems simultaneously", "They speed up internet download speed", "They eliminate the need for Dockerfiles"], answer: 0, points: 10 },
        { id: "Q-JFS-026-02", type: "MCQ", prompt: "Why is running a container as the default `root` user considered dangerous?", options: ["If an attacker escapes the container sandbox, they have root superuser control over the underlying host machine", "Root users cannot run Java", "It slows down container startup", "Docker disallows root"], answer: 0, points: 10 },
        { id: "Q-JFS-026-03", type: "MCQ", prompt: "What flag ensures the JVM inside a container respects Docker memory cgroup boundaries?", options: ["-XX:MaxRAMPercentage=75.0", "-Xmx100%", "-XX:+UseDockerRAM", "-XX:NoLimits"], answer: 0, points: 10 },
        { id: "Q-JFS-026-04", type: "MCQ", prompt: "What Docker instruction copies files from a previous build stage?", options: ["COPY --from=builder /source /dest", "IMPORT /source", "FETCH /source", "PULL /source"], answer: 0, points: 10 },
        { id: "Q-JFS-026-05", type: "MCQ", prompt: "What is Docker Compose used for?", options: ["Defining and running multi-container Docker applications via a single YAML configuration file", "Compiling Java code", "Editing images in Photoshop", "Writing unit tests"], answer: 0, points: 10 },
        { id: "Q-JFS-026-06", type: "MCQ", prompt: "How do Docker image layers behave during caching?", options: ["If an early layer changes, all subsequent layers must be rebuilt from scratch", "Layers are always rebuilt", "Layers are randomized", "Changing source code re-downloads dependencies"], answer: 0, points: 10 },
        { id: "Q-JFS-026-07", type: "MCQ", prompt: "What Docker command builds an image from a Dockerfile?", options: ["docker build -t my-app:1.0 .", "docker compile", "docker make", "docker create-image"], answer: 0, points: 10 },
        { id: "Q-JFS-026-08", type: "MCQ", prompt: "What is the difference between a Docker image and a Docker container?", options: ["An image is the immutable blueprint/template; a container is a live, running instance of an image", "An image runs on CPU; a container is on disk", "A container is written in Java; an image in C", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-JFS-026-09", type: "MCQ", prompt: "What mechanism allows persistent data storage that outlives the lifecycle of a container?", options: ["Docker Volumes", "Container RAM", "Process registers", "Standard output"], answer: 0, points: 10 },
        { id: "Q-JFS-026-10", type: "MCQ", prompt: "What lightweight Linux distribution base image is frequently chosen for minimal container footprints?", options: ["Alpine Linux", "Ubuntu Desktop", "Fedora Server", "macOS"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-027",
      title: "CI/CD & Deployment Automation Assessment",
      chapterId: "CH-JFS-027",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-027-01", type: "MCQ", prompt: "What is the key principle of Blue-Green deployment?", options: ["Running two identical environments (Blue and Green) and switching router traffic instantly to achieve zero downtime", "Deploying only on Fridays", "Deploying with half memory", "Testing code manually in production"], answer: 0, points: 10 },
        { id: "Q-JFS-027-02", type: "MCQ", prompt: "What happens during a Canary deployment?", options: ["New versions are routed to a small percentage of real production traffic first to verify stability before wider rollout", "Deploying on cloud servers only", "Deploying with database backups disabled", "Running tests on staging only"], answer: 0, points: 10 },
        { id: "Q-JFS-027-03", type: "MCQ", prompt: "What tool in CI pipelines scans container images and dependencies for known CVE vulnerabilities?", options: ["Trivy / Snyk / Grype", "Webpack", "JUnit", "NPM"], answer: 0, points: 10 },
        { id: "Q-JFS-027-04", type: "MCQ", prompt: "What is Continuous Integration (CI)?", options: ["Automating the building, testing, and merging of code changes frequently into a shared repository", "Writing code without review", "Deploying directly to production manually", "Installing servers manually"], answer: 0, points: 10 },
        { id: "Q-JFS-027-05", type: "MCQ", prompt: "What should a CI pipeline do if unit tests or static analysis checks fail?", options: ["Fail the pipeline immediately and block merging the pull request", "Merge anyway and send an email", "Ignore the failure", "Retry until it passes"], answer: 0, points: 10 },
        { id: "Q-JFS-027-06", type: "MCQ", prompt: "How should database schema changes be designed for zero-downtime rolling deployments?", options: ["They must be backward-compatible with the old version of the application currently running (Expand-Contract pattern)", "Drop old columns immediately", "Shut down the database for 1 hour", "Run manual ALTER statements in production"], answer: 0, points: 10 },
        { id: "Q-JFS-027-07", type: "MCQ", prompt: "What is Infrastructure as Code (IaC)?", options: ["Managing and provisioning compute, storage, and networking through version-controlled definition files (e.g., Terraform)", "Writing application code in bash", "Hardcoding IPs in Java files", "Manual server clicking in cloud console"], answer: 0, points: 10 },
        { id: "Q-JFS-027-08", type: "MCQ", prompt: "Where should production API secrets and database passwords be stored in automated CI/CD?", options: ["In cloud secret managers (AWS Secrets Manager, HashiCorp Vault) injected as environment variables at runtime", "Hardcoded into git repositories", "In public Docker images", "In plain text README files"], answer: 0, points: 10 },
        { id: "Q-JFS-027-09", type: "MCQ", prompt: "What is the primary benefit of automated rollback mechanisms in modern CD pipelines?", options: ["Instantly reverting traffic to the previous known-good version if post-deployment health metrics degrade", "Deleting the code repository", "Shutting down the company website", "Increasing server costs"], answer: 0, points: 10 },
        { id: "Q-JFS-027-10", type: "MCQ", prompt: "What is an artifact repository in the context of continuous delivery?", options: ["A secure storage registry for compiled binaries, JAR files, and Docker container images (e.g., Nexus, Artifactory, AWS ECR)", "A git commit history", "A bug tracker", "An office documentation wiki"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-028",
      title: "AWS Cloud Deployment Assessment",
      chapterId: "CH-JFS-028",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-028-01", type: "MCQ", prompt: "What AWS service allows running Docker containers serverlessly without managing EC2 virtual machine instances?", options: ["AWS Fargate (with Amazon ECS)", "AWS Lambda for containers only", "AWS Lightsail", "Amazon S3"], answer: 0, points: 10 },
        { id: "Q-JFS-028-02", type: "MCQ", prompt: "What AWS managed service is ideal for hosting production PostgreSQL databases with automated backups and Multi-AZ failover?", options: ["Amazon RDS for PostgreSQL", "Amazon DynamoDB", "Amazon Redshift", "Amazon S3 Glacier"], answer: 0, points: 10 },
        { id: "Q-JFS-028-03", type: "MCQ", prompt: "How should a static production React SPA be hosted on AWS for optimal global speed and lowest cost?", options: ["Static website hosting in Amazon S3 distributed globally via Amazon CloudFront CDN", "Running an EC2 instance with Apache", "Inside a heavy Kubernetes cluster", "On an RDS database"], answer: 0, points: 10 },
        { id: "Q-JFS-028-04", type: "MCQ", prompt: "What AWS component distributes incoming HTTP traffic across healthy container instances?", options: ["Application Load Balancer (ALB)", "Internet Gateway", "NAT Gateway", "Route 53 Hosted Zone"], answer: 0, points: 10 },
        { id: "Q-JFS-028-05", type: "MCQ", prompt: "What is the purpose of Amazon Route 53?", options: ["A highly available and scalable cloud Domain Name System (DNS) web service", "A container registry", "A load testing tool", "A database migration service"], answer: 0, points: 10 },
        { id: "Q-JFS-028-06", type: "MCQ", prompt: "Why should backend application containers and databases be placed in private subnets without public IPs?", options: ["To prevent direct internet exposure, securing them behind load balancers and NAT gateways", "Because AWS forbids public databases", "To save on IP address fees only", "Private subnets run faster"], answer: 0, points: 10 },
        { id: "Q-JFS-028-07", type: "MCQ", prompt: "What AWS service provides a managed container registry to store and scan Docker images?", options: ["Amazon ECR (Elastic Container Registry)", "Amazon S3", "AWS CodeCommit", "Amazon CloudWatch"], answer: 0, points: 10 },
        { id: "Q-JFS-028-08", type: "MCQ", prompt: "What is an AWS CloudFormation or Terraform template used for?", options: ["Provisioning and configuring entire cloud architectures declaratively as code", "Writing Java backend logic", "Hosting CSS files", "Tracking customer billing"], answer: 0, points: 10 },
        { id: "Q-JFS-028-09", type: "MCQ", prompt: "What AWS service manages and automatically rotates database credentials securely?", options: ["AWS Secrets Manager", "Amazon SNS", "AWS IAM Roles", "Amazon SQS"], answer: 0, points: 10 },
        { id: "Q-JFS-028-10", type: "MCQ", prompt: "What is the role of an Amazon CloudFront Cache Invalidation when deploying a new React build?", options: ["Purges cached index.html files at global edge locations so users immediately receive the new application bundle", "Deletes all user sessions", "Restarts the backend server", "Clears the database cache"], answer: 0, points: 10 },
      ]
    }
  ]
};

