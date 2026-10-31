// Phase 3: Supervised Machine Learning with Scikit-Learn & Boosting (Chapters 13 to 19) - Data Science
// World-class curriculum: Zero to employable master.

export const phase3 = {
  chapters: [
    // ── Chapter 13 ──
    {
      id: "CH-DSC-013",
      courseId: "CRS-DSC-001",
      sequence: 13,
      title: "Machine Learning Fundamentals & The Bias-Variance Trade-Off",
      description: "Parametric vs non-parametric models, mathematical decomposition of generalization error, high bias (underfitting) vs high variance (overfitting), and stratified K-fold cross-validation.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Supervised ML • Chapter 13</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Machine Learning Fundamentals & The Bias-Variance Trade-Off</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">The fundamental dilemma of machine learning is generalization: training a predictive model that captures underlying structural phenomena without memorizing idiosyncratic sample noise. In this chapter, we master the formal mathematical decomposition of generalization error and rigorous cross-validation design.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/EuBBz3bI-aA" title="Bias-Variance Tradeoff Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Generalization Error Decomposition</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">For any predictive estimator \\(\\hat{f}(x)\\) evaluated against the true data generation process \\(y = f(x) + \\epsilon\\) where \\(\\epsilon \\sim \\mathcal{N}(0, \\sigma^2)\\), expected out-of-sample Mean Squared Error decomposes into three mutually exclusive components:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathbb{E}\\big[(y - \\hat{f}(x))^2\\big] = \\text{Bias}\\big[\\hat{f}(x)\\big]^2 + \\text{Variance}\\big[\\hat{f}(x)\\big] + \\sigma^2$$
  </div>
  <ul style="font-size:14px;color:#475569;line-height:1.8;">
    <li><strong>Bias²:</strong> Error introduced by approximating a complex real-world relationship with an overly simplistic model (e.g., fitting a straight line to quadratic data). Results in underfitting.</li>
    <li><strong>Variance:</strong> Model sensitivity to small fluctuations in the training partition. Highly complex models (e.g., deep unpruned decision trees) memorize noise, producing high variance and overfitting.</li>
    <li><strong>Irreducible Error (\\(\\sigma^2\\)):</strong> Inherent measurement noise and unobserved latent factors that cannot be eliminated by any algorithm.</li>
  </ul>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Leakage-Proof Stratified K-Fold Cross-Validation Pipeline</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Stratified K-Fold preserves class ratios across all validation folds
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Wrapping preprocessing inside Pipeline guarantees zero data leakage across folds
model_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('rf', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Evaluate out-of-fold performance
# scores = cross_val_score(model_pipeline, X, y, cv=cv, scoring='roc_auc')
# print(f"Mean AUC: {np.mean(scores):.4f} +/- {np.std(scores):.4f}")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>High training error + High validation error indicates High Bias (Underfitting) -> Increase model capacity or engineer richer features.</li>
      <li>Low training error + High validation error indicates High Variance (Overfitting) -> Add regularization, prune depth, or collect more data.</li>
      <li>Always embed preprocessors within Scikit-Learn <code>Pipeline</code> objects before cross-validation to prevent train-test leakage.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 14 ──
    {
      id: "CH-DSC-014",
      courseId: "CRS-DSC-001",
      sequence: 14,
      title: "Linear & Polynomial Regression with L1/L2 Regularization",
      description: "Ordinary Least Squares (OLS), Ordinary Differential Equations, Ridge (L2), Lasso (L1) feature selection, ElasticNet, and hyperparameter tuning.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Supervised ML • Chapter 14</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Linear & Polynomial Regression with L1/L2 Regularization</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Linear regression remains the cornerstone of interpretable scientific modeling. However, when features outnumber samples (\\(P > N\\)) or strong multicollinearity exists, Ordinary Least Squares inversion \\((\\mathbf{X}^T\\mathbf{X})^{-1}\\) breaks down. We study penalization mechanics that enforce structural sparsity and numerical stability.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/Q81RR3yKn30" title="Ridge and Lasso Regression" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Regularization Penalty Comparison</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Method</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Penalty Formula</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Geometric Constraint</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Coefficient Behavior</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Ridge (L2)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">$$\\lambda \\sum w_j^2$$</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Hypersphere (smooth circle)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Shrinks coefficients towards zero asymptotically, never exactly zero.</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Lasso (L1)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">$$\\lambda \\sum |w_j|$$</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Hypercube / Diamond (corners on axes)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Drives redundant coefficients to exactly zero (Automatic Feature Selection).</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>ElasticNet</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">$$\\alpha \\big[\\rho L_1 + \\frac{1-\\rho}{2} L_2\\big]$$</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Convex hybrid</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Selects groups of correlated features while avoiding collinear singularity.</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. ElasticNetCV in Scikit-Learn</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.linear_model import ElasticNetCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Automatically searches optimal alpha (penalty) and l1_ratio via cross-validation
elastic_pipe = make_pipeline(
    StandardScaler(),
    ElasticNetCV(
        l1_ratio=[.1, .5, .7, .9, .95, .99, 1],
        cv=5,
        random_state=42
    )
)
# elastic_pipe.fit(X_train, y_train)
# best_model = elastic_pipe.named_steps['elasticnetcv']
# print("Best Alpha:", best_model.alpha_)
# print("Best L1 Ratio:", best_model.l1_ratio_)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always scale features before applying L1 or L2 regularization; unscaled features with large absolute ranges are unfairly penalized.</li>
      <li>Use Lasso when you suspect only a minority of features are truly predictive (sparse solutions).</li>
      <li>Use ElasticNet when features have high mutual correlation; Lasso arbitrarily drops one, while ElasticNet retains both.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 15 ──
    {
      id: "CH-DSC-015",
      courseId: "CRS-DSC-001",
      sequence: 15,
      title: "Logistic Regression & Classification Evaluation Metrics",
      description: "Sigmoid and Softmax activations, Log-Loss cost function, Confusion Matrix, Precision, Recall, F-Beta score, PR-AUC vs ROC-AUC, and class imbalance handling.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Supervised ML • Chapter 15</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Logistic Regression & Classification Evaluation Metrics</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In classification tasks—from fraud detection to disease diagnosis—raw Accuracy is a dangerous trap. In a fraud dataset where 99.9% of transactions are legitimate, a useless model that classifies everything as 'legitimate' achieves 99.9% accuracy while failing 100% of business goals. We master rigorous diagnostic metrics and probability calibration.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/yIYKR4sgzI8" title="ROC and PR Curves Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Classification Metric Decision Framework</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Precision: Cost of False Positives</h3>
      <p style="font-size:14px;color:#475569;">$$Precision = \\frac{TP}{TP + FP}$$</p>
      <p style="font-size:13px;color:#64748b;">Crucial when false alarms carry heavy costs (e.g., spam filters sending critical business contracts to junk, or automated trading triggers).</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#ef4444;margin-top:0;">Recall (Sensitivity): Cost of False Negatives</h3>
      <p style="font-size:14px;color:#475569;">$$Recall = \\frac{TP}{TP + FN}$$</p>
      <p style="font-size:13px;color:#64748b;">Critical when missing a positive case is catastrophic (e.g., malignant tumor screening, high-risk money laundering transaction monitoring).</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">ROC-AUC vs Precision-Recall AUC</h3>
      <p style="font-size:14px;color:#475569;">ROC-AUC evaluates False Positive Rate vs True Positive Rate. Under heavy class imbalance (e.g. 1:1000), ROC-AUC can be deceptively optimistic (~0.98). <strong>PR-AUC</strong> isolates the minority class and exposes real performance.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Threshold Tuning & Cost-Benefit Optimization</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np
from sklearn.metrics import precision_recall_curve

def find_optimal_threshold(y_true, y_probs, cost_fn, cost_fp):
    """Calculates decision threshold minimizing business cost."""
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_probs)
    
    best_threshold = 0.5
    min_cost = float('inf')
    
    for t in thresholds:
        preds = (y_probs >= t).astype(int)
        fn = np.sum((y_true == 1) & (preds == 0))
        fp = np.sum((y_true == 0) & (preds == 1))
        total_cost = (fn * cost_fn) + (fp * cost_fp)
        
        if total_cost < min_cost:
            min_cost = total_cost
            best_threshold = t
            
    return best_threshold, min_cost</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Never report raw accuracy on imbalanced datasets; prioritize PR-AUC, F1-Score, and Balanced Accuracy.</li>
      <li>The default 0.5 classification threshold is arbitrary; tune the threshold to match enterprise dollar costs of False Positives vs False Negatives.</li>
      <li>Logistic Regression with <code>class_weight='balanced'</code> penalizes minority class errors inversely proportional to class frequencies.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 16 ──
    {
      id: "CH-DSC-016",
      courseId: "CRS-DSC-001",
      sequence: 16,
      title: "Decision Trees & Information Theory (Gini vs Entropy)",
      description: "Recursive binary splitting, Gini Impurity, Shannon Entropy, Information Gain, Cost-Complexity Pruning (ccp_alpha), and tree interpretability.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Supervised ML • Chapter 16</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Decision Trees & Information Theory (Gini vs Entropy)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Decision trees form the non-linear foundation of competitive machine learning. By recursively partitioning feature space into orthogonal hyper-rectangles, trees approximate arbitrary non-linear boundaries. We explore the information-theoretic splitting criteria and mathematical post-pruning algorithms.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/_L39rN6gz7Y" title="Decision Tree Algorithm and Pruning" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Splitting Mathematics: Gini Impurity vs Shannon Entropy</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Gini Impurity (CART Default)</h3>
      <p style="font-size:14px;color:#475569;">$$I_G(p) = 1 - \\sum_{k=1}^K p_k^2$$</p>
      <p style="font-size:13px;color:#64748b;">Measures the probability of misclassifying a randomly chosen element if it were labeled randomly according to class distribution. Computationally faster because it avoids logarithmic evaluations.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">Shannon Entropy & Information Gain</h3>
      <p style="font-size:14px;color:#475569;">$$H(p) = -\\sum_{k=1}^K p_k \\log_2(p_k)$$</p>
      <p style="font-size:13px;color:#64748b;">Quantifies disorder in bits. Information Gain is the reduction in entropy achieved by partitioning a node by feature threshold \\(s\\): $$IG = H(parent) - \\sum \\frac{N_j}{N} H(child_j)$$</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Minimal Cost-Complexity Pruning</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import cross_val_score
import numpy as np

clf = DecisionTreeClassifier(random_state=42)
# path contains effective alphas that collapse weak subtrees
path = clf.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas = path.ccp_alphas[:-1] # drop max trivial tree

# Select optimal alpha using cross-validation
alpha_scores = [
    cross_val_score(
        DecisionTreeClassifier(ccp_alpha=alpha, random_state=42),
        X_train, y_train, cv=5
    ).mean()
    for alpha in ccp_alphas
]
optimal_alpha = ccp_alphas[np.argmax(alpha_scores)]
pruned_tree = DecisionTreeClassifier(ccp_alpha=optimal_alpha, random_state=42)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Unconstrained decision trees will continue splitting until every leaf is pure, memorizing training noise (maximum variance).</li>
      <li>Post-pruning with <code>ccp_alpha</code> provides theoretically optimal subtree pruning compared to ad-hoc <code>max_depth</code> caps.</li>
      <li>Decision trees are invariant to monotonic feature scaling; log transformations or standardization do not alter tree splits.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 17 ──
    {
      id: "CH-DSC-017",
      courseId: "CRS-DSC-001",
      sequence: 17,
      title: "Ensemble Methods: Random Forests & Bagging Mechanics",
      description: "Bootstrap aggregating (Bagging), Out-Of-Bag (OOB) error estimation, feature subspace randomization, MDI vs Permutation Feature Importance.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Supervised ML • Chapter 17</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Ensemble Methods: Random Forests & Bagging Mechanics</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">A single decision tree exhibits high variance. Ensemble methods harness the Condorcet jury theorem: combining predictions from an ensemble of diverse, low-bias estimators drastically squashes variance without increasing bias. We analyze the mathematical mechanics of Random Forests.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/J4Wdy0Wc_xQ" title="Random Forest Algorithm Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 2 Pillars of Random Forest De-correlation</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">1. Row Bootstrapping (Bagging)</h3>
      <p style="font-size:14px;color:#475569;">Each of the \\(B\\) trees is trained on an independent bootstrap sample of size \\(N\\) drawn with replacement. Mathematically, approximately <strong>63.2%</strong> of unique rows appear in each sample; the remaining <strong>36.8%</strong> form the <strong>Out-Of-Bag (OOB)</strong> set, enabling free validation without explicit cross-validation splits.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">2. Feature Subspace Randomization</h3>
      <p style="font-size:14px;color:#475569;">At each candidate split, the tree is only permitted to evaluate a random subset of features (typically \\(\\sqrt{P}\\) for classification, \\(P/3\\) for regression). This forces trees to explore orthogonal feature pathways rather than repeatedly selecting the same globally dominant feature at the root.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Permutation Importance vs Impurity-Based Importance</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

rf = RandomForestClassifier(n_estimators=200, oob_score=True, random_state=42)
rf.fit(X_train, y_train)

print(f"Out-of-Bag Score: {rf.oob_score_:.4f}")

# CAUTION: rf.feature_importances_ (MDI) is heavily biased toward high-cardinality features!
# Permutation Importance on held-out validation data is the gold standard:
result = permutation_importance(rf, X_val, y_val, n_repeats=10, random_state=42)
for idx in result.importances_mean.argsort()[::-1][:5]:
    print(f"Feature: {feature_names[idx]} | Drop in Metric: {result.importances_mean[idx]:.4f}")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Bagging squashes prediction variance by a factor of \\(1/B\\) when base estimators are completely uncorrelated.</li>
      <li>Out-Of-Bag (OOB) score provides an unbiased performance estimate computed across non-sampled training rows.</li>
      <li>Avoid default Mean Decrease in Impurity (MDI) importance for feature selection; always prefer Permutation Feature Importance.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 18 ──
    {
      id: "CH-DSC-018",
      courseId: "CRS-DSC-001",
      sequence: 18,
      title: "Gradient Boosting: XGBoost, LightGBM & CatBoost",
      description: "Gradient boosting mathematics, pseudo-residuals, shrinkage (learning rate), second-order Taylor approximations, Histogram binning (GOSS), and GPU acceleration.",
      contentType: "Rich Text",
      durationMinutes: 60,
      minimumTimeMinutes: 30,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Supervised ML • Chapter 18</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Gradient Boosting: XGBoost, LightGBM & CatBoost</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Gradient Boosted Decision Trees (GBDT) dominate tabular competitive data science and industry production ranking engines. Unlike Bagging, which trains independent parallel trees to reduce variance, Boosting trains sequential shallow trees where each new model fits the residual gradients of the preceding ensemble.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/OtD8wVaFm6E" title="Gradient Boosting Algorithm Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Modern GBDT Framework Showdown</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Feature</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">XGBoost</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">LightGBM</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">CatBoost</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Tree Growth Strategy</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Level-wise (balanced depth)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Leaf-wise (best-first split)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Symmetric / Oblivious trees</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Categorical Handling</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Experimental partition</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Optimal integer binning</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Native Ordered Target Statistics (Gold standard)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Sampling Mechanics</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Subsample / Colsample</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">GOSS (Gradient-based One-Side Sampling)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">MVS (Minimum Variance Sampling)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Speed on Massive Data</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Fast (GPU hist)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Ultra-fast (Lowest memory footprint)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Moderate (Fastest inference execution)</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Production LightGBM Training with Early Stopping</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import lightgbm as lgb

train_data = lgb.Dataset(X_train, label=y_train)
val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

params = {
    'objective': 'binary',
    'metric': 'auc',
    'boosting_type': 'gbdt',
    'learning_rate': 0.05,
    'num_leaves': 31,
    'max_depth': -1,
    'feature_fraction': 0.8,
    'n_jobs': -1,
    'random_state': 42
}

model = lgb.train(
    params,
    train_data,
    num_boost_round=1000,
    valid_sets=[val_data],
    callbacks=[
        lgb.early_stopping(stopping_rounds=50),
        lgb.log_evaluation(period=100)
    ]
)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>GBDT iteratively minimizes custom differentiable loss functions by fitting new base learners to negative loss gradients.</li>
      <li>Early stopping with a held-out validation set protects against overfitting while finding the optimal number of trees.</li>
      <li>LightGBM's leaf-wise splitting achieves lower loss than level-wise splitting but requires bounding <code>min_child_samples</code> to prevent leaf overfitting.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 19 ──
    {
      id: "CH-DSC-019",
      courseId: "CRS-DSC-001",
      sequence: 19,
      title: "Support Vector Machines (SVM) & The Kernel Trick",
      description: "Maximum margin hyperplanes, support vectors, soft margin slack variables (C parameter), Radial Basis Function (RBF), and Mercer's Theorem.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Supervised ML • Chapter 19</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Support Vector Machines (SVM) & The Kernel Trick</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Support Vector Machines are among the most mathematically elegant supervised algorithms in machine learning. By mapping non-separable input vectors into an infinite-dimensional Hilbert space via the Kernel Trick, SVMs discover optimal linear separating hyperplanes without computing expensive coordinate transformations.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/efR1C6CvhmE" title="Support Vector Machines Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Radial Basis Function (RBF) Kernel</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The Gaussian RBF kernel measures similarity between points \\(\\mathbf{x}\\) and \\(\\mathbf{x}'\\) through Euclidean distance decayed by bandwidth hyperparameter \\(\\gamma\\):</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$K(\\mathbf{x}, \\mathbf{x}') = \\exp\\big(-\\gamma \\|\\mathbf{x} - \\mathbf{x}'\\|^2\\big)$$
  </div>
  <ul style="font-size:14px;color:#475569;line-height:1.8;">
    <li><strong>C Parameter (Regularization):</strong> Controls the trade-off between maximizing margin width and penalizing slack margin violations. High \\(C\\) enforces a hard margin (risk of overfitting); small \\(C\\) permits soft violations (higher bias, robust to noise).</li>
    <li><strong>Gamma (\\(\\gamma\\)):</strong> Inversely proportional to the radius of influence of individual support vectors. High \\(\\gamma\\) creates tight decision boundaries around single samples; low \\(\\gamma\\) produces smooth contours.</li>
  </ul>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>SVM decision boundaries depend entirely on a sparse subset of training instances known as Support Vectors.</li>
      <li>Feature standardization (e.g. <code>StandardScaler</code>) is strictly mandatory for SVMs due to Euclidean distance sensitivity.</li>
      <li>While highly effective for high-dimensional, small-to-medium datasets (e.g., bioinformatics, text classification), SVM training scales \\(\\mathcal{O}(N^2)\\) to \\(\\mathcal{O}(N^3)\\), making it slow on multi-million row datasets.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-DSC-013",
      title: "Bias-Variance & Model Selection Assessment",
      chapterId: "CH-DSC-013",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-013-01", type: "MCQ", prompt: "What are the three components that make up the expected generalization error of a predictive model?", options: ["Bias squared, Variance, and Irreducible Error", "Precision, Recall, and Accuracy", "True Positives, False Positives, and False Negatives", "L1 penalty, L2 penalty, and learning rate"], answer: 0, points: 10 },
        { id: "Q-DSC-013-02", type: "MCQ", prompt: "A model exhibits 99% accuracy on the training set but only 61% on the held-out validation set. What is this diagnostic signature?", options: ["High Variance (Overfitting)", "High Bias (Underfitting)", "Optimal convergence", "Data leakage in test set"], answer: 0, points: 10 },
        { id: "Q-DSC-013-03", type: "MCQ", prompt: "How does increasing model capacity (e.g., growing deeper trees or adding polynomial degrees) affect bias and variance?", options: ["Decreases bias but increases variance", "Increases bias and increases variance", "Decreases both bias and variance", "Increases bias but decreases variance"], answer: 0, points: 10 },
        { id: "Q-DSC-013-04", type: "MCQ", prompt: "Why is Stratified K-Fold cross-validation essential for imbalanced classification tasks?", options: ["It ensures that each fold contains approximately the same percentage of target class labels as the complete dataset", "It trains models twice as fast", "It removes missing values automatically", "It guarantees 100% test score"], answer: 0, points: 10 },
        { id: "Q-DSC-013-05", type: "MCQ", prompt: "Why must feature scaling be placed inside a Scikit-Learn Pipeline during cross-validation?", options: ["To prevent information leakage from validation folds into scaler mean/variance calculations during training", "Because scalers cannot run outside pipelines", "To compress the model pickle file", "To convert data to SQL"], answer: 0, points: 10 },
        { id: "Q-DSC-013-06", type: "MCQ", prompt: "Which of the following actions is the most effective remedy for high bias (underfitting)?", options: ["Increasing model complexity, adding non-linear features, or reducing regularization penalties", "Collecting fewer features", "Increasing L2 penalty lambda", "Decreasing tree depth to 1"], answer: 0, points: 10 },
        { id: "Q-DSC-013-07", type: "MCQ", prompt: "What does the Irreducible Error component in the bias-variance decomposition represent?", options: ["Noise inherently present in the data generation process that cannot be eliminated by any model", "A bug in the optimizer code", "Floating point rounding error", "Misspelled column names"], answer: 0, points: 10 },
        { id: "Q-DSC-013-08", type: "MCQ", prompt: "In time-series cross-validation, why is standard randomized K-Fold shuffling prohibited?", options: ["It leaks future temporal information into past training periods (lookahead bias)", "Time series cannot be split into folds", "Shuffling corrupts floating point numbers", "Time series only allows 1 fold"], answer: 0, points: 10 },
        { id: "Q-DSC-013-09", type: "MCQ", prompt: "What cross-validation technique evaluates a model on \\(N\\) separate iterations using \\(N-1\\) samples for training and exactly 1 sample for testing?", options: ["Leave-One-Out Cross-Validation (LOOCV)", "Stratified 5-Fold", "Monte Carlo CV", "GroupKFold"], answer: 0, points: 10 },
        { id: "Q-DSC-013-10", type: "MCQ", prompt: "When multiple observations belong to the same customer or hospital patient, which cross-validation splitter must be used to prevent group leakage?", options: ["GroupKFold", "KFold", "ShuffleSplit", "StratifiedKFold"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-014",
      title: "Regularized Linear Regression Assessment",
      chapterId: "CH-DSC-014",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-014-01", type: "MCQ", prompt: "What penalty term is added to Ordinary Least Squares loss in Ridge (L2) regression?", options: ["The sum of squared coefficient weights (lambda * sum w_j^2)", "The sum of absolute coefficient weights", "The maximum weight value", "The rank of matrix X"], answer: 0, points: 10 },
        { id: "Q-DSC-014-02", type: "MCQ", prompt: "Why can Lasso (L1) regression be utilized for automated feature selection while Ridge cannot?", options: ["The sharp geometric corners of the L1 diamond constraint force non-informative weights to become exactly zero", "Lasso drops random columns", "Ridge creates imaginary numbers", "Lasso only runs on selected features"], answer: 0, points: 10 },
        { id: "Q-DSC-014-03", type: "MCQ", prompt: "What problem occurs in Ordinary Least Squares when two or more predictor features are collinear?", options: ["The matrix X^T X becomes near-singular and non-invertible, causing coefficient variance to explode", "Predictions become negative", "Residuals disappear", "R-squared reaches 2.0"], answer: 0, points: 10 },
        { id: "Q-DSC-014-04", type: "MCQ", prompt: "What hybrid regularizer combines both L1 and L2 penalties using an l1_ratio parameter?", options: ["ElasticNet", "Kernel Ridge", "Huber Regressor", "RANSAC"], answer: 0, points: 10 },
        { id: "Q-DSC-014-05", type: "MCQ", prompt: "Why is feature scaling mandatory prior to fitting Ridge or Lasso regression models?", options: ["Because regularization penalizes coefficient magnitudes directly; unscaled features with large ranges are unfairly suppressed", "Because matrix multiplication requires unit vectors", "To avoid negative loss values", "To convert floats to decimals"], answer: 0, points: 10 },
        { id: "Q-DSC-014-06", type: "MCQ", prompt: "What is the closed-form normal equation for Ridge regression weights?", options: ["w = (X^T X + lambda I)^(-1) X^T y", "w = (X^T X)^(-1) X^T y", "w = X y / lambda", "w = (X + lambda)^T y"], answer: 0, points: 10 },
        { id: "Q-DSC-014-07", type: "MCQ", prompt: "In Scikit-Learn's Ridge and Lasso estimators, what hyperparameter name represents the regularization strength lambda?", options: ["alpha", "lambda_param", "C", "regularizer"], answer: 0, points: 10 },
        { id: "Q-DSC-014-08", type: "MCQ", prompt: "What regression model uses a combination of L1 and L2 loss to remain robust against extreme outlier samples?", options: ["Huber Regressor", "OLS", "Ridge", "PolynomialFeatures"], answer: 0, points: 10 },
        { id: "Q-DSC-014-09", type: "MCQ", prompt: "What happens to the model when alpha approaches infinity in Ridge regression?", options: ["All coefficient weights shrink asymptotically to zero, producing a constant horizontal line at the mean of y", "The model fits every point perfectly", "Coefficients diverge to infinity", "R-squared becomes 1.0"], answer: 0, points: 10 },
        { id: "Q-DSC-014-10", type: "MCQ", prompt: "What transformation generates non-linear polynomial interaction features (e.g., x1^2, x1*x2) for linear models?", options: ["PolynomialFeatures(degree=d)", "StandardScaler", "KBinsDiscretizer", "SplineTransformer"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-015",
      title: "Logistic Regression & Classification Metrics Assessment",
      chapterId: "CH-DSC-015",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-015-01", type: "MCQ", prompt: "What activation function does Logistic Regression apply to linear combinations to squash outputs into probabilities [0, 1]?", options: ["Sigmoid function: 1 / (1 + e^(-z))", "ReLU function: max(0, z)", "Tanh function", "Softplus function"], answer: 0, points: 10 },
        { id: "Q-DSC-015-02", type: "MCQ", prompt: "What loss function is minimized during Logistic Regression model parameter estimation?", options: ["Binary Cross-Entropy (Log-Loss)", "Mean Squared Error (MSE)", "Mean Absolute Error (MAE)", "Hinge Loss"], answer: 0, points: 10 },
        { id: "Q-DSC-015-03", type: "MCQ", prompt: "In a medical cancer detection test, what metric represents the proportion of actual cancer patients correctly identified?", options: ["Recall (Sensitivity)", "Precision", "Specificity", "False Positive Rate"], answer: 0, points: 10 },
        { id: "Q-DSC-015-04", type: "MCQ", prompt: "What does Precision measure in classification diagnostic evaluation?", options: ["The proportion of positive model predictions that were actually true positive", "The total correct predictions divided by all samples", "The false positive rate", "The area under the ROC curve"], answer: 0, points: 10 },
        { id: "Q-DSC-015-05", type: "MCQ", prompt: "Why is Precision-Recall AUC (PR-AUC) superior to ROC-AUC when evaluating datasets with extreme class imbalance?", options: ["PR-AUC focuses strictly on the minority positive class without being inflated by a massive true negative count", "PR-AUC can only be between 0.9 and 1.0", "ROC-AUC cannot be calculated for binary models", "PR-AUC ignores false positives"], answer: 0, points: 10 },
        { id: "Q-DSC-015-06", type: "MCQ", prompt: "What is the harmonic mean of Precision and Recall?", options: ["F1-Score", "ROC-AUC", "Accuracy", "Cohen's Kappa"], answer: 0, points: 10 },
        { id: "Q-DSC-015-07", type: "MCQ", prompt: "In the F-Beta score formula, what beta value weights Recall twice as heavily as Precision?", options: ["beta = 2.0", "beta = 0.5", "beta = 1.0", "beta = 0.2"], answer: 0, points: 10 },
        { id: "Q-DSC-015-08", type: "MCQ", prompt: "What calibration diagnostic curve plots predicted probabilities against empirical observed frequencies?", options: ["Reliability Diagram (Calibration Curve)", "Confusion Matrix", "Learning Curve", "Scree Plot"], answer: 0, points: 10 },
        { id: "Q-DSC-015-09", type: "MCQ", prompt: "How does setting `class_weight='balanced'` in Scikit-Learn Logistic Regression help overcome class imbalance?", options: ["It weights the loss of each sample inversely proportional to its class frequency in the training data", "It duplicates minority rows on disk", "It discards majority class examples", "It forces 50% predictions"], answer: 0, points: 10 },
        { id: "Q-DSC-015-10", type: "MCQ", prompt: "What multi-class generalization of the Sigmoid function normalizes unconstrained logit vectors into a valid probability distribution?", options: ["Softmax function", "GELU function", "Swish function", "Heaviside step"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-016",
      title: "Decision Trees & Information Theory Assessment",
      chapterId: "CH-DSC-016",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-016-01", type: "MCQ", prompt: "What is the Gini Impurity of a completely pure decision tree leaf where 100% of samples belong to class 1?", options: ["0.0", "0.5", "1.0", "-1.0"], answer: 0, points: 10 },
        { id: "Q-DSC-016-02", type: "MCQ", prompt: "What is the theoretical maximum Shannon Entropy for a balanced binary classification node (p1 = 0.5, p2 = 0.5)?", options: ["1.0 bit", "0.0 bits", "0.5 bits", "2.0 bits"], answer: 0, points: 10 },
        { id: "Q-DSC-016-03", type: "MCQ", prompt: "What is Information Gain in decision tree node splitting?", options: ["The reduction in entropy achieved after partitioning parent node samples into child subsets", "The increase in model speed", "The number of leaves created", "The depth of the tree"], answer: 0, points: 10 },
        { id: "Q-DSC-016-04", type: "MCQ", prompt: "Why is Gini Impurity typically preferred over Shannon Entropy in high-performance implementations like CART?", options: ["Gini avoids expensive log2 calculations, computing faster while producing nearly identical splits", "Gini has higher accuracy", "Entropy only works on integers", "Gini handles missing data automatically"], answer: 0, points: 10 },
        { id: "Q-DSC-016-05", type: "MCQ", prompt: "What parameter in Scikit-Learn controls Minimal Cost-Complexity Pruning to eliminate overfitted leaf subtrees?", options: ["ccp_alpha", "min_samples_split", "max_leaf_nodes", "criterion"], answer: 0, points: 10 },
        { id: "Q-DSC-016-06", type: "MCQ", prompt: "How do decision tree algorithms respond to monotonic feature transformations such as logarithmic scaling?", options: ["Splits remain completely identical because decision trees evaluate rank order, not absolute scale", "The tree flips backwards", "The tree requires 10x more depth", "Entropy increases"], answer: 0, points: 10 },
        { id: "Q-DSC-016-07", type: "MCQ", prompt: "What geometric shape characterizes decision boundaries created by standard single decision trees?", options: ["Axis-aligned orthogonal hyper-rectangles", "Curved circular contours", "Diagonal linear planes", "Smooth polynomial curves"], answer: 0, points: 10 },
        { id: "Q-DSC-016-08", type: "MCQ", prompt: "What splitting criterion is utilized for regression decision trees to evaluate partition quality?", options: ["Mean Squared Error (MSE / Variance reduction)", "Gini Impurity", "Information Gain", "Cross-entropy"], answer: 0, points: 10 },
        { id: "Q-DSC-016-09", type: "MCQ", prompt: "What happens if a decision tree is trained without any depth constraints or minimum sample parameters?", options: ["It will split until all training leaves have zero impurity, resulting in severe overfitting", "It will terminate at depth 3", "It fails to learn any pattern", "It generates linear boundaries"], answer: 0, points: 10 },
        { id: "Q-DSC-016-10", type: "MCQ", prompt: "What is an inherent weakness of individual decision trees when applied to unseen test distributions?", options: ["High variance and sensitivity to slight perturbations in the training dataset", "Inability to process categorical features", "Excessive CPU RAM requirements", "Lack of interpretability"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-017",
      title: "Random Forests & Ensemble Learning Assessment",
      chapterId: "CH-DSC-017",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-017-01", type: "MCQ", prompt: "What is the primary mathematical objective of Bagging (Bootstrap Aggregation)?", options: ["Reducing model variance by averaging multiple de-correlated estimators", "Reducing model bias by sequential error fitting", "Selecting the single best feature", "Normalizing feature distributions"], answer: 0, points: 10 },
        { id: "Q-DSC-017-02", type: "MCQ", prompt: "Approximately what percentage of original training instances are included in any single bootstrap sample?", options: ["~63.2%", "~50.0%", "~95.0%", "~33.3%"], answer: 0, points: 10 },
        { id: "Q-DSC-017-03", type: "MCQ", prompt: "What is the Out-of-Bag (OOB) error in Random Forests?", options: ["Validation error calculated on observations not included in a tree's bootstrap training partition", "Error on corrupted disk sectors", "Error from missing feature values", "The test error on future unlabelled rows"], answer: 0, points: 10 },
        { id: "Q-DSC-017-04", type: "MCQ", prompt: "What additional mechanism distinguishes Random Forests from standard Bagged Decision Trees?", options: ["Feature subspace randomization: only evaluating a random subset of features at each split", "Tree depth limits", "Using gradient descent", "Pruning all trees"], answer: 0, points: 10 },
        { id: "Q-DSC-017-05", type: "MCQ", prompt: "What is the standard recommended default number of candidate features evaluated at each split for classification?", options: ["sqrt(P)", "P / 3", "P - 1", "log2(P)"], answer: 0, points: 10 },
        { id: "Q-DSC-017-06", type: "MCQ", prompt: "Why is default Mean Decrease in Impurity (MDI) feature importance flawed for high-cardinality features?", options: ["It exhibits an inherent bias towards continuous or high-cardinality features that offer more split opportunities", "It requires 100 iterations", "It only ranks negative numbers", "It sums to zero"], answer: 0, points: 10 },
        { id: "Q-DSC-017-07", type: "MCQ", prompt: "How is Permutation Feature Importance calculated on held-out validation data?", options: ["By shuffling a single feature's values and measuring the resulting drop in model evaluation score", "By deleting the column entirely", "By training 10 new models", "By sorting the column ascending"], answer: 0, points: 10 },
        { id: "Q-DSC-017-08", type: "MCQ", prompt: "What ensemble voting scheme weights individual base estimators by their predicted class probabilities?", options: ["Soft voting", "Hard voting", "Plurality voting", "Rank voting"], answer: 0, points: 10 },
        { id: "Q-DSC-017-09", type: "MCQ", prompt: "Does increasing `n_estimators` (e.g., from 100 to 1,000 trees) in a Random Forest cause it to overfit?", options: ["No, increasing trees stabilizes the ensemble variance; it does not lead to overfitting", "Yes, more trees always overfit", "Yes, it increases bias", "Only on binary datasets"], answer: 0, points: 10 },
        { id: "Q-DSC-017-10", type: "MCQ", prompt: "What variation of Random Forests draws split thresholds completely at random without optimizing split quality?", options: ["Extra Trees (Extremely Randomized Trees)", "Adaboost", "XGBoost", "Isolation Forest"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-018",
      title: "Gradient Boosting & Modern GBDT Assessment",
      chapterId: "CH-DSC-018",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-018-01", type: "MCQ", prompt: "What fundamental algorithmic strategy differentiates Gradient Boosting from Random Forests?", options: ["Gradient Boosting trains sequential trees to predict pseudo-residuals of previous trees, reducing bias", "Gradient Boosting trains independent trees in parallel", "Gradient Boosting is an unsupervised algorithm", "Gradient Boosting uses linear models as estimators"], answer: 0, points: 10 },
        { id: "Q-DSC-018-02", type: "MCQ", prompt: "What role does the 'learning_rate' (shrinkage) play in gradient boosting algorithms?", options: ["It scales the contribution of each newly fitted tree, preventing premature convergence and overfitting", "It dictates CPU clock speeds", "It determines how many trees are created", "It sets the random seed"], answer: 0, points: 10 },
        { id: "Q-DSC-018-03", type: "MCQ", prompt: "What tree-growth strategy does LightGBM use by default that differentiates it from XGBoost's level-wise growth?", options: ["Leaf-wise (best-first) tree growth", "Depth-first exhaustive growth", "Symmetric oblivious growth", "Random growth"], answer: 0, points: 10 },
        { id: "Q-DSC-018-04", type: "MCQ", prompt: "What sampling technique allows LightGBM to retain instances with large gradients while randomly subsampling small gradients?", options: ["GOSS (Gradient-based One-Side Sampling)", "OOB Sampling", "Stratified Subsampling", "SMOTE"], answer: 0, points: 10 },
        { id: "Q-DSC-018-05", type: "MCQ", prompt: "What distinguishes CatBoost's treatment of categorical variables from standard one-hot encoding?", options: ["Ordered Target Statistics computed iteratively over random dataset permutations to prevent target leakage", "It replaces words with random integers", "It converts categories into image pixels", "It ignores all text features"], answer: 0, points: 10 },
        { id: "Q-DSC-018-06", type: "MCQ", prompt: "What mathematical enhancement did XGBoost introduce over classic Friedman gradient boosting?", options: ["Second-order Taylor expansion (Hessian matrix) and explicit L1/L2 tree complexity regularization", "Quantum annealing", "First-order derivatives only", "Unconstrained linear activation"], answer: 0, points: 10 },
        { id: "Q-DSC-018-07", type: "MCQ", prompt: "What training mechanism halts tree additions when validation loss fails to improve for a specified number of rounds?", options: ["Early Stopping", "Gradient clipping", "Dropout", "Batch normalization"], answer: 0, points: 10 },
        { id: "Q-DSC-018-08", type: "MCQ", prompt: "What type of decision trees does CatBoost build where all nodes at the same tree level share identical split conditions?", options: ["Oblivious (Symmetric) trees", "Asymmetric trees", "Ternary trees", "Depth-unbounded trees"], answer: 0, points: 10 },
        { id: "Q-DSC-018-09", type: "MCQ", prompt: "What hyperparameter in LightGBM should be tuned to prevent deep leaf-wise trees from overfitting tiny sub-clusters?", options: ["min_child_samples (or min_data_in_leaf)", "max_depth only", "learning_rate to 1.0", "boosting_type"], answer: 0, points: 10 },
        { id: "Q-DSC-018-10", type: "MCQ", prompt: "Why do modern GBDT libraries convert continuous float features into discrete 256-bin histograms?", options: ["Histogram binning converts continuous split searches from O(N log N) sorting to O(bins) aggregations, saving 80% RAM", "Because CPUs cannot compare floats", "To eliminate the need for GPU", "To convert data to 8-bit audio"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-019",
      title: "Support Vector Machines Assessment",
      chapterId: "CH-DSC-019",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-019-01", type: "MCQ", prompt: "What are 'Support Vectors' in a Support Vector Machine?", options: ["The critical training instances lying closest to the decision hyperplane that define the margin boundaries", "All data points in the training set", "The weights of the neural network", "The eigenvalues of matrix X"], answer: 0, points: 10 },
        { id: "Q-DSC-019-02", type: "MCQ", prompt: "What does the 'Kernel Trick' enable an SVM to accomplish mathematically?", options: ["Compute inner products in an implicit high-dimensional feature space without ever calculating coordinates explicitly", "Run without training data", "Invert non-square matrices", "Bypassing gradient descent"], answer: 0, points: 10 },
        { id: "Q-DSC-019-03", type: "MCQ", prompt: "What happens if the regularization parameter C in an SVM is set to an extremely large value?", options: ["The model enforces a hard margin, strictly penalizing misclassifications and risking overfitting", "The model becomes a linear regression", "The margin becomes infinitely wide", "All support vectors are deleted"], answer: 0, points: 10 },
        { id: "Q-DSC-019-04", type: "MCQ", prompt: "What does the gamma parameter in the Radial Basis Function (RBF) kernel control?", options: ["The inverse radius of influence of each support vector (higher gamma = tighter, more complex boundaries)", "The number of hyperplanes", "The learning rate", "The maximum number of iterations"], answer: 0, points: 10 },
        { id: "Q-DSC-019-05", type: "MCQ", prompt: "Why is feature scaling essential before training an SVM with an RBF kernel?", options: ["The RBF kernel computes Euclidean distances; unscaled features with large numerical magnitudes dominate distance calculations", "SVM algorithms crash on negative numbers", "Scaling transforms data into integers", "To satisfy Mercer's condition"], answer: 0, points: 10 },
        { id: "Q-DSC-019-06", type: "MCQ", prompt: "What theorem states that any continuous, symmetric positive semi-definite kernel function can be expressed as an inner product in a Hilbert space?", options: ["Mercer's Theorem", "Bayes' Theorem", "Central Limit Theorem", "Gauss-Markov Theorem"], answer: 0, points: 10 },
        { id: "Q-DSC-019-07", type: "MCQ", prompt: "What is the computational time complexity of training standard non-linear kernel SVMs with respect to sample size N?", options: ["Between O(N^2) and O(N^3)", "O(log N)", "O(N)", "O(1)"], answer: 0, points: 10 },
        { id: "Q-DSC-019-08", type: "MCQ", prompt: "What loss function does a Support Vector Machine minimize?", options: ["Hinge loss with L2 regularization", "Mean squared error", "Binary cross-entropy", "Huber loss"], answer: 0, points: 10 },
        { id: "Q-DSC-019-09", type: "MCQ", prompt: "What class in Scikit-Learn provides a fast linear SVM implementation optimized for large datasets using LibLinear?", options: ["LinearSVC", "SVC(kernel='rbf')", "NuSVC", "OneClassSVM"], answer: 0, points: 10 },
        { id: "Q-DSC-019-10", type: "MCQ", prompt: "What technique enables multi-class classification using binary SVM classifiers?", options: ["One-vs-Rest (OvR) or One-vs-One (OvO) strategies", "Softmax kernel", "Direct polynomial scaling", "K-Means partitioning"], answer: 0, points: 10 },
      ]
    }
  ]
};

