// Phase 5: Explainability, MLOps, Capstone & Career Mastery (Chapters 26 to 32) - Data Science
// World-class curriculum: Zero to employable master.

export const phase5 = {
  chapters: [
    // ── Chapter 26 ──
    {
      id: "CH-DSC-026",
      courseId: "CRS-DSC-001",
      sequence: 26,
      title: "Model Explainability with SHAP & LIME",
      description: "Cooperative Game Theory, Shapley values, TreeSHAP fast exact computation, local vs global interpretability, force plots, beeswarm summary plots, and LIME surrogate approximations.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production ML & Capstone • Chapter 26</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Model Explainability with SHAP & LIME</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In regulated sectors such as healthcare, banking, and insurance, 'black-box' machine learning is prohibited by legislation (e.g. EU GDPR Right to Explanation, US Equal Credit Opportunity Act). Explainable AI (XAI) bridges the gap between high-capacity gradient boosting models and regulatory transparency.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/UJRRX_e9P4c" title="SHAP Values Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Cooperative Game Theory & Shapley Axioms</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Derived by Nobel laureate Lloyd Shapley, Shapley values fairly distribute total team payout among players based on their marginal contributions across all possible coalitions \\(S\\):</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\phi_i(v) = \\sum_{S \\subseteq N \\setminus \\{i\\}} \\frac{|S|!(|N| - |S| - 1)!}{|N|!} \\big(v(S \\cup \\{i\\}) - v(S)\\big)$$
  </div>
  <p style="font-size:14px;color:#475569;">SHAP is the <strong>only</strong> feature attribution method that satisfies four fundamental theoretical guarantees: <em>Efficiency</em> (sum of attributions equals output deviation), <em>Symmetry</em>, <em>Dummy/Null player</em>, and <em>Additivity</em>.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Production TreeSHAP in Python</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import shap
import lightgbm as lgb

# Initialize TreeSHAP explainer (scales in O(T L D^2) instead of exponential)
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_val)

# Global Interpretability: Beeswarm summary plot displaying impact & directionality
# shap.plots.beeswarm(shap_values)

# Local Interpretability: Water-fall plot explaining a single credit rejection
# shap.plots.waterfall(shap_values[0])</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>TreeSHAP provides exact, polynomial-time Shapley values for tree-based models (XGBoost, LightGBM, CatBoost).</li>
      <li>LIME fits an interpretable sparse linear surrogate locally around individual sample predictions.</li>
      <li>SHAP waterfall plots allow customer support teams to generate adverse action notices explaining the exact features that led to a loan denial.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 27 ──
    {
      id: "CH-DSC-027",
      courseId: "CRS-DSC-001",
      sequence: 27,
      title: "Experiment Tracking & Model Registry with MLflow",
      description: "Managing ML technical debt, MLflow Tracking runs, autologging hyperparameters & metrics, artifact storage (S3/GCS), model signatures, and production lifecycle staging.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production ML & Capstone • Chapter 27</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Experiment Tracking & Model Registry with MLflow</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Ad-hoc notebook experimentation leads to lost model weights, unverifiable benchmark claims, and deployment chaos. MLflow standardizes the entire machine learning lifecycle: experiment tracking, reproducible code packaging, and centralized model governance.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/6TzUpwr9mZc" title="MLflow Crash Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Automated MLflow Tracking Pipeline</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import mlflow
import mlflow.lightgbm
from mlflow.models.signature import infer_signature

mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("Customer-Churn-Engine")

with mlflow.start_run(run_name="lgb-bayes-tuned"):
    # Log hyperparameters
    mlflow.log_params(params)
    
    # Train model
    model = lgb.train(params, train_data, valid_sets=[val_data])
    
    # Infer schema signature and log metrics
    signature = infer_signature(X_val, model.predict(X_val))
    mlflow.log_metrics({"val_auc": 0.884, "val_logloss": 0.312})
    
    # Log model artifact with strict schema definition
    mlflow.lightgbm.log_model(
        lgb_model=model,
        artifact_path="model",
        signature=signature,
        registered_model_name="ChurnPredictor"
    )</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>MLflow Model Registry tracks artifacts through lifecycle stages: None -> Staging -> Production -> Archived.</li>
      <li>Inferring Model Signatures guarantees that incoming production request JSON conforms strictly to training tensor types.</li>
      <li>Centralized tracking eliminates duplicate compute by enabling teams to compare ROC curves and metrics across all runs in real time.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 28 ──
    {
      id: "CH-DSC-028",
      courseId: "CRS-DSC-001",
      sequence: 28,
      title: "Interactive Data Science Dashboards with Streamlit",
      description: "Building production ML web applications in pure Python, reactive state management (st.session_state), cached data pipelines (st.cache_data), and interactive scenario planning.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production ML & Capstone • Chapter 28</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Interactive Data Science Dashboards with Streamlit</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Insights that remain buried inside Jupyter Notebooks fail to generate business impact. Streamlit enables data scientists to convert Python scripts into fully interactive, reactive web applications with zero frontend boilerplate.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/D0D4Pa22iG0" title="Streamlit Full Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Reactive Prediction App Architecture</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import streamlit as st
import pandas as pd
import joblib

st.set_page_config(page_title="Enterprise Churn Simulator", layout="wide")
st.title("🎯 Enterprise Customer Risk Simulator")

# Caching prevents reloading expensive serialized model binaries on every user interaction
@st.cache_resource
def load_churn_model():
    return joblib.load('models/churn_lgb.pkl')

model = load_churn_model()

col1, col2 = st.columns(2)
with col1:
    tenure = st.slider("Customer Tenure (Months)", 1, 72, 12)
    contract = st.selectbox("Contract Type", ["Month-to-month", "One year", "Two year"])
    monthly_charges = st.number_input("Monthly Charges ($)", min_value=10.0, max_value=200.0, value=65.0)

with col2:
    if st.button("Calculate Churn Probability"):
        input_data = pd.DataFrame([{
            'tenure': tenure,
            'contract': contract,
            'monthly_charges': monthly_charges
        }])
        prob = model.predict_proba(input_data)[0][1]
        st.metric("Predicted Churn Risk", f"{prob * 100:.1f}%")
        if prob > 0.65:
            st.error("⚠️ High Risk Account: Immediate Retention Outreach Required")
        else:
            st.success("✅ Healthy Account")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Use <code>@st.cache_resource</code> for global objects (ML models, database connections) and <code>@st.cache_data</code> for computation results.</li>
      <li>Streamlit executes top-to-bottom on each user trigger; maintain UI state using <code>st.session_state</code>.</li>
      <li>Deploy apps effortlessly to container environments (Docker, AWS ECS, GCP Cloud Run) for stakeholder consumption.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 29 ──
    {
      id: "CH-DSC-029",
      courseId: "CRS-DSC-001",
      sequence: 29,
      title: "Production Model Packaging & FastAPI Inference Serving",
      description: "RESTful inference endpoints, Pydantic data contract validation, asynchronous request handling, Docker multi-stage containerization, and sub-10ms latency optimization.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production ML & Capstone • Chapter 29</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Production Model Packaging & FastAPI Inference Serving</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">To deliver real-time value, predictive models must be served behind low-latency HTTP/gRPC APIs accessible by distributed microservices. We build production microservices with FastAPI, Pydantic data schemas, and production Docker images.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/gQTRsZqcXgw" title="Deploying ML with FastAPI and Docker" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Production Inference Service with FastAPI & Pydantic</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd

app = FastAPI(title="Real-time Churn Prediction API", version="1.0.0")
model = joblib.load("models/churn_pipeline.joblib")

class CustomerFeatures(BaseModel):
    tenure: int = Field(..., ge=0, le=100, description="Months customer has subscribed")
    monthly_charges: float = Field(..., gt=0, description="Monthly invoice charge in USD")
    contract: str = Field(..., example="Two year")

class PredictionResponse(BaseModel):
    churn_probability: float
    high_risk: bool

@app.post("/predict", response_model=PredictionResponse)
async def predict_churn(customer: CustomerFeatures):
    df = pd.DataFrame([customer.dict()])
    try:
        prob = float(model.predict_proba(df)[0][1])
        return PredictionResponse(
            churn_probability=round(prob, 4),
            high_risk=(prob >= 0.50)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>FastAPI leverages Python type hints and Pydantic to deliver automatic JSON validation and interactive Swagger documentation at <code>/docs</code>.</li>
      <li>Package both preprocessing transformers and estimators into a single serialized Scikit-Learn <code>Pipeline</code> to avoid duplicate feature logic in API servers.</li>
      <li>Containerize APIs using multi-stage Docker builds based on <code>python:3.11-slim</code> for minimal attack surface and rapid Kubernetes scaling.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 30 ──
    {
      id: "CH-DSC-030",
      courseId: "CRS-DSC-001",
      sequence: 30,
      title: "Workflow Orchestration with Prefect & Apache Airflow",
      description: "DAG architecture, task dependencies, automated retries, scheduling, data quality assertions with Great Expectations, and continuous retraining triggers.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production ML & Capstone • Chapter 30</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Workflow Orchestration with Prefect & Apache Airflow</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Production machine learning systems require recurring data ingestion, automated validation, and continuous model retraining. Orchestrators coordinate these directed acyclic graphs (DAGs), managing failure states, idempotency, and alerts.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/AHMM1y_3V7w" title="Prefect Orchestration Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Declarative Python Workflows with Prefect 2.0</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from prefect import task, flow
import pandas as pd

@task(retries=3, retry_delay_seconds=10)
def extract_warehouse_data() -> pd.DataFrame:
    # Query Snowflake / BigQuery
    return pd.read_parquet("s3://analytics-bucket/daily_features.parquet")

@task
def validate_data_quality(df: pd.DataFrame):
    assert df['user_id'].is_unique, "Duplicate primary keys detected"
    assert df['revenue'].isna().sum() == 0, "Null revenue detected"
    return df

@task
def retrain_champion_model(df: pd.DataFrame):
    # Retraining logic and MLflow model registry updates
    pass

@flow(name="Daily-ML-Pipeline")
def run_pipeline():
    raw_df = extract_warehouse_data()
    clean_df = validate_data_quality(raw_df)
    retrain_champion_model(clean_df)

if __name__ == "__main__":
    run_pipeline()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Prefect allows writing normal idiomatic Python with decorators instead of rigid boilerplate DAG definitions.</li>
      <li>Implement automated retries with exponential backoffs to prevent intermittent network glitches from terminating production pipelines.</li>
      <li>Integrate data validation gates (e.g. Great Expectations) prior to model training to prevent corrupt schemas from polluting production weights.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 31 ──
    {
      id: "CH-DSC-031",
      courseId: "CRS-DSC-001",
      sequence: 31,
      title: "Comprehensive Capstone: Enterprise Customer Churn Engine",
      description: "End-to-end industry capstone: data ingestion, feature store staging, XGBoost vs LightGBM hyperparameter optimization, SHAP interpretability report, and FastAPI serving.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 40,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production ML & Capstone • Chapter 31</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Comprehensive Capstone: Enterprise Customer Churn Engine</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In this master capstone, you unify every skill mastered throughout the curriculum: mathematical foundations, robust preprocessing, advanced gradient boosting with Optuna Bayesian tuning, SHAP explainability, and containerized deployment.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/6TzUpwr9mZc" title="End to End Data Science Capstone" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Architectural Blueprint</h2>
  <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:20px;margin:20px 0;">
    <h4 style="margin-top:0;color:#0f172a;">Enterprise Pipeline Stages:</h4>
    <ol style="margin-bottom:0;padding-left:20px;font-size:14px;color:#334155;line-height:1.8;">
      <li><strong>Ingestion:</strong> Scan multi-gigabyte Parquet lakehouse tables via Polars LazyFrame with projection & predicate pushdown.</li>
      <li><strong>Feature Engineering:</strong> Trigonometric cyclical time encoding, out-of-fold target encoding, and RobustScaling.</li>
      <li><strong>Bayesian Optimization:</strong> Tune LightGBM hyperparameters (learning rate, leaves, subsampling) with Optuna across 5 Stratified K-Folds.</li>
      <li><strong>Governance & Tracking:</strong> Log metrics, signatures, and models to MLflow Model Registry.</li>
      <li><strong>Serving & UI:</strong> Expose real-time sub-10ms REST predictions via FastAPI and provide executive scenario testing via Streamlit.</li>
    </ol>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Production data science is 10% modeling and 90% software engineering, governance, and business alignment.</li>
      <li>Completing this end-to-end repository provides a showcase demonstration of senior-level competency.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 32 ──
    {
      id: "CH-DSC-032",
      courseId: "CRS-DSC-001",
      sequence: 32,
      title: "Data Science Portfolio, Technical Interviews & Career Mastery",
      description: "Structuring high-impact GitHub portfolios, live coding interview patterns, whiteboarding ML system design, and answering senior-level behavioral interview questions.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production ML & Capstone • Chapter 32</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Data Science Portfolio, Technical Interviews & Career Mastery</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Securing senior data science roles requires more than passing Kaggle competitions. Top employers look for candidates who demonstrate production engineering discipline, rigorous mathematical communication, and executive commercial value.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5b9Z8toVaAU" title="Data Science Career and Interview Mastery" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4 Rounds of Senior Data Science Interviews</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">1. Python & SQL Live Coding</h3>
      <p style="font-size:14px;color:#475569;">Complex window functions, self-joins, vectorized NumPy array manipulations, and Pandas 2.0 / Polars performance optimization.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">2. Applied ML & Statistics Deep Dive</h3>
      <p style="font-size:14px;color:#475569;">Deriving gradient updates, explaining bias-variance trade-offs, handling imbalanced data, and designing A/B sample sizes.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">3. ML System Design</h3>
      <p style="font-size:14px;color:#475569;">Designing end-to-end architectures (e.g. "Design the TikTok recommendation feed" or "Design a real-time credit card fraud engine").</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#f59e0b;margin-top:0;">4. Behavioral & Leadership (STAR)</h3>
      <p style="font-size:14px;color:#475569;">Communicating technical ROI to non-technical stakeholders, resolving data conflicts, and managing model degradation incidents.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Avoid generic tutorial datasets (Iris, Boston Housing, Titanic); feature enterprise-grade projects with real API integrations.</li>
      <li>Every GitHub repository must include a clean README with architecture diagrams, setup instructions, benchmark tables, and live demo links.</li>
      <li>Congratulations! You have completed the comprehensive Data Science master curriculum.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-DSC-026",
      title: "Model Explainability (SHAP & LIME) Assessment",
      chapterId: "CH-DSC-026",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-026-01", type: "MCQ", prompt: "What foundational mathematical theory provides the theoretical underpinning for SHAP (SHapley Additive exPlanations)?", options: ["Cooperative Game Theory", "Information Theory", "Fourier Analysis", "Chaos Theory"], answer: 0, points: 10 },
        { id: "Q-DSC-026-02", type: "MCQ", prompt: "What is the primary computational advantage of TreeSHAP over generic KernelSHAP?", options: ["TreeSHAP optimizes feature permutations in polynomial time O(T L D^2) instead of exponential time O(2^|F|)", "TreeSHAP runs without memory", "TreeSHAP does not require training data", "TreeSHAP works only on linear regression"], answer: 0, points: 10 },
        { id: "Q-DSC-026-03", type: "MCQ", prompt: "What does the Efficiency property of Shapley values guarantee?", options: ["The sum of all feature SHAP values exactly equals the difference between model prediction and expected baseline prediction", "The model runs in under 1 second", "Memory usage is minimized", "Feature count is halved"], answer: 0, points: 10 },
        { id: "Q-DSC-026-04", type: "MCQ", prompt: "In a SHAP beeswarm summary plot, what does a dot with a high red color on the positive horizontal axis signify?", options: ["A high feature value that strongly pushes the model prediction upward", "A missing value", "A low feature value that pushes prediction down", "A corrupted record"], answer: 0, points: 10 },
        { id: "Q-DSC-026-05", type: "MCQ", prompt: "What is the core working mechanism of LIME (Local Interpretable Model-agnostic Explanations)?", options: ["It perturbs input instances around a specific sample and fits an interpretable sparse linear surrogate locally", "It computes global covariance matrices", "It trains a deep autoencoder", "It converts the model to a decision tree"], answer: 0, points: 10 },
        { id: "Q-DSC-026-06", type: "MCQ", prompt: "What SHAP plot visualizes the step-by-step contribution of each feature to a single individual prediction?", options: ["Waterfall plot (or Force plot)", "Violin plot", "Scree plot", "Histogram"], answer: 0, points: 10 },
        { id: "Q-DSC-026-07", type: "MCQ", prompt: "Why is explainable AI (XAI) legally required in automated credit underwriting under financial regulations?", options: ["To comply with adverse action notice regulations requiring specific reasons when credit is denied", "To prevent banks from earning profit", "To eliminate the need for databases", "Because Python code is open source"], answer: 0, points: 10 },
        { id: "Q-DSC-026-08", type: "MCQ", prompt: "What does a SHAP interaction value measure between two features?", options: ["The pure interaction effect between two features after subtracting their individual main effects", "Their Pearson correlation", "Their Euclidean distance", "Their quotient"], answer: 0, points: 10 },
        { id: "Q-DSC-026-09", type: "MCQ", prompt: "What is a known limitation of LIME compared to SHAP?", options: ["LIME can be unstable and yield inconsistent explanations due to random sampling perturbations", "LIME only runs on GPUs", "LIME does not support classification", "LIME requires 100 features"], answer: 0, points: 10 },
        { id: "Q-DSC-026-10", type: "MCQ", prompt: "What model-agnostic interpretability technique plots the marginal effect of one or two features on predicted outcome?", options: ["Partial Dependence Plot (PDP)", "Box plot", "Confusion matrix", "Dendrogram"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-027",
      title: "Experiment Tracking & MLflow Assessment",
      chapterId: "CH-DSC-027",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-027-01", type: "MCQ", prompt: "What are the four primary architectural components of the MLflow platform?", options: ["MLflow Tracking, MLflow Projects, MLflow Models, and MLflow Model Registry", "Compute, Storage, Network, and RAM", "Preprocessing, Training, Tuning, and Testing", "Pandas, NumPy, Scikit-Learn, and PyTorch"], answer: 0, points: 10 },
        { id: "Q-DSC-027-02", type: "MCQ", prompt: "What is an MLflow Model Signature?", options: ["A formal schema defining the exact expected input feature column types and output prediction types", "A cryptographic digital certificate for licensing", "The author's username", "The SHA256 git commit hash"], answer: 0, points: 10 },
        { id: "Q-DSC-027-03", type: "MCQ", prompt: "What function automatically logs parameters, metrics, and models for supported frameworks like LightGBM and XGBoost?", options: ["mlflow.autolog()", "mlflow.start_all()", "mlflow.record()", "mlflow.dump()"], answer: 0, points: 10 },
        { id: "Q-DSC-027-04", type: "MCQ", prompt: "What transition stages exist for governing model artifacts in the MLflow Model Registry?", options: ["None, Staging, Production, and Archived", "Draft, Review, Live, Deleted", "Alpha, Beta, Release", "Local, Remote, Global"], answer: 0, points: 10 },
        { id: "Q-DSC-027-05", type: "MCQ", prompt: "Where does MLflow store large binary model weights, plots, and dataset artifacts?", options: ["Configured Artifact Store (e.g., Amazon S3, Google Cloud Storage, or Azure Blob)", "Inside the git commit message", "In browser localStorage", "Directly in MySQL tables"], answer: 0, points: 10 },
        { id: "Q-DSC-027-06", type: "MCQ", prompt: "What command launches the interactive MLflow web UI locally to compare experiment runs and metrics?", options: ["mlflow ui", "mlflow start", "mlflow web", "mlflow run"], answer: 0, points: 10 },
        { id: "Q-DSC-027-07", type: "MCQ", prompt: "What MLflow method defines the tracking server endpoint URI where metadata is recorded?", options: ["mlflow.set_tracking_uri('http://...')", "mlflow.connect('...')", "mlflow.init('...')", "mlflow.host('...')"], answer: 0, points: 10 },
        { id: "Q-DSC-027-08", type: "MCQ", prompt: "Why is tracking random seed parameters essential in production MLflow experiment runs?", options: ["To enable exact scientific reproducibility of dataset splits, initializations, and model training results", "To speed up training by 50%", "Because MLflow refuses to run without seeds", "To encrypt model weights"], answer: 0, points: 10 },
        { id: "Q-DSC-027-09", type: "MCQ", prompt: "How does the MLflow Model flavor standard enable cross-framework deployment?", options: ["It provides a standard packaging format that allows models to be deployed via Docker, Kubernetes, or REST APIs as generic pyfunc models", "It rewrites Python code into C++", "It converts models into SQL", "It enforces neural network architectures"], answer: 0, points: 10 },
        { id: "Q-DSC-027-10", type: "MCQ", prompt: "What open-source Python library focuses on Bayesian hyperparameter search and integrates seamlessly with MLflow?", options: ["Optuna", "Requests", "Matplotlib", "BeautifulSoup"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-028",
      title: "Interactive Dashboards with Streamlit Assessment",
      chapterId: "CH-DSC-028",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-028-01", type: "MCQ", prompt: "What execution model defines how Streamlit responds when a user interacts with a widget?", options: ["The entire Python script executes top-to-bottom from scratch", "Only the modified widget function executes", "It sends an AJAX request to a Node.js backend", "It opens a new browser tab"], answer: 0, points: 10 },
        { id: "Q-DSC-028-02", type: "MCQ", prompt: "What decorator caches global, unpicklable objects like serialized machine learning models across user sessions?", options: ["@st.cache_resource", "@st.cache_data", "@st.singleton", "@st.memo"], answer: 0, points: 10 },
        { id: "Q-DSC-028-03", type: "MCQ", prompt: "What decorator caches computation outputs and serialized DataFrames to avoid redundant queries?", options: ["@st.cache_data", "@st.cache_resource", "@st.static", "@st.buffer"], answer: 0, points: 10 },
        { id: "Q-DSC-028-04", type: "MCQ", prompt: "What dictionary-like object persists state variables across reruns in a user's Streamlit session?", options: ["st.session_state", "st.memory", "st.globals", "st.cache"], answer: 0, points: 10 },
        { id: "Q-DSC-028-05", type: "MCQ", prompt: "What Streamlit element splits the dashboard canvas into multi-column side-by-side layouts?", options: ["st.columns()", "st.split()", "st.grid()", "st.divide()"], answer: 0, points: 10 },
        { id: "Q-DSC-028-06", type: "MCQ", prompt: "How do you render interactive Plotly chart figures seamlessly in a Streamlit application?", options: ["st.plotly_chart(fig)", "st.plot(fig)", "st.render(fig)", "st.draw(fig)"], answer: 0, points: 10 },
        { id: "Q-DSC-028-07", type: "MCQ", prompt: "What command starts a Streamlit web server locally for development?", options: ["streamlit run app.py", "python app.py", "streamlit start app.py", "npm run streamlit"], answer: 0, points: 10 },
        { id: "Q-DSC-028-08", type: "MCQ", prompt: "What widget creates an interactive file uploader accepting CSV or Parquet files from users?", options: ["st.file_uploader()", "st.upload()", "st.browse_file()", "st.load_data()"], answer: 0, points: 10 },
        { id: "Q-DSC-028-09", type: "MCQ", prompt: "What widget provides a sliding scale control for selecting bounded numerical values?", options: ["st.slider()", "st.select_slider()", "st.range()", "st.number_bar()"], answer: 0, points: 10 },
        { id: "Q-DSC-028-10", type: "MCQ", prompt: "What component displays Key Performance Indicator (KPI) metrics with optional delta trend indicators?", options: ["st.metric('Revenue', '$120K', delta='+12%')", "st.kpi()", "st.summary()", "st.badge()"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-029",
      title: "Model Packaging & FastAPI Assessment",
      chapterId: "CH-DSC-029",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-029-01", type: "MCQ", prompt: "What Python library powers automatic request data validation, type enforcement, and serialization in FastAPI?", options: ["Pydantic", "Marshmallow", "Pickle", "Cerberus"], answer: 0, points: 10 },
        { id: "Q-DSC-029-02", type: "MCQ", prompt: "Where does FastAPI automatically serve interactive Swagger API documentation by default?", options: ["/docs", "/swagger", "/api/v1", "/help"], answer: 0, points: 10 },
        { id: "Q-DSC-029-03", type: "MCQ", prompt: "What ASGI server is standard for running FastAPI applications in production container environments?", options: ["Uvicorn (or Gunicorn with Uvicorn workers)", "Apache HTTP Server", "WSGI", "Nginx directly"], answer: 0, points: 10 },
        { id: "Q-DSC-029-04", type: "MCQ", prompt: "Why is bundling preprocessing steps and model weights into a single Scikit-Learn Pipeline best practice for deployment?", options: ["It eliminates training-serving skew by guaranteeing identical feature transformation logic in the API server", "Pipelines run without Python", "It encrypts the model file", "It converts models into microservices"], answer: 0, points: 10 },
        { id: "Q-DSC-029-05", type: "MCQ", prompt: "What HTTP method should standard inference endpoints utilize when clients send JSON feature payloads to receive predictions?", options: ["POST", "GET", "DELETE", "HEAD"], answer: 0, points: 10 },
        { id: "Q-DSC-029-06", type: "MCQ", prompt: "In Pydantic schemas, what class allows attaching field-level validation constraints such as min_value or descriptions?", options: ["Field", "Property", "Param", "Validator"], answer: 0, points: 10 },
        { id: "Q-DSC-029-07", type: "MCQ", prompt: "What base Docker image is recommended for deploying Python ML APIs to balance small size and compatibility?", options: ["python:3.11-slim", "ubuntu:latest", "alpine:latest (prone to wheel compilation issues)", "centos:7"], answer: 0, points: 10 },
        { id: "Q-DSC-029-08", type: "MCQ", prompt: "What HTTP status code should the API return when an input JSON fails Pydantic schema validation?", options: ["422 Unprocessable Entity", "200 OK", "500 Internal Server Error", "404 Not Found"], answer: 0, points: 10 },
        { id: "Q-DSC-029-09", type: "MCQ", prompt: "What Python library provides faster, memory-efficient serialization than standard pickle for large NumPy-based models?", options: ["joblib", "json", "marshal", "csv"], answer: 0, points: 10 },
        { id: "Q-DSC-029-10", type: "MCQ", prompt: "What technique batches incoming real-time requests over a 5ms window to exploit vectorization during high load?", options: ["Dynamic batching", "Horizontal autoscaling", "Lazy evaluation", "Quantization"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-030",
      title: "Workflow Orchestration Assessment",
      chapterId: "CH-DSC-030",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-030-01", type: "MCQ", prompt: "What graph structure represents tasks and dependencies in modern workflow orchestration engines?", options: ["Directed Acyclic Graph (DAG)", "B-Tree", "Circular Linked List", "Undirected Network"], answer: 0, points: 10 },
        { id: "Q-DSC-030-02", type: "MCQ", prompt: "In Prefect 2.0, what decorators convert standard Python functions into orchestrated workflow units?", options: ["@task and @flow", "@step and @pipeline", "@dag and @operator", "@run and @job"], answer: 0, points: 10 },
        { id: "Q-DSC-030-03", type: "MCQ", prompt: "What is an 'idempotent' data pipeline task?", options: ["A task that produces the exact same outcome whether executed once or repeated multiple times with the same input", "A task that runs without network access", "A task with no dependencies", "A task that deletes its input"], answer: 0, points: 10 },
        { id: "Q-DSC-030-04", type: "MCQ", prompt: "What is the primary role of an Airflow Scheduler?", options: ["Monitoring all DAG tasks and triggering task instances whose dependencies and schedule time have been met", "Executing machine learning models on GPU", "Rendering the web browser frontend", "Storing database records"], answer: 0, points: 10 },
        { id: "Q-DSC-030-05", type: "MCQ", prompt: "What open-source Python library allows defining test assertions against datasets (e.g. expect_column_values_to_not_be_null)?", options: ["Great Expectations", "PyTest only", "AssertThat", "DataCheck"], answer: 0, points: 10 },
        { id: "Q-DSC-030-06", type: "MCQ", prompt: "What phenomenon occurs when input feature distributions drift over time, degrading model accuracy in production?", options: ["Data Drift / Covariate Shift", "Overfitting", "Collinearity", "Zero variance"], answer: 0, points: 10 },
        { id: "Q-DSC-030-07", type: "MCQ", prompt: "What statistical two-sample test is commonly used in automated drift detection pipelines for continuous features?", options: ["Kolmogorov-Smirnov (K-S) test", "Chi-Square test", "Student's t-test", "Shapiro-Wilk test"], answer: 0, points: 10 },
        { id: "Q-DSC-030-08", type: "MCQ", prompt: "In Apache Airflow, what operator executes arbitrary Python callables within the DAG?", options: ["PythonOperator", "BashOperator", "SqlOperator", "BranchOperator"], answer: 0, points: 10 },
        { id: "Q-DSC-030-09", type: "MCQ", prompt: "Why should ML training pipelines support backfilling?", options: ["To recalculate historical features or retrain models over past calendar partitions when pipeline logic changes", "To delete historical records", "To backup hard drives", "To save cloud storage costs"], answer: 0, points: 10 },
        { id: "Q-DSC-030-10", type: "MCQ", prompt: "What parameter in Prefect tasks configures automatic retries when transient network or database errors occur?", options: ["retries=n and retry_delay_seconds=s", "timeout=s", "max_exec=n", "auto_recover=True"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-031",
      title: "Data Science Capstone Assessment",
      chapterId: "CH-DSC-031",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-031-01", type: "MCQ", prompt: "In an end-to-end churn prediction engine, why is threshold tuning essential prior to deploying to the sales CRM?", options: ["To optimize expected net financial dollar return based on customer acquisition cost and retention offer costs", "To ensure accuracy is always 99%", "To eliminate false positives completely", "To satisfy database constraints"], answer: 0, points: 10 },
        { id: "Q-DSC-031-02", type: "MCQ", prompt: "What strategy effectively validates time-series or customer churn models where future churn depends on customer vintage?", options: ["Out-of-time walk-forward validation (training on months 1-10, validating on month 11)", "Randomized 10-fold CV", "Leave-one-out CV", "Testing on training data"], answer: 0, points: 10 },
        { id: "Q-DSC-031-03", type: "MCQ", prompt: "What method allows Optuna to prune unpromising hyperparameter trials early during cross-validation?", options: ["MedianPruner (or Hyperband)", "GridSearchCV", "RandomSampler", "EarlyStoppingCallback only"], answer: 0, points: 10 },
        { id: "Q-DSC-031-04", type: "MCQ", prompt: "What feature store architecture separates low-latency online key-value lookups from high-throughput offline Parquet scans?", options: ["Feast (or Hopsworks)", "SQLite", "Redis standalone", "PostgreSQL only"], answer: 0, points: 10 },
        { id: "Q-DSC-031-05", type: "MCQ", prompt: "Why is tracking model data lineage critical during enterprise capstone delivery?", options: ["To trace any deployed model artifact back to the exact training dataset version, code commit, and hyperparameters that created it", "To reduce Docker container size", "To speed up inference latency", "To satisfy frontend designers"], answer: 0, points: 10 },
        { id: "Q-DSC-031-06", type: "MCQ", prompt: "What metric evaluates the proportion of total churners captured within the top 20% highest-risk decile?", options: ["Cumulative Gains / Lift at 20%", "Raw Accuracy", "Brier Score", "Mean Squared Error"], answer: 0, points: 10 },
        { id: "Q-DSC-031-07", type: "MCQ", prompt: "How should missing numerical data in streaming real-time inference be handled if the training set used median imputation?", options: ["Impute missing inputs with the exact median values learned and frozen during the training phase", "Compute the median of the single streaming row", "Reject all requests containing any nulls", "Fill with 0.0"], answer: 0, points: 10 },
        { id: "Q-DSC-031-08", type: "MCQ", prompt: "What technique prevents CatBoost or LightGBM from consuming excessive RAM during large-scale hyperparameter sweeps?", options: ["Using histogram binning (max_bin=255) and setting subsampling fractions", "Converting floats to strings", "Disabling multi-threading", "Increasing tree depth"], answer: 0, points: 10 },
        { id: "Q-DSC-031-09", type: "MCQ", prompt: "What artifact should accompany an enterprise machine learning model to document intended use, benchmarks, and ethical limitations?", options: ["Model Card", "Source code license only", "Swagger schema only", "Docker compose file"], answer: 0, points: 10 },
        { id: "Q-DSC-031-10", type: "MCQ", prompt: "In the final capstone review, what question is paramount to business stakeholders?", options: ["How much measurable revenue or cost reduction does the model generate compared to existing business heuristics?", "What was the random seed?", "How many lines of code were written?", "What color was the terminal theme?"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-032",
      title: "Data Science Career & Technical Mastery Assessment",
      chapterId: "CH-DSC-032",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-032-01", type: "MCQ", prompt: "In behavioral data science interviews, what structure should candidates follow to articulate project impact effectively?", options: ["STAR method: Situation, Task, Action, Result (quantified)", "Code, Test, Debug, Commit", "Introduction, Body, Conclusion", "Linear, Quadratic, Exponential"], answer: 0, points: 10 },
        { id: "Q-DSC-032-02", type: "MCQ", prompt: "What project is most likely to distinguish a candidate's portfolio in competitive technical evaluations?", options: ["An end-to-end production pipeline ingesting real data, trained with modern GBDT/deep learning, tracked in MLflow, and deployed via Docker/FastAPI with a live demo", "A standard Kaggle Titanic notebook", "A 10-line CSV summary script", "A cloned generic tutorial"], answer: 0, points: 10 },
        { id: "Q-DSC-032-03", type: "MCQ", prompt: "When asked in a live interview how to design a YouTube recommendation system, what is the best opening step?", options: ["Clarify requirements, scope, business objectives (e.g. watch time vs engagement), and latency/throughput scale constraints", "Immediately write Python code", "Propose a deep neural network without asking questions", "Discuss database indexing"], answer: 0, points: 10 },
        { id: "Q-DSC-032-04", type: "MCQ", prompt: "How should a senior data scientist handle a scenario where business executives want to deploy a model with high bias?", options: ["Present clear cross-validation metrics, quantify the financial cost of underfitting, and demonstrate alternative models with explainability charts", "Deploy it immediately without comment", "Refuse to communicate", "Secretly train a different model"], answer: 0, points: 10 },
        { id: "Q-DSC-032-05", type: "MCQ", prompt: "What live SQL skill is evaluated most frequently in technical screening for senior analytics roles?", options: ["Analytical window functions (RANK, LAG/LEAD, running aggregates) and multi-table CTEs", "Basic SELECT * queries", "Creating table schemas only", "Database server installation"], answer: 0, points: 10 },
        { id: "Q-DSC-032-06", type: "MCQ", prompt: "What is 'concept drift' versus 'data drift'?", options: ["Data drift is a shift in input feature distributions P(X); concept drift is a shift in the conditional relationship P(Y|X)", "They are identical terms", "Concept drift only applies to text", "Data drift means missing values"], answer: 0, points: 10 },
        { id: "Q-DSC-032-07", type: "MCQ", prompt: "What git practice communicates high software engineering maturity in candidate repositories?", options: ["Atomic commits with conventional commit messages, branch protection, CI/CD linting, and automated tests", "A single massive commit called 'first commit'", "Pushing directly to main without tests", "Committing raw 5GB CSV files"], answer: 0, points: 10 },
        { id: "Q-DSC-032-08", type: "MCQ", prompt: "When asked about trade-offs between XGBoost and Logistic Regression, what is the most balanced response?", options: ["XGBoost captures complex non-linear interactions automatically but requires tuning and explainability tools; Logistic Regression is fast, convex, and directly interpretable via odds ratios", "Logistic Regression is always obsolete", "XGBoost never overfits", "They have identical performance"], answer: 0, points: 10 },
        { id: "Q-DSC-032-09", type: "MCQ", prompt: "What does demonstrating 'commercial acumen' in a technical interview entail?", options: ["Translating statistical metric gains (e.g., +0.02 AUC) into direct business bottom-line impact (e.g., $1.2M annual churn reduction)", "Quoting stock market prices", "Demanding higher salary", "Selling software products"], answer: 0, points: 10 },
        { id: "Q-DSC-032-10", type: "MCQ", prompt: "What is the single most important mindset of a world-class data scientist?", options: ["Relentless curiosity paired with intellectual honesty, statistical rigor, and an obsession with solving genuine business problems", "Memorizing every Scikit-Learn function name", "Writing code without comments", "Using the deepest possible neural network for every problem"], answer: 0, points: 10 },
      ]
    }
  ]
};

