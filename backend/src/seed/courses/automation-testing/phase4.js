export const phase4Chapters = [
  {
    id: "CH-AUT-020",
    courseId: "CRS-AUT-001",
    title: "Appium 2.0 Mobile Automation Architecture",
    order: 20,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Appium 2.0 Mobile Automation Architecture

### Learning Objectives
1. Understand Appium 2.0's modular, driver-agnostic architecture.
2. Install and configure drivers: \`uiautomator2\` for Android and \`xcuitest\` for iOS.
3. Configure W3C-compliant \`UiAutomator2Options\` and \`XCUITestOptions\`.
4. Inspect mobile layouts and extract locators using the Appium Inspector GUI.

---

### 1. The Appium 2.0 Architectural Paradigm

Appium 1.x was a monolithic distribution bundling all drivers and plugins together. **Appium 2.0** unbundles the server into an extensible ecosystem where drivers and plugins are managed independently via the Appium CLI.

\`\`\`
   [ Test Script ] (Java, Python, JS, C#)
          |
          | W3C Mobile WebDriver Protocol over HTTP
          v
   +---------------------------------------------+
   |             APPIUM 2.0 SERVER               |
   | Plugins: image, device-farm, execute-driver |
   +----------------------+----------------------+
                          |
             +------------+------------+
             |                         |
             v                         v
   +--------------------+    +--------------------+
   | uiautomator2-driver|    |   xcuitest-driver  |
   | (Android Platform) |    |   (iOS Platform)   |
   +---------+----------+    +---------+----------+
             |                         |
             v                         v
   [ Android UIAutomator]    [ iOS Apple XCTest ]
   [ Real Device/Emulator]   [ Real Device/Sim  ]
\`\`\`

---

### 2. Driver Installation & Appium Doctor

\`\`\`bash
# 1. Install Appium 2.0 globally
npm install -g appium

# 2. Install native platform drivers
appium driver install uiautomator2
appium driver install xcuitest

# 3. Verify complete environment prerequisites (Java, Android SDK, Xcode)
appium-doctor --android
appium-doctor --ios
\`\`\`

---

### 3. W3C Options Configuration in Java

In Appium 2.0, legacy \`DesiredCapabilities\` are deprecated in favor of type-safe platform Options classes:

\`\`\`java
package com.nalanda.mobile;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.net.URL;
import java.time.Duration;

public class AndroidAppTest {
    private AndroidDriver driver;

    @BeforeEach
    void setUp() throws Exception {
        UiAutomator2Options options = new UiAutomator2Options()
            .setPlatformName("Android")
            .setAutomationName("UiAutomator2")
            .setDeviceName("Pixel_7_API_34")
            .setApp(System.getProperty("user.dir") + "/apps/Nalanda-v2.1.apk")
            .setAppPackage("com.nalanda.learning")
            .setAppActivity(".ui.SplashActivity")
            .setAutoGrantPermissions(true)
            .setNewCommandTimeout(Duration.ofSeconds(60));

        driver = new AndroidDriver(new URL("http://127.0.0.1:4723"), options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }

    @Test
    void testMobileLoginFlow() {
        driver.findElement(AppiumBy.accessibilityId("LoginButton")).click();
        driver.findElement(AppiumBy.id("com.nalanda.learning:id/email")).sendKeys("alex@nalanda.org");
    }
}
\`\`\`

---

### 4. Hands-on Lab: Appium Inspector Setup
1. Launch Appium Server: \`appium\`.
2. Connect Appium Inspector with JSON capability payload.
3. Inspect native mobile hierarchy and identify elements using \`AppiumBy.accessibilityId\` (Content-Description / Accessibility Label).`
  },
  {
    id: "CH-AUT-021",
    courseId: "CRS-AUT-001",
    title: "Mobile Gestures, TouchActions & Device Emulation",
    order: 21,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=2_lqwGgU8eU",
    content: `# Mobile Gestures, TouchActions & Device Emulation

### Learning Objectives
1. Implement complex mobile touch gestures using the W3C \`PointerInput\` and \`Sequence\` APIs.
2. Automate vertical and horizontal scrolling, swiping, and pinch-to-zoom gestures.
3. Execute device hardware simulations: screen rotation, airplane mode, push notifications, and backgrounding.
4. Interact with hybrid mobile web views and context switching (Native vs. WebView).

---

### 1. W3C Pointer Gestures in Appium 2.0

Legacy Appium \`TouchAction\` was deprecated. Modern mobile automation relies exclusively on W3C compliant pointer input sequences:

\`\`\`java
package com.nalanda.mobile;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;
import java.time.Duration;
import java.util.List;

public class MobileGestures {

    public static void swipeVertical(AppiumDriver driver, int startX, int startY, int endY) {
        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1);

        // 1. Move finger to starting coordinate
        swipe.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), startX, startY));
        // 2. Press down onto screen
        swipe.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
        // 3. Smooth drag motion over 600ms
        swipe.addAction(finger.createPointerMove(Duration.ofMillis(600), PointerInput.Origin.viewport(), startX, endY));
        // 4. Lift finger off screen
        swipe.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

        driver.perform(List.of(swipe));
    }
}
\`\`\`

---

### 2. Context Switching in Hybrid Apps

Hybrid apps embed WebViews (Chrome/Safari rendering engines) inside native application shells. Interacting with web elements requires switching contexts:

\`\`\`java
// 1. Inspect available contexts
Set<String> contexts = driver.getContextHandles();
// Output: [NATIVE_APP, WEBVIEW_com.nalanda.learning]

// 2. Switch to WebView context to use standard CSS/DOM locators
driver.context("WEBVIEW_com.nalanda.learning");
driver.findElement(By.cssSelector("button.web-checkout")).click();

// 3. Switch back to native OS context for biometric prompt
driver.context("NATIVE_APP");
driver.findElement(AppiumBy.accessibilityId("BiometricConfirm")).click();
\`\`\`

---

### 3. Device Hardware & Interruption Automation

\`\`\`java
// 1. Rotate device between Portrait and Landscape
driver.rotate(ScreenOrientation.LANDSCAPE);

// 2. Send app to background for 5 seconds and resume
driver.runAppInBackground(Duration.ofSeconds(5));

// 3. Emulate device locking & unlocking
driver.lockDevice();
driver.unlockDevice();

// 4. Toggle device network connectivity (Airplane mode, Wi-Fi)
driver.setConnection(new ConnectionStateBuilder().withWiFiDisabled().build());
\`\`\`

---

### 4. Hands-on Lab: Infinite Scroll & Pinch Lab
1. Build a helper method that scrolls down until a designated target item is visible.
2. Write a test that switches contexts to a checkout WebView.
3. Automate a 2-finger pinch-to-zoom gesture on a map component.`
  },
  {
    id: "CH-AUT-022",
    courseId: "CRS-AUT-001",
    title: "BDD with Cucumber & Gherkin: Step Definitions & Hooks",
    order: 22,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# BDD with Cucumber & Gherkin: Step Definitions & Hooks

### Learning Objectives
1. Implement Behavior-Driven Development (BDD) frameworks with Cucumber (Java) and Playwright/Selenium.
2. Author executable Gherkin feature files with Scenario Outlines and Data Tables.
3. Map Gherkin steps to typed Step Definitions with regular expressions and Cucumber Expressions.
4. Manage shared state and dependency injection across steps using PicoContainer.
5. Configure Cucumber Hooks (\`@Before\`, \`@After\`) for automated failure screenshot capture.

---

### 1. BDD Architecture with Cucumber

Cucumber bridges the communication gap between business analysts, developers, and QA by turning human-readable acceptance criteria into automated test suites.

\`\`\`
   +-------------------------------------------------------------+
   |                GHERKIN FEATURE SPECIFICATION                |
   |  Scenario: User enrolls in course with promo code           |
   |    Given the learner is authenticated                       |
   |    When they apply coupon code "LEARN2026"                  |
   |    Then the discount of 20% should be applied               |
   +------------------------------+------------------------------+
                                  |
                                  | Cucumber Runner matches text
                                  v
   +-------------------------------------------------------------+
   |                    STEP DEFINITIONS LAYER                   |
   |  @Given("the learner is authenticated")                     |
   |  public void learnerIsAuthenticated() { ... }               |
   +------------------------------+------------------------------+
                                  |
                                  | Invokes Page Objects
                                  v
   +-------------------------------------------------------------+
   |                 PAGE OBJECT / AUTOMATION CORE               |
   |  CartPage.applyCoupon("LEARN2026");                         |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Gherkin Feature Files: Scenario Outlines & Tables

\`\`\`gherkin
Feature: Enterprise Checkout & Currency Conversion
  As an international student
  I want course prices displayed in my local currency
  So that I understand my payment obligations

  Background:
    Given the Nalanda LMS catalog service is online
    And the user selects country "Germany"

  Scenario Outline: Checkout price calculation with VAT
    When the user adds course "<courseId>" priced at <usdPrice> USD
    Then the checkout cart should calculate EUR price as <expectedEur>
    And the VAT rate should display "<vatRate>"

    Examples:
      | courseId    | usdPrice | expectedEur | vatRate |
      | CRS-AUT-001 | 100.00   | 92.50       | 19%     |
      | CRS-DSC-001 | 200.00   | 185.00      | 19%     |
      | CRS-JFS-001 | 250.00   | 231.25      | 19%     |
\`\`\`

---

### 3. Step Definition Implementation with PicoContainer

State should never be stored in global static variables across steps. **PicoContainer** injects shared state instances cleanly into step definition constructors:

\`\`\`java
package com.nalanda.steps;

import io.cucumber.java.en.*;
import io.cucumber.java.Before;
import io.cucumber.java.After;
import io.cucumber.java.Scenario;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;

public class CheckoutStepDefinitions {
    private final TestContext context; // Injected via PicoContainer

    public CheckoutStepDefinitions(TestContext context) {
        this.context = context;
    }

    @When("the user adds course {string} priced at {double} USD")
    public void userAddsCourse(String courseId, Double usdPrice) {
        context.getCartPage().addCourseToCart(courseId);
        context.setOriginalUsdPrice(usdPrice);
    }

    @Then("the checkout cart should calculate EUR price as {double}")
    public void verifyEurPrice(Double expectedEur) {
        double actualEur = context.getCartPage().getCartTotalEur();
        assertEquals(expectedEur, actualEur, 0.01);
    }

    @After
    public void tearDown(Scenario scenario) {
        if (scenario.isFailed()) {
            byte[] screenshot = ((TakesScreenshot) context.getDriver()).getScreenshotAs(OutputType.BYTES);
            scenario.attach(screenshot, "image/png", "Failure Screenshot");
        }
        context.getDriver().quit();
    }
}
\`\`\`

---

### 4. Hands-on Lab: BDD Suite Construction
1. Author a feature file with 3 scenarios using Data Tables.
2. Implement corresponding Step Definitions.
3. Configure \`@CucumberOptions\` to emit JSON and HTML test reports.`
  },
  {
    id: "CH-AUT-023",
    courseId: "CRS-AUT-001",
    title: "Parallel Execution, Selenium Grid 4 & Dockerized Scaling",
    order: 23,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=scEDHsr3APg",
    content: `# Parallel Execution, Selenium Grid 4 & Dockerized Scaling

### Learning Objectives
1. Understand the architecture of Selenium Grid 4: Router, Distributor, Session Queue, Session Map, and Node.
2. Deploy a distributed Selenium Grid using Docker Compose.
3. Configure RemoteWebDriver client connections with dynamic browser capabilities.
4. Scale browser containers dynamically to execute 50+ concurrent tests in CI/CD.

---

### 1. Selenium Grid 4 Distributed Architecture

Selenium Grid 4 overhauled its predecessor's architecture, decomposing the Hub into microservices that scale horizontally in cloud environments:

\`\`\`
   [ Test Clients (Parallel Runners) ]
                   |
                   v
   +---------------------------------------------+
   |                   ROUTER                    |
   +---------------------+-----------------------+
                         |
           +-------------+-------------+
           |                           |
           v                           v
   +---------------+           +---------------+
   | DISTRIBUTOR   |<=========>| SESSION QUEUE |
   +-------+-------+           +---------------+
           |
     +-----+-----+
     |           |
     v           v
   +-------+   +-------+
   | NODE  |   | NODE  |   (Chrome / Firefox / Edge Docker Containers)
   | Chrome|   |Firefox|
   +-------+   +-------+
\`\`\`

---

### 2. Docker Compose Deployment for Grid 4

\`\`\`yaml
version: "3"
services:
  selenium-hub:
    image: selenium/hub:4.20.0
    container_name: selenium-hub
    ports:
      - "4442:4442"
      - "4443:4443"
      - "4444:4444"

  chrome-node:
    image: selenium/node-chrome:4.20.0
    shm_size: 2gb # Vital: prevents Chrome memory crashes
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_NODE_MAX_SESSIONS=4

  firefox-node:
    image: selenium/node-firefox:4.20.0
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_NODE_MAX_SESSIONS=4
\`\`\`

---

### 3. RemoteWebDriver Client Configuration

\`\`\`java
package com.nalanda.grid;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import java.net.URL;

public class GridDriverFactory {

    public static WebDriver createRemoteDriver(String browser) throws Exception {
        URL gridUrl = new URL("http://localhost:4444/wd/hub");

        if ("firefox".equalsIgnoreCase(browser)) {
            FirefoxOptions options = new FirefoxOptions();
            return new RemoteWebDriver(gridUrl, options);
        } else {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless=new");
            return new RemoteWebDriver(gridUrl, options);
        }
    }
}
\`\`\`

---

### 4. Hands-on Lab: Grid Scaling Challenge
1. Launch the Selenium Grid via \`docker compose up -d\`.
2. Access the Grid Web Dashboard at \`http://localhost:4444\`.
3. Scale Chrome nodes to 8 instances: \`docker compose up --scale chrome-node=8 -d\`.
4. Run a 30-test suite in parallel and observe concurrent execution across nodes.`
  },
  {
    id: "CH-AUT-024",
    courseId: "CRS-AUT-001",
    title: "Performance & Load Testing with k6: Developer-Centric Load",
    order: 24,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=J8w_3oKxV1E",
    content: `# Performance & Load Testing with k6: Developer-Centric Load

### Learning Objectives
1. Understand modern load testing principles: Virtual Users (VUs), Throughput (RPS), Latency (P90/P95/P99), and Error Rates.
2. Author load testing scripts in modern JavaScript with Grafana k6.
3. Configure multi-stage traffic patterns (Ramp-up, Soak, Spike, Stress).
4. Define automated Performance Quality Gates using k6 Thresholds.
5. Stream performance metrics to Grafana dashboards and CI pipelines.

---

### 1. Modern Load Testing with Grafana k6

Legacy load testing tools (like JMeter) rely on heavy Java GUIs, XML files, and high memory footprints.
**Grafana k6** is a developer-centric, high-performance load testing tool written in Go:
- Scripts are authored in clean ES6 JavaScript.
- Minimal CPU/RAM overhead: 1 k6 instance can simulate 30,000+ Virtual Users.
- Native integration with Git, CI/CD, and Grafana / InfluxDB.

\`\`\`
   +-------------------------------------------------------------+
   |                    LOAD PROFILE STAGES                      |
   +-------------------------------------------------------------+
   | VUs                                                         |
   | 500 |                  /==============\\                     |
   |     |                 / (Target Load)  \\                    |
   | 250 |        /=======\\                  \\                   |
   |     |       / (Ramp)                     \\ (Cool down)      |
   |   0 +------+---------+--------------------+----------------+
   |     0m     2m        5m                  10m              12m
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Authoring a k6 Load Spec with Thresholds

\`\`\`javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Test Configuration: Traffic stages & SLO Quality Gates
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp-up to 50 VUs
    { duration: '3m', target: 50 },  // Steady state load
    { duration: '1m', target: 150 }, // Spike to 150 VUs
    { duration: '2m', target: 0 },   // Ramp-down to 0
  ],
  thresholds: {
    // 95% of requests must complete below 400ms
    http_req_duration: ['p(95)<400'],
    // Error rate must remain under 1%
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const headers = { 'Content-Type': 'application/json' };
  const payload = JSON.stringify({
    courseId: 'CRS-AUT-001',
    timestamp: Date.now()
  });

  // Make HTTP request
  const res = http.post('https://api.nalanda.learning/api/v2/catalog/view', payload, { headers });

  // Assertions
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // User think time between actions (1 second)
  sleep(1);
}
\`\`\`

---

### 3. Evaluating k6 CLI Output

\`\`\`
     ✓ status is 200
     ✓ response time < 500ms

     checks.........................: 100.00% ✓ 48200      ✗ 0
     http_req_duration..............: avg=182ms min=42ms med=160ms max=720ms p(90)=240ms p(95)=310ms
     http_req_failed................: 0.00%   ✓ 0          ✗ 48200
     iterations.....................: 48200   107.11/s
     vus............................: 1       min=1        max=150
\`\`\`

---

### 4. Hands-on Lab: CI Performance Gate
1. Install k6 CLI.
2. Execute a 100-VU stress test against a test endpoint.
3. Configure a strict threshold (\`p(99)<300\`) and observe k6 exit with code 99 when the SLO is breached.`
  },
  {
    id: "CH-AUT-025",
    courseId: "CRS-AUT-001",
    title: "Enterprise Performance Engineering with Apache JMeter",
    order: 25,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F_fP1Q9bO8M",
    content: `# Enterprise Performance Engineering with Apache JMeter

### Learning Objectives
1. Master Apache JMeter core test components: Thread Groups, Samplers, Timers, and Listeners.
2. Parameterize high-scale load tests using CSV Data Set Config.
3. Extract dynamic session tokens with Regular Expression & JSON Extractors.
4. Execute JMeter headlessly in Non-GUI mode (\`-n -t\`) and generate interactive HTML Dashboard reports.
5. Architect distributed load testing across Master-Worker controller nodes.

---

### 1. JMeter Test Plan Architecture

Apache JMeter is the industry-standard enterprise load testing tool across Java ecosystems:

\`\`\`
   +-------------------------------------------------------------+
   |                     TEST PLAN CONTAINER                     |
   +-------------------------------------------------------------+
   | Thread Group (Simulates 1,000 concurrent user threads)      |
   |                                                             |
   |   [ Config ]       CSV Data Set Config (User credentials)   |
   |   [ PreProcessor ] User Parameter / Script                  |
   |   [ Timer ]        Gaussian Random Timer (User Think Time)  |
   |                                                             |
   |   [ Sampler 1 ]    HTTP Request: POST /api/auth/login       |
   |     [ PostProc ]   JSON Extractor: saves token as \${jwt}    |
   |     [ Assertion ]  Response Assertion: Status Code = 200    |
   |                                                             |
   |   [ Sampler 2 ]    HTTP Request: GET /api/user/dashboard    |
   |     [ Header ]     HeaderManager: Authorization: \${jwt}     |
   |                                                             |
   |   [ Listener ]     Generate Summary Results / View Results  |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Parameterization & Token Correlation

Enterprise applications require dynamic token correlation (extracting tokens from response A and passing to request B):

- **JSON Extractor**:
  - Variable Name: \`BEARER_TOKEN\`
  - JSON Path: \`$.access_token\`
  - Match No: \`1\`
- **HTTP Header Manager**:
  - Name: \`Authorization\`
  - Value: \`Bearer \${BEARER_TOKEN}\`

---

### 3. Non-GUI Execution & Automated HTML Dashboard

Running JMeter in GUI mode during actual load tests consumes extreme CPU/RAM and corrupts performance results. **Always execute in Non-GUI mode**:

\`\`\`bash
# Execute JMeter test headlessly and export HTML dashboard
jmeter -n -t ./tests/LMS_Stress_Test.jmx \
  -l ./results/run_output.jtl \
  -e -o ./reports/html_dashboard \
  -Jthreads=500 \
  -Jrampup=60
\`\`\`

#### Generated HTML Dashboard Metrics:
- **APDEX (Application Performance Index)**: User satisfaction score (Satisfied, Tolerating, Frustrated).
- **Over Time Graphs**: Active Threads over time, Response Times over time, Latency vs Throughput.
- **Errors Breakdown**: Distribution of HTTP 5xx codes vs Timeout failures.

---

### 4. Hands-on Lab: Distributed JMeter Cluster
1. Configure a CSV Data Set Config with 500 mock user credentials.
2. Build a correlation flow between login and order placement.
3. Run headlessly for 5 minutes and analyze the APDEX score in the exported HTML report.`
  }
];

export const phase4Assessments = [
  {
    id: "ASM-AUT-020",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-020",
    title: "Assessment: Appium 2.0 Mobile Architecture",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-020-01",
        text: "What is the primary architectural difference between Appium 1.x and Appium 2.0?",
        options: [
          "Appium 2.0 unbundles the server into a lightweight core, allowing drivers (UiAutomator2, XCUITest) and plugins to be installed independently",
          "Appium 2.0 only supports desktop computers",
          "Appium 2.0 removed iOS testing support",
          "Appium 2.0 was rewritten in PHP"
        ],
        correctAnswer: 0,
        explanation: "Appium 2.0 is completely modular; drivers and plugins are managed independently via the Appium CLI."
      },
      {
        id: "Q-AUT-020-02",
        text: "Which driver must be installed in Appium 2.0 to automate native Android mobile applications?",
        options: ["uiautomator2", "xcuitest", "geckodriver", "espresso-core"],
        correctAnswer: 0,
        explanation: "The 'uiautomator2' driver is the standard Appium driver for automating Android 6.0+ devices."
      },
      {
        id: "Q-AUT-020-03",
        text: "Which driver is used by Appium to automate iOS and iPadOS applications?",
        options: ["xcuitest", "uiautomator2", "safaridriver", "mac2"],
        correctAnswer: 0,
        explanation: "The 'xcuitest' driver leverages Apple's XCUITest framework to automate iOS applications."
      },
      {
        id: "Q-AUT-020-04",
        text: "In Appium 2.0 Java bindings, what class replaces legacy DesiredCapabilities for configuring Android sessions?",
        options: ["UiAutomator2Options", "AndroidCapabilities", "DeviceConfig", "MobileSettings"],
        correctAnswer: 0,
        explanation: "Appium 2.0 introduces type-safe options classes (UiAutomator2Options) compliant with W3C specs."
      },
      {
        id: "Q-AUT-020-05",
        text: "What tool in the Appium ecosystem provides a graphical inspector to inspect mobile app hierarchies and identify locators?",
        options: ["Appium Inspector", "Postman", "Chrome DevTools", "Wireshark"],
        correctAnswer: 0,
        explanation: "Appium Inspector is the official desktop GUI app for inspecting native mobile UI element hierarchies."
      },
      {
        id: "Q-AUT-020-06",
        text: "What locator strategy is most recommended for mobile accessibility and cross-platform stability in Appium?",
        options: [
          "AppiumBy.accessibilityId",
          "AppiumBy.xpath (deep absolute paths)",
          "AppiumBy.className",
          "AppiumBy.tagName"
        ],
        correctAnswer: 0,
        explanation: "'accessibilityId' maps to Android content-description and iOS accessibility label, providing cross-platform stability."
      },
      {
        id: "Q-AUT-020-07",
        text: "What CLI utility diagnoses and verifies missing mobile dependencies (Android SDK, Xcode, JAVA_HOME)?",
        options: ["appium-doctor", "appium-check", "mobile-verify", "sdk-diagnose"],
        correctAnswer: 0,
        explanation: "Appium Doctor audits system environment configurations to verify mobile testing prerequisites."
      },
      {
        id: "Q-AUT-020-08",
        text: "What capability option in UiAutomator2Options automatically grants Android runtime permissions (camera, location) upon install?",
        options: [
          "options.setAutoGrantPermissions(true)",
          "options.allowAll()",
          "options.bypassPermissions()",
          "options.grantAllRights()"
        ],
        correctAnswer: 0,
        explanation: "setAutoGrantPermissions(true) suppresses Android runtime permission dialogs during test execution."
      },
      {
        id: "Q-AUT-020-09",
        text: "What default port does the Appium 2.0 server listen on for client commands?",
        options: ["4723", "4444", "8080", "3000"],
        correctAnswer: 0,
        explanation: "Appium's standard default server port is 4723."
      },
      {
        id: "Q-AUT-020-10",
        text: "What underlying Apple test framework powers Appium's iOS automation under the hood?",
        options: ["XCTest / XCUITest", "UIAutomation (legacy)", "KIF", "EarlGrey"],
        correctAnswer: 0,
        explanation: "Apple's native XCUITest framework drives all modern iOS UI automation."
      }
    ]
  },
  {
    id: "ASM-AUT-021",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-021",
    title: "Assessment: Mobile Gestures & Device Emulation",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-021-01",
        text: "What standard API has replaced legacy TouchAction for automating mobile gestures in modern Appium?",
        options: ["W3C Actions / PointerInput API", "JavaScript prompt", "Direct ADB shell commands only", "Android Event API"],
        correctAnswer: 0,
        explanation: "W3C PointerInput and Sequence APIs are the standard cross-platform gesture implementation."
      },
      {
        id: "Q-AUT-021-02",
        text: "In a mobile hybrid application, what method is used to switch automation focus from the native shell to an embedded web view?",
        options: [
          "driver.context('WEBVIEW_<package_name>')",
          "driver.switchTo().frame()",
          "driver.navigate().web()",
          "driver.openBrowser()"
        ],
        correctAnswer: 0,
        explanation: "'driver.context()' switches execution between NATIVE_APP and active WEBVIEW contexts."
      },
      {
        id: "Q-AUT-021-03",
        text: "How do you simulate sending a mobile app to the background for 5 seconds and automatically resuming it?",
        options: [
          "driver.runAppInBackground(Duration.ofSeconds(5))",
          "driver.sleep(5000)",
          "driver.minimize()",
          "driver.closeApp()"
        ],
        correctAnswer: 0,
        explanation: "'runAppInBackground(duration)' suspends the app to the background and restores it after the duration."
      },
      {
        id: "Q-AUT-021-04",
        text: "What method rotates the mobile device between Portrait and Landscape orientations?",
        options: [
          "driver.rotate(ScreenOrientation.LANDSCAPE)",
          "driver.setOrientation('horizontal')",
          "driver.flip()",
          "driver.turn()"
        ],
        correctAnswer: 0,
        explanation: "'driver.rotate(ScreenOrientation)' changes physical device orientation."
      },
      {
        id: "Q-AUT-021-05",
        text: "What sequence of pointer actions comprises a vertical swipe gesture?",
        options: [
          "PointerMove(start) -> PointerDown -> PointerMove(end) -> PointerUp",
          "PointerDown -> Click -> PointerUp",
          "PointerMove -> DoubleClick",
          "PointerUp -> PointerDown"
        ],
        correctAnswer: 0,
        explanation: "Swiping moves to start coordinates, presses down, drags to end coordinates over time, and lifts."
      },
      {
        id: "Q-AUT-021-06",
        text: "How do you emulate locking and unlocking a mobile test phone in Appium?",
        options: [
          "driver.lockDevice() and driver.unlockDevice()",
          "driver.powerOff()",
          "driver.shutdown()",
          "driver.sleepScreen()"
        ],
        correctAnswer: 0,
        explanation: "'lockDevice()' and 'unlockDevice()' test device standby and lock-screen behaviors."
      },
      {
        id: "Q-AUT-021-07",
        text: "What Appium method retrieves the list of all available contexts (Native and WebViews)?",
        options: ["driver.getContextHandles()", "driver.listContexts()", "driver.getContexts()", "driver.getWebViews()"],
        correctAnswer: 0,
        explanation: "'getContextHandles()' returns the set of all active application contexts."
      },
      {
        id: "Q-AUT-021-08",
        text: "What gesture requires coordinating two independent PointerInput touch sequences simultaneously?",
        options: ["Pinch-to-zoom / Spread gesture", "Single tap", "Long press", "Flick"],
        correctAnswer: 0,
        explanation: "Pinch-to-zoom coordinates two concurrent finger pointer sequences moving in opposite directions."
      },
      {
        id: "Q-AUT-021-09",
        text: "Why is switching to WEBVIEW context advantageous when automating hybrid apps?",
        options: [
          "It allows SDETs to locate elements using standard web CSS Selectors and XPath rather than complex native accessibility trees",
          "It makes the phone battery last longer",
          "It prevents all network errors",
          "It bypasses the need for Appium"
        ],
        correctAnswer: 0,
        explanation: "In WEBVIEW context, testers can leverage familiar web CSS and DOM locators."
      },
      {
        id: "Q-AUT-021-10",
        text: "How can an SDET simulate airplane mode or toggling Wi-Fi connectivity in Appium Android?",
        options: [
          "driver.setConnection(new ConnectionStateBuilder().withAirplaneModeEnabled().build())",
          "driver.unplugWifi()",
          "driver.disableInternet()",
          "driver.toggleNetwork()"
        ],
        correctAnswer: 0,
        explanation: "'setConnection()' modifies network states including Airplane mode, Wi-Fi, and Mobile Data on Android."
      }
    ]
  },
  {
    id: "ASM-AUT-022",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-022",
    title: "Assessment: BDD with Cucumber & Gherkin",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-022-01",
        text: "What is the primary objective of Behavior-Driven Development (BDD)?",
        options: [
          "Bridging communication gaps between business stakeholders, developers, and QA through human-readable specifications",
          "Eliminating the need to write test code",
          "Writing all software in English without programming languages",
          "Replacing unit testing"
        ],
        correctAnswer: 0,
        explanation: "BDD fosters collaboration and shared understanding using clear, plain-language business specifications."
      },
      {
        id: "Q-AUT-022-02",
        text: "What structured Gherkin keyword is used to run the same scenario multiple times with diverse data sets defined in an 'Examples:' table?",
        options: ["Scenario Outline", "Scenario Batch", "Scenario Matrix", "Scenario Loop"],
        correctAnswer: 0,
        explanation: "'Scenario Outline' (or Scenario Template) parameterizes scenarios using data rows from an Examples table."
      },
      {
        id: "Q-AUT-022-03",
        text: "In Cucumber, what is the 'Background:' section used for in a feature file?",
        options: [
          "Defining common precondition steps that execute automatically before every scenario in that feature file",
          "Adding a background color to test reports",
          "Specifying the developer's biography",
          "Listing software licenses"
        ],
        correctAnswer: 0,
        explanation: "Background steps execute before every scenario in the feature file, eliminating repeated setup steps."
      },
      {
        id: "Q-AUT-022-04",
        text: "Why should test state and WebDriver instances NOT be stored in static variables across Cucumber step definitions?",
        options: [
          "Static state leads to test pollution and breaks parallel multi-threaded test execution",
          "Static variables are illegal in Java",
          "Static variables delete browser cookies",
          "Cucumber cannot compile static variables"
        ],
        correctAnswer: 0,
        explanation: "Static variables are shared across threads, causing race conditions and cross-test contamination."
      },
      {
        id: "Q-AUT-022-05",
        text: "What dependency injection library is commonly used with Cucumber-JVM to share state cleanly across step definition classes?",
        options: ["PicoContainer", "Spring Boot", "Guice", "Dagger"],
        correctAnswer: 0,
        explanation: "PicoContainer is the lightweight, zero-configuration dependency injection container for Cucumber-JVM."
      },
      {
        id: "Q-AUT-022-06",
        text: "What Cucumber hook annotation executes automatically after each scenario to perform teardown and attach failure screenshots?",
        options: ["@After", "@Teardown", "@PostScenario", "@CleanUp"],
        correctAnswer: 0,
        explanation: "'@After' hooks run post-scenario, providing access to scenario status for failure screenshot capture."
      },
      {
        id: "Q-AUT-022-07",
        text: "In Gherkin Cucumber Expressions, what placeholder matches an integer parameter?",
        options: ["{int}", "{number}", "{integer}", "{digit}"],
        correctAnswer: 0,
        explanation: "{int} is the standard Cucumber Expression parameter type matching signed integer values."
      },
      {
        id: "Q-AUT-022-08",
        text: "How do you attach a PNG screenshot to an active Cucumber scenario report upon failure?",
        options: [
          "scenario.attach(screenshotBytes, 'image/png', 'Failure Screenshot')",
          "scenario.saveImage(screenshotBytes)",
          "scenario.print(screenshotBytes)",
          "scenario.logScreen()"
        ],
        correctAnswer: 0,
        explanation: "'scenario.attach()' embeds binary screenshots directly into HTML and JSON Cucumber reports."
      },
      {
        id: "Q-AUT-022-09",
        text: "What are Cucumber Tags (e.g. '@smoke', '@regression') used for?",
        options: [
          "Filtering which specific scenarios or features to execute during pipeline runs",
          "Styling the feature file text",
          "Naming the author of the test",
          "Setting the browser resolution"
        ],
        correctAnswer: 0,
        explanation: "Tags organize scenarios into execution groups (e.g. running only '@smoke' tests in quick PR checks)."
      },
      {
        id: "Q-AUT-022-10",
        text: "What is a 'Data Table' in Gherkin?",
        options: [
          "An inline table passed directly to a single step to supply complex structured objects or lists",
          "A database table in SQL",
          "An Excel spreadsheet on the desktop",
          "A list of test failures"
        ],
        correctAnswer: 0,
        explanation: "Data tables pass tabular lists or key-value structures into an individual step definition."
      }
    ]
  },
  {
    id: "ASM-AUT-023",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-023",
    title: "Assessment: Parallel Execution & Selenium Grid 4",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-023-01",
        text: "What core component in Selenium Grid 4 routes incoming client requests to the Distributor and Node sessions?",
        options: ["Router", "Distributor", "Session Map", "Event Bus"],
        correctAnswer: 0,
        explanation: "The Router is the front-facing entry point of Selenium Grid 4, routing calls to appropriate internal services."
      },
      {
        id: "Q-AUT-023-02",
        text: "What Linux shared memory setting (/dev/shm) is vital when running Chrome browser containers in Docker to prevent crashes?",
        options: ["shm_size: 2gb (or ipc: host)", "shm_size: 1mb", "ram_disk: 0", "memory: minimal"],
        correctAnswer: 0,
        explanation: "Chrome heavily utilizes /dev/shm; Docker's default 64MB triggers crashes unless expanded (e.g. 2GB)."
      },
      {
        id: "Q-AUT-023-03",
        text: "What Selenium class is used by test scripts to connect to a remote Selenium Grid Hub instead of a local driver binary?",
        options: ["RemoteWebDriver", "GridDriver", "CloudDriver", "NetworkWebDriver"],
        correctAnswer: 0,
        explanation: "'RemoteWebDriver' connects to a remote Grid endpoint URL carrying designated browser capabilities."
      },
      {
        id: "Q-AUT-023-04",
        text: "What command in Docker Compose scales the number of Chrome browser nodes dynamically to 5 instances?",
        options: [
          "docker compose up --scale chrome-node=5 -d",
          "docker scale chrome=5",
          "docker compose expand 5",
          "docker replicate 5"
        ],
        correctAnswer: 0,
        explanation: "'--scale <service>=<count>' dynamically scales container instances in Docker Compose."
      },
      {
        id: "Q-AUT-023-05",
        text: "What component in Selenium Grid 4 maintains the real-time mapping between active Session IDs and their hosting Nodes?",
        options: ["Session Map", "Session Queue", "Distributor", "Router"],
        correctAnswer: 0,
        explanation: "The Session Map stores URI locations of active nodes mapped to active WebDriver session IDs."
      },
      {
        id: "Q-AUT-023-06",
        text: "What is the primary benefit of running browser automation on a distributed containerized grid?",
        options: [
          "Massive parallel execution reduces regression suite duration from hours to minutes while providing clean isolated environments",
          "It eliminates the need for test assertions",
          "It makes browser windows visible to everyone in the office",
          "It prevents developers from modifying code"
        ],
        correctAnswer: 0,
        explanation: "Distributed grid execution slashes build times by executing dozens of tests concurrently in pristine containers."
      },
      {
        id: "Q-AUT-023-07",
        text: "What web console port allows viewing the live visual status of Selenium Grid 4 and active sessions in a browser?",
        options: ["http://localhost:4444", "http://localhost:8080", "http://localhost:3000", "http://localhost:9000"],
        correctAnswer: 0,
        explanation: "Port 4444 hosts the Selenium Grid 4 web management dashboard and status console."
      },
      {
        id: "Q-AUT-023-08",
        text: "What open-source containerized grid alternative replaces Selenium Hub with lightweight Go microservices for ultra-fast browser startup?",
        options: ["Selenoid / Moon", "Apache Tomcat", "NodeJS Server", "Kubernetes Ingress"],
        correctAnswer: 0,
        explanation: "Aerokube Selenoid is a popular Go-based grid implementation that launches browsers in disposable Docker containers."
      },
      {
        id: "Q-AUT-023-09",
        text: "In Selenium Grid 4, what happens when all available browser nodes are busy executing tests and a new test request arrives?",
        options: [
          "The new request is held in the Session Queue until a node becomes available or timeout expires",
          "The request fails immediately with an error",
          "The server crashes",
          "An existing running test is aborted"
        ],
        correctAnswer: 0,
        explanation: "The Session Queue queues pending session requests until active nodes finish and release capacity."
      },
      {
        id: "Q-AUT-023-10",
        text: "What capability option can be passed to RemoteWebDriver to test against Mozilla Firefox on the Grid?",
        options: ["new FirefoxOptions()", "new ChromeOptions()", "new SafariConfig()", "new EdgeOptions()"],
        correctAnswer: 0,
        explanation: "Passing a 'FirefoxOptions' object directs the Grid Distributor to allocate a Firefox browser node."
      }
    ]
  },
  {
    id: "ASM-AUT-024",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-024",
    title: "Assessment: Performance Testing with Grafana k6",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-024-01",
        text: "What programming language is used to author load test scripts in Grafana k6?",
        options: ["Modern JavaScript (ES6)", "Java", "Python", "XML"],
        correctAnswer: 0,
        explanation: "k6 test scripts are written in clean ES6 JavaScript, while the execution runtime is powered by Go."
      },
      {
        id: "Q-AUT-024-02",
        text: "What is a 'Virtual User' (VU) in load testing?",
        options: [
          "An independent execution thread simulating a real human user interacting with the system concurrently",
          "A fake email address",
          "A computer generated avatar",
          "A bot that clicks advertisements"
        ],
        correctAnswer: 0,
        explanation: "VUs simulate concurrent users making requests in parallel to stress test application infrastructure."
      },
      {
        id: "Q-AUT-024-03",
        text: "What k6 feature allows establishing automated Performance Quality Gates that fail the CI build if latency thresholds are exceeded?",
        options: ["Thresholds", "Checkpoints", "Gates", "SLAs"],
        correctAnswer: 0,
        explanation: "k6 Thresholds define pass/fail SLO criteria (e.g. 'p(95) < 500ms') that determine process exit codes."
      },
      {
        id: "Q-AUT-024-04",
        text: "What traffic pattern in k6 gradually increases load from 0 to 500 VUs over a 5-minute period?",
        options: ["Ramp-Up stage", "Soak test", "Spike test", "Smoke test"],
        correctAnswer: 0,
        explanation: "Ramp-up stages gradually increase concurrency to observe how system metrics degrade under increasing load."
      },
      {
        id: "Q-AUT-024-05",
        text: "What does 'p(95) = 280ms' mean in a performance test report?",
        options: [
          "95% of all requests completed in 280 milliseconds or less; only 5% took longer",
          "The average response time was 280ms",
          "95 requests failed",
          "The test ran for 280 minutes"
        ],
        correctAnswer: 0,
        explanation: "The 95th percentile (P95) measures tail latency, showing that 95% of responses met or beat 280ms."
      },
      {
        id: "Q-AUT-024-06",
        text: "Why is 'sleep(1)' typically inserted inside a k6 test iteration?",
        options: [
          "To simulate realistic human 'think time' between actions rather than bombarding servers with unnatural zero-delay loops",
          "To allow the computer to cool down",
          "Because JavaScript requires pauses",
          "To reduce electricity consumption"
        ],
        correctAnswer: 0,
        explanation: "Pacing and think time simulate realistic user behavior and prevent unrealistic request hammering."
      },
      {
        id: "Q-AUT-024-07",
        text: "What is a 'Spike Test'?",
        options: [
          "A performance test that abruptly surges traffic to extreme volumes within seconds to test autoscaling and recovery",
          "Testing on sharp hardware",
          "A test that runs for 4 weeks",
          "Testing only the login screen"
        ],
        correctAnswer: 0,
        explanation: "Spike testing evaluates how an application handles sudden, dramatic traffic surges (e.g. flash sales)."
      },
      {
        id: "Q-AUT-024-08",
        text: "What is a 'Soak Test' (or Endurance Test)?",
        options: [
          "Running a moderate load over extended durations (12-48 hours) to detect memory leaks, connection pool exhaustion, and degradation",
          "Testing waterproof hardware",
          "Testing under water",
          "Testing with 1 VU only"
        ],
        correctAnswer: 0,
        explanation: "Soak tests expose slow memory leaks and resource exhaustion over sustained operating durations."
      },
      {
        id: "Q-AUT-024-09",
        text: "What command runs a k6 script directly from the terminal?",
        options: ["k6 run script.js", "k6 start script.js", "k6 test script.js", "k6 execute script.js"],
        correctAnswer: 0,
        explanation: "'k6 run <script.js>' starts local load test execution."
      },
      {
        id: "Q-AUT-024-10",
        text: "How does k6's resource utilization compare to Java-based load testing tools like JMeter?",
        options: [
          "k6 consumes significantly less memory and CPU, allowing a single machine to drive tens of thousands of VUs",
          "k6 uses 10x more RAM than JMeter",
          "k6 requires a supercomputer",
          "They have identical resource consumption"
        ],
        correctAnswer: 0,
        explanation: "k6's Go runtime provides ultra-low memory overhead compared to traditional JVM thread-per-user models."
      }
    ]
  },
  {
    id: "ASM-AUT-025",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-025",
    title: "Assessment: Apache JMeter Enterprise Performance",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-025-01",
        text: "Why should Apache JMeter NEVER be executed in GUI mode during high-volume load test runs?",
        options: [
          "GUI rendering consumes enormous CPU and memory resources, skewing latency results and causing premature client crashes",
          "GUI mode is prohibited by open source license",
          "GUI mode only allows 1 user",
          "GUI mode deletes test files"
        ],
        correctAnswer: 0,
        explanation: "The graphical interface consumes extensive memory; official documentation mandates Non-GUI mode for testing."
      },
      {
        id: "Q-AUT-025-02",
        text: "What CLI flags are used to execute JMeter in Non-GUI mode and output a dashboard report?",
        options: [
          "jmeter -n -t test.jmx -l results.jtl -e -o ./report",
          "jmeter --run test.jmx",
          "jmeter -gui=false",
          "jmeter start test.jmx"
        ],
        correctAnswer: 0,
        explanation: "'-n' (non-GUI), '-t' (test plan), '-l' (log file), and '-e -o' (export report) run headless tests and build HTML dashboards."
      },
      {
        id: "Q-AUT-025-03",
        text: "What component in JMeter reads external test data (such as thousands of user credentials) from a CSV file?",
        options: ["CSV Data Set Config", "User Parameter Config", "File Reader Sampler", "Data Pool"],
        correctAnswer: 0,
        explanation: "CSV Data Set Config injects delimited test data into JMeter variables across threads."
      },
      {
        id: "Q-AUT-025-04",
        text: "What is 'Correlation' in JMeter performance testing?",
        options: [
          "Extracting dynamic values (e.g. session tokens, CSRF tokens) from one server response and passing them into subsequent requests",
          "Connecting two computers with an Ethernet cable",
          "Comparing test results with competitors",
          "Translating test scripts into Python"
        ],
        correctAnswer: 0,
        explanation: "Correlation captures dynamic runtime session variables so subsequent requests remain authentic."
      },
      {
        id: "Q-AUT-025-05",
        text: "What post-processor in JMeter extracts values from a JSON response payload using JSONPath expressions?",
        options: ["JSON Extractor", "Regex Extractor", "XPath Extractor", "Body Parser"],
        correctAnswer: 0,
        explanation: "The JSON Extractor uses JSONPath queries to extract attributes into reusable JMeter variables."
      },
      {
        id: "Q-AUT-025-06",
        text: "What is the APDEX (Application Performance Index) metric reported in JMeter dashboards?",
        options: [
          "An open standard measuring user satisfaction with application response times (Satisfied, Tolerating, Frustrated)",
          "The temperature of the server",
          "The count of lines of Java code",
          "The cost of the AWS bill"
        ],
        correctAnswer: 0,
        explanation: "APDEX converts response time distributions into a standardized user satisfaction score from 0 to 1."
      },
      {
        id: "Q-AUT-025-07",
        text: "In JMeter terminology, what is a 'Thread Group'?",
        options: [
          "The core component defining the number of virtual users, ramp-up time, and loop count for the test",
          "A group chat for testers",
          "A collection of CPU cores",
          "A folder of test reports"
        ],
        correctAnswer: 0,
        explanation: "A Thread Group controls the pool of virtual user threads that execute the test scenario."
      },
      {
        id: "Q-AUT-025-08",
        text: "What timer in JMeter introduces realistic randomized human delays between user requests?",
        options: ["Gaussian Random Timer", "Constant Timer", "Zero Delay Timer", "Thread Delay"],
        correctAnswer: 0,
        explanation: "Gaussian Random Timer introduces randomized, bell-curve delays simulating realistic user pacing."
      },
      {
        id: "Q-AUT-025-09",
        text: "How does JMeter achieve distributed load testing when a single machine cannot generate enough traffic?",
        options: [
          "Using a Controller (Master) node to coordinate and aggregate load generated by multiple remote Injector (Worker) nodes",
          "By buying a larger monitor",
          "By running tests in the background",
          "JMeter does not support distributed testing"
        ],
        correctAnswer: 0,
        explanation: "JMeter Master-Worker architecture coordinates multiple worker nodes to generate massive distributed load."
      },
      {
        id: "Q-AUT-025-10",
        text: "What file extension is used for saved Apache JMeter test plan projects?",
        options: [".jmx", ".xml", ".csv", ".json"],
        correctAnswer: 0,
        explanation: ".jmx (Java Management Extensions XML format) is JMeter's native test plan format."
      }
    ]
  }
];

export const phase4 = {
  chapters: phase4Chapters,
  assessments: phase4Assessments
};

