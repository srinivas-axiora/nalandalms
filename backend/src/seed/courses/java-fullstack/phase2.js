// Phase 2: Applied (Chapters 8 to 14) - Java Full Stack Developer
// Enterprise hands-on engineering from Lambdas & Concurrency to JDBC, Maven, JUnit & Git CI.

export const phase2 = {
  chapters: [
    // ── Chapter 8 ──
    {
      id: "CH-JFS-008",
      courseId: "CRS-JFS-001",
      sequence: 8,
      title: "Generics, Functional Programming, Lambdas & The Modern Stream API",
      description: "Generic bounds, type erasure, java.util.function interfaces, Stream pipeline mechanics (filter/map/reduce/collect), and parallel stream caveats.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 8</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Generics, Functional Programming & Modern Java Streams</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Java 8 introduced functional programming constructs that revolutionized data processing pipelines. In this chapter, you will transition from imperative step-by-step loops to declarative, composable stream pipelines with compile-time type safety via Generics.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/rPSL1alWNMg" title="Java Streams Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Generics & The PECS Principle (Producer Extends, Consumer Super)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Generics provide compile-time type checking and eliminate ugly casting. The JVM implements Generics via <strong>Type Erasure</strong>, stripping type parameters at bytecode generation to maintain backward compatibility with legacy Java 1.4 runtimes.</p>

  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// PECS Rule: Producer Extends, Consumer Super
// 1. Covariance (? extends T): Read-only from collection
public static double sumOfNumbers(List<? extends Number> numbers) {
    double sum = 0.0;
    for (Number n : numbers) {
        sum += n.doubleValue(); // Safe read
    }
    // numbers.add(10); // COMPILE ERROR! Cannot write to ? extends
    return sum;
}

// 2. Contravariance (? super T): Write-only into collection
public static void addIntegers(List<? super Integer> list) {
    list.add(100); // Safe write
    list.add(200);
}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The Core 4 Functional Interfaces</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#0f172a;color:#ffffff;text-align:left;">
        <th style="padding:10px;border:1px solid #334155;">Interface</th>
        <th style="padding:10px;border:1px solid #334155;">Method Signature</th>
        <th style="padding:10px;border:1px solid #334155;">Semantic Role & Enterprise Example</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>Predicate&lt;T&gt;</code></td><td style="padding:8px;border:1px solid #e2e8f0;"><code>boolean test(T t)</code></td><td style="padding:8px;border:1px solid #e2e8f0;">Filtering condition (e.g., <code>order -> order.isPaid()</code>)</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>Function&lt;T, R&gt;</code></td><td style="padding:8px;border:1px solid #e2e8f0;"><code>R apply(T t)</code></td><td style="padding:8px;border:1px solid #e2e8f0;">Transformation (e.g., <code>user -> user.getEmail()</code>)</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>Consumer&lt;T&gt;</code></td><td style="padding:8px;border:1px solid #e2e8f0;"><code>void accept(T t)</code></td><td style="padding:8px;border:1px solid #e2e8f0;">Side effect (e.g., <code>notification -> emailService.send(notification)</code>)</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>Supplier&lt;T&gt;</code></td><td style="padding:8px;border:1px solid #e2e8f0;"><code>T get()</code></td><td style="padding:8px;border:1px solid #e2e8f0;">Factory generation (e.g., <code>() -> UUID.randomUUID()</code>)</td></tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. Stream Pipeline in Action: Real Enterprise Example</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// Calculate Total Revenue grouped by Country for Completed Orders:
Map<String, Double> revenueByCountry = orders.stream()
    .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
    .filter(order -> order.getAmount() > 0)
    .collect(Collectors.groupingBy(
        Order::getCountryCode,
        Collectors.summingDouble(Order::getAmount)
    ));</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Generics use Type Erasure: generic type parameters exist only at compile time and are stripped in bytecode.</li>
      <li>Follow PECS: use <code>? extends T</code> when reading values, and <code>? super T</code> when putting values into collections.</li>
      <li>Streams are lazy: intermediate operations (<code>filter</code>, <code>map</code>) execute only when a terminal operation (<code>collect</code>, <code>reduce</code>) is invoked.</li>
      <li>Avoid using parallel streams on I/O-bound tasks as they share the global <code>ForkJoinPool.commonPool()</code>.</li>
      <li>Use <code>Optional&lt;T&gt;</code> as a return type to explicitly signal potential absence of values, preventing NullPointerExceptions.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 9 ──
    {
      id: "CH-JFS-009",
      courseId: "CRS-JFS-001",
      sequence: 9,
      title: "Enterprise File I/O, Object Serialization & Modern Java NIO.2",
      description: "Modern I/O patterns, java.nio.file.Path/Files, zero-copy memory-mapped buffers, serialization hazards, and real-time WatchService.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 9</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Enterprise File I/O, Serialization & Java NIO.2</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Data persistence and network data transfer depend on input/output subsystems. Traditional blocking I/O (<code>java.io</code>) allocates one thread per stream, whereas Java NIO (Non-blocking I/O) and NIO.2 (Java 7+) introduce OS-level zero-copy channels, memory-mapped buffers, and asynchronous event notifications.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Modern File Manipulation with <code>java.nio.file.Files</code></h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>Path logDir = Paths.get("logs", "audit");
if (!Files.exists(logDir)) {
    Files.createDirectories(logDir);
}

// Memory-efficient Stream processing of massive 10GB log files:
Path logFile = logDir.resolve("access.log");
try (Stream<String> lines = Files.lines(logFile, StandardCharsets.UTF_8)) {
    long errorCount = lines
        .filter(line -> line.contains("ERROR 500"))
        .count();
    System.out.println("Critical 500 Errors found: " + errorCount);
}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Java Serialization Security Hazards</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Java Native Serialization (<code>Serializable</code>) is widely recognized as one of the most dangerous vulnerabilities in enterprise history, enabling Remote Code Execution (RCE) gadget chains via unverified <code>readObject()</code> calls. Modern enterprise systems ban native Java object serialization in favor of JSON (Jackson), Protocol Buffers, or Avro.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always use <code>java.nio.file.Files</code> and <code>Path</code> instead of legacy <code>java.io.File</code>.</li>
      <li><code>Files.lines()</code> streams lines lazily without reading multi-gigabyte files entirely into heap memory.</li>
      <li>Never deserialize untrusted byte streams using native <code>ObjectInputStream</code> due to RCE gadget risks.</li>
      <li>NIO Channels and ByteBuffers enable zero-copy transfers directly between kernel page cache and network sockets.</li>
      <li>The <code>WatchService</code> API allows monitoring file system directories for real-time creation and modification events.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 10 ──
    {
      id: "CH-JFS-010",
      courseId: "CRS-JFS-001",
      sequence: 10,
      title: "Multithreading, Java Memory Model (JMM), Concurrency & Virtual Threads",
      description: "Thread lifecycle, race conditions, synchronized/volatile, ExecutorService, CompletableFuture, ConcurrentHashMap, and Java 21 Virtual Threads.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 10</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Multithreading, Concurrency & Java 21 Virtual Threads</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Concurrent programming enables systems to execute millions of operations simultaneously. Understanding the Java Memory Model (JMM), thread synchronization, lock-free data structures, and the revolutionary <strong>Virtual Threads (Project Loom)</strong> is mandatory for building high-scale backends.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5U_O_0fVbvg" title="Java Virtual Threads Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Platform Threads vs Java 21 Virtual Threads</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#0f172a;color:#ffffff;text-align:left;">
        <th style="padding:10px;border:1px solid #334155;">Feature</th>
        <th style="padding:10px;border:1px solid #334155;">Classic Platform Thread (OS Thread)</th>
        <th style="padding:10px;border:1px solid #334155;">Virtual Thread (Java 21 Project Loom)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;">Mapping</td><td style="padding:8px;border:1px solid #e2e8f0;">1:1 with Kernel OS Thread</td><td style="padding:8px;border:1px solid #e2e8f0;">M:N (Millions of virtual threads multiplexed on carrier pool)</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Memory Cost</td><td style="padding:8px;border:1px solid #e2e8f0;">~1MB to 2MB Stack allocated per thread</td><td style="padding:8px;border:1px solid #e2e8f0;">Few hundred bytes (Heap-allocated stack chunk)</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;">Creation Capacity</td><td style="padding:8px;border:1px solid #e2e8f0;">~2,000 to 5,000 threads max before OOM</td><td style="padding:8px;border:1px solid #e2e8f0;">1,000,000+ threads concurrently without crashing</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;">Blocking Behavior</td><td style="padding:8px;border:1px solid #e2e8f0;">Blocks OS thread during network/DB I/O</td><td style="padding:8px;border:1px solid #e2e8f0;">Unmounts from carrier thread during I/O block, frees carrier!</td></tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Spawning 100,000 Virtual Threads in Java 21</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// Launch 100,000 simultaneous simulated I/O calls:
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 100_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofMillis(100)); // Non-blocking unmount
            return "Task " + i + " finished";
        });
    });
} // Executor automatically waits for all 100k tasks to finish before closing!</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>volatile</code> guarantees memory visibility across threads and prevents instruction reordering.</li>
      <li><code>AtomicInteger</code> and atomic classes utilize hardware CAS (Compare-And-Swap) for lock-free concurrency.</li>
      <li><code>ConcurrentHashMap</code> uses internal bucket-level locking, providing high concurrent throughput over synchronized maps.</li>
      <li>Virtual Threads in Java 21 make the thread-per-request model ultra-scalable without reactive programming complexity.</li>
      <li>Avoid pinning virtual threads by replacing <code>synchronized</code> blocks around I/O with <code>ReentrantLock</code>.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 11 ──
    {
      id: "CH-JFS-011",
      courseId: "CRS-JFS-001",
      sequence: 11,
      title: "Relational Database Design, SQL Query Optimization & Robust JDBC with HikariCP",
      description: "Normalization rules, SQL indexes, SQL injection prevention with PreparedStatement, ACID transactions, and HikariCP connection pooling.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 11</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Relational Databases, SQL Optimization & High-Speed JDBC</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Full-stack backends depend on relational databases like PostgreSQL to store business truth. Understanding database normalization, index planning, transaction isolation, and enterprise connection pooling with HikariCP is crucial for enterprise stability.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/2bzsk5_v33o" title="JDBC and Database Connection Pooling" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. SQL Injection Prevention: Statement vs PreparedStatement</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// VULNERABLE: Direct string concatenation creates SQL Injection:
// String sql = "SELECT * FROM users WHERE email = '" + userEmail + "'";

// SAFE & OPTIMIZED: PreparedStatement compiles query template on database engine:
String sql = "SELECT id, name, balance FROM accounts WHERE user_id = ? AND status = ?";
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, userId);
    ps.setString(2, "ACTIVE");
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            System.out.printf("Account: %s | Balance: $%.2f%n", rs.getString("id"), rs.getDouble("balance"));
        }
    }
}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. ACID Transactions & Connection Pooling with HikariCP</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Creating a TCP handshake, TLS negotiation, and authentication handshake with PostgreSQL takes 20-50ms per request. <strong>HikariCP</strong> maintains a pre-warmed pool of active connections, reducing acquisition latency to sub-millisecond speeds.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always use <code>PreparedStatement</code> with parameter placeholders (<code>?</code>) to prevent SQL Injection.</li>
      <li>HikariCP is the gold standard connection pool in modern Java, bundled by default in Spring Boot.</li>
      <li>ACID transactions require setting <code>conn.setAutoCommit(false)</code> and explicit <code>commit()</code> / <code>rollback()</code>.</li>
      <li>B-Tree indexes speed up lookups from \(O(N)\) full table scans to \(O(\log N)\) traversals.</li>
      <li>Always close ResultSet, PreparedStatement, and Connection via try-with-resources to prevent pool exhaustion.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 12 ──
    {
      id: "CH-JFS-012",
      courseId: "CRS-JFS-001",
      sequence: 12,
      title: "Enterprise Build Automation: Apache Maven & Gradle Multi-Module Mastery",
      description: "Dependency resolution algorithms, pom.xml configuration, plugins, lifecycles, BOM imports, and multi-module repository architectures.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 12</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Build Automation: Apache Maven & Gradle Multi-Module Architecture</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Modern enterprise applications integrate hundreds of third-party libraries. Build automation tools manage dependencies, execute automated test suites, enforce code quality standards, and package deployable artifacts (JAR/WAR/Docker images).</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Maven Standard Lifecycle Phases</h2>
  <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:16px;border-radius:8px;font-family:monospace;font-size:13px;line-height:1.8;">
    <strong>validate</strong> &rarr; <strong>compile</strong> &rarr; <strong>test</strong> &rarr; <strong>package</strong> &rarr; <strong>verify</strong> &rarr; <strong>install</strong> &rarr; <strong>deploy</strong>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Multi-Module Project Structure</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>nalanda-enterprise-platform/
├── pom.xml                     (Parent POM: dependencies & pluginManagement)
├── common-dto/                 (Shared data contracts & domain events)
│   └── pom.xml
├── user-service/               (Spring Boot User Microservice)
│   └── pom.xml
├── order-service/              (Spring Boot Order Microservice)
│   └── pom.xml
└── notification-service/       (Kafka consumer service)
    └── pom.xml</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Maven follows 'Convention over Configuration' with standardized directory layouts (<code>src/main/java</code>, <code>src/test/java</code>).</li>
      <li>Transitive dependency conflicts are resolved using 'Nearest Definition Wins' in the dependency tree.</li>
      <li>Use <code>&lt;dependencyManagement&gt;</code> and Spring Boot BOM to align library versions across all microservice modules.</li>
      <li>Gradle uses an incremental build cache and Kotlin/Groovy DSL, offering significantly faster build times in massive codebases.</li>
      <li>Always run builds with the Maven Wrapper (<code>./mvnw</code>) or Gradle Wrapper (<code>./gradlew</code>) for reproducible CI builds.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 13 ──
    {
      id: "CH-JFS-013",
      courseId: "CRS-JFS-001",
      sequence: 13,
      title: "Unit Testing Mastery: JUnit 5, Mockito & Test-Driven Development (TDD)",
      description: "Test lifecycle, assertions, parameterized tests, test doubles (mocks vs stubs vs spies), verifying interactions with Mockito, and code coverage with JaCoCo.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 13</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Unit Testing, Mockito & Test-Driven Development</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Untested software is broken software. In high-stakes enterprise systems, automated regression test suites are the single barrier protecting production revenue from critical regressions. Master JUnit 5 and Mockito to build rock-solid code verification.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/AThsknfxLdA" title="JUnit 5 and Mockito Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Writing Isolated Unit Tests with Mockito</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("Should successfully process valid order and save to database")
    void testProcessOrderSuccess() {
        // Arrange
        Order sampleOrder = new Order("ORD-001", 150.00, "user@nalanda.edu");
        when(paymentGateway.charge(150.00)).thenReturn(new ChargeResult(true, "TX-999"));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        OrderResult result = orderService.process(sampleOrder);

        // Assert
        assertThat(result.isSuccess()).isTrue();
        verify(paymentGateway, times(1)).charge(150.00);
        verify(orderRepository).save(sampleOrder);
    }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>JUnit 5 separates API (Jupiter) from Engine, supporting modern lambdas and dynamic test generation.</li>
      <li>Mockito allows isolating the Unit Under Test (UUT) by stubbing external dependencies (databases, payment APIs).</li>
      <li>Follow the Arrange-Act-Assert (AAA) pattern for readable, maintainable test methods.</li>
      <li>Use parameterized tests (<code>@ParameterizedTest</code> + <code>@ValueSource</code>) to test multiple boundary inputs cleanly.</li>
      <li>Integrate JaCoCo in the build pipeline to enforce minimum branch and line coverage quality gates.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 14 ──
    {
      id: "CH-JFS-014",
      courseId: "CRS-JFS-001",
      sequence: 14,
      title: "Version Control Engineering with Git, GitHub Flow & Automated CI Workflows",
      description: "Git DAG internals, rebase vs merge, merge conflict resolution, pre-commit hooks, GitHub Actions CI pipelines, and semantic release versioning.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 14</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Version Control with Git, GitHub Flow & CI Automation</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Distributed version control is the backbone of team collaboration. Understanding Git internals (blobs, trees, commits, references), rebasing vs merging, semantic pull requests, and automated GitHub Actions CI completes your Applied Phase foundation.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. GitHub Actions: Enterprise Java CI Workflow (<code>.github/workflows/ci.yml</code>)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>name: Enterprise Java CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven
      - name: Build with Maven
        run: ./mvnw -B verify --file pom.xml
      - name: Publish Test Results
        uses: EnricoMi/publish-unit-test-result-action@v2
        if: always()
        with:
          files: '**/surefire-reports/*.xml'</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Git tracks snapshot Directed Acyclic Graphs (DAGs) of project trees, not delta file diffs.</li>
      <li>Use <code>git rebase</code> on feature branches to maintain a clean linear commit history before PR merge.</li>
      <li>Never force-push (<code>git push -f</code>) to shared branches like <code>main</code> or <code>develop</code>.</li>
      <li>Automate CI checks (unit tests, SonarQube quality gates, security scans) on every pull request.</li>
      <li>Adopt Conventional Commits (e.g., <code>feat:</code>, <code>fix:</code>, <code>refactor:</code>) for automated changelog generation.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 2 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-JFS-008",
      title: "Generics & Streams Assessment",
      chapterId: "CH-JFS-008",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-008-01", type: "MCQ", prompt: "What happens to generic type parameters at runtime due to Type Erasure?", options: ["They are replaced by raw types (Object or their upper bound) in bytecode", "They are retained as JVM primitive pointers", "They trigger runtime class generation", "They become C++ templates"], answer: 0, points: 10 },
        { id: "Q-JFS-008-02", type: "MCQ", prompt: "According to the PECS principle, when should you use `? extends T` wildcard?", options: ["When you only consume/write data into the collection", "When you only produce/read data from the collection", "When modifying items in place", "Never in method signatures"], answer: 1, points: 10 },
        { id: "Q-JFS-008-03", type: "MCQ", prompt: "Which functional interface represents an operation that takes an argument of type T and returns a boolean?", options: ["Consumer<T>", "Function<T, R>", "Predicate<T>", "Supplier<T>"], answer: 2, points: 10 },
        { id: "Q-JFS-008-04", type: "MCQ", prompt: "What distinguishes an intermediate Stream operation from a terminal Stream operation?", options: ["Intermediate operations execute immediately; terminal operations execute later", "Intermediate operations return a new Stream and are lazily evaluated; terminal operations trigger execution and produce a non-stream result", "Terminal operations can only be executed on parallel streams", "Intermediate operations must be synchronized"], answer: 1, points: 10 },
        { id: "Q-JFS-008-05", type: "MCQ", prompt: "What Collector should be used to group stream items into a Map based on a classification key?", options: ["Collectors.toList()", "Collectors.groupingBy()", "Collectors.joining()", "Collectors.reducing()"], answer: 1, points: 10 },
        { id: "Q-JFS-008-06", type: "MCQ", prompt: "What is the primary risk of using `parallelStream()` for blocking I/O calls?", options: ["It exhausts the shared global ForkJoinPool.commonPool(), starving other system tasks", "It corrupts the heap memory", "It throws ConcurrentModificationException immediately", "It converts the stream into an array"], answer: 0, points: 10 },
        { id: "Q-JFS-008-07", type: "MCQ", prompt: "What is the recommended design pattern for handling a method that might return no value?", options: ["Return null and check with `== null`", "Return `Optional<T>`", "Throw a checked exception always", "Return an empty Object"], answer: 1, points: 10 },
        { id: "Q-JFS-008-08", type: "MCQ", prompt: "What does `Stream.map()` perform?", options: ["Filters out unwanted items", "Applies a transforming function to each element, producing a 1-to-1 mapped stream", "Flattens nested lists into a single stream", "Sorts items in reverse order"], answer: 1, points: 10 },
        { id: "Q-JFS-008-09", type: "MCQ", prompt: "Can you instantiate a generic array directly using `new T[10]` in Java?", options: ["Yes, always", "No, generic array creation is forbidden due to type erasure", "Only if T is Serializable", "Only in Java 21"], answer: 1, points: 10 },
        { id: "Q-JFS-008-10", type: "MCQ", prompt: "What method reference syntax represents invoking an instance method on an arbitrary object of a particular type?", options: ["ClassName::new", "ClassName::methodName", "instance::methodName", "super::methodName"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-009",
      title: "File I/O & NIO.2 Assessment",
      chapterId: "CH-JFS-009",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-009-01", type: "MCQ", prompt: "Which package introduced in Java 7 provides modern, performant file system path operations?", options: ["java.io", "java.nio.file", "java.util.file", "javax.persistence"], answer: 1, points: 10 },
        { id: "Q-JFS-009-02", type: "MCQ", prompt: "Why is `Files.lines(Path)` preferred over `Files.readAllLines(Path)` when inspecting large log files?", options: ["`Files.lines()` streams lines lazily without consuming massive heap memory", "`Files.lines()` is faster because it runs on GPU", "`Files.readAllLines()` only works with ASCII", "`Files.lines()` automatically encrypts files"], answer: 0, points: 10 },
        { id: "Q-JFS-009-03", type: "MCQ", prompt: "What is the primary security hazard of Java Native Object Serialization (`ObjectInputStream.readObject()`)?", options: ["Memory exhaustion only", "Vulnerability to arbitrary Remote Code Execution (RCE) via deserialization gadget chains", "Slow network transfer rates", "Incompatibility with Linux"], answer: 1, points: 10 },
        { id: "Q-JFS-009-04", type: "MCQ", prompt: "What keyword in a Serializable class prevents a sensitive field from being written to the serialized byte stream?", options: ["volatile", "transient", "private", "final"], answer: 1, points: 10 },
        { id: "Q-JFS-009-05", type: "MCQ", prompt: "What API in Java NIO enables monitoring a directory for real-time file creation or deletion events?", options: ["FileWatcher", "WatchService", "DirectoryStreamListener", "FileSystemMonitor"], answer: 1, points: 10 },
        { id: "Q-JFS-009-06", type: "MCQ", prompt: "What is a major advantage of NIO Channels over traditional Streams?", options: ["Channels are two-way (bidirectional) and can transfer data asynchronously", "Channels only handle text", "Channels do not require operating system handles", "Channels cannot be closed"], answer: 0, points: 10 },
        { id: "Q-JFS-009-07", type: "MCQ", prompt: "What method on a ByteBuffer must be called before reading data that was just written into it?", options: ["clear()", "flip()", "rewind()", "compact()"], answer: 1, points: 10 },
        { id: "Q-JFS-009-08", type: "MCQ", prompt: "What is the modern industry best practice for object data serialization between distributed microservices?", options: ["Java native Serializable binary streams", "Text/binary structured formats like JSON, Protocol Buffers, or Avro", "Writing raw memory dumps to disk", "CSV files"], answer: 1, points: 10 },
        { id: "Q-JFS-009-09", type: "MCQ", prompt: "What charset should always be explicitly specified during file I/O to prevent platform-dependent decoding bugs?", options: ["ISO-8859-1", "StandardCharsets.UTF_8", "US-ASCII", "UTF-16BE"], answer: 1, points: 10 },
        { id: "Q-JFS-009-10", type: "MCQ", prompt: "What does zero-copy I/O mean in high-performance network programming?", options: ["Data is transferred directly from kernel buffer to network channel without intermediate copying into user application space", "No data is transmitted", "Memory is zeroed out after transfer", "Files are deleted immediately"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-010",
      title: "Multithreading & Concurrency Assessment",
      chapterId: "CH-JFS-010",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-010-01", type: "MCQ", prompt: "What key advantage do Java 21 Virtual Threads provide over traditional Platform Threads?", options: ["They execute CPU-intensive tasks 10x faster", "They have tiny memory footprints (~few hundred bytes) and unmount during I/O blocking, allowing millions of concurrent tasks", "They run outside the JVM directly in silicon", "They do not require garbage collection"], answer: 1, points: 10 },
        { id: "Q-JFS-010-02", type: "MCQ", prompt: "What guarantee does the `volatile` keyword provide according to the Java Memory Model?", options: ["Atomic increments for compound operations like `count++`", "Immediate visibility of writes across threads and prevention of instruction reordering", "Exclusive mutual exclusion locking", "Persistent disk storage"], answer: 1, points: 10 },
        { id: "Q-JFS-010-03", type: "MCQ", prompt: "Why is `AtomicInteger.incrementAndGet()` thread-safe without using explicit `synchronized` blocks?", options: ["It uses hardware-level Compare-And-Swap (CAS) instructions", "It suspends the JVM during the update", "It creates a new thread for each increment", "It uses file locks"], answer: 0, points: 10 },
        { id: "Q-JFS-010-04", type: "MCQ", prompt: "What occurs when two or more threads each hold a resource the other needs and wait indefinitely?", options: ["Live lock", "Deadlock", "Race condition", "Starvation"], answer: 1, points: 10 },
        { id: "Q-JFS-010-05", type: "MCQ", prompt: "Which concurrent collection allows high-concurrency multi-threaded reads and writes using bucket-level locking?", options: ["Hashtable", "Collections.synchronizedMap()", "ConcurrentHashMap", "TreeMap"], answer: 2, points: 10 },
        { id: "Q-JFS-010-06", type: "MCQ", prompt: "How should you create an ExecutorService for Virtual Threads in Java 21?", options: ["Executors.newFixedThreadPool(10)", "Executors.newVirtualThreadPerTaskExecutor()", "new ThreadPoolExecutor()", "Executors.newSingleThreadExecutor()"], answer: 1, points: 10 },
        { id: "Q-JFS-010-07", type: "MCQ", prompt: "What is thread 'pinning' in the context of Java Virtual Threads?", options: ["Pinning a thread to a specific CPU core for maximum speed", "When a virtual thread cannot unmount from its carrier thread because it is executing inside a synchronized block or native method", "Attaching a debugger to a virtual thread", "Terminating a hung thread"], answer: 1, points: 10 },
        { id: "Q-JFS-010-08", type: "MCQ", prompt: "What does `CompletableFuture.supplyAsync()` enable in modern Java architectures?", options: ["Synchronous blocking execution on main thread", "Asynchronous non-blocking computation with chaining pipelines (thenApply, thenCompose)", "Database schema migration", "Automatic thread prioritization"], answer: 1, points: 10 },
        { id: "Q-JFS-010-09", type: "MCQ", prompt: "What is a race condition in multi-threaded execution?", options: ["When two threads finish at the exact same millisecond", "When system correctness depends on the non-deterministic timing or interleaving of multiple concurrent threads", "When a thread exceeds its allocated memory", "When threads use the same class loader"], answer: 1, points: 10 },
        { id: "Q-JFS-010-10", type: "MCQ", prompt: "Why should you prefer `ReentrantLock` over `synchronized` when building virtual-thread-heavy enterprise backends?", options: ["ReentrantLock is easier to write", "ReentrantLock does not pin virtual threads to their carrier threads during contention", "ReentrantLock uses less memory than an Object monitor", "synchronized is deprecated in Java 21"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-011",
      title: "SQL & JDBC Assessment",
      chapterId: "CH-JFS-011",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-011-01", type: "MCQ", prompt: "Why does PreparedStatement prevent SQL Injection attacks?", options: ["It encrypts the SQL string with AES", "It separates SQL command structure from user data parameters, pre-compiling the query plan", "It strips all quotation marks from user input", "It automatically sanitizes HTML tags"], answer: 1, points: 10 },
        { id: "Q-JFS-011-02", type: "MCQ", prompt: "What is the primary role of a connection pool like HikariCP in a high-throughput backend?", options: ["To automatically write SQL queries", "To reuse an established pool of physical database connections, eliminating the heavy cost of repeatedly creating TCP/TLS connections", "To cache SQL query results in RAM", "To manage database user passwords"], answer: 1, points: 10 },
        { id: "Q-JFS-011-03", type: "MCQ", prompt: "What command disables automatic transaction committing on a JDBC Connection?", options: ["conn.commit(false);", "conn.setAutoCommit(false);", "conn.beginTransaction();", "conn.setManualTransaction(true);"], answer: 1, points: 10 },
        { id: "Q-JFS-011-04", type: "MCQ", prompt: "What does the 'I' in ACID database transactions represent?", options: ["Indexability", "Isolation (concurrent transactions execute without interfering with one another)", "Immutability", "Inheritance"], answer: 1, points: 10 },
        { id: "Q-JFS-011-05", type: "MCQ", prompt: "What happens if an unhandled exception occurs inside a transaction before `conn.commit()` is called?", options: ["The database automatically commits partial work", "The application should catch the exception and invoke `conn.rollback()`", "The database table is dropped", "The connection is locked permanently"], answer: 1, points: 10 },
        { id: "Q-JFS-011-06", type: "MCQ", prompt: "What SQL clause combines rows from two or more tables based on a related column between them?", options: ["GROUP BY", "ORDER BY", "JOIN", "UNION"], answer: 2, points: 10 },
        { id: "Q-JFS-011-07", type: "MCQ", prompt: "What database index structure is most commonly used for range and equality queries in PostgreSQL?", options: ["Hash Index", "B-Tree Index", "GIN Index", "GiST Index"], answer: 1, points: 10 },
        { id: "Q-JFS-011-08", type: "MCQ", prompt: "What method navigates the cursor to the next row in a JDBC ResultSet?", options: ["rs.read()", "rs.next()", "rs.advance()", "rs.hasMore()"], answer: 1, points: 10 },
        { id: "Q-JFS-011-09", type: "MCQ", prompt: "What isolation level prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads?", options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], answer: 3, points: 10 },
        { id: "Q-JFS-011-10", type: "MCQ", prompt: "Why is connection pool exhaustion dangerous in microservice architectures?", options: ["It crashes the physical database hardware immediately", "HTTP request threads block indefinitely waiting for a free connection, cascading thread starvation across the entire service", "It causes data corruption in tables", "It forces a database rollback"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-012",
      title: "Maven & Gradle Build Systems Assessment",
      chapterId: "CH-JFS-012",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-012-01", type: "MCQ", prompt: "What is the standard Maven configuration file called?", options: ["build.gradle", "pom.xml", "package.json", "Makefile"], answer: 1, points: 10 },
        { id: "Q-JFS-012-02", type: "MCQ", prompt: "What are the three coordinates that uniquely identify any dependency in the Maven ecosystem?", options: ["name, version, author", "groupId, artifactId, version (GAV)", "url, hash, timestamp", "packageName, className, jarName"], answer: 1, points: 10 },
        { id: "Q-JFS-012-03", type: "MCQ", prompt: "What Maven phase compiles application source code?", options: ["validate", "compile", "package", "install"], answer: 1, points: 10 },
        { id: "Q-JFS-012-04", type: "MCQ", prompt: "What does the `<dependencyManagement>` section do in a parent pom.xml?", options: ["Downloads and installs all declared libraries immediately", "Declares dependency versions centrally without adding them directly to the classpath of child modules", "Deletes unused jars from local cache", "Configures test runners"], answer: 1, points: 10 },
        { id: "Q-JFS-012-05", type: "MCQ", prompt: "Why should teams use the Maven Wrapper (`./mvnw`) or Gradle Wrapper (`./gradlew`) in CI pipelines?", options: ["Because wrappers are faster than native binaries", "To guarantee that all developers and CI servers execute using the exact identical version of the build tool without manual installation", "To avoid writing unit tests", "Wrappers bypass security firewalls"], answer: 1, points: 10 },
        { id: "Q-JFS-012-06", type: "MCQ", prompt: "What scope in Maven ensures a dependency is available for compilation and testing, but omitted from the packaged artifact (because the runtime container provides it)?", options: ["compile", "provided", "test", "runtime"], answer: 1, points: 10 },
        { id: "Q-JFS-012-07", type: "MCQ", prompt: "How does Maven resolve conflicting transitive versions of the same library?", options: ["Highest version always wins", "Nearest definition in the dependency tree wins", "Random selection", "Fails the build immediately by default"], answer: 1, points: 10 },
        { id: "Q-JFS-012-08", type: "MCQ", prompt: "What is the purpose of the Maven `clean` lifecycle?", options: ["Deletes the `target/` directory containing previous build artifacts", "Clears the local user git commits", "Formats Java source code", "Uninstalls the JDK"], answer: 0, points: 10 },
        { id: "Q-JFS-012-09", type: "MCQ", prompt: "What is a BOM (Bill of Materials) in Maven dependency management?", options: ["A list of software developers on the project", "A POM file that defines a curated set of compatible library versions for import (e.g., Spring Boot Dependencies BOM)", "A database schema backup file", "A software license document"], answer: 1, points: 10 },
        { id: "Q-JFS-012-10", type: "MCQ", prompt: "What feature in Gradle provides faster builds compared to Maven in massive enterprise repositories?", options: ["Writing in JavaScript", "Incremental builds, task output caching, and daemon process execution", "Skipping unit tests automatically", "Ignoring compile errors"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-013",
      title: "JUnit 5 & Mockito Assessment",
      chapterId: "CH-JFS-013",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-013-01", type: "MCQ", prompt: "What annotation identifies a test method in JUnit 5 (Jupiter)?", options: ["@Test", "@TestCase", "@TestMethod", "@RunTest"], answer: 0, points: 10 },
        { id: "Q-JFS-013-02", type: "MCQ", prompt: "What is the primary purpose of Mockito in unit testing?", options: ["To run automated browser clicks", "To create dummy mock objects that simulate the behavior of complex external dependencies in isolation", "To measure code lines", "To generate test reports"], answer: 1, points: 10 },
        { id: "Q-JFS-013-03", type: "MCQ", prompt: "What pattern structures test code into three clear logical phases?", options: ["Model-View-Controller (MVC)", "Arrange-Act-Assert (AAA)", "Read-Eval-Print (REPL)", "Extract-Transform-Load (ETL)"], answer: 1, points: 10 },
        { id: "Q-JFS-013-04", type: "MCQ", prompt: "How do you specify stubbed return behavior in Mockito?", options: ["mock.returnValue(x)", "when(mock.methodCall()).thenReturn(value)", "stub(mock).with(value)", "given(mock) -> value"], answer: 1, points: 10 },
        { id: "Q-JFS-013-05", type: "MCQ", prompt: "What Mockito method verifies that a mock method was called a specific number of times?", options: ["verify(mock, times(n)).methodCall()", "assert(mock).wasCalled(n)", "check(mock).count(n)", "validate(mock, n)"], answer: 0, points: 10 },
        { id: "Q-JFS-013-06", type: "MCQ", prompt: "What annotation in JUnit 5 executes setup logic before each individual test method runs?", options: ["@BeforeAll", "@BeforeEach", "@Init", "@SetUp"], answer: 1, points: 10 },
        { id: "Q-JFS-013-07", type: "MCQ", prompt: "What is the difference between a Mock and a Spy in Mockito?", options: ["A Mock has no real code execution (default dummy responses); a Spy wraps a real object and executes real methods unless specifically stubbed", "A Spy runs in parallel; a Mock runs synchronously", "A Mock is for interfaces; a Spy is for primitives", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-JFS-013-08", type: "MCQ", prompt: "What JUnit 5 feature allows testing multiple input values with a single test method?", options: ["@RepeatedTest", "@ParameterizedTest with @ValueSource / @CsvSource", "@DynamicContainer", "@TestSuite"], answer: 1, points: 10 },
        { id: "Q-JFS-013-09", type: "MCQ", prompt: "What tool is widely used in Java CI pipelines to measure and enforce unit test code coverage metrics?", options: ["Log4j", "JaCoCo", "Checkstyle", "SpotBugs"], answer: 1, points: 10 },
        { id: "Q-JFS-013-10", type: "MCQ", prompt: "What is the core philosophy of Test-Driven Development (TDD)?", options: ["Write tests after production deployment", "Write failing test first (Red), write minimal code to pass (Green), refactor code cleanly (Refactor)", "Write code without tests to maximize speed", "Only test private methods"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-014",
      title: "Git & CI Workflows Assessment",
      chapterId: "CH-JFS-014",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-014-01", type: "MCQ", prompt: "What fundamental data structure does Git use to store commit history and snapshots?", options: ["Relational B-Tree", "Directed Acyclic Graph (DAG) of immutable SHA objects", "Doubly Linked List", "Circular Buffer"], answer: 1, points: 10 },
        { id: "Q-JFS-014-02", type: "MCQ", prompt: "What is the primary difference between `git merge` and `git rebase`?", options: ["Merge creates a merge commit preserving exact history; rebase replays local commits on top of base branch producing a linear history", "Rebase deletes all commits; merge does not", "Merge only works on remote repositories", "Rebase is only for tag releases"], answer: 0, points: 10 },
        { id: "Q-JFS-014-03", type: "MCQ", prompt: "Why is `git push --force` strongly discouraged on shared branches like `main`?", options: ["It takes too much network bandwidth", "It overwrites remote commit history, potentially destroying teammate commits that have been pushed", "It deletes the git repository", "It requires root permissions"], answer: 1, points: 10 },
        { id: "Q-JFS-014-04", type: "MCQ", prompt: "What is the role of a `.gitignore` file in a software repository?", options: ["To delete ignored files from hard drive", "To prevent specified untracked files (build outputs, .env secrets, logs) from being staged or committed into version control", "To ignore git merge errors", "To hide files from the operating system"], answer: 1, points: 10 },
        { id: "Q-JFS-014-05", type: "MCQ", prompt: "Where are GitHub Actions automated workflow files stored in a repository?", options: ["/ci/pipelines/", "/.github/workflows/", "/scripts/ci/", "/build/actions/"], answer: 1, points: 10 },
        { id: "Q-JFS-014-06", type: "MCQ", prompt: "What does the command `git stash` do?", options: ["Deletes all unstaged changes permanently", "Temporarily shelves (stashes) uncommitted working directory changes so you can switch branches cleanly", "Pushes code to GitHub", "Creates a new Git tag"], answer: 1, points: 10 },
        { id: "Q-JFS-014-07", type: "MCQ", prompt: "What is a Pull Request (PR) in modern software engineering workflows?", options: ["A request to download code from GitHub", "A proposed set of code changes submitted for peer code review, automated testing, and approval before merging into the target branch", "A pull operation from terminal", "A request to increase server memory"], answer: 1, points: 10 },
        { id: "Q-JFS-014-08", type: "MCQ", prompt: "What git command safely reverses the effects of a previous commit by creating a new commit with inverted changes?", options: ["git reset --hard", "git revert <commit-hash>", "git delete", "git rollback"], answer: 1, points: 10 },
        { id: "Q-JFS-014-09", type: "MCQ", prompt: "What is the purpose of Semantic Versioning (SemVer) format (e.g., 2.4.1)?", options: ["To indicate software price", "To convey meaning about underlying changes: Major (breaking), Minor (features, backward-compatible), Patch (bug fixes)", "To track build server CPU speed", "To count lines of code"], answer: 1, points: 10 },
        { id: "Q-JFS-014-10", type: "MCQ", prompt: "What is a pre-commit hook used for in professional teams?", options: ["To execute checks (linting, secret scanning, formatting) locally before Git allows creating a commit", "To deploy to AWS automatically", "To send an email to the team lead", "To push changes directly to main"], answer: 0, points: 10 },
      ]
    }
  ]
};

