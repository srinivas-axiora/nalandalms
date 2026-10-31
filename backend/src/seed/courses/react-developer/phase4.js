export const phase4 = {
  "chapters": [
    {
      "id": "CH-RCT-020",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 20,
      "title": "Next.js App Router Architecture & Directory Conventions",
      "summary": "Master the modern Next.js App Router: file-based routing conventions, page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx, nested layouts, route groups (marketing), dynamic segments [id], and parallel/intercepting routes.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=vwSlYG7hFk0",
      "body": "<h2>1. The Evolution of Next.js: Pages to App Router</h2>\n<p>For years, Next.js utilized the <code>pages/</code> directory router. While revolutionary at its release, the Pages router had significant limitations: layouts were difficult to nest, data fetching had to occur exclusively at the top-level page boundary (via <code>getServerSideProps</code> or <code>getStaticProps</code>), and shipping all component JavaScript to the client was mandatory.</p>\n<p>Next.js introduced the <strong>App Router</strong> (rooted in <code>app/</code>), built from the ground up on React Server Components (RSC), nested layouts, and streaming architecture.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/vwSlYG7hFk0' title='Next.js App Router Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Special File Conventions in the App Router</h2>\n<p>In the App Router, only specific file names define routes and UI boundaries:</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>File Name</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Role & Responsibility</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Component Boundary</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>page.tsx</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Makes the directory publicly accessible as an addressable URL route.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>The unique content of that specific route.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>layout.tsx</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Shared UI across multiple routes (e.g., headers, sidebars). <strong>Preserves state and does not re-render on navigation</strong>.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Wraps child <code>page.tsx</code> or nested sub-layouts.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>loading.tsx</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Automated loading skeleton fallback UI.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Wraps child route in a React <code>&lt;Suspense&gt;</code> boundary automatically.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>error.tsx</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Catches runtime errors thrown during rendering and displays fallback error UI with a <code>reset()</code> retry button.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Must be a Client Component (<code>'use client'</code>). Wraps route in an Error Boundary.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>not-found.tsx</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Custom 404 UI invoked when route does not exist or when <code>notFound()</code> is called.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>HTTP 404 handler.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>3. Route Groups & Dynamic Segments</h2>\n<ul>\n  <li><strong>Route Groups <code>(groupName)</code>:</strong> Wrapping a folder name in parentheses (e.g., <code>app/(marketing)/about/page.tsx</code> and <code>app/(dashboard)/analytics/page.tsx</code>) organizes routes logically without affecting the public URL path. It allows different route groups to share completely separate root layouts!</li>\n  <li><strong>Dynamic Segments <code>[id]</code>:</strong> Matches dynamic URL parameters (e.g., <code>app/blog/[slug]/page.tsx</code> matches <code>/blog/react-19</code>, passing <code>params: { slug: 'react-19' }</code> to the page).</li>\n  <li><strong>Catch-all Segments <code>[...slug]</code>:</strong> Matches nested dynamic routes (e.g., <code>app/docs/[...slug]/page.tsx</code> matches <code>/docs/getting-started/installation</code>).</li>\n</ul>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>The App Router leverages React Server Components and file-system routing in the <code>app/</code> directory.</li>\n  <li><code>layout.tsx</code> preserves state and avoids re-rendering during navigation across sub-routes.</li>\n  <li><code>loading.tsx</code> automatically wraps routes in Suspense boundaries with skeleton loaders.</li>\n  <li><code>error.tsx</code> must be a client component and provides an interactive retry mechanism.</li>\n  <li>Route groups (folders in parentheses) partition layouts without altering public URL structures.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-021",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 21,
      "title": "React Server Components (RSC) vs Client Components",
      "summary": "Understand the React Server Components paradigm: the 'use client' directive, zero-bundle-size components, direct backend database access from components, interleaving server and client components, and serializable props.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=T8TZQ6k4b7U",
      "body": "<h2>1. The Mental Model of React Server Components (RSC)</h2>\n<p>For over a decade, all React components were Client Components: their JavaScript code was bundled, downloaded over the network, parsed by the browser, and executed on the user's CPU. As applications grew, JavaScript bundles ballooned to megabytes in size, degrading mobile Core Web Vitals and Time to Interactive (TTI).</p>\n<p><strong>React Server Components (RSC)</strong> run <strong>strictly on the server</strong>. Their component code is never sent to the browser; only the resulting HTML and lightweight virtual DOM JSON stream are transmitted. <strong>Zero bytes of JavaScript bundle overhead!</strong></p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/T8TZQ6k4b7U' title='React Server Components Explained' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Server Components vs Client Components Comparison</h2>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Capability / Feature</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Server Components (Default in App Router)</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Client Components (<code>'use client'</code>)</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Direct DB / Filesystem Access</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>YES.</strong> Can directly call <code>prisma.user.findMany()</code> or read files.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>NO.</strong> Must make asynchronous HTTP fetch requests to API endpoints.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>JS Bundle Impact</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>0 KB.</strong> Heavy markdown or date libraries never ship to the client.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Ships to the browser as part of the JavaScript bundle.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>React Hooks & State</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>NO.</strong> Cannot use <code>useState</code>, <code>useEffect</code>, or custom hooks.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>YES.</strong> Full support for <code>useState</code>, <code>useEffect</code>, context, etc.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Browser Events</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>NO.</strong> Cannot attach <code>onClick</code> or <code>onChange</code> handlers.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>YES.</strong> Full support for user interactivity and event listeners.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>3. The `'use client'` Directive: Defining the Boundary</h2>\n<p>In the Next.js App Router, all components inside <code>app/</code> are Server Components by default. Adding <code>'use client'</code> at the very top of a file declares a <strong>boundary between server and client code</strong>.</p>\n<p>Everything imported by a <code>'use client'</code> file is automatically bundled for the browser. Therefore, place <code>'use client'</code> as deep in your component tree as possible (e.g., on a specific interactive button or search bar) rather than at the top-level page.</p>\n\n<h2>4. Interleaving Server and Client Components (The Children Pattern)</h2>\n<p>A common misconception is that a Client Component cannot render a Server Component. While a Client Component cannot directly <em>import</em> a Server Component, it can accept it as <strong><code>children</code> or props</strong>:</p>\n<pre><code>// Client Component:\n'use client';\nexport function CollapsibleSidebar({ children }: { children: React.ReactNode }) {\n  const [isOpen, setIsOpen] = useState(true);\n  return (\n    &lt;aside&gt;\n      &lt;button onClick={() => setIsOpen(!isOpen)}&gt;Toggle&lt;/button&gt;\n      {isOpen && children} {/* Server Component rendered inside! */}\n    &lt;/aside&gt;\n  );\n}\n\n// Server Component Page:\nexport default async function Page() {\n  return (\n    &lt;CollapsibleSidebar&gt;\n      &lt;ServerRenderedUserFeed /&gt; {/* Runs on server, 0 KB bundle! */}\n    &lt;/CollapsibleSidebar&gt;\n  );\n}</code></pre>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>Server Components execute exclusively on the server, contributing zero KB to client JavaScript bundles.</li>\n  <li>They can directly query databases and internal filesystems without intermediate REST API layers.</li>\n  <li>Use Client Components (<code>'use client'</code>) when you need state, effects, or browser event listeners.</li>\n  <li>Push client boundaries down to leaves of the component tree to maximize server rendering benefits.</li>\n  <li>Pass Server Components as <code>children</code> props into Client Components to interleave server and client code cleanly.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-022",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 22,
      "title": "Server Actions & Full Stack Mutation Architecture",
      "summary": "Build full-stack React applications without writing API routes: the 'use server' directive, executing Server Actions from client components, form validation, revalidating cache with revalidatePath and revalidateTag, and security safeguards.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=dDpZfOQBMaU",
      "body": "<h2>1. The Server Actions Revolution</h2>\n<p>Traditionally, mutating database records from a React interface required writing three distinct pieces of code: an API route handler (e.g., <code>/api/update-user</code> in Express or Next.js), client fetch logic with headers and serialization, and response state handling.</p>\n<p><strong>Next.js Server Actions</strong> allow you to define asynchronous server-side functions that can be called directly from your client components or native HTML forms. Behind the scenes, Next.js handles the POST endpoint generation, serialization, security tokens, and cache invalidation automatically.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/dDpZfOQBMaU' title='Next.js Server Actions Tutorial' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Defining and Invoking Server Actions</h2>\n<p>Server Actions are designated with the <code>'use server'</code> directive at the top of a file or function:</p>\n<pre><code>// app/actions/todos.ts\n'use server';\n\nimport { db } from '@/lib/db';\nimport { revalidatePath } from 'next/cache';\n\nexport async function createTodo(formData: FormData) {\n  const title = formData.get('title') as string;\n\n  // 1. Direct database mutation on the server!\n  await db.todo.create({ data: { title, completed: false } });\n\n  // 2. Revalidate the cached page so users immediately see the new item\n  revalidatePath('/todos');\n}</code></pre>\n\n<h2>3. Cache Invalidation: `revalidatePath` and `revalidateTag`</h2>\n<p>When a Server Action mutates the database, Next.js must know which cached pages or queries to update:</p>\n<ul>\n  <li><strong><code>revalidatePath(path)</code>:</strong> Purges the server cache for a specific route (e.g., <code>revalidatePath('/dashboard')</code>) or layout, regenerating the UI on the next request.</li>\n  <li><strong><code>revalidateTag(tag)</code>:</strong> Revalidates specific data fetches tagged with custom cache keys (e.g., <code>fetch(url, { next: { tags: ['products'] } })</code>), providing fine-grained cache purging across multiple pages.</li>\n</ul>\n\n<h2>4. Security: Treating Server Actions as Public Endpoints</h2>\n<p>A critical security mandate: <strong>Server Actions are publicly accessible HTTP POST endpoints</strong>. You must never assume a Server Action can only be called by your frontend UI. Malicious actors can discover the action ID and invoke it directly via curl or scripts.</p>\n<h3>Security Checklist:</h3>\n<ol>\n  <li><strong>Always Authenticate:</strong> Verify user session and permissions at the very start of the Server Action (e.g., <code>const session = await auth(); if (!session) throw new Error('Unauthorized');</code>).</li>\n  <li><strong>Validate Input Payloads:</strong> Always parse incoming form data with Zod schemas to prevent SQL injection or schema poisoning.</li>\n</ol>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>Server Actions allow client interfaces to invoke backend functions directly without manual API routes.</li>\n  <li>Designated using the <code>'use server'</code> directive.</li>\n  <li><code>revalidatePath</code> and <code>revalidateTag</code> automatically refresh server-rendered cache.</li>\n  <li>Server Actions work with progressive enhancement, executing even if JavaScript has not loaded.</li>\n  <li>Always authenticate users and validate inputs with Zod inside Server Actions to prevent unauthorized attacks.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-023",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 23,
      "title": "Rendering Strategies: SSR, SSG, ISR & Streaming",
      "summary": "Deliver optimal web performance: Static Site Generation (SSG), dynamic Server-Side Rendering (SSR), Incremental Static Regeneration (ISR), and React Suspense Streaming with Selective Hydration.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=99h_93R7G70",
      "body": "<h2>1. The Four Modern Rendering Paradigms</h2>\n<p>Choosing the correct rendering strategy is the single most important architectural decision for optimizing Google Core Web Vitals (LCP, TTFB) and reducing server infrastructure costs:</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Rendering Strategy</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>When HTML is Generated</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>TTFB & Server Cost</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Ideal Use Case</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Static Site Generation (SSG)</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>At build time. HTML is uploaded to a global Edge CDN.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Blazing fast TTFB (&lt; 50ms). Zero origin server load.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Marketing pages, blogs, documentation, legal terms.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Server-Side Rendering (SSR)</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>On-demand per request at runtime on the server.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Higher TTFB (150-400ms). Continuous server compute costs.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Personalized user dashboards, real-time banking feeds.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Incremental Static Regeneration (ISR)</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Static at build, regenerated in the background on interval or on demand.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Edge CDN speed with fresh content updates.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>E-commerce product catalogs (100,000+ SKUs).</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Suspense Streaming SSR</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Initial HTML sent immediately; slow blocks stream into the browser as resolved.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Instant initial paint; progressive selective hydration.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Complex portals with fast headers and slow data analytics charts.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>2. Incremental Static Regeneration (ISR) Architecture</h2>\n<p>ISR provides the best of both worlds: CDN speed with automatic data freshness:</p>\n<pre><code>// In App Router: revalidate every 60 seconds\nexport const revalidate = 60;\n\nexport default async function ProductPage({ params }: { params: { id: string } }) {\n  const product = await db.product.findUnique({ where: { id: params.id } });\n  return &lt;ProductDetails product={product} /&gt;;\n}</code></pre>\n\n<h2>3. Streaming SSR & Selective Hydration</h2>\n<p>Traditionally, if a page had one slow database query (taking 2 seconds), the entire page was blocked from rendering. <strong>Streaming SSR with React Suspense</strong> sends the fast shell immediately while streaming slow content chunks as they finish:</p>\n<pre><code>export default function Dashboard() {\n  return (\n    &lt;main&gt;\n      &lt;FastHeader /&gt; {/* Instant TTFB */}\n      &lt;Suspense fallback={&lt;SkeletonTable /&gt;}&gt;\n        &lt;SlowAnalyticsFeed /&gt; {/* Streams in when ready! */}\n      &lt;/Suspense&gt;\n    &lt;/main&gt;\n  );\n}</code></pre>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>SSG serves static HTML from Edge CDNs with near-zero latency and minimal server costs.</li>\n  <li>SSR dynamically generates pages per request for personalized user content.</li>\n  <li>ISR re-generates static pages in the background without requiring full application rebuilds.</li>\n  <li>Suspense streaming prevents slow database queries from blocking the initial page paint.</li>\n  <li>Selective hydration hydrates interactive components progressively as they stream into the browser.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-024",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 24,
      "title": "Routing Middleware, Authentication & Route Handlers",
      "summary": "Secure Next.js applications: Edge Middleware architecture, JWT token verification, route redirects, custom API Route Handlers (GET, POST, PATCH), CORS headers, and session cookies.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=DJvM2lspn6w",
      "body": "<h2>1. The Architecture of Next.js Middleware</h2>\n<p>Next.js <strong>Middleware</strong> executes code <em>before a request is completed</em>. Positioned at the very edge of your application (running in the V8 Edge Runtime or Node.js), middleware allows you to intercept incoming HTTP requests, verify authentication cookies, rewrite paths, and enforce access control before a single byte of React or database code runs.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/DJvM2lspn6w' title='Next.js Middleware and Auth Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Implementing Route Protection Middleware</h2>\n<pre><code>// middleware.ts (Root of project)\nimport { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  const token = request.cookies.get('session-token')?.value;\n  const isAuthPage = request.nextUrl.pathname.startsWith('/login');\n  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard');\n\n  if (isProtectedPage && !token) {\n    // Redirect unauthenticated users to login with a return-to parameter\n    const loginUrl = new URL('/login', request.url);\n    loginUrl.searchParams.set('from', request.nextUrl.pathname);\n    return NextResponse.redirect(loginUrl);\n  }\n\n  if (isAuthPage && token) {\n    return NextResponse.redirect(new URL('/dashboard', request.url));\n  }\n\n  return NextResponse.next();\n}\n\n// Configure matcher to run only on relevant routes (excluding static assets and images)\nexport const config = {\n  matcher: ['/dashboard/:path*', '/login'],\n};</code></pre>\n\n<h2>3. Modern API Route Handlers (`route.ts`)</h2>\n<p>When you need to provide public Webhook receivers (e.g., Stripe payment webhooks) or REST endpoints for third-party consumers, Next.js provides <strong>Route Handlers</strong> using standard Web Request/Response objects:</p>\n<pre><code>// app/api/webhook/stripe/route.ts\nimport { NextResponse } from 'next/server';\n\nexport async function POST(request: Request) {\n  const payload = await request.text();\n  const signature = request.headers.get('stripe-signature');\n\n  try {\n    // Verify stripe cryptographic signature and process event\n    return NextResponse.json({ received: true }, { status: 200 });\n  } catch (err) {\n    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });\n  }\n}</code></pre>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>Middleware runs at the network edge before requests hit page rendering or database layers.</li>\n  <li>Use middleware for session verification, geolocation routing, and unauthorized redirects.</li>\n  <li>Configure strict <code>matcher</code> paths to prevent middleware from running on static image files.</li>\n  <li>Route Handlers (<code>route.ts</code>) provide standard Web API HTTP endpoints (GET, POST, PATCH).</li>\n  <li>Store authentication tokens in <code>HttpOnly, Secure, SameSite=Lax</code> cookies for defense in depth.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-025",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 25,
      "title": "SEO, Metadata API, OpenGraph & Image Optimization",
      "summary": "Maximize search rankings and visual performance: the static and dynamic Next.js Metadata API, generateMetadata for dynamic routes, OpenGraph social preview generation, next/image layout shift elimination, and WebP/AVIF formatting.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=gp_j383lI3A",
      "body": "<h2>1. The Modern Next.js Metadata Architecture</h2>\n<p>In the legacy Pages router, managing SEO tags required injecting <code>&lt;Head&gt;</code> components into individual pages. In the App Router, Next.js provides a first-class, type-safe <strong>Metadata API</strong> that guarantees search engine crawlers receive complete title tags, meta descriptions, canonical URLs, and OpenGraph social cards.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/gp_j383lI3A' title='Next.js SEO and Image Optimization' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Static vs Dynamic Metadata</h2>\n<h3>1. Static Metadata (Defined on Pages or Layouts):</h3>\n<pre><code>import type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  title: {\n    template: '%s | Nalanda LMS',\n    default: 'Nalanda Academy — Enterprise Learning Platform',\n  },\n  description: 'World-class corporate learning and development masterclasses.',\n  openGraph: {\n    type: 'website',\n    images: ['/og-image.png'],\n  },\n};</code></pre>\n\n<h3>2. Dynamic Metadata with `generateMetadata`:</h3>\n<pre><code>export async function generateMetadata({ params }: Props): Promise&lt;Metadata&gt; {\n  const course = await db.course.findUnique({ where: { id: params.id } });\n  return {\n    title: course.title,\n    description: course.summary,\n    openGraph: {\n      title: course.title,\n      images: [{ url: course.thumbnailUrl }],\n    },\n  };\n}</code></pre>\n\n<h2>3. Image Optimization with `next/image`</h2>\n<p>Images account for over 50% of typical web page payload. Serving uncompressed JPEGs ruins Cumulative Layout Shift (CLS) and Largest Contentful Paint (LCP). <strong><code>next/image</code></strong> provides automated visual performance:</p>\n<ul>\n  <li><strong>Layout Shift Prevention:</strong> Mandates explicit width/height dimensions or <code>fill</code> to allocate bounding boxes before images load, completely eliminating layout shifting.</li>\n  <li><strong>Modern Image Formats:</strong> Automatically serves modern <strong>AVIF and WebP</strong> formats based on client browser capability headers.</li>\n  <li><strong>Device Sizing:</strong> Dynamically serves smaller image resolutions to mobile devices using responsive <code>srcset</code> attributes.</li>\n</ul>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>The Metadata API provides type-safe, centralized control over document heads and social cards.</li>\n  <li><code>generateMetadata</code> dynamically generates SEO tags for parameterized database routes.</li>\n  <li><code>next/image</code> eliminates Cumulative Layout Shift (CLS) by pre-allocating aspect ratio boxes.</li>\n  <li>Automated format conversion serves WebP and AVIF images, cutting payload sizes by up to 70%.</li>\n  <li>Implement OpenGraph images to maximize click-through rates on Slack, Twitter, and LinkedIn shares.</li>\n</ol>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-RCT-020",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-020",
      "title": "Assessment: Next.js App Router Architecture & Conventions",
      "summary": "Test your understanding of App Router file conventions, nested layouts, loading states, error boundaries, and route groups.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-191",
          "question": "What is the defining behavior of `layout.tsx` during page navigation across nested child routes in Next.js?",
          "options": [
            "It re-renders completely from scratch on every route click.",
            "It preserves component state, maintains scroll position, and does NOT re-render during child navigation, keeping shared headers and sidebars persistent.",
            "It reloads the browser.",
            "It can only be used once in the entire application."
          ],
          "correctIndex": 1,
          "explanation": "Layouts preserve their state and avoid re-rendering across nested page navigations, providing seamless app-like performance."
        },
        {
          "id": "Q-RCT-192",
          "question": "Which file automatically wraps its corresponding `page.tsx` in a React `<Suspense>` boundary to show instant loading skeletons?",
          "options": [
            "`skeleton.tsx`",
            "`loading.tsx`",
            "`spinner.tsx`",
            "`pending.tsx`"
          ],
          "correctIndex": 1,
          "explanation": "`loading.tsx` is an automated convention that injects a Suspense boundary wrapping the route while server data fetches."
        },
        {
          "id": "Q-RCT-193",
          "question": "Why must `error.tsx` explicitly include the `'use client'` directive at the top of the file?",
          "options": [
            "Because errors only occur on client devices.",
            "Because React Error Boundaries rely on client-side component lifecycle methods to catch rendering errors and provide recovery mechanisms (like a `reset()` button).",
            "Because Node.js does not support errors.",
            "It is a bug in Next.js."
          ],
          "correctIndex": 1,
          "explanation": "Error Boundaries require client-side execution to catch errors and execute interactive reset attempts."
        },
        {
          "id": "Q-RCT-194",
          "question": "What is the purpose of Route Groups (e.g., `app/(marketing)/about/page.tsx`)?",
          "options": [
            "To group routes for marketing campaigns.",
            "To organize route directories logically without affecting the public URL path, allowing different sections of the app to share distinct root layouts.",
            "To password-protect pages.",
            "To compress images."
          ],
          "correctIndex": 1,
          "explanation": "Parentheses in folder names exempt the folder from the public URL path, enabling multiple isolated layouts (e.g., marketing vs dashboard)."
        },
        {
          "id": "Q-RCT-195",
          "question": "What is the file name required to make a folder publicly accessible as an addressable URL route in the App Router?",
          "options": [
            "`index.tsx`",
            "`page.tsx`",
            "`route.tsx`",
            "`view.tsx`"
          ],
          "correctIndex": 1,
          "explanation": "Only folders containing a `page.tsx` file are exposed as public addressable routes in the App Router."
        },
        {
          "id": "Q-RCT-196",
          "question": "How do you define a Dynamic Segment route for user profiles in Next.js?",
          "options": [
            "`app/profile/:id/page.tsx`",
            "`app/profile/[id]/page.tsx`",
            "`app/profile/$id/page.tsx`",
            "`app/profile/{id}/page.tsx`"
          ],
          "correctIndex": 1,
          "explanation": "Square brackets (`[param]`) designate dynamic segment parameters in Next.js file-system routing."
        },
        {
          "id": "Q-RCT-197",
          "question": "What function can be invoked inside a Server Component to programmatically trigger the `not-found.tsx` UI?",
          "options": [
            "`throw404()`",
            "`notFound()` from `next/navigation`",
            "`abort()`",
            "`redirect('/404')`"
          ],
          "correctIndex": 1,
          "explanation": "Calling `notFound()` terminates the render and renders the closest matching `not-found.tsx` boundary."
        },
        {
          "id": "Q-RCT-198",
          "question": "What is the difference between `layout.tsx` and `template.tsx` in Next.js?",
          "options": [
            "They are identical.",
            "`layout.tsx` preserves state across navigation; `template.tsx` creates a new instance and resets state on every navigation.",
            "`template.tsx` is only for emails.",
            "`layout.tsx` cannot be styled."
          ],
          "correctIndex": 1,
          "explanation": "Templates re-mount and reset state on route changes, which is useful for page entrance animations or logging view events."
        },
        {
          "id": "Q-RCT-199",
          "question": "Can multiple `layout.tsx` files be nested within a single route hierarchy?",
          "options": [
            "No, only one layout is allowed per application.",
            "Yes, layouts nest hierarchically; the root layout wraps child layouts, which wrap individual pages.",
            "Only in development mode.",
            "Only if written in JavaScript."
          ],
          "correctIndex": 1,
          "explanation": "Layouts compose naturally, allowing a global root layout to enclose a dashboard layout, which encloses settings pages."
        },
        {
          "id": "Q-RCT-200",
          "question": "What component is used for client-side navigation between routes in Next.js to ensure fast prefetching?",
          "options": [
            "`<a href='...'>`",
            "`<Link href='...'>` from `next/link`",
            "`<Navigate to='...'>`",
            "`<Route path='...'>`"
          ],
          "correctIndex": 1,
          "explanation": "`next/link` intercepts clicks for client-side routing and automatically prefetches route code when links enter the viewport."
        }
      ]
    },
    {
      "id": "ASM-RCT-021",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-021",
      "title": "Assessment: React Server Components vs Client Components",
      "summary": "Evaluate your understanding of the RSC paradigm, zero-bundle overhead, direct database queries, the 'use client' boundary, and interleaving components.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-201",
          "question": "What is the JavaScript bundle impact of a React Server Component (RSC) when downloaded by the user's browser?",
          "options": [
            "100 KB per component",
            "Exactly 0 KB (their JavaScript code never ships to the client; only the rendered virtual DOM output is sent)",
            "The same size as standard client components",
            "It depends on the user's internet speed"
          ],
          "correctIndex": 1,
          "explanation": "Server components execute exclusively on the server; zero bytes of component JavaScript are included in client bundles."
        },
        {
          "id": "Q-RCT-202",
          "question": "Can a React Server Component query a database directly using Prisma or SQL?",
          "options": [
            "No, React components cannot touch databases.",
            "Yes, because Server Components execute on the backend server, they can directly execute database queries, file reads, and microservice calls.",
            "Only on Tuesdays.",
            "Only if wrapped in a Redux thunk."
          ],
          "correctIndex": 1,
          "explanation": "Because RSCs run on Node.js/Edge runtimes, they have direct access to backend resources without intermediate HTTP API endpoints."
        },
        {
          "id": "Q-RCT-203",
          "question": "What does placing `'use client'` at the top of a file do in Next.js?",
          "options": [
            "It turns off server-side rendering entirely.",
            "It marks a boundary declaring that this component and any modules it imports are intended for client execution, enabling state, effects, and event listeners.",
            "It makes the page public.",
            "It compiles the code to WebAssembly."
          ],
          "correctIndex": 1,
          "explanation": "`'use client'` establishes the boundary where code transitions from server execution to client bundling."
        },
        {
          "id": "Q-RCT-204",
          "question": "Which of the following can be used inside a React Server Component?",
          "options": [
            "`useState`",
            "`useEffect`",
            "Standard `async/await` syntax for fetching data directly during render",
            "`onClick` event listeners"
          ],
          "correctIndex": 2,
          "explanation": "Server components can be declared as `async function` and `await` promises directly during render, but cannot use client state or event handlers."
        },
        {
          "id": "Q-RCT-205",
          "question": "How can a Client Component contain and display a React Server Component without forcing that Server Component to become a client component?",
          "options": [
            "By importing it with an alias.",
            "By passing the Server Component as a `children` prop (or other ReactNode prop) into the Client Component from a parent Server Component.",
            "It is technically impossible.",
            "By using an `<iframe>`."
          ],
          "correctIndex": 1,
          "explanation": "The children pattern allows Client Components to wrap Server Components without bundling the Server Component's code into the client."
        },
        {
          "id": "Q-RCT-206",
          "question": "Why can't you pass a JavaScript function as a prop from a Server Component to a Client Component?",
          "options": [
            "Because functions are too long.",
            "Props crossing the Server-Client boundary must be serializable across the network (like JSON); plain functions cannot be serialized across network boundaries.",
            "Because React 19 bans functions.",
            "Because TypeScript forbids it."
          ],
          "correctIndex": 1,
          "explanation": "Data crossing the network boundary between server and client must be serializable (objects, strings, arrays, booleans, or Server Actions)."
        },
        {
          "id": "Q-RCT-207",
          "question": "Where should `'use client'` be placed within your component tree for optimal performance?",
          "options": [
            "At the very top of `layout.tsx`.",
            "As deep down the component tree as possible (on specific interactive leaves like buttons, search bars, and carousels) to maximize server-rendered HTML.",
            "On every single file.",
            "It does not matter."
          ],
          "correctIndex": 1,
          "explanation": "Keeping client boundaries at the leaves ensures the majority of the application remains lightweight server components."
        },
        {
          "id": "Q-RCT-208",
          "question": "What format does the server stream to the client when rendering React Server Components?",
          "options": [
            "Raw unformatted C++ binaries.",
            "An RSC payload stream containing rendered virtual DOM representations and references to client components.",
            "Pure static PNG screenshots.",
            "SQL table dumps."
          ],
          "correctIndex": 1,
          "explanation": "The RSC stream is a compact representation of the component tree that the client reconciles with existing DOM state."
        },
        {
          "id": "Q-RCT-209",
          "question": "Can heavy libraries (like date-fns, markdown parsers, syntax highlighters) be used in Server Components without increasing client bundle size?",
          "options": [
            "No, all libraries increase bundle size.",
            "Yes, because the library runs only on the server to generate HTML, its code is never included in the client JavaScript bundle.",
            "Only if they are under 5 KB.",
            "Only with Redux."
          ],
          "correctIndex": 1,
          "explanation": "Dependencies imported by Server Components remain on the server, allowing rich libraries without client bundle bloat."
        },
        {
          "id": "Q-RCT-210",
          "question": "What happens if a Server Component accidentally calls `window.localStorage`?",
          "options": [
            "It works normally.",
            "It throws a runtime error because `window` does not exist in the server execution environment.",
            "The browser opens a new tab.",
            "It writes to the server hard drive."
          ],
          "correctIndex": 1,
          "explanation": "Server components execute in Node.js/Edge environments where browser globals like `window` and `document` do not exist."
        }
      ]
    },
    {
      "id": "ASM-RCT-022",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-022",
      "title": "Assessment: Server Actions & Full Stack Mutation Architecture",
      "summary": "Test your skills in Next.js Server Actions, 'use server', cache invalidation with revalidatePath and revalidateTag, and security safeguards.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-211",
          "question": "What directive designates a file or function as a Next.js Server Action?",
          "options": [
            "`'use client'`",
            "`'use server'`",
            "`'use backend'`",
            "`'use action'`"
          ],
          "correctIndex": 1,
          "explanation": "`'use server'` instructs Next.js to expose the function as an actionable server-side mutation endpoint."
        },
        {
          "id": "Q-RCT-212",
          "question": "How do Server Actions eliminate the need for manual API routes in Next.js?",
          "options": [
            "By deleting the server.",
            "They allow client components and forms to invoke backend server functions directly via RPC (Remote Procedure Call) generated automatically by Next.js.",
            "By using WebSockets exclusively.",
            "They only work with local mock data."
          ],
          "correctIndex": 1,
          "explanation": "Server Actions create an automated RPC bridge, managing network POST requests behind regular async function calls."
        },
        {
          "id": "Q-RCT-213",
          "question": "What does calling `revalidatePath('/dashboard')` inside a Server Action do?",
          "options": [
            "Deletes the dashboard page.",
            "Purges the server cache for that route, causing the server to regenerate fresh data and update the client UI seamlessly.",
            "Logs the user out.",
            "Closes the browser."
          ],
          "correctIndex": 1,
          "explanation": "`revalidatePath` tells Next.js the specified route's cached data is stale, prompting an immediate server revalidation."
        },
        {
          "id": "Q-RCT-214",
          "question": "What is `revalidateTag(tag)` in Next.js caching architecture?",
          "options": [
            "A tag for categorizing blog posts.",
            "A function that invalidates all cached fetch requests marked with that specific cache tag across all pages.",
            "A Git commit tag.",
            "A CSS class selector."
          ],
          "correctIndex": 1,
          "explanation": "Tag-based revalidation allows targeted cache purging for specific data entities (e.g., `'products'`) across multiple different routes."
        },
        {
          "id": "Q-RCT-215",
          "question": "Why is treating Server Actions as private, unhackable internal functions a dangerous security vulnerability?",
          "options": [
            "Because Server Actions are public HTTP POST endpoints that can be invoked directly by external scripts or malicious actors with arbitrary parameters.",
            "Because Next.js has no security features.",
            "Because Server Actions are stored in cookies.",
            "It is not a vulnerability; Server Actions are 100% private."
          ],
          "correctIndex": 0,
          "explanation": "Every Server Action is an exposed HTTP POST route; developers must always authenticate users and validate inputs inside the action."
        },
        {
          "id": "Q-RCT-216",
          "question": "What library should be used inside Server Actions to validate incoming `FormData` payloads?",
          "options": [
            "Zod",
            "Photoshop",
            "jQuery",
            "Babel"
          ],
          "correctIndex": 0,
          "explanation": "Validating input payloads with Zod ensures types, string lengths, and schema invariants are strictly enforced before database queries."
        },
        {
          "id": "Q-RCT-217",
          "question": "What is 'Progressive Enhancement' in the context of Server Actions?",
          "options": [
            "The ability for native HTML `<form action={serverAction}>` to submit successfully and execute on the server even if JavaScript has not loaded or is disabled.",
            "Adding animations to buttons.",
            "Upgrading the computer CPU.",
            "Improving internet speed."
          ],
          "correctIndex": 0,
          "explanation": "Because Server Actions bind to native HTML forms, they can submit via standard HTTP POST before client JavaScript executes."
        },
        {
          "id": "Q-RCT-218",
          "question": "How can you pass additional arguments (like an item ID) to a Server Action used inside a form?",
          "options": [
            "Put them in a global variable.",
            "Use `const actionWithId = serverAction.bind(null, itemId);` or hidden `<input type='hidden' name='id' value={itemId} />`.",
            "It cannot be done.",
            "Pass them via CSS classes."
          ],
          "correctIndex": 1,
          "explanation": "Using `.bind(null, id)` or hidden form inputs passes bound arguments securely into the server action handler."
        },
        {
          "id": "Q-RCT-219",
          "question": "Can a Server Action redirect the user to a different page upon successful completion?",
          "options": [
            "No, Server Actions cannot redirect.",
            "Yes, by calling `redirect('/new-page')` from `next/navigation`.",
            "Only on mobile devices.",
            "Only using `window.location`."
          ],
          "correctIndex": 1,
          "explanation": "`redirect()` throws a special Next.js redirect exception that instructs the framework to transition routes automatically."
        },
        {
          "id": "Q-RCT-220",
          "question": "What happens if a Server Action throws an unhandled error?",
          "options": [
            "The database is deleted.",
            "The action returns an error to the client, which can be captured by `useActionState` or an Error Boundary.",
            "The server shuts down.",
            "The user's computer reboots."
          ],
          "correctIndex": 1,
          "explanation": "Server Action errors are captured by transition boundaries, shielding users from raw stack traces while providing error state."
        }
      ]
    },
    {
      "id": "ASM-RCT-023",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-023",
      "title": "Assessment: Rendering Strategies: SSR, SSG, ISR & Streaming",
      "summary": "Evaluate your mastery of Static Site Generation, Server-Side Rendering, Incremental Static Regeneration, and Suspense Streaming.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-221",
          "question": "Which rendering strategy delivers the lowest Time to First Byte (TTFB) and handles massive traffic spikes with near-zero origin server load?",
          "options": [
            "Server-Side Rendering (SSR)",
            "Static Site Generation (SSG) served from global Edge CDNs",
            "Client-Side Rendering (CSR)",
            "Polling"
          ],
          "correctIndex": 1,
          "explanation": "Pre-generated static HTML files cached at edge CDN points of presence serve requests in milliseconds without touching origin servers."
        },
        {
          "id": "Q-RCT-222",
          "question": "How does Incremental Static Regeneration (ISR) differ from traditional Static Site Generation (SSG)?",
          "options": [
            "ISR does not use HTML.",
            "SSG requires rebuilding the entire website to update a single page; ISR regenerates static pages in the background on-demand or after a time interval without a full build.",
            "ISR only works for images.",
            "SSG is faster than ISR."
          ],
          "correctIndex": 1,
          "explanation": "ISR allows millions of static pages (e.g., e-commerce products) to be updated or generated incrementally on the fly without multi-hour builds."
        },
        {
          "id": "Q-RCT-223",
          "question": "What problem does React Suspense Streaming SSR solve for pages with slow database queries?",
          "options": [
            "It turns off database security.",
            "Traditionally, a slow query blocked the entire HTML page from rendering; Streaming sends the fast shell immediately and streams in the slow components as they finish.",
            "It makes slow queries run 100x faster.",
            "It compresses video files."
          ],
          "correctIndex": 1,
          "explanation": "Streaming breaks monolithic page rendering into chunks, delivering instant initial paints and streaming delayed sub-components smoothly."
        },
        {
          "id": "Q-RCT-224",
          "question": "What is 'Selective Hydration' in React's streaming architecture?",
          "options": [
            "Drinking water during coding.",
            "React can begin hydrating interactive components on the page even before the rest of the HTML has finished streaming over the network.",
            "Hydrating only mobile users.",
            "Hydrating only images."
          ],
          "correctIndex": 1,
          "explanation": "Selective Hydration hydrates available components early, allowing users to interact with buttons without waiting for the full page stream."
        },
        {
          "id": "Q-RCT-225",
          "question": "How do you configure a route to revalidate via ISR every 60 seconds in the Next.js App Router?",
          "options": [
            "`export const revalidate = 60;`",
            "`setInterval(() => refresh(), 60000);`",
            "`export const timer = 60;`",
            "`<meta refresh='60' />`"
          ],
          "correctIndex": 0,
          "explanation": "Declaring `export const revalidate = 60;` sets the ISR cache lifetime for that route segment to 60 seconds."
        },
        {
          "id": "Q-RCT-226",
          "question": "When is dynamic Server-Side Rendering (SSR) mandatory over static generation?",
          "options": [
            "For a public marketing blog.",
            "When the page content depends on real-time request-specific data, such as authentication session cookies, request headers, or personalized user feeds.",
            "For static documentation.",
            "For a privacy policy page."
          ],
          "correctIndex": 1,
          "explanation": "When pages vary per user based on request cookies or live queries, on-demand SSR is required."
        },
        {
          "id": "Q-RCT-227",
          "question": "What is the Next.js directive to force a route to be evaluated dynamically at runtime?",
          "options": [
            "`export const dynamic = 'force-dynamic';`",
            "`export const mode = 'ssr';`",
            "`export const static = false;`",
            "`export const realtime = true;`"
          ],
          "correctIndex": 0,
          "explanation": "`export const dynamic = 'force-dynamic'` instructs Next.js to bypass static optimization and render dynamically per request."
        },
        {
          "id": "Q-RCT-228",
          "question": "What is 'Stale-While-Revalidate' at the Edge CDN layer during ISR?",
          "options": [
            "The CDN serves the cached version immediately to the visitor while triggering a background task to regenerate the page for subsequent visitors.",
            "The CDN returns an error.",
            "The CDN reboots.",
            "The CDN redirects to Google."
          ],
          "correctIndex": 0,
          "explanation": "Users experience zero wait time by receiving cached HTML while the CDN regenerates fresh pages asynchronously."
        },
        {
          "id": "Q-RCT-229",
          "question": "How does `generateStaticParams()` function in the App Router?",
          "options": [
            "It generates random passwords.",
            "It defines the list of dynamic route parameters (e.g., `[id]`) to pre-render statically at build time rather than on demand.",
            "It compiles CSS files.",
            "It creates user accounts."
          ],
          "correctIndex": 1,
          "explanation": "`generateStaticParams` replaces `getStaticPaths`, specifying which dynamic IDs should be pre-built statically."
        },
        {
          "id": "Q-RCT-230",
          "question": "What happens if a user visits a dynamic route that was NOT pre-rendered in `generateStaticParams` when `dynamicParams = true`?",
          "options": [
            "Next.js renders a 404 page.",
            "Next.js generates the page on demand on the server for that first visitor and caches it for all subsequent visitors.",
            "The server crashes.",
            "The user is redirected home."
          ],
          "correctIndex": 1,
          "explanation": "On-demand generation builds missing routes on the fly and adds them to the static cache automatically."
        }
      ]
    },
    {
      "id": "ASM-RCT-024",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-024",
      "title": "Assessment: Middleware, Authentication & Route Handlers",
      "summary": "Test your skills in Next.js Edge Middleware, session verification, redirect logic, Route Handlers (route.ts), and secure cookies.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-231",
          "question": "Where does Next.js `middleware.ts` execute relative to incoming HTTP requests?",
          "options": [
            "After the React component has finished rendering.",
            "At the network edge before the request reaches any page, route handler, or database query.",
            "Inside the client's browser.",
            "Only during build time."
          ],
          "correctIndex": 1,
          "explanation": "Middleware intercepts requests at the earliest possible stage, allowing instantaneous authentication and routing decisions."
        },
        {
          "id": "Q-RCT-232",
          "question": "Why is verifying session tokens in Middleware advantageous over checking them inside each page component?",
          "options": [
            "It saves CSS bandwidth.",
            "It stops unauthorized users at the perimeter, preventing the server from executing expensive database queries or rendering confidential component trees.",
            "It makes the page load slower.",
            "Middleware is required by law."
          ],
          "correctIndex": 1,
          "explanation": "Perimeter enforcement rejects unauthorized requests immediately, saving server compute and protecting sensitive data."
        },
        {
          "id": "Q-RCT-233",
          "question": "What runtime environment does Next.js Middleware run on by default?",
          "options": [
            "Full Node.js with native C++ bindings.",
            "The V8 Edge Runtime (a lightweight, ultra-fast JavaScript environment that excludes heavy Node.js APIs like `fs`).",
            "Python 3.11.",
            "A browser WebWorker."
          ],
          "correctIndex": 1,
          "explanation": "The Edge Runtime is stripped down for instantaneous cold starts, running globally on distributed edge nodes."
        },
        {
          "id": "Q-RCT-234",
          "question": "How do you prevent Next.js Middleware from executing on static assets (images, fonts, favicon)?",
          "options": [
            "By deleting the images.",
            "By configuring a path `matcher` regex in `export const config = { matcher: [...] }` that excludes `_next/static`, `_next/image`, and asset extensions.",
            "By renaming `middleware.ts`.",
            "Middleware never runs on assets."
          ],
          "correctIndex": 1,
          "explanation": "A clean `matcher` regex ensures middleware only executes on addressable application routes, avoiding performance penalties on asset requests."
        },
        {
          "id": "Q-RCT-235",
          "question": "In Next.js App Router, what file name is used to create custom API endpoints?",
          "options": [
            "`api.ts`",
            "`route.ts`",
            "`endpoint.ts`",
            "`server.ts`"
          ],
          "correctIndex": 1,
          "explanation": "`route.ts` defines HTTP route handlers (GET, POST, PUT, DELETE, PATCH) inside the `app/` directory."
        },
        {
          "id": "Q-RCT-236",
          "question": "Can a `page.tsx` and a `route.ts` file coexist inside the exact same folder directory?",
          "options": [
            "Yes, they work together automatically.",
            "No, a directory can have either a `page.tsx` (for UI) or a `route.ts` (for API), but never both at the same route path.",
            "Only on Windows.",
            "Only if named differently."
          ],
          "correctIndex": 1,
          "explanation": "Next.js routes can either serve an HTML page or handle raw API requests, so `page.tsx` and `route.ts` conflict at identical paths."
        },
        {
          "id": "Q-RCT-237",
          "question": "What security flags should be configured on authentication session cookies?",
          "options": [
            "`HttpOnly: false, Secure: false`",
            "`HttpOnly: true, Secure: true, SameSite: 'Lax'`",
            "`Domain: '*'`",
            "Cookies do not need flags."
          ],
          "correctIndex": 1,
          "explanation": "`HttpOnly` blocks XSS theft, `Secure` requires HTTPS, and `SameSite: 'Lax'` protects against Cross-Site Request Forgery (CSRF)."
        },
        {
          "id": "Q-RCT-238",
          "question": "How do you return a JSON response with status code 201 from a Next.js Route Handler?",
          "options": [
            "`res.send(201, data)`",
            "`NextResponse.json(data, { status: 201 })`",
            "`return JSON.stringify(data)`",
            "`NextResponse.redirect(201)`"
          ],
          "correctIndex": 1,
          "explanation": "`NextResponse.json()` is the standard helper for returning typed, serialized JSON with HTTP status codes."
        },
        {
          "id": "Q-RCT-239",
          "question": "How does Middleware perform a URL rewrite without changing the URL visible in the user's browser address bar?",
          "options": [
            "`NextResponse.redirect(newUrl)`",
            "`NextResponse.rewrite(newUrl)`",
            "`window.location.replace()`",
            "`request.url = newUrl`"
          ],
          "correctIndex": 1,
          "explanation": "`NextResponse.rewrite()` serves content from a different internal path while keeping the browser address bar unchanged."
        },
        {
          "id": "Q-RCT-240",
          "question": "What is CORS (Cross-Origin Resource Sharing) in API Route Handlers?",
          "options": [
            "A CSS layout technique.",
            "HTTP security headers (`Access-Control-Allow-Origin`) that dictate which external domains are permitted to make requests to your API endpoints.",
            "A database indexing strategy.",
            "A React component."
          ],
          "correctIndex": 1,
          "explanation": "CORS headers control cross-origin browser requests, preventing unauthorized websites from reading private API data."
        }
      ]
    },
    {
      "id": "ASM-RCT-025",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-025",
      "title": "Assessment: SEO, Metadata API & Image Optimization",
      "summary": "Assess your expertise in the Next.js Metadata API, dynamic generateMetadata, OpenGraph social cards, next/image layout shifts, and modern formats.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-241",
          "question": "How does Next.js handle document head tags in the App Router without requiring third-party libraries like `react-helmet`?",
          "options": [
            "By writing raw HTML strings in `index.html`.",
            "Via the built-in Metadata API (`export const metadata: Metadata = { ... }` or `generateMetadata`).",
            "By querying Google directly.",
            "It does not support metadata."
          ],
          "correctIndex": 1,
          "explanation": "Next.js provides a native, type-safe Metadata API that compiles document head tags server-side for search engines."
        },
        {
          "id": "Q-RCT-242",
          "question": "When should you use `generateMetadata` instead of the static `export const metadata` object?",
          "options": [
            "When metadata depends on dynamic data (like fetching course titles or product names based on route parameters).",
            "When you only want to support mobile devices.",
            "When styling components with CSS.",
            "Only in development mode."
          ],
          "correctIndex": 0,
          "explanation": "`generateMetadata` allows asynchronous data fetching to compute dynamic titles, descriptions, and OpenGraph tags per route."
        },
        {
          "id": "Q-RCT-243",
          "question": "What core web vital metric does `next/image` directly protect by enforcing explicit dimensions or aspect ratios?",
          "options": [
            "First Input Delay (FID)",
            "Cumulative Layout Shift (CLS)",
            "Time to Interactive (TTI)",
            "First Byte Time (TTFB)"
          ],
          "correctIndex": 1,
          "explanation": "Mandating dimensions reserves layout space before images load, completely eliminating jarring page content shifts (CLS)."
        },
        {
          "id": "Q-RCT-244",
          "question": "What modern next-generation image formats are automatically generated and served by `next/image`?",
          "options": [
            "GIF and BMP",
            "AVIF and WebP",
            "TIFF and EPS",
            "SVG only"
          ],
          "correctIndex": 1,
          "explanation": "Next.js automatically compresses images into AVIF and WebP, dramatically reducing image payload sizes."
        },
        {
          "id": "Q-RCT-245",
          "question": "What is an OpenGraph (OG) image, and why is it essential for digital marketing?",
          "options": [
            "A chart displaying website visitors.",
            "A rich preview image specified in meta tags that social platforms (Slack, Twitter, LinkedIn, iMessage) display when links to your site are shared.",
            "A favicon icon.",
            "An image stored in a graph database."
          ],
          "correctIndex": 1,
          "explanation": "OpenGraph images create attractive, branded social media preview cards that significantly increase link click-through rates."
        },
        {
          "id": "Q-RCT-246",
          "question": "What property on `next/image` should be set to `priority={true}` for above-the-fold hero images?",
          "options": [
            "To make the image load in grayscale.",
            "To tell Next.js to preload the hero image immediately rather than lazy loading it, directly improving the Largest Contentful Paint (LCP) score.",
            "To enlarge the image to full screen.",
            "To turn off compression."
          ],
          "correctIndex": 1,
          "explanation": "`priority` marks primary hero visuals for immediate high-priority fetching, accelerating LCP benchmarks."
        },
        {
          "id": "Q-RCT-247",
          "question": "What does the `title.template` option in a root `layout.tsx` metadata configuration accomplish?",
          "options": [
            "It translates page titles into Spanish.",
            "It defines a standardized title formatting pattern (e.g., `%s | Nalanda LMS`) that sub-pages automatically inherit by injecting their unique title into `%s`.",
            "It creates HTML templates.",
            "It generates SEO reports."
          ],
          "correctIndex": 1,
          "explanation": "Title templates maintain consistent site-wide branding across all sub-pages while letting individual pages supply their titles."
        },
        {
          "id": "Q-RCT-248",
          "question": "How does `next/image` handle responsive screen sizes?",
          "options": [
            "It sends a single 4K image to all devices.",
            "It generates a responsive `srcset` attribute that serves appropriately resized images based on the user's specific viewport width.",
            "It crops all images into squares.",
            "It blurs images on mobile."
          ],
          "correctIndex": 1,
          "explanation": "Automated `srcset` generation serves lightweight thumbnails to smartphones and high-res images to desktop displays."
        },
        {
          "id": "Q-RCT-249",
          "question": "What is the Next.js `robots.ts` and `sitemap.ts` convention?",
          "options": [
            "A video game built into Next.js.",
            "Special file conventions that allow developers to generate search engine sitemaps (`sitemap.xml`) and crawler rules (`robots.txt`) dynamically in code.",
            "A tool for training AI robots.",
            "A spam blocker."
          ],
          "correctIndex": 1,
          "explanation": "Generating sitemaps and robots rules programmatically keeps search engine indexing fully synchronized with dynamic database content."
        },
        {
          "id": "Q-RCT-250",
          "question": "Why should external image domains (e.g., images hosted on AWS S3 or Unsplash) be declared in `next.config.js`?",
          "options": [
            "Because Next.js does not allow external images.",
            "To protect the application from malicious third-party image injection by explicitly whitelisting authorized hostnames for image optimization.",
            "To pay for image licensing.",
            "It is required by the browser."
          ],
          "correctIndex": 1,
          "explanation": "Whitelisting domains in `remotePatterns` prevents remote server abuse and SSRF vulnerabilities in the image optimization service."
        }
      ]
    }
  ]
};
