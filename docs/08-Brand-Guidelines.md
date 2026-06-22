---
title: "Nalanda — Brand & Visual Identity Guidelines"
product: "Nalanda Training & Development Platform"
version: "1.0"
status: "Approved (design-lead recommendation)"
date: "2026-06-22"
---

# Nalanda — Brand & Visual Identity Guidelines

| Field | Value |
|---|---|
| Document | Brand & Visual Identity Guidelines |
| Product | Nalanda LMS |
| Owner | Design Lead, Axiora Global Solutions |
| Version | 1.0 |
| Date | 2026-06-22 |
| Applies to | Product UI, documents, certificates, marketing |

---

## 1. Brand Idea

**Nalanda** is named after the ancient Indian *mahavihara* — one of history's first great seats of learning. The identity expresses **wisdom, trust, growth, and earned achievement**, in a modern, professional, enterprise-credible voice.

- **Personality:** knowledgeable, calm, premium, dependable.
- **Visual metaphor:** the gilded manuscript — deep teal "ink" with gold illumination.

## 2. Color System

### 2.1 Primary — Nalanda Teal
The signature color. Trust, growth, focus — the color of learning. Used for primary headings, primary buttons, key UI accents, and brand marks.

| Token | Hex | Use |
|---|---|---|
| teal-50 | `#F0FDFA` | tints, hover backgrounds |
| teal-100 | `#CCFBF1` | subtle backgrounds |
| teal-200 | `#99F6E4` | borders, chips |
| teal-300 | `#5EEAD4` | accents on dark UI |
| teal-400 | `#2DD4BF` | accents on dark UI |
| teal-500 | `#14B8A6` | interactive (dark mode) |
| teal-600 | `#0D9488` | buttons (hover) |
| **teal-700 (PRIMARY)** | **`#0F766E`** | **primary brand, H1/Title, primary buttons** |
| teal-800 | `#115E59` | H2–H3, pressed states |
| teal-900 | `#134E4A` | deep ink, sub-headings on light |

### 2.2 Accent — Heritage Gold
Reserved for **achievement and emphasis**: certificates, badges, "passed/earned" states, key highlights, and the occasional premium CTA. Use sparingly — gold loses meaning if overused.

| Token | Hex | Use |
|---|---|---|
| gold-light | `#FDE68A` | highlight backgrounds, certificate fills |
| **gold (ACCENT)** | **`#CA8A04`** | achievement accents, icons, dividers, certificate accent |
| gold-deep | `#A16207` | **gold text on light backgrounds** (accessible) |

### 2.3 Neutrals — Slate
The product's dark-UI base and document text scale.

| Token | Hex |
|---|---|
| slate-900 | `#0F172A` (app background / body ink) |
| slate-800 | `#1E293B` (surfaces) |
| slate-700 | `#334155` |
| slate-500 | `#64748B` (muted text) |
| slate-400 | `#94A3B8` |
| slate-300 | `#CBD5E1` (borders on dark) |
| slate-200 | `#E2E8F0` |
| slate-100 | `#F1F5F9` |
| slate-50 | `#F8FAFC` (light surfaces) |

### 2.4 Semantic
| Purpose | Hex (light) | Hex (dark UI) |
|---|---|---|
| Success | `#16A34A` | `#22C55E` |
| Warning | `#D97706` | `#F59E0B` |
| Danger/Error | `#DC2626` | `#F87171` |
| Info | `#0EA5E9` | `#38BDF8` |

> The legacy product cyan `#06B6D4` is retained as an **informational** accent on the dark UI and maps to the "Info" role.

## 3. Color Usage Rules

- **60-30-10:** ~60% neutral (slate/white), ~30% primary teal, ~10% gold accent.
- **Primary teal** = brand & primary actions. **Gold** = achievement/emphasis only (never for errors or large fills).
- Never place gold text on teal or teal on gold (low contrast). Pair each with neutral.
- One accent per view for emphasis; avoid teal + gold + cyan competing in the same component.

## 4. Accessibility (WCAG 2.1)

Verified contrast against **white** (`#FFFFFF`):

| Foreground | Ratio | Verdict |
|---|---|---|
| Primary teal `#0F766E` | ~5.4:1 | ✅ AA for normal text; AAA for large |
| Deep teal `#134E4A` | ~9.3:1 | ✅ AAA |
| Gold `#CA8A04` | ~2.9:1 | ⚠️ large text / graphical only — **do not use for body text** |
| Gold-deep `#A16207` | ~4.9:1 | ✅ AA for normal text — use this for gold text |
| Slate-900 `#0F172A` | ~17:1 | ✅ AAA |

Rules: body text uses slate-900/700 or teal-700+; **gold text must use `gold-deep #A16207`**; maintain ≥4.5:1 for normal text and ≥3:1 for large/UI elements; never rely on color alone to convey state (pair with icon/label).

## 5. Typography

| Role | Product (web) | Documents (Word) | Notes |
|---|---|---|---|
| Headings | Inter / Poppins (600–700) | Calibri / Segoe UI (bold) | geometric-humanist, confident |
| Body | Inter (400) | Calibri (11pt) | high legibility |
| Mono/code | JetBrains Mono / ui-monospace | Consolas | code blocks, IDs |

Scale (web, rem): H1 2.0 / H2 1.5 / H3 1.25 / body 1.0 / small 0.875. Generous line-height (1.5 body).

## 6. Logo & Mark (guidance)

- Wordmark "Nalanda" in primary teal; optional gold accent on the diacritic/dot or an open-book / lamp-of-knowledge glyph.
- Clear space ≥ the cap-height around the mark; minimum width 96px digital.
- Approved backgrounds: white, slate-50, slate-900. Don't place teal mark on gold or busy imagery.
- *(Logo asset to be commissioned; this guideline defines its color/space rules.)*

## 7. Application

- **Product UI:** dark slate base, teal primary actions, gold for achievement (certificates, "Passed", badges), semantic colors for status.
- **Certificates:** teal frame + gold accent + slate text (aligns with current `accent #0F766E`).
- **Documents:** teal headings (this template), slate body — see `EXPORT-TO-WORD.md` / `reference.docx`.
- **Charts:** teal as series-1, gold as series-2 highlight, slate/cyan for the rest; never encode pass/fail by hue alone.

## 8. Design Tokens (for implementation)

```css
:root {
  /* brand */
  --color-primary: #0F766E;      /* Nalanda Teal */
  --color-primary-600: #0D9488;
  --color-primary-800: #115E59;
  --color-accent: #CA8A04;       /* Heritage Gold */
  --color-accent-deep: #A16207;  /* gold text on light */
  --color-accent-light: #FDE68A;
  /* neutrals */
  --color-bg: #0F172A;           /* app dark base */
  --color-surface: #1E293B;
  --color-text: #0F172A;         /* on light */
  --color-text-muted: #64748B;
  /* semantic */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger: #DC2626;
  --color-info: #0EA5E9;
}
```

> Tailwind: map `theme.extend.colors.primary` → the teal scale (§2.1) and `accent` → the gold scale (§2.2). This lets the existing UI adopt the brand by swapping utility color names rather than hardcoding hex.

## 9. Do / Don't

| Do | Don't |
|---|---|
| Use teal as the dominant brand color | Don't flood screens with gold |
| Reserve gold for achievement/emphasis | Don't use gold for errors/warnings |
| Use `gold-deep` for gold text | Don't put gold body text on white |
| Pair brand colors with neutrals | Don't combine teal+gold as fg/bg pair |
| Convey state with icon + color | Don't rely on color alone |

## 10. Decision Log

- **2026-06-22 — Design Lead:** Finalized **Primary = Nalanda Teal `#0F766E`**, **Accent = Heritage Gold `#CA8A04`** (text `#A16207`), slate neutrals, standard semantics. Rationale: heritage of learning (Nalanda), trust/growth (teal), achievement (gold), and cohesion with the existing product palette and certificate accent. Applied to the document template (`reference.docx`) and recommended for product adoption via design tokens (§8).
