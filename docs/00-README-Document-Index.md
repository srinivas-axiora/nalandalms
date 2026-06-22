# Nalanda — Documentation Package (Index)

Prepared by Axiora Global Solutions · Version 1.0 · 2026-06-22

This folder contains the full techno-functional and business documentation set for the **Nalanda Training & Development Platform**.

## Documents

| # | Document | File | Audience |
|---|---|---|---|
| 1 | Product Requirements Document (PRD) | `01-PRD-Product-Requirements.md` | Product, leadership, stakeholders |
| 2 | Functional Requirements Document (FRD) | `02-FRD-Functional-Requirements.md` | Product, QA, engineering |
| 3 | Technical Requirements Document (TRD) | `03-TRD-Technical-Requirements.md` | Engineering, DevOps/SRE, security |
| 4 | Statement of Work (SOW) | `04-SOW-Statement-of-Work.md` | Sponsor, delivery, commercial |
| 5 | Business Case & Commercial Model (BCM) | `05-BCM-Business-Case-and-Model.md` | Executives, finance, investment |
| 6 | Techno-Functional Specification | `06-Techno-Functional-Spec.md` | Engineering + product (traceability) |
| 7 | Business Continuity & DR Plan (BCP) | `07-BCP-Business-Continuity-Plan.md` | CTO, SRE/Ops, security |
| 8 | Brand & Visual Identity Guidelines | `08-Brand-Guidelines.md` | Design, product, marketing |
| — | Export to Word guide | `EXPORT-TO-WORD.md` | Anyone needing `.docx` output |
| — | Architecture (existing) | `ARCHITECTURE.md` | Engineering |
| — | API reference (existing) | `openapi.yaml` | Engineering, integrators |

## Reading order

- **Executives / sponsors:** BCM → PRD → SOW.
- **Product / QA:** PRD → FRD → Techno-Functional Spec.
- **Engineering / SRE / Security:** TRD → Techno-Functional Spec → BCP → `ARCHITECTURE.md` / `openapi.yaml`.

## Status & notes

- All documents are **Draft for Review** v1.0 and reflect the current codebase including the completed security hardening and Phase-1 durable persistence work.
- Financial/commercial figures in SOW/BCM are **placeholders** pending validated inputs.
- "BCM" is interpreted as **Business Case & Commercial Model** (with a Business Continuity summary); flag if you meant a standalone Business Continuity plan.

## Convert to Microsoft Word

See `EXPORT-TO-WORD.md` for a one-command (Pandoc) or one-extension (VS Code) path to generate `.docx` files from these Markdown sources.
