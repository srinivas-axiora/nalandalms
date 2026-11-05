# Phase 15 — course-scoped object and content authority

Date: 2026-11-05
Status: **implemented, feature-gated, live RDS/S3 proof pending**
Production decision: **NO-GO remains unchanged**

## Outcome

The experimental `USE_PG_COURSES=1` path now controls course-content upload
grants and protected chapter download grants using the same PostgreSQL course,
chapter and enrollment authority as chapter listing and progress. Upload and
download authorization no longer consult process-local learning arrays when
the relational cutover is enabled.

The fallback path is also stronger: every content upload requires an explicit
course identifier and a Manager must own that course. Generated object keys are
rooted under `course_media/<courseId>/` or `chapter_pdf/<courseId>/`.

## Controls implemented

- Upload presigning requires a validated course ID before any token or object
  key is created.
- PostgreSQL checks course existence and owner/admin authority under a shared
  transaction; a broad Manager role is insufficient.
- Fallback authorization applies the same owner/admin rule.
- Protected downloads require owner/admin authority or an active, approved
  course with a relational enrollment.
- Learners cannot receive a signed URL for a chapter whose prerequisite chapter
  is incomplete.
- Chapter PDF object keys must belong to the chapter's own course prefix.
  Cross-course keys and traversal segments are rejected during authoring, and
  the download route independently rechecks the prefix before signing.
- Local download grants remain short-lived and subject-bound. S3 URLs remain
  short-lived bearer grants created only after application authorization.
- The React course editors upload PDF bytes through the scoped grant rather
  than serializing base64 documents into application/browser state.
- Chapter create/update requests now include the optimistic course and chapter
  versions expected by the relational API and retain the returned course
  version.
- The chapter player requests a fresh authorized content URL when a protected
  PDF is opened instead of treating its stored object key as a public URL.

## Schema and migration impact

No new migration is required. Phase 15 consumes the normalized `courses`,
`chapters` and `enrollments` tables introduced by the earlier relational
learning phases. The existing chapter `url` field stores a managed object key
for uploaded PDFs while `file_name` remains display metadata.

## Local evidence

- Functional suite: 33 files and 210 tests passed.
- Security regression suite: 32 adversarial tests passed, including explicit
  foreign-Manager upload and locked-chapter download cases.
- Focused content gate: 4 files and 28 tests passed, covering course ownership,
  missing course scope, locked chapters, eligible learner access and
  cross-course object rejection.
- TypeScript checking, production build, route inventory, JavaScript syntax and
  `git diff --check` passed.
- The production bundle completed with the existing large-chunk warning; the
  main JavaScript chunk is approximately 1.01 MB.
- `npm audit --json` reported zero known vulnerabilities across 393 packages.
- `db:verify-learning` failed closed because neither `DATABASE_URL` nor
  `PGHOST` is available. No live PostgreSQL or S3 behavior was inferred from
  mocks.

## Required staging gate

Keep `USE_PG_COURSES=0`, snapshot RDS, and execute the Phase 12–14 migration,
backfill and verification sequence. Then, in an isolated staging task:

1. Enable `USE_PG_COURSES=1` while the task remains outside ALB production
   traffic; readiness must remain HTTP 503.
2. Verify an owning Manager and Admin can upload a PDF, while a foreign Manager
   receives 403 and no S3 object is created.
3. Verify an unenrolled learner and a learner blocked by prerequisites receive
   403 and no signed URL.
4. Verify an eligible learner can download only the requested course object's
   prefix, and that an attempted cross-course key is rejected.
5. Inspect S3 CloudTrail/access logs, encryption, Block Public Access, lifecycle
   rules, malware quarantine and object ownership configuration.
6. Exercise revocation/role-change behavior during the ten-minute upload-grant
   window and document the accepted residual risk or shorten the TTL.

## Remaining blockers

Production continues to reject `USE_PG_COURSES=1`, AWS keeps it disabled and
readiness remains fail-closed. Cohorts, assignment administration, reports,
application-wide analytics and AI course generation still consume process-local
learning state. Live PostgreSQL transactions, private S3 behavior, malware
scanning/quarantine and multi-task race behavior remain unproven.
