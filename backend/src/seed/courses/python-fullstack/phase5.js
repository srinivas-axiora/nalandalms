// Phase 5: Mastery (Chapters 28 to 33) - Python Full Stack Developer
// High Performance, gRPC, Security, System Design, Capstone SaaS & Career Mastery.

export const phase5 = {
  chapters: [
    // ── Chapter 28 ──
    {
      id: "CH-PFS-028",
      courseId: "CRS-PFS-001",
      sequence: 28,
      title: "High-Performance Python: Cython, C-Extensions, PyPy & cProfile Optimization",
      description: "Bottleneck identification with cProfile and snakeviz, memory profiling with memory_profiler, compiling hot loops with Cython/Mypyc, and PyPy JIT compilation.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 28</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">High-Performance Python: Profiling, Cython & PyPy</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Senior architects never optimize code based on intuition—they profile. In this chapter, you will master scientific performance optimization: measuring execution hot spots with <code>cProfile</code>, compiling critical loops with <strong>Cython</strong> or <strong>Mypyc</strong> to achieve C-like speeds, and leveraging the PyPy JIT compiler.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Profiling Execution Hotspots with <code>cProfile</code></h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import cProfile
import pstats

def run_intensive_pipeline():
    # Process 100,000 analytics events
    pass

profiler = cProfile.Profile()
profiler.enable()
run_intensive_pipeline()
profiler.disable()

# Format top 10 bottlenecks sorted by cumulative execution time:
stats = pstats.Stats(profiler).sort_stats('cumulative')
stats.print_stats(10)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always profile before optimizing: 80% of execution time is typically consumed by 20% of your code.</li>
      <li>Use <code>cProfile</code> to track total calls and per-call execution time across function boundaries.</li>
      <li>Use <code>memory_profiler</code> to detect line-by-line memory leaks and unnecessary allocations.</li>
      <li><strong>Cython</strong> and <strong>Mypyc</strong> compile typed Python code directly into native C extension modules, yielding 10x-50x speedups.</li>
      <li><strong>PyPy</strong> provides an alternative JIT-compiler runtime for pure-Python long-running services without C extensions.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 29 ──
    {
      id: "CH-PFS-029",
      courseId: "CRS-PFS-001",
      sequence: 29,
      title: "Microservices & Event-Driven Architecture: gRPC, Protocol Buffers & RabbitMQ",
      description: "Inter-service communication, high-speed binary serialization with Protocol Buffers (proto3), gRPC client/server in Python, and event-driven messaging with RabbitMQ (Pika/AioPika).",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 29</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Microservices with gRPC, Protobuf & RabbitMQ</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In microservice architectures, HTTP/JSON serialization creates significant CPU and network overhead for internal service-to-service communication. <strong>gRPC</strong> utilizes compact binary <strong>Protocol Buffers</strong> over HTTP/2, reducing network bandwidth by 70% and latency by up to 5x compared to REST.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Defining gRPC Contracts in Protocol Buffers (<code>user.proto</code>)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>syntax = "proto3";

package nalanda.users.v1;

service UserService {
  rpc GetUserProfile (UserRequest) returns (UserResponse);
}

message UserRequest {
  string user_id = 1;
}

message UserResponse {
  string user_id = 1;
  string email = 2;
  string full_name = 3;
  string role = 4;
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Protocol Buffers serialize structured data into compact binary payloads far smaller and faster than JSON.</li>
      <li>gRPC operates over HTTP/2 multiplexed streams, supporting bidirectional streaming and header compression.</li>
      <li>Use RabbitMQ (via <code>aio-pika</code>) for asynchronous publish-subscribe event-driven domain messaging.</li>
      <li>gRPC contracts are strictly typed across languages, allowing Python services to interface seamlessly with Go and Java.</li>
      <li>Implement circuit breakers and dead letter exchanges (DLX) to handle message consumption failures reliably.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 30 ──
    {
      id: "CH-PFS-030",
      courseId: "CRS-PFS-001",
      sequence: 30,
      title: "Enterprise Application Security Engineering & OWASP Defense in Python",
      description: "OWASP Top 10 defense in Python backends, SQL injection prevention, SSRF mitigation, CORS hardening, secure headers, secrets management, and automated vulnerability scanning.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 30</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Enterprise Application Security & OWASP Defense</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Building enterprise systems requires defensive programming at every layer. You will learn to harden FastAPI and Django backends against the complete OWASP Top 10: Insecure Direct Object References (IDOR), Server-Side Request Forgery (SSRF), Cross-Site Scripting (XSS), and malicious pickle exploits.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Preventing Server-Side Request Forgery (SSRF)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import ipaddress
import urllib.parse

def validate_external_url(target_url: str) -> bool:
    parsed = urllib.parse.urlparse(target_url)
    if parsed.scheme not in ("http", "https"):
        return False
    
    # Resolve hostname to IP and verify it is NOT in private or loopback ranges:
    try:
        ip = ipaddress.ip_address(parsed.hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return False  # Blocks access to AWS metadata endpoint 169.254.169.254 or localhost!
    except ValueError:
        pass
    return True</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Never deserialize untrusted data with <code>pickle.loads()</code> due to critical Remote Code Execution vulnerabilities.</li>
      <li>Validate all outbound HTTP request targets to prevent SSRF attacks against internal cloud metadata endpoints.</li>
      <li>Verify object-level permissions (IDOR defense) on every single endpoint accessing private customer records.</li>
      <li>Enforce strict Content Security Policy (CSP), X-Frame-Options, and HSTS headers.</li>
      <li>Scan dependencies regularly with <code>pip-audit</code> and Bandit in CI/CD pipelines.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 31 ──
    {
      id: "CH-PFS-031",
      courseId: "CRS-PFS-001",
      sequence: 31,
      title: "High-Scale Distributed System Design in Python: Sharding, Rate Limiting & CAP Trade-Offs",
      description: "Distributed system architecture, sliding-window rate limiting with Redis Lua scripts, horizontal database sharding, caching strategies (Cache-Aside, Write-Through), and CAP trade-offs.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 31</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">High-Scale Distributed System Design in Python</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Scaling web services to millions of active users requires strategic architectural decisions around data storage, caching layers, and asynchronous messaging. In this chapter, you will master distributed caching strategies, atomic rate limiting, and database sharding patterns in Python.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/xpDnVSmNFX0" title="System Design Distributed Systems" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Atomic Sliding-Window Rate Limiting with Redis & Python</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import time
import redis.asyncio as redis

# Atomic Lua script executed directly inside Redis memory:
SLIDING_WINDOW_LUA = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clear_before = now - window

redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)
local current_count = redis.call('ZCARD', key)

if current_count < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
else
    return 0
end
"""</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Horizontal scaling (stateless API nodes behind load balancers) allows dynamic scaling based on CPU metrics.</li>
      <li>Use the Cache-Aside pattern with Redis to offload heavy read queries from relational databases.</li>
      <li>Atomic Redis Lua scripts prevent race conditions in distributed rate limiters across multi-worker clusters.</li>
      <li>Database sharding partitions large tables by a consistent shard key (e.g., <code>organization_id</code>).</li>
      <li>The CAP theorem dictates that during network partitions, systems must choose between Consistency or Availability.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 32 ──
    {
      id: "CH-PFS-032",
      courseId: "CRS-PFS-001",
      sequence: 32,
      title: "Comprehensive Capstone Project: Production-Grade AI-Integrated SaaS Platform",
      description: "Architecting and deploying a multi-tier SaaS platform: FastAPI backend, React 19 frontend, PostgreSQL, Redis caching, Celery task processing, and OpenAI/Gemini AI integration.",
      contentType: "Rich Text",
      durationMinutes: 60,
      minimumTimeMinutes: 30,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 32</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Capstone Project: Enterprise AI SaaS Platform</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In this capstone, you will integrate every concept mastered across the preceding 31 chapters into a production-grade commercial platform: a multi-tenant AI training content generator with FastAPI, React 19, asynchronous Celery workers, and LLM streaming.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Full-Stack System Architecture</h2>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:20px;border-radius:8px;font-family:monospace;font-size:13px;line-height:1.8;">
    <strong>Frontend:</strong> React 19 + TypeScript + Tailwind CSS + TanStack Query<br>
    <strong>API Gateway:</strong> FastAPI + Uvicorn + Pydantic v2 + OAuth2 JWT Auth<br>
    <strong>Persistence:</strong> PostgreSQL 16 (SQLAlchemy 2.0 Async + Alembic)<br>
    <strong>Cache & Broker:</strong> Redis 7 Cluster (Query caching, Rate limiting, Celery Broker)<br>
    <strong>Asynchronous Workers:</strong> Celery Workers + Celery Beat (Background AI generation)<br>
    <strong>Deployment:</strong> Multi-stage Docker + GitHub Actions CI + AWS ECS Fargate
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Capstone platforms must reflect real commercial engineering: multi-tenancy, rate limiting, and resilient error recovery.</li>
      <li>Stream AI responses from LLMs to the React frontend using Server-Sent Events (SSE) or WebSockets.</li>
      <li>Use Celery workers to handle heavy background ingestion, embedding generation, and vector indexing.</li>
      <li>Deliver 100% automated integration test coverage using Pytest and HTTPX before production deployment.</li>
      <li>Document project architecture cleanly on GitHub with setup instructions, diagrams, and API specifications.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 33 ──
    {
      id: "CH-PFS-033",
      courseId: "CRS-PFS-001",
      sequence: 33,
      title: "Career Acceleration: Senior Python Interview Mastery, Architecture & Leadership",
      description: "Mastering the senior Python technical interview loop, Python internals whiteboarding, algorithmic optimization, portfolio engineering, and executive communication.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Mastery • Chapter 33</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Career Acceleration: Senior Python Interviews & Leadership</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Congratulations on completing the Python Full Stack Developer Masterclass! In this final capstone chapter, you will learn to communicate your architectural expertise, navigate senior interview loops, demonstrate technical leadership, and negotiate compensation with confidence.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4 Dimensions of Senior Python Technical Interviews</h2>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:20px;border-radius:8px;font-family:sans-serif;font-size:14px;line-height:1.8;">
    <p><strong>1. Python Deep Internals:</strong> Be ready to explain CPython memory layout, reference counting vs cyclic GC, the GIL mechanics, and dunder protocols from first principles.</p>
    <p><strong>2. Distributed Systems Design:</strong> Explain trade-offs between REST and gRPC, horizontal scaling, Redis caching strategies, and database indexing.</p>
    <p><strong>3. Clean Code & Testing:</strong> Demonstrate mastery of type hints, Pytest fixtures, Mypy, and modular architecture separation.</p>
    <p><strong>4. Business & Leadership Impact:</strong> Quantify your accomplishments in terms of reduced latency, increased developer productivity, and cloud cost savings.</p>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Senior engineers are evaluated on architectural judgment and clear communication of trade-offs, not just syntax.</li>
      <li>Always communicate your problem-solving thoughts aloud during live coding sessions.</li>
      <li>Frame resume accomplishments using the Google XYZ formula: 'Accomplished [X], as measured by [Y], by doing [Z]'.</li>
      <li>Maintain an active GitHub portfolio with production-grade code, test suites, and clean documentation.</li>
      <li>Embrace continuous learning: software engineering mastery is a lifelong journey of curiosity and craftsmanship.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 5 (10 MCQs per chapter = 60 questions total) ──
  assessments: [
    {
      id: "ASM-PFS-028",
      title: "High-Performance Python Assessment",
      chapterId: "CH-PFS-028",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-028-01", type: "MCQ", prompt: "What standard library module provides deterministic profiling of Python programs?", options: ["cProfile", "timeit", "profile_fast", "trace_cpu"], answer: 0, points: 10 },
        { id: "Q-PFS-028-02", type: "MCQ", prompt: "What is Cython?", options: ["A programming language and compiler that translates typed Python code directly into highly optimized C extension modules", "A replacement for HTML", "A Python linter", "A database engine"], answer: 0, points: 10 },
        { id: "Q-PFS-028-03", type: "MCQ", prompt: "What is PyPy?", options: ["An alternative implementation of Python built with a Just-In-Time (JIT) compiler that dynamically compiles bytecode to machine code at runtime", "A package installer", "A text editor", "A Python documentation generator"], answer: 0, points: 10 },
        { id: "Q-PFS-028-04", type: "MCQ", prompt: "What tool visualizes `cProfile` output files as interactive flamegraphs and call trees in the browser?", options: ["SnakeViz", "Grafana", "Wireshark", "Tableau"], answer: 0, points: 10 },
        { id: "Q-PFS-028-05", type: "MCQ", prompt: "What compiler from the Mypy team compiles statically typed Python code into native C extension modules?", options: ["Mypyc", "Cython", "Numba", "GCC"], answer: 0, points: 10 },
        { id: "Q-PFS-028-06", type: "MCQ", prompt: "What JIT compiler specializes in accelerating numerical NumPy-heavy Python code on CPUs and GPUs?", options: ["Numba", "PyPy", "Pip", "Vite"], answer: 0, points: 10 },
        { id: "Q-PFS-028-07", type: "MCQ", prompt: "What package allows tracking line-by-line RAM consumption of a Python function?", options: ["memory_profiler", "cProfile", "tracemalloc only", "valgrind"], answer: 0, points: 10 },
        { id: "Q-PFS-028-08", type: "MCQ", prompt: "Why does PyPy sometimes run slower than CPython on programs that heavily use C-extension libraries like NumPy?", options: ["PyPy's cpyext compatibility layer must translate between PyPy and CPython object representations, creating overhead", "PyPy does not support C++", "PyPy has no garbage collection", "NumPy is deprecated on PyPy"], answer: 0, points: 10 },
        { id: "Q-PFS-028-09", type: "MCQ", prompt: "What Python 3.12 feature optimizes bytecode dispatch during runtime loops dynamically?", options: ["The Specializing Adaptive Interpreter", "The GIL remover", "Static compiling", "Garbage collection disabling"], answer: 0, points: 10 },
        { id: "Q-PFS-028-10", type: "MCQ", prompt: "What is the primary rule of software optimization according to Donald Knuth?", options: ["'Premature optimization is the root of all evil' (profile before optimizing)", "Always write code in C", "Never use libraries", "Optimize everything immediately"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-029",
      title: "Microservices & gRPC Assessment",
      chapterId: "CH-PFS-029",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-029-01", type: "MCQ", prompt: "What binary serialization format does gRPC use for transmitting structured data between microservices?", options: ["Protocol Buffers (Protobuf)", "JSON", "XML", "BSON"], answer: 0, points: 10 },
        { id: "Q-PFS-029-02", type: "MCQ", prompt: "What transport protocol does gRPC operate over?", options: ["HTTP/2", "HTTP/1.1", "WebSockets", "FTP"], answer: 0, points: 10 },
        { id: "Q-PFS-029-03", type: "MCQ", prompt: "What compiler compiles `.proto` schema files into Python client and server stub classes?", options: ["protoc (with grpc_tools.protoc)", "gcc", "poetry", "uvicorn"], answer: 0, points: 10 },
        { id: "Q-PFS-029-04", type: "MCQ", prompt: "Why is gRPC significantly faster than standard REST APIs?", options: ["Compact binary serialization and HTTP/2 multiplexed streaming eliminate JSON text parsing and TCP connection setup overhead", "It runs outside operating systems", "It deletes database queries", "It has no authentication"], answer: 0, points: 10 },
        { id: "Q-PFS-029-05", type: "MCQ", prompt: "What message broker protocol does RabbitMQ implement?", options: ["AMQP (Advanced Message Queuing Protocol)", "MQTT only", "STOMP only", "Kafka protocol"], answer: 0, points: 10 },
        { id: "Q-PFS-029-06", type: "MCQ", prompt: "What Python library provides asynchronous RabbitMQ integration for AsyncIO applications?", options: ["aio-pika", "pika (synchronous)", "rabbit-async", "amqp-py"], answer: 0, points: 10 },
        { id: "Q-PFS-029-07", type: "MCQ", prompt: "What is an Exchange in RabbitMQ messaging?", options: ["A message routing agent that receives messages from publishers and routes them to queues based on routing keys and bindings", "A currency converter", "A database shard", "A network router"], answer: 0, points: 10 },
        { id: "Q-PFS-029-08", type: "MCQ", prompt: "What is a Dead Letter Exchange (DLX) used for in RabbitMQ?", options: ["Routing messages that failed processing (e.g., after maximum retries or message expiration) to a dead-letter queue for forensic inspection", "Deleting spam messages", "Stopping servers", "Encrypting passwords"], answer: 0, points: 10 },
        { id: "Q-PFS-029-09", type: "MCQ", prompt: "What gRPC streaming pattern allows both client and server to send continuous streams of messages concurrently over a single connection?", options: ["Bidirectional Streaming RPC", "Server Streaming RPC", "Client Streaming RPC", "Unary RPC"], answer: 0, points: 10 },
        { id: "Q-PFS-029-10", type: "MCQ", prompt: "What design pattern maintains transactional data consistency across distributed microservice boundaries without locking databases?", options: ["Saga Pattern", "Singleton Pattern", "Factory Pattern", "Proxy Pattern"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-030",
      title: "Application Security & OWASP Assessment",
      chapterId: "CH-PFS-030",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-030-01", type: "MCQ", prompt: "Why is loading untrusted data with Python's native `pickle.loads()` a catastrophic security hazard?", options: ["The pickle format can encode arbitrary callable objects, allowing attackers to execute arbitrary system shell commands (RCE) during deserialization", "Pickle causes memory fragmentation", "Pickle runs slowly", "Pickle requires root privileges"], answer: 0, points: 10 },
        { id: "Q-PFS-030-02", type: "MCQ", prompt: "What is an Insecure Direct Object Reference (IDOR) in an API?", options: ["When an API endpoint accesses a database record based on user-supplied ID parameters without verifying that the requesting user owns that resource", "A broken URL route", "A missing database index", "A slow query"], answer: 0, points: 10 },
        { id: "Q-PFS-030-03", type: "MCQ", prompt: "What security attack exploits server endpoints that fetch remote URLs to access internal network assets or AWS metadata (169.254.169.254)?", options: ["Server-Side Request Forgery (SSRF)", "SQL Injection", "Cross-Site Scripting (XSS)", "Clickjacking"], answer: 0, points: 10 },
        { id: "Q-PFS-030-04", type: "MCQ", prompt: "What static analysis security tool scans Python code specifically for common security anti-patterns (e.g., hardcoded secrets, shell=True)?", options: ["Bandit", "Pytest", "Mypy", "Ruff"], answer: 0, points: 10 },
        { id: "Q-PFS-030-05", type: "MCQ", prompt: "What parameter in `subprocess.run()` should be avoided when executing external commands with user input?", options: ["shell=True (vulnerable to command injection)", "capture_output=True", "text=True", "check=True"], answer: 0, points: 10 },
        { id: "Q-PFS-030-06", type: "MCQ", prompt: "What HTTP header forces modern browsers to communicate exclusively over HTTPS?", options: ["Strict-Transport-Security (HSTS)", "Content-Security-Policy", "X-Content-Type-Options", "Referrer-Policy"], answer: 0, points: 10 },
        { id: "Q-PFS-030-07", type: "MCQ", prompt: "Why should sensitive environment variables and credentials never be committed to Git repositories?", options: ["Public and private Git repositories are easily compromised, scanned by automated bots, and retain permanent historical commits", "Git cannot store strings", "It slows down git clones", "GitHub charges extra for secrets"], answer: 0, points: 10 },
        { id: "Q-PFS-030-08", type: "MCQ", prompt: "What tool checks Python dependencies for publicly disclosed CVE vulnerabilities in automated CI/CD?", options: ["pip-audit", "pip install", "black", "isort"], answer: 0, points: 10 },
        { id: "Q-PFS-030-09", type: "MCQ", prompt: "How should passwords always be compared in Python to prevent timing-attack side-channel leaks?", options: ["Using constant-time comparison functions like `secrets.compare_digest()`", "Using the `==` operator", "Using string length", "Using MD5 hashes"], answer: 0, points: 10 },
        { id: "Q-PFS-030-10", type: "MCQ", prompt: "What cookie attribute prevents browsers from sending cookies with cross-site requests, mitigating CSRF?", options: ["SameSite=Lax or SameSite=Strict", "HttpOnly", "Secure", "Domain"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-031",
      title: "Distributed System Design Assessment",
      chapterId: "CH-PFS-031",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-031-01", type: "MCQ", prompt: "What does the CAP Theorem state about distributed data systems during a network partition?", options: ["You must choose between Consistency (all nodes see the same data) and Availability (every request receives a non-error response)", "You can achieve all three simultaneously", "Performance is halved", "Databases become single-threaded"], answer: 0, points: 10 },
        { id: "Q-PFS-031-02", type: "MCQ", prompt: "What is the Cache-Aside pattern?", options: ["The application first attempts to read from cache; on a cache miss, it reads from the database and writes the result to cache for subsequent requests", "The database automatically updates the cache", "Data is never cached", "Cache is updated before database writes"], answer: 0, points: 10 },
        { id: "Q-PFS-031-03", type: "MCQ", prompt: "Why are Redis Lua scripts used for distributed rate limiting in Python web backends?", options: ["Redis executes Lua scripts atomically on a single thread, preventing race conditions between concurrent requests without heavy database locks", "Lua is written in Python", "Lua scripts compress images", "Lua replaces HTTP headers"], answer: 0, points: 10 },
        { id: "Q-PFS-031-04", type: "MCQ", prompt: "What is database horizontal sharding?", options: ["Distributing rows of a large table across multiple independent physical database instances based on a consistent shard key", "Backing up databases to S3", "Creating B-Tree indexes", "Compressing database files"], answer: 0, points: 10 },
        { id: "Q-PFS-031-05", type: "MCQ", prompt: "What is the primary role of a Read Replica database in relational scaling?", options: ["Handles read-only queries (SELECT) asynchronously replicated from the Primary instance, offloading read saturation", "Processes payment writes", "Stores deleted records", "Monitors network traffic"], answer: 0, points: 10 },
        { id: "Q-PFS-031-06", type: "MCQ", prompt: "What algorithm minimizes data remapping when cache servers are dynamically added or removed from a cluster?", options: ["Consistent Hashing", "Round Robin", "Binary Search", "Quicksort"], answer: 0, points: 10 },
        { id: "Q-PFS-031-07", type: "MCQ", prompt: "What is the Thundering Herd (Cache Stampede) problem?", options: ["When a popular cached key expires, and thousands of concurrent requests all hit the underlying database simultaneously to recompute it", "When Redis crashes", "When network cables fail", "When database disk fills up"], answer: 0, points: 10 },
        { id: "Q-PFS-031-08", type: "MCQ", prompt: "What architectural pattern ensures atomic database updates alongside message publishing to message brokers like RabbitMQ or Kafka?", options: ["Transactional Outbox Pattern", "Proxy Pattern", "Observer Pattern", "Builder Pattern"], answer: 0, points: 10 },
        { id: "Q-PFS-031-09", type: "MCQ", prompt: "What is an Idempotency Key in API design?", options: ["A unique client-supplied token that guarantees multiple retries of the same request result in exactly one execution", "A user's password", "An SSL certificate", "A session identifier"], answer: 0, points: 10 },
        { id: "Q-PFS-031-10", type: "MCQ", prompt: "What is Eventual Consistency?", options: ["A model where all replicas will converge to the exact same value eventually, given sufficient time without further updates", "Data is never consistent", "Immediate atomic consistency", "Single-node transactions only"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-032",
      title: "Full-Stack SaaS Capstone Assessment",
      chapterId: "CH-PFS-032",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-032-01", type: "MCQ", prompt: "What protocol is commonly used to stream real-time token-by-token AI responses from a FastAPI backend to a React UI?", options: ["Server-Sent Events (SSE) or WebSockets", "Standard HTTP POST with full buffering", "FTP", "SOAP"], answer: 0, points: 10 },
        { id: "Q-PFS-032-02", type: "MCQ", prompt: "How should multi-tenant customer data be segregated securely in PostgreSQL databases?", options: ["Via row-level security (RLS) or separate database schemas keyed by `tenant_id` on every query", "By storing all tenant data in a single global text file", "By using client-side filtering in React", "By relying on DNS"], answer: 0, points: 10 },
        { id: "Q-PFS-032-03", type: "MCQ", prompt: "What tool manages background asynchronous task scheduling and retries in the capstone architecture?", options: ["Celery with Redis", "Cron on the local developer machine", "JavaScript setTimeout", "A while-true loop"], answer: 0, points: 10 },
        { id: "Q-PFS-032-04", type: "MCQ", prompt: "What is the recommended method for verifying payment webhooks (e.g., Stripe) in FastAPI?", options: ["Validating the cryptographic HMAC signature header against the raw request byte payload using the webhook signing secret", "Trusting the client JSON blindly", "Checking the client IP address only", "Webhooks do not require verification"], answer: 0, points: 10 },
        { id: "Q-PFS-032-05", type: "MCQ", prompt: "What tool orchestrates the complete local full-stack development environment (FastAPI, React, PostgreSQL, Redis, Celery)?", options: ["Docker Compose", "Bash scripts with sleep calls", "Manual terminal windows", "VirtualBox VMs"], answer: 0, points: 10 },
        { id: "Q-PFS-032-06", type: "MCQ", prompt: "Why should API endpoints return Pydantic response models rather than raw database ORM entities?", options: ["To prevent sensitive internal attributes (password hashes, tenant secrets) from leaking to client responses", "Because databases cannot output JSON", "To slow down responses", "It is required by HTTP"], answer: 0, points: 10 },
        { id: "Q-PFS-032-07", type: "MCQ", prompt: "What is the purpose of Alembic in the production deployment of the capstone SaaS?", options: ["Automating forward database schema migrations reproducibly during deployment pipelines", "Running unit tests", "Generating React components", "Monitoring server CPU"], answer: 0, points: 10 },
        { id: "Q-PFS-032-08", type: "MCQ", prompt: "How do you achieve zero-downtime rolling deployments in cloud container environments like ECS or Cloud Run?", options: ["New container versions are spun up and verified via health probes before the load balancer redirects traffic from old containers", "By shutting down servers for 10 minutes", "By dropping the database", "By deleting the code repository"], answer: 0, points: 10 },
        { id: "Q-PFS-032-09", type: "MCQ", prompt: "What test suite runner verifies end-to-end integration across backend endpoints with test database isolation in Python?", options: ["Pytest (with testcontainers-python or transactional fixtures)", "Manual Postman clicking only", "Writing prints", "Compiling code"], answer: 0, points: 10 },
        { id: "Q-PFS-032-10", type: "MCQ", prompt: "What design pattern separates reading data from writing data in complex enterprise platforms?", options: ["CQRS (Command Query Responsibility Segregation)", "Model-View-Controller", "Factory Pattern", "Singleton"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-033",
      title: "Senior Python Interview & Leadership Assessment",
      chapterId: "CH-PFS-033",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-033-01", type: "MCQ", prompt: "What distinguishes a Staff or Lead Python Engineer from a mid-level developer?", options: ["System design vision, cross-team architectural trade-off analysis, mentoring, and delivering sustained business impact", "Typing speed in PyCharm", "Writing the most lines of code", "Knowing every single Python module by heart"], answer: 0, points: 10 },
        { id: "Q-PFS-033-02", type: "MCQ", prompt: "How should resume bullet points be structured to impress senior engineering hiring managers?", options: ["Using quantified impact: 'Accomplished [X], measured by [Y], by doing [Z]' (e.g., 'Reduced API latency by 65% by migrating to FastAPI and Redis caching')", "Listing tool names with no context", "Writing paragraphs of daily responsibilities", "Copying job postings"], answer: 0, points: 10 },
        { id: "Q-PFS-033-03", type: "MCQ", prompt: "What should you do first when given an ambiguous system design prompt in a technical interview?", options: ["Ask clarifying questions to determine scale (DAU, RPS), latency targets, and core functional constraints", "Immediately start drawing boxes", "Refuse to answer", "Write Python code"], answer: 0, points: 10 },
        { id: "Q-PFS-033-04", type: "MCQ", prompt: "What is an Architecture Decision Record (ADR)?", options: ["A lightweight document capturing an architectural decision, its historical context, and the trade-offs considered for future engineers", "An employee review form", "A financial receipt", "A bug report"], answer: 0, points: 10 },
        { id: "Q-PFS-033-05", type: "MCQ", prompt: "What is technical debt in a fast-growing software company?", options: ["The implied future cost of rework caused by choosing an expedient solution now instead of a better, extensible approach", "Unpaid cloud bills", "Expired software subscriptions", "Old office monitors"], answer: 0, points: 10 },
        { id: "Q-PFS-033-06", type: "MCQ", prompt: "How should senior engineers approach pull request code reviews?", options: ["Focus on architecture, edge cases, security, and maintainability; provide constructive suggestions and praise great work", "Nitpick variable spacing only", "Approve without reading", "Reject without feedback"], answer: 0, points: 10 },
        { id: "Q-PFS-033-07", type: "MCQ", prompt: "Why is thinking out loud critical during live coding interviews?", options: ["It reveals your problem-solving methodology, communication clarity, and ability to collaborate under pressure", "To distract the interviewer", "To use up the interview time", "It is required by law"], answer: 0, points: 10 },
        { id: "Q-PFS-033-08", type: "MCQ", prompt: "What is the best way to handle a question you do not know the answer to in a technical interview?", options: ["Be honest, articulate how you would investigate and solve it from first principles, and discuss related concepts you do know", "Make up a fake answer confidently", "Stay silent for 5 minutes", "End the interview"], answer: 0, points: 10 },
        { id: "Q-PFS-033-09", type: "MCQ", prompt: "What question should you ask the interview panel when invited to ask questions at the end?", options: ["Insightful questions about their engineering culture, technical debt management, and deployment rituals", "What time is lunch?", "Can I work with no meetings ever?", "No questions"], answer: 0, points: 10 },
        { id: "Q-PFS-033-10", type: "MCQ", prompt: "What is the ultimate hallmark of a world-class Python Full Stack Architect?", options: ["The ability to translate complex business challenges into resilient, maintainable, high-throughput systems that scale smoothly", "Knowing every single PEP standard number", "Refusing to use third-party libraries", "Writing 1,000-line functions"], answer: 0, points: 10 },
      ]
    }
  ]
};

