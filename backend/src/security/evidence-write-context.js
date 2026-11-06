import { AsyncLocalStorage } from "node:async_hooks";

const evidenceWrites = new AsyncLocalStorage();

export const evidenceWriteContextMiddleware = (_req, _res, next) => {
  evidenceWrites.run({ pending: [] }, next);
};

export const trackEvidenceWrite = (write) => {
  const promise = Promise.resolve(write);
  const context = evidenceWrites.getStore();
  if (!context) return promise;

  // Attach a rejection observer immediately so a fast database failure cannot
  // become an unhandled rejection before the response persistence gate drains
  // the request's evidence writes.
  promise.catch(() => {});
  context.pending.push(promise);
  return promise;
};

export const flushEvidenceWrites = async () => {
  const context = evidenceWrites.getStore();
  if (!context) return;

  // A write may schedule another write while it settles. Drain to a fixed
  // point before allowing the HTTP response to complete.
  while (context.pending.length > 0) {
    const pending = context.pending.splice(0, context.pending.length);
    const results = await Promise.allSettled(pending);
    const failure = results.find((result) => result.status === "rejected");
    if (failure) throw failure.reason;
  }
};
