# Security remediation Phase 70: course duplication authorization parity

Captured: 2026-11-10 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

The snapshot compatibility route for course duplication now applies the same
source-course authority rule as relational mode. Administrators may duplicate
any course; Managers may duplicate only a course they own. A Manager can no
longer clone another owner's curriculum, metadata, prerequisite structure or
storage references through the compatibility path.

The regression test uses a real authenticated Manager request and a course
owned by another user, proving the route returns `403 Forbidden` before a copy
is created.

## Verification status

| Gate | Result |
|---|---|
| Focused RBAC suite | 17 tests passed |
| Functional suite | 111 files, 518 tests passed |
| Isolated adversarial suite | 33 tests passed |
| TypeScript | Passed |
| Production frontend build | 23 JavaScript chunks; largest 348.32 KiB |
| Dependency audit | 0 vulnerabilities across 414 dependencies |
| CloudFormation structure | 81 resources, 33 outputs |
| Authorization inventory | 129 route policies |
| JavaScript syntax | 369 files passed |
| PowerShell syntax | 9 files passed |
| OpenAPI YAML | Parsed successfully |
| Patch hygiene | `git diff --check` passed |

## Current decision

The known duplication parity gap is closed in source. Production remains
**NO-GO** until all live AWS staging and release evidence gates pass.
