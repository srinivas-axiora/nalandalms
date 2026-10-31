// Phase 1: Mathematical Foundations & Scientific Computing (Chapters 1 to 6) - Data Science
// World-class curriculum: Zero to employable master.

export const phase1 = {
  chapters: [
    // ── Chapter 1 ──
    {
      id: "CH-DSC-001",
      courseId: "CRS-DSC-001",
      sequence: 1,
      title: "Linear Algebra & Matrix Calculus for Data Science",
      description: "Vectors, dot products, matrix multiplication, determinants, rank, eigenvalues, eigenvectors, Singular Value Decomposition (SVD), and geometric transformations.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundations • Chapter 1</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Linear Algebra & Matrix Calculus for Data Science</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">At its core, all machine learning is linear algebra. Features are vectors, datasets are high-dimensional matrices, and neural networks are compositions of linear projections and non-linear activation functions. In this chapter, you will build an intuitive geometric foundation of vectors, matrices, dot products, and spectral decomposition.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/fNk_zzaMoSs" title="Essence of Linear Algebra" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Vectors & The Dot Product as Cosine Similarity</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The dot product between two vectors \\(\\mathbf{u}\\) and \\(\\mathbf{v}\\) measures both their magnitudes and the cosine of the angle between them: \\(\\mathbf{u} \\cdot \\mathbf{v} = \\sum u_i v_i = \\|\\mathbf{u}\\| \\|\\mathbf{v}\\| \\cos(\\theta)\\). When vectors are normalized to unit length, their dot product equals their <strong>Cosine Similarity</strong>—the mathematical engine behind text search, recommendation engines, and LLM embedding retrieval.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Eigenvalues, Eigenvectors & Principal Components</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np

# Covariance matrix of 2 correlated features:
cov_matrix = np.array([[2.5, 1.8],
                       [1.8, 1.5]])

# Compute eigenvalues and eigenvectors:
eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)
print("Eigenvalues (Variance explained):", eigenvalues)
print("Eigenvectors (Principal axes):\\n", eigenvectors)

# The eigenvector with the largest eigenvalue represents Principal Component 1!</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>A dataset with \\(N\\) samples and \\(D\\) features is represented as an \\(N \\times D\\) matrix.</li>
      <li>The dot product evaluates directional alignment and forms the basis of Cosine Similarity in vector search.</li>
      <li>Matrix multiplication represents a linear coordinate transformation (rotation, scaling, reflection).</li>
      <li>Eigenvectors define invariant directions whose orientation is unchanged by linear transformation, scaled by eigenvalues.</li>
      <li>Singular Value Decomposition (SVD) decomposes any rectangular matrix into orthogonal matrices and singular values.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 2 ──
    {
      id: "CH-DSC-002",
      courseId: "CRS-DSC-001",
      sequence: 2,
      title: "Probability Distributions, Random Variables & Bayes' Theorem",
      description: "Axioms of probability, discrete vs continuous distributions (Bernoulli, Binomial, Poisson, Normal, Exponential), Central Limit Theorem, and Bayesian inference.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundations • Chapter 2</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Probability Theory & Bayesian Inference</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Data science is the art of reasoning under uncertainty. Probability theory provides the formal mathematical language to quantify risk, predict outcomes, and update beliefs given empirical observations.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Bayes' Theorem in Production Machine Learning</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Bayes' Theorem models how prior beliefs \\(P(A)\\) are updated by new observed evidence \\(P(B|A)\\) to produce a posterior probability: \\(P(A|B) = \\frac{P(B|A) P(A)}{P(B)}\\). This is the foundation of spam filtering, medical diagnostics, and Bayesian A/B testing.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. The Central Limit Theorem (CLT)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np

# Regardless of the original underlying distribution (e.g., highly skewed exponential),
# the distribution of sample means approaches a Gaussian Normal distribution as sample size grows (N >= 30).
population = np.random.exponential(scale=2.0, size=1_000_000)
sample_means = [np.mean(np.random.choice(population, size=50)) for _ in range(10_000)]
# sample_means is bell-shaped and normally distributed!</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Probability Density Functions (PDF) describe continuous variables; Probability Mass Functions (PMF) describe discrete events.</li>
      <li>The Gaussian (Normal) distribution is governed by mean \\(\\mu\\) and standard deviation \\(\\sigma\\) (68-95-99.7 empirical rule).</li>
      <li>The Central Limit Theorem guarantees that sample means are normally distributed regardless of population shape.</li>
      <li>Bayes' Theorem dynamically updates prior probabilities into posterior odds upon observing evidence.</li>
      <li>Maximum Likelihood Estimation (MLE) estimates model parameters that maximize the probability of observed training data.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 3 ──
    {
      id: "CH-DSC-003",
      courseId: "CRS-DSC-001",
      sequence: 3,
      title: "Descriptive & Inferential Statistics: Hypothesis Testing & A/B Experiments",
      description: "Measures of central tendency and dispersion, skewness/kurtosis, p-values, Type I & Type II errors, Student's t-test, ANOVA, Chi-Square test, and A/B test design.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundations • Chapter 3</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Hypothesis Testing, Statistical Significance & A/B Testing</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Data-driven decisions require proving that an observed business uplift is statistically genuine and not random noise. In this chapter, you will master scientific hypothesis testing, p-values, confidence intervals, and the statistical design of commercial A/B experiments.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Two-Sample T-Test for A/B Testing in Python</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from scipy import stats
import numpy as np

# Control group (Version A) vs Experiment group (Version B) revenue per user:
control = np.array([12.5, 14.2, 11.8, 15.1, 13.0, 14.5, 12.9])
treatment = np.array([16.8, 17.5, 15.2, 18.0, 16.1, 17.9, 16.5])

# Independent two-sample t-test (Welch's t-test unequal variances):
t_stat, p_value = stats.ttest_ind(treatment, control, equal_var=False)

print(f"P-Value: {p_value:.5f}")
if p_value < 0.05:
    print("Statistically significant at alpha=0.05: Reject Null Hypothesis (H0)")
else:
    print("Fail to reject H0: No statistically significant difference")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Null Hypothesis (\\(H_0\\)) assumes no effect; Alternative Hypothesis (\\(H_1\\)) posits a genuine difference.</li>
      <li>The p-value is the probability of observing results at least as extreme assuming the Null Hypothesis is true.</li>
      <li>Type I error (\\(\\alpha\\)) is a false positive (finding an effect that does not exist); Type II error (\\(\\beta\\)) is a false negative.</li>
      <li>Use the two-sample t-test for continuous means, Chi-Square for categorical proportions, and ANOVA for 3+ groups.</li>
      <li>Calculate Minimum Detectable Effect (MDE) and sample size upfront to ensure adequate statistical power (\\(1 - \\beta \\ge 0.80\\)).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 4 ──
    {
      id: "CH-DSC-004",
      courseId: "CRS-DSC-001",
      sequence: 4,
      title: "Scientific Computing with NumPy: Vectorization, Broadcasting & Memory Strides",
      description: "ndarray memory layout (C vs Fortran order), strides, zero-copy views vs deep copies, universal functions (ufuncs), broadcasting rules, and linear algebra operations.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundations • Chapter 4</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Scientific Computing with NumPy: Vectorization & Strides</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">NumPy is the foundational pillar of the entire Python scientific stack (Pandas, Scikit-Learn, PyTorch, TensorFlow). By storing contiguous blocks of homogeneous data in C memory buffers, NumPy vectorization eliminates Python bytecode loop overhead, running 50x-200x faster than standard Python lists.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Vectorization vs Slow Python For-Loops</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np
import time

# 10 Million elements:
data = np.arange(10_000_000, dtype=np.float64)

# SLOW: Python loop with PyObject overhead (~1.5 seconds)
# res = [x * 2.5 for x in data]

# FAST: Vectorized C SIMD execution (~12 milliseconds - 120x faster!):
result = data * 2.5</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. NumPy Broadcasting Rules</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Broadcasting allows arithmetic operations on arrays of different dimensions without copying data. Two dimensions are compatible when: 1) they are equal, or 2) one of them is 1. Dimensions are compared starting from the trailing (rightmost) dimension backward.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>NumPy <code>ndarray</code> stores homogeneous data contiguously in C memory buffers.</li>
      <li>Vectorized operations utilize CPU SIMD (Single Instruction, Multiple Data) instructions.</li>
      <li>Slicing an array creates a memory view (sharing the original data buffer), not an expensive copy.</li>
      <li>Broadcasting aligns arrays of disparate shapes along singleton dimensions without memory replication.</li>
      <li>Boolean masking (<code>arr[arr &gt; 50]</code>) filters high-volume numeric datasets with sub-millisecond execution.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 5 ──
    {
      id: "CH-DSC-005",
      courseId: "CRS-DSC-001",
      sequence: 5,
      title: "Advanced Data Manipulation with Pandas 2.0 & PyArrow Backend",
      description: "DataFrames, Series, indexing with loc/iloc, missing data strategies, group-by aggregations, merge/join mechanics, and switching to the Apache Arrow memory engine in Pandas 2.0.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundations • Chapter 5</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Pandas 2.0 Architecture & PyArrow Backend</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Pandas is the universal workhorse for tabular data analysis. In Pandas 2.0+, integration with <strong>Apache Arrow</strong> brings native string types, zero-copy data interchange, true nullability for integer columns, and significantly reduced memory footprints.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Advanced Split-Apply-Combine with GroupBy</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import pandas as pd

# Load CSV using modern PyArrow backend for 4x faster reads and 50% less RAM:
df = pd.read_csv("orders.csv", engine="pyarrow", dtype_backend="pyarrow")

# Multi-level aggregation with custom named columns:
summary = df.groupby(["country", "status"]).agg(
    total_revenue=("amount", "sum"),
    average_order=("amount", "mean"),
    customer_count=("customer_id", "nunique")
).reset_index()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Pandas 2.0 adopts Apache Arrow as an optional backend, resolving legacy NumPy object-dtype memory bloat.</li>
      <li>Use <code>.loc[]</code> for label-based indexing and <code>.iloc[]</code> for zero-based integer positional slicing.</li>
      <li>Avoid slow row-by-row iteration (<code>for index, row in df.iterrows()</code>); always use vectorized operations or <code>.apply()</code>.</li>
      <li>Convert high-cardinality text columns to <code>category</code> or PyArrow string dtypes to cut memory usage by up to 80%.</li>
      <li>Always chain transformations cleanly using method chaining (<code>.pipe()</code>, <code>.assign()</code>).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 6 ──
    {
      id: "CH-DSC-006",
      courseId: "CRS-DSC-001",
      sequence: 6,
      title: "High-Speed Multi-Threaded DataFrames with Polars & Lazy Evaluation",
      description: "The Rust-powered Polars framework, parallel execution across CPU cores, Apache Arrow columnar format, LazyFrame query optimization, and handling larger-than-RAM datasets.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Foundations • Chapter 6</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">High-Speed DataFrames with Polars & Lazy Evaluation</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">While Pandas is fundamentally single-threaded, <strong>Polars</strong> is written from scratch in <strong>Rust</strong>. It leverages all CPU cores in parallel, operates strictly on Apache Arrow columnar arrays, and features an enterprise-grade <strong>Lazy Query Optimizer</strong> that pushes down predicates and projections.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Polars Lazy Execution & Predicate Pushdown</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import polars as pl

# scan_parquet() creates a LazyFrame with zero immediate memory usage:
lazy_query = (
    pl.scan_parquet("global_sales_50gb.parquet")
    .filter(pl.col("country") == "IND")
    .filter(pl.col("status") == "COMPLETED")
    .group_by("product_category")
    .agg([
        pl.col("revenue").sum().alias("total_revenue"),
        pl.col("revenue").mean().alias("avg_revenue")
    ])
    .sort("total_revenue", descending=True)
)

# The query optimizer scans ONLY the required columns and filtered rows,
# parallelizing execution across all CPU cores:
df_result = lazy_query.collect()
print(df_result)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Polars is written in Rust and automatically parallelizes operations across all CPU threads.</li>
      <li>LazyFrames build an Abstract Syntax Tree (AST), applying predicate pushdown to filter data at the disk reader level.</li>
      <li>Projection pushdown loads only the specific columns needed in the query, preventing full-table memory loading.</li>
      <li>Polars enables processing datasets larger than physical RAM via streaming execution (<code>collect(streaming=True)</code>).</li>
      <li>Polars expression syntax (<code>pl.col('amount') * 1.18</code>) is composable, expressive, and strictly typed.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 1 (10 MCQs per chapter = 60 questions total) ──
  assessments: [
    {
      id: "ASM-DSC-001",
      title: "Linear Algebra for Data Science Assessment",
      chapterId: "CH-DSC-001",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-001-01", type: "MCQ", prompt: "What geometric property does the dot product of two normalized unit vectors represent?", options: ["The cosine of the angle between them (Cosine Similarity)", "The Euclidean distance squared", "The area of the parallelogram", "The cross product magnitude"], answer: 0, points: 10 },
        { id: "Q-DSC-001-02", type: "MCQ", prompt: "What is an eigenvector of a square matrix A?", options: ["A non-zero vector that changes only by a scalar factor (eigenvalue) when transformed by A", "A vector of all zeros", "The inverse of matrix A", "A vector orthogonal to all axes"], answer: 0, points: 10 },
        { id: "Q-DSC-001-03", type: "MCQ", prompt: "What dimensionality reduction algorithm is based directly on the spectral decomposition or SVD of a data covariance matrix?", options: ["Principal Component Analysis (PCA)", "K-Means", "Logistic Regression", "Decision Trees"], answer: 0, points: 10 },
        { id: "Q-DSC-001-04", type: "MCQ", prompt: "What does it indicate if the determinant of a square matrix is zero (det(A) = 0)?", options: ["The matrix is singular and cannot be inverted; its columns are linearly dependent", "The matrix is the identity matrix", "The matrix has infinite eigenvalues", "The matrix is symmetric"], answer: 0, points: 10 },
        { id: "Q-DSC-001-05", type: "MCQ", prompt: "What is the rank of a matrix?", options: ["The maximum number of linearly independent rows or columns", "The number of total entries", "The sum of diagonal values", "The largest eigenvalue"], answer: 0, points: 10 },
        { id: "Q-DSC-001-06", type: "MCQ", prompt: "What mathematical operation on matrix A produces a matrix where rows and columns are swapped?", options: ["Transpose (A^T)", "Inverse (A^-1)", "Trace", "Determinant"], answer: 0, points: 10 },
        { id: "Q-DSC-001-07", type: "MCQ", prompt: "What is the L2 norm (Euclidean norm) of a vector?", options: ["The square root of the sum of squared vector elements (the geometric length)", "The sum of absolute values", "The maximum element", "The dot product with zero"], answer: 0, points: 10 },
        { id: "Q-DSC-001-08", type: "MCQ", prompt: "What is the L1 norm (Manhattan distance) of a vector?", options: ["The sum of the absolute values of the vector coordinates", "The square root of the sum of squares", "The maximum coordinate value", "The determinant"], answer: 0, points: 10 },
        { id: "Q-DSC-001-09", type: "MCQ", prompt: "What does orthogonal mean when applied to two non-zero vectors?", options: ["Their dot product is 0, meaning they are perpendicular at 90 degrees", "They point in the exact same direction", "Their sum is 1", "They have equal lengths"], answer: 0, points: 10 },
        { id: "Q-DSC-001-10", type: "MCQ", prompt: "What matrix decomposition factors any real m x n matrix into U * Sigma * V^T?", options: ["Singular Value Decomposition (SVD)", "LU Decomposition", "Cholesky Decomposition", "QR Decomposition"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-002",
      title: "Probability & Bayes' Theorem Assessment",
      chapterId: "CH-DSC-002",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-002-01", type: "MCQ", prompt: "What does Bayes' Theorem calculate?", options: ["The posterior probability P(A|B) given prior P(A) and likelihood P(B|A)", "The variance of a distribution", "The slope of a linear regression line", "The median of a sample"], answer: 0, points: 10 },
        { id: "Q-DSC-002-02", type: "MCQ", prompt: "According to the Central Limit Theorem, what distribution do sample means follow as sample size N increases (N >= 30)?", options: ["Gaussian Normal Distribution", "Uniform Distribution", "Exponential Distribution", "Poisson Distribution"], answer: 0, points: 10 },
        { id: "Q-DSC-002-03", type: "MCQ", prompt: "What percentage of data falls within +/- 2 standard deviations of the mean in a standard normal distribution?", options: ["Approximately 95.4%", "68.2%", "99.7%", "50%"], answer: 0, points: 10 },
        { id: "Q-DSC-002-04", type: "MCQ", prompt: "What discrete probability distribution models the number of events occurring in a fixed interval of time or space (e.g., website clicks per minute)?", options: ["Poisson Distribution", "Bernoulli Distribution", "Normal Distribution", "Uniform Distribution"], answer: 0, points: 10 },
        { id: "Q-DSC-002-05", type: "MCQ", prompt: "What distribution models a single binary trial with probability of success p?", options: ["Bernoulli Distribution", "Binomial Distribution", "Exponential Distribution", "Beta Distribution"], answer: 0, points: 10 },
        { id: "Q-DSC-002-06", type: "MCQ", prompt: "What is Maximum Likelihood Estimation (MLE)?", options: ["A method of estimating model parameters that maximizes the likelihood of observing the collected sample data", "A method for minimizing memory usage", "An algorithm for sorting vectors", "A database index strategy"], answer: 0, points: 10 },
        { id: "Q-DSC-002-07", type: "MCQ", prompt: "What is the expected value (mean) of a fair 6-sided die roll?", options: ["3.5", "3.0", "4.0", "2.5"], answer: 0, points: 10 },
        { id: "Q-DSC-002-08", type: "MCQ", prompt: "If two events A and B are independent, what is P(A and B)?", options: ["P(A) * P(B)", "P(A) + P(B)", "P(A) / P(B)", "0"], answer: 0, points: 10 },
        { id: "Q-DSC-002-09", type: "MCQ", prompt: "What continuous probability distribution models the time between independent Poisson events (e.g., time until server failure)?", options: ["Exponential Distribution", "Binomial Distribution", "Uniform Distribution", "Gaussian Distribution"], answer: 0, points: 10 },
        { id: "Q-DSC-002-10", type: "MCQ", prompt: "What is the total area under any valid continuous Probability Density Function (PDF)?", options: ["Exactly 1.0", "100.0", "Infinity", "Depends on the variance"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-003",
      title: "Statistics & Hypothesis Testing Assessment",
      chapterId: "CH-DSC-003",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-003-01", type: "MCQ", prompt: "What is a p-value in statistical hypothesis testing?", options: ["The probability of obtaining test results at least as extreme as observed, assuming the Null Hypothesis (H0) is true", "The probability that the Null Hypothesis is true", "The probability that the experiment failed", "The percentage difference in metrics"], answer: 0, points: 10 },
        { id: "Q-DSC-003-02", type: "MCQ", prompt: "What is a Type I error in statistical decision making?", options: ["False Positive (rejecting the Null Hypothesis when it was actually true)", "False Negative (failing to reject H0 when an effect existed)", "Calculation error", "Missing data error"], answer: 0, points: 10 },
        { id: "Q-DSC-003-03", type: "MCQ", prompt: "What is Statistical Power (1 - beta)?", options: ["The probability of correctly rejecting a false Null Hypothesis (detecting a real effect when one exists)", "The p-value threshold", "The sample size", "The server execution speed"], answer: 0, points: 10 },
        { id: "Q-DSC-003-04", type: "MCQ", prompt: "What statistical test compares the means of two independent groups (e.g., Version A vs Version B)?", options: ["Two-sample independent Student's t-test / Welch's t-test", "Chi-Square goodness of fit", "ANOVA (for 3+ groups)", "Linear Regression"], answer: 0, points: 10 },
        { id: "Q-DSC-003-05", type: "MCQ", prompt: "What test is appropriate to determine whether categorical frequencies differ significantly from expected frequencies (e.g., conversion counts)?", options: ["Chi-Square Test", "Paired t-test", "Z-test for mean", "Pearson correlation"], answer: 0, points: 10 },
        { id: "Q-DSC-003-06", type: "MCQ", prompt: "What measure of central tendency is robust against extreme outliers (e.g., skewed salary distributions)?", options: ["Median", "Mean", "Mode", "Variance"], answer: 0, points: 10 },
        { id: "Q-DSC-003-07", type: "MCQ", prompt: "What does Interquartile Range (IQR) represent?", options: ["The difference between the 75th percentile (Q3) and 25th percentile (Q1)", "The maximum minus the minimum", "The variance divided by 2", "The average of standard deviations"], answer: 0, points: 10 },
        { id: "Q-DSC-003-08", type: "MCQ", prompt: "What metric measures the degree of asymmetry in a probability distribution?", options: ["Skewness", "Kurtosis", "Variance", "Covariance"], answer: 0, points: 10 },
        { id: "Q-DSC-003-09", type: "MCQ", prompt: "What test should be used when comparing the means of three or more distinct experimental treatment groups?", options: ["ANOVA (Analysis of Variance)", "Two-sample t-test", "Chi-Square test", "Mann-Whitney U test"], answer: 0, points: 10 },
        { id: "Q-DSC-003-10", type: "MCQ", prompt: "What problem arises when running 20 simultaneous statistical hypothesis tests at alpha=0.05 without correction?", options: ["The family-wise error rate escalates, dramatically increasing the risk of false positive Type I errors (mitigated via Bonferroni correction)", "The computer runs out of memory", "The p-values invert", "The statistical power drops to 0"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-004",
      title: "NumPy & Scientific Computing Assessment",
      chapterId: "CH-DSC-004",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-004-01", type: "MCQ", prompt: "Why are vectorized NumPy operations dramatically faster than standard Python loops?", options: ["They execute compiled C code using CPU SIMD instructions over contiguous memory buffers without Python interpreter overhead", "NumPy runs in the cloud", "NumPy deletes the data", "Python loops are forbidden"], answer: 0, points: 10 },
        { id: "Q-DSC-004-02", type: "MCQ", prompt: "What does array slicing `sub_arr = arr[0:5]` create in NumPy by default?", options: ["A view sharing the same underlying data buffer as the original array", "A deep, independent copy", "A text file", "A generator"], answer: 0, points: 10 },
        { id: "Q-DSC-004-03", type: "MCQ", prompt: "What is broadcasting in NumPy?", options: ["Rules that allow arithmetic operations between arrays of different shapes along singleton dimensions without copying memory", "Sending data across a network", "Converting arrays to strings", "Compressing matrices"], answer: 0, points: 10 },
        { id: "Q-DSC-004-04", type: "MCQ", prompt: "What method reshapes an array of 12 elements into a 3x4 matrix?", options: ["arr.reshape(3, 4)", "arr.resize(12)", "arr.flatten()", "arr.transpose()"], answer: 0, points: 10 },
        { id: "Q-DSC-004-05", type: "MCQ", prompt: "What operator or function computes true matrix multiplication between two NumPy matrices?", options: ["The `@` operator or `np.matmul(A, B)`", "The `*` operator (which performs element-wise multiplication)", "np.add()", "A % B"], answer: 0, points: 10 },
        { id: "Q-DSC-004-06", type: "MCQ", prompt: "What attribute reports the number of bytes to step in each dimension when traversing an ndarray?", options: ["ndarray.strides", "ndarray.shape", "ndarray.itemsize", "ndarray.ndim"], answer: 0, points: 10 },
        { id: "Q-DSC-004-07", type: "MCQ", prompt: "What function calculates the singular value decomposition of a matrix in NumPy?", options: ["np.linalg.svd()", "np.linalg.eig()", "np.linalg.inv()", "np.linalg.det()"], answer: 0, points: 10 },
        { id: "Q-DSC-004-08", type: "MCQ", prompt: "How do you select all elements in array `arr` that are strictly greater than 100?", options: ["arr[arr > 100]", "arr.filter(100)", "arr.where(100)", "arr.select(>100)"], answer: 0, points: 10 },
        { id: "Q-DSC-004-09", type: "MCQ", prompt: "What is the difference between C-contiguous and Fortran-contiguous array ordering?", options: ["C-order stores rows contiguously; Fortran-order stores columns contiguously", "C-order is 64-bit; Fortran is 32-bit", "C-order runs on Linux only", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-DSC-004-10", type: "MCQ", prompt: "What function flattens an N-dimensional array into a 1D copy?", options: ["arr.flatten()", "arr.squeeze()", "arr.expand()", "arr.unroll()"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-005",
      title: "Pandas 2.0 & PyArrow Assessment",
      chapterId: "CH-DSC-005",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-005-01", type: "MCQ", prompt: "What major memory backend was introduced in Pandas 2.0 to eliminate NumPy object-dtype overhead?", options: ["Apache Arrow (`dtype_backend='pyarrow'`)", "SQLite backend", "Redis backend", "C++ vector backend"], answer: 0, points: 10 },
        { id: "Q-DSC-005-02", type: "MCQ", prompt: "What is the difference between `df.loc[]` and `df.iloc[]` in Pandas?", options: ["`df.loc` is label-based indexing; `df.iloc` is integer position-based indexing", "`df.loc` is for rows; `df.iloc` is for columns", "`df.iloc` is deprecated", "They are identical aliases"], answer: 0, points: 10 },
        { id: "Q-DSC-005-03", type: "MCQ", prompt: "Why should you avoid iterating over DataFrames using `for index, row in df.iterrows()`?", options: ["It creates Series objects for each row in pure Python, causing massive slowdowns compared to vectorized operations", "It causes syntax errors", "It deletes rows", "It requires root permissions"], answer: 0, points: 10 },
        { id: "Q-DSC-005-04", type: "MCQ", prompt: "What method combines multiple DataFrames based on common key columns, analogous to an SQL JOIN?", options: ["pd.merge(df1, df2, on='key')", "pd.concat() only", "df1.combine()", "df1.append()"], answer: 0, points: 10 },
        { id: "Q-DSC-005-05", type: "MCQ", prompt: "What method reshapes a DataFrame from wide format to long format?", options: ["pd.melt()", "df.pivot()", "df.unstack()", "df.transpose()"], answer: 0, points: 10 },
        { id: "Q-DSC-005-06", type: "MCQ", prompt: "What parameter in `df.drop_duplicates()` specifies which duplicate rows to retain?", options: ["keep='first' (or 'last', or False)", "retain='all'", "mode='dedup'", "filter='unique'"], answer: 0, points: 10 },
        { id: "Q-DSC-005-07", type: "MCQ", prompt: "How do you impute missing NaN values in a column with the column's mean value?", options: ["df['col'] = df['col'].fillna(df['col'].mean())", "df['col'].replace(0)", "df.dropna()", "df['col'].clean()"], answer: 0, points: 10 },
        { id: "Q-DSC-005-08", type: "MCQ", prompt: "What method applies an arbitrary function element-wise across a Series or along DataFrame axes?", options: ["df.apply()", "df.map() for Series", "Both .apply() and .map()", "df.run()"], answer: 2, points: 10 },
        { id: "Q-DSC-005-09", type: "MCQ", prompt: "What method converts a DataFrame column containing dates as strings into actual datetime objects?", options: ["pd.to_datetime(df['date_col'])", "df['date_col'].as_date()", "df.format_date()", "pd.parse_time()"], answer: 0, points: 10 },
        { id: "Q-DSC-005-10", type: "MCQ", prompt: "What method aggregates data into a multi-dimensional summary table with row and column headers, similar to an Excel pivot table?", options: ["df.pivot_table()", "df.groupby() only", "df.cross()", "df.table()"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-006",
      title: "Polars & High-Speed DataFrames Assessment",
      chapterId: "CH-DSC-006",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-006-01", type: "MCQ", prompt: "What systems programming language is Polars implemented in for thread-safe multi-core parallelism?", options: ["Rust", "C++", "Go", "C#"], answer: 0, points: 10 },
        { id: "Q-DSC-006-02", type: "MCQ", prompt: "What is Predicate Pushdown in Polars Lazy evaluation?", options: ["The query optimizer pushes filter conditions down to the file scan level, loading only rows that match criteria", "Sorting data on disk", "Pushing calculations to the GPU", "Writing files in reverse"], answer: 0, points: 10 },
        { id: "Q-DSC-006-03", type: "MCQ", prompt: "What method initiates a LazyFrame scan from a Parquet file without loading data into memory?", options: ["pl.scan_parquet('data.parquet')", "pl.read_parquet()", "pl.load_lazy()", "pl.open()"], answer: 0, points: 10 },
        { id: "Q-DSC-006-04", type: "MCQ", prompt: "What method triggers execution of an optimized LazyFrame plan and returns a concrete DataFrame in memory?", options: ["lazy_df.collect()", "lazy_df.execute()", "lazy_df.run()", "lazy_df.evaluate()"], answer: 0, points: 10 },
        { id: "Q-DSC-006-05", type: "MCQ", prompt: "What parameter enables out-of-core streaming in Polars to process datasets larger than physical RAM?", options: ["lazy_df.collect(streaming=True)", "lazy_df.stream_ram()", "lazy_df.chunked()", "lazy_df.swap()"], answer: 0, points: 10 },
        { id: "Q-DSC-006-06", type: "MCQ", prompt: "What expression syntax refers to a column named 'price' in Polars transformations?", options: ["pl.col('price')", "df['price'] only", "pl.field('price')", "pl.var('price')"], answer: 0, points: 10 },
        { id: "Q-DSC-006-07", type: "MCQ", prompt: "What is Projection Pushdown in Polars?", options: ["Reading only the specific subset of columns required by the query rather than all columns in the file", "Displaying 3D charts", "Predicting future rows", "Projecting onto eigenvectors"], answer: 0, points: 10 },
        { id: "Q-DSC-006-08", type: "MCQ", prompt: "Why is Polars substantially faster than Pandas on multi-core processors?", options: ["Polars splits batches across all available CPU threads using the Rayon thread pool in Rust", "Polars disables data validation", "Polars deletes old columns", "Polars runs in a browser"], answer: 0, points: 10 },
        { id: "Q-DSC-006-09", type: "MCQ", prompt: "What underlying memory standard does Polars use for zero-copy memory interoperability?", options: ["Apache Arrow", "Protocol Buffers", "JSON", "BSON"], answer: 0, points: 10 },
        { id: "Q-DSC-006-10", type: "MCQ", prompt: "What method allows converting a Polars DataFrame into a Pandas DataFrame when needed for legacy library compatibility?", options: ["df.to_pandas()", "df.as_pandas()", "pd.from_polars()", "df.convert_pd()"], answer: 0, points: 10 },
      ]
    }
  ]
};

