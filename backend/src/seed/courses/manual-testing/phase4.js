export const phase4Chapters = [
  {
    id: "CH-MNT-019",
    courseId: "CRS-MNT-001",
    title: "Web Application Architecture & Browser DevTools for QA",
    order: 19,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# Web Application Architecture & Browser DevTools for QA

### Learning Objectives
1. Understand the 3-tier web architecture (Client, Application Server, Database) and where bugs originate.
2. Master HTTP status codes (2xx, 3xx, 4xx, 5xx), request/response headers, and payloads.
3. Leverage Browser DevTools: Elements DOM inspection, Console error debugging, Network throttling, and Application storage.
4. Distinguish client-side rendering (CSR), server-side rendering (SSR), and hydration issues.

---

### 1. Web Architecture from a QA Perspective

When an application fails, an expert tester isolates whether the bug is on the **Client (UI/Browser)**, the **API Gateway / Backend Service**, or the **Database / 3rd-party Integration**.

\`\`\`
   +-------------+       HTTPS / JSON       +------------------+
   |   BROWSER   | <=====================> |  API GATEWAY /   |
   | (Frontend)  |                         | BACKEND SERVICES |
   +------+------+                         +--------+---------+
          |                                         |
          | Inspect DOM, Console, Network           | SQL / NoSQL
          v                                         v
   +-------------+                         +------------------+
   |   DEVTOOLS  |                         |  DATABASE LAYER  |
   +-------------+                         +------------------+
\`\`\`

---

### 2. HTTP Status Code Taxonomy for Testers

Every network request produces an HTTP status code that communicates outcome:

| Range | Category | Key Codes QA Must Know |
| :--- | :--- | :--- |
| **2xx** | Success | **200 OK**: Request succeeded.<br>**201 Created**: Resource created (e.g. POST register user).<br>**204 No Content**: Action succeeded, no body returned (e.g. DELETE). |
| **3xx** | Redirection | **301 Moved Permanently**: Permanent URL redirect.<br>**304 Not Modified**: Cached copy is still valid. |
| **4xx** | Client Error | **400 Bad Request**: Malformed payload or validation error.<br>**401 Unauthorized**: Missing or expired auth token.<br>**403 Forbidden**: Authenticated, but lacks role permission.<br>**404 Not Found**: Resource URL does not exist.<br>**429 Too Many Requests**: Rate limit exceeded. |
| **5xx** | Server Error | **500 Internal Server Error**: Unhandled backend code exception.<br>**502 Bad Gateway**: Reverse proxy failed to reach upstream server.<br>**503 Service Unavailable**: Server overloaded or in maintenance.<br>**504 Gateway Timeout**: Upstream database or microservice timed out. |

---

### 3. Essential Chrome DevTools Panes for QA

1. **Elements Panel**:
   - Inspect DOM elements, computed CSS box models, and pseudo-states (\`:hover\`, \`:focus\`).
   - Live edit HTML tags and text to test truncation and text overflow without redeployment.
2. **Console Panel**:
   - View unhandled JavaScript exceptions, network fetch errors, and debug logs.
   - Execute JavaScript snippets live in page context to inspect window objects or session state.
3. **Network Panel**:
   - Filter by \`Fetch/XHR\` to monitor REST API requests.
   - Inspect Request Headers (Authorization Bearer, Content-Type) and Response Payloads.
   - Simulate slow networks using throttling profiles (Fast 3G, Slow 3G, Offline).
4. **Application Panel**:
   - Inspect and clear Cookies, \`localStorage\`, \`sessionStorage\`, and IndexedDB.
   - Verify cookie security flags: \`HttpOnly\`, \`Secure\`, and \`SameSite=Strict/Lax\`.

---

### 4. Hands-on Lab: DevTools Diagnostic Triage
1. Open DevTools on a simulated web application displaying a blank screen.
2. Check Console for uncaught JavaScript TypeError.
3. Inspect Network tab to see if \`/api/user/profile\` failed with HTTP 401 or HTTP 500.
4. Clear \`localStorage\` auth tokens to simulate fresh anonymous session and observe redirect.`
  },
  {
    id: "CH-MNT-020",
    courseId: "CRS-MNT-001",
    title: "Manual API Testing with Postman: REST, Headers & Auth",
    order: 20,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Manual API Testing with Postman: REST, Headers & Auth

### Learning Objectives
1. Understand RESTful architecture, HTTP verbs (GET, POST, PUT, PATCH, DELETE), and URI structures.
2. Construct parameterized API requests in Postman with Query Params, Path Variables, and JSON Bodies.
3. Test authentication schemes: API Keys, Basic Auth, and OAuth 2.0 / Bearer Tokens.
4. Perform boundary, negative, and edge-case testing on API payloads.
5. Write lightweight JavaScript test assertions in Postman's "Scripts" tab.

---

### 1. The Anatomy of an API Request

An API allows independent software systems to communicate over HTTP without a graphical interface.

\`\`\`
   POST /api/v2/orders/checkout?currency=USD HTTP/1.1
   Host: api.enterprise.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
   Content-Type: application/json
   Accept: application/json

   {
     "cartId": "crt_98721",
     "items": [
       { "sku": "SKU-402", "quantity": 2, "price": 29.99 }
     ],
     "shippingAddress": {
       "street": "123 Tech Way",
       "city": "Austin",
       "zip": "78701"
     }
   }
\`\`\`

---

### 2. HTTP Methods & Idempotency Matrix

Understanding HTTP verb semantics is essential for API verification:

| Method | Purpose | Idempotent? | Safe? | Typical Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | Retrieve resource representation | Yes | Yes | 200 OK, 404 Not Found |
| **POST** | Create a new resource or execute processing | No | No | 201 Created, 400 Bad Request |
| **PUT** | Replace a resource completely | Yes | No | 200 OK, 204 No Content |
| **PATCH** | Partially update specific fields of a resource | No (can be) | No | 200 OK, 400 Bad Request |
| **DELETE**| Remove an existing resource | Yes | No | 200 OK, 204 No Content, 404 |

*Note*: An operation is **idempotent** if making multiple identical requests has the same outcome as a single request.

---

### 3. API Test Design Categories

When testing an API endpoint manually, execute test cases across four dimensions:

1. **Happy Path Testing**:
   - Send valid request with mandatory and optional parameters.
   - Verify HTTP 200/201, expected response schema, data types, and status fields.
2. **Negative & Input Validation Testing**:
   - Send missing required fields (e.g. omitted \`cartId\`) -> Verify HTTP 400 with descriptive error message.
   - Send invalid data types (e.g. string in \`quantity\`) -> Verify HTTP 422 / 400.
   - Send SQL injection strings or XSS scripts in text fields.
3. **Authentication & Authorization Testing**:
   - Send request without Authorization header -> Verify HTTP 401 Unauthorized.
   - Send request with valid token of a user who does not own the resource -> Verify HTTP 403 Forbidden (BOLA / IDOR check).
4. **Rate Limiting & Boundary Testing**:
   - Send rapid repeated calls to verify HTTP 429 Too Many Requests.
   - Test extreme boundary values (e.g. quantity: -1, 0, 99999999).

---

### 4. Hands-on Lab: Postman Test Suite
1. Create a Postman Collection for an Order Management API.
2. Set up Collection Variables for \`{{base_url}}\` and \`{{auth_token}}\`.
3. Add a test script verifying:
\`\`\`javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
pm.test("Verify order status", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("COMPLETED");
});
\`\`\`
4. Run the collection runner to verify all requests sequentially.`
  },
  {
    id: "CH-MNT-021",
    courseId: "CRS-MNT-001",
    title: "Database Testing with SQL: Data Integrity, Constraints & CRUD",
    order: 21,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=7S_tz1z_5bA",
    content: `# Database Testing with SQL: Data Integrity, Constraints & CRUD

### Learning Objectives
1. Verify database integrity following UI and API transactions using structured SQL queries.
2. Validate relational constraints: Primary Keys, Foreign Keys, Unique constraints, and Nullability.
3. Test CRUD (Create, Read, Update, Delete) operations and verify rollback on failed transactions (ACID).
4. Detect data corruption, orphan records, and boundary truncation issues in relational tables.

---

### 1. Why UI Testing Alone Is Insufficient

A web application might display a success toast ("Order #1042 Created!"), but underneath:
- The payment transaction record may not have committed.
- Stock inventory may not have decremented.
- Foreign keys may be null, creating orphaned records.
- User passwords might be stored in plaintext rather than bcrypt hashes.

QA testers must inspect the persistent database state directly via SQL clients (DBeaver, pgAdmin, MySQL Workbench).

---

### 2. Core SQL Queries for Test Verification

\`\`\`sql
-- 1. Verify User Registration & Password Hashing
SELECT id, email, password_hash, created_at, status
FROM users
WHERE email = 'testuser_qa@domain.com';

-- 2. Validate Order Totals and Foreign Key Relationships
SELECT 
    o.id AS order_id,
    o.user_id,
    o.total_amount,
    o.status AS order_status,
    i.product_id,
    i.quantity,
    i.unit_price
FROM orders o
JOIN order_items i ON o.id = i.order_id
WHERE o.id = 'ORD-2026-981';

-- 3. Detect Orphan Records (Foreign Key integrity failure)
SELECT i.*
FROM order_items i
LEFT JOIN orders o ON i.order_id = o.id
WHERE o.id IS NULL; -- Should return 0 rows
\`\`\`

---

### 3. Testing ACID Properties in Database Workflows

| ACID Property | Meaning for QA | Testing Scenario |
| :--- | :--- | :--- |
| **Atomicity** | All operations in a transaction succeed, or all are rolled back. | Initiate checkout where payment succeeds but inventory fails. Verify entire order is rolled back; balance not deducted. |
| **Consistency** | Database moves from one valid state to another, preserving constraints. | Attempt inserting duplicate email into unique column. Verify rejection and schema consistency. |
| **Isolation** | Concurrent transactions execute without cross-interference. | Two users attempt to purchase the single remaining item in stock simultaneously. Exactly one succeeds; other receives out-of-stock. |
| **Durability** | Committed transactions survive system crashes or power failures. | Verify committed records persist after database server restart. |

---

### 4. Hands-on Lab: Database Verification Audit
1. Perform a refund on the web portal.
2. Query the \`refunds\` table to verify that \`refund_amount\` exactly matches the order total.
3. Query the \`accounts\` table to ensure the customer balance reflects the credited funds.
4. Verify audit trail log timestamp matches UTC standard.`
  },
  {
    id: "CH-MNT-022",
    courseId: "CRS-MNT-001",
    title: "Mobile App Testing: iOS, Android, ADB & Real Device Testing",
    order: 22,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Mobile App Testing: iOS, Android, ADB & Real Device Testing

### Learning Objectives
1. Understand mobile architectures: Native (Swift/Kotlin), Cross-platform (Flutter/React Native), and Mobile Web / PWA.
2. Install and manage mobile builds via Apple TestFlight, Firebase App Distribution, and Android APK/AAB sideloading.
3. Master Android Debug Bridge (ADB) for log extraction, screen capture, and crash dump analysis.
4. Test mobile-specific disruptions: incoming phone calls, low battery, OS permission changes, and offline network transitions.

---

### 1. Mobile App Architectures: Testing Considerations

| Architecture | Tech Stack | QA Testing Nuances |
| :--- | :--- | :--- |
| **Native iOS / Android** | Swift / Kotlin | Fastest performance; deep access to hardware sensors (LiDAR, NFC, FaceID). Requires platform-specific test suites. |
| **Cross-Platform** | Flutter, React Native | Shared codebase; UI rendered via canvas or native bridges. Watch for subtle UI animation drops and bridge serialization delays. |
| **Progressive Web App (PWA)** | HTML5 / Service Workers | Runs in browser engine sandbox; limited background task execution and restricted sensor access. |

---

### 2. Android Debug Bridge (ADB) Mastery for QA

ADB is a command-line tool that lets testers communicate directly with connected Android devices or emulators.

\`\`\`bash
# 1. Verify connected physical devices
adb devices

# 2. Install APK build directly to test phone
adb install -r NalandaApp-v2.1-debug.apk

# 3. Stream real-time crash logs filtered by app package
adb logcat -v time | grep "com.nalanda.learning" > crash_trace.txt

# 4. Capture screenshot from device directly to PC
adb exec-out screencap -p > mobile_screen.png

# 5. Clear application cache and app data
adb shell pm clear com.nalanda.learning

# 6. Simulate device incoming battery level drop to 5%
adb shell dumpsys battery set level 5
\`\`\`

---

### 3. Mobile Interruption & Lifecycle Matrix

Mobile applications operate in unstable, highly dynamic physical environments. Testers must subject apps to real-world interruptions:

- **Incoming Calls & SMS**: Receive incoming phone call while completing payment. Verify app state suspends safely and resumes without data loss upon call completion.
- **Network Handover**: Walk between Wi-Fi and 5G cellular coverage. Verify requests retry gracefully without throwing fatal crashes.
- **Biometric Authentication**: Test FaceID / TouchID success, failure, lock-out after 5 failed attempts, and fallback to PIN code.
- **Orientation Changes**: Rotate device between Portrait and Landscape during video playback and form entry. Verify keyboard does not obscure inputs.
- **App Backgrounding**: Switch app to background for 15 minutes. Verify session does not crash when returning and tokens refresh silently.

---

### 4. Hands-on Lab: Mobile Bug Hunting
1. Connect an Android phone via USB with USB Debugging enabled.
2. Launch \`adb logcat\` terminal stream.
3. Trigger a known crash inside the test app.
4. Extract the \`NullPointerException\` stack trace and attach it to a Jira mobile bug ticket.`
  },
  {
    id: "CH-MNT-023",
    courseId: "CRS-MNT-001",
    title: "Security & Penetration Testing Fundamentals for QA: OWASP Top 10",
    order: 23,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=2_lqwGgU8eU",
    content: `# Security & Penetration Testing Fundamentals for QA: OWASP Top 10

### Learning Objectives
1. Understand the QA engineer's role in the DevSecOps lifecycle and security shift-left.
2. Manually test for OWASP Top 10 vulnerabilities: Broken Access Control, Injection, and Insecure Design.
3. Identify Broken Object Level Authorization (BOLA / IDOR) vulnerabilities in API endpoints.
4. Execute Cross-Site Scripting (XSS) and SQL Injection (SQLi) manual input boundary validation.
5. Inspect session token management, storage security, and SSL/TLS headers.

---

### 1. The QA Role in Application Security

Security testing is no longer reserved exclusively for external penetration testing firms before annual audits. Functional QA engineers are ideally positioned to catch authorization and input validation vulnerabilities during everyday feature testing.

\`\`\`
   +-------------------------------------------------------------+
   |                  OWASP TOP 10 HIGHLIGHTS                    |
   +-------------------------------------------------------------+
   | A01:2021 - Broken Access Control (Horizontal & Vertical IDOR)|
   | A02:2021 - Cryptographic Failures (Plaintext passwords, SSL)|
   | A03:2021 - Injection (SQL Injection, Command Injection)     |
   | A04:2021 - Insecure Design (Missing business logic limits)  |
   | A05:2021 - Security Misconfiguration (Default passwords)     |
   | A07:2021 - Identification & Authentication Failures         |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Testing for Insecure Direct Object References (IDOR / BOLA)

Broken Object Level Authorization (BOLA) is the #1 most common API vulnerability in modern web apps.

#### Scenario:
1. User A logs in (User ID = \`1001\`).
2. User A views their invoice: \`GET /api/v1/invoices/9540\`.
3. QA modifies the request parameter to an invoice belonging to User B: \`GET /api/v1/invoices/9541\`.
4. **Vulnerable System**: Returns User B's private invoice data with HTTP 200 (Severe Vulnerability!).
5. **Secure System**: Verifies ownership; returns **HTTP 403 Forbidden** or **HTTP 404 Not Found**.

---

### 3. Manual Input Boundary Validation: XSS & SQLi

#### A. Stored & Reflected Cross-Site Scripting (XSS)
- **Attack Vector**: Injecting malicious JavaScript into input fields that render on other users' browsers.
- **Test Strings**:
  - \`<script>alert(document.cookie)</script>\`
  - \`<img src=x onerror=alert('XSS')>\`
- **Expected Defense**: The application must sanitize or HTML-entity-encode the input: \`&lt;script&gt;...\`. The alert popup must **NEVER** fire.

#### B. SQL Injection (SQLi)
- **Attack Vector**: Injecting SQL control characters into search boxes or login forms to manipulate backend queries.
- **Test Strings**:
  - \`' OR '1'='1\`
  - \`admin' --\`
- **Expected Defense**: Backend must use parameterized queries (PreparedStatement). Input strings must be treated strictly as literal data, never executed as SQL syntax.

---

### 4. Hands-on Lab: Manual Security Assessment
1. Inspect cookies in DevTools Application tab. Verify \`HttpOnly\` (prevents JS access) and \`Secure\` (HTTPS only) flags are present on session cookies.
2. Test a user profile endpoint for Horizontal IDOR by altering account IDs in Postman.
3. Test a comment submission box for Stored XSS.`
  },
  {
    id: "CH-MNT-024",
    courseId: "CRS-MNT-001",
    title: "Localization (L10n) & Internationalization (I18n) Testing",
    order: 24,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=l_q7wV146fI",
    content: `# Localization (L10n) & Internationalization (I18n) Testing

### Learning Objectives
1. Distinguish Internationalization (I18n - architectural readiness) from Localization (L10n - cultural adaptation).
2. Test character encodings (UTF-8, Unicode, multi-byte characters like CJK) to eliminate data corruption.
3. Verify Right-to-Left (RTL) language layouts (Arabic, Hebrew, Persian) and directional UI mirroring.
4. Audit locale-specific formats: Dates, Times, Currencies, Decimal separators, and Phone numbers.
5. Identify text expansion issues (e.g. German text expanding up to 300% compared to English).

---

### 1. I18n vs. L10n: The Technical Distinction

\`\`\`
   +-------------------------------------------------------------+
   |                INTERNATIONALIZATION (I18n)                  |
   | Engineering practice of designing code so it can adapt to   |
   | any culture or language WITHOUT code modifications.         |
   | (Resource bundles, Unicode support, dynamic layout sizing)  |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                   LOCALIZATION (L10n)                       |
   | Process of adapting an internationalized product for a       |
   | specific target market, language, and cultural region.      |
   | (Translations, currency symbols, legal compliance terms)    |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Common Localization Defects

#### A. Text Expansion & UI Clipping
When English phrases are translated into languages like German, Russian, or French, word lengths often expand by 30% to 150%:
- English: *"Cancel"* (6 characters)
- German: *"Abbrechen"* (9 characters)
- English: *"Save and Close"*
- German: *"Speichern und schließen"* (24 characters)
- **Defect**: Buttons clip text, text overlaps neighboring inputs, or buttons wrap into illegible multi-line layouts.

#### B. Right-to-Left (RTL) UI Mirroring
In Arabic and Hebrew, text and visual hierarchy flow right-to-left:
- Progress bars must fill from right to left.
- Back buttons point right (indicating backward in time).
- Input labels align to the right edge.
- Punctuation like question marks (\`؟\`) must display correctly.

#### C. Date, Number & Currency Formatting Discrepancies

| Locale | Date Format | Number Format | Currency Symbol Placement |
| :--- | :--- | :--- | :--- |
| **US (\`en-US\`)** | MM/DD/YYYY (10/30/2026) | 1,234,567.89 | \$1,234.56 |
| **Germany (\`de-DE\`)** | DD.MM.YYYY (30.10.2026) | 1.234.567,89 | 1.234,56 € |
| **Japan (\`ja-JP\`)** | YYYY/MM/DD (2026/10/30) | 1,234,567 | ¥1,234 (no decimals) |

---

### 3. Pseudo-Localization: The Secret Weapon of QA

Before real translations arrive from localization agencies, developers and QA test software using **Pseudo-Localization**.

Algorithms automatically transform English strings into expanded, accented variations while keeping UI strings identifiable:
- Original: *"Account Settings"*
- Pseudo-Localized: *"[!!! Àççôûñţ Šéţţîñğš !!!]"*
- **Benefits**:
  1. Easily identifies hard-coded strings that were never extracted into resource bundles (they will remain in plain English).
  2. Simulates 30% text expansion to expose UI layout truncation early.

---

### 4. Hands-on Lab: Localization Verification
1. Switch app locale to German (\`de-DE\`) and inspect all buttons and form modals for text clipping.
2. Switch locale to Arabic (\`ar-SA\`) and verify layout mirroring (RTL).
3. Insert multi-byte Japanese characters (e.g. \`こんにちは\`) into name fields and verify database stores and renders them without producing question marks (\`???\`).`
  }
];

export const phase4Assessments = [
  {
    id: "ASM-MNT-019",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-019",
    title: "Assessment: Web Architecture & Browser DevTools",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-019-01",
        text: "What HTTP response status code is returned when a client attempts to access a protected API without providing an authorization token?",
        options: ["200 OK", "401 Unauthorized", "404 Not Found", "500 Internal Server Error"],
        correctAnswer: 1,
        explanation: "HTTP 401 Unauthorized signifies that the request requires authentication credentials which were either missing or invalid."
      },
      {
        id: "Q-MNT-019-02",
        text: "What does an HTTP 502 Bad Gateway response indicate to a QA engineer?",
        options: [
          "The user entered the wrong password",
          "A server acting as a gateway or proxy received an invalid or failed response from an upstream server",
          "The client's internet connection was disconnected",
          "The page has moved permanently to a new URL"
        ],
        correctAnswer: 1,
        explanation: "502 Bad Gateway indicates that a reverse proxy (like NGINX) could not obtain a valid response from the backend application service."
      },
      {
        id: "Q-MNT-019-03",
        text: "Which Chrome DevTools panel should be inspected first when a user clicks a button and nothing happens on screen?",
        options: ["Sources panel", "Console panel", "Memory panel", "Security panel"],
        correctAnswer: 1,
        explanation: "The Console panel immediately reveals unhandled JavaScript exceptions or runtime errors blocking execution."
      },
      {
        id: "Q-MNT-019-04",
        text: "In Chrome DevTools Network panel, what filter allows a QA engineer to see only REST API and backend network requests?",
        options: ["Doc", "CSS", "Fetch/XHR", "Img"],
        correctAnswer: 2,
        explanation: "The Fetch/XHR filter isolates asynchronous XMLHttpRequest and Fetch API requests from static asset downloads."
      },
      {
        id: "Q-MNT-019-05",
        text: "What does the 'HttpOnly' flag on a browser cookie ensure?",
        options: [
          "The cookie can only be sent over unencrypted HTTP",
          "The cookie cannot be accessed via client-side JavaScript (e.g., document.cookie), mitigating XSS cookie theft",
          "The cookie expires after 5 minutes",
          "The cookie is only accessible on mobile devices"
        ],
        correctAnswer: 1,
        explanation: "HttpOnly prevents malicious client-side JavaScript from reading sensitive session cookies during XSS attacks."
      },
      {
        id: "Q-MNT-019-06",
        text: "What is the primary difference between localStorage and sessionStorage?",
        options: [
          "localStorage data persists indefinitely until cleared, while sessionStorage is cleared when the browser tab is closed",
          "sessionStorage has a 50GB storage limit",
          "localStorage only stores encrypted passwords",
          "sessionStorage is sent to the server with every HTTP header"
        ],
        correctAnswer: 0,
        explanation: "sessionStorage is scoped to the tab lifecycle; localStorage persists across browser sessions and restarts."
      },
      {
        id: "Q-MNT-019-07",
        text: "What HTTP status code is returned when a client submits valid credentials, but their account role lacks permission to perform the requested action?",
        options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "503 Service Unavailable"],
        correctAnswer: 1,
        explanation: "401 means unauthenticated (who are you?); 403 means forbidden (authenticated, but not authorized to perform this action)."
      },
      {
        id: "Q-MNT-019-08",
        text: "How can a QA engineer test how an application behaves in an underground subway or elevator with low connectivity using Chrome DevTools?",
        options: [
          "Unplug the computer's power cable",
          "Configure Network Throttling in DevTools to 'Slow 3G' or 'Offline'",
          "Delete the browser bookmarks",
          "Switch to dark mode"
        ],
        correctAnswer: 1,
        explanation: "The Network panel's throttling preset simulates restricted bandwidth, high latency, and offline network drops."
      },
      {
        id: "Q-MNT-019-09",
        text: "What does an HTTP 429 status code represent?",
        options: ["I'm a teapot", "Too Many Requests (Rate limit exceeded)", "Gateway Timeout", "Conflict"],
        correctAnswer: 1,
        explanation: "HTTP 429 Too Many Requests indicates the user has sent too many requests in a given amount of time (rate limited)."
      },
      {
        id: "Q-MNT-019-10",
        text: "Why should a QA tester inspect Request Headers when debugging an API failure in DevTools?",
        options: [
          "To check if required Authorization Bearer tokens, Content-Type, or API version headers were correctly transmitted",
          "To view the developer's computer model",
          "To verify the monitor's refresh rate",
          "To download free games"
        ],
        correctAnswer: 0,
        explanation: "Headers contain metadata like Content-Type (application/json) and Authorization tokens that govern API behavior."
      }
    ]
  },
  {
    id: "ASM-MNT-020",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-020",
    title: "Assessment: Manual API Testing with Postman",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-020-01",
        text: "What is the fundamental difference between PUT and PATCH in RESTful APIs?",
        options: [
          "PUT replaces the entire resource; PATCH updates only specific fields of the resource",
          "PATCH is safe while PUT is unsafe",
          "PUT is only used for images; PATCH is only used for text",
          "There is no difference between PUT and PATCH"
        ],
        correctAnswer: 0,
        explanation: "PUT is a full replacement of the resource; PATCH is a partial update modifying only the supplied fields."
      },
      {
        id: "Q-MNT-020-02",
        text: "In Postman, where are reusable environment variables like '{{base_url}}' and '{{token}}' typically configured?",
        options: ["Postman Environments or Collection Variables", "In the computer's BIOS", "In the Windows registry", "In the CSS stylesheet"],
        correctAnswer: 0,
        explanation: "Environments and Collection Variables allow parameterized URLs and dynamic session tokens across tests."
      },
      {
        id: "Q-MNT-020-03",
        text: "What does it mean for an HTTP method to be 'Idempotent'?",
        options: [
          "The method executes in under 100 milliseconds",
          "Making multiple identical requests has the same intended effect on the server state as a single request",
          "The method can only be executed by administrators",
          "The method cannot return a JSON body"
        ],
        correctAnswer: 1,
        explanation: "Idempotency means repeating the request multiple times produces the identical server state (e.g. GET, PUT, DELETE)."
      },
      {
        id: "Q-MNT-020-04",
        text: "What HTTP status code is universally expected upon the successful creation of a new resource via a POST request?",
        options: ["200 OK", "201 Created", "204 No Content", "302 Found"],
        correctAnswer: 1,
        explanation: "HTTP 201 Created indicates the request succeeded and led to the creation of a new resource."
      },
      {
        id: "Q-MNT-020-05",
        text: "Which Postman script tab allows a QA engineer to write assertions that validate the response code and JSON schema after a request finishes?",
        options: ["Pre-request Script", "Tests / Scripts tab", "Headers tab", "Settings tab"],
        correctAnswer: 1,
        explanation: "The 'Tests' (or Post-response Scripts) tab executes JavaScript assertions against the received response."
      },
      {
        id: "Q-MNT-020-06",
        text: "How are query parameters distinguished from path variables in a URL such as '/api/users/42?status=active'?",
        options: [
          "'42' is a path variable identifying a resource; '?status=active' is a query parameter filtering results",
          "'status=active' is a path variable; '42' is a query parameter",
          "Both are path variables",
          "Both are header parameters"
        ],
        correctAnswer: 0,
        explanation: "Path variables (\`/users/42\`) identify the specific entity; query parameters (\`?status=active\`) filter, sort, or paginate."
      },
      {
        id: "Q-MNT-020-07",
        text: "What standard authorization header format is used to supply a JSON Web Token (JWT) in API requests?",
        options: [
          "Authorization: Bearer <token_string>",
          "Token: Auth <token_string>",
          "Credentials: Password <token_string>",
          "Session: Key <token_string>"
        ],
        correctAnswer: 0,
        explanation: "The standard header format for JWT authentication is 'Authorization: Bearer <token_string>'."
      },
      {
        id: "Q-MNT-020-08",
        text: "What is the expected HTTP response code when an API client sends a DELETE request for a resource that has already been deleted or does not exist?",
        options: ["404 Not Found (or 204 No Content)", "500 Internal Server Error", "201 Created", "301 Redirect"],
        correctAnswer: 0,
        explanation: "APIs typically return 404 Not Found when attempting to delete a non-existent resource (or 204 if treating idempotently)."
      },
      {
        id: "Q-MNT-020-09",
        text: "When performing negative API testing on a mandatory field like 'email', what should the test verify?",
        options: [
          "The server crashes with HTTP 500",
          "The server rejects the request with HTTP 400 Bad Request (or 422) and returns an informative error message",
          "The server invents a fake email and returns HTTP 200",
          "The server deletes the database"
        ],
        correctAnswer: 1,
        explanation: "Proper input validation returns 400/422 with a structured error explanation rather than crashing or accepting bad data."
      },
      {
        id: "Q-MNT-020-10",
        text: "What tool inside Postman enables executing an entire collection of API requests automatically in sequence?",
        options: ["Collection Runner", "Postman Snipping Tool", "DevTools Inspector", "Proxy Disabler"],
        correctAnswer: 0,
        explanation: "Collection Runner executes multiple requests in sequence, evaluates assertions, and aggregates pass/fail metrics."
      }
    ]
  },
  {
    id: "ASM-MNT-021",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-021",
    title: "Assessment: Database Testing with SQL",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-021-01",
        text: "What SQL statement is used by QA testers to query and verify records without modifying any database state?",
        options: ["INSERT", "UPDATE", "SELECT", "DROP"],
        correctAnswer: 2,
        explanation: "SELECT queries read persistent records for verification without altering or mutating database state."
      },
      {
        id: "Q-MNT-021-02",
        text: "What database constraint ensures that no two records in a table have the identical value in a designated column (e.g., user email)?",
        options: ["FOREIGN KEY", "UNIQUE constraint", "CHECK constraint", "DEFAULT constraint"],
        correctAnswer: 1,
        explanation: "A UNIQUE constraint prevents duplicate entries across specified columns in a table."
      },
      {
        id: "Q-MNT-021-03",
        text: "What is an 'Orphan Record' in a relational database?",
        options: [
          "A record in a child table whose foreign key points to a primary key that no longer exists in the parent table",
          "A database user with no password",
          "A query that runs longer than 10 seconds",
          "A table that contains zero columns"
        ],
        correctAnswer: 0,
        explanation: "Orphan records exist when child rows lose their parent references due to improper cascading deletes or broken constraints."
      },
      {
        id: "Q-MNT-021-04",
        text: "In ACID transaction properties, what does 'Atomicity' guarantee?",
        options: [
          "All operations within a transaction succeed completely, or the entire transaction is rolled back with zero changes applied",
          "The database runs entirely on atomic hardware clocks",
          "Only one user can connect to the database at a time",
          "Data is compressed to the atomic level"
        ],
        correctAnswer: 0,
        explanation: "Atomicity is the 'all-or-nothing' principle: if any step fails, all preceding operations in the transaction are rolled back."
      },
      {
        id: "Q-MNT-021-05",
        text: "When validating user registration through database testing, how should user passwords be verified in the 'users' table?",
        options: [
          "Verify the password is stored as plaintext so QA can read it",
          "Verify the password is encrypted/hashed using a secure algorithm (e.g. bcrypt/argon2) and NEVER stored in plaintext",
          "Verify the password field is left NULL",
          "Verify the password is identical to the user's email address"
        ],
        correctAnswer: 1,
        explanation: "Storing plaintext passwords is a catastrophic security failure; QA must verify that cryptographic hashes are stored."
      },
      {
        id: "Q-MNT-021-06",
        text: "Which SQL clause is used to filter records based on specific test criteria (e.g., finding orders created today)?",
        options: ["GROUP BY", "WHERE", "ORDER BY", "HAVING"],
        correctAnswer: 1,
        explanation: "The WHERE clause filters query results to match designated condition predicates."
      },
      {
        id: "Q-MNT-021-07",
        text: "Why is it important to verify database state directly rather than relying solely on the web user interface?",
        options: [
          "UI components may display simulated success while backend transactions fail, silently drop fields, or corrupt data",
          "Because SQL is faster to type than using a mouse",
          "Because web browsers are illegal for QA to use",
          "Because databases don't store real data"
        ],
        correctAnswer: 0,
        explanation: "UIs can exhibit false positives or mask silent backend transaction failures, making direct SQL validation essential."
      },
      {
        id: "Q-MNT-021-08",
        text: "What SQL command undoes all modifications performed in an uncommitted database transaction?",
        options: ["COMMIT", "ROLLBACK", "TRUNCATE", "SAVEPOINT"],
        correctAnswer: 1,
        explanation: "ROLLBACK reverts all uncommitted changes executed within the active transaction scope."
      },
      {
        id: "Q-MNT-021-09",
        text: "What type of JOIN returns all records from the left table and only matching records from the right table?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        correctAnswer: 1,
        explanation: "LEFT JOIN returns all rows from the left table and matched rows from the right table, with NULLs for unmatched rows."
      },
      {
        id: "Q-MNT-021-10",
        text: "What does the 'NOT NULL' constraint enforce on a table column?",
        options: [
          "The column can only accept negative numbers",
          "The column cannot accept NULL or missing values; data is mandatory",
          "The column must contain at least 100 characters",
          "The column is invisible to users"
        ],
        correctAnswer: 1,
        explanation: "NOT NULL guarantees that a field must contain a valid value and cannot be left blank/null upon insertion."
      }
    ]
  },
  {
    id: "ASM-MNT-022",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-022",
    title: "Assessment: Mobile App Testing",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-022-01",
        text: "What command-line tool is used by QA to interact with connected Android devices, install builds, and pull system logs?",
        options: ["Xcode", "Android Debug Bridge (ADB)", "Postman", "Wireshark"],
        correctAnswer: 1,
        explanation: "ADB (Android Debug Bridge) is the standard CLI utility for managing, debugging, and logging Android devices."
      },
      {
        id: "Q-MNT-022-02",
        text: "What is Apple TestFlight primarily used for in mobile QA?",
        options: [
          "Booking commercial airline flights for QA teams",
          "Distributing prerelease beta iOS builds directly to QA testers and stakeholders over-the-air",
          "Compiling Android Java code",
          "Executing automated SQL queries"
        ],
        correctAnswer: 1,
        explanation: "TestFlight is Apple's official platform for distributing beta iOS/iPadOS applications to internal and external testers."
      },
      {
        id: "Q-MNT-022-03",
        text: "What ADB command streams real-time system and application crash logs from an Android device?",
        options: ["adb logcat", "adb install", "adb reboot", "adb pull-memory"],
        correctAnswer: 0,
        explanation: "'adb logcat' streams device logs in real time, capturing stack traces and unhandled exceptions."
      },
      {
        id: "Q-MNT-022-04",
        text: "What is an Interruption Test in mobile application testing?",
        options: [
          "Interrupting a meeting with developers",
          "Testing how the mobile app behaves when interrupted by incoming calls, SMS alerts, low battery warnings, or push notifications",
          "Turning off the office electricity",
          "Testing only on broken smartphones"
        ],
        correctAnswer: 1,
        explanation: "Interruption testing validates that external OS events (calls, alarms, low battery) do not crash the app or lose user data."
      },
      {
        id: "Q-MNT-022-05",
        text: "How does a Native mobile application differ from a Progressive Web App (PWA)?",
        options: [
          "Native apps are compiled using platform languages (Swift/Kotlin) with full hardware sensor access; PWAs run in browser engines with sandbox limits",
          "PWAs only work on desktop computers",
          "Native apps cannot access the camera or GPS",
          "There is no difference between them"
        ],
        correctAnswer: 0,
        explanation: "Native applications have direct low-level OS/hardware access and performance; PWAs run inside web browser runtimes."
      },
      {
        id: "Q-MNT-022-06",
        text: "What occurs during a mobile 'Network Handover' scenario?",
        options: [
          "A user gives their phone to a friend",
          "The mobile device transitions connectivity between Wi-Fi and Cellular (4G/5G) or drops into offline mode while active",
          "The phone battery discharges completely",
          "The screen changes from portrait to landscape"
        ],
        correctAnswer: 1,
        explanation: "Network handover tests whether ongoing requests, streaming sessions, or transactions resume smoothly when network interfaces switch."
      },
      {
        id: "Q-MNT-022-07",
        text: "What file extension is used for compiled Android installation packages sideloaded onto test devices?",
        options: [".ipa", ".apk", ".exe", ".dmg"],
        correctAnswer: 1,
        explanation: ".apk (Android Package) is the standard format used to distribute and install apps on Android (.ipa is for iOS)."
      },
      {
        id: "Q-MNT-022-08",
        text: "Why must orientation changes (Portrait to Landscape) be rigorously tested on mobile apps?",
        options: [
          "Rotating the device can trigger UI layout clipping, state loss, or input fields being obscured by the soft keyboard",
          "Because screens can physically break when rotated",
          "Because landscape mode deletes user photos",
          "Because operating systems prohibit landscape orientation"
        ],
        correctAnswer: 0,
        explanation: "Orientation changes destroy and recreate Android activities, often causing state loss or UI layout truncation."
      },
      {
        id: "Q-MNT-022-09",
        text: "What command completely wipes all local cache and database data for an Android application via ADB?",
        options: ["adb shell pm clear <package_name>", "adb delete *.*", "adb remove-app", "adb kill-all"],
        correctAnswer: 0,
        explanation: "'adb shell pm clear <package_name>' resets an app to its clean, first-time-install state."
      },
      {
        id: "Q-MNT-022-10",
        text: "What mobile hardware capability should be tested for fallback authentication when biometric verification (FaceID/Fingerprint) fails repeatedly?",
        options: ["Microphone input", "Device PIN / Passcode fallback", "GPS location", "Bluetooth scanning"],
        correctAnswer: 1,
        explanation: "Security standards mandate that failed biometric attempts gracefully fall back to device PIN or password authentication."
      }
    ]
  },
  {
    id: "ASM-MNT-023",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-023",
    title: "Assessment: Security & Penetration Testing Fundamentals",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-023-01",
        text: "What does OWASP stand for in software security?",
        options: [
          "Open Web Application Security Project",
          "Online Worldwide Automated Software Protocol",
          "Official Web Architecture Standards Practice",
          "Open Wireless Application System Protection"
        ],
        correctAnswer: 0,
        explanation: "OWASP stands for the Open Web Application Security Project, a global non-profit focused on software security."
      },
      {
        id: "Q-MNT-023-02",
        text: "What vulnerability occurs when an API allows User A to view or modify User B's private record simply by altering the record ID in the URL parameter?",
        options: [
          "Buffer Overflow",
          "Broken Object Level Authorization (BOLA / IDOR)",
          "Denial of Service (DoS)",
          "Cross-Site Request Forgery (CSRF)"
        ],
        correctAnswer: 1,
        explanation: "BOLA (or Insecure Direct Object References - IDOR) happens when an endpoint fails to verify if the requester owns the target resource."
      },
      {
        id: "Q-MNT-023-03",
        text: "What type of attack involves injecting malicious JavaScript into a web page input that is subsequently stored and executed in other users' browsers?",
        options: [
          "Stored Cross-Site Scripting (Stored XSS)",
          "SQL Injection",
          "Man-in-the-Middle Attack",
          "DNS Spoofing"
        ],
        correctAnswer: 0,
        explanation: "Stored XSS occurs when unescaped scripts are persisted in the database and rendered back to unsuspecting viewers."
      },
      {
        id: "Q-MNT-023-04",
        text: "What input validation defense is most effective at preventing SQL Injection vulnerabilities in backend databases?",
        options: [
          "Using parameterized queries / prepared statements",
          "Converting all input to uppercase",
          "Storing database records in CSV files",
          "Shortening the input length to 10 characters"
        ],
        correctAnswer: 0,
        explanation: "Parameterized queries separate SQL code structure from user data, ensuring user inputs cannot alter query logic."
      },
      {
        id: "Q-MNT-023-05",
        text: "What is the primary danger of storing sensitive session tokens in browser 'localStorage'?",
        options: [
          "localStorage data is erased every 10 seconds",
          "localStorage is accessible to any JavaScript running on the page, making tokens vulnerable to theft via Cross-Site Scripting (XSS)",
          "localStorage cannot store more than 10 bytes",
          "localStorage is sent to external advertising servers automatically"
        ],
        correctAnswer: 1,
        explanation: "Any XSS payload can execute 'localStorage.getItem()' and transmit session tokens to an attacker's server."
      },
      {
        id: "Q-MNT-023-06",
        text: "What security flag on cookies ensures that cookies are transmitted exclusively over encrypted HTTPS connections?",
        options: ["HttpOnly", "Secure", "SameSite", "Path"],
        correctAnswer: 1,
        explanation: "The 'Secure' attribute tells browsers never to transmit the cookie over unencrypted plain HTTP."
      },
      {
        id: "Q-MNT-023-07",
        text: "What is 'Vertical Privilege Escalation'?",
        options: [
          "A regular non-privileged user gains access to administrative or elevated system functions they should not possess",
          "A user accesses another regular user's data",
          "A database server moves to a higher rack in the datacenter",
          "An application is migrated from mobile to desktop"
        ],
        correctAnswer: 0,
        explanation: "Vertical escalation occurs when a lower-privileged role (e.g. member) accesses higher-privileged capabilities (e.g. admin)."
      },
      {
        id: "Q-MNT-023-08",
        text: "What is the intended defensive behavior when a user enters \" ' OR '1'='1 \" into a login username input field?",
        options: [
          "The application logs the user into the administrator account",
          "The application treats the string as a literal username, finds no match, and returns 'Invalid credentials'",
          "The database outputs the complete list of passwords",
          "The server crashes with HTTP 500"
        ],
        correctAnswer: 1,
        explanation: "A secure system treats input as literal string data; it should safely fail authentication with 'Invalid credentials'."
      },
      {
        id: "Q-MNT-023-09",
        text: "What does the 'SameSite=Strict' cookie attribute prevent?",
        options: [
          "Cross-Site Request Forgery (CSRF) by ensuring cookies are never sent in third-party cross-site requests",
          "Users from opening multiple tabs",
          "Users from logging in on mobile devices",
          "CSS layout rendering"
        ],
        correctAnswer: 0,
        explanation: "SameSite=Strict prevents CSRF by blocking the browser from attaching the cookie on cross-origin requests."
      },
      {
        id: "Q-MNT-023-10",
        text: "Why should error messages shown to end users never display raw database exception stack traces (e.g., 'SQLException at line 42...')?",
        options: [
          "It reveals internal software architecture, database types, and table schema details that attackers exploit to construct attacks",
          "Because stack traces use too much screen space",
          "Because users find the font ugly",
          "Because browsers crash when displaying stack traces"
        ],
        correctAnswer: 0,
        explanation: "Stack traces disclose sensitive implementation metadata (OWASP Security Misconfiguration / Information Disclosure)."
      }
    ]
  },
  {
    id: "ASM-MNT-024",
    courseId: "CRS-MNT-001",
    chapterId: "CH-MNT-024",
    title: "Assessment: Localization (L10n) & Internationalization (I18n)",
    passingScore: 70,
    questions: [
      {
        id: "Q-MNT-024-01",
        text: "What is the fundamental difference between Internationalization (I18n) and Localization (L10n)?",
        options: [
          "I18n is engineering code to support multiple locales without code changes; L10n is adapting content and assets for a specific locale",
          "I18n is for mobile apps; L10n is for websites",
          "L10n is performed by developers; I18n is performed only by translators",
          "There is no difference between I18n and L10n"
        ],
        correctAnswer: 0,
        explanation: "I18n is architectural readiness (Unicode, resource files); L10n is localized content adaptation (translations, formatting)."
      },
      {
        id: "Q-MNT-024-02",
        text: "Which of the following languages requires Right-to-Left (RTL) layout mirroring in web and mobile applications?",
        options: ["German", "Japanese", "Arabic", "Spanish"],
        correctAnswer: 2,
        explanation: "Arabic, Hebrew, Persian, and Urdu are written and read Right-to-Left, requiring full UI directional mirroring."
      },
      {
        id: "Q-MNT-024-03",
        text: "What common defect occurs when UI buttons or table columns have fixed pixel widths in an application translated from English to German?",
        options: [
          "Text expansion leads to text clipping, truncation, or broken overflowing layouts",
          "The computer CPU overheats",
          "The text is automatically deleted",
          "The page converts into an audio file"
        ],
        correctAnswer: 0,
        explanation: "German text frequently expands by 30-150% compared to English, causing clipping or overlap if containers have fixed widths."
      },
      {
        id: "Q-MNT-024-04",
        text: "What universal character encoding standard must modern applications support to handle all global scripts and emojis without corruption?",
        options: ["ASCII (7-bit)", "UTF-8 / Unicode", "ISO-8859-1", "Windows-1252"],
        correctAnswer: 1,
        explanation: "UTF-8 / Unicode encodes virtually all global characters, including Asian CJK ideographs, Arabic script, and emojis."
      },
      {
        id: "Q-MNT-024-05",
        text: "What is 'Pseudo-Localization' and why do QA teams use it?",
        options: [
          "Using automated translation scripts to generate accented, lengthened text to expose hardcoded strings and layout truncation early",
          "Translating the app into Klingon for fun",
          "Using fake test credit cards",
          "Writing test cases in shorthand"
        ],
        correctAnswer: 0,
        explanation: "Pseudo-localization expands text and adds accents, instantly exposing hardcoded strings and layout overflow before real translation."
      },
      {
        id: "Q-MNT-024-06",
        text: "In the United States, the date format is MM/DD/YYYY, while in the UK and much of Europe it is DD/MM/YYYY. What date does '05/06/2026' represent in the UK?",
        options: ["May 6, 2026", "June 5, 2026", "May 5, 2026", "June 6, 2026"],
        correctAnswer: 1,
        explanation: "In DD/MM/YYYY format, '05/06/2026' represents June 5, 2026 (day 5, month 6)."
      },
      {
        id: "Q-MNT-024-07",
        text: "What defect symptom occurs when a database table or column does not support UTF-8 multi-byte encoding and receives Asian or accented characters?",
        options: [
          "Characters are replaced by question marks (e.g. '???') or garbled mojibake symbols",
          "The database automatically shuts down",
          "The font size increases by 400%",
          "The operating system crashes"
        ],
        correctAnswer: 0,
        explanation: "Mojibake or replacement question marks ('???') occur when multi-byte Unicode characters are saved into non-UTF-8 character sets."
      },
      {
        id: "Q-MNT-024-08",
        text: "In Germany and France, what character is typically used as the decimal separator instead of a period (e.g., in €12,50)?",
        options: ["Comma (,)", "Semicolon (;)", "Colon (:)", "Hyphen (-)"],
        correctAnswer: 0,
        explanation: "Many European countries use the comma as the decimal separator and the period or space as the thousands separator."
      },
      {
        id: "Q-MNT-024-09",
        text: "What is a 'Hardcoded String' in the context of localization testing?",
        options: [
          "Text embedded directly into UI source code instead of referencing a localized resource bundle or key-value translation file",
          "A password that cannot be changed",
          "A cryptographic hash key",
          "A very long sentence"
        ],
        correctAnswer: 0,
        explanation: "Hardcoded strings cannot be translated dynamically at runtime because they bypass localization resource dictionaries."
      },
      {
        id: "Q-MNT-024-10",
        text: "When testing Japanese (ja-JP) currency transactions, what formatting rule must QA verify regarding minor currency units (cents/pence)?",
        options: [
          "Japanese Yen (¥) has no fractional/decimal currency subdivisions in common retail transactions",
          "Yen must always display 4 decimal places",
          "Yen uses dollar signs",
          "Yen must be rounded up to the nearest thousand"
        ],
        correctAnswer: 0,
        explanation: "Unlike USD or EUR, the Japanese Yen has no fractional subunit in modern circulation; ¥1,500 has no decimal point."
      }
    ]
  }
];

export const phase4 = { chapters: phase4Chapters, assessments: phase4Assessments };
