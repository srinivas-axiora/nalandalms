// Phase 1: Deep Learning Foundations & PyTorch 2.0 (Chapters 1 to 7) - AI / Machine Learning
// World-class curriculum: Zero to employable master.

export const phase1 = {
  chapters: [
    // ── Chapter 1 ──
    {
      id: "CH-AIML-001",
      courseId: "CRS-AIML-001",
      sequence: 1,
      title: "Neural Networks from Scratch: Perceptrons, Forward Propagation & Matrix Calculus",
      description: "Biological vs artificial neurons, Rosenblatt's perceptron, the XOR limitation, Multi-Layer Perceptrons (MLP), forward pass tensor equations, and vectorized activation matrices.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Deep Learning Foundations • Chapter 1</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Neural Networks from Scratch: Perceptrons & Forward Propagation</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Deep learning powers self-driving vehicles, generative language models, and superhuman game playing. Yet underneath sophisticated libraries lies linear algebra and multivariable calculus. In this chapter, you will construct a neural network from mathematical first principles without external deep learning frameworks.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/aircAruvnKk" title="Neural Networks 3Blue1Brown" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Vectorized Forward Propagation Equations</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">For a mini-batch of \\(N\\) inputs \\(\\mathbf{X} \\in \\mathbb{R}^{N \\times D_{in}}\\), each dense layer \\(l\\) computes affine linear projections followed by element-wise non-linear activations:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathbf{Z}^{[l]} = \\mathbf{A}^{[l-1]} \\mathbf{W}^{[l]} + \\mathbf{b}^{[l]}$$
    $$\\mathbf{A}^{[l]} = \\sigma\\big(\\mathbf{Z}^{[l]}\\big)$$
  </div>
  <p style="font-size:14px;color:#475569;">Where \\(\\mathbf{W}^{[l]} \\in \\mathbb{R}^{D_{in} \\times D_{out}}\\) represents the weight tensor, \\(\\mathbf{b}^{[l]} \\in \\mathbb{R}^{1 \\times D_{out}}\\) is the broadcasted bias vector, and \\(\\sigma\\) is a non-linear activation function.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Multi-Layer Perceptron in Pure NumPy</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))

class TwoLayerMLP:
    def __init__(self, input_dim, hidden_dim, output_dim):
        # He/Kaiming normal initialization
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros((1, hidden_dim))
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros((1, output_dim))
        
    def forward(self, X):
        self.Z1 = np.dot(X, self.W1) + self.b1
        self.A1 = np.maximum(0, self.Z1) # ReLU activation
        self.Z2 = np.dot(self.A1, self.W2) + self.b2
        self.A2 = sigmoid(self.Z2)      # Output probability
        return self.A2</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>A single-layer perceptron can only separate linearly separable problems; solving XOR requires at least one non-linear hidden layer.</li>
      <li>Without non-linear activation functions, stacking multiple dense layers collapses mathematically into a single linear transformation: \\(\\mathbf{W}_2(\\mathbf{W}_1 \\mathbf{X}) = \\mathbf{W}_{net} \\mathbf{X}\\).</li>
      <li>Vectorizing operations across mini-batches leverages SIMD CPU vector extensions and GPU streaming multiprocessors.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 2 ──
    {
      id: "CH-AIML-002",
      courseId: "CRS-AIML-001",
      sequence: 2,
      title: "Backpropagation, Computational Graphs & Automatic Differentiation",
      description: "The multivariable chain rule, reverse-mode automatic differentiation, computing analytic gradients of weights and biases, gradient flow bottlenecks, and vanishing gradients.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Deep Learning Foundations • Chapter 2</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Backpropagation, Computational Graphs & Automatic Differentiation</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Backpropagation is the computational engine of modern artificial intelligence. By interpreting forward evaluation as a Directed Acyclic Graph (DAG) and propagating partial derivatives backwards via the chain rule, we compute exact parameter gradients in a single backward pass.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/Ilg3gGewQ5U" title="Backpropagation Calculus 3Blue1Brown" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Reverse-Mode Automatic Differentiation Mechanics</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Given a scalar loss \\(\\mathcal{L}\\), the gradient with respect to hidden layer pre-activation \\(\\mathbf{Z}^{[l]}\\) is calculated recursively:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathbf{dZ}^{[l]} = \\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{Z}^{[l]}} = \\mathbf{dA}^{[l]} \\odot \\sigma'\\big(\\mathbf{Z}^{[l]}\\big)$$
    $$\\mathbf{dW}^{[l]} = \\frac{1}{N} \\big(\\mathbf{A}^{[l-1]}\\big)^T \\mathbf{dZ}^{[l]}$$
    $$\\mathbf{db}^{[l]} = \\frac{1}{N} \\sum_{i=1}^N \\mathbf{dZ}_i^{[l]}$$
    $$\\mathbf{dA}^{[l-1]} = \\mathbf{dZ}^{[l]} \\big(\\mathbf{W}^{[l]}\\big)^T$$
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Reverse-mode automatic differentiation computes gradients for millions of parameters in \\(\\mathcal{O}(1)\\) complexity relative to the forward pass.</li>
      <li>Forward-mode autodiff scales poorly with high parameter counts (\\(\\mathcal{O}(P)\\)), making reverse-mode the industry standard for deep networks.</li>
      <li>Saving intermediate activations during the forward pass is mandatory to evaluate backward derivatives, dictating GPU memory requirements during training.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 3 ──
    {
      id: "CH-AIML-003",
      courseId: "CRS-AIML-001",
      sequence: 3,
      title: "PyTorch 2.0 Core: Tensors, CUDA Acceleration & Dynamic Graphs",
      description: "Tensor striding, contiguous memory, GPU memory transfers (`to(device)`), CUDA asynchronous execution, dynamic computation graphs, and PyTorch 2.0 `torch.compile` speedups.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Deep Learning Foundations • Chapter 3</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">PyTorch 2.0 Core: Tensors, CUDA Acceleration & torch.compile</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">PyTorch is the undisputed lingua franca of artificial intelligence research and production engineering. Combining Python's dynamic elegance with high-performance C++/CUDA kernels, PyTorch enables rapid experimentation and scale. We master tensor mechanics and PyTorch 2.0 compilation.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/V_xro1bcAuA" title="PyTorch Full Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. GPU Memory Allocation & Autograd Tracking</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import torch

# Automatic hardware device selection: NVIDIA CUDA -> Apple MPS -> CPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Operating device: {device}")

# Creating tensors with gradient tracking enabled
x = torch.randn(1024, 512, device=device, requires_grad=True)
W = torch.randn(512, 128, device=device, requires_grad=True)
b = torch.zeros(128, device=device, requires_grad=True)

# Forward pass
y = torch.matmul(x, W) + b
loss = y.sum()

# Backward automatic differentiation pass
loss.backward()

print("dL/dW shape:", W.grad.shape)
print("Device of gradients:", W.grad.device)</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. PyTorch 2.0 JIT Compilation with torch.compile</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">PyTorch 2.0 introduces <code>torch.compile()</code> powered by TorchDynamo and TorchInductor. It captures computational graphs ahead of time and performs automatic kernel fusion, generating optimized Triton CUDA code that yields 30-100% throughput gains without code modification.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Wrap inference blocks with <code>with torch.no_grad():</code> to disable computational graph construction and save 50%+ memory.</li>
      <li>Ensure tensors are contiguous in memory via <code>tensor.contiguous()</code> before operations requiring direct pointer arithmetic (e.g. <code>view()</code>).</li>
      <li>Use <code>torch.compile(model)</code> in PyTorch 2.0 for free speedups through automated operator fusion.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 4 ──
    {
      id: "CH-AIML-004",
      courseId: "CRS-AIML-001",
      sequence: 4,
      title: "Loss Functions & Advanced Optimizers (SGD, RMSprop, Adam, AdamW)",
      description: "Cross-Entropy vs Focal Loss, stochastic gradient descent with Nesterov momentum, RMSprop adaptive rates, Adam first and second moment vectors, and decoupled weight decay in AdamW.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Deep Learning Foundations • Chapter 4</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Loss Functions & Advanced Optimizers (SGD, Adam, AdamW)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Optimization in non-convex loss surfaces is plagued by ravines, saddle points, and poor conditioning. An optimizer must navigate high curvature without oscillating or stalling. We analyze the mathematics of momentum, adaptive learning rates, and decoupled weight decay.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/IHZwWFHWa-w" title="Gradient Descent and Optimizers" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The AdamW Formulation vs Classic Adam L2 Penalty</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">In classic Adam, L2 regularization is added directly to the loss gradient \\(\\mathbf{g}_t\\). When scaled by adaptive second moments \\(\\sqrt{\\mathbf{v}_t}\\), weights with large historical gradients receive disproportionately tiny decay penalties. <strong>AdamW</strong> decouples weight decay directly into the update step:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\mathbf{m}_t = \\beta_1 \\mathbf{m}_{t-1} + (1 - \\beta_1) \\mathbf{g}_t$$
    $$\\mathbf{v}_t = \\beta_2 \\mathbf{v}_{t-1} + (1 - \\beta_2) \\mathbf{g}_t^2$$
    $$\\mathbf{\\theta}_t = \\mathbf{\\theta}_{t-1} - \\eta \\lambda \\mathbf{\\theta}_{t-1} - \\frac{\\eta}{\\sqrt{\\hat{\\mathbf{v}}_t} + \\epsilon} \\hat{\\mathbf{m}}_t$$
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always use <strong>AdamW</strong> instead of standard Adam when using weight decay, especially for Transformers and modern CNNs.</li>
      <li>For extreme class imbalance in object detection or segmentation, replace standard Cross-Entropy with <strong>Focal Loss</strong>.</li>
      <li>Combine adaptive optimizers with learning rate schedulers: Cosine Annealing with Warmup is standard practice for modern LLM pre-training.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 5 ──
    {
      id: "CH-AIML-005",
      courseId: "CRS-AIML-001",
      sequence: 5,
      title: "Activation Functions & Non-Linearity (Sigmoid, ReLU, GELU, Swish)",
      description: "Dying ReLU problem, LeakyReLU, Parametric ReLU, Gaussian Error Linear Units (GELU) in Transformers, and Swish/SiLU activations.",
      contentType: "Rich Text",
      durationMinutes: 45,
      minimumTimeMinutes: 20,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Deep Learning Foundations • Chapter 5</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Activation Functions & Non-Linearity (ReLU, GELU, Swish)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Activation functions determine the expressive power and gradient flow of deep neural networks. While Sigmoid and Tanh dominated early networks, their vanishing gradients limited depth. We examine modern activations used in frontier architectures like BERT, GPT-4, and Llama 3.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/68BZ5f7P94E" title="Activation Functions Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The Evolution of Activations</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Function</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Formula</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Gradient Range</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Primary Architectural Use</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>ReLU</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">$$\\max(0, x)$$</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">\\(\\{0, 1\\}\\)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Standard CNNs (ResNet, VGG)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>GELU</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">$$x \\cdot \\Phi(x)$$</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Smooth non-monotonic</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Transformers (BERT, GPT-2, RoBERTa)</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>Swish / SiLU</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">$$x \\cdot \\sigma(x)$$</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Smooth non-monotonic</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">EfficientNet, YOLOv8, LLaMA (SwiGLU)</td>
      </tr>
    </tbody>
  </table>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Standard ReLU suffers from 'Dying ReLU' when large negative updates push neurons into permanent zero gradient.</li>
      <li>GELU probabilistic gating weights inputs by their likelihood under a standard normal distribution.</li>
      <li>Modern Large Language Models utilize <strong>SwiGLU</strong> (Swish-Gated Linear Units) in feed-forward projection layers.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 6 ──
    {
      id: "CH-AIML-006",
      courseId: "CRS-AIML-001",
      sequence: 6,
      title: "Regularization & Normalization: Dropout, BatchNorm & LayerNorm",
      description: "Inverted Dropout mechanics, Batch Normalization running statistics, internal covariate shift myth, Layer Normalization across feature dimensions, and RMSNorm.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Deep Learning Foundations • Chapter 6</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Regularization & Normalization: Dropout, BatchNorm & LayerNorm</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Deep neural networks possess millions or billions of parameters, easily enabling them to memorize arbitrary labels. Normalization techniques smooth optimization landscapes, while stochastic regularizers prevent feature co-adaptation.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/tNIpEZLv_l8" title="Batch Norm Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. BatchNorm vs LayerNorm Geometry</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Batch Normalization (Computer Vision)</h3>
      <p style="font-size:14px;color:#475569;">Normalizes across the <strong>batch dimension \\(N\\)</strong> for each individual channel independently. Requires large batch sizes (\\(N \\ge 32\\)) to compute stable empirical statistics; fails on sequence data with variable lengths.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">Layer Normalization (NLP & Transformers)</h3>
      <p style="font-size:14px;color:#475569;">Normalizes across the <strong>feature/channel dimension \\(C\\)</strong> for each training sample independently. Completely invariant to batch size, functioning identically during batch training and online single-token inference.</p>
    </div>
  </div>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always switch model modes explicitly: <code>model.train()</code> enables dropout/batchnorm updates; <code>model.eval()</code> freezes running statistics.</li>
      <li>LayerNorm is the universal standard for Transformer architectures; modern LLMs (LLaMA) use <strong>RMSNorm</strong> for higher computational efficiency.</li>
      <li>Inverted Dropout scales active units by \\(1/(1-p)\\) during training so inference evaluation requires zero scaling adjustments.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 7 ──
    {
      id: "CH-AIML-007",
      courseId: "CRS-AIML-001",
      sequence: 7,
      title: "Modular PyTorch Architectures with torch.nn & Dataloaders",
      description: "Subclassing `nn.Module`, custom Dataset classes, multi-process DataLoader workers, pin_memory for GPU streaming, mixed-precision training (`torch.cuda.amp`), and checkpointing.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#6366f1;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 1: Deep Learning Foundations • Chapter 7</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Modular PyTorch Architectures with torch.nn & Dataloaders</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Production deep learning demands clean engineering patterns. Spaghetti code leads to memory leaks, uncheckpointed model crashes, and CPU starvation during data ingestion. We build an enterprise PyTorch training engine incorporating Automatic Mixed Precision (AMP).</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/ORMx45xqWkA" title="PyTorch Custom Dataset and DataLoader" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Production Training Loop with Mixed Precision (FP16/BF16)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import torch
import torch.nn as nn
from torch.cuda.amp import autocast, GradScaler

model = MyEnterpriseModel().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
criterion = nn.CrossEntropyLoss()
scaler = GradScaler() # Prevents gradient underflow in FP16

for epoch in range(num_epochs):
    model.train()
    for batch_x, batch_y in dataloader:
        batch_x, batch_y = batch_x.to(device, non_blocking=True), batch_y.to(device, non_blocking=True)
        optimizer.zero_grad(set_to_none=True) # set_to_none saves memory bandwidth
        
        # Mixed precision forward execution
        with autocast(dtype=torch.float16):
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            
        # Scaled backward pass
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Use <code>pin_memory=True</code> and <code>num_workers > 0</code> in <code>DataLoader</code> to stream tensors directly into page-locked host memory for non-blocking GPU transfer.</li>
      <li>Pass <code>set_to_none=True</code> in <code>optimizer.zero_grad()</code> to deallocate gradient memory instead of writing zero floats.</li>
      <li>Automatic Mixed Precision (AMP) cuts GPU VRAM usage by ~50% and doubles throughput on modern Tensor Cores.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-AIML-001",
      title: "Neural Networks Foundations Assessment",
      chapterId: "CH-AIML-001",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-001-01", type: "MCQ", prompt: "Why could Rosenblatt's original single-layer perceptron not solve the XOR problem as shown by Minsky and Papert?", options: ["XOR is not linearly separable and cannot be partitioned by a single linear decision hyperplane", "The computer had insufficient memory", "Perceptrons cannot process binary digits", "The learning rate was too high"], answer: 0, points: 10 },
        { id: "Q-AIML-001-02", type: "MCQ", prompt: "What happens mathematically if a Multi-Layer Perceptron contains no non-linear activation functions between layers?", options: ["The entire network collapses into a single linear transformation regardless of depth", "It learns exponential curves", "It becomes an SVM", "It diverges to infinity"], answer: 0, points: 10 },
        { id: "Q-AIML-001-03", type: "MCQ", prompt: "In vectorized forward propagation, what is the dimension of the pre-activation Z when multiplying batch X (N x Din) by weight W (Din x Dout)?", options: ["N x Dout", "Din x Dout", "N x Din", "1 x Dout"], answer: 0, points: 10 },
        { id: "Q-AIML-001-04", type: "MCQ", prompt: "Why is initializing all neural network weights to identical zeros a fatal error?", options: ["All hidden units compute identical outputs and receive identical gradients during backpropagation (symmetry problem)", "It causes floating-point overflow", "Loss cannot be computed", "The GPU will reject the tensor"], answer: 0, points: 10 },
        { id: "Q-AIML-001-05", type: "MCQ", prompt: "What weight initialization strategy scales variance inversely proportional to input dimension for ReLU activations?", options: ["He / Kaiming Normal initialization (sqrt(2 / Din))", "Xavier / Glorot Uniform", "Zero initialization", "Constant 1.0 initialization"], answer: 0, points: 10 },
        { id: "Q-AIML-001-06", type: "MCQ", prompt: "What is the primary role of the bias vector in a dense layer?", options: ["To allow the activation function to shift horizontally away from the origin", "To scale weight magnitudes", "To prevent underflow", "To track training epochs"], answer: 0, points: 10 },
        { id: "Q-AIML-001-07", type: "MCQ", prompt: "What mathematical theorem proves that a feed-forward network with a single hidden layer and non-linear activation can approximate any continuous function?", options: ["Universal Approximation Theorem", "Central Limit Theorem", "No Free Lunch Theorem", "Mercer's Theorem"], answer: 0, points: 10 },
        { id: "Q-AIML-001-08", type: "MCQ", prompt: "What is the computational complexity of computing matrix multiplication of size (N x K) and (K x M) naively?", options: ["O(N * K * M)", "O(N + K + M)", "O(log(N * M))", "O(N^2)"], answer: 0, points: 10 },
        { id: "Q-AIML-001-09", type: "MCQ", prompt: "What activation function is typically applied at the final output layer of a multi-class classification network?", options: ["Softmax", "ReLU", "Sigmoid", "Tanh"], answer: 0, points: 10 },
        { id: "Q-AIML-001-10", type: "MCQ", prompt: "What is a 'mini-batch' in neural network training?", options: ["A subset of the training dataset processed concurrently to balance gradient accuracy and hardware throughput", "A miniature neural network", "A quantized 8-bit model", "A single training sample"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-002",
      title: "Backpropagation & Autodiff Assessment",
      chapterId: "CH-AIML-002",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-002-01", type: "MCQ", prompt: "What mathematical rule underpins the recursive propagation of gradients in the backpropagation algorithm?", options: ["The Multivariable Chain Rule of Calculus", "L'Hopital's Rule", "The Product Rule only", "Taylor's Theorem"], answer: 0, points: 10 },
        { id: "Q-AIML-002-02", type: "MCQ", prompt: "Why is reverse-mode automatic differentiation vastly superior to forward-mode for deep neural networks?", options: ["Reverse-mode computes gradients for all parameters in a single pass from a scalar loss, whereas forward-mode scales with parameter count", "Reverse-mode requires no memory", "Forward-mode only works for linear models", "Reverse-mode does not use calculus"], answer: 0, points: 10 },
        { id: "Q-AIML-002-03", type: "MCQ", prompt: "What causes the 'Vanishing Gradient Problem' in deep networks utilizing Sigmoid or Tanh activations?", options: ["Derivatives of Sigmoid (max 0.25) multiply across many layers, exponentially diminishing gradients to near zero", "Gradients explode to infinity", "Weights become negative", "Learning rate is set to zero"], answer: 0, points: 10 },
        { id: "Q-AIML-002-04", type: "MCQ", prompt: "What is stored during the forward pass so it can be utilized during the backward pass?", options: ["Intermediate activation tensors", "Previous optimizer momentum", "Test dataset labels", "System log files"], answer: 0, points: 10 },
        { id: "Q-AIML-002-05", type: "MCQ", prompt: "What is the derivative of the standard ReLU activation function for inputs x > 0?", options: ["1.0", "0.0", "x", "e^x"], answer: 0, points: 10 },
        { id: "Q-AIML-002-06", type: "MCQ", prompt: "In a computational graph, what is a node with zero incoming edges called during forward execution?", options: ["Input / Leaf node", "Root node", "Sink node", "Residual node"], answer: 0, points: 10 },
        { id: "Q-AIML-002-07", type: "MCQ", prompt: "What technique prevents exploding gradients by scaling the gradient vector when its L2 norm exceeds a threshold?", options: ["Gradient Clipping", "Gradient Accumulation", "Weight Decay", "Dropout"], answer: 0, points: 10 },
        { id: "Q-AIML-002-08", type: "MCQ", prompt: "How does PyTorch represent the dynamic computational graph during execution?", options: ["As a Directed Acyclic Graph (DAG) of Function objects", "As a relational SQL table", "As a static binary tree", "As a JSON schema"], answer: 0, points: 10 },
        { id: "Q-AIML-002-09", type: "MCQ", prompt: "What is the gradient of the loss with respect to a bias vector b in a dense layer?", options: ["The sum of pre-activation error vectors dZ across the batch dimension", "The average of input features", "The dot product of W and X", "Zero"], answer: 0, points: 10 },
        { id: "Q-AIML-002-10", type: "MCQ", prompt: "What is the Jacobian matrix?", options: ["The matrix of all first-order partial derivatives of a vector-valued function", "A matrix of second-order derivatives", "The inverse covariance matrix", "The diagonal weight matrix"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-003",
      title: "PyTorch 2.0 Core Assessment",
      chapterId: "CH-AIML-003",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-003-01", type: "MCQ", prompt: "What property must be set to True on a PyTorch tensor to record operations for automatic differentiation?", options: ["requires_grad=True", "track_gradient=True", "autograd=True", "is_leaf=True"], answer: 0, points: 10 },
        { id: "Q-AIML-003-02", type: "MCQ", prompt: "What context manager suppresses computational graph construction during evaluation, saving substantial memory?", options: ["with torch.no_grad():", "with torch.eval():", "with torch.disable():", "with torch.freeze():"], answer: 0, points: 10 },
        { id: "Q-AIML-003-03", type: "MCQ", prompt: "What major performance feature was introduced in PyTorch 2.0 to compile models into optimized CUDA kernels?", options: ["torch.compile()", "torch.jit.trace()", "torch.cuda.optimize()", "torch.fast()"], answer: 0, points: 10 },
        { id: "Q-AIML-003-04", type: "MCQ", prompt: "What compiler backend does PyTorch 2.0's torch.compile use to generate fused GPU kernels using OpenAI Triton?", options: ["TorchInductor", "TorchScript", "LLVM", "NVCC directly"], answer: 0, points: 10 },
        { id: "Q-AIML-003-05", type: "MCQ", prompt: "What method detaches a tensor from its computational history to prevent future gradient tracking?", options: ["tensor.detach()", "tensor.clone()", "tensor.stop()", "tensor.freeze()"], answer: 0, points: 10 },
        { id: "Q-AIML-003-06", type: "MCQ", prompt: "What happens when you call `tensor.cuda()` if NVIDIA CUDA drivers or hardware are unavailable?", options: ["It raises an AssertionError or RuntimeError", "It silently runs on CPU", "It falls back to disk", "It quantizes the model"], answer: 0, points: 10 },
        { id: "Q-AIML-003-07", type: "MCQ", prompt: "What method reshapes a PyTorch tensor without copying underlying memory when strides permit?", options: ["tensor.view()", "tensor.reshape()", "tensor.transpose()", "tensor.flatten()"], answer: 0, points: 10 },
        { id: "Q-AIML-003-08", type: "MCQ", prompt: "What does it mean for a PyTorch tensor to be 'contiguous'?", options: ["Elements are stored in memory in a uniform, uninterrupted layout consistent with row-major C order", "The tensor has no NaN values", "The tensor is on GPU", "The tensor has integer data type"], answer: 0, points: 10 },
        { id: "Q-AIML-003-09", type: "MCQ", prompt: "What method transfers tensor data into standard Python primitive types when the tensor contains exactly one element?", options: ["tensor.item()", "tensor.tolist()", "tensor.numpy()", "tensor.val()"], answer: 0, points: 10 },
        { id: "Q-AIML-003-10", type: "MCQ", prompt: "What PyTorch tensor operation computes matrix-matrix multiplication between two 2D tensors?", options: ["torch.matmul() or the @ operator", "torch.mul()", "torch.dot() (vectors only)", "torch.prod()"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-004",
      title: "Loss Functions & Optimizers Assessment",
      chapterId: "CH-AIML-004",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-004-01", type: "MCQ", prompt: "Why does AdamW outperform classic Adam when L2 regularization (weight decay) is enabled?", options: ["AdamW decouples weight decay from gradient updates, avoiding distortion caused by adaptive second moment scaling", "AdamW uses second-order Hessians", "AdamW requires half the memory", "AdamW removes momentum"], answer: 0, points: 10 },
        { id: "Q-AIML-004-02", type: "MCQ", prompt: "What loss function is standard for multi-class classification combining LogSoftmax and NLLLoss in PyTorch?", options: ["nn.CrossEntropyLoss()", "nn.MSELoss()", "nn.BCEWithLogitsLoss()", "nn.L1Loss()"], answer: 0, points: 10 },
        { id: "Q-AIML-004-03", type: "MCQ", prompt: "What role does the 'momentum' hyperparameter play in Stochastic Gradient Descent (SGD)?", options: ["It dampens oscillations in high-curvature directions and accelerates movement along persistent trajectories", "It decreases batch size", "It prunes zero weights", "It normalizes activations"], answer: 0, points: 10 },
        { id: "Q-AIML-004-04", type: "MCQ", prompt: "What loss function dynamically down-weights easy examples to focus learning on hard negative instances in imbalanced detection?", options: ["Focal Loss", "Huber Loss", "Mean Absolute Error", "Binary Cross Entropy"], answer: 0, points: 10 },
        { id: "Q-AIML-004-05", type: "MCQ", prompt: "What does the beta2 hyperparameter in Adam control?", options: ["The exponential decay rate for running squared gradient averages (second moment)", "The learning rate", "The weight decay factor", "The momentum factor"], answer: 0, points: 10 },
        { id: "Q-AIML-004-06", type: "MCQ", prompt: "What happens if the learning rate is configured excessively high during neural network training?", options: ["Loss oscillates wildly or diverges to NaN/infinity due to overstepping minima", "Training converges immediately", "The model underfits with zero loss", "Weights become quantized"], answer: 0, points: 10 },
        { id: "Q-AIML-004-07", type: "MCQ", prompt: "What learning rate scheduling strategy smoothly decreases learning rate following a half-cosine curve?", options: ["Cosine Annealing", "StepLR", "ConstantLR", "Exponential decay"], answer: 0, points: 10 },
        { id: "Q-AIML-004-08", type: "MCQ", prompt: "Why is 'learning rate warmup' crucial when training large Transformer models from scratch?", options: ["Initial random gradients are large and unstable; warming up prevents early divergence before momentum estimates stabilize", "To allow GPUs to warm up physically", "To load datasets into RAM", "To measure training speed"], answer: 0, points: 10 },
        { id: "Q-AIML-004-09", type: "MCQ", prompt: "What is the purpose of the epsilon parameter (typically 1e-8) in adaptive optimizers like Adam?", options: ["To prevent division by zero when second moment estimates are near zero", "To set the minimum loss", "To clip weight magnitudes", "To control batch size"], answer: 0, points: 10 },
        { id: "Q-AIML-004-10", type: "MCQ", prompt: "What technique accumulates gradients over multiple smaller micro-batches to simulate large batch sizes without OOM errors?", options: ["Gradient Accumulation", "Gradient Clipping", "Model Parallelism", "Mixed Precision"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-005",
      title: "Activation Functions Assessment",
      chapterId: "CH-AIML-005",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-005-01", type: "MCQ", prompt: "What is the 'Dying ReLU' problem in deep neural networks?", options: ["Neurons receiving large negative updates produce zero output and zero gradient, permanently ceasing to learn", "The GPU runs out of memory", "Weights become imaginary", "The activation explodes to infinity"], answer: 0, points: 10 },
        { id: "Q-AIML-005-02", type: "MCQ", prompt: "What activation function is widely standard across modern Transformer architectures like BERT and GPT-2?", options: ["GELU (Gaussian Error Linear Unit)", "Sigmoid", "Step function", "Hardtanh"], answer: 0, points: 10 },
        { id: "Q-AIML-005-03", type: "MCQ", prompt: "How does LeakyReLU prevent neurons from permanently dying?", options: ["By providing a small non-zero slope (e.g. 0.01) for negative inputs x < 0", "By capping maximum values at 1.0", "By converting negative values to absolute values", "By using a random seed"], answer: 0, points: 10 },
        { id: "Q-AIML-005-04", type: "MCQ", prompt: "What is the mathematical formulation of the Swish (SiLU) activation function?", options: ["x * sigmoid(beta * x)", "max(0, x)", "tanh(x)", "1 / (1 + e^-x)"], answer: 0, points: 10 },
        { id: "Q-AIML-005-05", type: "MCQ", prompt: "What activation variant is utilized in LLaMA and PaLM feed-forward networks to enhance capacity?", options: ["SwiGLU (Swish-Gated Linear Unit)", "ReLU6", "ELU", "Softsign"], answer: 0, points: 10 },
        { id: "Q-AIML-005-06", type: "MCQ", prompt: "Why is the Sigmoid activation rarely used in hidden layers of very deep feed-forward networks today?", options: ["Its derivative is bounded at 0.25, causing severe vanishing gradients in deep networks", "It is non-differentiable", "It only accepts binary inputs", "It is computationally slow on GPUs"], answer: 0, points: 10 },
        { id: "Q-AIML-005-07", type: "MCQ", prompt: "What property makes Tanh superior to Sigmoid in traditional shallow networks?", options: ["Tanh is zero-centered with outputs bounded between [-1, +1]", "Tanh never saturates", "Tanh has derivative of 1.0 everywhere", "Tanh has no exponentiation"], answer: 0, points: 10 },
        { id: "Q-AIML-005-08", type: "MCQ", prompt: "What is Parametric ReLU (PReLU)?", options: ["A leaky ReLU where the negative slope coefficient is learned automatically via backpropagation", "A fixed slope ReLU", "A quantized ReLU", "A periodic wave function"], answer: 0, points: 10 },
        { id: "Q-AIML-005-09", type: "MCQ", prompt: "What is the key geometric characteristic of GELU and Swish compared to standard ReLU?", options: ["They are smooth, non-monotonic curves with non-zero negative dips", "They are linear straight lines", "They are discontinuous step functions", "They produce periodic outputs"], answer: 0, points: 10 },
        { id: "Q-AIML-005-10", type: "MCQ", prompt: "What activation is standard on the final layer of a multi-label classification problem (where multiple labels can be true simultaneously)?", options: ["Sigmoid applied independently to each output logit", "Softmax", "ReLU", "Tanh"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-006",
      title: "Regularization & Normalization Assessment",
      chapterId: "CH-AIML-006",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-006-01", type: "MCQ", prompt: "How does Inverted Dropout eliminate the need for scaling adjustments during inference evaluation?", options: ["By scaling remaining active units by 1/(1-p) during training so expected values remain unchanged at test time", "By dropping neurons during testing", "By multiplying weights by 2", "By running dropout in half precision"], answer: 0, points: 10 },
        { id: "Q-AIML-006-02", type: "MCQ", prompt: "What is the primary operational difference between Batch Normalization and Layer Normalization?", options: ["BatchNorm normalizes across batch samples per channel; LayerNorm normalizes across feature channels per sample", "BatchNorm is supervised while LayerNorm is unsupervised", "LayerNorm only works on images", "BatchNorm does not use learnable parameters"], answer: 0, points: 10 },
        { id: "Q-AIML-006-03", type: "MCQ", prompt: "Why is Layer Normalization preferred over Batch Normalization in natural language processing and Transformers?", options: ["LayerNorm is independent of batch size and handles variable sequence lengths seamlessly", "LayerNorm is 100x faster", "BatchNorm cannot run on text tokens", "LayerNorm eliminates the need for attention"], answer: 0, points: 10 },
        { id: "Q-AIML-006-04", type: "MCQ", prompt: "What two learnable parameters does Batch Normalization introduce to preserve model representational capacity?", options: ["Gamma (scale) and Beta (shift)", "Weight and Bias", "Alpha and Lambda", "Mu and Sigma"], answer: 0, points: 10 },
        { id: "Q-AIML-006-05", type: "MCQ", prompt: "Why must `model.eval()` be invoked prior to running validation or test inference in PyTorch?", options: ["To deactivate Dropout and freeze BatchNorm running mean and variance statistics", "To compile the model", "To release GPU memory", "To enable CUDA"], answer: 0, points: 10 },
        { id: "Q-AIML-006-06", type: "MCQ", prompt: "What simplified normalization variant eliminates mean-centering, scaling solely by root-mean-square for speed in modern LLMs?", options: ["RMSNorm", "InstanceNorm", "GroupNorm", "WeightNorm"], answer: 0, points: 10 },
        { id: "Q-AIML-006-07", type: "MCQ", prompt: "What normalization technique groups channels into sub-buckets, making it robust for small batch object detection?", options: ["Group Normalization (GroupNorm)", "BatchNorm", "LayerNorm", "SpectralNorm"], answer: 0, points: 10 },
        { id: "Q-AIML-006-08", type: "MCQ", prompt: "What does Label Smoothing accomplish when training deep classification networks?", options: ["It replaces hard one-hot target vectors with softened probabilities to prevent overconfidence and improve generalization", "It rounds float labels to integers", "It deletes corrupted labels", "It removes duplicate classes"], answer: 0, points: 10 },
        { id: "Q-AIML-006-09", type: "MCQ", prompt: "What is the primary regularizing effect of Dropout during neural network training?", options: ["It prevents complex feature co-adaptation by forcing neurons to learn robust features independently", "It speeds up matrix multiplication", "It reduces GPU temperature", "It reduces parameter count on disk"], answer: 0, points: 10 },
        { id: "Q-AIML-006-10", type: "MCQ", prompt: "What happens during inference when a model trained with Dropout is evaluated?", options: ["All neurons are active and dropout is completely disabled", "Dropout randomly drops 50% of units", "Only half the layers are executed", "Weights are inverted"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-AIML-007",
      title: "PyTorch Engineering & Dataloaders Assessment",
      chapterId: "CH-AIML-007",
      courseId: "CRS-AIML-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-AIML-007-01", type: "MCQ", prompt: "What two methods must every custom PyTorch Dataset subclass implement?", options: ["__len__() and __getitem__()", "__init__() and __call__()", "forward() and backward()", "load() and save()"], answer: 0, points: 10 },
        { id: "Q-AIML-007-02", type: "MCQ", prompt: "What parameter in `torch.utils.data.DataLoader` enables asynchronous background batch prefetching using multi-processing?", options: ["num_workers", "batch_size", "prefetch_factor", "pin_memory"], answer: 0, points: 10 },
        { id: "Q-AIML-007-03", type: "MCQ", prompt: "What does `pin_memory=True` in a DataLoader do to speed up GPU training?", options: ["Allocates batch tensors in page-locked host memory, enabling fast DMA copy to GPU VRAM", "Locks the GPU clock speed", "Prevents model weights from changing", "Caches data on SSD"], answer: 0, points: 10 },
        { id: "Q-AIML-007-04", type: "MCQ", prompt: "Why is `set_to_none=True` in `optimizer.zero_grad()` recommended in modern PyTorch?", options: ["It sets gradients to None instead of writing zero floats, saving GPU memory bandwidth", "It deletes the model parameters", "It disables autograd", "It converts gradients to integers"], answer: 0, points: 10 },
        { id: "Q-AIML-007-05", type: "MCQ", prompt: "What is the purpose of `torch.cuda.amp.GradScaler` during mixed-precision (FP16) training?", options: ["It multiplies loss by a scale factor to prevent small gradient values from underflowing to zero in 16-bit float", "It scales learning rate", "It normalizes weights", "It measures GPU power"], answer: 0, points: 10 },
        { id: "Q-AIML-007-06", type: "MCQ", prompt: "What function serializes and saves PyTorch model state dictionaries, optimizer states, and training epochs to disk?", options: ["torch.save({'model_state': model.state_dict(), ...}, 'checkpoint.pt')", "torch.dump()", "torch.export()", "torch.serialize()"], answer: 0, points: 10 },
        { id: "Q-AIML-007-07", type: "MCQ", prompt: "What method loads serialized weights into an instantiated PyTorch model architecture?", options: ["model.load_state_dict(torch.load('checkpoint.pt'))", "model.restore()", "model.read()", "model.init_weights()"], answer: 0, points: 10 },
        { id: "Q-AIML-007-08", type: "MCQ", prompt: "What parameter in DataLoader handles custom batch collating (e.g. dynamic sequence padding)?", options: ["collate_fn", "batch_sampler", "transform", "worker_init_fn"], answer: 0, points: 10 },
        { id: "Q-AIML-007-09", type: "MCQ", prompt: "What utility enables training models across multiple GPUs on a single or distributed multi-node cluster in PyTorch?", options: ["DistributedDataParallel (DDP)", "DataParallel (DP legacy)", "TorchServe", "TorchScript"], answer: 0, points: 10 },
        { id: "Q-AIML-007-10", type: "MCQ", prompt: "What flag in PyTorch benchmark settings selects the fastest convolution algorithm for fixed input sizes?", options: ["torch.backends.cudnn.benchmark = True", "torch.cuda.fast_mode = True", "torch.autograd.set_detect_anomaly(False)", "torch.jit.enable()"], answer: 0, points: 10 },
      ]
    }
  ]
};

