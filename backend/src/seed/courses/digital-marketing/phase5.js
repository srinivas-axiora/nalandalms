// Course 11: Digital Marketing - Phase 5 (Chapters 25-30, Assessments 25-30)
// Google Analytics 4, Google Tag Manager, Attribution & MMM, Growth Hacking, Capstone & Marketing Leadership

export const phase5 = {
  "chapters": [
    {
      "id": "CH-DMK-025",
      "courseId": "CRS-DMK-001",
      "sequence": 25,
      "title": "Google Analytics 4 (GA4) Architecture & Event-Driven Model",
      "description": "Master modern web analytics: Google Analytics 4 event-based schema (replacing Universal Analytics session model), automatically collected events, custom dimensions, BigQuery raw event export, and Exploration reports.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Google Analytics 4 (GA4) Architecture & Event-Driven Model\n\nGoogle Analytics 4 (GA4) completely overhauled digital measurement from the legacy session/pageview model of Universal Analytics (UA) into a unified, cross-platform, event-driven data model.\n\n---\n\n## 1. Paradigm Shift: Sessions vs. Events\n\n```\n+------------------------------------+     +------------------------------------+\n| LEGACY UNIVERSAL ANALYTICS (UA)    |     | GOOGLE ANALYTICS 4 (GA4)           |\n+------------------------------------+     +------------------------------------+\n| - Session-based model              |     | - Event-based unified data model   |\n| - Pageviews, Transactions, Events  |     | - EVERYTHING is an Event!          |\n|   treated as separate hit types    |     |   (page_view, click, purchase, etc)|\n| - Hit-level schema: Category,      |     | - Flexible Event Parameters        |\n|   Action, Label, Value             |     |   (Key-value pairs attached to evt)|\n| - Web and Mobile apps separated    |     | - Unified Cross-Platform Web+App   |\n+------------------------------------+     +------------------------------------+\n```\n\n---\n\n## 2. GA4 Event Taxonomy\n\nGA4 categorizes events into four distinct operational tiers:\n\n1. **Automatically Collected Events:** Captured by default without code modifications (`session_start`, `first_visit`, `user_engagement`).\n2. **Enhanced Measurement Events:** Enabled via a single toggle in the web stream settings (`scroll` at 90% depth, `click` outbound link, `view_search_results`, `file_download`, `video_start`).\n3. **Recommended Events:** Standardized event names defined by Google with pre-built parameters for specific verticals (e.g., e-commerce: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`).\n4. **Custom Events:** Events with unique names and parameters defined by the business (e.g., `assessment_passed`, `code_challenge_submitted`).\n\n---\n\n## 3. Raw Data Warehousing: The Free BigQuery Integration\n\nUnlike UA where raw unsampled hit export required an enterprise $150,000/year GA360 license, **GA4 provides a native, zero-cost streaming export to Google BigQuery**:\n\n```sql\n-- Querying raw event-level data in BigQuery\nSELECT\n    event_date,\n    event_name,\n    user_pseudo_id,\n    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'course_id') AS course_id,\n    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'score') AS score\nFROM `analytics_320149182.events_*`\nWHERE event_name = 'assessment_completed'\n  AND _TABLE_SUFFIX >= '20261001'\nLIMIT 1000;\n```\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Google Analytics 4 & BigQuery Export' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-026",
      "courseId": "CRS-DMK-001",
      "sequence": 26,
      "title": "Google Tag Manager (GTM) & Server-Side Tagging",
      "description": "Master tag engineering: Google Tag Manager architecture (Tags, Triggers, Variables), dataLayer.push() events, Consent Mode v2 compliance, and Server-Side GTM on Google Cloud Run.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Google Tag Manager (GTM) & Server-Side Tagging\n\nGoogle Tag Manager (GTM) serves as the centralized tag management system enabling marketers to deploy and manage marketing tracking tags without modifying production web codebase directly.\n\n---\n\n## 1. GTM Core Building Blocks\n\n- **Tag:** The snippet of third-party JavaScript executed on the page (e.g., GA4 Event Tag, Meta Pixel, LinkedIn Insight Tag, Hotjar script).\n- **Trigger:** The condition that determines *when* a tag should fire (e.g., 'All Pages', 'Button Click with CSS class `.enroll-btn`', 'Custom Event: `purchase`').\n- **Variable:** Reusable named values evaluated dynamically at runtime (e.g., Page URL, Click ID, or extracting a value from the `dataLayer`).\n\n---\n\n## 2. The `dataLayer` Protocol\n\nThe `dataLayer` is a global JavaScript array (`window.dataLayer = window.dataLayer || [];`) used to decouple application state from marketing tools:\n\n```javascript\n// E-Commerce Purchase event pushed to dataLayer\nwindow.dataLayer.push({\n  event: 'purchase',\n  ecommerce: {\n    transaction_id: 'ORD-2026-9481',\n    value: 499.00,\n    currency: 'USD',\n    tax: 40.00,\n    shipping: 0.00,\n    items: [{\n      item_id: 'CRS-DTE-001',\n      item_name: 'Data Engineering Masterclass',\n      item_category: 'Technical Courses',\n      price: 499.00,\n      quantity: 1\n    }]\n  }\n});\n```\n\n---\n\n## 3. Server-Side GTM Architecture\n\n```\nClient Browser ------> [ Server-Side GTM (Cloud Run / Custom Domain) ]\n                             |\n                             +---> [ Google Analytics 4 API ]\n                             +---> [ Meta Conversions API (CAPI) ]\n                             +---> [ TikTok Events API ]\n```\n\n### Advantages of Server-Side Tagging:\n1. **Blazing Page Speed:** Replaces 15 heavy third-party client JavaScript libraries with a single lightweight web beacon to your custom subdomain (`sgtm.auracommerce.com`).\n2. **Data Governance & PII Scrubbing:** Inspect and sanitize HTTP headers on your own server, stripping sensitive user data before forwarding to ad platforms.\n3. **First-Party Cookie Protection:** Bypasses Apple Safari ITP (Intelligent Tracking Prevention) 7-day cookie expiration by setting HTTP-only first-party cookies directly from the server domain.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Google Tag Manager & Server-Side Tagging' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-027",
      "courseId": "CRS-DMK-001",
      "sequence": 27,
      "title": "Multi-Touch Attribution (MTA) & Marketing Mix Modeling (MMM)",
      "description": "Master marketing measurement science: Attribution models (First-touch, Last-touch, Linear, Time-decay, Data-Driven Attribution), Marketing Mix Modeling (MMM) statistical regression, and Geo-Lift incrementality experiments.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Multi-Touch Attribution (MTA) & Marketing Mix Modeling (MMM)\n\nAs customer journeys span multiple devices, channels, and weeks, understanding which marketing touchpoints genuinely drove incremental revenue is the ultimate challenge in marketing leadership.\n\n---\n\n## 1. Single-Touch vs. Multi-Touch Attribution (MTA)\n\n```\nDay 1: TikTok Ad -> Day 5: SEO Blog -> Day 10: Retargeting Ad -> Day 14: Direct Checkout\n```\n\n```\n+--------------------+-------------------------------------------------------------+\n| ATTRIBUTION MODEL  | HOW CONVERSION CREDIT IS DISTRIBUTED                        |\n+--------------------+-------------------------------------------------------------+\n| 1. LAST-TOUCH      | 100% of credit given to Day 14 (Direct Checkout).           |\n|                    | Flaw: Completely ignores the initial discovery channels!    |\n+--------------------+-------------------------------------------------------------+\n| 2. FIRST-TOUCH     | 100% of credit given to Day 1 (TikTok Ad).                  |\n|                    | Flaw: Completely ignores the retargeting and closing steps! |\n+--------------------+-------------------------------------------------------------+\n| 3. LINEAR          | 25% equal credit given to all 4 touchpoints.                |\n+--------------------+-------------------------------------------------------------+\n| 4. DATA-DRIVEN     | Uses machine learning (Shapley Value algorithm) to evaluate |\n| ATTRIBUTION (DDA)  | how the presence or absence of a touchpoint alters the      |\n| (Default in GA4)   | statistical probability of a conversion.                    |\n+--------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. Marketing Mix Modeling (MMM)\n\nWith privacy restrictions (GDPR, iOS ATT) degrading user-level cookie tracking, enterprise organizations rely on **Marketing Mix Modeling (MMM)** (e.g., Meta's open-source Robyn, Google's Meridian):\n- **Privacy-Safe Macro Analysis:** Evaluates aggregate historical weekly marketing spend across channels against aggregate sales revenue over 2–3 years using multivariate Bayesian regression.\n- **Adstock & Diminishing Returns:** Models carry-over decay effects (ad memories lasting weeks) and saturation curves (the 10th dollar spent in a day is less effective than the 1st).\n\n---\n\n## 3. Incrementality Testing & Geo-Lift Experiments\n\nAttribution models show correlation; incrementality experiments prove **causality**:\n- **Geo-Testing:** Divide the country into matched geographic pairs (e.g., Test Market: Austin, Dallas; Control Market: Phoenix, Denver).\n- Turn off Meta Ads in the Test Market for 4 weeks while keeping spend flat in the Control Market.\n- Measure the delta in total baseline store revenue to calculate true **Incremental Return on Ad Spend (iROAS)**.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Attribution Modeling & Marketing Mix Modeling' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-028",
      "courseId": "CRS-DMK-001",
      "sequence": 28,
      "title": "Growth Hacking Frameworks & Viral Loops",
      "description": "Master modern growth methodology: Dave McClure's AARRR Pirate Metrics (Acquisition, Activation, Retention, Referral, Revenue), the North Star Metric, Viral Coefficient (K-factor), and rapid experimentation sprint loops.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Growth Hacking Frameworks & Viral Loops\n\nGrowth Hacking combines product engineering, behavioral psychology, automated marketing, and iterative experimentation to achieve rapid, compounding business expansion.\n\n---\n\n## 1. The AARRR 'Pirate Metrics' Funnel\n\nFormulated by Dave McClure, AARRR organizes growth into five sequential stages:\n\n```\n+---------------------------------------------------------------------------------+\n|                           A.A.R.R.R. PIRATE METRICS                             |\n+-------------------+-------------------------------------------------------------+\n| 1. ACQUISITION    | How do users find you?                                          |\n|                   | Channels: SEO, Paid Ads, Social, PR. Metric: Visitors, CAC.     |\n+-------------------+-------------------------------------------------------------+\n| 2. ACTIVATION     | Do users have a stellar first experience ('Aha! Moment')?       |\n|                   | Metric: Completed signup, completed first lesson in 24 hours.   |\n+-------------------+-------------------------------------------------------------+\n| 3. RETENTION      | Do users return and keep using the product?                     |\n|                   | Metric: Day 30 active users, cohort churn rate.                 |\n+-------------------+-------------------------------------------------------------+\n| 4. REFERRAL       | Do users tell other prospective users?                          |\n|                   | Metric: Net Promoter Score (NPS), Viral Coefficient (K-Factor). |\n+-------------------+-------------------------------------------------------------+\n| 5. REVENUE        | How do you monetize user engagement?                            |\n|                   | Metric: Average Order Value (AOV), Monthly Recurring Rev (MRR). |\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. Viral Loops & The K-Factor Formula\n\nA viral loop exists when every active user invites or exposes new users to the platform automatically (e.g., Dropbox's 'Get 500MB free storage for inviting a friend'):\n\n```\nViral Coefficient (K-Factor) = i  ×  c\n  - i: Average number of invitations sent per active user.\n  - c: Average conversion rate of each invitation into a new user.\n```\n\n> [!IMPORTANT]\n> If **K > 1.0**, the product achieves **exponential self-sustaining viral growth** without requiring any paid advertising spend!\n\n---\n\n## 3. High-Tempo Growth Sprint Cycles\n\nGrowth teams operate in weekly or bi-weekly sprint rhythms:\n1. **Ideation:** Brainstorm growth experiments scored using the **ICE Framework** (Impact: 1-10, Confidence: 1-10, Ease of Execution: 1-10).\n2. **Prioritization:** Rank experiments by highest composite ICE score.\n3. **Execution:** Build lightweight Minimum Viable Tests (MVTs).\n4. **Analysis:** Review data, double down on winners, discard losers, and document institutional learnings.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Growth Hacking & Viral Loops' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-029",
      "courseId": "CRS-DMK-001",
      "sequence": 29,
      "title": "Enterprise Capstone Project: Omnichannel Global Scale-Up Launch",
      "description": "Synthesize full-funnel digital marketing: Architect AuraCommerce Global's 360-degree scale-up plan combining Technical SEO, Meta CAPI, Google Ads PMax, automated lifecycle email funnels, and GA4 measurement.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Enterprise Capstone Project: Omnichannel Global Scale-Up Launch\n\nIn this capstone project, you integrate all disciplines learned across the course into an executive-level, omnichannel go-to-market and performance growth blueprint for **AuraCommerce Global**, scaling the business from $5M to $25M in annual revenue.\n\n---\n\n## 1. Omnichannel Growth Architecture Blueprint\n\n```\n+---------------------------------------------------------------------------------+\n|                    AURACOMMERCE GLOBAL OMNICHANNEL BLUEPRINT                    |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  [ TOP OF THE FUNNEL (TOFU): PROSPECTING & AWARENESS ]                           \n  - Organic SEO: 5 Pillar topic clusters + 30 long-tail cluster articles          \n  - Meta Ads: Broad targeting Advantage+ with 10 high-hook UGC creator videos      \n  - Google Ads: Performance Max (PMax) with optimized Merchant Center product feed\n  - YouTube Shorts & TikTok: Organic educational Hook-Story-Offer clips            \n                                     |                                             \n                                     v                                             \n  [ MIDDLE OF THE FUNNEL (MOFU): NURTURING & ENGAGEMENT ]                         \n  - High-Converting Landing Pages (1:1 Attention Ratio, Schema.org rich snippets) \n  - Exit-intent lead magnet micro-surveys -> Automated 3-part Welcome Email Drip  \n  - Retargeting Ads: Dynamic Product Ads (DPA) on Meta & Display DSP (3-5x cap)   \n                                     |                                             \n                                     v                                             \n  [ BOTTOM OF THE FUNNEL (BOFU): CONVERSION & RECOVERY ]                          \n  - Google Search Ads: Exact & Phrase match for high-intent commercial keywords   \n  - 3-Stage Automated Abandoned Cart Recovery (Email + SMS at +1h, +24h, +48h)    \n  - Frictionless 1-click checkout with Apple Pay, Shop Pay, and Klarna            \n                                     |                                             \n                                     v                                             \n  [ POST-PURCHASE: RETENTION, ADVOCACY & VIRALITY ]                               \n  - Post-purchase onboarding drip flow (delivering tutorials and care guides)     \n  - RFM Segmentation triggering VIP rewards to Champions & Win-back to At-Risk    \n  - 2-Sided Referral Viral Loop: 'Give $25, Get $25' referral program             \n                                     |                                             \n                                     v                                             \n  [ CENTRALIZED MEASUREMENT, ATTRIBUTION & GOVERNANCE ]                           \n  - GA4 + GTM Server-Side tagging (CAPI deduplication with event_id)              \n  - Daily BigQuery raw event export syncing to executive Looker dashboard         \n  - Blended MER (Marketing Efficiency Ratio) targets maintaining LTV:CAC > 3.5:1  \n```\n\n---\n\n## 2. Key Milestone Deliverables\n\n1. **Milestone 1 - Inbound & Organic Foundations:** Complete technical Core Web Vitals audit (LCP < 2.5s, CLS < 0.1), define XML sitemaps, and author 5 topic cluster content briefs with Schema.org JSON-LD.\n2. **Milestone 2 - Paid Acquisition Engine:** Structure Google Ads account (Brand vs Non-Brand STAGs, PMax asset groups) and Meta Ads Manager with CAPI server-side event deduplication.\n3. **Milestone 3 - Retention & Lifecycle Automation:** Build the 5 core behavioral email/SMS flows in Klaviyo (Welcome, Cart Abandon, Browse Abandon, Post-Purchase, Win-back).\n4. **Milestone 4 - Measurement & Analytics Dashboard:** Implement dataLayer events, server-side GTM containers, and configure GA4 Exploration reports tracking Data-Driven Attribution.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Omnichannel Growth Capstone Strategy' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-030",
      "courseId": "CRS-DMK-001",
      "sequence": 30,
      "title": "Digital Marketing Leadership, Budget Allocation & Career Mastery",
      "description": "Master executive marketing leadership: Blended ROAS vs Marketing Efficiency Ratio (MER), Marketing P&L, quarterly media mix budget modeling, hiring in-house vs agency management, and CMO interview strategy.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Digital Marketing Leadership, Budget Allocation & Career Mastery\n\nSenior marketing leaders (VP of Marketing, Chief Marketing Officer) transition from channel-specific tactical optimization to holistic financial stewardship, cross-functional team leadership, and strategic capital allocation.\n\n---\n\n## 1. Blended ROAS vs. Marketing Efficiency Ratio (MER)\n\nRelying solely on platform-reported ROAS (e.g., Meta Ads Manager reporting 4.0x while Google Ads reports 4.0x) leads to double-counting illusion because both platforms claim credit for the same customer purchase.\n\n```\nMarketing Efficiency Ratio (MER) = Total Gross Revenue / Total Fully Loaded Paid Ad Spend\n```\n\n- **MER (Blended ROAS)** evaluates top-line macroeconomic truth: for every total marketing dollar invested across all channels, how many dollars of top-line company revenue were produced?\n- Target benchmark for healthy scaling brands: **MER > 3.0x to 4.5x**.\n\n---\n\n## 2. Quarterly Marketing Budget Allocation (The 70-20-10 Rule)\n\n```\n+---------------------------------------------------------------------------------+\n|                         70 - 20 - 10 BUDGET ALLOCATION                         |\n+-------------------+-------------------------------------------------------------+\n| 70% CORE CHANNELS | Proven, predictable scaling channels with validated positive    |\n|                   | unit economics (e.g., Google Search Ads, Meta CBO, Email).      |\n+-------------------+-------------------------------------------------------------+\n| 20% SECONDARY     | Emerging channels with strong promise and initial traction      |\n| EXPANSION         | (e.g., TikTok Spark Ads, LinkedIn ABM, Affiliate partnerships). |\n+-------------------+-------------------------------------------------------------+\n| 10% EXPERIMENTAL  | High-risk, high-reward frontier experimentation                 |\n| MOONSHOTS         | (e.g., Connected TV [CTV], Influencer co-branded product lines).|\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 3. In-House vs. Agency Management\n\n- **Keep In-House:** Creative Strategy, Brand Voice, Customer Retention & Email, Proprietary Data Analytics.\n- **Outsource to Agencies:** Niche technical execution, high-volume video editing production, specialized media buying during temporary seasonal scaling surges (e.g., Q4 Black Friday).\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Marketing Leadership & Budget Strategy' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-DMK-025",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-025",
      "title": "Assessment: Google Analytics 4 Architecture",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-241",
          "type": "MCQ",
          "prompt": "What is the foundational data model of Google Analytics 4 (GA4)?",
          "options": [
            "A unified event-driven data model where every interaction (pageviews, clicks, purchases) is recorded as an Event with key-value parameters",
            "A legacy session-based pageview model",
            "A relational SQL table with primary keys",
            "A file system of text log files"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-242",
          "type": "MCQ",
          "prompt": "What are 'Enhanced Measurement' events in GA4?",
          "options": [
            "Events (such as 90% scroll depth, outbound link clicks, site search, and file downloads) that can be enabled with a simple toggle without code changes",
            "Events created using artificial intelligence",
            "Events that cost $0.05 per hit",
            "Events tracked exclusively on smart televisions"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-243",
          "type": "MCQ",
          "prompt": "What major enterprise feature, previously costing $150,000/year in Universal Analytics 360, is provided completely free of charge in standard GA4?",
          "options": [
            "Native direct export of unsampled raw event-level data to Google BigQuery",
            "Free Google Ads advertising credits",
            "Unlimited free graphic design services",
            "Free phone support from Google engineers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-244",
          "type": "MCQ",
          "prompt": "How does GA4 handle cross-platform measurement across web and native mobile apps?",
          "options": [
            "It combines data from Web Data Streams and iOS/Android Firebase SDK Streams into a single unified reporting property",
            "It requires maintaining two completely separate accounts",
            "It cannot measure mobile applications",
            "It converts mobile app events into SMS text messages"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-245",
          "type": "MCQ",
          "prompt": "What are 'User Properties' in GA4?",
          "options": [
            "Attributes describing segments of your user base (e.g., loyalty tier, preferred language, subscription status) persistent across sessions",
            "Physical real estate owned by customers",
            "The screen resolution of user monitors",
            "The passwords of user accounts"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-246",
          "type": "MCQ",
          "prompt": "What is an 'Exploration' in GA4?",
          "options": [
            "An advanced custom reporting workspace (Free Form, Funnel Exploration, Path Exploration) for deep-dive exploratory data analysis",
            "A map of Google headquarters",
            "A search bar for finding keywords",
            "An automated website vulnerability scanner"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-247",
          "type": "MCQ",
          "prompt": "How does GA4 define an 'Engaged Session'?",
          "options": [
            "A session that lasted longer than 10 seconds, had 2 or more pageviews, or completed a key conversion event",
            "A session where a user clicked 100 times",
            "A session where a user left a review",
            "A session resulting in a phone call"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-248",
          "type": "MCQ",
          "prompt": "What replaced the legacy Universal Analytics 'Bounce Rate' in standard GA4 reporting?",
          "options": [
            "Engagement Rate (the percentage of engaged sessions divided by total sessions)",
            "Exit Rate",
            "Click-Through Rate",
            "Conversion Probability Score"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-249",
          "type": "MCQ",
          "prompt": "What is the maximum event data retention limit for user-level exploratory reports in free GA4 properties?",
          "options": [
            "14 months (must be manually toggled from default 2 months in Admin settings)",
            "10 years",
            "24 hours",
            "Unlimited permanent retention"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-250",
          "type": "MCQ",
          "prompt": "What is 'Google Signals' in GA4?",
          "options": [
            "Session data from users logged into their Google Accounts who consented to Ads Personalization, enabling cross-device tracking and demographic reports",
            "Cellular phone tower signals",
            "Audio notifications sent to webmasters",
            "Algorithmic search ranking penalties"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-026",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-026",
      "title": "Assessment: Google Tag Manager & Server-Side Tagging",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-251",
          "type": "MCQ",
          "prompt": "What are the three fundamental components of Google Tag Manager (GTM)?",
          "options": [
            "Tags (what to execute), Triggers (when to execute), and Variables (information inputs)",
            "HTML, CSS, and JavaScript",
            "Input, Output, and Database",
            "Campaign, Ad Set, and Ad"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-252",
          "type": "MCQ",
          "prompt": "What is the `dataLayer` in GTM implementation?",
          "options": [
            "A global JavaScript array used to pass custom event signals and e-commerce metadata from the web application directly into GTM containers cleanly",
            "A physical hard drive partition",
            "A database backup table",
            "An SSL encryption certificate"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-253",
          "type": "MCQ",
          "prompt": "What is the primary architectural advantage of Server-Side GTM over client-side tag management?",
          "options": [
            "It moves third-party tracking scripts off the user's browser onto a cloud server, drastically speeding up page load times and safeguarding PII data",
            "It eliminates cloud hosting costs",
            "It allows tracking users without an internet connection",
            "It removes the need for Google Analytics"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-254",
          "type": "MCQ",
          "prompt": "How does Server-Side GTM combat Apple Safari's Intelligent Tracking Prevention (ITP) 7-day cookie expiration?",
          "options": [
            "By setting first-party HTTP-only cookies directly from the server's own custom subdomain (e.g., sgtm.example.com), extending cookie lifespan to months",
            "By hacking user Safari browser settings",
            "By forcing users to switch to Google Chrome",
            "By sending cookies via SMS"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-255",
          "type": "MCQ",
          "prompt": "What is Google Consent Mode v2?",
          "options": [
            "A regulatory framework enabling websites to dynamically adjust Google tag behavior (analytics & ad storage) based on user cookie consent status under GDPR",
            "A tool for downloading user contacts",
            "A terms of service agreement popup",
            "A password manager for Google Chrome"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-256",
          "type": "MCQ",
          "prompt": "What cloud runtime platform is officially recommended and automated for hosting Server-Side GTM containers?",
          "options": [
            "Google Cloud Run (or Google App Engine)",
            "Microsoft Azure Active Directory",
            "Local desktop computer",
            "WordPress Web Hosting"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-257",
          "type": "MCQ",
          "prompt": "What built-in GTM trigger executes a tag immediately when a custom `dataLayer.push({ event: 'course_enrolled' })` occurs in JavaScript?",
          "options": [
            "Custom Event Trigger matching 'course_enrolled'",
            "Page View Trigger",
            "Timer Trigger",
            "History Change Trigger"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-258",
          "type": "MCQ",
          "prompt": "What is GTM Preview Mode used for?",
          "options": [
            "A real-time diagnostic debugging environment that verifies which tags fired, which variables were populated, and which triggers failed before publishing",
            "Designing marketing banners",
            "Viewing unpublished blog posts",
            "Testing internet download speed"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-259",
          "type": "MCQ",
          "prompt": "Why should marketing teams maintain version control and container backups in GTM?",
          "options": [
            "To allow instant rollbacks to previous working configurations if an erroneous or broken tag deployment causes site errors",
            "Because Google deletes GTM tags every 30 days",
            "To comply with copyright laws",
            "To increase search rankings"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-260",
          "type": "MCQ",
          "prompt": "How does Server-Side GTM enhance user data privacy compared to client-side tags?",
          "options": [
            "It intercepts outgoing payloads, strips sensitive customer PII and full IP addresses, and forwards only sanitized event data to third-party ad networks",
            "It turns off all computer webcams",
            "It encrypts hard drives",
            "It deletes website cookies"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-027",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-027",
      "title": "Assessment: Attribution Modeling & MMM",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-261",
          "type": "MCQ",
          "prompt": "What is the primary flaw of Last-Touch Attribution in multi-channel digital marketing?",
          "options": [
            "It awards 100% of conversion credit to the final touchpoint (often branded search or direct URL entry), completely ignoring top-of-funnel discovery channels",
            "It is illegal under European law",
            "It requires high server compute fees",
            "It only works on desktop computers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-262",
          "type": "MCQ",
          "prompt": "How does Data-Driven Attribution (DDA) allocate conversion credit across customer touchpoints in Google Analytics 4?",
          "options": [
            "It uses machine learning algorithms (Shapley Value theory) to compare converting vs non-converting paths and award fractional credit based on true statistical lift",
            "It divides credit equally among all clicks",
            "It gives 100% of credit to the first ad clicked",
            "It randomly guesses touchpoint values"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-263",
          "type": "MCQ",
          "prompt": "What is Marketing Mix Modeling (MMM)?",
          "options": [
            "A top-down statistical econometric regression technique that analyzes aggregate historical media spend against sales revenue without relying on user-level cookies",
            "A recipe for corporate event catering",
            "A tool for designing banner ads",
            "A social media scheduling calendar"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-264",
          "type": "MCQ",
          "prompt": "What does 'Adstock' represent in Marketing Mix Modeling?",
          "options": [
            "The prolonged, decaying carry-over effect of advertising awareness on consumer behavior that persists days or weeks after an ad impression occurred",
            "The physical inventory of products in a retail store",
            "The stock market share price of advertising agencies",
            "The number of ads stored in a database"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-265",
          "type": "MCQ",
          "prompt": "What is an Incrementality Experiment (Geo-Lift Test)?",
          "options": [
            "A controlled experiment comparing sales in test geographic regions where ad spend is modified against holdout control regions to measure true causal sales lift",
            "An experiment testing website button colors",
            "A laboratory chemistry test",
            "A test measuring internet connection speed"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-266",
          "type": "MCQ",
          "prompt": "What is 'iROAS' in performance marketing evaluation?",
          "options": [
            "Incremental Return on Ad Spend: Measuring strictly the incremental revenue that would NOT have occurred without the ad spend, eliminating baseline organic sales",
            "International Return on Advertising Sales",
            "Internal Rate of Accounting Success",
            "Instant Revenue On All Spend"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-267",
          "type": "MCQ",
          "prompt": "Why has Marketing Mix Modeling (MMM) experienced a massive resurgence among enterprise CMOs in recent years?",
          "options": [
            "Because privacy shifts (Apple iOS ATT, cookie deprecation, GDPR) severely broken user-level multi-touch attribution, necessitating macro-econometric modeling",
            "Because MMM software became open-source and free",
            "Because digital ads became 100% free",
            "Because all attribution models were banned"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-268",
          "type": "MCQ",
          "prompt": "What open-source Marketing Mix Modeling package was built and released by Meta's marketing science team?",
          "options": [
            "Robyn",
            "Meridian",
            "PyTorch",
            "TensorFlow"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-269",
          "type": "MCQ",
          "prompt": "What does the 'Diminishing Returns' (Saturation) curve illustrate in paid media allocation?",
          "options": [
            "As ad spend on a specific channel increases beyond optimal capacity, each additional dollar spent generates progressively less incremental revenue",
            "All ads stop working after 30 days",
            "Advertising costs decrease to zero over time",
            "Customer lifetime value increases indefinitely"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-270",
          "type": "MCQ",
          "prompt": "What is the primary danger of relying on self-reported platform attribution (e.g., Facebook Ads Manager ROAS)?",
          "options": [
            "Ad platforms use generous view-through attribution windows and claim credit for sales that would have happened organically or through other channels",
            "Ad platforms intentionally delete conversion data",
            "Platform reports cannot be exported to Excel",
            "Platform reports only show data in foreign currencies"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-028",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-028",
      "title": "Assessment: Growth Hacking & Viral Loops",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-271",
          "type": "MCQ",
          "prompt": "What are the 5 stages of Dave McClure's AARRR 'Pirate Metrics' framework?",
          "options": [
            "Acquisition, Activation, Retention, Referral, Revenue",
            "Awareness, Alignment, Reach, Results, ROI",
            "Attention, Authority, Retention, Reporting, Revenue",
            "Analytics, Acquisition, Readiness, Review, Reward"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-272",
          "type": "MCQ",
          "prompt": "What is the 'Aha! Moment' in the Activation stage of product-led growth?",
          "options": [
            "The specific inflection point where a new user first experiences the core value proposition of the product and realizes why it is indispensable",
            "When a user enters their credit card number",
            "When a user receives a billing receipt",
            "When a user uninstalls the application"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-273",
          "type": "MCQ",
          "prompt": "What condition must be satisfied for a product's viral loop to achieve self-sustaining exponential viral growth?",
          "options": [
            "The Viral Coefficient (K-Factor) must be strictly greater than 1.0 (K > 1.0)",
            "K-Factor must equal exactly 0",
            "The marketing team must spend $100,000 per day",
            "The product must be featured on national television"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-274",
          "type": "MCQ",
          "prompt": "In growth experiment prioritization, what three criteria form the ICE Framework score?",
          "options": [
            "Impact, Confidence, and Ease of execution (each rated 1-10)",
            "Income, Cost, and Efficiency",
            "Innovation, Creativity, and Engagement",
            "Interest, Conversion, and Economics"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-275",
          "type": "MCQ",
          "prompt": "What is a 'North Star Metric' in growth strategy?",
          "options": [
            "The single key metric that best captures the core customer value delivered by the product and directly drives long-term sustainable business growth",
            "The total number of followers on Twitter",
            "The price of the company's stock",
            "The annual gross advertising budget"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-276",
          "type": "MCQ",
          "prompt": "What classic viral growth loop did Dropbox implement to achieve exponential user adoption?",
          "options": [
            "Two-sided referral incentive: offering 500MB of free cloud storage to both the referring user and the newly invited friend upon signup",
            "Sending millions of cold fax messages",
            "Buying full-page newspaper advertisements",
            "Paying users cash directly via PayPal"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-277",
          "type": "MCQ",
          "prompt": "What is 'Viral Cycle Time' in growth loop velocity?",
          "options": [
            "The time it takes for a newly acquired user to invite their friends and for those invited friends to convert into active users",
            "The time taken to develop a software feature",
            "The length of an email marketing drip sequence",
            "The duration of an executive board meeting"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-278",
          "type": "MCQ",
          "prompt": "Why is high user Retention recognized as the mandatory prerequisite for sustainable growth before investing heavily in viral loops or acquisition?",
          "options": [
            "Pouring traffic into a product with poor retention creates a 'leaky bucket' where acquired users churn rapidly, burning cash with zero compounding value",
            "Because acquisition channels become illegal if churn is high",
            "Because Google bans apps with low retention",
            "Because retention has no impact on revenue"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-279",
          "type": "MCQ",
          "prompt": "What is an MVT (Minimum Viable Test) in growth experimentation?",
          "options": [
            "The simplest, fastest, lowest-code experiment designed to validate or invalidate a core growth hypothesis before investing major engineering resources",
            "A test with zero users",
            "A complete 6-month product rebuild",
            "A legal trademark compliance check"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-280",
          "type": "MCQ",
          "prompt": "What is the typical operational cadence for a high-tempo growth team sprint cycle?",
          "options": [
            "1 to 2 weeks per rapid test-learn-iterate cycle",
            "3 years",
            "24 hours",
            "Quarterly only"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-029",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-029",
      "title": "Assessment: Omnichannel Scale-Up Capstone",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-281",
          "type": "MCQ",
          "prompt": "In the AuraCommerce Global Capstone architecture, what is the role of the 5 Topic Cluster Content Silos?",
          "options": [
            "Building compounding topical authority to rank on Page 1 of Google for high-intent long-tail and commercial queries without ongoing ad costs",
            "Storing product image files",
            "Hosting customer support chat tickets",
            "Sending automated SMS notifications"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-282",
          "type": "MCQ",
          "prompt": "Why is Meta CAPI implemented alongside the client-side Pixel in the Capstone platform?",
          "options": [
            "To capture server-side purchase events blocked by browser privacy controls and achieve high Event Match Quality (EMQ) through event_id deduplication",
            "To post ads on Facebook groups automatically",
            "To delete negative customer comments",
            "To manage the company Instagram profile"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-283",
          "type": "MCQ",
          "prompt": "How does Google Performance Max (PMax) complement Google Search campaigns in the Capstone strategy?",
          "options": [
            "PMax captures incremental multi-channel conversions across YouTube, Discover, Gmail, and Shopping using automated asset groups and audience signals",
            "PMax replaces Google Search entirely",
            "PMax is used only for customer refunds",
            "PMax does not show product ads"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-284",
          "type": "MCQ",
          "prompt": "What automated email/SMS recovery cadence is deployed to minimize lost revenue from abandoned carts?",
          "options": [
            "A 3-touch sequence sent at +1 hour, +24 hours, and +48 hours with friction reduction, social proof, and final urgency incentives",
            "Sending 10 text messages every 5 minutes",
            "Sending a letter via postal mail after 30 days",
            "Calling the customer on their personal phone immediately"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-285",
          "type": "MCQ",
          "prompt": "How does RFM segmentation inform retention marketing in the Capstone architecture?",
          "options": [
            "It groups customers by Recency, Frequency, and Monetary value to deliver differentiated VIP perks to Champions and automated win-back flows to At-Risk buyers",
            "It sets the font size of promotional emails",
            "It calculates employee sales commissions",
            "It formats product photos for Instagram"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-286",
          "type": "MCQ",
          "prompt": "Why is an explicit 1:1 Attention Ratio enforced on paid acquisition landing pages?",
          "options": [
            "Eliminating header menus, sidebars, and outbound links prevents visitor distraction and focuses 100% of attention on the target conversion goal",
            "It cuts website bandwidth consumption in half",
            "It allows the page to load in 1 millisecond",
            "It is required by web browser security rules"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-287",
          "type": "MCQ",
          "prompt": "Where does GA4 stream raw event-level data in real time for executive reporting in the Capstone analytics architecture?",
          "options": [
            "Google BigQuery",
            "A local Excel spreadsheet",
            "An FTP server",
            "A WordPress database"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-288",
          "type": "MCQ",
          "prompt": "What is the primary function of Google Tag Manager (GTM) Server-Side container deployed on Google Cloud Run?",
          "options": [
            "Sanitizing outgoing marketing data, reducing client browser load, extending first-party cookie lifespan, and dispatching server-side CAPI events",
            "Hosting the front-end React website",
            "Managing customer credit card billing",
            "Sending weekly email newsletters"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-289",
          "type": "MCQ",
          "prompt": "What target LTV:CAC ratio is maintained across paid channels in the AuraCommerce scale-up plan?",
          "options": [
            "A healthy target between 3.5:1 and 5.0:1",
            "0.5:1 (losing money on every sale)",
            "1:1 (breaking even on gross margin)",
            "100:1 (under-investing in growth)"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-290",
          "type": "MCQ",
          "prompt": "What viral loop mechanism is integrated into the post-purchase thank-you experience?",
          "options": [
            "A 2-sided customer referral mechanism giving $25 credit to the referrer and $25 off to the friend upon first completed order",
            "An automatic Facebook post made from the customer's personal profile",
            "A pop-up asking for 5-star ratings on Google",
            "A mandatory contract signing"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-030",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-030",
      "title": "Assessment: Marketing Leadership & Budget Strategy",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-291",
          "type": "MCQ",
          "prompt": "What does the Marketing Efficiency Ratio (MER), also known as Blended ROAS, measure?",
          "options": [
            "Total gross business revenue divided by total fully loaded marketing advertising spend across all channels simultaneously",
            "Total clicks divided by total impressions",
            "The marketing team's annual payroll divided by office rent",
            "The number of ads approved by Google"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-292",
          "type": "MCQ",
          "prompt": "Why do experienced CMOs rely on MER rather than individual platform-reported ROAS (e.g., Meta ROAS + Google Ads ROAS)?",
          "options": [
            "Platform reports double-count conversions (both claiming credit for the same purchase); MER provides unmanipulated top-line financial truth",
            "MER is required by the SEC for tax filings",
            "Platform reports are only updated once a year",
            "MER eliminates all advertising expenses"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-293",
          "type": "MCQ",
          "prompt": "Under the 70-20-10 marketing budget allocation framework, how should an enterprise divide its quarterly paid media capital?",
          "options": [
            "70% in proven core scaling channels, 20% in secondary emerging channels, and 10% in experimental frontier moonshots",
            "70% in executive bonuses, 20% in office parties, 10% in marketing",
            "70% on Facebook, 20% on Instagram, 10% on WhatsApp",
            "Equal 33% split across all channels"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-294",
          "type": "MCQ",
          "prompt": "What core functions should modern marketing departments typically retain in-house rather than outsourcing completely to agencies?",
          "options": [
            "Creative strategy, core brand voice, customer retention & lifecycle email, and proprietary customer data analytics",
            "Writing HTML code for server operating systems",
            "Printing business cards",
            "Managing building security"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-295",
          "type": "MCQ",
          "prompt": "When evaluating a Marketing P&L, what is 'Contribution Margin'?",
          "options": [
            "Gross Revenue minus Cost of Goods Sold (COGS) minus Variable Delivery Costs minus Total Direct Performance Marketing Spend",
            "The donation made to charity",
            "The amount paid in corporate income tax",
            "The annual salary of marketing interns"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-296",
          "type": "MCQ",
          "prompt": "What is 'First-Party Data Strategy' and why is it the top priority for modern marketing executives?",
          "options": [
            "Building direct, consented relationships (email lists, SMS, purchase history, app data) that insulate the business from third-party cookie loss and privacy regulations",
            "Buying consumer data lists from brokers",
            "Scraping public social media profiles",
            "Purchasing competitor customer databases"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-297",
          "type": "MCQ",
          "prompt": "What is an effective agency compensation model that aligns agency incentives with brand profitability?",
          "options": [
            "A base retainer plus a performance bonus tied to hitting verified incremental contribution margin or MER targets",
            "A flat percentage of ad spend regardless of profitability (incentivizing the agency to spend more even when losing money)",
            "Paying the agency only in company stock options",
            "Hourly billing without deliverables"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-298",
          "type": "MCQ",
          "prompt": "What does 'Payback Period on Cash' dictate in high-growth venture-backed or bootstrapped companies?",
          "options": [
            "How quickly customer gross profit replenishes working capital to be reinvested into the next month's customer acquisition ad spend",
            "The date bank loans must be repaid",
            "The time taken to issue employee paychecks",
            "The time taken to close accounting books"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-299",
          "type": "MCQ",
          "prompt": "In VP of Marketing or CMO leadership interviews, how should a candidate answer questions regarding multi-million dollar budget allocation?",
          "options": [
            "By presenting a framework grounded in unit economics (LTV, CAC, Payback), financial modeling (MER, Contribution Margin), and experimental risk-diversification (70-20-10)",
            "By declaring loyalty to a single social media platform",
            "By promising a guaranteed 1000% ROI in 30 days",
            "By proposing spending the entire budget on television commercials"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-300",
          "type": "MCQ",
          "prompt": "What defines an elite, modern T-Shaped Digital Marketing Leader?",
          "options": [
            "Broad foundational literacy across all digital disciplines (SEO, SEM, Paid Social, CRO, Email, Analytics) coupled with deep world-class mastery in 1-2 core domain areas",
            "An executive who only uses Twitter",
            "A marketer who refuses to look at spreadsheets",
            "A graphic designer who only creates logos"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
};
