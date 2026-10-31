export const phase3Chapters = [
  {
    id: "CH-AUT-014",
    courseId: "CRS-AUT-001",
    title: "REST Assured Architecture & BDD DSL Mastery",
    order: 14,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=R9Z8bW6S2_0",
    content: `# REST Assured Architecture & BDD DSL Mastery

### Learning Objectives
1. Understand the architecture of REST Assured on the JVM for enterprise API testing.
2. Structure API tests using the Given-When-Then BDD domain-specific language (DSL).
3. Configure reusable \`RequestSpecification\` and \`ResponseSpecification\` templates.
4. Enable detailed HTTP request and response logging for debugging.

---

### 1. REST Assured Architecture on the JVM

REST Assured is the premier Java library for automating RESTful APIs. It wraps Apache HttpClient with an elegant, expressive fluent API modeled around BDD principles:

\`\`\`
   +-------------------------------------------------------------+
   |                       REST ASSURED DSL                      |
   +-------------------------------------------------------------+
   |  given()   --> Preconditions, Headers, Auth, Query Params,  |
   |                Body payload, RequestSpecification           |
   |                                                             |
   |  when()    --> HTTP Method & Endpoint Trigger               |
   |                (get(), post(), put(), delete(), patch())    |
   |                                                             |
   |  then()    --> Validations & Assertions                     |
   |                (statusCode(), body(), header(), time())     |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Crafting a Clean REST Assured Test

\`\`\`java
package com.nalanda.api;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class OrderApiTests {

    @Test
    void testCreateOrderSuccessfully() {
        RestAssured.baseURI = "https://api.nalanda.learning";

        given()
            .header("Authorization", "Bearer eyJhbGciOiJIUzI1Ni...")
            .contentType(ContentType.JSON)
            .body("""
                {
                    "courseId": "CRS-AUT-001",
                    "paymentMethod": "CREDIT_CARD",
                    "amount": 199.99
                }
                """)
            .log().ifValidationFails()
        .when()
            .post("/api/v2/orders")
        .then()
            .statusCode(201)
            .contentType(ContentType.JSON)
            .body("status", equalTo("CONFIRMED"))
            .body("orderId", notNullValue())
            .body("amount", equalTo(199.99f))
            .time(lessThan(1500L)); // Performance assertion (<1.5s)
    }
}
\`\`\`

---

### 3. Reusable Specifications: Eliminating Duplication

Instead of repeating base URLs, authorization headers, and logging configs in every test, define reusable specifications:

\`\`\`java
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;

public class ApiSpecManager {

    public static RequestSpecification getAuthenticatedRequestSpec() {
        return new RequestSpecBuilder()
            .setBaseUri("https://api.nalanda.learning")
            .setBasePath("/api/v2")
            .addHeader("Authorization", "Bearer " + AuthManager.getToken())
            .setContentType(ContentType.JSON)
            .build();
    }

    public static ResponseSpecification getSuccessResponseSpec() {
        return new ResponseSpecBuilder()
            .expectStatusCode(200)
            .expectContentType(ContentType.JSON)
            .expectResponseTime(lessThan(2000L))
            .build();
    }
}
\`\`\`

---

### 4. Hands-on Lab: REST Assured Test Suite
1. Create a Maven project with \`rest-assured\`, \`hamcrest\`, and \`junit-jupiter\`.
2. Construct parameterized tests targeting user registration.
3. Validate HTTP 400 Bad Request error responses when mandatory fields are omitted.`
  },
  {
    id: "CH-AUT-015",
    courseId: "CRS-AUT-001",
    title: "JSON Schema Validation & POJO Serialization with Jackson",
    order: 15,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=FqSPh_x2Yt4",
    content: `# JSON Schema Validation & POJO Serialization with Jackson

### Learning Objectives
1. Implement type-safe JSON serialization and deserialization using Plain Old Java Objects (POJOs) and Jackson / Gson.
2. Validate API contract integrity using JSON Schema Draft-07 validation.
3. Extract complex nested values from JSON payloads using JSONPath expressions.
4. Prevent breaking API changes across microservices.

---

### 1. POJO Serialization vs. Hardcoded JSON Strings

Writing JSON payloads as raw multiline strings is fragile and error-prone. Enterprise SDETs map payloads to typed Java classes (POJOs):

\`\`\`java
// 1. Define typed POJO with Lombok / Jackson annotations
package com.nalanda.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
@JsonIgnoreProperties(ignoreUnknown = true)
public class EnrollmentRequest {
    private String studentId;
    private String courseId;
    private String cohortId;
    private boolean sendWelcomeEmail;
}
\`\`\`

#### Serializing & Deserializing in REST Assured:
\`\`\`java
// Serialization: Java Object -> JSON string in request body
EnrollmentRequest requestPayload = EnrollmentRequest.builder()
    .studentId("STU-1004")
    .courseId("CRS-AUT-001")
    .cohortId("COHORT-2026")
    .sendWelcomeEmail(true)
    .build();

// Deserialization: JSON response -> Java Object
EnrollmentResponse response = given()
    .spec(ApiSpecManager.getAuthenticatedRequestSpec())
    .body(requestPayload)
.when()
    .post("/enrollments")
.then()
    .statusCode(201)
    .extract().as(EnrollmentResponse.class);

// Type-safe assertions
assertEquals("ACTIVE", response.getStatus());
assertNotNull(response.getEnrollmentId());
\`\`\`

---

### 2. JSON Schema Validation

Even if specific values change, the structural contract (data types, required fields, format patterns) must adhere strictly to the schema specification.

\`\`\`java
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

@Test
void testUserProfileMatchesJsonSchema() {
    given()
        .spec(ApiSpecManager.getAuthenticatedRequestSpec())
    .when()
        .get("/users/me")
    .then()
        .statusCode(200)
        // Validates entire JSON structure against schema file
        .body(matchesJsonSchemaInClasspath("schemas/user-profile-schema.json"));
}
\`\`\`

---

### 3. Advanced JSONPath Expressions

REST Assured includes GPath/JSONPath for querying deeply nested structures:

\`\`\`java
// Extract list of all course titles where price is greater than 100
List<String> expensiveCourses = response.jsonPath()
    .getList("courses.findAll { it.price > 100 }.title");

// Extract the email of the instructor with ID 'INST-10'
String instructorEmail = response.jsonPath()
    .getString("instructors.find { it.id == 'INST-10' }.email");
\`\`\`

---

### 4. Hands-on Lab: Schema Enforcement Lab
1. Generate a JSON Schema Draft-07 for an Order Confirmation payload.
2. Configure \`json-schema-validator\` dependency in \`pom.xml\`.
3. Execute schema assertions and verify that an intentional type mismatch (string instead of integer) triggers a descriptive schema violation.`
  },
  {
    id: "CH-AUT-016",
    courseId: "CRS-AUT-001",
    title: "Authentication, OAuth 2.0 & Session Automation in APIs",
    order: 16,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=5x2bK3L_1U0",
    content: `# Authentication, OAuth 2.0 & Session Automation in APIs

### Learning Objectives
1. Automate diverse authentication protocols: API Keys, HTTP Basic Auth, and JWT Bearer Tokens.
2. Automate the OAuth 2.0 Client Credentials and Authorization Code grant flows.
3. Manage token lifecycles with automatic refresh mechanisms.
4. Capture, manage, and persist HTTP session cookies across stateful test scenarios.

---

### 1. The OAuth 2.0 Token Flow in Automation

In enterprise microservices, tests must obtain and inject valid JSON Web Tokens (JWTs) before invoking protected endpoints:

\`\`\`
   [ Automation Test Suite ]
              |
              | 1. POST /oauth/v2/token (Client ID + Client Secret)
              v
   [ Identity Provider (IdP) / Keycloak ]
              |
              | 2. Returns Access Token (JWT, TTL: 3600s) + Refresh Token
              v
   [ Automation Test Suite ]
              |
              | 3. GET /api/v2/protected-data
              |    Header: "Authorization: Bearer <jwt_token>"
              v
   [ Resource Server / Microservice ]
\`\`\`

---

### 2. Centralized Token Management Architecture

Hardcoding tokens in test files is a severe antipattern. Implement a singleton or thread-safe **TokenManager** that handles acquisition, caching, and auto-refresh:

\`\`\`java
package com.nalanda.auth;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java.time.Instant;

public class TokenManager {
    private static String accessToken;
    private static Instant expiryTime;

    public static synchronized String getValidToken() {
        if (accessToken == null || Instant.now().isAfter(expiryTime)) {
            renewToken();
        }
        return accessToken;
    }

    private static void renewToken() {
        var response = RestAssured.given()
            .contentType(ContentType.URLENC)
            .formParam("grant_type", "client_credentials")
            .formParam("client_id", System.getenv("OAUTH_CLIENT_ID"))
            .formParam("client_secret", System.getenv("OAUTH_CLIENT_SECRET"))
        .when()
            .post("https://auth.nalanda.learning/oauth/token")
        .then()
            .statusCode(200)
            .extract().response();

        accessToken = response.jsonPath().getString("access_token");
        int expiresInSeconds = response.jsonPath().getInt("expires_in");
        expiryTime = Instant.now().plusSeconds(expiresInSeconds - 60); // 60s buffer
    }
}
\`\`\`

---

### 3. Stateful Cookie & Session Testing

For legacy session-based applications (cookie-driven auth), REST Assured supports **Filter** objects that capture and replay session cookies:

\`\`\`java
import io.restassured.filter.session.SessionFilter;

SessionFilter sessionFilter = new SessionFilter();

// Step 1: Perform login; sessionFilter captures JSESSIONID
given()
    .filter(sessionFilter)
    .formParam("username", "qa_user")
    .formParam("password", "SecretPass123")
.when()
    .post("/auth/login")
.then()
    .statusCode(200);

// Step 2: Reuse sessionFilter in subsequent calls automatically
given()
    .filter(sessionFilter)
.when()
    .get("/account/balance")
.then()
    .statusCode(200);
\`\`\`

---

### 4. Hands-on Lab: OAuth 2.0 Automation Suite
1. Implement the \`TokenManager\` class using client credentials.
2. Write a negative test validating that an expired or tampered token returns HTTP 401 Unauthorized.
3. Test vertical privilege escalation: verify a student token returns HTTP 403 Forbidden on \`/api/admin/users\`.`
  },
  {
    id: "CH-AUT-017",
    courseId: "CRS-AUT-001",
    title: "Consumer-Driven Contract Testing with Pact",
    order: 17,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=cOmehxAU_4s",
    content: `# Consumer-Driven Contract Testing with Pact

### Learning Objectives
1. Eliminate integration test bottlenecks using Consumer-Driven Contract Testing (CDCT).
2. Understand the Pact framework architecture: Consumer, Provider, and Pact Broker.
3. Author Consumer expectations and generate contract files (\`pacts/\`).
4. Execute Provider verification tests to prevent breaking API changes in CI/CD pipelines.

---

### 1. The Microservices Integration Dilemma

In distributed architectures with dozens of microservices, running end-to-end integration tests in staging environments is notoriously painful:
- Service A depends on Service B, which depends on Service C.
- If Service C is down, tests fail for Service A.
- Coordinated staging deployments create massive release queues.

**Consumer-Driven Contract Testing (Pact)** flips the model:
1. The **Consumer** (Frontend or calling service) defines exactly what requests it sends and what response fields it actually cares about.
2. A **Contract (Pact)** is generated.
3. The **Provider** (Backend service) runs an automated verification test against the contract independently, proving compatibility before merging.

\`\`\`
   +--------------------+                         +--------------------+
   |  Consumer Service  |                         |  Provider Service  |
   |  (e.g. Web Client) |                         |  (e.g. Order API)  |
   +---------+----------+                         +---------+----------+
             |                                              |
      1. Generates Pact                              3. Verifies against
         Contract Specification                         real controllers
             |                                              |
             v                                              v
   +-------------------------------------------------------------+
   |                        PACT BROKER                          |
   | Central repository of contracts; evaluates "can-i-deploy"   |
   +-------------------------------------------------------------+
\`\`\`

---

### 2. Authoring a Consumer Pact Test

\`\`\`java
@ExtendWith(PactConsumerTestExt.class)
@PactTestFor(providerName = "CourseProvider")
public class CourseConsumerPactTest {

    @Pact(consumer = "WebPortalConsumer")
    public V4Pact createCoursePact(PactDslWithProvider builder) {
        return builder
            .given("course CRS-101 exists")
            .uponReceiving("a request for course CRS-101 details")
                .path("/api/v1/courses/CRS-101")
                .method("GET")
            .willRespondWith()
                .status(200)
                .headers(Map.of("Content-Type", "application/json"))
                .body(new PactDslJsonBody()
                    .stringValue("id", "CRS-101")
                    .stringType("title", "Automation Testing Masterclass")
                    .numberType("price", 199.99)
                    .booleanType("published", true)
                )
            .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "createCoursePact")
    void testGetCourse(MockServer mockServer) {
        CourseClient client = new CourseClient(mockServer.getUrl());
        Course course = client.getCourse("CRS-101");

        assertEquals("CRS-101", course.getId());
        assertEquals("Automation Testing Masterclass", course.getTitle());
    }
}
\`\`\`

---

### 3. Provider Verification in CI/CD

When the backend Provider service builds in CI, it pulls the contract from the Pact Broker:

\`\`\`java
@Provider("CourseProvider")
@PactBroker(url = "https://pact-broker.internal.org")
public class CourseProviderVerificationTest {

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void pactVerificationTestTemplate(PactVerificationContext context) {
        context.verifyInteraction();
    }

    @State("course CRS-101 exists")
    void setupCourseExists() {
        // Mock DB or insert test fixture
        courseRepository.save(new Course("CRS-101", "Automation Testing Masterclass", 199.99));
    }
}
\`\`\`

---

### 4. Hands-on Lab: Pact Contract Verification
1. Author a consumer test that specifies required fields for an invoice API.
2. Generate the pact JSON file.
3. Simulate a breaking change on the provider (renaming \`price\` to \`cost\`).
4. Run the provider verification and observe the contract failure in CI.`
  },
  {
    id: "CH-AUT-018",
    courseId: "CRS-AUT-001",
    title: "Service Virtualization & Mocking with WireMock",
    order: 18,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=scEDHsr3APg",
    content: `# Service Virtualization & Mocking with WireMock

### Learning Objectives
1. Understand Service Virtualization and how WireMock decouples testing from unavailable downstream systems.
2. Configure WireMock standalone in Docker and embedded in JUnit 5 test suites.
3. Stub REST endpoints with dynamic response templating and request matching rules.
4. Execute Fault Injection: high network latency, dropped connections, and malformed HTTP responses.

---

### 1. Service Virtualization vs. Unit Mocking

While Mockito mocks Java classes in memory, **WireMock operates at the network level**, spinning up a real HTTP/HTTPS server that downstream clients connect to via real TCP sockets.

\`\`\`
   +---------------------------------------+
   |   System Under Test (Backend Service) |
   +-------------------+-------------------+
                       |
                       | Real HTTP Request over network:
                       | POST https://wiremock-server:8080/v1/charge
                       v
   +---------------------------------------+
   |          WIREMOCK SERVER              |
   | - Matches URLs, Headers & JSON bodies |
   | - Injects latency & fault states      |
   | - Returns stubbed HTTP responses      |
   +---------------------------------------+
\`\`\`

---

### 2. Embedded WireMock with JUnit 5

\`\`\`java
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import org.junit.jupiter.api.extension.RegisterExtension;
import static com.github.tomakehurst.wiremock.client.WireMock.*;

class PaymentIntegrationTest {

    @RegisterExtension
    static WireMockExtension paymentService = WireMockExtension.newInstance()
        .options(wireMockConfig().dynamicPort())
        .build();

    @Test
    void testCreditCardAuthorizationSuccess() {
        // Configure WireMock Stub
        paymentService.stubFor(
            post(urlEqualTo("/v1/payments/authorize"))
                .withHeader("Content-Type", equalTo("application/json"))
                .withRequestBody(matchingJsonPath("$.amount", equalTo("150.00")))
                .willReturn(aResponse()
                    .withStatus(200)
                    .withHeader("Content-Type", "application/json")
                    .withBody("""
                        {
                            "transactionId": "TXN-99812",
                            "status": "APPROVED",
                            "authCode": "AUTH-4041"
                        }
                        """)
                    .withFixedDelay(200) // 200ms latency simulation
                )
        );

        // Run application code against paymentService.baseUrl()
        PaymentResult result = paymentClient.processPayment(150.00);
        assertTrue(result.isSuccess());
        assertEquals("TXN-99812", result.getTransactionId());

        // Verify request was made exactly once
        paymentService.verify(1, postRequestedFor(urlEqualTo("/v1/payments/authorize")));
    }
}
\`\`\`

---

### 3. Fault Injection Testing with WireMock

WireMock excels at testing catastrophic infrastructure conditions that cannot be produced safely in real staging:

\`\`\`java
// 1. Simulate server dropping connection with malformed TCP RST
paymentService.stubFor(
    post(urlEqualTo("/v1/payments/authorize"))
        .willReturn(aResponse().withFault(Fault.MALFORMED_RESPONSE_CHUNK))
);

// 2. Simulate 10-second timeout
paymentService.stubFor(
    post(urlEqualTo("/v1/payments/authorize"))
        .willReturn(aResponse().withFixedDelay(10000))
);
\`\`\`

---

### 4. Hands-on Lab: WireMock Docker Simulation
1. Run WireMock in Docker: \`docker run -it --rm -p 8080:8080 wiremock/wiremock:latest\`.
2. Post a stub mapping to \`http://localhost:8080/__admin/mappings\`.
3. Query the mock endpoint from REST Assured and verify dynamic response templating.`
  },
  {
    id: "CH-AUT-019",
    courseId: "CRS-AUT-001",
    title: "GraphQL API Automation & Newman CLI Pipelines",
    order: 19,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=J8w_3oKxV1E",
    content: `# GraphQL API Automation & Newman CLI Pipelines

### Learning Objectives
1. Understand GraphQL architecture: Queries, Mutations, and the single \`/graphql\` POST endpoint.
2. Automate GraphQL queries and mutations using REST Assured and Playwright API.
3. Validate GraphQL \`errors\` arrays and field-level nullability.
4. Execute Postman API collections headlessly in CI/CD using the Newman CLI.

---

### 1. Automating GraphQL APIs

Unlike REST APIs with multiple endpoints (\`/users\`, \`/orders\`), GraphQL exposes a single endpoint (\`/graphql\`) that always accepts HTTP POST requests with a JSON body containing a query string and variables:

\`\`\`java
package com.nalanda.graphql;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

public class GraphQLApiTests {

    @Test
    void testQueryCourseDetails() {
        String query = """
            query GetCourse($id: ID!) {
                course(id: $id) {
                    id
                    title
                    price
                    instructor {
                        name
                        email
                    }
                }
            }
            """;

        String variables = """
            {
                "id": "CRS-AUT-001"
            }
            """;

        given()
            .baseUri("https://api.nalanda.learning")
            .contentType(ContentType.JSON)
            .body(Map.of(
                "query", query,
                "variables", variables
            ))
        .when()
            .post("/graphql")
        .then()
            .statusCode(200) // GraphQL almost always returns HTTP 200!
            .body("errors", nullValue()) // Verify zero GraphQL errors
            .body("data.course.title", equalTo("Automation Testing Masterclass"))
            .body("data.course.instructor.name", notNullValue());
    }
}
\`\`\`

---

### 2. The GraphQL Error Handling Trap

A critical difference from REST: **GraphQL returns HTTP 200 OK even when a query fails!**
Errors are returned inside an \`errors[]\` JSON array within the response body.

\`\`\`json
{
  "errors": [
    {
      "message": "Course not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["course"],
      "extensions": { "code": "NOT_FOUND" }
    }
  ],
  "data": {
    "course": null
  }
}
\`\`\`

**Test Assertion Requirement**: Always verify \`body("errors", nullValue())\` on positive tests!

---

### 3. Newman CLI: Postman Collections in CI/CD

Newman is Postman's headless CLI runner that executes exported collections in CI pipelines without the Postman desktop application:

\`\`\`bash
# 1. Install Newman globally
npm install -g newman newman-reporter-htmlextra

# 2. Execute collection with environment variables in CI
newman run ./collections/LMS_API_Suite.json \
  -e ./environments/Staging.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./reports/api-report.html \
  --bail # Halt immediately on test failure
\`\`\`

---

### 4. Hands-on Lab: GraphQL Mutation & Newman Integration
1. Write a GraphQL mutation spec that updates a user's display name.
2. Export a 5-request Postman collection with test assertions.
3. Configure a GitHub Actions step executing Newman and uploading the HTML report.`
  }
];

export const phase3Assessments = [
  {
    id: "ASM-AUT-014",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-014",
    title: "Assessment: REST Assured & BDD DSL",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-014-01",
        text: "What BDD structure does REST Assured use for writing API test cases?",
        options: ["Given - When - Then", "Setup - Action - Teardown", "Try - Catch - Finally", "Input - Process - Output"],
        correctAnswer: 0,
        explanation: "REST Assured uses a fluent Given-When-Then DSL to define preconditions, actions, and assertions."
      },
      {
        id: "Q-AUT-014-02",
        text: "In REST Assured, which block is used to set request headers, authentication tokens, query parameters, and JSON payloads?",
        options: ["given()", "when()", "then()", "assert()"],
        correctAnswer: 0,
        explanation: "'given()' configures all request specifications and preconditions prior to triggering the HTTP call."
      },
      {
        id: "Q-AUT-014-03",
        text: "What matcher library is commonly used inside REST Assured's 'then().body()' assertions?",
        options: ["Hamcrest (e.g. equalTo, hasItem)", "Selenium WebDriver", "React Testing Library", "Lodash"],
        correctAnswer: 0,
        explanation: "Hamcrest matchers are natively integrated into REST Assured for expressive body assertions."
      },
      {
        id: "Q-AUT-014-04",
        text: "What class in REST Assured allows configuring shared base URIs, default headers, and content types across multiple tests?",
        options: ["RequestSpecBuilder / RequestSpecification", "WebDriverOptions", "SystemProperties", "HttpConnectionPool"],
        correctAnswer: 0,
        explanation: "RequestSpecification encapsulates reusable request parameters to avoid code duplication across tests."
      },
      {
        id: "Q-AUT-014-05",
        text: "How do you configure REST Assured to print the complete request and response details ONLY when a test validation fails?",
        options: [
          ".log().ifValidationFails()",
          ".log().always()",
          ".log().printError()",
          ".log().quiet()"
        ],
        correctAnswer: 0,
        explanation: "'.log().ifValidationFails()' keeps CI console logs clean by dumping telemetry only during test failures."
      },
      {
        id: "Q-AUT-014-06",
        text: "In REST Assured, which block contains the HTTP verb invocation (e.g. get(), post(), delete())?",
        options: ["when()", "given()", "then()", "execute()"],
        correctAnswer: 0,
        explanation: "'when()' triggers the HTTP action against the specified URI endpoint."
      },
      {
        id: "Q-AUT-014-07",
        text: "How can you verify that an API endpoint responds in less than 2000 milliseconds in REST Assured?",
        options: [
          ".then().time(lessThan(2000L))",
          ".then().speed(2000)",
          ".then().timeout(2000)",
          ".then().duration(2000)"
        ],
        correctAnswer: 0,
        explanation: "'.then().time(lessThan(2000L))' asserts that the total round-trip response time is under 2 seconds."
      },
      {
        id: "Q-AUT-014-08",
        text: "What is the return type of '.extract().response()' in a REST Assured test chain?",
        options: [
          "io.restassured.response.Response",
          "java.lang.String",
          "org.openqa.selenium.WebElement",
          "boolean"
        ],
        correctAnswer: 0,
        explanation: "'extract().response()' returns the complete Response object for custom inspection or variable extraction."
      },
      {
        id: "Q-AUT-014-09",
        text: "How do you pass a path variable (such as '/users/{id}') into a REST Assured request?",
        options: [
          "given().pathParam('id', 42).when().get('/users/{id}')",
          "given().queryParam('id', 42)",
          "given().param('id', 42)",
          "given().header('id', 42)"
        ],
        correctAnswer: 0,
        explanation: "'pathParam()' binds values to path variable placeholders defined inside curly braces in the endpoint URI."
      },
      {
        id: "Q-AUT-014-10",
        text: "Which underlying HTTP client library powers REST Assured for network communication?",
        options: ["Apache HttpClient", "OkHttp", "Curl CLI", "Fetch API"],
        correctAnswer: 0,
        explanation: "REST Assured is built on top of the mature Apache HttpComponents / HttpClient library."
      }
    ]
  },
  {
    id: "ASM-AUT-015",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-015",
    title: "Assessment: JSON Schema & POJO Serialization",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-015-01",
        text: "What is POJO serialization in automated API testing?",
        options: [
          "Converting a typed Java object into a JSON or XML payload string for an HTTP request body",
          "Converting code into bytecode",
          "Deleting database records",
          "Encrypting network packets"
        ],
        correctAnswer: 0,
        explanation: "Serialization converts Java objects into wire data formats (like JSON) using libraries like Jackson or Gson."
      },
      {
        id: "Q-AUT-015-02",
        text: "What library is widely used on the JVM for serializing and deserializing JSON in modern testing frameworks?",
        options: ["Jackson (ObjectMapper)", "JUnit", "Selenium", "TestNG"],
        correctAnswer: 0,
        explanation: "FasterXML Jackson is the industry-standard JSON data-binding library for Java."
      },
      {
        id: "Q-AUT-015-03",
        text: "What is the primary benefit of JSON Schema validation over individual field assertions?",
        options: [
          "It validates the entire structural contract (types, required fields, formats) in a single assertion against a schema definition file",
          "It makes API calls 100x faster",
          "It eliminates the need for HTTP status codes",
          "It translates JSON into SQL"
        ],
        correctAnswer: 0,
        explanation: "JSON Schema enforces complete structural contract adherence, ensuring no unexpected or missing fields occur."
      },
      {
        id: "Q-AUT-015-04",
        text: "What Jackson annotation ensures that tests do not fail when the API response contains new or unexpected fields?",
        options: [
          "@JsonIgnoreProperties(ignoreUnknown = true)",
          "@JsonStrict",
          "@JsonSkipErrors",
          "@JsonOptional"
        ],
        correctAnswer: 0,
        explanation: "'@JsonIgnoreProperties(ignoreUnknown = true)' allows backward-compatible deserialization when new fields are added."
      },
      {
        id: "Q-AUT-015-05",
        text: "What REST Assured module provides the 'matchesJsonSchemaInClasspath()' assertion method?",
        options: [
          "io.restassured:json-schema-validator",
          "io.restassured:xml-path",
          "io.restassured:spring-mock-mvc",
          "io.restassured:scala-support"
        ],
        correctAnswer: 0,
        explanation: "The 'json-schema-validator' module integrates the networknt/json-schema-validator library into REST Assured."
      },
      {
        id: "Q-AUT-015-06",
        text: "In JSONPath, what expression finds all elements in an array where the 'price' attribute is greater than 50?",
        options: [
          "items.findAll { it.price > 50 }",
          "items.filter(price > 50)",
          "items[price > 50]",
          "items.select(50)"
        ],
        correctAnswer: 0,
        explanation: "REST Assured's GPath syntax uses Groovy collection filtering: 'findAll { it.price > 50 }'."
      },
      {
        id: "Q-AUT-015-07",
        text: "How do you deserialize a REST Assured response body directly into a custom Java class 'UserResponse'?",
        options: [
          "UserResponse user = response.as(UserResponse.class);",
          "UserResponse user = (UserResponse) response;",
          "UserResponse user = response.toObject();",
          "UserResponse user = response.parse();"
        ],
        correctAnswer: 0,
        explanation: "'.as(Class<T>)' deserializes the JSON payload into an instance of the specified Java class."
      },
      {
        id: "Q-AUT-015-08",
        text: "What design pattern is commonly used with Lombok annotations (@Builder) to construct complex test request POJOs fluently?",
        options: ["Builder Pattern", "Singleton Pattern", "Factory Pattern", "Observer Pattern"],
        correctAnswer: 0,
        explanation: "The Builder pattern allows readable, fluent construction of test data objects without telescoping constructors."
      },
      {
        id: "Q-AUT-015-09",
        text: "What happens during JSON Schema validation if a mandatory field defined in 'required': ['id', 'email'] is missing from the response?",
        options: [
          "The assertion fails immediately with a detailed schema validation exception specifying the missing field",
          "The test passes silently",
          "The server restarts",
          "REST Assured invents a fake ID"
        ],
        correctAnswer: 0,
        explanation: "The validator verifies mandatory fields against the schema and throws a detailed schema violation failure."
      },
      {
        id: "Q-AUT-015-10",
        text: "What is 'Deserialization' in API testing?",
        options: [
          "Converting a received JSON response body into a strongly-typed Java class object for assertions",
          "Deleting cache data",
          "Encrypting user passwords",
          "Closing database connections"
        ],
        correctAnswer: 0,
        explanation: "Deserialization transforms the incoming JSON payload into strongly-typed objects for type-safe validation."
      }
    ]
  },
  {
    id: "ASM-AUT-016",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-016",
    title: "Assessment: Authentication & OAuth 2.0 Automation",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-016-01",
        text: "What standard HTTP header format is used to transmit an OAuth 2.0 JSON Web Token (JWT)?",
        options: [
          "Authorization: Bearer <token>",
          "Auth: Token <token>",
          "Security: Key <token>",
          "Proxy-Auth: Basic <token>"
        ],
        correctAnswer: 0,
        explanation: "The standard header format for bearer authentication is 'Authorization: Bearer <token>'."
      },
      {
        id: "Q-AUT-016-02",
        text: "In machine-to-machine microservice automation, which OAuth 2.0 grant type is standardly used by test frameworks?",
        options: [
          "Client Credentials grant (client_id + client_secret)",
          "Authorization Code grant with user browser interaction",
          "Implicit grant",
          "Resource Owner Password Credentials (deprecated)"
        ],
        correctAnswer: 0,
        explanation: "Client Credentials grant is designed for machine-to-machine service authentication without human interaction."
      },
      {
        id: "Q-AUT-016-03",
        text: "Why should an automated test framework avoid hardcoding OAuth access tokens in config files?",
        options: [
          "Access tokens expire rapidly (typically 15-60 minutes), causing test suites to fail when tokens become stale",
          "Tokens take up too much memory",
          "Java cannot read strings longer than 10 characters",
          "Git prohibits committing tokens"
        ],
        correctAnswer: 0,
        explanation: "Access tokens have short TTLs; automated frameworks must fetch and renew tokens dynamically at runtime."
      },
      {
        id: "Q-AUT-016-04",
        text: "What class in REST Assured automatically records session cookies from login responses and attaches them to subsequent requests?",
        options: ["SessionFilter", "CookieWatcher", "SessionManager", "AuthInterceptor"],
        correctAnswer: 0,
        explanation: "SessionFilter captures session cookies (like JSESSIONID) and automatically applies them to subsequent requests."
      },
      {
        id: "Q-AUT-016-05",
        text: "What HTTP response code is expected when an API request is made with an expired or invalid Bearer token?",
        options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500 Internal Server Error"],
        correctAnswer: 0,
        explanation: "HTTP 401 Unauthorized signals missing, invalid, or expired authentication credentials."
      },
      {
        id: "Q-AUT-016-06",
        text: "What HTTP response code is expected when an authenticated student attempts to invoke an administrative endpoint (e.g. DELETE /api/courses)?",
        options: ["403 Forbidden", "401 Unauthorized", "200 OK", "502 Bad Gateway"],
        correctAnswer: 0,
        explanation: "HTTP 403 Forbidden indicates the caller is authenticated, but lacks permission for the resource."
      },
      {
        id: "Q-AUT-016-07",
        text: "How should a thread-safe TokenManager ensure multiple parallel test threads do not simultaneously request new tokens?",
        options: [
          "Use a synchronized block or lock around token renewal to ensure single-flight token acquisition",
          "Disable parallel execution completely",
          "Generate 1000 tokens in advance",
          "Restart the test runner on token expiration"
        ],
        correctAnswer: 0,
        explanation: "Synchronized methods or Mutex locks ensure only one thread renews an expired token while others wait."
      },
      {
        id: "Q-AUT-016-08",
        text: "In HTTP Basic Authentication, how are the username and password encoded in the Authorization header?",
        options: [
          "Base64 encoded string: 'Authorization: Basic ' + Base64(username:password)",
          "SHA-256 hash",
          "AES-256 encrypted",
          "Plaintext separated by commas"
        ],
        correctAnswer: 0,
        explanation: "HTTP Basic Authentication encodes 'username:password' in standard Base64 representation."
      },
      {
        id: "Q-AUT-016-09",
        text: "What is the three-part structure of a JSON Web Token (JWT) separated by periods?",
        options: [
          "Header . Payload . Signature",
          "User . Password . Expiry",
          "Domain . Path . Cookie",
          "Key . Algorithm . Secret"
        ],
        correctAnswer: 0,
        explanation: "A JWT consists of three Base64URL-encoded components: Header, Payload, and Cryptographic Signature."
      },
      {
        id: "Q-AUT-016-10",
        text: "How do you supply an API Key that is passed via custom request headers in REST Assured?",
        options: [
          "given().header('X-API-KEY', 'secret_key_123')",
          "given().apiKey('secret_key_123')",
          "given().query('key', 'secret_key_123')",
          "given().param('api_key', 'secret_key_123')"
        ],
        correctAnswer: 0,
        explanation: "Custom API keys are typically passed using '.header(\"X-API-KEY\", \"...\")'."
      }
    ]
  },
  {
    id: "ASM-AUT-017",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-017",
    title: "Assessment: Consumer-Driven Contract Testing",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-017-01",
        text: "What is the core philosophy of Consumer-Driven Contract Testing (CDCT)?",
        options: [
          "The consumer service defines its expectations of the provider's API; the provider verifies independently that it satisfies that contract",
          "Providers dictate all requirements without consulting consumers",
          "Tests can only run in production",
          "Contracts are written in PDF format and signed manually"
        ],
        correctAnswer: 0,
        explanation: "CDCT allows consumers to specify their exact API requirements, preventing providers from breaking calling clients."
      },
      {
        id: "Q-AUT-017-02",
        text: "What is the Pact Broker in the Pact contract testing ecosystem?",
        options: [
          "A centralized service that stores, versions, and verifies contracts, providing 'can-i-deploy' gates for CI/CD pipelines",
          "A financial stock exchange for test cases",
          "A tool that compiles Java into JavaScript",
          "A database backup utility"
        ],
        correctAnswer: 0,
        explanation: "The Pact Broker acts as the central registry for contracts and verification statuses across microservices."
      },
      {
        id: "Q-AUT-017-03",
        text: "Why is Contract Testing faster and more reliable than End-to-End staging environment integration testing?",
        options: [
          "Consumer and Provider tests run in isolation against mocks and contracts without requiring live downstream environments to be online",
          "Contract testing skips all validations",
          "Contract tests only run once a year",
          "Contract tests do not use code"
        ],
        correctAnswer: 0,
        explanation: "Contract tests decouple services, eliminating the flakiness and environment dependencies of staging E2E suites."
      },
      {
        id: "Q-AUT-017-04",
        text: "What does the 'can-i-deploy' CLI command in the Pact Broker evaluate?",
        options: [
          "Whether a specific consumer version has been verified as compatible with the target provider version currently deployed in production",
          "Whether the developer's computer has internet",
          "Whether the software license has been paid",
          "Whether all developers have approved the pull request"
        ],
        correctAnswer: 0,
        explanation: "'can-i-deploy' checks the matrix in the Pact Broker to ensure deployed versions are contractually compatible."
      },
      {
        id: "Q-AUT-017-05",
        text: "What is a 'Provider State' in a Pact contract test?",
        options: [
          "A precondition setup hook on the provider (e.g. 'user 101 exists') required before verifying an interaction",
          "The physical country where the server is located",
          "The state of the developer's workstation",
          "An HTTP status code"
        ],
        correctAnswer: 0,
        explanation: "Provider States define the backend setup (e.g., seeding data) required before the provider verifies a contract call."
      },
      {
        id: "Q-AUT-017-06",
        text: "What file format is generated by consumer Pact tests to store contract specifications?",
        options: ["JSON (Pact specification file)", "XML", "YAML", "Binary .dat"],
        correctAnswer: 0,
        explanation: "Pact specifications are serialized as JSON documents describing request/response interactions and matching rules."
      },
      {
        id: "Q-AUT-017-07",
        text: "What happens if a backend team renames a response field from 'orderId' to 'id' without notifying the frontend consumer?",
        options: [
          "The Provider's contract verification test in CI fails immediately, blocking the pull request before it can reach staging",
          "The frontend application fixes itself automatically",
          "The tests pass and production crashes",
          "Pact Broker deletes the backend repository"
        ],
        correctAnswer: 0,
        explanation: "Provider verification detects the missing expected field and fails the build before breaking changes deploy."
      },
      {
        id: "Q-AUT-017-08",
        text: "Does a consumer Pact test execute against the real backend provider service during contract generation?",
        options: [
          "No, it runs against an embedded Pact mock server that verifies consumer code correctly handles the expected response",
          "Yes, it requires production database access",
          "Yes, all microservices must be running",
          "It only runs in an Android emulator"
        ],
        correctAnswer: 0,
        explanation: "Consumer tests execute against an in-process mock server; no real backend services are involved."
      },
      {
        id: "Q-AUT-017-09",
        text: "What matching rule in Pact matches any string value rather than a hardcoded literal value?",
        options: ["stringType()", "exact()", "literal()", "static()"],
        correctAnswer: 0,
        explanation: "'stringType()' generates type-based matching rules, allowing any valid string during provider verification."
      },
      {
        id: "Q-AUT-017-10",
        text: "Can Pact contract testing be used for asynchronous message queues (e.g. Kafka, RabbitMQ)?",
        options: [
          "Yes, Pact supports Message Pacts for verifying event payloads on message brokers",
          "No, Pact is strictly for HTTP REST only",
          "Only with IBM MQ",
          "Only in Python"
        ],
        correctAnswer: 0,
        explanation: "Pact supports asynchronous message interactions for queue and event-driven architectures."
      }
    ]
  },
  {
    id: "ASM-AUT-018",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-018",
    title: "Assessment: Service Virtualization with WireMock",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-018-01",
        text: "How does WireMock differ fundamentally from Mockito in automated testing?",
        options: [
          "WireMock runs a real HTTP/HTTPS server listening on network ports; Mockito mocks Java classes in memory",
          "WireMock is only for mobile testing",
          "Mockito runs in Docker while WireMock runs in the browser",
          "They are identical tools with different names"
        ],
        correctAnswer: 0,
        explanation: "WireMock operates at the network level (HTTP), whereas Mockito operates at the JVM bytecode/class level."
      },
      {
        id: "Q-AUT-018-02",
        text: "What WireMock method is used in Java to configure an endpoint stub?",
        options: ["stubFor()", "mockEndpoint()", "createRoute()", "setResponse()"],
        correctAnswer: 0,
        explanation: "'stubFor()' defines URL matching patterns and stubbed HTTP responses in WireMock."
      },
      {
        id: "Q-AUT-018-03",
        text: "What is Fault Injection in the context of WireMock testing?",
        options: [
          "Simulating infrastructure failures like socket resets, malformed HTTP chunks, and extreme network delays",
          "Injecting SQL syntax into search boxes",
          "Intentionally breaking the computer's CPU",
          "Writing syntax errors in test files"
        ],
        correctAnswer: 0,
        explanation: "Fault injection tests how resiliently applications recover from catastrophic network-level failures."
      },
      {
        id: "Q-AUT-018-04",
        text: "How do you verify that the System Under Test made exactly two HTTP requests to a WireMock endpoint?",
        options: [
          "verify(2, postRequestedFor(urlEqualTo('/api/pay')))",
          "assertRequests(2, '/api/pay')",
          "count(2, '/api/pay')",
          "check(2, '/api/pay')"
        ],
        correctAnswer: 0,
        explanation: "'verify(count, requestPattern)' asserts that matching HTTP calls were received by WireMock."
      },
      {
        id: "Q-AUT-018-05",
        text: "What JUnit 5 extension integrates WireMock into test lifecycles with dynamic available port assignment?",
        options: ["WireMockExtension", "WireMockRunner", "HttpServerRule", "MockServerExt"],
        correctAnswer: 0,
        explanation: "'WireMockExtension' manages embedded WireMock server instances in JUnit 5 test classes."
      },
      {
        id: "Q-AUT-018-06",
        text: "How do you simulate a 3-second network latency in WireMock?",
        options: [
          "aResponse().withFixedDelay(3000)",
          "aResponse().sleep(3000)",
          "aResponse().withWait(3000)",
          "aResponse().pause(3000)"
        ],
        correctAnswer: 0,
        explanation: "'withFixedDelay(ms)' introduces an intentional network delay before sending the stubbed response."
      },
      {
        id: "Q-AUT-018-07",
        text: "What WireMock fault simulates a dropped TCP connection with an unparseable response?",
        options: [
          "Fault.MALFORMED_RESPONSE_CHUNK",
          "Fault.CRASH_SERVER",
          "Fault.UNPLUG_CABLE",
          "Fault.DELETE_DATA"
        ],
        correctAnswer: 0,
        explanation: "Fault.MALFORMED_RESPONSE_CHUNK sends invalid bytes to test how clients handle corrupted network packets."
      },
      {
        id: "Q-AUT-018-08",
        text: "What is WireMock Record and Playback used for?",
        options: [
          "Proxying requests to a live third-party service, recording traffic, and generating stub mappings for offline testing",
          "Recording audio during meetings",
          "Recording video screenshots",
          "Playing music in the background"
        ],
        correctAnswer: 0,
        explanation: "Record and Playback captures traffic from real APIs and saves stub files for deterministic replaying."
      },
      {
        id: "Q-AUT-018-09",
        text: "Can WireMock run as a standalone containerized service in Docker?",
        options: [
          "Yes, via the official wiremock/wiremock Docker image",
          "No, WireMock only runs inside Eclipse IDE",
          "No, WireMock requires a physical mainframe",
          "Only on Windows Server 2003"
        ],
        correctAnswer: 0,
        explanation: "WireMock is widely deployed as a lightweight Docker container for standalone mock environments."
      },
      {
        id: "Q-AUT-018-10",
        text: "How does WireMock dynamic response templating help test personalization?",
        options: [
          "It extracts values from incoming requests (e.g. {{request.body.userId}}) and reflects them in the response",
          "It translates responses into German",
          "It adds CSS templates to the browser",
          "It deletes sensitive user data"
        ],
        correctAnswer: 0,
        explanation: "Handlebars templating in WireMock injects dynamic request attributes into stubbed responses."
      }
    ]
  },
  {
    id: "ASM-AUT-019",
    courseId: "CRS-AUT-001",
    chapterId: "CH-AUT-019",
    title: "Assessment: GraphQL & Newman CLI Pipelines",
    passingScore: 70,
    questions: [
      {
        id: "Q-AUT-019-01",
        text: "What HTTP method and endpoint is standardly used for all GraphQL queries and mutations?",
        options: ["POST to /graphql", "GET to /query", "PUT to /schema", "PATCH to /graphql"],
        correctAnswer: 0,
        explanation: "GraphQL APIs standardize on a single POST endpoint (typically /graphql) carrying query/mutation payloads."
      },
      {
        id: "Q-AUT-019-02",
        text: "What major difference exists between GraphQL error responses and REST error responses?",
        options: [
          "GraphQL almost always returns HTTP 200 OK even when execution fails, returning errors inside an 'errors[]' JSON array",
          "GraphQL returns HTTP 500 for all requests",
          "GraphQL errors cannot be read in JSON",
          "GraphQL does not support error messages"
        ],
        correctAnswer: 0,
        explanation: "GraphQL status codes remain 200 OK unless the gateway fails; application errors reside in the 'errors' array."
      },
      {
        id: "Q-AUT-019-03",
        text: "What assertion must ALWAYS be included on positive GraphQL test cases to ensure no underlying query failures occurred?",
        options: [
          "body('errors', nullValue())",
          "statusCode(404)",
          "header('Content-Type', 'text/html')",
          "time(greaterThan(10000))"
        ],
        correctAnswer: 0,
        explanation: "Verifying 'errors' is null guarantees that GraphQL resolved the operation without field-level execution failures."
      },
      {
        id: "Q-AUT-019-04",
        text: "What is Newman in the Postman ecosystem?",
        options: [
          "A command-line collection runner that allows running Postman tests headlessly in CI/CD pipelines",
          "A replacement for Google Chrome",
          "A tool that converts Postman into Selenium",
          "A database backup utility"
        ],
        correctAnswer: 0,
        explanation: "Newman is Postman's CLI runner, enabling automated execution of collection suites in headless CI environments."
      },
      {
        id: "Q-AUT-019-05",
        text: "What CLI flag in Newman halts test execution immediately upon the first assertion failure?",
        options: ["--bail", "--stop", "--halt", "--abort"],
        correctAnswer: 0,
        explanation: "'--bail' instructs Newman to terminate the test run immediately upon encountering an error."
      },
      {
        id: "Q-AUT-019-06",
        text: "What popular Newman reporter plugin generates rich, visual HTML dashboard reports with graphs?",
        options: ["newman-reporter-htmlextra", "newman-html-basic", "postman-reporter", "mocha-reporter"],
        correctAnswer: 0,
        explanation: "'newman-reporter-htmlextra' generates comprehensive, styled HTML dashboards for test runs."
      },
      {
        id: "Q-AUT-019-07",
        text: "How do you pass environment variables into a Newman test execution?",
        options: [
          "newman run collection.json -e environment.json",
          "newman run collection.json --env=production",
          "newman run collection.json -p vars.txt",
          "Newman cannot accept environment files"
        ],
        correctAnswer: 0,
        explanation: "The '-e' flag specifies an exported Postman environment JSON file containing variable definitions."
      },
      {
        id: "Q-AUT-019-08",
        text: "In GraphQL, what operation type is used to modify or write data (equivalent to POST/PUT in REST)?",
        options: ["Mutation", "Query", "Subscription", "Resolver"],
        correctAnswer: 0,
        explanation: "Mutations perform write/update operations in GraphQL; Queries perform read-only retrievals."
      },
      {
        id: "Q-AUT-019-09",
        text: "What is a GraphQL Subscription used for?",
        options: [
          "Real-time bidirectional event streaming, usually over WebSockets",
          "Paying a monthly subscription fee",
          "Subscribing to email newsletters",
          "Downloading PDF files"
        ],
        correctAnswer: 0,
        explanation: "Subscriptions maintain active WebSocket connections to push real-time updates to clients."
      },
      {
        id: "Q-AUT-019-10",
        text: "How are dynamic parameters passed safely into GraphQL operations without string concatenation?",
        options: [
          "Via the 'variables' JSON object in the request payload",
          "By concatenating strings in the URL",
          "In the user-agent header",
          "Through operating system cookies"
        ],
        correctAnswer: 0,
        explanation: "GraphQL variables decouple dynamic arguments from query text, preventing injection attacks."
      }
    ]
  }
];

export const phase3 = {
  chapters: phase3Chapters,
  assessments: phase3Assessments
};

