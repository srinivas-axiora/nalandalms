export const phase4Chapters = [
  {
    id: "CH-DNA-019",
    courseId: "CRS-DNA-001",
    title: "SaaS & Product Metrics: ARR, NRR, CAC & LTV Mastery",
    order: 19,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=R9Z8bW6S2_0",
    content: `# SaaS & Product Metrics: ARR, NRR, CAC & LTV Mastery

### Learning Objectives
1. Calculate core SaaS subscription economics: MRR, ARR, and the SaaS Quick Ratio.
2. Master Net Revenue Retention (NRR) and Gross Revenue Retention (GRR).
3. Compute Customer Acquisition Cost (CAC), CAC Payback Period, and LTV/CAC efficiency ratios.
4. Model expansion, contraction, churn, and reactivation trajectories in recurring revenue.

---

### 1. The Anatomy of Recurring Revenue (MRR / ARR)

Subscription software companies live and die by Monthly Recurring Revenue (MRR) and Annual Recurring Revenue (ARR):

\`\`\`
   +-------------------------------------------------------------+
   |                     MRR WATERFALL BRIDGE                    |
   +-------------------------------------------------------------+
   | Starting MRR (Beginning of Month)                 $100,000  |
   |   + New MRR (Brand new customer acquisitions)     + $15,000 |
   |   + Expansion MRR (Upsells, cross-sells, tiers)   +  $8,000 |
   |   + Reactivation MRR (Previously churned users)   +  $2,000 |
   |   - Contraction MRR (Downgrades to lower tiers)   -  $3,000 |
   |   - Churned MRR (Cancellations / non-renewals)    -  $5,000 |
   +-------------------------------------------------------------+
   | Ending MRR (End of Month)                         $117,000  |
   | Net New MRR Added = ($117,000 - $100,000) =       +$17,000  |
   +-------------------------------------------------------------+
\`\`\`

#### The SaaS Quick Ratio:
$$\\text{Quick Ratio} = \\frac{\\text{New MRR} + \\text{Expansion MRR}}{\\text{Churned MRR} + \\text{Contraction MRR}}$$
- **Quick Ratio > 4.0**: Excellent growth efficiency.
- **Quick Ratio < 2.0**: The business is churning too rapidly to sustain growth.

---

### 2. Retention Metrics: NRR vs. GRR

- **Net Revenue Retention (NRR)**: Measures recurring revenue retained from existing customers over a period, including expansion:
  $$\\text{NRR} = \\frac{\\text{Starting MRR} + \\text{Expansion} - \\text{Contraction} - \\text{Churn}}{\\text{Starting MRR}} \\times 100$$
  - **NRR > 100%**: Represents **Negative Churn**—the business grows revenue even if it acquires ZERO new customers! Best-in-class SaaS companies (Snowflake, Datadog) boast NRR of 120%–130%.

- **Gross Revenue Retention (GRR)**: Excludes expansion; measures pure retention of original contract value (maximum possible is 100%):
  $$\\text{GRR} = \\frac{\\text{Starting MRR} - \\text{Contraction} - \\text{Churn}}{\\text{Starting MRR}} \\times 100$$

---

### 3. Unit Economics: CAC & LTV

$$\\text{Customer Acquisition Cost (CAC)} = \\frac{\\text{Total Sales \\& Marketing Expense}}{\\text{Number of New Customers Acquired}}$$

$$\\text{CAC Payback Period (Months)} = \\frac{\\text{CAC}}{\\text{Average Monthly Gross Margin per Customer}}$$

$$\\text{Customer Lifetime Value (LTV)} = \\frac{\\text{Average Revenue Per User (ARPU)} \\times \\text{Gross Margin \\%}}{\\text{Customer Churn Rate}}$$

#### The Golden LTV / CAC Ratio:
- **LTV / CAC < 1.0**: Burning cash; business is losing money on every acquired customer.
- **LTV / CAC = 3.0**: The industry gold standard for sustainable growth.
- **LTV / CAC > 5.0**: Under-investing in marketing; could grow faster by spending more aggressively on acquisition.

---

### 4. Hands-on Lab: SaaS Financial Model
1. Ingest a transactional ledger of subscription events (new, upgrade, downgrade, cancel).
2. Build an automated SQL MRR waterfall breakdown.
3. Compute NRR, GRR, and CAC Payback Period across product lines.`
  },
  {
    id: "CH-DNA-020",
    courseId: "CRS-DNA-001",
    title: "E-Commerce & Retail Performance Analytics",
    order: 20,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=FqSPh_x2Yt4",
    content: `# E-Commerce & Retail Performance Analytics

### Learning Objectives
1. Analyze digital e-commerce metrics: Gross Merchandise Value (GMV), Average Order Value (AOV), and Conversion Rates.
2. Build eCommerce conversion funnels: Home -> Category -> Product -> Cart -> Checkout -> Purchase.
3. Quantify Shopping Cart Abandonment rates and root causes.
4. Calculate inventory and merchandising efficiency: Inventory Turnover, Sell-Through Rate, and GMROI.

---

### 1. The Core E-Commerce Metric Engine

Digital retail performance is driven by the fundamental e-commerce revenue equation:

$$\\text{Revenue} = \\text{Traffic (Sessions)} \\times \\text{Conversion Rate (CR)} \\times \\text{Average Order Value (AOV)}$$

\`\`\`
   +-------------------------------------------------------------+
   |                E-COMMERCE METRICS DEFINITIONS               |
   +-------------------------------------------------------------+
   | GMV (Gross Merchandise Value) | Total dollar value of goods |
   |                               | sold through the platform.  |
   +-------------------------------+-----------------------------+
   | AOV (Average Order Value)     | Total Revenue / Total Orders|
   +-------------------------------+-----------------------------+
   | Cart Abandonment Rate         | (Carts Created - Purchases) |
   |                               | / Carts Created * 100       |
   +-------------------------------+-----------------------------+
   | Return on Ad Spend (ROAS)     | Ad Revenue / Ad Spend       |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Multi-Step Funnel Analysis

Tracking where prospective customers drop off in the conversion funnel pinpoints UX friction:

\`\`\`
   SESSIONS (100,000) ==========================> 100%
            |
            v (-60% Drop)
   PRODUCT DETAIL VIEWS (40,000) ===============> 40%
            |
            v (-70% Drop)
   ADD TO CART (12,000) ========================> 12%
            |
            v (-50% Drop)
   INITIATE CHECKOUT (6,000) ===================> 6%
            |
            v (-40% Drop)
   COMPLETED TRANSACTIONS (3,600) ==============> 3.6% Overall CR
\`\`\`

#### Diagnostic Takeaway:
If 50% of users drop between Add-to-Cart and Initiate Checkout, investigate unexpected shipping costs, hidden fees, or mandatory account creation friction.

---

### 3. Retail Inventory & Merchandising Metrics

Maintaining excess inventory ties up critical working capital; stocking too little causes costly stockouts:

- **Inventory Turnover Ratio**:
  $$\\text{Inventory Turnover} = \\frac{\\text{Cost of Goods Sold (COGS)}}{\\text{Average Inventory Value}}$$
  *(Higher turnover indicates efficient asset utilization and fast-moving goods).*

- **Gross Margin Return on Investment (GMROI)**:
  $$\\text{GMROI} = \\frac{\\text{Gross Margin (\\$)}}{\\text{Average Inventory Cost (\\$)}}$$
  *(Measures how many gross profit dollars are generated for every \$1 invested in inventory).*

---

### 4. Hands-on Lab: Funnel Drop-off Analysis
1. Analyze web session event logs (view, add_to_cart, checkout, purchase).
2. Calculate step-by-step conversion drop-off percentages in Python.
3. Build an interactive Funnel Chart in Plotly to visualize conversion bottlenecks.`
  },
  {
    id: "CH-DNA-021",
    courseId: "CRS-DNA-001",
    title: "Customer Segmentation & Behavioral RFM Modeling",
    order: 21,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Customer Segmentation & Behavioral RFM Modeling

### Learning Objectives
1. Understand behavioral customer segmentation and the limitations of demographic segmentation.
2. Master the Recency, Frequency, Monetary (RFM) modeling framework.
3. Compute quintile RFM scores (1 to 5) in pure SQL and Python.
4. Map RFM segments to actionable marketing campaigns: Champions, Loyal Customers, At-Risk, and Hibernating.

---

### 1. The RFM Framework

Not all customers are equal. Treating a one-time discount seeker the same as a multi-thousand-dollar VIP brand advocate wastes marketing spend.

\`\`\`
   +-------------------------------------------------------------+
   |                       THE RFM PILLARS                       |
   +-------------------------------------------------------------+
   | [R] RECENCY   | How recently did the customer purchase?    |
   |               | (Days since last order: lower is better)    |
   +---------------+---------------------------------------------+
   | [F] FREQUENCY | How often do they purchase?                 |
   |               | (Total order count: higher is better)       |
   +---------------+---------------------------------------------+
   | [M] MONETARY  | How much money do they spend?               |
   |               | (Total lifetime spend: higher is better)    |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Computing RFM Scores in SQL

Using \`NTILE(5)\` to rank customers into quintiles (scores 1 to 5):

\`\`\`sql
WITH customer_aggregates AS (
    SELECT 
        customer_id,
        DATE_PART('day', CURRENT_DATE - MAX(order_date)) AS recency_days,
        COUNT(order_id) AS frequency_count,
        SUM(order_amount) AS monetary_total
    FROM orders
    GROUP BY customer_id
),
rfm_scores AS (
    SELECT 
        customer_id,
        recency_days,
        frequency_count,
        monetary_total,
        -- Recency: Lower days get HIGHER score (5 = most recent!)
        NTILE(5) OVER (ORDER BY recency_days DESC) AS r_score,
        -- Frequency: Higher count gets HIGHER score (5 = most frequent)
        NTILE(5) OVER (ORDER BY frequency_count ASC) AS f_score,
        -- Monetary: Higher spend gets HIGHER score (5 = biggest spender)
        NTILE(5) OVER (ORDER BY monetary_total ASC) AS m_score
    FROM customer_aggregates
)
SELECT 
    customer_id,
    recency_days,
    frequency_count,
    monetary_total,
    CAST(r_score AS VARCHAR) || CAST(f_score AS VARCHAR) || CAST(m_score AS VARCHAR) AS rfm_cell,
    CASE 
        WHEN r_score >= 4 AND f_score >= 4 AND m_score >= 4 THEN 'Champions / VIP'
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 4 AND f_score = 1 THEN 'Promising Newcomers'
        WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk / Need Attention'
        WHEN r_score = 1 AND f_score <= 2 THEN 'Hibernating / Lost'
        ELSE 'General Customers'
    END AS customer_segment
FROM rfm_scores;
\`\`\`

---

### 3. Actionable Segment Marketing Strategies

| RFM Segment | Characteristics | Strategic Action |
| :--- | :--- | :--- |
| **Champions (555, 554)** | Bought recently, buy often, spend the most. | Exclusive VIP perks, early product access, brand ambassadorship. |
| **Loyal Customers (344, 443)** | Consistent spenders, responsive to promos. | Upsell higher-tier products, loyalty rewards. |
| **At Risk (244, 144)** | Big past spenders, but have not ordered in months. | Personalized win-back emails, phone check-in from account manager. |
| **Hibernating (111, 112)** | Last purchase long ago, low spend. | Automated low-cost discount blast; discontinue expensive ad retargeting. |

---

### 4. Hands-on Lab: RFM Segmentation Pipeline
1. Ingest 2 years of customer transaction logs.
2. Calculate R, F, and M raw values in Python.
3. Compute quintile scores and plot a 2D scatter matrix (Recency vs. Frequency colored by Monetary score).`
  },
  {
    id: "CH-DNA-022",
    courseId: "CRS-DNA-001",
    title: "Data Storytelling & Executive Presentations for the C-Suite",
    order: 22,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=scEDHsr3APg",
    content: `# Data Storytelling & Executive Presentations for the C-Suite

### Learning Objectives
1. Structure persuasive data-driven narratives using the Minto Pyramid Principle and the SCR Framework.
2. Bridge the communication gap between technical data outputs and C-level strategic priorities.
3. Author the "Amazon-Style 6-Page Narrative Memo" with clear recommendations.
4. Lead high-stakes executive Q&A sessions without defensive technical jargon.

---

### 1. The SCR Narrative Framework

Executives do not have time to trace your SQL queries or look through 40 random slides. Structure your communication around the **Situation - Complication - Resolution (SCR)** framework:

\`\`\`
   +-------------------------------------------------------------+
   |                     THE SCR FRAMEWORK                       |
   +-------------------------------------------------------------+
   | 1. SITUATION    | The context and common ground agreed by   |
   |                 | all stakeholders.                         |
   |                 | "Nalanda's revenue grew 25% YoY in Q3..." |
   +-----------------+-------------------------------------------+
   | 2. COMPLICATION | The problem, blocker, or unexpected shift |
   |                 | that threatens progress.                  |
   |                 | "...However, customer acquisition cost    |
   |                 | surged 45% due to ad network saturation." |
   +-----------------+-------------------------------------------+
   | 3. RESOLUTION   | The data-backed recommendation, action    |
   |                 | plan, and projected financial outcome.    |
   |                 | "We recommend reallocating $150k from ad  |
   |                 | networks to referral partnerships to cut  |
   |                 | CAC by 30% and preserve gross margin."    |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. The Barbara Minto Pyramid Principle

Start with your conclusion (the **Answer First**), then provide supporting arguments, followed by granular data details:

\`\`\`
                       [ EXECUTIVE RECOMMENDATION ]
                       "Reallocate $150k to Referral Channel"
                                    |
          +-------------------------+-------------------------+
          |                                                   |
   [ ARGUMENT 1 ]                              [ ARGUMENT 2 ]
   Referral CAC is 60% cheaper                 Organic conversion is 2x
   than paid search ads.                       higher than cold search.
          |                                                   |
   (Supporting Data Points)                    (Supporting Data Points)
   $42 vs $110 per customer                    4.2% CR vs 2.1% CR
\`\`\`

---

### 3. Anatomy of an Executive 1-Page Brief

\`\`\`markdown
# Executive Decision Memo: Q4 Customer Acquisition Strategy
- **To:** Chief Executive Officer, Chief Financial Officer
- **From:** Lead Analytics Partner
- **Date:** October 30, 2026

## 1. Executive Summary & Core Recommendation
Paid advertising efficiency dropped by 38% in Q3, increasing CAC to \$112 per user.
We recommend capping paid ad spend at \$200,000 and investing \$80,000 into a structured Referral Partnership Program, projected to reduce blend CAC to \$78 and generate \$1.2M in incremental Q4 ARR.

## 2. Key Evidence & Data Synthesis
- Paid channel CAC rose from \$74 in Q1 to \$112 in Q3 due to 22% rising CPMs on Meta/Google.
- Organic referrals currently convert at 5.2% (vs. 1.8% for paid search), with a 12-month retention rate of 74% (vs. 51% for paid ads).

## 3. Financial Impact & Risk Mitigation
- Net savings in marketing spend: \$120,000.
- Projected payback period drops from 14 months to 8.5 months.
- Risk: Referral channel takes 4 weeks to ramp; mitigated by maintaining search brand-term capture.
\`\`\`

---

### 4. Hands-on Lab: Executive Briefing Simulation
1. Review raw data showing a 20% spike in customer churn.
2. Structure the findings into the SCR narrative format.
3. Draft a 1-page executive decision memo with concrete financial projections.`
  },
  {
    id: "CH-DNA-023",
    courseId: "CRS-DNA-001",
    title: "Interactive Web Apps for Analytics: Streamlit & Dash",
    order: 23,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=J8w_3oKxV1E",
    content: `# Interactive Web Apps for Analytics: Streamlit & Dash

### Learning Objectives
1. Build and deploy interactive, data-driven web applications using pure Python in **Streamlit**.
2. Understand Streamlit's reactive execution model and Session State management.
3. Implement interactive controls: Date Pickers, Multi-Select Dropdowns, Sliders, and File Uploaders.
4. Cache heavy database queries and model predictions using \`@st.cache_data\`.

---

### 1. Why Streamlit for Analytics?

Data analysts traditionally had to hand off prototypes to web developers to build interactive customer tools.
**Streamlit** enables analysts to convert Python scripts into reactive, shareable web apps in minutes without HTML, CSS, or JavaScript:

\`\`\`
   +-------------------------------------------------------------+
   |                    STREAMLIT REVENUE APP                    |
   +-------------------------------------------------------------+
   | [Sidebar Filters]         [Main KPI Metrics Panel]          |
   | - Region: [Europe v]      Total ARR: $4.2M (+14% YoY)       |
   | - Segment: [Enterprise v] Active Cohorts: 1,420             |
   | - Date Range Slider       Churn Rate: 2.1%                  |
   |                                                             |
   | [Interactive Plotly Revenue Waterfall Chart]                |
   | [Download Filtered CSV Report Button]                       |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Building a Production Streamlit Dashboard

\`\`\`python
import streamlit as st
import pandas as pd
import plotly.express as px

# 1. Page Configuration
st.set_page_config(
    page_title="Nalanda Revenue Intelligence", 
    page_icon="📊", 
    layout="wide"
)

# 2. Performance Caching: Runs query once and caches in memory!
@st.cache_data(ttl=3600)
def load_data():
    df = pd.read_parquet("sales_data.parquet")
    df['order_date'] = pd.to_datetime(df['order_date'])
    return df

df = load_data()

# 3. Sidebar Interactive Controls
st.sidebar.header("Filter Criteria")
selected_regions = st.sidebar.multiselect(
    "Select Regions", 
    options=df['region'].unique(), 
    default=df['region'].unique()
)

min_date = df['order_date'].min().date()
max_date = df['order_date'].max().date()
date_range = st.sidebar.date_input("Date Range", [min_date, max_date])

# Filter dataframe
filtered_df = df[
    (df['region'].isin(selected_regions)) &
    (df['order_date'].dt.date >= date_range[0]) &
    (df['order_date'].dt.date <= date_range[1])
]

# 4. Top-Level Metric Cards
col1, col2, col3 = st.columns(3)
col1.metric("Total Revenue", f"\${filtered_df['amount'].sum():,.2f}", "+12% YoY")
col2.metric("Total Orders", f"{len(filtered_df):,}", "+5%")
col3.metric("Avg Order Value", f"\${filtered_df['amount'].mean():.2f}")

# 5. Interactive Chart
fig = px.line(
    filtered_df.groupby('order_date')['amount'].sum().reset_index(),
    x='order_date',
    y='amount',
    title="Daily Revenue Trajectory"
)
st.plotly_chart(fig, use_container_width=True)

# 6. Data Export Action
csv = filtered_df.to_csv(index=False).encode('utf-8')
st.download_button("Download Filtered Dataset", csv, "filtered_orders.csv", "text/csv")
\`\`\`

---

### 3. Caching Strategy: @st.cache_data vs. @st.cache_resource

- **\`@st.cache_data\`**: Caches data structures (DataFrames, JSON, lists). Ideal for database query results and CSV reading.
- **\`@st.cache_resource\`**: Caches persistent shared objects (database connection pools, machine learning models, API clients).

---

### 4. Hands-on Lab: Streamlit Deployment
1. Build a multi-page Streamlit application with sidebar navigation.
2. Implement dynamic filters and interactive Plotly visuals.
3. Deploy to Streamlit Community Cloud or Docker container.`
  },
  {
    id: "CH-DNA-024",
    courseId: "CRS-DNA-001",
    title: "Financial & Operational Analytics: Variance & Working Capital",
    order: 24,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F_fP1Q9bO8M",
    content: `# Financial & Operational Analytics: Variance & Working Capital

### Learning Objectives
1. Understand core financial statements: Income Statement (P&L), Balance Sheet, and Cash Flow Statement.
2. Conduct Financial Variance Analysis: Budget vs. Actual (Favorable vs. Unfavorable variances).
3. Compute Working Capital metrics: Days Sales Outstanding (DSO), Days Inventory Outstanding (DIO), and Cash Conversion Cycle (CCC).
4. Build an EBITDA Bridge (Waterfall) chart explaining profit variances.

---

### 1. Financial Statement Architecture for Analysts

\`\`\`
   +-------------------------------------------------------------+
   |            INCOME STATEMENT (P&L) FLOW                      |
   +-------------------------------------------------------------+
   | Gross Revenue                                    $1,000,000 |
   |   - Cost of Goods Sold (COGS)                    - $400,000 |
   | = Gross Profit                                     $600,000 |
   |   - Operating Expenses (OpEx): R&D, Sales, G&A   - $350,000 |
   | = EBITDA (Operating Profit)                        $250,000 |
   |   - Depreciation & Amortization                  -  $30,000 |
   | = EBIT (Operating Income)                          $220,000 |
   |   - Interest & Taxes                             -  $50,000 |
   | = Net Income (Bottom Line Profit)                  $170,000 |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. The Cash Conversion Cycle (CCC)

Working capital measures operational liquidity. The **Cash Conversion Cycle** tracks how many days cash is tied up from raw materials to customer payment:

$$\\text{Cash Conversion Cycle (Days)} = \\text{DIO} + \\text{DSO} - \\text{DPO}$$

Where:
- **DIO (Days Inventory Outstanding)**: Average days inventory sits in warehouse before selling:
  $$\\text{DIO} = \\frac{\\text{Average Inventory}}{\\text{COGS}} \\times 365$$
- **DSO (Days Sales Outstanding)**: Average days to collect cash from customers after a sale:
  $$\\text{DSO} = \\frac{\\text{Accounts Receivable}}{\\text{Total Credit Sales}} \\times 365$$
- **DPO (Days Payable Outstanding)**: Average days the company takes to pay suppliers:
  $$\\text{DPO} = \\frac{\\text{Accounts Payable}}{\\text{COGS}} \\times 365$$

*(A shorter or negative CCC means the company generates cash flow before paying suppliers—like Amazon or Apple!)*

---

### 3. Financial Variance Analysis (Price-Volume-Mix)

When quarterly revenue deviates from budget, variance analysis decomposes the variance into distinct root drivers:

$$\\text{Total Revenue Variance} = \\text{Actual Revenue} - \\text{Budgeted Revenue}$$
- **Price Variance**: Deviation caused by charging higher or lower prices:
  $$(\\text{Actual Price} - \\text{Budget Price}) \\times \\text{Actual Volume}$$
- **Volume Variance**: Deviation caused by selling more or fewer units:
  $$(\\text{Actual Volume} - \\text{Budget Volume}) \\times \\text{Budget Price}$$

---

### 4. Hands-on Lab: EBITDA Bridge Waterfall
1. Load a budgeted vs. actual financial ledger.
2. Isolate revenue variance into price vs. volume drivers.
3. Construct an interactive Plotly Waterfall chart visualizing the reconciliation bridge from Budget EBITDA to Actual EBITDA.`
  }
];

export const phase4Assessments = [
  {
    id: "ASM-DNA-019",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-019",
    title: "Assessment: SaaS & Product Metrics",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-019-01",
        text: "What does Net Revenue Retention (NRR) measure in SaaS recurring revenue analytics?",
        options: [
          "The percentage of recurring revenue retained from existing customers over a period, factoring in expansions, contractions, and churn",
          "Total profit earned from physical products",
          "The speed of customer support ticket responses",
          "Total marketing ad spend"
        ],
        correctAnswer: 0,
        explanation: "NRR evaluates revenue retention from the existing customer base, including upsells and accounting for churn."
      },
      {
        id: "Q-DNA-019-02",
        text: "What phenomenon occurs when a SaaS company achieves an NRR greater than 100% (e.g. 125%)?",
        options: [
          "Negative Churn: expansion revenue from retained customers outpaces all lost revenue from churned/contracted customers",
          "The company is going bankrupt",
          "All customers have cancelled their subscriptions",
          "The database has calculated numbers incorrectly"
        ],
        correctAnswer: 0,
        explanation: "NRR > 100% means existing accounts expand faster than churn, driving growth even without new customer acquisition."
      },
      {
        id: "Q-DNA-019-03",
        text: "What is the formula for the SaaS Quick Ratio?",
        options: [
          "(New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)",
          "Total Revenue / Total Employees",
          "Current Assets / Current Liabilities",
          "Total Marketing Spend / Total Customers"
        ],
        correctAnswer: 0,
        explanation: "The SaaS Quick Ratio measures growth velocity relative to revenue decay: (New + Expansion) / (Churn + Contraction)."
      },
      {
        id: "Q-DNA-019-04",
        text: "What is considered a healthy SaaS Quick Ratio benchmark indicating efficient growth?",
        options: ["Greater than 4.0", "Less than 0.5", "Exactly 1.0", "Negative 2.0"],
        correctAnswer: 0,
        explanation: "A Quick Ratio > 4.0 indicates the company generates \$4 of new/expanded MRR for every \$1 lost to churn."
      },
      {
        id: "Q-DNA-019-05",
        text: "What does the CAC Payback Period measure?",
        options: [
          "The number of months required for a customer to generate sufficient gross profit to fully pay back the cost of acquiring them",
          "How long it takes a developer to get hired",
          "The warranty period of office computers",
          "The credit card transaction settlement delay"
        ],
        correctAnswer: 0,
        explanation: "CAC Payback tracks how many months of customer gross margin are needed to recoup acquisition expenses."
      },
      {
        id: "Q-DNA-019-06",
        text: "What is considered the gold-standard LTV / CAC ratio benchmark for sustainable venture-backed SaaS businesses?",
        options: ["Approximately 3.0 (or 3:1)", "0.5 (or 1:2)", "100.0", "0.0"],
        correctAnswer: 0,
        explanation: "An LTV/CAC ratio of ~3:1 represents a healthy balance of acquisition efficiency and growth investment."
      },
      {
        id: "Q-DNA-019-07",
        text: "How does Gross Revenue Retention (GRR) differ from Net Revenue Retention (NRR)?",
        options: [
          "GRR excludes expansion revenue, measuring pure retention of the original contracted base (max 100%); NRR includes expansion",
          "GRR is calculated in Euros; NRR is calculated in Dollars",
          "GRR only applies to mobile apps",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "GRR never includes upsells or expansion, isolating how well the core product prevents downgrades and churn."
      },
      {
        id: "Q-DNA-019-08",
        text: "What is 'Reactivation MRR' in an MRR waterfall bridge?",
        options: [
          "Revenue generated when a previously churned or cancelled customer reactivates a paid subscription",
          "Interest earned from a corporate bank account",
          "Money refunded to dissatisfied users",
          "Revenue from new trial users"
        ],
        correctAnswer: 0,
        explanation: "Reactivation MRR accounts for churned accounts that resume paid subscriptions in the current period."
      },
      {
        id: "Q-DNA-019-09",
        text: "What does ARPU stand for?",
        options: ["Average Revenue Per User", "Annual Recurring Profit Unit", "Automated Return Payment Union", "Aggregated Retention Probability Unit"],
        correctAnswer: 0,
        explanation: "ARPU (Average Revenue Per User) measures average revenue generated per active subscriber."
      },
      {
        id: "Q-DNA-019-10",
        text: "If a company has an LTV/CAC ratio of 0.8, what does this indicate about their business model?",
        options: [
          "The company loses money on every acquired customer; marketing acquisition spend is unsustainable",
          "The company is extremely profitable",
          "The company is acquiring customers for free",
          "The churn rate is zero"
        ],
        correctAnswer: 0,
        explanation: "LTV/CAC < 1.0 means customer lifetime value is less than the cost to acquire them, resulting in net losses."
      }
    ]
  },
  {
    id: "ASM-DNA-020",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-020",
    title: "Assessment: E-Commerce & Retail Performance Analytics",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-020-01",
        text: "What is the foundational E-Commerce Revenue Equation?",
        options: [
          "Revenue = Sessions (Traffic) * Conversion Rate * Average Order Value (AOV)",
          "Revenue = Total Products / Total Employees",
          "Revenue = Page Views * Advertising Cost",
          "Revenue = Total Clicks - Total Returns"
        ],
        correctAnswer: 0,
        explanation: "E-commerce revenue is a direct multiplicative function of traffic volume, conversion rate, and basket size (AOV)."
      },
      {
        id: "Q-DNA-020-02",
        text: "What does GMROI (Gross Margin Return on Investment) measure in retail inventory management?",
        options: [
          "How many gross profit dollars are generated for every dollar invested in inventory: Gross Margin ($) / Average Inventory Cost ($)",
          "The speed of shipping delivery trucks",
          "The return rate of damaged items",
          "The customer credit card approval rate"
        ],
        correctAnswer: 0,
        explanation: "GMROI evaluates inventory profitability by measuring gross profit return against inventory working capital."
      },
      {
        id: "Q-DNA-020-03",
        text: "How is the Shopping Cart Abandonment Rate calculated?",
        options: [
          "(Total Carts Created - Completed Purchases) / Total Carts Created * 100",
          "Total Purchases / Total Site Visits * 100",
          "Total Returned Items / Total Orders * 100",
          "Total Refunds / Total Revenue"
        ],
        correctAnswer: 0,
        explanation: "Cart abandonment measures the percentage of shopping carts initiated that do not culminate in a purchase."
      },
      {
        id: "Q-DNA-020-04",
        text: "What is Gross Merchandise Value (GMV)?",
        options: [
          "The total gross sales dollar volume of merchandise transacted through a marketplace over a specified time period",
          "The net profit after all corporate taxes",
          "The weight of all physical packages shipped",
          "The salary of the retail sales team"
        ],
        correctAnswer: 0,
        explanation: "GMV represents total gross customer merchandise spend prior to deductions for discounts and platform fees."
      },
      {
        id: "Q-DNA-020-05",
        text: "If an e-commerce site has 50,000 sessions and completes 1,500 transactions, what is the Conversion Rate?",
        options: ["3.0% (1,500 / 50,000)", "0.3%", "15.0%", "30.0%"],
        correctAnswer: 0,
        explanation: "Conversion Rate = (1,500 transactions / 50,000 sessions) * 100 = 3.0%."
      },
      {
        id: "Q-DNA-020-06",
        text: "What does a high Inventory Turnover Ratio indicate?",
        options: [
          "Inventory is selling rapidly, minimizing carrying costs and working capital tie-up",
          "Products are sitting in warehouses for years without selling",
          "The company is losing money on every order",
          "The website has low web traffic"
        ],
        correctAnswer: 0,
        explanation: "High inventory turnover reflects strong sales demand and efficient inventory management."
      },
      {
        id: "Q-DNA-020-07",
        text: "What is ROAS in digital performance marketing?",
        options: [
          "Return on Ad Spend: Total Revenue Generated from Ads / Total Advertising Cost",
          "Rate of Automated Sales",
          "Return on Available Stock",
          "Regular Order Activity Schedule"
        ],
        correctAnswer: 0,
        explanation: "ROAS evaluates marketing campaign efficiency: Revenue divided by Advertising Expense."
      },
      {
        id: "Q-DNA-020-08",
        text: "What conversion funnel analysis insight explains a high drop-off between Cart and Checkout completion?",
        options: [
          "Friction in the checkout UX, unexpected high shipping fees, or forced account registration",
          "The product photos are too sharp",
          "The website loaded in under 1 second",
          "The customer already owns the product"
        ],
        correctAnswer: 0,
        explanation: "Unexpected fees, complex forms, and lack of guest checkout are primary drivers of checkout abandonment."
      },
      {
        id: "Q-DNA-020-09",
        text: "How is Average Order Value (AOV) calculated?",
        options: ["Total Revenue / Total Number of Orders", "Total Revenue / Total Web Visitors", "Total Units Sold / Total Orders", "Total Cost / Total Profit"],
        correctAnswer: 0,
        explanation: "AOV calculates average transaction spend: Total Revenue divided by Total Order count."
      },
      {
        id: "Q-DNA-020-10",
        text: "What is a 'Stockout' in retail analytics?",
        options: [
          "When an item is completely out of inventory when a customer attempts to purchase, resulting in lost sales and frustrated users",
          "A store clearance sale",
          "A physical fire in the warehouse",
          "A surplus of inventory"
        ],
        correctAnswer: 0,
        explanation: "Stockouts occur when inventory hits zero, causing missed sales opportunities and customer defection."
      }
    ]
  },
  {
    id: "ASM-DNA-021",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-021",
    title: "Assessment: Customer Segmentation & RFM Modeling",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-021-01",
        text: "What do the letters in the RFM customer segmentation framework represent?",
        options: [
          "Recency, Frequency, Monetary Value",
          "Reach, Follow, Maintain",
          "Revenue, Forecast, Margin",
          "Retention, Friction, Movement"
        ],
        correctAnswer: 0,
        explanation: "RFM segments customers along three behavioral dimensions: Recency, Frequency, and Monetary value."
      },
      {
        id: "Q-DNA-021-02",
        text: "In RFM scoring, how is Recency scored relative to days since last purchase?",
        options: [
          "A lower number of days since last purchase receives a HIGHER score (e.g. 5 = bought today; 1 = bought a year ago)",
          "A higher number of days receives a higher score",
          "Recency is scored in alphabetical order",
          "All customers receive score 1"
        ],
        correctAnswer: 0,
        explanation: "Recent buyers are more engaged; lower recency days receive higher quintile scores (5)."
      },
      {
        id: "Q-DNA-021-03",
        text: "What SQL window function is commonly used to divide customers into 5 equal percentage tiers (quintiles) for RFM scoring?",
        options: ["NTILE(5)", "RANK(5)", "SPLIT(5)", "DIVIDE(5)"],
        correctAnswer: 0,
        explanation: "'NTILE(5) OVER (...)' partitions sorted rows into 5 ranked buckets (1 to 5) containing ~20% of rows each."
      },
      {
        id: "Q-DNA-021-04",
        text: "Which customer segment represents 'Champions' in an RFM model?",
        options: [
          "Customers with top scores in all dimensions (e.g. R=5, F=5, M=5): bought recently, buy frequently, and spend the most",
          "Customers who haven't ordered in 2 years",
          "Users who registered but never bought",
          "Customers with score 111"
        ],
        correctAnswer: 0,
        explanation: "Champions represent high-value, highly-engaged VIP customers with top scores across all three dimensions."
      },
      {
        id: "Q-DNA-021-05",
        text: "What strategic marketing action is recommended for the 'At Risk' customer segment (high past spend and frequency, but low recency)?",
        options: [
          "Personalized win-back campaigns, executive check-in calls, or exclusive incentives to re-engage them before they churn",
          "Stop sending them emails completely",
          "Cancel their account immediately",
          "Charge them an inactivity penalty fee"
        ],
        correctAnswer: 0,
        explanation: "At-Risk customers were loyal in the past; targeted win-back campaigns prevent them from defecting permanently."
      },
      {
        id: "Q-DNA-021-06",
        text: "What customer segment is characterized by an RFM score of '111'?",
        options: [
          "Hibernating / Lost: bought long ago, bought only once or twice, and spent minimal amounts",
          "New high-value VIPs",
          "Top champions",
          "Corporate partners"
        ],
        correctAnswer: 0,
        explanation: "Score 111 denotes lowest recency, lowest frequency, and lowest spend (dormant/lost customers)."
      },
      {
        id: "Q-DNA-021-07",
        text: "Why is behavioral RFM segmentation generally more predictive of future purchases than pure demographic segmentation (e.g. age or gender)?",
        options: [
          "Actual demonstrated purchasing behavior and transactional history are far stronger predictors of future intent than demographic proxies",
          "Because demographic data is illegal to store",
          "Because computers cannot read gender",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Past transactional actions reflect real buying intent far more accurately than broad demographic categories."
      },
      {
        id: "Q-DNA-021-08",
        text: "How should marketing teams allocate paid retargeting ad budgets for the 'Hibernating / Lost' (111) segment?",
        options: [
          "Minimize or exclude them from expensive paid ad spend; utilize low-cost automated email blasts instead",
          "Spend 80% of marketing budget on them",
          "Call them on the phone every hour",
          "Send them free gold watches"
        ],
        correctAnswer: 0,
        explanation: "Spending expensive paid ad budget to acquire unresponsive low-value churned users yields negative ROI."
      },
      {
        id: "Q-DNA-021-09",
        text: "What unsupervised machine learning algorithm is commonly used in advanced analytics to discover customer clusters beyond manual RFM rules?",
        options: ["K-Means Clustering", "Linear Regression", "Decision Trees", "Naive Bayes"],
        correctAnswer: 0,
        explanation: "K-Means clustering algorithmically groups multi-dimensional customer features into natural behavioral clusters."
      },
      {
        id: "Q-DNA-021-10",
        text: "What segment describes a customer with High Recency (5) but Low Frequency (1) and Moderate Monetary spend?",
        options: ["New / Promising Customer", "Lost customer", "Chronic churner", "Disloyal customer"],
        correctAnswer: 0,
        explanation: "Customers who bought very recently for the first time are promising new additions to nurture into repeat buyers."
      }
    ]
  },
  {
    id: "ASM-DNA-022",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-022",
    title: "Assessment: Data Storytelling & Executive Presentations",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-022-01",
        text: "What does the SCR executive narrative framework stand for?",
        options: [
          "Situation - Complication - Resolution",
          "Select - Clean - Report",
          "Standard - Compute - Review",
          "Scan - Calculate - Record"
        ],
        correctAnswer: 0,
        explanation: "SCR frames business storytelling into context (Situation), the blocker (Complication), and action (Resolution)."
      },
      {
        id: "Q-DNA-022-02",
        text: "What is the core principle of Barbara Minto's Pyramid Principle in executive communication?",
        options: [
          "Answer First: State your core recommendation or conclusion upfront, then substantiate with supporting arguments and data",
          "Save the big conclusion for the very last slide like a mystery novel",
          "Put all technical SQL code on the opening slide",
          "Never present numbers to executives"
        ],
        correctAnswer: 0,
        explanation: "The Minto Pyramid leads with the conclusion/answer, respecting executive time and framing supporting points."
      },
      {
        id: "Q-DNA-022-03",
        text: "Why do companies like Amazon utilize 6-page narrative memos instead of PowerPoint slide decks for executive reviews?",
        options: [
          "Structured narrative text forces rigorous thinking, prevents superficial bullet points, and allows deeper analysis of trade-offs",
          "Because PowerPoint was banned by law",
          "Because printers cannot print slides",
          "To make meetings 3 hours longer"
        ],
        correctAnswer: 0,
        explanation: "Narrative memos eliminate bullet-point hand-waving, forcing authors to clearly explain context, data, and logic."
      },
      {
        id: "Q-DNA-022-04",
        text: "How should an analyst handle an executive who challenges a data finding during a live presentation?",
        options: [
          "Acknowledge the question calmly, clarify assumptions, share methodology transparently, and offer a follow-up drill-down if needed",
          "Argue defensively and tell the executive they don't understand math",
          "Close the laptop and leave the room",
          "Change the numbers on the screen immediately"
        ],
        correctAnswer: 0,
        explanation: "Professional data storytelling welcomes scrutiny, addresses underlying business concerns, and validates assumptions."
      },
      {
        id: "Q-DNA-022-05",
        text: "What is cognitive load in executive presentations?",
        options: [
          "The mental effort required by the audience to parse cluttered charts, inconsistent fonts, and disorganized arguments",
          "The weight of the laptop",
          "The speed of internet downloads",
          "The number of slides in the deck"
        ],
        correctAnswer: 0,
        explanation: "Extraneous cognitive load distracts decision-makers, obscuring key takeaways with visual and structural noise."
      },
      {
        id: "Q-DNA-022-06",
        text: "What is an effective practice when designing slide titles for C-suite presentations?",
        options: [
          "Write action-oriented takeaway headlines (e.g. 'Paid CAC increased 45% due to ad saturation') rather than generic category labels (e.g. 'Marketing Data')",
          "Leave slide titles blank",
          "Write titles in Latin",
          "Use titles that only contain numbers"
        ],
        correctAnswer: 0,
        explanation: "Action headlines communicate the core takeaway immediately, even if the executive only skims titles."
      },
      {
        id: "Q-DNA-022-07",
        text: "In an executive briefing memo, where should granular methodology details and complex statistical tests be located?",
        options: [
          "In the Appendix / Supporting Notes section at the back of the document",
          "In the first sentence of the executive summary",
          "In the email subject line",
          "Methodology should never be recorded anywhere"
        ],
        correctAnswer: 0,
        explanation: "Appendices preserve analytical rigor for technical auditors without cluttering the primary executive narrative."
      },
      {
        id: "Q-DNA-022-08",
        text: "What mistake do junior data analysts most frequently make when presenting to non-technical executives?",
        options: [
          "Focusing heavily on technical tooling and algorithms (SQL syntax, libraries) rather than business impact, revenue, and decisions",
          "Wearing business attire",
          "Arriving on time to meetings",
          "Speaking English"
        ],
        correctAnswer: 0,
        explanation: "Executives care about commercial outcomes and risk mitigation, not the technical libraries used to calculate them."
      },
      {
        id: "Q-DNA-022-09",
        text: "What role does emotional resonance play in data storytelling?",
        options: [
          "Data provides the empirical proof, but narrative context and real customer pain points motivate executive action",
          "Analytics must never involve human emotion",
          "Stories are only for children's books",
          "Data eliminates the need for human leadership"
        ],
        correctAnswer: 0,
        explanation: "Numbers inform, but stories humanize data and align diverse stakeholders behind strategic change."
      },
      {
        id: "Q-DNA-022-10",
        text: "What does the 'Resolution' section of the SCR framework deliver?",
        options: [
          "A concrete, data-backed recommendation, action plan, and projected financial or operational outcome",
          "The list of software licenses used",
          "The developer's biography",
          "A copy of the entire raw database"
        ],
        correctAnswer: 0,
        explanation: "The Resolution articulates the definitive strategic path forward based on empirical findings."
      }
    ]
  },
  {
    id: "ASM-DNA-023",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-023",
    title: "Assessment: Interactive Web Apps with Streamlit",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-023-01",
        text: "How does Streamlit execute Python script code when a user interacts with a widget (such as a dropdown or slider)?",
        options: [
          "Streamlit re-runs the entire Python script from top to bottom, updating reactive outputs",
          "Streamlit only runs on Mondays",
          "Streamlit compiles code into binary C++",
          "Streamlit never re-runs scripts"
        ],
        correctAnswer: 0,
        explanation: "Streamlit's reactive model re-executes the script from top to bottom on widget state changes."
      },
      {
        id: "Q-DNA-023-02",
        text: "What Streamlit decorator is used to cache heavy data loading functions (like SQL queries or CSV parsing) to avoid re-fetching on every click?",
        options: ["@st.cache_data", "@st.memo", "@st.remember", "@st.store"],
        correctAnswer: 0,
        explanation: "'@st.cache_data' serializes and caches function results, preventing redundant database queries."
      },
      {
        id: "Q-DNA-023-03",
        text: "What Streamlit decorator is used to cache persistent, non-serializable objects like database connection pools or ML model instances?",
        options: ["@st.cache_resource", "@st.cache_data", "@st.persist", "@st.singleton"],
        correctAnswer: 0,
        explanation: "'@st.cache_resource' caches global shared resources (database pools, neural net weights) across sessions."
      },
      {
        id: "Q-DNA-023-04",
        text: "How do you place interactive controls (like multiselect filters or date pickers) into a collapsible left-hand navigation pane in Streamlit?",
        options: [
          "st.sidebar.multiselect(...) and st.sidebar.date_input(...)",
          "st.left.multiselect(...)",
          "st.pane.multiselect(...)",
          "st.nav.multiselect(...)"
        ],
        correctAnswer: 0,
        explanation: "'st.sidebar.<widget>' renders interactive controls into the left navigation drawer."
      },
      {
        id: "Q-DNA-023-05",
        text: "What Streamlit function displays high-impact KPI summary cards with current values and delta indicators?",
        options: [
          "st.metric('Total Revenue', '$1.2M', delta='+8%')",
          "st.card('Total Revenue', '$1.2M')",
          "st.kpi('Total Revenue', '$1.2M')",
          "st.summary('Total Revenue', '$1.2M')"
        ],
        correctAnswer: 0,
        explanation: "'st.metric()' renders stylized executive KPI cards with values and positive/negative deltas."
      },
      {
        id: "Q-DNA-023-06",
        text: "How do you render an interactive Plotly chart inside a Streamlit web application?",
        options: [
          "st.plotly_chart(fig, use_container_width=True)",
          "st.plot(fig)",
          "st.render(fig)",
          "st.display_chart(fig)"
        ],
        correctAnswer: 0,
        explanation: "'st.plotly_chart()' natively embeds interactive Plotly charts with responsive container sizing."
      },
      {
        id: "Q-DNA-023-07",
        text: "What widget in Streamlit allows business users to download filtered analytical data directly to their computer as a CSV file?",
        options: ["st.download_button()", "st.save_file()", "st.export()", "st.write_csv()"],
        correctAnswer: 0,
        explanation: "'st.download_button()' provides a one-click browser download of generated strings or binary blobs."
      },
      {
        id: "Q-DNA-023-08",
        text: "What mechanism in Streamlit stores variables across multiple script reruns for an individual user (e.g. multi-step forms)?",
        options: ["st.session_state", "st.globals", "st.memory", "st.cache"],
        correctAnswer: 0,
        explanation: "'st.session_state' is a dictionary-like object preserving stateful variables across reactive reruns."
      },
      {
        id: "Q-DNA-023-09",
        text: "How can you create a multi-column visual layout (e.g. 3 side-by-side metric cards) in Streamlit?",
        options: [
          "col1, col2, col3 = st.columns(3)",
          "st.split(3)",
          "st.layout(columns=3)",
          "st.grid(3)"
        ],
        correctAnswer: 0,
        explanation: "'st.columns(n)' partitions the screen horizontally into responsive container columns."
      },
      {
        id: "Q-DNA-023-10",
        text: "What file configuration in Streamlit allows customizing page titles, browser favicon icons, and wide layout mode?",
        options: [
          "st.set_page_config(page_title='...', layout='wide')",
          "st.configure()",
          "st.meta()",
          "st.header_config()"
        ],
        correctAnswer: 0,
        explanation: "'st.set_page_config()' must be called at the very top of a Streamlit app to configure window metadata."
      }
    ]
  },
  {
    id: "ASM-DNA-024",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-024",
    title: "Assessment: Financial & Operational Analytics",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-024-01",
        text: "What does EBITDA stand for in corporate financial analytics?",
        options: [
          "Earnings Before Interest, Taxes, Depreciation, and Amortization",
          "Enterprise Budget Total Distribution Analysis",
          "Estimated Bottom-line Income Tax Deduction Allowance",
          "Electronic Banking Transaction Data Archive"
        ],
        correctAnswer: 0,
        explanation: "EBITDA measures core operating profitability before non-operating financial and capital accounting items."
      },
      {
        id: "Q-DNA-024-02",
        text: "What is the formula for the Cash Conversion Cycle (CCC)?",
        options: [
          "DIO (Days Inventory) + DSO (Days Sales Outstanding) - DPO (Days Payable)",
          "Revenue - Cost of Goods Sold",
          "Gross Margin * Total Assets",
          "Net Profit / Total Equity"
        ],
        correctAnswer: 0,
        explanation: "CCC = DIO + DSO - DPO, calculating the net days cash is tied up in operating working capital."
      },
      {
        id: "Q-DNA-024-03",
        text: "What does Days Sales Outstanding (DSO) measure?",
        options: [
          "The average number of days it takes a company to collect cash payments from customers after credit sales are invoiced",
          "How long stores remain open each day",
          "The shelf life of perishable inventory",
          "The speed of website page loads"
        ],
        correctAnswer: 0,
        explanation: "DSO measures accounts receivable collection efficiency: (Accounts Receivable / Credit Sales) * 365."
      },
      {
        id: "Q-DNA-024-04",
        text: "What does a negative Cash Conversion Cycle indicate (achieved by companies like Amazon and Apple)?",
        options: [
          "The company collects cash from customers before it has to pay its suppliers for inventory, generating free operational float",
          "The company is losing money rapidly",
          "The company has zero sales",
          "A calculation error"
        ],
        correctAnswer: 0,
        explanation: "A negative CCC means operations are funded by suppliers because customer cash is collected before supplier bills are due."
      },
      {
        id: "Q-DNA-024-05",
        text: "In Financial Variance Analysis, what does Price Variance isolate?",
        options: [
          "The portion of budget revenue variance caused specifically by differences between actual selling price and budgeted selling price",
          "The inflation rate of the country",
          "The price of computer hardware",
          "Total sales volume changes"
        ],
        correctAnswer: 0,
        explanation: "Price Variance = (Actual Price - Budget Price) * Actual Volume, isolating price elasticity impacts."
      },
      {
        id: "Q-DNA-024-06",
        text: "What chart type is universally used in financial analytics to visualize the step-by-step reconciliation bridge from Budget EBITDA to Actual EBITDA?",
        options: ["Waterfall Chart (Bridge Chart)", "Donut Chart", "Scatter Plot", "Radar Chart"],
        correctAnswer: 0,
        explanation: "Waterfall charts visualize the cumulative effect of positive and negative variance drivers bridging two sums."
      },
      {
        id: "Q-DNA-024-07",
        text: "What is Gross Profit in an Income Statement?",
        options: ["Gross Revenue minus Cost of Goods Sold (COGS)", "Net Income minus Taxes", "Total Assets minus Liabilities", "Total Operating Expenses"],
        correctAnswer: 0,
        explanation: "Gross Profit equals Gross Revenue minus the direct Cost of Goods Sold (COGS)."
      },
      {
        id: "Q-DNA-024-08",
        text: "What is Days Payable Outstanding (DPO)?",
        options: [
          "The average number of days a company takes to pay trade creditors and suppliers",
          "The number of days an employee takes off",
          "How long customers have to return items",
          "The duration of bank loan terms"
        ],
        correctAnswer: 0,
        explanation: "DPO measures accounts payable duration: (Accounts Payable / COGS) * 365."
      },
      {
        id: "Q-DNA-024-09",
        text: "What is a 'Favorable Variance' in financial budget tracking?",
        options: [
          "A variance that results in higher profit than budgeted (e.g. revenue higher than budget, or costs lower than budget)",
          "A variance that makes the CFO angry",
          "A variance of exactly zero",
          "An accounting error"
        ],
        correctAnswer: 0,
        explanation: "Favorable variances improve operating profit relative to baseline budget expectations."
      },
      {
        id: "Q-DNA-024-10",
        text: "What is Working Capital?",
        options: [
          "Current Assets minus Current Liabilities: a measure of a company's short-term liquidity and operational health",
          "Total money spent on office buildings",
          "Total salary paid to employees",
          "The amount of cash in the CEO's wallet"
        ],
        correctAnswer: 0,
        explanation: "Working Capital = Current Assets - Current Liabilities, evaluating short-term operational solvency."
      }
    ]
  }
];

export const phase4 = {
  chapters: phase4Chapters,
  assessments: phase4Assessments
};
