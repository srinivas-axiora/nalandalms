export const phase2Chapters = [
  {
    id: "CH-DNA-007",
    courseId: "CRS-DNA-001",
    title: "Python Analytics Ecosystem: NumPy & Vectorized Computing",
    order: 7,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=R9Z8bW6S2_0",
    content: `# Python Analytics Ecosystem: NumPy & Vectorized Computing

### Learning Objectives
1. Understand the Python scientific computing stack: NumPy, SciPy, Pandas, Matplotlib, and Seaborn.
2. Master NumPy N-dimensional arrays (\`ndarray\`) vs. native Python lists (memory layout, C-contiguous buffers).
3. Apply array broadcasting rules and vectorized numerical operations.
4. Execute high-speed filtering, mathematical universal functions (ufuncs), and linear algebra transformations.

---

### 1. Why NumPy? The Vectorization Advantage

Standard Python lists store pointers to individual generic objects, introducing immense memory overhead and dynamic type-checking latency.
NumPy stores data in **dense, contiguous blocks of homogeneous memory** in C:

\`\`\`
   PYTHON LIST OF INTEGERS:
   List -> [ Ptr 1 ] -> [ PyObject: Type, RefCount, Value: 10 ]
        -> [ Ptr 2 ] -> [ PyObject: Type, RefCount, Value: 20 ]
        -> [ Ptr 3 ] -> [ PyObject: Type, RefCount, Value: 30 ]
   (Dispersed throughout RAM; cache misses occur constantly)

   NUMPY NDARRAY (C-Contiguous Buffer):
   [ Int64 (8 bytes) ][ Int64 (8 bytes) ][ Int64 (8 bytes) ]
   (Loaded directly into CPU L1/L2 cache; SIMD vectorization ready)
\`\`\`

**Performance Comparison**: Vectorized NumPy operations execute **50x to 100x faster** than standard Python \`for\` loops!

---

### 2. Broadcasting Rules in Action

Broadcasting allows arithmetic operations between arrays of different shapes without copying data in memory:

\`\`\`python
import numpy as np

# Matrix: 3 stores x 4 quarters of revenue
revenue = np.array([
    [100, 150, 200, 250],
    [80,  90,  120, 140],
    [300, 320, 310, 400]
])  # Shape: (3, 4)

# Vector: Tax rate per quarter
tax_rate = np.array([0.08, 0.08, 0.10, 0.10])  # Shape: (4,)

# Broadcasting automatically expands tax_rate across all 3 stores!
tax_owed = revenue * tax_rate
print("Tax per Store/Quarter:\n", tax_owed)
\`\`\`

#### The Broadcasting Compatibility Rule:
Two dimensions are compatible when:
1. They are equal, OR
2. One of them is 1.

---

### 3. Boolean Masking & Statistical Summaries

\`\`\`python
# Generate 1,000,000 synthetic transaction amounts
transactions = np.random.normal(loc=120.0, scale=35.0, size=1_000_000)

# 1. Vectorized Boolean Masking
high_value_tx = transactions[transactions > 200.0]
print(f"High-Value Transactions Count: {len(high_value_tx)}")

# 2. Universal Aggregate Functions (ufuncs)
mean_val = np.mean(transactions)
std_val  = np.std(transactions)
p95_val  = np.percentile(transactions, 95)

print(f"Mean: {mean_val:.2f} | StdDev: {std_val:.2f} | P95: {p95_val:.2f}")
\`\`\`

---

### 4. Hands-on Lab: Financial Risk Vectorization
1. Create a NumPy 2D array of asset prices over 252 trading days for 5 stocks.
2. Vectorize the daily percentage return calculation: \`(P_t - P_{t-1}) / P_{t-1}\`.
3. Compute the correlation matrix across all 5 assets without looping.`
  },
  {
    id: "CH-DNA-008",
    courseId: "CRS-DNA-001",
    title: "High-Performance Data Wrangling: Pandas 2.0 & Polars",
    order: 8,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# High-Performance Data Wrangling: Pandas 2.0 & Polars

### Learning Objectives
1. Understand the architecture of Pandas 2.0 (Apache Arrow backend) vs. legacy NumPy backends.
2. Master modern DataFrame operations: filtering, grouping, merging, and reshaping (pivot/melt).
3. Introduce **Polars**: Rust-based multi-threaded DataFrame engine with lazy execution.
4. Process multi-gigabyte analytical datasets without running out of RAM (Out-of-Core Processing).

---

### 1. The Paradigm Shift: Pandas 2.0 & Apache Arrow

Historically, Pandas relied on NumPy, which lacked native support for missing strings, booleans, and null types (requiring floating-point \`NaN\` workarounds).
Pandas 2.0 introduced native **Apache Arrow** support:
- True nullability across all data types (strings, ints, booleans).
- Zero-copy data sharing between Python and analytical tools.
- Memory consumption reduced by up to 50%.

\`\`\`python
import pandas as pd

# Load CSV with modern pyarrow engine and nullable Arrow data types
df = pd.read_csv('ecommerce_orders.csv', dtype_backend='pyarrow', engine='pyarrow')
print(df.dtypes)
\`\`\`

---

### 2. Enter Polars: The Next-Gen Analytics Engine

Written in Rust, **Polars** has emerged as the premier high-performance DataFrame library:
- **True Multi-Threading**: Parallel execution across all CPU cores.
- **Lazy Evaluation**: Optimizes query plans (predicate pushdown, projection pushdown) before executing.
- **Memory Efficient**: Streams datasets larger than RAM.

\`\`\`python
import polars as pl

# Lazy DataFrame Query Pipeline
lazy_query = (
    pl.scan_csv('transactions_large.csv') # Does not load file yet!
    .filter(pl.col('amount') > 50.0)      # Predicate pushdown
    .select(['customer_id', 'category', 'amount', 'timestamp']) # Projection pushdown
    .group_by(['category'])
    .agg([
        pl.col('amount').sum().alias('total_spend'),
        pl.col('amount').mean().alias('avg_order_value'),
        pl.col('customer_id').n_unique().alias('unique_customers')
    ])
    .sort('total_spend', descending=True)
)

# Compile optimized execution plan and run
result = lazy_query.collect()
print(result)
\`\`\`

---

### 3. Reshaping Data: Melt vs. Pivot

| Operation | Action | When to Use |
| :--- | :--- | :--- |
| **\`pivot()\`** | Reshapes from Long to Wide format. | Turning transactional rows into summary comparison columns. |
| **\`melt()\`** | Reshapes from Wide to Long format. | Normalizing wide survey responses (Q1, Q2, Q3) into clean tidy data. |

\`\`\`python
# Tidy wide data into analysis-ready long format
tidy_df = df.melt(
    id_vars=['student_id', 'cohort'],
    value_vars=['math_score', 'reading_score', 'science_score'],
    var_name='subject',
    value_name='score'
)
\`\`\`

---

### 4. Hands-on Lab: 10-Million-Row Benchmark
1. Load a 10-million-row sales dataset into Polars vs. legacy Pandas.
2. Execute a multi-column grouping and percentile calculation.
3. Compare execution times and peak memory footprints.`
  },
  {
    id: "CH-DNA-009",
    courseId: "CRS-DNA-001",
    title: "Data Cleaning, Missing Value Imputation & Anomaly Remediation",
    order: 9,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# Data Cleaning, Missing Value Imputation & Anomaly Remediation

### Learning Objectives
1. Classify missing data mechanisms: MCAR (Missing Completely at Random), MAR (Missing at Random), and MNAR (Missing Not at Random).
2. Apply statistical and algorithmic imputation: Mean/Median, Mode, Forward/Backward Fill, and KNN / Iterative Imputer.
3. Clean messy text, normalize strings, and parse timestamps using Regular Expressions (Regex).
4. Detect and treat severe outliers using Winsorization and Trimming.

---

### 1. The Taxonomy of Missing Data

Imputing missing data blindly introduces catastrophic bias into business models. Always diagnose the underlying mechanism:

| Missing Mechanism | Definition | Handling Strategy |
| :--- | :--- | :--- |
| **MCAR** (Missing Completely at Random) | Missingness is completely independent of observed or unobserved data (e.g. random sensor glitch). | Listwise deletion or mean/median imputation is safe. |
| **MAR** (Missing at Random) | Missingness depends on other observed features (e.g. older users omit income field, but age is recorded). | Multiple Imputation by Chained Equations (MICE) or KNN. |
| **MNAR** (Missing Not at Random) | Missingness depends on the unobserved value itself (e.g. high-income individuals refuse to disclose high wealth). | Domain modeling required; dropping rows creates extreme bias! |

---

### 2. Imputation Techniques in Python

\`\`\`python
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer

df = pd.DataFrame({
    'age': [25, 30, np.nan, 45, 22],
    'income': [50000, 62000, 85000, np.nan, 35000],
    'credit_score': [680, 710, 790, 810, 620]
})

# 1. Simple Median Imputation (Robust to outliers)
df['age_imputed'] = df['age'].fillna(df['age'].median())

# 2. Multivariate KNN Imputer (Finds nearest neighbors based on other features)
imputer = KNNImputer(n_neighbors=2)
imputed_array = imputer.fit_transform(df[['age', 'income', 'credit_score']])
df_imputed = pd.DataFrame(imputed_array, columns=['age', 'income', 'credit_score'])
\`\`\`

---

### 3. Outlier Remediation: Winsorization vs. Trimming

When extreme values distort analytical averages, analysts choose between two remediation strategies:
- **Trimming (Truncation)**: Removing the extreme rows completely. (Risk: Loses real data).
- **Winsorization (Capping)**: Replacing values outside a percentile range (e.g. 1st and 99th percentile) with the boundary threshold.

\`\`\`python
# Winsorize income at the 1st and 99th percentiles
lower_cap = df['income'].quantile(0.01)
upper_cap = df['income'].quantile(0.99)

df['income_capped'] = df['income'].clip(lower=lower_cap, upper=upper_cap)
\`\`\`

---

### 4. Hands-on Lab: Real-World Messy Data Pipeline
1. Ingest an unformatted raw customer dataset containing dirty phone numbers, mixed date formats, and negative ages.
2. Clean string fields using regex (e.g. \`re.sub(r'\\D', '', phone)\`).
3. Diagnose missing income values and apply KNN imputation.`
  },
  {
    id: "CH-DNA-010",
    courseId: "CRS-DNA-001",
    title: "Exploratory Data Analysis (EDA) & Multivariate Discovery",
    order: 10,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Exploratory Data Analysis (EDA) & Multivariate Discovery

### Learning Objectives
1. Formulate a structured EDA framework: Univariate, Bivariate, and Multivariate analysis.
2. Assess distributions using Skewness, Kurtosis, and Quantile-Quantile (Q-Q) plots.
3. Compute and interpret Pearson, Spearman, and Kendall correlation matrices.
4. Uncover Simpson's Paradox and hidden confounding variables in business metrics.

---

### 1. The 3 Phases of Exploratory Data Analysis

EDA is the investigative detective work of the data analyst, discovering underlying patterns, anomalies, and structural relationships before modeling:

\`\`\`
                     +---------------------------------------+
                     |           UNIVARIATE ANALYSIS         |
                     | Single-variable distributions,        |
                     | histograms, box plots, skewness       |
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |           BIVARIATE ANALYSIS          |
                     | Relationships between pairs:          |
                     | scatter plots, correlation, cross-tabs|
                     +-------------------+-------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |         MULTIVARIATE ANALYSIS         |
                     | Multi-factor interactions, heatmaps,  |
                     | dimensionality reduction (PCA/t-SNE)  |
                     +---------------------------------------+
\`\`\`

---

### 2. Skewness & Kurtosis Decoded

- **Positive (Right) Skew**: Tail extends to the right (Mean > Median). Common in income, order values, and housing prices. Requires Log or Box-Cox transformations.
- **Negative (Left) Skew**: Tail extends to the left (Mean < Median). Common in customer satisfaction scores (majority 5 stars).
- **Kurtosis**: Measures the "tailedness" and propensity for extreme outlier events (Leptokurtic = heavy fat tails).

\`\`\`python
import scipy.stats as stats
import seaborn as sns
import matplotlib.pyplot as plt

# Compute Skewness and Kurtosis
skew = stats.skew(df['revenue'])
kurt = stats.kurtosis(df['revenue'])
print(f"Skewness: {skew:.2f} | Kurtosis: {kurt:.2f}")

# Log transformation to normalize right-skewed data
df['log_revenue'] = np.log1p(df['revenue'])
\`\`\`

---

### 3. Pearson vs. Spearman Correlation

- **Pearson Correlation ($r$)**: Measures linear relationships between continuous variables. Extremely sensitive to outliers.
- **Spearman Rank Correlation ($\rho$)**: Measures monotonic relationships based on ranked orders. Robust to outliers and non-linear patterns.

\`\`\`python
# Correlation Heatmap
corr_matrix = df[['ad_spend', 'conversions', 'customer_age', 'retention_days']].corr(method='spearman')

sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
plt.title("Spearman Rank Correlation Heatmap")
plt.show()
\`\`\`

---

### 4. Simpson's Paradox: The Analyst's Trap

**Simpson's Paradox** occurs when a trend appears in different groups of data but disappears or reverses when these groups are aggregated!
- *Example*: Hospital A has a higher overall mortality rate than Hospital B (looks worse!).
- *Hidden Confounder*: Hospital A takes all the high-risk, critical trauma cases, while Hospital B handles minor elective surgeries. Within each patient sub-segment, Hospital A has superior survival rates!

---

### 5. Hands-on Lab: Comprehensive EDA Walkthrough
1. Perform EDA on a SaaS churn dataset.
2. Identify right-skewed variables and apply log transformations.
3. Generate correlation heatmaps and test whether discounting correlates with churn.`
  },
  {
    id: "CH-DNA-011",
    courseId: "CRS-DNA-001",
    title: "Statistical Foundations: Probability Distributions & Central Limit Theorem",
    order: 11,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Statistical Foundations: Probability Distributions & Central Limit Theorem

### Learning Objectives
1. Master discrete vs. continuous probability distributions: Normal, Binomial, Poisson, and Exponential.
2. Understand the Central Limit Theorem (CLT) and why it forms the bedrock of inferential statistics.
3. Compute Standard Error, Z-scores, and Confidence Intervals (95%, 99%).
4. Differentiate Population Parameters ($\mu, \sigma$) vs. Sample Statistics ($\bar{x}, s$).

---

### 1. Essential Probability Distributions in Analytics

\`\`\`
   +-------------------------------------------------------------+
   |             COMMON ANALYTICAL DISTRIBUTIONS                 |
   +-------------------------------------------------------------+
   | Normal (Gaussian)  | Symmetrical bell curve; 68-95-99.7 rule|
   |                    | (Heights, errors, test scores)         |
   +--------------------+----------------------------------------+
   | Binomial           | Success/failure trials (n trials, p)   |
   |                    | (Conversion rate, click-through rate)  |
   +--------------------+----------------------------------------+
   | Poisson            | Counts of events in fixed time/space   |
   |                    | (Server requests per second, support   |
   |                    | tickets per hour)                      |
   +--------------------+----------------------------------------+
   | Exponential        | Continuous time between Poisson events |
   |                    | (Time until customer churns, battery   |
   |                    | time to failure)                       |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. The Central Limit Theorem (CLT)

> **The Central Limit Theorem states**: Given a population with any arbitrary, skewed, or weird distribution (even uniform or bimodal), the distribution of the **sample means** will approach a Normal distribution as the sample size $N$ increases ($N \ge 30$).

$$\bar{X} \sim \mathcal{N}\left(\mu, \frac{\sigma}{\sqrt{N}}\right)$$

Where:
$$\text{Standard Error (SE)} = \frac{\sigma}{\sqrt{N}}$$

As sample size $N$ increases, the standard error shrinks, meaning our estimate of the true population mean becomes increasingly precise.

---

### 3. Calculating Confidence Intervals

A 95% Confidence Interval means that if we repeated the sampling experiment 100 times, 95 of those calculated intervals would capture the true population parameter:

$$\text{CI} = \bar{x} \pm Z^* \times \left(\frac{s}{\sqrt{N}}\right)$$

For 95% Confidence: $Z^* = 1.96$  
For 99% Confidence: $Z^* = 2.576$

\`\`\`python
import numpy as np
import scipy.stats as stats

sample_data = np.array([45, 52, 48, 60, 55, 49, 53, 58, 62, 51])
mean = np.mean(sample_data)
sem = stats.sem(sample_data) # Standard error of the mean

# Calculate 95% Confidence Interval using t-distribution
ci_95 = stats.t.interval(confidence=0.95, df=len(sample_data)-1, loc=mean, scale=sem)
print(f"Sample Mean: {mean:.2f}")
print(f"95% Confidence Interval: [{ci_95[0]:.2f}, {ci_95[1]:.2f}]")
\`\`\`

---

### 4. Hands-on Lab: CLT Simulation in Python
1. Generate an extremely skewed exponential distribution (1,000,000 values).
2. Draw 2,000 random samples of size $N=50$.
3. Plot the histogram of sample means and visually confirm the emergence of a perfect Gaussian bell curve.`
  },
  {
    id: "CH-DNA-012",
    courseId: "CRS-DNA-001",
    title: "Hypothesis Testing, p-values & A/B Testing Analytics",
    order: 12,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# Hypothesis Testing, p-values & A/B Testing Analytics

### Learning Objectives
1. Formulate Null ($H_0$) and Alternative ($H_1$) hypotheses for business experimentation.
2. Understand Type I Errors ($\alpha$, False Positive) vs. Type II Errors ($\beta$, False Negative).
3. Select appropriate tests: Two-Sample t-test, Paired t-test, Chi-Square ($\chi^2$), and ANOVA.
4. Design, execute, and analyze digital A/B tests with statistical power ($1-\beta$) and sample size sizing.

---

### 1. The Decision Matrix: Errors in Experimentation

Every business decision based on data risks two distinct types of statistical errors:

| Reality | Decision: Reject $H_0$ (Adopt Change) | Decision: Fail to Reject $H_0$ (Keep Status Quo) |
| :--- | :--- | :--- |
| **$H_0$ is True** (No real difference) | **Type I Error ($\alpha$, False Alarm)**<br>Adopted useless feature; wasted engineering. | **Correct Decision** ($1 - \alpha$)<br>Confidence Level (typically 95%). |
| **$H_0$ is False** (Change really works) | **Correct Decision** ($1 - \beta$)<br>**Statistical Power** (typically 80%). | **Type II Error ($\beta$, Missed Opportunity)**<br>Killed a winning feature by mistake. |

---

### 2. Choosing the Right Statistical Test

\`\`\`
   What type of data are you comparing?
          |
     +----+--------------------------------+
     |                                     |
[ CATEGORICAL ]                       [ CONTINUOUS ]
  (Conversion rates, Yes/No)             (Revenue, Time on site)
     |                                     |
  Comparing 2 proportions?              Comparing 2 means?
  --> Chi-Square (χ²) Test              --> Two-Sample t-test
     |                                     |
  Comparing 3+ categories?              Comparing 3+ group means?
  --> Chi-Square Test of Ind.           --> One-Way ANOVA
\`\`\`

---

### 3. A/B Testing: Sample Size Sizing & Power Analysis

Before launching an A/B test, you must calculate how many visitors are required per variant to detect the **Minimum Detectable Effect (MDE)** without stopping early (the "peeking problem"):

\`\`\`python
import statsmodels.api as sm
from statsmodels.stats.power import NormalIndPower

# Parameters
baseline_cr = 0.05  # Current checkout conversion: 5%
target_cr   = 0.055 # Expected improvement to 5.5% (10% relative lift)
alpha       = 0.05  # 5% significance level
power       = 0.80  # 80% statistical power

# Compute standardized effect size
effect_size = sm.stats.proportion_effectsize(baseline_cr, target_cr)

# Calculate required sample size per variant
power_analysis = NormalIndPower()
sample_size_per_variant = power_analysis.solve_power(
    effect_size=effect_size, 
    alpha=alpha, 
    power=power, 
    ratio=1.0
)

print(f"Required Visitors per Variant: {int(np.ceil(sample_size_per_variant)):,}")
# Output: ~31,000 visitors per variant
\`\`\`

---

### 4. Analyzing A/B Test Results

\`\`\`python
from statsmodels.stats.proportion import proportions_ztest

# Results: Control vs Variant
successes = np.array([1500, 1720]) # Conversions
observations = np.array([30000, 30000]) # Visitors

z_stat, p_value = proportions_ztest(count=successes, nobs=observations)
print(f"Z-Statistic: {z_stat:.4f} | p-value: {p_value:.4f}")

if p_value < 0.05:
    print("✅ Statistically Significant: Reject Null Hypothesis! Ship the feature!")
else:
    print("❌ Inconclusive: Fail to reject Null Hypothesis.")
\`\`\`

---

### 5. Hands-on Lab: A/B Experiment Analysis
1. Calculate sample size for a marketing banner test aiming for a 5% relative lift.
2. Ingest 14-day experiment results.
3. Compute the p-value and formulate an executive recommendation memo.`
  }
];

export const phase2Assessments = [
  {
    id: "ASM-DNA-007",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-007",
    title: "Assessment: NumPy & Vectorized Computing",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-007-01",
        text: "Why are vectorized NumPy array computations substantially faster than native Python 'for' loops?",
        options: [
          "NumPy stores data in dense, contiguous C memory buffers that take advantage of CPU cache locality and SIMD vector instructions",
          "NumPy arrays delete all memory after calculation",
          "Python lists cannot store numbers",
          "NumPy is written in pure JavaScript"
        ],
        correctAnswer: 0,
        explanation: "Contiguous homogeneous memory allows vectorized SIMD hardware operations, bypassing Python interpreter overhead."
      },
      {
        id: "Q-DNA-007-02",
        text: "What is 'Broadcasting' in NumPy arithmetic?",
        options: [
          "A set of rules allowing arithmetic operations between arrays of different shapes without copying data into memory",
          "Streaming video over the internet",
          "Broadcasting audio across speakers",
          "A method that converts integers to text"
        ],
        correctAnswer: 0,
        explanation: "Broadcasting expands smaller arrays across larger shapes along compatible dimensions without allocating redundant memory."
      },
      {
        id: "Q-DNA-007-03",
        text: "Under NumPy broadcasting rules, when are two dimensions considered compatible?",
        options: [
          "When they are equal, OR when one of the dimensions has a length of 1",
          "Only when both dimensions are powers of 2",
          "Only when both dimensions are prime numbers",
          "Dimensions are always compatible"
        ],
        correctAnswer: 0,
        explanation: "Broadcasting evaluates dimensions trailing right-to-left: dimensions must match or one must equal 1."
      },
      {
        id: "Q-DNA-007-04",
        text: "What does the expression 'arr[arr > 100]' execute in NumPy?",
        options: [
          "Boolean masking: it evaluates the condition element-wise and returns a 1D array of only the elements that exceed 100",
          "It replaces all numbers with 100",
          "It deletes the array",
          "It raises a syntax error"
        ],
        correctAnswer: 0,
        explanation: "Boolean array indexing filters the array down to elements where the boolean mask condition is True."
      },
      {
        id: "Q-DNA-007-05",
        text: "What is a 'ufunc' (Universal Function) in NumPy?",
        options: [
          "A function that operates on ndarrays element-by-element in compiled C code at high speed (e.g. np.add, np.exp, np.sqrt)",
          "A function that works on every computer in the world",
          "A function that cannot be modified",
          "A graphical user interface"
        ],
        correctAnswer: 0,
        explanation: "Universal functions provide fast, vectorized, element-wise wrappers around core mathematical operations."
      },
      {
        id: "Q-DNA-007-06",
        text: "What is the memory difference between a NumPy 'view' and a 'copy'?",
        options: [
          "A view shares the exact same underlying memory buffer (modifications affect original); a copy allocates new independent memory",
          "A view is printed on screen; a copy is saved to disk",
          "A copy is 100x faster than a view",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Views slice the existing buffer without duplicating data; modifying a view mutates the parent array."
      },
      {
        id: "Q-DNA-007-07",
        text: "How do you calculate the 90th percentile of an array 'arr' in NumPy?",
        options: ["np.percentile(arr, 90)", "arr.p90()", "np.quantile(arr, 90)", "np.top(arr, 10)"],
        correctAnswer: 0,
        explanation: "'np.percentile(arr, 90)' computes the 90th percentile value across the dataset."
      },
      {
        id: "Q-DNA-007-08",
        text: "What NumPy method returns the index positions of elements that satisfy a specified condition?",
        options: ["np.where(condition)", "np.find(condition)", "np.search(condition)", "np.locate(condition)"],
        correctAnswer: 0,
        explanation: "'np.where(condition)' returns a tuple of index coordinate arrays matching the predicate."
      },
      {
        id: "Q-DNA-007-09",
        text: "If array A has shape (5, 1) and array B has shape (1, 4), what is the shape of their broadcasted sum (A + B)?",
        options: ["(5, 4)", "(5, 1)", "(1, 4)", "Cannot be broadcasted"],
        correctAnswer: 0,
        explanation: "Broadcasting expands dimension 1 of A to 4, and dimension 2 of B to 5, resulting in shape (5, 4)."
      },
      {
        id: "Q-DNA-007-10",
        text: "What NumPy attribute returns the total number of dimensions of an ndarray?",
        options: ["arr.ndim", "arr.shape", "arr.size", "arr.dtype"],
        correctAnswer: 0,
        explanation: "'arr.ndim' returns the integer number of axes/dimensions in the array."
      }
    ]
  },
  {
    id: "ASM-DNA-008",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-008",
    title: "Assessment: Pandas 2.0 & Modern Polars",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-008-01",
        text: "What major architectural improvement was introduced in Pandas 2.0 regarding memory and data types?",
        options: [
          "Native integration with the Apache Arrow backend, providing true nullability and lower memory consumption",
          "Pandas was rewritten in PHP",
          "Pandas eliminated DataFrames",
          "Pandas now only works in the cloud"
        ],
        correctAnswer: 0,
        explanation: "Apache Arrow in Pandas 2.0 provides standardized memory representations and true nullable types across all columns."
      },
      {
        id: "Q-DNA-008-02",
        text: "What systems programming language is the Polars DataFrame library written in?",
        options: ["Rust", "Java", "C#", "Go"],
        correctAnswer: 0,
        explanation: "Polars is written in Rust, utilizing the Apache Arrow memory model for blazing multi-threaded performance."
      },
      {
        id: "Q-DNA-008-03",
        text: "What is 'Lazy Evaluation' in Polars?",
        options: [
          "Building a query execution plan that optimizes filters and projections before executing, running only when 'collect()' is called",
          "A programmer who refuses to write code",
          "Running tests once per month",
          "An infinite loop"
        ],
        correctAnswer: 0,
        explanation: "Lazy evaluation delays computation until necessary, allowing Polars to optimize query plans (predicate pushdown)."
      },
      {
        id: "Q-DNA-008-04",
        text: "What optimization does 'Predicate Pushdown' achieve in analytical engines like Polars?",
        options: [
          "Pushing filtering conditions directly down to the file reading layer so only matching rows are parsed from disk into RAM",
          "Pushing code to GitHub",
          "Deleting unneeded columns",
          "Sorting rows alphabetically"
        ],
        correctAnswer: 0,
        explanation: "Predicate pushdown evaluates 'WHERE/filter' clauses at scan time, avoiding reading unneeded data from disk."
      },
      {
        id: "Q-DNA-008-05",
        text: "What is the difference between 'pivot()' and 'melt()' in data reshaping?",
        options: [
          "'pivot()' transforms data from Long to Wide format; 'melt()' transforms data from Wide to Long format",
          "'melt()' turns data into liquid",
          "'pivot()' deletes rows",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Pivot widens datasets by turning rows into columns; melt unpivots columns into tidy key-value rows."
      },
      {
        id: "Q-DNA-008-06",
        text: "What Polars method executes a lazy query plan and returns a concrete DataFrame in memory?",
        options: [".collect()", ".run()", ".execute()", ".fetch()"],
        correctAnswer: 0,
        explanation: "Calling '.collect()' triggers execution of the optimized lazy query graph in Polars."
      },
      {
        id: "Q-DNA-008-07",
        text: "Why does Polars scale significantly better than Pandas on multi-core processors?",
        options: [
          "Polars is natively multi-threaded in Rust, utilizing all CPU cores without Python Global Interpreter Lock (GIL) limitations",
          "Polars only runs on graphics cards (GPUs)",
          "Polars does not use memory",
          "Polars skips mathematical calculations"
        ],
        correctAnswer: 0,
        explanation: "Polars bypasses the Python GIL by executing parallel queries natively in Rust across all CPU cores."
      },
      {
        id: "Q-DNA-008-08",
        text: "In Pandas, what method converts column data types into the modern PyArrow-backed nullable equivalents?",
        options: ["df.convert_dtypes(dtype_backend='pyarrow')", "df.to_arrow()", "df.cast_all()", "df.upgrade()"],
        correctAnswer: 0,
        explanation: "'convert_dtypes(dtype_backend=\"pyarrow\")' converts series into Arrow-backed nullable types."
      },
      {
        id: "Q-DNA-008-09",
        text: "What is 'Projection Pushdown'?",
        options: [
          "Reading only the specific columns requested in a query from columnar files (Parquet/Arrow), ignoring unused columns completely",
          "Projecting slides in a presentation",
          "Renaming column headers",
          "Deleting table indexes"
        ],
        correctAnswer: 0,
        explanation: "Projection pushdown skips reading unreferenced columns from disk, dramatically accelerating I/O."
      },
      {
        id: "Q-DNA-008-10",
        text: "What file format is the gold standard for high-performance columnar analytical storage in modern Python analytics?",
        options: ["Apache Parquet", "CSV", "JSON", "XML"],
        correctAnswer: 0,
        explanation: "Apache Parquet provides compressed, columnar, type-safe storage optimized for analytical scanning."
      }
    ]
  },
  {
    id: "ASM-DNA-009",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-009",
    title: "Assessment: Data Cleaning & Missing Value Imputation",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-009-01",
        text: "What missing data mechanism occurs when the probability of a value being missing is completely unrelated to any observed or unobserved variable?",
        options: [
          "Missing Completely at Random (MCAR)",
          "Missing at Random (MAR)",
          "Missing Not at Random (MNAR)",
          "Structured Missingness"
        ],
        correctAnswer: 0,
        explanation: "MCAR means missingness is purely random, introducing no systemic statistical bias."
      },
      {
        id: "Q-DNA-009-02",
        text: "Why is simply dropping all rows containing missing values (Listwise Deletion) dangerous when data is Missing Not at Random (MNAR)?",
        options: [
          "It introduces severe selection bias and distorts the true distribution of the population",
          "It causes the computer hard drive to format",
          "It makes the Python script crash",
          "Listwise deletion is prohibited by Python"
        ],
        correctAnswer: 0,
        explanation: "If missingness is non-random, discarding those records biases the analysis by omitting a specific demographic."
      },
      {
        id: "Q-DNA-009-03",
        text: "Why is Median imputation generally preferred over Mean imputation for heavily skewed numerical distributions (like income)?",
        options: [
          "The median is robust to extreme outliers, whereas the mean is pulled heavily toward extreme tails",
          "The median is always a whole number",
          "The mean cannot be calculated in Python",
          "The median is always zero"
        ],
        correctAnswer: 0,
        explanation: "Skewed outliers distort the mean; the median accurately reflects the typical central tendency."
      },
      {
        id: "Q-DNA-009-04",
        text: "How does K-Nearest Neighbors (KNN) Imputation estimate missing values for a patient record?",
        options: [
          "By finding the K most similar records based on available features and calculating their weighted average",
          "By guessing randomly",
          "By filling with the previous row's value",
          "By querying Google Search"
        ],
        correctAnswer: 0,
        explanation: "KNN imputation leverages multidimensional similarity across observed features to estimate missing fields."
      },
      {
        id: "Q-DNA-009-05",
        text: "What is 'Winsorization' in outlier remediation?",
        options: [
          "Capping extreme outlier values at designated percentile thresholds (e.g. 1st and 99th percentiles) rather than deleting rows",
          "Winning an award for clean data",
          "Multiplying outliers by zero",
          "Converting numbers to text"
        ],
        correctAnswer: 0,
        explanation: "Winsorization caps extreme tail values at percentile boundaries, preserving sample size while taming variance."
      },
      {
        id: "Q-DNA-009-06",
        text: "In regular expressions, what pattern cleans a phone string '(555) 123-4567' into pure digits '5551234567'?",
        options: ["re.sub(r'\\D', '', phone)", "re.replace('0-9')", "re.clean(phone)", "re.digits(phone)"],
        correctAnswer: 0,
        explanation: "'\\D' matches all non-digit characters; replacing them with '' isolates pure numeric digits."
      },
      {
        id: "Q-DNA-009-07",
        text: "What Pandas method fills missing values using the immediately preceding valid observation (useful in financial time series)?",
        options: ["df.ffill() (Forward Fill)", "df.bfill() (Backward Fill)", "df.drop()", "df.zero()"],
        correctAnswer: 0,
        explanation: "'ffill()' propagates the last known valid observation forward until the next valid value."
      },
      {
        id: "Q-DNA-009-08",
        text: "What is MICE (Multiple Imputation by Chained Equations)?",
        options: [
          "A series of regression models where each missing variable is modeled conditionally on all other variables iteratively",
          "A computer hardware device",
          "A test automation tool",
          "A data warehouse platform"
        ],
        correctAnswer: 0,
        explanation: "MICE models each incomplete variable via regression across other features, preserving variable relationships."
      },
      {
        id: "Q-DNA-009-09",
        text: "What Pandas function identifies duplicate rows across a specified subset of columns?",
        options: ["df.duplicated(subset=['email'])", "df.find_clones()", "df.is_repeated()", "df.unique_keys()"],
        correctAnswer: 0,
        explanation: "'df.duplicated(subset=...)' returns a boolean mask highlighting repeated row occurrences."
      },
      {
        id: "Q-DNA-009-10",
        text: "What does 'df.dropna(thresh=5)' do in Pandas?",
        options: [
          "Keeps only rows that have at least 5 non-null values",
          "Drops the first 5 rows",
          "Drops rows where value equals 5",
          "Deletes 5 random columns"
        ],
        correctAnswer: 0,
        explanation: "The 'thresh' parameter requires a minimum number of valid, non-null entries to retain a row."
      }
    ]
  },
  {
    id: "ASM-DNA-010",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-010",
    title: "Assessment: Exploratory Data Analysis & Discovery",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-010-01",
        text: "What is the relationship between the Mean and the Median in a positively (right) skewed distribution?",
        options: [
          "Mean is greater than Median (Mean > Median)",
          "Mean is less than Median (Mean < Median)",
          "Mean equals Median",
          "Mean is always zero"
        ],
        correctAnswer: 0,
        explanation: "Extreme high values in the right tail pull the Mean upward, making it larger than the Median."
      },
      {
        id: "Q-DNA-010-02",
        text: "What mathematical transformation is commonly applied to right-skewed revenue or income data to normalize its distribution?",
        options: [
          "Logarithmic transformation: np.log1p(x) or Box-Cox",
          "Squaring the values: x^2",
          "Multiplying by 100",
          "Dividing by zero"
        ],
        correctAnswer: 0,
        explanation: "Log transformations compress large values and stretch small values, normalizing right-skewed data."
      },
      {
        id: "Q-DNA-010-03",
        text: "How does Spearman Rank Correlation differ from Pearson Correlation?",
        options: [
          "Spearman measures monotonic relationships based on ranked values and is robust to outliers; Pearson measures linear relationships and is sensitive to outliers",
          "Spearman only works on text strings",
          "Pearson only works on integers",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Spearman evaluates monotonic rank ordering, making it resilient to non-linearities and extreme outliers."
      },
      {
        id: "Q-DNA-010-04",
        text: "What is 'Kurtosis' a measure of in descriptive statistics?",
        options: [
          "The 'tailedness' of a distribution and the propensity for extreme outlier events compared to a normal distribution",
          "The average speed of the data",
          "The number of missing values",
          "The color of the chart"
        ],
        correctAnswer: 0,
        explanation: "Kurtosis quantifies tail weight; leptokurtic distributions have heavy tails with higher outlier risk."
      },
      {
        id: "Q-DNA-010-05",
        text: "What visual diagnostic chart plots empirical quantiles of sample data against theoretical quantiles of a normal distribution?",
        options: ["Q-Q Plot (Quantile-Quantile Plot)", "Scatter Plot", "Pie Chart", "Gantt Chart"],
        correctAnswer: 0,
        explanation: "Q-Q plots display sample quantiles vs theoretical normal quantiles; straight lines indicate normality."
      },
      {
        id: "Q-DNA-010-06",
        text: "What paradox describes a statistical phenomenon where an apparent trend in aggregate data reverses when segmented into sub-groups?",
        options: ["Simpson's Paradox", "Fermi Paradox", "Zeno's Paradox", "Bootstrap Paradox"],
        correctAnswer: 0,
        explanation: "Simpson's Paradox occurs when confounding variables distort relationships in aggregated data."
      },
      {
        id: "Q-DNA-010-07",
        text: "What is the range of values for Pearson and Spearman correlation coefficients ($r$)?",
        options: ["-1.0 to +1.0", "0.0 to 100.0", "-∞ to +∞", "0.0 to 1.0"],
        correctAnswer: 0,
        explanation: "Correlation coefficients range from -1.0 (perfect negative) through 0 (no correlation) to +1.0 (perfect positive)."
      },
      {
        id: "Q-DNA-010-08",
        text: "What visual plot is standardly used in exploratory analysis to view pairwise bivariate relationships across multiple numerical columns simultaneously?",
        options: ["Pairplot / Scatterplot Matrix", "Stacked Bar Chart", "Donut Chart", "Treemap"],
        correctAnswer: 0,
        explanation: "Pairplots display pairwise scatter plots for all numerical combinations alongside univariate histograms."
      },
      {
        id: "Q-DNA-010-09",
        text: "What does an Interquartile Range (IQR) represent on a standard Tukey Box Plot?",
        options: [
          "The distance between the 75th percentile (Q3) and the 25th percentile (Q1): Q3 - Q1 (the middle 50% of data)",
          "The entire range from Min to Max",
          "The average of all numbers",
          "The standard deviation"
        ],
        correctAnswer: 0,
        explanation: "IQR measures statistical dispersion, defined as the range of the central 50% of observations (Q3 - Q1)."
      },
      {
        id: "Q-DNA-010-10",
        text: "Under Tukey's box plot convention, what defines an outlier threshold?",
        options: [
          "Values below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR",
          "Values above 1,000,000",
          "Negative values only",
          "Numbers with decimal points"
        ],
        correctAnswer: 0,
        explanation: "Tukey defines potential outliers as points extending beyond 1.5 times the IQR from the quartiles."
      }
    ]
  },
  {
    id: "ASM-DNA-011",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-011",
    title: "Assessment: Statistical Foundations & Central Limit Theorem",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-011-01",
        text: "What fundamental property does the Central Limit Theorem (CLT) establish regarding the distribution of sample means?",
        options: [
          "The distribution of sample means approaches a Normal distribution as sample size increases (N >= 30), regardless of the underlying population distribution",
          "All data in the world is naturally Normal",
          "Sample sizes must always equal 1,000,000",
          "Sample means are always equal to zero"
        ],
        correctAnswer: 0,
        explanation: "CLT proves that sample means form a Gaussian normal distribution when sample sizes are sufficiently large."
      },
      {
        id: "Q-DNA-011-02",
        text: "What is the formula for the Standard Error of the Mean (SEM)?",
        options: ["σ / sqrt(N)", "σ * N", "μ / σ", "N / sqrt(σ)"],
        correctAnswer: 0,
        explanation: "Standard Error is the standard deviation divided by the square root of sample size: σ / √N."
      },
      {
        id: "Q-DNA-011-03",
        text: "According to the Empirical Rule (68-95-99.7 rule) for a Normal distribution, what percentage of observations fall within 2 standard deviations of the mean?",
        options: ["Approximately 95.4%", "Approximately 68.2%", "Approximately 99.7%", "50%"],
        correctAnswer: 0,
        explanation: "In a normal distribution, ~68% fall within ±1σ, ~95.4% within ±2σ, and ~99.7% within ±3σ."
      },
      {
        id: "Q-DNA-011-04",
        text: "What discrete probability distribution models the number of independent success/failure outcomes in a fixed number of trials (e.g. ad clicks out of 1,000 impressions)?",
        options: ["Binomial Distribution", "Exponential Distribution", "Uniform Distribution", "Gaussian Distribution"],
        correctAnswer: 0,
        explanation: "Binomial distributions model the count of successes in n independent Bernoulli trials with probability p."
      },
      {
        id: "Q-DNA-011-05",
        text: "What probability distribution models the count of occurrences in a fixed interval of time or space (e.g. customer support calls per hour)?",
        options: ["Poisson Distribution", "Exponential Distribution", "Chi-Square Distribution", "Beta Distribution"],
        correctAnswer: 0,
        explanation: "Poisson distributions model discrete event arrivals occurring at a known average rate."
      },
      {
        id: "Q-DNA-011-06",
        text: "What critical Z-score corresponds to a two-sided 95% Confidence Interval in standard normal distributions?",
        options: ["1.96", "1.645", "2.576", "3.00"],
        correctAnswer: 0,
        explanation: "A Z-score of 1.96 cuts off 2.5% in each tail, capturing exactly 95% in the central distribution."
      },
      {
        id: "Q-DNA-011-07",
        text: "What happens to the Standard Error of the Mean as the sample size increases by a factor of 4?",
        options: [
          "The Standard Error is cut in half (divided by 2)",
          "The Standard Error quadruples",
          "The Standard Error is unchanged",
          "The Standard Error becomes zero"
        ],
        correctAnswer: 0,
        explanation: "Because sample size is under the square root (√4 = 2), quadrupling sample size cuts error in half."
      },
      {
        id: "Q-DNA-011-08",
        text: "What is the difference between a Population Parameter and a Sample Statistic?",
        options: [
          "A parameter is a fixed true characteristic of the entire population (μ); a statistic is calculated from an observed sample (x̄)",
          "A parameter is written in Python; a statistic is written in SQL",
          "A parameter is always larger than a statistic",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Parameters describe whole populations (Greek letters); statistics describe drawn samples (Latin letters)."
      },
      {
        id: "Q-DNA-011-09",
        text: "When sample sizes are small (N < 30) and the population standard deviation is unknown, what distribution is used instead of the Z-distribution for confidence intervals?",
        options: ["Student's t-distribution", "Uniform distribution", "F-distribution", "Bernoulli distribution"],
        correctAnswer: 0,
        explanation: "Student's t-distribution features heavier tails to account for added uncertainty when estimating σ with small N."
      },
      {
        id: "Q-DNA-011-10",
        text: "What probability distribution models the continuous duration of time elapsed between consecutive Poisson event arrivals?",
        options: ["Exponential Distribution", "Binomial Distribution", "Normal Distribution", "Discrete Uniform"],
        correctAnswer: 0,
        explanation: "The Exponential distribution models continuous wait times between Poisson process arrivals."
      }
    ]
  },
  {
    id: "ASM-DNA-012",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-012",
    title: "Assessment: Hypothesis Testing & A/B Testing",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-012-01",
        text: "In statistical hypothesis testing, what does the Null Hypothesis (H0) represent?",
        options: [
          "The default assumption that there is no true difference, effect, or relationship between the tested groups",
          "The theory that the new feature is definitely better",
          "An assertion that all data is invalid",
          "The probability of winning the lottery"
        ],
        correctAnswer: 0,
        explanation: "The Null Hypothesis assumes the status quo: that observed differences are purely due to random chance."
      },
      {
        id: "Q-DNA-012-02",
        text: "What is a Type I Error (alpha) in business experimentation?",
        options: [
          "A False Positive: Rejecting the null hypothesis when it was actually true (adopting a feature that has zero real effect)",
          "A False Negative: Failing to reject the null hypothesis when a real difference existed",
          "A computer network crash",
          "A syntax error in SQL"
        ],
        correctAnswer: 0,
        explanation: "Type I error is a false alarm: claiming a positive difference exists when it is just random noise."
      },
      {
        id: "Q-DNA-012-03",
        text: "What is Statistical Power (1 - beta) in an A/B test?",
        options: [
          "The probability of correctly detecting a real effect when one truly exists (typically targeted at 80% or 0.80)",
          "The speed of the CPU processor",
          "The dollar cost of the experiment",
          "The number of visitors on the website"
        ],
        correctAnswer: 0,
        explanation: "Power measures sensitivity: the likelihood that an experiment will successfully detect an effect of a given size."
      },
      {
        id: "Q-DNA-012-04",
        text: "What is the standard statistical interpretation of a p-value?",
        options: [
          "The probability of observing results at least as extreme as the actual test data, assuming the null hypothesis is true",
          "The probability that the developer made a mistake",
          "The percentage increase in company profit",
          "The probability that the null hypothesis is true"
        ],
        correctAnswer: 0,
        explanation: "P-value is the probability of obtaining test results as extreme as observed, given that H0 is true."
      },
      {
        id: "Q-DNA-012-05",
        text: "Which statistical test should be selected to compare conversion rates (percentages) between Control and Variant in an A/B test?",
        options: ["Two-Proportion Z-Test or Chi-Square (χ²) Test", "Paired t-test", "Linear Regression", "K-Means"],
        correctAnswer: 0,
        explanation: "Comparing categorical proportions (converted vs not converted) requires a Two-Proportion Z-test or Chi-Square test."
      },
      {
        id: "Q-DNA-012-06",
        text: "Which test is used when comparing the continuous average order values (means) across three distinct discount groups?",
        options: ["One-Way ANOVA (Analysis of Variance)", "Chi-Square Test", "Mann-Whitney U Test", "Binary Logistic"],
        correctAnswer: 0,
        explanation: "ANOVA compares means across three or more continuous groups simultaneously without compounding alpha."
      },
      {
        id: "Q-DNA-012-07",
        text: "What is the 'Peeking Problem' in digital A/B testing?",
        options: [
          "Continuously checking p-values day-by-day and stopping the experiment as soon as it hits p < 0.05, dramatically inflating False Positive rates",
          "Looking at a competitor's website",
          "Peeking at customer passwords",
          "Running tests in incognito mode"
        ],
        correctAnswer: 0,
        explanation: "Peeking and early stopping capitalizes on random fluctuations, inflating False Positives from 5% to over 30%."
      },
      {
        id: "Q-DNA-012-08",
        text: "What does MDE stand for in experiment sizing?",
        options: [
          "Minimum Detectable Effect: the smallest relative improvement the experiment is powered to detect reliably",
          "Maximum Daily Estimate",
          "Mean Distribution Error",
          "Median Data Element"
        ],
        correctAnswer: 0,
        explanation: "MDE is the minimum threshold of change that an experiment has sufficient statistical power to detect."
      },
      {
        id: "Q-DNA-012-09",
        text: "If an experiment achieves a p-value of 0.021 at an alpha significance threshold of 0.05, what is the statistical decision?",
        options: [
          "Reject the Null Hypothesis: the result is statistically significant at the 5% level",
          "Fail to reject the Null Hypothesis",
          "Restart the test from scratch",
          "The test is invalid"
        ],
        correctAnswer: 0,
        explanation: "Because p (0.021) < alpha (0.05), we reject H0 in favor of the Alternative Hypothesis."
      },
      {
        id: "Q-DNA-012-10",
        text: "What is an A/A test and why do analytics teams run them?",
        options: [
          "Splitting users between two identical Control experiences to verify that the experimentation engine itself has no tracking bias",
          "Testing on two Apple iPhones",
          "Running tests in alphabetical order",
          "Testing without any users"
        ],
        correctAnswer: 0,
        explanation: "A/A tests benchmark the testing pipeline: identical variants should reject H0 only ~5% of the time (at alpha=0.05)."
      }
    ]
  }
];

export const phase2 = {
  chapters: phase2Chapters,
  assessments: phase2Assessments
};

