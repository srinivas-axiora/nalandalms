// Phase 2: Data Wrangling, Advanced SQL & Feature Engineering (Chapters 7 to 12) - Data Science
// World-class curriculum: Zero to employable master.

export const phase2 = {
  chapters: [
    // ── Chapter 7 ──
    {
      id: "CH-DSC-007",
      courseId: "CRS-DSC-001",
      sequence: 7,
      title: "Data Cleaning, Missing Data Imputation & Outlier Detection",
      description: "Mechanisms of missingness (MCAR, MAR, MNAR), MICE & KNN imputation, isolation of anomalies via IQR, Z-Score, Isolation Forests, and robust data sanitization pipelines.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Data Wrangling • Chapter 7</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Data Cleaning, Missing Data Imputation & Outlier Detection</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Real-world data is messy, incomplete, and noisy. 80% of an enterprise data scientist's time is dedicated to data hygiene. Simply deleting missing rows or replacing them with a blind mean introduces lethal sampling bias and compromises downstream predictive validity. In this chapter, we master modern missing data imputation and robust outlier detection algorithms.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/2apkqwsmr3Q" title="Data Cleaning & Imputation Techniques" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 3 Mechanisms of Missing Data (Little & Rubin Taxonomy)</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">1. Missing Completely at Random (MCAR)</h3>
      <p style="font-size:14px;color:#475569;">The probability of missingness is completely independent of both observed and unobserved data (e.g., a lab technician accidentally dropping a sample vial). Row deletion causes loss of statistical power, but does not introduce systematic bias.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">2. Missing at Random (MAR)</h3>
      <p style="font-size:14px;color:#475569;">The probability of missingness depends on observed data, but not on the missing value itself (e.g., men may be less likely to report depression scores, but within the male subset, missingness is random). Multiple Imputation (MICE) or KNN imputation handles MAR gracefully.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#ef4444;margin-top:0;">3. Missing Not at Random (MNAR)</h3>
      <p style="font-size:14px;color:#475569;">The probability of missingness directly relates to the value that is missing (e.g., individuals with ultra-high incomes refusing to declare salary). Imputation without domain modeling produces profound bias; adding a binary missingness indicator column is mandatory.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Multivariate Imputation by Chained Equations (MICE) in Python</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np
import pandas as pd
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.ensemble import ExtraTreesRegressor

# Sample dataframe with MAR patterns
df = pd.DataFrame({
    'age': [25, 47, np.nan, 35, 60, 22, np.nan],
    'income': [50000, 120000, 85000, np.nan, 190000, 42000, 95000],
    'credit_score': [680, 780, 710, 690, np.nan, 620, 740]
})

# MICE fits a regression model per feature using all other features iteratively
mice_imputer = IterativeImputer(
    estimator=ExtraTreesRegressor(n_estimators=50, random_state=42),
    max_iter=15,
    random_state=42
)
df_clean = pd.DataFrame(mice_imputer.fit_transform(df), columns=df.columns)
print("Imputed DataFrame:\\n", df_clean)</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. Outlier Isolation: IQR vs Isolation Forests</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">While Tukey's IQR rule (\\(Q1 - 1.5 \\times IQR\\) to \\(Q3 + 1.5 \\times IQR\\)) is standard for univariate distributions, high-dimensional datasets require non-parametric anomaly detection such as <strong>Isolation Forests</strong>. Isolation Forests isolate observations by randomly partitioning feature space; anomalies require substantially fewer splits to be separated.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Never default to listwise row deletion unless MCAR can be mathematically confirmed and data volume exceeds millions.</li>
      <li>Use <code>IterativeImputer</code> (MICE) or <code>KNNImputer</code> to preserve feature covariance structures during imputation.</li>
      <li>For multi-modal, multivariate outliers, deploy <code>IsolationForest</code> from Scikit-Learn with a tuned contamination rate.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 8 ──
    {
      id: "CH-DSC-008",
      courseId: "CRS-DSC-001",
      sequence: 8,
      title: "Feature Engineering: Categorical Encoding & Feature Scaling",
      description: "One-Hot vs Target Encoding, Weight of Evidence (WoE), cyclical datetime features, MinMax vs Robust vs StandardScaler, and Power Transforms.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Data Wrangling • Chapter 8</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Feature Engineering: Categorical Encoding & Feature Scaling</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Feature engineering is the single highest leverage point in applied predictive modeling. While algorithms continue to commoditize, the mathematical representation of domain knowledge separates high-performance models from baseline noise. In this chapter, we master modern encoding methodologies and optimal numerical transformations.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/6W8zxms0hU8" title="Feature Engineering Masterclass" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Categorical Encoding Matrix</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Strategy</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Cardinality Best Fit</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Curse of Dimensionality</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Target Leakage Risk</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>One-Hot Encoding</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Low (< 15 unique values)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Severe in high cardinality</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Zero</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Target / Mean Encoding</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">High (Postal codes, Merchants)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">None (1 single numeric column)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Critical (Requires K-fold out-of-fold smoothing)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Weight of Evidence (WoE)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Medium-High (Credit Scoring)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">None (Monotonic logistic transformation)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Moderate (Must compute on train split only)</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Cyclical Feature Transformations (Trigonometric Encoding)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np
import pandas as pd

# Preserving periodic continuity in Hour of Day (23:00 is next to 00:00)
hours = pd.Series([23, 0, 1, 12, 13])

sin_hour = np.sin(2 * np.pi * hours / 24)
cos_hour = np.cos(2 * np.pi * hours / 24)

# Plotting sin vs cos preserves Euclidean proximity of midnight!
encoded_time = pd.DataFrame({'sin_hour': sin_hour, 'cos_hour': cos_hour})
print(encoded_time)</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">3. Numerical Scaling: Standard vs Robust vs Quantile</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Distance-based models (KNN, SVM, K-Means) and gradient descent optimizers (Neural Networks, Logistic Regression) are heavily sensitive to feature scale. When outliers are prevalent, standard \\(Z = (X - \\mu)/\\sigma\\) shrinks normal points into near-zero variance. <strong>RobustScaler</strong> uses median and IQR, preventing outlier distortion.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always fit transformers (scalers, encoders) strictly on the Training set, then transform the Test set to eliminate target leakage.</li>
      <li>For high-cardinality features in tree models, use Target Encoding with Gaussian smoothing or CatBoost encoding.</li>
      <li>Use trigonometric sine/cosine pairs to capture cyclical temporal attributes (hour, day of week, month).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 9 ──
    {
      id: "CH-DSC-009",
      courseId: "CRS-DSC-001",
      sequence: 9,
      title: "Exploratory Data Analysis (EDA) with Seaborn & Plotly",
      description: "Visualizing multivariate distributions, correlation heatmaps, pairplots, violin plots, and interactive production dashboards using Plotly Express.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Data Wrangling • Chapter 9</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Exploratory Data Analysis (EDA) with Seaborn & Plotly</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Exploratory Data Analysis is not simply generating colorful charts; it is statistical detective work. EDA uncovers non-linear dependencies, multi-collinearity, class imbalances, and data artifacts that mislead algorithms. We master high-impact visualization patterns with Seaborn and interactive Plotly graphics.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/GPVsHOlRBBI" title="Seaborn & Plotly Masterclass" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Seaborn Advanced Statistical Diagnostics</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import seaborn as sns
import matplotlib.pyplot as plt

# Load sample enterprise churn dataset
df = sns.load_dataset('titanic')

# Visualizing distributions & density across classes with Violin Plots
plt.figure(figsize=(10, 6))
sns.violinplot(
    data=df,
    x='class',
    y='fare',
    hue='survived',
    split=True,
    inner='quartile',
    palette='muted'
)
plt.title("Fare Distribution vs Survival Across Passenger Classes")
plt.yscale('log') # Log scale accommodates heavy-tailed spending
plt.show()</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Interactive Visualizations with Plotly Express</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import plotly.express as px

# High-dimensional interactive scatter plot with hover tooltip metadata
fig = px.scatter(
    df,
    x="age",
    y="fare",
    color="survived",
    size="pclass",
    hover_data=["sex", "embark_town"],
    title="Interactive Passenger Profiling",
    color_continuous_scale=px.colors.diverging.Tealrose
)
# fig.show() renders full WebGL hardware-accelerated interactive canvas</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Violin plots merge boxplots with kernel density estimations, displaying multi-modality hidden by summary metrics.</li>
      <li>Correlation heatmaps must be computed with Spearman's rank correlation when features display non-linear monotonic relations.</li>
      <li>Interactive Plotly graphics enable domain experts to filter, zoom, and inspect outliers without rewriting code.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 10 ──
    {
      id: "CH-DSC-010",
      courseId: "CRS-DSC-001",
      sequence: 10,
      title: "Advanced SQL for Data Science: Window Functions & CTEs",
      description: "Window partitioning, running aggregates, LEAD/LAG time-series queries, recursive Common Table Expressions (CTEs), and query optimization for analytic warehouses.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Data Wrangling • Chapter 10</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Advanced SQL for Data Science: Window Functions & CTEs</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">SQL is the universal language of production data stores. Whether running on Snowflake, BigQuery, PostgreSQL, or Databricks Photon, writing clean, high-performance analytic SQL eliminates millions of rows of inefficient local Python computations.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/Ww71knvhQ-s" title="Advanced SQL Window Functions" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Analytical Window Functions: Cohort Retention & Churn SQL</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>-- Computing 7-day rolling average spend and days since last purchase
WITH UserDailySpend AS (
    SELECT
        user_id,
        transaction_date,
        SUM(amount) AS daily_spend
    FROM transactions
    GROUP BY user_id, transaction_date
),
WindowMetrics AS (
    SELECT
        user_id,
        transaction_date,
        daily_spend,
        -- Rolling 7-day average spend per user
        AVG(daily_spend) OVER (
            PARTITION BY user_id
            ORDER BY transaction_date
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) AS rolling_7d_spend,
        -- Days elapsed since the previous transaction
        transaction_date - LAG(transaction_date, 1) OVER (
            PARTITION BY user_id
            ORDER BY transaction_date
        ) AS days_since_last_purchase,
        -- Ranking purchases by order of magnitude
        DENSE_RANK() OVER (
            PARTITION BY user_id
            ORDER BY daily_spend DESC
        ) AS spend_rank
    FROM UserDailySpend
)
SELECT * FROM WindowMetrics
WHERE spend_rank <= 5;</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Window functions calculate metrics across row partitions without collapsing the underlying dataset granularity.</li>
      <li><code>LAG()</code> and <code>LEAD()</code> unlock lag-feature engineering directly inside the data warehouse prior to ML extraction.</li>
      <li>Common Table Expressions (CTEs) modularize complex analytic pipelines, significantly improving maintainability over deeply nested subqueries.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 11 ──
    {
      id: "CH-DSC-011",
      courseId: "CRS-DSC-001",
      sequence: 11,
      title: "Web Scraping & Data Ingestion (BeautifulSoup & Playwright)",
      description: "Extracting unstructured external data, handling dynamic SPA rendering with Playwright, rate-limiting, proxy rotation, and resilient schema ingestion.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Data Wrangling • Chapter 11</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Web Scraping & Data Ingestion (BeautifulSoup & Playwright)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Data science frequently requires augmenting internal databases with external market signals, competitor pricing, and social sentiment. We build resilient, asynchronous ingestion crawlers capable of parsing modern JavaScript-heavy Single Page Applications.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/fKLXQ5fWn_o" title="Modern Web Scraping with Python" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Asynchronous Headless Scraping with Playwright</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import asyncio
from playwright.async_api import async_playwright

async def scrape_dynamic_listings():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Navigate to target page and wait for DOM hydration
        await page.goto("https://news.ycombinator.com")
        await page.wait_for_selector(".athing")
        
        # Extract title and link elements
        articles = await page.eval_on_selector_all(
            ".athing",
            """elements => elements.map(el => ({
                title: el.querySelector('.titleline > a').innerText,
                url: el.querySelector('.titleline > a').href
            }))"""
        )
        await browser.close()
        return articles

# data = asyncio.run(scrape_dynamic_listings())</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Use BeautifulSoup4 + HTTPX for static HTML endpoints where raw server-side rendering is available.</li>
      <li>Deploy Playwright for complex client-side Single Page Applications (React, Vue, Angular) requiring automated user interaction.</li>
      <li>Respect robots.txt and implement jittered exponential backoff to ensure ethical, compliant crawler operations.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 12 ──
    {
      id: "CH-DSC-012",
      courseId: "CRS-DSC-001",
      sequence: 12,
      title: "Big Data Formats: Parquet, Feather & Apache Arrow",
      description: "Columnar storage principles, Snappy compression, dictionary encoding, memory-mapped IPC with Apache Arrow, and benchmarking CSV vs Parquet.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 2: Data Wrangling • Chapter 12</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Big Data Formats: Parquet, Feather & Apache Arrow</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Storing production data in CSV format is an anti-pattern. CSV lacks schema enforcement, requires expensive text parsing on every load, and causes massive memory bottlenecks. Columnar formats such as Parquet and Feather leverage Apache Arrow to achieve 10x-50x speedups and 80% disk compression.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/6d5u3B60e4A" title="Apache Arrow and Parquet Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. CSV vs Parquet vs Feather Benchmark Matrix</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Metric</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">CSV</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Parquet (Snappy)</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Feather (Arrow IPC)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Storage Format</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Row-oriented text</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Columnar binary</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Columnar in-memory mirror</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Disk Footprint (10M rows)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">~1.2 GB</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">~180 MB (85% reduction)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">~320 MB</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Read Throughput</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Baseline (1x)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">15x - 30x faster</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">40x - 60x (Near zero-copy)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Schema Enforcement</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">None (Inferred, error-prone)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Strict typed metadata</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Strict typed metadata</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Zero-Copy Ingestion with PyArrow</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import pyarrow as pa
import pyarrow.parquet as pq

# Creating an Arrow Table with explicit datatype schemas
schema = pa.schema([
    ('user_id', pa.int64()),
    ('risk_score', pa.float32()),
    ('country_code', pa.string())
])

# Write to disk with Snappy compression and column dictionary encoding
# pq.write_table(arrow_table, 'enterprise_analytics.parquet', compression='snappy')

# Selective column loading (Projection Pushdown directly at I/O layer)
filtered_table = pq.read_table(
    'enterprise_analytics.parquet',
    columns=['user_id', 'risk_score']
)
print("Loaded columns:", filtered_table.column_names)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Parquet is the premier format for long-term cold/warm analytic data storage in data lakes.</li>
      <li>Feather (Arrow IPC) provides the fastest inter-process serialization format for ephemeral ML feature staging.</li>
      <li>Columnar engines read only the requested columns, avoiding wasteful reading of millions of unused bytes.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-DSC-007",
      title: "Data Cleaning & Imputation Assessment",
      chapterId: "CH-DSC-007",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-007-01", type: "MCQ", prompt: "What missingness mechanism occurs when the probability of missing data depends on observed features but not the missing value itself?", options: ["Missing at Random (MAR)", "Missing Completely at Random (MCAR)", "Missing Not at Random (MNAR)", "Deterministic Missingness"], answer: 0, points: 10 },
        { id: "Q-DSC-007-02", type: "MCQ", prompt: "What algorithm does MICE (IterativeImputer) employ to impute missing values across multiple variables?", options: ["It iteratively fits regression models for each feature using all other features", "It randomly picks numbers", "It fills all blanks with zero", "It deletes all incomplete rows"], answer: 0, points: 10 },
        { id: "Q-DSC-007-03", type: "MCQ", prompt: "Why is mean imputation considered dangerous in predictive modeling?", options: ["It artificially reduces feature variance and distorts covariance with other variables", "It increases dataset size", "It requires GPU acceleration", "It is incompatible with numbers"], answer: 0, points: 10 },
        { id: "Q-DSC-007-04", type: "MCQ", prompt: "In Tukey's IQR rule, what threshold defines an outlier beyond the upper quartile Q3?", options: ["Q3 + 1.5 * IQR", "Q3 + 3.0 * IQR", "Q3 + 0.5 * IQR", "Q3 + 2.0 * std"], answer: 0, points: 10 },
        { id: "Q-DSC-007-05", type: "MCQ", prompt: "How does an Isolation Forest identify anomalies in multidimensional datasets?", options: ["By measuring how few random partition splits are required to isolate a point", "By computing distance to the origin", "By training a deep neural network", "By clustering with K-Means"], answer: 0, points: 10 },
        { id: "Q-DSC-007-06", type: "MCQ", prompt: "When data is Missing Not at Random (MNAR), what practical feature engineering technique should accompany imputation?", options: ["Adding a binary indicator column flagging whether the feature was originally missing", "Dropping the target variable", "Multiplying the column by -1", "Reversing row order"], answer: 0, points: 10 },
        { id: "Q-DSC-007-07", type: "MCQ", prompt: "Which Scikit-Learn imputer uses nearest neighbor distances to impute missing values?", options: ["KNNImputer", "SimpleImputer", "IterativeImputer", "StandardScaler"], answer: 0, points: 10 },
        { id: "Q-DSC-007-08", type: "MCQ", prompt: "What is the standard Z-score threshold commonly used to flag potential univariate outliers under a normal distribution?", options: ["|Z| > 3.0", "|Z| > 1.0", "|Z| > 0.5", "|Z| > 10.0"], answer: 0, points: 10 },
        { id: "Q-DSC-007-09", type: "MCQ", prompt: "Why is listwise deletion (dropping rows with any NaN) unacceptable in enterprise credit risk modeling?", options: ["It discards valuable data and introduces systemic demographic bias if data is MAR/MNAR", "It makes the database slower", "It modifies column headers", "It converts floats to strings"], answer: 0, points: 10 },
        { id: "Q-DSC-007-10", type: "MCQ", prompt: "In Scikit-Learn's IsolationForest, what does the 'contamination' parameter control?", options: ["The expected proportion of outliers present in the dataset", "The number of trees in the forest", "The maximum depth of splits", "The random seed"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-008",
      title: "Categorical Encoding & Scaling Assessment",
      chapterId: "CH-DSC-008",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-008-01", type: "MCQ", prompt: "Why is One-Hot Encoding impractical for high-cardinality features such as zip codes with 10,000 distinct values?", options: ["It induces severe sparsity and the curse of dimensionality", "It crashes the CPU permanently", "It converts integers into strings", "It reverses the gradient direction"], answer: 0, points: 10 },
        { id: "Q-DSC-008-02", type: "MCQ", prompt: "What critical risk is associated with naive Target Encoding if not mitigated by K-fold out-of-fold smoothing?", options: ["Target leakage leading to severe overfitting", "Underfitting due to low variance", "Division by zero in all rows", "Data truncation"], answer: 0, points: 10 },
        { id: "Q-DSC-008-03", type: "MCQ", prompt: "How should cyclical temporal features (such as 24-hour time or months of the year) be encoded?", options: ["Using sine and cosine trigonometric pairs", "Using standard integer LabelEncoding (0-23)", "Using random hash encoding", "Using MinMax scaling to [0, 1]"], answer: 0, points: 10 },
        { id: "Q-DSC-008-04", type: "MCQ", prompt: "Why does RobustScaler outperform StandardScaler when features contain extreme outliers?", options: ["RobustScaler scales data using the median and Interquartile Range (IQR) rather than mean and variance", "RobustScaler deletes all outliers automatically", "RobustScaler transforms data into complex numbers", "RobustScaler runs on GPU"], answer: 0, points: 10 },
        { id: "Q-DSC-008-05", type: "MCQ", prompt: "To prevent data leakage during preprocessing, on which data partition should a scaler or encoder be fit?", options: ["Strictly on the Training set only", "On the entire dataset prior to splitting", "Strictly on the Test set only", "On the Validation set only"], answer: 0, points: 10 },
        { id: "Q-DSC-008-06", type: "MCQ", prompt: "What does Weight of Evidence (WoE) measure in binary classification feature engineering?", options: ["The natural log of the ratio of non-events to events for a specific category", "The standard deviation of the feature", "The total count of rows", "The Pearson correlation with age"], answer: 0, points: 10 },
        { id: "Q-DSC-008-07", type: "MCQ", prompt: "What mathematical transformation scales feature values to a bounded range between [0, 1]?", options: ["MinMaxScaler", "StandardScaler", "Normalizer", "RobustScaler"], answer: 0, points: 10 },
        { id: "Q-DSC-008-08", type: "MCQ", prompt: "What is the primary purpose of applying a Yeo-Johnson or Box-Cox power transform to a skewed numeric feature?", options: ["To transform the skewed distribution into an approximately Gaussian normal distribution", "To round numbers to integers", "To double the values", "To drop missing entries"], answer: 0, points: 10 },
        { id: "Q-DSC-008-09", type: "MCQ", prompt: "Why do decision-tree based models (Random Forest, XGBoost) generally not require feature scaling?", options: ["Splits in tree nodes are monotonic and depend only on rank order, not feature magnitude", "Trees automatically normalize data to [0,1]", "Trees do not accept floating-point numbers", "Trees only run on categorical data"], answer: 0, points: 10 },
        { id: "Q-DSC-008-10", type: "MCQ", prompt: "What encoder maps infrequent categories into a single 'Other' bucket to prevent cardinality explosion?", options: ["CategoryEncoder with min_frequency / max_categories threshold", "OneHotEncoder(drop='first')", "LabelBinarizer", "StandardScaler"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-009",
      title: "Exploratory Data Analysis Assessment",
      chapterId: "CH-DSC-009",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-009-01", type: "MCQ", prompt: "What visualization merges a box plot with a kernel density estimation to show distribution shape and probability density?", options: ["Violin plot", "Bar chart", "Pie chart", "Scatter matrix"], answer: 0, points: 10 },
        { id: "Q-DSC-009-02", type: "MCQ", prompt: "When two variables have a non-linear but strictly monotonic relationship, which correlation coefficient is most appropriate?", options: ["Spearman rank correlation", "Pearson correlation", "Cosine distance", "Euclidean norm"], answer: 0, points: 10 },
        { id: "Q-DSC-009-03", type: "MCQ", prompt: "In a Seaborn heatmap displaying a feature correlation matrix, what does a correlation value of +0.98 between two independent variables signify?", options: ["High multicollinearity requiring potential feature pruning or regularization", "Zero relationship between features", "Perfect negative correlation", "Invalid data"], answer: 0, points: 10 },
        { id: "Q-DSC-009-04", type: "MCQ", prompt: "What Seaborn function plots pairwise bivariate distributions across all numerical columns in a DataFrame?", options: ["sns.pairplot()", "sns.catplot()", "sns.heatmap()", "sns.stripplot()"], answer: 0, points: 10 },
        { id: "Q-DSC-009-05", type: "MCQ", prompt: "What rendering technology enables Plotly Express charts to provide interactive zooming, panning, and tooltips in web browsers?", options: ["WebGL / D3.js JavaScript engine", "Server-side static PNG rendering", "Flash Player", "DirectX 12 executable"], answer: 0, points: 10 },
        { id: "Q-DSC-009-06", type: "MCQ", prompt: "What plot is ideal for visualizing the relationship between two continuous variables conditioned on a categorical class?", options: ["Scatter plot with hue coloring", "Single histogram", "Pie chart", "Treemap"], answer: 0, points: 10 },
        { id: "Q-DSC-009-07", type: "MCQ", prompt: "What is Anscombe's Quartet, and what fundamental EDA lesson does it illustrate?", options: ["Four datasets with identical summary statistics (mean, variance, correlation) that exhibit drastically different distributions when visualized", "Four machine learning algorithms", "A four-stage data pipeline", "A set of four SQL join operations"], answer: 0, points: 10 },
        { id: "Q-DSC-009-08", type: "MCQ", prompt: "What parameter in `sns.violinplot()` combines both hue halves into a single violin for binary comparison?", options: ["split=True", "merge=True", "dual=True", "compact=True"], answer: 0, points: 10 },
        { id: "Q-DSC-009-09", type: "MCQ", prompt: "When inspecting heavily right-skewed data like financial transactions, what scale transformation should be applied to the axis?", options: ["Logarithmic scale (log)", "Square power scale", "Inverted scale", "Modulo scale"], answer: 0, points: 10 },
        { id: "Q-DSC-009-10", type: "MCQ", prompt: "What plot displays cumulative frequency distributions to compare empirical distributions against theoretical ones?", options: ["Quantile-Quantile (Q-Q) plot", "Stem-and-leaf plot", "Radar chart", "Sunburst chart"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-010",
      title: "Advanced SQL for Data Science Assessment",
      chapterId: "CH-DSC-010",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-010-01", type: "MCQ", prompt: "What clause defines the partitioning and ordering boundaries of an analytical SQL window function?", options: ["OVER (PARTITION BY ... ORDER BY ...)", "GROUP BY ... HAVING ...", "WINDOW BY ...", "SPLIT ON ..."], answer: 0, points: 10 },
        { id: "Q-DSC-010-02", type: "MCQ", prompt: "What is the key difference between a SQL window function and a standard `GROUP BY` clause?", options: ["Window functions retain individual row identities while computing aggregates, whereas GROUP BY collapses rows", "Window functions can only run on integers", "GROUP BY cannot calculate sums", "Window functions run only in memory"], answer: 0, points: 10 },
        { id: "Q-DSC-010-03", type: "MCQ", prompt: "What SQL window function accesses values from a preceding row within the partition without a self-join?", options: ["LAG()", "LEAD()", "FIRST_VALUE()", "NTH_VALUE()"], answer: 0, points: 10 },
        { id: "Q-DSC-010-04", type: "MCQ", prompt: "What is the difference between `RANK()` and `DENSE_RANK()` when ties occur?", options: ["RANK() skips subsequent rank numbers after ties (e.g., 1, 2, 2, 4), while DENSE_RANK() does not skip numbers (e.g., 1, 2, 2, 3)", "DENSE_RANK() only works on unique values", "RANK() assigns negative numbers", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-DSC-010-05", type: "MCQ", prompt: "What window frame specification computes a 30-day moving average including the current day and previous 29 rows?", options: ["ROWS BETWEEN 29 PRECEDING AND CURRENT ROW", "ROWS BETWEEN CURRENT ROW AND 29 FOLLOWING", "RANGE UNBOUNDED PRECEDING", "PARTITION ALL"], answer: 0, points: 10 },
        { id: "Q-DSC-010-06", type: "MCQ", prompt: "What SQL statement defines a temporary, named result set known as a Common Table Expression?", options: ["WITH cte_name AS (SELECT ...)", "CREATE TEMPORARY TABLE cte_name", "DECLARE TABLE cte_name", "SET cte_name = (SELECT ...)"], answer: 0, points: 10 },
        { id: "Q-DSC-010-07", type: "MCQ", prompt: "What window function calculates the relative percentile rank of each row from 0.0 to 1.0?", options: ["PERCENT_RANK()", "NTILE()", "CUME_DIST()", "PERCENTILE_CONT()"], answer: 0, points: 10 },
        { id: "Q-DSC-010-08", type: "MCQ", prompt: "What window function distributes ordered rows into a specified number of approximately equal buckets (e.g., quartiles or deciles)?", options: ["NTILE(n)", "BUCKET(n)", "BIN(n)", "SPLIT(n)"], answer: 0, points: 10 },
        { id: "Q-DSC-010-09", type: "MCQ", prompt: "How does QUALIFY simplify SQL filtering in modern data warehouses (BigQuery, Snowflake)?", options: ["It filters rows based on the result of window functions without needing a wrapping subquery", "It replaces the WHERE clause entirely", "It checks user access permissions", "It indexes columns automatically"], answer: 0, points: 10 },
        { id: "Q-DSC-010-10", type: "MCQ", prompt: "Why are recursive CTEs valuable in enterprise data science applications?", options: ["They query hierarchical structures such as organizational reporting trees or multi-hop referral graphs", "They speed up simple SELECT statements", "They replace Python loops completely", "They compress SQL table storage"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-011",
      title: "Web Scraping & Data Ingestion Assessment",
      chapterId: "CH-DSC-011",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-011-01", type: "MCQ", prompt: "Why does BeautifulSoup fail to extract content from client-side rendered Single Page Applications (SPAs)?", options: ["BeautifulSoup parses static HTML responses and does not execute JavaScript to hydrate dynamic DOM trees", "BeautifulSoup only supports XML", "SPAs block all Python requests by default", "BeautifulSoup cannot read UTF-8"], answer: 0, points: 10 },
        { id: "Q-DSC-011-02", type: "MCQ", prompt: "What library allows programmatic automation of real headless Chromium, Firefox, and WebKit browsers?", options: ["Playwright", "NumPy", "Pandas", "Scipy"], answer: 0, points: 10 },
        { id: "Q-DSC-011-03", type: "MCQ", prompt: "What HTTP header should a scraper configure to identify itself ethically or mimic a modern desktop browser?", options: ["User-Agent", "Accept-Encoding", "Content-Length", "Host"], answer: 0, points: 10 },
        { id: "Q-DSC-011-04", type: "MCQ", prompt: "What standard file hosted at a website's root specifies crawling permissions and rate constraints for automated bots?", options: ["robots.txt", "sitemap.xml", "manifest.json", "crawler.conf"], answer: 0, points: 10 },
        { id: "Q-DSC-011-05", type: "MCQ", prompt: "What HTTP status code indicates that the web server has detected bot behavior and throttled requests?", options: ["429 Too Many Requests", "200 OK", "301 Moved Permanently", "404 Not Found"], answer: 0, points: 10 },
        { id: "Q-DSC-011-06", type: "MCQ", prompt: "What CSS selector in Playwright or BeautifulSoup matches an element with class 'price' inside a container with id 'product-card'?", options: ["#product-card .price", ".product-card #price", "product-card > price", "//product-card/price"], answer: 0, points: 10 },
        { id: "Q-DSC-011-07", type: "MCQ", prompt: "What technique prevents an automated scraper from overwhelming target servers or triggering IP blocks?", options: ["Adding randomized sleep intervals (jitter) and rotating residential/datacenter proxies", "Sending 10,000 requests per second", "Disabling cookies", "Switching from GET to POST requests"], answer: 0, points: 10 },
        { id: "Q-DSC-011-08", type: "MCQ", prompt: "In Playwright, what method ensures dynamic elements have finished rendering before interacting with them?", options: ["page.wait_for_selector()", "page.sleep()", "page.halt()", "page.pause_until()"], answer: 0, points: 10 },
        { id: "Q-DSC-011-09", type: "MCQ", prompt: "Before scraping HTML markup, what should a data engineer inspect in browser Developer Tools Network tab?", options: ["Underlying REST/GraphQL API XHR requests returning clean JSON payloads directly", "CSS stylesheet rules", "Local browser cookies", "Memory heap snapshots"], answer: 0, points: 10 },
        { id: "Q-DSC-011-10", type: "MCQ", prompt: "What parser is recommended for BeautifulSoup when maximum parsing speed is required on large static HTML pages?", options: ["lxml", "html.parser", "html5lib", "regex"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-012",
      title: "Big Data Formats: Parquet & Arrow Assessment",
      chapterId: "CH-DSC-012",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-012-01", type: "MCQ", prompt: "What fundamental architectural difference distinguishes Apache Parquet from CSV files?", options: ["Parquet is a binary columnar storage format, while CSV is row-oriented text", "Parquet is uncompressed text", "CSV supports data schemas while Parquet does not", "Parquet only supports integer data"], answer: 0, points: 10 },
        { id: "Q-DSC-012-02", type: "MCQ", prompt: "Why does columnar storage yield superior compression ratios compared to row-oriented storage?", options: ["Adjacent data in a column shares identical types and similar values, enabling run-length, dictionary, and bit-packing compression", "Columns take up less space than rows", "Row formats duplicate headers every line", "Columnar formats delete vowels"], answer: 0, points: 10 },
        { id: "Q-DSC-012-03", type: "MCQ", prompt: "What is Apache Arrow's primary innovation in data analytics?", options: ["A standardized, language-independent columnar memory format that enables zero-copy data sharing across systems", "A cloud data warehouse", "A relational database engine", "A replacement for Python"], answer: 0, points: 10 },
        { id: "Q-DSC-012-04", type: "MCQ", prompt: "What is 'Projection Pushdown' in Parquet readers?", options: ["Reading only the specific columns requested by the user, skipping unneeded column chunks from disk", "Projecting data onto a 2D map", "Predicting missing columns", "Compressing files in parallel"], answer: 0, points: 10 },
        { id: "Q-DSC-012-05", type: "MCQ", prompt: "What is 'Predicate Pushdown' in Parquet readers?", options: ["Utilizing file metadata (min/max values per row group) to skip reading chunks that cannot match filter conditions", "Pushing calculations to the client machine", "Sorting columns alphabetically", "Deleting duplicate rows on disk"], answer: 0, points: 10 },
        { id: "Q-DSC-012-06", type: "MCQ", prompt: "What is the primary use case for Apache Arrow Feather format over Parquet?", options: ["Ultra-fast ephemeral IPC (Inter-Process Communication) and memory-mapped disk reads/writes in local pipelines", "Long-term cold cloud archiving", "Printing human-readable tables in terminal", "Replacing SQL databases"], answer: 0, points: 10 },
        { id: "Q-DSC-012-07", type: "MCQ", prompt: "What compression algorithm is the default industry standard for Parquet files balancing speed and compression ratio?", options: ["Snappy", "Gzip", "Bzip2", "LZMA"], answer: 0, points: 10 },
        { id: "Q-DSC-012-08", type: "MCQ", prompt: "How does Apache Arrow eliminate serialization/deserialization overhead between Python and Rust/C++?", options: ["By using a common memory layout so both runtimes point directly to the same physical memory addresses (zero-copy)", "By transmitting JSON over sockets", "By writing CSV files to /tmp", "By converting everything to Python lists"], answer: 0, points: 10 },
        { id: "Q-DSC-012-09", type: "MCQ", prompt: "What happens to data types when saving a DataFrame to CSV versus Parquet?", options: ["CSV loses precise data types (dates become strings, floats may lose precision), while Parquet preserves exact schema types", "Parquet converts everything to text", "CSV maintains strict schema definitions", "Both formats preserve identical metadata"], answer: 0, points: 10 },
        { id: "Q-DSC-012-10", type: "MCQ", prompt: "What method in PyArrow allows reading Parquet files in partitioned directory structures (e.g., year=2024/month=10/)?", options: ["pq.read_table('dataset_dir/', partitioning='hive')", "pq.scan_dirs()", "pa.read_hive()", "pq.open_all()"], answer: 0, points: 10 },
      ]
    }
  ]
};

