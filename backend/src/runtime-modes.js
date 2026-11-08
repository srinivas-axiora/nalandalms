export const relationalAttemptsEnabled = () => (
  process.env.USE_PG_ATTEMPTS === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalCertificatesEnabled = () => (
  process.env.USE_PG_CERTIFICATES === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalCandidateAssessmentsEnabled = () => (
  process.env.USE_PG_CANDIDATE_ASSESSMENTS === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalPaymentsEnabled = () => (
  process.env.USE_PG_PAYMENTS === "1"
  || process.env.USE_PG_COURSES === "1"
);
