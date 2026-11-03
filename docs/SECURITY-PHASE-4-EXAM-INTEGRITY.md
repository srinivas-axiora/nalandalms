# Security remediation Phase 4: exam integrity

Captured: 2026-11-03 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Outcome

Phase 4 closes the confirmed deadline and grading-integrity bypasses. Regular
and public-candidate assessment writes now use server-authoritative deadlines.
Expired final submissions cannot add answers, expired share links cannot create
attempts, and the server no longer accepts client-reported elapsed time or an
auto-submission reason as authoritative state.

Public descriptive responses are no longer awarded credit based on text length.
They enter `PendingManualReview`, receive no pass/fail decision, and the
candidate UI clearly reports that evaluator review is pending.

## Controls implemented

- A shared deadline policy with an explicit attempt expiry and fail-closed
  handling for malformed or missing timing state.
- Immutable server-generated start and expiry timestamps for new public
  candidate attempts.
- Deadline checks on regular autosave/final submission and public candidate
  start, proctor-event and final-submission paths.
- Expired attempts auto-finalize only previously saved answers; late request
  bodies are never merged.
- Server-measured elapsed time with a bounded grace period.
- Manual-review state for descriptive public-candidate responses.
- Candidate result rendering for pending review rather than a false failure.

## Adversarial coverage

| Test | Secure behavior |
|---|---|
| SEC-008 | An expired authenticated attempt rejects bulk final answers. |
| SEC-012 | An expired candidate link cannot be started through the direct endpoint. |
| SEC-P4-001 | An expired public attempt rejects final answers. |
| SEC-P4-002 | Descriptive candidate responses cannot receive automatic credit. |

## Exit-gate evidence

| Command | Exit | Result |
|---|---:|---|
| `npm run test:security` | 0 | 30 adversarial tests passed |
| `npm test` | 0 | 15 files passed; 120 tests passed |
| `npm run typecheck` | 0 | Strict frontend type checking passed |
| `npm run build` | 0 | Production build passed; large-chunk warning remains |
| `npm audit --json` | 0 | 0 known vulnerabilities across 393 dependencies |
| `git diff --check` | 0 | No whitespace errors |

## Remaining release blockers

The original exploit regression queue is green, but that alone is not a
production-readiness decision. The application still requires durable,
transactional persistence for production workflows, distributed coordination,
operational privacy/retention execution, malware scanning, production secrets,
observability, backup/restore evidence and an AWS staging deployment before a
production go decision.
