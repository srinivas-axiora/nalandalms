// Course 3: Data Science Masterclass
// Aggregator module for all 5 phases (32 chapters, 32 assessments, 320 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const dataScienceCourse = {
  id: "CRS-DSC-001",
  title: "Data Science Masterclass: From Mathematical Foundations to Production ML & MLOps",
  description: "Comprehensive 32-chapter professional curriculum taking beginners to elite production data scientists. Covers Linear Algebra, Multivariable Calculus, Probability, Bayesian Statistics, NumPy, Pandas 2.0, Polars, Advanced SQL, Scikit-Learn, XGBoost, LightGBM, CatBoost, Clustering, PCA/UMAP, SHAP Explainability, MLflow, Streamlit, and FastAPI serving.",
  skill: "Data Science",
  skillIds: ["SKILL-DSC", "SKILL-ML", "SKILL-MLOPS"],
  targetLevel: "Advanced",
  prerequisites: [],
  category: "Data Science & AI",
  tags: ["Data Science", "Machine Learning", "Python", "Polars", "Scikit-Learn", "LightGBM", "XGBoost", "MLflow", "SHAP", "Streamlit", "FastAPI"],
  thumbnailColor: "#7c3aed",
  ownerId: "EMP-1003",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 115,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const dataScienceSkills = [
  {
    id: "SKILL-DSC",
    name: "Data Science & Statistical Analysis",
    category: "Technical",
    description: "Mathematical foundations, scientific computing with NumPy/Polars, feature engineering, and statistical hypothesis testing.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-ML",
    name: "Applied Machine Learning & Algorithms",
    category: "Technical",
    description: "Supervised and unsupervised algorithms, Scikit-Learn, GBDT (LightGBM, XGBoost, CatBoost), and model interpretability (SHAP).",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-MLOPS",
    name: "Production ML & Experiment Tracking",
    category: "Technical",
    description: "MLflow experiment governance, model serving with FastAPI, orchestration with Prefect, and reactive dashboards with Streamlit.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const dataScienceChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const dataScienceAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

