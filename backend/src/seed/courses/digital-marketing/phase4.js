// Course 11: Digital Marketing - Phase 4 (Chapters 19-24, Assessments 19-24)
// Email Infrastructure, Lifecycle Drips, Retention & SMS, Landing Page Architecture, CRO Statistics & User Research

export const phase4 = {
  "chapters": [
    {
      "id": "CH-DMK-019",
      "courseId": "CRS-DMK-001",
      "sequence": 19,
      "title": "Email Marketing Infrastructure & Deliverability",
      "description": "Master email technical infrastructure: SMTP servers, DNS authentication protocols (SPF, DKIM, DMARC, BIMI), Sender Reputation (Spamhaus, Google Postmaster), IP warming, and spam filter mitigation.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Email Marketing Infrastructure & Deliverability\n\nEmail marketing generates an average **$36 to $42 ROI for every $1 spent**, making it the highest-margin owned marketing channel in existence. However, revenue depends entirely on landing in the primary inbox rather than the spam folder.\n\n---\n\n## 1. The Core Email Authentication Protocols\n\nMajor inbox providers (Google, Yahoo, Apple Mail) enforce strict DNS authentication standards to prevent spoofing and phishing:\n\n```\n+---------------------------------------------------------------------------------+\n|                         DNS EMAIL AUTHENTICATION STACK                          |\n+-------------------+-------------------------------------------------------------+\n| 1. SPF            | Sender Policy Framework: A DNS TXT record listing all IP        |\n|                   | addresses authorized to send emails on behalf of your domain.   |\n|                   | Example: 'v=spf1 include:sendgrid.net include:klaviyo.com ~all' |\n+-------------------+-------------------------------------------------------------+\n| 2. DKIM           | DomainKeys Identified Mail: A cryptographic public-private key  |\n|                   | pair that digitally signs outgoing headers to verify message    |\n|                   | integrity and prove the email was not altered in transit.       |\n+-------------------+-------------------------------------------------------------+\n| 3. DMARC          | Domain-based Message Authentication: Specifies how receiving    |\n|                   | mail servers should handle emails that fail SPF or DKIM.        |\n|                   | Policies: 'p=none' (monitor), 'p=quarantine' (spam),            |\n|                   | 'p=reject' (block permanently).                                 |\n+-------------------+-------------------------------------------------------------+\n| 4. BIMI           | Brand Indicators for Message Identification: Displays your      |\n|                   | verified corporate logo next to authenticated emails in Gmail.  |\n|                   | Requires DMARC at 'p=quarantine' or 'p=reject' + VMC cert.      |\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. Dedicated IPs vs. Shared IPs & IP Warming\n\n- **Shared IPs:** Lower volume senders (< 50,000 emails/month) share a pool of IPs provided by the ESP (Klaviyo, Mailchimp). Your reputation can be affected by other pool senders.\n- **Dedicated IP:** High volume senders (> 100,000 emails/month) require a dedicated IP address with sole control over sender reputation.\n- **IP Warming Cadence:** New IPs cannot blast 100,000 emails on Day 1. Gradually increase daily volume over 4–6 weeks while sending strictly to highly engaged subscribers (opened/clicked in last 30 days) to establish trust with ISPs.\n\n---\n\n## 3. List Hygiene & Spam Filter Triggers\n\n- **Sunset Policy:** Automatically un-subscribe contacts who haven't opened or clicked in 90–120 days. Sending to dead inboxes spikes spam trap hits and destroys sender reputation.\n- **Spam Complaint Threshold:** Google and Yahoo enforce a strict **0.3% spam complaint limit** (fewer than 3 spam reports per 1,000 delivered messages). Exceeding 0.3% results in domain-wide throttling or inbox blocking.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Email Deliverability & DMARC' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-020",
      "courseId": "CRS-DMK-001",
      "sequence": 20,
      "title": "Automated Email Lifecycles & Drip Sequences",
      "description": "Engineer revenue-generating automated email funnels: Welcome series, Browse Abandonment, Abandoned Cart recovery, Post-Purchase onboarding, and customer win-back retention sequences.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Automated Email Lifecycles & Drip Sequences\n\nWhile one-off broadcast campaigns generate spikes, automated lifecycle flows generate predictable, passive revenue 24/7 by reacting to specific user behavioral triggers.\n\n---\n\n## 1. The Core 5 Behavioral Email Flows\n\n```\n+---------------------------------------------------------------------------------+\n|                        LIFECYCLE EMAIL FLOW BLUEPRINTS                          |\n+-------------------+---------------------+---------------------------------------+\n| FLOW TYPE         | TRIGGER EVENT       | SEQUENCE & TIMING CADENCE             |\n+-------------------+---------------------+---------------------------------------+\n| 1. WELCOME        | User submits email  | - Email 1 (Instant): Deliver promised |\n| SERIES            | opt-in form         |   lead magnet / discount code.        |\n|                   |                     | - Email 2 (+24h): Founder story & core|\n|                   |                     |   brand mission / differentiation.    |\n|                   |                     | - Email 3 (+48h): Best-seller catalog |\n|                   |                     |   showcase & social proof reviews.    |\n+-------------------+---------------------+---------------------------------------+\n| 2. ABANDONED      | Added item to cart, | - Email 1 (+1 hour): 'Did you leave   |\n| CART RECOVERY     | did not complete    |   something behind?' + item preview.  |\n|                   | checkout            | - Email 2 (+24h): Overcoming friction |\n|                   |                     |   (FAQ, reviews, free shipping).      |\n|                   |                     | - Email 3 (+48h): Urgency / discount. |\n+-------------------+---------------------+---------------------------------------+\n| 3. BROWSE         | Viewed product page | - Email 1 (+2 hours): 'Still eyeing   |\n| ABANDONMENT       | 2+ times, did not   |   the Apache Spark Masterclass?'      |\n|                   | add to cart         | - Email 2 (+24h): Highlight syllabus. |\n+-------------------+---------------------+---------------------------------------+\n| 4. POST-PURCHASE  | Completed purchase  | - Email 1 (Instant): Order confirm.   |\n| ONBOARDING        |                     | - Email 2 (+3 days): How-to-use guide.|\n|                   |                     | - Email 3 (+14 days): Review request. |\n+-------------------+---------------------+---------------------------------------+\n| 5. WIN-BACK       | No orders in 90     | - Email 1 (+90 days): 'We miss you.'  |\n| CAMPAIGN          | days                | - Email 2 (+100 days): Special offer. |\n+-------------------+---------------------+---------------------------------------+\n```\n\n---\n\n## 2. Advanced Conditional Branching\n\nHigh-performance flows use conditional logic splits based on customer profile properties:\n- **Cart Value Split:** If `Cart Total > $200`, offer a VIP concierge phone consultation or a higher-value bonus incentive; if `Cart Total < $50`, focus on basic free-shipping threshold messaging.\n- **Purchase History Split:** Deliver different welcome onboarding sequences to `First-Time Buyers` versus `Repeat VIP Customers`.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Automated Email Flows & Drip Sequences' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-021",
      "courseId": "CRS-DMK-001",
      "sequence": 21,
      "title": "Customer Retention, Churn Reduction & SMS/WhatsApp Marketing",
      "description": "Master post-acquisition retention: RFM segmentation (Recency, Frequency, Monetary), Cohort Analysis, Churn rate mitigation, mobile SMS and WhatsApp conversational automation, and TCPA compliance.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Customer Retention, Churn Reduction & SMS/WhatsApp Marketing\n\nAcquiring a new customer costs **5x to 7x more** than retaining an existing customer. Maximizing Customer Lifetime Value (LTV) requires systematic segmentation and mobile-first direct messaging.\n\n---\n\n## 1. RFM Customer Segmentation\n\nRFM analyzes customer transaction behavior across three distinct behavioral dimensions:\n\n```\n+---------------------------------------------------------------------------------+\n|                             RFM SEGMENTATION MATRIX                             |\n+-------------------+-------------------------------------------------------------+\n| 1. RECENCY (R)    | Days since last purchase. The single strongest predictor of    |\n|                   | future repeat transaction likelihood.                           |\n+-------------------+-------------------------------------------------------------+\n| 2. FREQUENCY (F)  | Total number of orders placed across customer lifetime.         |\n|                   | Differentiates one-time buyers from repeat loyalists.           |\n+-------------------+-------------------------------------------------------------+\n| 3. MONETARY (M)   | Total cumulative dollars spent across customer lifetime.        |\n|                   | Identifies VIP 'whale' accounts driving 80% of company profit.  |\n+-------------------+-------------------------------------------------------------+\n```\n\n### Actionable RFM Segments:\n- **Champions (High R, High F, High M):** Reward with early-access product drops, VIP community access, and exclusive referral perks.\n- **At-Risk Customers (Low R, High F, High M):** Past high-spenders who haven't ordered in 6 months; trigger personalized win-back outreach.\n- **One-Time Low-Spenders (Low R, Low F, Low M):** Filter into low-cost email reactivation or sunset permanently.\n\n---\n\n## 2. SMS & WhatsApp Conversational Marketing\n\nSMS and WhatsApp deliver **98% open rates** with 90% read within 3 minutes of delivery, making them ideal for time-sensitive alerts:\n- **High-Converting Use Cases:** Flash sale notifications (ending in 4 hours), restock alerts, shipping delivery updates, two-way conversational customer support.\n- **TCPA & GDPR Compliance:** Explicit double opt-in is legally mandatory; every message must include clear opt-out language (e.g., `Reply STOP to opt out`). Never send marketing texts outside local daytime hours (8:00 AM - 9:00 PM local recipient time).\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Retention Marketing & RFM Segmentation' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-022",
      "courseId": "CRS-DMK-001",
      "sequence": 22,
      "title": "Landing Page Architecture & Neuromarketing",
      "description": "Design high-converting landing pages: Information hierarchy, above-the-fold wireframe, cognitive friction reduction, psychological triggers (Cialdini's 6 Principles), social proof, and risk reversal.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Landing Page Architecture & Neuromarketing\n\nA landing page has one single objective: convert visiting traffic into a qualified lead or customer. Every pixel, word, and button must support this singular goal.\n\n---\n\n## 1. Anatomy of an Above-the-Fold Landing Page\n\n```\n+---------------------------------------------------------------------------------+\n|                          ABOVE-THE-FOLD WIREFRAME                               |\n+---------------------------------------------------------------------------------+\n  [ Logo ]                                               [ Login / Quick Link ]    \n                                                                                   \n  HEADLINE: Clear, bold value proposition (Problem + Unique Solution)             \n  'Master Apache Spark, Kafka & Cloud Lakehouses in 12 Weeks'                      \n                                                                                   \n  SUBHEADLINE: Specific outcome + target audience                                  \n  'The definitive hands-on training built by Staff Data Engineers for developers.' \n                                                                                   \n  PRIMARY CTA BUTTON: High-contrast color, action-oriented text                    \n  [ Start Free 7-Day Trial -> ]                                                    \n                                                                                   \n  RISK REVERSAL MICRO-COPY: 'No credit card required. Cancel anytime.'             \n                                                                                   \n  HERO MEDIA (Right Column): Interactive product dashboard screenshot or video.    \n                                                                                   \n  TRUST BAR: 'Trusted by engineers at: [Google] [Uber] [Stripe] [Netflix]'         \n+---------------------------------------------------------------------------------+\n```\n\n---\n\n## 2. Psychological Triggers (Cialdini's 6 Principles)\n\n1. **Social Proof:** Verified customer ratings, enterprise client logos, real student testimonials with photos and LinkedIn links.\n2. **Scarcity & Urgency:** Limited seats per cohort or expiring promotional pricing timers (must be authentic, not artificial fake timers).\n3. **Authority:** Accreditations, press badges (Forbes, WSJ), instructor career credentials.\n4. **Reciprocity:** Offering massive upfront free value (e.g., free architecture cheat sheet) before asking for a purchase.\n5. **Commitment & Consistency:** Multi-step forms (Micro-conversions: starting with 1 simple question before asking for email).\n6. **Liking:** Relatable founder origin stories and empathetic brand voice.\n\n---\n\n## 3. The 1:1 Attention Ratio Rule\n\n- Standard websites have **10:1 to 50:1 attention ratios** (navigation menus, footer links, social icons, blog sidebars).\n- High-converting paid landing pages enforce a **1:1 Attention Ratio**: remove all top navigation menus, eliminate external links, and ensure the *only* clickable link on the entire page is the conversion action!\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Landing Page Optimization & Psychology' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-023",
      "courseId": "CRS-DMK-001",
      "sequence": 23,
      "title": "Conversion Rate Optimization (CRO) & A/B Testing Statistics",
      "description": "Master rigorous experimentation: The LIFT Model, hypothesis formulation, statistical significance (p-values, 95% confidence), sample size calculation, Minimum Detectable Effect (MDE), and Type I vs Type II errors.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# Conversion Rate Optimization (CRO) & A/B Testing Statistics\n\nConversion Rate Optimization (CRO) is the systematic, hypothesis-driven scientific process of increasing the percentage of website visitors who complete a desired conversion action.\n\n---\n\n## 1. The LIFT Experimentation Model\n\nDeveloped by WiderFunnel, the LIFT model identifies the 6 psychological forces influencing conversion probability:\n\n```\n+---------------------------------------------------------------------------------+\n|                               THE LIFT MODEL                                    |\n+-------------------+-------------------------------------------------------------+\n| VALUE PROPOSITION | The core vehicle (Perceived Benefits - Perceived Costs).        |\n| (The Driver)      | The single most powerful lever in the entire model.             |\n+-------------------+-------------------------------------------------------------+\n| CONVERSION DRIVERS| 1. RELEVANCE: How closely page content matches visitor intent.  |\n|                   | 2. CLARITY: Clear hierarchy, typography, and visual simplicity. |\n|                   | 3. URGENCY: Compelling reasons to take action right now.        |\n+-------------------+-------------------------------------------------------------+\n| CONVERSION INHIBITORS| 1. ANXIETY: Uncertainty regarding safety, privacy, or value. |\n|                   | 2. DISTRACTION: Unnecessary links, visual clutter, friction.    |\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. Statistical Rigor in A/B Testing\n\nNever declare an A/B test a winner based on superficial metrics or gut feeling without statistical validation:\n\n- **Null Hypothesis (H0):** There is no real difference between Variation A and Variation B; observed differences are due to random noise.\n- **P-Value (Target < 0.05):** The probability of observing the result if the null hypothesis were true. A p-value < 0.05 represents **95% Statistical Confidence**.\n- **Type I Error (False Positive, alpha = 0.05):** Declaring a winner when in reality there was no effect.\n- **Type II Error (False Negative, beta = 0.20):** Missing a real positive effect due to under-powered sample sizes (Statistical Power = 80%).\n\n---\n\n## 3. Sample Size & Minimum Detectable Effect (MDE)\n\nThe smaller the conversion lift you want to detect, the larger the required sample size:\n- Detecting a massive +50% lift requires only a few hundred conversions.\n- Detecting a subtle +2% lift requires tens of thousands of visitors per variation.\n- **Golden Rule:** Always run tests for at least **2 full business cycles (14 days)** to account for day-of-week seasonality (weekend vs weekday user behavior).\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='A/B Testing Statistics & CRO' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    },
    {
      "id": "CH-DMK-024",
      "courseId": "CRS-DMK-001",
      "sequence": 24,
      "title": "User Research, Heatmaps & Session Recording Analysis",
      "description": "Master qualitative UX diagnostics: Heatmaps (Scroll, Click, Move), Session Recordings, Rage Clicks, Dead Clicks, Exit-Intent On-Site Surveys, and Usability Heuristic Evaluation.",
      "contentType": "Rich Text",
      "durationMinutes": 75,
      "minimumTimeMinutes": 45,
      "body": "# User Research, Heatmaps & Session Recording Analysis\n\nWhile quantitative analytics (Google Analytics) tells you **what** is happening on your site, qualitative user research (Hotjar, Microsoft Clarity) explains **why** visitors are failing to convert.\n\n---\n\n## 1. Visual Behavior Diagnostics (Heatmaps)\n\n```\n+---------------------------------------------------------------------------------+\n|                                HEATMAP TYPES                                   |\n+-------------------+-------------------------------------------------------------+\n| 1. CLICK / TAP    | Aggregates every tap and mouse click. Identifies high-demand    |\n| MAPS              | CTAs and reveals 'dead clicks' (unlinked elements users mistake |\n|                   | for buttons).                                                   |\n+-------------------+-------------------------------------------------------------+\n| 2. SCROLL MAPS    | Visualizes how far down the page users scroll before dropping   |\n|                   | off. Identifies the average 'fold' line (typically only 40-50%  |\n|                   | of users scroll past 50% page depth).                           |\n+-------------------+-------------------------------------------------------------+\n| 3. MOVE MAPS      | Tracks mouse cursor movement as an empirical proxy for user eye |\n|                   | tracking (84% correlation between mouse hover and visual focus).|\n+-------------------+-------------------------------------------------------------+\n```\n\n---\n\n## 2. Session Recording Analysis: Friction Signals\n\nReviewing user screen playback sessions exposes severe user interface friction points:\n- **Rage Clicks:** A user rapidly clicks the same button or element 5+ times in 2 seconds. Signals broken JavaScript, unresponsive links, or extreme frustration.\n- **Dead Clicks:** Clicks on images, badges, or bold text that have no clickable link attached.\n- **Excessive Scrolling:** Rapid frantic scrolling up and down indicates the user is searching for critical information (e.g., pricing, syllabus) that is buried or missing.\n\n---\n\n## 3. On-Site Micro-Surveys\n\nDeploy targeted non-intrusive micro-surveys triggered by exit-intent cursor movement on checkout pages:\n- *'What is stopping you from enrolling today?'*\n- *'Was there anything missing from this page?'*\nAnalyzing open-text customer feedback reveals friction objections (e.g., 'Do you offer a certificate?', 'Is there a student discount?') that can be answered immediately with new FAQ copy.\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;'>\n  <iframe src='https://www.youtube.com/embed/5a4G0kZ04rA' title='Heatmaps & User Behavior Analysis' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen style='position: absolute; top: 0; left: 0; width: 100%; height: 100%;'></iframe>\n</div>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-DMK-019",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-019",
      "title": "Assessment: Email Marketing Infrastructure",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-181",
          "type": "MCQ",
          "prompt": "What is the primary role of the Sender Policy Framework (SPF) DNS record in email delivery?",
          "options": [
            "It specifies which mail servers and IP addresses are authorized to send emails on behalf of a designated domain name",
            "It formats the HTML layout of email templates",
            "It automatically writes marketing email subject lines",
            "It encrypts email attachments"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-182",
          "type": "MCQ",
          "prompt": "How does DKIM (DomainKeys Identified Mail) guarantee email security?",
          "options": [
            "It attaches a cryptographic digital signature to outgoing email headers verified against the domain's public key published in DNS",
            "It deletes spam emails from recipient inboxes",
            "It adds password protection to links",
            "It scans emails for spelling errors"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-183",
          "type": "MCQ",
          "prompt": "What does a DMARC policy of 'p=reject' instruct receiving email servers (like Gmail or Yahoo) to do with emails that fail SPF and DKIM?",
          "options": [
            "Completely reject and drop the email, preventing it from reaching the recipient's inbox or spam folder",
            "Deliver the email to the primary inbox with a warning badge",
            "Forward the email to the company administrator",
            "Automatically fix the SPF record"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-184",
          "type": "MCQ",
          "prompt": "What is BIMI (Brand Indicators for Message Identification)?",
          "options": [
            "An email specification that displays a verified brand logo next to authenticated emails in supporting recipient inboxes",
            "An automated email unsubscribe tool",
            "A billing invoice software for marketing agencies",
            "A social media sharing widget"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-185",
          "type": "MCQ",
          "prompt": "What is the process of 'IP Warming' for a new dedicated sending IP address?",
          "options": [
            "Gradually increasing outbound email send volumes over several weeks while sending strictly to highly engaged subscribers to build reputation with ISPs",
            "Running a hardware diagnostic test on physical servers",
            "Overclocking the server CPU",
            "Sending 1 million emails on day 1 to test speed"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-186",
          "type": "MCQ",
          "prompt": "What is an Email Sunset Policy?",
          "options": [
            "An automated workflow that unsubscribes or suppresses contacts who haven't opened or clicked an email in 90 to 120 days to preserve sender deliverability",
            "Scheduling emails to be sent at sunset",
            "Closing an email marketing account at the end of the year",
            "Deleting old email templates from the library"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-187",
          "type": "MCQ",
          "prompt": "What is the maximum spam complaint rate enforced by Google and Yahoo before sender domains face delivery throttling or inbox blocks?",
          "options": [
            "Fewer than 0.3% (fewer than 3 spam reports per 1,000 delivered emails)",
            "Under 50%",
            "Under 10%",
            "Spam complaints have no impact on delivery"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-188",
          "type": "MCQ",
          "prompt": "What free tool provided by Google allows domain owners to monitor deliverability metrics, IP reputation, spam rates, and DKIM errors?",
          "options": [
            "Google Postmaster Tools",
            "Google Analytics 4",
            "Google Search Console",
            "Google AdSense"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-189",
          "type": "MCQ",
          "prompt": "What is a 'Spam Trap'?",
          "options": [
            "An email address maintained by anti-spam organizations (like Spamhaus) to catch and blacklist senders using scraped or unverified email lists",
            "A folder in Microsoft Outlook",
            "A security firewall on an office WiFi network",
            "A CAPTCHA challenge"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-190",
          "type": "MCQ",
          "prompt": "What is the industry benchmark Return on Investment (ROI) typically associated with mature email marketing programs?",
          "options": [
            "~$36 to $42 returned for every $1 invested",
            "$0.50 per $1 invested",
            "$1.00 per $1 invested (break-even)",
            "Email marketing has negative ROI"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-020",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-020",
      "title": "Assessment: Automated Email Lifecycles & Drips",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-191",
          "type": "MCQ",
          "prompt": "What is the primary objective of an automated Welcome Email Series?",
          "options": [
            "Deliver immediate value promised at opt-in, introduce brand mission and differentiation, set communication expectations, and drive the first purchase",
            "Ask the subscriber for a loan",
            "Send 10 emails in the first 10 minutes",
            "Collect credit card information immediately"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-192",
          "type": "MCQ",
          "prompt": "What trigger event initiates an Abandoned Cart email flow in e-commerce automation?",
          "options": [
            "A user adds an item to their shopping cart and begins checkout, but does not complete the purchase within a specified time window (e.g., 1 hour)",
            "A user visits the homepage",
            "A user types a search query in Google",
            "A package is delivered by FedEx"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-193",
          "type": "MCQ",
          "prompt": "How does a Browse Abandonment flow differ from an Abandoned Cart flow?",
          "options": [
            "Browse abandonment triggers when a subscriber views product detail pages without adding anything to the cart; Cart abandonment triggers after cart addition",
            "Browse abandonment is only sent via SMS",
            "Cart abandonment is for wholesale B2B only",
            "Browse abandonment cannot include product images"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-194",
          "type": "MCQ",
          "prompt": "What is the recommended timing for sending the very first email in an Abandoned Cart recovery flow?",
          "options": [
            "1 to 2 hours after abandonment while the purchasing intent remains fresh",
            "7 days later",
            "1 month later",
            "Exactly 1 second later"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-195",
          "type": "MCQ",
          "prompt": "What is the strategic purpose of a Post-Purchase Onboarding sequence?",
          "options": [
            "Reassure customer purchase decision, reduce buyer remorse, deliver tutorials on product usage, and pave the way for repeat purchases and reviews",
            "Send bills for unpaid balances",
            "Cancel the order automatically",
            "Sell customer contact details to third parties"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-196",
          "type": "MCQ",
          "prompt": "What is an automated Customer Win-Back campaign?",
          "options": [
            "A series of targeted emails and special offers triggered when a customer has not placed an order within their expected reorder timeframe (e.g., 90 days)",
            "A contest where customers win a vacation",
            "An email sent when a customer wins an eBay auction",
            "A legal lawsuit notification"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-197",
          "type": "MCQ",
          "prompt": "What is a 'Conditional Split' in an automated email workflow engine (like Klaviyo or ActiveCampaign)?",
          "options": [
            "Branching contacts down distinct pathways based on user criteria (e.g., whether cart value > $100 or whether they are a first-time vs repeat buyer)",
            "Splitting an email into two halves",
            "Dividing marketing team salaries",
            "Splitting an email list in half randomly"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-198",
          "type": "MCQ",
          "prompt": "Why should discount coupons NOT always be offered in the first email of an Abandoned Cart sequence?",
          "options": [
            "Many buyers simply got distracted; offering immediate discounts erodes profit margins and trains customers to abandon carts intentionally for discounts",
            "Because discounts are illegal in email marketing",
            "Because discounts decrease conversion rates",
            "Because discount codes crash email servers"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-199",
          "type": "MCQ",
          "prompt": "What is the primary metric evaluating email lifecycle health across automated flows?",
          "options": [
            "Revenue Per Recipient (RPR) and Flow Attributed Revenue Percentage (typically 20-30% of total e-commerce store revenue)",
            "Total number of exclamation marks in subject lines",
            "Font size of the unsubscribe link",
            "The physical server CPU temperature"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-200",
          "type": "MCQ",
          "prompt": "What does A/B testing subject lines in automated flows help optimize?",
          "options": [
            "Email Open Rates",
            "Delivery server latency",
            "Unsubscribe link placement",
            "Spam filter scoring"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-021",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-021",
      "title": "Assessment: Customer Retention & SMS Marketing",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-201",
          "type": "MCQ",
          "prompt": "What do the letters R, F, and M represent in the RFM customer segmentation model?",
          "options": [
            "Recency, Frequency, Monetary value",
            "Revenue, Finance, Marketing",
            "Reach, Focus, Momentum",
            "Retention, Funnel, Metric"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-202",
          "type": "MCQ",
          "prompt": "Which RFM metric is empirically proven to be the single strongest predictor of a customer's likelihood to buy again in the future?",
          "options": [
            "Recency (how recently they completed a purchase)",
            "Monetary value",
            "Frequency",
            "Account creation date"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-203",
          "type": "MCQ",
          "prompt": "What typical open rate do direct SMS marketing messages achieve compared to standard marketing emails?",
          "options": [
            "~98% open rate for SMS (with 90% read within 3 minutes), compared to ~20-25% for email",
            "SMS has lower open rates than email (~5%)",
            "SMS open rates cannot be measured",
            "Exactly 50%"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-204",
          "type": "MCQ",
          "prompt": "What is legally required under the Telephone Consumer Protection Act (TCPA) before sending commercial SMS marketing messages?",
          "options": [
            "Explicit prior written consent (double opt-in) with clear disclosure and opt-out instructions (e.g., 'Reply STOP to cancel')",
            "A verbal phone agreement recorded on tape",
            "A payment of $10 to the mobile carrier",
            "There are no legal regulations on SMS marketing"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-205",
          "type": "MCQ",
          "prompt": "What are 'Quiet Hours' in commercial SMS regulations?",
          "options": [
            "Mandated windows (typically 9:00 PM to 8:00 AM in the recipient's local time zone) during which sending marketing text messages is legally prohibited",
            "Hours when office staff take lunch",
            "Time when cellular towers are turned off for maintenance",
            "When users put their phones on silent mode"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-206",
          "type": "MCQ",
          "prompt": "What is Customer Churn Rate?",
          "options": [
            "The percentage of customers or subscribers who cancel or fail to renew their relationship with a company over a given timeframe",
            "The rate at which employees quit",
            "The speed of customer service phone answers",
            "The number of new customers acquired"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-207",
          "type": "MCQ",
          "prompt": "How does a Cohort Analysis table visualize customer retention over time?",
          "options": [
            "Groups customers by the month they made their first purchase and tracks the percentage of that cohort that continues purchasing in months 1, 2, 3... N",
            "Lists customer names in alphabetical order",
            "Shows daily social media likes",
            "Displays warehouse inventory levels"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-208",
          "type": "MCQ",
          "prompt": "What is a 'VIP Whale' customer cohort in e-commerce analytics?",
          "options": [
            "The top 5% to 10% highest-spending customers who account for a disproportionately large share (40-60%) of overall business gross profit",
            "Customers who buy aquatic pet supplies",
            "Customers who return every product",
            "Customers who only shop during Black Friday"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-209",
          "type": "MCQ",
          "prompt": "Why should marketing SMS messages be used more sparingly than marketing emails?",
          "options": [
            "SMS is an intimate personal channel; over-messaging leads to immediate subscriber fatigue, high unsubscribe rates, and costly TCPA complaints",
            "SMS messages cost $50 each to send",
            "SMS cannot display emojis",
            "Mobile phones only store 10 text messages"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-210",
          "type": "MCQ",
          "prompt": "What is WhatsApp Business API primarily utilized for in international markets (e.g., LATAM, India, Europe)?",
          "options": [
            "Conversational commerce, transactional order notifications, personalized marketing drip sequences, and real-time customer care",
            "Hosting corporate conference calls",
            "Editing video filters",
            "Managing company payroll"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-022",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-022",
      "title": "Assessment: Landing Page Architecture & Psychology",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-211",
          "type": "MCQ",
          "prompt": "What is the '1:1 Attention Ratio' rule for paid campaign landing pages?",
          "options": [
            "Ensuring there is only ONE primary conversion action on the page for every ONE campaign goal, removing header navigation menus and extraneous external links",
            "Spending 1 minute reading for every 1 minute of video",
            "Having 1 image for every 1 paragraph of text",
            "Showing 1 ad per 1 user visit"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-212",
          "type": "MCQ",
          "prompt": "What should the primary above-the-fold headline immediately communicate to a first-time visitor in under 5 seconds?",
          "options": [
            "The core value proposition: what clear problem the product solves, for whom, and what unique transformation is delivered",
            "The company's incorporation date and headquarters address",
            "A dictionary definition of the product category",
            "A list of company executives"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-213",
          "type": "MCQ",
          "prompt": "Which of Cialdini's persuasion principles is utilized when displaying client company logos (e.g., 'Trusted by Google, Uber, Stripe') and student testimonials?",
          "options": [
            "Social Proof",
            "Scarcity",
            "Reciprocity",
            "Commitment and Consistency"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-214",
          "type": "MCQ",
          "prompt": "What is 'Risk Reversal' in landing page copy?",
          "options": [
            "Elements that remove perceived risk from the buyer (e.g., '30-day 100% money-back guarantee', 'No credit card required', 'Cancel anytime')",
            "Purchasing insurance against web server crashes",
            "Investing in treasury bonds",
            "Adding a disclaimer that all sales are final"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-215",
          "type": "MCQ",
          "prompt": "What is a 'Micro-Conversion'?",
          "options": [
            "A small preliminary step taken by a visitor that builds momentum toward the final conversion (e.g., answering Step 1 of an interactive multi-step quiz)",
            "A purchase under $1.00",
            "A visit lasting less than 1 second",
            "An image download"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-216",
          "type": "MCQ",
          "prompt": "Why does reducing form fields from 10 inputs to 3 inputs typically increase landing page conversion rates?",
          "options": [
            "It drastically reduces cognitive friction and perceived effort required from the user to complete the action",
            "It speeds up database SQL queries",
            "It makes the page render in dark mode",
            "It disables browser autofill"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-217",
          "type": "MCQ",
          "prompt": "What is 'Cognitive Friction' in user interface design?",
          "options": [
            "Mental resistance or confusion experienced by a user when an interface is cluttered, unintuitive, ambiguous, or demanding unnecessary effort",
            "Physical friction on a trackpad",
            "The temperature of the computer screen",
            "The network ping between user and server"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-218",
          "type": "MCQ",
          "prompt": "What visual design technique guides a user's eyes directly toward the Call-to-Action (CTA) button?",
          "options": [
            "Directional cues (e.g., arrows, eye-gaze direction of people in photos pointing toward the CTA, and high-contrast button colors)",
            "Hiding the button until the user scrolls for 5 minutes",
            "Making the button the exact same color as the background",
            "Using 10 different flashing fonts"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-219",
          "type": "MCQ",
          "prompt": "What is 'Message Match' between an ad and its destination landing page?",
          "options": [
            "Ensuring that the headline, imagery, and promise made in the ad are immediately reinforced word-for-word on the landing page",
            "Sending a text message after clicking an ad",
            "Translating the ad into German",
            "Matching the ad font to the operating system"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-220",
          "type": "MCQ",
          "prompt": "Why should call-to-action (CTA) button copy avoid generic words like 'Submit'?",
          "options": [
            "'Submit' sounds like a chore; action-oriented value-focused copy (e.g., 'Get Instant Access', 'Claim My Seat', 'Start Free Trial') increases click intent",
            "'Submit' is a reserved keyword in HTML5 and causes errors",
            "Google Ads bans the word 'Submit'",
            "It exceeds the character limit"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-023",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-023",
      "title": "Assessment: CRO & A/B Testing Statistics",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-221",
          "type": "MCQ",
          "prompt": "In statistical hypothesis testing for A/B experiments, what does a p-value < 0.05 signify?",
          "options": [
            "There is less than a 5% probability that the observed conversion lift occurred by random chance alone, achieving 95% statistical confidence",
            "The conversion rate was 5%",
            "The experiment failed to record data",
            "The website was down for 5% of the test"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-222",
          "type": "MCQ",
          "prompt": "What is a Type I Error (False Positive) in CRO experimentation?",
          "options": [
            "Declaring a test variation a winner and implementing it when in reality there was no true positive effect (it won due to random noise)",
            "Failing to notice a real positive conversion lift",
            "A 404 server error during testing",
            "A typing mistake in the headline"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-223",
          "type": "MCQ",
          "prompt": "What is a Type II Error (False Negative)?",
          "options": [
            "Concluding there is no difference between variations and discarding a winning change due to inadequate sample size and low statistical power",
            "Implementing a losing variation",
            "A database crash",
            "An expired SSL certificate"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-224",
          "type": "MCQ",
          "prompt": "What are the six psychological conversion levers defined by the LIFT Model?",
          "options": [
            "Value Proposition, Relevance, Clarity, Urgency, Anxiety, and Distraction",
            "SEO, SEM, SMM, CRO, PPC, and CRM",
            "Price, Product, Promotion, Place, People, and Process",
            "Attention, Interest, Decision, Action, Retention, and Advocacy"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-225",
          "type": "MCQ",
          "prompt": "What is Minimum Detectable Effect (MDE) in A/B test pre-calculation?",
          "options": [
            "The minimum relative percentage lift in conversion rate that an experiment has sufficient statistical power to reliably detect given a specific sample size",
            "The smallest button size allowed on mobile",
            "The lowest price allowed for a product",
            "The minimum screen resolution of visitors"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-226",
          "type": "MCQ",
          "prompt": "Why should an A/B test run for a minimum duration of at least two full weeks (14 days), even if statistical significance is reached on Day 3?",
          "options": [
            "To account for cyclical day-of-week seasonality (e.g., weekend browsing vs Monday enterprise purchasing habits) and avoid sample distortion",
            "Because A/B testing software requires a 14-day billing period",
            "To allow search engine crawlers to re-index the page",
            "To give designers time to create more variations"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-227",
          "type": "MCQ",
          "prompt": "What is the Null Hypothesis (H0) in an A/B test?",
          "options": [
            "The baseline assumption that there is no meaningful difference between Variation A and Variation B, and any observed variance is random chance",
            "The hypothesis that the test will crash the server",
            "The assumption that all visitors will convert",
            "The goal of achieving zero bounce rate"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-228",
          "type": "MCQ",
          "prompt": "What is Statistical Power (typically set to 80%) in experimentation design?",
          "options": [
            "The probability that the test will correctly reject the null hypothesis and detect an effect if an actual true difference exists (1 - beta)",
            "The speed of the cloud testing server",
            "The electrical wattage consumed by the database",
            "The authority of the marketing director to launch tests"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-229",
          "type": "MCQ",
          "prompt": "What is a Multivariate Test (MVT) compared to a standard A/B test?",
          "options": [
            "Testing multiple combinations of elements simultaneously (e.g., 2 headlines × 2 images = 4 variations) to measure interaction effects",
            "Testing on 10 different websites at once",
            "Testing with different currencies",
            "Testing across multiple search engines"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-230",
          "type": "MCQ",
          "prompt": "What is 'Sample Ratio Mismatch' (SRM) and why is it dangerous in experimentation?",
          "options": [
            "When the observed split of traffic (e.g., 55/45) deviates significantly from the planned allocation (50/50), signaling a technical tracking or redirection bug that invalidates test results",
            "When the sample size is too large",
            "When all visitors come from the same country",
            "When desktop traffic exceeds mobile traffic"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    },
    {
      "id": "ASM-DMK-024",
      "courseId": "CRS-DMK-001",
      "chapterId": "CH-DMK-024",
      "title": "Assessment: User Research, Heatmaps & Recordings",
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-DMK-231",
          "type": "MCQ",
          "prompt": "What is a 'Rage Click' in website session recording analytics?",
          "options": [
            "When a user repeatedly and rapidly clicks the exact same element multiple times in rapid succession, signaling broken functionality or unresponsive UI",
            "When a user types an angry message in the contact form",
            "When a user leaves a negative review on Trustpilot",
            "When a visitor closes their browser window"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-232",
          "type": "MCQ",
          "prompt": "What is a 'Dead Click' identified by tools like Microsoft Clarity or Hotjar?",
          "options": [
            "A click on an unlinked element (such as an icon, badge, or plain text) that the user mistakenly believed was interactive or clickable",
            "A click that costs $0.00 in Google Ads",
            "A click originating from an expired cookie",
            "A click made by an automated bot"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-233",
          "type": "MCQ",
          "prompt": "What does a Scroll Map visualize on a webpage?",
          "options": [
            "The exact percentage of visitors who scroll down to each horizontal depth of the page, revealing where the steepest drop-offs occur",
            "The speed of the mouse scroll wheel",
            "The total number of words on the page",
            "The number of times the page was reloaded"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-234",
          "type": "MCQ",
          "prompt": "Why is Move Tracking (mouse movement heatmap) considered a reliable low-cost proxy for eye-tracking research?",
          "options": [
            "Academic studies show an ~84% correlation between mouse cursor position and human visual eye fixation",
            "Because web cameras are illegal in web testing",
            "Because the mouse cursor controls screen brightness",
            "Because all users look only at the mouse cursor"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-235",
          "type": "MCQ",
          "prompt": "What is an 'Exit-Intent' trigger for on-site micro-surveys?",
          "options": [
            "Detecting when a desktop user's mouse cursor rapidly moves toward the top of the browser viewport to close the tab or window, triggering a survey prompt",
            "Surveying users when they log out of their account",
            "Sending an email after a user uninstalls an app",
            "Tracking users after they shut down their computer"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-236",
          "type": "MCQ",
          "prompt": "What is the primary value of qualitative session recordings compared to quantitative Google Analytics reports?",
          "options": [
            "Recordings reveal the human behavioral 'why' behind drop-offs by watching exact mouse movements, confusion pauses, and form field hesitation",
            "Recordings take up less server storage",
            "Recordings can be viewed without an internet connection",
            "Recordings guarantee 100% compliance with GDPR"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-237",
          "type": "MCQ",
          "prompt": "What is a 'Form Analytics' diagnostic tool used to measure?",
          "options": [
            "Drop-off rates per form field, hesitation time spent on each input, and fields that cause users to abandon the form",
            "The physical size of input boxes in millimeters",
            "The grammar score of user submissions",
            "The font family used in the form"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-238",
          "type": "MCQ",
          "prompt": "How must user privacy (PII) be handled when capturing website session recordings?",
          "options": [
            "All sensitive text fields (passwords, credit card numbers, addresses, phone numbers) must be masked and obfuscated with asterisks before transmission",
            "PII should be published in public reports",
            "Session recording software is exempt from privacy laws",
            "Recordings should never be viewed by humans"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-239",
          "type": "MCQ",
          "prompt": "What heuristic evaluation framework is widely used by UX designers and CRO analysts to audit interface usability?",
          "options": [
            "Nielsen's 10 Usability Heuristics (e.g., Visibility of system status, Error prevention, Consistency)",
            "The Scrum Agile Framework",
            "The Waterfall Methodology",
            "The OSI 7-Layer Model"
          ],
          "answer": 0,
          "points": 10
        },
        {
          "id": "Q-DMK-240",
          "type": "MCQ",
          "prompt": "What is an actionable outcome from discovering that 70% of mobile users abandon a landing page above the fold on a scroll map?",
          "options": [
            "Relocate critical value propositions, social proof badges, and the primary CTA higher up the page so they are immediately visible without scrolling",
            "Delete the landing page entirely",
            "Increase the price of the product",
            "Block mobile traffic from viewing the website"
          ],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
};
