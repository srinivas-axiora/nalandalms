// Phase 3: Sequential Modeling, NLP & The Transformer Revolution (Chapters 14 to 19) - AI / Machine Learning
// World-class curriculum: Zero to employable master.

export const phase3 = {
  chapters: [
    // ── Chapter 14 ──
    {
      id: "CH-AIML-014",
      courseId: "CRS-AIML-001",
      sequence: 14,
      title: "Text Preprocessing, Subword Tokenization & Continuous Embeddings",
      description: "Byte-Pair Encoding (BPE), WordPiece, SentencePiece, distributed representations (Distributional Hypothesis), Word2Vec Skip-Gram with Negative Sampling, and GloVe.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Sequential Modeling & Transformers • Chapter 14</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Text Preprocessing, Subword Tokenization & Continuous Embeddings</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Computers cannot read human natural language directly; text must be discretized into numerical tokens and projected into continuous high-dimensional geometric spaces. We examine the evolution from sparse bag-of-words to subword tokenization (BPE) and dense distributed embeddings.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/zJW57aCBClk" title="Word2Vec and Embeddings Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Subword Tokenization: Byte-Pair Encoding (BPE)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Word-level vocabularies suffer from out-of-vocabulary (OOV) tokens on unseen words, while character-level models produce unwieldy long sequences. BPE merges the most frequent adjacent byte or character pairs iteratively, constructing a compact vocabulary that represents common words intact while decomposing rare words into intelligible subwords (e.g. <code>un+believ+able</code>).</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Word2Vec: Skip-Gram with Negative Sampling</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Given a center word \\(w_t\\), Skip-Gram maximizes the probability of predicting context words \\(w_{t+j}\\). To avoid calculating the prohibitively expensive global softmax denominator across 500,000 vocabulary words, Negative Sampling reformulates training as binary logistic classification:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathcal{L} = \\log \\sigma(\\mathbf{v}'_{w_O}^T \\mathbf{v}_{w_I}) + \\sum_{i=1}^K \\mathbb{E}_{w_i \\sim P_n(w)} \\big[ \\log \\sigma(-\\mathbf{v}'_{w_i}^T \\mathbf{v}_{w_I}) \\big]$$
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Modern LLMs (GPT-4, Llama 3) utilize byte-level Byte-Pair Encoding (BPE) or SentencePiece with 32k-128k vocabulary sizes.</li>
      <li>Word embeddings capture rich linear semantic relationships (e.g. \\(\\vec{v}_{\\text{King}} - \\vec{v}_{\\text{Man}} + \\vec{v}_{\\text{Woman}} \\approx \\vec{v}_{\\text{Queen}}\\)).</li>
      <li>PyTorch's <code>nn.Embedding(vocab_size, embedding_dim)</code> operates as a high-speed pointer lookup table directly retrieving vector rows.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 15 ──
    {
      id: "CH-AIML-015",
      courseId: "CRS-AIML-001",
      sequence: 15,
      title: "Recurrent Neural Networks (RNN) & Vanishing Gradients",
      description: "Recurrent hidden state transitions, Backpropagation Through Time (BPTT), exploding gradients, gradient clipping, and the theoretical limits of simple recurrence.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Sequential Modeling & Transformers • Chapter 15</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Recurrent Neural Networks (RNN) & Vanishing Gradients</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Sequential data—such as natural sentences, financial stock ticks, and speech audio—possesses variable lengths and temporal dependencies. Standard feed-forward networks cannot maintain temporal state. We study vanilla Recurrent Neural Networks and dissect why their gradient dynamics break down over long sequences.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/LHXXI4-IEns" title="Recurrent Neural Networks (RNN) Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Mathematical Formulation of Simple Recurrence</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">At time step \\(t\\), the hidden state \\(\\mathbf{h}_t\\) is updated using current input \\(\\mathbf{x}_t\\) and previous state \\(\\mathbf{h}_{t-1}\\):</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathbf{h}_t = \\tanh\\big(\\mathbf{W}_{hh} \\mathbf{h}_{t-1} + \\mathbf{W}_{xh} \\mathbf{x}_t + \\mathbf{b}_h\\big)$$
  </div>
  <p style="font-size:14px;color:#475569;">During Backpropagation Through Time (BPTT), computing \\(\\frac{\\partial \\mathcal{L}_T}{\\partial \\mathbf{h}_1}\\) involves an iterative product of Jacobian matrices: \\(\\prod_{j=2}^T \\frac{\\partial \\mathbf{h}_j}{\\partial \\mathbf{h}_{j-1}}\\). If the largest eigenvalue of \\(\\mathbf{W}_{hh}\\) is \\(< 1\\), gradients vanish exponentially to zero. If \\(> 1\\), gradients explode exponentially to infinity.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Vanilla RNNs cannot retain context beyond ~10-15 time steps due to vanishing gradients in unrolled computational graphs.</li>
      <li>Exploding gradients can be mitigated via Gradient Norm Clipping: <code>torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)</code>.</li>
      <li>Overcoming vanishing gradients required gating architectures: LSTM and GRU.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 16 ──
    {
      id: "CH-AIML-016",
      courseId: "CRS-AIML-001",
      sequence: 16,
      title: "Long Short-Term Memory (LSTM) & Gated Recurrent Units (GRU)",
      description: "Cell state highway, Forget Gate, Input Gate, Candidate Value, Output Gate, constant error carousel mechanics, and parameter-efficient GRU architectures.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Sequential Modeling & Transformers • Chapter 16</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Long Short-Term Memory (LSTM) & Gated Recurrent Units (GRU)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Hochreiter & Schmidhuber revolutionized sequence modeling with the Long Short-Term Memory (LSTM) network. By introducing an uninterrupted linear cell state highway governed by multiplicative gates, LSTMs bridge long-range temporal dependencies spanning hundreds of steps.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/8HyCNIVRbSU" title="LSTM Networks Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The 4 Gate Equations of LSTM</h2>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:15px;color:#1e293b;line-height:1.8;">
    <p><strong>1. Forget Gate:</strong> Decides what information to discard from cell state: $$\\mathbf{f}_t = \\sigma(\\mathbf{W}_f [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_f)$$</p>
    <p><strong>2. Input Gate & Candidate State:</strong> Decides what new information to store: $$\\mathbf{i}_t = \\sigma(\\mathbf{W}_i [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_i), \\quad \\tilde{\\mathbf{C}}_t = \\tanh(\\mathbf{W}_c [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_c)$$</p>
    <p><strong>3. Cell State Update:</strong> Linear additive highway (Constant Error Carousel): $$\\mathbf{C}_t = \\mathbf{f}_t \\odot \\mathbf{C}_{t-1} + \\mathbf{i}_t \\odot \\tilde{\\mathbf{C}}_t$$</p>
    <p><strong>4. Output Gate & Hidden State:</strong> Filtered output projection: $$\\mathbf{o}_t = \\sigma(\\mathbf{W}_o [\\mathbf{h}_{t-1}, \\mathbf{x}_t] + \\mathbf{b}_o), \\quad \\mathbf{h}_t = \\mathbf{o}_t \\odot \\tanh(\\mathbf{C}_t)$$</p>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>The cell state \\(\\mathbf{C}_t\\) acts as an additive gradient highway, eliminating the multiplicative Jacobian collapse of vanilla RNNs.</li>
      <li>Gated Recurrent Units (GRU) merge cell state and hidden state, using only two gates (Reset and Update) for 25% faster training.</li>
      <li>Despite their power, recurrent architectures remain strictly sequential (\\(\\mathcal{O}(T)\\)), preventing parallelization across GPU cores.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 17 ──
    {
      id: "CH-AIML-017",
      courseId: "CRS-AIML-001",
      sequence: 17,
      title: "Sequence-to-Sequence Modeling & Bahdanau Additive Attention",
      description: "Encoder-Decoder architectures for machine translation, the fixed-length vector bottleneck, dynamic context vectors, and alignment score mathematics.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Sequential Modeling & Transformers • Chapter 17</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Sequence-to-Sequence Modeling & Bahdanau Additive Attention</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Early Seq2Seq models compressed an entire source sentence—regardless of whether it had 5 words or 80 words—into a single fixed-length bottleneck vector \\(\\mathbf{h}_T\\). Bahdanau et al. (2014) introduced the attention mechanism, allowing the decoder to selectively look back across all encoder hidden states dynamically.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/fjJOgb-E41w" title="Seq2Seq Attention Mechanism" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Bahdanau Alignment & Context Vector Computation</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Given decoder hidden state \\(\\mathbf{s}_{i-1}\\) and encoder states \\(\\mathbf{h}_j\\), the alignment score and dynamic context vector \\(\\mathbf{c}_i\\) are computed via:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$e_{ij} = \\mathbf{v}_a^T \\tanh\\big(\\mathbf{W}_a \\mathbf{s}_{i-1} + \\mathbf{U}_a \\mathbf{h}_j\\big)$$
    $$\\alpha_{ij} = \\frac{\\exp(e_{ij})}{\\sum_k \\exp(e_{ik})}, \\quad \\mathbf{c}_i = \\sum_j \\alpha_{ij} \\mathbf{h}_j$$
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Attention liberated neural networks from the fixed-length vector bottleneck, allowing direct reference to source words during translation.</li>
      <li>Attention weights \\(\\alpha_{ij}\\) provide native interpretability, showing exactly which input tokens the model focused on when generating each word.</li>
      <li>This breakthrough led Vaswani et al. to ask: What if we discard recurrence entirely and use attention exclusively?</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 18 ──
    {
      id: "CH-AIML-018",
      courseId: "CRS-AIML-001",
      sequence: 18,
      title: "The Transformer Revolution: 'Attention Is All You Need' Deep Dive",
      description: "Why Transformers replaced RNNs, encoder-decoder architecture blueprint, residual stream highway, feed-forward sub-layers, and sinusoidal positional encodings.",
      contentType: "Rich Text",
      durationMinutes: 60,
      minimumTimeMinutes: 30,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Sequential Modeling & Transformers • Chapter 18</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">The Transformer Revolution: "Attention Is All You Need"</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In 2017, Vaswani et al. published "Attention Is All You Need", introducing the Transformer. By dispensing with recurrence entirely, Transformers enabled full sequence parallelization during training, unlocking the scaling laws that power today's Large Language Models.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/bQ5BoolX9Ag" title="Transformer Neural Networks Illustrated" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Recurrent vs Transformer Computational Complexity</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Architecture</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Complexity per Layer</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Sequential Operations</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Maximum Path Length</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Recurrent (RNN/LSTM)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">\\(\\mathcal{O}(n \\cdot d^2)\\)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">\\(\\mathcal{O}(n)\\) (Sequential loop)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">\\(\\mathcal{O}(n)\\)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Self-Attention (Transformer)</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">\\(\\mathcal{O}(n^2 \\cdot d)\\)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">\\(\\mathcal{O}(1)\\) (Fully parallel)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">\\(\\mathcal{O}(1)\\)</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Sinusoidal Positional Encoding</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Because self-attention is permutation-invariant, positional encodings must be injected into input embeddings to represent token order:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right), \\quad PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)$$
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Transformers trade quadratic sequence length complexity \\(\\mathcal{O}(N^2)\\) for \\(\\mathcal{O}(1)\\) sequential time, enabling training on clusters of thousands of GPUs.</li>
      <li>Maximum path length between any two tokens in a Transformer is \\(\\mathcal{O}(1)\\), completely resolving vanishing gradients across long texts.</li>
      <li>Every sub-layer features a residual connection followed by Layer Normalization: \\(\\text{LayerNorm}(x + \\text{Sublayer}(x))\\).</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 19 ──
    {
      id: "CH-AIML-019",
      courseId: "CRS-AIML-001",
      sequence: 19,
      title: "Scaled Dot-Product & Multi-Head Self-Attention Mathematics",
      description: "Query, Key, Value tensor projections, scaling factor sqrt(d_k), causal attention masking for autoregressive decoding, and Multi-Head projection geometry.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Sequential Modeling & Transformers • Chapter 19</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Scaled Dot-Product & Multi-Head Self-Attention Mathematics</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Multi-Head Attention is the mathematical heart of the Transformer. By allowing the model to jointly attend to information from different representation subspaces at different positions, the network learns syntactic parsing, coreference resolution, and semantic relationships simultaneously.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/eMlx5fFNoYc" title="Self-Attention and Transformers 3Blue1Brown" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Scaled Dot-Product Attention Equation</h2>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left( \\frac{\\mathbf{Q} \\mathbf{K}^T}{\\sqrt{d_k}} + \\mathbf{M} \\right) \\mathbf{V}$$
  </div>
  <ul style="font-size:14px;color:#475569;line-height:1.8;">
    <li><strong>Queries (\\(\\mathbf{Q}\\)):</strong> What each token is searching for.</li>
    <li><strong>Keys (\\(\\mathbf{K}\\)):</strong> What each token offers / contains.</li>
    <li><strong>Values (\\(\\mathbf{V}\\)):</strong> The actual contextual representation extracted.</li>
    <li><strong>\\(\\frac{1}{\\sqrt{d_k}}\\) Scaling:</strong> Prevents dot products from growing large in high dimensions, which would push softmax into regions with vanishingly small gradients.</li>
    <li><strong>Causal Mask (\\(\\mathbf{M}\\)):</strong> Upper-triangular matrix set to \\(-\\infty\\) to prevent autoregressive decoders from looking into future tokens.</li>
  </ul>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Multi-Head Attention in PyTorch</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import torch
import torch.nn as nn
import math

class SelfAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
        
    def forward(self, x, mask=None):
        B, S, D = x.shape
        # Project and reshape into [Batch, Heads, Sequence, d_k]
        q = self.q_proj(x).view(B, S, self.n_heads, self.d_k).transpose(1, 2)
        k = self.k_proj(x).view(B, S, self.n_heads, self.d_k).transpose(1, 2)
        v = self.v_proj(x).view(B, S, self.n_heads, self.d_k).transpose(1, 2)
        
        # Compute scaled scores: [B, H, S, S]
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
            
        attn_weights = torch.softmax(scores, dim=-1)
        out = torch.matmul(attn_weights, v) # [B, H, S, d_k]
        
        # Concatenate heads and project output
        out = out.transpose(1, 2).contiguous().view(B, S, D)
        return self.out_proj(out)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Multi-Head Attention splits embedding dimension \\(d_{model}\\) across \\(h\\) independent attention heads, running in parallel.</li>
      <li>Modern hardware-accelerated attention engines (<strong>FlashAttention-2</strong>) fuse the softmax and matrix multiplications to avoid materializing the \\(N \\times N\\) attention matrix in high-bandwidth memory.</li>
      <li>Causal attention masks ensure that token \\(i\\) can only attend to positions \\(\\le i\\) during generative language modeling.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-AIML-014",
      title: "Text Preprocessing & Embeddings Assessment",
      chapterId: "CH-AIML-014",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-014-01", type: "MCQ", prompt: "What is the primary advantage of Byte-Pair Encoding (BPE) subword tokenization over word-level tokenization?", options: ["It resolves the out-of-vocabulary (OOV) problem by decomposing rare or unseen words into recognizable subword units", "It reduces dataset size by 99%", "It removes the need for deep learning", "It works only on ASCII"], answer: 0, points: 10 },
        { id: "Q-AIML-014-02", type: "MCQ", prompt: "What foundational linguistic principle states that words occurring in similar contexts share similar semantic meanings?", options: ["The Distributional Hypothesis (Firth: 'You shall know a word by the company it keeps')", "Chomsky's Universal Grammar", "Zipf's Law", "Shannon's Channel Capacity"], answer: 0, points: 10 },
        { id: "Q-AIML-014-03", type: "MCQ", prompt: "What objective does the Word2Vec Skip-Gram model optimize?", options: ["Predicting surrounding context words given a central target word", "Predicting the center word from surrounding words (CBOW)", "Predicting the next sentence", "Compressing text files"], answer: 0, points: 10 },
        { id: "Q-AIML-014-04", type: "MCQ", prompt: "Why is Negative Sampling utilized in Word2Vec training instead of standard full Softmax?", options: ["To replace the computationally prohibitive sum over the full vocabulary (O(|V|)) with logistic classification over K negative samples", "To remove negative words from the corpus", "To filter profanity", "To improve GPU cooling"], answer: 0, points: 10 },
        { id: "Q-AIML-014-05", type: "MCQ", prompt: "What vector arithmetic relationship famously demonstrated the semantic linearity of Word2Vec embeddings?", options: ["v('King') - v('Man') + v('Woman') ≈ v('Queen')", "v('Apple') + v('Banana') = v('Fruit')", "v('Fast') * 2 = v('Faster')", "v('Dog') - v('Bark') = v('Cat')"], answer: 0, points: 10 },
        { id: "Q-AIML-014-06", type: "MCQ", prompt: "What global matrix factorization model combines local context window benefits with global co-occurrence statistics?", options: ["GloVe (Global Vectors for Word Representation)", "Word2Vec", "TF-IDF", "FastText"], answer: 0, points: 10 },
        { id: "Q-AIML-014-07", type: "MCQ", prompt: "What tokenizer library from Google treats whitespace as a normal character, enabling language-agnostic tokenization?", options: ["SentencePiece", "NLTK", "Spacy", "RegexTokenizer"], answer: 0, points: 10 },
        { id: "Q-AIML-014-08", type: "MCQ", prompt: "How does FastText improve upon Word2Vec when encountering morphologically rich languages?", options: ["By representing each word as a bag of character n-grams, enabling embeddings for out-of-vocabulary compounds", "By using deep transformers", "By skipping tokenization", "By using UTF-16 encoding"], answer: 0, points: 10 },
        { id: "Q-AIML-014-09", type: "MCQ", prompt: "What is the function of `torch.nn.Embedding(vocab_size, d_model)` in PyTorch?", options: ["A trainable lookup table that maps discrete token indices directly to dense continuous vector rows", "An image convolutional filter", "A loss function", "A text scraper"], answer: 0, points: 10 },
        { id: "Q-AIML-014-10", type: "MCQ", prompt: "What is a major limitation of static word embeddings (Word2Vec, GloVe) resolved by modern contextual models?", options: ["They assign a single fixed vector per word, failing to handle polysemy (e.g. 'bank' as river bank vs financial bank)", "They are too fast", "They take up zero RAM", "They cannot run on Linux"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-015",
      title: "Recurrent Neural Networks (RNN) Assessment",
      chapterId: "CH-AIML-015",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-015-01", type: "MCQ", prompt: "What parameter sharing mechanism enables Recurrent Neural Networks to process variable-length sequential inputs?", options: ["Reusing the identical transition weight matrices W_hh and W_xh across every time step", "Using a single linear layer with dynamic padding", "Resetting weights to zero every step", "Running parallel threads"], answer: 0, points: 10 },
        { id: "Q-AIML-015-02", type: "MCQ", prompt: "What algorithm trains RNNs by unrolling the computational graph across time steps and applying backpropagation?", options: ["Backpropagation Through Time (BPTT)", "Forward Euler method", "Q-Learning", "Contrastive Divergence"], answer: 0, points: 10 },
        { id: "Q-AIML-015-03", type: "MCQ", prompt: "Why do vanilla RNNs suffer severely from vanishing gradients when unrolled over long sequences?", options: ["Repeated matrix multiplications of W_hh across time steps cause gradient magnitudes to diminish exponentially if spectral radius < 1", "Floating point operations are too slow", "Tanh derivatives exceed 10.0", "Biases cancel out weights"], answer: 0, points: 10 },
        { id: "Q-AIML-015-04", type: "MCQ", prompt: "What technique clips gradient vectors when their L2 norm exceeds a maximum threshold to prevent exploding gradients?", options: ["Gradient Norm Clipping", "Weight Decay", "Dropout", "BatchNorm"], answer: 0, points: 10 },
        { id: "Q-AIML-015-05", type: "MCQ", prompt: "What activation function is conventionally used for hidden state transitions in vanilla RNNs?", options: ["Tanh (Hyperbolic Tangent)", "ReLU", "Sigmoid", "Linear"], answer: 0, points: 10 },
        { id: "Q-AIML-015-06", type: "MCQ", prompt: "What variation of BPTT splits long sequences into smaller temporal windows to bound memory usage?", options: ["Truncated BPTT", "Mini-BPTT", "Windowed Gradient Descent", "Chunked Backprop"], answer: 0, points: 10 },
        { id: "Q-AIML-015-07", type: "MCQ", prompt: "In a bidirectional RNN (BiRNN), how are outputs generated for each time step?", options: ["By concatenating hidden states from both a forward-running RNN and an independent backward-running RNN", "By running the network twice on the same text", "By reversing the vocabulary", "By taking the mean of weights"], answer: 0, points: 10 },
        { id: "Q-AIML-015-08", type: "MCQ", prompt: "What is a primary hardware bottleneck when training recurrent architectures on modern GPUs?", options: ["Inability to parallelize operations across time steps due to sequential dependency on h_(t-1)", "Excessive VRAM requirements for small models", "Lack of float support", "Bus congestion"], answer: 0, points: 10 },
        { id: "Q-AIML-015-09", type: "MCQ", prompt: "What sequence-to-sequence configuration models tasks like sentiment analysis (variable text input to single classification output)?", options: ["Many-to-One", "One-to-Many (Image captioning)", "Many-to-Many (Translation)", "One-to-One"], answer: 0, points: 10 },
        { id: "Q-AIML-015-10", type: "MCQ", prompt: "What typical sequence length marks the effective upper bound of practical memory retention in simple vanilla RNNs?", options: ["~10 to 15 time steps", "1,000 steps", "100,000 steps", "Unlimited"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-016",
      title: "LSTM & GRU Gating Assessment",
      chapterId: "CH-AIML-016",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-016-01", type: "MCQ", prompt: "What component in an LSTM acts as an additive gradient highway, eliminating the vanishing gradient problem?", options: ["The Cell State (C_t)", "The Output Gate", "The Softmax layer", "The Bias vector"], answer: 0, points: 10 },
        { id: "Q-AIML-016-02", type: "MCQ", prompt: "What is the function of the Forget Gate (f_t) in an LSTM cell?", options: ["It uses a sigmoid function to decide what fraction of existing cell state information to retain versus erase (between 0 and 1)", "It deletes the model weights", "It drops out tokens at random", "It clears GPU cache"], answer: 0, points: 10 },
        { id: "Q-AIML-016-03", type: "MCQ", prompt: "What activation function squashes LSTM gate activations into the range [0, 1] for gating multipliers?", options: ["Sigmoid", "Tanh", "ReLU", "GELU"], answer: 0, points: 10 },
        { id: "Q-AIML-016-04", type: "MCQ", prompt: "What two gates exist in a Gated Recurrent Unit (GRU) compared to the four components of an LSTM?", options: ["Reset Gate and Update Gate", "Input Gate and Forget Gate", "Read Gate and Write Gate", "Open Gate and Close Gate"], answer: 0, points: 10 },
        { id: "Q-AIML-016-05", type: "MCQ", prompt: "What advantage does a GRU offer over a standard LSTM?", options: ["Fewer parameters and faster training throughput while achieving comparable empirical performance", "Ability to parallelize across time", "Elimination of backpropagation", "Lower loss guaranteed"], answer: 0, points: 10 },
        { id: "Q-AIML-016-06", type: "MCQ", prompt: "In PyTorch, what tuple of hidden tensors is returned by an `nn.LSTM` call at each step?", options: ["(hidden_state h_t, cell_state c_t)", "hidden_state only", "(loss, gradients)", "(weights, biases)"], answer: 0, points: 10 },
        { id: "Q-AIML-016-07", type: "MCQ", prompt: "What term describes the mathematical mechanism in LSTMs that preserves error signals without exponential decay over time?", options: ["Constant Error Carousel (CEC)", "Stochastic Gradient Loop", "Residual Feedback Loop", "Dynamic Momentum"], answer: 0, points: 10 },
        { id: "Q-AIML-016-08", type: "MCQ", prompt: "What happens if the forget gate bias b_f is initialized to a large positive value (e.g. +1.0 or +2.0) at the start of training?", options: ["The forget gate defaults to 1.0 (open), preventing premature forgetting of early historical context", "The model crashes with overflow", "All memory is wiped instantly", "Gradients vanish"], answer: 0, points: 10 },
        { id: "Q-AIML-016-09", type: "MCQ", prompt: "What is 'Peephole Connection' in specialized LSTM variants?", options: ["Connections that allow the gate layers to inspect the current cell state directly", "A camera debug module", "A network monitoring probe", "A visual inspection tool"], answer: 0, points: 10 },
        { id: "Q-AIML-016-10", type: "MCQ", prompt: "Why did the Transformer eventually replace LSTMs across almost all NLP benchmarks?", options: ["Transformers allow full sequence parallelization during training and have O(1) path length between tokens", "LSTMs cannot process English", "LSTMs only work on integers", "LSTMs are not differentiable"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-017",
      title: "Seq2Seq & Attention Assessment",
      chapterId: "CH-AIML-017",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-017-01", type: "MCQ", prompt: "What was the critical flaw of traditional Encoder-Decoder Seq2Seq models before the introduction of attention?", options: ["The entire source sentence had to be compressed into a single fixed-size context vector, causing severe performance drops on long sentences", "They could only translate 1 word", "They required identical input and output lengths", "They could not use backpropagation"], answer: 0, points: 10 },
        { id: "Q-AIML-017-02", type: "MCQ", prompt: "What is the role of the Attention Mechanism in sequence-to-sequence translation?", options: ["It computes a dynamic weighted sum across all encoder hidden states tailored to each specific decoder output step", "It translates text using a dictionary", "It speeds up CPU clock cycles", "It checks grammar rules"], answer: 0, points: 10 },
        { id: "Q-AIML-017-03", type: "MCQ", prompt: "What mathematical formulation defines Bahdanau Additive Attention alignment scores?", options: ["score(s_i, h_j) = v_a^T tanh(W_a s_i + U_a h_j)", "score(s_i, h_j) = s_i^T h_j (Dot product)", "score(s_i, h_j) = s_i^T W h_j (General Luong)", "score(s_i, h_j) = ||s_i - h_j||"], answer: 0, points: 10 },
        { id: "Q-AIML-017-04", type: "MCQ", prompt: "What activation function normalizes raw attention alignment scores into a probability distribution summing to 1.0?", options: ["Softmax", "Sigmoid", "ReLU", "Tanh"], answer: 0, points: 10 },
        { id: "Q-AIML-017-05", type: "MCQ", prompt: "What is the difference between 'Soft Attention' and 'Hard Attention'?", options: ["Soft attention is deterministic and differentiable using weighted sums; hard attention samples discrete tokens and requires reinforcement learning", "Soft attention runs on GPU only", "Hard attention has no weights", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-AIML-017-06", type: "MCQ", prompt: "What alignment function did Luong et al. introduce that is computationally simpler than Bahdanau additive attention?", options: ["Multiplicative / Dot-Product Attention: s_i^T W_a h_j", "Polynomial Attention", "Euclidean Distance Attention", "Cosine Loss"], answer: 0, points: 10 },
        { id: "Q-AIML-017-07", type: "MCQ", prompt: "What visual artifact is generated by plotting attention weights alpha_ij across source and target sentence words?", options: ["Alignment Heatmap Matrix showing cross-lingual word correspondences", "ROC curve", "Histogram", "Dendrogram"], answer: 0, points: 10 },
        { id: "Q-AIML-017-08", type: "MCQ", prompt: "What training technique feeds the actual ground-truth target token into the decoder at time t instead of the model's own predicted token?", options: ["Teacher Forcing", "Scheduled Sampling", "Reinforcement Learning", "Beam Search"], answer: 0, points: 10 },
        { id: "Q-AIML-017-09", type: "MCQ", prompt: "What heuristic decoding search algorithm maintains the top B most probable candidate hypotheses at each time step?", options: ["Beam Search", "Greedy Search", "Random Walk", "Monte Carlo"], answer: 0, points: 10 },
        { id: "Q-AIML-017-10", type: "MCQ", prompt: "What metric evaluates machine translation quality by measuring n-gram precision against human reference translations?", options: ["BLEU Score (Bilingual Evaluation Understudy)", "Perplexity", "ROUGE", "Accuracy"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-018",
      title: "The Transformer Architecture Assessment",
      chapterId: "CH-AIML-018",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-018-01", type: "MCQ", prompt: "What was the groundbreaking thesis of the paper 'Attention Is All You Need' (Vaswani et al., 2017)?", options: ["High-performance sequence models can be built entirely using attention mechanisms, discarding recurrence and convolutions completely", "Recurrent networks should be doubled in size", "Attention only works on image data", "Deep learning is obsolete"], answer: 0, points: 10 },
        { id: "Q-AIML-018-02", type: "MCQ", prompt: "Why do Transformers train significantly faster than LSTMs on massive text datasets?", options: ["Transformers process all sequence tokens simultaneously in parallel matrix operations (O(1) sequential depth)", "Transformers have no parameters", "Transformers use 8-bit integers only", "Transformers run on CPU exclusively"], answer: 0, points: 10 },
        { id: "Q-AIML-018-03", type: "MCQ", prompt: "Why are Positional Encodings strictly required in Transformer architectures?", options: ["Self-attention is permutation-invariant; without positional encodings the model cannot distinguish token order", "To pad sequences to fixed length", "To normalize vector magnitudes", "To compress vocabulary size"], answer: 0, points: 10 },
        { id: "Q-AIML-018-04", type: "MCQ", prompt: "What formula generates fixed sinusoidal positional encodings for even dimension indices 2i?", options: ["sin(pos / (10000^(2i / d_model)))", "cos(pos * 2i)", "tan(pos / d_model)", "pos / 10000"], answer: 0, points: 10 },
        { id: "Q-AIML-018-05", type: "MCQ", prompt: "What is the maximum path length between any two arbitrary tokens in a Transformer layer?", options: ["O(1) — direct constant-time interaction", "O(N) — linear distance", "O(N^2)", "O(log N)"], answer: 0, points: 10 },
        { id: "Q-AIML-018-06", type: "MCQ", prompt: "What standard sub-layers are contained within each Transformer Encoder block?", options: ["Multi-Head Self-Attention followed by a Position-wise Feed-Forward Network, each wrapped in Add & LayerNorm", "Convolution and MaxPool", "LSTM and GRU", "Linear and Sigmoid"], answer: 0, points: 10 },
        { id: "Q-AIML-018-07", type: "MCQ", prompt: "What is the typical inner hidden dimension of the Position-wise Feed-Forward Network relative to d_model?", options: ["4 times d_model (e.g. d_ff = 2048 for d_model = 512)", "Identical to d_model", "Half of d_model", "10 times d_model"], answer: 0, points: 10 },
        { id: "Q-AIML-018-08", type: "MCQ", prompt: "What difference distinguishes the Transformer Decoder block from the Encoder block?", options: ["The Decoder includes Masked Self-Attention and an extra Cross-Attention layer attending to encoder outputs", "The Decoder has no attention", "The Decoder uses convolutions", "The Decoder has no feed-forward network"], answer: 0, points: 10 },
        { id: "Q-AIML-018-09", type: "MCQ", prompt: "What is the computational complexity of standard Self-Attention with respect to sequence length N?", options: ["O(N^2 * d) — Quadratic in sequence length", "O(N * d)", "O(log N)", "O(d^2)"], answer: 0, points: 10 },
        { id: "Q-AIML-018-10", type: "MCQ", prompt: "What modern variant positions LayerNorm inside the residual stream before attention/FFN sub-layers (Pre-LN)?", options: ["Pre-LayerNorm (Pre-LN), providing superior training stability for very deep Transformers without warmups", "Post-LN", "No-LN", "Batch-LN"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-019",
      title: "Scaled Dot-Product & Multi-Head Attention Assessment",
      chapterId: "CH-AIML-019",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-019-01", type: "MCQ", prompt: "What is the complete mathematical formula for Scaled Dot-Product Attention?", options: ["Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V", "Attention(Q, K, V) = Q K V", "Attention(Q, K, V) = sigmoid(Q + K) V", "Attention(Q, K, V) = tanh(Q K^T) V"], answer: 0, points: 10 },
        { id: "Q-AIML-019-02", type: "MCQ", prompt: "Why is the dot product Q K^T scaled by 1 / sqrt(d_k)?", options: ["For large d_k, dot products grow large, pushing softmax into extreme regions with tiny gradients; scaling restores unit variance", "To convert dot products to integers", "To invert the matrix", "To normalize token lengths"], answer: 0, points: 10 },
        { id: "Q-AIML-019-03", type: "MCQ", prompt: "What is the role of a Causal Attention Mask in autoregressive Transformer decoders (e.g. GPT)?", options: ["Masking out future token positions with -infinity so softmax assigns them 0 probability, preserving autoregressive causality", "Hiding user private data", "Dropping out 10% of tokens", "Removing stop words"], answer: 0, points: 10 },
        { id: "Q-AIML-019-04", type: "MCQ", prompt: "How does Multi-Head Attention benefit representation learning compared to single-head attention?", options: ["It projects Q, K, V into h independent subspaces, allowing the model to attend to information at different positions from different aspects", "It duplicates weights h times", "It eliminates the need for feed-forward layers", "It reduces total parameter count"], answer: 0, points: 10 },
        { id: "Q-AIML-019-05", type: "MCQ", prompt: "In a Transformer with d_model = 512 and h = 8 heads, what is the dimension d_k of each individual head?", options: ["64 (512 / 8)", "128", "256", "512"], answer: 0, points: 10 },
        { id: "Q-AIML-019-06", type: "MCQ", prompt: "What memory-efficient exact attention algorithm computes softmax without materializing the large N x N matrix in GPU HBM?", options: ["FlashAttention (Tri Dao et al.)", "SparseAttention", "Linformer", "Reformer"], answer: 0, points: 10 },
        { id: "Q-AIML-019-07", type: "MCQ", prompt: "What attention variant shares a single Key and Value projection across multiple Query heads to save KV cache memory?", options: ["Grouped-Query Attention (GQA) / Multi-Query Attention (MQA)", "Cross-Attention", "Causal Attention", "Windowed Attention"], answer: 0, points: 10 },
        { id: "Q-AIML-019-08", type: "MCQ", prompt: "What modern relative positional encoding rotates Q and K vectors in 2D chunks using complex numbers?", options: ["RoPE (Rotary Position Embedding)", "ALiBi", "Sinusoidal PE", "Learnable Absolute PE"], answer: 0, points: 10 },
        { id: "Q-AIML-019-09", type: "MCQ", prompt: "What does 'Cross-Attention' attend to in an Encoder-Decoder Transformer?", options: ["Queries (Q) come from the Decoder, while Keys (K) and Values (V) come from the Encoder's final representations", "Q, K, V all come from the Decoder", "Q comes from text, K from image", "Q and K are swapped"], answer: 0, points: 10 },
        { id: "Q-AIML-019-10", type: "MCQ", prompt: "What is the shape of the attention weight matrix before multiplying by V for a sequence of length S?", options: ["[Batch, Heads, S, S]", "[Batch, S, d_model]", "[Batch, Heads, d_k, d_k]", "[Batch, S]"], answer: 0, points: 10 },
      ]
    }
  ]
};

