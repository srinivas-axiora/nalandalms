// Phase 5: Production GenAI, RAG, Autonomous Agents & Capstone (Chapters 27 to 34) - AI / Machine Learning
// World-class curriculum: Zero to employable master.

export const phase5 = {
  chapters: [
    // ── Chapter 27 ──
    {
      id: "CH-AIML-027",
      courseId: "CRS-AIML-001",
      sequence: 27,
      title: "Retrieval-Augmented Generation (RAG) Architecture & Embeddings",
      description: "Overcoming LLM knowledge cutoffs and hallucinations, dense semantic vector retrieval, chunking strategies (recursive character splitting), and bi-encoder embedding models.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 27</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Retrieval-Augmented Generation (RAG) Architecture & Embeddings</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Parametric knowledge inside LLM weights is static, expensive to update, and prone to hallucinations. Retrieval-Augmented Generation (RAG) decouples knowledge storage from language reasoning, dynamically grounding model responses in private, verified enterprise documentation.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/T-D1OfcDW1M" title="RAG Architecture Crash Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 3 Pillars of RAG</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">1. Ingestion & Chunking</h3>
      <p style="font-size:14px;color:#475569;">Parsing heterogeneous PDF, Markdown, and HTML documents into overlapping semantic chunks (e.g. 512 tokens with 50 token overlap) using recursive character text splitters.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">2. Dense Embedding Indexing</h3>
      <p style="font-size:14px;color:#475569;">Passing text chunks through bi-encoder models (e.g. <code>bge-large-en-v1.5</code>, <code>text-embedding-3-large</code>) to generate 1024-dimensional normalized semantic vectors stored in a Vector DB.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">3. Grounded Synthesis</h3>
      <p style="font-size:14px;color:#475569;">Executing Cosine / Dot-Product similarity search, injecting top-k retrieved excerpts into an augmented prompt, and enforcing strict citations in the generated response.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>RAG eliminates the risk of parametric model hallucination by forcing LLMs to cite retrieved context verbatim.</li>
      <li>Chunk size is the critical hyperparameter: small chunks (128 tokens) lose context; huge chunks (2048 tokens) dilute semantic embedding density.</li>
      <li>Always normalize embedding vectors to unit length so Cosine Similarity reduces to a high-speed dot product.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 28 ──
    {
      id: "CH-AIML-028",
      courseId: "CRS-AIML-001",
      sequence: 28,
      title: "Vector Databases: Indexing Algorithms (HNSW, IVF), Chroma & Pinecone",
      description: "Approximate Nearest Neighbors (ANN), Hierarchical Navigable Small World (HNSW) graphs, Inverted File Index (IVF), ChromaDB local persistence, and Pinecone serverless indexing.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 28</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Vector Databases: Indexing Algorithms (HNSW, IVF) & Pinecone</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Brute-force exact k-Nearest Neighbors scales linearly \\(\\mathcal{O}(N \\cdot D)\\), rendering search over 100 million vectors impossibly slow. Approximate Nearest Neighbor (ANN) index structures achieve sub-10ms logarithmic retrieval latency via graph-based and clustered indexing.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/klTvEwg3oJ8" title="Vector Databases and HNSW Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The HNSW Graph Hierarchy</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;"><strong>Hierarchical Navigable Small World (HNSW)</strong> constructs a multi-layer graph structure inspired by Skip Lists. The top sparse layers contain long-range highway links across distant vector clusters; as the search traverses downward to denser layers, it performs local greedy routing, finding nearest neighbors in \\(\\mathcal{O}(\\log N)\\) time with >99% recall.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. ChromaDB Vector Store in Python</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import chromadb
from chromadb.utils import embedding_functions

# Initialize persistent local on-disk vector database
client = chromadb.PersistentClient(path="./chroma_db")
ef = embedding_functions.DefaultEmbeddingFunction()

collection = client.get_or_create_collection(
    name="enterprise_policies",
    embedding_function=ef,
    metadata={"hnsw:space": "cosine"} # Use Cosine metric
)

# Insert documents with metadata filtering fields
collection.add(
    documents=["Employees receive 20 days paid vacation annually.", "Travel expenses must be filed within 14 days."],
    metadatas=[{"department": "HR", "version": 2026}, {"department": "Finance", "version": 2026}],
    ids=["doc_hr_01", "doc_fin_01"]
)

# Query top-2 closest matches with metadata pre-filtering
results = collection.query(
    query_texts=["How many vacation days do I get?"],
    n_results=2,
    where={"department": "HR"} # Metadata filtering eliminates unneeded vector comparisons
)
print("Top context:", results['documents'][0])</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>HNSW is the industry gold-standard ANN algorithm for high recall and fast queries, trading memory for speed.</li>
      <li>IVF-PQ (Inverted File with Product Quantization) is ideal for billion-scale deployments where RAM is strictly constrained.</li>
      <li>Combine vector similarity with metadata filtering (e.g. <code>tenant_id</code>, <code>access_role</code>, <code>date</code>) to enforce enterprise security boundaries.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 29 ──
    {
      id: "CH-AIML-029",
      courseId: "CRS-AIML-001",
      sequence: 29,
      title: "Advanced RAG: Hybrid Search, Reranking & Context Compression",
      description: "BM25 keyword search fusion (Reciprocal Rank Fusion - RRF), cross-encoder neural rerankers (Cohere / BGE-Reranker), Parent Document retrieval, and contextual compression.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 29</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Advanced RAG: Hybrid Search & Neural Reranking</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Naive semantic vector search fails on exact keyword matches: part numbers, error codes, and legal terms often yield poor embedding proximity. Production RAG pipelines deploy a two-stage retrieval architecture: <strong>Hybrid Search</strong> followed by <strong>Cross-Encoder Reranking</strong>.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/sVcwVQRHIc8" title="Advanced RAG Architecture" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Two-Stage Production Retrieval Pipeline</h2>
  <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:20px;margin:20px 0;">
    <h4 style="margin-top:0;color:#0f172a;">Two-Stage Architecture:</h4>
    <ol style="margin-bottom:0;padding-left:20px;font-size:14px;color:#334155;line-height:1.8;">
      <li><strong>Stage 1 (High Recall - Retrieve Top 50):</strong> Execute parallel sparse lexical search (BM25) and dense vector search (HNSW). Merge ranked candidate lists using <strong>Reciprocal Rank Fusion (RRF)</strong>: $$RRF(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}$$.</li>
      <li><strong>Stage 2 (High Precision - Rerank to Top 5):</strong> Pass the 50 candidate pairs \\((query, chunk)\\) through a heavy Cross-Encoder model (e.g. <code>bge-reranker-large</code>). Cross-encoders compute full cross-attention between every query word and document word, accurately scoring relevance.</li>
    </ol>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Cross-Encoder reranking typically improves Retrieval Precision@5 by 20-35% over naive single-vector search.</li>
      <li><strong>Parent Document Retrieval</strong> splits documents into tiny child chunks (100 tokens) for sensitive vector search, but returns the larger parent document (1000 tokens) to the LLM for complete context.</li>
      <li>Contextual compression removes irrelevant sentences from retrieved chunks before feeding them to the generation LLM, cutting prompt cost.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 30 ──
    {
      id: "CH-AIML-030",
      courseId: "CRS-AIML-001",
      sequence: 30,
      title: "Autonomous AI Agents & Tool Calling with LangChain & LangGraph",
      description: "Function calling APIs, JSON schema tool definitions, Plan-and-Solve agents, cyclic state machines with LangGraph, human-in-the-loop checkpoints, and multi-agent collaboration.",
      contentType: "Rich Text",
      durationMinutes: 60,
      minimumTimeMinutes: 30,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 30</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Autonomous AI Agents & Tool Calling with LangGraph</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Generative AI shifts from passive question answering to active autonomous execution. By equipping LLMs with tools (calculators, SQL executors, REST API callers, web browsers), models reason over intermediate outputs and take multi-step actions to achieve complex enterprise objectives.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/sal78ACtGTc" title="LangGraph Multi-Agent Workflows" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Stateful Cyclic Agents with LangGraph</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

class AgentState(TypedDict):
    messages: Sequence[BaseMessage]

# Build state machine graph
workflow = StateGraph(AgentState)

# Define nodes: LLM reasoner node and Tool execution node
workflow.add_node("agent", call_reasoning_llm)
workflow.add_node("tools", ToolNode(tools=[query_sales_db, send_slack_alert]))

# Add conditional routing edge: if LLM requested tools -> route to tools; else END
workflow.add_conditional_edges(
    "agent",
    should_continue, # Returns "tools" or END
    {"tools": "tools", END: END}
)
workflow.add_edge("tools", "agent") # Cyclic feedback loop!

workflow.set_entry_point("agent")
app = workflow.compile()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Linear chain abstractions (standard LangChain) fail on complex workflows; <strong>LangGraph</strong> models cyclical state machines with memory and human-in-the-loop checkpoints.</li>
      <li>LLM Tool Calling uses strict JSON Schema function signatures matching OpenAPI standards.</li>
      <li>Always place destructive actions (e.g. database DROP, refunds >$500) behind explicit Human-in-the-Loop approval gates.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 31 ──
    {
      id: "CH-AIML-031",
      courseId: "CRS-AIML-001",
      sequence: 31,
      title: "LLM Observability, Evaluation (RAGAS) & Guardrails",
      description: "Automated LLM-as-a-Judge evaluation, RAGAS metrics (Faithfulness, Answer Relevance, Context Precision, Context Recall), latency/token tracking with LangSmith, and guardrails.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 31</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">LLM Observability, Evaluation (RAGAS) & Guardrails</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">You cannot improve what you cannot measure. Deploying generative AI to production without quantitative evaluation creates severe legal and brand risks. We implement automated programmatic evaluation frameworks and real-time observability telemetry.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/w7g-27mR4-o" title="Evaluating RAG Applications with Ragas" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4 Core RAGAS Metrics</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">1. Faithfulness (Groundedness)</h3>
      <p style="font-size:14px;color:#475569;">Measures whether every factual claim in the generated answer can be inferred directly from the retrieved context. Detects hallucination.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">2. Answer Relevance</h3>
      <p style="font-size:14px;color:#475569;">Measures whether the generated completion directly addresses the user's prompt without introducing irrelevant tangents or filler prose.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">3. Context Precision</h3>
      <p style="font-size:14px;color:#475569;">Evaluates whether the signal-to-noise ratio in retrieved context is high, prioritizing relevant chunks at higher ranking positions.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#f59e0b;margin-top:0;">4. Context Recall</h3>
      <p style="font-size:14px;color:#475569;">Measures whether all necessary pieces of information required to formulate the reference answer were successfully retrieved.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Automate CI/CD regression testing of RAG pipelines using RAGAS; block deployments if Faithfulness drops below 0.90.</li>
      <li>Deploy tracing platforms (LangSmith, Arize Phoenix, OpenInference) to track token consumption, request latency, and call trees in real time.</li>
      <li>Implement input/output guardrails to detect PII (Personally Identifiable Information) leaks and jailbreak attacks before models answer.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 32 ──
    {
      id: "CH-AIML-032",
      courseId: "CRS-AIML-001",
      sequence: 32,
      title: "Production LLM Serving: vLLM, TensorRT-LLM & PagedAttention",
      description: "Inference serving bottlenecks, the KV cache memory dilemma, PagedAttention virtual memory architecture, continuous batching, speculative decoding, and vLLM deployment.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 32</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Production LLM Serving: vLLM & PagedAttention</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Serving Large Language Models with naive Hugging Face pipelines wastes 60-80% of GPU memory on internal fragmentation in the Key-Value (KV) cache. High-throughput serving engines like <strong>vLLM</strong> and <strong>TensorRT-LLM</strong> increase serving throughput by 5x-10x.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5ZlavRFKJ88" title="vLLM and PagedAttention Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. PagedAttention Virtual Memory Mechanics</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Inspired by virtual memory paging in operating systems, <strong>PagedAttention</strong> divides the KV cache into fixed-size physical blocks (e.g. 16 tokens). Key and Value tensors do not need to be stored in contiguous physical memory; a page table tracks logical-to-physical block mappings dynamically as sequences grow, slashing KV cache memory waste to near zero.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Serving OpenAI-Compatible APIs with vLLM</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code># Launch high-throughput OpenAI-compatible server on GPU
python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Meta-Llama-3-8B-Instruct \
    --tensor-parallel-size 1 \
    --dtype bfloat16 \
    --max-model-len 8192 \
    --gpu-memory-utilization 0.90 \
    --port 8000

# Client requests can now hit http://localhost:8000/v1/chat/completions directly!</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><strong>Continuous Batching</strong> schedules newly arrived requests at every token generation step rather than waiting for preceding batch sequences to finish.</li>
      <li><strong>Speculative Decoding</strong> uses a small draft model (e.g. 1B) to speculate tokens, validated in a single forward pass by the large target model (70B), boosting speed 2-3x without quality loss.</li>
      <li>vLLM provides drop-in OpenAI API compatibility, allowing enterprise applications to switch from costly proprietary APIs to private self-hosted models seamlessly.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 33 ──
    {
      id: "CH-AIML-033",
      courseId: "CRS-AIML-001",
      sequence: 33,
      title: "Comprehensive Capstone: Enterprise Multi-Modal GenAI Assistant",
      description: "End-to-end industry capstone: multi-modal vision-language document parsing, hybrid RAG with reranking, autonomous tool calling, LangGraph state machine, and vLLM serving.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 40,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 33</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Comprehensive Capstone: Enterprise Multi-Modal GenAI Assistant</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In this master capstone, you unify every capability developed across the 34 chapters: PyTorch foundations, vision backbones, subword tokenization, multi-head attention, PEFT/QLoRA adaptation, vector databases, hybrid search with cross-encoder reranking, and autonomous tool calling.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/zjkBMFhNj_g" title="Building Enterprise AI Systems" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Architectural Blueprint</h2>
  <div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:20px;margin:20px 0;">
    <h4 style="margin-top:0;color:#0f172a;">Enterprise Pipeline Blueprint:</h4>
    <ol style="margin-bottom:0;padding-left:20px;font-size:14px;color:#334155;line-height:1.8;">
      <li><strong>Document Ingestion:</strong> Ingest complex PDF invoices, financial earnings reports, and scanned architectural diagrams using vision-language document models (ColPali / Llama-3.2-Vision).</li>
      <li><strong>Hybrid Indexing:</strong> Index chunks in Chroma/Pinecone with BGE embeddings alongside sparse BM25 indices.</li>
      <li><strong>Two-Stage Rerank:</strong> Rerank retrieved candidate nodes using Cohere / BGE-Reranker-large.</li>
      <li><strong>Autonomous State Machine:</strong> Coordinate multi-step reasoning via LangGraph, enabling the assistant to call external enterprise SQL databases and ERP APIs.</li>
      <li><strong>Serving & Observability:</strong> Serve via vLLM with PagedAttention and monitor automated Faithfulness scores in real time with RAGAS.</li>
    </ol>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>This capstone demonstrates production-grade full-stack AI engineering, distinguishing you in top-tier technical interviews.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 34 ──
    {
      id: "CH-AIML-034",
      courseId: "CRS-AIML-001",
      sequence: 34,
      title: "AI / ML Engineering Portfolio, System Design & Career Mastery",
      description: "AI system design interviews, whiteboarding scalable ML architectures, balancing compute vs latency budgets, GitHub portfolio presentation, and interview mastery.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 5: Production GenAI & RAG • Chapter 34</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">AI / ML Engineering Portfolio, System Design & Career Mastery</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Securing staff and senior AI engineering roles requires mastering AI System Design interviews: balancing GPU VRAM constraints, calculating floating point operations (FLOPs), handling high-concurrency token streaming, and justifying trade-offs under real budget constraints.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5b9Z8toVaAU" title="AI Engineering System Design Interview" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Standard AI System Design Interview Framework</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">1. Scope & Constraints</h3>
      <p style="font-size:14px;color:#475569;">Target latency (p99 < 200ms TTFT), throughput (tokens/sec), parameter budget, context length, and hardware constraints.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">2. Data & Representation</h3>
      <p style="font-size:14px;color:#475569;">Tokenization strategies, data deduplication, synthetic dataset generation, and vector embedding models.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">3. Modeling & Adaptation</h3>
      <p style="font-size:14px;color:#475569;">Pretrained foundation backbone selection, PEFT/LoRA fine-tuning vs in-context RAG, and quantization (AWQ/GPTQ).</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#f59e0b;margin-top:0;">4. Serving & Guardrails</h3>
      <p style="font-size:14px;color:#475569;">vLLM with PagedAttention, KV cache sizing, continuous batching, RAGAS evaluations, and prompt injection defense.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Showcase real production engineering: dockerized repos, automated tests, benchmark tables, and live demo endpoints.</li>
      <li>Always calculate VRAM requirements mathematically during system design interviews: $$\\text{VRAM} = \\text{Model Weights} + \\text{KV Cache} + \\text{Activations}$$.</li>
      <li>Congratulations! You have completed the comprehensive AI / Machine Learning master curriculum.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-AIML-027",
      title: "RAG Architecture & Embeddings Assessment",
      chapterId: "CH-AIML-027",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-027-01", type: "MCQ", prompt: "What primary limitation of Large Language Models does Retrieval-Augmented Generation (RAG) resolve?", options: ["Static parametric knowledge cutoffs and factual hallucinations on proprietary enterprise data", "Slow GPU clock speeds", "Lack of float support", "Excessive context windows"], answer: 0, points: 10 },
        { id: "Q-AIML-027-02", type: "MCQ", prompt: "Why is 'chunk overlap' (e.g. 50 tokens) recommended when splitting documents with a text splitter?", options: ["To prevent breaking critical semantic context or phrases positioned directly at chunk boundaries", "To double the size of the database", "To encrypt text", "To speed up embedding calculation"], answer: 0, points: 10 },
        { id: "Q-AIML-027-03", type: "MCQ", prompt: "What model architecture generates dense vector embeddings from text for high-speed indexing?", options: ["Bi-Encoder (Dual Encoder)", "Cross-Encoder", "Decoder-only LLM", "Recurrent LSTM"], answer: 0, points: 10 },
        { id: "Q-AIML-027-04", type: "MCQ", prompt: "Why are embedding vectors typically normalized to unit length (L2 norm = 1.0)?", options: ["Cosine similarity between normalized vectors becomes a simple, fast dot product, speeding up search computations", "To convert vectors to integers", "To eliminate negative numbers", "To prevent GPU overheating"], answer: 0, points: 10 },
        { id: "Q-AIML-027-05", type: "MCQ", prompt: "What text chunking strategy splits documents hierarchically by paragraphs, then sentences, then words?", options: ["Recursive Character Text Splitting", "Fixed-size character slicing", "Random splitting", "Regex whitespace split"], answer: 0, points: 10 },
        { id: "Q-AIML-027-06", type: "MCQ", prompt: "What is 'Semantic Chunking' in advanced RAG ingestion?", options: ["Splitting text dynamically at points where cosine similarity between adjacent sentence embeddings drops significantly", "Splitting every 100 words", "Splitting by punctuation only", "Splitting by page number"], answer: 0, points: 10 },
        { id: "Q-AIML-027-07", type: "MCQ", prompt: "What open benchmark evaluates dense text embedding models across retrieval, clustering, and classification tasks?", options: ["MTEB (Massive Text Embedding Benchmark)", "GLUE", "ImageNet", "SuperGLUE"], answer: 0, points: 10 },
        { id: "Q-AIML-027-08", type: "MCQ", prompt: "What happens if chunk size is configured too small (e.g. 20 tokens) in a RAG pipeline?", options: ["Individual chunks lack sufficient contextual meaning, resulting in poor retrieval and degraded generation quality", "The vector database crashes", "Embeddings become NaN", "Search becomes 10x slower"], answer: 0, points: 10 },
        { id: "Q-AIML-027-09", type: "MCQ", prompt: "What happens if chunk size is configured excessively large (e.g. 4096 tokens)?", options: ["Embeddings represent a broad mixture of disparate topics, diluting search specificity for targeted questions", "The text cannot be embedded", "LLM context windows overflow", "Tokens are deleted"], answer: 0, points: 10 },
        { id: "Q-AIML-027-10", type: "MCQ", prompt: "How does RAG provide enterprise compliance and auditability?", options: ["Generated responses can directly cite exact source document IDs and page numbers for human verification", "It prevents users from asking questions", "It encrypts model weights", "It stores prompts in blockchain"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-028",
      title: "Vector Databases & HNSW Assessment",
      chapterId: "CH-AIML-028",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-028-01", type: "MCQ", prompt: "What does ANN stand for in high-dimensional vector search?", options: ["Approximate Nearest Neighbors", "Artificial Neural Network", "Adaptive Node Network", "Automated Natural Normalization"], answer: 0, points: 10 },
        { id: "Q-AIML-028-02", type: "MCQ", prompt: "What data structure inspires the multi-layer graph hierarchy in HNSW (Hierarchical Navigable Small World)?", options: ["Skip Lists", "Red-Black Trees", "Hash Tables", "B-Trees"], answer: 0, points: 10 },
        { id: "Q-AIML-028-03", type: "MCQ", prompt: "What time complexity does HNSW achieve for nearest neighbor search across N vectors?", options: ["O(log N)", "O(N) (Linear search)", "O(N^2)", "O(1)"], answer: 0, points: 10 },
        { id: "Q-AIML-028-04", type: "MCQ", prompt: "What index structure clusters vectors into Voronoi cells using K-Means and searches only the nearest centroids?", options: ["IVF (Inverted File Index)", "HNSW", "Flat index", "Random Projection"], answer: 0, points: 10 },
        { id: "Q-AIML-028-05", type: "MCQ", prompt: "What vector compression technique divides vectors into sub-vectors and quantizes each to codebook centroids?", options: ["Product Quantization (PQ)", "BFloat16", "Scalar Quantization", "Zip compression"], answer: 0, points: 10 },
        { id: "Q-AIML-028-06", type: "MCQ", prompt: "What lightweight open-source embedded vector database runs locally inside Python processes with SQLite backing?", options: ["ChromaDB", "Pinecone", "Oracle", "DynamoDB"], answer: 0, points: 10 },
        { id: "Q-AIML-028-07", type: "MCQ", prompt: "What fully managed cloud-native serverless vector database provides automatic scaling and metadata filtering?", options: ["Pinecone", "SQLite", "Local CSV", "NumPy array"], answer: 0, points: 10 },
        { id: "Q-AIML-028-08", type: "MCQ", prompt: "What is 'Pre-Filtering' versus 'Post-Filtering' in vector database queries?", options: ["Pre-filtering filters candidate vectors by metadata before computing similarity; post-filtering searches first then filters results", "Pre-filtering runs on text; post-filtering on images", "Pre-filtering is slower", "Post-filtering is always superior"], answer: 0, points: 10 },
        { id: "Q-AIML-028-09", type: "MCQ", prompt: "What parameter in HNSW controls the maximum number of bidirectional connection links per node (graph density)?", options: ["M", "efSearch", "k", "dim"], answer: 0, points: 10 },
        { id: "Q-AIML-028-10", type: "MCQ", prompt: "What parameter in HNSW controls search exploration depth at query time, trading latency for higher recall?", options: ["efSearch (or ef)", "M", "n_clusters", "metric"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-029",
      title: "Advanced RAG & Reranking Assessment",
      chapterId: "CH-AIML-029",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-029-01", type: "MCQ", prompt: "Why is hybrid search (combining dense vector retrieval with sparse BM25 lexical search) superior to dense search alone?", options: ["It captures both semantic conceptual similarity and exact keyword matches (e.g. part numbers, names, acronyms)", "It eliminates the need for vector databases", "It runs in zero memory", "It translates text automatically"], answer: 0, points: 10 },
        { id: "Q-AIML-029-02", type: "MCQ", prompt: "What algorithm merges ranked candidate lists from sparse and dense search without requiring score normalization?", options: ["Reciprocal Rank Fusion (RRF)", "Average pooling", "Softmax", "Euclidean distance"], answer: 0, points: 10 },
        { id: "Q-AIML-029-03", type: "MCQ", prompt: "How does a Cross-Encoder reranker differ architecturally from a Bi-Encoder embedding model?", options: ["A Cross-Encoder feeds query and document simultaneously into all attention layers, computing full token-to-token cross-attention", "A Cross-Encoder has no attention", "A Cross-Encoder produces static vectors", "A Cross-Encoder cannot compute scores"], answer: 0, points: 10 },
        { id: "Q-AIML-029-04", type: "MCQ", prompt: "Why are Cross-Encoders used only as a second-stage reranker rather than for initial search over millions of documents?", options: ["Cross-Encoders cannot pre-compute document vectors and are computationally too expensive to evaluate over millions of documents", "Cross-Encoders have poor accuracy", "Cross-Encoders only support English", "Cross-Encoders cannot run on GPUs"], answer: 0, points: 10 },
        { id: "Q-AIML-029-05", type: "MCQ", prompt: "What is Parent Document Retrieval?", options: ["Splitting documents into small child chunks for vector indexing, but retrieving the broader parent document for LLM context", "Retrieving files from parent folders", "Inheritance in Python", "A database backup technique"], answer: 0, points: 10 },
        { id: "Q-AIML-029-06", type: "MCQ", prompt: "What is Contextual Compression in RAG pipelines?", options: ["Using an LLM or small classifier to extract only the specific relevant sentences from retrieved chunks, reducing prompt token bloat", "Zipping documents with Gzip", "Downsampling vectors", "Deleting old documents"], answer: 0, points: 10 },
        { id: "Q-AIML-029-07", type: "MCQ", prompt: "What technique generates hypothetical answer documents (HyDE) to embed for vector search instead of raw short queries?", options: ["Hypothetical Document Embeddings (HyDE)", "BM25", "HNSW", "Cosine search"], answer: 0, points: 10 },
        { id: "Q-AIML-029-08", type: "MCQ", prompt: "What is Multi-Query Expansion in advanced RAG?", options: ["Prompting an LLM to generate 3-5 alternative phrasings of a user query to execute in parallel, overcoming phrasing bias", "Sending queries to 5 databases", "Multi-threading CPU cores", "Expanding vocabulary size"], answer: 0, points: 10 },
        { id: "Q-AIML-029-09", type: "MCQ", prompt: "What leading open-source model family is widely deployed for cross-encoder neural reranking?", options: ["BGE-Reranker (BAAI) / Cohere Rerank", "ResNet-50", "VGG-16", "Word2Vec"], answer: 0, points: 10 },
        { id: "Q-AIML-029-10", type: "MCQ", prompt: "What metric measures the proportion of relevant documents appearing within the top K retrieved results?", options: ["Precision@K (or Hit Rate@K)", "BLEU", "Perplexity", "ROUGE-L"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-030",
      title: "Autonomous Agents & LangGraph Assessment",
      chapterId: "CH-AIML-030",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-030-01", type: "MCQ", prompt: "What fundamental capability transforms a passive conversational LLM into an active autonomous agent?", options: ["Tool Calling: ability to output structured arguments to invoke external APIs and inspect execution results", "Increasing model parameters to 1 Trillion", "Training on more web text", "Using 4-bit quantization"], answer: 0, points: 10 },
        { id: "Q-AIML-030-02", type: "MCQ", prompt: "What graph structure does LangGraph use to manage complex agent workflows with loops and conditional branches?", options: ["Stateful Cyclic Graph (StateGraph)", "Strictly Linear Chain", "Directed Acyclic Graph (DAG) with no loops", "Binary Tree"], answer: 0, points: 10 },
        { id: "Q-AIML-030-03", type: "MCQ", prompt: "In tool calling, how does an LLM communicate to the hosting runtime that it wants to execute a tool?", options: ["By returning a structured `tool_calls` payload containing the tool name and validated JSON arguments", "By printing text to stdout", "By throwing an exception", "By opening a TCP socket"], answer: 0, points: 10 },
        { id: "Q-AIML-030-04", type: "MCQ", prompt: "What is 'Human-in-the-Loop' (HITL) in enterprise agent architectures?", options: ["Interrupting the agent graph before high-risk actions to require human confirmation or input before resuming state", "Having humans write all responses", "Using human voice audio", "Employing human data labelers"], answer: 0, points: 10 },
        { id: "Q-AIML-030-05", type: "MCQ", prompt: "What planning strategy prompts an agent to first generate a full multi-step plan before executing tools sequentially?", options: ["Plan-and-Solve (Plan-and-Execute)", "Zero-shot greedy search", "Random execution", "Teacher forcing"], answer: 0, points: 10 },
        { id: "Q-AIML-030-06", type: "MCQ", prompt: "What pattern structures multi-agent collaboration with a centralized supervisor agent delegating tasks to worker agents?", options: ["Supervisor / Hierarchical Multi-Agent Pattern", "Peer-to-peer flooding", "Round robin", "Single prompt chain"], answer: 0, points: 10 },
        { id: "Q-AIML-030-07", type: "MCQ", prompt: "What feature in LangGraph allows time-traveling, replaying past states, and inspecting execution histories?", options: ["Checkpointers (e.g. MemorySaver, SqliteSaver)", "Git commit logs", "Docker snapshots", "Python debugger"], answer: 0, points: 10 },
        { id: "Q-AIML-030-08", type: "MCQ", prompt: "How does an agent handle tool execution errors (e.g. invalid SQL syntax)?", options: ["The error message is returned into the conversation history as a ToolMessage, allowing the LLM to inspect the trace and self-correct", "The process immediately terminates", "The error is hidden from the model", "The system restarts"], answer: 0, points: 10 },
        { id: "Q-AIML-030-09", type: "MCQ", prompt: "What standard specification defines tool capabilities and parameter types for LLM function calling?", options: ["JSON Schema (OpenAPI Specification format)", "XML DTD", "SQL DDL", "Protobuf only"], answer: 0, points: 10 },
        { id: "Q-AIML-030-10", type: "MCQ", prompt: "What is an autonomous agent loop recursion limit guard?", options: ["A maximum iteration counter that halts execution if an agent gets trapped in infinite cyclic tool loops", "A GPU memory limit", "A network bandwidth cap", "A token rate limiter"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-031",
      title: "LLM Observability & Evaluation Assessment",
      chapterId: "CH-AIML-031",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-031-01", type: "MCQ", prompt: "What is 'LLM-as-a-Judge' in generative AI evaluation?", options: ["Using a powerful foundation model (e.g. GPT-4) prompted with rigorous rubrics to evaluate completions generated by target models", "An AI courtroom software", "A legal contract parser", "A model that writes court opinions"], answer: 0, points: 10 },
        { id: "Q-AIML-031-02", type: "MCQ", prompt: "What does the RAGAS metric 'Faithfulness' measure?", options: ["The degree to which claims in the generated answer are grounded strictly in the retrieved context", "The model's grammatical fluency", "The speed of response generation", "The length of the output"], answer: 0, points: 10 },
        { id: "Q-AIML-031-03", type: "MCQ", prompt: "What does the RAGAS metric 'Answer Relevance' measure?", options: ["How directly the generated response addresses the user's initial question without irrelevant padding", "Factual accuracy against external Wikipedia", "Vocabulary sophistication", "The number of citations"], answer: 0, points: 10 },
        { id: "Q-AIML-031-04", type: "MCQ", prompt: "What does the RAGAS metric 'Context Precision' evaluate?", options: ["Whether relevant chunks are prioritized at the top of retrieved candidate results", "The file size of documents", "The number of words in chunks", "The embedding dimension"], answer: 0, points: 10 },
        { id: "Q-AIML-031-05", type: "MCQ", prompt: "What observability tool from LangChain captures execution traces, latency, token costs, and tool calls in real time?", options: ["LangSmith (or Arize Phoenix)", "Prometheus standalone", "Grafana only", "Wireshark"], answer: 0, points: 10 },
        { id: "Q-AIML-031-06", type: "MCQ", prompt: "What open-source guardrail framework from NVIDIA applies programmable rails to guide LLM dialog and prevent policy violations?", options: ["NeMo Guardrails", "CUDA Toolkit", "DeepStream", "Triton"], answer: 0, points: 10 },
        { id: "Q-AIML-031-07", type: "MCQ", prompt: "What is 'Red Teaming' in generative AI security?", options: ["Systematically testing models with adversarial prompts, jailbreaks, and toxic edge cases to identify vulnerabilities before release", "Training models on red backgrounds", "A multi-agent team architecture", "Code profiling on Linux"], answer: 0, points: 10 },
        { id: "Q-AIML-031-08", type: "MCQ", prompt: "What metric calculates the time taken to generate the first token of a streaming response?", options: ["Time to First Token (TTFT)", "Tokens per Second (TPS)", "Inter-Token Latency (ITL)", "Round Trip Time (RTT)"], answer: 0, points: 10 },
        { id: "Q-AIML-031-09", type: "MCQ", prompt: "What is PII masking in production LLM gateways?", options: ["Automatically redacting sensitive entities like Social Security numbers, credit cards, and emails before sending text to external LLMs", "Encrypting disk drives", "Masking attention weights", "Deleting user sessions"], answer: 0, points: 10 },
        { id: "Q-AIML-031-10", type: "MCQ", prompt: "What evaluation bias occurs when an LLM judge favors longer, more verbose completions regardless of quality?", options: ["Verbosity Bias", "Self-Enhancement Bias", "Position Bias", "Bandwagon Bias"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-032",
      title: "Production LLM Serving & vLLM Assessment",
      chapterId: "CH-AIML-032",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-032-01", type: "MCQ", prompt: "What major memory bottleneck in LLM serving does PagedAttention resolve?", options: ["Internal and external memory fragmentation in the Key-Value (KV) cache", "Model weight storage on SSD", "Operating system swap space", "Tokenizer memory overhead"], answer: 0, points: 10 },
        { id: "Q-AIML-032-02", type: "MCQ", prompt: "How does PagedAttention manage KV cache memory on GPUs?", options: ["By partitioning the KV cache into non-contiguous fixed-size physical blocks managed via page tables, mirroring OS virtual memory", "By deleting half the keys", "By compressing vectors to 1 bit", "By running attention on CPU"], answer: 0, points: 10 },
        { id: "Q-AIML-032-03", type: "MCQ", prompt: "What batching technique in vLLM injects new incoming requests immediately at the token iteration level rather than waiting for an entire batch to complete?", options: ["Continuous (Iteration-level) Batching", "Static Batching", "Dynamic Batching", "Offline Batching"], answer: 0, points: 10 },
        { id: "Q-AIML-032-04", type: "MCQ", prompt: "What is Speculative Decoding in LLM inference?", options: ["A small fast draft model speculates K tokens, which are verified in parallel in a single forward pass by the large target model", "Guessing user prompts ahead of time", "Using random sampling", "Trading stocks with AI"], answer: 0, points: 10 },
        { id: "Q-AIML-032-05", type: "MCQ", prompt: "What inference engine from NVIDIA compiles models into optimized TensorRT engines with in-flight batching?", options: ["TensorRT-LLM", "Triton standalone", "CUDA Deep Neural Network (cuDNN)", "PyTorch Mobile"], answer: 0, points: 10 },
        { id: "Q-AIML-032-06", type: "MCQ", prompt: "What parallelism strategy splits attention heads across multiple GPUs on the same node to serve models larger than a single GPU's VRAM?", options: ["Tensor Parallelism (TP)", "Pipeline Parallelism (PP)", "Data Parallelism (DP)", "Expert Parallelism (EP)"], answer: 0, points: 10 },
        { id: "Q-AIML-032-07", type: "MCQ", prompt: "What parallelism strategy partitions model layers sequentially across different nodes or GPUs in a pipeline?", options: ["Pipeline Parallelism (PP)", "Tensor Parallelism (TP)", "Sequence Parallelism", "Sharded DDP"], answer: 0, points: 10 },
        { id: "Q-AIML-032-08", type: "MCQ", prompt: "What metric measures the generation throughput of an LLM serving cluster?", options: ["Tokens per Second (TPS)", "FLOPs per second", "Frames per second", "Megabits per second"], answer: 0, points: 10 },
        { id: "Q-AIML-032-09", type: "MCQ", prompt: "What API standard does vLLM support out of the box to allow seamless client library compatibility?", options: ["OpenAI Chat Completions REST API (/v1/chat/completions)", "SOAP XML", "GraphQL only", "gRPC exclusive"], answer: 0, points: 10 },
        { id: "Q-AIML-032-10", type: "MCQ", prompt: "What is 'prefix caching' (prompt caching) in vLLM?", options: ["Reusing the pre-computed KV cache of shared system prompts or few-shot examples across multiple user queries", "Storing prompts in browser cookies", "Caching model weights on disk", "Auto-completing user text"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-033",
      title: "Enterprise Multi-Modal Capstone Assessment",
      chapterId: "CH-AIML-033",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-033-01", type: "MCQ", prompt: "In a production multi-modal GenAI system, how should scanned documents with charts and complex tables be ingested?", options: ["Using Vision-Language Models (e.g. ColPali, Llama-3.2-Vision) that process document images directly, capturing visual layout and typography", "Using basic OCR text extractors that lose spatial tables", "Discarding all images", "Converting PDFs to raw ASCII strings"], answer: 0, points: 10 },
        { id: "Q-AIML-033-02", type: "MCQ", prompt: "Why is hybrid retrieval essential when building an enterprise financial assistant?", options: ["It ensures high recall for semantic concepts while matching exact balance sheet numbers, ticker symbols, and accounting codes via BM25", "It eliminates the need for vector databases", "It reduces GPU requirements to zero", "It allows unquantized models to run on phones"], answer: 0, points: 10 },
        { id: "Q-AIML-033-03", type: "MCQ", prompt: "How should real-time database queries be integrated into the assistant's workflow safely?", options: ["Via read-only SQL tool endpoints executed in an isolated sandbox with parameter binding, governed by LangGraph validation nodes", "Giving the LLM root admin credentials to the production database", "Running raw user-generated SQL directly", "Writing database contents to context window"], answer: 0, points: 10 },
        { id: "Q-AIML-033-04", type: "MCQ", prompt: "What mechanism ensures enterprise data governance when indexing multi-tenant documentation?", options: ["Metadata filtering by user tenant_id and department access control list (ACL) at query time", "Training a separate model per employee", "Storing everything in public S3 buckets", "Hashing all words"], answer: 0, points: 10 },
        { id: "Q-AIML-033-05", type: "MCQ", prompt: "What automated metric tracks whether the assistant's financial summaries contain ungrounded hallucinations?", options: ["RAGAS Faithfulness score against retrieved document excerpts", "User thumbs up clicks only", "Token generation speed", "ROUGE-1 score"], answer: 0, points: 10 },
        { id: "Q-AIML-033-06", type: "MCQ", prompt: "What is the recommended serving stack for low-latency concurrent enterprise deployment?", options: ["vLLM with PagedAttention and continuous batching running on a GPU cluster", "Standard Hugging Face pipeline in Flask with single-threaded workers", "Running models locally on user laptops", "Calling public free endpoints"], answer: 0, points: 10 },
        { id: "Q-AIML-033-07", type: "MCQ", prompt: "How should high-risk actions (e.g. initiating fund transfers or modifying HR records) be handled in LangGraph?", options: ["Routing through an interrupt node that pauses execution until an authenticated human manager approves the action", "Executing automatically without logs", "Deleting the request", "Asking the user to repeat the command 3 times"], answer: 0, points: 10 },
        { id: "Q-AIML-033-08", type: "MCQ", prompt: "What caching strategy prevents redundant computation when thousands of enterprise users ask questions sharing the same company handbook?", options: ["Prompt Prefix KV caching in vLLM", "Browser cache only", "Static HTML generation", "Disabling attention"], answer: 0, points: 10 },
        { id: "Q-AIML-033-09", type: "MCQ", prompt: "How should the system respond if no retrieved context passes the minimum relevance threshold for a given query?", options: ["Politely state that the information is unavailable in verified corporate records, refusing to hallucinate an answer", "Invent plausible facts", "Quote random Wikipedia articles", "Throw an unhandled HTTP 500 error"], answer: 0, points: 10 },
        { id: "Q-AIML-033-10", type: "MCQ", prompt: "What documentation must accompany an enterprise AI capstone to satisfy model governance requirements?", options: ["A comprehensive Model Card detailing training datasets, evaluation benchmarks, known failure modes, and security guardrails", "A GitHub stars badge only", "The source code license only", "A marketing slide"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-034",
      title: "AI / ML Engineering Career Mastery Assessment",
      chapterId: "CH-AIML-034",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-034-01", type: "MCQ", prompt: "When asked in a staff AI system design interview to estimate GPU memory for serving a 70B parameter model in FP16, what is the weight footprint?", options: ["140 GB (70B * 2 bytes per parameter) before KV cache and activation overhead", "70 GB", "280 GB", "35 GB"], answer: 0, points: 10 },
        { id: "Q-AIML-034-02", type: "MCQ", prompt: "What is the recommended opening approach when presented with a complex open-ended AI system design interview question?", options: ["Clarify requirements, scope, target SLAs (p99 latency, throughput), data volume, and hardware cost constraints", "Immediately write PyTorch code on the whiteboard", "State that you will use GPT-4 without clarifying needs", "Propose fine-tuning a 400B model without asking questions"], answer: 0, points: 10 },
        { id: "Q-AIML-034-03", type: "MCQ", prompt: "What trade-off between RAG and Fine-Tuning should an AI architect articulate during technical interviews?", options: ["RAG excels at dynamic factual retrieval and provenance with zero retraining; Fine-tuning excels at teaching specialized style, syntax, and task format", "Fine-tuning is always superior to RAG", "RAG cannot use LLMs", "Fine-tuning eliminates hallucinations completely"], answer: 0, points: 10 },
        { id: "Q-AIML-034-04", type: "MCQ", prompt: "How do you calculate the memory required for the KV cache per token for a Transformer with L layers, H heads, and dimension d_k?", options: ["Memory = 2 * 2 * L * H * d_k bytes (factor of 2 for FP16, and 2 for Keys and Values)", "Memory = L * H bytes", "Memory = d_k * 4 bytes", "Memory is constant 0 bytes"], answer: 0, points: 10 },
        { id: "Q-AIML-034-05", type: "MCQ", prompt: "What project distinguishes an elite AI engineering portfolio from standard candidate submissions?", options: ["A complete end-to-end production pipeline: fine-tuned open model with QLoRA, hybrid RAG with reranking, deployed on vLLM with Docker and live tracing", "A cloned generic tutorial notebook", "A 1-page paper summary", "A basic API wrapper with 20 lines of code"], answer: 0, points: 10 },
        { id: "Q-AIML-034-06", type: "MCQ", prompt: "What is Time to First Token (TTFT) versus Inter-Token Latency (ITL)?", options: ["TTFT is latency until generation begins (prefill phase); ITL is the time per generated token thereafter (decoding phase)", "TTFT applies to images; ITL to text", "They are identical metrics", "TTFT measures training time"], answer: 0, points: 10 },
        { id: "Q-AIML-034-07", type: "MCQ", prompt: "What is 'Catastrophic Forgetting' when fine-tuning deep neural networks?", options: ["The network abruptly loses previously learned capabilities across general tasks when aggressively trained on a narrow downstream dataset", "A permanent hardware memory failure", "The model weights diverging to NaN", "Deleting training logs"], answer: 0, points: 10 },
        { id: "Q-AIML-034-08", type: "MCQ", prompt: "How does speculative decoding improve decode throughput without modifying output probability distributions?", options: ["The draft model proposes tokens rapidly, and the main model verifies them with exact acceptance probability matching target distribution", "By guessing random words", "By quantizing the model to 1-bit", "By generating only single-word answers"], answer: 0, points: 10 },
        { id: "Q-AIML-034-09", type: "MCQ", prompt: "What answer demonstrates senior commercial acumen when evaluating whether to adopt an open-weights model versus proprietary API?", options: ["A quantitative total-cost-of-ownership (TCO) analysis comparing API cost per million tokens against GPU cloud hosting, data privacy requirements, and SLA guarantees", "Claiming open source is always free", "Claiming APIs are always better", "Refusing to use commercial cloud providers"], answer: 0, points: 10 },
        { id: "Q-AIML-034-10", type: "MCQ", prompt: "What is the defining characteristic of a world-class AI/ML Engineer?", options: ["Rigorous scientific curiosity paired with deep mathematical comprehension, high-performance systems engineering discipline, and a focus on measurable value", "Memorizing API parameter names", "Using the largest possible model for every task", "Writing code without automated unit tests"], answer: 0, points: 10 },
      ]
    }
  ]
};

