export const phase1Chapters = [
  {
    id: "CH-AUT-001",
    courseId: "CRS-AUT-001",
    title: "Test Automation Strategy & The Testing Pyramid",
    order: 1,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=LcGHiFnBh3Y",
    content: `# Test Automation Strategy & The Testing Pyramid

### Learning Objectives
1. Formulate a sustainable test automation strategy balancing ROI, maintenance overhead, and release velocity.
2. Analyze the Martin Fowler Test Automation Pyramid vs. the Anti-Pattern "Ice Cream Cone" (Inverted Pyramid).
3. Evaluate automation feasibility criteria and identify scenarios that should remain manual.
4. Compute Automation Return on Investment (ROI) and total cost of ownership (TCO).

---

### 1. The Economics of Test Automation

Test automation is not merely writing scripts; it is a software development initiative subject to engineering discipline, maintenance costs, and economic return.

\`\`\`
                     /\
                    /  \
                   / UI \           <-- Slowest, Most Fragile, Highest Maintenance
                  / E2E  \              (Playwright, Selenium, Cypress)
                 /--------\
                / Service  \        <-- Fast, Deterministic, Broad Contract Coverage
               / API / Int  \           (REST Assured, Supertest, Pact)
              /--------------\
             /  Unit & Static \     <-- Blazing Fast, Cheap, Immediate Feedback
            /   Code Analysis  \        (JUnit, Jest, PyTest, SonarQube)
           /--------------------\
\`\`\`

#### The Testing Pyramid (Fowler Model)
- **Unit Layer (70%)**: Tests individual functions, classes, and algorithmic boundaries in isolation using test doubles/mocks. Executes in milliseconds.
- **Service / API Integration Layer (20%)**: Validates business logic, database queries, and microservice contracts over network interfaces without browser rendering overhead.
- **End-to-End (E2E) UI Layer (10%)**: Tests critical user journeys through real browsers. High fidelity, but slowest to run and most susceptible to environmental flakiness.

---

### 2. The "Ice Cream Cone" Anti-Pattern

When organizations transition from manual QA without an engineering strategy, they often create an inverted pyramid:
- Heavy investment in hundreds of brittle UI scripts.
- Minimal or zero API automation.
- Inadequate unit test coverage by developers.

\`\`\`
   +---------------------------------------+
   |   Brittle, Flaky UI E2E Automated     |  --> Takes 6 hours in CI
   |   Tests (80% of testing effort)       |      Frequent false alarms
   +---------------------------------------+
        \   Sparse API / Contract Tests   /   --> 15% coverage
         \-------------------------------/
          \  Minimal Dev Unit Tests (5%) /    --> Little confidence
           \----------------------------/
\`\`\`

**Consequences**: Test runs take hours, false positives destroy developer confidence, and teams eventually ignore CI failure notifications.

---

### 3. Automation Feasibility Criteria

Not all test cases should be automated. Use the following decision matrix:

| Automate Immediately ✅ | Keep Manual ❌ |
| :--- | :--- |
| High-frequency Smoke & Build Acceptance tests | One-off, ad-hoc exploratory investigations |
| Repetitive regression suites spanning multiple releases | Rapidly changing UI prototypes with fluid UX |
| Critical business paths (Checkout, Wire Transfer, Auth) | Usability, aesthetics, look-and-feel evaluations |
| Data-driven tests requiring thousands of combinations | Physical hardware and barcode scanner disruptions |
| Performance benchmarks and stress testing | Low-priority edge cases occurring once in a decade |

---

### 4. Calculating Test Automation ROI

$$\\text{ROI} = \\frac{(\\text{Cost of Manual Testing} - \\text{Cost of Automated Testing})}{\\text{Cost of Automated Testing}} \\times 100$$

Where:
$$\\text{Cost of Manual Testing} = \\text{Time per Manual Run} \\times \\text{Number of Runs} \\times \\text{Hourly Rate}$$
$$\\text{Cost of Automated Testing} = \\text{Framework Build Cost} + (\\text{Script Maintenance Time} \\times \\text{Runs} \\times \\text{Rate}) + \\text{Tool Licensing/Cloud}$$

Automation achieves positive ROI only when suites execute frequently over sustained time horizons.

---

### 5. Hands-on Lab: Automation Feasibility Audit
1. Evaluate a 50-item manual test suite for an e-commerce platform.
2. Classify each case into: Unit, API, UI E2E, or Manual Exploratory.
3. Calculate the projected 12-month ROI of automating the top 20 regression journeys.`
  },
  {
    id: "CH-AUT-002",
    courseId: "CRS-AUT-001",
    title: "Locator Strategies & Resilient DOM Selectors",
    order: 2,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Locator Strategies & Resilient DOM Selectors

### Learning Objectives
1. Master selector hierarchies: IDs, Test IDs, CSS Selectors, and XPath.
2. Construct robust, anti-fragile locators immune to CSS restyling and framework DOM re-renders.
3. Master XPath axes: ancestor, descendant, following-sibling, parent, and text predicates.
4. Leverage accessible query strategies (WAI-ARIA roles, labels, and text).

---

### 1. The Selector Hierarchy of Resilience

80% of test maintenance is caused by fragile locators that break when frontend developers change CSS classes, wrap elements in new divs, or switch styling frameworks (e.g. from Bootstrap to Tailwind).

\`\`\`
   [ MOST RESILIENT ]   data-testid / data-cy attributes (Dedicated test hooks)
           |            Accessible ARIA Roles (role="button", name="Submit")
           v            Unique Semantic IDs (id="login-btn")
           |            Semantic CSS Combinators (form.auth-form input[type="email"])
           v            Relative XPath with text & sibling relationships
   [ MOST FRAGILE ]     Absolute / Deep XPath (/html/body/div[2]/div[1]/form/div[3]/button)
                        Auto-generated framework classes (.css-1x8zq2, .sc-bdVaJa)
\`\`\`

---

### 2. CSS Selectors Mastery

CSS selectors are faster and cleaner than XPath for standard DOM traversal:

\`\`\`css
/* Exact attribute match */
button[data-testid="checkout-btn"]

/* Substring prefix match (starts with) */
input[id^="user_name_"]

/* Substring suffix match (ends with) */
img[src$=".png"]

/* Substring wildcard match (contains) */
div[class*="product-card"]

/* Direct child vs descendant */
ul.nav-list > li.active         /* Direct child */
form.checkout-form input        /* Any descendant */

/* Pseudo-classes and state */
input:enabled
button:not([disabled])
tr:nth-child(even)
\`\`\`

---

### 3. XPath Axes & Dynamic DOM Traversal

XPath 1.0 provides bidirectional DOM navigation, allowing testers to traverse upwards, sideways to siblings, and search by text content.

\`\`\`xpath
/* 1. Locate button by visible text */
//button[normalize-space()='Confirm Order']

/* 2. Traverse from a known label to an adjacent input (following-sibling) */
//label[text()='Email Address']/following-sibling::input

/* 3. Locate a table row containing specific invoice ID, then find its 'Download' button */
//tr[td[contains(text(),'INV-2026-901')]]//button[contains(@class,'download')]

/* 4. Traverse upwards to the parent card container (ancestor) */
//span[text()='Out of Stock']/ancestor::div[contains(@class,'product-tile')]

/* 5. Multiple conditions with boolean logic */
//input[@type='text' and not(@disabled) and @required]
\`\`\`

---

### 4. Dedicated Test Attributes: The Gold Standard

Leading engineering teams mandate custom test attributes in their frontend component standards:
- React / Vue: \`data-testid="submit-payment"\`
- Cypress: \`data-cy="order-row"\`
- Angular: \`[attr.data-test]="'user-profile'\"\`

**Why?** Developers know that any attribute prefixed with \`data-test*\` is tethered to automated testing pipelines and must never be deleted during redesigns.

---

### 5. Hands-on Lab: Selector Refactoring
1. Given a fragile selector: \`/html/body/div[3]/div/div[2]/form/button[1]\`.
2. Inspect the DOM and find a nearby landmark or text.
3. Refactor it into a resilient CSS selector and an equivalent XPath expression using sibling navigation.`
  },
  {
    id: "CH-AUT-003",
    courseId: "CRS-AUT-001",
    title: "Selenium WebDriver 4 Deep Dive & W3C Protocol",
    order: 3,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# Selenium WebDriver 4 Deep Dive & W3C Protocol

### Learning Objectives
1. Understand the architectural evolution from Selenium 3 (JSON Wire Protocol) to Selenium 4 (Pure W3C Standard).
2. Configure WebDriver binaries using Selenium Manager and WebDriverManager.
3. Manage browser lifecycle, browser options, capabilities, and headless execution.
4. Execute cross-browser initialization across Chrome, Firefox, and Edge.

---

### 1. Architectural Evolution: Pure W3C Standardization

In Selenium 3, client bindings communicated with browser drivers via the HTTP JSON Wire Protocol. Browser drivers had to encode/decode commands to the W3C standard, introducing latency and subtle translation bugs.

Selenium 4 adopted pure, end-to-end W3C WebDriver compliance:

\`\`\`
  [ Selenium 4 Client ]  (Java, Python, JS, C#)
           |
           | Pure W3C Standard HTTP / JSON
           v
  [ Browser Driver ]    (chromedriver, geckodriver, msedgedriver)
           |
           | Direct Browser Automation Protocol
           v
  [ Real Browser ]      (Chrome, Firefox, Safari, Edge)
\`\`\`

**Key Benefits of W3C**:
- Zero translation overhead (faster execution).
- Consistent behavior across all compliant browsers.
- Native support for Chrome DevTools Protocol (CDP) and BiDi (Bidirectional) protocol.

---

### 2. Selenium Manager: Automatic Driver Management

Historically, testers suffered from "driver version mismatch" errors whenever Chrome auto-updated. Selenium 4.6+ introduced **Selenium Manager**, eliminating the need for third-party driver binaries or manual PATH configuration.

\`\`\`java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class BrowserFactory {
    public static WebDriver createDriver() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new"); // Modern Chrome headless mode
        options.addArguments("--window-size=1920,1080");
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");

        // Selenium Manager automatically detects browser version,
        // downloads matching driver, and initializes WebDriver
        return new ChromeDriver(options);
    }
}
\`\`\`

---

### 3. Core WebDriver API Operations

\`\`\`java
// Navigation
driver.get("https://nalanda.learning/login");
driver.navigate().refresh();
driver.navigate().back();

// Window & Viewport Management
driver.manage().window().maximize();
Dimension size = driver.manage().window().getSize();

// Element Interaction
WebElement emailInput = driver.findElement(By.id("email"));
emailInput.clear();
emailInput.sendKeys("qa.engineer@nalanda.org");

WebElement loginBtn = driver.findElement(By.cssSelector("button[type='submit']"));
loginBtn.click();

// Browser Teardown
driver.close(); // Closes active window
driver.quit();  // Destroys driver session & releases process resources
\`\`\`

---

### 4. Hands-on Lab: WebDriver Cross-Browser Harness
1. Instantiate a parameterized test that launches Chrome, Firefox, and Edge sequentially.
2. Configure headless mode and verify browser user-agent strings.
3. Implement clean \`@BeforeEach\` setup and \`@AfterEach\` teardown with \`driver.quit()\`.`
  },
  {
    id: "CH-AUT-004",
    courseId: "CRS-AUT-001",
    title: "Dynamic Synchronization: Implicit, Explicit & Fluent Waits",
    order: 4,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Dynamic Synchronization: Implicit, Explicit & Fluent Waits

### Learning Objectives
1. Eliminate flaky test executions caused by timing differences, race conditions, and asynchronous rendering.
2. Differentiate Implicit Waits, Explicit Waits (\`WebDriverWait\`), and Fluent Waits.
3. Master \`ExpectedConditions\`: visibility, clickability, presence, and staleness.
4. Diagnose and resolve \`StaleElementReferenceException\` and \`ElementClickInterceptedException\`.

---

### 1. The Anatomy of Flakiness

Modern single-page applications (React, Angular, Vue) render dynamically over asynchronous AJAX/fetch calls.
If an automated script attempts to click an element before it is rendered or clickable, it triggers fatal exceptions:
- \`NoSuchElementException\`
- \`ElementNotInteractableException\`
- \`ElementClickInterceptedException\`

\`Thread.sleep()\` is a catastrophic anti-pattern: it wastes test execution time when elements appear early and fails when network lag exceeds the arbitrary sleep duration.

---

### 2. Wait Strategies Comparison

\`\`\`
   +-------------------------------------------------------------+
   |                  SYNCHRONIZATION STRATEGIES                 |
   +-------------------------------------------------------------+
   | Thread.sleep(5000)   | HARMFUL: Hard freeze; kills CI speed |
   +----------------------+--------------------------------------+
   | Implicit Wait        | DANGEROUS: Global poll for presence   |
   |                      | only; cannot check clickability;     |
   |                      | causes huge delays on negative tests |
   +----------------------+--------------------------------------+
   | Explicit Wait        | RECOMMENDED: Scoped condition poll   |
   | (WebDriverWait)      | with custom timeout & condition      |
   +----------------------+--------------------------------------+
   | Fluent Wait          | ADVANCED: Custom polling interval,   |
   |                      | explicit exception ignores           |
   +-------------------------------------------------------------+
\`\`\`

---

### 3. Mastering WebDriverWait & ExpectedConditions

\`\`\`java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class WaitMastery {
    private WebDriver driver;
    private WebDriverWait wait;

    public WaitMastery(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void completeCheckout() {
        // 1. Wait until element is present in DOM AND visible on screen
        WebElement payBtn = wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.id("pay-now"))
        );

        // 2. Wait until element is clickable (enabled & unobstructed)
        wait.until(ExpectedConditions.elementToBeClickable(payBtn)).click();

        // 3. Wait until loading overlay vanishes (invisibility)
        wait.until(
            ExpectedConditions.invisibilityOfElementLocated(By.className("spinner-overlay"))
        );

        // 4. Wait for URL redirect
        wait.until(ExpectedConditions.urlContains("/order-confirmation"));
    }
}
\`\`\`

---

### 4. Resolving StaleElementReferenceException

A **StaleElementReferenceException** occurs when:
1. The script finds a \`WebElement\` reference in the DOM.
2. The page updates (via React state, re-render, or DOM rebuild), destroying the original DOM node.
3. The script attempts to interact with the outdated reference.

#### Solution:
Never store element references across DOM updates. Re-fetch or poll the locator dynamically:
\`\`\`java
// Wait for element to become stale (detached), then re-find new node
wait.until(ExpectedConditions.stalenessOf(oldElement));
WebElement newElement = wait.until(ExpectedConditions.elementToBeClickable(locator));
newElement.click();
\`\`\`

---

### 5. Hands-on Lab: Flaky Test Rehabilitation
1. Run a sample test suite that fails 40% of the time due to \`Thread.sleep\` and timing delays.
2. Replace all hard sleeps with explicit \`WebDriverWait\` conditions.
3. Verify test runs 10 times consecutively with 100% pass rate in half the total execution time.`
  },
  {
    id: "CH-AUT-005",
    courseId: "CRS-AUT-001",
    title: "Page Object Model (POM) & Component Object Architecture",
    order: 5,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# Page Object Model (POM) & Component Object Architecture

### Learning Objectives
1. Implement the Page Object Model (POM) design pattern for high maintainability and DRY principles.
2. Decouple test logic (assertions/flows) from technical UI details (selectors/locators).
3. Design fluent interfaces with method chaining for clean, expressive test scripts.
4. Scale large architectures using the Component Object Model (Navigation bar, Modals, Tables).

---

### 1. Why Page Object Model?

Without a design pattern, automated scripts intermingle locators, waits, driver calls, and assertions in every test method.
When a developer renames a button ID, engineers must edit 50 individual test files.

POM introduces an abstraction layer:
- **Page Classes**: Encapsulate locators and user interactions (actions). Never contain assertions.
- **Test Classes**: Orchestrate user journeys and perform business assertions. Never contain raw \`driver.findElement()\` calls.

\`\`\`
   +-------------------------+
   |       Test Layer        |  --> "Given user logs in, Then dashboard is visible"
   |   (LoginTest.java)      |      (Contains Assertions: assertEquals, assertTrue)
   +------------+------------+
                | Calls methods
                v
   +-------------------------+
   |     Page Object Layer   |  --> "enterEmail()", "enterPassword()", "clickSubmit()"
   |   (LoginPage.java)      |      (Encapsulates Locators, Waits, Driver interactions)
   +------------+------------+
                | Drives
                v
   +-------------------------+
   |   Browser DOM / Web     |
   +-------------------------+
\`\`\`

---

### 2. Modern Implementation of a Page Object

\`\`\`java
package com.nalanda.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    // Encapsulated Locators
    private final By emailInput = By.id("user-email");
    private final By passwordInput = By.id("user-password");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By errorMessage = By.cssSelector(".alert-danger");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public LoginPage open(String url) {
        driver.get(url + "/login");
        return this; // Fluent method chaining
    }

    public LoginPage enterEmail(String email) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput)).sendKeys(email);
        return this;
    }

    public LoginPage enterPassword(String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInput)).sendKeys(password);
        return this;
    }

    public DashboardPage clickLoginSuccess() {
        wait.until(ExpectedConditions.elementToBeClickable(submitButton)).click();
        return new DashboardPage(driver); // State transition to next page
    }

    public String getErrorMessage() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage)).getText();
    }
}
\`\`\`

---

### 3. Writing Clean, Fluent Tests

\`\`\`java
package com.nalanda.tests;

import com.nalanda.pages.LoginPage;
import com.nalanda.pages.DashboardPage;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AuthenticationTests extends BaseTest {

    @Test
    void testSuccessfulLogin() {
        DashboardPage dashboard = new LoginPage(driver)
            .open(BASE_URL)
            .enterEmail("admin@nalanda.org")
            .enterPassword("ValidSecret123!")
            .clickLoginSuccess();

        assertTrue(dashboard.isWelcomeHeaderDisplayed(), "Welcome header should be visible upon login");
        assertEquals("Admin Dashboard", dashboard.getPageTitle());
    }
}
\`\`\`

---

### 4. Hands-on Lab: POM Framework Refactoring
1. Take a monolithic 200-line test script containing direct driver calls and selectors.
2. Extract page classes for \`HeaderComponent\`, \`CatalogPage\`, and \`CartModal\`.
3. Re-architect the test into readable 10-line fluent test steps.`
  },
  {
    id: "CH-AUT-006",
    courseId: "CRS-AUT-001",
    title: "Test Runners & Assertion Frameworks: JUnit 5 & TestNG",
    order: 6,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Test Runners & Assertion Frameworks: JUnit 5 & TestNG

### Learning Objectives
1. Configure modern test runners: JUnit 5 (Jupiter) and TestNG.
2. Master lifecycle annotations: \`@BeforeAll\`, \`@BeforeEach\`, \`@AfterEach\`, and \`@AfterAll\`.
3. Implement Parameterized and Data-Driven tests using CSV, JSON, and \`@MethodSource\` / \`@DataProvider\`.
4. Configure parallel test execution across threads and browser sessions.
5. Implement Soft Assertions and Custom Test Listeners.

---

### 1. Test Runner Lifecycle & Annotation Architecture

A test runner provides the harness to discover tests, instantiate environments, execute steps, evaluate assertions, and report outcomes.

| Phase | JUnit 5 Annotation | TestNG Annotation | Purpose |
| :--- | :--- | :--- | :--- |
| **Suite Setup** | \`@BeforeAll\` (static) | \`@BeforeSuite\` / \`@BeforeClass\` | Initialize DB connections, global config. |
| **Test Setup** | \`@BeforeEach\` | \`@BeforeMethod\` | Launch fresh browser instance, clear cookies. |
| **Test Execution**| \`@Test\` | \`@Test\` | Individual test logic. |
| **Test Teardown** | \`@AfterEach\` | \`@AfterMethod\` | Capture screenshot on failure, \`driver.quit()\`. |
| **Suite Teardown**| \`@AfterAll\` (static) | \`@AfterSuite\` / \`@AfterClass\` | Close DB pool, generate Allure report. |

---

### 2. Data-Driven Testing in JUnit 5

Data-driven testing executes the exact same test workflow against multiple datasets:

\`\`\`java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class LoginDataDrivenTest extends BaseTest {

    @ParameterizedTest(name = "Run {index}: email={0}, expectedError={2}")
    @CsvSource({
        "invalid_email, secret123, 'Please enter a valid email address.'",
        "user@domain.com, wrongpass, 'Invalid credentials provided.'",
        "'', secret123, 'Email field cannot be blank.'"
    })
    void testInvalidLoginValidation(String email, String password, String expectedMessage) {
        String actualError = new LoginPage(driver)
            .open(BASE_URL)
            .enterEmail(email)
            .enterPassword(password)
            .clickSubmitExpectingFailure()
            .getErrorMessage();

        assertEquals(expectedMessage, actualError);
    }
}
\`\`\`

---

### 3. Hard Assertions vs. Soft Assertions

- **Hard Assertions** (\`assertEquals\`, \`assertTrue\`): If an assertion fails, test execution halts immediately. Subsequent checks in the same test method are skipped.
- **Soft Assertions** (\`assertAll\` in JUnit 5 / \`SoftAssert\` in TestNG): Executes all assertions even if an earlier check fails, aggregating all failures into a unified failure report.

\`\`\`java
// JUnit 5 assertAll Soft Assertion
assertAll("User Profile Attributes",
    () -> assertEquals("Jane", profile.getFirstName(), "First name mismatch"),
    () -> assertEquals("Doe", profile.getLastName(), "Last name mismatch"),
    () -> assertEquals("ADMIN", profile.getRole(), "Role mismatch"),
    () -> assertTrue(profile.isEmailVerified(), "Email should be verified")
);
\`\`\`

---

### 4. Hands-on Lab: Parallel Execution Setup
1. Configure \`junit-platform.properties\` with:
\`\`\`properties
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.config.strategy = fixed
junit.jupiter.execution.parallel.config.fixed.parallelism = 4
\`\`\`
2. Refactor the WebDriver initialization into a \`ThreadLocal<WebDriver>\` container to prevent browser cross-thread collision.
3. Execute 10 tests and verify 4 browser windows run concurrently.`
  },
  {
    id: "CH-AUT-007",
    courseId: "CRS-AUT-001",
    title: "Advanced Browser Automation: Actions API, JS Executor & Shadow DOM",
    order: 7,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=FqSPh_x2Yt4",
    content: `# Advanced Browser Automation: Actions API, JS Executor & Shadow DOM

### Learning Objectives
1. Automate complex user gestures with the W3C \`Actions\` API: Hover, Drag-and-Drop, Double Click, and Multi-Key shortcuts.
2. Execute custom JavaScript in page context using \`JavascriptExecutor\` for resilient scrolling and state inspection.
3. Automate nested \`<iframe>\` contexts and multi-tab/window browser switching.
4. Pierce open Shadow DOM encapsulation boundaries to locate web components.

---

### 1. Complex User Gestures with the Actions API

The Selenium 4 \`Actions\` API simulates low-level W3C input events (mouse, keyboard, pen):

\`\`\`java
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.Keys;

Actions actions = new Actions(driver);

// 1. Mouse Hover (Dropdown menu reveal)
WebElement navMenu = driver.findElement(By.id("nav-products"));
actions.moveToElement(navMenu).perform();

// 2. Drag and Drop (Kanban card or slider)
WebElement sourceCard = driver.findElement(By.id("card-101"));
WebElement targetColumn = driver.findElement(By.id("done-column"));
actions.dragAndDrop(sourceCard, targetColumn).perform();

// 3. Multi-Key Chord (Select all & delete)
WebElement searchInput = driver.findElement(By.id("search-box"));
actions.click(searchInput)
       .keyDown(Keys.CONTROL)
       .sendKeys("a")
       .keyUp(Keys.CONTROL)
       .sendKeys(Keys.BACK_SPACE)
       .perform();
\`\`\`

---

### 2. JavascriptExecutor: The Emergency Escape Hatch

When standard WebDriver clicks fail due to sticky headers, hidden coordinates, or complex overlays, \`JavascriptExecutor\` interacts directly with the browser DOM engine:

\`\`\`java
JavascriptExecutor js = (JavascriptExecutor) driver;

// 1. Smooth scroll element into center viewport
WebElement element = driver.findElement(By.id("footer-terms"));
js.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'nearest'});", element);

// 2. DOM Direct Click (bypasses click interception)
js.executeScript("arguments[0].click();", element);

// 3. Inspect document ready state
boolean isPageLoaded = js.executeScript("return document.readyState").equals("complete");
\`\`\`

---

### 3. Piercing Shadow DOM & Web Components

Modern web frameworks (Salesforce LWC, Lit, Web Components) isolate CSS and DOM nodes inside **Shadow Roots**. Standard \`driver.findElement()\` fails against nodes inside a Shadow DOM.

\`\`\`java
// Selenium 4 Native Shadow DOM Piercing
WebElement shadowHost = driver.findElement(By.cssSelector("custom-video-player"));
SearchContext shadowRoot = shadowHost.getShadowRoot();

// Search INSIDE the shadow root
WebElement playButton = shadowRoot.findElement(By.cssSelector("button.play-btn"));
playButton.click();
\`\`\`

---

### 4. Hands-on Lab: Multi-Window & IFrame Triage
1. Navigate to a third-party payment gateway inside an \`<iframe>\`.
2. Switch context: \`driver.switchTo().frame("stripe-iframe")\`.
3. Complete card entry, submit, and switch back: \`driver.switchTo().defaultContent()\`.
4. Handle new popup window: switch window handles and verify redirection.`
  }
];

export const phase1Assessments = [
  {
    id: "ASM-AUT-001",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-001",
    title: "Assessment: Test Automation Strategy & Testing Pyramid",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-001-01",
        text: "In Martin Fowler's Test Automation Pyramid, which tier of testing should comprise the largest percentage of total automated tests?",
        options: ["UI End-to-End Tests", "Unit Tests", "Manual Exploratory Tests", "Performance Benchmark Tests"],
        correctAnswer: 1,
        explanation: "Unit tests are fast, deterministic, and cheap to maintain, making up the broad foundation (~70%) of the pyramid."
      },
      {
        id: "Q-AUT-001-02",
        text: "What is the primary danger of the 'Ice Cream Cone' test automation anti-pattern?",
        options: [
          "Too many unit tests slow down developers",
          "An over-reliance on brittle UI tests creates slow CI builds and frequent false alarms that destroy team confidence",
          "API tests become too expensive to purchase",
          "Testing cannot be executed in the cloud"
        ],
        correctAnswer: 1,
        explanation: "The Ice Cream Cone anti-pattern over-indexes on fragile UI tests, causing high maintenance, flakiness, and sluggish CI feedback."
      },
      {
        id: "Q-AUT-001-03",
        text: "Which of the following scenarios is LEAST suitable for automated End-to-End UI testing?",
        options: [
          "Core checkout transaction flow with credit card processing",
          "Exploratory evaluation of a brand-new UI visual concept that changes daily",
          "User login and password reset regression tests",
          "Daily smoke tests verifying system availability"
        ],
        correctAnswer: 1,
        explanation: "Rapidly changing, fluid UI concepts should be tested manually; automating unstable interfaces causes massive rework."
      },
      {
        id: "Q-AUT-001-04",
        text: "How does API/Service level automation compare to UI End-to-End automation?",
        options: [
          "API tests are faster, less brittle, and provide broader business logic coverage than UI tests",
          "API tests are always slower than UI tests",
          "API tests require a browser to run",
          "API tests cannot be run in CI/CD"
        ],
        correctAnswer: 0,
        explanation: "API tests execute directly against backend endpoints without browser rendering, making them 10x-100x faster and far more stable."
      },
      {
        id: "Q-AUT-001-05",
        text: "What does ROI stand for in the context of test automation?",
        options: [
          "Rate of Integration",
          "Return on Investment",
          "Reliability of Implementation",
          "Range of Interfaces"
        ],
        correctAnswer: 1,
        explanation: "Return on Investment (ROI) evaluates the cost savings of automation relative to its development and maintenance costs."
      },
      {
        id: "Q-AUT-001-06",
        text: "Why does automated testing have a high initial total cost of ownership (TCO)?",
        options: [
          "Because framework architecture, tooling setup, and test script creation require substantial upfront engineering effort",
          "Because computers must be replaced daily",
          "Because developers charge money per click",
          "Because browsers charge subscription fees to run tests"
        ],
        correctAnswer: 0,
        explanation: "Automation requires an upfront investment in architecture, CI/CD wiring, and framework engineering before yielding payoff."
      },
      {
        id: "Q-AUT-001-07",
        text: "What is a 'false positive' in automated testing?",
        options: [
          "A test that fails even though the application code is working correctly (usually due to environmental or timing flakiness)",
          "A test that passes when a critical bug exists",
          "A test that runs in less than one second",
          "A test that logs a valid bug"
        ],
        correctAnswer: 0,
        explanation: "A false positive occurs when a test fails due to script flakiness, network timeouts, or bad locators rather than a genuine product defect."
      },
      {
        id: "Q-AUT-001-08",
        text: "When calculating Automation ROI, what ongoing expense is most frequently underestimated by leadership?",
        options: [
          "Cost of electricity",
          "Ongoing test script maintenance and triage time caused by application changes",
          "Cost of keyboards",
          "Operating system upgrade fees"
        ],
        correctAnswer: 1,
        explanation: "Test maintenance overhead—updating selectors, fixing timing issues, and updating test data—is the biggest long-term cost."
      },
      {
        id: "Q-AUT-001-09",
        text: "What test tier validates contract compatibility and data serialization between two microservices without launching a browser?",
        options: ["Component / Integration API testing", "Manual exploratory testing", "Accessibility testing", "Visual regression testing"],
        correctAnswer: 0,
        explanation: "Integration and contract tests validate API schemas and service-to-service communication without UI overhead."
      },
      {
        id: "Q-AUT-001-10",
        text: "What should a QA team do when a UI automated test fails intermittently without any code changes?",
        options: [
          "Ignore the failure and re-run it until it passes",
          "Quarantine the flaky test, investigate the root timing/locator cause, and fix or refactor it before returning to CI",
          "Delete all tests from the repository",
          "Disable all unit testing"
        ],
        correctAnswer: 1,
        explanation: "Flaky tests must be quarantined immediately to protect CI integrity while the root cause is diagnosed and fixed."
      }
    ]
  },
  {
    id: "ASM-AUT-002",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-002",
    title: "Assessment: Locator Strategies & Resilient DOM Selectors",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-002-01",
        text: "Which locator strategy is considered the MOST resilient to frontend CSS restyling and framework refactoring?",
        options: [
          "Absolute XPath (e.g. /html/body/div[2]/div/button)",
          "Custom test attributes (e.g. data-testid='submit-btn')",
          "Generated CSS utility classes (e.g. .css-18z9fa)",
          "Element tag name (e.g. By.tagName('div'))"
        ],
        correctAnswer: 1,
        explanation: "Dedicated test attributes (data-testid) are decoupled from CSS styling and DOM restructuring, providing maximum stability."
      },
      {
        id: "Q-AUT-002-02",
        text: "What does the CSS selector 'input[id^=\"user_\"]' match?",
        options: [
          "Any input whose id ends with 'user_'",
          "Any input whose id starts with 'user_'",
          "Any input whose id contains 'user_' anywhere",
          "Any input without an id attribute"
        ],
        correctAnswer: 1,
        explanation: "The '^=' prefix operator in CSS selectors matches attributes that start with the specified string."
      },
      {
        id: "Q-AUT-002-03",
        text: "In XPath, which axis allows you to navigate from a target element upwards to find an enclosing parent container?",
        options: ["descendant::", "following-sibling::", "ancestor::", "child::"],
        correctAnswer: 2,
        explanation: "The 'ancestor::' axis traverses upwards through all parent and grandparent nodes of the context element."
      },
      {
        id: "Q-AUT-002-04",
        text: "Why is using Absolute XPath (e.g. '/html/body/div[1]/div[2]/form/div[3]/button') considered a catastrophic anti-pattern?",
        options: [
          "It takes 10 minutes to type",
          "Any minor layout change or wrapper div inserted by developers instantly breaks the selector",
          "Browsers do not support XPath",
          "It can only be used on Windows"
        ],
        correctAnswer: 1,
        explanation: "Absolute paths depend on the exact DOM tree structure; adding a single wrapper container breaks the entire test."
      },
      {
        id: "Q-AUT-002-05",
        text: "What CSS combinator represents a direct child relationship rather than an arbitrary descendant?",
        options: ["Space (e.g. 'div p')", "Greater than (e.g. 'div > p')", "Plus (e.g. 'div + p')", "Tilde (e.g. 'div ~ p')"],
        correctAnswer: 1,
        explanation: "The '>' combinator selects only direct child elements, whereas a space matches any descendant."
      },
      {
        id: "Q-AUT-002-06",
        text: "What XPath function is used to match visible text while stripping leading and trailing whitespace?",
        options: ["trim()", "strip()", "normalize-space()", "clean()"],
        correctAnswer: 2,
        explanation: "'normalize-space()' strips leading/trailing whitespace and compresses consecutive spaces, ideal for text matching."
      },
      {
        id: "Q-AUT-002-07",
        text: "Which selector locates an adjacent sibling input immediately following a specific label tag in XPath?",
        options: [
          "//label[text()='Age']/following-sibling::input",
          "//label[text()='Age']/ancestor::input",
          "//label[text()='Age']/child::input",
          "//label[text()='Age']/preceding::input"
        ],
        correctAnswer: 0,
        explanation: "'following-sibling::' navigates to elements sharing the same parent that appear after the context node."
      },
      {
        id: "Q-AUT-002-08",
        text: "Why should automated tests avoid targeting auto-generated CSS classes such as '.styled__Button-sc-168a-0' generated by Styled Components?",
        options: [
          "Because they are regenerated with new hashes every time the frontend code is built, breaking locators",
          "Because browsers block styled components",
          "Because they use too much RAM",
          "Because they are written in JavaScript"
        ],
        correctAnswer: 0,
        explanation: "CSS-in-JS tools generate dynamic hashes that change across builds, causing instant test fragility."
      },
      {
        id: "Q-AUT-002-09",
        text: "What CSS selector targets a button element that does NOT have the 'disabled' attribute?",
        options: ["button:disabled", "button:not([disabled])", "button[enabled=true]", "button:clickable"],
        correctAnswer: 1,
        explanation: "The ':not([disabled])' pseudo-class filters out elements containing the disabled attribute."
      },
      {
        id: "Q-AUT-002-10",
        text: "In Playwright and modern testing tools, why is querying by Accessible Role (e.g. getByRole('button', { name: 'Submit' })) preferred over raw CSS?",
        options: [
          "It forces developers to build accessible applications and verifies the UI as perceived by real users and assistive technology",
          "It runs 100x faster than CSS",
          "It ignores all JavaScript errors",
          "It eliminates the need for test assertions"
        ],
        correctAnswer: 0,
        explanation: "Role-based queries simulate user perception and guarantee accessibility conformance while providing high resilience."
      }
    ]
  },
  {
    id: "ASM-AUT-003",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-003",
    title: "Assessment: Selenium WebDriver 4 Deep Dive",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-003-01",
        text: "What major architectural change was implemented in Selenium 4 regarding browser communication?",
        options: [
          "Selenium 4 adopted pure W3C WebDriver standardization, eliminating the legacy JSON Wire Protocol translation layer",
          "Selenium 4 replaced Java with PHP",
          "Selenium 4 requires a paid enterprise server license",
          "Selenium 4 removed cross-browser support"
        ],
        correctAnswer: 0,
        explanation: "Selenium 4 is fully W3C compliant, communicating directly without translating through the legacy JSON Wire Protocol."
      },
      {
        id: "Q-AUT-003-02",
        text: "What native capability introduced in Selenium 4.6+ automatically detects browser versions and downloads matching driver binaries?",
        options: ["WebDriverManager", "Selenium Manager", "Docker Driver", "BrowserSync"],
        correctAnswer: 1,
        explanation: "Selenium Manager is built into Selenium 4.6+ to manage browser and driver binaries automatically out of the box."
      },
      {
        id: "Q-AUT-003-03",
        text: "What is the difference between 'driver.close()' and 'driver.quit()'?",
        options: [
          "'driver.close()' closes the currently focused browser window; 'driver.quit()' terminates the entire session and kills all driver processes",
          "'driver.quit()' only minimizes the browser",
          "'driver.close()' shuts down the entire operating system",
          "They are exact synonyms and perform identical tasks"
        ],
        correctAnswer: 0,
        explanation: "'close()' shuts only the active window/tab; 'quit()' terminates all windows and destroys the driver process to avoid memory leaks."
      },
      {
        id: "Q-AUT-003-04",
        text: "What does running a browser in 'Headless' mode mean?",
        options: [
          "Running the browser without human oversight",
          "Running the browser without a graphical user interface (GUI) displayed on screen, ideal for CI/CD servers",
          "Running the browser with zero JavaScript enabled",
          "Running the browser in an offline local mode"
        ],
        correctAnswer: 1,
        explanation: "Headless mode executes the browser engine in memory without rendering visible pixels, saving resources in CI environments."
      },
      {
        id: "Q-AUT-003-05",
        text: "Which protocol in Selenium 4 enables bidirectional communication for capturing console logs, network traffic, and DOM mutations?",
        options: ["BiDi (Bidirectional) / CDP (Chrome DevTools Protocol)", "FTP", "Telnet", "SMTP"],
        correctAnswer: 0,
        explanation: "BiDi and CDP allow real-time two-way communication between WebDriver and the browser engine."
      },
      {
        id: "Q-AUT-003-06",
        text: "Which class in Selenium is used to configure browser arguments like '--headless=new' and window dimensions?",
        options: ["DesiredCapabilities", "ChromeOptions / FirefoxOptions", "BrowserConfig", "SystemProperties"],
        correctAnswer: 1,
        explanation: "Browser-specific Options classes (ChromeOptions, FirefoxOptions) manage command-line switches and preferences."
      },
      {
        id: "Q-AUT-003-07",
        text: "What happens if a test suite fails to invoke 'driver.quit()' in an '@AfterEach' or '@AfterAll' teardown block?",
        options: [
          "Orphaned browser driver processes remain running in background memory, eventually exhausting system RAM on the CI runner",
          "The test cases automatically turn green",
          "The git repository is locked",
          "The browser is uninstalled"
        ],
        correctAnswer: 0,
        explanation: "Omitting 'quit()' leaves zombie processes (chromedriver.exe) running, leading to memory exhaustion and pipeline crashes."
      },
      {
        id: "Q-AUT-003-08",
        text: "What WebDriver method navigates to a designated URL?",
        options: ["driver.get(url)", "driver.open(url)", "driver.browse(url)", "driver.load(url)"],
        correctAnswer: 0,
        explanation: "'driver.get(url)' (or 'driver.navigate().to(url)') loads a web page in the current browser window."
      },
      {
        id: "Q-AUT-003-09",
        text: "What driver binary is used by Selenium to automate the Mozilla Firefox browser?",
        options: ["chromedriver", "geckodriver", "msedgedriver", "safaridriver"],
        correctAnswer: 1,
        explanation: "Geckodriver is the official proxy for using W3C WebDriver-compliant programs to interact with Gecko browsers."
      },
      {
        id: "Q-AUT-003-10",
        text: "How does Selenium 4 handle Relative Locators (also known as Friendly Locators)?",
        options: [
          "It allows finding elements based on spatial terms like above(), below(), toLeftOf(), toRightOf(), and near()",
          "It only locates elements by their relative file path",
          "It requires elements to have identical IDs",
          "It converts all locators into XPath automatically"
        ],
        correctAnswer: 0,
        explanation: "Relative locators in Selenium 4 find elements based on visual layout position relative to reference elements."
      }
    ]
  },
  {
    id: "ASM-AUT-004",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-004",
    title: "Assessment: Dynamic Synchronization & Waits",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-004-01",
        text: "Why is 'Thread.sleep()' strongly discouraged in production test automation frameworks?",
        options: [
          "It halts the thread unconditionally, slowing down suites when elements appear early and failing tests when elements take longer",
          "It causes the computer processor to shut down",
          "It is not supported in the Java language",
          "It only works on Linux machines"
        ],
        correctAnswer: 0,
        explanation: "Hard sleeps are non-adaptive: they waste time on fast responses and cause flakiness on slower network latency."
      },
      {
        id: "Q-AUT-004-02",
        text: "What is an Implicit Wait in Selenium WebDriver?",
        options: [
          "A global poll configured on the driver that waits a specified duration for any element to be present in the DOM before throwing NoSuchElementException",
          "A wait that checks whether an element is clickable",
          "A wait that executes only in headless mode",
          "A wait that only triggers on network errors"
        ],
        correctAnswer: 0,
        explanation: "Implicit wait sets a global timeout on 'findElement', polling the DOM strictly for presence across the entire session."
      },
      {
        id: "Q-AUT-004-03",
        text: "What ExpectedCondition should be used before calling '.click()' on a button that animates into view or is initially disabled?",
        options: [
          "ExpectedConditions.presenceOfElementLocated",
          "ExpectedConditions.elementToBeClickable",
          "ExpectedConditions.alertIsPresent",
          "ExpectedConditions.titleContains"
        ],
        correctAnswer: 1,
        explanation: "'elementToBeClickable' guarantees that the element is both visible on screen AND enabled for interaction."
      },
      {
        id: "Q-AUT-004-04",
        text: "What causes a 'StaleElementReferenceException' in Selenium?",
        options: [
          "The element is no longer attached to the DOM, often because a JavaScript re-render or page transition destroyed the original node",
          "The element has been on screen for more than 24 hours",
          "The element has an expired cookie",
          "The computer has run out of disk space"
        ],
        correctAnswer: 0,
        explanation: "Stale references occur when the DOM element referenced by a WebElement object has been deleted or reconstructed."
      },
      {
        id: "Q-AUT-004-05",
        text: "How does a Fluent Wait differ from a standard WebDriverWait?",
        options: [
          "FluentWait allows configuring custom polling frequency (e.g. check every 250ms) and explicitly ignoring specific exceptions (e.g. StaleElementReferenceException)",
          "FluentWait cannot time out",
          "FluentWait only works with Google Chrome",
          "FluentWait is only available in Python"
        ],
        correctAnswer: 0,
        explanation: "FluentWait provides fine-grained control over timeout duration, polling intervals, and ignored exceptions."
      },
      {
        id: "Q-AUT-004-06",
        text: "What occurs if you mix Implicit Wait and Explicit Wait within the same automation suite?",
        options: [
          "It can cause unpredictable wait times that exceed both timeouts, as warned by official Selenium documentation",
          "It makes the tests run 2x faster",
          "It automatically fixes all flaky tests",
          "It compresses the test code"
        ],
        correctAnswer: 0,
        explanation: "Selenium documentation explicitly warns that mixing implicit and explicit waits produces unpredictable timeout compounding."
      },
      {
        id: "Q-AUT-004-07",
        text: "What ExpectedCondition is ideal for verifying that an asynchronous loading overlay or spinner has disappeared before proceeding?",
        options: [
          "ExpectedConditions.invisibilityOfElementLocated",
          "ExpectedConditions.presenceOfElementLocated",
          "ExpectedConditions.elementToBeSelected",
          "ExpectedConditions.urlMatches"
        ],
        correctAnswer: 0,
        explanation: "'invisibilityOfElementLocated' waits until the spinner is detached from the DOM or hidden from display."
      },
      {
        id: "Q-AUT-004-08",
        text: "What exception is thrown when an explicit wait reaches its timeout duration without the ExpectedCondition becoming true?",
        options: ["TimeoutException", "NullPointerException", "ArrayIndexOutOfBoundsException", "IOException"],
        correctAnswer: 0,
        explanation: "WebDriverWait throws an org.openqa.selenium.TimeoutException when the condition is not satisfied in time."
      },
      {
        id: "Q-AUT-004-09",
        text: "What is the difference between 'presenceOfElementLocated' and 'visibilityOfElementLocated'?",
        options: [
          "Presence only checks if the element exists in the DOM tree; Visibility checks that it exists AND has height/width greater than 0 and is not hidden by CSS",
          "Visibility only checks if the text is in English",
          "Presence only works on buttons",
          "They are identical"
        ],
        correctAnswer: 0,
        explanation: "An element can exist in the DOM (present) while being completely hidden by \`display: none\` (not visible)."
      },
      {
        id: "Q-AUT-004-10",
        text: "How should a StaleElementReferenceException be resolved in a Page Object Model implementation?",
        options: [
          "By re-querying the locator to fetch a fresh DOM reference rather than storing cached WebElement instances across actions",
          "By restarting the entire operating system",
          "By deleting the test",
          "By using Thread.sleep(60000)"
        ],
        correctAnswer: 0,
        explanation: "Re-locating the element via dynamic \`By\` queries retrieves a fresh DOM node reference and avoids staleness."
      }
    ]
  },
  {
    id: "ASM-AUT-005",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-005",
    title: "Assessment: Page Object Model (POM) Architecture",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-005-01",
        text: "What is the core architectural rule of the Page Object Model (POM)?",
        options: [
          "Page objects encapsulate selectors and browser interactions; test classes contain business flows and assertions",
          "All assertions must be written inside page object methods",
          "Every single HTML tag must have its own Java class",
          "Page objects must never use WebDriver"
        ],
        correctAnswer: 0,
        explanation: "POM separates page representations and UI interactions from test logic and verification assertions."
      },
      {
        id: "Q-AUT-005-02",
        text: "Why should Page Object methods generally avoid containing test assertions (e.g. assertEquals)?",
        options: [
          "Because page objects represent the UI state/actions; assertions belong in the test layer to maintain reusability and clear test failure boundaries",
          "Because assertions are illegal in Java classes",
          "Because assertions slow down browser rendering",
          "Because page objects only work in production"
        ],
        correctAnswer: 0,
        explanation: "Page objects are reusable across diverse verification scenarios; hardcoding assertions in pages limits their reusability."
      },
      {
        id: "Q-AUT-005-03",
        text: "What is a 'Fluent Interface' in Page Object design?",
        options: [
          "Method chaining where page methods return 'this' (or the next Page Object) allowing expressive, pipeline-style test scripts",
          "Writing test cases in multiple human languages",
          "An interface that speaks audio instructions",
          "A framework that does not use classes"
        ],
        correctAnswer: 0,
        explanation: "Fluent design returns page object instances, enabling clean method chaining like: \`page.enterUser().enterPass().clickSubmit()\`."
      },
      {
        id: "Q-AUT-005-04",
        text: "If a user clicks 'Login' and successfully navigates to the Dashboard, what should the 'clickLogin()' method return in a fluent POM architecture?",
        options: ["void", "new DashboardPage(driver)", "true", "null"],
        correctAnswer: 1,
        explanation: "State-transitioning actions return the new Page Object representing the resulting destination screen."
      },
      {
        id: "Q-AUT-005-05",
        text: "What is the Component Object Pattern in test automation?",
        options: [
          "Breaking down reusable UI sections (like Navigation Bars, Modals, or Search Bars) into modular component objects shared across multiple pages",
          "Writing code without any objects",
          "Testing hardware components like computer RAM",
          "A tool that compiles Java into C++"
        ],
        correctAnswer: 0,
        explanation: "Component Objects modularize recurring UI elements (e.g., Headers, Footers, Modals) so they aren't duplicated across page objects."
      },
      {
        id: "Q-AUT-005-06",
        text: "Why did modern test automation move away from Selenium's legacy 'PageFactory.initElements()'?",
        options: [
          "PageFactory initializes WebElements lazily using proxies that frequently trigger StaleElementReferenceExceptions and obscure dynamic wait logic",
          "PageFactory was removed from the Java language",
          "PageFactory only works on Windows 95",
          "PageFactory requires a database connection"
        ],
        correctAnswer: 0,
        explanation: "PageFactory's \`@FindBy\` proxies cause unpredictable stale references and complicate explicit dynamic waiting."
      },
      {
        id: "Q-AUT-005-07",
        text: "What principle does Page Object Model promote when a developer changes a button's selector in the application?",
        options: [
          "DRY (Don't Repeat Yourself): The selector is updated in exactly ONE Page Object class, and all 50 dependent tests instantly work",
          "Rewriting all test cases from scratch",
          "Deleting the feature from production",
          "Converting the test suite into manual steps"
        ],
        correctAnswer: 0,
        explanation: "Centralizing selectors in page objects eliminates duplication, ensuring UI changes require updates in only one file."
      },
      {
        id: "Q-AUT-005-08",
        text: "In a BaseTest class, what setup and teardown responsibilities are typically encapsulated?",
        options: [
          "WebDriver instantiation, configuration loading, timeout setups, and driver session teardown (@AfterEach)",
          "Writing the company privacy policy",
          "Deploying the backend server to production",
          "Sending promotional marketing emails"
        ],
        correctAnswer: 0,
        explanation: "BaseTest standardizes driver lifecycle, environment variable resolution, and cleanup across all test classes."
      },
      {
        id: "Q-AUT-005-09",
        text: "What access modifier should be applied to By locators inside a Page Object class to enforce encapsulation?",
        options: ["public", "private (or protected)", "global", "transient"],
        correctAnswer: 1,
        explanation: "Locators should be private (or protected for inheritance) so outside test classes cannot access raw selectors directly."
      },
      {
        id: "Q-AUT-005-10",
        text: "How should dynamic elements (such as an item in a list identified by its text) be handled in a Page Object?",
        options: [
          "Create a parameterized helper method: By getItemByName(String name) { return By.xpath(\"//li[text()='\" + name + \"']\"); }",
          "Hardcode 100 individual locators for every possible item",
          "Do not test lists",
          "Force developers to use only one item in production"
        ],
        correctAnswer: 0,
        explanation: "Dynamic helper methods generate parameterized By locators at runtime based on input data."
      }
    ]
  },
  {
    id: "ASM-AUT-006",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-006",
    title: "Assessment: Test Runners & Assertion Frameworks",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-006-01",
        text: "In JUnit 5, what annotation executes once before all tests in a test class, requiring a static method signature?",
        options: ["@BeforeEach", "@BeforeAll", "@BeforeSuite", "@Setup"],
        correctAnswer: 1,
        explanation: "'@BeforeAll' runs once per class before any '@Test' method executes, requiring static scope by default."
      },
      {
        id: "Q-AUT-006-02",
        text: "What happens when a Hard Assertion (e.g. assertEquals) fails in a test method?",
        options: [
          "Test execution terminates immediately at that line; subsequent assertions in the method are skipped",
          "The test continues executing and ignores the error",
          "The browser is automatically uninstalled",
          "The assertion turns into a comment"
        ],
        correctAnswer: 0,
        explanation: "Hard assertions throw an AssertionError immediately upon failure, halting the remaining checks in that test."
      },
      {
        id: "Q-AUT-006-03",
        text: "What feature in JUnit 5 enables evaluating multiple assertions simultaneously so all failures are reported together?",
        options: ["assertAll()", "assertGroup()", "assertBatch()", "assertCollect()"],
        correctAnswer: 0,
        explanation: "'assertAll()' (soft assertions) executes all supplied executable lambdas and aggregates all failure messages."
      },
      {
        id: "Q-AUT-006-04",
        text: "What annotation is used in JUnit 5 to define a data-driven test that accepts parameters from a data source?",
        options: ["@ParameterizedTest", "@DataTest", "@RepeatTest", "@DynamicTest"],
        correctAnswer: 0,
        explanation: "'@ParameterizedTest' indicates that a test method should be executed multiple times with different parameter arguments."
      },
      {
        id: "Q-AUT-006-05",
        text: "When executing Selenium tests in parallel across multiple threads, how must the WebDriver instance be managed to prevent cross-thread interference?",
        options: [
          "Using a ThreadLocal<WebDriver> wrapper container",
          "Using a single global static WebDriver variable",
          "Disabling all assertions",
          "Running tests only on single-core CPUs"
        ],
        correctAnswer: 0,
        explanation: "ThreadLocal assigns an isolated WebDriver instance to each thread, preventing concurrent tests from colliding."
      },
      {
        id: "Q-AUT-006-06",
        text: "Which parameter source provider in JUnit 5 allows reading test records directly from an inline CSV string table?",
        options: ["@CsvSource", "@ValueSource", "@MethodSource", "@FileSource"],
        correctAnswer: 0,
        explanation: "'@CsvSource' allows declaring arrays of comma-delimited strings to inject into parameterized test methods."
      },
      {
        id: "Q-AUT-006-07",
        text: "In TestNG, what attribute on the '@Test' annotation is used to link a test method to a dynamic data supplier?",
        options: ["dataProvider", "dataSource", "parameters", "source"],
        correctAnswer: 0,
        explanation: "The 'dataProvider' attribute links a TestNG test method to a designated \`@DataProvider\` method returning a 2D Object array."
      },
      {
        id: "Q-AUT-006-08",
        text: "What is the primary role of a Test Execution Listener in enterprise frameworks (e.g. TestWatcher / ITestListener)?",
        options: [
          "Hooking into test lifecycle events to capture screenshots on failure, log timings, and report results to dashboard tools like Allure",
          "Listening to audio microphone input during tests",
          "Translating test code into machine bytecode",
          "Deleting failed test files automatically"
        ],
        correctAnswer: 0,
        explanation: "Listeners capture lifecycle events (onTestFailure, onTestSuccess) to automate artifact logging, screenshots, and reporting."
      },
      {
        id: "Q-AUT-006-09",
        text: "What JUnit 5 annotation temporarily disables a test method from executing during a build without deleting the code?",
        options: ["@Disabled", "@Ignore", "@Skip", "@Bypass"],
        correctAnswer: 0,
        explanation: "'@Disabled' in JUnit 5 (equivalent to '@Ignore' in JUnit 4) skips test execution while preserving documentation."
      },
      {
        id: "Q-AUT-006-10",
        text: "What is the benefit of grouping tests with tags using '@Tag(\"smoke\")' in JUnit 5?",
        options: [
          "It allows running targeted subsets of tests (e.g. only Smoke tests on Pull Requests, and Full Regression nightly) via build tools",
          "It makes tests run in alphabetical order",
          "It changes the color of the browser window",
          "It bypasses authentication requirements"
        ],
        correctAnswer: 0,
        explanation: "Tags allow build tools (Maven/Gradle) to filter and execute specific subsets of suites based on pipeline triggers."
      }
    ]
  },
  {
    id: "ASM-AUT-007",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-007",
    title: "Assessment: Advanced Browser Automation & Gestures",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-007-01",
        text: "Which Selenium API is used to execute advanced user interactions like mouse hover, drag-and-drop, and keyboard chords?",
        options: ["Actions API", "Alert API", "Window API", "Navigation API"],
        correctAnswer: 0,
        explanation: "The Actions API simulates complex user input gestures according to W3C input specifications."
      },
      {
        id: "Q-AUT-007-02",
        text: "What method must be called at the end of an Actions sequence in Selenium to trigger execution of the queued gestures?",
        options: [".perform()", ".execute()", ".run()", ".start()"],
        correctAnswer: 0,
        explanation: "Actions sequences build a composite gesture chain that is only sent to the browser when '.perform()' is called."
      },
      {
        id: "Q-AUT-007-03",
        text: "How do you switch WebDriver context into an embedded '<iframe>' element on a webpage?",
        options: [
          "driver.switchTo().frame(frameElement)",
          "driver.openFrame(frameElement)",
          "driver.navigate().frame(frameElement)",
          "driver.manage().frame(frameElement)"
        ],
        correctAnswer: 0,
        explanation: "'driver.switchTo().frame()' switches the active target context to the specified iframe element or index."
      },
      {
        id: "Q-AUT-007-04",
        text: "After finishing operations inside an iframe, what command returns WebDriver focus to the main top-level webpage document?",
        options: [
          "driver.switchTo().defaultContent()",
          "driver.switchTo().parentFrame()",
          "driver.navigate().back()",
          "driver.close()"
        ],
        correctAnswer: 0,
        explanation: "'driver.switchTo().defaultContent()' returns the execution context to the top-level browsing context."
      },
      {
        id: "Q-AUT-007-05",
        text: "Why does standard 'driver.findElement()' fail when attempting to locate an element residing inside a Shadow Root?",
        options: [
          "Shadow DOM creates encapsulated subtrees that are detached from the standard document DOM tree",
          "Shadow DOM elements are always invisible",
          "Shadow DOM only exists in mobile apps",
          "Shadow DOM deletes HTML elements"
        ],
        correctAnswer: 0,
        explanation: "The Shadow DOM encapsulates internal markup, preventing standard document-level queries from reaching inside."
      },
      {
        id: "Q-AUT-007-06",
        text: "In Selenium 4, how do you query an element located inside an open Shadow DOM host?",
        options: [
          "SearchContext shadow = host.getShadowRoot(); shadow.findElement(By.cssSelector(\"...\"));",
          "driver.switchTo().shadowRoot()",
          "driver.findElement(By.shadow(\"...\"))",
          "Shadow DOM cannot be automated in Selenium"
        ],
        correctAnswer: 0,
        explanation: "Selenium 4 provides 'host.getShadowRoot()' returning a SearchContext scoped strictly to the shadow tree."
      },
      {
        id: "Q-AUT-007-07",
        text: "When a button click is intercepted by an opaque sticky header, what JavaScriptExecutor call can force a direct DOM click event?",
        options: [
          "js.executeScript(\"arguments[0].click();\", element);",
          "js.executeScript(\"element.press();\");",
          "js.executeScript(\"clickNow()\");",
          "js.executeScript(\"window.click()\");"
        ],
        correctAnswer: 0,
        explanation: "'arguments[0].click()' triggers the DOM element's click method directly, bypassing coordinate hit-testing."
      },
      {
        id: "Q-AUT-007-08",
        text: "How do you switch WebDriver control to a newly opened browser tab or popup window?",
        options: [
          "Iterate over 'driver.getWindowHandles()' and call 'driver.switchTo().window(newHandle)'",
          "driver.switchTo().nextTab()",
          "driver.navigate().newWindow()",
          "driver.manage().window().maximize()"
        ],
        correctAnswer: 0,
        explanation: "WebDriver tracks window handles in a Set; switching requires calling 'driver.switchTo().window(handle)'."
      },
      {
        id: "Q-AUT-007-09",
        text: "What JavaScript command smoothly scrolls an element into the vertical center of the browser viewport?",
        options: [
          "arguments[0].scrollIntoView({block: 'center'});",
          "window.scroll(100, 100);",
          "document.scrollDown();",
          "element.focus();"
        ],
        correctAnswer: 0,
        explanation: "'arguments[0].scrollIntoView({block: 'center'})' positions the target element directly into view."
      },
      {
        id: "Q-AUT-007-10",
        text: "How do you accept (click 'OK') on a native JavaScript confirmation alert dialog?",
        options: [
          "driver.switchTo().alert().accept()",
          "driver.findElement(By.id(\"alert\")).click()",
          "driver.closeAlert()",
          "driver.dismiss()"
        ],
        correctAnswer: 0,
        explanation: "'driver.switchTo().alert().accept()' accepts browser-native alerts, confirms, or prompt dialogs."
      }
    ]
  }
];

export const phase1 = {
  chapters: phase1Chapters,
  assessments: phase1Assessments
};

