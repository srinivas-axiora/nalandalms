# Phase 34 — Relational AI learning projection

Date: 2026-11-06
Status: **implemented, feature-gated, live staging proof pending**

## Outcome

The local Nalanda Copilot no longer reads process-local course, enrollment,
chapter or assessment arrays when `USE_PG_COURSES=1`. Its learning commands use
the same scoped course and assessment authorities as the API, user-filtered
enrollments, and course-filtered chapter metadata reads. The chapter projection
explicitly excludes bodies, URLs and filenames.

The migrated commands are:

- `my courses` / enrolled-course progress;
- `all courses`;
- skill-gap course recommendations;
- course detail and syllabus lookup; and
- context-sensitive quiz selection.

Repository work is loaded only for the command that needs it. Enrollment reads
are self-scoped, chapter reads are limited to visible courses, and contextual
quizzes accept only MCQs whose authorized projection contains a usable answer.
Consequently, a learner's answer-redacted assessment cannot become an invalid
or answer-leaking Copilot quiz; the command safely falls back to the general
question set.

## Evidence

- Dedicated relational Copilot tests cover enrolled-course projection,
  course/chapter detail, and answer-redacted quiz fallback.
- A repository regression proves the chapter metadata query excludes chapter
  bodies, URLs and filenames and rejects unscoped scans.
- Full functional suite: **71 files / 324 tests passed**.
- Adversarial security suite: **1 file / 32 tests passed**.
- JavaScript syntax validation, frontend typecheck and production build pass.
- Authorization inventory remains **129 routes**.
- The production build retains the known large-bundle warning
  (approximately 1,010.55 kB / 283.21 kB gzip); this is a performance concern,
  not a security-gate failure for this phase.

## Remaining release blockers

- Exercise the commands against staging RDS with learner, Manager and Admin
  identities and compare scope with the equivalent API views.
- Other legacy enrollment consumers remain outside this slice; the production
  `USE_PG_COURSES` prohibition stays in place until they are migrated and the
  multi-instance cutover is proven.
- Provider-backed AI evaluation, prompt/output governance and cost controls
  still require live staging evidence.

Production decision remains **NO-GO**.
