// Phase 5: Mastery (Chapters 29 to 35) - Java Full Stack Developer
// JVM tuning, Enterprise Security, System Design, GoF Patterns, Observability, Capstone & Career Mastery.

export const phase5 = {
  chapters: [
    // ── Chapter 29 ──
    {
      id: "CH-JFS-029",
      courseId: "CRS-JFS-001",
      sequence: 29,
      title: "JVM Internals, Memory Anatomy & Low-Latency Garbage Collection Tuning (ZGC & G1GC)",
      description: "Generational memory regions (Eden, Survivor, Tenured), Metaspace tuning, Safepoint mechanics, ZGC sub-millisecond pauses, and memory leak diagnosis with heap dumps.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 29</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">JVM Internals, Memory Anatomy & ZGC Garbage Collection</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">To reach the pinnacle of Java engineering, you must understand what happens beneath the bytecode abstraction. Deep knowledge of heap generational mechanics, JIT tiering (C1/C2 compilers), safepoints, and the revolutionary <strong>ZGC (Z Garbage Collector)</strong> separates senior architects from average developers.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/k9b6P3uT35o" title="Java Garbage Collection and JVM Tuning" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Generational Hypothesis & Modern Garbage Collectors</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The Weak Generational Hypothesis observes that most objects die shortly after allocation. The JVM divides Heap space into Young Generation (Eden + Survivor Spaces S0/S1) and Old (Tenured) Generation. While G1GC balances throughput and latency with ~100-200ms pauses, <strong>Generational ZGC (Java 21)</strong> guarantees pause times below <strong>1 millisecond</strong> even on multi-terabyte heaps.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Production JVM Flags for High-Throughput Microservices</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># High-Performance Java 21 Container Flags
java -XX:+UseZGC \\
     -XX:+ZGenerational \\
     -XX:MaxRAMPercentage=75.0 \\
     -XX:+ExitOnOutOfMemoryError \\
     -XX:+HeapDumpOnOutOfMemoryError \\
     -XX:HeapDumpPath=/var/log/dumps/oom.hprof \\
     -Xlog:gc*,safepoint=info:file=/var/log/gc.log:time,uptime,pid:filecount=5,filesize=50M \\
     -jar app.jar</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Generational ZGC in Java 21 achieves sub-millisecond maximum pause times regardless of heap size.</li>
      <li>Always configure <code>-XX:+HeapDumpOnOutOfMemoryError</code> to capture forensic evidence during catastrophic memory leaks.</li>
      <li>Safepoints are execution points where JVM pauses application threads to perform runtime maintenance.</li>
      <li>Metaspace stores class metadata in native OS memory; set <code>-XX:MaxMetaspaceSize</code> to prevent unbounded host memory growth.</li>
      <li>Use Eclipse Memory Analyzer (MAT) or JProfiler to inspect object reference retention paths causing OutOfMemoryError.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 30 ──
    {
      id: "CH-JFS-030",
      courseId: "CRS-JFS-001",
      sequence: 30,
      title: "Enterprise Application Security Engineering & OWASP Top 10 for Java",
      description: "OWASP Top 10 mitigations in Spring Boot, broken access controls, SSRF defense, cryptographic best practices, secure HTTP headers, and dependency vulnerability scanning.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 30</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Enterprise Application Security & OWASP Defense</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Security is not a final checklist step—it is a continuous engineering discipline. Modern enterprise backends face relentless automated attacks, data-harvesting bots, and sophisticated injection exploits. You will learn to harden Spring Boot backends against the complete OWASP Top 10.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Defending Against Insecure Direct Object References (IDOR)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// VULNERABLE: Direct access by path variable allows any user to read any invoice!
// @GetMapping("/invoices/{id}") public Invoice getInvoice(@PathVariable String id) { return repo.findById(id); }

// HARDENED: Verify that the requesting principal owns the target resource
@GetMapping("/invoices/{id}")
@PreAuthorize("@securityEvaluator.canAccessInvoice(authentication, #id)")
public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable String id) {
    Invoice invoice = invoiceService.getById(id);
    return ResponseEntity.ok(InvoiceMapper.toResponse(invoice));
}

@Component("securityEvaluator")
public class SecurityEvaluator {
    public boolean canAccessInvoice(Authentication auth, String invoiceId) {
        String currentUserId = auth.getName();
        return invoiceRepository.existsByIdAndUserId(invoiceId, currentUserId) 
            || auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>IDOR (Broken Object-Level Authorization) is the #1 API vulnerability; always verify ownership of resources.</li>
      <li>Enforce strict Content Security Policy (CSP), Strict-Transport-Security (HSTS), and X-Frame-Options headers.</li>
      <li>Never log plaintext passwords, credit cards, or JWT tokens in application log files.</li>
      <li>Implement automated software composition analysis (OWASP Dependency-Check / Snyk) to block compromised transitive libraries.</li>
      <li>Validate and restrict outbound URLs made by server-side processes to prevent Server-Side Request Forgery (SSRF).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 31 ──
    {
      id: "CH-JFS-031",
      courseId: "CRS-JFS-001",
      sequence: 31,
      title: "High-Scale Distributed System Design: Rate Limiting, Sharding & CAP Trade-Offs",
      description: "Distributed system foundations, Token Bucket rate limiting, database read replicas, horizontal partitioning (sharding), consistent hashing, and designing resilient high-throughput architectures.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 31</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">High-Scale Distributed System Design</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Designing systems that gracefully handle 100,000+ requests per second requires understanding fundamental trade-offs between consistency, availability, latency, and cost. In this chapter, you will master the architecture of distributed rate limiters, database sharding, and scalable message topologies.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/SqsR-_ltLMQ" title="System Design Interview Concepts" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Distributed Rate Limiting with Redis & Token Bucket</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">To protect downstream microservices from denial-of-service spikes, the API Gateway runs a <strong>Token Bucket</strong> or <strong>Sliding Window Log</strong> algorithm implemented via Redis Lua scripts, guaranteeing atomic token decrement across clustered gateway nodes.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Horizontal scaling (adding nodes) is preferred over vertical scaling (larger servers) for elasticity.</li>
      <li>Database sharding horizontally partitions massive tables across multiple database instances using a shard key.</li>
      <li>Consistent hashing minimizes data relocation when caching nodes are dynamically added or removed.</li>
      <li>Asynchronous decoupled messaging via Kafka or RabbitMQ absorbs sudden traffic spikes, preventing cascading outages.</li>
      <li>Embrace Eventual Consistency in distributed domains where absolute real-time ACID locks destroy availability.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 32 ──
    {
      id: "CH-JFS-032",
      courseId: "CRS-JFS-001",
      sequence: 32,
      title: "Enterprise Design Patterns in Java: Gang of Four (GoF) & Domain-Driven Design (DDD)",
      description: "Creational (Builder, Factory, Singleton), Structural (Adapter, Decorator, Facade), Behavioral (Strategy, Observer, Template Method), and DDD aggregates & entities.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 32</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Design Patterns in Modern Java & Domain-Driven Design</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Design patterns are time-tested templates for solving recurring software engineering challenges. Combined with Domain-Driven Design (DDD), they establish an ubiquitous language and maintain clean boundaries between complex enterprise business domains and external infrastructure.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Strategy Pattern with Spring Dependency Injection</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>public interface DiscountStrategy {
    boolean appliesTo(CustomerTier tier);
    BigDecimal calculateDiscount(BigDecimal orderTotal);
}

@Service
public class CheckoutService {
    // Spring automatically injects ALL implementations into a List!
    private final List<DiscountStrategy> discountStrategies;

    public CheckoutService(List<DiscountStrategy> discountStrategies) {
        this.discountStrategies = discountStrategies;
    }

    public BigDecimal computeFinalPrice(Order order, CustomerTier tier) {
        DiscountStrategy strategy = discountStrategies.stream()
            .filter(s -> s.appliesTo(tier))
            .findFirst()
            .orElse(new NoDiscountStrategy());
        return order.getTotal().subtract(strategy.calculateDiscount(order.getTotal()));
    }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Strategy pattern enables swapping algorithms dynamically at runtime without modifying client code (Open/Closed Principle).</li>
      <li>Builder pattern creates complex immutable objects cleanly without telescoping constructor anti-patterns.</li>
      <li>Observer pattern decouples state changes from dependent actions (embodied by Spring ApplicationEventPublisher).</li>
      <li>Domain-Driven Design (DDD) separates Rich Domain Models from Anemic DTOs, keeping core business rules pure.</li>
      <li>Avoid over-engineering: apply patterns only to solve tangible complexity, not preemptively.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 33 ──
    {
      id: "CH-JFS-033",
      courseId: "CRS-JFS-001",
      sequence: 33,
      title: "Production Observability: OpenTelemetry, Prometheus, Grafana & Structured Logging",
      description: "The Three Pillars of Observability (Metrics, Logs, Traces), SLF4J structured JSON logging with correlation IDs, Micrometer, Prometheus scraping, and Grafana dashboard alerting.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 33</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Production Observability: Metrics, Traces & Logs</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">You cannot fix what you cannot observe. When a distributed microservice experiences latent degradation at 2:00 AM, observability tools allow engineering teams to pinpoint the exact failing SQL query, third-party timeout, or memory spike in seconds.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 3 Pillars of Observability in Spring Boot 3</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:14px;border-radius:8px;">
      <h4 style="margin-top:0;color:#0284c7;">1. Structured Logs</h4>
      <p style="font-size:12px;line-height:1.5;color:#334155;">JSON logs with <code>traceId</code>, <code>spanId</code>, <code>userId</code>, and timestamp ingested by Elasticsearch/Loki.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:14px;border-radius:8px;">
      <h4 style="margin-top:0;color:#16a34a;">2. Metrics</h4>
      <p style="font-size:12px;line-height:1.5;color:#334155;">Micrometer gauges and timers scraped by Prometheus and visualized in Grafana dashboards.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:14px;border-radius:8px;">
      <h4 style="margin-top:0;color:#ea580c;">3. Distributed Tracing</h4>
      <p style="font-size:12px;line-height:1.5;color:#334155;">OpenTelemetry traces visualizing the exact latency timeline of cross-service HTTP calls.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Enable Spring Boot Actuator (<code>/actuator/health</code>, <code>/actuator/prometheus</code>) for container readiness probes.</li>
      <li>Output logs as structured JSON format for automated ingestion and search indexing by log aggregators.</li>
      <li>Micrometer automatically instruments HTTP request latencies, JVM memory, and HikariCP connection pool usage.</li>
      <li>Distributed tracing with OpenTelemetry passes W3C TraceContext headers across HTTP boundaries.</li>
      <li>Define actionable alert thresholds based on SLIs/SLOs (e.g., P99 latency &gt; 500ms for 3 consecutive minutes).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 34 ──
    {
      id: "CH-JFS-034",
      courseId: "CRS-JFS-001",
      sequence: 34,
      title: "Comprehensive Capstone Project: End-to-End Enterprise E-Commerce Platform",
      description: "Architecting, implementing, and deploying a production-grade full-stack platform: Spring Boot 3 microservices, PostgreSQL, Redis caching, React 19 SPA, and Stripe payment integration.",
      contentType: "Rich Text",
      durationMinutes: 60,
      minimumTimeMinutes: 30,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 34</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Capstone Project: Enterprise E-Commerce Platform</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In this capstone, you will synthesize everything you have mastered across all 33 previous chapters. You will build and deploy a complete commercial-grade enterprise e-commerce system featuring authentication, product catalog with Redis caching, transactional shopping cart, order state machine, payment processing with Stripe webhooks, and an intuitive React 19 frontend.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. System Architecture Overview</h2>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:20px;border-radius:8px;font-family:monospace;font-size:13px;line-height:1.8;">
    <strong>Frontend:</strong> React 19 + TypeScript + Vite + Tailwind CSS + TanStack Query<br>
    <strong>API Gateway:</strong> Spring Cloud Gateway (JWT validation, rate limiting, routing)<br>
    <strong>Product Service:</strong> Spring Boot 3 + PostgreSQL + Redis (Sub-5ms catalog reads)<br>
    <strong>Order Service:</strong> Spring Boot 3 + PostgreSQL + Optimistic Locking (Inventory concurrency)<br>
    <strong>Payment Service:</strong> Stripe Webhook verification + Idempotent settlement records<br>
    <strong>Deployment:</strong> Multi-stage Docker + GitHub Actions CI + AWS ECS Fargate
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Capstone projects must simulate production realities: idempotency, network failure recovery, and concurrency locks.</li>
      <li>Use optimistic locking (<code>@Version</code>) in JPA to prevent inventory overselling during flash-sale rushes.</li>
      <li>Verify payment provider webhook cryptographic signatures to guarantee payload authenticity.</li>
      <li>Deliver complete automated integration test coverage verifying the complete checkout user journey.</li>
      <li>Publish project artifacts to GitHub with professional architectural diagrams and clean setup documentation.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 35 ──
    {
      id: "CH-JFS-035",
      courseId: "CRS-JFS-001",
      sequence: 35,
      title: "Career Acceleration: System Design Interview Mastery, Live Coding & Tech Leadership",
      description: "Mastering the senior technical interview loop, whiteboarding distributed systems, live coding strategy, portfolio engineering, resume optimization, and executive communication.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 35</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Career Acceleration: Interviews & Technical Leadership</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Congratulations on reaching the final chapter of the Java Full Stack Developer Program! Having acquired world-class engineering capabilities, this capstone chapter focuses on translating your expertise into top-tier career outcomes: acing Senior Full Stack interview loops, articulating architectural trade-offs, and demonstrating technical leadership.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4-Step System Design Interview Framework</h2>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:20px;border-radius:8px;font-family:sans-serif;font-size:14px;line-height:1.8;">
    <p><strong>Step 1: Scope & Clarify Requirements (5 mins):</strong> Clarify functional requirements (e.g., top 3 user actions) and non-functional requirements (DAU, read-to-write ratio, P99 latency target, CAP priority).</p>
    <p><strong>Step 2: High-Level Architecture (10 mins):</strong> Draw client, CDN, load balancer, API gateway, microservice boundaries, primary/replica database, and cache.</p>
    <p><strong>Step 3: Deep Dive into Bottlenecks (20 mins):</strong> Data modeling, concurrency resolution, database sharding key selection, cache invalidation, and failure modes.</p>
    <p><strong>Step 4: Wrap-up & Trade-offs (5 mins):</strong> Summarize bottlenecks, operational monitoring, and architectural compromises made.</p>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>During technical interviews, communicate your thought process aloud before writing code or diagrams.</li>
      <li>Never guess in interviews; ask clarifying questions about traffic scale, consistency needs, and failure recovery.</li>
      <li>Structure your resume bullet points around measurable business impact (e.g., 'Reduced P99 latency by 45% using Redis caching').</li>
      <li>Maintain an active GitHub profile showcasing production-grade code with unit tests, CI workflows, and architecture documentation.</li>
      <li>Continuous learning is the mark of a true software craftsman: stay curious, experiment often, and mentor others.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 5 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-JFS-029",
      title: "JVM Internals & GC Tuning Assessment",
      chapterId: "CH-JFS-029",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-029-01", type: "MCQ", prompt: "What is the primary design target of the Z Garbage Collector (ZGC) in modern Java?", options: ["Maximum throughput at the cost of long pauses", "Ultra-low latency with pause times guaranteed under 1 millisecond regardless of heap size", "Running on floppy disks", "Executing without CPU"], answer: 1, points: 10 },
        { id: "Q-JFS-029-02", type: "MCQ", prompt: "What is the Weak Generational Hypothesis?", options: ["All objects live forever", "Most allocated objects have short lifespans and die shortly after creation", "Generational GC is obsolete", "Java cannot allocate objects on heap"], answer: 1, points: 10 },
        { id: "Q-JFS-029-03", type: "MCQ", prompt: "What JVM flag ensures a memory heap dump is automatically written to disk when an OutOfMemoryError occurs?", options: ["-XX:+HeapDumpOnOutOfMemoryError", "-XX:+SaveMemoryNow", "-Xdump:all", "-XX:CaptureMemory"], answer: 0, points: 10 },
        { id: "Q-JFS-029-04", type: "MCQ", prompt: "Where is class metadata, bytecode instructions, and method definitions stored in Java 8 and newer?", options: ["PermGen (inside Java heap)", "Metaspace (in native operating system memory)", "L1 CPU cache", "On the hard drive swap partition"], answer: 1, points: 10 },
        { id: "Q-JFS-029-05", type: "MCQ", prompt: "What is a JVM Safepoint?", options: ["A firewall rule", "A point in program execution where all application threads are safely stopped so the JVM can perform stop-the-world GC or profiling operations", "A secure socket connection", "A disk backup checkpoint"], answer: 1, points: 10 },
        { id: "Q-JFS-029-06", type: "MCQ", prompt: "What tool allows analyzing `.hprof` heap dump files to diagnose memory leaks and object retention paths?", options: ["Eclipse Memory Analyzer (MAT) or JProfiler", "Notepad", "Postman", "Maven"], answer: 0, points: 10 },
        { id: "Q-JFS-029-07", type: "MCQ", prompt: "What do the C1 and C2 JIT compilers do in the HotSpot JVM tiered compilation pipeline?", options: ["C1 provides fast compilation with basic optimization; C2 provides heavily optimized machine code for hot methods", "C1 compiles C++; C2 compiles Java", "C1 runs on mobile; C2 on desktop", "They are legacy compilers replaced by Python"], answer: 0, points: 10 },
        { id: "Q-JFS-029-08", type: "MCQ", prompt: "Why does an unclosed `ThreadLocal` variable cause serious memory leaks in web servers like Tomcat?", options: ["ThreadLocal variables hold references tied to reusable thread pool threads, preventing entire classloaders and web contexts from being garbage collected", "ThreadLocal deletes CPU registers", "ThreadLocal writes infinite logs to disk", "ThreadLocal corrupts the network card"], answer: 0, points: 10 },
        { id: "Q-JFS-029-09", type: "MCQ", prompt: "What JVM flag configures the maximum heap size to dynamically adapt to 75% of available container RAM?", options: ["-XX:MaxRAMPercentage=75.0", "-Xmx75%", "-XX:ContainerRAM=75", "-Xram:75"], answer: 0, points: 10 },
        { id: "Q-JFS-029-10", type: "MCQ", prompt: "What Garbage Collector was default in Java 11 through Java 21 for general server workloads?", options: ["Serial GC", "Parallel GC", "G1 (Garbage-First) GC", "CMS (Concurrent Mark Sweep)"], answer: 2, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-030",
      title: "Enterprise Security & OWASP Assessment",
      chapterId: "CH-JFS-030",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-030-01", type: "MCQ", prompt: "What is an Insecure Direct Object Reference (IDOR)?", options: ["When an application uses user-supplied input to access an internal database object directly without verifying the user's authorization to that specific record", "A null pointer exception", "A broken CSS image link", "A slow database query"], answer: 0, points: 10 },
        { id: "Q-JFS-030-02", type: "MCQ", prompt: "What security vulnerability occurs when an attacker tricks a backend server into making unauthorized HTTP requests to internal network services?", options: ["SQL Injection", "Server-Side Request Forgery (SSRF)", "Cross-Site Scripting (XSS)", "Buffer Overflow"], answer: 1, points: 10 },
        { id: "Q-JFS-030-03", type: "MCQ", prompt: "What HTTP response header instructs the browser never to load the application inside an `<iframe>` (preventing Clickjacking)?", options: ["X-Frame-Options: DENY", "Content-Type: text/html", "Access-Control-Allow-Origin: *", "Cache-Control: no-cache"], answer: 0, points: 10 },
        { id: "Q-JFS-030-04", type: "MCQ", prompt: "What is the purpose of HTTP Strict Transport Security (HSTS)?", options: ["Forces browsers to communicate with the server exclusively over encrypted HTTPS connections, preventing SSL stripping attacks", "Validates HTML templates", "Accelerates file downloads", "Encrypts local cookies"], answer: 0, points: 10 },
        { id: "Q-JFS-030-05", type: "MCQ", prompt: "Why should sensitive data like passwords and credit card numbers never be logged in application log files?", options: ["Log files are frequently aggregated to third-party monitoring platforms where unauthorized staff or breach vectors could access plaintext credentials", "It increases hard drive usage", "It slows down CPU clock speed", "Logback throws an error"], answer: 0, points: 10 },
        { id: "Q-JFS-030-06", type: "MCQ", prompt: "What security tool performs Software Composition Analysis (SCA) to detect known CVEs in third-party Maven dependencies?", options: ["OWASP Dependency-Check / Snyk", "JUnit", "Lombok", "Mockito"], answer: 0, points: 10 },
        { id: "Q-JFS-030-07", type: "MCQ", prompt: "What does the `SameSite=Strict` cookie attribute prevent?", options: ["Cross-Site Request Forgery (CSRF) by preventing the browser from sending the cookie with any cross-site request", "Cross-site styling issues", "Cookie expiration", "Memory leaks in Chrome"], answer: 0, points: 10 },
        { id: "Q-JFS-030-08", type: "MCQ", prompt: "What defense should always be applied when accepting XML input from external clients?", options: ["Disabling external entity resolution (XXE prevention)", "Converting XML to binary", "Allowing all DTDs", "Writing XML to disk"], answer: 0, points: 10 },
        { id: "Q-JFS-030-09", type: "MCQ", prompt: "What cryptographic standard is recommended for modern symmetric data-at-rest encryption?", options: ["DES", "AES-256-GCM (Authenticated Encryption)", "RC4", "MD5"], answer: 1, points: 10 },
        { id: "Q-JFS-030-10", type: "MCQ", prompt: "What is the Principle of Least Privilege in system architecture?", options: ["Granting every user and service account only the minimum permissions necessary to perform their required tasks", "Allowing all developers root access", "Setting all file permissions to 777", "Disabling authentication in staging"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-031",
      title: "Distributed System Design Assessment",
      chapterId: "CH-JFS-031",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-031-01", type: "MCQ", prompt: "What is the CAP Theorem trade-off when a network partition (P) occurs between distributed nodes?", options: ["The system must trade off between Consistency (C) and Availability (A)", "The system automatically gains infinite speed", "The database drops all tables", "Network partitions are impossible in cloud environments"], answer: 0, points: 10 },
        { id: "Q-JFS-031-02", type: "MCQ", prompt: "What algorithm is commonly used for distributed rate limiting across multiple API Gateway instances?", options: ["Token Bucket / Leaky Bucket (using Redis atomic Lua scripts)", "Binary Search", "Dijkstra's Algorithm", "Quicksort"], answer: 0, points: 10 },
        { id: "Q-JFS-031-03", type: "MCQ", prompt: "What is the primary benefit of Consistent Hashing in distributed caching tiers?", options: ["When cache nodes are added or removed, only a minimal fraction of keys need to be remapped to different servers", "It encrypts all cached strings", "It guarantees zero memory usage", "It runs on relational databases only"], answer: 0, points: 10 },
        { id: "Q-JFS-031-04", type: "MCQ", prompt: "What is database sharding?", options: ["Horizontally partitioning a database table across multiple independent physical database instances based on a shard key", "Compressing database backups", "Deleting old records", "Replicating data to a single standby"], answer: 0, points: 10 },
        { id: "Q-JFS-031-05", type: "MCQ", prompt: "What is the difference between Synchronous and Asynchronous communication between microservices?", options: ["Synchronous (HTTP/gRPC) blocks waiting for immediate response; Asynchronous (Kafka/RabbitMQ) sends messages decoupled without blocking", "Synchronous is faster always", "Asynchronous only works in single-threaded apps", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-JFS-031-06", type: "MCQ", prompt: "What is the role of a Read Replica in relational database scaling?", options: ["Handles read-only SELECT queries asynchronously replicated from the Primary database, offloading read saturation", "Replaces the primary database for write transactions", "Stores deleted records only", "Monitors server fan speed"], answer: 0, points: 10 },
        { id: "Q-JFS-031-07", type: "MCQ", prompt: "What does Idempotency mean in API design?", options: ["Making multiple identical requests produces the exact same server state and outcome as making a single request", "An API that only accepts JSON", "An API with no parameters", "An encrypted endpoint"], answer: 0, points: 10 },
        { id: "Q-JFS-031-08", type: "MCQ", prompt: "What is a Content Delivery Network (CDN) primarily used for?", options: ["Caching and serving static assets (images, JavaScript, CSS) from geographically distributed edge servers near end users", "Executing Java business logic", "Managing database transactions", "Generating PDF reports"], answer: 0, points: 10 },
        { id: "Q-JFS-031-09", type: "MCQ", prompt: "What is the purpose of a Dead Letter Queue (DLQ) in message-driven systems?", options: ["To hold messages that failed processing after reaching the maximum retry threshold, isolating them for forensic debugging", "To delete messages instantly", "To speed up message delivery", "To encrypt message payloads"], answer: 0, points: 10 },
        { id: "Q-JFS-031-10", type: "MCQ", prompt: "What is Eventual Consistency?", options: ["A consistency model where all replicas are guaranteed to converge to the same data state eventually given sufficient time without new updates", "Data is never consistent", "Data is immediately consistent across all nodes within 0 nanoseconds", "Only works on single node databases"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-032",
      title: "Design Patterns in Java Assessment",
      chapterId: "CH-JFS-032",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-032-01", type: "MCQ", prompt: "What GoF pattern family do Singleton, Factory, and Builder belong to?", options: ["Creational Patterns", "Structural Patterns", "Behavioral Patterns", "Concurrency Patterns"], answer: 0, points: 10 },
        { id: "Q-JFS-032-02", type: "MCQ", prompt: "What problem does the Builder Pattern solve?", options: ["Avoiding telescoping constructors with numerous parameters, enabling clean construction of immutable objects", "Speeding up CPU execution", "Connecting to SQL databases", "Replacing inheritance completely"], answer: 0, points: 10 },
        { id: "Q-JFS-032-03", type: "MCQ", prompt: "What pattern allows an algorithm's behavior to be selected dynamically at runtime (e.g., swapping payment gateways)?", options: ["Strategy Pattern", "Singleton Pattern", "Adapter Pattern", "Proxy Pattern"], answer: 0, points: 10 },
        { id: "Q-JFS-032-04", type: "MCQ", prompt: "What pattern attaches additional responsibilities to an object dynamically without subclassing?", options: ["Decorator Pattern", "Facade Pattern", "Factory Pattern", "Flyweight Pattern"], answer: 0, points: 10 },
        { id: "Q-JFS-032-05", type: "MCQ", prompt: "What pattern provides a unified, simplified high-level interface to a complex subsystem of classes?", options: ["Facade Pattern", "Adapter Pattern", "Composite Pattern", "Bridge Pattern"], answer: 0, points: 10 },
        { id: "Q-JFS-032-06", type: "MCQ", prompt: "How does Spring Framework implement Transaction Management and Security annotations under the hood?", options: ["Dynamic Proxy Pattern (AOP - Aspect-Oriented Programming)", "Hardcoded byte patches", "Operating system hooks", "JVM command-line scripts"], answer: 0, points: 10 },
        { id: "Q-JFS-032-07", type: "MCQ", prompt: "What pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically?", options: ["Observer Pattern", "Command Pattern", "Memento Pattern", "State Pattern"], answer: 0, points: 10 },
        { id: "Q-JFS-032-08", type: "MCQ", prompt: "What pattern converts the interface of a class into another interface clients expect, enabling incompatible classes to work together?", options: ["Adapter Pattern", "Decorator Pattern", "Singleton Pattern", "Prototype Pattern"], answer: 0, points: 10 },
        { id: "Q-JFS-032-09", type: "MCQ", prompt: "What is an Anemic Domain Model anti-pattern in enterprise architectures?", options: ["Domain entity classes containing only getters and setters with zero business logic, while service classes contain all logic procedurally", "Classes with too much business logic", "Classes without databases", "Code written in old Java versions"], answer: 0, points: 10 },
        { id: "Q-JFS-032-10", type: "MCQ", prompt: "What is the Open/Closed Principle (the 'O' in SOLID)?", options: ["Software entities should be open for extension, but closed for modification", "Source code must be open-source", "All classes must be public", "Methods must be closed to parameters"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-033",
      title: "Production Observability Assessment",
      chapterId: "CH-JFS-033",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-033-01", type: "MCQ", prompt: "What are the Three Pillars of Observability in distributed systems?", options: ["Metrics, Logs, and Traces", "CPU, RAM, and Disk", "HTML, CSS, and JavaScript", "Security, Privacy, and Compliance"], answer: 0, points: 10 },
        { id: "Q-JFS-033-02", type: "MCQ", prompt: "What does Spring Boot Actuator provide?", options: ["Production-ready endpoints for inspecting health status, metrics, thread dumps, and environment configurations", "A testing framework", "A UI component library", "An IDE plugin"], answer: 0, points: 10 },
        { id: "Q-JFS-033-03", type: "MCQ", prompt: "Why should production logs be structured in JSON format rather than arbitrary raw text?", options: ["JSON logs are easily parsed, filtered, indexed, and aggregated by centralized monitoring systems like Elasticsearch, Loki, or Datadog", "JSON logs look prettier in terminal", "JSON saves 90% disk space", "Java only supports JSON"], answer: 0, points: 10 },
        { id: "Q-JFS-033-04", type: "MCQ", prompt: "What open standard provides vendor-neutral APIs and SDKs for instrumenting metrics, logs, and distributed traces?", options: ["OpenTelemetry (OTel)", "JUnit", "Spring Initializr", "Docker Hub"], answer: 0, points: 10 },
        { id: "Q-JFS-033-05", type: "MCQ", prompt: "What does Prometheus do in modern cloud infrastructure?", options: ["Pulls (scrapes) numerical time-series metrics from target application endpoints at regular intervals and stores them for querying via PromQL", "Hosts Docker images", "Manages database backups", "Sends marketing emails"], answer: 0, points: 10 },
        { id: "Q-JFS-033-06", type: "MCQ", prompt: "What visualization platform connects to Prometheus to render real-time dashboards and execute alert rules?", options: ["Grafana", "Figma", "WordPress", "Photoshop"], answer: 0, points: 10 },
        { id: "Q-JFS-033-07", type: "MCQ", prompt: "What is a Trace ID in distributed systems?", options: ["A globally unique identifier passed through HTTP headers that tracks a single user request across all participating downstream microservices", "A user's database ID", "A server IP address", "A Git commit hash"], answer: 0, points: 10 },
        { id: "Q-JFS-033-08", type: "MCQ", prompt: "What metric metric type in Micrometer tracks instantaneous values that can go up and down (e.g., active thread count, memory usage)?", options: ["Gauge", "Counter", "Timer", "DistributionSummary"], answer: 0, points: 10 },
        { id: "Q-JFS-033-09", type: "MCQ", prompt: "What is the difference between an SLI (Service Level Indicator) and an SLO (Service Level Objective)?", options: ["An SLI is the actual measured metric (e.g., 99.8% successful requests); an SLO is the agreed-upon target goal (e.g., >= 99.5% uptime)", "They are identical acronyms", "An SLI is a legal contract; an SLO is software code", "SLO is only for databases"], answer: 0, points: 10 },
        { id: "Q-JFS-033-10", type: "MCQ", prompt: "What does P99 Latency represent?", options: ["The latency threshold that 99% of all requests are faster than (measuring worst-case tail latency for 1% of users)", "Average latency of 99 users", "Latency measured in 1999", "Percentage of requests that failed"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-034",
      title: "Full-Stack Capstone Project Assessment",
      chapterId: "CH-JFS-034",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-034-01", type: "MCQ", prompt: "What JPA annotation implements Optimistic Locking to prevent concurrent inventory overselling during checkout rushes?", options: ["@Version", "@LockMode", "@SynchronizedEntity", "@ThreadSafe"], answer: 0, points: 10 },
        { id: "Q-JFS-034-02", type: "MCQ", prompt: "Why must payment gateway webhook endpoints verify cryptographic signatures (e.g., Stripe signature header)?", options: ["To guarantee that the webhook payload originated from the genuine payment provider and was not spoofed by an attacker", "To speed up processing", "Because JSON is unreadable without signatures", "To encrypt the database"], answer: 0, points: 10 },
        { id: "Q-JFS-034-03", type: "MCQ", prompt: "What HTTP header or unique key ensures payment requests are processed only once despite client retries?", options: ["Idempotency-Key", "Authorization", "User-Agent", "Accept-Encoding"], answer: 0, points: 10 },
        { id: "Q-JFS-034-04", type: "MCQ", prompt: "How should product catalog listings be cached in Redis for maximum performance?", options: ["Cached as serialized JSON strings with reasonable TTL, evicted or refreshed whenever product data is modified", "Stored permanently without expiration", "Cached in browser cookies only", "Stored on the database disk"], answer: 0, points: 10 },
        { id: "Q-JFS-034-05", type: "MCQ", prompt: "What architectural layer manages transactions and business rules across multiple repositories in Spring Boot?", options: ["Service Layer (@Service)", "Controller Layer (@RestController)", "Repository Layer (@Repository)", "Frontend View"], answer: 0, points: 10 },
        { id: "Q-JFS-034-06", type: "MCQ", prompt: "How should shopping cart state be managed across browser reloads for guest users before checkout?", options: ["Persisted in localStorage and synchronized with backend cart APIs upon user authentication", "Lost on every refresh", "Stored in URL query strings", "Stored in temporary text files on desktop"], answer: 0, points: 10 },
        { id: "Q-JFS-034-07", type: "MCQ", prompt: "What test strategy verifies that the React frontend and Spring Boot backend communicate correctly end-to-end?", options: ["End-to-End (E2E) integration tests using tools like Playwright or Cypress", "Unit testing private methods", "Manual clicking only", "Compiling bytecode"], answer: 0, points: 10 },
        { id: "Q-JFS-034-08", type: "MCQ", prompt: "What status should an Order entity have immediately after placement but before payment confirmation?", options: ["PENDING_PAYMENT", "COMPLETED", "SHIPPED", "CANCELLED"], answer: 0, points: 10 },
        { id: "Q-JFS-034-09", type: "MCQ", prompt: "What database constraint prevents two identical order items from being created with the same product ID in a single order?", options: ["UNIQUE composite constraint on (order_id, product_id)", "PRIMARY KEY on product_id", "CHECK constraint on price", "FOREIGN KEY only"], answer: 0, points: 10 },
        { id: "Q-JFS-034-10", type: "MCQ", prompt: "What deployment artifact packages the complete multi-tier capstone system for reproducible cloud hosting?", options: ["Docker Compose / Helm chart deploying containerized Spring Boot, React, PostgreSQL, and Redis containers", "A zip file of source code", "An email attachment", "A Word document"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-035",
      title: "Technical Leadership & System Design Interview Assessment",
      chapterId: "CH-JFS-035",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-035-01", type: "MCQ", prompt: "What should be the very first step in a Senior System Design interview?", options: ["Clarify functional and non-functional requirements and establish system constraints and scale estimates", "Start writing code immediately", "Draw database tables without asking questions", "Recommend Kubernetes"], answer: 0, points: 10 },
        { id: "Q-JFS-035-02", type: "MCQ", prompt: "Why is communicating trade-offs essential in senior engineering interviews?", options: ["In software architecture, there are no perfect solutions—only trade-offs between consistency, latency, cost, and complexity", "To talk as much as possible", "To avoid answering technical questions", "Interviewers require 10 trade-offs"], answer: 0, points: 10 },
        { id: "Q-JFS-035-03", type: "MCQ", prompt: "How should resume accomplishments be structured for senior engineering roles?", options: ["Context, Action taken, and Quantified Business Impact (e.g., 'Architected Redis cache layer reducing P99 latency by 60% and saving $12k/mo')", "Listing technology names with no context", "Writing paragraphs of job duties", "Copying job descriptions"], answer: 0, points: 10 },
        { id: "Q-JFS-035-04", type: "MCQ", prompt: "What is an effective strategy when encountering a live coding question you have not seen before?", options: ["Think out loud, state assumptions, talk through brute-force approach first, then optimize algorithm complexity before coding", "Stay silent for 20 minutes", "Give up immediately", "Start typing random syntax"], answer: 0, points: 10 },
        { id: "Q-JFS-035-05", type: "MCQ", prompt: "What distinguishes a Staff/Lead Engineer from a Senior Engineer?", options: ["Broad cross-team architectural vision, technical strategy, business alignment, and mentoring others to multiply impact", "Writing more lines of code", "Typing speed", "Managing Jira tickets exclusively"], answer: 0, points: 10 },
        { id: "Q-JFS-035-06", type: "MCQ", prompt: "What does an Architecture Decision Record (ADR) document in an engineering team?", options: ["The context, decision, consequences, and trade-offs of significant architectural choices for future engineering reference", "Employee salaries", "Customer complaint logs", "Meeting minutes"], answer: 0, points: 10 },
        { id: "Q-JFS-035-07", type: "MCQ", prompt: "How should code reviews be conducted to foster high engineering standards and positive team culture?", options: ["Focus on architectural correctness, security, and edge cases; explain rationale kindly and praise elegant solutions", "Nitpick formatting only", "Reject pull requests without explanations", "Approve everything without reading"], answer: 0, points: 10 },
        { id: "Q-JFS-035-08", type: "MCQ", prompt: "What is technical debt in a growing codebase?", options: ["The implied future cost of additional rework caused by choosing an easy or suboptimal solution now instead of a better approach", "Money owed to cloud providers", "Unused software licenses", "Old computer hardware"], answer: 0, points: 10 },
        { id: "Q-JFS-035-09", type: "MCQ", prompt: "What question should you always ask the engineering interview panel when given time at the end?", options: ["Thoughtful questions about team engineering culture, production incident post-mortems, and deployment frequency", "What time does work end?", "Can I work with no meetings ever?", "No questions"], answer: 0, points: 10 },
        { id: "Q-JFS-035-10", type: "MCQ", prompt: "What is the ultimate hallmark of a world-class Full Stack Java Architect?", options: ["The ability to take ambiguous business problems and design resilient, secure, scalable, maintainable full-stack systems that deliver sustained value", "Knowing every single JVM flag by heart", "Writing code in 10 languages", "Refusing to use libraries"], answer: 0, points: 10 },
      ]
    }
  ]
};

