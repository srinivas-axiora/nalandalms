# Nalanda Architecture

Nalanda is structured as an API-first Training & Development platform for 2000+ employees with Super Admin, Admin, Manager, and Employee roles.

## Local Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed (schema available for future migration)

### Quick Start
```bash
# Install dependencies
npm install

# Start both frontend + backend
npm run dev
```

This runs:
- **Frontend** (Vite) on `http://localhost:5173`
- **Backend** (Express API) on `http://localhost:8080`

The Vite dev server proxies all `/api` requests to the backend automatically.

### Individual Commands
```bash
npm run dev:frontend   # Vite dev server only
npm run dev:backend    # Express API only
npm run build          # Production build
npm run preview        # Preview production build
```

## Local Components

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express, JWT, RBAC middleware, file upload endpoints, proctoring event ingestion.
- **Database**: PostgreSQL schema in `database/schema.sql` (not yet wired — backend uses in-memory data).
- **Storage**: Designed for S3, Azure Blob, GCS, or Firebase Storage through `storage_key` references.
- **Real-time**: Proctoring alerts can be upgraded to WebSockets by broadcasting `/api/proctoring/events`.

## Bootstrap Credentials

Seeded accounts are created only with passwords supplied through `SEED_*_PASSWORD`
environment variables. If a seed password is not provided, the backend assigns a
random unknown password so no source-visible credential can be used to sign in.

## Core API Groups

- Auth: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- CSRF: `/api/csrf-token`
- Users: `/api/users`, `/api/users/:id`, `/api/users/:id/status`
- Courses: `/api/courses`, `/api/courses/:id/duplicate`, `/api/courses/:id/approval`, `/api/courses/:id/status`
- Chapters: `/api/courses/:courseId/chapters`, `/api/courses/:courseId/chapters/:chapterId`
- Assignments: `/api/assignments`
- Learning time: `/api/courses/:courseId/chapters/:chapterId/time`, `/api/analytics/time`, `/api/analytics/time/events`
- Assessments: `/api/assessments`, `/api/assessments/:id/approval`, `/api/assessments/:id/attempts/start`, `/api/assessments/attempts/:attemptId/submit`
- Proctoring: `/api/proctoring/events`
- Analytics: `/api/analytics/global`, `/api/analytics/team`, `/api/analytics/me`
- Reports: `/api/reports/export`
- Certificates: `/api/certificates`
- Archive: `/api/archive`, `/api/archive/:id/restore`
- Settings: `/api/settings`
- Audit: `/api/audit-logs`
- Video Progress: `/api/courses/:courseId/chapters/:chapterId/progress`
- Health: `/api/health`

## Security Model

- JWT cookie-based authentication protects all non-health endpoints.
- JWTs include a per-user `sessionVersion`; deactivating a user increments it, and deleting a user removes the identity so stale tokens are rejected immediately.
- CSRF token validation on all state-changing requests.
- RBAC middleware blocks access by role.
- Login rate limiting and account lockout after 5 failed attempts.
- Users are deactivated instead of deleted to preserve training history.
- Super Admin can permanently delete and archive records.
- Course and assessment approvals are Admin-controlled.
- Chapters store `minimumTimeMinutes`; the API returns `minimumTimeSeconds` and `minimumTimeMet` with chapter progress/time reads.
- Chapter learning time is tracked in seconds per enrollment, per chapter, and as append-only `CHAPTER_TIME` events for audit/reporting.
- Course total time is stored on the enrollment as seconds and includes chapter learning time plus assessment attempt time.
- Assessment attempts store elapsed time from opening the assessment through final submission and emit `ASSESSMENT_TIME` events.
- Proctoring logs are immutable append-only records.
- Course media should be stored outside the database using encrypted object storage and signed URLs.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Backend API port |
| `JWT_SECRET` | `dev-only-change-me` | JWT signing secret |

## Project Structure

```
Nalanda/
├── backend/
│   └── server.js          # Express API server (in-memory data)
├── database/
│   └── schema.sql         # PostgreSQL schema (reference)
├── docs/
│   ├── ARCHITECTURE.md    # This file
│   └── openapi.yaml       # API specification
├── public/
│   └── cursors/           # Custom cursor SVGs
├── src/
│   ├── pages/             # React page components
│   ├── App.tsx            # Main app shell & routing
│   ├── api.ts             # API client with CSRF handling
│   ├── components.tsx     # Shared UI components
│   ├── index.css          # Global styles & Tailwind
│   ├── main.tsx           # React entry point
│   ├── seedData.ts        # Frontend seed/demo data
│   ├── toast.ts           # Toast notification utility
│   └── types.ts           # TypeScript type definitions
├── .env                   # Environment variables
├── index.html             # HTML entry point
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Vite + proxy config
```

## Cloud Path

- Containerize frontend and backend separately.
- Connect PostgreSQL using `database/schema.sql`.
- Add managed PostgreSQL with read replicas for analytics-heavy reporting.
- Add Redis or a queue for long-running report exports.
- Add WebSockets for real-time strict assessment alerts.
- Put course media behind signed URLs and CDN rules.
- Use OAuth or SAML SSO for enterprise identity.
