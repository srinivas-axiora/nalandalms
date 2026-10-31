// Course 9: MLOps Masterclass - Phase 1: ML Lifecycle, Data Versioning & Experiment Tracking
// Chapters 1 to 6 | Assessments 1 to 6 | 60 MCQs

export const phase1 = {
  chapters: [
    {
      id: "CH-MLO-001",
      courseId: "CRS-MLO-001",
      sequence: 1,
      title: "The MLOps Paradigm & Hidden Technical Debt in Machine Learning",
      description: "Understand the core principles of MLOps, DevOps vs MLOps differences, Sculley et al. technical debt paper, ML maturity levels 0-2, and reproducible ML workflows.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# The MLOps Paradigm & Hidden Technical Debt in Machine Learning

Machine Learning systems are software systems, but software engineering best practices alone are insufficient to ensure production reliability. In classical software engineering, bugs originate from code logic errors; in machine learning systems, failures originate from **code, data, and model interactions** over time.

---

## 1. The Anatomy of Real-World ML Systems (Sculley et al., Google)

In their seminal paper *"Hidden Technical Debt in Machine Learning Systems"*, researchers showed that actual ML model code constitutes only a tiny fraction of a production ML platform:

\`\`\`
+-----------------------------------------------------------------------------------------+
|                                REAL-WORLD ML SYSTEM ANATOMY                             |
|                                                                                         |
|  +-------------------+  +-------------------+  +-------------------+  +---------------+ |
|  | Configuration     |  | Data Collection   |  | Feature           |  | Data          | |
|  | & Secrets         |  | & Ingestion       |  | Extraction        |  | Verification  | |
|  +-------------------+  +-------------------+  +-------------------+  +---------------+ |
|                                                                                         |
|          +-------------------+     +-------------+     +-------------------+            |
|          | Machine Resource  |     |   ML CODE   |     | Analysis & Drift  |            |
|          | Management (GPUs) |     |  (Tiny Box) |     | Tools             |            |
|          +-------------------+     +-------------+     +-------------------+            |
|                                                                                         |
|  +-------------------+  +-------------------+  +-------------------+  +---------------+ |
|  | Serving           |  | Monitoring &      |  | Process           |  | Metadata &    | |
|  | Infrastructure    |  | Alerting          |  | Management        |  | Model Registry| |
|  +-------------------+  +-------------------+  +-------------------+  +---------------+ |
+-----------------------------------------------------------------------------------------+
\`\`\`

---

## 2. DevOps vs. MLOps: The Foundational Differences

| Dimension | Traditional DevOps | Machine Learning Operations (MLOps) |
|---|---|---|
| **Core Artifact** | Code & Compiled Binaries | Code + Data + Model Weights + Hyperparameters |
| **Testing Scope** | Unit, Integration, E2E | Code Tests + Data Quality + Model Accuracy + Bias + Drift |
| **Deployment Trigger** | Code commit / Git tag | Code changes **OR** Data changes **OR** Model drift triggers |
| **Degradation Mode** | Crashes, 500 errors, syntax bugs | Silent decay: predictions become inaccurate without throwing errors |
| **Reproducibility** | Git commit SHA | Git commit SHA + Dataset snapshot version + Hardware / CUDA drivers |

---

## 3. Google MLOps Maturity Levels (0 to 2)

\`\`\`
LEVEL 0: MANUAL PROCESS
- Data scientists build models in Jupyter notebooks locally.
- Handoff to software engineers via emailed pkl files.
- Manual deployment; zero drift monitoring; infrequent retraining.

LEVEL 1: ML PIPELINE AUTOMATION (Continuous Training - CT)
- Automated training pipeline orchestrated via DAGs (Kubeflow, Airflow).
- Triggered automatically when new data arrives or model performance drops.
- Rapid experiment tracking and automated model validation.

LEVEL 2: CI/CD PIPELINE AUTOMATION (Full MLOps)
- Automated testing and building of pipeline components themselves.
- Multi-environment promotion (Dev -> Staging -> Prod) with automated canary rollouts.
- Continuous monitoring with automated rollback and continuous training triggers.
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/06-AZXmwHjo" title="MLOps Explained in 10 Minutes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-002",
      courseId: "CRS-MLO-001",
      sequence: 2,
      title: "Data & Model Versioning with DVC (Data Version Control)",
      description: "Master dataset and model weight versioning with DVC: Git-coupled metadata, remote cloud storage backends (S3, GCS), and reproducible dvc.yaml pipelines.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Data & Model Versioning with DVC (Data Version Control)

Standard Git repositories are designed for text files and fail catastrophically when tracking multi-gigabyte training datasets and large binary model checkpoints. **DVC** extends Git to manage massive data files seamlessly.

---

## 1. How DVC Decouples Data from Code

\`\`\`
+-----------------------+     Tracks text pointer     +-----------------------+
| Local Git Repo        | --------------------------> | data/train.csv.dvc    |
| (Source Code)         |                             | (Holds MD5 hash)      |
+-----------------------+                             +-----------------------+
            |                                                     |
       git commit                                            dvc push
            v                                                     v
+-----------------------+                             +-----------------------+
| GitHub / GitLab       |                             | Remote Storage        |
| (Code Repository)     |                             | (S3, GCS, Azure Blob, |
|                       |                             |  NFS Server)          |
+-----------------------+                             +-----------------------+
\`\`\`

1. **Lightweight Pointers:** When you run \`dvc add data/train.csv\`, DVC calculates the MD5 checksum of the data file, moves the real file into \`.dvc/cache\`, and creates a tiny text pointer file (\`data/train.csv.dvc\`) containing the hash.
2. **Git Integration:** You commit only the \`.dvc\` pointer file into Git.
3. **Data Retrieval:** Anyone cloning the repo runs \`git checkout <commit-sha>\` followed by \`dvc pull\` to download the exact dataset version matching that commit.

---

## 2. Production DVC Commands & Remote Setup

\`\`\`bash
# Initialize DVC in a Git repository
dvc init

# Configure S3 bucket as remote data storage
dvc remote add -d s3remote s3://enterprise-ml-data-lake/dvc-store
dvc remote modify s3remote region us-east-1

# Track a 15 GB raw dataset
dvc add data/raw_features.parquet

# Commit metadata to Git and push payload to S3
git add data/raw_features.parquet.dvc .dvc/config
git commit -m "chore: track v2.1 raw features dataset"
dvc push
\`\`\`

---

## 3. Declarative Pipelines with \`dvc.yaml\`

DVC enables reproducible pipeline DAGs where stages execute only if their input dependencies or code have mutated:

\`\`\`yaml
stages:
  preprocess:
    cmd: python src/preprocess.py
    deps:
      - data/raw_features.parquet
      - src/preprocess.py
    outs:
      - data/processed_train.npz

  train:
    cmd: python src/train.py
    deps:
      - data/processed_train.npz
      - src/train.py
    params:
      - train.learning_rate
      - train.batch_size
    outs:
      - models/model.onnx
    metrics:
      - metrics.json:
          cache: false
\`\`\`

Execute the pipeline reproducibly:
\`\`\`bash
# Reproduce pipeline only if dependencies mutated
dvc repro

# Compare metrics between Git commits
dvc metrics diff HEAD~1
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/kLKBSTFkZd8" title="Data Version Control (DVC) Complete Guide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-003",
      courseId: "CRS-MLO-001",
      sequence: 3,
      title: "Experiment Tracking & Model Registry with MLflow",
      description: "Master MLflow Tracking, autologging, hyperparameter runs, artifact stores, MLflow Model Registry stages, aliases, and deployment governance.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Experiment Tracking & Model Registry with MLflow

Machine learning development is fundamentally experimental. Without structured experiment tracking, teams lose visibility into which hyperparameter configurations, datasets, and code commits produced winning models.

---

## 1. MLflow Architecture: Tracking & Model Registry

\`\`\`
+--------------------------------------------------------------------------+
| MLFLOW TRACKING SERVER                                                   |
|                                                                          |
|  +--------------------------------+   +--------------------------------+ |
|  | BACKEND METADATA STORE         |   | ARTIFACT STORE                 | |
|  | (PostgreSQL / MySQL)           |   | (S3 / GCS / Azure Blob)        | |
|  | - Run IDs, Git Commit SHAs     |   | - Serialized Weights (.onnx)   | |
|  | - Parameters (LR, epochs)      |   | - Conda / Pip requirements     | |
|  | - Time-series metrics (loss)   |   | - Confusion matrix PNGs        | |
|  +--------------------------------+   +--------------------------------+ |
+--------------------------------------------------------------------------+
                                    |
                    Model Registration & Governance
                                    v
+--------------------------------------------------------------------------+
| MLFLOW MODEL REGISTRY                                                    |
| Model: "FraudDetector"                                                   |
| - Version 1: Stage: Archived                                             |
| - Version 2: Stage: Production (Alias: @champion)                        |
| - Version 3: Stage: Staging    (Alias: @challenger)                      |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Python Experiment Logging Workflow

\`\`\`python
import mlflow
import mlflow.xgboost
from xgboost import XGBClassifier
from sklearn.metrics import roc_auc_score

# Point to centralized enterprise tracking server
mlflow.set_tracking_uri("https://mlflow.platform.enterprise.internal")
mlflow.set_experiment("fraud_detection_xgboost")

with mlflow.start_run(run_name="xgboost_depth_6_lr_0.05") as run:
    params = {
        "max_depth": 6,
        "learning_rate": 0.05,
        "n_estimators": 300,
        "subsample": 0.8
    }
    mlflow.log_params(params)
    
    # Train model
    model = XGBClassifier(**params)
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, preds)
    mlflow.log_metric("val_auc", auc)
    
    # Log model artifact with input signature and environment dependencies
    signature = mlflow.models.infer_signature(X_test, preds)
    mlflow.xgboost.log_model(
        xgb_model=model,
        artifact_path="model",
        signature=signature,
        registered_model_name="FraudDetector"
    )
\`\`\`

---

## 3. Model Registry Aliases & Production Promotion

Modern MLflow supersedes legacy stages with **Model Aliases**:
\`\`\`python
from mlflow import MlflowClient

client = MlflowClient()

# Set alias '@champion' on Version 3
client.set_registered_model_alias("FraudDetector", "champion", version="3")

# Downstream production serving systems dynamically load by alias
production_model = mlflow.pyfunc.load_model("models:/FraudDetector@champion")
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/6zbWbF_sJ_8" title="MLflow Tutorial for Beginners" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-004",
      courseId: "CRS-MLO-001",
      sequence: 4,
      title: "Enterprise Feature Stores with Feast & Point-in-Time Joins",
      description: "Implement modern feature stores: offline vs online stores, Redis low-latency serving, Snowflake/BigQuery batch ingestion, and point-in-time correct joins.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# Enterprise Feature Stores with Feast & Point-in-Time Joins

In machine learning, data scientists often compute the exact same customer features (e.g., \`user_30d_transaction_count\`) repeatedly across different teams. Even worse, offline training data is computed differently than online production features, creating catastrophic **Training-Serving Skew**.

---

## 1. Feature Store Dual-Engine Architecture

\`\`\`
                          +-----------------------------------+
                          | FEATURE DEFINITIONS (Python Repo) |
                          +-----------------------------------+
                                            |
                                       feast apply
                                            |
         +----------------------------------+----------------------------------+
         |                                                                     |
         v                                                                     v
+-------------------------------------+               +-------------------------------------+
| OFFLINE FEATURE STORE               |               | ONLINE FEATURE STORE                |
| (BigQuery, Snowflake, S3/Parquet)   |               | (Redis, DynamoDB, Cassandra)        |
+-------------------------------------+               +-------------------------------------+
| - High-throughput batch queries     |               | - Ultra-low latency (< 10ms) lookup |
| - Point-in-time historical joins    |               | - Key-value structure               |
| - Used for Model Training           |               | - Used for Real-Time Inference      |
+-------------------------------------+               +-------------------------------------+
\`\`\`

---

## 2. Preventing Data Leakage: Point-in-Time Correctness (Time-Travel Joins)

When building training datasets for past events (e.g., whether a loan defaulted 6 months ago), querying current feature values introduces **Data Leakage** (using future information that was unavailable at the moment of the decision).

\`\`\`
Feature Value Timeline:
Jan 1: user_credit_score = 650
Mar 1: user_credit_score = 720  <-- Event occurred on Feb 15!
Jun 1: user_credit_score = 800

Point-in-Time Join accurately selects the value valid on Feb 15 (650), NOT the current value (800).
\`\`\`

---

## 3. Defining Features in Feast (\`features.py\`)

\`\`\`python
from datetime import timedelta
from feast import Entity, Field, FeatureView, FileSource
from feast.types import Int64, Float32

user = Entity(name="user_id", join_keys=["user_id"])

user_stats_source = FileSource(
    name="user_stats_parquet",
    path="s3://enterprise-features/user_stats.parquet",
    timestamp_field="event_timestamp",
    created_timestamp_column="created_timestamp",
)

user_stats_fv = FeatureView(
    name="user_stats",
    entities=[user],
    ttl=timedelta(days=30),
    schema=[
        Field(name="avg_transaction_amount_30d", dtype=Float32),
        Field(name="failed_login_count_24h", dtype=Int64),
    ],
    online=True,
    source=user_stats_source,
)
\`\`\`

### Fetching Online Features at Inference Time ($< 5\\text{ms}$):
\`\`\`python
from feast import FeatureStore

store = FeatureStore(repo_path=".")

features = store.get_online_features(
    features=["user_stats:avg_transaction_amount_30d", "user_stats:failed_login_count_24h"],
    entity_rows=[{"user_id": 104820}]
).to_dict()
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/8w5g6y6Ywz0" title="What is a Feature Store? Feast Architecture" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-005",
      courseId: "CRS-MLO-001",
      sequence: 5,
      title: "Automated Data Validation with Great Expectations & Evidently",
      description: "Implement automated data quality gates in ML pipelines: Expectation Suites, automated profiling, schema validation, and statistical distribution checks.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Automated Data Validation with Great Expectations & Evidently

In production ML pipelines, dirty data is the number one cause of model accuracy degradation. Without automated data validation gates, pipelines blindly ingest missing values, swapped columns, and out-of-range sensor readings.

---

## 1. Declarative Data Quality Gates in CI/CD Pipelines

\`\`\`
INGEST RAW DATA ---> GREAT EXPECTATIONS GATE ---> PASS? ---> MODEL TRAINING
                              |
                              +---> FAIL? ---> HALT PIPELINE & ALERT SLACK
\`\`\`

---

## 2. Authoring Expectation Suites in Python

\`\`\`python
import great_expectations as gx

context = gx.get_context()
validator = context.sources.pandas_default.read_parquet("data/incoming_batch.parquet")

# Define Data Quality Expectations
validator.expect_column_values_to_not_be_null(column="user_id")
validator.expect_column_values_to_be_between(
    column="transaction_amount", min_value=0.01, max_value=50000.0
)
validator.expect_column_distinct_values_to_be_in_set(
    column="payment_method", value_set=["CREDIT", "DEBIT", "CRYPTO", "WIRE"]
)
validator.expect_column_stdev_to_be_between(
    column="risk_score", min_value=1.5, max_value=4.5
)

# Execute checkpoint validation
checkpoint = context.add_or_update_checkpoint(
    name="ingestion_gate",
    validator=validator,
)
results = checkpoint.run()

if not results.success:
    raise ValueError("Data validation gate failed! Ingestion halted.")
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/14QWn0rUv_U" title="Great Expectations Tutorial - Data Quality for ML" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-MLO-006",
      courseId: "CRS-MLO-001",
      sequence: 6,
      title: "Distributed Data Processing for ML with Ray Data & Spark",
      description: "Scale data preprocessing and feature transformations beyond single-node memory using Ray Core, Ray Data streaming datasets, and Apache Spark.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Distributed Data Processing for ML with Ray Data & Spark

As training datasets expand from gigabytes to terabytes, single-node Pandas processing crashes with Out-of-Memory (OOM) errors. Distributed data processing frameworks allow ML engineers to parallelize data cleaning, image resizing, and tokenization across compute clusters.

---

## 1. Ray Ecosystem Architecture for Machine Learning

\`\`\`
+--------------------------------------------------------------------------+
| HIGH-LEVEL ML LIBRARIES                                                  |
|  [ Ray Data ]       [ Ray Train ]      [ Ray Tune ]      [ Ray Serve ]   |
|  (Data Streaming)   (Distributed DL)   (Hyperparameter)  (Model Serving) |
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| RAY CORE PRIMITIVES                                                      |
|  - Tasks: Distributed stateless functions (@ray.remote)                  |
|  - Actors: Distributed stateful classes with persistent memory           |
|  - Plasma Object Store: In-memory zero-copy shared memory across workers|
+--------------------------------------------------------------------------+
                                    |
+--------------------------------------------------------------------------+
| INFRASTRUCTURE: Kubernetes Cluster (KubeRay Operator) / AWS EC2          |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Streaming Data Pipelines with Ray Data

Unlike Spark, which is optimized for SQL and batch table queries, **Ray Data** is purpose-built for deep learning: it streams data batches directly into GPU memory without materializing intermediate datasets on disk:

\`\`\`python
import ray
import numpy as np

# Read 500 GB of Parquet files across cluster
ds = ray.data.read_parquet("s3://enterprise-data-lake/images_metadata/")

# Transform streaming batches using distributed actors
def normalize_and_embed(batch: dict[str, np.ndarray]) -> dict[str, np.ndarray]:
    batch["normalized_price"] = (batch["price"] - np.mean(batch["price"])) / np.std(batch["price"])
    return batch

# Map over streaming batches utilizing 16 CPU cores
transformed_ds = ds.map_batches(normalize_and_embed, batch_size=4096, compute=ray.data.ActorPoolStrategy(min_size=4, max_size=16))

# Stream batches directly to distributed PyTorch trainer
for batch in transformed_ds.iter_torch_batches(batch_size=256):
    # Feeds directly to GPU tensor without disk I/O bottlenecks
    pass
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/5U_7L5jUu7o" title="Ray Tutorial: Distributed Python for Machine Learning" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-MLO-001",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-001",
      title: "The MLOps Paradigm & Technical Debt Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-001",
          type: "MCQ",
          prompt: "According to Sculley et al. ('Hidden Technical Debt in ML Systems'), what constitutes the majority of code in a production ML system?",
          options: [
            "Surrounding infrastructure plumbing (data collection, feature extraction, verification, serving, and monitoring), while ML algorithm code is only a tiny fraction",
            "The mathematical optimization code inside the ML algorithm",
            "CSS stylesheets for the user dashboard",
            "Hardware microcode running on the GPU BIOS"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-002",
          type: "MCQ",
          prompt: "What is the primary operational difference between classical DevOps and MLOps?",
          options: [
            "MLOps must manage and track the complex lifecycle interactions between Code, Data, and Model Weights, whereas DevOps tracks Code and Binaries",
            "MLOps does not use version control",
            "DevOps runs on Linux, while MLOps only runs on macOS",
            "MLOps eliminates the need for automated testing"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-003",
          type: "MCQ",
          prompt: "What characterizes Google MLOps Maturity Level 0?",
          options: [
            "Completely manual, script-driven, and notebook-centric processes with manual model handoffs and zero automated retraining",
            "Fully automated multi-region Kubernetes deployments",
            "Automated continuous training triggered by model drift",
            "Autonomous self-healing neural networks"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-004",
          type: "MCQ",
          prompt: "What is the key defining feature of Google MLOps Maturity Level 1?",
          options: [
            "Continuous Training (CT): ML pipelines are automated as directed acyclic graphs (DAGs) and trigger automated model retraining upon data arrival",
            "All data scientists are replaced by robots",
            "Data is stored exclusively in Excel spreadsheets",
            "Models are deployed manually once per calendar year"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-005",
          type: "MCQ",
          prompt: "Why can production machine learning models degrade silently without throwing system errors or crashing servers?",
          options: [
            "Because incoming production data distributions can drift away from training distributions, causing predictions to become inaccurate while HTTP 200 responses continue successfully",
            "Because Python does not support exception handling",
            "Because machine learning models run in kernel ring 0",
            "Because GPU cooling fans turn off during inference"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-006",
          type: "MCQ",
          prompt: "What is 'Feedback Loop Debt' in production ML systems?",
          options: [
            "When a production model's own predictions inadvertently influence the future training data it collects, creating an artificial reinforcement bias",
            "Unpaid cloud hosting bills from AWS",
            "A backlog of customer support tickets",
            "A memory leak in the database connection pool"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-007",
          type: "MCQ",
          prompt: "What is the primary role of Continuous Delivery in MLOps Maturity Level 2?",
          options: [
            "Automating the testing, building, and deployment of the entire ML pipeline code itself, not just the model weights",
            "Sending emails to customers after every model prediction",
            "Backing up code to floppy disks",
            "Restarting the Kubernetes cluster every hour"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-008",
          type: "MCQ",
          prompt: "What is 'Pipeline Jungle' technical debt?",
          options: [
            "An entangled mess of disparate scrapers, ad-hoc bash scripts, and glue code that prepares data without centralized governance or testing",
            "A software bug inside Amazon Elastic Container Service",
            "A physical fiber optic cable tangled in a datacenter",
            "A game engine library used in machine learning"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-009",
          type: "MCQ",
          prompt: "What four components are required to guarantee 100% reproducibility of a historical ML training run?",
          options: [
            "Exact Git commit SHA, exact versioned dataset, exact hyperparameter configuration, and the deterministic runtime environment (Docker/CUDA/seeds)",
            "A screenshot of the developer's desktop",
            "A high-speed internet connection",
            "A signed letter from the data science manager"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-010",
          type: "MCQ",
          prompt: "What is 'Configuration Debt' in machine learning architectures?",
          options: [
            "Proliferating configuration settings (feature flags, loss weights, sampling thresholds) that are unversioned and outnumber actual algorithmic code lines",
            "The cost of buying new laptops for engineers",
            "Running out of hard drive space on a database server",
            "A syntax error in a JSON file"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-002",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-002",
      title: "Data & Model Versioning with DVC Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-011",
          type: "MCQ",
          prompt: "Why is Git unsuitable for versioning multi-gigabyte training datasets directly?",
          options: [
            "Git is optimized for text diffs and compresses whole file versions locally, causing repository clone times and disk consumption to explode uncontrollably on large binaries",
            "Git only supports files with fewer than 100 lines",
            "Git automatically deletes binary files",
            "Git requires an active internet connection to commit files"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-012",
          type: "MCQ",
          prompt: "How does DVC track a large dataset (e.g., data/images.tar) without storing the binary payload inside Git?",
          options: [
            "DVC calculates the MD5 hash, stores the binary in its cache/remote, and generates a tiny text pointer file (data/images.tar.dvc) tracked by Git",
            "DVC converts the file into a base64 string in README.md",
            "DVC compresses the file into a zip archive stored on the developer's desktop",
            "DVC splits the file into 1,000 tiny git branches"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-013",
          type: "MCQ",
          prompt: "Which command synchronizes the actual large binary data files from local DVC cache to configured remote cloud storage (e.g., S3 or GCS)?",
          options: ["dvc push", "git push --large-files", "dvc sync-cloud", "dvc upload --all"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-014",
          type: "MCQ",
          prompt: "What is the purpose of the 'dvc.yaml' file in a machine learning repository?",
          options: [
            "It declaratively defines multi-stage pipeline DAGs, listing dependencies, execution commands, parameters, outputs, and metrics",
            "It configures the color theme for the DVC web UI",
            "It stores AWS root credentials in plain text",
            "It compiles Python code into C++ binaries"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-015",
          type: "MCQ",
          prompt: "What does running 'dvc repro' execute?",
          options: [
            "It analyzes the pipeline DAG and re-executes only the stages whose code, parameters, or input data dependencies have mutated since the last run",
            "It deletes all trained models and restarts the operating system",
            "It generates a PowerPoint presentation of model results",
            "It trains 100 random neural networks simultaneously"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-016",
          type: "MCQ",
          prompt: "How can you view performance metric differences between your current code branch and the 'main' branch using DVC?",
          options: ["dvc metrics diff main", "git diff --metrics main", "dvc compare --branch=main", "dvc status -v"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-017",
          type: "MCQ",
          prompt: "What is stored in the '.dvc/cache' directory?",
          options: [
            "Content-addressable storage where datasets and model weights are indexed by their cryptographic hash",
            "Temporary browser cookies",
            "The Python virtual environment packages",
            "Uncommitted Git branches"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-018",
          type: "MCQ",
          prompt: "Which command pulls the exact dataset versions corresponding to the currently checked-out Git commit SHA?",
          options: ["dvc pull", "git pull --dvc-data", "dvc checkout --force", "dvc restore --remote"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-019",
          type: "MCQ",
          prompt: "What command connects an Amazon S3 bucket as the default remote for a DVC project?",
          options: [
            "dvc remote add -d myremote s3://mybucket/dvc-store",
            "git config --add s3://mybucket/dvc-store",
            "dvc connect aws s3://mybucket/dvc-store",
            "dvc storage mount s3://mybucket/dvc-store"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-020",
          type: "MCQ",
          prompt: "What file in DVC is used to define hyperparameter variables that trigger pipeline stage invalidation when altered?",
          options: ["params.yaml", "hyperparameters.json", "dvc.config", "settings.ini"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-003",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-003",
      title: "Experiment Tracking & Model Registry with MLflow Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-021",
          type: "MCQ",
          prompt: "What two underlying storage layers constitute an enterprise MLflow Tracking Server?",
          options: [
            "A backend SQL database (PostgreSQL/MySQL) for run metadata, metrics, and parameters, and an object store (S3/GCS) for serialized model artifacts",
            "A Redis cache and a Git repository",
            "A local hard drive and a tape backup drive",
            "An Elasticsearch index and a Kafka topic"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-022",
          type: "MCQ",
          prompt: "What is the difference between 'mlflow.log_param()' and 'mlflow.log_metric()'?",
          options: [
            "Parameters are immutable key-value strings recorded once per run (e.g., learning_rate); Metrics are numerical values recorded over time (e.g., training loss per epoch)",
            "Parameters are numbers; Metrics are strings",
            "Parameters are for testing; Metrics are for deployment",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-023",
          type: "MCQ",
          prompt: "What is an MLflow 'Model Signature'?",
          options: [
            "A formal schema specification defining the expected data types and shapes of model inputs and outputs, preventing inference schema mismatches",
            "A cryptographic GPG signature signed by the data scientist",
            "The handwritten signature of the chief data officer",
            "The file extension of the serialized model"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-024",
          type: "MCQ",
          prompt: "In MLflow Model Registry, why are 'Model Aliases' (e.g., @champion, @challenger) preferred over legacy stages (Staging, Production)?",
          options: [
            "Aliases provide flexible, customized, and programmable deployment tags that decouple code environments from rigid hardcoded stage names",
            "Aliases run 50% faster in Python",
            "Legacy stages were blocked by Linux security modules",
            "Aliases encrypt model weights with AES"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-025",
          type: "MCQ",
          prompt: "What Python function enables automated logging of parameters, metrics, and model weights without manual log calls across major ML frameworks?",
          options: ["mlflow.autolog()", "mlflow.start_recording()", "mlflow.auto_track()", "mlflow.enable_ai()"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-026",
          type: "MCQ",
          prompt: "What does 'mlflow.pyfunc' provide?",
          options: [
            "A generic Python function wrapper that presents a unified predict() interface regardless of whether the underlying model is PyTorch, TensorFlow, Scikit-learn, or ONNX",
            "A compiler that translates Python into Java",
            "A tool that checks PEP8 linting rules",
            "A mathematical function library"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-027",
          type: "MCQ",
          prompt: "How can a production serving microservice load the model version currently tagged with the '@champion' alias?",
          options: [
            "mlflow.pyfunc.load_model('models:/ModelName@champion')",
            "mlflow.load('champion')",
            "client.get_production_model('ModelName')",
            "import ModelName.champion"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-028",
          type: "MCQ",
          prompt: "What command launches the local MLflow Tracking UI server?",
          options: ["mlflow ui", "mlflow start-server", "mlflow run --dashboard", "python -m mlflow.web"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-029",
          type: "MCQ",
          prompt: "What is an MLflow 'Run' within an 'Experiment'?",
          options: [
            "A single execution of machine learning code that logs a specific collection of parameters, metrics, tags, and artifacts",
            "A physical computer running in an office",
            "A scheduled cron job running every hour",
            "A pull request in Git"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-030",
          type: "MCQ",
          prompt: "How does MLflow ensure environment reproducibility when serving logged models?",
          options: [
            "By logging conda.yaml, requirements.txt, and python_env.yaml artifacts specifying exact library versions alongside the model binary",
            "By saving a complete ISO disk image of the laptop",
            "By taking a webcam snapshot of the training session",
            "By emailing the pip freeze output to the developer"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-004",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-004",
      title: "Enterprise Feature Stores with Feast Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-031",
          type: "MCQ",
          prompt: "What is 'Training-Serving Skew' in machine learning operations?",
          options: [
            "A divergence in model performance caused by calculating features differently during offline batch training versus online real-time inference",
            "A hardware difference between training GPUs and inference CPUs",
            "The time delay between training a model and deploying it",
            "A difference in salary between data scientists and software engineers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-032",
          type: "MCQ",
          prompt: "What dual-engine architecture does a Feature Store like Feast utilize?",
          options: [
            "An Offline Store (Snowflake, BigQuery, Parquet) for high-throughput batch historical training, and an Online Store (Redis, DynamoDB) for ultra-low latency inference lookups",
            "A relational database and an Excel spreadsheet",
            "A primary CPU and a secondary GPU",
            "A public cloud and a private USB drive"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-033",
          type: "MCQ",
          prompt: "What is 'Data Leakage' in the context of feature engineering for historical training datasets?",
          options: [
            "Inadvertently including future feature values that were not yet known or available at the exact point in time when the prediction was made",
            "A hacker stealing customer credit card records from the database",
            "Data leaking onto the physical floor of the server room",
            "A memory leak in the C++ runtime"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-034",
          type: "MCQ",
          prompt: "How does Feast perform 'Point-in-Time Correct Joins' (Time-Travel Joins)?",
          options: [
            "By joining each entity event timestamp strictly against feature values whose timestamps occurred immediately prior to that event, eliminating data leakage",
            "By reversing the system clock on the database server",
            "By predicting future feature values using linear regression",
            "By taking daily full database backups"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-035",
          type: "MCQ",
          prompt: "In Feast, what is an 'Entity'?",
          options: [
            "The primary business object or collection of join keys (e.g., user_id, merchant_id) that features are associated with",
            "A legal corporate business organization",
            "A Kubernetes Pod specification",
            "A machine learning model file"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-036",
          type: "MCQ",
          prompt: "What does the Feast command 'feast apply' execute?",
          options: [
            "It scans feature definitions in Python files and updates the feature store metadata registry and database infrastructure schemas",
            "It trains a deep neural network on the features",
            "It applies security patches to the Linux operating system",
            "It generates documentation for the marketing team"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-037",
          type: "MCQ",
          prompt: "What command ingests feature values from the offline store into the low-latency online store (e.g., Redis) up to the current timestamp?",
          options: ["feast materialize-incremental $(date -u +%Y-%m-%dT%H:%M:%S)", "feast push --all", "feast sync-to-redis", "feast update --online"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-038",
          type: "MCQ",
          prompt: "What is a 'Feature View' in Feast?",
          options: [
            "A logical grouping of related feature data derived from a specific data source, associated with entities and bounded by a time-to-live (TTL)",
            "A graphical chart displaying feature importance",
            "A SQL view stored inside PostgreSQL",
            "A web page showing customer purchase history"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-039",
          type: "MCQ",
          prompt: "What typical latency should an online feature store provide when queried by real-time production inference services?",
          options: [
            "Sub-10 milliseconds (often < 5ms)",
            "5 to 10 seconds",
            "1 to 2 minutes",
            "Latency is not measured in feature stores"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-040",
          type: "MCQ",
          prompt: "What is the function of the 'ttl' (Time-To-Live) parameter on a FeatureView?",
          options: [
            "It specifies how far back in historical time Feast will look to retrieve feature values for point-in-time training joins before treating features as stale/missing",
            "It dictates how long a feature name can remain in memory",
            "It deletes features from the database after 24 hours",
            "It sets the timeout for HTTP requests"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-005",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-005",
      title: "Automated Data Validation with Great Expectations Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-041",
          type: "MCQ",
          prompt: "What is the primary role of an 'Expectation' in Great Expectations?",
          options: [
            "A declarative, verifiable assertion about data properties (e.g., column nullability, value ranges, set membership) expressed in Python",
            "A salary bonus expectation for data engineers",
            "A mathematical prediction of future stock market indices",
            "A project management milestone deadline"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-042",
          type: "MCQ",
          prompt: "What happens when a Great Expectations Checkpoint fails inside an automated CI/CD data ingestion pipeline?",
          options: [
            "The checkpoint throws a non-zero exit code or error, halting pipeline execution and preventing corrupt data from entering training or inference",
            "The pipeline continues running and ignores the error",
            "The corrupted data is automatically converted into text",
            "The database server deletes all records"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-043",
          type: "MCQ",
          prompt: "What are 'Data Docs' in Great Expectations?",
          options: [
            "Auto-generated, human-readable HTML documentation sites displaying data validation results, test history, and dataset profiles",
            "PDF manuals written by software vendors",
            "Word documents stored in Google Drive",
            "Medical records for hospital patients"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-044",
          type: "MCQ",
          prompt: "Which expectation asserts that values in the 'age' column must never fall below 18 or exceed 120?",
          options: [
            "expect_column_values_to_be_between(column='age', min_value=18, max_value=120)",
            "expect_age_valid(min=18, max=120)",
            "assert age >= 18 and age <= 120",
            "check_range('age', 18, 120)"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-045",
          type: "MCQ",
          prompt: "What is an 'Expectation Suite'?",
          options: [
            "A collection of individual Expectations combined together into a named testing suite representing quality criteria for a specific dataset",
            "A hotel room reserved for tech conferences",
            "A bundle of commercial software licenses",
            "A high-end GPU cluster"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-046",
          type: "MCQ",
          prompt: "What is automated 'Data Profiling' in data quality tools?",
          options: [
            "Analyzing an existing baseline dataset to automatically infer and generate preliminary Expectation rules (e.g., min, max, null rates, datatypes)",
            "Tracking the personal browsing history of users",
            "Measuring the network speed of datacenter switches",
            "Compressing files using gzip"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-047",
          type: "MCQ",
          prompt: "How can Great Expectations send instant alerts to the on-call team when data validation fails?",
          options: [
            "Through built-in Validation Actions configured to dispatch webhooks to Slack, Microsoft Teams, or PagerDuty",
            "By printing paper warning letters on the office printer",
            "By playing an audio siren in the server room",
            "By rebooting developer laptops"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-048",
          type: "MCQ",
          prompt: "Which expectation verifies that all values in the 'transaction_id' column are strictly unique?",
          options: [
            "expect_column_values_to_be_unique(column='transaction_id')",
            "expect_unique_column('transaction_id')",
            "assert transaction_id.is_distinct()",
            "verify_primary_key('transaction_id')"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-049",
          type: "MCQ",
          prompt: "Where does Great Expectations store its project configuration and metadata by default?",
          options: ["In the 'great_expectations/great_expectations.yml' file", "In /etc/gx.conf", "Inside the Linux kernel", "In browser local storage"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-050",
          type: "MCQ",
          prompt: "Why should data validation occur BEFORE feature engineering rather than after model inference?",
          options: [
            "To catch schema corruptions, type errors, and anomalies at the earliest ingestion boundary (Shift-Left Data Quality), preventing wasted GPU training cycles",
            "Because feature engineering deletes the raw data",
            "Because Python cannot run validations after feature engineering",
            "To avoid paying cloud data egress charges"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-MLO-006",
      courseId: "CRS-MLO-001",
      chapterId: "CH-MLO-006",
      title: "Distributed Data Processing with Ray Data & Spark Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-MLO-051",
          type: "MCQ",
          prompt: "What is the primary architectural purpose of the Ray framework in machine learning engineering?",
          options: [
            "A unified distributed computing framework in Python providing general-purpose primitives (Tasks, Actors) and specialized libraries for scaling ML training, data, and serving",
            "A tool for designing 3D ray-traced computer graphics",
            "A web browser built for data scientists",
            "A replacement for the Git version control system"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-052",
          type: "MCQ",
          prompt: "What is the fundamental difference between a Ray 'Task' and a Ray 'Actor'?",
          options: [
            "A Task is a stateless distributed function invocation (@ray.remote); an Actor is a stateful distributed class instance that preserves memory across invocations",
            "A Task runs on CPUs; an Actor runs on GPUs",
            "A Task is written in C++; an Actor is written in Python",
            "There is no difference; they are interchangeable"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-053",
          type: "MCQ",
          prompt: "Why is Ray Data superior to Apache Spark for preparing training data for deep learning models?",
          options: [
            "Ray Data streams data batches directly into GPU memory without materializing entire datasets on disk, avoiding I/O bottlenecks and keeping GPUs fully saturated",
            "Ray Data only runs on mobile devices",
            "Spark cannot read Parquet files",
            "Spark does not support Python"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-054",
          type: "MCQ",
          prompt: "What is the Plasma Object Store in Ray Core?",
          options: [
            "An in-memory, zero-copy shared memory object store that allows worker processes on the same physical node to read data tensors without serialization overhead",
            "A cloud storage bucket hosted by Apache",
            "A physical hard drive installed in server motherboards",
            "A database that stores user passwords"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-055",
          type: "MCQ",
          prompt: "What method in Ray Data yields streaming batches formatted directly as PyTorch Tensors for distributed training?",
          options: ["ds.iter_torch_batches(batch_size=...)", "ds.to_pytorch_dataloader()", "ds.get_tensors()", "ds.stream_pytorch()"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-056",
          type: "MCQ",
          prompt: "What Kubernetes operator is the industry standard for deploying and managing Ray clusters on Kubernetes?",
          options: ["KubeRay Operator", "RayKube Controller", "Kubeflow Daemon", "Raylet Manager"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-057",
          type: "MCQ",
          prompt: "What does setting 'compute=ray.data.ActorPoolStrategy(min_size=4, max_size=16)' in 'map_batches' accomplish?",
          options: [
            "It manages an autoscaling pool of persistent stateful actors to process data batches concurrently, avoiding the overhead of re-initializing models or weights per batch",
            "It turns off CPU throttling",
            "It allocates 16 terabytes of disk space",
            "It restarts the Kubernetes worker nodes"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-058",
          type: "MCQ",
          prompt: "How does Ray handle object references when you invoke a remote task like 'obj_ref = task.remote()'?",
          options: [
            "It returns an asynchronous ObjectRef immediately (a future), allowing the main program to continue execution while the task runs concurrently in the cluster",
            "It pauses the entire operating system until the task finishes",
            "It saves the result to a text file in /tmp",
            "It sends an email notification"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-059",
          type: "MCQ",
          prompt: "Which function call blocks execution and resolves one or more Ray ObjectRefs into concrete Python return values?",
          options: ["ray.get(obj_ref)", "ray.wait_and_fetch(obj_ref)", "obj_ref.resolve()", "ray.fetch_value(obj_ref)"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-MLO-060",
          type: "MCQ",
          prompt: "What problem arises when deep learning data loaders cannot process data as fast as GPUs can train on it?",
          options: [
            "GPU Starvation: expensive GPUs sit idle waiting for CPU preprocessing threads to deliver batches, dramatically inflating cloud compute costs",
            "The GPU overheats and shuts down",
            "The training loss drops to negative infinity",
            "The database server crashes"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

