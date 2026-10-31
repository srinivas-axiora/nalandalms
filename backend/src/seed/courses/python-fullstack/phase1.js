// Phase 1: Foundation (Chapters 1 to 7) - Python Full Stack Developer
// World-class curriculum: Zero to employable master.

export const phase1 = {
  chapters: [
    // ── Chapter 1 ──
    {
      id: "CH-PFS-001",
      courseId: "CRS-PFS-001",
      sequence: 1,
      title: "Introduction to Python 3.12, CPython Bytecode & The Execution Model",
      description: "Python philosophy (Zen of Python), CPython internals, compilation to .pyc bytecode, the Global Interpreter Lock (GIL), and modern environment setup with pyenv.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 1</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Introduction to Python 3.12, CPython & Bytecode Mechanics</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Python is the world's most versatile programming language, underpinning modern web applications, distributed APIs, machine learning pipelines, and cloud automation. In this chapter, you will build an exact mental model of how the CPython virtual machine compiles and evaluates source code from raw text to bytecode instructions.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc" title="Python Tutorial for Beginners - Full Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The CPython Compilation Pipeline</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Contrary to common misconceptions, Python is not a purely interpreted line-by-line language. When you run a script, CPython parses the source code into an Abstract Syntax Tree (AST), optimizes it, and compiles it into <strong>Python Bytecode</strong> before evaluating it on the stack-based virtual machine.</p>

  <div class="diagram-box" style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:12px;padding:24px;margin:24px 0;">
    <h4 style="margin-top:0;color:#0f172a;font-size:16px;">CPython Execution Pipeline</h4>
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font-family:monospace;font-size:13px;text-align:center;">
      <div style="background:#e0f2fe;border:2px solid #0284c7;padding:12px 16px;border-radius:8px;flex:1;min-width:140px;">
        <strong>app.py</strong><br><span style="color:#0369a1;">Source Code</span>
      </div>
      <div style="color:#64748b;font-weight:bold;font-size:18px;">&rarr; Parser &rarr;</div>
      <div style="background:#fef3c7;border:2px solid #d97706;padding:12px 16px;border-radius:8px;flex:1;min-width:140px;">
        <strong>AST & Bytecode</strong><br><span style="color:#b45309;">.pyc Code Object</span>
      </div>
      <div style="color:#64748b;font-weight:bold;font-size:18px;">&rarr; CPython VM &rarr;</div>
      <div style="background:#dcfce7;border:2px solid #16a34a;padding:12px 16px;border-radius:8px;flex:1;min-width:140px;">
        <strong>Host CPU</strong><br><span style="color:#15803d;">Evaluation Loop</span>
      </div>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Disassembling Python Bytecode with the <code>dis</code> Module</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import dis

def calculate_tax(gross_income: float, rate: float = 0.20) -> float:
    return gross_income * rate

# Inspect the raw bytecode instructions:
dis.dis(calculate_tax)

# Output:
#   LOAD_FAST                0 (gross_income)
#   LOAD_FAST                1 (rate)
#   BINARY_OP                5 (*)
#   RETURN_VALUE</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. What is the Global Interpreter Lock (GIL)?</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The <strong>Global Interpreter Lock (GIL)</strong> is a mutual-exclusion mutex used by CPython to prevent multiple native OS threads from executing Python bytecode simultaneously. It safeguards CPython's reference-counting memory manager from race conditions. In Python 3.12+, sub-interpreters with per-interpreter GILs have landed (PEP 684), paving the way for full free-threaded concurrency in Python 3.13.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>CPython compiles source code to bytecode cached in <code>__pycache__/*.pyc</code> before executing in the virtual machine.</li>
      <li>Python is strongly and dynamically typed: types are attached to objects in memory, not variable names.</li>
      <li>The GIL prevents multi-threaded CPU-bound parallelism in CPython; CPU parallelism requires multiprocessing.</li>
      <li>Python 3.12 brings a specialized Adaptive Interpreter that optimizes bytecode hotspots on the fly.</li>
      <li>Always use isolated virtual environments (<code>venv</code> or <code>poetry</code>) to prevent dependency conflicts across projects.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 2 ──
    {
      id: "CH-PFS-002",
      courseId: "CRS-PFS-001",
      sequence: 2,
      title: "Memory Management, Reference Counting & Garbage Collection Internals",
      description: "Everything is an object (PyObject), PyObject_HEAD, reference counting, cyclic garbage collection (gc module), id(), and mutable vs immutable memory behavior.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 2</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Memory Management: PyObject & Cyclic Garbage Collection</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In Python, <strong>everything is an object</strong>: integers, strings, functions, classes, and even modules. Understanding how CPython allocates objects on the heap, tracks references, and resolves cyclic reference memory leaks is critical for senior engineering.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The <code>PyObject</code> Anatomy & Reference Counting</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import sys

a = [1, 2, 3]
print(sys.getrefcount(a))  # Output: 2 (variable 'a' + argument to getrefcount)

b = a  # Creates another reference pointer
print(sys.getrefcount(a))  # Output: 3

del b  # Decrements reference count
print(sys.getrefcount(a))  # Output: 2</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The Cyclic Garbage Collector (Generations 0, 1, 2)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Reference counting alone cannot reclaim memory when two objects point to each other (e.g., <code>node_a.next = node_b; node_b.prev = node_a</code>). CPython runs a generational cyclic collector that detects circular reference graphs across 3 age generations and reclaims unreachable islands.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Variables in Python are pointers (references) bound to heap-allocated <code>PyObject</code> structures.</li>
      <li>CPython primary memory management relies on deterministic Reference Counting (immediate deallocation when count reaches 0).</li>
      <li>A secondary cyclic garbage collector scans container objects across 3 generations to detect isolated circular loops.</li>
      <li>Immutable objects (integers, strings, tuples) cannot be altered in place; mutating operations return new instances.</li>
      <li>Small integers (-5 to 256) and interned string literals are cached singletons in CPython memory.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 3 ──
    {
      id: "CH-PFS-003",
      courseId: "CRS-PFS-001",
      sequence: 3,
      title: "Control Flow, Structural Pattern Matching (match-case) & Comprehensions",
      description: "Conditionals, walrus operator (:=), structural pattern matching (PEP 634), for-else loops, list/dict/set comprehensions, and generator expressions.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 3</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Control Flow, Structural Pattern Matching & Comprehensions</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Modern Python features expressive control flow constructs that replace clunky nested if-else statements with declarative structural patterns, assignment expressions (the walrus operator), and concise memory-efficient comprehensions.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Structural Pattern Matching in Modern Python</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>def handle_event(event: dict) -> str:
    match event:
        case {"type": "LOGIN", "user": {"role": "admin", "name": name}}:
            return f"Admin alert: {name} accessed platform"
        case {"type": "PAYMENT", "amount": float(amount)} if amount > 10_000:
            return f"Flag high-value transaction: \${amount:,.2f}"
        case {"type": "PAYMENT", "amount": amount}:
            return f"Standard settlement: \${amount:,.2f}"
        case {"type": "ERROR", "code": int(c), **details}:
            return f"System error {c} with extra metadata: {details}"
        case _:
            return "Unhandled event format"</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Structural pattern matching (<code>match-case</code>) deconstructs objects and dictionaries with guard clauses.</li>
      <li>The Walrus operator (<code>:=</code>) assigns values to variables inside expressions, eliminating duplicate lookups.</li>
      <li>The <code>for-else</code> block executes only if the loop completes without encountering a <code>break</code> statement.</li>
      <li>Comprehensions provide concise syntax for constructing lists, dicts, and sets; avoid deeply nested comprehensions.</li>
      <li>Generator expressions (<code>(...)</code>) evaluate elements lazily, saving memory over eager list comprehensions.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 4 ──
    {
      id: "CH-PFS-004",
      courseId: "CRS-PFS-001",
      sequence: 4,
      title: "Functions as First-Class Citizens, Closures & Scope Rules (LEGB)",
      description: "Positional-only and keyword-only parameters (*, /), default argument mutable traps, LEGB scope resolution, global vs nonlocal, and function closures.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 4</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Functions as First-Class Citizens, Closures & LEGB Scope</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In Python, functions are first-class citizens: they can be passed as arguments, returned from other functions, assigned to variables, and dynamically decorated. Mastering function closures and variable scope resolution rules is the bridge to advanced decorators.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Mutable Default Argument Bug</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># CATASTROPHIC BUG: Default list is created ONCE at module definition time!
def append_item(val, items=[]):
    items.append(val)
    return items

print(append_item(1))  # [1]
print(append_item(2))  # [1, 2] -- SHARED STATE BUG!

# ENTERPRISE BEST PRACTICE:
def append_item_safe(val, items=None):
    if items is None:
        items = []
    items.append(val)
    return items</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The LEGB Scope Resolution Order</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">When Python resolves an identifier, it searches four namespaces in strict sequence:</p>
  <ul style="font-size:15px;line-height:1.8;color:#334155;">
    <li><strong>L — Local:</strong> Names assigned inside the current executing function.</li>
    <li><strong>E — Enclosing:</strong> Names in outer parent functions of a nested closure (accessed via <code>nonlocal</code>).</li>
    <li><strong>G — Global:</strong> Names assigned at the top-level of the current module file (accessed via <code>global</code>).</li>
    <li><strong>B — Built-in:</strong> Python's pre-loaded standard functions and exceptions (<code>len</code>, <code>range</code>, <code>ValueError</code>).</li>
  </ul>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Never use mutable objects (lists, dicts, sets) as default function argument values.</li>
      <li>Use <code>/</code> to enforce positional-only arguments and <code>*</code> to enforce keyword-only arguments.</li>
      <li>Python searches namespaces in strict LEGB order (Local, Enclosing, Global, Built-in).</li>
      <li>The <code>nonlocal</code> keyword binds a variable to an outer enclosing function scope in a closure.</li>
      <li>Functions capture their enclosing environment via the <code>__closure__</code> attribute.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 5 ──
    {
      id: "CH-PFS-005",
      courseId: "CRS-PFS-001",
      sequence: 5,
      title: "Data Structures Under the Hood: Lists, Tuples, Dictionaries & Sets",
      description: "Internal C array implementation of lists, compact hash table architecture in dicts (PEP 468), collision handling, and time complexities.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 5</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Data Structures Under the Hood: Lists, Dicts & Sets</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Writing performant algorithms requires understanding how built-in data structures are implemented in the CPython source code. Discover how lists achieve amortized \(O(1)\) appends and how Python dictionaries utilize compact hash tables to maintain insertion order with low memory overhead.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. List Dynamic Array Growth Strategy</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">A Python <code>list</code> is not a linked list; it is a contiguous array of pointer references (<code>PyObject**</code>). When capacity is exceeded, CPython over-allocates extra memory using the formula <code>new_allocated = (size_t)newsize + (newsize >> 3) + (newsize < 9 ? 3 : 6)</code>, guaranteeing amortized \(O(1)\) append performance.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The Compact Dictionary Architecture (Python 3.6+)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># Modern CPython dictionaries split hash tables into two arrays:
# 1. Sparse Indices Array: Maps hash bucket -> entries row index
# 2. Dense Entries Array: Stores [hash, key_ptr, value_ptr] sequentially
# This architecture saves 30-40% memory and naturally preserves insertion order!</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Python lists are contiguous pointer arrays with \(O(1)\) random indexing and amortized \(O(1)\) appends.</li>
      <li>Tuples are immutable fixed-size arrays with lower memory footprint and eligibility as dictionary keys.</li>
      <li>Dictionaries and Sets provide average \(O(1)\) lookups, insertions, and deletions via compact hash tables.</li>
      <li>Only hashable objects (implementing <code>__hash__</code> and <code>__eq__</code>) can serve as dictionary keys or set elements.</li>
      <li>Use <code>collections.deque</code> for \(O(1)\) append and pop operations from both ends (unlike list \(O(N)\) pop(0)).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 6 ──
    {
      id: "CH-PFS-006",
      courseId: "CRS-PFS-001",
      sequence: 6,
      title: "Object-Oriented Python: Dunder Methods, Method Resolution Order (MRO) & Metaclasses",
      description: "Class creation, __init__ vs __new__, magic dunder methods (__repr__, __str__, __eq__, __hash__), C3 linearization algorithm for MRO, and metaclass architecture.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 6</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Object-Oriented Python, Dunder Protocols & MRO</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Python's object system is dynamic and protocol-driven. Instead of rigid interfaces, Python uses <strong>Duck Typing</strong> and magic double-underscore ('dunder') methods to integrate custom domain classes seamlessly with Python operators and built-in functions.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Pythonic Value Object Pattern with Dunder Methods</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>class Money:
    __slots__ = ('_amount', '_currency')  # Eliminates per-instance __dict__ saving RAM

    def __init__(self, amount: float, currency: str = "USD"):
        self._amount = round(amount, 2)
        self._currency = currency.upper()

    def __repr__(self) -> str:
        return f"Money({self._amount!r}, {self._currency!r})"

    def __eq__(self, other) -> bool:
        if not isinstance(other, Money):
            return False
        return self._amount == other._amount and self._currency == other._currency

    def __hash__(self) -> int:
        return hash((self._amount, self._currency))

    def __add__(self, other: 'Money') -> 'Money':
        if self._currency != other._currency:
            raise ValueError(f"Cannot add {self._currency} to {other._currency}")
        return Money(self._amount + other._amount, self._currency)</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Multiple Inheritance & C3 Linearization (MRO)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">When classes use multiple inheritance, Python resolves attribute lookups using the <strong>C3 Linearization Algorithm</strong>. Inspect any class's lookup order with <code>ClassName.__mro__</code> or <code>ClassName.mro()</code> to understand super() method chaining.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>__new__</code> is the static constructor that creates instances; <code>__init__</code> initializes instance attributes.</li>
      <li>Define <code>__slots__</code> on millions of small instances to eliminate dynamic dictionaries and cut memory by 50%.</li>
      <li>Always implement <code>__repr__</code> for developer debugging and <code>__str__</code> for user display.</li>
      <li>Multiple inheritance orders method calls deterministically using the C3 Linearization MRO algorithm.</li>
      <li>Metaclasses (subclasses of <code>type</code>) customize the creation and validation of classes themselves.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 7 ──
    {
      id: "CH-PFS-007",
      courseId: "CRS-PFS-001",
      sequence: 7,
      title: "Exception Handling Architecture & Custom Enterprise Hierarchies",
      description: "BaseException vs Exception, exception chaining (raise from), custom domain exception design, clean cleanup with try-except-else-finally, and sys.exc_info.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundation • Chapter 7</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Exception Handling Architecture & Custom Hierarchies</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Enterprise applications must fail predictably. In this chapter, you will master Python's exception hierarchy, explicit exception chaining (<code>raise ... from ...</code>) to preserve root causes, and designing domain-driven exception hierarchies for commercial APIs.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Explicit Exception Chaining (<code>raise from</code>)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>class PaymentGatewayError(Exception):
    """Raised when external payment provider fails."""
    pass

def process_transaction(user_id: str, amount: float):
    try:
        # Simulate network or socket failure
        raise ConnectionResetError("Stripe API connection timed out")
    except ConnectionResetError as err:
        # Chains the original low-level error as __cause__
        raise PaymentGatewayError(f"Payment failed for user {user_id}") from err</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Never catch <code>BaseException</code> directly; always catch specific subclasses of <code>Exception</code>.</li>
      <li>The <code>else</code> block executes only when the <code>try</code> block succeeds without raising any exceptions.</li>
      <li>Use <code>raise NewException from original_err</code> to preserve full forensic tracebacks of underlying errors.</li>
      <li>Design custom exception hierarchies rooted in a common domain base exception (e.g., <code>AppBaseException</code>).</li>
      <li>EAFP (Easier to Ask for Forgiveness than Permission) is the idiomatic Python design philosophy.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 1 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-PFS-001",
      title: "Python 3.12 & CPython Internals Assessment",
      chapterId: "CH-PFS-001",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-001-01", type: "MCQ", prompt: "What standard module allows disassembling Python functions into human-readable bytecode instructions?", options: ["dis", "inspect", "ast", "bytecode"], answer: 0, points: 10 },
        { id: "Q-PFS-001-02", type: "MCQ", prompt: "What is the primary role of the Global Interpreter Lock (GIL) in CPython?", options: ["To speed up multi-threaded math calculations", "To protect CPython's reference-counting memory management from race conditions by allowing only one native thread to execute bytecode at a time", "To encrypt source code", "To prevent file modifications"], answer: 1, points: 10 },
        { id: "Q-PFS-001-03", type: "MCQ", prompt: "Where are compiled Python bytecode files cached on disk?", options: ["In the root directory as .exe", "Inside `__pycache__/*.pyc` directories", "In the browser cache", "In `/tmp/python/`"], answer: 1, points: 10 },
        { id: "Q-PFS-001-04", type: "MCQ", prompt: "What does the command `python -m this` output in the terminal?", options: ["Python version info", "The Zen of Python (Tim Peters)", "Installed pip packages", "Current working directory"], answer: 1, points: 10 },
        { id: "Q-PFS-001-05", type: "MCQ", prompt: "Which type system description accurately characterizes Python?", options: ["Statically and weakly typed", "Dynamically and strongly typed", "Statically and strongly typed", "Dynamically and weakly typed"], answer: 1, points: 10 },
        { id: "Q-PFS-001-06", type: "MCQ", prompt: "What major performance improvement was introduced in the Python 3.11 and 3.12 runtime?", options: ["Removal of all data structures", "The Faster CPython Project specializing adaptive interpreter and JIT infrastructure", "Switching to pure C++", "Removing garbage collection"], answer: 1, points: 10 },
        { id: "Q-PFS-001-07", type: "MCQ", prompt: "How can true multi-core CPU parallelism be achieved in standard Python without GIL contention?", options: ["Using the `threading` module", "Using the `multiprocessing` module (spawning independent OS processes)", "Using `asyncio`", "Writing code in comments"], answer: 1, points: 10 },
        { id: "Q-PFS-001-08", type: "MCQ", prompt: "What tool manages multiple installed versions of Python on a developer machine?", options: ["pyenv", "pip", "npm", "gcc"], answer: 0, points: 10 },
        { id: "Q-PFS-001-09", type: "MCQ", prompt: "What is the virtual machine type of CPython?", options: ["Register-based VM", "Stack-based virtual machine", "Turing tape machine", "Quantum VM"], answer: 1, points: 10 },
        { id: "Q-PFS-001-10", type: "MCQ", prompt: "What happens when you execute `python script.py` vs importing `import script`?", options: ["`__name__` is set to `'__main__'` when executed directly, but to `'script'` when imported", "Imports are not compiled", "Direct execution skips syntax checks", "They behave identically"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-002",
      title: "Memory Management & Reference Counting Assessment",
      chapterId: "CH-PFS-002",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-002-01", type: "MCQ", prompt: "What function in the `sys` module returns the total reference count of an object?", options: ["sys.refcount()", "sys.getrefcount()", "sys.count_refs()", "sys.mem()"], answer: 1, points: 10 },
        { id: "Q-PFS-002-02", type: "MCQ", prompt: "Why does `sys.getrefcount(x)` always return a value 1 higher than expected?", options: ["It counts the variable name", "Passing `x` into `getrefcount(x)` creates a temporary reference on the function parameter stack", "CPython bugs", "Reference counts are doubled in Python"], answer: 1, points: 10 },
        { id: "Q-PFS-002-03", type: "MCQ", prompt: "What type of memory leak cannot be detected by reference counting alone?", options: ["Large string allocations", "Circular (cyclic) references between objects", "Unclosed files", "Global variables"], answer: 1, points: 10 },
        { id: "Q-PFS-002-04", type: "MCQ", prompt: "How many generations does CPython's cyclic garbage collector track?", options: ["1 generation", "2 generations", "3 generations (0, 1, and 2)", "10 generations"], answer: 2, points: 10 },
        { id: "Q-PFS-002-05", type: "MCQ", prompt: "What is the result of `a = 256; b = 256; a is b` in standard CPython?", options: ["True (small integers from -5 to 256 are pre-allocated interned singletons)", "False", "Throws TypeError", "None"], answer: 0, points: 10 },
        { id: "Q-PFS-002-06", type: "MCQ", prompt: "What does the `is` operator compare in Python?", options: ["Object equality / values", "Object identity (memory address in RAM)", "String length", "Class name"], answer: 1, points: 10 },
        { id: "Q-PFS-002-07", type: "MCQ", prompt: "Which of the following types is MUTABLE in Python?", options: ["tuple", "frozenset", "list", "str"], answer: 2, points: 10 },
        { id: "Q-PFS-002-08", type: "MCQ", prompt: "What module provides programmatic controls over the cyclic garbage collection engine?", options: ["gc", "mem", "sys", "trace"], answer: 0, points: 10 },
        { id: "Q-PFS-002-09", type: "MCQ", prompt: "What happens when you delete a variable with `del x` in Python?", options: ["Memory is immediately zeroed out", "The name `x` is unbound from local scope and the target object's reference count is decremented by 1", "The computer hard drive is formatted", "All references to the object are deleted"], answer: 1, points: 10 },
        { id: "Q-PFS-002-10", type: "MCQ", prompt: "What built-in function returns the unique integer memory identifier of an object in CPython?", options: ["id()", "hash()", "address()", "pointer()"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-003",
      title: "Control Flow & Pattern Matching Assessment",
      chapterId: "CH-PFS-003",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-003-01", type: "MCQ", prompt: "What keyword sequence was introduced in Python 3.10 for Structural Pattern Matching?", options: ["switch-case", "match-case", "select-when", "branch-case"], answer: 1, points: 10 },
        { id: "Q-PFS-003-02", type: "MCQ", prompt: "What is the wildcard catch-all pattern in a `match-case` block?", options: ["case default:", "case _:", "case *:", "case else:"], answer: 1, points: 10 },
        { id: "Q-PFS-003-03", type: "MCQ", prompt: "What is the operator `:=` officially named in Python?", options: ["The Walrus Operator (Assignment Expression)", "The Elvis Operator", "The Diamond Operator", "The Rocket Operator"], answer: 0, points: 10 },
        { id: "Q-PFS-003-04", type: "MCQ", prompt: "When does the `else` clause attached to a `for` loop execute?", options: ["Whenever the loop finishes normally without hitting a `break` statement", "On every iteration", "Only if an exception is thrown", "If the loop never executes at all"], answer: 0, points: 10 },
        { id: "Q-PFS-003-05", type: "MCQ", prompt: "What does `[x**2 for x in range(5) if x % 2 == 0]` evaluate to?", options: ["[0, 4, 16]", "[1, 9]", "[0, 1, 4, 9, 16]", "[4, 16]"], answer: 0, points: 10 },
        { id: "Q-PFS-003-06", type: "MCQ", prompt: "What is the syntax for creating a dictionary comprehension?", options: ["{k: v for k, v in items}", "[k: v for k, v in items]", "(k: v for k, v in items)", "<k: v for k, v in items>"], answer: 0, points: 10 },
        { id: "Q-PFS-003-07", type: "MCQ", prompt: "How does a generator expression `(x*2 for x in range(1000000))` differ from a list comprehension?", options: ["It creates values lazily on demand without allocating the full list in memory", "It runs 10x slower", "It returns a tuple", "It modifies the global scope"], answer: 0, points: 10 },
        { id: "Q-PFS-003-08", type: "MCQ", prompt: "What clause adds a conditional guard to a pattern in `match-case` (e.g., `case [x, y] if x > y:`)?", options: ["when", "if", "guard", "where"], answer: 1, points: 10 },
        { id: "Q-PFS-003-09", type: "MCQ", prompt: "What does the `break` statement do inside nested loops?", options: ["Terminates all enclosing loops", "Terminates only the innermost loop in which it occurs", "Restarts the script", "Skips to the next iteration"], answer: 1, points: 10 },
        { id: "Q-PFS-003-10", type: "MCQ", prompt: "What built-in function returns both index and element during a for loop iteration?", options: ["enumerate()", "zip()", "items()", "range()"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-004",
      title: "Functions, Closures & LEGB Scope Assessment",
      chapterId: "CH-PFS-004",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-004-01", type: "MCQ", prompt: "Why is `def append_to(item, target=[])` considered a serious anti-pattern in Python?", options: ["It raises a SyntaxError", "The default list is instantiated once at function definition time, sharing state across all subsequent invocations", "Lists cannot be default arguments", "It causes a compiler warning"], answer: 1, points: 10 },
        { id: "Q-PFS-004-02", type: "MCQ", prompt: "What is the correct resolution order of namespaces in Python's LEGB rule?", options: ["Local, Enclosing, Global, Built-in", "Local, Global, External, Base", "Lexical, Environment, Global, Binary", "List, Element, Group, Block"], answer: 0, points: 10 },
        { id: "Q-PFS-004-03", type: "MCQ", prompt: "What keyword binds a variable in a nested function to the outer enclosing function's scope?", options: ["global", "nonlocal", "outer", "super"], answer: 1, points: 10 },
        { id: "Q-PFS-004-04", type: "MCQ", prompt: "What does the `/` symbol in a function signature `def fn(a, b, /, c):` specify?", options: ["Division operation", "Parameters before `/` must be passed as positional-only arguments", "Parameters must be integers", "Arguments are optional"], answer: 1, points: 10 },
        { id: "Q-PFS-004-05", type: "MCQ", prompt: "What does a single asterisk `*` in a function signature `def fn(a, *, b):` mandate?", options: ["Pointers", "Parameters after `*` must be passed exclusively as keyword arguments", "Multiplication", "Variable arguments"], answer: 1, points: 10 },
        { id: "Q-PFS-004-06", type: "MCQ", prompt: "What does `*args` collect in a function definition?", options: ["Arbitrary extra positional arguments into a tuple", "Keyword arguments into a dict", "A list of strings", "File descriptors"], answer: 0, points: 10 },
        { id: "Q-PFS-004-07", type: "MCQ", prompt: "What does `**kwargs` collect in a function definition?", options: ["Arbitrary extra keyword arguments into a dictionary", "Positional arguments into a tuple", "A database query", "Environment variables"], answer: 0, points: 10 },
        { id: "Q-PFS-004-08", type: "MCQ", prompt: "What is a closure in Python?", options: ["A function that has terminated", "A function object that remembers values in enclosing scopes even if they are no longer in memory", "A locked file", "A class destructor"], answer: 1, points: 10 },
        { id: "Q-PFS-004-09", type: "MCQ", prompt: "What special attribute on a function stores its docstring documentation?", options: ["__doc__", "__info__", "__help__", "__str__"], answer: 0, points: 10 },
        { id: "Q-PFS-004-10", type: "MCQ", prompt: "What is a lambda function in Python?", options: ["An anonymous, single-expression inline function", "A background thread", "A microservice container", "A mathematical constant"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-005",
      title: "Data Structures Under the Hood Assessment",
      chapterId: "CH-PFS-005",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-005-01", type: "MCQ", prompt: "What is the internal C implementation of a Python `list` in CPython?", options: ["A doubly linked list", "A contiguous dynamic array of `PyObject*` pointers", "A red-black tree", "A hash table"], answer: 1, points: 10 },
        { id: "Q-PFS-005-02", type: "MCQ", prompt: "What is the average time complexity of looking up a key in a Python dictionary?", options: ["O(1)", "O(N)", "O(log N)", "O(N^2)"], answer: 0, points: 10 },
        { id: "Q-PFS-005-03", type: "MCQ", prompt: "What is the time complexity of `list.pop(0)` (removing the first element)?", options: ["O(1)", "O(N) because all subsequent elements must be shifted left in memory", "O(log N)", "O(N log N)"], answer: 1, points: 10 },
        { id: "Q-PFS-005-04", type: "MCQ", prompt: "Which data structure from the `collections` module provides O(1) pops and appends from BOTH ends?", options: ["collections.deque", "collections.OrderedDict", "collections.Counter", "collections.defaultdict"], answer: 0, points: 10 },
        { id: "Q-PFS-005-05", type: "MCQ", prompt: "What requirement must an object meet to be valid as a dictionary key or set item?", options: ["It must be mutable", "It must be hashable (implementing `__hash__` and `__eq__`, immutable throughout its lifecycle)", "It must be an integer", "It must be a string"], answer: 1, points: 10 },
        { id: "Q-PFS-005-06", type: "MCQ", prompt: "Can a standard Python list be used as a dictionary key?", options: ["Yes, always", "No, because lists are unhashable and mutable (raises TypeError: unhashable type: 'list')", "Only if empty", "Only in Python 3.12"], answer: 1, points: 10 },
        { id: "Q-PFS-005-07", type: "MCQ", prompt: "How did Python 3.6+ achieve compact dictionaries that preserve insertion order?", options: ["By splitting storage into a small sparse indices array and a dense sequential entries array", "By sorting keys alphabetically", "By using binary trees", "By writing keys to disk"], answer: 0, points: 10 },
        { id: "Q-PFS-005-08", type: "MCQ", prompt: "What method safely returns a dictionary value or a default without raising a `KeyError`?", options: ["dict.get(key, default)", "dict.find()", "dict.search()", "dict.lookup()"], answer: 0, points: 10 },
        { id: "Q-PFS-005-09", type: "MCQ", prompt: "What set operation calculates elements present in Set A but NOT in Set B?", options: ["A | B (Union)", "A & B (Intersection)", "A - B (Difference)", "A ^ B (Symmetric Difference)"], answer: 2, points: 10 },
        { id: "Q-PFS-005-10", type: "MCQ", prompt: "What is the difference between `list.sort()` and `sorted(list)`?", options: ["`list.sort()` mutates the list in place returning None; `sorted(list)` returns a new sorted list", "`sorted()` only works on numbers", "`list.sort()` is deprecated", "There is no difference"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-006",
      title: "OOP & Dunder Protocols Assessment",
      chapterId: "CH-PFS-006",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-006-01", type: "MCQ", prompt: "What algorithm does Python use to determine the Method Resolution Order (MRO) for multiple inheritance?", options: ["Depth-First Search", "C3 Linearization Algorithm", "Breadth-First Search", "Dijkstra's Algorithm"], answer: 1, points: 10 },
        { id: "Q-PFS-006-02", type: "MCQ", prompt: "What is the distinction between `__init__` and `__new__` in Python class instantiation?", options: ["`__new__` creates and returns the new instance object; `__init__` initializes the created instance's state", "`__init__` creates memory; `__new__` destroys it", "`__new__` is only for metaclasses", "They are aliases"], answer: 0, points: 10 },
        { id: "Q-PFS-006-03", type: "MCQ", prompt: "What optimization does defining `__slots__` provide on a class?", options: ["Prevents subclassing", "Suppresses the automatic creation of a per-instance `__dict__`, significantly reducing memory usage for millions of objects", "Compiles code to C++", "Makes all attributes public"], answer: 1, points: 10 },
        { id: "Q-PFS-006-04", type: "MCQ", prompt: "What dunder method is invoked when `str(obj)` or `print(obj)` is called?", options: ["__str__", "__repr__", "__print__", "__text__"], answer: 0, points: 10 },
        { id: "Q-PFS-006-05", type: "MCQ", prompt: "What is the purpose of `__repr__` compared to `__str__`?", options: ["`__repr__` is intended for developers/debugging and should ideally be an unambiguous expression that recreates the object", "`__repr__` is for end users only", "`__repr__` returns an integer", "`__repr__` is deprecated"], answer: 0, points: 10 },
        { id: "Q-PFS-006-06", type: "MCQ", prompt: "What dunder method overloads the addition operator `+` between objects?", options: ["__add__", "__plus__", "__sum__", "__concat__"], answer: 0, points: 10 },
        { id: "Q-PFS-006-07", type: "MCQ", prompt: "What is the default metaclass of all standard classes in Python?", options: ["object", "type", "class", "base"], answer: 1, points: 10 },
        { id: "Q-PFS-006-08", type: "MCQ", prompt: "What decorator transforms a method into a managed read-only attribute getter?", options: ["@staticmethod", "@classmethod", "@property", "@getter"], answer: 2, points: 10 },
        { id: "Q-PFS-006-09", type: "MCQ", prompt: "What is the difference between `@classmethod` and `@staticmethod`?", options: ["`@classmethod` receives the class `cls` as its first argument; `@staticmethod` receives no implicit first argument", "`@staticmethod` receives `self`", "`@classmethod` can only be called once", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-PFS-006-10", type: "MCQ", prompt: "What does name mangling with double leading underscores (e.g., `__balance`) do in Python classes?", options: ["Makes the variable truly cryptographically private", "Rewrites the attribute internally to `_ClassName__balance` to prevent accidental namespace collisions in subclasses", "Deletes the variable", "Throws an error if accessed"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-007",
      title: "Exception Handling Architecture Assessment",
      chapterId: "CH-PFS-007",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-007-01", type: "MCQ", prompt: "Why should you never write `except BaseException:` or bare `except:` in standard application code?", options: ["It will intercept system-exiting signals like `KeyboardInterrupt` (Ctrl+C) and `SystemExit`, preventing normal termination", "It causes a syntax error", "It slows down CPU clock", "BaseException does not catch errors"], answer: 0, points: 10 },
        { id: "Q-PFS-007-02", type: "MCQ", prompt: "What syntax explicitly chains a lower-level exception to a high-level domain exception in Python?", options: ["raise CustomError from original_err", "raise CustomError with original_err", "raise CustomError.chain(original_err)", "throw CustomError(original_err)"], answer: 0, points: 10 },
        { id: "Q-PFS-007-03", type: "MCQ", prompt: "When does the `else` block of a `try-except-else-finally` construct execute?", options: ["Only when the `try` block executes completely without raising any exceptions", "Whenever an exception occurs", "Always, right before finally", "Only if finally fails"], answer: 0, points: 10 },
        { id: "Q-PFS-007-04", type: "MCQ", prompt: "What does the `finally` block guarantee?", options: ["It executes regardless of whether an exception occurred or was handled (ideal for releasing resources)", "It executes only on errors", "It catches uncaught exceptions", "It suppresses warnings"], answer: 0, points: 10 },
        { id: "Q-PFS-007-05", type: "MCQ", prompt: "What does EAFP stand for in Python engineering culture?", options: ["Easier to Ask for Forgiveness than Permission (relying on try-except rather than complex pre-checks)", "Errors Are Fatal Problems", "Evaluate Always First Pass", "Exceptions Are Fast Paths"], answer: 0, points: 10 },
        { id: "Q-PFS-007-06", type: "MCQ", prompt: "How do you re-raise the currently active exception inside an except block without altering its traceback?", options: ["raise", "raise None", "re-raise", "continue"], answer: 0, points: 10 },
        { id: "Q-PFS-007-07", type: "MCQ", prompt: "What feature introduced in Python 3.11 allows raising and handling multiple independent exceptions concurrently (e.g., in asyncio task groups)?", options: ["ExceptionGroup and `except*` syntax", "MultiException", "BatchException", "ClusterError"], answer: 0, points: 10 },
        { id: "Q-PFS-007-08", type: "MCQ", prompt: "What base class should custom enterprise business logic exceptions inherit from?", options: ["Exception", "BaseException", "StandardError", "SystemError"], answer: 0, points: 10 },
        { id: "Q-PFS-007-09", type: "MCQ", prompt: "What attribute on an exception object contains the underlying cause attached via `raise ... from ...`?", options: ["__cause__", "__source__", "__root__", "__parent__"], answer: 0, points: 10 },
        { id: "Q-PFS-007-10", type: "MCQ", prompt: "What function from the `traceback` module formats an exception traceback as a string for structured logging?", options: ["traceback.format_exc()", "traceback.print()", "traceback.dump()", "sys.trace()"], answer: 0, points: 10 },
      ]
    }
  ]
};

