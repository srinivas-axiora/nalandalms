// Course 9: MLOps Masterclass - Phase 4: Monitoring, Drift Detection & Observability
// Chapters 19 to 24 | Assessments 19 to 24 | 60 MCQs

export const phase4 = {
  chapters: [
    {
      id: "CH-MLO-019",
      courseId: "CRS-MLO-001",
      sequence: 19,
      title: "The ML Drift Taxonomy: Data Drift, Concept Drift & Covariate Shift",
      description: "Deconstruct production model decay: Covariate Shift, Prior Probability Shift, Concept Drift, Kolmogorov-Smirnov tests, Population Stability Index (PSI), and Wasserstein distance.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# The ML Drift Taxonomy: Data Drift, Concept Drift & Covariate Shift

Production machine learning models operate in dynamic, non-stationary real-world environments. When real-world user behaviors, macroeconomic conditions, or upstream sensor hardware mutate, models suffer from **Drift**, causing catastrophic silent degradation.

---

## 1. The Mathematical Taxonomy of Drift

Let $X$ denote the input feature vectors and $Y$ denote the target ground-truth labels. The joint probability distribution is defined as:
$$P(X, Y) = P(X) \\cdot P(Y | X) = P(Y) \\cdot P(X | Y)$$

\`\`\`
+--------------------------------------------------------------------------+
| 1. DATA DRIFT (Covariate Shift): P(X) Changes, P(Y|X) Unchanged          |
| - The distribution of input features shifts, but the underlying          |
|   relationship mapping inputs to outputs remains constant.               |
| - Example: A ride-sharing app expands from downtown to rural suburbs.   |
|   Trip distances (X) increase, but the pricing formula (Y|X) holds.      |
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 2. CONCEPT DRIFT: P(Y|X) Changes, P(X) Unchanged                         |
| - The fundamental relationship between inputs and outputs mutates.       |
| - Example: Global pandemic strikes. A flight search query (X) that       |
|   previously predicted a booking (Y=1) now predicts cancellation (Y=0).  |
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 3. PRIOR PROBABILITY SHIFT: P(Y) Changes                                 |
| - The overall frequency of the target labels shifts in the population.   |
| - Example: Fraud rates surge from 0.1% to 5.0% during a coordinated hack.|
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Statistical Distance Metrics for Drift Quantification

### 1. Kolmogorov-Smirnov (KS) Test (Continuous Numerical Features):
Compares empirical cumulative distribution functions (eCDFs) between baseline reference data ($F_{\\text{ref}}$) and live production data ($F_{\\text{prod}}$):
$$D = \\sup_x |F_{\\text{ref}}(x) - F_{\\text{prod}}(x)|$$
If the $p$-value $< 0.05$, the feature has drifted significantly.

### 2. Population Stability Index (PSI):
Measures divergence across binned probability distributions:
$$\\text{PSI} = \\sum_{i=1}^k \\left( \\% \\text{Actual}_i - \\% \\text{Expected}_i \\right) \\times \\ln\\left( \\frac{\\% \\text{Actual}_i}{\\% \\text{Expected}_i} \\right)$$

| PSI Value Range | Interpretation & Production Action |
|---|---|
| **$\\text{PSI} < 0.10$** | **No Drift:** Distributions are stable; no action required. |
| **$0.10 \\le \\text{PSI} < 0.25$** | **Moderate Drift:** Warning alert; queue model for scheduled evaluation. |
| **$\\text{PSI} \\ge 0.25$** | **Severe Drift:** Trigger automated retraining or revert to fallback rule engine! |

### 3. Wasserstein Distance (Earth Mover's Distance):
Measures the minimum work required to transform one continuous distribution shape into another:
$$W_1(P, Q) = \\int_{-\\infty}^{\\infty} |F_P(x) - F_Q(x)| \\, dx$$

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U_7L5jUu7o" title="Data Drift vs Concept Drift in Machine Learning" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-020",
      courseId: "CRS-MLO-001",
      sequence: 20,
      title: "Real-Time Drift Detection with Evidently AI & Alibi Detect",
      description: "Implement continuous drift monitoring with Evidently AI and Alibi Detect: automated test suites, drift metrics export, and out-of-distribution (OOD) alerts.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Real-Time Drift Detection with Evidently AI & Alibi Detect

Deploying statistical tests into real-time production pipelines requires structured observability frameworks. **Evidently AI** evaluates streaming or batched inference traffic against historical reference sets, generating automated drift reports and Prometheus metrics.

---

## 1. Automated Evidently AI Report Pipeline

\`\`\`python
import pandas as pd
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, TargetDriftPreset, DataQualityPreset

# 1. Load Baseline Training Reference and Live Production Data
reference_data = pd.read_parquet("data/train_baseline.parquet")
current_production_data = pd.read_parquet("data/production_inferences_yesterday.parquet")

# 2. Build Multi-Metric Observability Report
report = Report(metrics=[
    DataDriftPreset(stat_test="psi", stat_test_threshold=0.2),
    DataQualityPreset()
])

report.run(reference_data=reference_data, current_data=current_production_data)

# 3. Export as Structured JSON for Automated Gate Logic
report_json = report.as_dict()
drift_share = report_json["metrics"][0]["result"]["drift_share"]
dataset_drifted = report_json["metrics"][0]["result"]["dataset_drift"]

if dataset_drifted:
    print(f"CRITICAL: {drift_share * 100:.1f}% of features drifted! Firing Retraining Webhook...")
    # Trigger Kubeflow retraining pipeline
\`\`\`

---

## 2. Unsupervised Outlier & Adversarial Detection with Alibi Detect

When ground-truth labels take weeks or months to arrive (e.g., loan default takes 12 months to realize), **Alibi Detect** identifies individual adversarial queries or out-of-distribution samples in real time using autoencoders or Mahalanobis distance.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Evidently AI Tutorial: Model Monitoring & Drift Detection" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-021",
      courseId: "CRS-MLO-001",
      sequence: 21,
      title: "Model Performance & Latency Telemetry with Prometheus & Grafana",
      description: "Instrument inference microservices with Prometheus and Grafana: latency percentiles (p95, p99), throughput RPS, GPU saturation, and SLA breach alerting.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Model Performance & Latency Telemetry with Prometheus & Grafana

Machine learning inference services exhibit unique operational characteristics: bursty latency, GPU memory exhaustion, and high variance across payload batch sizes. Operational observability requires instrumenting both the software layer and the hardware accelerator.

---

## 1. Key Production MLOps Telemetry Metrics

| Telemetry Metric | Prometheus Metric Name & Type | Production SLA Target |
|---|---|---|
| **Inference Latency** | \`model_inference_duration_seconds\` (Histogram) | $p99 < 30\\text{ms}$ |
| **Serving Throughput** | \`model_prediction_requests_total\` (Counter) | Track requests per second (RPS) |
| **Dynamic Batch Size** | \`model_batch_size_executed\` (Histogram) | Average batch size $\\ge 16$ |
| **GPU VRAM Utilization** | \`DCGM_FI_DEV_FB_USED\` (Gauge) | Alert if $> 90\\%$ (imminent OOM risk) |
| **GPU Compute SM Saturation** | \`DCGM_FI_DEV_GPU_UTIL\` (Gauge) | Maintain $70\\% - 85\\%$ healthy load |

---

## 2. PromQL Latency & Error Alerting Rules

\`\`\`yaml
groups:
  - name: ml_serving_alerts
    rules:
      - alert: HighModelInferenceLatency
        expr: histogram_quantile(0.99, sum(rate(model_inference_duration_seconds_bucket[5m])) by (le, model_name)) > 0.050
        for: 2m
        labels:
          severity: critical
          team: mlops
        annotations:
          summary: "Model {{ \$labels.model_name }} p99 latency exceeded 50ms"
          description: "Current p99 latency is {{ \$value | humanizeDuration }} over 5m window."

      - alert: GpuMemoryNearExhaustion
        expr: (DCGM_FI_DEV_FB_USED / (DCGM_FI_DEV_FB_USED + DCGM_FI_DEV_FB_FREE)) * 100 > 92
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "GPU VRAM utilization above 92% on node {{ \$labels.instance }}"
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/C04Y2Xk8f_w" title="Prometheus & Grafana for Machine Learning Monitoring" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-022",
      courseId: "CRS-MLO-001",
      sequence: 22,
      title: "Model Explainability & Interpretability in Production",
      description: "Implement production explainability: Shapley Additive exPlanations (SHAP), TreeExplainer, KernelExplainer, LIME, and sub-50ms explainability microservices.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Model Explainability & Interpretability in Production

In regulated domains (banking, healthcare, hiring), deploying black-box models is legally prohibited. Regulators (GDPR Article 22, ECOA) mandate a "Right to Explanation." MLOps platforms must return mathematical feature attributions alongside predictions.

---

## 1. SHAP (Shapley Additive exPlanations) Foundations

Grounded in cooperative game theory (Lloyd Shapley, Nobel Laureate), SHAP guarantees mathematical **Local Accuracy**, **Missingness**, and **Consistency**:

$$f(x) = \\phi_0 + \\sum_{i=1}^M \\phi_i$$

Where $\\phi_0$ is the base expected model prediction, and $\\phi_i$ represents the exact positive or negative contribution of feature $i$ to that specific prediction.

---

## 2. High-Performance TreeExplainer in Production

While \`KernelExplainer\` is model-agnostic but computationally prohibitive ($O(2^M)$ complexity), **\`TreeExplainer\`** computes exact Shapley values for tree-based models (XGBoost, LightGBM, CatBoost) in low polynomial time ($O(T \\cdot L \\cdot D^2)$):

\`\`\`python
import shap
import xgboost as xgb
import numpy as np

# Pre-compute TreeExplainer during service initialization
model = xgb.Booster()
model.load_model("models/fraud_model.json")
explainer = shap.TreeExplainer(model)

def predict_with_explanation(input_vector: np.ndarray):
    # Raw prediction probability
    dmatrix = xgb.DMatrix(input_vector)
    prediction = model.predict(dmatrix)[0]
    
    # Compute Shapley feature contributions (< 5ms)
    shap_values = explainer.shap_values(input_vector)[0]
    
    # Identify Top 3 features driving the score
    top_feature_indices = np.argsort(np.abs(shap_values))[-3:][::-1]
    
    return {
        "fraud_score": float(prediction),
        "top_adverse_factors": [
            {"feature_index": int(i), "shap_impact": float(shap_values[i])}
            for i in top_feature_indices
        ]
    }
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/9haIO83lEAU" title="SHAP Values Explained for Model Interpretability" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-023",
      courseId: "CRS-MLO-001",
      sequence: 23,
      title: "Automated Retraining & Closed-Loop Feedback Architecture",
      description: "Design closed-loop retraining systems: automated drift triggers, delayed ground-truth labeling ingestion, human-in-the-loop review, and canary gating.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Automated Retraining & Closed-Loop Feedback Architecture

A static machine learning pipeline ends at deployment; an enterprise MLOps platform forms a **Closed Loop**, continuously ingesting prediction telemetry, delayed ground truth, and automated retraining triggers.

---

## 1. The Closed-Loop Retraining Topology

\`\`\`
+-----------------------+     Inference Request     +-----------------------+
| Client Application    | ------------------------> | Inference Service     |
|                       | <------------------------ | (Triton / KServe)     |
+-----------------------+      Prediction Result    +-----------------------+
                                                                |
                                             Logs Payload & Prediction
                                                                v
+-----------------------+     Delayed Real World     +----------------------+
| Ground Truth Labels   | ---> Ground Truth Log ---> | Kafka Telemetry Lake |
| (Chargebacks / Delays)|                            | (S3 / Parquet Store) |
+-----------------------+                            +----------------------+
                                                                |
                                             Runs Daily Evidently Drift Audit
                                                                v
+-----------------------+     Drift > 0.2 PSI?       +----------------------+
| Kubeflow Retraining   | <------------------------- | Drift Detection Gate |
| Pipeline (Automated)  |                            +----------------------+
+-----------------------+
            |
            v
[ Shadow Evaluation Gate ] ---> Passes? ---> Promote to Production
\`\`\`

---

## 2. Handling Delayed Feedback Loops

In credit fraud or ad click-through prediction, ground truth labels arrive with significant latency:
- **Click-through:** Feedback arrives in minutes or hours.
- **Credit Default:** Feedback takes $6-12$ months to mature.
- **Strategy:** Retraining pipelines must partition training records using **Point-in-Time Maturation Windows**, training only on observation cohorts whose feedback window has fully closed to avoid survivorship bias.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="Automated Retraining Pipelines in MLOps" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-024",
      courseId: "CRS-MLO-001",
      sequence: 24,
      title: "ML Model Governance, Compliance & Auditing",
      description: "Implement enterprise AI governance: Model Cards for Model Reporting, EU AI Act compliance, algorithmic bias audits, cryptographic data lineage, and RBAC.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# ML Model Governance, Compliance & Auditing

As global regulatory scrutiny intensifies (such as the **EU AI Act**, NIST AI Risk Management Framework, and US Executive Orders on AI), enterprise machine learning systems must maintain verifiable compliance, cryptographic audit trails, and strict fairness guardrails.

---

## 1. Model Cards for Model Reporting (Mitchell et al., Google)

Every model registered in production must publish an immutable **Model Card** documenting:
1. **Intended Use:** In-scope applications and prohibited out-of-scope use cases.
2. **Training Data & Preprocessing:** Data sources, demographic sampling distributions, and filtering methods.
3. **Quantitative Metrics:** Disaggregated evaluation metrics across demographic sub-slices.
4. **Ethical Considerations & Limitations:** Known failure modes, environmental conditions, and bias risks.

---

## 2. EU AI Act Risk Tier Classification

\`\`\`
+--------------------------------------------------------------------------+
| 1. UNACCEPTABLE RISK (Banned)                                            |
| - Real-time biometric surveillance in public, cognitive behavioral       |
|   manipulation, social scoring systems.                                  |
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 2. HIGH RISK (Strict Conformity Assessments)                             |
| - Critical infrastructure, medical devices, educational grading,         |
|   recruitment/employment AI, credit scoring, law enforcement.            |
| - Requirements: Continuous risk management, high-quality data governance,|
|   complete logging, technical documentation, human-in-the-loop oversight.|
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| 3. LIMITED RISK (Transparency Obligations)                               |
| - Chatbots, deepfakes, AI-generated content (must notify users).         |
+--------------------------------------------------------------------------+
\`\`\`

---

## 3. Cryptographic Lineage Auditing

For mission-critical deployments, the entire provenance graph—linking raw data checksums, code commit SHAs, training hyperparameters, evaluation metrics, and container image digests—is signed cryptographically via Sigstore Cosign:
$$\\text{Provenance} = \\text{Sign}_{\\text{GPG}}(\\text{DataHash} \\parallel \\text{GitSHA} \\parallel \\text{ImageDigest} \\parallel \\text{Metrics})$$

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5a4G0kZ04rA" title="AI Governance, Compliance & EU AI Act" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-MLO-019",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-019",
      title: "The ML Drift Taxonomy Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-181",
          type: "MCQ",
          prompt: "What is Covariate Shift (Data Drift) in mathematical terms?",
          options: [
            "The probability distribution of input features P(X) changes over time, while the conditional probability distribution of the target given inputs P(Y|X) remains constant",
            "The model weights are modified by a hacker",
            "The model prediction accuracy becomes exactly zero",
            "The operating system clock drifts out of synchronization"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-182",
          type: "MCQ",
          prompt: "What is Concept Drift in mathematical terms?",
          options: [
            "The conditional probability distribution of outputs given inputs P(Y|X) mutates over time, altering the true relationship between features and target labels",
            "The input features P(X) double in size",
            "The database server runs out of disk storage",
            "A developer commits code without a code review"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-183",
          type: "MCQ",
          prompt: "What does a Population Stability Index (PSI) value greater than 0.25 indicate?",
          options: [
            "Significant distributional shift between baseline and current data; immediate model evaluation, investigation, or retraining is required",
            "The model is 100% accurate and stable",
            "The model should be deployed to 10 more countries",
            "The training dataset has zero missing values"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-184",
          type: "MCQ",
          prompt: "Which two-sample statistical hypothesis test is standard for detecting distribution drift in continuous, numerical features?",
          options: [
            "Kolmogorov-Smirnov (KS) Test",
            "Chi-Square Contingency Test",
            "Fisher's Exact Test",
            "Pearson Correlation Test"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-185",
          type: "MCQ",
          prompt: "Which statistical test is standard for detecting distribution drift in categorical features?",
          options: [
            "Chi-Square Goodness-of-Fit Test",
            "Student's t-test",
            "ANOVA F-test",
            "Kolmogorov-Smirnov Test"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-186",
          type: "MCQ",
          prompt: "What is the Wasserstein Distance (Earth Mover's Distance)?",
          options: [
            "The minimum cost (work) required to transform one continuous probability distribution into another, measured as the integral of the difference between their cumulative distributions",
            "The physical distance between two servers in a datacenter",
            "The time it takes for an HTTP packet to travel across the Atlantic ocean",
            "The difference in memory usage between two neural networks"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-187",
          type: "MCQ",
          prompt: "What is Prior Probability Shift?",
          options: [
            "A shift in the distribution of the target class labels P(Y) in the population without necessarily changing feature relationships",
            "A change in user passwords",
            "An update to the Python programming language",
            "A hardware upgrade to newer GPUs"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-188",
          type: "MCQ",
          prompt: "What is Sudden Concept Drift versus Gradual Concept Drift?",
          options: [
            "Sudden drift occurs rapidly due to an unforeseen event (e.g., pandemic, regulatory change); Gradual drift occurs slowly over months (e.g., changing consumer fashion trends)",
            "Sudden drift crashes the server; Gradual drift does not",
            "Sudden drift only affects images; Gradual drift affects text",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-189",
          type: "MCQ",
          prompt: "Why can't concept drift be detected solely by monitoring input feature distributions P(X)?",
          options: [
            "Because in concept drift, the input distributions P(X) can remain perfectly identical while the relationship between X and target Y completely reverses",
            "Because P(X) cannot be calculated in real time",
            "Because input features are encrypted in production",
            "Because concept drift only occurs on Sundays"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-190",
          type: "MCQ",
          prompt: "What is a 'Drift Window' in streaming observability?",
          options: [
            "The sliding time frame (e.g., past 24 hours or past 10,000 requests) over which current production data is aggregated for comparison against the baseline reference",
            "A physical window in a server room",
            "A pop-up modal on a website",
            "A temporary network outage"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-020",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-020",
      title: "Real-Time Drift Detection with Evidently AI Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-191",
          type: "MCQ",
          prompt: "What is the primary function of Evidently AI in an MLOps platform?",
          options: [
            "Analyzing and monitoring machine learning data, feature drift, target drift, and model quality through automated statistical reports and metrics exports",
            "Writing Python code automatically",
            "Replacing Kubernetes with virtual machines",
            "Generating marketing text for social media"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-192",
          type: "MCQ",
          prompt: "In Evidently AI, what is the role of the 'Reference Dataset'?",
          options: [
            "The golden baseline dataset (typically the training or validation set) against which current live production inference data is compared for drift",
            "A dictionary of Python terms",
            "A list of employee names",
            "A copy of the Linux kernel source code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-193",
          type: "MCQ",
          prompt: "What library in the MLOps ecosystem specializes in outlier detection, adversarial detection, and concept drift using machine learning algorithms?",
          options: ["Alibi Detect", "NumPy", "Pandas", "Matplotlib"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-194",
          type: "MCQ",
          prompt: "How does an Autoencoder detect out-of-distribution (OOD) or anomalous inputs in Alibi Detect?",
          options: [
            "By measuring Reconstruction Error; unfamiliar inputs that deviate from training data cannot be compressed and reconstructed accurately, resulting in high reconstruction loss",
            "By checking if the file size is an even number",
            "By comparing text strings using regex",
            "By measuring CPU temperature"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-195",
          type: "MCQ",
          prompt: "What output formats can Evidently AI export to enable automated CI/CD gating and alerting?",
          options: [
            "Structured Python dictionaries, JSON files, HTML visual reports, and Prometheus metric streams",
            "MP3 audio files only",
            "Microsoft Word documents only",
            "Raw binary assembly"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-196",
          type: "MCQ",
          prompt: "What is an 'Evidently Test Suite' versus an 'Evidently Report'?",
          options: [
            "A Test Suite executes programmatic pass/fail assertions with strict boolean thresholds; a Report generates comprehensive statistical visual charts for human exploration",
            "A Test Suite runs in production; a Report runs in staging",
            "A Test Suite is written in C++; a Report is written in Python",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-197",
          type: "MCQ",
          prompt: "What is 'Drift Share' in an Evidently DataDriftPreset?",
          options: [
            "The percentage of total features in the dataset that exhibit statistically significant drift (e.g., 4 out of 10 features drifting = 40% drift share)",
            "The stock price of a company",
            "The network bandwidth used by the test",
            "The amount of RAM consumed by the database"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-198",
          type: "MCQ",
          prompt: "How can Evidently AI metrics be integrated directly into Grafana dashboards?",
          options: [
            "By pushing Evidently metrics to a Prometheus Pushgateway or exposing an HTTP /metrics scraping endpoint",
            "By taking screenshots of Evidently HTML reports",
            "By sending emails to the Grafana team",
            "By printing reports on paper"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-199",
          type: "MCQ",
          prompt: "What is an 'Adversarial Attack' against a production machine learning model?",
          options: [
            "Crafting subtle, imperceptible perturbations to input data specifically designed to cause the model to make confident, incorrect predictions",
            "A hacker stealing physical servers from a datacenter",
            "A developer deleting Git branches",
            "A sudden spike in electric power"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-200",
          type: "MCQ",
          prompt: "Why should drift detection jobs execute as decoupled asynchronous worker tasks rather than inside the synchronous inference path?",
          options: [
            "Computing statistical tests across thousands of rows is CPU-intensive and would add hundreds of milliseconds of unacceptable latency to user-facing API responses",
            "Because Python cannot run statistical tests inside APIs",
            "Because drift detection crashes web servers",
            "To prevent users from seeing statistical calculations"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-021",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-021",
      title: "Model Performance & Latency Telemetry Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-201",
          type: "MCQ",
          prompt: "Why is 99th percentile (p99) latency more informative than average (mean) latency when evaluating model serving performance?",
          options: [
            "Average latency obscures severe tail latency spikes experienced by the slowest 1% of users, which often causes cascading timeouts in upstream microservices",
            "Average latency cannot be calculated in Prometheus",
            "p99 latency is required by the Linux operating system",
            "p99 latency runs faster than average latency"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-202",
          type: "MCQ",
          prompt: "What does the NVIDIA DCGM metric 'DCGM_FI_DEV_FB_USED' track?",
          options: [
            "The amount of GPU Framebuffer (VRAM) memory currently utilized in megabytes",
            "The physical fan speed of the GPU",
            "The network bandwidth of the server",
            "The CPU temperature"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-203",
          type: "MCQ",
          prompt: "What is the risk of allowing GPU VRAM utilization to exceed 95% on an inference worker node?",
          options: [
            "A sudden batch size increase or concurrent request will trigger an unrecoverable CUDA Out-of-Memory (OOM) error, terminating the serving container immediately",
            "The server will catch fire",
            "The model weights will be deleted from disk",
            "The GPU will switch to running Python"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-204",
          type: "MCQ",
          prompt: "What PromQL expression calculates the 95th percentile inference latency over a 5-minute rolling window from a metric named 'model_latency_seconds_bucket'?",
          options: [
            "histogram_quantile(0.95, sum(rate(model_latency_seconds_bucket[5m])) by (le))",
            "p95(model_latency_seconds_bucket)",
            "rate(model_latency_seconds_bucket[5m]) * 0.95",
            "quantile_over_time(0.95, model_latency_seconds_bucket[5m])"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-205",
          type: "MCQ",
          prompt: "What Prometheus metric type should be used to record the total cumulative count of model predictions served?",
          options: ["Counter", "Gauge", "Histogram", "Summary"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-206",
          type: "MCQ",
          prompt: "What Prometheus metric type should be used to record the current count of active requests executing concurrently on a GPU?",
          options: ["Gauge", "Counter", "Histogram", "Summary"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-207",
          type: "MCQ",
          prompt: "In Grafana dashboards for ML serving, what does 'GPU SM Saturation' measure?",
          options: [
            "The percentage of Streaming Multiprocessors (SMs) actively executing instructions over a sampling period",
            "The temperature of the silicon chip",
            "The amount of data stored on the hard drive",
            "The number of users logged into the web portal"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-208",
          type: "MCQ",
          prompt: "Why should alerting rules on inference latency include a 'for: 2m' duration window?",
          options: [
            "To prevent momentary, transient sub-second latency spikes from triggering false-alarm pager notifications to on-call engineers",
            "To allow the server time to reboot",
            "Because Prometheus can only evaluate rules every 2 minutes",
            "To reduce cloud network billing fees"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-209",
          type: "MCQ",
          prompt: "What is an SLA Breach in ML inference operations?",
          options: [
            "When serving latency or availability metrics violate the guaranteed performance thresholds agreed upon with business stakeholders or customers",
            "A physical break in a network fiber cable",
            "An expired software license",
            "A cancelled client meeting"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-210",
          type: "MCQ",
          prompt: "How does batch size impact model inference latency versus throughput?",
          options: [
            "Larger batch sizes increase per-request latency slightly, but dramatically increase overall system throughput (predictions per second)",
            "Larger batch sizes reduce both latency and throughput",
            "Batch size has zero effect on latency or throughput",
            "Larger batch sizes only work on CPUs"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-022",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-022",
      title: "Model Explainability & Interpretability Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-211",
          type: "MCQ",
          prompt: "What theoretical foundation underpins SHAP (Shapley Additive exPlanations)?",
          options: [
            "Cooperative Game Theory: allocating payoffs to players (features) based on their marginal contributions across all possible coalitions",
            "Quantum electrodynamics",
            "Euclidean geometry",
            "Newtonian mechanics"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-212",
          type: "MCQ",
          prompt: "Why is SHAP 'TreeExplainer' preferred over 'KernelExplainer' for gradient boosted tree models in production?",
          options: [
            "TreeExplainer exploits tree structure to compute exact Shapley values in low polynomial time (< 10ms), whereas KernelExplainer is exponentially slow",
            "TreeExplainer only works on Linux",
            "KernelExplainer is deprecated in Python",
            "TreeExplainer does not require a trained model"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-213",
          type: "MCQ",
          prompt: "What is LIME (Local Interpretable Model-agnostic Explanations)?",
          options: [
            "An explainability method that approximates a complex black-box model locally around a specific prediction using an interpretable linear surrogate model",
            "A citrus fruit used to clean hardware",
            "A database indexing algorithm",
            "A continuous integration tool built by Apple"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-214",
          type: "MCQ",
          prompt: "What does a negative SHAP value ($\\phi_i < 0$) signify for a specific feature in a binary classification problem?",
          options: [
            "The feature decreased the predicted probability of the positive class relative to the base expected value",
            "The feature was missing from the input",
            "The feature was measured with an error",
            "The model threw an exception"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-215",
          type: "MCQ",
          prompt: "What is 'Global Interpretability' versus 'Local Interpretability'?",
          options: [
            "Global interpretability explains overall model behavior across the entire population; Local interpretability explains why the model made a specific prediction for a single individual",
            "Global interpretability runs across continents; Local interpretability runs on one server",
            "Global interpretability is for text; Local interpretability is for images",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-216",
          type: "MCQ",
          prompt: "What is an 'Adverse Action Notice' in financial credit lending AI?",
          options: [
            "A legally mandated disclosure providing applicant reasons (derived from top negative feature attributions) when a loan or credit card is denied",
            "A warning sent to employees who arrive late to work",
            "An error log produced by a database crash",
            "A court summons"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-217",
          type: "MCQ",
          prompt: "What is the 'Efficiency' (Local Accuracy) property of Shapley values?",
          options: [
            "The sum of all feature Shapley values plus the base value equals the exact model output prediction: $f(x) = \\phi_0 + \\sum \\phi_i$",
            "The model executes in under 1 millisecond",
            "The model achieves 100% test accuracy",
            "The code consumes zero CPU cycles"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-218",
          type: "MCQ",
          prompt: "What interpretability method is standard for explaining predictions in deep neural networks (e.g., computer vision and NLP)?",
          options: ["Integrated Gradients", "Linear Regression", "Bubble Sort", "Greedy Search"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-219",
          type: "MCQ",
          prompt: "What visual plot in SHAP summarizes the distribution of feature impacts across thousands of instances in a single graphic?",
          options: ["SHAP Summary (Beeswarm) Plot", "Pie Chart", "Venn Diagram", "Histogram"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-220",
          type: "MCQ",
          prompt: "Why should pre-computed explainer objects (e.g., TreeExplainer) be initialized during service startup rather than instantiated per request?",
          options: [
            "Initializing an explainer parses and precomputes tree structures once, reducing per-prediction explanation latency from seconds down to milliseconds",
            "Because Python will throw an out-of-memory error",
            "Because explainers can only be created once per calendar year",
            "To prevent the GPU from restarting"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-023",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-023",
      title: "Automated Retraining & Feedback Architecture Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-221",
          type: "MCQ",
          prompt: "What is a 'Closed-Loop' machine learning architecture?",
          options: [
            "A system where production prediction telemetry and real-world ground-truth feedback are continuously logged and used to trigger automated validation and retraining",
            "A network cable plugged into both ends of a router",
            "A private network with no internet access",
            "An infinite while loop in Python code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-222",
          type: "MCQ",
          prompt: "Why is 'Delayed Feedback' a major operational challenge in automated retraining pipelines?",
          options: [
            "Because true ground-truth labels (e.g., loan defaults or medical outcomes) may take months to manifest, preventing immediate model evaluation on recent data",
            "Because internet speeds are slow",
            "Because databases delete old records automatically",
            "Because Python cannot process timestamps older than 30 days"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-223",
          type: "MCQ",
          prompt: "What is 'Survivorship Bias' in delayed-feedback retraining datasets?",
          options: [
            "Training on recent cohorts whose observation window has not fully closed, resulting in an artificial undercount of slow-to-mature negative labels (like chargebacks)",
            "A bias that occurs when servers survive hardware crashes",
            "A psychological bias affecting data scientists",
            "A statistical error caused by rounding numbers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-224",
          type: "MCQ",
          prompt: "What message streaming platform is commonly deployed to decouple high-throughput inference logging from offline data lake ingestion?",
          options: ["Apache Kafka (or AWS Kinesis)", "SQLite", "FTP Server", "SMTP Mail Server"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-225",
          type: "MCQ",
          prompt: "What is 'Active Learning' in machine learning retraining loops?",
          options: [
            "An automated workflow that selectively identifies and routes low-confidence or high-uncertainty production predictions to human annotators for manual labeling",
            "Exercising while writing code",
            "Running training loops on treadmill computers",
            "Training models without stopping"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-226",
          type: "MCQ",
          prompt: "What prevents an automated retraining pipeline from deploying an overfitted or defective model to production?",
          options: [
            "Automated Shadow Evaluation and Golden Benchmark Regression Gates verifying model metrics and fairness bounds before promotion",
            "A developer typing 'yes' in an email",
            "A manual reboot of the server",
            "Deleting the training code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-227",
          type: "MCQ",
          prompt: "What is a 'Maturation Window' for a ground truth label?",
          options: [
            "The minimum elapsed duration required before an outcome event is considered finalized and non-reversible (e.g., 90 days for chargeback disputes)",
            "The age of the server in months",
            "The time a model has been deployed in production",
            "The duration of an executive meeting"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-228",
          type: "MCQ",
          prompt: "What is 'Human-in-the-Loop' (HITL) review in high-risk automated retraining workflows?",
          options: [
            "Requiring human expert validation or sign-off on retrained candidate models or uncertain data points before promoting models to production",
            "Requiring humans to manually calculate neural network weights",
            "Having humans read log files line by line",
            "Employing humans to type user passwords"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-229",
          type: "MCQ",
          prompt: "What occurs if an automated retraining pipeline uses a drifting feature without feature selection guardrails?",
          options: [
            "The retrained model learns spurious correlations from corrupted data, compounding accuracy decay across retraining generations",
            "The server immediately shuts down",
            "The training accuracy becomes negative",
            "The database drops all tables"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-230",
          type: "MCQ",
          prompt: "What is the primary role of a Model Registry in automated retraining?",
          options: [
            "Storing, versioning, and managing the lifecycle states and promotion aliases of newly trained model candidate versions",
            "Registering domain names on the internet",
            "Cataloging physical hardware servers",
            "Tracking software development hours"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-024",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-024",
      title: "ML Model Governance, Compliance & Auditing Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-231",
          type: "MCQ",
          prompt: "What is a 'Model Card' as proposed by Mitchell et al. (Google)?",
          options: [
            "A standardized, human-readable benchmark document detailing a model's intended use, training data demographics, performance across sub-slices, and limitations",
            "A physical credit card used to pay cloud invoices",
            "A hardware graphics card inside a server",
            "A business card handed to clients"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-232",
          type: "MCQ",
          prompt: "Under the European Union AI Act, which risk category includes AI systems used in credit scoring, recruitment, and critical infrastructure?",
          options: ["High Risk (mandating strict conformity assessments, risk management, and audit logging)", "Unacceptable Risk (Banned)", "Minimal Risk", "Exempt"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-233",
          type: "MCQ",
          prompt: "What does GDPR Article 22 grant individuals regarding automated decision-making?",
          options: [
            "The right not to be subject to a decision based solely on automated processing (including profiling) that produces legal or significant effects, plus a right to explanation",
            "The right to free internet access across Europe",
            "The right to download open-source code",
            "The right to own a GPU"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-234",
          type: "MCQ",
          prompt: "What is 'Disparate Impact' in algorithmic fairness auditing?",
          options: [
            "When an apparently neutral model criterion results in a disproportionately adverse selection rate for a protected demographic group compared to other groups",
            "A physical impact from a dropped server",
            "A sudden increase in cloud database costs",
            "A network collision in Ethernet cables"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-235",
          type: "MCQ",
          prompt: "What is the 'Four-Fifths Rule' (80% Rule) established by the US EEOC for hiring and credit algorithms?",
          options: [
            "The selection rate for any protected group must not be less than four-fifths (80%) of the selection rate for the group with the highest rate",
            "Models must achieve at least 80% accuracy",
            "80% of data scientists must approve the model",
            "Models must be retrained every 4 months"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-236",
          type: "MCQ",
          prompt: "How does cryptographic lineage signing (e.g., Sigstore Cosign) enforce non-repudiation in ML governance?",
          options: [
            "By signing an attestation linking raw dataset hashes, code commit SHAs, and container digests, proving the model was not tampered with post-training",
            "By encrypting the entire hard drive with BitLocker",
            "By sending signed paper letters via postal mail",
            "By requiring users to enter passwords twice"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-237",
          type: "MCQ",
          prompt: "What is 'Data Provenance' in an audit trail?",
          options: [
            "The comprehensive historical record documenting the origin, transformations, ownership, and chain of custody of a dataset from ingestion to training",
            "The geographic coordinates of the datacenter",
            "The programming language used to clean data",
            "The file size of the database"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-238",
          type: "MCQ",
          prompt: "Why should ML platforms enforce Role-Based Access Control (RBAC) on Model Registries?",
          options: [
            "To ensure that only authorized platform engineers or certified CI/CD service accounts can promote candidate models into production aliases",
            "To prevent developers from reading code",
            "To save electricity in the office",
            "Because Python does not support multi-user logins"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-239",
          type: "MCQ",
          prompt: "What is the NIST AI Risk Management Framework (AI RMF 1.0)?",
          options: [
            "A voluntary guidance framework designed by the US NIST to help organizations manage risks in the design, development, and deployment of trustworthy AI systems",
            "A military software standard for fighter jets",
            "A mandatory tax on AI hardware",
            "A hardware specification for GPU chips"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-240",
          type: "MCQ",
          prompt: "What is 'Model Inventory' in enterprise compliance auditing?",
          options: [
            "A centralized, audited catalog of all active, retired, and candidate machine learning models operating across an enterprise, including their risk tiers and owners",
            "A warehouse where servers are physically stored",
            "A list of software books in the office library",
            "An Excel spreadsheet of hardware serial numbers"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

