export const phase5 = {
  "chapters": [
    {
      "id": "CH-RCT-026",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 26,
      "title": "React Performance Profiling & Optimization",
      "summary": "Master the React DevTools Profiler, flamegraph interpretation, commit-phase diagnosis, wasted render elimination, React.lazy code splitting, and TanStack Virtual list windowing.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=7YhdqIR2Yzo",
      "body": "<h2>1. The Philosophy of React Performance</h2>\\n<p>Performance engineering in React is an empirical discipline. Developers frequently reach for <code>React.memo</code>, <code>useCallback</code>, and <code>useMemo</code> proactively, which often degrades performance due to shallow comparison overhead and increased garbage collection pressure. Professional React engineering relies on objective profiling to identify measurable bottlenecks before applying targeted optimizations.</p>\\n\\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\\n  <iframe src='https://www.youtube.com/embed/7YhdqIR2Yzo' title='React Performance Profiler & Optimization' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\\n</div>\\n\\n<h2>2. Interpreting the React DevTools Profiler</h2>\\n<p>The React Profiler measures how often components render and the cost of each render:</p>\\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\\n  <thead>\\n    <tr style='background-color: #f1f5f9;'>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Visual Indicator</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Flamegraph Meaning</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Underlying Mechanism</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Remediation</th>\\n    </tr>\\n  </thead>\\n  <tbody>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Yellow / Orange Bar</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Heavy render time (>16ms)</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Costly compute inside component body or deep unmemoized child tree.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Split into smaller components, workerize computation, or defer with useTransition.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Blue Bar</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Fast render (<2ms)</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Component rendered quickly without blocking frames.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>No action needed.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Grey / Hatching</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Did not render</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Bailed out of render phase because props and state remained identical.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Optimal outcome.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Why did this render?</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Tooltip diagnosis</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Identifies exact changed props, state, or hooks causing the re-render.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Stabilize function/object references or colocate state down into leaves.</td>\\n    </tr>\\n  </tbody>\\n</table>\\n\\n<h2>3. Route-Based Code Splitting with React.lazy & Suspense</h2>\\n<p>Shipping monolithic JavaScript bundles inflates Time to Interactive (TTI). Route-level code splitting ensures clients only download the script chunks necessary for the current view:</p>\\n<pre><code class='language-tsx'>import React, { Suspense, lazy } from 'react';\\nimport { Routes, Route } from 'react-router-dom';\\nimport PageSkeleton from '@/components/PageSkeleton';\\nimport ErrorBoundary from '@/components/ErrorBoundary';\\n\\nconst AnalyticsDashboard = lazy(() => import('@/pages/AnalyticsDashboard'));\\nconst CustomerAdminTable = lazy(() => import('@/pages/CustomerAdminTable'));\\n\\nexport function AppRoutes() {\\n  return (\\n    &lt;ErrorBoundary fallback={&lt;h1&gt;Application error occurred.&lt;/h1&gt;}&gt;\\n      &lt;Suspense fallback={&lt;PageSkeleton /&gt;}&gt;\\n        &lt;Routes&gt;\\n          &lt;Route path=\"/analytics\" element={&lt;AnalyticsDashboard /&gt;} /&gt;\\n          &lt;Route path=\"/admin\" element={&lt;CustomerAdminTable /&gt;} /&gt;\\n        &lt;/Routes&gt;\\n      &lt;/Suspense&gt;\\n    &lt;/ErrorBoundary&gt;\\n  );\\n}</code></pre>\\n\\n<h2>4. Virtualization with @tanstack/react-virtual</h2>\\n<p>When rendering large tabular datasets (10,000+ records), mounting standard HTML table rows overwhelms DOM tree memory. Virtualization renders only the slice of rows visible in the active viewport plus a small overscan buffer:</p>\\n<pre><code class='language-tsx'>import React, { useRef } from 'react';\\nimport { useVirtualizer } from '@tanstack/react-virtual';\\n\\nexport function VirtualMetricTable({ rows }: { rows: MetricRow[] }) {\\n  const parentRef = useRef&lt;HTMLDivElement&gt;(null);\\n\\n  const virtualizer = useVirtualizer({\\n    count: rows.length,\\n    getScrollElement: () => parentRef.current,\\n    estimateSize: () => 48,\\n    overscan: 5,\\n  });\\n\\n  return (\\n    &lt;div ref={parentRef} style={{ height: '600px', overflowY: 'auto' }}&gt;\\n      &lt;div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}&gt;\\n        {virtualizer.getVirtualItems().map((vRow) => (\\n          &lt;div\\n            key={vRow.key}\\n            style={{\\n              position: 'absolute',\\n              top: 0,\\n              left: 0,\\n              width: '100%',\\n              height: `${vRow.size}px`,\\n              transform: `translateY(${vRow.start}px)`,\\n            }}\\n          &gt;\\n            {rows[vRow.index].label}: ${rows[vRow.index].value}\\n          &lt;/div&gt;\\n        ))}\\n      &lt;/div&gt;\\n    &lt;/div&gt;\\n  );\\n}</code></pre>"
    },
    {
      "id": "CH-RCT-027",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 27,
      "title": "Web Vitals & Frontend Monitoring",
      "summary": "Master Google Core Web Vitals (LCP, INP, CLS, TTFB), Next.js bundle analyzer, tree-shaking dependencies, font optimization with next/font, and Real User Monitoring (RUM) telemetry.",
      "readingTimeMinutes": 36,
      "videoUrl": "https://www.youtube.com/watch?v=fWoI9DXBLdk",
      "body": "<h2>1. The Core Web Vitals Paradigm</h2>\\n<p>Google's Core Web Vitals establish the empirical benchmark for user experience, search indexing, and conversion rates. In modern React and Next.js applications, optimizing for Web Vitals requires architectural foresight into resource hints, server response times, layout stability, and main-thread responsiveness.</p>\\n\\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\\n  <iframe src='https://www.youtube.com/embed/fWoI9DXBLdk' title='Core Web Vitals Explained' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\\n</div>\\n\\n<h2>2. Core Metric Targets & Optimization Strategies</h2>\\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\\n  <thead>\\n    <tr style='background-color: #f1f5f9;'>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Metric</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Good Target</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>User Experience Signal</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>React / Next.js Remediation</th>\\n    </tr>\\n  </thead>\\n  <tbody>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>LCP (Largest Contentful Paint)</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>&le; 2.5s</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Perceived load speed of hero image or main heading.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Use priority on hero next/image, stream server HTML, cache responses.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>INP (Interaction to Next Paint)</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>&le; 200ms</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Responsiveness: latency from user tap/click to visual update.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Break up long tasks with useTransition, Web Workers, or scheduler.yield().</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>CLS (Cumulative Layout Shift)</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>&le; 0.1</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Visual stability: preventing unexpected jumping elements.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Set explicit width/height on images; reserve skeleton containers with CSS aspect-ratio.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>TTFB (Time to First Byte)</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>&le; 800ms</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Server responsiveness and CDN network latency.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Edge rendering, static ISR generation, database query indexing.</td>\\n    </tr>\\n  </tbody>\\n</table>\\n\\n<h2>3. Zero-CLS Font Loading with next/font</h2>\\n<p>External web fonts loaded via third-party CDN stylesheets cause Flash of Unstyled Text (FOUT) and shift layout. <code>next/font</code> self-hosts Google Fonts at build time with automatic size-adjusted fallback metrics:</p>\\n<pre><code class='language-tsx'>import { Inter, JetBrains_Mono } from 'next/font/google';\\n\\nconst inter = Inter({\\n  subsets: ['latin'],\\n  display: 'swap',\\n  variable: '--font-inter',\\n});\\n\\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\\n  return (\\n    &lt;html lang=\"en\" className={inter.variable}&gt;\\n      &lt;body className=\"font-sans antialiased\"&gt;{children}&lt;/body&gt;\\n    &lt;/html&gt;\\n  );\\n}</code></pre>\\n\\n<h2>4. Real User Monitoring (RUM) Telemetry</h2>\\n<p>Capture real-world user metrics using the <code>useReportWebVitals</code> hook:</p>\\n<pre><code class='language-tsx'>'use client';\\nimport { useReportWebVitals } from 'next/web-vitals';\\n\\nexport function WebVitalsTelemetry() {\\n  useReportWebVitals((metric) => {\\n    const payload = JSON.stringify({\\n      id: metric.id,\\n      name: metric.name,\\n      value: metric.value,\\n      rating: metric.rating,\\n      page: window.location.pathname,\\n    });\\n\\n    if (navigator.sendBeacon) {\\n      navigator.sendBeacon('/api/vitals', payload);\\n    } else {\\n      fetch('/api/vitals', { method: 'POST', body: payload, keepalive: true });\\n    }\\n  });\\n  return null;\\n}</code></pre>"
    },
    {
      "id": "CH-RCT-028",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 28,
      "title": "Unit & Integration Testing with Vitest & React Testing Library",
      "summary": "Learn modern testing philosophies: testing user behavior rather than implementation details, accessible screen queries (getByRole), user-event interactions, and Mock Service Worker (MSW v2).",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=8Xwq35cPwYg",
      "body": "<h2>1. The Testing Mindset: Behavior Over Implementation</h2>\\n<p>Traditional frontend testing was plagued by testing implementation details: asserting on internal component state, spying on private methods, or checking specific CSS class names. React Testing Library (RTL) enforces testing software from the perspective of real users and assistive technology.</p>\\n\\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\\n  <iframe src='https://www.youtube.com/embed/8Xwq35cPwYg' title='Vitest & React Testing Library Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\\n</div>\\n\\n<h2>2. Accessible Query Priority Hierarchy</h2>\\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\\n  <thead>\\n    <tr style='background-color: #f1f5f9;'>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Priority</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Query Method</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Target Elements</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Accessibility Benefit</th>\\n    </tr>\\n  </thead>\\n  <tbody>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>1 (Highest)</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><code>getByRole(role, { name })</code></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Buttons, headings, links, dialogs, alerts.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Validates semantic HTML and accessible accessibility trees.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>2</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><code>getByLabelText(text)</code></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Form inputs, selects, checkboxes.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Verifies form inputs have properly bound label elements.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>3</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><code>getByPlaceholderText(text)</code></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Inputs lacking visible labels.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Acceptable fallback for search boxes.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>4</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><code>getByText(text)</code></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Static paragraphs, banners, spans.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Checks user-visible copy.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>5 (Escape)</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><code>getByTestId(id)</code></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Dynamic SVG canvas, non-semantic containers.</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Last resort escape hatch.</td>\\n    </tr>\\n  </tbody>\\n</table>\\n\\n<h2>3. API Mocking with Mock Service Worker (MSW v2)</h2>\\n<p>Mock Service Worker intercepts network requests at the HTTP Fetch layer, keeping production fetch code completely authentic:</p>\\n<pre><code class='language-tsx'>import { http, HttpResponse } from 'msw';\\n\\nexport const handlers = [\\n  http.get('https://api.auradashboard.com/metrics', () => {\\n    return HttpResponse.json({\\n      revenue: 142500,\\n      activeUsers: 8420,\\n    });\\n  }),\\n];</code></pre>\\n\\n<h2>4. Writing Component Integration Tests with user-event</h2>\\n<pre><code class='language-tsx'>import { render, screen, waitFor } from '@testing-library/react';\\nimport userEvent from '@testing-library/user-event';\\nimport { describe, it, expect, vi } from 'vitest';\\nimport { CreateProjectModal } from '../CreateProjectModal';\\n\\ndescribe('CreateProjectModal', () => {\\n  it('validates input and submits project creation', async () => {\\n    const user = userEvent.setup();\\n    const onSuccess = vi.fn();\\n\\n    render(&lt;CreateProjectModal isOpen={true} onSuccess={onSuccess} /&gt;);\\n\\n    const input = screen.getByRole('textbox', { name: /project name/i });\\n    const submitBtn = screen.getByRole('button', { name: /create/i });\\n\\n    await user.type(input, 'New Analytics Engine');\\n    await user.click(submitBtn);\\n\\n    await waitFor(() => {\\n      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Analytics Engine' }));\\n    });\\n  });\\n});</code></pre>"
    },
    {
      "id": "CH-RCT-029",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 29,
      "title": "End-to-End (E2E) Testing with Playwright",
      "summary": "Master cross-browser E2E testing with Playwright: Page Object Model (POM) pattern, storageState authentication re-use, visual regression snapshots, and CI/CD pipelines.",
      "readingTimeMinutes": 37,
      "videoUrl": "https://www.youtube.com/watch?v=Xz6qhPrb4_0",
      "body": "<h2>1. The Strategic Value of E2E Testing</h2>\\n<p>While unit and integration tests verify components in isolation, End-to-End tests execute the fully compiled application against real browser engines (Chromium, Firefox, WebKit). Playwright validates real cookie sessions, server redirects, streaming SSR responses, and database transactions.</p>\\n\\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\\n  <iframe src='https://www.youtube.com/embed/Xz6qhPrb4_0' title='Playwright End-to-End Testing Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\\n</div>\\n\\n<h2>2. Re-using Authentication State (storageState)</h2>\\n<p>Avoid logging in through the UI on every test by establishing an authenticated session once and saving the cookie/storage state to disk:</p>\\n<pre><code class='language-typescript'>// tests/auth.setup.ts\\nimport { test as setup, expect } from '@playwright/test';\\n\\nsetup('authenticate', async ({ page }) => {\\n  await page.goto('/login');\\n  await page.getByLabel('Email').fill('staff.engineer@nalanda.edu');\\n  await page.getByLabel('Password').fill('EnterprisePassword123!');\\n  await page.getByRole('button', { name: /sign in/i }).click();\\n\\n  await expect(page).toHaveURL(/.*dashboard/);\\n  await page.context().storageState({ path: 'playwright/.auth/user.json' });\\n});</code></pre>\\n\\n<h2>3. The Page Object Model Pattern</h2>\\n<p>Page Object Models abstract UI elements and interactions into modular classes, insulating tests from UI refactoring:</p>\\n<pre><code class='language-typescript'>// tests/models/DashboardPage.ts\\nimport { type Page, type Locator, expect } from '@playwright/test';\\n\\nexport class DashboardPage {\\n  readonly page: Page;\\n  readonly dateRangeSelect: Locator;\\n  readonly exportCsvBtn: Locator;\\n\\n  constructor(page: Page) {\\n    this.page = page;\\n    this.dateRangeSelect = page.getByRole('combobox', { name: /date range/i });\\n    this.exportCsvBtn = page.getByRole('button', { name: /export csv/i });\\n  }\\n\\n  async goto() {\\n    await this.page.goto('/dashboard');\\n  }\\n\\n  async selectDateRange(range: string) {\\n    await this.dateRangeSelect.click();\\n    await this.page.getByRole('option', { name: range }).click();\\n  }\\n}</code></pre>\\n\\n<h2>4. Executing E2E & Visual Regression Tests</h2>\\n<pre><code class='language-typescript'>import { test, expect } from '@playwright/test';\\nimport { DashboardPage } from '../models/DashboardPage';\\n\\ntest('verifies dashboard filters and export flow', async ({ page }) => {\\n  const dashboard = new DashboardPage(page);\\n  await dashboard.goto();\\n  await dashboard.selectDateRange('Last 30 Days');\\n\\n  const downloadPromise = page.waitForEvent('download');\\n  await dashboard.exportCsvBtn.click();\\n  const download = await downloadPromise;\\n\\n  expect(download.suggestedFilename()).toBe('analytics-30d.csv');\\n  await expect(page.locator('main')).toHaveScreenshot('dashboard-baseline.png');\\n});</code></pre>"
    },
    {
      "id": "CH-RCT-030",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 30,
      "title": "Enterprise Security in React & Next.js",
      "summary": "Fortify production applications: XSS attack vectors, DOMPurify sanitization, Content Security Policy (CSP) with cryptographic nonces, HTTP-only cookies, and securing Server Actions.",
      "readingTimeMinutes": 39,
      "videoUrl": "https://www.youtube.com/watch?v=ZxbkYjoc6r4",
      "body": "<h2>1. The React & Next.js Security Model</h2>\\n<p>React automatically escapes string variables rendered in JSX (e.g., <code>&lt;p&gt;{input}&lt;/p&gt;</code> escapes <code>&lt;script&gt;</code> into entity strings). However, enterprise applications remain vulnerable to malicious <code>javascript:</code> protocol links, unsanitized raw HTML injection, Server-Side Request Forgery (SSRF) in Server Actions, and credential theft via XSS.</p>\\n\\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\\n  <iframe src='https://www.youtube.com/embed/ZxbkYjoc6r4' title='Frontend Web Security Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\\n</div>\\n\\n<h2>2. Sanitizing HTML with DOMPurify</h2>\\n<p>When rendering user-supplied markdown or rich text, passing raw strings to <code>dangerouslySetInnerHTML</code> introduces severe vulnerabilities. DOMPurify cleans dangerous tags and malicious attributes before DOM insertion:</p>\\n<pre><code class='language-tsx'>import DOMPurify from 'isomorphic-dompurify';\\n\\nexport function SafeRichText({ html }: { html: string }) {\\n  const cleanHtml = DOMPurify.sanitize(html, {\\n    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'h2', 'h3', 'ul', 'li', 'code'],\\n    ALLOWED_ATTR: ['href', 'target', 'rel'],\\n    FORBID_TAGS: ['script', 'iframe', 'style', 'object'],\\n  });\\n\\n  return &lt;div dangerouslySetInnerHTML={{ __html: cleanHtml }} /&gt;;\\n}</code></pre>\\n\\n<h2>3. Cryptographic CSP Nonce Injection in Middleware</h2>\\n<p>Content Security Policy restricts where scripts and network connections can execute. Generating a unique cryptographic nonce per request ensures only verified scripts run:</p>\\n<pre><code class='language-typescript'>// middleware.ts\\nimport { NextRequest, NextResponse } from 'next/server';\\n\\nexport function middleware(request: NextRequest) {\\n  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');\\n  const csp = `\\n    default-src 'self';\\n    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';\\n    style-src 'self' 'nonce-${nonce}';\\n    img-src 'self' blob: data: https:;\\n    object-src 'none';\\n    frame-ancestors 'none';\\n  `.replace(/\\s{2,}/g, ' ').trim();\\n\\n  const headers = new Headers(request.headers);\\n  headers.set('x-nonce', nonce);\\n  headers.set('Content-Security-Policy', csp);\\n\\n  const res = NextResponse.next({ request: { headers } });\\n  res.headers.set('Content-Security-Policy', csp);\\n  res.headers.set('X-Frame-Options', 'DENY');\\n  return res;\\n}</code></pre>\\n\\n<h2>4. Securing Next.js Server Actions</h2>\\n<p>Server Actions are public HTTP POST endpoints. Never trust incoming arguments without authentication and strict schema validation:</p>\\n<pre><code class='language-typescript'>'use server';\\nimport { z } from 'zod';\\nimport { getSession } from '@/lib/auth';\\n\\nconst TransferSchema = z.object({\\n  targetAccountId: z.string().uuid(),\\n  amountCents: z.number().int().positive(),\\n});\\n\\nexport async function executeTransfer(formData: FormData) {\\n  const session = await getSession();\\n  if (!session?.userId) throw new Error('Unauthorized');\\n\\n  const validation = TransferSchema.safeParse({\\n    targetAccountId: formData.get('targetAccountId'),\\n    amountCents: Number(formData.get('amountCents')),\\n  });\\n\\n  if (!validation.success) {\\n    return { success: false, error: 'Invalid transfer payload' };\\n  }\\n  // Process transfer safely in transactional database...\\n}</code></pre>"
    },
    {
      "id": "CH-RCT-031",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 31,
      "title": "Enterprise Capstone: AuraDashboard — High-Performance Analytics SaaS",
      "summary": "Synthesize all engineering concepts into AuraDashboard: Next.js 15 App Router, Server Components streaming, TanStack Table v8, Zustand client filters, Server Actions, and role-based access control.",
      "readingTimeMinutes": 42,
      "videoUrl": "https://www.youtube.com/watch?v=5ZdHfJVAY-s",
      "body": "<h2>1. Capstone Architectural Blueprint</h2>\\n<p>AuraDashboard is an enterprise multi-tenant B2B Analytics SaaS application designed to demonstrate modern React and Next.js design patterns. The application handles high-throughput telemetry data, offering live sorting, multi-column filtering, CSV data export, streaming KPI cards, and role-based administrative workflows.</p>\\n\\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\\n  <iframe src='https://www.youtube.com/embed/5ZdHfJVAY-s' title='Enterprise SaaS Architecture in Next.js' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\\n</div>\\n\\n<h2>2. Technology Stack & Architectural Roles</h2>\\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\\n  <thead>\\n    <tr style='background-color: #f1f5f9;'>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Architectural Layer</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Technology Selected</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Core Responsibility</th>\\n    </tr>\\n  </thead>\\n  <tbody>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Application Framework</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Next.js 15 App Router</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Hybrid rendering: Server Components for static shell & metrics, Client Components for interactivity.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Client State Management</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Zustand v5 + Nuqs URL State</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Search params synchronized with URL; instant shareable filter state across browser tabs.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Data Grid</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>TanStack Table v8 + Virtualizer</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Headless 60fps virtualization handling 10,000+ customer records with column resizing.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Mutations & Forms</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>React 19 Server Actions + Zod</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Type-safe optimistic mutation pipeline with automatic cache revalidation.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Design System</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Tailwind CSS v4 + Radix Primitives</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Accessible (WCAG 2.1 AA compliant), keyboard-navigable dark mode design system.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>Quality & Verification</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Vitest + RTL + Playwright</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Automated unit, component, integration, and cross-browser end-to-end regression testing.</td>\\n    </tr>\\n  </tbody>\\n</table>\\n\\n<h2>3. Streaming Dashboard Page Architecture</h2>\\n<pre><code class='language-tsx'>// app/(dashboard)/overview/page.tsx\\nimport { Suspense } from 'react';\\nimport MetricGridSkeleton from '@/components/MetricGridSkeleton';\\nimport MetricsFeed from '@/components/MetricsFeed';\\n\\nexport default function OverviewPage() {\\n  return (\\n    &lt;div className=\"space-y-8 p-8\"&gt;\\n      &lt;h1 className=\"text-3xl font-bold tracking-tight text-white\"&gt;Executive Performance&lt;/h1&gt;\\n      &lt;Suspense fallback={&lt;MetricGridSkeleton /&gt;}&gt;\\n        &lt;MetricsFeed /&gt;\\n      &lt;/Suspense&gt;\\n    &lt;/div&gt;\\n  );\\n}</code></pre>"
    },
    {
      "id": "CH-RCT-032",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 32,
      "title": "Senior / Staff React Engineer Interview Mastery & System Design",
      "summary": "Master the RADIO framework for frontend system design, deep React 19 internal mechanisms, architectural trade-offs, and Staff-level engineering discussions.",
      "readingTimeMinutes": 44,
      "videoUrl": "https://www.youtube.com/watch?v=jZ0y9Ffqj1U",
      "body": "<h2>1. The Frontend System Design Framework: RADIO</h2>\\n<p>Top tech companies (Meta, Google, Netflix, Stripe) evaluate Senior and Staff frontend candidates using the structured <strong>RADIO</strong> framework:</p>\\n\\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\\n  <iframe src='https://www.youtube.com/embed/jZ0y9Ffqj1U' title='Frontend System Design Interview Framework' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\\n</div>\\n\\n<h2>2. The Stages of the RADIO Framework</h2>\\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\\n  <thead>\\n    <tr style='background-color: #f1f5f9;'>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Stage</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Focus Area</th>\\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Candidate Signals & Deliverables</th>\\n    </tr>\\n  </thead>\\n  <tbody>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>R - Requirements</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Functional & Non-Functional scoping</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Clarify device targets, bandwidth constraints, offline needs, scale (1M DAU vs enterprise), latency targets (INP &lt; 100ms).</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>A - Architecture</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Component & Layer Topology</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Diagram client layers: View Layer, Presentation Models, Global Cache Layer, Network Transport, Offline Storage.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>D - Data Model</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Client Entities & Normalization</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Design normalized entities, optimistic update rollbacks, pagination strategies (cursor vs offset).</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>I - Interface (APIs)</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Network Contracts</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Define REST/GraphQL/tRPC endpoints, WebSocket vs Server-Sent Events (SSE) contracts, polling vs push trade-offs.</td>\\n    </tr>\\n    <tr>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'><strong>O - Optimizations</strong></td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Performance, Resilience, Edge Cases</td>\\n      <td style='padding: 10px; border: 1px solid #cbd5e1;'>Virtualization, code-splitting, optimistic UI rollback, retry with exponential backoff, accessibility (WCAG AA).</td>\\n    </tr>\\n  </tbody>\\n</table>\\n\\n<h2>3. Core Architectural Trade-Offs</h2>\\n<p>Staff engineers articulate trade-offs based on operational reality:</p>\\n<ul>\\n  <li><strong>Micro-Frontends vs Monolith:</strong> Micro-frontends decouple 20+ independent deployment pipelines at the cost of duplicate dependency runtime size, styling collisions, and shared state friction.</li>\\n  <li><strong>WebSockets vs SSE:</strong> WebSockets provide full-duplex communication ideal for collaborative documents, while Server-Sent Events (SSE) operate over standard HTTP/2 with automatic reconnection, ideal for unidirectional AI streaming and metric feeds.</li>\\n</ul>\\n\\n<h2>4. Congratulations: Course Completion</h2>\\n<p>You have now completed the entire 32-chapter React Developer Masterclass curriculum, spanning React 19 Compiler fundamentals, custom hooks, TanStack Query cache orchestration, Next.js App Router streaming architectures, cross-browser Playwright automation, enterprise security, and Staff-level system design.</p>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-RCT-026",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-026",
      "title": "React Performance Profiling Assessment",
      "summary": "Test your mastery of React DevTools Profiler, flamegraph analysis, wasted render elimination, and virtualization.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-251",
          "question": "What do yellow and orange bars indicate in the React DevTools Profiler flamegraph?",
          "options": [
            "The component threw an unhandled runtime error.",
            "The component spent a relatively long duration executing its render function during that commit.",
            "The component was cached by React.memo and bailed out.",
            "The component was rendered strictly on the server."
          ],
          "correctIndex": 1,
          "explanation": "In the React DevTools Profiler flamegraph, warmer colors (yellow/orange) indicate components that spent significant time rendering during that commit."
        },
        {
          "id": "Q-RCT-252",
          "question": "What is the primary architectural benefit of list virtualization using libraries like @tanstack/react-virtual?",
          "options": [
            "It compiles client code into WebAssembly.",
            "It encrypts DOM nodes to prevent user inspection.",
            "It only renders the DOM elements currently visible in the active viewport plus a small overscan buffer, keeping DOM node count constant.",
            "It stores records in browser cookies."
          ],
          "correctIndex": 2,
          "explanation": "Virtualization keeps the active DOM node count constant regardless of dataset size, eliminating layout thrashing and high browser memory consumption."
        },
        {
          "id": "Q-RCT-253",
          "question": "When wrapping dynamic imports in React.lazy(), what component MUST wrap the lazy component in the JSX tree?",
          "options": [
            "<React.StrictMode>",
            "<Suspense>",
            "<Fragment>",
            "<Profiler>"
          ],
          "correctIndex": 1,
          "explanation": "Components loaded asynchronously via React.lazy() must be wrapped within a <Suspense> boundary that renders a fallback while the chunk downloads."
        },
        {
          "id": "Q-RCT-254",
          "question": "How does passing child components via the children prop prevent unnecessary re-renders?",
          "options": [
            "React turns all children into immutable WebAssembly binaries.",
            "Children are evaluated in the scope of the parent caller, retaining the same object reference when the container re-renders due to its own state.",
            "Children are executed on a separate worker thread.",
            "Children bypass reconciliation completely."
          ],
          "correctIndex": 1,
          "explanation": "When components receive content via children, that JSX was evaluated by the caller. When the container re-renders due to its own local state, the children reference remains identical, so React skips re-rendering them."
        },
        {
          "id": "Q-RCT-255",
          "question": "Why can indiscriminate proactive use of React.memo degrade performance?",
          "options": [
            "React.memo deletes all hooks inside the wrapped component.",
            "Shallow prop comparison has a computational cost; if props change every render anyway, the comparison overhead is wasted work.",
            "React.memo is deprecated in modern React.",
            "React.memo forces synchronous rendering on the main thread."
          ],
          "correctIndex": 1,
          "explanation": "If a component receives new prop references on every render, React.memo runs shallow comparison checks pointlessly before re-rendering anyway, adding CPU overhead."
        },
        {
          "id": "Q-RCT-256",
          "question": "What setting in React DevTools allows developers to identify the exact cause of a component re-render?",
          "options": [
            "Timeline scrubber",
            "Record why each component rendered while profiling",
            "Memory heap snapshot filter",
            "Network throttling emulator"
          ],
          "correctIndex": 1,
          "explanation": "Enabling 'Record why each component rendered while profiling' in React DevTools inspects the exact props, hooks, or state changes that triggered each render."
        },
        {
          "id": "Q-RCT-257",
          "question": "What is overscan in virtual list terminology?",
          "options": [
            "The number of pixels the scrollbar extends beyond the screen.",
            "The number of additional DOM items rendered just outside the visible viewport to prevent empty flickering during rapid scrolling.",
            "A browser bug where text exceeds container bounds.",
            "The maximum allowable zoom level on mobile browsers."
          ],
          "correctIndex": 1,
          "explanation": "Overscan specifies the count of items rendered above and below the visible viewport window, creating a smooth buffer that prevents blank space during fast scrolling."
        },
        {
          "id": "Q-RCT-258",
          "question": "When do useLayoutEffect callbacks execute during the React component lifecycle?",
          "options": [
            "During the render phase before Virtual DOM diffing.",
            "Synchronously immediately after React commits DOM mutations and before the browser paints pixels on screen.",
            "Asynchronously in a macro-task after browser paint.",
            "During server-side prerendering."
          ],
          "correctIndex": 1,
          "explanation": "useLayoutEffect runs synchronously immediately after React commits DOM mutations and before the browser paints, allowing layout measurements without visual flicker."
        },
        {
          "id": "Q-RCT-259",
          "question": "Which tool in Chrome DevTools measures main-thread script execution and flags Long Tasks (>50ms)?",
          "options": [
            "Lighthouse tab",
            "Performance tab recording",
            "Application Storage inspector",
            "Security certificate viewer"
          ],
          "correctIndex": 1,
          "explanation": "The Chrome Performance tab records exact CPU activity, flame charts of JavaScript execution, frame rates, and flags tasks exceeding 50ms as Long Tasks."
        },
        {
          "id": "Q-RCT-260",
          "question": "What is 'state colocation' in React architecture?",
          "options": [
            "Storing all global state in a single giant Redux store.",
            "Moving state as close as possible to the components that actually use it, preventing state from elevating to distant ancestors.",
            "Deploying state to geographically distributed edge servers.",
            "Persisting state in browser cookies across sessions."
          ],
          "correctIndex": 1,
          "explanation": "State colocation is the practice of keeping state as close as possible to where it is consumed, which prevents high-level parent components from re-rendering unaffected subtree branches."
        }
      ]
    },
    {
      "id": "ASM-RCT-027",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-027",
      "title": "Web Vitals & Frontend Monitoring Assessment",
      "summary": "Evaluate your understanding of Google Core Web Vitals, bundle analyzer treemaps, next/font, and Real User Monitoring.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-261",
          "question": "What does Interaction to Next Paint (INP) measure?",
          "options": [
            "The total time taken to download the initial HTML document.",
            "The overall responsiveness latency from user interactions (clicks, taps, keystrokes) to the next visual update on screen throughout the page lifecycle.",
            "The time until the largest hero image appears.",
            "The number of frames per second during CSS animations."
          ],
          "correctIndex": 1,
          "explanation": "INP evaluates overall page responsiveness by measuring the duration between a user interaction and the next visual update on screen across the entire page lifecycle."
        },
        {
          "id": "Q-RCT-262",
          "question": "What is the 'Good' threshold target for Largest Contentful Paint (LCP)?",
          "options": [
            "Under 100 milliseconds",
            "2.5 seconds or less",
            "4.0 seconds or less",
            "0.1 or less"
          ],
          "correctIndex": 1,
          "explanation": "Google Core Web Vitals guidelines specify that an LCP of 2.5 seconds or less provides a good user experience."
        },
        {
          "id": "Q-RCT-263",
          "question": "How does next/font eliminate Cumulative Layout Shift (CLS) when loading web fonts?",
          "options": [
            "It blocks HTML rendering until all external fonts are downloaded.",
            "It downloads Google Fonts at build time, self-hosts them, and inlines CSS with fallback font metric matching.",
            "It forces the browser to use system default Arial font only.",
            "It converts all text into SVG vector images."
          ],
          "correctIndex": 1,
          "explanation": "next/font downloads and self-hosts fonts at build time, generating size-adjusted fallback metrics so that text swaps into place with zero layout shift."
        },
        {
          "id": "Q-RCT-264",
          "question": "Why is navigator.sendBeacon preferred over standard fetch for logging RUM telemetry during page unload?",
          "options": [
            "It encrypts payloads using quantum cryptography.",
            "It guarantees asynchronous delivery in the background by the browser without delaying navigation or getting cancelled when the page terminates.",
            "It bypasses CORS headers and cookie restrictions.",
            "It allows bidirectional streaming during unload."
          ],
          "correctIndex": 1,
          "explanation": "navigator.sendBeacon queues data to be transmitted reliably by the browser process itself, guaranteeing transmission even if the document has closed or navigated away."
        },
        {
          "id": "Q-RCT-265",
          "question": "What is the recommended target threshold for Cumulative Layout Shift (CLS)?",
          "options": [
            "0.1 or less",
            "200 ms or less",
            "2.5 seconds or less",
            "1.5 or less"
          ],
          "correctIndex": 0,
          "explanation": "A CLS score of 0.1 or lower qualifies as 'Good' under Core Web Vitals criteria."
        },
        {
          "id": "Q-RCT-266",
          "question": "What optimization attribute on next/image ensures hero images are prioritized for LCP?",
          "options": [
            "loading='lazy'",
            "priority={true}",
            "fetchPriority='low'",
            "placeholder='blur-only'"
          ],
          "correctIndex": 1,
          "explanation": "Setting priority={true} on the hero next/image instructs Next.js to preload the image in the HTML head using high fetch priority, dramatically accelerating LCP."
        },
        {
          "id": "Q-RCT-267",
          "question": "What does @next/bundle-analyzer produce when executed during build?",
          "options": [
            "A PDF document summarizing code smells.",
            "An interactive visual zoomable treemap showing the byte weight of every client and server bundle chunk and dependency.",
            "A list of broken HTML anchor links.",
            "A database backup file."
          ],
          "correctIndex": 1,
          "explanation": "@next/bundle-analyzer renders an interactive HTML treemap of all compiled JavaScript bundles, highlighting oversized npm dependencies."
        },
        {
          "id": "Q-RCT-268",
          "question": "What Next.js hook allows client components to capture performance metrics like FCP, LCP, CLS, and INP?",
          "options": [
            "usePerformanceObserver",
            "useReportWebVitals",
            "useLayoutTelemetry",
            "useCoreMetrics"
          ],
          "correctIndex": 1,
          "explanation": "Next.js provides useReportWebVitals to listen for Core Web Vitals events and report metrics directly to analytics collectors."
        },
        {
          "id": "Q-RCT-269",
          "question": "How does scheduler.yield() improve Interaction to Next Paint (INP) during heavy computation?",
          "options": [
            "It cancels all background network requests.",
            "It voluntarily pauses long JavaScript execution and yields control back to the browser main thread to process pending input events and paint.",
            "It shifts JavaScript execution to Node.js backend.",
            "It clears browser cache immediately."
          ],
          "correctIndex": 1,
          "explanation": "scheduler.yield() allows developers to break up long-running synchronous loops into smaller chunks, yielding to the browser event loop so user inputs and paints are not blocked."
        },
        {
          "id": "Q-RCT-270",
          "question": "What causes Flash of Unstyled Text (FOUT)?",
          "options": [
            "Browser downloading CSS files out of order.",
            "A custom web font loading after the fallback system font has already rendered, causing a visible visual refonting.",
            "An unhandled exception in React hydration.",
            "Running React in developer mode."
          ],
          "correctIndex": 1,
          "explanation": "FOUT happens when the browser renders text using a system fallback font first, and then flashes when the custom web font finishes downloading and swaps in."
        }
      ]
    },
    {
      "id": "ASM-RCT-028",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-028",
      "title": "Vitest & React Testing Library Assessment",
      "summary": "Test your mastery of accessible testing queries, user-event interactions, and Mock Service Worker network interception.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-271",
          "question": "What is the primary guiding principle of React Testing Library?",
          "options": [
            "Verify every internal component state variable and method directly.",
            "The more tests resemble how software is used by humans and assistive tech, the more confidence they provide.",
            "Achieve 100% snapshot coverage by serializing the Virtual DOM.",
            "Always test implementation details to prevent refactoring."
          ],
          "correctIndex": 1,
          "explanation": "React Testing Library is designed around the principle that tests should interact with the application from the user perspective rather than testing internal implementation details."
        },
        {
          "id": "Q-RCT-272",
          "question": "According to RTL guidelines, which query method should be your highest priority choice?",
          "options": [
            "getByTestId",
            "getByRole",
            "getByClassName",
            "getByNodeName"
          ],
          "correctIndex": 1,
          "explanation": "getByRole is the highest priority query because it exposes the accessible role and name that screen readers use, simultaneously validating semantics and accessibility."
        },
        {
          "id": "Q-RCT-273",
          "question": "Why should you prefer @testing-library/user-event over fireEvent in tests?",
          "options": [
            "fireEvent is deprecated in JavaScript.",
            "user-event simulates full browser interaction chains (hover, pointer-down, focus, keypress, click) rather than firing a synthetic single event dispatch.",
            "user-event runs tests on the GPU.",
            "user-event does not require async/await."
          ],
          "correctIndex": 1,
          "explanation": "user-event closely mimics real browser behavior by dispatching all underlying events associated with a user action (e.g. typing dispatches keydown, keypress, input, change, and keyup)."
        },
        {
          "id": "Q-RCT-274",
          "question": "How does Mock Service Worker (MSW v2) intercept HTTP network requests during testing?",
          "options": [
            "By monkey-patching global window.fetch with dummy objects.",
            "By intercepting standard Request/Response objects at the network layer in Node and via Service Workers in browsers.",
            "By requiring an actual mock Express server running on port 3000.",
            "By rewriting bundle import statements."
          ],
          "correctIndex": 1,
          "explanation": "MSW intercepts network communication at the transport/network layer using standard Fetch API primitives, allowing application code to use real fetch/axios logic untouched."
        },
        {
          "id": "Q-RCT-275",
          "question": "What is the difference between getByRole, queryByRole, and findByRole in RTL?",
          "options": [
            "There is no difference; they are aliases.",
            "getByRole throws immediately if not found; queryByRole returns null (useful for asserting absence); findByRole returns a Promise that waits asynchronously.",
            "findByRole only works on HTML5 form inputs.",
            "queryByRole is synchronous while getByRole is asynchronous."
          ],
          "correctIndex": 1,
          "explanation": "getBy* throws immediately if element is missing; queryBy* returns null (for expect(...).not.toBeInTheDocument()); findBy* retries with waitFor until element appears or times out."
        },
        {
          "id": "Q-RCT-276",
          "question": "What helper should be used when asserting on asynchronous state transitions in React Testing Library?",
          "options": [
            "setTimeout(done, 1000)",
            "waitFor(() => expect(...))",
            "process.nextTick()",
            "window.requestAnimationFrame()"
          ],
          "correctIndex": 1,
          "explanation": "waitFor runs the callback repeatedly at short intervals until expectations pass or the timeout threshold is exceeded."
        },
        {
          "id": "Q-RCT-277",
          "question": "Why is Vitest faster and more convenient than Jest in modern Vite/React stacks?",
          "options": [
            "Vitest ignores TypeScript errors completely.",
            "Vitest reuses Vite config, plugins, and transform pipelines directly without dual compilation or Babel configurations.",
            "Vitest runs tests only in cloud containers.",
            "Vitest does not support mock functions."
          ],
          "correctIndex": 1,
          "explanation": "Vitest shares Vite configuration, resolving plugins, and ES module loaders natively, eliminating the slow Babel/ts-jest dual-configuration overhead required by Jest."
        },
        {
          "id": "Q-RCT-278",
          "question": "How do you test a component that consumes TanStack React Query in React Testing Library?",
          "options": [
            "You cannot test TanStack Query components in Vitest.",
            "Wrap the component in a QueryClientProvider with a dedicated test QueryClient (configured with retry: false).",
            "Mock the entire TanStack Query library with vi.mock('@tanstack/react-query').",
            "Use synchronous localStorage."
          ],
          "correctIndex": 1,
          "explanation": "Creating a custom render wrapper that provides a fresh QueryClient configured with retry: false ensures tests run cleanly without unwanted background retry delays."
        },
        {
          "id": "Q-RCT-279",
          "question": "When should getByTestId be used in test suites?",
          "options": [
            "For every single element to make tests completely explicit.",
            "As a last resort escape hatch when semantic queries (getByRole, getByLabelText, getByText) cannot target the element.",
            "Only for CSS animations.",
            "Only in end-to-end Playwright tests."
          ],
          "correctIndex": 1,
          "explanation": "getByTestId does not validate accessibility or user-perceived content. It should only be used when semantic roles or text content are inadequate."
        },
        {
          "id": "Q-RCT-280",
          "question": "What Vitest function creates a mock function to record calls and arguments?",
          "options": [
            "vi.fn()",
            "vi.spy()",
            "vi.mockComponent()",
            "vi.stubEnv()"
          ],
          "correctIndex": 0,
          "explanation": "vi.fn() creates a standalone mock function that records invocation count, arguments, and return values."
        }
      ]
    },
    {
      "id": "ASM-RCT-029",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-029",
      "title": "Playwright E2E Testing Assessment",
      "summary": "Assess your expertise in cross-browser automation, storageState auth reuse, Page Object Models, and visual regression.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-281",
          "question": "What is the primary benefit of the Page Object Model (POM) pattern in Playwright?",
          "options": [
            "It compiles TypeScript code to WebAssembly for 10x speed.",
            "It encapsulates UI locators and user interactions into reusable page classes, isolating test specs from DOM refactoring.",
            "It replaces the browser with a mock engine.",
            "It generates database seed records automatically."
          ],
          "correctIndex": 1,
          "explanation": "The Page Object Model abstracts UI elements and interactions into dedicated classes, making test specs cleaner and ensuring selector updates occur in one single place."
        },
        {
          "id": "Q-RCT-282",
          "question": "How does Playwright eliminate the need for manual sleep/wait statements?",
          "options": [
            "By running all tests in single-threaded synchronous mode.",
            "Through built-in auto-waiting that checks element actionability (visible, attached, stable, enabled) before performing clicks or typing.",
            "By slowing down network requests intentionally.",
            "By executing tests only against static HTML files."
          ],
          "correctIndex": 1,
          "explanation": "Playwright automatically waits for elements to satisfy actionability criteria (attached to DOM, visible, receiving events, enabled) before executing actions."
        },
        {
          "id": "Q-RCT-283",
          "question": "How can Playwright avoid repeated UI logins before every test in a test suite?",
          "options": [
            "By disabling authentication checks in production.",
            "By using auth setup projects to perform login once and save session storage/cookies via storageState, which subsequent tests load.",
            "By hardcoding user tokens into the browser binary.",
            "By using guest accounts exclusively."
          ],
          "correctIndex": 1,
          "explanation": "Playwright storageState serializes cookies and local storage tokens into a JSON file, allowing subsequent tests to start pre-authenticated without repeating the login UI flow."
        },
        {
          "id": "Q-RCT-284",
          "question": "Which browsers does Playwright test natively using its multi-engine architecture?",
          "options": [
            "Internet Explorer 11 only.",
            "Chromium, Firefox, and WebKit (Safari engine).",
            "Chrome only.",
            "Opera and Brave only."
          ],
          "correctIndex": 1,
          "explanation": "Playwright supports the three major rendering engines: Chromium (Chrome/Edge), Firefox (Gecko), and WebKit (Safari)."
        },
        {
          "id": "Q-RCT-285",
          "question": "What Playwright assertion performs visual regression testing against golden baseline images?",
          "options": [
            "expect(page).toBeIdenticalTo()",
            "expect(page.locator('...')).toHaveScreenshot()",
            "expect(image).toMatchPixelGrid()",
            "page.verifyVisualFidelity()"
          ],
          "correctIndex": 1,
          "explanation": "toHaveScreenshot() captures a screenshot of the page or locator and compares it pixel-by-pixel against reference baseline images, failing if differences exceed threshold."
        },
        {
          "id": "Q-RCT-286",
          "question": "How do you intercept and mock a specific backend network route in Playwright?",
          "options": [
            "page.route('**/api/v1/metrics', (route) => route.fulfill({ json: { ... } }))",
            "page.mockFetch('/api/v1/metrics')",
            "page.overrideNetworkLayer()",
            "page.setProxyHeader()"
          ],
          "correctIndex": 0,
          "explanation": "page.route() allows intercepting network traffic matching URL patterns and fulfilling them with custom JSON, status codes, or headers."
        },
        {
          "id": "Q-RCT-287",
          "question": "How does Playwright isolate test cases from one another?",
          "options": [
            "By running each test on a different physical computer.",
            "Each test runs in a brand-new, isolated BrowserContext with fresh cookies and storage, avoiding cross-test contamination.",
            "By restarting the operating system between tests.",
            "By clearing the DNS cache before each step."
          ],
          "correctIndex": 1,
          "explanation": "BrowserContexts provide browser-level isolation similar to an incognito profile, spinning up in milliseconds without relaunching the browser process."
        },
        {
          "id": "Q-RCT-288",
          "question": "What command-line tool in Playwright allows developers to record user actions and generate test code automatically?",
          "options": [
            "npx playwright test --auto",
            "npx playwright codegen <url>",
            "npx playwright recorder-start",
            "npx playwright inspect-ui"
          ],
          "correctIndex": 1,
          "explanation": "npx playwright codegen launches a browser and records clicks, typing, and navigation, automatically generating Playwright test code in real-time."
        },
        {
          "id": "Q-RCT-289",
          "question": "How do you wait for a file download to complete in Playwright?",
          "options": [
            "const downloadPromise = page.waitForEvent('download'); await button.click(); const download = await downloadPromise;",
            "await page.waitForFileOnDisk('file.csv');",
            "await page.sleep(5000);",
            "const file = page.getDownloadedFile();"
          ],
          "correctIndex": 0,
          "explanation": "Setting up page.waitForEvent('download') before triggering the action returns a Promise that resolves to the Download object once triggered."
        },
        {
          "id": "Q-RCT-290",
          "question": "What is the Playwright Trace Viewer?",
          "options": [
            "A database logger that records SQL queries.",
            "A GUI tool that provides a timeline inspection of every action, DOM snapshot before/after each step, console logs, and network waterfalls during a test run.",
            "A terminal linter for test syntax.",
            "A memory profiling extension."
          ],
          "correctIndex": 1,
          "explanation": "Playwright Trace Viewer provides deep post-mortem debugging with complete DOM snapshots, action screencasts, console logs, and network waterfalls for failing CI runs."
        }
      ]
    },
    {
      "id": "ASM-RCT-030",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-030",
      "title": "Enterprise Security in React Assessment",
      "summary": "Validate knowledge of frontend security vectors, DOMPurify HTML sanitization, Content Security Policy, and Server Action defense.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-291",
          "question": "Why is storing JWT auth tokens in window.localStorage considered a security vulnerability?",
          "options": [
            "localStorage is cleared every time the user refreshes the browser tab.",
            "Any JavaScript running on the origin (including malicious npm packages, XSS attacks, or compromised CDN scripts) can read and exfiltrate tokens.",
            "localStorage only supports numbers and booleans.",
            "localStorage has a 100-byte limit in modern browsers."
          ],
          "correctIndex": 1,
          "explanation": "localStorage offers no isolation from scripts running on the page. In the event of an XSS vulnerability, malicious scripts can read localStorage tokens and exfiltrate them."
        },
        {
          "id": "Q-RCT-292",
          "question": "What cookie flags should be applied to session cookies to protect them from XSS and CSRF attacks?",
          "options": [
            "HttpOnly, Secure, and SameSite=Strict (or Lax)",
            "Public, Unrestricted, and Domain=wildcard",
            "ClientAccessible=true and NoSecure",
            "ReadWrite=true and Cache=public"
          ],
          "correctIndex": 0,
          "explanation": "HttpOnly prevents client JavaScript from reading the cookie; Secure ensures transmission only over HTTPS; SameSite=Strict/Lax prevents unauthorized cross-site requests."
        },
        {
          "id": "Q-RCT-293",
          "question": "What library is the industry standard for sanitizing raw HTML before passing to dangerouslySetInnerHTML?",
          "options": [
            "Babel",
            "DOMPurify (isomorphic-dompurify)",
            "Lodash",
            "Webpack HTML Plugin"
          ],
          "correctIndex": 1,
          "explanation": "DOMPurify sanitizes dirty HTML strings by stripping dangerous tags (<script>, <iframe>) and attributes (onerror, onclick), preventing XSS attacks."
        },
        {
          "id": "Q-RCT-294",
          "question": "How does React naturally protect JSX content from XSS attacks?",
          "options": [
            "By routing all strings through an antivirus API.",
            "By converting all string values into safe HTML entities before inserting them into the DOM.",
            "By refusing to render strings containing letters.",
            "By compiling all templates in an isolated iframe."
          ],
          "correctIndex": 1,
          "explanation": "When rendering expressions like <div>{content}</div>, React automatically escapes special HTML characters (<, >, &, \", ') into entity equivalents, preventing script execution."
        },
        {
          "id": "Q-RCT-295",
          "question": "What XSS vector can still execute in React despite JSX string escaping?",
          "options": [
            "<p>{userName}</p>",
            "<a href={userSuppliedUrl}>Visit Link</a> where userSuppliedUrl is 'javascript:alert(document.cookie)'",
            "<span>{totalCount}</span>",
            "<button onClick={() => alert('clicked')}>Click</button>"
          ],
          "correctIndex": 1,
          "explanation": "React does not automatically sanitize the href attribute of anchor tags. Passing a user-controlled 'javascript:...' URL will execute arbitrary JavaScript when clicked."
        },
        {
          "id": "Q-RCT-296",
          "question": "What is the role of a Content Security Policy (CSP) nonce in Next.js App Router?",
          "options": [
            "It replaces passwords during user authentication.",
            "It is a unique cryptographically random token generated per request, allowing only inline scripts containing that exact matching nonce to execute.",
            "It caches static CSS files on CDN edge nodes.",
            "It validates database schema migrations."
          ],
          "correctIndex": 1,
          "explanation": "A CSP nonce is generated per HTTP request on the server and attached to legitimate script tags; the browser blocks any injected inline script lacking this matching nonce."
        },
        {
          "id": "Q-RCT-297",
          "question": "Why must Next.js Server Actions always perform server-side authentication and schema validation?",
          "options": [
            "Server Actions run inside the client browser context.",
            "Server Actions expose public POST endpoints that anyone can call directly with arbitrary payloads using cURL or Postman, bypassing client forms.",
            "Server Actions cannot access server environment variables.",
            "Server Actions are deprecated in React 19."
          ],
          "correctIndex": 1,
          "explanation": "Server Actions are standard HTTP endpoints under the hood. Malicious actors can send requests directly without UI constraints, making server authentication and validation mandatory."
        },
        {
          "id": "Q-RCT-298",
          "question": "What HTTP header instructs browsers not to allow a page to be rendered within an iframe to prevent clickjacking?",
          "options": [
            "X-Frame-Options: DENY (or CSP frame-ancestors 'none')",
            "X-Content-Type-Options: nosniff",
            "Access-Control-Allow-Origin: *",
            "Cache-Control: no-cache"
          ],
          "correctIndex": 0,
          "explanation": "X-Frame-Options: DENY and Content-Security-Policy: frame-ancestors 'none' block the document from being embedded in frames/iframes, preventing clickjacking attacks."
        },
        {
          "id": "Q-RCT-299",
          "question": "What is Prototype Pollution in JavaScript client applications?",
          "options": [
            "Deleting Object.prototype from memory.",
            "An attack where user-controlled input modifies Object.prototype, altering the behavior and properties of all objects throughout the JavaScript runtime.",
            "Compiling TypeScript to old ES5 code.",
            "Overloading the browser memory limit."
          ],
          "correctIndex": 1,
          "explanation": "Prototype Pollution occurs when recursive merging of unvalidated user input modifies Object.prototype, causing downstream logical errors, bypasses, or remote code execution."
        },
        {
          "id": "Q-RCT-300",
          "question": "How should sensitive environment variables (such as database credentials or private API keys) be handled in Next.js?",
          "options": [
            "Prefix them with NEXT_PUBLIC_ so all components can access them.",
            "Do NOT prefix them with NEXT_PUBLIC_; keep them server-side only in .env.local and consume only within Server Components or Server Actions.",
            "Commit them directly into public GitHub repositories.",
            "Encode them into base64 strings and store in localStorage."
          ],
          "correctIndex": 1,
          "explanation": "Variables without the NEXT_PUBLIC_ prefix are stripped from client bundles during compilation and remain strictly accessible on the Node.js/Edge runtime."
        }
      ]
    },
    {
      "id": "ASM-RCT-031",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-031",
      "title": "Enterprise Capstone: AuraDashboard Assessment",
      "summary": "Verify comprehensive knowledge of the AuraDashboard enterprise multi-tenant analytics SaaS architecture.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-301",
          "question": "What architectural role do React Server Components play in the AuraDashboard SaaS application?",
          "options": [
            "Handling client button onClick handlers.",
            "Rendering the static layout shell, initial metric queries, and sensitive data securely on the server with zero client JavaScript bundle impact.",
            "Managing client-side URL search parameter animations.",
            "Rendering WebGL graphics on the GPU."
          ],
          "correctIndex": 1,
          "explanation": "Server Components fetch database data directly on the server, keeping database drivers and sensitive tokens off the client while transmitting zero component JavaScript."
        },
        {
          "id": "Q-RCT-302",
          "question": "In AuraDashboard, how is URL state (search params) synchronized with Zustand for filter management?",
          "options": [
            "By polling window.location every 10 milliseconds.",
            "By using custom hooks or libraries like nuqs to mirror filter changes to the URL bar, making filtered views instantly bookmarkable and shareable.",
            "By sending filter states via WebSockets to other users.",
            "By storing filters in browser IndexedDB only."
          ],
          "correctIndex": 1,
          "explanation": "Synchronizing table filters with URL search parameters (using nuqs or router.push) ensures filter states persist across reloads and can be shared via URL links."
        },
        {
          "id": "Q-RCT-303",
          "question": "What is the benefit of headless UI architecture in TanStack Table v8 within AuraDashboard?",
          "options": [
            "It provides built-in heavy CSS stylesheets that cannot be overridden.",
            "It handles all logic (sorting, filtering, pagination, column visibility) while granting complete styling and markup freedom to your Tailwind design system.",
            "It renders tables on the server using Puppeteer.",
            "It eliminates the need for HTML table elements."
          ],
          "correctIndex": 1,
          "explanation": "Headless UI libraries provide pure state management and logic without imposing styles or DOM structures, enabling seamless integration with any design system."
        },
        {
          "id": "Q-RCT-304",
          "question": "What function does revalidatePath() serve in a Next.js Server Action after mutating customer data?",
          "options": [
            "It restarts the Next.js production server.",
            "It invalidates the Next.js Data Cache for the specified route, triggering background re-rendering with fresh database content.",
            "It clears browser localStorage.",
            "It re-runs Vitest test suites."
          ],
          "correctIndex": 1,
          "explanation": "revalidatePath('/customers') purges the cached Server Component tree for that route, ensuring users immediately receive updated data without a full page refresh."
        },
        {
          "id": "Q-RCT-305",
          "question": "Why does AuraDashboard wrap metric grids in <Suspense fallback={<MetricGridSkeleton />}> boundaries?",
          "options": [
            "To prevent Googlebot from indexing metrics.",
            "To enable progressive streaming SSR: the navigation shell renders instantly while heavy metric queries stream into place asynchronously.",
            "To convert JavaScript into WebAssembly.",
            "To force metric calculations to execute on client phones."
          ],
          "correctIndex": 1,
          "explanation": "Suspense boundaries allow Next.js to stream the static shell immediately to the browser and stream slow async Server Component data chunks as they resolve."
        },
        {
          "id": "Q-RCT-306",
          "question": "What is an essential requirement for WCAG 2.1 AA accessibility compliance in enterprise data grids?",
          "options": [
            "Tables must not have borders.",
            "Tables must provide full keyboard navigation, accessible row/column headers (scope='col'), and aria-sort indicators on sortable columns.",
            "All text must be colored bright green.",
            "Tables must disable tab key navigation."
          ],
          "correctIndex": 1,
          "explanation": "WCAG AA compliance requires semantic table elements (th, td, scope), aria-sort for sorting state, and keyboard navigation support for interactive controls."
        },
        {
          "id": "Q-RCT-307",
          "question": "How does AuraDashboard achieve optimistic metric updates when a user modifies a dashboard setting?",
          "options": [
            "By waiting for the server response before modifying any UI state.",
            "By immediately updating the UI metric display using React 19 useOptimistic, then automatically reverting to previous state if the Server Action rejects.",
            "By reloading the entire page synchronously.",
            "By writing directly to the production database from the browser."
          ],
          "correctIndex": 1,
          "explanation": "React 19 useOptimistic allows immediate visual UI feedback during an ongoing Server Action mutation, rolling back automatically if an error occurs."
        },
        {
          "id": "Q-RCT-308",
          "question": "What file in an App Router route folder automatically isolates runtime errors and prevents entire dashboard crashes?",
          "options": [
            "loading.tsx",
            "error.tsx",
            "route.ts",
            "template.tsx"
          ],
          "correctIndex": 1,
          "explanation": "error.tsx defines an Error Boundary that catches runtime errors within its route segment, rendering a fallback UI while keeping the rest of the application alive."
        },
        {
          "id": "Q-RCT-309",
          "question": "What production budget rule was established for AuraDashboard first load JavaScript?",
          "options": [
            "Less than 85 kB gzipped shared by all routes.",
            "Exactly 5 MB uncompressed.",
            "No limit as long as the user has broadband.",
            "Under 1 kB total."
          ],
          "correctIndex": 0,
          "explanation": "An initial shared JavaScript budget under 85 kB gzipped ensures fast Time to Interactive and excellent performance on constrained mobile networks."
        },
        {
          "id": "Q-RCT-310",
          "question": "What is the role of Drizzle ORM or Prisma in AuraDashboard Server Component data fetching?",
          "options": [
            "Generating client-side React button animations.",
            "Providing type-safe SQL queries directly inside async Server Components without exposing database credentials to the browser.",
            "Compiling CSS styles at build time.",
            "Handling OAuth redirects in the browser."
          ],
          "correctIndex": 1,
          "explanation": "Modern ORMs provide end-to-end TypeScript type safety for database operations executed securely within Server Components and Server Actions."
        }
      ]
    },
    {
      "id": "ASM-RCT-032",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-032",
      "title": "Senior / Staff React Engineer Interview & System Design Assessment",
      "summary": "Evaluate Staff-level mastery of the RADIO system design framework, concurrent React internals, and architectural trade-offs.",
      "durationMinutes": 15,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-311",
          "question": "What does the 'RADIO' framework stand for in frontend system design interviews?",
          "options": [
            "React, Angular, Docker, iOS, Oracle",
            "Requirements, Architecture, Data Model, Interface (APIs), Optimizations",
            "Routing, Authentication, Deployment, Integration, Operations",
            "Redux, Actions, Dispatcher, Iterators, Observables"
          ],
          "correctIndex": 1,
          "explanation": "RADIO is the structured frontend system design framework: Requirements, Architecture, Data Model, Interface/APIs, and Optimizations."
        },
        {
          "id": "Q-RCT-312",
          "question": "What is 'tearing' in concurrent React rendering?",
          "options": [
            "When the browser window splits into two tabs.",
            "A visual bug where the UI displays different parts of the screen using different snapshots of the same external state during a concurrent render.",
            "When a React component unmounts without running cleanup.",
            "A crash caused by running out of CSS memory."
          ],
          "correctIndex": 1,
          "explanation": "Tearing occurs when a single user interaction observes conflicting snapshots of state across different components during an interrupted asynchronous render."
        },
        {
          "id": "Q-RCT-313",
          "question": "How does React 18/19 prevent tearing when reading from external mutable state stores?",
          "options": [
            "By disabling all asynchronous rendering.",
            "Via the useSyncExternalStore hook, which detects synchronous store mutations and guarantees a single consistent snapshot across the tree.",
            "By converting all stores into window.localStorage.",
            "By forcing full page reloads on store updates."
          ],
          "correctIndex": 1,
          "explanation": "useSyncExternalStore subscribes to external stores and forces synchronous reconciliation if a store mutation occurs during concurrent rendering, preventing tearing."
        },
        {
          "id": "Q-RCT-314",
          "question": "When architecting a real-time collaborative application (like Google Docs or Figma), what protocol is typically preferred over SSE?",
          "options": [
            "Server-Sent Events (SSE)",
            "WebSockets or WebRTC for bidirectional, full-duplex, low-latency message streaming.",
            "HTTP Long-Polling every 5 seconds.",
            "DNS over HTTPS."
          ],
          "correctIndex": 1,
          "explanation": "Collaborative canvases require frequent client-to-server and server-to-client updates; WebSockets provide full-duplex communication with minimal frame overhead."
        },
        {
          "id": "Q-RCT-315",
          "question": "What is a major architectural drawback of Micro-Frontend architectures?",
          "options": [
            "Teams cannot use different programming languages.",
            "Increased bundle size from duplicate runtime libraries, heightened operational complexity, complex cross-app state sharing, and styling collisions.",
            "Micro-frontends cannot run in Chrome.",
            "Micro-frontends cannot use TypeScript."
          ],
          "correctIndex": 1,
          "explanation": "Micro-frontends introduce significant trade-offs: bundle duplication, complex dependency orchestration, testing difficulties, and shared state friction."
        },
        {
          "id": "Q-RCT-316",
          "question": "What is the difference between an event loop microtask and the React layout phase?",
          "options": [
            "Microtasks run on the GPU while React layout runs on the server.",
            "Microtasks (e.g. Promise.then) execute before the browser paints; React layout effects run synchronously during the commit phase before paint, allowing synchronous DOM layout measurement.",
            "Microtasks cannot execute JavaScript.",
            "There is no difference in execution timing."
          ],
          "correctIndex": 1,
          "explanation": "Both occur before the browser paints pixels to the screen, but React layout phase is a synchronous traversal of the committed fiber tree that runs useLayoutEffect before yielding to paint."
        },
        {
          "id": "Q-RCT-317",
          "question": "What is the primary difference between cursor-based pagination and offset/limit pagination in large datasets?",
          "options": [
            "Offset pagination is faster than cursor pagination on 10M rows.",
            "Cursor-based pagination uses a stable unique record pointer (e.g. createdAt/id), preventing duplicate or skipped items when new items are inserted into the dataset concurrently.",
            "Cursor pagination requires WebSockets.",
            "Offset pagination only works with MongoDB."
          ],
          "correctIndex": 1,
          "explanation": "Offset pagination shifts when new records are inserted at the top of a dataset (causing duplicate records on page 2). Cursors anchor queries to specific record IDs, providing deterministic results."
        },
        {
          "id": "Q-RCT-318",
          "question": "In a Senior Engineer interview, how should you explain the trade-off of using Server-Sent Events (SSE) over WebSockets for AI chat streaming?",
          "options": [
            "WebSockets are illegal for AI streaming.",
            "SSE operates over standard HTTP/2, supports automatic reconnection and firewall traversal, and is lightweight for unidirectional server-to-client token streaming.",
            "SSE requires a separate binary proxy server.",
            "WebSockets cannot send text strings."
          ],
          "correctIndex": 1,
          "explanation": "AI token generation is unidirectional (server streams tokens to client). SSE utilizes standard HTTP/2, has native browser EventSource support with auto-reconnection, and avoids WebSocket proxy friction."
        },
        {
          "id": "Q-RCT-319",
          "question": "What strategy allows an application to remain functional for users experiencing intermittent or zero network connectivity?",
          "options": [
            "Blocking the UI with a full-screen spinner.",
            "Offline-first architecture utilizing Service Workers (Cache API) for static assets, IndexedDB for local data persistence, and background sync queues for mutations.",
            "Storing entire relational databases in browser RAM.",
            "Disabling all mutation features permanently."
          ],
          "correctIndex": 1,
          "explanation": "Offline-first systems combine Service Worker asset caching with IndexedDB client databases and queued optimistic mutations that sync upon network restoration."
        },
        {
          "id": "Q-RCT-320",
          "question": "What distinguishes a Staff Engineer from a Senior Engineer in frontend technical discussions?",
          "options": [
            "Staff Engineers write faster raw JavaScript loops.",
            "Staff Engineers evaluate business context, operational costs, organizational team boundaries, long-term maintenance trade-offs, and mentor engineers across teams.",
            "Staff Engineers only write CSS code.",
            "Staff Engineers refuse to use external npm packages."
          ],
          "correctIndex": 1,
          "explanation": "Staff Engineers focus on strategic impact: aligning technical architecture with business goals, managing organizational boundaries, mentoring teams, and evaluating systemic trade-offs."
        }
      ]
    }
  ]
};
