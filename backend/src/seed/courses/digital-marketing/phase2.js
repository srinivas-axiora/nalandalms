// Course 11: Digital Marketing - Phase 2 (Chapters 7-12, Assessments 7-12)
// Paid Search (SEM), Google Ads Mechanics, Campaign Structure, Responsive Search Ads, Smart Bidding, PMax & Programmatic

export const phase2 = {
  "chapters": [
    {
      "id": "CH-DMK-007",
      "courseId": "CRS-DMK-001",
      "sequence": 7,
      "title": "Paid Search (PPC) Mechanics & Auction Dynamics",
      "description": "Understand Google Ads auction theory: Ad Rank calculation formula, Quality Score components (Expected CTR, Ad Relevance, Landing Page Experience), second-price Vickrey auction, and Impression Share metrics.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Paid Search (PPC) Mechanics & Auction Dynamics\n\nGoogle Ads is built on a real-time generalized second-price Vickrey auction executed trillions of times per second whenever a user initiates a search query.\n\n---\n\n## 1. The Ad Rank Formula\n\nGoogle does not simply award the top ad position to the highest monetary bidder. Instead, ad placement and actual cost-per-click (CPC) are determined by **Ad Rank**:\n\n```\n+---------------------------------------------------------------------------------+\n|                             THE AD RANK FORMULA                                 |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  Ad Rank = Maximum CPC Bid  ×  Quality Score (1-10)  +  Ad Assets Impact         \n                                                                                   \n  - Maximum CPC: The highest price an advertiser is willing to pay per click.     \n  - Quality Score: 1-10 rating measuring ad relevance & user experience.          \n  - Ad Assets Impact: Expected lift from sitelinks, callouts, and structured info.\n```\n\n### How Ad Rank Dictates the Auction:\nConsider 3 advertisers competing for the keyword 'data engineering bootcamp':\n\n| Advertiser | Max CPC Bid | Quality Score | Calculated Ad Rank | Final Position | Actual CPC Paid |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **Advertiser A** | **$4.00** | **10 / 10** | **40** | **Position 1** | **$2.51** |\n| Advertiser B | $5.00 | 5 / 10 | 25 | Position 2 | $3.34 |\n| Advertiser C | $10.00 | 2 / 10 | 20 | Position 3 | $0.00 (Below reserve) |\n\n> [!IMPORTANT]\n> Advertiser A won Position 1 while paying **less than half** of what Advertiser B bid, solely due to having a superior Quality Score (10 vs 5)! High relevance directly reduces media costs.\n\n---\n\n## 2. Quality Score Anatomy\n\nQuality Score (1 to 10) is evaluated across three core sub-components in Google Ads:\n\n```\n+---------------------------------------------------------------------------------+\n|                         QUALITY SCORE SUB-COMPONENTS                            |\n+-------------------+-------------------------------------------------------------+\n| 1. EXPECTED CTR   | The likelihood that your ad will be clicked when shown,         |\n|                   | normalized for ad position and historical ad performance.       |\n+-------------------+-------------------------------------------------------------+\n| 2. AD RELEVANCE   | How closely the copy in your headlines and descriptions matches |\n|                   | the specific search query and intent of the user.               |\n+-------------------+-------------------------------------------------------------+\n| 3. LANDING PAGE   | How relevant, transparent, fast, and easy to navigate the       |\n| EXPERIENCE        | destination page is once a user clicks the ad.                  |\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 3. Generalized Second-Price Auction (Actual CPC Paid)\n\nIn a second-price auction, you do not pay your maximum bid. You pay the minimum price necessary to beat the Ad Rank of the competitor immediately below you:\n\n```\nActual CPC Paid = (Ad Rank of Competitor Below You / Your Quality Score) + $0.01\n```\n\n---\n\n## 4. Search Impression Share (IS)\n\nImpression Share measures how much of the total addressable search demand you are capturing:\n\n```\nImpression Share = (Actual Impressions Received / Total Estimated Eligible Impressions) * 100\n```\n\n- **Lost IS (Budget):** Percentage of times your ad did not show because your daily budget ran out early in the day.\n- **Lost IS (Rank):** Percentage of times your ad did not show due to poor Ad Rank (low Quality Score or low bids).\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Google Ads Auction & Quality Score' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-008",
      "courseId": "CRS-DMK-001",
      "sequence": 8,
      "title": "Google Ads Campaign Structure & Keyword Match Types",
      "description": "Master PPC account architecture: Account-Campaign-AdGroup hierarchy, Keyword Match Types (Broad, Phrase, Exact), Negative Keyword Lists, Single-Theme Ad Groups (STAGs), and budget management.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Google Ads Campaign Structure & Keyword Match Types\n\nA disciplined account structure guarantees that every user query triggers the most relevant ad copy and lands on the highest-converting destination page.\n\n---\n\n## 1. Google Ads Account Hierarchy\n\n```\n+---------------------------------------------------------------------------------+\n|                               GOOGLE ADS ACCOUNT                                |\n+---------------------------------------------------------------------------------+\n                                        |\n           +----------------------------+----------------------------+\n           |                                                         |\n           v                                                         v\n+-----------------------+                                 +-----------------------+\n| CAMPAIGN 1: BRAND     |                                 | CAMPAIGN 2: NON-BRAND |\n| - Daily Budget: $100  |                                 | - Daily Budget: $500  |\n| - Geo: United States  |                                 | - Geo: United States  |\n+-----------------------+                                 +-----------------------+\n           |                                                         |\n     +-----+-----+                                             +-----+-----+\n     v           v                                             v           v\n+---------+ +---------+                                   +---------+ +---------+\n| AdGroup | | AdGroup |                                   | AdGroup | | AdGroup |\n| Brand-Core Brand-Prod                                   | Spark   | | Kafka   |\n+---------+ +---------+                                   +---------+ +---------+\n| Keywords| | Keywords|                                   | Keywords| | Keywords|\n| Ads     | | Ads     |                                   | Ads     | | Ads     |\n+---------+ +---------+                                   +---------+ +---------+\n```\n\n---\n\n## 2. The 3 Modern Keyword Match Types\n\nGoogle consolidated keyword match types to balance keyword control with smart matching semantics:\n\n```\n+--------------------+--------------------+-------------------------------------------+\n| MATCH TYPE         | SYNTAX             | HOW IT MATCHES                            |\n+--------------------+--------------------+-------------------------------------------+\n| 1. EXACT MATCH     | [running shoes]    | Matches the exact meaning or close        |\n|                    |                    | variants with the same intent.            |\n|                    |                    | Matches: 'running shoe', 'shoes running'  |\n|                    |                    | Does NOT match: 'trail running shoes'     |\n+--------------------+--------------------+-------------------------------------------+\n| 2. PHRASE MATCH    | \"running shoes\"    | Matches when the search query contains the|\n|                    |                    | phrase's core meaning in compatible order |\n|                    |                    | Matches: 'best running shoes for men'     |\n|                    |                    | Does NOT match: 'shoes for running track' |\n+--------------------+--------------------+-------------------------------------------+\n| 3. BROAD MATCH     | running shoes      | Matches related concepts, synonyms, and   |\n|                    | (No punctuation)   | contextual themes using machine learning. |\n|                    |                    | Matches: 'comfortable sneakers for jogging'|\n+--------------------+--------------------+-------------------------------------------+\n```\n\n---\n\n## 3. Negative Keyword Lists: Eliminating Ad Spend Waste\n\nNegative keywords prevent your ads from triggering on irrelevant searches, preserving marketing budget for high-intent queries:\n\n```txt\n# Global Negative Keyword List: 'Job Seekers & Free Searchers'\nfree\ncrack\ntorrent\ninternship\njobs\nsalary\nresume\npdf download\nopen source\ndefinition of\nwhat is\n```\n\n### Single-Theme Ad Groups (STAGs):\nRather than cramming 50 loosely related keywords into one Ad Group, organize ad groups around **2–5 tightly related semantic keywords**. For example, one ad group dedicated exclusively to `[spark structured streaming]` and `\"spark structured streaming course\"`, paired with tailored ads showcasing streaming state management.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Google Ads Match Types & Structure' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-009",
      "courseId": "CRS-DMK-001",
      "sequence": 9,
      "title": "Responsive Search Ads (RSAs) & Ad Copy Optimization",
      "description": "Master search ad copy engineering: Responsive Search Ads (RSAs) mechanics, 15 headlines and 4 descriptions, Dynamic Keyword Insertion (DKI), pinning strategy, and ad assets (Sitelinks, Callouts, Structured Snippets).",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Responsive Search Ads (RSAs) & Ad Copy Optimization\n\nResponsive Search Ads (RSAs) are Google's default search ad format. Advertisers provide multiple headline and description assets, and Google's machine learning algorithm tests and predicts the highest-performing combinations for each specific user query.\n\n---\n\n## 1. Responsive Search Ad (RSA) Structure\n\nAdvertisers supply up to **15 Headlines** (30 characters max each) and up to **4 Descriptions** (90 characters max each):\n\n```\n+---------------------------------------------------------------------------------+\n|                              RSA COMPOSITION BLUEPRINT                          |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  HEADLINES 1-3 (Shown together, separated by pipe | ):                           \n  - Keyword Inclusion: 'Data Engineering Masterclass' (Exact query match)         \n  - Value Proposition: 'Master Spark, Kafka & Lakehouses'                         \n  - Call-to-Action (CTA): 'Enroll Today - 100% Online'                            \n                                                                                   \n  DESCRIPTIONS 1-2 (Shown beneath headlines):                                     \n  - Benefit-Driven: 'Advance your career with hands-on Apache Iceberg, Spark,    \n    and Airflow pipelines. Build production-grade data lakehouses.'               \n  - Trust & Social Proof: 'Over 10,000 alumni hired at top tech enterprises.     \n    Includes 320 real-world assessments and verified certification.'              \n```\n\n---\n\n## 2. Dynamic Keyword Insertion (DKI) & Pinning\n\n### Dynamic Keyword Insertion (DKI):\nDynamically replaces ad text with the exact keyword that triggered the ad:\n```txt\n{KeyWord:Data Engineering Course} | Nalanda LMS\n```\n- If a user searches for *'PySpark Certification'*, the headline displays: *'PySpark Certification | Nalanda LMS'*.\n- If the search term is too long (> 30 characters), the default fallback *'Data Engineering Course'* is shown.\n\n### Strategic Asset Pinning:\n- **Unpinned (Default):** Google freely mixes all 15 headlines. Maximizes machine learning combinations.\n- **Pin to Position 1:** Ensures specific compliance, brand names, or mandatory legal disclosures always appear in Headline 1.\n\n---\n\n## 3. High-Converting Ad Assets (Extensions)\n\nAd assets occupy valuable visual real estate on mobile and desktop SERPs, directly boosting Click-Through Rate (CTR) by 15–20%:\n\n| Ad Asset | Character Limit | Strategic Purpose | Example |\n| :--- | :--- | :--- | :--- |\n| **Sitelinks** | 25 char title, 2x 35 char desc | Deep-links to specific sub-pages. | 'Course Curriculum', 'Student Reviews', 'Enterprise Pricing', 'FAQ' |\n| **Callouts** | 25 characters | Non-clickable value bullets. | 'Zero Fluff', 'Self-Paced', 'Verified Certificate', 'Hands-On Labs' |\n| **Structured Snippets** | 25 char per value | Catalogs specific categories. | 'Courses: Spark, Kafka, Airflow, dbt, Snowflake, BigQuery' |\n| **Call Assets** | Phone number | Direct mobile click-to-call. | '+1 (800) 555-0199' |\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Responsive Search Ads Copywriting' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-010",
      "courseId": "CRS-DMK-001",
      "sequence": 10,
      "title": "Smart Bidding Strategies & Machine Learning in PPC",
      "description": "Master automated bidding algorithms in Google Ads: Manual CPC vs Smart Bidding (Target CPA, Target ROAS, Maximize Conversions, Maximize Conversion Value), auction-time bidding signals, and Value-Based Bidding.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Smart Bidding Strategies & Machine Learning in PPC\n\nGoogle Ads Smart Bidding leverages machine learning to evaluate millions of auction-time contextual signals to optimize bids for every individual search query.\n\n---\n\n## 1. Smart Bidding Strategies Compared\n\n```\n+---------------------------------------------------------------------------------+\n|                       GOOGLE ADS BIDDING TAXONOMY                               |\n+-------------------+-------------------------------------------------------------+\n| 1. MAXIMIZE       | Spend entire daily budget to capture the maximum volume of      |\n| CONVERSIONS       | conversions, regardless of cost per acquisition.                |\n|                   | Best For: Launching new campaigns, finding initial volume.      |\n+-------------------+-------------------------------------------------------------+\n| 2. TARGET CPA     | Automatically adjusts bids to acquire as many conversions as    |\n| (tCPA)            | possible at or below your target Cost-Per-Acquisition (e.g. $50)|\n|                   | Best For: Lead generation, fixed customer acquisition limits.   |\n+-------------------+-------------------------------------------------------------+\n| 3. TARGET ROAS    | Optimizes bids to hit a specified Return-on-Ad-Spend target     |\n| (tROAS)           | (e.g., 400% ROAS = $4 revenue per $1 spent).                    |\n|                   | Best For: E-commerce with variable cart checkout values.        |\n+-------------------+-------------------------------------------------------------+\n| 4. VALUE-BASED    | Bids higher on high-LTV customer personas and lower on one-time |\n| BIDDING (VBB)     | discount buyers using offline conversion tracking (OCT) data.   |\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. Auction-Time Signals (Machine Learning Advantage)\n\nUnlike human manual bid adjustments which can only evaluate a few dimensions at a time, Smart Bidding evaluates dozens of real-time signals simultaneously in the millisecond before an ad is rendered:\n\n- **Device & Operating System:** (e.g., iOS vs Android vs Windows 11 desktop).\n- **Physical Location & Location Intent:** Down to hyper-local postal codes.\n- **Time of Day & Day of Week:** Adjusts for diurnal purchasing peaks.\n- **User Browsing History & Intent Signals:** Past search queries and visits to related domains.\n- **Browser & Language:** Language settings matching target demographics.\n\n---\n\n## 3. The 2-Week Learning Phase & Data Thresholds\n\n> [!WARNING]\n> When switching a campaign to Smart Bidding (tCPA or tROAS), Google Ads enters a **Learning Phase** lasting 7 to 14 days. During this period, the machine learning model explores bid boundaries. **Do not modify budgets or targets by more than 15-20% at a time**, as drastic edits reset the learning algorithm!\n\n### Minimum Recommended Data Density:\n- **Target CPA:** Requires at least **30 conversions in the past 30 days** for algorithm stability.\n- **Target ROAS:** Requires at least **50 conversions with revenue values in the past 30 days**.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Smart Bidding Strategies Explained' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-011",
      "courseId": "CRS-DMK-001",
      "sequence": 11,
      "title": "Google Performance Max (PMax) & Shopping Campaigns",
      "description": "Master modern multi-channel automation: Performance Max (PMax) campaigns, Asset Groups, Audience Signals, Google Merchant Center product feed optimization, and Standard Shopping vs PMax trade-offs.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Google Performance Max (PMax) & Shopping Campaigns\n\nPerformance Max (PMax) is an automated, goal-based campaign type that allows performance advertisers to access all of Google's advertising inventory from a single campaign.\n\n---\n\n## 1. PMax Cross-Channel Inventory\n\n```\n+---------------------------------------------------------------------------------+\n|                    GOOGLE PERFORMANCE MAX (PMax) INVENTORY                      |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  [ Google Search ]      [ Google Shopping ]     [ YouTube In-Stream & Shorts ]    \n          |                       |                            |                   \n          +-----------------------+----------------------------+                   \n                                  |                                                \n                                  v                                                \n  [ Google Display Network ]   [ Gmail Promotions ]   [ Google Discover Feed ]     \n          |                       |                            |                   \n          +-----------------------+----------------------------+                   \n                                  |                                                \n                                  v                                                \n                 [ SINGLE AUTOMATED PERFORMANCE CAMPAIGN ]                         \n```\n\n---\n\n## 2. Asset Groups & Audience Signals\n\nRather than managing separate ads, PMax utilizes **Asset Groups** containing modular marketing collateral:\n- **Text Assets:** Up to 5 short headlines (30 char), 5 long headlines (90 char), 5 descriptions (90 char).\n- **Visual Assets:** Landscape (1.91:1), square (1:1), and vertical (4:5) high-resolution marketing banners.\n- **Video Assets:** High-quality horizontal and vertical YouTube video clips (10 to 30 seconds).\n\n### Audience Signals (Guiding the Machine Learning Model):\nAudience signals give PMax an initial 'starting compass' to accelerate learning:\n1. **Customer Match:** Uploaded first-party email lists of high-value lifetime customers.\n2. **Custom Intent Audiences:** Users who searched for competitor domain names and top industry keywords.\n3. **Website Visitors (Retargeting):** Pixel audience lists of cart abandoners and past purchasers.\n\n---\n\n## 3. Google Merchant Center & Product Feed Optimization\n\nFor e-commerce retail, PMax is powered by the **Google Merchant Center (GMC)** product feed:\n- `title`: Front-load brand, color, size, and primary keyword (e.g., `Nike Air Zoom Pegasus 40 - Men's Running Shoes - Black/White - Size 10.5`).\n- `google_product_category`: Map to the most specific taxonomy branch.\n- `custom_label_0` to `4`: Used to segment products by profit margin (e.g., `High-Margin`, `Clearance`, `Best-Sellers`) to set aggressive ROAS targets on profitable items.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Performance Max & Shopping Campaigns' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-012",
      "courseId": "CRS-DMK-001",
      "sequence": 12,
      "title": "Programmatic Display Advertising & Retargeting",
      "description": "Master enterprise programmatic advertising: Demand-Side Platforms (DSPs), Supply-Side Platforms (SSPs), Ad Exchanges, Real-Time Bidding (RTB), dynamic retargeting, and frequency capping.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Programmatic Display Advertising & Retargeting\n\nProgrammatic advertising is the automated buying and selling of digital ad inventory in real-time through algorithmic auctions across millions of publishers globally.\n\n---\n\n## 1. The Programmatic Advertising Ecosystem\n\n```\n+---------------------------------------------------------------------------------+\n|                       PROGRAMMATIC RTB ECOSYSTEM WORKFLOW                       |\n+---------------------------------------------------------------------------------+\n                                                                                   \n  [ USER VISITS NYTIMES.COM ]                                                      \n              |                                                                    \n              v                                                                    \n  [ SUPPLY-SIDE PLATFORM (SSP): Magnite / Google Ad Manager ]                      \n  (Sends bid request containing user cookie, IP, location, ad slot size: 300x250)  \n              |                                                                    \n              v                                                                    \n  [ AD EXCHANGE: OpenX / Google AdX / PubMatic ]                                   \n  (Broadcasts bid request to participating Demand-Side Platforms in < 50ms)        \n              |                                                                    \n              v                                                                    \n  [ DEMAND-SIDE PLATFORMS (DSPs): The Trade Desk / DV360 ]                         \n  (Analyzes audience data, determines bid valuation, and returns winning bid)      \n              |                                                                    \n              v                                                                    \n  [ WINNING AD BANNER RENDERED ON USER SCREEN (< 100ms total latency) ]            \n```\n\n---\n\n## 2. Retargeting Mechanics & Dynamic Product Ads\n\n- **Pixel-Based Retargeting:** A tracking snippet captures user activity on your website (e.g., viewed product 'Aura Headphones' but did not purchase).\n- **Dynamic Creative Optimization (DCO):** The DSP serves a customized ad showing the exact SKU, price, and image the user previously inspected on your store.\n- **Frequency Capping:** Limiting the number of times an individual user sees your display ad per day (e.g., maximum **3 to 5 impressions per 24 hours**) to prevent brand fatigue and ad spend waste.\n\n---\n\n## 3. Brand Safety, Ad Fraud & Viewability\n\n- **Viewability Standard (IAB/MRC):** An ad impression is officially 'viewable' if at least **50% of the ad's pixels** are visible in the browser viewport for at least **1 continuous second** (2 seconds for video).\n- **Brand Safety (Moat / IAS):** Excluding ad placements next to hate speech, political extremism, or illicit content.\n- **Click Fraud Prevention:** Blocking bot networks and non-human traffic farms.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Programmatic Advertising & RTB' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-DMK-007",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-007",
      "title": "Assessment: Paid Search Mechanics & Auction Dynamics",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-061",
          "type": "MCQ",
          "prompt": "What is the core formula used by Google Ads to determine Ad Rank in search auctions?",
          "options": [
            "Ad Rank = Maximum CPC Bid × Quality Score + Ad Assets Impact",
            "Ad Rank = Total Monthly Budget / Total Clicks",
            "Ad Rank = Website Word Count × PageSpeed Score",
            "Ad Rank = Number of Backlinks × Domain Authority"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-062",
          "type": "MCQ",
          "prompt": "What are the three core sub-components that determine Google's Quality Score (1-10)?",
          "options": [
            "Expected CTR, Ad Relevance, and Landing Page Experience",
            "Ad Spend, Account Age, and Credit Card Limit",
            "Font Size, Background Color, and Image Dimensions",
            "Number of Negative Keywords, Sitelinks, and Phone Number"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-063",
          "type": "MCQ",
          "prompt": "In Google's generalized second-price auction, how is the actual Cost-Per-Click (CPC) paid by the winning advertiser calculated?",
          "options": [
            "The minimum amount necessary to beat the Ad Rank of the competitor immediately below you: (Competitor Ad Rank / Your Quality Score) + $0.01",
            "You always pay your exact maximum bid",
            "The average bid of all participants in the auction",
            "A flat $1.00 fee per click"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-064",
          "type": "MCQ",
          "prompt": "How can an advertiser with a lower bid beat a competitor with a higher bid to take Position 1 on Google Search?",
          "options": [
            "By achieving a significantly higher Quality Score through exceptional ad relevance, CTR, and landing page experience",
            "By calling Google customer support",
            "By filing a legal copyright complaint",
            "By changing their company logo"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-065",
          "type": "MCQ",
          "prompt": "What does 'Search Lost IS (Budget)' indicate in a Google Ads performance report?",
          "options": [
            "The percentage of eligible search impressions missed because the campaign exhausted its allocated daily budget",
            "The budget stolen by hackers",
            "The money refunded by Google",
            "The fee charged for credit card processing"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-066",
          "type": "MCQ",
          "prompt": "What does 'Search Lost IS (Rank)' mean?",
          "options": [
            "The percentage of impressions lost due to low Ad Rank (insufficient bids or poor Quality Score)",
            "The rank of your SEO organic listing",
            "The rank of your YouTube video",
            "The number of competitors bidding on your brand"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-067",
          "type": "MCQ",
          "prompt": "What is Impression Share (IS)?",
          "options": [
            "The ratio of actual impressions your ad received divided by the estimated total number of impressions your ad was eligible to receive",
            "The number of times your ad was shared on Facebook",
            "The impression count divided by clicks",
            "The percentage of people who liked your ad"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-068",
          "type": "MCQ",
          "prompt": "Why does improving a keyword's Quality Score from 5 to 10 directly increase campaign profitability?",
          "options": [
            "It lowers the actual CPC paid per click while unlocking higher ad positions, reducing customer acquisition costs",
            "It eliminates all taxes on ad spend",
            "It doubles the character limit of headlines",
            "It guarantees that competitor ads are banned"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-069",
          "type": "MCQ",
          "prompt": "What is an auction 'reserve price' in Google Ads?",
          "options": [
            "The minimum threshold Ad Rank required for an ad to be eligible to show at all in search results",
            "The fee to reserve a keyword for next year",
            "A security deposit held in escrow by Google",
            "The cost to register a new domain"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-070",
          "type": "MCQ",
          "prompt": "What metric evaluates the percentage of clicks that resulted in a completed purchase or lead generation form submit?",
          "options": [
            "Conversion Rate (CVR)",
            "Click-Through Rate (CTR)",
            "Cost Per Mile (CPM)",
            "Impression Share (IS)"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-008",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-008",
      "title": "Assessment: Campaign Structure & Match Types",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-071",
          "type": "MCQ",
          "prompt": "Which keyword match type syntax represents Exact Match in Google Ads?",
          "options": [
            "[running shoes]",
            "\"running shoes\"",
            "+running +shoes",
            "running shoes"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-072",
          "type": "MCQ",
          "prompt": "Which search query would trigger a Phrase Match keyword defined as \"cloud computing course\"?",
          "options": [
            "best cloud computing course online for beginners",
            "free online classes for coding",
            "cloud storage hard drive repair",
            "what is computing"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-073",
          "type": "MCQ",
          "prompt": "What is the primary function of a Negative Keyword List?",
          "options": [
            "To prevent your ads from triggering on irrelevant, low-intent, or wasted search terms (e.g., 'free', 'jobs', 'salary')",
            "To decrease your competitors' Ad Rank",
            "To remove negative reviews from Google Maps",
            "To cancel subscription billing"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-074",
          "type": "MCQ",
          "prompt": "What is a Single-Theme Ad Group (STAG)?",
          "options": [
            "An ad group organized around 2–5 tightly related semantic keywords paired with hyper-relevant tailored ad copy and landing page routing",
            "An ad group containing 500 random keywords",
            "An ad group that only runs on Saturdays",
            "An ad group with no ad copy"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-075",
          "type": "MCQ",
          "prompt": "Why should Brand campaigns (bidding on your own company name) be separated into a dedicated campaign isolated from Non-Brand campaigns?",
          "options": [
            "Brand queries have near-100% Quality Scores and ultra-low CPCs; mixing them with non-brand distorts budget allocation and performance metrics",
            "Google bans mixing brand and non-brand keywords in the same account",
            "Brand campaigns cannot use conversion tracking",
            "Non-brand campaigns do not support negative keywords"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-076",
          "type": "MCQ",
          "prompt": "How does Broad Match operate in modern Google Ads?",
          "options": [
            "It uses machine learning to match search queries related to the conceptual intent of the keyword, including synonyms and related topics",
            "It requires the user to type the exact characters without spaces",
            "It only matches words in alphabetical order",
            "It only shows ads to past website visitors"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-077",
          "type": "MCQ",
          "prompt": "At what level in the Google Ads account hierarchy is the daily budget configured?",
          "options": [
            "Campaign level",
            "Ad Group level",
            "Keyword level",
            "Ad level"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-078",
          "type": "MCQ",
          "prompt": "What Google Ads report shows the actual search queries typed by real users before clicking your ads?",
          "options": [
            "Search Terms Report",
            "Keyword Planner",
            "Auction Insights",
            "Quality Score Diagnostic Report"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-079",
          "type": "MCQ",
          "prompt": "What happens if a user's search query contains words in a different order from an Exact Match keyword, but shares the identical search intent?",
          "options": [
            "Google's close variant matching will still trigger the Exact Match keyword",
            "The ad is blocked immediately",
            "The advertiser is fined $10",
            "The bid is automatically doubled"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-080",
          "type": "MCQ",
          "prompt": "What is the recommended best practice when finding high-performing search terms in the Search Terms Report?",
          "options": [
            "Add them as explicit keywords with targeted ad copy, and add poor-performing queries as negative keywords",
            "Delete the campaign and start over",
            "Pause all ad assets",
            "Decrease the daily budget to zero"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-009",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-009",
      "title": "Assessment: Responsive Search Ads & Ad Copy",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-081",
          "type": "MCQ",
          "prompt": "What is the maximum number of headlines and descriptions an advertiser can provide in a single Responsive Search Ad (RSA)?",
          "options": [
            "Up to 15 Headlines (30 char max) and up to 4 Descriptions (90 char max)",
            "3 Headlines and 1 Description",
            "50 Headlines and 20 Descriptions",
            "Unlimited headlines"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-082",
          "type": "MCQ",
          "prompt": "What does Dynamic Keyword Insertion (DKI) do in search ad headlines?",
          "options": [
            "Dynamically replaces a placeholder with the user's triggering search term to make the ad hyper-relevant to the exact search query",
            "Translates the headline into 10 languages",
            "Inserts the user's credit card number",
            "Generates a random discount code"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-083",
          "type": "MCQ",
          "prompt": "What is the purpose of 'Pinning' a headline in an RSA?",
          "options": [
            "Forces a specific headline to always appear in Position 1, 2, or 3, overriding Google's dynamic rotational optimization (useful for compliance or mandatory branding)",
            "Pins the ad to the top of Google Maps",
            "Saves the ad to the user's browser bookmarks",
            "Prevents competitors from viewing the ad"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-084",
          "type": "MCQ",
          "prompt": "What are Sitelink Assets (Extensions)?",
          "options": [
            "Additional clickable links shown below the main search ad directing users to specific high-value sub-pages on your website",
            "Links to external competitor websites",
            "Hyperlinks to social media comment sections",
            "Internal anchor tags inside the ad headline"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-085",
          "type": "MCQ",
          "prompt": "What is the difference between Sitelink Assets and Callout Assets in Google Ads?",
          "options": [
            "Sitelinks are clickable links pointing to distinct landing pages; Callouts are non-clickable short bullet points highlighting unique selling propositions",
            "Sitelinks cost $5 per click; Callouts are free",
            "Callouts only show on desktop; Sitelinks only show on mobile",
            "There is no difference"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-086",
          "type": "MCQ",
          "prompt": "What does 'Ad Strength' evaluate in the Google Ads RSA editor?",
          "options": [
            "A real-time diagnostic rating (Poor to Excellent) measuring headline diversity, keyword inclusion, and asset volume completeness",
            "The physical network bandwidth of the ad server",
            "The financial credit score of the advertiser",
            "The font weight of the rendered text"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-087",
          "type": "MCQ",
          "prompt": "In DKI syntax: '{KeyWord:Data Engineering Course}', what is 'Data Engineering Course'?",
          "options": [
            "The fallback default text displayed if the user's search query exceeds the 30-character headline limit",
            "The keyword that Google deletes",
            "The name of the marketing manager",
            "The password to unlock the ad"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-088",
          "type": "MCQ",
          "prompt": "Why should all 15 headlines in an RSA not repeat the identical phrase (e.g., repeating 'Buy Shoes' 15 times)?",
          "options": [
            "Redundant headlines limit machine learning combination testing, leading to 'Poor' Ad Strength and lower auction competitiveness",
            "Google bans accounts that repeat phrases",
            "It increases the cost per click by 500%",
            "It turns off sitelinks"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-089",
          "type": "MCQ",
          "prompt": "What type of ad asset displays a cataloged list of offerings under pre-defined headers like 'Courses', 'Brands', or 'Models'?",
          "options": [
            "Structured Snippets",
            "Callout Extensions",
            "Location Assets",
            "Price Assets"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-090",
          "type": "MCQ",
          "prompt": "How much lift in Click-Through Rate (CTR) do well-structured ad assets typically provide on search results?",
          "options": [
            "15% to 20% on average",
            "0%",
            "1000%",
            "Less than 0.1%"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-010",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-010",
      "title": "Assessment: Smart Bidding & Machine Learning",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-091",
          "type": "MCQ",
          "prompt": "What does the Target CPA (Cost-Per-Acquisition) Smart Bidding strategy optimize for?",
          "options": [
            "Maximizing conversions while keeping average acquisition costs at or below the advertiser's designated dollar threshold",
            "Minimizing total website page views",
            "Getting the highest number of impressions on YouTube",
            "Spending the entire monthly budget in 1 hour"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-092",
          "type": "MCQ",
          "prompt": "When is Target ROAS (Return on Ad Spend) the ideal Smart Bidding strategy?",
          "options": [
            "For e-commerce retail with variable cart order values where the business objective is to maximize gross revenue relative to ad spend",
            "When launching a brand new website with zero historical conversion data",
            "When bidding exclusively on company brand names",
            "When running non-profit donation awareness campaigns"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-093",
          "type": "MCQ",
          "prompt": "What is 'Auction-Time Bidding' in Google Ads?",
          "options": [
            "Machine learning algorithms adjusting bids dynamically for every individual search query at the exact millisecond of the auction based on contextual signals",
            "A manual bid change made by an analyst at 9:00 AM",
            "A scheduled weekly cron script",
            "A fixed bid that never changes"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-094",
          "type": "MCQ",
          "prompt": "What happens during the initial 7–14 day 'Learning Phase' after switching a campaign to Smart Bidding?",
          "options": [
            "The algorithmic model actively tests bid boundaries to collect performance data; performance may fluctuate and major budget changes should be avoided",
            "Google pauses all ad delivery",
            "Ads are only shown on Google Maps",
            "All conversion tracking is turned off"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-095",
          "type": "MCQ",
          "prompt": "What minimum conversion volume in the past 30 days is widely recommended before transitioning a campaign to Target ROAS?",
          "options": [
            "At least 50 conversions with accurate revenue values",
            "1 conversion",
            "10,000 conversions",
            "Zero conversions"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-096",
          "type": "MCQ",
          "prompt": "What is Value-Based Bidding (VBB)?",
          "options": [
            "An advanced bidding strategy that prioritizes acquiring customers who yield the highest lifetime customer value rather than treating all conversion leads equally",
            "Bidding on low-cost discount keywords",
            "Bidding based on stock market prices",
            "Bidding on wholesale bulk inventory"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-097",
          "type": "MCQ",
          "prompt": "Why is making drastic budget changes (> 20%) discouraged on campaigns running Smart Bidding?",
          "options": [
            "It disrupts algorithmic bidding equilibrium and triggers a fresh Learning Phase, causing volatile performance swings",
            "Google cancels the advertiser's account",
            "It invalidates the credit card on file",
            "It deletes past conversion history"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-098",
          "type": "MCQ",
          "prompt": "What contextual signals are evaluated by Google's auction-time bidding models?",
          "options": [
            "Device type, operating system, physical location, time of day, language, browser, and previous search queries",
            "User bank account balance and credit score",
            "The weather inside the Google data center",
            "The advertiser's office WiFi speed"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-099",
          "type": "MCQ",
          "prompt": "What bidding strategy should typically be selected when launching a brand-new campaign with zero conversion data history?",
          "options": [
            "Maximize Clicks or Maximize Conversions with a modest budget cap to gather initial conversion signals",
            "Target ROAS set at 1000%",
            "Target CPA set at $1.00",
            "Manual CPM bidding"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-100",
          "type": "MCQ",
          "prompt": "What is Offline Conversion Tracking (OCT) used for in advanced lead generation PPC?",
          "options": [
            "Importing CRM milestones (e.g., Closed-Won sales deal) back into Google Ads via GCLID to optimize Smart Bidding toward actual revenue",
            "Tracking in-store cash purchases without internet",
            "Measuring billboard views on highways",
            "Tracking print newspaper coupon clippings"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-011",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-011",
      "title": "Assessment: Performance Max & Shopping Campaigns",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-101",
          "type": "MCQ",
          "prompt": "Across what Google advertising channels does Performance Max (PMax) deploy ads automatically?",
          "options": [
            "Search, Shopping, YouTube, Display, Gmail, Maps, and Google Discover",
            "Search only",
            "Display only",
            "YouTube only"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-102",
          "type": "MCQ",
          "prompt": "What are 'Audience Signals' in a Performance Max campaign?",
          "options": [
            "Data inputs (e.g., customer email lists, custom search intent segments, website visitors) that guide Google's algorithms toward high-converting user profiles faster",
            "Radio broadcast signals sent to mobile phones",
            "Audio alerts played when an ad is clicked",
            "Pop-up warnings shown to users"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-103",
          "type": "MCQ",
          "prompt": "What tool is mandatory for syncing e-commerce product catalog inventory into Google Shopping and Performance Max campaigns?",
          "options": [
            "Google Merchant Center (GMC)",
            "Google Tag Manager",
            "Google Analytics 4",
            "Google Search Console"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-104",
          "type": "MCQ",
          "prompt": "What is an 'Asset Group' in a Performance Max campaign?",
          "options": [
            "A bundle of creative assets (headlines, descriptions, images, logos, and videos) assembled dynamically to form ads across formats",
            "A folder of PDF invoices",
            "A collection of bank accounts",
            "A list of blocked IP addresses"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-105",
          "type": "MCQ",
          "prompt": "How can e-commerce retailers optimize product titles in their Google Merchant Center feed for maximum Shopping visibility?",
          "options": [
            "Front-load critical attributes: Brand Name + Gender + Product Category + Model/Color + Size (e.g., 'Nike Men's Pegasus 40 Running Shoes Black 10.5')",
            "Keep titles as short as one word (e.g., 'Shoes')",
            "Write titles in all capital letters",
            "Include random numbers in the title"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-106",
          "type": "MCQ",
          "prompt": "What are 'Custom Labels' (0 through 4) used for in Google Merchant Center product feeds?",
          "options": [
            "Tagging products by business criteria (e.g., profit margin, seasonality, clearance, best-seller) to segment campaigns and set differentiated ROAS targets",
            "Adding barcode stickers to shipping boxes",
            "Translating product names into French",
            "Changing the font color on product pages"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-107",
          "type": "MCQ",
          "prompt": "What feature in PMax allows advertisers to prevent ads from showing on their own exact brand name searches?",
          "options": [
            "Brand Exclusions List applied at the campaign level",
            "Deleting the brand website",
            "Turning off Google Search Console",
            "Setting the bid to $0.00"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-108",
          "type": "MCQ",
          "prompt": "What happens if an advertiser does not upload video assets to a Performance Max asset group?",
          "options": [
            "Google automatically generates low-quality animated auto-videos using uploaded static images and text, which can degrade brand perception",
            "PMax campaigns cannot be launched",
            "Google charges a $50 penalty",
            "Ads are only shown on text search"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-109",
          "type": "MCQ",
          "prompt": "What is the primary trade-off between Standard Shopping and Performance Max campaigns?",
          "options": [
            "Standard Shopping provides granular control over search queries and negative keywords; PMax offers full-funnel multi-channel scale with less query-level transparency",
            "Standard Shopping is free while PMax costs money",
            "PMax does not show product images",
            "Standard Shopping runs only on YouTube"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-110",
          "type": "MCQ",
          "prompt": "What is Customer Match in Google Ads audience targeting?",
          "options": [
            "Uploading hashed first-party customer email and phone lists to target or guide Smart Bidding toward high-value existing customer cohorts",
            "A dating service for marketers",
            "Matching employees to customers",
            "An automated customer support chatbot"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-012",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-012",
      "title": "Assessment: Programmatic Display & Retargeting",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-111",
          "type": "MCQ",
          "prompt": "What is a Demand-Side Platform (DSP) in programmatic advertising?",
          "options": [
            "A software platform that allows advertisers and media agencies to bid on and purchase digital ad inventory across multiple ad exchanges automatically",
            "A server that hosts client website files",
            "A tool for managing inventory in a retail warehouse",
            "A customer relationship management database"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-112",
          "type": "MCQ",
          "prompt": "What is a Supply-Side Platform (SSP)?",
          "options": [
            "A software platform used by publishers to manage, sell, and optimize their available ad space inventory in real-time auctions",
            "A supplier directory for manufacturing hardware",
            "A logistics trucking management system",
            "An e-commerce checkout gateway"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-113",
          "type": "MCQ",
          "prompt": "What does RTB stand for in programmatic media buying?",
          "options": [
            "Real-Time Bidding",
            "Return to Business",
            "Rate Time Bandwidth",
            "Responsive Tracking Buffer"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-114",
          "type": "MCQ",
          "prompt": "What is 'Frequency Capping' in display advertising?",
          "options": [
            "Restricting the maximum number of times an individual user is served your ad within a given timeframe (e.g., max 3 times per 24 hours)",
            "Capping the CPU frequency of ad servers",
            "Limiting the number of keywords in an account",
            "Capping the maximum number of website visitors per day"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-115",
          "type": "MCQ",
          "prompt": "Under the IAB/MRC industry standard, what constitutes a 'Viewable' display ad impression?",
          "options": [
            "At least 50% of the ad's pixels must be visible in the user's browser viewport for at least 1 continuous second (2 seconds for video)",
            "The user must click the ad",
            "The ad must load in under 10 milliseconds",
            "The user must purchase the product"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-116",
          "type": "MCQ",
          "prompt": "What is Dynamic Creative Optimization (DCO)?",
          "options": [
            "Display ad technology that dynamically generates personalized ad creative in real time showing the exact products a user previously viewed on your site",
            "Compressing image files automatically using Photoshop",
            "Translating ads into Spanish",
            "Randomly changing ad colors every second"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-117",
          "type": "MCQ",
          "prompt": "What is 'Ad Fraud' in the digital display ecosystem?",
          "options": [
            "Deliberate malicious generation of fake impressions and clicks via automated bots, click farms, or hidden pixel stuffing to steal advertiser budget",
            "Writing hyperbolic headlines",
            "Offering a 50% discount",
            "Running ads on YouTube"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-118",
          "type": "MCQ",
          "prompt": "What does 'Brand Safety' mean in programmatic media buying?",
          "options": [
            "Ensuring that company ads do not appear alongside harmful, offensive, illegal, or politically polarizing publisher content",
            "Trademarking the company logo",
            "Installing anti-virus software on company laptops",
            "Purchasing insurance against brand lawsuits"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-119",
          "type": "MCQ",
          "prompt": "What standard ad banner dimensions are recognized as the highest-volume display inventory sizes on the web?",
          "options": [
            "300x250 (Medium Rectangle), 728x90 (Leaderboard), and 336x280 (Large Rectangle)",
            "10x10 and 20x20",
            "1920x1080 only",
            "50x50 icon squares"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-120",
          "type": "MCQ",
          "prompt": "What is the typical timeframe required for a complete Real-Time Bidding (RTB) auction to execute from bid request to ad render?",
          "options": [
            "Less than 100 milliseconds",
            "5 to 10 minutes",
            "24 hours",
            "1 week"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
};
