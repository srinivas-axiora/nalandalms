// Course 4: Artificial Intelligence & Machine Learning Masterclass
// Aggregator module for all 5 phases (34 chapters, 34 assessments, 340 questions)
import { phase1 } from "./phase1.js";
import { phase2 } from "./phase2.js";
import { phase3 } from "./phase3.js";
import { phase4 } from "./phase4.js";
import { phase5 } from "./phase5.js";

export const aiMlCourse = {
  id: "CRS-AIML-001",
  title: "AI & Machine Learning Masterclass: Deep Learning, Transformers & Generative AI",
  description: "Elite 34-chapter comprehensive curriculum from mathematical foundations to production Generative AI engineering. Covers Perceptrons, Backpropagation, PyTorch 2.0, Modern Optimizers (AdamW), Computer Vision (ResNet, YOLOv8, U-Net), Sequential Modeling (LSTM, GRU), Attention & Transformers ('Attention Is All You Need'), BERT vs GPT, Hugging Face, PEFT (LoRA/QLoRA), Model Quantization (GPTQ/AWQ), Alignment (RLHF/DPO), Advanced RAG with Hybrid Reranking, Autonomous Agents with LangGraph, and Production Serving with vLLM & PagedAttention.",
  skill: "AI & Machine Learning",
  skillIds: ["SKILL-AIML", "SKILL-DEEP-LEARNING", "SKILL-GENAI"],
  targetLevel: "Advanced",
  prerequisites: ["CRS-DSC-001"],
  category: "Data Science & AI",
  tags: ["Artificial Intelligence", "Deep Learning", "PyTorch 2.0", "Computer Vision", "Transformers", "LLMs", "Generative AI", "LoRA", "RAG", "LangGraph", "vLLM"],
  thumbnailColor: "#4f46e5",
  ownerId: "EMP-1003",
  approval: "Approved",
  status: "Active",
  version: 1,
  difficulty: "Comprehensive (Beginner to Advanced)",
  estimatedHours: 120,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const aiMlSkills = [
  {
    id: "SKILL-AIML",
    name: "AI & Machine Learning Engineering",
    category: "Technical",
    description: "Deep learning fundamentals, automatic differentiation, backpropagation calculus, and high-performance PyTorch 2.0 architectures.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-DEEP-LEARNING",
    name: "Deep Learning & Computer Vision",
    category: "Technical",
    description: "CNN architectures (ResNet, DenseNet), object detection (YOLOv8), image segmentation (U-Net), and transfer learning.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SKILL-GENAI",
    name: "Generative AI, Transformers & LLMs",
    category: "Technical",
    description: "Transformer mechanics, Multi-Head Attention, fine-tuning (LoRA/QLoRA), Quantization (AWQ), Advanced RAG, LangGraph agents, and vLLM serving.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

export const aiMlChapters = [
  ...phase1.chapters,
  ...phase2.chapters,
  ...phase3.chapters,
  ...phase4.chapters,
  ...phase5.chapters,
];

export const aiMlAssessments = [
  ...phase1.assessments,
  ...phase2.assessments,
  ...phase3.assessments,
  ...phase4.assessments,
  ...phase5.assessments,
];

