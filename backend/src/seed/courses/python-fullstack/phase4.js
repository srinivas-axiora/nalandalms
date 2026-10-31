// Phase 4: Advanced (Chapters 22 to 27) - Python Full Stack Developer
// Full-Stack React Integration, Celery, WebSockets, Docker, Pytest, and CI/CD Automation.

export const phase4 = {
  chapters: [
    // ── Chapter 22 ──
    {
      id: "CH-PFS-022",
      courseId: "CRS-PFS-001",
      sequence: 22,
      title: "Full-Stack Integration: Connecting React 19 SPA to FastAPI Backends",
      description: "Frontend-backend integration architecture, TypeScript API client generation from FastAPI OpenAPI specs, Axios interceptors, JWT refresh flows, and CORS configuration.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 22</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Full-Stack Integration: React 19 + FastAPI</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">A full-stack Python application pairs an ultra-fast FastAPI backend with a responsive, component-driven React 19 single-page application. Because FastAPI outputs standard OpenAPI JSON, frontend TypeScript clients can be generated automatically, providing end-to-end type safety from database models to React components.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/gQTRsZpqbAQ" title="FastAPI and React Full Stack Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Generating Frontend TypeScript Clients with OpenAPI-TS</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># Command line: Automatically generate React TypeScript interfaces from live FastAPI spec:
npx openapi-typescript http://localhost:8000/openapi.json -o src/api/schema.d.ts

# In React Component: Zero manual typing required, 100% type-safe with backend!
import { CourseResponse } from './api/schema';</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>FastAPI's auto-generated OpenAPI spec enables automated TypeScript client interface generation.</li>
      <li>Configure CORS in FastAPI with explicit origins (e.g., <code>https://app.nalanda.edu</code>).</li>
      <li>Use Axios response interceptors to refresh expired JWT access tokens automatically via refresh token endpoints.</li>
      <li>Pair React TanStack Query with FastAPI for declarative caching, error states, and background data synchronization.</li>
      <li>Separate UI presentation components from data-fetching custom hooks for clean testing boundaries.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 23 ──
    {
      id: "CH-PFS-023",
      courseId: "CRS-PFS-001",
      sequence: 23,
      title: "Distributed Asynchronous Task Queues with Celery & Redis",
      description: "Offloading slow I/O (email notifications, video transcoding, PDF generation), Celery worker architecture, Redis as broker/result backend, Celery Beat for periodic cron jobs, and Flower monitoring.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 23</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Distributed Task Queues with Celery & Redis</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">HTTP endpoints should never perform long-running blocking tasks (like generating certificates, sending emails, or processing machine learning models) synchronously during a client web request. <strong>Celery</strong> offloads these tasks asynchronously to distributed worker processes backed by <strong>Redis</strong> or RabbitMQ.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Declaring and Triggering Asynchronous Tasks</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from celery import Celery

celery_app = Celery("nalanda_tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/1")

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_verified_certificate(self, user_id: str, course_id: str):
    try:
        # Long-running PDF generation and cryptographic HMAC signing
        pdf_path = render_pdf_certificate(user_id, course_id)
        send_completion_email(user_id, pdf_path)
        return {"status": "SUCCESS", "user_id": user_id}
    except Exception as exc:
        raise self.retry(exc=exc)

# In FastAPI Route: Returns immediately in 3 milliseconds!
@app.post("/courses/{id}/certify")
async def trigger_certification(course_id: str, user: CurrentUser):
    task = generate_verified_certificate.delay(user.id, course_id)
    return {"message": "Certification queued", "task_id": task.id}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Celery offloads CPU or heavy I/O tasks out of the HTTP request cycle into background worker processes.</li>
      <li>Redis or RabbitMQ serves as the message broker delivering task messages between API servers and workers.</li>
      <li>Use <code>task.delay(*args)</code> or <code>task.apply_async(args, countdown=60)</code> to enqueue tasks.</li>
      <li><strong>Celery Beat</strong> acts as a distributed scheduler for recurring cron-like periodic jobs.</li>
      <li>Use <strong>Flower</strong> for real-time web monitoring of Celery worker queues, task states, and throughput rates.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 24 ──
    {
      id: "CH-PFS-024",
      courseId: "CRS-PFS-001",
      sequence: 24,
      title: "Real-Time WebSockets & Bi-Directional Streaming in FastAPI",
      description: "WebSocket protocol handshake, connection manager pattern, broadcasting live proctoring events, chat systems, and reconnection resilience.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 24</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Real-Time WebSockets & Live Streaming in FastAPI</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Traditional HTTP polling creates unnecessary server load and latency. <strong>WebSockets</strong> upgrade HTTP connections into persistent, full-duplex TCP streams, enabling real-time communication for live proctoring cockpits, notifications, and candidate monitoring.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. FastAPI WebSocket Connection Manager</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List

class ProctoringSocketManager:
    def __init__(self):
        # Maps attempt_id -> list of active proctor/candidate sockets
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_rooms.setdefault(room_id, []).append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_rooms:
            self.active_rooms[room_id].remove(websocket)

    async def broadcast_event(self, room_id: str, message: dict):
        for connection in self.active_rooms.get(room_id, []):
            await connection.send_json(message)

manager = ProctoringSocketManager()

@app.websocket("/ws/proctoring/{attempt_id}")
async def proctoring_stream(websocket: WebSocket, attempt_id: str):
    await manager.connect(attempt_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast candidate vision telemetry to chief proctor cockpit:
            await manager.broadcast_event(attempt_id, data)
    except WebSocketDisconnect:
        manager.disconnect(attempt_id, websocket)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>WebSockets establish persistent, full-duplex TCP connections initiated via HTTP Upgrade headers.</li>
      <li>FastAPI natively supports WebSockets using Starlette's high-speed async primitives.</li>
      <li>Use a centralized Connection Manager class to handle client joins, leaves, and room multicasting.</li>
      <li>Always handle <code>WebSocketDisconnect</code> gracefully to prevent resource leaks in connection registries.</li>
      <li>For multi-server distributed scaling, use Redis Pub/Sub to broadcast WebSocket messages across cluster nodes.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 25 ──
    {
      id: "CH-PFS-025",
      courseId: "CRS-PFS-001",
      sequence: 25,
      title: "Containerizing Python Full Stack Applications with Multi-Stage Docker & Compose",
      description: "Production Dockerfiles for FastAPI and React, virtual environment isolation in containers, poetry integration, non-root security, and multi-service Docker Compose.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 25</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Containerization with Docker & Multi-Stage Builds</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Deploying full-stack Python systems requires robust containerization. Learn to craft lightweight, hardened multi-stage Docker images for FastAPI backends and React frontends, orchestrating PostgreSQL, Redis, and Celery workers via Docker Compose.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Production Multi-Stage Python Dockerfile</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># Stage 1: Build stage with C compilers and Poetry
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.in-project true && \\
    poetry install --no-interaction --no-ansi --no-root --only main

# Stage 2: Minimal, hardened production runtime
FROM python:3.12-slim
WORKDIR /app
# Security: Create and switch to unprivileged user
RUN useradd -m -u 1000 appuser
USER appuser
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"
COPY src/ src/
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Multi-stage Docker builds eliminate compilers and build tools from final production images, shrinking image size.</li>
      <li>Never run Python production containers as the default <code>root</code> user.</li>
      <li>Copy <code>pyproject.toml</code> and install dependencies first to take full advantage of Docker layer caching.</li>
      <li>Run Uvicorn with multiple workers (<code>--workers 4</code>) in production to leverage multiple CPU cores.</li>
      <li>Use Docker Compose health checks (<code>pg_isready</code>) to ensure databases initialize before backend containers start.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 26 ──
    {
      id: "CH-PFS-026",
      courseId: "CRS-PFS-001",
      sequence: 26,
      title: "Automated Testing Mastery: Pytest, Async Fixtures, Mocking & Factory Boy",
      description: "Pytest framework, async fixtures with pytest-asyncio, mocking HTTP calls with respx, database rollback testing with testcontainers, and test coverage with pytest-cov.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 26</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Automated Testing with Pytest & Async Fixtures</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Quality software is verified by automated test suites. <strong>Pytest</strong> is Python's leading test framework, providing modular fixtures, clean assertion syntax without boilerplate classes, parameterized tests, and native AsyncIO testing for FastAPI.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. FastAPI Asynchronous API Testing with HTTPX & Pytest</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app

@pytest.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_create_and_fetch_course(async_client: AsyncClient, test_user_token: str):
    # Act: Create course
    payload = {"title": "Python Full Stack", "category": "Engineering", "price": 99.0}
    headers = {"Authorization": f"Bearer {test_user_token}"}
    create_resp = await async_client.post("/api/v1/courses", json=payload, headers=headers)

    # Assert
    assert create_resp.status_code == 201
    course_data = create_resp.json()
    assert course_data["title"] == "Python Full Stack"
    assert "id" in course_data</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Pytest fixtures (<code>@pytest.fixture</code>) modularize setup and teardown logic with clean dependency injection.</li>
      <li>Use <code>pytest-asyncio</code> and <code>httpx.AsyncClient</code> to test async FastAPI endpoints without running a live server.</li>
      <li>Use <code>@pytest.mark.parametrize</code> to execute a single test method across multiple input-output permutations.</li>
      <li>Test against real transient PostgreSQL databases using <code>testcontainers-python</code> in CI.</li>
      <li>Enforce minimum branch coverage thresholds using <code>pytest --cov=src --cov-fail-under=80</code>.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 27 ──
    {
      id: "CH-PFS-027",
      courseId: "CRS-PFS-001",
      sequence: 27,
      title: "Enterprise CI/CD Pipelines: GitHub Actions & Serverless Cloud Deployment",
      description: "Automated linting (Ruff), type checking (Mypy), security auditing (pip-audit), multi-stage container publishing to AWS ECR / GitHub Packages, and deployment to AWS ECS / Cloud Run.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Advanced • Chapter 27</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Enterprise CI/CD Pipelines with GitHub Actions</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Continuous Integration and Continuous Delivery (CI/CD) pipelines ensure that every pull request is validated for formatting, strict typing, security CVEs, and unit tests before merging, followed by automated container deployment to cloud environments.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Production GitHub Actions Workflow (<code>.github/workflows/python-ci.yml</code>)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>name: Python Full Stack CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
      - name: Install Dependencies
        run: |
          pip install poetry
          poetry install --with dev
      - name: Lint and Format Check (Ruff)
        run: poetry run ruff check .
      - name: Type Checking (Mypy)
        run: poetry run mypy --strict src/
      - name: Run Test Suite with Coverage
        run: poetry run pytest --cov=src --cov-report=xml
      - name: Dependency Security Audit
        run: poetry run pip-audit</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Automate linting (Ruff), strict typing (Mypy), and test suites on every GitHub Pull Request.</li>
      <li>Integrate <code>pip-audit</code> in CI to automatically detect known CVE vulnerabilities in third-party packages.</li>
      <li>Build and push versioned Docker container images to container registries (AWS ECR or Docker Hub).</li>
      <li>Deploy containers serverlessly to Google Cloud Run or AWS ECS Fargate for auto-scaling and zero idle cost.</li>
      <li>Automate database migrations in CD pipelines using <code>alembic upgrade head</code> before launching new containers.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 4 (10 MCQs per chapter = 60 questions total) ──
  assessments: [
    {
      id: "ASM-PFS-022",
      title: "Full-Stack Integration Assessment",
      chapterId: "CH-PFS-022",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-022-01", type: "MCQ", prompt: "How can React developers generate TypeScript interfaces automatically from a FastAPI backend?", options: ["By using tools like `openapi-typescript` pointing to FastAPI's `/openapi.json` endpoint", "FastAPI does not support TypeScript", "By rewriting Python in TypeScript", "Using Babel only"], answer: 0, points: 10 },
        { id: "Q-PFS-022-02", type: "MCQ", prompt: "What Axios feature allows attaching JWT Bearer tokens to every outgoing HTTP request transparently?", options: ["Axios Request Interceptor", "Web Worker", "Proxy Filter", "React Hook"], answer: 0, points: 10 },
        { id: "Q-PFS-022-03", type: "MCQ", prompt: "What occurs if CORS is not configured on a FastAPI backend accessed by a React frontend on a different port?", options: ["The browser security sandbox blocks the frontend JavaScript from reading the response", "The computer crashes", "FastAPI returns 500", "The server shuts down"], answer: 0, points: 10 },
        { id: "Q-PFS-022-04", type: "MCQ", prompt: "How should an Axios response interceptor handle an HTTP 401 Unauthorized status code?", options: ["Attempt to refresh the access token via a refresh token endpoint, or clear credentials and redirect to login", "Ignore the error", "Reload the page forever", "Show a blank screen"], answer: 0, points: 10 },
        { id: "Q-PFS-022-05", type: "MCQ", prompt: "What is the recommended React library for caching and managing asynchronous remote API data from FastAPI?", options: ["TanStack Query (React Query)", "Redux for all API calls", "Local storage only", "Plain global variables"], answer: 0, points: 10 },
        { id: "Q-PFS-022-06", type: "MCQ", prompt: "Where should the API base URL (`VITE_API_BASE_URL`) be configured in a modern Vite React application?", options: ["In `.env` environment files", "Hardcoded into every component", "In HTML comments", "In CSS files"], answer: 0, points: 10 },
        { id: "Q-PFS-022-07", type: "MCQ", prompt: "What FastAPI middleware class configures allowed origins, headers, and HTTP methods?", options: ["CORSMiddleware", "AuthMiddleware", "OriginSecurityFilter", "ProxyMiddleware"], answer: 0, points: 10 },
        { id: "Q-PFS-022-08", type: "MCQ", prompt: "Why is separating UI presentation components from data-fetching hooks considered a best practice?", options: ["It enables independent unit testing and component reusability with mock data", "It saves CSS bandwidth", "React mandates it", "It is required for TypeScript"], answer: 0, points: 10 },
        { id: "Q-PFS-022-09", type: "MCQ", prompt: "What is an HTTP preflight request?", options: ["An automated `OPTIONS` request sent by the browser to determine whether the cross-origin server accepts the intended method and headers", "A database ping", "A DNS lookup", "A TLS handshake"], answer: 0, points: 10 },
        { id: "Q-PFS-022-10", type: "MCQ", prompt: "What Vite configuration setting routes local development requests to FastAPI without triggering CORS?", options: ["server.proxy in `vite.config.ts`", "npm proxy", "docker routing", "nginx"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-023",
      title: "Celery & Distributed Queues Assessment",
      chapterId: "CH-PFS-023",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-023-01", type: "MCQ", prompt: "Why should slow tasks like PDF generation or bulk emails be processed via Celery instead of inside an HTTP endpoint?", options: ["To prevent blocking the HTTP worker thread, keeping API response latency under 50ms for end users", "Because Python cannot generate PDFs in web servers", "Celery runs on GPU", "To save hard drive space"], answer: 0, points: 10 },
        { id: "Q-PFS-023-02", type: "MCQ", prompt: "What two roles does Redis commonly serve in a Celery architecture?", options: ["Message Broker (delivering tasks) and Result Backend (storing task status/return values)", "Database table and file system", "Web server and load balancer", "Code compiler and linter"], answer: 0, points: 10 },
        { id: "Q-PFS-023-03", type: "MCQ", prompt: "What Celery method is the standard shortcut for enqueuing an asynchronous task?", options: ["task.delay(*args, **kwargs)", "task.run_async()", "task.enqueue()", "task.dispatch()"], answer: 0, points: 10 },
        { id: "Q-PFS-023-04", type: "MCQ", prompt: "What Celery component acts as a scheduler, triggering periodic cron-like tasks at specified intervals?", options: ["Celery Beat", "Celery Flower", "Celery Cron", "Celery Clock"], answer: 0, points: 10 },
        { id: "Q-PFS-023-05", type: "MCQ", prompt: "What web-based monitoring tool provides real-time visibility into Celery workers and task queues?", options: ["Flower", "Grafana only", "Postman", "CeleryUI"], answer: 0, points: 10 },
        { id: "Q-PFS-023-06", type: "MCQ", prompt: "What parameter in `@celery.task` allows a failed task to automatically retry upon transient errors?", options: ["max_retries and default_retry_delay", "auto_repeat", "loop_count", "retry_forever"], answer: 0, points: 10 },
        { id: "Q-PFS-023-07", type: "MCQ", prompt: "What happens if a Celery worker crashes while processing a task if `acks_late=True` is configured?", options: ["The task is not acknowledged to the broker, so another worker will pick up and execute the task", "The task is permanently lost", "The message broker crashes", "The database is deleted"], answer: 0, points: 10 },
        { id: "Q-PFS-023-08", type: "MCQ", prompt: "What method checks the status of an enqueued task by its UUID string?", options: ["AsyncResult(task_id).status", "celery.get_status(task_id)", "redis.check(task_id)", "task.find()"], answer: 0, points: 10 },
        { id: "Q-PFS-023-09", type: "MCQ", prompt: "What serialization format should be enforced for Celery task payloads for security?", options: ["JSON (`task_serializer='json'`)", "Pickle", "XML", "YAML"], answer: 0, points: 10 },
        { id: "Q-PFS-023-10", type: "MCQ", prompt: "Why is using Python's native `pickle` serializer dangerous in Celery task queues?", options: ["An attacker with broker access can inject malicious serialized byte payloads leading to Remote Code Execution (RCE) on worker machines", "Pickle is too slow", "Pickle does not support dictionaries", "Pickle requires C++"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-024",
      title: "WebSockets & Real-Time Streaming Assessment",
      chapterId: "CH-PFS-024",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-024-01", type: "MCQ", prompt: "What is the primary difference between HTTP requests and WebSockets?", options: ["HTTP is request-response over short-lived connections; WebSockets provide a persistent, full-duplex, bi-directional TCP channel", "WebSockets only send binary data", "HTTP only works on mobile", "WebSockets do not use TCP"], answer: 0, points: 10 },
        { id: "Q-PFS-024-02", type: "MCQ", prompt: "What exception is raised in FastAPI when a WebSocket client disconnects or closes the tab?", options: ["WebSocketDisconnect", "ConnectionResetError only", "ClientClosedException", "HTTPException(400)"], answer: 0, points: 10 },
        { id: "Q-PFS-024-03", type: "MCQ", prompt: "What method must be called to complete the handshake and accept an incoming WebSocket connection in FastAPI?", options: ["await websocket.accept()", "websocket.open()", "websocket.connect()", "websocket.start()"], answer: 0, points: 10 },
        { id: "Q-PFS-024-04", type: "MCQ", prompt: "How do you broadcast a message across multiple connected WebSocket clients in a single room?", options: ["Iterate through the active connections list in a manager class and call `await connection.send_json(data)`", "Send a broadcast ping to the operating system", "WebSockets do not support multiple users", "Write to an HTML file"], answer: 0, points: 10 },
        { id: "Q-PFS-024-05", type: "MCQ", prompt: "How should WebSocket events be synchronized across multiple scaled backend server instances?", options: ["Using a distributed message broker like Redis Pub/Sub", "Through shared disk files", "By hardcoding server IPs", "WebSockets cannot be scaled"], answer: 0, points: 10 },
        { id: "Q-PFS-024-06", type: "MCQ", prompt: "What URI scheme indicates an encrypted, secure WebSocket connection?", options: ["wss://", "ws://", "https://", "socket://"], answer: 0, points: 10 },
        { id: "Q-PFS-024-07", type: "MCQ", prompt: "What method receives structured JSON payloads from a connected WebSocket in FastAPI?", options: ["await websocket.receive_json()", "websocket.get_json()", "websocket.read_body()", "websocket.poll()"], answer: 0, points: 10 },
        { id: "Q-PFS-024-08", type: "MCQ", prompt: "Why are WebSockets superior to HTTP polling for live proctoring cockpit monitoring grids?", options: ["They eliminate polling HTTP header overhead and deliver sub-10ms real-time event updates", "They use less bandwidth only", "They run on the GPU", "They bypass firewalls"], answer: 0, points: 10 },
        { id: "Q-PFS-024-09", type: "MCQ", prompt: "How should authentication be passed when establishing a WebSocket connection from a browser client?", options: ["Via ticket tokens in query parameters or custom headers during the initial HTTP upgrade handshake", "By transmitting passwords in every frame", "WebSockets cannot be authenticated", "Using FTP"], answer: 0, points: 10 },
        { id: "Q-PFS-024-10", type: "MCQ", prompt: "What mechanism detects silently dropped or dead WebSocket connections?", options: ["Periodic Ping/Pong heartbeat frames", "Recompiling the script", "Refreshing the database", "Checking CPU temperature"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-025",
      title: "Docker & Containerization Assessment",
      chapterId: "CH-PFS-025",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-025-01", type: "MCQ", prompt: "What is the primary benefit of Multi-Stage Docker builds in Python applications?", options: ["Compiles dependencies in a build stage with C compilers and copies only the `.venv` into a clean runtime image, minimizing size and attack surface", "Runs multiple operating systems in one container", "Eliminates the need for Python", "Speeds up internet bandwidth"], answer: 0, points: 10 },
        { id: "Q-PFS-025-02", type: "MCQ", prompt: "Why should you add a non-root user (`USER appuser`) in production Dockerfiles?", options: ["To prevent container-escape exploits from gaining root privileges on the underlying host kernel", "Because Python cannot execute as root", "To make images smaller", "Docker requires it for syntax validation"], answer: 0, points: 10 },
        { id: "Q-PFS-025-03", type: "MCQ", prompt: "Why should `pyproject.toml` and `poetry.lock` be copied and installed before copying the `src/` directory?", options: ["To leverage Docker layer caching so dependency installation layers are skipped if only source code changed", "Because Poetry requires it", "To compile Python bytecode first", "To format the code"], answer: 0, points: 10 },
        { id: "Q-PFS-025-04", type: "MCQ", prompt: "How should Uvicorn be executed in production containers to take advantage of multiple CPU cores?", options: ["uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4", "uvicorn src.main:app --reload", "python main.py", "uvicorn --single-thread"], answer: 0, points: 10 },
        { id: "Q-PFS-025-05", type: "MCQ", prompt: "What Docker Compose property delays starting the backend service until the PostgreSQL container reports healthy?", options: ["depends_on: { postgres: { condition: service_healthy } }", "wait_for: postgres", "delay: 10s", "order: 1"], answer: 0, points: 10 },
        { id: "Q-PFS-025-06", type: "MCQ", prompt: "What lightweight Linux base image is commonly chosen for Python containers to balance size and compatibility?", options: ["python:3.12-slim", "python:3.12-full", "ubuntu:latest", "alpine (with musl caveats)"], answer: 0, points: 10 },
        { id: "Q-PFS-025-07", type: "MCQ", prompt: "What Dockerfile instruction exposes the network port the container listens on?", options: ["EXPOSE 8000", "PORT 8000", "OPEN 8000", "LISTEN 8000"], answer: 0, points: 10 },
        { id: "Q-PFS-025-08", type: "MCQ", prompt: "What environment variable ensures Python output (logs) is sent straight to terminal buffers without being delayed?", options: ["PYTHONUNBUFFERED=1", "PYTHONDONTWRITEBYTECODE=1", "PYTHONPATH=/app", "DEBUG=true"], answer: 0, points: 10 },
        { id: "Q-PFS-025-09", type: "MCQ", prompt: "What Docker mechanism persists database data across container restarts and updates?", options: ["Named Docker Volumes", "Container layer cache", "Host RAM", "Temporary swap file"], answer: 0, points: 10 },
        { id: "Q-PFS-025-10", type: "MCQ", prompt: "What file excludes virtual environments, git history, and local caches from being sent in the Docker build context?", options: [".dockerignore", ".gitignore", ".env", "Dockerfile.ignore"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-026",
      title: "Pytest & Automated Testing Assessment",
      chapterId: "CH-PFS-026",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-026-01", type: "MCQ", prompt: "What decorator in Pytest defines reusable setup and teardown fixture functions?", options: ["@pytest.fixture", "@pytest.setup", "@pytest.dependency", "@pytest.context"], answer: 0, points: 10 },
        { id: "Q-PFS-026-02", type: "MCQ", prompt: "What plugin allows writing asynchronous `async def test_*` test methods in Pytest?", options: ["pytest-asyncio", "pytest-async", "pytest-await", "pytest-aio"], answer: 0, points: 10 },
        { id: "Q-PFS-026-03", type: "MCQ", prompt: "What Pytest decorator executes a test method multiple times across different argument values?", options: ["@pytest.mark.parametrize", "@pytest.mark.repeat", "@pytest.mark.loop", "@pytest.mark.cases"], answer: 0, points: 10 },
        { id: "Q-PFS-026-04", type: "MCQ", prompt: "What library allows mocking outgoing HTTP requests made by HTTPX during automated test runs?", options: ["respx / pytest-httpx", "mock-requests", "fake-api", "network-mock"], answer: 0, points: 10 },
        { id: "Q-PFS-026-05", type: "MCQ", prompt: "What parameter in `pytest-cov` enforces that the test suite fails CI if code coverage falls below 85%?", options: ["--cov-fail-under=85", "--min-coverage=85", "--coverage-threshold=85", "--strict-cov=85"], answer: 0, points: 10 },
        { id: "Q-PFS-026-06", type: "MCQ", prompt: "What file in a test directory automatically shares fixtures across all test files in that folder?", options: ["conftest.py", "fixtures.py", "setup.py", "init_tests.py"], answer: 0, points: 10 },
        { id: "Q-PFS-026-07", type: "MCQ", prompt: "What fixture scope executes a setup fixture once per entire test session rather than per function?", options: ["scope='session'", "scope='module'", "scope='package'", "scope='class'"], answer: 0, points: 10 },
        { id: "Q-PFS-026-08", type: "MCQ", prompt: "What library generates realistic, randomized mock database model instances for testing in Python?", options: ["Factory Boy", "MockData", "Faker only", "ModelMaker"], answer: 0, points: 10 },
        { id: "Q-PFS-026-09", type: "MCQ", prompt: "How do you assert that a specific exception is raised in a test using Pytest?", options: ["with pytest.raises(ValueError): fn()", "assert fn() == ValueError", "pytest.expect_error(ValueError)", "try-except only"], answer: 0, points: 10 },
        { id: "Q-PFS-026-10", type: "MCQ", prompt: "Why should unit tests mock external payment APIs instead of hitting live sandbox endpoints?", options: ["To ensure tests run fast, offline, deterministically, and without external network flakiness", "Because sandboxes are illegal", "Live APIs do not support tests", "To save HTTP headers"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-027",
      title: "CI/CD & Cloud Deployment Assessment",
      chapterId: "CH-PFS-027",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-027-01", type: "MCQ", prompt: "What tool in automated Python CI checks installed libraries for known security CVEs?", options: ["pip-audit / safety", "black", "mypy", "pytest"], answer: 0, points: 10 },
        { id: "Q-PFS-027-02", type: "MCQ", prompt: "Where are GitHub Actions CI workflows defined in a repository?", options: [".github/workflows/*.yml", ".ci/pipelines/", "scripts/build.sh", "github.json"], answer: 0, points: 10 },
        { id: "Q-PFS-027-03", type: "MCQ", prompt: "What cloud deployment model is Google Cloud Run and AWS App Runner?", options: ["Serverless container platforms that auto-scale containers based on incoming HTTP traffic and scale to zero when idle", "Managed Kubernetes clusters", "Bare-metal dedicated servers", "Virtual private networks"], answer: 0, points: 10 },
        { id: "Q-PFS-027-04", type: "MCQ", prompt: "What should happen in CI if Ruff detects a code formatting or linting violation?", options: ["The workflow fails and blocks merging the pull request until resolved", "The workflow merges anyway", "Ruff sends an email", "GitHub deletes the branch"], answer: 0, points: 10 },
        { id: "Q-PFS-027-05", type: "MCQ", prompt: "Where should database credentials and JWT secret keys be managed in cloud CI/CD pipelines?", options: ["In cloud secret managers (GitHub Encrypted Secrets, AWS Secrets Manager) injected at runtime as environment variables", "In public git repositories", "In Docker images", "In README files"], answer: 0, points: 10 },
        { id: "Q-PFS-027-06", type: "MCQ", prompt: "What command applies database schema updates during continuous deployment before traffic routes to new containers?", options: ["alembic upgrade head", "alembic generate", "python db.py", "alembic status"], answer: 0, points: 10 },
        { id: "Q-PFS-027-07", type: "MCQ", prompt: "What is the purpose of caching dependencies in GitHub Actions (e.g., `cache: 'pip'`)?", options: ["Speeds up CI pipeline execution by reusing previously downloaded wheel files across runs", "Compiles Python code", "Reduces server memory", "Runs tests in parallel"], answer: 0, points: 10 },
        { id: "Q-PFS-027-08", type: "MCQ", prompt: "What is an artifact repository in cloud software delivery?", options: ["A registry storing compiled container images and software packages (e.g., Amazon ECR, Docker Hub)", "A git commit list", "A database backup", "A wiki page"], answer: 0, points: 10 },
        { id: "Q-PFS-027-09", type: "MCQ", prompt: "What deployment strategy routes 5% of production users to a new container revision to monitor error rates before wider rollout?", options: ["Canary Deployment", "Blue-Green Deployment", "Rolling Update", "Recreate Strategy"], answer: 0, points: 10 },
        { id: "Q-PFS-027-10", type: "MCQ", prompt: "What is the primary benefit of Infrastructure as Code (IaC) using Terraform for Python systems?", options: ["Automated, reproducible provisioning of databases, caches, and container clusters across environments with version control", "Writing Python in HCL", "Replacing Dockerfiles", "Testing unit code"], answer: 0, points: 10 },
      ]
    }
  ]
};

