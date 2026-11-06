export const relationalAttemptsEnabled = () => (
  process.env.USE_PG_ATTEMPTS === "1"
  || process.env.USE_PG_COURSES === "1"
);
