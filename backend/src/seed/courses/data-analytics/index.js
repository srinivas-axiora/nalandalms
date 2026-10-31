// Course 7: Data Analytics Masterclass
// Aggregator module for all 5 phases (30 chapters, 30 assessments, 300 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const dataAnalyticsCourse = {
  id: "CRS-DNA-001",
  title: "Data Analytics Masterclass: Advanced SQL, Python, BI Dashboards & Storytelling",
  description: "Comprehensive 30-chapter masterclass from foundational analytics and Kimball dimensional modeling to modern data stack architectures and executive storytelling. Covers Kimball Star/Snowflake schemas, SCDs, SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG/LEAD, running frames), Complex Joins & Recursive CTEs, Cohort Retention Matrices, Execution Plans & Index Performance Tuning, Data Quality Audits & Anomaly Detection, NumPy Vectorization & Array Computing, Pandas 2.0 & Polars DataFrames, Missing Data Imputation (MCAR/MAR/MNAR), Exploratory Data Analysis & Skewness, Probability Distributions & Central Limit Theorem, Hypothesis Testing & A/B Experimentation Analytics, Data Visualization Psychology & Gestalt Principles, Seaborn & Interactive Plotly Express, Tableau Desktop (Calculations, LODs, Parameters), Power BI Architecture & DAX Filter/Row Context, Geospatial Analytics & GeoPandas, Self-Service BI & Semantic Governance, SaaS & Product Metrics (ARR, NRR, LTV/CAC, Churn), E-Commerce & Retail Funnel Analytics (GMV, AOV, GMROI), RFM Customer Segmentation & Clustering, Data Storytelling Frameworks (Barbara Minto Pyramid & SCR), Interactive Streamlit Executive Dashboards, Financial & Working Capital Variance Analysis, Modern Data Stack & dbt Transformations, Data Governance, Catalogs & Lineage (GDPR/CCPA/Amundsen), Automated Testing with Great Expectations, Churn Prediction & Survival Analysis with Lifelines, Capstone: Aura Global Omnichannel Analytics Audit, and Analytics Career Mastery & Case Study Technical Interviews.",
  skill: "Data Analytics & Business Intelligence",
  skillIds: ["SKILL-ADVANCED-SQL-ANALYTICS", "SKILL-PYTHON-DATA-WRANGLING", "SKILL-BI-EXECUTIVE-REPORTING"],
  targetLevel: "Comprehensive",
  prerequisites: [],
  category: "Data & Analytics",
  tags: [
    "Data Analytics",
    "SQL",
    "Python",
    "Pandas",
    "Polars",
    "Tableau",
    "Power BI",
    "DAX",
    "A/B Testing",
    "dbt",
    "Streamlit",
    "Data Storytelling",
    "Business Intelligence",
    "Dimensional Modeling"
  ],
  thumbnailColor: "#059669",
  ownerId: "EMP-1002",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 105,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const dataAnalyticsSkills = [
  {
    id: "SKILL-ADVANCED-SQL-ANALYTICS",
    name: "Advanced SQL & Dimensional Modeling",
    category: "Technical",
    description: "Enterprise dimensional modeling with Kimball star/snowflake schemas, complex window functions, recursive CTEs, cohort matrices, query optimization, and execution plan tuning.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-PYTHON-DATA-WRANGLING",
    name: "Python Data Wrangling & Applied Statistics",
    category: "Technical",
    description: "High-performance vector manipulation with NumPy, Pandas 2.0, Polars, missing data handling, EDA, hypothesis testing, A/B experiment evaluation, and survival analysis.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-BI-EXECUTIVE-REPORTING",
    name: "Business Intelligence & Executive Storytelling",
    category: "Technical",
    description: "Modern BI architectures using Tableau LODs, Power BI DAX context, Streamlit dashboards, dbt modeling, Great Expectations audits, and Minto Pyramid executive data storytelling.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const dataAnalyticsChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const dataAnalyticsAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

