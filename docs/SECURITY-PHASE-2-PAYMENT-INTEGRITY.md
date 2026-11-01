# Phase 2 — Payment integrity and replay protection

Assessment date: 2026-11-01 (Asia/Calcutta)  
Branch: `security-phase-0-baseline`  
Scope: Razorpay order creation, checkout verification and webhook settlement

## Outcome

Phase 2 closes F-02's confirmed fail-open payment paths in the local
application. SEC-006 and four additional payment abuse cases now pass. Payment
orders are created from server-side course data and bind the payer, course,
amount and currency. Neither the browser callback nor webhook can choose those
entitlement fields during settlement.

The application remains **NO-GO for production**. Public same-origin upload and
exam deadline/candidate-link defects remain reproducible, dependency exposure
is unchanged, and the application's broader snapshot persistence is not safe
for concurrent multi-instance writers.

## Implemented controls

- Replaced the process-local pending-order map and untracked completed-payment
  array with persisted order, transaction and webhook-event ledger records.
- Paid checkout rejects missing, zero, negative or invalid course pricing; the
  earlier falsy-price fallback can no longer convert a free/misconfigured course
  into a default-price order.
- A checkout order binds `userId`, `courseId`, `amountCents` and `currency` from
  authenticated server state and has a configurable expiry.
- Production order creation uses the Razorpay Orders API with server-held Basic
  credentials. The client receives the public key ID but never the secret.
- Browser verification requires a syntactically valid HMAC-SHA256 signature and
  compares it in constant time. Missing verification configuration fails with
  503 instead of accepting the payment.
- Verification checks order ownership and rejects any caller-provided course
  that differs from the ledger. Entitlement creation always uses ledger fields.
- Production callback verification retrieves the provider payment and requires
  the same order, amount and currency with `captured` status before settlement.
- A provider payment ID and order can settle only once. Exact callback replays
  return the original entitlement as an idempotent success; conflicting reuse
  returns 409.
- Express captures the exact webhook bytes before JSON parsing. Webhook HMAC is
  mandatory over those raw bytes and `x-razorpay-event-id` is mandatory and
  deduplicated.
- Webhooks ignore provider notes for authorization, validate captured status,
  amount and currency against the ledger, and cannot create an entitlement for
  an unknown order.
- Payment order creation and successful settlement emit redacted audit events.

## Data and deployment handoff

Apply `database/migrations/0004_payment_integrity.sql` after the Phase 1
migrations. It creates:

- `payment_orders`, with immutable binding fields and constrained lifecycle;
- `payment_transactions`, with unique order and provider-payment IDs; and
- `payment_webhook_events`, keyed by the provider event ID.

The same schema is included in `database/schema.sql` for clean installations.
The local application snapshot now also persists these three collections. The
normalized tables are the required target for the later transactional
PostgreSQL cutover; until that cutover is complete, run only one API writer.

Required production configuration:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `PAYMENT_ORDER_TTL_SECONDS` (300–86400; default 1800)

Use independent live-mode secrets, rotate any values used by vulnerable builds,
and register the webhook secret separately from the API key secret. Configure
the provider to send a stable event ID and captured-payment events to the exact
webhook URL. Reconcile historical entitlements issued before this phase against
the provider ledger before trusting them.

## Verification evidence

- Test-first red baseline: five payment cases failed before implementation.
- Phase 2 targeted adversarial cases: five passed.
- Normal application suite: 15 files, 120 tests passed.
- Frontend strict typecheck: passed.
- Production frontend build: passed, with the existing large-chunk warning.
- Full adversarial suite: 21 passed; three later-phase cases remain red:
  SEC-007 direct upload/public delivery, SEC-008 post-expiry final submission
  and SEC-012 expired public candidate start.
- Dependency audit: unchanged at 14 vulnerable packages (2 critical, 8 high,
  3 moderate and 1 low).

Live Razorpay credentials, provider callbacks and a production-like PostgreSQL
deployment were not exercised locally. Before deployment, run sandbox-provider
end-to-end tests for success, invalid signature, amount mismatch, cross-account
claim, callback replay, duplicated/out-of-order webhook events, provider outage,
refund and reversal/reconciliation behavior.

## Residual risk and next phase

Phase 3 should remove direct uploads for untrusted users, eliminate public
same-origin active-content delivery, enforce key containment and validate file
content/size. Phase 4 should then centralize the server-authoritative exam state
machine and enforce deadlines on every start, autosave and final-submit path.
