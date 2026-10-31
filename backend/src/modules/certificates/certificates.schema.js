// L5 — Validation: request schemas for the certificates module.
import { z } from "zod";

export const issueCertificateSchema = z.object({
  employeeId: z.string(),
  courseId: z.string(),
  title: z.string().default("Certificate of Completion"),
  template: z.string().default("Executive"),
  accent: z.string().default("#0f766e"),
  duration: z.string().default(""),
  subtitle: z.string().default(""),
  footer: z.string().default(""),
  htmlSnapshot: z.string().default("<div/>"),
  proctoringVerified: z.boolean().default(true),
  examScore: z.number().optional(),
});
