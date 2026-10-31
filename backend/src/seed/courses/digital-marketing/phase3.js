// Course 11: Digital Marketing - Phase 3 (Chapters 13-18, Assessments 13-18)
// Paid Social, Meta Ads Manager, CAPI, Audience Targeting, Creative Strategy, B2B LinkedIn Ads, Short-Form Video & Content Marketing

export const phase3 = {
  "chapters": [
    {
      "id": "CH-DMK-013",
      "courseId": "CRS-DMK-001",
      "sequence": 13,
      "title": "Meta Ads Manager Architecture & Campaign Budget Optimization",
      "description": "Master Meta advertising infrastructure: Campaign-AdSet-Ad architecture, Meta Pixel, Conversions API (CAPI) server-side tracking, Advantage+ Campaign Budget Optimization (CBO vs ABO), and campaign objectives.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Meta Ads Manager Architecture & Campaign Budget Optimization\n\nMeta (Facebook & Instagram) is the premier demand-generation engine in paid social, using deep neural recommendation graphs to match ad creative with consumer intent.\n\n---\n\n## 1. Meta Ads Account Hierarchy\n\n```\n+---------------------------------------------------------------------------------+\n|                             META ADS ACCOUNT HIERARCHY                          |\n+---------------------------------------------------------------------------------+\n                                        |\n           +----------------------------+----------------------------+\n           |                                                         |\n           v                                                         v\n+-----------------------+                                 +-----------------------+\n| CAMPAIGN LEVEL        |                                 | CAMPAIGN LEVEL        |\n| - Objective: Sales    |                                 | - Objective: Leads    |\n| - Budget Mode: CBO    |                                 | - Budget Mode: ABO    |\n+-----------------------+                                 +-----------------------+\n           |                                                         |\n     +-----+-----+                                             +-----+-----+\n     v           v                                             v           v\n+---------+ +---------+                                   +---------+ +---------+\n| AD SET  | | AD SET  |                                   | AD SET  | | AD SET  |\n| Audience| | Audience|                                   | Audience| | Audience|\n| Placements Placements                                   | Placements Placements\n+---------+ +---------+                                   +---------+ +---------+\n     |           |                                             |           |\n  +--+--+     +--+--+                                       +--+--+     +--+--+\n  v     v     v     v                                       v     v     v     v\n[ AD ] [ AD ] [ AD ] [ AD ]                               [ AD ] [ AD ] [ AD ] [ AD ]\n (Creative: Video / Carousel)                               (Creative: Video / Image)\n```\n\n---\n\n## 2. Meta Pixel & Conversions API (CAPI)\n\nFollowing Apple's iOS 14.5 App Tracking Transparency (ATT) update, client-side browser cookies are heavily blocked. Modern tracking requires **hybrid tracking** pairing the browser Pixel with server-side CAPI:\n\n```\nUser Browser ------ (Client-side Pixel) -----> [ Meta Ad Servers ]\n     |                                                ^\n     | Purchase Event Triggered                       | Deduplication via\n     v                                                | event_id parameter!\nYour Backend Server -- (Server-side CAPI) ----> [ Meta Ad Servers ]\n```\n\n### Key CAPI Requirements:\n1. **Event Deduplication:** Send an identical `event_id` and `event_name` from both browser and server; Meta merges them into a single deduplicated conversion.\n2. **Event Match Quality (EMQ):** Pass SHA-256 hashed customer parameters (`em` for email, `ph` for phone, `fbp`/`fbc` cookies) to achieve an EMQ score > 8.0/10.\n\n---\n\n## 3. CBO vs. ABO (Advantage+ Budget Strategy)\n\n- **Campaign Budget Optimization (CBO / Advantage+):** Meta allocates your daily budget dynamically across ad sets in real time, routing spend to the lowest-cost conversion opportunities.\n- **Ad Set Budget Optimization (ABO):** The advertiser specifies an exact budget for each ad set. Ideal for isolated testing (e.g., spending exactly $50/day on Creative Angle A vs Creative Angle B).\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Meta Ads Manager & CAPI' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-014",
      "courseId": "CRS-DMK-001",
      "sequence": 14,
      "title": "Audience Targeting & Segmentation on Paid Social",
      "description": "Master social audience strategy: Core Demographics, Custom Audiences (Website, Customer Lists, Video Viewers), Lookalike Audiences (1%-10%), audience overlap mitigation, and Broad targeting.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Audience Targeting & Segmentation on Paid Social\n\nAudience targeting defines who sees your creative. In the post-cookie privacy landscape, targeting strategy has evolved from rigid demographic slicing to dynamic first-party audiences and algorithmic broad targeting.\n\n---\n\n## 1. The 3 Primary Audience Types on Meta\n\n```\n+---------------------------------------------------------------------------------+\n|                             META AUDIENCE TAXONOMY                              |\n+-------------------+-------------------------------------------------------------+\n| 1. CORE AUDIENCES | Demographic, geographic, and interest-based criteria.           |\n|                   | Examples: Location: US, Age: 25-45, Interests: Cloud Computing. |\n|                   | Best For: Initial prospecting, localized store promotions.      |\n+-------------------+-------------------------------------------------------------+\n| 2. CUSTOM         | People who already have a relationship with your business.      |\n| AUDIENCES         | Types: Website Visitors (30d), Customer Email List, Instagram   |\n|                   | Engagers (365d), Video Viewers (watched 75%+ of video ad).      |\n|                   | Best For: Retargeting, retention, churn win-backs.              |\n+-------------------+-------------------------------------------------------------+\n| 3. LOOKALIKE      | New prospective customers who algorithmically resemble your best|\n| AUDIENCES (LLAs)  | existing customers.                                             |\n|                   | Granularity: 1% (Closest resemblance) to 10% (Broadest reach).  |\n|                   | Seed Source: Top 20% highest LTV customer list or repeat buyers.|\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. The Rise of 'Broad Targeting' (Advantage+)\n\nModern Meta algorithms (Andromeda / Lattice engines) are so sophisticated at analyzing ad creative that **Broad Targeting** (zero interest or demographic filters except Age + Country) frequently outperforms narrow interest targeting:\n\n```\nOLD PARADIGM: Micro-targeted audiences with generic creative -> High CPMs ($40+)\nNEW PARADIGM: Broad audience (10M+ users) + Dynamic creative that self-selects ideal buyers -> Lower CPMs ($15), scalable growth\n```\n\n---\n\n## 3. Audience Overlap & Exclusion Hygiene\n\nWhen two ad sets target overlapping audiences, your own ad sets bid against each other in the auction, driving up CPMs (Audience Contention):\n- **Exclusion Rule:** Always exclude `Past 30-Day Purchasers` from prospecting ad sets.\n- **Retargeting Segments:** Separate `Cart Abandoners (0-7 Days)` from `Warm Social Engagers (8-30 Days)` using explicit negative audience exclusions.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Meta Audience Targeting & Lookalikes' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-015",
      "courseId": "CRS-DMK-001",
      "sequence": 15,
      "title": "Creative Strategy, Direct-Response Copywriting & Ad Formats",
      "description": "Master performance creative: Thumb-stopping hooks, 3-second hook rate, User Generated Content (UGC), direct-response copywriting frameworks (PAS, BAB, AIDA), carousels, and creative testing matrix.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Creative Strategy, Direct-Response Copywriting & Ad Formats\n\nOn paid social, **creative is the new targeting**. The first 3 seconds of your video ad dictate 80% of campaign performance.\n\n---\n\n## 1. Anatomy of a High-Converting Video Ad\n\n```\n+---------------------------------------------------------------------------------+\n|                       ANATOMY OF A PERFORMANCE VIDEO AD                         |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  [ 0 - 3 SECONDS: THE HOOK ]                                                      \n  - Visual disruption, pattern interrupt, bold text overlay, controversial claim.  \n  - Goal: Stop the user from scrolling down their feed!                            \n  - Key Metric: 3-Second Hook Rate (3-sec views / Impressions > 30% target).       \n                               |                                                   \n                               v                                                   \n  [ 3 - 15 SECONDS: THE CORE PROBLEM & AGITATION ]                                 \n  - Agitates user pain point: 'Tired of broken data pipelines at 2 AM?'            \n  - Connects emotionally with target persona frustrations.                         \n                               |                                                   \n                               v                                                   \n  [ 15 - 30 SECONDS: THE UNIQUE MECHANISM / SOLUTION ]                             \n  - Introduces product as the logical resolution: 'Here is how Iceberg solves it.' \n  - Demonstrates product UI, unboxing, or transformation in action.                \n                               |                                                   \n                               v                                                   \n  [ 30 - 45 SECONDS: SOCIAL PROOF & CALL TO ACTION (CTA) ]                         \n  - Testimonial overlay, student reviews, trust badges, risk reversal guarantee.   \n  - Direct CTA: 'Enroll now and get 50% off Sprint 1 access.'                      \n```\n\n---\n\n## 2. Direct-Response Copywriting Frameworks\n\n| Framework | Structure | Example Application |\n| :--- | :--- | :--- |\n| **PAS** | Problem - Agitate - Solve | 'Writing ETL pipelines in raw SQL? (P) Schema changes break your queries every Monday morning. (A) Switch to Iceberg open table formats and enforce ACID contracts. (S)' |\n| **BAB** | Before - After - Bridge | 'Before: Spending 20 hours fixing failing Airflow DAGs. After: Flawless automated runs with sub-second alerting. Bridge: Nalanda Data Engineering Masterclass.' |\n| **AIDA** | Attention - Interest - Desire - Action | Hook headline -> Shocking industry statistic -> Irresistible curriculum preview -> Enroll today. |\n\n---\n\n## 3. High-Converting Ad Formats\n\n- **User Generated Content (UGC):** Authentic, raw, vertical mobile video recorded by genuine creators or customers. Outperforms polished studio production by 2x-3x in engagement.\n- **Carousel Ads:** Multi-card sequential storytelling showing a product line, customer transformations, or step-by-step feature walkthroughs.\n- **Comparison Grids:** Side-by-side 'Us vs. Them' visual infographics establishing clear value proposition superiority.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Paid Social Creative Strategy' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-016",
      "courseId": "CRS-DMK-001",
      "sequence": 16,
      "title": "B2B Marketing on LinkedIn Ads",
      "description": "Master enterprise B2B paid acquisition: Account-Based Marketing (ABM), company and job-title targeting, Sponsored Content, Lead Gen Forms, Thought Leader Ads, and LinkedIn Insight Tag.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# B2B Marketing on LinkedIn Ads\n\nLinkedIn is the undisputed authority platform for high-ACV (Annual Contract Value) B2B enterprise marketing, allowing advertisers to target decision-makers by exact job title, company size, and industry seniority.\n\n---\n\n## 1. LinkedIn Demographic Targeting Superpowers\n\n```\n+---------------------------------------------------------------------------------+\n|                          LINKEDIN TARGETING MATRIX                              |\n+-------------------+-------------------------------------------------------------+\n| 1. COMPANY        | Target specific named accounts (e.g., Fortune 500 ABM list),    |\n| TARGETING         | company size (e.g., 500-10,000 employees), and growth rate.     |\n+-------------------+-------------------------------------------------------------+\n| 2. JOB FUNCTION & | Job Function: Engineering, Information Technology, Operations.  |\n| SENIORITY         | Seniority: Director, VP, CXO, Partner, Manager.                 |\n+-------------------+-------------------------------------------------------------+\n| 3. JOB TITLES     | Exact professional designations: 'Lead Data Architect',         |\n|                   | 'VP of Engineering', 'Director of Enterprise Infrastructure'.   |\n+-------------------+-------------------------------------------------------------+\n| 4. SKILLS &       | Member skills: 'Apache Spark', 'Kubernetes', 'Apache Kafka'.    |\n| GROUPS            | Industry discussion groups.                                     |\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. High-Converting B2B Ad Formats\n\n1. **Native Lead Gen Forms:** When a prospect clicks the ad, a form opens pre-populated with their verified LinkedIn profile data (Name, Work Email, Job Title, Company). Delivers **2x-3x higher conversion rates** than sending traffic to external mobile landing pages.\n2. **Thought Leader Ads:** Promoting personal posts from executives, founders, or senior engineers directly from their personal profiles. Generates substantially higher engagement and trust than standard corporate company page posts.\n3. **Document Ads (Carousels):** Uploading downloadable PDFs directly in the LinkedIn feed (e.g., '2026 Lakehouse Architecture Blueprint') requiring a form submit to download full high-res files.\n\n---\n\n## 3. Account-Based Marketing (ABM) Playbook\n\n- Upload a **Target Account List (TAL)** of 500 enterprise companies your sales team is actively prospecting.\n- Match against decision-makers with `Seniority = Director+` and `Job Function = Engineering`.\n- Nurture prospects through a sequential content journey: Whitepaper -> Customer Case Study -> Executive Webinar -> Direct Demo Invitation.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='B2B LinkedIn Ads Strategy' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-017",
      "courseId": "CRS-DMK-001",
      "sequence": 17,
      "title": "Short-Form Video Marketing: TikTok, Reels & YouTube Shorts",
      "description": "Master viral organic and paid short-form video: TikTok Ads Manager, sound-on culture, Hook-Story-Offer formula, Spark Ads, creator partnerships, and multi-platform distribution.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Short-Form Video Marketing: TikTok, Reels & YouTube Shorts\n\nVertical short-form video (9:16 aspect ratio) has become the dominant consumer attention format across TikTok, Instagram Reels, and YouTube Shorts, processing billions of daily video views.\n\n---\n\n## 1. The Short-Form Video Mindset: 'Don't Make Ads, Make TikToks'\n\n- **Sound-On Environment:** 90%+ of TikTok users watch with sound enabled; trending background audio tracks and clear voiceovers are mandatory.\n- **Low-Fidelity Authenticity:** Highly produced commercial TV spots look like foreign intrusive advertisements and are swiped away in 0.5 seconds. Native iPhone recording in a conversational style builds instant rapport.\n- **Pacing & Text Overlays:** Rapid visual cuts every 2–3 seconds paired with kinetic closed captions for accessibility.\n\n---\n\n## 2. The Hook-Story-Offer Framework\n\n```\n+---------------------------------------------------------------------------------+\n|                          HOOK - STORY - OFFER FRAMEWORK                         |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  [ 1. THE HOOK (0 - 2 Seconds) ]                                                  \n  - 'If you are still debugging Spark jobs manually, stop right now.'             \n  - Bold movement, green-screen background showing broken error code.              \n                               |                                                   \n                               v                                                   \n  [ 2. THE STORY (3 - 20 Seconds) ]                                                \n  - 'Here is how our engineering team eliminated 90% of memory spills using        \n    Adaptive Query Execution in three lines of configuration.'                    \n  - Quick screen walkthrough showing the terminal or UI dashboard.                 \n                               |                                                   \n                               v                                                   \n  [ 3. THE OFFER (20 - 30 Seconds) ]                                               \n  - 'I put together the complete architecture guide for free. Link in bio to grab  \n    the checklist and level up your data pipelines.'                              \n```\n\n---\n\n## 3. TikTok Spark Ads & Creator Collaborations\n\n- **Spark Ads:** Enables brands to boost organic creator posts directly from the creator's TikTok handle using an authorization code, combining native creator credibility with programmatic budget scaling.\n- **Creator Licensing:** Whitelisting creator handles on Meta and TikTok to run ads from third-party influencer profiles rather than the brand's own account.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='TikTok & Short-Form Video Strategy' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-018",
      "courseId": "CRS-DMK-001",
      "sequence": 18,
      "title": "Content Marketing & Editorial Strategy",
      "description": "Build an enterprise content engine: Content marketing lifecycle, thought leadership, evergreen content, editorial calendars, cross-platform repurposing workflows, and content attribution.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Content Marketing & Editorial Strategy\n\nContent marketing is the strategic discipline of creating and distributing valuable, relevant, consistent content to attract and retain a clearly defined audience—ultimately driving profitable customer action.\n\n---\n\n## 1. Content Lifecycle & The 1-to-10 Repurposing Engine\n\nProducing high-quality pillar content requires significant research. Maximize ROI by systematically decomposing one pillar asset into multiple channel-native formats:\n\n```\n                  [ CORE PILLAR ASSET: 4,000-Word Whitepaper / Podcast ]\n                                            |\n     +--------------------+-----------------+--------------------+--------------------+\n     |                    |                 |                    |                    |\n     v                    v                 v                    v                    v\n[ 3 In-Depth SEO     [ 1 YouTube Video  [ 5 LinkedIn Carousel [ 10 X / Twitter    [ 1 Email Newsletter\n  Blog Articles ]      Breakdown ]        Decks ]               Threads ]           Deep Dive ]\n```\n\n---\n\n## 2. Thought Leadership vs. Commodity Content\n\n- **Commodity Content (Low Value):** Surface-level summaries generated without original experience, opinions, or data. Quickly made obsolete by search AI summaries.\n- **Thought Leadership (High Value):** Proprietary point-of-view, original industry benchmarks, contrarian perspectives backed by real operational data, and authentic executive case studies.\n\n---\n\n## 3. Editorial Operations & Distribution Cadence\n\n1. **Content Briefs:** Standardized templates specifying target persona, primary keyword, secondary search intent questions, competitor URLs to beat, and mandatory internal links.\n2. **Distribution First:** Never publish a piece without a pre-planned distribution roadmap across email, social communities, employee advocacy, and partner syndication.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Content Marketing Strategy & Operations' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-DMK-013",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-013",
      "title": "Assessment: Meta Ads Manager Architecture & CAPI",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-121",
          "type": "MCQ",
          "prompt": "What is Meta Conversions API (CAPI)?",
          "options": [
            "A server-to-server tracking pipeline that transmits web conversion events directly from the advertiser's server to Meta, bypassing browser ad-blockers and cookie restrictions",
            "A tool for creating Instagram filters",
            "A credit card payment gateway for Facebook",
            "A software library for writing Python scripts"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-122",
          "type": "MCQ",
          "prompt": "When running both the client-side Meta Pixel and server-side CAPI simultaneously, what parameter is required to prevent duplicate counting of purchases?",
          "options": [
            "An identical unique 'event_id' parameter passed in both client and server payloads for deduplication",
            "The user's credit card CVV",
            "The advertiser's Facebook password",
            "A random 1-digit number"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-123",
          "type": "MCQ",
          "prompt": "What is the primary difference between Campaign Budget Optimization (CBO) and Ad Set Budget Optimization (ABO)?",
          "options": [
            "CBO automatically distributes budget across ad sets in real time based on lowest-cost opportunities; ABO requires setting fixed budgets per ad set",
            "CBO is only available for video ads",
            "ABO is free while CBO charges a 10% fee",
            "CBO runs on Instagram only"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-124",
          "type": "MCQ",
          "prompt": "What three hierarchical levels comprise a Meta Ads campaign structure?",
          "options": [
            "Campaign Level, Ad Set Level, and Ad Level",
            "Account Level, Server Level, and Code Level",
            "Header, Body, and Footer",
            "Director, Manager, and Specialist"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-125",
          "type": "MCQ",
          "prompt": "What is Event Match Quality (EMQ) in Meta Events Manager?",
          "options": [
            "A score rating how effectively customer information parameters (e.g., hashed email, phone, IP) match server events to real Meta user accounts",
            "The audio quality of an Instagram video",
            "The speed of the user's internet connection",
            "The number of likes on an ad"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-126",
          "type": "MCQ",
          "prompt": "What did Apple's iOS 14.5 App Tracking Transparency (ATT) framework enforce?",
          "options": [
            "Mandatory user opt-in prompts for third-party tracking across apps, heavily restricting client-side pixel attribution on Apple devices",
            "A ban on all Facebook ads on iPhones",
            "Automatic deletion of Safari history every 24 hours",
            "A tax on all digital purchases"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-127",
          "type": "MCQ",
          "prompt": "At what level in Meta Ads Manager are audience targeting, geographic locations, and ad placements configured?",
          "options": [
            "Ad Set level",
            "Campaign level",
            "Ad level",
            "Business Manager level"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-128",
          "type": "MCQ",
          "prompt": "What is an Advantage+ Shopping Campaign (ASC) in Meta Ads?",
          "options": [
            "An end-to-end automated campaign type leveraging machine learning across creative, audiences, and placements to maximize retail sales",
            "A discount program for Amazon Prime members",
            "An ad format that only runs in physical grocery stores",
            "A manual keyword search campaign"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-129",
          "type": "MCQ",
          "prompt": "What cryptographic hashing algorithm must be used to hash customer emails and phone numbers before sending them to Meta CAPI?",
          "options": [
            "SHA-256",
            "MD5",
            "ROT13",
            "Plaintext Base64"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-130",
          "type": "MCQ",
          "prompt": "What campaign objective should be selected when the goal is to drive direct e-commerce checkout purchases?",
          "options": [
            "Sales (Conversions)",
            "Brand Awareness",
            "Traffic (Link Clicks)",
            "Page Likes"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-014",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-014",
      "title": "Assessment: Audience Targeting & Segmentation",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-131",
          "type": "MCQ",
          "prompt": "What is a Lookalike Audience (LLA) on Meta?",
          "options": [
            "An algorithmic audience of prospective users who share behavioral, demographic, and psychographic characteristics with your seed customer list",
            "A group of people with similar profile pictures",
            "An audience of your competitors' employees",
            "A list of celebrity impersonators"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-132",
          "type": "MCQ",
          "prompt": "What does a 1% Lookalike Audience represent compared to a 10% Lookalike Audience?",
          "options": [
            "A 1% Lookalike consists of users who most closely match the seed source (highest similarity), whereas a 10% Lookalike has broader reach with lower similarity",
            "A 1% Lookalike costs 1% as much as a 10% Lookalike",
            "A 1% Lookalike only contains 100 people",
            "A 10% Lookalike is always 10 times more profitable"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-133",
          "type": "MCQ",
          "prompt": "What is 'Broad Targeting' on paid social?",
          "options": [
            "Targeting large geographic regions without specifying interest keywords or behavioral categories, allowing the ad creative and algorithm to self-select buyers",
            "Showing ads on physical billboards",
            "Sending cold emails to random domain names",
            "Running radio commercials"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-134",
          "type": "MCQ",
          "prompt": "What is Audience Overlap in Meta advertising?",
          "options": [
            "When multiple ad sets in your account target overlapping groups of users, causing your own ads to enter auction competition against each other",
            "When users see two ads at the exact same second",
            "When two people share one computer",
            "When users click on an ad twice"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-135",
          "type": "MCQ",
          "prompt": "What is the recommended seed list for generating the highest-quality Lookalike Audience for an e-commerce brand?",
          "options": [
            "A customer list of the top 20% highest lifetime value (LTV) repeat purchasers",
            "A list of users who bounced off the homepage in 2 seconds",
            "A random list of Facebook page likers from 2012",
            "A scraped directory of generic public emails"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-136",
          "type": "MCQ",
          "prompt": "Why should past 30-day purchasers typically be excluded from prospecting ad sets?",
          "options": [
            "To avoid wasting ad budget advertising products they have already purchased, and focus prospecting budget on acquiring net-new customers",
            "Because past customers are legally blocked from seeing ads",
            "To prevent customers from leaving negative reviews",
            "Because past customers do not use social media"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-137",
          "type": "MCQ",
          "prompt": "What is a Custom Audience based on website activity?",
          "options": [
            "An audience created from users who performed specific actions on your site tracked by the Meta Pixel/CAPI (e.g., viewed product, initiated checkout)",
            "An audience that you manually type one-by-one into Excel",
            "A survey taken on the street",
            "A list of users who subscribed to your competitor"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-138",
          "type": "MCQ",
          "prompt": "What is the primary advantage of video engagement custom audiences (e.g., watched 75% of video)?",
          "options": [
            "They capture warm, high-intent first-party engagement directly on Meta's platform, completely immune to iOS cookie blocking",
            "They are completely free of charge",
            "They can be exported to CSV files",
            "They automatically increase organic follower counts"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-139",
          "type": "MCQ",
          "prompt": "What tool inside Meta Ads Manager allows advertisers to check the percentage of shared users between two target audiences?",
          "options": [
            "Audience Overlap Tool",
            "Campaign Planner",
            "Creative Hub",
            "Business Settings"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-140",
          "type": "MCQ",
          "prompt": "What is the minimum recommended size for a Custom Audience seed list before generating a Lookalike Audience?",
          "options": [
            "At least 1,000 high-quality matched records (ideally 1,000–5,000)",
            "10 records",
            "50 million records",
            "Exactly 1 record"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-015",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-015",
      "title": "Assessment: Performance Creative & Copywriting",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-141",
          "type": "MCQ",
          "prompt": "What is the '3-Second Hook Rate' metric in video advertising?",
          "options": [
            "The percentage of people who viewed at least 3 seconds of a video ad divided by total impressions (target > 30%)",
            "The time taken to close an ad",
            "The length of the music track",
            "The time taken for a landing page to load"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-142",
          "type": "MCQ",
          "prompt": "What does UGC stand for in performance creative strategy?",
          "options": [
            "User Generated Content: Authentic, native, creator-style vertical video featuring real customer demonstrations and testimonials",
            "Universal Graphic Compression",
            "Unified Google Code",
            "Unrestricted Growth Campaign"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-143",
          "type": "MCQ",
          "prompt": "What are the three components of the classic PAS direct-response copywriting formula?",
          "options": [
            "Problem, Agitate, Solve",
            "Pricing, Advertising, Sales",
            "People, Action, Success",
            "Picture, Audio, Sound"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-144",
          "type": "MCQ",
          "prompt": "Why does authentic, low-fidelity UGC frequently outperform expensive slick studio-produced commercial video on TikTok and Instagram Reels?",
          "options": [
            "UGC looks native to user social feeds and feels like organic peer content rather than an intrusive sales pitch, reducing immediate bounce behavior",
            "Because high-end studio video cannot be uploaded to Meta",
            "Because UGC uses fewer pixels",
            "Because studio video is banned on mobile"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-145",
          "type": "MCQ",
          "prompt": "What is a 'Pattern Interrupt' in creative ad strategy?",
          "options": [
            "An unexpected visual action, bizarre camera angle, or provocative opening statement in the first 2 seconds that stops the user's thumb from scrolling past",
            "A glitch in video encoding software",
            "A pause between song tracks",
            "A temporary internet outage"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-146",
          "type": "MCQ",
          "prompt": "What is the BAB copywriting framework?",
          "options": [
            "Before - After - Bridge: Highlighting current user pain (Before), showing the ideal future state (After), and presenting your product as the vehicle (Bridge)",
            "Brand - Audience - Budget",
            "Banner - Action - Button",
            "Buy - And - Buy"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-147",
          "type": "MCQ",
          "prompt": "What is the primary benefit of a Carousel Ad format?",
          "options": [
            "Allows users to swipe horizontally through multiple cards displaying distinct products, feature benefits, or sequential steps in a process",
            "It loops continuously without stopping",
            "It plays background music automatically",
            "It cannot be skipped by users"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-148",
          "type": "MCQ",
          "prompt": "What does 'Creative Fatigue' mean in paid social advertising?",
          "options": [
            "When target audiences have seen an ad creative so many times (high frequency) that CTR plummets and CPA increases significantly",
            "When video editors become tired after working 8 hours",
            "When graphic design software runs out of memory",
            "When ad accounts are paused for non-payment"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-149",
          "type": "MCQ",
          "prompt": "What aspect ratio is mandatory for full-screen immersive vertical video on Instagram Stories, Reels, and TikTok?",
          "options": [
            "9:16 vertical (1080x1920 pixels)",
            "16:9 horizontal (1920x1080 pixels)",
            "1:1 square",
            "4:3 standard"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-150",
          "type": "MCQ",
          "prompt": "In a creative testing matrix, why should advertisers test ONE variable at a time (e.g., testing 3 different hooks against 1 static body)?",
          "options": [
            "To isolate causality and definitively identify which specific element caused the conversion rate variance",
            "Because Meta only allows 1 ad per ad set",
            "To save money on cloud hosting",
            "Because video files cannot be edited"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-016",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-016",
      "title": "Assessment: B2B Marketing on LinkedIn Ads",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-151",
          "type": "MCQ",
          "prompt": "What is Account-Based Marketing (ABM) on LinkedIn?",
          "options": [
            "Targeting a curated, specific list of target company accounts and marketing directly to the key decision-makers inside those designated companies",
            "Managing an accounting firm on LinkedIn",
            "Opening multiple personal LinkedIn accounts",
            "Sending automated connection requests to random users"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-152",
          "type": "MCQ",
          "prompt": "What is the primary advantage of LinkedIn Native Lead Gen Forms compared to directing users to an external landing page?",
          "options": [
            "Forms open instantly inside the LinkedIn app and pre-populate verified user profile data (email, name, title, company), delivering 2x-3x higher conversion rates",
            "They are completely free to run without ad spend",
            "They do not require user consent",
            "They bypass corporate email security firewalls"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-153",
          "type": "MCQ",
          "prompt": "What is a LinkedIn 'Thought Leader Ad'?",
          "options": [
            "An ad format that promotes a personal post written by an executive, founder, or employee directly from their personal LinkedIn profile",
            "A text ad displayed on the login page",
            "An automated email sent by LinkedIn Recruiter",
            "A billboard ad outside the LinkedIn headquarters"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-154",
          "type": "MCQ",
          "prompt": "What tracking tag is installed on an advertiser's website to measure LinkedIn conversions, retarget visitors, and unlock demographic website analytics?",
          "options": [
            "LinkedIn Insight Tag",
            "Google Analytics Tag",
            "Meta Pixel",
            "TikTok Pixel"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-155",
          "type": "MCQ",
          "prompt": "Why are LinkedIn Ads CPMs (Cost-Per-Thousand-Impressions) significantly higher ($30-$80+) than Meta or TikTok ($5-$15)?",
          "options": [
            "LinkedIn possesses unmatched, self-reported, professional first-party career data allowing advertisers to reach high-income B2B enterprise decision-makers",
            "LinkedIn charges higher server maintenance fees",
            "LinkedIn ads are printed in corporate magazines",
            "LinkedIn only accepts payments in gold"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-156",
          "type": "MCQ",
          "prompt": "What type of offer is most effective when generating leads at the top/middle of a B2B LinkedIn marketing funnel?",
          "options": [
            "High-value proprietary whitepapers, technical architecture blueprints, industry benchmark reports, or live webinars",
            "A coupon for $5 off consumer electronics",
            "A request to buy enterprise software immediately on day 1",
            "A link to an employee holiday party photo gallery"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-157",
          "type": "MCQ",
          "prompt": "What targeting parameter on LinkedIn allows you to exclude junior entry-level staff or interns?",
          "options": [
            "Seniority targeting (excluding 'Entry' and 'Training', targeting 'Director', 'VP', 'CXO')",
            "Age targeting",
            "Salary targeting",
            "Zip code targeting"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-158",
          "type": "MCQ",
          "prompt": "What is a LinkedIn 'Document Ad'?",
          "options": [
            "An ad format allowing members to read and swipe through multi-page PDFs, slide decks, or whitepapers directly within their LinkedIn feed",
            "A contract signed via DocuSign",
            "A scanned copy of a company tax return",
            "A word processing document editor"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-159",
          "type": "MCQ",
          "prompt": "What CRM integration feature automatically routes leads submitted on LinkedIn Lead Gen Forms into Salesforce or HubSpot in real time?",
          "options": [
            "LinkedIn Lead Sync (via Webhooks or native CRM connectors)",
            "Exporting CSVs once a month",
            "Manual copy-pasting by sales reps",
            "Printing emails"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-160",
          "type": "MCQ",
          "prompt": "What demographic report in the LinkedIn Campaign Manager reveals the job titles, company names, and industries of users who clicked your ads?",
          "options": [
            "Demographics Report (Website & Campaign Demographics)",
            "Quality Score Report",
            "Auction Insights Report",
            "Search Terms Report"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-017",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-017",
      "title": "Assessment: Short-Form Video Marketing",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-161",
          "type": "MCQ",
          "prompt": "What is the central creative mantra promoted by TikTok for commercial performance advertisers?",
          "options": [
            "'Don't Make Ads, Make TikToks' (focusing on native, authentic, community-driven content rather than polished corporate commercials)",
            "'Always use classical symphony music'",
            "'Only show text without video'",
            "'Post 100 times every hour'"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-162",
          "type": "MCQ",
          "prompt": "What are TikTok 'Spark Ads'?",
          "options": [
            "A native ad format that allows brands to boost authentic organic creator videos from the creator's own handle using an authorization code",
            "Ads that create electrical sparks on screen",
            "Static banners placed in search results",
            "Automated text messages sent to followers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-163",
          "type": "MCQ",
          "prompt": "What are the three stages of the Hook-Story-Offer video framework?",
          "options": [
            "Hook (0-2s to stop scroll) -> Story (explain problem & unique solution) -> Offer (clear CTA with risk reversal)",
            "Header -> Footer -> Sidebar",
            "Intro -> Song -> Dance",
            "Title -> Subtitle -> Bibliography"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-164",
          "type": "MCQ",
          "prompt": "Why are kinetic captions/subtitles essential in vertical short-form video creative?",
          "options": [
            "They maintain visual engagement, increase message retention, and capture attention for users watching with sound temporarily muted",
            "They are required by international law",
            "They decrease video file sizes",
            "They translate text into binary code"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-165",
          "type": "MCQ",
          "prompt": "What is 'Creator Whitelisting' on social platforms?",
          "options": [
            "When an influencer grants a brand advertiser partner-level permissions to run dark paid ads through the influencer's social handle",
            "Banning a creator from posting",
            "Verifying a creator's blue checkmark",
            "Adding a creator to an email newsletter"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-166",
          "type": "MCQ",
          "prompt": "How often should visual camera angles or text graphics change in a viral short-form video to sustain high viewer retention?",
          "options": [
            "Every 2 to 3 seconds",
            "Every 2 minutes",
            "Once per video",
            "Never"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-167",
          "type": "MCQ",
          "prompt": "What is the recommended video length for high-converting direct-response TikTok ads?",
          "options": [
            "15 to 30 seconds",
            "10 to 15 minutes",
            "2 hours",
            "Under 1 second"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-168",
          "type": "MCQ",
          "prompt": "What tool inside TikTok Ads Manager provides insights into trending music audio, hashtags, and top-performing competitor creative?",
          "options": [
            "TikTok Creative Center",
            "Google Keyword Planner",
            "Meta Business Suite",
            "Adobe Premiere Pro"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-169",
          "type": "MCQ",
          "prompt": "What is an effective organic call-to-action (CTA) for short-form video on Instagram Reels?",
          "options": [
            "'Comment ARCHITECTURE below and I'll DM you the free blueprint link' (leveraging automated direct-message chatbots like ManyChat)",
            "'Call 1-800 on your landline'",
            "'Send a fax to our headquarters'",
            "'Type this 50-character URL into your browser'"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-170",
          "type": "MCQ",
          "prompt": "What platform enables advertisers to run short vertical video ads across YouTube mobile feeds?",
          "options": [
            "YouTube Shorts Ads (via Google Ads video campaigns)",
            "TikTok Ads Manager",
            "LinkedIn Campaign Manager",
            "Pinterest Promoted Pins"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-018",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-018",
      "title": "Assessment: Content Marketing & Editorial Operations",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-171",
          "type": "MCQ",
          "prompt": "What is the primary concept behind the '1-to-10' content repurposing model?",
          "options": [
            "Systematically taking a comprehensive core pillar asset (e.g., a 4,000-word research report) and slicing it into multiple channel-native derivative assets (articles, social carousels, videos, threads)",
            "Writing 10 words per minute",
            "Publishing 1 blog post every 10 years",
            "Hiring 10 freelance writers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-172",
          "type": "MCQ",
          "prompt": "What distinguishes true 'Thought Leadership' from commodity content?",
          "options": [
            "Thought leadership provides original perspectives, proprietary operational data, counter-intuitive insights, and real-world executive expertise rather than generic summaries",
            "Thought leadership uses larger font sizes",
            "Thought leadership is always written in Latin",
            "Thought leadership cannot be shared on social media"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-173",
          "type": "MCQ",
          "prompt": "What are the core components of an effective Content Brief for professional writers?",
          "options": [
            "Target persona, primary/secondary search intent keywords, competitive URLs to outperform, mandatory internal link targets, and required structural sub-topics",
            "Only the title and word count limit",
            "The writer's home address",
            "The company's bank routing number"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-174",
          "type": "MCQ",
          "prompt": "What is 'Evergreen Content'?",
          "options": [
            "Content that remains continuously relevant, valuable, and fresh to readers over an extended period of time without expiring",
            "Articles about forestry and gardening",
            "Content printed on recycled paper",
            "Holiday seasonal promotions deleted after Christmas"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-175",
          "type": "MCQ",
          "prompt": "What role does an Editorial Calendar fulfill in an enterprise marketing department?",
          "options": [
            "Schedules and tracks content production pipelines, assigned authors, publication dates, and multi-channel promotional distribution roadmaps",
            "Calculates employee annual leave days",
            "Sets alarm clocks for staff",
            "Tracks office birthdays"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-176",
          "type": "MCQ",
          "prompt": "Why should a content strategy incorporate 'Distribution-First' thinking before writing begins?",
          "options": [
            "Because even the highest-quality article will generate zero business impact without pre-validated promotional channels and distribution audience alignment",
            "Because publishing websites do not support distribution",
            "Because Google requires distribution plans for domain registration",
            "Because writing is the easiest part of marketing"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-177",
          "type": "MCQ",
          "prompt": "What is a 'Content Pillar' (Pillar Page)?",
          "options": [
            "A comprehensive authoritative master guide covering all core dimensions of a broad topic, linking out to and supported by detailed cluster spoke pages",
            "A physical column in a museum",
            "A single tweet with high likes",
            "A 404 error page"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-178",
          "type": "MCQ",
          "prompt": "How does original research and benchmark data reports accelerate content marketing performance?",
          "options": [
            "They serve as link magnets that journalists, bloggers, and industry peers naturally cite as primary sources, generating high-authority organic backlinks",
            "They cost zero dollars to execute",
            "They eliminate the need for an email newsletter",
            "They automatically guarantee 1 million Instagram followers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-179",
          "type": "MCQ",
          "prompt": "What metric evaluates whether content marketing is successfully converting readers into sales opportunities?",
          "options": [
            "Assisted Conversions, MQLs generated, and pipeline revenue attributed to content touchpoints",
            "Total word count published per month",
            "Number of commas used in blog posts",
            "The physical weight of printed collateral"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-180",
          "type": "MCQ",
          "prompt": "What is Content Auditing?",
          "options": [
            "Periodically cataloging and analyzing all existing published content to identify articles to update, consolidate, redirect, or prune to maintain high domain quality",
            "Filing financial tax returns for marketing software",
            "Proofreading a single social media post",
            "Deleting the website blog"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
};
