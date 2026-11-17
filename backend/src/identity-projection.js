// Compatibility projection for bounded contexts that have not yet migrated
// user joins to PostgreSQL. PostgreSQL remains the authority when
// relational identity mode is enabled; this mirror must never be used for authentication or
// session-version decisions.
import { users, sessionVersions } from "./core.js";

export const upsertIdentityProjection = (identity) => {
  if (!identity?.id) return null;
  const index = users.findIndex((item) => item.id === identity.id);
  const projected = index >= 0 ? { ...users[index], ...identity } : { ...identity };
  if (index >= 0) users[index] = projected;
  else users.push(projected);
  sessionVersions[identity.id] = Number(identity.sessionVersion ?? identity.sv ?? 0);
  return projected;
};

export const setProjectedSessionVersion = (userId, version) => {
  sessionVersions[userId] = Number(version || 0);
  const user = users.find((item) => item.id === userId);
  if (user) {
    user.sessionVersion = Number(version || 0);
    user.sv = Number(version || 0);
  }
};

export const replaceIdentityProjection = (identities) => {
  if (!Array.isArray(identities) || identities.length === 0) return;
  for (const identity of identities) {
    upsertIdentityProjection(identity);
  }
};
