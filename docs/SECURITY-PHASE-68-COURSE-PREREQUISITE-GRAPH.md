# Security remediation Phase 68: course prerequisite graph integrity

Captured: 2026-11-10 (Asia/Calcutta)
Branch: `security-phase-0-baseline`

## Outcome

Course authoring now treats prerequisites as an integrity-constrained graph,
not an arbitrary list of identifiers. Snapshot and relational paths reject
unknown references and direct or transitive cycles. An active approved course
can reference only active approved prerequisites. A prerequisite used by an
active approved course cannot be rejected, disabled or deleted until the
dependent course is changed.

Relational graph mutations take a transaction-scoped PostgreSQL advisory lock,
closing the concurrent two-writer cycle race. Migration
`0024_course_prerequisite_graph.sql` adds the same rules as a database trigger
so restore, backfill or future write paths cannot bypass application policy.
It exercises every historical course row through the trigger and therefore
fails deployment on inconsistent existing data instead of silently repairing
or discarding curriculum relationships.

## Verification status

| Gate | Result |
|---|---|
| Functional suite | 111 files, 517 tests passed |
| Isolated adversarial suite | 33 tests passed |
| TypeScript | Passed |
| Production frontend build | Passed; existing 1,007.43 kB chunk warning remains |
| Dependency audit | 0 vulnerabilities across 414 dependencies |
| CloudFormation structure | 81 resources, 33 outputs |
| Authorization inventory | 129 route policies |
| JavaScript syntax | 368 files passed |
| PowerShell syntax | 9 files passed |
| OpenAPI YAML | Parsed successfully |
| Patch hygiene | `git diff --check` passed |

## Current decision

The prerequisite authoring boundary is closed locally. Production remains
**NO-GO** until migration `0024` passes against the intended PostgreSQL staging
dataset and concurrent graph mutations are exercised in AWS staging. The
production frontend bundle also remains above the configured chunk-size
warning threshold.
