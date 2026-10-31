// Course 11: Digital Marketing Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const digitalMarketingCourse = {
  id: "CRS-DMK-001",
  title: "Digital Marketing Masterclass: Performance Marketing, SEO, SEM, CRO & Growth Hacking",
  description: "Comprehensive 30-chapter masterclass covering the modern omnichannel digital marketing landscape: POEM framework (Paid, Earned, Owned), customer journeys (AIDA, Flywheel, TOFU/MOFU/BOFU) and unit economics (CAC, LTV, Payback, ROAS); Search Engine architecture and Googlebot crawling/indexing/rendering mechanics (robots.txt, canonicalization, XML sitemaps); keyword research and search intent taxonomy (Informational, Navigational, Commercial, Transactional) with content gap analysis; On-Page SEO, semantic HTML5, topic cluster internal linking, and Schema.org JSON-LD rich snippets; Technical SEO and Google Core Web Vitals (LCP, INP, CLS, TTFB, crawl budget optimization); Off-Page SEO, PageRank mechanics, anchor text distributions, white-hat link acquisition, and Digital PR; Paid Search (PPC) and Google Ads auction theory (Ad Rank formula, Quality Score sub-components, second-price Vickrey auctions, impression share); Campaign structure, keyword match types (Exact, Phrase, Broad) and negative keyword lists; Responsive Search Ads (RSAs), copy optimization, Dynamic Keyword Insertion (DKI), and ad assets/extensions; Smart Bidding strategies (Target CPA, Target ROAS, Maximize Conversions, Value-Based Bidding) and auction-time machine learning signals; Performance Max (PMax) multi-channel inventory, asset groups, audience signals, and Google Merchant Center feed optimization; Programmatic display advertising, DSPs, SSPs, ad exchanges, real-time bidding (RTB), dynamic retargeting, and frequency capping; Meta Ads Manager architecture, Pixel, Conversions API (CAPI) server-side event deduplication, and Advantage+ Campaign Budget Optimization (CBO vs ABO); Audience targeting on paid social (Core, Custom, Lookalike 1%-10%, broad targeting, audience overlap exclusions); Performance creative strategy, thumb-stopping hooks, 3-second hook rates, UGC creator video, direct-response copywriting (PAS, BAB, AIDA), and carousels; B2B enterprise marketing on LinkedIn Ads (Account-Based Marketing [ABM], job title/seniority targeting, native Lead Gen Forms, and Thought Leader Ads); Short-form video on TikTok, Reels & YouTube Shorts (Hook-Story-Offer, sound-on culture, Spark Ads, and creator whitelisting); Content marketing, thought leadership, evergreen content, content briefs, and the 1-to-10 repurposing engine; Email marketing infrastructure and deliverability (SMTP, SPF, DKIM, DMARC, BIMI, sender reputation, IP warming, and sunset policies); Automated lifecycle email flows (Welcome series, browse abandonment, abandoned cart recovery, post-purchase onboarding, win-back drip sequences); Customer retention, RFM segmentation (Recency, Frequency, Monetary), cohort churn analysis, and TCPA-compliant SMS/WhatsApp conversational marketing; High-converting landing page architecture (1:1 attention ratio, above-the-fold wireframes, information hierarchy, Cialdini persuasion principles, and risk reversal); Conversion Rate Optimization (CRO), the LIFT model, hypothesis generation, and A/B testing statistical rigor (p-values, 95% confidence, sample size, MDE, Type I/II errors); Qualitative user research, visual heatmaps (click, scroll, move), session recordings, rage click detection, and exit-intent micro-surveys; Google Analytics 4 (GA4) event-based architecture, enhanced measurement, custom dimensions, and free BigQuery event export; Google Tag Manager (GTM) core mechanics (tags, triggers, variables), dataLayer protocols, Consent Mode v2, and Server-Side GTM on Google Cloud Run; Multi-Touch Attribution (MTA) models (first, last, linear, data-driven) vs Marketing Mix Modeling (MMM) econometric regression and geo-lift incrementality testing; Growth hacking frameworks (Dave McClure's AARRR Pirate Metrics, North Star Metric, viral coefficient K-factor, and ICE sprint cycles); the AuraCommerce Global omnichannel scale-up capstone project; and executive digital marketing leadership (Blended ROAS / MER, marketing P&L, 70-20-10 budget allocation, and CMO interview frameworks).",
  skill: "Digital Marketing & Performance Growth",
  skillIds: [
    "SKILL-SEO-CONTENT-ORGANIC",
    "SKILL-PAID-MEDIA-SEM-SOCIAL",
    "SKILL-CRO-ANALYTICS-GROWTH"
  ],
  targetLevel: "Comprehensive",
  prerequisites: [],
  category: "Marketing & Growth",
  tags: [
    "Digital Marketing",
    "Performance Marketing",
    "SEO",
    "Google Ads",
    "Meta Ads",
    "Email Marketing",
    "CRO",
    "Google Analytics 4",
    "Growth Hacking",
    "Copywriting",
    "E-Commerce"
  ],
  thumbnailColor: "#f59e0b",
  ownerId: "EMP-1002",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 95,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const digitalMarketingSkills = [
  {
    id: "SKILL-SEO-CONTENT-ORGANIC",
    name: "SEO Architecture & Organic Growth",
    category: "Functional",
    description: "Deep mastery of search engine crawling/indexing, keyword research, on-page semantic markup, Core Web Vitals, link building, and content strategy.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-PAID-MEDIA-SEM-SOCIAL",
    name: "Paid Acquisition, SEM & Social Ads",
    category: "Functional",
    description: "Production mastery of paid traffic: Google Ads auction mechanics, Quality Score, Smart Bidding, Performance Max, Meta Ads CAPI, B2B LinkedIn ABM, and TikTok short-form video.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-CRO-ANALYTICS-GROWTH",
    name: "Conversion Rate Optimization, Analytics & Growth Strategy",
    category: "Functional",
    description: "Data-driven experimentation: Email deliverability & lifecycle automation, landing page psychology, A/B testing statistics, GA4/GTM server-side measurement, attribution, and growth hacking.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const digitalMarketingChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const digitalMarketingAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

