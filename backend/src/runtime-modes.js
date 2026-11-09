export const COURSE_AUTHORITY_COVERAGE_VERSION = "normalized-v1";

export const courseAuthorityCoverageAcknowledged = () => (
  process.env.COURSE_AUTHORITY_COVERAGE_ACK === COURSE_AUTHORITY_COVERAGE_VERSION
);

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

export const relationalSettingsEnabled = () => (
  process.env.USE_PG_SETTINGS === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalSkillsEnabled = () => (
  process.env.USE_PG === "1"
  || process.env.USE_PG_SKILLS === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalIdentityEnabled = () => (
  process.env.USE_PG_IDENTITY === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalPrivacyEnabled = () => (
  process.env.USE_PG_PRIVACY === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalAuditEnabled = () => (
  process.env.USE_PG_AUDIT === "1"
  || process.env.USE_PG_COURSES === "1"
);

export const relationalWorkplaceEnabled = () => (
  process.env.USE_PG_WORKPLACE === "1"
  || process.env.USE_PG_COURSES === "1"
);
