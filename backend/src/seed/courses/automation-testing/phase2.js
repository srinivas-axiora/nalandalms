export const phase2Chapters = [
  {
    id: "CH-AUT-008",
    courseId: "CRS-AUT-001",
    title: "Playwright Architecture & Auto-Waiting Mechanics",
    order: 8,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=XzWjBwbN65Y",
    content: `# Playwright Architecture & Auto-Waiting Mechanics

### Learning Objectives
1. Understand Microsoft Playwright's single-WebSocket architecture vs. Selenium's HTTP polling model.
2. Master Playwright's hierarchy: \`Browser\`, \`BrowserContext\`, and \`Page\`.
3. Eliminate race conditions and flakiness through built-in Actionability Checks and Auto-Waiting.
4. Execute cross-browser automation across Chromium, WebKit, and Firefox without third-party drivers.

---

### 1. Playwright vs. Selenium Architecture

While Selenium uses HTTP request/response hops per WebDriver command, Playwright establishes a single, multiplexed WebSocket connection directly to the browser engine:

\`\`\`
   SELENIUM WEBDRIVER:
   [ Test Script ] --HTTP POST--> [ Driver ] --Protocol--> [ Browser ]
   [ Test Script ] <--HTTP 200--- [ Driver ] <--Response-- [ Browser ]
   (Repeated HTTP roundtrips introduce latency)

   MICROSOFT PLAYWRIGHT:
   [ Test Runner (Node/Java/Python) ]
                  |
                  |  Single Persistent WebSocket (Fast, Bidirectional)
                  v
   [ Playwright Driver Process ]
                  |  Native Browser Engine Protocol (CDP, WebKit, Juggler)
                  v
   [ Chromium / WebKit / Firefox ]
\`\`\`

---

### 2. Browser Contexts: Ultra-Fast Isolation

In Selenium, opening a new browser session requires launching a heavy OS process (\`chromedriver.exe\`), taking 2–4 seconds per test.

Playwright introduces **BrowserContexts**: lightweight, fully isolated incognito browser instances created in milliseconds:
- Each test gets its own pristine cache, cookies, and local storage.
- A single browser instance can host hundreds of isolated contexts concurrently.
- Supports multi-user testing within the same test (e.g. Buyer and Seller chatting in parallel windows).

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('multi-user chat transaction', async ({ browser }) => {
  // Context 1: Customer
  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await customerPage.goto('https://nalanda.learning/chat');

  // Context 2: Support Agent (Completely isolated session)
  const agentContext = await browser.newContext();
  const agentPage = await agentContext.newPage();
  await agentPage.goto('https://nalanda.learning/agent/inbox');

  // Actions in context 1 do not affect context 2
});
\`\`\`

---

### 3. Playwright Actionability Checks (Auto-Waiting)

Playwright eliminates 95% of explicit wait logic by automatically checking that an element satisfies 7 strict actionability criteria before performing an action:

| Actionability Check | Meaning | Verified Actions |
| :--- | :--- | :--- |
| **Attached** | Element exists in the DOM tree. | \`click\`, \`fill\`, \`check\` |
| **Visible** | Element has non-empty bounding box & is not \`display:none\` or \`visibility:hidden\`. | \`click\`, \`fill\`, \`select\` |
| **Stable** | Element is not animating or moving across viewports. | \`click\`, \`hover\` |
| **Receives Events** | Element is not obscured by modals, spinners, or sticky headers. | \`click\`, \`tap\` |
| **Enabled** | Element does not have the \`disabled\` HTML attribute. | \`click\`, \`fill\` |
| **Editable** | Element is not marked \`readonly\`. | \`fill\`, \`type\` |

If any check fails, Playwright retries up to the configured timeout (default: 30s) before throwing an error.

---

### 4. Hands-on Lab: Playwright First Flight
1. Initialize a Playwright project: \`npm init playwright@latest\`.
2. Inspect \`playwright.config.ts\` across desktop Chrome, mobile Safari (WebKit), and Firefox.
3. Write an end-to-end authentication spec verifying auto-waiting without any \`waitForTimeout\` calls.`
  },
  {
    id: "CH-AUT-009",
    courseId: "CRS-AUT-001",
    title: "Playwright Advanced Locators, Codegen & UI Mode",
    order: 9,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Playwright Advanced Locators, Codegen & UI Mode

### Learning Objectives
1. Master Playwright's user-first locator APIs: \`getByRole\`, \`getByText\`, \`getByLabel\`, and \`getByTestId\`.
2. Filter and chain locators with \`filter({ hasText })\` and child locators.
3. Leverage Playwright Codegen (\`npx playwright codegen\`) for rapid test authoring.
4. Utilize Playwright UI Mode (\`npx playwright test --ui\`) for interactive time-travel debugging.

---

### 1. User-First Locators

Playwright recommends locators that mimic how real users and assistive screen readers find elements:

\`\`\`typescript
// 1. Located by explicit Accessible Role & Accessible Name
await page.getByRole('button', { name: 'Submit Payment' }).click();
await page.getByRole('heading', { level: 1, name: 'Welcome Back' }).toBeVisible();

// 2. Located by Form Label (clicks input associated with <label for="...">)
await page.getByLabel('Password').fill('SuperSecret123!');

// 3. Located by Placeholder text
await page.getByPlaceholder('Search courses or instructors...').fill('Automation');

// 4. Located by Text content
await page.getByText('Order #98421 confirmed').toBeVisible();

// 5. Dedicated test ID hook (fallback for non-accessible elements)
await page.getByTestId('cart-total-badge').toHaveText('$149.00');
\`\`\`

---

### 2. Locator Filtering & Chaining

When querying repeated complex elements (like product cards in a catalog), chaining and filtering isolate the exact target without complex XPath:

\`\`\`typescript
// Find the product card that specifically contains the text "Playwright Guide",
// and then click the "Add to Cart" button INSIDE that specific card
const productCard = page
  .locator('.product-tile')
  .filter({ hasText: 'Playwright Guide' });

await productCard.getByRole('button', { name: 'Add to Cart' }).click();

// Filter by child element presence
const premiumRow = page
  .getByRole('row')
  .filter({ has: page.getByRole('badge', { name: 'VIP Tier' }) });
\`\`\`

---

### 3. Playwright UI Mode & Codegen

#### A. Playwright Codegen
Open an interactive browser that automatically writes test code as you click and type:
\`\`\`bash
npx playwright codegen https://nalanda.learning/demo
\`\`\`
- Emits resilient \`getByRole\` locators automatically.
- Simulates mobile viewports (e.g. \`--device="iPhone 14"\`).
- Generates authentication state cookies for session reuse.

#### B. Interactive UI Mode
Launch the complete desktop test runner:
\`\`\`bash
npx playwright test --ui
\`\`\`
- **Time-Travel Debugging**: Hover over every execution step to view the exact DOM snapshot before and after each action.
- **Watch Mode**: Automatically re-runs tests upon saving file edits.
- **Locator Picker**: Live selector testing directly within the running browser.

---

### 4. Hands-on Lab: UI Mode Investigation
1. Launch UI Mode on a multi-step checkout spec.
2. Step through each action in the timeline filmstrip.
3. Use the Locator Picker to find a cleaner \`getByRole\` selector for a stubborn dropdown.`
  },
  {
    id: "CH-AUT-010",
    courseId: "CRS-AUT-001",
    title: "Network Interception, Mocking & HAR Replay in Playwright",
    order: 10,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# Network Interception, Mocking & HAR Replay in Playwright

### Learning Objectives
1. Intercept HTTP requests and mock backend API responses using \`page.route()\`.
2. Simulate edge cases: network errors, HTTP 500 crashes, high latency, and rate limits.
3. Modify live API responses dynamically (injecting mock fields into real backend data).
4. Record and replay network traffic using HTTP Archive (HAR) files for offline deterministic testing.

---

### 1. Why Network Mocking in UI Automation?

Testing the UI should not depend on unstable staging environments, third-party payment gateways, or slow microservices.

\`\`\`
   [ Browser (Playwright) ]
               |
               | Fetch: GET /api/v1/user/profile
               v
   +-----------------------+
   |   page.route() Gate   |  --> Intercepts in-flight request
   +-----------+-----------+
               |
         +-----+-----+
         |           |
    (Mocked)     (Forwarded)
         |           |
         v           v
   [ Return JSON ] [ Real Staging Server ]
   (No Network)
\`\`\`

**Key Benefits**:
- Instant execution (zero network roundtrips).
- Deterministic test data (no database cleanup required).
- Ability to test impossible edge cases (e.g. third-party Stripe down, HTTP 504 Gateway Timeout).

---

### 2. Mocking API Responses with \`page.route()\`

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('displays banner when customer account is suspended', async ({ page }) => {
  // Intercept the profile API call and fulfill with mock JSON
  await page.route('**/api/v1/user/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'usr_8921',
        name: 'Alex Morgan',
        status: 'SUSPENDED',
        suspensionReason: 'Payment Delinquency'
      })
    });
  });

  await page.goto('/dashboard');

  // Verify UI renders suspension banner correctly
  await expect(page.getByRole('alert')).toContainText('Account Suspended: Payment Delinquency');
});
\`\`\`

---

### 3. Simulating Network Failures & Aborting Trackers

\`\`\`typescript
// 1. Simulate server crash (HTTP 500)
await page.route('**/api/v1/checkout', route => route.abort('failed'));

// 2. Abort all third-party analytics to speed up test execution by 40%
await page.route(/(google-analytics|hotjar|segment)\.com/, route => route.abort());

// 3. Simulate high network latency (3000ms delay)
await page.route('**/api/v1/search*', async route => {
  await new Promise(r => setTimeout(r, 3000));
  await route.continue();
});
\`\`\`

---

### 4. HAR Recording & Deterministic Replay

Playwright can record all network traffic during a baseline run and replay it in subsequent CI runs:

\`\`\`typescript
// Replay from HAR file; fall back to network if missing
test('catalog loads from recorded HAR', async ({ page }) => {
  await page.routeFromHAR('./fixtures/catalog-traffic.har', {
    url: '**/api/**',
    update: false // Set to true once to record/update the HAR
  });

  await page.goto('/catalog');
  await expect(page.getByRole('listitem')).toHaveCount(12);
});
\`\`\`

---

### 5. Hands-on Lab: Error Boundary Testing
1. Configure \`page.route()\` to return an HTTP 503 error on the recommendations widget.
2. Verify that the UI displays a fallback message without crashing the parent page.
3. Block Google Tag Manager scripts to optimize spec duration.`
  },
  {
    id: "CH-AUT-011",
    courseId: "CRS-AUT-001",
    title: "Playwright Tracing, Video Capture & Visual Debugging",
    order: 11,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Playwright Tracing, Video Capture & Visual Debugging

### Learning Objectives
1. Configure automated Playwright Tracing (\`trace.zip\`) on test failures in CI pipelines.
2. Analyze traces using the standalone Playwright Trace Viewer.
3. Inspect action timelines, DOM snapshots, network payloads, and console logs.
4. Record video evidence and capture full-page failure screenshots.

---

### 1. The Post-Mortem Debugging Problem

When an automated test fails on a headless CI server at 2:00 AM, standard console stack traces rarely reveal why:
- Did a modal obscure the button?
- Did an API call return HTTP 500?
- Was there a transient layout shift?

**Playwright Tracing** captures an immutable, step-by-step recording of the entire test lifecycle without video compression artifacts.

\`\`\`
   PLAYWRIGHT TRACE VIEWER ARTIFACT:
   +-------------------------------------------------------------+
   | [Actions Filmstrip Timeline: 0.0s === 1.2s === 2.4s === 3.1s]|
   +-------------------------------------------------------------+
   | Actions:                    | Live DOM Snapshot:            |
   | 1. goto('/checkout')        | [Before Action] [After Action]|
   | 2. fill('#card-number')     |                               |
   | 3. click('button#pay') FAIL | Visible button covered by     |
   |                             | unhandled error banner!       |
   +-----------------------------+-------------------------------+
   | Console Logs:               | Network Waterfall:            |
   | Uncaught TypeError: ...     | POST /api/pay -> 500 (340ms)  |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Configuring Tracing in \`playwright.config.ts\`

\`\`\`typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Collect trace only when a test fails on CI
    trace: 'retain-on-failure',

    // Record video only for failing tests
    video: 'retain-on-failure',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Viewport standard
    viewport: { width: 1920, height: 1080 }
  },
  reporter: [
    ['html', { open: 'never' }],
    ['github']
  ]
});
\`\`\`

---

### 3. Inspecting Traces Locally & Remotely

When a test fails in GitHub Actions, download the uploaded \`trace.zip\` artifact and inspect it:

\`\`\`bash
# Open trace locally in desktop browser
npx playwright show-trace ./test-results/checkout-failure/trace.zip

# Or open remotely without installing Playwright:
# Navigate to: https://trace.playwright.dev and drag-and-drop trace.zip
\`\`\`

#### Key Diagnostic Tabs inside Trace Viewer:
1. **Action Snapshot**: View the DOM state *Before* the action was initiated, the *Action* hit-test point (red dot), and the *After* state.
2. **Source**: Highlights the exact line of code that triggered the failure.
3. **Console**: Displays all browser console messages and uncaught exceptions.
4. **Network**: Full HTTP network waterfall with request headers, status codes, and response bodies.

---

### 4. Hands-on Lab: Trace Diagnosis Challenge
1. Execute a test spec configured to intentionally fail due to an obscured modal.
2. Download the generated \`trace.zip\` artifact.
3. Open Trace Viewer, identify the obscuring element in the Before snapshot, and rectify the test.`
  },
  {
    id: "CH-AUT-012",
    courseId: "CRS-AUT-001",
    title: "Cypress Architecture, In-Browser Execution & Limitations",
    order: 12,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Cypress Architecture, In-Browser Execution & Limitations

### Learning Objectives
1. Understand Cypress's unique architecture: in-browser execution within the same NodeJS/Chrome runloop.
2. Master Cypress asynchronous command chaining and Cypress queue execution.
3. Intercept and stub network requests using \`cy.intercept()\`.
4. Analyze Cypress trade-offs: multi-tab limitations, multi-domain restrictions, and language support.

---

### 1. Cypress Architectural Paradigm

Unlike Selenium and Playwright which run out-of-process and control browsers over network protocols, Cypress executes **directly inside the browser**:

\`\`\`
   SELENIUM / PLAYWRIGHT (Out-of-Process):
   [ Test Code (Node / Java) ] ===== HTTP / WS =====> [ Browser Engine ]

   CYPRESS (In-Browser):
   +-------------------------------------------------------------+
   |                       BROWSER PROCESS                       |
   |                                                             |
   |  +--------------------+             +--------------------+  |
   |  | Cypress Runner App |<----------->| Application Under  |  |
   |  | (Test Spec Code)   | Direct JS   | Test (IFrame)      |  |
   |  +--------------------+ Access DOM  +--------------------+  |
   |                                                             |
   +-------------------------------------------------------------+
\`\`\`

**Consequences of In-Browser Execution**:
- Direct synchronous access to window objects, React component state, and \`localStorage\`.
- Native events fired without OS-level driver overhead.
- Inherent architectural limitations (runs inside the browser sandbox).

---

### 2. Cypress Command Chaining & Asynchronous Queue

Cypress commands look synchronous, but they enqueue commands into a pipeline that executes asynchronously:

\`\`\`javascript
describe('Shopping Cart Flow', () => {
  it('adds item and verifies cart badge', () => {
    // Intercept network call
    cy.intercept('POST', '/api/cart/add').as('addToCart');

    cy.visit('/products/laptop-pro');
    cy.get('[data-cy="add-btn"]').click();

    // Explicitly wait for the aliased network response
    cy.wait('@addToCart').its('response.statusCode').should('eq', 200);

    // Automatic retry assertion
    cy.get('[data-cy="cart-count"]').should('have.text', '1');
  });
});
\`\`\`

---

### 3. Cypress Limitations vs. Playwright

While Cypress offers a developer-friendly developer experience (DX), SDETs must understand its hard architectural boundaries:

| Feature / Capability | Cypress | Playwright |
| :--- | :--- | :--- |
| **Execution Architecture** | In-Browser (runs in iframe) | Out-of-Process (WebSocket protocol) |
| **Language Support** | JavaScript / TypeScript only | TypeScript, JavaScript, Python, Java, C# |
| **Multi-Tab Support** | ❌ No native multi-tab support | ✅ Full multi-tab & multi-window support |
| **Multi-Domain Navigation** | Limited (requires \`cy.origin\`) | ✅ Seamless across multiple domains |
| **Browser Engines** | Chromium, Firefox, WebKit (beta) | Native Chromium, WebKit (Safari), Firefox |
| **Speed & Concurrency** | Slower (heavy runner UI overhead)| 3x–5x faster execution & low resource footprint|

---

### 4. Hands-on Lab: Cypress Test Authoring
1. Scaffold a Cypress suite: \`npm install cypress --save-dev\`.
2. Configure \`cy.intercept\` to stub a weather API response.
3. Write an assertion chain verifying UI updates when the stubbed payload returns.`
  },
  {
    id: "CH-AUT-013",
    courseId: "CRS-AUT-001",
    title: "Component Testing vs. E2E: Testing Modern Design Systems",
    order: 13,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# Component Testing vs. E2E: Testing Modern Design Systems

### Learning Objectives
1. Understand Component Testing in Playwright Component Testing (CT) and Cypress Component Testing.
2. Differentiate Component Tests from Unit Tests and End-to-End Tests.
3. Mount frontend framework components (React, Vue, Svelte) in real browser engines without backend servers.
4. Test props, component states, keyboard accessibility, and DOM events in isolation.

---

### 1. Where Component Testing Fits

Before Component Testing existed, teams were forced into a painful compromise:
- Test components via **JSDOM** (e.g. React Testing Library + Jest): Super fast, but lacks a real browser layout engine (cannot verify true CSS, bounding boxes, or click intercepts).
- Test components via **E2E UI Tests**: Real browser, but requires deploying the entire backend stack and navigating 5 pages just to test a single modal.

**Component Testing** mounts the isolated component directly into a real headless browser:

\`\`\`
                     /\
                    /  \
                   / E2E\            <-- Entire stack: Frontend + Backend + DB
                  /------\
                 /  Comp  \          <-- Real Browser: Mounts isolated component
                /  Testing \             (Playwright CT, Cypress CT)
               /------------\
              /  Unit Tests  \       <-- JSDOM / Node: Pure logic & algorithms
             /----------------\
\`\`\`

---

### 2. Playwright Component Testing (Playwright CT)

Playwright CT uses Vite to package and mount components instantly inside real Chromium, WebKit, and Firefox instances.

\`\`\`tsx
// Button.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { Button } from './Button';

test('renders primary variant and fires onClick callback', async ({ mount }) => {
  let clicked = false;

  // Mount component directly in browser context with props
  const component = await mount(
    <Button 
      variant="primary" 
      onClick={() => { clicked = true; }}
    >
      Confirm Order
    </Button>
  );

  // Assert computed styles and accessibility
  await expect(component).toHaveText('Confirm Order');
  await expect(component).toHaveCSS('background-color', 'rgb(79, 70, 229)');

  // Interact like a real user
  await component.click();
  expect(clicked).toBe(true);
});
\`\`\`

---

### 3. Testing Complex Component States: Modal Dialogs

\`\`\`tsx
test('modal traps keyboard focus and closes on Escape key', async ({ mount }) => {
  const component = await mount(
    <ConfirmationModal 
      isOpen={true} 
      title="Delete Account?" 
    />
  );

  // Verify modal is visible
  await expect(component.getByRole('dialog')).toBeVisible();

  // Test keyboard escape event
  await component.press('Escape');

  // Verify modal unmounts
  await expect(component.getByRole('dialog')).not.toBeVisible();
});
\`\`\`

---

### 4. Hands-on Lab: Component Test Suite
1. Configure Playwright CT for a React component library.
2. Mount an interactive \`<DropdownMenu />\` component.
3. Test keyboard arrow navigation (Up/Down) and item selection in isolation.`
  }
];

export const phase2Assessments = [
  {
    id: "ASM-AUT-008",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-008",
    title: "Assessment: Playwright Architecture & Auto-Waiting",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-008-01",
        text: "What protocol does Microsoft Playwright use to communicate with browser engines instead of HTTP polling?",
        options: ["A single persistent WebSocket connection", "FTP", "Telnet", "SMTP"],
        correctAnswer: 0,
        explanation: "Playwright uses a fast, multiplexed, bidirectional WebSocket connection directly to the browser process."
      },
      {
        id: "Q-AUT-008-02",
        text: "What is a 'BrowserContext' in Playwright?",
        options: [
          "An isolated, incognito-like browser session created in milliseconds with its own cookies and local storage",
          "A desktop monitor setting",
          "The Java compiler",
          "A physical server rack"
        ],
        correctAnswer: 0,
        explanation: "BrowserContexts provide lightweight, complete test isolation without the overhead of restarting the browser executable."
      },
      {
        id: "Q-AUT-008-03",
        text: "Which of the following is NOT one of Playwright's built-in Actionability Checks performed before a click() action?",
        options: [
          "Checking if the element is attached to the DOM",
          "Checking if the element is visible and stable (not animating)",
          "Checking if the element's source code was written in TypeScript",
          "Checking if the element receives pointer events without being obscured"
        ],
        correctAnswer: 2,
        explanation: "Actionability checks verify DOM attachment, visibility, stability, enabled state, and event reception, not programming language."
      },
      {
        id: "Q-AUT-008-04",
        text: "How does Playwright execute tests across Apple Safari without running on macOS hardware?",
        options: [
          "It uses open-source WebKit compiled directly for Linux and Windows",
          "It converts the test into a YouTube video",
          "Safari tests are simulated in Google Chrome",
          "Safari testing cannot be done on Linux"
        ],
        correctAnswer: 0,
        explanation: "Playwright builds and packages open-source WebKit binaries that run natively on Linux, Windows, and macOS."
      },
      {
        id: "Q-AUT-008-05",
        text: "Why does Playwright's auto-waiting eliminate the majority of flaky test failures?",
        options: [
          "It automatically waits for elements to become visible, stable, and interactable before performing actions, avoiding race conditions",
          "It slows down all tests by 10 seconds",
          "It deletes failed tests from the report",
          "It skips all assertions"
        ],
        correctAnswer: 0,
        explanation: "Auto-waiting dynamically checks readiness before each action, eliminating race conditions without arbitrary sleeps."
      },
      {
        id: "Q-AUT-008-06",
        text: "In Playwright, what object represents a single browser tab or window within a BrowserContext?",
        options: ["Page", "WindowFrame", "TabSession", "DOMInstance"],
        correctAnswer: 0,
        explanation: "A 'Page' object in Playwright corresponds to a specific web document or browser tab."
      },
      {
        id: "Q-AUT-008-07",
        text: "How can two completely isolated users (e.g., a buyer and a seller) be tested concurrently within a single Playwright test?",
        options: [
          "By creating two distinct BrowserContexts from the same browser instance: browser.newContext()",
          "By installing two physical operating systems",
          "By using two mice simultaneously",
          "It is technically impossible in automation"
        ],
        correctAnswer: 0,
        explanation: "Multiple BrowserContexts run concurrently with distinct cookies and local storage, allowing multi-user interaction testing."
      },
      {
        id: "Q-AUT-008-08",
        text: "What is the default action timeout in Playwright if an actionability check is not satisfied?",
        options: ["30 seconds", "1 second", "5 minutes", "There is no timeout"],
        correctAnswer: 0,
        explanation: "Playwright defaults to a 30-second timeout before failing an action with a TimeoutError."
      },
      {
        id: "Q-AUT-008-09",
        text: "What method in Playwright navigates to a URL and waits for the page load event by default?",
        options: ["page.goto(url)", "page.navigate(url)", "page.open(url)", "page.visit(url)"],
        correctAnswer: 0,
        explanation: "'page.goto(url)' navigates to the specified address and waits for the network load event."
      },
      {
        id: "Q-AUT-008-10",
        text: "Why should 'page.waitForTimeout(5000)' be avoided in production Playwright suites?",
        options: [
          "It forces an unconditional sleep that slows down test runs and promotes lazy wait design over proper assertion-based waits",
          "It deletes all cookies",
          "It causes the browser window to close",
          "It is deprecated and throws compile errors"
        ],
        correctAnswer: 0,
        explanation: "Explicit time sleeps undermine Playwright's auto-waiting design and add unnecessary latency to CI pipelines."
      }
    ]
  },
  {
    id: "ASM-AUT-009",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-009",
    title: "Assessment: Playwright Locators, Codegen & UI Mode",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-009-01",
        text: "Which locator method in Playwright is recommended as the top user-first priority according to testing best practices?",
        options: [
          "page.getByRole('button', { name: 'Submit' })",
          "page.locator('xpath=//div[2]/button')",
          "page.locator('.css-btn-primary')",
          "page.locator('#btn-104')"
        ],
        correctAnswer: 0,
        explanation: "'getByRole' reflects accessibility guidelines and tests the application the way assistive tech and users perceive it."
      },
      {
        id: "Q-AUT-009-02",
        text: "How do you filter a collection of locators in Playwright to find a card that contains the specific text 'Enterprise Plan'?",
        options: [
          "page.locator('.plan-card').filter({ hasText: 'Enterprise Plan' })",
          "page.locator('.plan-card').contains('Enterprise Plan')",
          "page.findText('.plan-card', 'Enterprise Plan')",
          "page.filter('.plan-card', 'Enterprise Plan')"
        ],
        correctAnswer: 0,
        explanation: "'.filter({ hasText: '...' })' filters the locator collection down to matching inner text instances."
      },
      {
        id: "Q-AUT-009-03",
        text: "What command launches Playwright's interactive visual UI Mode for time-travel debugging?",
        options: [
          "npx playwright test --ui",
          "npx playwright start-gui",
          "npx playwright inspect",
          "npx playwright run --visual"
        ],
        correctAnswer: 0,
        explanation: "'npx playwright test --ui' launches the comprehensive interactive desktop test runner and debugger."
      },
      {
        id: "Q-AUT-009-04",
        text: "What CLI utility in Playwright launches a browser and automatically generates test code as you interact with the page?",
        options: [
          "npx playwright codegen <url>",
          "npx playwright record <url>",
          "npx playwright script-maker",
          "npx playwright auto-code"
        ],
        correctAnswer: 0,
        explanation: "'npx playwright codegen' records browser user actions and outputs resilient TypeScript/Python/Java test code."
      },
      {
        id: "Q-AUT-009-05",
        text: "What locator method targets form input elements based on their associated '<label>' text in Playwright?",
        options: ["page.getByLabel('Email')", "page.getByInput('Email')", "page.getFormText('Email')", "page.getLabel('Email')"],
        correctAnswer: 0,
        explanation: "'getByLabel' locates form controls associated with corresponding label elements."
      },
      {
        id: "Q-AUT-009-06",
        text: "What is 'Time-Travel Debugging' in Playwright UI Mode?",
        options: [
          "Hovering over test steps to view complete DOM snapshots before, during, and after each action was executed",
          "Changing the system clock to test leap years",
          "Restoring old git commits automatically",
          "Running tests in reverse order"
        ],
        correctAnswer: 0,
        explanation: "Time-travel debugging allows inspecting exact DOM and visual states at every micro-step of test execution."
      },
      {
        id: "Q-AUT-009-07",
        text: "What locator method in Playwright is used to locate elements by the 'data-testid' attribute?",
        options: ["page.getByTestId('cart-btn')", "page.getTestId('cart-btn')", "page.locator('@cart-btn')", "page.byTest('cart-btn')"],
        correctAnswer: 0,
        explanation: "'getByTestId' queries elements based on the configured test ID attribute (defaults to data-testid)."
      },
      {
        id: "Q-AUT-009-08",
        text: "What does 'expect(locator).toBeVisible()' do in Playwright?",
        options: [
          "It polls the element automatically until it satisfies visibility criteria, retrying until timeout",
          "It takes a screenshot and prints it to the console",
          "It clicks the element if it is visible",
          "It changes the CSS visibility property to visible"
        ],
        correctAnswer: 0,
        explanation: "Playwright assertions (expect) are web-first and automatically retry until the condition passes or times out."
      },
      {
        id: "Q-AUT-009-09",
        text: "How can you simulate a mobile device (like an iPhone 14) when running Playwright Codegen?",
        options: [
          "npx playwright codegen --device=\"iPhone 14\" <url>",
          "npx playwright codegen --mobile=true",
          "npx playwright codegen --phone",
          "Codegen cannot simulate mobile devices"
        ],
        correctAnswer: 0,
        explanation: "The '--device' flag applies device descriptors including screen resolution, user-agent, and touch capabilities."
      },
      {
        id: "Q-AUT-009-10",
        text: "What is the difference between 'page.locator()' and 'page.getByRole()'?",
        options: [
          "'locator()' accepts generic CSS or XPath selectors; 'getByRole()' queries semantic accessibility roles and names",
          "'locator()' only works on Google Chrome",
          "'getByRole()' cannot click elements",
          "They are identical under the hood"
        ],
        correctAnswer: 0,
        explanation: "getByRole is a high-level accessibility selector, whereas locator() handles CSS/XPath strings."
      }
    ]
  },
  {
    id: "ASM-AUT-010",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-010",
    title: "Assessment: Network Interception & API Mocking",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-010-01",
        text: "What Playwright API method intercepts browser network requests to fulfill mock responses or modify headers?",
        options: ["page.route()", "page.intercept()", "page.mock()", "page.network()"],
        correctAnswer: 0,
        explanation: "'page.route(urlPattern, handler)' intercepts matching HTTP requests in flight."
      },
      {
        id: "Q-AUT-010-02",
        text: "How do you fulfill an intercepted request with mock JSON data and an HTTP 200 status code?",
        options: [
          "route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })",
          "route.send(200, data)",
          "route.respond(data)",
          "route.mock(200, data)"
        ],
        correctAnswer: 0,
        explanation: "'route.fulfill()' provides the custom status, headers, and body returned directly to the browser."
      },
      {
        id: "Q-AUT-010-03",
        text: "Why is mocking third-party tracking scripts (such as Google Analytics or Segment) beneficial in UI automation?",
        options: [
          "It eliminates external network traffic delays, prevents tracking pollutions, and accelerates test suites by 30-50%",
          "It makes the tests run on mobile phones",
          "It fixes CSS bugs",
          "It is required by law"
        ],
        correctAnswer: 0,
        explanation: "Aborting third-party analytics stops unnecessary HTTP calls, reduces flakiness, and improves test performance."
      },
      {
        id: "Q-AUT-010-04",
        text: "How do you simulate a complete network connection drop or aborted request in Playwright?",
        options: ["route.abort()", "route.cancel()", "route.drop()", "route.fail()"],
        correctAnswer: 0,
        explanation: "'route.abort()' simulates network-level connection failures (e.g. failed DNS, connection reset)."
      },
      {
        id: "Q-AUT-010-05",
        text: "What is the advantage of using 'page.routeFromHAR()' in Playwright?",
        options: [
          "It records real network traffic during a baseline run and replays it deterministically in CI without hitting live servers",
          "It translates test scripts into HTML",
          "It converts the test into a video",
          "It deletes failed assertions"
        ],
        correctAnswer: 0,
        explanation: "routeFromHAR replays network responses from an archive file, ensuring deterministic offline test runs."
      },
      {
        id: "Q-AUT-010-06",
        text: "If you want an intercepted request to continue to the real backend server unmodified, what method is called?",
        options: ["route.continue()", "route.pass()", "route.next()", "route.forward()"],
        correctAnswer: 0,
        explanation: "'route.continue()' forwards the request to the upstream destination."
      },
      {
        id: "Q-AUT-010-07",
        text: "How can you test how your application displays when a backend microservice returns an HTTP 500 Internal Server Error?",
        options: [
          "Use page.route() to intercept the endpoint and call route.fulfill({ status: 500, body: 'Server Error' })",
          "Unplug the staging server's power cable",
          "Delete the backend database",
          "Wait until production breaks"
        ],
        correctAnswer: 0,
        explanation: "Mocking via route.fulfill allows deterministic testing of error boundaries and failure notifications."
      },
      {
        id: "Q-AUT-010-08",
        text: "What wildcard pattern matches any URL containing '/api/v1/orders' in page.route?",
        options: ["'**/api/v1/orders*'", "'api/orders'", "'regex/orders'", "'%orders%'"],
        correctAnswer: 0,
        explanation: "Glob patterns starting with '**/' match any origin and path prefix."
      },
      {
        id: "Q-AUT-010-09",
        text: "How can you simulate a slow 3G cellular connection for a specific API endpoint?",
        options: [
          "Insert a delay before calling route.continue() inside the page.route handler",
          "Change the monitor brightness",
          "Reduce the computer's CPU speed",
          "Playwright cannot simulate latency"
        ],
        correctAnswer: 0,
        explanation: "Adding a programmatic sleep or delay before route.continue() introduces artificial latency to test loading UI."
      },
      {
        id: "Q-AUT-010-10",
        text: "Can page.route() modify headers (e.g. adding an Authorization token) before forwarding to the real server?",
        options: [
          "Yes, route.continue({ headers: { ...route.request().headers(), 'X-Custom-Header': 'value' } })",
          "No, headers are read-only in HTTP",
          "Only in Firefox",
          "Only when using Selenium"
        ],
        correctAnswer: 0,
        explanation: "route.continue() accepts custom header overrides that are applied before the request is transmitted."
      }
    ]
  },
  {
    id: "ASM-AUT-011",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-011",
    title: "Assessment: Playwright Tracing & Visual Debugging",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-011-01",
        text: "What configuration value in 'playwright.config.ts' records traces ONLY for tests that fail, saving disk space on passing runs?",
        options: ["trace: 'retain-on-failure'", "trace: 'always'", "trace: 'on-error-only'", "trace: 'smart'"],
        correctAnswer: 0,
        explanation: "'retain-on-failure' collects traces during execution but discards them if the test passes, preserving storage."
      },
      {
        id: "Q-AUT-011-02",
        text: "What web tool allows viewing Playwright trace zip files directly in any web browser without local CLI tools?",
        options: ["https://trace.playwright.dev", "https://github.com", "https://saucelabs.com", "https://google.com"],
        correctAnswer: 0,
        explanation: "trace.playwright.dev is a client-side PWA that renders Playwright trace files securely in browser memory."
      },
      {
        id: "Q-AUT-011-03",
        text: "What does the red dot represent on the DOM snapshot in the Playwright Trace Viewer?",
        options: [
          "The exact coordinate point where the mouse click or action event occurred",
          "A JavaScript syntax error",
          "A broken link",
          "An inaccessible image"
        ],
        correctAnswer: 0,
        explanation: "The red dot visualizes the hit-tested click target coordinate on the element snapshot."
      },
      {
        id: "Q-AUT-011-04",
        text: "What critical debugging information does the 'Network' tab inside Trace Viewer provide?",
        options: [
          "All HTTP requests, response codes, headers, payloads, and round-trip timings captured during the test",
          "The user's Wi-Fi router password",
          "The list of other computers on the office network",
          "The server's internal memory usage"
        ],
        correctAnswer: 0,
        explanation: "Trace Viewer records a complete network timeline containing all requests, status codes, and payloads."
      },
      {
        id: "Q-AUT-011-05",
        text: "How do you open a local trace file using the Playwright CLI?",
        options: [
          "npx playwright show-trace path/to/trace.zip",
          "npx playwright open trace.zip",
          "npx playwright view-trace",
          "playwright trace open"
        ],
        correctAnswer: 0,
        explanation: "'npx playwright show-trace <path>' starts the local trace viewer server."
      },
      {
        id: "Q-AUT-011-06",
        text: "What is an 'Action Snapshot' in Playwright Tracing?",
        options: [
          "Interactive DOM representations captured before the action was triggered, at the hit-test point, and after completion",
          "A static JPEG image",
          "A screenshot of the developer's desktop",
          "A git commit diff"
        ],
        correctAnswer: 0,
        explanation: "Action snapshots preserve the live DOM structure before and after actions, enabling DOM inspection."
      },
      {
        id: "Q-AUT-011-07",
        text: "How does Playwright Tracing compare to standard video recordings for debugging?",
        options: [
          "Traces allow inspecting the actual DOM elements, styles, console messages, and network payloads, which videos cannot do",
          "Videos are interactive while traces are static",
          "Traces can only record 3 seconds",
          "There is no difference between them"
        ],
        correctAnswer: 0,
        explanation: "Traces provide interactive DOM inspection and network telemetry, whereas video is merely a pixel recording."
      },
      {
        id: "Q-AUT-011-08",
        text: "What does the 'Source' tab in Trace Viewer highlight?",
        options: [
          "The exact line of test code being executed during that step, with error highlights if it failed",
          "The open-source license",
          "The browser's C++ source code",
          "The operating system kernel"
        ],
        correctAnswer: 0,
        explanation: "The Source view correlates execution steps directly to the corresponding lines in the test spec."
      },
      {
        id: "Q-AUT-011-09",
        text: "How can CI/CD pipelines (like GitHub Actions) share Playwright failure traces with engineering teams?",
        options: [
          "By uploading the 'test-results/' directory as a workflow artifact attached to the build summary",
          "By printing the binary zip to standard console output",
          "By emailing floppy disks",
          "By deleting the repository"
        ],
        correctAnswer: 0,
        explanation: "CI workflows upload 'test-results/' as zip artifacts, allowing developers to download and inspect traces."
      },
      {
        id: "Q-AUT-011-10",
        text: "Can Playwright record browser console warnings and uncaught exceptions in the trace artifact?",
        options: [
          "Yes, all console logs, warnings, and unhandled errors are recorded in the Console panel",
          "No, console logs are private and blocked by browsers",
          "Only in Chromium",
          "Only if tests pass"
        ],
        correctAnswer: 0,
        explanation: "Playwright captures all stdout, stderr, and browser console messages directly inside the trace."
      }
    ]
  },
  {
    id: "ASM-AUT-012",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-012",
    title: "Assessment: Cypress Architecture & Limitations",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-012-01",
        text: "What architectural feature differentiates Cypress from Selenium and Playwright?",
        options: [
          "Cypress executes directly inside the browser runloop in the same process as the application under test",
          "Cypress does not support JavaScript",
          "Cypress only runs on mobile devices",
          "Cypress requires a database server"
        ],
        correctAnswer: 0,
        explanation: "Cypress runs in the browser alongside the application code, giving it direct synchronous access to DOM and window objects."
      },
      {
        id: "Q-AUT-012-02",
        text: "What command in Cypress is used to intercept and spy on or stub network HTTP requests?",
        options: ["cy.intercept()", "cy.route()", "cy.mock()", "cy.network()"],
        correctAnswer: 0,
        explanation: "'cy.intercept()' is Cypress's modern network stubbing and spying method."
      },
      {
        id: "Q-AUT-012-03",
        text: "What is an inherent architectural limitation of Cypress due to running inside the browser sandbox?",
        options: [
          "No native support for controlling multiple browser tabs or popup windows simultaneously",
          "Inability to click buttons",
          "Inability to run on Windows",
          "Inability to test CSS styles"
        ],
        correctAnswer: 0,
        explanation: "Running inside a single browser tab prevents Cypress from natively driving multiple tabs or independent popup windows."
      },
      {
        id: "Q-AUT-012-04",
        text: "How do Cypress commands execute under the hood?",
        options: [
          "They are enqueued into an asynchronous queue and executed sequentially by the Cypress runner",
          "They execute synchronously in a single JavaScript thread",
          "They run in parallel across 10 threads",
          "They are compiled into C++ binary code"
        ],
        correctAnswer: 0,
        explanation: "Cypress commands do not return promises immediately; they enqueue tasks executed deterministically by the runner."
      },
      {
        id: "Q-AUT-012-05",
        text: "What programming languages does Cypress natively support for authoring test scripts?",
        options: [
          "JavaScript and TypeScript only",
          "Java, Python, C#, and Ruby",
          "C++ and Rust",
          "PHP and Perl"
        ],
        correctAnswer: 0,
        explanation: "Cypress runs in Node.js and the browser, supporting JavaScript and TypeScript exclusively."
      },
      {
        id: "Q-AUT-012-06",
        text: "In Cypress, how do you alias an intercepted request to wait for its completion later?",
        options: [
          "cy.intercept('GET', '/api/users').as('getUsers'); and cy.wait('@getUsers');",
          "cy.intercept('GET', '/api/users').name('getUsers');",
          "cy.alias('/api/users');",
          "cy.hold('@getUsers');"
        ],
        correctAnswer: 0,
        explanation: "'.as('alias')' assigns an alias, and 'cy.wait('@alias')' suspends execution until the response arrives."
      },
      {
        id: "Q-AUT-012-07",
        text: "What is the recommended Cypress selector format for resilient component testing?",
        options: ["cy.get('[data-cy=\"submit-btn\"]')", "cy.get('//button')", "cy.get('.btn-primary')", "cy.get('div > button')"],
        correctAnswer: 0,
        explanation: "Cypress best practices strongly recommend 'data-cy' or 'data-testid' attributes for locator stability."
      },
      {
        id: "Q-AUT-012-08",
        text: "What happens when a Cypress assertion like '.should('be.visible')' fails initially?",
        options: [
          "Cypress automatically retries the preceding command and assertion up to the defaultCommandTimeout (4s)",
          "The test crashes immediately without retrying",
          "The computer beeps loudly",
          "The test passes anyway"
        ],
        correctAnswer: 0,
        explanation: "Cypress features built-in retry-ability on chained assertions until the condition passes or timeout occurs."
      },
      {
        id: "Q-AUT-012-09",
        text: "What command in Cypress allows testing cross-origin domains (e.g. third-party OAuth providers)?",
        options: ["cy.origin()", "cy.domain()", "cy.switch()", "cy.cross()"],
        correctAnswer: 0,
        explanation: "'cy.origin()' allows running commands against a secondary origin within the same test spec."
      },
      {
        id: "Q-AUT-012-10",
        text: "How does Cypress handle page reloads or full-page navigations compared to Playwright?",
        options: [
          "Because Cypress runs in the same browser context, navigations cause the test runner to re-inject itself into the new page, which can add latency",
          "Cypress does not support navigating to URLs",
          "Cypress runs 10x faster on reloads",
          "Cypress crashes whenever a link is clicked"
        ],
        correctAnswer: 0,
        explanation: "In-browser execution requires Cypress to reinject its test runner scripts across full document unmounts."
      }
    ]
  },
  {
    id: "ASM-AUT-013",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-013",
    title: "Assessment: Component Testing vs. E2E",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-013-01",
        text: "What is the primary architectural difference between Component Testing and End-to-End Testing?",
        options: [
          "Component testing mounts an isolated UI component in a real browser without running backend services; E2E tests the complete integrated system",
          "Component testing does not run in a browser",
          "Component testing only tests database queries",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Component testing isolates individual UI components in a real browser engine, eliminating backend dependencies."
      },
      {
        id: "Q-AUT-013-02",
        text: "Why is Component Testing in a real browser (via Playwright CT or Cypress CT) superior to JSDOM-based testing (Jest + React Testing Library)?",
        options: [
          "Real browsers have true layout engines that accurately compute CSS styles, bounding boxes, element occlusion, and click interception",
          "Real browsers cannot run JavaScript",
          "JSDOM is 100x slower than real browsers",
          "JSDOM requires a paid license"
        ],
        correctAnswer: 0,
        explanation: "JSDOM does not render layout or styles; only real browser engines compute true visibility and hit-testing."
      },
      {
        id: "Q-AUT-013-03",
        text: "In Playwright Component Testing for React, what method renders the component into the browser document?",
        options: ["mount(<Component />)", "render(<Component />)", "display(<Component />)", "load(<Component />)"],
        correctAnswer: 0,
        explanation: "The 'mount()' fixture in Playwright CT renders the component into the browser DOM."
      },
      {
        id: "Q-AUT-013-04",
        text: "What tool does Playwright CT use under the hood to bundle and serve frontend components rapidly?",
        options: ["Vite", "Webpack 1", "Apache Ant", "Make"],
        correctAnswer: 0,
        explanation: "Playwright CT uses Vite to compile, bundle, and hot-reload components for browser execution."
      },
      {
        id: "Q-AUT-013-05",
        text: "How do you test that a component correctly triggers an event callback prop (e.g. onSelect) in Component Testing?",
        options: [
          "Pass a mock tracking variable or spy into the prop, interact with the component, and assert the spy was invoked",
          "Check the computer monitor with a magnifying glass",
          "Print the HTML to a PDF",
          "Event callbacks cannot be tested"
        ],
        correctAnswer: 0,
        explanation: "Passing spies or callbacks allows asserting that user interactions trigger expected component callbacks."
      },
      {
        id: "Q-AUT-013-06",
        text: "What type of testing is ideal for validating an organization's reusable Design System (e.g. Buttons, Modals, Sliders)?",
        options: ["Component Testing", "End-to-End Testing", "Database Testing", "Penetration Testing"],
        correctAnswer: 0,
        explanation: "Design systems consist of isolated UI primitives with diverse props and states, making Component Testing the perfect fit."
      },
      {
        id: "Q-AUT-013-07",
        text: "Can Component Tests assert computed CSS properties (such as 'background-color' or 'border-radius')?",
        options: [
          "Yes, because they run in a real browser engine with full CSS style calculation: await expect(component).toHaveCSS('color', 'rgb(...)')",
          "No, CSS cannot be tested in software",
          "Only in Internet Explorer",
          "Only if the CSS is written inline"
        ],
        correctAnswer: 0,
        explanation: "Real browser execution enables assertions on true computed CSS styles via '.toHaveCSS()'."
      },
      {
        id: "Q-AUT-013-08",
        text: "How does the execution speed of Component Tests compare to full E2E journeys?",
        options: [
          "Component tests are significantly faster (10x-50x) because they avoid backend startup, network routing, and multi-page navigation",
          "Component tests are 100x slower",
          "They take the exact same time",
          "Component tests require 24 hours to run"
        ],
        correctAnswer: 0,
        explanation: "Mounting components in isolation bypasses backend network latency, making execution ultra-fast."
      },
      {
        id: "Q-AUT-013-09",
        text: "What accessibility checks can be performed directly on a mounted modal component?",
        options: [
          "Verifying that focus is trapped within the modal and pressing the Escape key closes it",
          "Checking the screen reader's battery level",
          "Verifying the user's internet speed",
          "Modals cannot be tested for accessibility"
        ],
        correctAnswer: 0,
        explanation: "Focus trapping, keyboard navigation, and ARIA attributes can be verified directly on mounted modal components."
      },
      {
        id: "Q-AUT-013-10",
        text: "When should an SDET write an E2E test rather than a Component Test?",
        options: [
          "When verifying end-to-end integration across frontend, backend microservices, real database updates, and third-party integrations",
          "When testing button hover colors",
          "When verifying date formatting on an isolated calendar widget",
          "When testing form validation error messages"
        ],
        correctAnswer: 0,
        explanation: "E2E tests validate complete multi-system integration; isolated UI behavior belongs in Component Tests."
      }
    ]
  }
];

export const phase2 = {
  chapters: phase2Chapters,
  assessments: phase2Assessments
};

