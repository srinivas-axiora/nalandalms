// Phase 4: Unsupervised Learning, Dimensionality Reduction & Time Series (Chapters 20 to 25) - Data Science
// World-class curriculum: Zero to employable master.

export const phase4 = {
  chapters: [
    // ── Chapter 20 ──
    {
      id: "CH-DSC-020",
      courseId: "CRS-DSC-001",
      sequence: 20,
      title: "K-Means Clustering, Inertia & Silhouette Analysis",
      description: "Lloyd's algorithm, Voronoi tessellation, K-Means++ smart seeding, inertia elbow curve heuristic, Silhouette coefficients, and MiniBatchKMeans for massive streaming data.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Unsupervised Learning • Chapter 20</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">K-Means Clustering, Inertia & Silhouette Analysis</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Unsupervised learning reveals hidden customer personas, structural anomalies, and latent groupings without ground truth labels. K-Means partitions continuous vector spaces into discrete clusters by minimizing within-cluster sum of squares. In this chapter, we master clustering geometry and cluster validation metrics.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/4b5d3muPQmA" title="K-Means Clustering and Silhouette Analysis" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Validating Optimal K: Elbow Curve vs Silhouette Coefficient</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Inertia & The Elbow Method</h3>
      <p style="font-size:14px;color:#475569;">$$Inertia = \\sum_{i=1}^N \\min_{\\mu_k} \\|x_i - \\mu_k\\|^2$$</p>
      <p style="font-size:13px;color:#64748b;">Measures internal cluster tightness. Plotting inertia against \\(k\\) reveals an 'elbow' where marginal returns diminish. However, elbow detection is subjective and fails on smooth gradients.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#6366f1;margin-top:0;">Silhouette Coefficient</h3>
      <p style="font-size:14px;color:#475569;">$$s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))}$$</p>
      <p style="font-size:13px;color:#64748b;">Measures how much closer a point is to its own cluster (\\(a\\)) versus the nearest neighboring cluster (\\(b\\)). Bounded in \\([-1, +1]\\). Values \\(> 0.6\\) confirm strong cluster isolation.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Silhouette Analysis in Scikit-Learn</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

# Evaluate K across candidate range
k_range = range(2, 9)
best_k = 2
best_score = -1

for k in k_range:
    # init='k-means++' guarantees optimal centroid dispersion at start
    kmeans = KMeans(n_clusters=k, init='k-means++', n_init=10, random_state=42)
    labels = kmeans.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    
    if score > best_score:
        best_score = score
        best_k = k
    print(f"Clusters: {k} | Silhouette Score: {score:.4f}")

print(f"Optimal Cluster Count: {best_k}")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>K-Means implicitly assumes isotropic (spherical) clusters with equal variance; it fails on elongated or manifold geometries.</li>
      <li>Always utilize <code>init='k-means++'</code> to avoid bad local minima traps caused by naive random centroid initialization.</li>
      <li>Scale all numerical inputs using <code>StandardScaler</code> prior to clustering to prevent high-magnitude features from dominating distances.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 21 ──
    {
      id: "CH-DSC-021",
      courseId: "CRS-DSC-001",
      sequence: 21,
      title: "Hierarchical & Density-Based Clustering (DBSCAN & HDBSCAN)",
      description: "Agglomerative clustering, dendrogram ward linkage, DBSCAN core/border/noise points, eps & min_samples tuning, and HDBSCAN varying-density clustering.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Unsupervised Learning • Chapter 21</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Hierarchical & Density-Based Clustering (DBSCAN & HDBSCAN)</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Real-world datasets rarely form neat spherical blobs. Geospatial coordinates, network traffic, and biological features exhibit complex arbitrary shapes and variable densities. Density-Based Spatial Clustering of Applications with Noise (DBSCAN) discovers arbitrary non-convex clusters and natively isolates noise points.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/RDZUdRSDOok" title="DBSCAN Clustering Explained" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. DBSCAN Point Classification Taxonomy</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px;margin:20px 0;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#10b981;margin-top:0;">Core Points</h3>
      <p style="font-size:14px;color:#475569;">Any point having at least <code>min_samples</code> points within its radius \\(\\epsilon\\) (including itself). Forms the dense cluster backbone.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#0284c7;margin-top:0;">Border Points</h3>
      <p style="font-size:14px;color:#475569;">A point that is within distance \\(\\epsilon\\) of a Core Point, but contains fewer than <code>min_samples</code> within its own neighborhood.</p>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
      <h3 style="color:#ef4444;margin-top:0;">Noise Outliers (-1)</h3>
      <p style="font-size:14px;color:#475569;">Any point that is neither a core point nor reachable from any core point. DBSCAN assigns them a label of <code>-1</code>, providing automatic anomaly detection.</p>
    </div>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Estimating Epsilon via K-Distance Graph</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import DBSCAN
import numpy as np
import matplotlib.pyplot as plt

# Step 1: Compute distance to k-th nearest neighbor (k = 2 * dimensions)
k = 4
neighbors = NearestNeighbors(n_neighbors=k)
neighbors.fit(X_scaled)
distances, _ = neighbors.kneighbors(X_scaled)

# Sort distances to identify the elbow curvature corresponding to optimal eps
sorted_distances = np.sort(distances[:, k-1])
# plt.plot(sorted_distances); plt.ylabel("k-NN distance"); plt.show()

# Step 2: Fit DBSCAN using knee point
dbscan = DBSCAN(eps=0.45, min_samples=4)
labels = dbscan.fit_predict(X_scaled)

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)
print(f"Clusters found: {n_clusters} | Anomaly noise points: {n_noise}")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>DBSCAN does not require specifying cluster count \\(K\\) in advance; it discovers clusters based on density connectivity.</li>
      <li>Points labeled <code>-1</code> can be piped directly into fraud investigation or anomaly triage queues.</li>
      <li>For clusters with varying densities, upgrade to <strong>HDBSCAN</strong> (Hierarchical DBSCAN) which extracts stable clusters across epsilon persistence scales.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 22 ──
    {
      id: "CH-DSC-022",
      courseId: "CRS-DSC-001",
      sequence: 22,
      title: "Dimensionality Reduction: PCA, t-SNE & UMAP",
      description: "Principal Component Analysis (PCA), explained variance ratio scree plot, t-Distributed Stochastic Neighbor Embedding (t-SNE) perplexity, and Uniform Manifold Approximation (UMAP).",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Unsupervised Learning • Chapter 22</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Dimensionality Reduction: PCA, t-SNE & UMAP</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">High-dimensional spaces suffer from the curse of dimensionality: vector distances converge to uniformity, computational costs soar, and human visualization is impossible. We master linear orthogonal projections via PCA and modern non-linear topological embeddings via t-SNE and UMAP.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/FgakZw6K1QQ" title="PCA Dimensionality Reduction" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Comparison Matrix: PCA vs t-SNE vs UMAP</h2>
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
    <thead>
      <tr style="background:#f1f5f9;text-align:left;">
        <th style="padding:12px;border:1px solid #cbd5e1;">Technique</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Linearity</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Preserves</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Transforms New Unseen Points?</th>
        <th style="padding:12px;border:1px solid #cbd5e1;">Primary Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>PCA</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Linear orthogonal</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Global variance</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Yes (<code>pca.transform(X_new)</code>)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Feature compression, denoising, collinearity reduction</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>t-SNE</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Non-linear probabilistic</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Local pairwise neighborhoods</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">No (Visualization only)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">2D / 3D exploratory cluster visualization</td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #cbd5e1;"><strong>UMAP</strong></td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Non-linear Riemannian manifold</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Both local and global topological structure</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Yes (Fast out-of-sample projection)</td>
        <td style="padding:10px;border:1px solid #cbd5e1;">Fast visualization & non-linear preprocessing</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Cumulative Explained Variance in PCA</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.decomposition import PCA
import numpy as np

# Retain 95% of total dataset variance automatically
pca = PCA(n_components=0.95, svd_solver='full')
X_reduced = pca.fit_transform(X_scaled)

print(f"Original features: {X_scaled.shape[1]}")
print(f"Retained principal components: {pca.n_components_}")
print(f"Cumulative variance explained: {np.sum(pca.explained_variance_ratio_):.4f}")</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>PCA principal components are mutually orthogonal (zero correlation), resolving severe multi-collinearity.</li>
      <li>Never use t-SNE as a preprocessing feature extractor for downstream ML; use PCA or UMAP.</li>
      <li>t-SNE distances between distant clusters are meaningless; cluster sizes and inter-cluster distances reflect perplexity tuning rather than true geometry.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 23 ──
    {
      id: "CH-DSC-023",
      courseId: "CRS-DSC-001",
      sequence: 23,
      title: "Anomaly & Fraud Detection Algorithms",
      description: "Semi-supervised and unsupervised anomaly detection, Isolation Forests path length, One-Class SVM reproducing kernels, Local Outlier Factor (LOF), and precision-at-k calibration.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Unsupervised Learning • Chapter 23</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Anomaly & Fraud Detection Algorithms</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">In cybersecurity, payment fraud, and industrial turbine monitoring, positive anomaly labels are rare, delayed, or actively disguised by adversaries. Supervised models struggle because future attack vectors differ from historical patterns. We deploy dedicated anomaly detectors capable of identifying novel deviations.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/5p8B2Ikcw-k" title="Isolation Forest and Anomaly Detection" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Isolation Forest Anomaly Scoring Mathematics</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">An anomaly score \\(s(x, n)\\) for sample \\(x\\) over \\(n\\) training points is defined as:</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$s(x, n) = 2^{-\\frac{\\mathbb{E}[h(x)]}{c(n)}}$$
  </div>
  <p style="font-size:14px;color:#475569;">Where \\(h(x)\\) is the path length (number of splits required to isolate point \\(x\\)), and \\(c(n)\\) is the average path length of an unsuccessful search in a Binary Search Tree. If \\(s \\to 1\\), path length is extremely short, indicating an anomaly. If \\(s < 0.5\\), the point is a normal cluster instance.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Production Ensembling of Anomaly Detectors</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
import numpy as np

# Detector 1: Tree partition isolation
iso = IsolationForest(contamination=0.01, random_state=42)
iso_scores = -iso.fit(X).score_samples(X) # Invert so higher = more anomalous

# Detector 2: Local density comparison against k-neighbors
lof = LocalOutlierFactor(n_neighbors=20, novelty=True)
lof.fit(X)
lof_scores = -lof.score_samples(X)

# Rank average ensemble
ensemble_anomaly_score = (
    np.argsort(np.argsort(iso_scores)) + 
    np.argsort(np.argsort(lof_scores))
) / 2.0</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Isolation Forest isolates anomalies instead of profiling normal clusters, scaling in \\(\\mathcal{O}(N \\log N)\\) time with low memory.</li>
      <li>Local Outlier Factor (LOF) identifies anomalies situated near dense clusters that appear normal to global density estimators.</li>
      <li>Calibrate threshold using top \\(k\\) predictions matching the enterprise fraud investigation capacity per shift.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 24 ──
    {
      id: "CH-DSC-024",
      courseId: "CRS-DSC-001",
      sequence: 24,
      title: "Recommendation Systems: Collaborative & Content Filtering",
      description: "User-Item interaction matrices, Cosine & Jaccard similarity, Memory-based Collaborative Filtering, Matrix Factorization via SVD, and Cold-Start mitigation.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Unsupervised Learning • Chapter 24</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Recommendation Systems: Collaborative & Content Filtering</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Personalized recommendations power the core monetization engines of Netflix, Amazon, Spotify, and YouTube. We build end-to-end collaborative filtering and latent factor matrix decomposition algorithms to predict user affinities across sparse matrices.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/n3RKsY2H-NE" title="Recommendation Systems: Collaborative Filtering and SVD" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Matrix Factorization via Truncated SVD</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">A sparse User-Item rating matrix \\(\\mathbf{R} \\in \\mathbb{R}^{U \\times I}\\) is decomposed into low-rank latent user matrices \\(\\mathbf{P} \\in \\mathbb{R}^{U \\times K}\\) and latent item matrices \\(\\mathbf{Q} \\in \\mathbb{R}^{I \\times K}\\):</p>
  <div style="background:#f8fafc;border-left:4px solid #6366f1;padding:16px;margin:20px 0;font-size:16px;font-weight:600;color:#1e293b;">
    $$\\hat{r}_{u, i} = \\mu + b_u + b_i + \\mathbf{p}_u^T \\mathbf{q}_i$$
  </div>
  <p style="font-size:14px;color:#475569;">Where \\(\\mu\\) is global average rating, \\(b_u\\) is user rating bias, \\(b_i\\) is item rating bias, and \\(\\mathbf{p}_u^T \\mathbf{q}_i\\) measures user affinity for the item's latent attributes (e.g., sci-fi intensity, pacing).</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. User-User Cosine Collaborative Filtering</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix

# Construct sparse CSR interaction matrix (Users x Items)
# Ratings are centered by subtracting user mean rating to eliminate bias
R_sparse = csr_matrix(ratings_matrix)
user_similarity = cosine_similarity(R_sparse, dense_output=False)

def predict_user_rating(user_idx, item_idx, k_neighbors=10):
    # Retrieve top-k most similar users who actually rated item_idx
    similar_users = user_similarity[user_idx].toarray().flatten()
    rated_mask = (ratings_matrix[:, item_idx] > 0)
    
    top_indices = np.argsort(similar_users * rated_mask)[::-1][:k_neighbors]
    sim_weights = similar_users[top_indices]
    
    if np.sum(sim_weights) == 0:
        return global_item_mean[item_idx] # Fallback for cold neighbors
        
    return np.dot(sim_weights, ratings_matrix[top_indices, item_idx]) / np.sum(sim_weights)</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Collaborative filtering relies solely on observed user actions without requiring manually tagged domain attributes.</li>
      <li>To overcome the Cold-Start problem for brand-new users/items, hybridize with Content-Based filtering using metadata text embeddings.</li>
      <li>Evaluate recommendation engines using Top-K Ranking metrics: Precision@K, Recall@K, Mean Reciprocal Rank (MRR), and NDCG.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 25 ──
    {
      id: "CH-DSC-025",
      courseId: "CRS-DSC-001",
      sequence: 25,
      title: "Time Series Forecasting: ARIMA, SARIMA & Prophet",
      description: "Stationarity testing (Augmented Dickey-Fuller), differencing, ACF & PACF plots, ARIMA(p, d, q) modeling, seasonal SARIMA, and Facebook Prophet additive decomposition.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 28,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#8b5cf6;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 4: Unsupervised Learning • Chapter 25</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Time Series Forecasting: ARIMA, SARIMA & Prophet</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Time series data violates the fundamental machine learning assumption that observations are Independent and Identically Distributed (i.i.d.). Autocorrelation, trends, and multi-period seasonality require specialized statistical and additive models.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/de0hW9hS9uA" title="Time Series Forecasting with ARIMA" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Diagnosing Stationarity: Augmented Dickey-Fuller (ADF)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from statsmodels.tsa.stattools import adfuller
import pandas as pd

def check_stationarity(timeseries):
    result = adfuller(timeseries.dropna())
    p_value = result[1]
    print(f"ADF Statistic: {result[0]:.4f} | p-value: {p_value:.4e}")
    if p_value < 0.05:
        print("Series is Stationary (Reject Null Hypothesis)")
    else:
        print("Series is Non-Stationary (Differencing d >= 1 required)")

# Apply first-order differencing if non-stationary:
# diff_series = df['revenue'].diff().dropna()</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Additive Forecasting with Facebook Prophet</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>from prophet import Prophet
import pandas as pd

# Prophet expects columns explicitly named 'ds' (datestamp) and 'y' (target)
df_prophet = pd.DataFrame({'ds': dates, 'y': sales})

# Initialize model with holiday effects and weekly/yearly seasonality
m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
m.add_country_holidays(country_name='US')
m.fit(df_prophet)

# Generate 90-day future horizon dataframe
future = m.make_future_dataframe(periods=90)
forecast = m.predict(future)

# Returns trend, lower confidence interval (yhat_lower), and upper (yhat_upper)
print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail())</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>A stationary series maintains constant mean, variance, and autocorrelation structure over time.</li>
      <li>Use PACF (Partial Autocorrelation) to estimate Autoregressive lag order \\(p\\); use ACF to estimate Moving Average lag order \\(q\\).</li>
      <li>Facebook Prophet is robust to missing timestamps, structural changepoints, and holiday shifts, making it the premier choice for business KPI forecasting.</li>
    </ul>
  </div>
</div>`
    }
  ],

  assessments: [
    {
      id: "ASM-DSC-020",
      title: "K-Means Clustering Assessment",
      chapterId: "CH-DSC-020",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-020-01", type: "MCQ", prompt: "What objective function does Lloyd's K-Means algorithm minimize during iterative centroid updates?", options: ["Within-cluster sum of squared errors (Inertia)", "Between-cluster variance", "Silhouette coefficient", "Information gain"], answer: 0, points: 10 },
        { id: "Q-DSC-020-02", type: "MCQ", prompt: "How does the K-Means++ initialization algorithm select initial cluster centroids?", options: ["It chooses subsequent centroids with probability proportional to their squared distance from already chosen centroids", "It places all centroids at the origin", "It randomly selects any k points with uniform probability", "It computes the global median"], answer: 0, points: 10 },
        { id: "Q-DSC-020-03", type: "MCQ", prompt: "What is the theoretical range of the Silhouette Coefficient?", options: ["Between -1.0 and +1.0", "Between 0.0 and 1.0", "Between 0 and infinity", "Between -100 and +100"], answer: 0, points: 10 },
        { id: "Q-DSC-020-04", type: "MCQ", prompt: "What does a Silhouette score close to -1 indicate for a specific data point?", options: ["The point is likely assigned to the wrong cluster and is closer to a neighboring cluster", "The point is perfectly centered in its own cluster", "The dataset has zero variance", "The point is an outlier noise point"], answer: 0, points: 10 },
        { id: "Q-DSC-020-05", type: "MCQ", prompt: "Why does standard K-Means fail to separate concentric circles or crescent-shaped data?", options: ["K-Means relies on Euclidean distance, assuming convex, spherical, isotropic cluster geometry", "K-Means cannot run on 2D data", "K-Means only accepts categorical features", "The algorithm cannot compute means"], answer: 0, points: 10 },
        { id: "Q-DSC-020-06", type: "MCQ", prompt: "What variation of K-Means updates centroids incrementally using mini-batches of data for billion-row datasets?", options: ["MiniBatchKMeans", "DBSCAN", "AffinityPropagation", "SpectralClustering"], answer: 0, points: 10 },
        { id: "Q-DSC-020-07", type: "MCQ", prompt: "What geometric partition divides Euclidean space into convex polygons around each K-Means centroid?", options: ["Voronoi diagram (tessellation)", "Delaunay triangulation", "Hilbert curve", "Fourier polygon"], answer: 0, points: 10 },
        { id: "Q-DSC-020-08", type: "MCQ", prompt: "Why is feature scaling essential before executing K-Means clustering?", options: ["K-Means computes Euclidean distances; features with large ranges disproportionately dominate distance calculations", "K-Means crashes on unscaled floats", "To eliminate negative values", "To convert data to binary"], answer: 0, points: 10 },
        { id: "Q-DSC-020-09", type: "MCQ", prompt: "What is the limitation of relying solely on the 'Elbow Method' to select K?", options: ["In complex real-world datasets, the inertia curve is often smooth without a distinctive sharp elbow bend", "It can only test up to K=3", "It requires labeled ground truth", "It only runs on GPU"], answer: 0, points: 10 },
        { id: "Q-DSC-020-10", type: "MCQ", prompt: "What clustering validation metric evaluates clusters against external ground truth labels when available?", options: ["Adjusted Rand Index (ARI)", "Inertia", "Silhouette Score", "Davies-Bouldin Index"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-021",
      title: "DBSCAN & Density-Based Clustering Assessment",
      chapterId: "CH-DSC-021",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-021-01", type: "MCQ", prompt: "What are the two core hyperparameters required by the standard DBSCAN algorithm?", options: ["eps (neighborhood radius) and min_samples (minimum points)", "n_clusters and max_iter", "learning_rate and n_estimators", "alpha and gamma"], answer: 0, points: 10 },
        { id: "Q-DSC-021-02", type: "MCQ", prompt: "What label integer does Scikit-Learn's DBSCAN assign to noise / anomaly points?", options: ["-1", "0", "999", "NaN"], answer: 0, points: 10 },
        { id: "Q-DSC-021-03", type: "MCQ", prompt: "What condition defines a 'Core Point' in DBSCAN?", options: ["Having at least min_samples points within its eps radius (including itself)", "Having the highest feature value", "Being closest to the origin", "Having exactly 0 neighbors"], answer: 0, points: 10 },
        { id: "Q-DSC-021-04", type: "MCQ", prompt: "What is a major advantage of DBSCAN over K-Means clustering?", options: ["DBSCAN does not require pre-specifying the number of clusters and can find arbitrarily shaped non-convex geometries", "DBSCAN is faster than OLS", "DBSCAN scales linearly to 10 billion rows", "DBSCAN produces decision trees"], answer: 0, points: 10 },
        { id: "Q-DSC-021-05", type: "MCQ", prompt: "What diagnostic plot assists in choosing an optimal eps parameter for DBSCAN?", options: ["K-distance graph (plotting sorted k-th nearest neighbor distances to find the knee)", "Scree plot", "ROC curve", "Residual plot"], answer: 0, points: 10 },
        { id: "Q-DSC-021-06", type: "MCQ", prompt: "What is a primary failure mode of standard DBSCAN?", options: ["Inability to cluster datasets containing clusters of substantially varying densities", "Crashing when noise points are present", "Failing on circular clusters", "Requiring balanced classes"], answer: 0, points: 10 },
        { id: "Q-DSC-021-07", type: "MCQ", prompt: "What modern upgrade to DBSCAN resolves the varying density limitation by extracting persistent hierarchical clusters?", options: ["HDBSCAN", "AgglomerativeClustering", "MiniBatchKMeans", "MeanShift"], answer: 0, points: 10 },
        { id: "Q-DSC-021-08", type: "MCQ", prompt: "What linkage criterion in Agglomerative Hierarchical Clustering minimizes the total within-cluster variance?", options: ["Ward linkage", "Complete linkage", "Single linkage", "Average linkage"], answer: 0, points: 10 },
        { id: "Q-DSC-021-09", type: "MCQ", prompt: "What visual tree diagram displays hierarchical clustering merges and splits at varying distance thresholds?", options: ["Dendrogram", "Histogram", "Sankey diagram", "Boxplot"], answer: 0, points: 10 },
        { id: "Q-DSC-021-10", type: "MCQ", prompt: "What distance metric should be specified in DBSCAN when clustering latitude and longitude geographic coordinates?", options: ["haversine", "euclidean", "manhattan", "cosine"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-022",
      title: "Dimensionality Reduction Assessment",
      chapterId: "CH-DSC-022",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-022-01", type: "MCQ", prompt: "What mathematical property characterizes the relationship between different Principal Components in PCA?", options: ["They are completely orthogonal (uncorrelated) to each other", "They are identical", "They are non-linear curves", "They must sum to 1.0"], answer: 0, points: 10 },
        { id: "Q-DSC-022-02", type: "MCQ", prompt: "What does the first Principal Component (PC1) represent in PCA?", options: ["The axis of linear projection that captures the maximum possible variance of the data", "The feature with the lowest value", "The mean vector", "The target variable"], answer: 0, points: 10 },
        { id: "Q-DSC-022-03", type: "MCQ", prompt: "Why must data be standardized (zero mean, unit variance) before running PCA?", options: ["Features with larger absolute scales will artificially dominate the variance and principal axes", "PCA crashes on negative numbers", "To convert data to integers", "To remove outliers"], answer: 0, points: 10 },
        { id: "Q-DSC-022-04", type: "MCQ", prompt: "What plot displays eigenvalues or explained variance ratio per principal component to help choose component count?", options: ["Scree plot", "Scatter plot", "Dendrogram", "Funnel chart"], answer: 0, points: 10 },
        { id: "Q-DSC-022-05", type: "MCQ", prompt: "Why is t-SNE generally unsuitable as a feature extraction step for downstream supervised ML models?", options: ["t-SNE does not preserve a reusable projection mapping function for transforming unseen test data", "t-SNE only accepts 1 feature", "t-SNE deletes the target label", "t-SNE is a linear algorithm"], answer: 0, points: 10 },
        { id: "Q-DSC-022-06", type: "MCQ", prompt: "What hyperparameter in t-SNE balances attention between local pairwise features and global structure?", options: ["Perplexity", "Alpha", "Epsilon", "C"], answer: 0, points: 10 },
        { id: "Q-DSC-022-07", type: "MCQ", prompt: "What advantage does UMAP offer over t-SNE for manifold dimensionality reduction?", options: ["UMAP preserves more global structure, scales faster to large datasets, and can transform new out-of-sample points", "UMAP only works on text", "UMAP is strictly linear", "UMAP does not require tuning"], answer: 0, points: 10 },
        { id: "Q-DSC-022-08", type: "MCQ", prompt: "How can PCA be configured in Scikit-Learn to automatically select the number of components needed to retain 95% of variance?", options: ["PCA(n_components=0.95)", "PCA(variance=95)", "PCA(threshold=0.95)", "PCA(keep=95)"], answer: 0, points: 10 },
        { id: "Q-DSC-022-09", type: "MCQ", prompt: "What non-linear variant of PCA uses kernel functions to construct non-linear manifold projections?", options: ["Kernel PCA", "Sparse PCA", "Incremental PCA", "Truncated SVD"], answer: 0, points: 10 },
        { id: "Q-DSC-022-10", type: "MCQ", prompt: "What technique applies PCA incrementally on mini-batches when datasets exceed available physical RAM?", options: ["IncrementalPCA", "MiniBatchPCA", "ChunkedPCA", "StreamPCA"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-023",
      title: "Anomaly & Fraud Detection Assessment",
      chapterId: "CH-DSC-023",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-023-01", type: "MCQ", prompt: "What is the core intuition behind the Isolation Forest anomaly detection algorithm?", options: ["Anomalies are few and structurally different, requiring significantly fewer random splits to isolate in tree structures", "Anomalies always cluster at the center of the dataset", "Anomalies have zero variance", "Anomalies cannot be partitioned"], answer: 0, points: 10 },
        { id: "Q-DSC-023-02", type: "MCQ", prompt: "In Scikit-Learn's IsolationForest, how does path length h(x) correlate with anomaly likelihood?", options: ["Shorter path lengths indicate higher probability of being an anomaly", "Longer path lengths indicate anomalies", "Path length is constant for all points", "Path length has no relationship to anomalies"], answer: 0, points: 10 },
        { id: "Q-DSC-023-03", type: "MCQ", prompt: "What parameter in IsolationForest specifies the estimated proportion of anomalies in the dataset?", options: ["contamination", "anomaly_ratio", "outlier_fraction", "threshold"], answer: 0, points: 10 },
        { id: "Q-DSC-023-04", type: "MCQ", prompt: "What unsupervised algorithm detects anomalies by comparing a point's local density to the density of its k-nearest neighbors?", options: ["Local Outlier Factor (LOF)", "K-Means", "Logistic Regression", "Ridge"], answer: 0, points: 10 },
        { id: "Q-DSC-023-05", type: "MCQ", prompt: "How does One-Class SVM identify anomalies in high-dimensional feature spaces?", options: ["It fits a max-margin boundary enclosing normal training points in kernel space, classifying outliers outside the boundary", "It runs standard binary classification with random labels", "It calculates linear regression residuals", "It averages all feature vectors"], answer: 0, points: 10 },
        { id: "Q-DSC-023-06", type: "MCQ", prompt: "Why is Precision@K often the primary production evaluation metric for financial fraud detection teams?", options: ["Human fraud analyst teams have a fixed investigation capacity of K alerts per day; the top K flagged transactions must be highly accurate", "It does not require labels", "It is always 100%", "It eliminates false negatives"], answer: 0, points: 10 },
        { id: "Q-DSC-023-07", type: "MCQ", prompt: "What is 'novelty detection' compared to 'outlier detection' in Scikit-Learn?", options: ["Novelty detection assumes training data is clean and unpolluted by anomalies; outlier detection models polluted training data", "Novelty detection is supervised while outlier detection is not", "Novelty detection only works on text", "There is no functional distinction"], answer: 0, points: 10 },
        { id: "Q-DSC-023-08", type: "MCQ", prompt: "What statistical distance metric accounts for covariance between variables when measuring distance to a distribution mean?", options: ["Mahalanobis distance", "Euclidean distance", "Manhattan distance", "Hamming distance"], answer: 0, points: 10 },
        { id: "Q-DSC-023-09", type: "MCQ", prompt: "What deep learning architecture is widely deployed for unsupervised anomaly detection by measuring input reconstruction error?", options: ["Autoencoder", "Recurrent Neural Network", "BERT", "ResNet"], answer: 0, points: 10 },
        { id: "Q-DSC-023-10", type: "MCQ", prompt: "What output does `model.predict()` return for normal inlier points in Scikit-Learn anomaly algorithms?", options: ["+1 for inliers, -1 for outliers", "0 for inliers, 1 for outliers", "True for outliers, False for inliers", "Probability [0, 1]"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-024",
      title: "Recommendation Systems Assessment",
      chapterId: "CH-DSC-024",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-024-01", type: "MCQ", prompt: "What is the primary difference between Collaborative Filtering and Content-Based Filtering?", options: ["Collaborative filtering recommends items based on user interaction patterns; content-based filtering recommends items matching item metadata attributes", "Collaborative filtering requires no user data", "Content-based filtering only works on images", "Collaborative filtering is supervised"], answer: 0, points: 10 },
        { id: "Q-DSC-024-02", type: "MCQ", prompt: "What is the 'Cold-Start Problem' in recommendation engines?", options: ["The difficulty in generating reliable recommendations for brand-new users or newly listed items with no historical interactions", "Server restart lag", "Model training timeout", "Slow database query caching"], answer: 0, points: 10 },
        { id: "Q-DSC-024-03", type: "MCQ", prompt: "What mathematical technique decomposes a sparse User-Item interaction matrix into low-rank latent feature vectors?", options: ["Matrix Factorization (Truncated SVD / Alternating Least Squares)", "K-Means", "Logistic Regression", "Polynomial expansion"], answer: 0, points: 10 },
        { id: "Q-DSC-024-04", type: "MCQ", prompt: "Why are user ratings centered by subtracting each user's mean rating in user-user collaborative filtering?", options: ["To eliminate user rating bias (some users are consistently generous with 5 stars while harsh critics average 2 stars)", "To make all ratings positive", "To convert ratings to booleans", "To speed up numpy dot products"], answer: 0, points: 10 },
        { id: "Q-DSC-024-05", type: "MCQ", prompt: "What similarity metric evaluates overlap between two binary sets of user interactions (e.g., clicked or not clicked)?", options: ["Jaccard similarity", "Pearson correlation", "Euclidean distance", "Manhattan distance"], answer: 0, points: 10 },
        { id: "Q-DSC-024-06", type: "MCQ", prompt: "What evaluation metric measures the quality of ranked recommendation lists by penalizing relevant items appearing lower in the ranking?", options: ["NDCG (Normalized Discounted Cumulative Gain)", "Accuracy", "Mean Absolute Error", "Silhouette score"], answer: 0, points: 10 },
        { id: "Q-DSC-024-07", type: "MCQ", prompt: "What optimization algorithm is specifically tailored for matrix factorization when user feedback is implicit (e.g. clicks, watch time)?", options: ["Alternating Least Squares (implicit ALS)", "Gradient descent on MSE", "Ordinary Least Squares", "Newton-Raphson"], answer: 0, points: 10 },
        { id: "Q-DSC-024-08", type: "MCQ", prompt: "What is the benefit of Item-Item collaborative filtering over User-User collaborative filtering in large e-commerce platforms?", options: ["Item catalogs are typically more stable and lower cardinality than rapidly fluctuating user bases, allowing pre-computed similarity caching", "Item-item requires zero memory", "Item-item avoids calculating similarity", "Item-item guarantees 100% precision"], answer: 0, points: 10 },
        { id: "Q-DSC-024-09", type: "MCQ", prompt: "What library is widely utilized in Python for benchmark matrix factorization and recommendation algorithms?", options: ["Surprise (or Implicit)", "NLTK", "OpenCV", "Gym"], answer: 0, points: 10 },
        { id: "Q-DSC-024-10", type: "MCQ", prompt: "What is 'Serendipity' in recommendation system performance evaluation?", options: ["The degree to which recommendations are both surprisingly novel and genuinely appealing to the user", "The speed of model inference", "The size of the user matrix", "The memory footprint of embeddings"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-DSC-025",
      title: "Time Series Forecasting Assessment",
      chapterId: "CH-DSC-025",
      courseId: "CRS-DSC-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-DSC-025-01", type: "MCQ", prompt: "What does statistical 'stationarity' require of a time series?", options: ["Constant mean, constant variance, and autocovariance that depends only on lag distance, not calendar time", "Values that never change", "Zero trend and zero values", "Monotonically increasing revenue"], answer: 0, points: 10 },
        { id: "Q-DSC-025-02", type: "MCQ", prompt: "What statistical hypothesis test checks whether a unit root is present in an autoregressive time series model?", options: ["Augmented Dickey-Fuller (ADF) test", "Student's t-test", "Chi-Square test", "Shapiro-Wilk test"], answer: 0, points: 10 },
        { id: "Q-DSC-025-03", type: "MCQ", prompt: "In an ARIMA(p, d, q) model, what does the parameter 'd' represent?", options: ["The order of integration / number of differencing operations required to make the series stationary", "The number of autoregressive lags", "The moving average window size", "The seasonal period"], answer: 0, points: 10 },
        { id: "Q-DSC-025-04", type: "MCQ", prompt: "What diagnostic plot reveals the direct correlation between observations separated by lag k while controlling for all shorter intervening lags?", options: ["Partial Autocorrelation Function (PACF)", "Autocorrelation Function (ACF)", "Scree plot", "Quantile-Quantile plot"], answer: 0, points: 10 },
        { id: "Q-DSC-025-05", type: "MCQ", prompt: "If a PACF cuts off sharply after lag 2 while the ACF tails off exponentially, what model order is indicated?", options: ["AR(2) / ARIMA(2, 0, 0)", "MA(2) / ARIMA(0, 0, 2)", "ARMA(2, 2)", "Random Walk"], answer: 0, points: 10 },
        { id: "Q-DSC-025-06", type: "MCQ", prompt: "What model extends ARIMA to handle repeating periodic seasonal patterns (e.g., weekly or monthly cycles)?", options: ["SARIMA (Seasonal ARIMA)", "Prophet", "Exponential Smoothing", "GARCH"], answer: 0, points: 10 },
        { id: "Q-DSC-025-07", type: "MCQ", prompt: "What column names does Facebook Prophet strictly require in the input DataFrame?", options: ["'ds' for timestamp and 'y' for the target variable", "'time' and 'value'", "'date' and 'target'", "'x' and 'y'"], answer: 0, points: 10 },
        { id: "Q-DSC-025-08", type: "MCQ", prompt: "What model family is specifically designed to forecast time-varying volatility and financial risk?", options: ["ARCH / GARCH models", "ARIMA", "Prophet", "Linear Regression"], answer: 0, points: 10 },
        { id: "Q-DSC-025-09", type: "MCQ", prompt: "What cross-validation strategy evaluates time series models without lookahead data leakage?", options: ["TimeSeriesSplit (Expanding / Rolling window walk-forward validation)", "StratifiedKFold", "ShuffleSplit", "LeaveOneOut"], answer: 0, points: 10 },
        { id: "Q-DSC-025-10", type: "MCQ", prompt: "What metric calculates the average absolute percentage deviation of forecasts relative to actual values?", options: ["MAPE (Mean Absolute Percentage Error)", "RMSE", "MAE", "R-squared"], answer: 0, points: 10 },
      ]
    }
  ]
};

