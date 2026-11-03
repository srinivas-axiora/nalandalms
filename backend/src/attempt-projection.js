// Compatibility projection for bounded contexts that still join attempts from
// the legacy in-process model. PostgreSQL is the write authority whenever
// USE_PG_ATTEMPTS=1; callers must persist first and project only the committed
// row returned by the repository.
import { attempts } from "./core.js";

export const upsertAttemptProjection = (attempt) => {
  if (!attempt?.id) return null;
  const index = attempts.findIndex((item) => item.id === attempt.id);
  const projected = index >= 0 ? { ...attempts[index], ...attempt } : { ...attempt };
  if (index >= 0) attempts[index] = projected;
  else attempts.unshift(projected);
  return projected;
};

export const replaceAttemptProjection = (persistedAttempts) => {
  attempts.length = 0;
  for (const attempt of persistedAttempts) upsertAttemptProjection(attempt);
};
