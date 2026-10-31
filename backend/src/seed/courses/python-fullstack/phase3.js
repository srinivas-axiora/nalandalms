// Phase 3: Intermediate (Chapters 15 to 21) - Python Full Stack Developer
// FastAPI, ASGI, SQLAlchemy 2.0, Alembic, Django, DRF, and JWT Security.

export const phase3 = {
  chapters: [
    // ── Chapter 15 ──
    {
      id: "CH-PFS-015",
      courseId: "CRS-PFS-001",
      sequence: 15,
      title: "Modern API Architecture with FastAPI & ASGI (Uvicorn)",
      description: "ASGI vs WSGI, Uvicorn server, path & query parameters, request/response bodies, automatic OpenAPI (Swagger) documentation, and response status codes.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 15</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Modern API Architecture with FastAPI & ASGI</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">FastAPI is the modern benchmark for high-performance Python backends. Built on <strong>Starlette</strong> for ASGI routing and <strong>Pydantic</strong> for data validation, FastAPI delivers speeds on par with NodeJS and Go while generating interactive OpenAPI documentation automatically.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/7t2alSnE2-I" title="FastAPI Course for Beginners" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. High-Performance REST API Endpoint with Pydantic & FastAPI</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List

app = FastAPI(title="Nalanda Enterprise API", version="2.0.0")

class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    category: str
    price: float = Field(ge=0.0)

class CourseResponse(CourseCreate):
    id: str

@app.post("/api/v1/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(payload: CourseCreate):
    # Automatic JSON validation, serialization, and Swagger docs generated!
    new_course = {"id": "CRS-999", **payload.model_dump()}
    return new_course</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>ASGI (Asynchronous Server Gateway Interface) replaces legacy synchronous WSGI, unlocking WebSockets and AsyncIO.</li>
      <li>Uvicorn is a lightning-fast ASGI web server implementation built around <code>uvloop</code> and <code>httptools</code>.</li>
      <li>FastAPI generates interactive Swagger UI (<code>/docs</code>) and ReDoc (<code>/redoc</code>) documentation automatically.</li>
      <li>Path operations automatically validate types against Pydantic models, returning 422 Unprocessable Entity on schema violations.</li>
      <li>Declare <code>response_model</code> to filter internal model fields (e.g., password hashes) from leaking into HTTP responses.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 16 ──
    {
      id: "CH-PFS-016",
      courseId: "CRS-PFS-001",
      sequence: 16,
      title: "Dependency Injection, Security Schemes & Custom Middleware in FastAPI",
      description: "The Depends system, yield dependencies for database sessions, OAuth2PasswordBearer, custom HTTP middleware, and CORS configuration.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 16</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">FastAPI Dependency Injection & Middleware Architecture</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">FastAPI features an exceptionally elegant <strong>Dependency Injection</strong> system built around <code>Depends()</code>. It allows endpoints to declare requirements—such as database connections, authenticated users, permissions, and query parameters—which FastAPI resolves automatically with zero boilerplate.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Scoped Database Session Dependency (Yield Pattern)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from fastapi import Depends, APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

async def get_db_session() -> AsyncSession:
    async with async_session_factory() as session:
        try:
            yield session  # Injected into the route handler
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# Modern Annotated syntax for clean DI:
DbSession = Annotated[AsyncSession, Depends(get_db_session)]

@router.get("/users/me")
async def get_current_user_profile(db: DbSession, current_user: CurrentUser):
    return await user_service.get_profile(db, current_user.id)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>Depends()</code> allows sharing database sessions, authentication checks, and business services across routes.</li>
      <li>Yield dependencies cleanly handle resource setup before the endpoint runs and teardown/commit after it finishes.</li>
      <li>Dependencies can be nested hierarchically; FastAPI resolves the complete directed dependency graph.</li>
      <li>Custom middleware (<code>@app.middleware("http")</code>) intercepts requests to add timing headers or correlation IDs.</li>
      <li>Configure <code>CORSMiddleware</code> to safely control cross-origin requests from your frontend React client.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 17 ──
    {
      id: "CH-PFS-017",
      courseId: "CRS-PFS-001",
      sequence: 17,
      title: "Database Engineering: SQLAlchemy 2.0 & SQLModel ORM Architecture",
      description: "Declarative models, async engine with asyncpg, select() statements, relationship mapping, eager loading (selectinload), and bridging Pydantic with SQLAlchemy via SQLModel.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 17</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">SQLAlchemy 2.0 & SQLModel ORM Architecture</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">SQLAlchemy 2.0 is the definitive relational database toolkit for Python, fully modernizing its API around typed <code>select()</code> constructs and native AsyncIO execution. <strong>SQLModel</strong> (created by the author of FastAPI) unites SQLAlchemy ORM models with Pydantic validation schemas, eliminating code duplication.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Async SQLAlchemy 2.0 Querying with Eager Relationship Loading</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

async def get_course_with_chapters(session: AsyncSession, course_id: str) -> Course:
    # selectinload prevents N+1 query problem by loading child collections in 2 queries total:
    query = (
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.chapters))
    )
    result = await session.execute(query)
    return result.scalar_one_or_none()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>SQLAlchemy 2.0 replaces legacy <code>session.query()</code> with modern declarative <code>select()</code> statements.</li>
      <li>Use the <code>asyncpg</code> driver for ultra-high-throughput asynchronous PostgreSQL operations.</li>
      <li>Always use <code>selectinload</code> or <code>joinedload</code> to prevent synchronous lazy-loading errors in async sessions.</li>
      <li>SQLModel enables a single class to function simultaneously as an ORM table model and a Pydantic validation schema.</li>
      <li>Use the Unit of Work pattern: flush changes within an active transaction and commit once at request end.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 18 ──
    {
      id: "CH-PFS-018",
      courseId: "CRS-PFS-001",
      sequence: 18,
      title: "Automated Database Schema Migrations with Alembic",
      description: "Alembic environment setup (env.py), autogenerating revisions against SQLAlchemy metadata, upgrade and downgrade mechanics, and zero-downtime database evolution.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 18</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Database Schema Migrations with Alembic</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Production database schemas cannot be managed through ad-hoc manual SQL execution. <strong>Alembic</strong> provides version-controlled, reversible schema migrations that automatically detect model changes and apply them seamlessly across environments.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Standard Alembic Workflow Commands</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># 1. Initialize migration environment:
alembic init -t async migrations

# 2. Auto-generate migration revision comparing SQLAlchemy models to DB:
alembic revision --autogenerate -m "Add proctoring trust score column"

# 3. Apply all pending migrations to the database:
alembic upgrade head

# 4. Rollback the most recent migration if needed:
alembic downgrade -1</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Alembic maintains an <code>alembic_version</code> table in PostgreSQL to track current schema state.</li>
      <li>Always inspect auto-generated migration scripts before committing to verify indexes and constraints.</li>
      <li>Never perform destructive schema operations (dropping columns) without a prior deployment deprecating usage.</li>
      <li>Alembic supports asynchronous drivers (like <code>asyncpg</code>) via the <code>run_sync()</code> helper in <code>env.py</code>.</li>
      <li>Integrate <code>alembic upgrade head</code> into container entrypoint scripts for automated deployment migrations.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 19 ──
    {
      id: "CH-PFS-019",
      courseId: "CRS-PFS-001",
      sequence: 19,
      title: "Full-Featured Web Applications with Django & Django ORM",
      description: "Django MTV (Model-Template-View) architecture, Django ORM querysets, Admin panel customization, forms, middleware, and built-in security features.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 19</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Full-Featured Applications with Django & Django ORM</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Django is Python's premier 'batteries-included' web framework, powering giants like Instagram, Pinterest, and Spotify. It includes a mature ORM, built-in user authentication, CSRF defense, automated admin back-offices, and robust forms handling out of the box.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Optimizing Django ORM Queries: <code>select_related</code> vs <code>prefetch_related</code></h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># 1. select_related (One-to-One and Many-to-One): Uses SQL JOIN
courses = Course.objects.select_related("instructor").filter(status="ACTIVE")

# 2. prefetch_related (Many-to-Many and reverse One-to-Many): Uses separate SQL IN queries
courses_with_tags = Course.objects.prefetch_related("tags", "chapters").all()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Django follows the MTV (Model-Template-View) architectural pattern.</li>
      <li>Use <code>select_related()</code> for foreign-key single objects and <code>prefetch_related()</code> for multi-object collections.</li>
      <li>The auto-generated Django Admin dashboard provides immediate back-office operational capabilities.</li>
      <li>Django QuerySets are lazy: SQL queries are executed only when the dataset is evaluated or iterated over.</li>
      <li>Django provides built-in protections against CSRF, SQL Injection, and Clickjacking by default.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 20 ──
    {
      id: "CH-PFS-020",
      courseId: "CRS-PFS-001",
      sequence: 20,
      title: "Enterprise APIs with Django REST Framework (DRF) & ViewSets",
      description: "DRF Serializers vs ModelSerializers, ViewSets, DefaultRouter, pagination classes, filtering/searching, and permission classes (IsAuthenticated, IsAdminUser).",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 20</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Enterprise APIs with Django REST Framework (DRF)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Django REST Framework (DRF) is the gold standard for exposing Django models as RESTful web services. ViewSets and Routers allow you to create complete CRUD endpoints with pagination, filtering, search, and granular role permissions in a few lines of declarative code.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Declarative DRF ModelViewSet</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("instructor").prefetch_related("chapters")
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "difficulty"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "price"]</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>ModelSerializer</code> automates field mapping and validation between Django models and JSON.</li>
      <li><code>ModelViewSet</code> bundles standard actions (<code>list</code>, <code>create</code>, <code>retrieve</code>, <code>update</code>, <code>destroy</code>) into one class.</li>
      <li>Routers (<code>DefaultRouter</code>) generate standard RESTful URL patterns automatically.</li>
      <li>Enforce security declaratively using <code>permission_classes</code> and custom permissions.</li>
      <li>Always configure pagination classes (<code>PageNumberPagination</code> or <code>CursorPagination</code>) on list endpoints.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 21 ──
    {
      id: "CH-PFS-021",
      courseId: "CRS-PFS-001",
      sequence: 21,
      title: "Authentication & Authorization: Passlib/Argon2, Stateless JWT & OAuth2 Scopes",
      description: "Password hashing with Argon2id, PyJWT token generation and verification, refresh token rotation, OAuth2 password bearer flow, and role-based permissions.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#0284c7;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 21</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Authentication: Argon2id Hashing & JWT Security</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Securing Python web applications requires bulletproof credential hashing and stateless token management. You will implement password hashing using the password-hashing competition winner <strong>Argon2id</strong>, followed by cryptographic <strong>JWT authentication</strong> with refresh token rotation.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Password Hashing with Argon2id via Passlib</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str, role: str, expires_delta: timedelta = timedelta(minutes=30)) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.utcnow() + expires_delta,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, "SECRET_KEY", algorithm="HS256")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Argon2id is the state-of-the-art password hashing algorithm resistant to GPU and ASIC brute-force attacks.</li>
      <li>JWT access tokens should have a short lifespan (15–30 minutes) paired with a longer-lived refresh token.</li>
      <li>Validate JWT tokens in FastAPI via <code>OAuth2PasswordBearer</code> and custom dependency functions.</li>
      <li>Never store passwords or sensitive authorization tokens in plain text in database tables.</li>
      <li>Store refresh tokens in HttpOnly, Secure cookies to mitigate Cross-Site Scripting (XSS) risks.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 3 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-PFS-015",
      title: "FastAPI & ASGI Assessment",
      chapterId: "CH-PFS-015",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-015-01", type: "MCQ", prompt: "What does ASGI stand for in modern Python web servers?", options: ["Asynchronous Server Gateway Interface", "Application Synchronous Gateway Interface", "Active Server Generated Interface", "Automated Script Gateway Interface"], answer: 0, points: 10 },
        { id: "Q-PFS-015-02", type: "MCQ", prompt: "What ASGI server is most commonly paired with FastAPI in production?", options: ["Uvicorn / Hypercorn", "Gunicorn (without worker)", "Apache HTTPD", "Nginx directly"], answer: 0, points: 10 },
        { id: "Q-PFS-015-03", type: "MCQ", prompt: "What URL endpoint provides interactive Swagger UI documentation in a default FastAPI app?", options: ["/docs", "/swagger", "/api/v1/spec", "/help"], answer: 0, points: 10 },
        { id: "Q-PFS-015-04", type: "MCQ", prompt: "What HTTP status code is automatically returned by FastAPI when request parameters fail Pydantic validation?", options: ["422 Unprocessable Entity", "400 Bad Request", "500 Server Error", "404 Not Found"], answer: 0, points: 10 },
        { id: "Q-PFS-015-05", type: "MCQ", prompt: "What parameter in a path operation decorator filters out sensitive internal model fields from the HTTP response?", options: ["response_model=PublicSchema", "output_filter=True", "hide_fields=[]", "serialize_as=JSON"], answer: 0, points: 10 },
        { id: "Q-PFS-015-06", type: "MCQ", prompt: "What two foundational libraries is FastAPI directly built on top of?", options: ["Starlette (ASGI routing) and Pydantic (data validation)", "Django and Flask", "Tornado and Twisted", "SQLAlchemy and Celery"], answer: 0, points: 10 },
        { id: "Q-PFS-015-07", type: "MCQ", prompt: "How do you define a route parameter that must be passed in the URL path: `/items/{item_id}`?", options: ["Include `item_id` in the path template and as an argument in the async function signature", "Use request.GET['item_id']", "Query params only", "Path parameters are not supported"], answer: 0, points: 10 },
        { id: "Q-PFS-015-08", type: "MCQ", prompt: "Can you write synchronous `def` endpoints (without `async`) in FastAPI?", options: ["Yes, FastAPI runs synchronous endpoints in a separate background thread pool to prevent blocking the event loop", "No, all endpoints must be async", "Only if Uvicorn is disabled", "Only in development"], answer: 0, points: 10 },
        { id: "Q-PFS-015-09", type: "MCQ", prompt: "What exception should be raised to return a custom HTTP error status and message from a FastAPI route?", options: ["raise HTTPException(status_code=404, detail='Not found')", "raise ValueError()", "raise SystemError()", "return 'error'"], answer: 0, points: 10 },
        { id: "Q-PFS-015-10", type: "MCQ", prompt: "What alternative API documentation view is provided by default at `/redoc` in FastAPI?", options: ["ReDoc interactive documentation", "Postman runner", "Raw Markdown viewer", "GraphiQL"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-016",
      title: "Dependency Injection & Middleware Assessment",
      chapterId: "CH-PFS-016",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-016-01", type: "MCQ", prompt: "What function declares a dependency in a FastAPI path operation signature?", options: ["Depends()", "Inject()", "Require()", "Autowired()"], answer: 0, points: 10 },
        { id: "Q-PFS-016-02", type: "MCQ", prompt: "What is the primary advantage of using a generator dependency with `yield` for database sessions?", options: ["It cleanly executes teardown/commit logic after the route finishes responding", "It makes queries 10x faster", "It avoids writing SQL", "It requires no database connection"], answer: 0, points: 10 },
        { id: "Q-PFS-016-03", type: "MCQ", prompt: "What built-in middleware handles Cross-Origin Resource Sharing (CORS) in FastAPI?", options: ["CORSMiddleware (from starlette.middleware.cors)", "SecurityMiddleware", "OriginFilter", "AuthMiddleware"], answer: 0, points: 10 },
        { id: "Q-PFS-016-04", type: "MCQ", prompt: "Can dependencies in FastAPI depend on other dependencies (hierarchical sub-dependencies)?", options: ["Yes, FastAPI automatically resolves the complete directed dependency graph", "No, dependencies must be flat", "Only up to 2 levels", "Only in Django"], answer: 0, points: 10 },
        { id: "Q-PFS-016-05", type: "MCQ", prompt: "What utility class represents an OAuth2 password flow endpoint in FastAPI security?", options: ["OAuth2PasswordBearer", "SecuritySchemeBearer", "JWTAuthFlow", "TokenHeader"], answer: 0, points: 10 },
        { id: "Q-PFS-016-06", type: "MCQ", prompt: "What decorator attaches custom global HTTP middleware in a FastAPI application?", options: ["@app.middleware('http')", "@app.interceptor()", "@app.filter()", "@app.hook()"], answer: 0, points: 10 },
        { id: "Q-PFS-016-07", type: "MCQ", prompt: "How can you apply a dependency to ALL routes across an entire APIRouter?", options: ["router = APIRouter(dependencies=[Depends(...)])", "In a for loop", "By annotating every single function manually", "Not possible in FastAPI"], answer: 0, points: 10 },
        { id: "Q-PFS-016-08", type: "MCQ", prompt: "What parameter on `Depends(get_db, use_cache=False)` forces the dependency to execute anew instead of reusing cached values in the same request?", options: ["use_cache=False", "no_cache=True", "fresh=True", "reload=True"], answer: 0, points: 10 },
        { id: "Q-PFS-016-09", type: "MCQ", prompt: "What typing construct combines type declarations and dependency metadata in modern Python 3.10+?", options: ["typing.Annotated[Type, Depends(...)]", "Union", "Generic", "TypedDict"], answer: 0, points: 10 },
        { id: "Q-PFS-016-10", type: "MCQ", prompt: "What function parameter is passed to HTTP middleware to invoke the next handler in the pipeline?", options: ["call_next", "next_handler", "dispatch", "proceed"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-017",
      title: "SQLAlchemy 2.0 & SQLModel Assessment",
      chapterId: "CH-PFS-017",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-017-01", type: "MCQ", prompt: "What construct replaced the legacy `session.query(Model)` API in modern SQLAlchemy 2.0?", options: ["select(Model) executed via session.execute()", "Model.find()", "raw SQL only", "session.get_all()"], answer: 0, points: 10 },
        { id: "Q-PFS-017-02", type: "MCQ", prompt: "What asynchronous database driver is widely recommended for PostgreSQL with SQLAlchemy 2.0?", options: ["asyncpg", "psycopg2 (synchronous)", "sqlite3", "pyodbc"], answer: 0, points: 10 },
        { id: "Q-PFS-017-03", type: "MCQ", prompt: "What loader strategy prevents N+1 query issues by issuing a second query with an IN clause to load related collections?", options: ["selectinload()", "lazyload()", "noload()", "subqueryload() only"], answer: 0, points: 10 },
        { id: "Q-PFS-017-04", type: "MCQ", prompt: "What is SQLModel designed to accomplish?", options: ["Unifying SQLAlchemy database models with Pydantic validation schemas in a single class definition", "Replacing PostgreSQL with SQLite", "Writing SQL in HTML", "Compiling Python to Rust"], answer: 0, points: 10 },
        { id: "Q-PFS-017-05", type: "MCQ", prompt: "What method extracts the single scalar result from a SQLAlchemy execute result or None if absent?", options: ["result.scalar_one_or_none()", "result.first_only()", "result.get_one()", "result.fetch_single()"], answer: 0, points: 10 },
        { id: "Q-PFS-017-06", type: "MCQ", prompt: "Why does accessing an unloaded lazy relationship raise an error in async SQLAlchemy sessions?", options: ["Because async sessions cannot perform implicit synchronous blocking I/O behind the scenes to fetch data", "Because relationships are disabled in async", "Because PostgreSQL disallows foreign keys", "It is a Python syntax error"], answer: 0, points: 10 },
        { id: "Q-PFS-017-07", type: "MCQ", prompt: "What keyword argument in SQLModel designates a field as the primary key?", options: ["Field(primary_key=True)", "Column(id=True)", "Key()", "Index(primary=True)"], answer: 0, points: 10 },
        { id: "Q-PFS-017-08", type: "MCQ", prompt: "What function creates an asynchronous database engine in SQLAlchemy?", options: ["create_async_engine('postgresql+asyncpg://...')", "create_engine()", "async_engine()", "connect_async()"], answer: 0, points: 10 },
        { id: "Q-PFS-017-09", type: "MCQ", prompt: "What does `session.flush()` do compared to `session.commit()`?", options: ["Sends SQL statements to the database without committing the transaction, populating generated IDs and verifying constraints", "Permanently commits and closes the connection", "Rolls back all changes", "Deletes the session cache"], answer: 0, points: 10 },
        { id: "Q-PFS-017-10", type: "MCQ", prompt: "What clause adds filtering conditions to a SQLAlchemy 2.0 `select()` statement?", options: [".where(Model.attribute == value)", ".filter_by() only", ".having() only", ".match()"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-018",
      title: "Alembic Database Migrations Assessment",
      chapterId: "CH-PFS-018",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-018-01", type: "MCQ", prompt: "What command generates a migration file by comparing SQLAlchemy metadata against the live database schema?", options: ["alembic revision --autogenerate -m 'message'", "alembic make", "alembic generate-all", "alembic diff"], answer: 0, points: 10 },
        { id: "Q-PFS-018-02", type: "MCQ", prompt: "What command applies all pending migration revisions up to the newest version?", options: ["alembic upgrade head", "alembic apply latest", "alembic migrate", "alembic update all"], answer: 0, points: 10 },
        { id: "Q-PFS-018-03", type: "MCQ", prompt: "What table does Alembic automatically create in the target database to record the current migration revision?", options: ["alembic_version", "schema_migrations", "migration_history", "db_version"], answer: 0, points: 10 },
        { id: "Q-PFS-018-04", type: "MCQ", prompt: "What two functions must every Alembic migration script define?", options: ["upgrade() and downgrade()", "start() and rollback()", "up() and down()", "forward() and backward()"], answer: 0, points: 10 },
        { id: "Q-PFS-018-05", type: "MCQ", prompt: "What file in the Alembic directory configures the connection URL and metadata inspection environment?", options: ["env.py", "alembic.ini only", "config.py", "migration.py"], answer: 0, points: 10 },
        { id: "Q-PFS-018-06", type: "MCQ", prompt: "How can you rollback exactly one migration step in Alembic?", options: ["alembic downgrade -1", "alembic undo", "alembic rollback 1", "alembic revert"], answer: 0, points: 10 },
        { id: "Q-PFS-018-07", type: "MCQ", prompt: "Why should auto-generated Alembic migrations always be reviewed by a human before applying in production?", options: ["Autogenerate may not detect renamed columns (treating them as drop + add) or complex table constraints", "Alembic deletes tables randomly", "Alembic only supports MySQL", "It is required by PEP 8"], answer: 0, points: 10 },
        { id: "Q-PFS-018-08", type: "MCQ", prompt: "What is a 'branch' in Alembic migration history?", options: ["When two developers generate revisions from the same base revision, causing multiple heads in the migration tree", "A git branch", "A tree data structure", "A database shard"], answer: 0, points: 10 },
        { id: "Q-PFS-018-09", type: "MCQ", prompt: "What command merges multiple Alembic heads into a single unified revision branch?", options: ["alembic merge heads -m 'merge heads'", "alembic resolve", "alembic join", "git merge"], answer: 0, points: 10 },
        { id: "Q-PFS-018-10", type: "MCQ", prompt: "What command displays the current active revision hash in the target database?", options: ["alembic current", "alembic status", "alembic info", "alembic version"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-019",
      title: "Django & Django ORM Assessment",
      chapterId: "CH-PFS-019",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-019-01", type: "MCQ", prompt: "What architectural pattern does the Django web framework follow?", options: ["Model-Template-View (MTV)", "Model-View-Controller (MVC) exclusively", "Micro-kernel", "Event-Sourcing"], answer: 0, points: 10 },
        { id: "Q-PFS-019-02", type: "MCQ", prompt: "What is the primary difference between `select_related()` and `prefetch_related()` in Django ORM?", options: ["`select_related` performs an SQL JOIN for single-valued relationships (ForeignKey); `prefetch_related` executes separate queries for multi-valued relationships (ManyToMany)", "`select_related` only works on strings", "`prefetch_related` is synchronous only", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-PFS-019-03", type: "MCQ", prompt: "What does it mean that Django QuerySets are 'lazy'?", options: ["QuerySets do not hit the database until their contents are explicitly evaluated or iterated over", "QuerySets run slowly", "QuerySets only read 1 row", "QuerySets are single-threaded"], answer: 0, points: 10 },
        { id: "Q-PFS-019-04", type: "MCQ", prompt: "What command creates database migration files based on changes in Django `models.py`?", options: ["python manage.py makemigrations", "python manage.py migrate", "python manage.py create_schema", "python manage.py db-update"], answer: 0, points: 10 },
        { id: "Q-PFS-019-05", type: "MCQ", prompt: "What built-in Django feature provides an immediate web-based management interface for database models?", options: ["Django Admin (django.contrib.admin)", "Django Shell", "Django Graph", "Django Dashboard"], answer: 0, points: 10 },
        { id: "Q-PFS-019-06", type: "MCQ", prompt: "What security middleware protects Django forms against Cross-Site Request Forgery attacks?", options: ["CsrfViewMiddleware and `{% csrf_token %}`", "CorsMiddleware", "XssProtectionMiddleware", "AuthMiddleware"], answer: 0, points: 10 },
        { id: "Q-PFS-019-07", type: "MCQ", prompt: "What method executes complex SQL WHERE clauses with OR conditions in Django ORM?", options: ["Q objects: `filter(Q(status='A') | Q(status='B'))`", "F expressions", "Raw SQL only", "Union()"], answer: 0, points: 10 },
        { id: "Q-PFS-019-08", type: "MCQ", prompt: "What do Django `F()` expressions allow in database queries?", options: ["Referencing model field values directly in the database without pulling them into Python memory (e.g., `likes = F('likes') + 1`)", "Formatting dates", "Fast queries", "File uploads"], answer: 0, points: 10 },
        { id: "Q-PFS-019-09", type: "MCQ", prompt: "What file in a Django project defines global settings, installed apps, and middleware configuration?", options: ["settings.py", "urls.py", "wsgi.py", "manage.py"], answer: 0, points: 10 },
        { id: "Q-PFS-019-10", type: "MCQ", prompt: "What command applies pending Django migrations to the configured database?", options: ["python manage.py migrate", "python manage.py apply", "python manage.py upgrade", "python manage.py sync"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-020",
      title: "Django REST Framework (DRF) Assessment",
      chapterId: "CH-PFS-020",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-020-01", type: "MCQ", prompt: "What class in DRF automatically creates a serializer with fields corresponding to a Django Model?", options: ["serializers.ModelSerializer", "serializers.Serializer", "serializers.AutoSerializer", "serializers.BaseModelSerializer"], answer: 0, points: 10 },
        { id: "Q-PFS-020-02", type: "MCQ", prompt: "What class combines all standard CRUD actions (`list`, `create`, `retrieve`, `update`, `destroy`) into one unified controller in DRF?", options: ["viewsets.ModelViewSet", "APIView", "generics.ListAPIView", "views.StandardView"], answer: 0, points: 10 },
        { id: "Q-PFS-020-03", type: "MCQ", prompt: "What DRF component automatically generates RESTful URL routing for registered ViewSets?", options: ["routers.DefaultRouter", "urls.auto_route", "viewsets.Router", "django.urls.path"], answer: 0, points: 10 },
        { id: "Q-PFS-020-04", type: "MCQ", prompt: "What built-in permission class in DRF restricts access strictly to authenticated requests?", options: ["permissions.IsAuthenticated", "permissions.AllowAny", "permissions.IsStaff", "permissions.StrictAuth"], answer: 0, points: 10 },
        { id: "Q-PFS-020-05", type: "MCQ", prompt: "What method in a DRF Serializer performs custom object-level cross-field validation?", options: ["def validate(self, data):", "def clean(self):", "def verify(self):", "def check(self):"], answer: 0, points: 10 },
        { id: "Q-PFS-020-06", type: "MCQ", prompt: "What decorator in a DRF ViewSet adds a custom action route (e.g., `POST /courses/{id}/enroll/`)?", options: ["@action(detail=True, methods=['post'])", "@custom_route()", "@endpoint()", "@api_method()"], answer: 0, points: 10 },
        { id: "Q-PFS-020-07", type: "MCQ", prompt: "What is the purpose of DRF Throttle classes (e.g., `AnonRateThrottle`, `UserRateThrottle`)?", options: ["Rate-limiting incoming API requests per second/minute to prevent denial-of-service abuse", "Compressing JSON responses", "Throttling CPU usage", "Limiting database connection pool size"], answer: 0, points: 10 },
        { id: "Q-PFS-020-08", type: "MCQ", prompt: "What does calling `serializer.is_valid(raise_exception=True)` do if validation fails?", options: ["Automatically raises a 400 Bad Request exception containing validation error details in the response", "Crashes the server with code 500", "Returns None", "Silently skips errors"], answer: 0, points: 10 },
        { id: "Q-PFS-020-09", type: "MCQ", prompt: "What pagination class in DRF uses opaque encoded cursor tokens for high-speed pagination across large datasets?", options: ["CursorPagination", "PageNumberPagination", "LimitOffsetPagination", "OffsetPaginator"], answer: 0, points: 10 },
        { id: "Q-PFS-020-10", type: "MCQ", prompt: "What package adds advanced query filtering to DRF ViewSets using query parameters?", options: ["django-filter (DjangoFilterBackend)", "drf-query", "drf-search", "django-params"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-PFS-021",
      title: "Authentication & Cryptography Assessment",
      chapterId: "CH-PFS-021",
      courseId: "CRS-PFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-PFS-021-01", type: "MCQ", prompt: "What password hashing algorithm won the Password Hashing Competition (PHC) and is recommended for high security?", options: ["Argon2 (Argon2id)", "MD5", "SHA-256", "DES"], answer: 0, points: 10 },
        { id: "Q-PFS-021-02", type: "MCQ", prompt: "Why is plain SHA-256 or MD5 completely unsuitable for password storage?", options: ["They are fast general-purpose hash functions, allowing attackers to compute billions of guesses per second on commodity GPUs without salt", "They cannot hash strings", "Python deprecated them", "They are too slow"], answer: 0, points: 10 },
        { id: "Q-PFS-021-03", type: "MCQ", prompt: "What standard Python library encodes and decodes JSON Web Tokens?", options: ["PyJWT / python-jose", "passlib", "cryptography only", "hashlib"], answer: 0, points: 10 },
        { id: "Q-PFS-021-04", type: "MCQ", prompt: "What standard claim in a JWT payload identifies the principal subject (usually user ID)?", options: ["sub", "uid", "user", "id"], answer: 0, points: 10 },
        { id: "Q-PFS-021-05", type: "MCQ", prompt: "What is the recommended lifespan for a stateless JWT access token?", options: ["Short duration (15 to 30 minutes)", "10 years", "Indefinite", "24 hours minimum"], answer: 0, points: 10 },
        { id: "Q-PFS-021-06", type: "MCQ", prompt: "What mechanism is used to issue new access tokens when they expire without requiring the user to re-enter credentials?", options: ["Refresh Token Rotation", "Password caching in localStorage", "Disabling token expiration", "Generating tokens without signatures"], answer: 0, points: 10 },
        { id: "Q-PFS-021-07", type: "MCQ", prompt: "What attribute prevents JavaScript in the browser from reading a cookie via `document.cookie` (mitigating XSS theft)?", options: ["HttpOnly", "Secure", "SameSite", "MaxAge"], answer: 0, points: 10 },
        { id: "Q-PFS-021-08", type: "MCQ", prompt: "What cryptographic signing algorithm is symmetric (uses one shared secret key for signing and verification)?", options: ["HS256 (HMAC with SHA-256)", "RS256 (RSA asymmetric)", "ES256 (ECDSA)", "Ed25519"], answer: 0, points: 10 },
        { id: "Q-PFS-021-09", type: "MCQ", prompt: "What does the `exp` claim represent in a JWT token payload?", options: ["Expiration time (Unix timestamp) after which the token is rejected", "Exposure level", "Expected user", "Export flag"], answer: 0, points: 10 },
        { id: "Q-PFS-021-10", type: "MCQ", prompt: "What is OAuth2 scope in API authorization?", options: ["A permission identifier that limits what client applications or tokens can access on behalf of a user (e.g., `read:profile`, `write:orders`)", "A Python variable scope", "A database table name", "A network subnet"], answer: 0, points: 10 },
      ]
    }
  ]
};

