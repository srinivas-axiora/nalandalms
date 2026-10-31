// Phase 1: Foundation (Chapters 1 to 7) - Java Full Stack Developer
// World-class curriculum: Zero to employable master.

export const phase1 = {
  chapters: [
    // ── Chapter 1 ──
    {
      id: "CH-JFS-001",
      courseId: "CRS-JFS-001",
      sequence: 1,
      title: "Introduction to Java, JVM Architecture & JDK 21 Environment",
      description: "Master Java history, JVM/JRE/JDK architecture, JIT compilation, and setting up an enterprise-grade JDK 21 environment.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 1</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Introduction to Java, JVM Architecture & JDK 21 Setup</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Welcome to the start of your journey to becoming a world-class Java Full Stack Developer. Java powers over 60 billion devices, backbones 90% of Fortune 500 enterprise architectures, and remains the primary choice for mission-critical banking, e-commerce, and high-frequency systems worldwide. In this chapter, you will build an unshakeable mental model of how Java works from bytecode to silicon.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/grEKMHGYyns" title="Java Tutorial for Beginners - Full Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Core Value Proposition: Write Once, Run Anywhere (WORA)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Before Java's inception at Sun Microsystems in 1995 (led by James Gosling), developers compiled languages like C/C++ directly into machine-dependent binary code. A binary compiled for Windows x86 could not run on Linux ARM without complete recompilation and platform-specific source adaptations. Java solved this systemic fragmentation through the <strong>Virtual Machine abstraction</strong>.</p>

  <div class="diagram-box" style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:24px;margin:24px 0;">
    <h4 style="margin-top:0;color:#0f172a;font-size:16px;">The Java Execution Pipeline</h4>
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font-family:monospace;font-size:13px;text-align:center;">
      <div style="background:#e0f2fe;border:2px solid #0284c7;padding:12px 16px;border-radius:8px;flex:1;min-width:140px;">
        <strong>Application.java</strong><br><span style="color:#0369a1;">Source Code</span>
      </div>
      <div style="color:#64748b;font-weight:bold;font-size:18px;">&rarr; javac &rarr;</div>
      <div style="background:#fef3c7;border:2px solid #d97706;padding:12px 16px;border-radius:8px;flex:1;min-width:140px;">
        <strong>Application.class</strong><br><span style="color:#b45309;">Bytecode</span>
      </div>
      <div style="color:#64748b;font-weight:bold;font-size:18px;">&rarr; JVM &rarr;</div>
      <div style="background:#dcfce7;border:2px solid #16a34a;padding:12px 16px;border-radius:8px;flex:1;min-width:140px;">
        <strong>Host CPU</strong><br><span style="color:#15803d;">Native Machine Code</span>
      </div>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The Trinity: JDK vs JRE vs JVM</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#0f172a;color:#ffffff;text-align:left;">
        <th style="padding:12px;border:1px solid #334155;">Component</th>
        <th style="padding:12px;border:1px solid #334155;">Full Name</th>
        <th style="padding:12px;border:1px solid #334155;">Contents & Responsibility</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background:#ffffff;">
        <td style="padding:10px;border:1px solid #e2e8f0;font-weight:700;">JVM</td>
        <td style="padding:10px;border:1px solid #e2e8f0;">Java Virtual Machine</td>
        <td style="padding:10px;border:1px solid #e2e8f0;">Abstract computing machine that loads, verifies, and executes bytecode. Handles memory management, Garbage Collection (GC), and JIT optimization.</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:10px;border:1px solid #e2e8f0;font-weight:700;">JRE</td>
        <td style="padding:10px;border:1px solid #e2e8f0;">Java Runtime Environment</td>
        <td style="padding:10px;border:1px solid #e2e8f0;">JVM + Core Class Libraries (java.lang, java.util, java.io) necessary to execute existing Java applications. (Deprecated as standalone bundle in JDK 11+).</td>
      </tr>
      <tr style="background:#ffffff;">
        <td style="padding:10px;border:1px solid #e2e8f0;font-weight:700;">JDK</td>
        <td style="padding:10px;border:1px solid #e2e8f0;">Java Development Kit</td>
        <td style="padding:10px;border:1px solid #e2e8f0;">JRE + Developer Tools: compiler (<code>javac</code>), debugger (<code>jdb</code>), packager (<code>jar</code>), profiler (<code>jcmd</code>, <code>jfr</code>). Everything required to build from scratch.</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. Deep Dive: JVM Internal Subsystems</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The JVM comprises three major subsystems:</p>
  <ul style="font-size:15px;line-height:1.8;color:#334155;">
    <li><strong>Classloader Subsystem:</strong> Handles Loading (Bootstrap, Extension/Platform, Application ClassLoaders), Linking (Verification, Preparation, Resolution), and Initialization.</li>
    <li><strong>Runtime Data Areas:</strong> Method Area (Metaspace since Java 8), Heap Area (shared objects), Stack Area (per-thread stack frames), PC Registers, Native Method Stack.</li>
    <li><strong>Execution Engine:</strong> Interpreter (reads and executes bytecode line-by-line), JIT (Just-In-Time) Compiler (compiles frequently executed hot spots into native machine code), and Garbage Collector.</li>
  </ul>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">4. Your First Java 21 Program</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Nalanda World-Class Developer!");
        System.out.printf("Running on Java Version: %s%n", System.getProperty("java.version"));
    }
}</code></pre>
  
  <p style="font-size:15px;line-height:1.7;color:#334155;">Compilation and execution commands from the terminal:</p>
  <pre style="background:#1e293b;color:#38bdf8;padding:14px;border-radius:8px;font-family:monospace;font-size:13px;"><code># 1. Compile source into bytecode (.class file)
javac HelloWorld.java

# 2. Launch the JVM and execute bytecode
java HelloWorld</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Java achieves platform independence via intermediate bytecode executed by the platform-specific JVM.</li>
      <li>JDK contains the full suite of developer tools, while JRE/JVM handles runtime execution.</li>
      <li>The JVM Execution Engine utilizes both an Interpreter for instant startup and a JIT Compiler for peak performance.</li>
      <li>Java 21 is a Long-Term Support (LTS) release featuring Virtual Threads, Pattern Matching, and Record Patterns.</li>
      <li>Entry point signature <code>public static void main(String[] args)</code> is mandated by JVM specification for standalone application bootstrap.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 2 ──
    {
      id: "CH-JFS-002",
      courseId: "CRS-JFS-001",
      sequence: 2,
      title: "Java Syntax, Variables, Memory Representation & Primitive Data Types",
      description: "Deep dive into the 8 primitives, stack vs heap allocation, implicit vs explicit type casting, operators, and String immutability.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 2</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Java Syntax, Primitive Data Types & Memory Representation</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Every computing algorithm manipulates state. In Java, state is strongly typed: every variable must be declared with a concrete type, preventing whole classes of memory corruption and runtime type errors common in dynamically typed languages.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/eIrMbAQSU34" title="Java Variables and Data Types" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 8 Primitives and Their Hardware Representation</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#0f172a;color:#ffffff;text-align:left;">
        <th style="padding:10px;border:1px solid #334155;">Type</th>
        <th style="padding:10px;border:1px solid #334155;">Size</th>
        <th style="padding:10px;border:1px solid #334155;">Range / Representation</th>
        <th style="padding:10px;border:1px solid #334155;">Default</th>
        <th style="padding:10px;border:1px solid #334155;">Wrapper Class</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>byte</code></td><td style="padding:8px;border:1px solid #e2e8f0;">8 bits</td><td style="padding:8px;border:1px solid #e2e8f0;">-128 to 127</td><td style="padding:8px;border:1px solid #e2e8f0;">0</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Byte</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>short</code></td><td style="padding:8px;border:1px solid #e2e8f0;">16 bits</td><td style="padding:8px;border:1px solid #e2e8f0;">-32,768 to 32,767</td><td style="padding:8px;border:1px solid #e2e8f0;">0</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Short</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>int</code></td><td style="padding:8px;border:1px solid #e2e8f0;">32 bits</td><td style="padding:8px;border:1px solid #e2e8f0;">-2^31 to 2^31-1 (~2.14 Billion)</td><td style="padding:8px;border:1px solid #e2e8f0;">0</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Integer</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>long</code></td><td style="padding:8px;border:1px solid #e2e8f0;">64 bits</td><td style="padding:8px;border:1px solid #e2e8f0;">-2^63 to 2^63-1 (Suffix: <code>L</code>)</td><td style="padding:8px;border:1px solid #e2e8f0;">0L</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Long</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>float</code></td><td style="padding:8px;border:1px solid #e2e8f0;">32 bits</td><td style="padding:8px;border:1px solid #e2e8f0;">IEEE 754 32-bit floating point (Suffix: <code>f</code>)</td><td style="padding:8px;border:1px solid #e2e8f0;">0.0f</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Float</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>double</code></td><td style="padding:8px;border:1px solid #e2e8f0;">64 bits</td><td style="padding:8px;border:1px solid #e2e8f0;">IEEE 754 64-bit double precision</td><td style="padding:8px;border:1px solid #e2e8f0;">0.0d</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Double</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>char</code></td><td style="padding:8px;border:1px solid #e2e8f0;">16 bits</td><td style="padding:8px;border:1px solid #e2e8f0;">Unicode characters (\\u0000 to \\uffff)</td><td style="padding:8px;border:1px solid #e2e8f0;">'\\u0000'</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Character</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>boolean</code></td><td style="padding:8px;border:1px solid #e2e8f0;">1 bit (JVM dependent)</td><td style="padding:8px;border:1px solid #e2e8f0;"><code>true</code> or <code>false</code></td><td style="padding:8px;border:1px solid #e2e8f0;">false</td><td style="padding:8px;border:1px solid #e2e8f0;">java.lang.Boolean</td></tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Type Casting & Precision Loss</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Java strictly differentiates between Widening (Implicit) casting and Narrowing (Explicit) casting:</p>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// Widening (automatic, safe, no loss of precision):
int smallNum = 42;
double largeContainer = smallNum; // 42.0

// Narrowing (manual cast required, potential data overflow):
double accountBalance = 999.85;
int truncatedDollars = (int) accountBalance; // 999 (fractional portion truncated)

// Overflow demonstration:
int bigValue = 130;
byte overflowedByte = (byte) bigValue; // Results in -126 due to two's complement wraparound!</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. Reference Types & The String Constant Pool</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Unlike primitives stored directly in thread stack memory frames, reference variables hold memory addresses pointing to objects residing in the Heap. The <code>String</code> class in Java is immutable and managed via the <strong>String Constant Pool (SCP)</strong>:</p>

  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>String s1 = "Nalanda";
String s2 = "Nalanda";
String s3 = new String("Nalanda");

System.out.println(s1 == s2);      // true: both reference the identical pooled instance
System.out.println(s1 == s3);      // false: s3 forces a new heap allocation outside SCP
System.out.println(s1.equals(s3)); // true: compares lexical character sequence</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Java has 8 primitive types stored directly on the stack; all objects live on the Heap.</li>
      <li>Narrowing conversions require explicit casts and can cause integer overflow or truncation.</li>
      <li>Strings are immutable; modifying a string creates a new instance on the heap unless using <code>StringBuilder</code>.</li>
      <li>Always use <code>.equals()</code> for logical equality and <code>==</code> for memory address reference comparison.</li>
      <li>Java avoids memory leaks in primitives, but stale object references in Heap can prevent garbage collection.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 3 ──
    {
      id: "CH-JFS-003",
      courseId: "CRS-JFS-001",
      sequence: 3,
      title: "Control Flow: Decision Making, Modern Switch Expressions & Iteration",
      description: "Comprehensive mastery of if-else ladders, pattern matching in switch (Java 21), loops, break/continue, and label branching.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 3</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Control Flow: Conditionals, Modern Switch & Iteration Mechanics</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Control flow statements dictate the order in which execution progresses based on dynamic runtime state. In modern enterprise applications, clean branching and defensive loops ensure stability, resilience, and microsecond efficiency.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/ldYLYRNaucM" title="Java Control Flow & Loops" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Modern Switch Expressions in Java 17 & 21</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Legacy <code>switch</code> statements suffered from verbose syntax and catastrophic fall-through bugs caused by missing <code>break</code> keywords. Modern Java introduces arrow syntax <code>-&gt;</code> and expression semantics that return values directly:</p>

  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// Modern Switch Expression (returns a value, no fall-through risk)
String httpMethod = "POST";
int expectedStatusCode = switch (httpMethod) {
    case "GET" -> 200;
    case "POST" -> 201;
    case "ACCEPTED", "PROCESSING" -> 202;
    case "DELETE" -> 204;
    default -> throw new IllegalArgumentException("Unsupported HTTP method: " + httpMethod);
};

// Pattern Matching with Type Guards in Java 21:
static String formatTransaction(Object tx) {
    return switch (tx) {
        case Integer i -> String.format("Transaction #%d (Standard)", i);
        case Long l -> String.format("Transaction #%d (Enterprise Large)", l);
        case String s when s.startsWith("CRYPTO_") -> "Cryptographic Settlement: " + s;
        case String s -> "Manual Ledger Entry: " + s;
        case null -> "Null Transaction Record!";
        default -> "Unknown Transaction: " + tx.toString();
    };
}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Iteration Constructs & Performance Characteristics</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:16px;border-radius:8px;">
      <h4 style="margin-top:0;color:#0284c7;">Standard <code>for</code> / <code>while</code></h4>
      <p style="font-size:13px;line-height:1.6;color:#334155;">Ideal when an index is required, when mutating the loop counter irregularly, or iterating backwards. Direct memory index access has zero heap overhead.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:16px;border-radius:8px;">
      <h4 style="margin-top:0;color:#16a34a;">Enhanced <code>for-each</code></h4>
      <p style="font-size:13px;line-height:1.6;color:#334155;">Syntactic sugar over <code>Iterator&lt;T&gt;</code>. Safer against off-by-one errors. Do not mutate collection elements directly inside for-each (throws <code>ConcurrentModificationException</code>).</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Modern arrow-switch expressions eliminate unintentional fall-through bugs and can return values directly.</li>
      <li>Java 21 pattern matching allows switching over object types with guarded <code>when</code> conditions.</li>
      <li>Use enhanced for-each for read-only traversals; use standard indexing or Iterator if removing elements during loop.</li>
      <li>Labelled break and continue enable clean exits from deeply nested iterative algorithms.</li>
      <li>Ternary operators (<code>cond ? a : b</code>) should be used judiciously to avoid reducing code readability.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 4 ──
    {
      id: "CH-JFS-004",
      courseId: "CRS-JFS-001",
      sequence: 4,
      title: "Methods, Call Stack Execution, Arrays & High-Performance Strings",
      description: "Method signatures, call stack frames, pass-by-value semantics, multi-dimensional arrays, StringBuilder, and memory performance.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 4</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Methods, Call Stack Execution, Arrays & High-Performance Strings</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Modular code organization is achieved through methods. Understanding how the JVM creates and tears down stack frames during method invocation, along with proper memory layout of contiguous arrays, is critical for high-throughput software engineering.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/pTB0EiLXUC8" title="Java Methods and Memory" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Golden Rule: Java is Strictly Pass-By-Value</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">One of the most frequently misunderstood fundamentals in Java is parameter passing. <strong>Java is ALWAYS pass-by-value</strong>. When you pass a primitive, a copy of the bit-value is passed. When you pass an object reference, a copy of the pointer address is passed:</p>

  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>public class ParameterDemo {
    public static void modify(int x, int[] arr) {
        x = 99;           // Modifies local stack copy only!
        arr[0] = 999;     // Modifies heap object via copied reference address!
        arr = new int[]{1, 2, 3}; // Reassigns local pointer copy, does not affect caller!
    }

    public static void main(String[] args) {
        int a = 10;
        int[] nums = {100, 200};
        modify(a, nums);
        System.out.println(a);       // Still 10!
        System.out.println(nums[0]); // 999 (Heap object was mutated!)
    }
}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. String Concatenation Trap vs StringBuilder</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Because strings are immutable, naive concatenation inside loops results in quadratic \(O(N^2)\) heap allocations, triggering massive garbage collection pauses in production:</p>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// ANTI-PATTERN: Creates 10,000 intermediate String objects on the Heap!
String report = "";
for (int i = 0; i < 10_000; i++) {
    report += "DataRow " + i + "\\n";
}

// ENTERPRISE BEST PRACTICE: Reallocates dynamic internal char array in O(N) time:
StringBuilder builder = new StringBuilder(10_000 * 16); // Pre-sized capacity
for (int i = 0; i < 10_000; i++) {
    builder.append("DataRow ").append(i).append("\\n");
}
String finalReport = builder.toString();</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Java is strictly pass-by-value: passing an object passes a copy of its heap pointer reference.</li>
      <li>Each method call allocates a Stack Frame containing parameters, local variables, and return address.</li>
      <li>Arrays in Java are fixed-size heap objects with \(O(1)\) random access complexity by index.</li>
      <li>Never concatenate strings inside intensive loops with <code>+</code>; always utilize <code>StringBuilder</code>.</li>
      <li>Method overloading is determined at compile-time based on static method signatures.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 5 ──
    {
      id: "CH-JFS-005",
      courseId: "CRS-JFS-001",
      sequence: 5,
      title: "Object-Oriented Programming: Encapsulation, Classes, Objects & Memory Lifecycle",
      description: "Class blueprint architecture, constructors, this keyword, access modifiers, encapsulation, static context, and GC finalization.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 5</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">OOP Foundations: Encapsulation, Classes & Object Lifecycle</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Object-Oriented Programming (OOP) maps complex enterprise domains into self-contained software entities that bundle state with behavior. Encapsulation is the primary defense line protecting application invariants from invalid external modifications.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/IUqKuGNasdM" title="Java OOP Classes and Objects" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4 Access Modifiers in Java</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#0f172a;color:#ffffff;text-align:left;">
        <th style="padding:10px;border:1px solid #334155;">Modifier</th>
        <th style="padding:10px;border:1px solid #334155;">Same Class</th>
        <th style="padding:10px;border:1px solid #334155;">Same Package</th>
        <th style="padding:10px;border:1px solid #334155;">Subclass (Other Pkg)</th>
        <th style="padding:10px;border:1px solid #334155;">World (Universal)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>private</code></td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">❌ No</td><td style="padding:8px;border:1px solid #e2e8f0;">❌ No</td><td style="padding:8px;border:1px solid #e2e8f0;">❌ No</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>(default/package)</code></td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">❌ No</td><td style="padding:8px;border:1px solid #e2e8f0;">❌ No</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;"><code>protected</code></td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">❌ No</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;"><code>public</code></td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td><td style="padding:8px;border:1px solid #e2e8f0;">✅ Yes</td></tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Production Encapsulation: BankAccount Pattern</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>public class BankAccount {
    // 1. Private fields hide internal state from arbitrary mutation
    private final String accountNumber;
    private double balance;
    private static int totalAccountsCreated = 0; // Class-level shared variable

    // 2. Constructor enforces initialization invariants
    public BankAccount(String accountNumber, double initialDeposit) {
        if (accountNumber == null || accountNumber.isBlank()) {
            throw new IllegalArgumentException("Account number cannot be empty");
        }
        if (initialDeposit < 0) {
            throw new IllegalArgumentException("Initial deposit cannot be negative");
        }
        this.accountNumber = accountNumber;
        this.balance = initialDeposit;
        totalAccountsCreated++;
    }

    // 3. Mutators validate domain logic
    public synchronized void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit amount must be positive");
        this.balance += amount;
    }

    public synchronized void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive");
        if (amount > this.balance) throw new IllegalStateException("Insufficient funds");
        this.balance -= amount;
    }

    public double getBalance() { return this.balance; }
    public String getAccountNumber() { return this.accountNumber; }
    public static int getTotalAccounts() { return totalAccountsCreated; }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Encapsulation bundles data with behavior and hides internal state via <code>private</code> access.</li>
      <li>Constructors establish valid domain invariants; throw exceptions immediately on invalid inputs.</li>
      <li><code>static</code> members belong to the class in Metaspace and are shared across all instances.</li>
      <li>The <code>this</code> keyword resolves ambiguity between method parameters and instance member fields.</li>
      <li>Never expose direct setters without validation in domain models; prefer intention-revealing methods.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 6 ──
    {
      id: "CH-JFS-006",
      courseId: "CRS-JFS-001",
      sequence: 6,
      title: "OOP Mastery: Inheritance, Polymorphism, Abstract Classes, Interfaces & Modern Sealed Types",
      description: "Subclassing, super constructor chaining, runtime dynamic method dispatch, multiple interface inheritance, default methods, and Java 17 sealed classes.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 6</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Inheritance, Polymorphism, Interfaces & Modern Sealed Classes</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Polymorphism allows a single interface to represent multiple underlying forms. It enables loose coupling in enterprise architectures, allowing Spring and other frameworks to inject swappable implementations without altering calling business logic.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/9JpNY-XAseg" title="Polymorphism and Interfaces in Java" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Abstract Classes vs Interfaces (Java 8 to 21)</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#0f172a;color:#ffffff;text-align:left;">
        <th style="padding:10px;border:1px solid #334155;">Dimension</th>
        <th style="padding:10px;border:1px solid #334155;">Abstract Class</th>
        <th style="padding:10px;border:1px solid #334155;">Interface</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Inheritance</td><td style="padding:8px;border:1px solid #e2e8f0;">Single class inheritance (<code>extends</code>)</td><td style="padding:8px;border:1px solid #e2e8f0;">Multiple interface implementation (<code>implements</code>)</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">State</td><td style="padding:8px;border:1px solid #e2e8f0;">Can hold mutable instance state</td><td style="padding:8px;border:1px solid #e2e8f0;">Only <code>public static final</code> constants</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Constructors</td><td style="padding:8px;border:1px solid #e2e8f0;">Yes, invoked via <code>super(...)</code></td><td style="padding:8px;border:1px solid #e2e8f0;">No constructors allowed</td></tr>
      <tr style="background:#f8fafc;"><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Default Behavior</td><td style="padding:8px;border:1px solid #e2e8f0;">Any concrete or abstract methods</td><td style="padding:8px;border:1px solid #e2e8f0;"><code>default</code> & <code>static</code> methods with bodies</td></tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Modern Sealed Classes & Interfaces (Java 17+)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Before Java 17, developers could only choose between open inheritance or totally closed (<code>final</code>). Sealed classes let you explicitly control exactly which subclasses may extend a type, enabling exhaustive compiler checks in switch statements:</p>

  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>public sealed interface PaymentGateway permits StripeGateway, RazorpayGateway, PaypalGateway {
    PaymentResult process(PaymentRequest req);
}

// Permitted subclasses must declare final, sealed, or non-sealed:
public final class StripeGateway implements PaymentGateway {
    @Override public PaymentResult process(PaymentRequest req) { return new PaymentResult("STRIPE_SUCCESS"); }
}
public final class RazorpayGateway implements PaymentGateway {
    @Override public PaymentResult process(PaymentRequest req) { return new PaymentResult("RAZORPAY_SUCCESS"); }
}
public final class PaypalGateway implements PaymentGateway {
    @Override public PaymentResult process(PaymentRequest req) { return new PaymentResult("PAYPAL_SUCCESS"); }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Dynamic method dispatch resolves overridden methods at runtime based on the actual heap object.</li>
      <li>Prefer composition over inheritance to prevent rigid, deeply nested class hierarchies.</li>
      <li>Interfaces define behavioral contracts; abstract classes share state and partial implementation.</li>
      <li>Default methods in interfaces allow backward-compatible API evolution without breaking existing clients.</li>
      <li>Sealed classes permit fine-grained domain modeling with exhaustive compile-time pattern matching.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 7 ──
    {
      id: "CH-JFS-007",
      courseId: "CRS-JFS-001",
      sequence: 7,
      title: "Exception Handling Architecture & The Java Collections Framework",
      description: "Checked vs unchecked exceptions, try-with-resources, custom enterprise exceptions, List, Set, Map hierarchies, hashing internals & collision resolution.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 7</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Exception Handling Architecture & Java Collections Framework</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Enterprise resilience demands bulletproof error recovery and optimal memory structures. In this chapter, you will master the Java Exception hierarchy and internal mechanics of the Collections Framework that store and process high-volume enterprise records.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/viTHc_4XfCA" title="Java Collections Framework Full Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Throwable Hierarchy</h2>
  <div class="diagram-box" style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:20px;margin:20px 0;font-family:monospace;font-size:13px;">
    <strong>Throwable</strong><br>
    ├── <strong>Error</strong> (JVM failures: OutOfMemoryError, StackOverflowError — NEVER catch!)<br>
    └── <strong>Exception</strong><br>
    &nbsp;&nbsp;&nbsp;&nbsp;├── <strong>Checked Exceptions</strong> (Subclasses of Exception excluding RuntimeException: IOException, SQLException)<br>
    &nbsp;&nbsp;&nbsp;&nbsp;└── <strong>Unchecked Exceptions</strong> (Subclasses of RuntimeException: NullPointerException, IllegalArgumentException)
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Try-With-Resources (ARM: Automatic Resource Management)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Any object implementing <code>java.lang.AutoCloseable</code> is automatically guaranteed to be closed at block exit, eliminating native resource leaks (file descriptors, sockets, database handles):</p>

  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// Modern Try-With-Resources guarantees file and connection closure:
try (BufferedReader reader = Files.newBufferedReader(Path.of("orders.csv"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        processOrder(line);
    }
} catch (IOException ex) {
    logger.error("Failed reading orders file", ex);
    throw new OrderIngestionException("Unable to ingest orders", ex);
}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. HashMap Internal Architecture (Array of Nodes + Red-Black Tree)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">How <code>HashMap</code> works internally is the most critical collection interview question and production performance factor:</p>
  <ul style="font-size:15px;line-height:1.7;color:#334155;">
    <li>Default initial capacity: <strong>16 buckets</strong>, Load factor: <strong>0.75</strong>.</li>
    <li>Bucket index calculation: <code>index = (n - 1) & hash(key.hashCode())</code>.</li>
    <li>Collision resolution: In Java 8+, if a single bucket exceeds <strong>8 nodes (TREEIFY_THRESHOLD)</strong> and total capacity &gt;= 64, the linked list converts into a balanced <strong>Red-Black Tree</strong>, improving lookup from \(O(N)\) to \(O(\log N)\).</li>
    <li>Crucial Rule: If you override <code>equals()</code>, you <strong>MUST</strong> override <code>hashCode()</code> to maintain the contract!</li>
  </ul>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Checked exceptions enforce compile-time handling; unchecked RuntimeExceptions represent programming defects.</li>
      <li>Always use try-with-resources to guarantee safe release of system resources without verbose finally blocks.</li>
      <li><code>ArrayList</code> offers \(O(1)\) indexed reads; <code>LinkedList</code> has high reference overhead and poor CPU cache locality.</li>
      <li><code>HashMap</code> converts collided buckets to Red-Black trees at 8 elements to protect against HashDoS attacks.</li>
      <li>Never use mutable objects as HashMap keys, as mutating them alters their hashCode and makes them unretrievable.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 1 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-JFS-001",
      title: "Java Fundamentals & JVM Architecture Assessment",
      chapterId: "CH-JFS-001",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-001-01", type: "MCQ", prompt: "Which JVM component converts frequently executed bytecode into native machine instructions at runtime?", options: ["The ClassLoader", "The Just-In-Time (JIT) Compiler", "The Bytecode Verifier", "The Garbage Collector"], answer: 1, points: 10 },
        { id: "Q-JFS-001-02", type: "MCQ", prompt: "What is the primary difference between JDK and JRE?", options: ["JDK is for running apps; JRE is for compiling", "JDK contains compilers and dev tools; JRE is only the execution runtime", "JDK only runs on Linux; JRE runs on Windows", "There is no difference since Java 1.0"], answer: 1, points: 10 },
        { id: "Q-JFS-001-03", type: "MCQ", prompt: "Which file extension is produced when the javac compiler successfully processes Application.java?", options: [".exe", ".jar", ".class", ".bin"], answer: 2, points: 10 },
        { id: "Q-JFS-001-04", type: "MCQ", prompt: "Where are class metadata and static variables stored in Java 8 and beyond?", options: ["PermGen space", "Metaspace (native memory)", "Thread Stack", "Register cache"], answer: 1, points: 10 },
        { id: "Q-JFS-001-05", type: "MCQ", prompt: "What is the correct signature of the standard main method entry point?", options: ["void main(String args)", "public static void main(String[] args)", "public void static main(String args[])", "private static int main(String[] args)"], answer: 1, points: 10 },
        { id: "Q-JFS-001-06", type: "MCQ", prompt: "Why is Java considered platform independent?", options: ["Because the source code is interpreted directly by hardware", "Because bytecode runs on any platform with a compliant JVM", "Because Java compilers output x86 machine instructions", "Because Java is a scripting language"], answer: 1, points: 10 },
        { id: "Q-JFS-001-07", type: "MCQ", prompt: "Which JVM memory area is shared among all active threads?", options: ["Java Stack Frame", "Program Counter (PC) Register", "Heap Memory", "Native Method Stack"], answer: 2, points: 10 },
        { id: "Q-JFS-001-08", type: "MCQ", prompt: "What tool included in JDK 21 analyzes flight recordings for production profiling?", options: ["jdb", "JDK Flight Recorder / Mission Control", "javadoc", "jar"], answer: 1, points: 10 },
        { id: "Q-JFS-001-09", type: "MCQ", prompt: "What occurs during the linking phase of the JVM ClassLoader?", options: ["Verification, Preparation, and Resolution", "Garbage collection and defragmentation", "Machine code execution", "Source code parsing"], answer: 0, points: 10 },
        { id: "Q-JFS-001-10", type: "MCQ", prompt: "What was the landmark feature introduced in Java 21 LTS for lightweight concurrency?", options: ["Applets", "Virtual Threads (Project Loom)", "Checked exceptions", "Swing GUI"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-002",
      title: "Data Types & Memory Representation Assessment",
      chapterId: "CH-JFS-002",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-002-01", type: "MCQ", prompt: "What is the size and range of the byte primitive in Java?", options: ["8 bits, 0 to 255", "8 bits, -128 to 127", "16 bits, -32768 to 32767", "32 bits, -2^31 to 2^31-1"], answer: 1, points: 10 },
        { id: "Q-JFS-002-02", type: "MCQ", prompt: "What will happen when assigning `int x = (int) 99.99;`?", options: ["Compile error", "Runtime exception", "x becomes 99 (fractional portion truncated)", "x becomes 100 (rounded)"], answer: 2, points: 10 },
        { id: "Q-JFS-002-03", type: "MCQ", prompt: "Where does the string literal \"Nalanda\" reside when declared as `String s = \"Nalanda\";`?", options: ["On the CPU register", "In the String Constant Pool inside the Heap", "On the thread stack frame", "In the file system cache"], answer: 1, points: 10 },
        { id: "Q-JFS-002-04", type: "MCQ", prompt: "What does `System.out.println(new String(\"test\") == new String(\"test\"));` evaluate to?", options: ["true", "false", "NullPointerException", "undefined"], answer: 1, points: 10 },
        { id: "Q-JFS-002-05", type: "MCQ", prompt: "Which primitive type is used to represent single 16-bit Unicode characters?", options: ["byte", "short", "char", "String"], answer: 2, points: 10 },
        { id: "Q-JFS-002-06", type: "MCQ", prompt: "What is the default value of an uninitialized instance field of type boolean?", options: ["true", "false", "null", "0"], answer: 1, points: 10 },
        { id: "Q-JFS-002-07", type: "MCQ", prompt: "What is the result of casting `(byte) 130` in Java?", options: ["130", "-126", "127", "Throws ArithmeticException"], answer: 1, points: 10 },
        { id: "Q-JFS-002-08", type: "MCQ", prompt: "Which of the following is NOT a Java primitive type?", options: ["float", "double", "String", "boolean"], answer: 2, points: 10 },
        { id: "Q-JFS-002-09", type: "MCQ", prompt: "What happens when an integer literal exceeds 2,147,483,647 without an 'L' suffix?", options: ["Automatically treated as BigInteger", "Compile error: integer number too large", "Wraps around to negative", "Converts to double automatically"], answer: 1, points: 10 },
        { id: "Q-JFS-002-10", type: "MCQ", prompt: "Why are Java Strings immutable?", options: ["To prevent multithreading", "For security, caching in the String Pool, and thread safety", "Because the JVM has no memory management", "Because primitives cannot be stored"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-003",
      title: "Control Flow & Pattern Matching Assessment",
      chapterId: "CH-JFS-003",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-003-01", type: "MCQ", prompt: "What is a key safety advantage of modern arrow-syntax switch expressions (`case X -> ...`)?", options: ["They run on multiple threads", "They do not exhibit fall-through if break is omitted", "They accept float literals", "They bypass compile-time checks"], answer: 1, points: 10 },
        { id: "Q-JFS-003-02", type: "MCQ", prompt: "Can a modern Java switch expression return a value directly to a variable?", options: ["No, switch can only be used as a statement", "Yes, using arrow syntax or yield keyword", "Only in Java 8 and earlier", "Only if all cases return void"], answer: 1, points: 10 },
        { id: "Q-JFS-003-03", type: "MCQ", prompt: "What keyword is used in Java 21 switch expressions to specify guard conditions?", options: ["if", "when", "guard", "where"], answer: 1, points: 10 },
        { id: "Q-JFS-003-04", type: "MCQ", prompt: "What occurs if you attempt to remove an item from an ArrayList during a standard enhanced for-each loop?", options: ["The element is cleanly removed", "ConcurrentModificationException is thrown", "IndexOutOfBoundsException is thrown", "The loop terminates normally"], answer: 1, points: 10 },
        { id: "Q-JFS-003-05", type: "MCQ", prompt: "Which loop construct is guaranteed to execute its block at least once regardless of the condition?", options: ["for loop", "while loop", "do-while loop", "enhanced for loop"], answer: 2, points: 10 },
        { id: "Q-JFS-003-06", type: "MCQ", prompt: "What does the `continue` statement do inside a loop?", options: ["Terminates the program", "Exits the loop entirely", "Skips the rest of the current iteration and jumps to the next", "Rolls back previous iterations"], answer: 2, points: 10 },
        { id: "Q-JFS-003-07", type: "MCQ", prompt: "How can you break out of multiple nested loops simultaneously in Java?", options: ["break all;", "Using a labeled break statement", "goto EXIT;", "return 0;"], answer: 1, points: 10 },
        { id: "Q-JFS-003-08", type: "MCQ", prompt: "Can switch expressions in Java 21 handle null values safely?", options: ["No, null always throws NullPointerException in switch", "Yes, using explicit `case null ->` syntax", "Only by converting null to empty string", "Only with Optional wrapping"], answer: 1, points: 10 },
        { id: "Q-JFS-003-09", type: "MCQ", prompt: "What is the evaluation rule for short-circuit boolean operators `&&` and `||`?", options: ["Both operands are always evaluated", "The right operand is evaluated only if necessary to determine outcome", "The right operand is evaluated first", "Evaluation occurs randomly"], answer: 1, points: 10 },
        { id: "Q-JFS-003-10", type: "MCQ", prompt: "What is the equivalent if-else representation of `int max = (a > b) ? a : b;`?", options: ["Ternary operator", "Bitwise shift", "Switch statement", "While loop"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-004",
      title: "Methods, Call Stack & Strings Assessment",
      chapterId: "CH-JFS-004",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-004-01", type: "MCQ", prompt: "Which statement accurately describes parameter passing in Java?", options: ["Primitives are pass-by-value, objects are pass-by-reference", "Java is strictly pass-by-value for all parameters", "Java is pass-by-reference for arrays", "Pass-by-value is optional using pointer syntax"], answer: 1, points: 10 },
        { id: "Q-JFS-004-02", type: "MCQ", prompt: "When a method reassigns an object parameter `obj = new MyClass();`, how is the caller's variable affected?", options: ["The caller's variable points to the new object", "The caller's variable remains unchanged pointing to the original object", "The program crashes", "The garbage collector immediately runs"], answer: 1, points: 10 },
        { id: "Q-JFS-004-03", type: "MCQ", prompt: "Why is StringBuilder preferred over String concatenation inside large iterations?", options: ["StringBuilder is thread-safe and synchronizes every call", "StringBuilder mutates an internal buffer avoiding quadratic object allocation", "StringBuilder stores characters directly on CPU registers", "String concatenation is deprecated in Java 21"], answer: 1, points: 10 },
        { id: "Q-JFS-004-04", type: "MCQ", prompt: "What is the primary difference between StringBuilder and StringBuffer?", options: ["StringBuffer is synchronized (thread-safe); StringBuilder is not synchronized and faster", "StringBuilder is synchronized; StringBuffer is not", "StringBuilder is for numbers only", "StringBuffer supports Unicode while StringBuilder does not"], answer: 0, points: 10 },
        { id: "Q-JFS-004-05", type: "MCQ", prompt: "What error occurs when a method calls itself endlessly without a base case?", options: ["OutOfMemoryError", "StackOverflowError", "NullPointerException", "ArithmeticException"], answer: 1, points: 10 },
        { id: "Q-JFS-004-06", type: "MCQ", prompt: "Can method overloading be differentiated solely by changing the return type?", options: ["Yes, return type is part of the method signature", "No, parameters list must differ for method overloading", "Only if the return type is void", "Only in abstract classes"], answer: 1, points: 10 },
        { id: "Q-JFS-004-07", type: "MCQ", prompt: "How is an array stored in Java memory?", options: ["Directly on the stack as contiguous bytes", "As an Object on the Heap, referenced by a pointer variable", "Inside Metaspace", "On the local hard drive buffer"], answer: 1, points: 10 },
        { id: "Q-JFS-004-08", type: "MCQ", prompt: "What is the time complexity of reading an element from an array by index?", options: ["O(N)", "O(log N)", "O(1)", "O(N^2)"], answer: 2, points: 10 },
        { id: "Q-JFS-004-09", type: "MCQ", prompt: "What does the `varargs` syntax `int... numbers` represent inside a method body?", options: ["A variable-sized pointer", "An array of type `int[]`", "A List<Integer>", "A Stream of numbers"], answer: 1, points: 10 },
        { id: "Q-JFS-004-10", type: "MCQ", prompt: "What happens when you attempt to access `array[array.length]`?", options: ["Returns null", "Returns 0", "Throws ArrayIndexOutOfBoundsException", "Allocates one more slot"], answer: 2, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-005",
      title: "Encapsulation & OOP Foundations Assessment",
      chapterId: "CH-JFS-005",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-005-01", type: "MCQ", prompt: "Which access modifier restricts member visibility strictly to the declaring class?", options: ["public", "protected", "default (package)", "private"], answer: 3, points: 10 },
        { id: "Q-JFS-005-02", type: "MCQ", prompt: "What is the core benefit of encapsulation in enterprise software design?", options: ["Faster CPU execution", "Protecting internal object state and enforcing domain invariants", "Eliminating the need for unit testing", "Allowing arbitrary global state modification"], answer: 1, points: 10 },
        { id: "Q-JFS-005-03", type: "MCQ", prompt: "Where do `static` variables and methods reside in JVM memory?", options: ["In individual thread stack frames", "In the class metadata / Metaspace shared across all instances", "In CPU L1 cache", "In temporary disk swap files"], answer: 1, points: 10 },
        { id: "Q-JFS-005-04", type: "MCQ", prompt: "Can a `static` method directly access instance variables of the class without creating an object?", options: ["Yes, static methods inherit all instance state", "No, static methods have no `this` context", "Only if the instance variables are public", "Only inside main()"], answer: 1, points: 10 },
        { id: "Q-JFS-005-05", type: "MCQ", prompt: "What is the primary role of a constructor in Java?", options: ["To allocate stack memory only", "To initialize object instance state and establish invariants", "To destroy unused references", "To compile bytecode"], answer: 1, points: 10 },
        { id: "Q-JFS-005-06", type: "MCQ", prompt: "What does constructor chaining with `this(...)` achieve?", options: ["Invokes the parent class constructor", "Invokes another overloaded constructor within the same class", "Creates two objects simultaneously", "Restarts the JVM"], answer: 1, points: 10 },
        { id: "Q-JFS-005-07", type: "MCQ", prompt: "What modifier prevents a variable from being reassigned after initial initialization?", options: ["static", "final", "abstract", "synchronized"], answer: 1, points: 10 },
        { id: "Q-JFS-005-08", type: "MCQ", prompt: "If no constructor is explicitly declared in a class, what does the Java compiler supply?", options: ["No constructor at all, causing a compile error", "A default public zero-argument constructor", "A constructor accepting null", "A private constructor"], answer: 1, points: 10 },
        { id: "Q-JFS-005-09", type: "MCQ", prompt: "What is the `protected` modifier's visibility boundary?", options: ["Same class only", "Same package plus subclasses in other packages", "Any package anywhere", "Subclasses only, excluding same package"], answer: 1, points: 10 },
        { id: "Q-JFS-005-10", type: "MCQ", prompt: "What mechanism reclaims heap memory occupied by unreachable objects?", options: ["Manual delete keyword", "The Garbage Collector (GC)", "The JIT compiler", "Operating system paging"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-006",
      title: "Inheritance, Polymorphism & Sealed Classes Assessment",
      chapterId: "CH-JFS-006",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-006-01", type: "MCQ", prompt: "How does runtime polymorphism (dynamic method dispatch) determine which overridden method to execute?", options: ["Based on the reference variable type at compile time", "Based on the actual object instantiated in the heap at runtime", "By choosing the method with fewest arguments", "By checking alphabetical order"], answer: 1, points: 10 },
        { id: "Q-JFS-006-02", type: "MCQ", prompt: "Can a Java class extend multiple concrete parent classes?", options: ["Yes, multiple class inheritance is supported", "No, Java permits single class inheritance only to avoid the Diamond Problem", "Yes, using the `implements` keyword", "Only if both parent classes are abstract"], answer: 1, points: 10 },
        { id: "Q-JFS-006-03", type: "MCQ", prompt: "What must be the first statement inside a subclass constructor if calling the superclass constructor?", options: ["this();", "super(...);", "return;", "init();"], answer: 1, points: 10 },
        { id: "Q-JFS-006-04", type: "MCQ", prompt: "What keyword was introduced in Java 17 to restrict which specific classes may extend or implement a type?", options: ["const", "sealed / permits", "closed", "locked"], answer: 1, points: 10 },
        { id: "Q-JFS-006-05", type: "MCQ", prompt: "Can an interface have concrete methods with executable code bodies?", options: ["No, interfaces can never have method bodies", "Yes, using `default` or `static` methods", "Only if the interface is marked abstract", "Only in Java 1.0"], answer: 1, points: 10 },
        { id: "Q-JFS-006-06", type: "MCQ", prompt: "What annotation should always be applied when intending to override a superclass method?", options: ["@Inherit", "@Override", "@Overwrite", "@Super"], answer: 1, points: 10 },
        { id: "Q-JFS-006-07", type: "MCQ", prompt: "Can you directly instantiate an abstract class using the `new` operator?", options: ["Yes, always", "No, abstract classes cannot be directly instantiated", "Only if they contain zero abstract methods", "Only if public"], answer: 1, points: 10 },
        { id: "Q-JFS-006-08", type: "MCQ", prompt: "What is the modifier required on permitted subclasses of a sealed class?", options: ["final, sealed, or non-sealed", "Only public", "Only abstract", "None required"], answer: 0, points: 10 },
        { id: "Q-JFS-006-09", type: "MCQ", prompt: "What software engineering principle states: 'Favor object composition over class inheritance'?", options: ["YAGNI", "Composition over Inheritance (Gang of Four)", "DRY", "KISS"], answer: 1, points: 10 },
        { id: "Q-JFS-006-10", type: "MCQ", prompt: "What happens when an overridden method in a subclass throws a broader checked exception than the parent method?", options: ["Compiles normally", "Compile error: overridden method does not throw Exception", "Runtime exception", "Warning only"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-007",
      title: "Exceptions & Collections Framework Assessment",
      chapterId: "CH-JFS-007",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-007-01", type: "MCQ", prompt: "Which of the following is a checked exception in Java?", options: ["NullPointerException", "IllegalArgumentException", "IOException", "ArrayIndexOutOfBoundsException"], answer: 2, points: 10 },
        { id: "Q-JFS-007-02", type: "MCQ", prompt: "What interface must an object implement to be eligible for use in a try-with-resources statement?", options: ["java.io.Serializable", "java.lang.AutoCloseable", "java.lang.Cloneable", "java.lang.Runnable"], answer: 1, points: 10 },
        { id: "Q-JFS-007-03", type: "MCQ", prompt: "In Java 8+, what data structure does a HashMap bucket transform into when it exceeds 8 elements?", options: ["Circular Queue", "Red-Black Tree", "Doubly Linked List", "Min-Heap"], answer: 1, points: 10 },
        { id: "Q-JFS-007-04", type: "MCQ", prompt: "If two objects are equal according to `o1.equals(o2)`, what MUST their hashCodes be?", options: ["Their hashCodes must be identical", "Their hashCodes must be different", "Their hashCodes must be negative", "There is no requirement"], answer: 0, points: 10 },
        { id: "Q-JFS-007-05", type: "MCQ", prompt: "Which collection implementation guarantees unique elements and sorts them in natural ascending order?", options: ["HashSet", "ArrayList", "TreeSet", "Vector"], answer: 2, points: 10 },
        { id: "Q-JFS-007-06", type: "MCQ", prompt: "What is the average time complexity of `get(key)` and `put(key, val)` operations in a well-distributed HashMap?", options: ["O(N)", "O(log N)", "O(1)", "O(N^2)"], answer: 2, points: 10 },
        { id: "Q-JFS-007-07", type: "MCQ", prompt: "Why should you never catch `java.lang.Error` (such as OutOfMemoryError) in standard application catch blocks?", options: ["Because Error is not a subclass of Throwable", "Because Errors represent fatal JVM conditions that cannot be safely recovered from", "Because Error is an unchecked exception", "Because the compiler forbids it"], answer: 1, points: 10 },
        { id: "Q-JFS-007-08", type: "MCQ", prompt: "Which collection interface should you choose when you need FIFO (First-In, First-Out) queue semantics?", options: ["java.util.Queue / ArrayDeque", "java.util.Set", "java.util.Map", "java.util.TreeSet"], answer: 0, points: 10 },
        { id: "Q-JFS-007-09", type: "MCQ", prompt: "What happens if a custom class overrides `equals()` but fails to override `hashCode()` when stored in a HashSet?", options: ["Compile error", "Equal objects will have different hashes and may be stored as duplicate entries", "HashSet automatically calculates a cryptographic hash", "The JVM throws HashCollisionException"], answer: 1, points: 10 },
        { id: "Q-JFS-007-10", type: "MCQ", prompt: "What does the `finally` block guarantee in an exception handling construct?", options: ["It executes only if an exception is thrown", "It executes only if no exception is thrown", "It always executes (barring JVM crash or System.exit)", "It executes on a separate background thread"], answer: 2, points: 10 },
      ]
    }
  ]
};

