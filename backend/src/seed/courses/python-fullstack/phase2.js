// Phase 2: Applied (Chapters 8 to 14) - Python Full Stack Developer
// Generators, Decorators, Context Managers, Type Hinting, Pydantic v2, AsyncIO & Packaging.

export const phase2 = {
  chapters: [
    // ── Chapter 8 ──
    {
      id: "CH-PFS-008",
      courseId: "CRS-PFS-001",
      sequence: 8,
      title: "Advanced Iteration: Generators, The Yield Statement & Lazy Streaming Pipelines",
      description: "Iterator protocol (__iter__, __next__), generator functions, yield from delegation, memory-efficient multi-gigabyte log streaming, and coroutine pipelines.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 8</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Generators, Lazy Streaming & The Iterator Protocol</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Processing massive datasets without exhausting server memory requires streaming. Python's <strong>Iterator Protocol</strong> and <strong>Generators</strong> allow you to compute and yield items lazily one at a time, keeping memory consumption constant \(O(1)\) regardless of file size.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/bD05uGo_sVI" title="Python Generators and Yield" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Memory Profiling: Eager Lists vs Lazy Generators</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from typing import Generator
import sys

# ANTI-PATTERN: Eagerly builds 10 million integers in RAM (~80MB RAM):
# numbers_list = [x for x in range(10_000_000)]

# ENTERPRISE BEST PRACTICE: Generator object occupies merely ~100 bytes!
def stream_large_log(filepath: str) -> Generator[str, None, None]:
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            if "CRITICAL" in line:
                yield line.strip()

# Pipeline composition with zero intermediate memory allocation:
critical_lines = stream_large_log("production.log")
for entry in critical_lines:
    alert_pagerduty(entry)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>The Iterator protocol requires implementing <code>__iter__()</code> and <code>__next__()</code> raising <code>StopIteration</code>.</li>
      <li>Functions containing the <code>yield</code> keyword pause execution state and return a generator object.</li>
      <li>Use <code>yield from sub_generator</code> to delegate iteration cleanly to nested generator functions.</li>
      <li>Generators allow processing terabyte-scale log streams within a bounded 10MB memory envelope.</li>
      <li>Generators are single-pass: once exhausted, they cannot be rewound or restarted.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 9 ──
    {
      id: "CH-PFS-009",
      courseId: "CRS-PFS-001",
      sequence: 9,
      title: "Meta-Programming with Decorators: Closures, functools.wraps & Parameterized Wrappers",
      description: "Function decorators, preserving metadata with functools.wraps, decorators with arguments, class decorators, caching with lru_cache, and rate-limiting wrappers.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 9</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Decorators, functools.wraps & Parameterized Wrappers</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Decorators are Python's cleanest mechanism for Aspect-Oriented Programming (AOP). They enable cross-cutting concerns—such as execution timing, authentication verification, caching, and retry logic—to wrap existing functions without modifying their core implementation.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Production Retry Decorator with Parameters</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import functools
import time
import logging

def retry(max_attempts: int = 3, delay_seconds: float = 1.0):
    def decorator(func):
        @functools.wraps(func)  # Crucial: Preserves __name__, __doc__, and annotations!
        def wrapper(*args, **kwargs):
            last_err = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as err:
                    last_err = err
                    logging.warning(f"Attempt {attempt}/{max_attempts} failed for {func.__name__}: {err}")
                    time.sleep(delay_seconds)
            raise RuntimeError(f"{func.__name__} failed after {max_attempts} retries") from last_err
        return wrapper
    return decorator

@retry(max_attempts=3, delay_seconds=0.5)
def fetch_payment_status(charge_id: str) -> dict:
    # Remote HTTP call
    pass</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>A decorator is a callable that accepts a function and returns a modified wrapper function.</li>
      <li>Always decorate inner wrappers with <code>@functools.wraps(func)</code> to preserve function metadata and docstrings.</li>
      <li>Parameterized decorators require 3 levels of nested functions (factory &rarr; decorator &rarr; wrapper).</li>
      <li>Use <code>functools.lru_cache(maxsize=128)</code> to memoize pure deterministic functions.</li>
      <li>Decorators can also be applied to classes to register or mutate class attributes at import time.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 10 ──
    {
      id: "CH-PFS-010",
      courseId: "CRS-PFS-001",
      sequence: 10,
      title: "Resource Management: Context Managers & The contextlib Framework",
      description: "The with statement, __enter__ and __exit__ protocols, exception handling in context managers, contextlib.contextmanager generator syntax, and async context managers.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 10</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Context Managers & The contextlib Framework</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Deterministic resource management guarantees that file handles, database connections, locks, and network sockets are safely released even in the presence of unhandled runtime errors. The <code>with</code> statement encapsulates setup and teardown logic reliably.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Declarative Context Managers with <code>@contextlib.contextmanager</code></h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from contextlib import contextmanager
import time

@contextmanager
def execution_timer(operation_name: str):
    start = time.perf_counter()
    try:
        yield  # Control transfers to the inside of the 'with' block
    finally:
        elapsed = (time.perf_counter() - start) * 1000
        print(f"[{operation_name}] executed in {elapsed:.2f}ms")

# Usage:
with execution_timer("Bulk Database Ingestion"):
    ingest_million_records()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Context managers implement <code>__enter__()</code> (setup) and <code>__exit__()</code> (cleanup).</li>
      <li>Returning <code>True</code> from <code>__exit__()</code> suppresses any exception that occurred inside the with block.</li>
      <li>Use <code>@contextlib.contextmanager</code> to convert generator functions with a try-finally into clean context managers.</li>
      <li>Asynchronous context managers implement <code>__aenter__()</code> and <code>__aexit__()</code> for <code>async with</code> blocks.</li>
      <li><code>contextlib.suppress(FileNotFoundError)</code> provides clean, idiomatic exception ignoring.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 11 ──
    {
      id: "CH-PFS-011",
      courseId: "CRS-PFS-001",
      sequence: 11,
      title: "Modern Type Hinting, Static Analysis with Mypy & Pydantic v2 Architecture",
      description: "PEP 484 type hints, Generics (TypeVar, ParamSpec), Union/Optional (|), static analysis with Mypy, and ultra-fast Rust-powered data validation with Pydantic v2.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 11</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Type Hinting, Mypy & Pydantic v2 Architecture</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Type hints transformed Python from a loose scripting language into an enterprise software powerhouse. Mypy verifies contracts at CI build time, while <strong>Pydantic v2</strong> (rewritten in Rust with <code>pydantic-core</code>) provides microsecond data parsing and validation for modern FastAPI APIs.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Enterprise Domain Validation with Pydantic v2</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime

class UserRegistrationSchema(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    age: int = Field(ge=18, le=120)
    registered_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot contain only whitespace")
        return v.title()

# Strict runtime parsing & serialization:
user = UserRegistrationSchema.model_validate_json('{"email": "ada@nalanda.edu", "full_name": "ada lovelace", "age": 28}')
print(user.full_name)  # Ada Lovelace (automatically cleaned and validated!)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Python type hints are not enforced at runtime by default; they enable static analysis tools like Mypy and Pyright.</li>
      <li>Modern Python 3.10+ uses pipe syntax for unions: <code>int | str</code> instead of <code>Union[int, str]</code>.</li>
      <li>Pydantic v2 is powered by Rust (<code>pydantic-core</code>), running data parsing 5-17x faster than v1.</li>
      <li>Use <code>Field(...)</code> to declare validation boundaries, regex constraints, and OpenAPI documentation metadata.</li>
      <li>Always configure strict type checking (<code>mypy --strict</code>) in automated CI pull-request checks.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 12 ──
    {
      id: "CH-PFS-012",
      courseId: "CRS-PFS-001",
      sequence: 12,
      title: "Asynchronous Programming: Event Loops, Coroutines, AsyncIO & TaskGroups",
      description: "Cooperative multitasking vs preemptive threads, the event loop, async/await mechanics, asyncio.gather, TaskGroups (Python 3.11+), and avoiding blocking calls.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 12</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Asynchronous Programming with AsyncIO & TaskGroups</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Modern web backends spend 90% of their time waiting for network sockets, database queries, and third-party APIs. <strong>AsyncIO</strong> uses cooperative single-threaded multitasking around an Event Loop, allowing a single Python process to service tens of thousands of concurrent client connections.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/t5Bo1Je9EmE" title="AsyncIO in Python - Full Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Structured Concurrency with <code>asyncio.TaskGroup</code> (Python 3.11+)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import asyncio
import httpx

async def fetch_service_data(client: httpx.AsyncClient, endpoint: str) -> dict:
    resp = await client.get(endpoint, timeout=5.0)
    return resp.json()

async def main():
    async with httpx.AsyncClient() as client:
        # TaskGroup guarantees that if one task fails, remaining tasks are cleanly cancelled!
        async with asyncio.TaskGroup() as tg:
            task1 = tg.create_task(fetch_service_data(client, "https://api.nalanda.edu/users"))
            task2 = tg.create_task(fetch_service_data(client, "https://api.nalanda.edu/courses"))

        # Both tasks completed concurrently:
        print("Users:", task1.result())
        print("Courses:", task2.result())

asyncio.run(main())</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>AsyncIO is single-threaded cooperative multitasking: tasks yield control voluntarily via <code>await</code>.</li>
      <li>Never execute synchronous blocking calls (e.g., <code>time.sleep()</code>, standard <code>requests.get()</code>) inside async functions.</li>
      <li>Offload unavoidable CPU-bound tasks to worker pools using <code>asyncio.to_thread()</code>.</li>
      <li>Adopt <code>asyncio.TaskGroup</code> (Python 3.11+) for structured concurrency with automatic cleanup on errors.</li>
      <li>AsyncIO shines for high-concurrency I/O-bound web APIs (the foundation of FastAPI).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 13 ──
    {
      id: "CH-PFS-013",
      courseId: "CRS-PFS-001",
      sequence: 13,
      title: "Concurrency Architectures: ThreadPoolExecutor, ProcessPoolExecutor & IPC",
      description: "concurrent.futures framework, thread vs process trade-offs, shared memory, inter-process communication (IPC with multiprocessing.Queue), and CPU vs I/O bound optimization.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 13</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Concurrency: ThreadPoolExecutor vs ProcessPoolExecutor</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Choosing the right concurrency model dictates backend scalability. The standard <code>concurrent.futures</code> module abstracts thread and process pools behind a unified API, enabling seamless switching between multi-threading for I/O and multi-processing for CPU-bound computation.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Parallelizing CPU-Intensive Tasks Across All Cores</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from concurrent.futures import ProcessPoolExecutor, as_completed
import os

def cpu_intensive_hashing(payload: str) -> str:
    # CPU calculation running in separate OS process, bypassing GIL!
    import hashlib
    res = payload.encode()
    for _ in range(500_000):
        res = hashlib.sha256(res).digest()
    return res.hex()

def main():
    items = [f"batch_{i}" for i in range(16)]
    # Automatically scales to match host CPU core count:
    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        futures = {executor.submit(cpu_intensive_hashing, item): item for item in items}
        for future in as_completed(futures):
            print(f"Processed: {futures[future]} -> {future.result()[:16]}...")

if __name__ == "__main__":
    main()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Use <code>ThreadPoolExecutor</code> for moderate I/O tasks where threads share memory with negligible creation cost.</li>
      <li>Use <code>ProcessPoolExecutor</code> for heavy CPU tasks (image resizing, ML inference, crypto) to bypass the GIL.</li>
      <li>Always protect entry points with <code>if __name__ == '__main__':</code> to prevent recursive fork bombs on Windows/macOS.</li>
      <li>Data passed between processes must be pickleable for inter-process communication.</li>
      <li>Monitor OS memory consumption: spawning 64 worker processes duplicates baseline process memory footprints.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 14 ──
    {
      id: "CH-PFS-014",
      courseId: "CRS-PFS-001",
      sequence: 14,
      title: "Enterprise Project Packaging: Poetry, pyproject.toml (PEP 621) & Virtual Environments",
      description: "Modern Python packaging standards, dependency lockfiles (poetry.lock), publishing wheels, semantic versioning, and pre-commit hooks (ruff, black, mypy).",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Applied • Chapter 14</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Modern Packaging: Poetry, pyproject.toml & Tooling</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Legacy Python projects suffered from fragmented configuration across <code>setup.py</code>, <code>setup.cfg</code>, <code>requirements.txt</code>, and <code>MANIFEST.in</code>. Modern Python standardizes all project metadata, dependency trees, and tool configurations into a single <strong>pyproject.toml</strong> file governed by <strong>Poetry</strong>.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Standard <code>pyproject.toml</code> Configuration</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>[tool.poetry]
name = "nalanda-core-api"
version = "2.0.0"
description = "Enterprise Full-Stack Backend API"
authors = ["Nalanda Engineering <dev@nalanda.edu>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.110.0"
pydantic = "^2.6.0"
uvicorn = {extras = ["standard"], version = "^0.28.0"}
sqlalchemy = "^2.0.28"
asyncpg = "^0.29.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0.0"
mypy = "^1.9.0"
ruff = "^0.3.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>pyproject.toml</code> (PEP 518/621) is the unified modern standard for Python configuration.</li>
      <li>Poetry generates a cryptographic <code>poetry.lock</code> file ensuring exact reproducible builds across environments.</li>
      <li>Separate production dependencies from development/testing dependencies using dependency groups.</li>
      <li>Adopt <strong>Ruff</strong>: a blazing fast Python linter and formatter written in Rust that replaces Black, Flake8, and isort.</li>
      <li>Always commit the lockfile to version control; run <code>poetry install --no-root</code> in Docker production builds.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 2 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-PFS-008",
      title: "Generators & Iteration Assessment",
      chapterId: "CH-PFS-008",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-008-01", type: "MCQ", prompt: "What two dunder methods must an object implement to satisfy the Python Iterator Protocol?", options: ["__iter__() and __next__()", "__start__() and __stop__()", "__get__() and __set__()", "__read__() and __write__()"], answer: 0, points: 10 },
        { id: "Q-PFS-008-02", type: "MCQ", prompt: "What exception signals the end of iteration in Python?", options: ["StopIteration", "IndexError", "GeneratorExit", "EndLoopException"], answer: 0, points: 10 },
        { id: "Q-PFS-008-03", type: "MCQ", prompt: "What happens to a function's local execution state when it encounters a `yield` statement?", options: ["It is destroyed immediately", "It is frozen/suspended and preserved until `next()` is called again", "It writes to a temporary file", "It restarts from the beginning"], answer: 1, points: 10 },
        { id: "Q-PFS-008-04", type: "MCQ", prompt: "What syntax allows a generator to delegate iteration cleanly to another iterable or sub-generator?", options: ["yield from sub_gen", "delegate sub_gen", "yield sub_gen.all()", "call sub_gen"], answer: 0, points: 10 },
        { id: "Q-PFS-008-05", type: "MCQ", prompt: "Why are generators advantageous when processing a 50GB CSV file?", options: ["They run on the GPU", "They stream lines one at a time, consuming constant low RAM rather than loading all 50GB into memory", "They encrypt the file automatically", "They bypass the operating system"], answer: 1, points: 10 },
        { id: "Q-PFS-008-06", type: "MCQ", prompt: "Can an exhausted generator be re-iterated from the beginning without creating a new instance?", options: ["Yes, using `gen.rewind()`", "No, generators are single-pass iterators and cannot be reset", "Only if it yielded numbers", "Only in Python 3.12"], answer: 1, points: 10 },
        { id: "Q-PFS-008-07", type: "MCQ", prompt: "What method allows sending values into a running generator from outside caller code?", options: ["generator.send(value)", "generator.push(value)", "generator.insert(value)", "generator.feed(value)"], answer: 0, points: 10 },
        { id: "Q-PFS-008-08", type: "MCQ", prompt: "What standard library module provides functional utilities for efficient looping and iterator algebra?", options: ["itertools", "collections", "functools", "operator"], answer: 0, points: 10 },
        { id: "Q-PFS-008-09", type: "MCQ", prompt: "What itertools function creates an infinite arithmetic progression (e.g., 0, 1, 2, ...)?", options: ["itertools.count()", "itertools.cycle()", "itertools.repeat()", "itertools.infinite()"], answer: 0, points: 10 },
        { id: "Q-PFS-008-10", type: "MCQ", prompt: "What happens when `next()` is invoked on an already exhausted generator without a default fallback?", options: ["Returns None", "Raises StopIteration exception", "Returns 0", "Hangs indefinitely"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-009",
      title: "Decorators & Metaprogramming Assessment",
      chapterId: "CH-PFS-009",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-009-01", type: "MCQ", prompt: "What does the `@functools.wraps(func)` decorator do when placed on an inner wrapper?", options: ["Speed up execution by 2x", "Copies the original function's name, docstring, parameter annotations, and module metadata onto the wrapper", "Makes the function thread-safe", "Disables all errors"], answer: 1, points: 10 },
        { id: "Q-PFS-009-02", type: "MCQ", prompt: "How many nested functions are required to implement a decorator that accepts arguments (e.g., `@repeat(num_times=3)`)?", options: ["1 function", "2 functions", "3 nested functions (factory, decorator, wrapper)", "4 functions"], answer: 2, points: 10 },
        { id: "Q-PFS-009-03", type: "MCQ", prompt: "What built-in decorator from `functools` provides LRU (Least Recently Used) caching for deterministic functions?", options: ["@functools.lru_cache", "@functools.memoize", "@functools.cache_fast", "@functools.cache_pool"], answer: 0, points: 10 },
        { id: "Q-PFS-009-04", type: "MCQ", prompt: "When are decorators actually executed?", options: ["At function import/definition time", "Every time the decorated function is invoked", "Only when tests run", "Only in production"], answer: 0, points: 10 },
        { id: "Q-PFS-009-05", type: "MCQ", prompt: "What syntactic sugar is `@my_decorator` equivalent to for `def foo(): pass`?", options: ["foo = my_decorator(foo)", "my_decorator = foo", "foo = my_decorator()", "call(my_decorator, foo)"], answer: 0, points: 10 },
        { id: "Q-PFS-009-06", type: "MCQ", prompt: "Can a decorator be implemented as a class rather than a function?", options: ["No, decorators must always be functions", "Yes, by implementing the `__call__` dunder method on the class", "Only if the class extends Object", "Only in Django"], answer: 1, points: 10 },
        { id: "Q-PFS-009-07", type: "MCQ", prompt: "In what order are stacked decorators evaluated: `@dec_a` above `@dec_b` on `def fn(): pass`?", options: ["dec_a wraps the result of dec_b (equivalent to `dec_a(dec_b(fn))`", "dec_b wraps dec_a", "Random order", "Simultaneously in parallel"], answer: 0, points: 10 },
        { id: "Q-PFS-009-08", type: "MCQ", prompt: "What attribute allows accessing the original unwrapped function when `@functools.wraps` was used?", options: ["func.__wrapped__", "func.__original__", "func.__source__", "func.__base__"], answer: 0, points: 10 },
        { id: "Q-PFS-009-09", type: "MCQ", prompt: "What is an Aspect-Oriented Programming (AOP) cross-cutting concern suitable for decorators?", options: ["Core database schema design", "Logging, performance profiling, and role-based access control authentication checks", "HTML markup", "User password generation"], answer: 1, points: 10 },
        { id: "Q-PFS-009-10", type: "MCQ", prompt: "What happens if a decorator returns None instead of returning a callable wrapper?", options: ["Python uses the original function", "The decorated identifier becomes `None`, and calling it later raises a `TypeError: 'NoneType' object is not callable`", "A syntax error at compile time", "The script crashes immediately"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-010",
      title: "Context Managers Assessment",
      chapterId: "CH-PFS-010",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-010-01", type: "MCQ", prompt: "What two methods must a class implement to act as a standard Python context manager?", options: ["__enter__() and __exit__()", "__open__() and __close__()", "__start__() and __finish__()", "__init__() and __del__()"], answer: 0, points: 10 },
        { id: "Q-PFS-010-02", type: "MCQ", prompt: "How can the `__exit__()` method suppress an exception that occurred inside the `with` block?", options: ["By returning `True` (or a truthy value)", "By raising a new exception", "By calling `sys.exit()`", "Exceptions cannot be suppressed in __exit__"], answer: 0, points: 10 },
        { id: "Q-PFS-010-03", type: "MCQ", prompt: "What decorator in `contextlib` converts a simple generator function with a `yield` into a context manager?", options: ["@contextlib.contextmanager", "@contextlib.with_block", "@contextlib.managed", "@contextlib.resource"], answer: 0, points: 10 },
        { id: "Q-PFS-010-04", type: "MCQ", prompt: "What utility from `contextlib` silently suppresses specified exceptions without verbose try-except boilerplate?", options: ["contextlib.suppress(*exceptions)", "contextlib.ignore()", "contextlib.catch_none()", "contextlib.pass_err()"], answer: 0, points: 10 },
        { id: "Q-PFS-010-05", type: "MCQ", prompt: "What arguments are passed into `__exit__(self, exc_type, exc_val, exc_tb)` when an unhandled exception occurs inside the block?", options: ["The exception class, the exception instance, and the traceback object", "Only a string message", "The line number only", "No arguments are passed"], answer: 0, points: 10 },
        { id: "Q-PFS-010-06", type: "MCQ", prompt: "What protocol handles asynchronous context managers used with `async with`?", options: ["__aenter__() and __aexit__()", "__enter_async__() and __exit_async__()", "__async__()", "__coroutine__()"], answer: 0, points: 10 },
        { id: "Q-PFS-010-07", type: "MCQ", prompt: "What does `contextlib.nullcontext()` provide in modular enterprise code?", options: ["A no-op context manager that does nothing, useful as a default optional resource placeholder", "A null pointer exception", "A memory wiping tool", "A database connection"], answer: 0, points: 10 },
        { id: "Q-PFS-010-08", type: "MCQ", prompt: "What utility allows managing a dynamic, variable number of context managers simultaneously?", options: ["contextlib.ExitStack()", "contextlib.MultiContext()", "contextlib.Chain()", "contextlib.Group()"], answer: 0, points: 10 },
        { id: "Q-PFS-010-09", type: "MCQ", prompt: "Why is `with open('file.txt') as f:` preferred over manual `f.close()` calls?", options: ["It guarantees file handle closure even if an unexpected exception occurs while reading or processing the file", "It reads files faster", "It automatically converts text to uppercase", "It saves the file to cloud"], answer: 0, points: 10 },
        { id: "Q-PFS-010-10", type: "MCQ", prompt: "Where in a `@contextlib.contextmanager` function must the teardown/cleanup code be placed?", options: ["Inside the `finally:` block after the `yield` statement", "Before the yield statement", "In an except block only", "At the top of the file"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-011",
      title: "Type Hinting & Pydantic v2 Assessment",
      chapterId: "CH-PFS-011",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-011-01", type: "MCQ", prompt: "What is the primary role of static type checkers like Mypy in Python projects?", options: ["To analyze code for type errors ahead of runtime without executing the code", "To compile Python to C++ binaries", "To format Python code with whitespace", "To run unit tests automatically"], answer: 0, points: 10 },
        { id: "Q-PFS-011-02", type: "MCQ", prompt: "What language is Pydantic v2 core engine (`pydantic-core`) written in for maximum validation speed?", options: ["Rust", "C++", "Go", "Assembly"], answer: 0, points: 10 },
        { id: "Q-PFS-011-03", type: "MCQ", prompt: "What modern syntax represents a type that can be either an integer or None in Python 3.10+?", options: ["int | None", "Optional[int]", "Union[int, None]", "All of the above (with `int | None` being the preferred modern idiom)"], answer: 3, points: 10 },
        { id: "Q-PFS-011-04", type: "MCQ", prompt: "What Pydantic v2 method parses and validates a raw JSON string into a model instance?", options: ["Model.model_validate_json(json_str)", "Model.parse_raw() in v1", "Model.from_json()", "Model.load_json()"], answer: 0, points: 10 },
        { id: "Q-PFS-011-05", type: "MCQ", prompt: "What decorator in Pydantic v2 defines custom validation logic for a specific field?", options: ["@field_validator('field_name')", "@validator() in v1", "@check_field()", "@clean()"], answer: 0, points: 10 },
        { id: "Q-PFS-011-06", type: "MCQ", prompt: "What does `typing.Literal['admin', 'user']` specify?", options: ["The variable can only take the exact string values 'admin' or 'user'", "A list of strings", "Any string of length 5", "A dictionary key"], answer: 0, points: 10 },
        { id: "Q-PFS-011-07", type: "MCQ", prompt: "What does the `pydantic.Field(gt=0)` constraint enforce?", options: ["The numerical value must be strictly greater than 0", "Value must be less than 0", "Value must be a string", "Value is optional"], answer: 0, points: 10 },
        { id: "Q-PFS-011-08", type: "MCQ", prompt: "What is `typing.TypedDict` used for?", options: ["Type hinting standard Python dictionaries with specific expected key names and value types", "A new dictionary class", "An encrypted dictionary", "A thread-safe dictionary"], answer: 0, points: 10 },
        { id: "Q-PFS-011-09", type: "MCQ", prompt: "What does `typing.Protocol` enable in Python static typing?", options: ["Structural subtyping (static Duck Typing) where classes match if they possess the required methods without explicit inheritance", "Network HTTP requests", "Serializing data to binary", "Defining database tables"], answer: 0, points: 10 },
        { id: "Q-PFS-011-10", type: "MCQ", prompt: "How do you serialize a Pydantic v2 model into a standard Python dictionary?", options: ["model.model_dump()", "model.dict() in v1", "model.to_dict()", "dict(model)"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-012",
      title: "AsyncIO & Event Loop Assessment",
      chapterId: "CH-PFS-012",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-012-01", type: "MCQ", prompt: "What is the primary role of the AsyncIO Event Loop?", options: ["To manage, schedule, and execute asynchronous tasks and callbacks sequentially on a single thread as I/O events become ready", "To run code across all CPU cores simultaneously", "To compile Python scripts", "To manage database tables"], answer: 0, points: 10 },
        { id: "Q-PFS-012-02", type: "MCQ", prompt: "What happens if a developer calls synchronous `time.sleep(5)` inside an `async def` function?", options: ["The entire event loop freezes for 5 seconds, blocking ALL other concurrent asynchronous tasks and requests", "Only that task sleeps; other tasks continue", "Python raises an AsyncError", "It runs in a background thread automatically"], answer: 0, points: 10 },
        { id: "Q-PFS-012-03", type: "MCQ", prompt: "What structured concurrency feature introduced in Python 3.11 provides clean, error-safe task management?", options: ["asyncio.TaskGroup", "asyncio.gather", "asyncio.wait", "asyncio.Pool"], answer: 0, points: 10 },
        { id: "Q-PFS-012-04", type: "MCQ", prompt: "What standard function should be used to sleep non-blockingly inside an async coroutine?", options: ["await asyncio.sleep(duration)", "time.sleep(duration)", "async.wait(duration)", "loop.sleep()"], answer: 0, points: 10 },
        { id: "Q-PFS-012-05", type: "MCQ", prompt: "How should a legacy synchronous blocking library call (e.g., standard requests or heavy disk I/O) be run safely from an async function?", options: ["await asyncio.to_thread(blocking_func, *args)", "Call it directly", "Put it inside a loop", "Wrap it in a lambda"], answer: 0, points: 10 },
        { id: "Q-PFS-012-06", type: "MCQ", prompt: "What does `asyncio.run(main())` do?", options: ["Creates a new event loop, executes the passed coroutine to completion, and cleans up the event loop resources", "Compiles code", "Starts a web server", "Runs code on GPU"], answer: 0, points: 10 },
        { id: "Q-PFS-012-07", type: "MCQ", prompt: "What is the return type of invoking an `async def` function directly without `await`?", options: ["A coroutine object (which must be scheduled or awaited to execute)", "The return value of the function", "A Future integer", "None"], answer: 0, points: 10 },
        { id: "Q-PFS-012-08", type: "MCQ", prompt: "What HTTP client library is designed natively for asynchronous AsyncIO workflows?", options: ["httpx / aiohttp", "requests", "urllib", "curl"], answer: 0, points: 10 },
        { id: "Q-PFS-012-09", type: "MCQ", prompt: "What happens when an exception is raised inside one task of an `asyncio.TaskGroup` context?", options: ["The remaining sibling tasks in the group are automatically cancelled, and an ExceptionGroup is raised", "The other tasks continue forever", "The program ignores the error", "The server restarts"], answer: 0, points: 10 },
        { id: "Q-PFS-012-10", type: "MCQ", prompt: "Why is AsyncIO particularly well suited for web microservices like FastAPI?", options: ["Web APIs spend most of their time idle waiting for network/database I/O, allowing one thread to handle thousands of concurrent requests", "AsyncIO makes single-core CPU calculations 10x faster", "AsyncIO eliminates databases", "AsyncIO requires no memory"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-013",
      title: "Concurrency & Process Pools Assessment",
      chapterId: "CH-PFS-013",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-013-01", type: "MCQ", prompt: "When should you choose `ProcessPoolExecutor` over `ThreadPoolExecutor`?", options: ["For CPU-bound workloads (image processing, data crunching, cryptography) where you need to bypass the CPython GIL across multiple CPU cores", "For reading 10 web URLs", "For printing text to terminal", "Always for all tasks"], answer: 0, points: 10 },
        { id: "Q-PFS-013-02", type: "MCQ", prompt: "What requirement must data satisfy to be passed into tasks running in a `ProcessPoolExecutor`?", options: ["It must be serializable via Python's `pickle` protocol", "It must be an integer", "It must be stored in Redis", "It must be less than 1 kilobyte"], answer: 0, points: 10 },
        { id: "Q-PFS-013-03", type: "MCQ", prompt: "Why is `if __name__ == '__main__':` mandatory when using multiprocessing on Windows and macOS?", options: ["Because Windows and macOS spawn child processes by importing the main module, risking recursive process fork-bombs without the guard", "It is required for syntax validation", "To make code faster", "It enables the GIL"], answer: 0, points: 10 },
        { id: "Q-PFS-013-04", type: "MCQ", prompt: "What does `as_completed(futures)` yield in `concurrent.futures`?", options: ["Yields Future objects as soon as each individual background task completes, regardless of the order they were submitted", "Yields futures in strict submission order", "Yields only failed tasks", "Yields tasks after 1 hour"], answer: 0, points: 10 },
        { id: "Q-PFS-013-05", type: "MCQ", prompt: "What happens if an unhandled exception occurs inside a task submitted to an executor?", options: ["The exception is captured in the Future and re-raised when `future.result()` is called", "The entire main program terminates immediately", "The exception is silently discarded", "The operating system crashes"], answer: 0, points: 10 },
        { id: "Q-PFS-013-06", type: "MCQ", prompt: "What IPC structure in the `multiprocessing` module allows safe communication between separate processes?", options: ["multiprocessing.Queue", "multiprocessing.global_var", "standard list", "socket.raw"], answer: 0, points: 10 },
        { id: "Q-PFS-013-07", type: "MCQ", prompt: "What function from the `os` module reports the total number of logical CPU cores on the host machine?", options: ["os.cpu_count()", "os.get_cores()", "sys.cores()", "platform.cpu()"], answer: 0, points: 10 },
        { id: "Q-PFS-013-08", type: "MCQ", prompt: "What is the primary memory drawback of spawning 32 worker processes with `ProcessPoolExecutor`?", options: ["Each process is an independent OS process with its own CPython interpreter and memory space, potentially multiplying RAM consumption", "RAM cannot be allocated to processes", "Processes share stack frames", "Processes delete disk files"], answer: 0, points: 10 },
        { id: "Q-PFS-013-09", type: "MCQ", prompt: "What does a `Future` object represent in concurrent programming?", options: ["An eventual result of an asynchronous computation that may not yet have finished", "A variable type in Python 4", "A financial contract", "A database table"], answer: 0, points: 10 },
        { id: "Q-PFS-013-10", type: "MCQ", prompt: "What is the difference between concurrency and parallelism?", options: ["Concurrency is about dealing with lots of things at once (structure/interleaving); parallelism is about doing lots of things at once (physical simultaneous CPU execution)", "They are identical terms", "Concurrency is only for threads; parallelism is only for web", "Parallelism is single-core only"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-014",
      title: "Packaging & Poetry Assessment",
      chapterId: "CH-PFS-014",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-014-01", type: "MCQ", prompt: "What PEP standard established `pyproject.toml` as the unified build configuration file for Python?", options: ["PEP 518 and PEP 621", "PEP 8", "PEP 20", "PEP 484"], answer: 0, points: 10 },
        { id: "Q-PFS-014-02", type: "MCQ", prompt: "What is the critical role of the `poetry.lock` file in production deployment?", options: ["It pins the exact cryptographic hashes and versions of all direct and transitive dependencies, ensuring reproducible deterministic builds", "It prevents anyone from editing source files", "It encrypts passwords", "It runs unit tests"], answer: 0, points: 10 },
        { id: "Q-PFS-014-03", type: "MCQ", prompt: "What command creates a new isolated virtual environment and installs dependencies specified in `poetry.lock`?", options: ["poetry install", "poetry make", "poetry setup", "pip get"], answer: 0, points: 10 },
        { id: "Q-PFS-014-04", type: "MCQ", prompt: "What tool written in Rust has rapidly become the industry standard for ultra-fast Python linting and code formatting?", options: ["Ruff", "Webpack", "Prettier", "Babel"], answer: 0, points: 10 },
        { id: "Q-PFS-014-05", type: "MCQ", prompt: "What command runs a Python command inside the Poetry-managed virtual environment without manually activating it?", options: ["poetry run python script.py", "poetry exec python script.py", "poetry start python script.py", "poetry go python script.py"], answer: 0, points: 10 },
        { id: "Q-PFS-014-06", type: "MCQ", prompt: "How are development-only dependencies (e.g., pytest, mypy) segregated from production dependencies in Poetry?", options: ["Under dependency groups: `[tool.poetry.group.dev.dependencies]`", "In a separate requirements-dev.txt file", "In system environment variables", "In comments"], answer: 0, points: 10 },
        { id: "Q-PFS-014-07", type: "MCQ", prompt: "What package distribution format represents pre-built, ready-to-install binary archives in Python?", options: ["Wheel (.whl)", "Egg (.egg)", "Tarball (.tar.gz) only", "Jar (.jar)"], answer: 0, points: 10 },
        { id: "Q-PFS-014-08", type: "MCQ", prompt: "What is the official public repository for third-party Python software packages?", options: ["PyPI (Python Package Index)", "NPM", "Maven Central", "Docker Hub"], answer: 0, points: 10 },
        { id: "Q-PFS-014-09", type: "MCQ", prompt: "What does the caret symbol `^1.2.3` signify in Poetry version constraints?", options: ["Allows updates that do not modify the left-most non-zero digit (e.g., `>=1.2.3 <2.0.0`)", "Exact version only", "Any version in history", "Must be greater than 2.0.0"], answer: 0, points: 10 },
        { id: "Q-PFS-014-10", type: "MCQ", prompt: "Why should `poetry.lock` be checked into git repositories for enterprise applications?", options: ["To prevent 'works on my machine' defects caused by unexpected upstream library updates across team members or CI servers", "Because Git ignores unlocked repos", "Poetry requires it for git commits", "It stores employee names"], answer: 0, points: 10 },
      ]
    }
  ]
};

