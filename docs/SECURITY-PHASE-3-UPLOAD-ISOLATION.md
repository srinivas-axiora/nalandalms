# Security remediation Phase 3: upload isolation

Captured: 2026-11-03 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`

## Outcome

Phase 3 closes the confirmed unrestricted-upload and public same-origin file
delivery paths. Course uploads now require a short-lived, subject-bound grant,
strict role authorization, size and type validation, magic-byte verification,
random server-generated object keys and non-overwriting writes. Proctoring
captures are restricted to the candidate or assigned staff member for the
target attempt.

Uploaded objects are no longer exposed by Express static hosting. Downloads
require an authenticated, subject-bound grant, are delivered as attachments,
and include `X-Content-Type-Options: nosniff`, a sandbox content-security policy
and private no-store caching. Sensitive grant values are redacted from request
and security logs.

## Controls implemented

- Admin/Manager authorization for course-content uploads.
- Server-generated object keys and normalized root-contained local paths.
- Fifteen-megabyte course-file and five-megabyte capture limits.
- Filename-extension, declared MIME and file-signature agreement.
- One-purpose, expiring upload/download JWT grants bound to the authenticated
  subject, key, content type, filename and size.
- Non-overwriting local and S3 object writes.
- Private authenticated downloads; `/uploads` now always returns 404.
- Object-level authorization for proctoring captures.
- ECS-compatible S3 credential resolution through the default AWS credential
  chain; static keys are no longer required.
- The unanchored `uploads/` ignore rule was corrected so the route source is
  included in clean checkouts.
- Dependency remediation reduced `npm audit` from 14 vulnerable packages to
  zero reported vulnerabilities at this checkpoint.

## Adversarial coverage

| Test | Secure behavior |
|---|---|
| SEC-007 | A low-privilege user cannot publish active same-origin content. |
| SEC-P3-001 | A direct upload requires a valid scoped server grant. |
| SEC-P3-002 | MIME claims must agree with file magic bytes. |
| SEC-P3-003 | Downloads are subject-bound and forced as attachments. |
| SEC-P3-004 | A candidate cannot upload evidence for another attempt. |

## Exit-gate evidence

| Command | Exit | Result |
|---|---:|---|
| Upload-focused adversarial tests | 0 | 5 passed |
| `npm test` | 0 | 15 files passed; 120 tests passed |
| `npm run typecheck` | 0 | Strict frontend type checking passed |
| `npm run build` | 0 | Production build passed; existing large-chunk warning remains |
| `npm audit --json` | 0 | 0 known vulnerabilities across 393 dependencies |
| `git diff --check` | 0 | No whitespace errors |
| `npm run test:security` | 1 | 26 passed; only the two Phase 4 exam-deadline tests remain red |

## AWS production requirements

The application changes do not make the object store production-ready by
themselves. AWS deployment must use a private S3 bucket with Block Public Access,
an ECS task role scoped to the application prefix, encryption at rest, lifecycle
rules and access logging. Malware scanning and quarantine must occur before an
uploaded object becomes downloadable. Signed download URLs are bearer
credentials and therefore remain short-lived and are issued only after the
application's authorization check.

## Remaining release blockers

Phase 3 is green, but the application remains **NO-GO for production**. Phase 4
must close the server-side exam deadline/state-machine defects. Persistence,
privacy lifecycle, multi-instance coordination, observability, backup/restore
and infrastructure release gates also require production evidence before the
final go decision.
