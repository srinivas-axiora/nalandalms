// Phase 3: Intermediate (Chapters 15 to 21) - Java Full Stack Developer
// Spring Boot 3 backend mastery + Modern React 19 frontend fundamentals.

export const phase3 = {
  chapters: [
    // ── Chapter 15 ──
    {
      id: "CH-JFS-015",
      courseId: "CRS-JFS-001",
      sequence: 15,
      title: "Spring Framework Core: Inversion of Control (IoC), Dependency Injection & Bean Lifecycles",
      description: "IoC container, ApplicationContext, Stereotype annotations (@Component, @Service, @Repository), constructor injection, bean scopes, and lifecycle hooks.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 15</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Spring Framework Core: IoC, Dependency Injection & Bean Architecture</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">The Spring Framework powers enterprise Java by solving component coupling. Instead of classes hard-coding the creation of their dependencies using <code>new</code>, Spring's <strong>Inversion of Control (IoC) Container</strong> instantiates, wires, and manages the complete lifecycle of application beans.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/GB8k2-Egdv0" title="Spring Dependency Injection Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Constructor Injection vs Field Injection</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// ANTI-PATTERN: Field Injection (@Autowired private PaymentGateway gateway;)
// Breaks immutability, hides dependencies, cannot be tested without Spring runner.

// ENTERPRISE BEST PRACTICE: Pure Constructor Injection
@Service
public class OrderService {
    private final PaymentGateway paymentGateway;
    private final OrderRepository orderRepository;

    // Single constructor: @Autowired is implicit in modern Spring
    public OrderService(PaymentGateway paymentGateway, OrderRepository orderRepository) {
        this.paymentGateway = Objects.requireNonNull(paymentGateway, "PaymentGateway required");
        this.orderRepository = Objects.requireNonNull(orderRepository, "OrderRepository required");
    }
}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Bean Scopes & Lifecycle Callbacks</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Spring beans default to <strong>Singleton scope</strong> (one shared instance per ApplicationContext). Web scopes include <code>prototype</code> (new instance per request), <code>request</code>, <code>session</code>, and <code>websocket</code>. Use <code>@PostConstruct</code> and <code>@PreDestroy</code> for lifecycle interception.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>IoC inverts control: the framework wires dependencies into classes rather than classes creating them.</li>
      <li>Always use Constructor Injection with <code>final</code> fields for immutability and easy unit testing.</li>
      <li>Default bean scope is Singleton: beans must be stateless and thread-safe.</li>
      <li>Use <code>@Profile("prod")</code> or <code>@Profile("dev")</code> to load environment-specific bean configurations.</li>
      <li>Stereotypes <code>@Service</code>, <code>@Repository</code>, and <code>@Controller</code> are specialized meta-annotations over <code>@Component</code>.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 16 ──
    {
      id: "CH-JFS-016",
      courseId: "CRS-JFS-001",
      sequence: 16,
      title: "Spring Boot 3: Auto-Configuration, Production REST APIs, DTOs & Error Handling",
      description: "Auto-configuration mechanics, @RestController, request/response bodies, Bean Validation (@Valid), ResponseEntity, and global @ControllerAdvice.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 16</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Spring Boot 3: REST API Architecture & Validation</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Spring Boot 3 (requiring Java 17+ baseline) eliminates boilerplate XML and manual Tomcat configuration. Through intelligent <strong>Auto-Configuration</strong>, it inspects your classpath dependencies and configures production-grade defaults automatically.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/9SGDpanrc8U" title="Spring Boot 3 Full Course" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Enterprise REST Controller Pattern with DTO Validation</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(response.id())
            .toUri();
        return ResponseEntity.created(location).body(response);
    }
}

// Java Record as immutable DTO with Jakarta Validation:
public record CreateOrderRequest(
    @NotBlank(message = "Customer ID is required")
    String customerId,

    @Positive(message = "Order total must be greater than zero")
    BigDecimal amount,

    @NotEmpty(message = "Order must contain at least one item")
    List<OrderItemDto> items
) {}</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Global Exception Handling with ProblemDetails (RFC 7807)</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">Spring Boot 3 natively adopts <strong>RFC 7807 Problem Details</strong> for standardized, machine-readable HTTP error representations via <code>@RestControllerAdvice</code>.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>@SpringBootApplication</code> bundles <code>@Configuration</code>, <code>@EnableAutoConfiguration</code>, and <code>@ComponentScan</code>.</li>
      <li>Never expose JPA database entities directly via REST; always map to and from DTO records.</li>
      <li>Use Jakarta Bean Validation (<code>@Valid</code>, <code>@NotNull</code>, <code>@Size</code>, <code>@Positive</code>) for automatic input checking.</li>
      <li>Centralize all API error translations in a global <code>@RestControllerAdvice</code> class.</li>
      <li>Return appropriate HTTP status codes: 201 Created for resource creation, 400 for validation errors, 404 for missing entities.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 17 ──
    {
      id: "CH-JFS-017",
      courseId: "CRS-JFS-001",
      sequence: 17,
      title: "Spring Data JPA, Hibernate ORM & Eliminating the N+1 Query Problem",
      description: "JPA entity mapping, @OneToMany/@ManyToOne relationships, Spring Data Repository interfaces, JPQL, pagination, and JOIN FETCH optimization.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 17</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Spring Data JPA, Hibernate & The N+1 Query Problem</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Object-Relational Mapping (ORM) bridges Java objects with SQL relational tables. Hibernate translates object operations into SQL dialect statements, while Spring Data JPA generates repository implementations automatically from method names.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/8SGI_XS5OPM" title="Spring Data JPA Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Solving the Fatal N+1 Query Problem with <code>JOIN FETCH</code></h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">The N+1 problem occurs when fetching N parent records causes Hibernate to execute N additional queries to load lazy child collections, destroying database performance:</p>

  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>public interface CourseRepository extends JpaRepository<Course, String> {

    // ANTI-PATTERN: Fires 1 query for courses + N queries for chapters!
    // List<Course> findAll();

    // SOLUTION: JOIN FETCH loads courses and chapters in 1 single SQL JOIN:
    @Query("SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.chapters WHERE c.status = 'ACTIVE'")
    List<Course> findAllWithChaptersEagerly();

    // Built-in pagination with Pageable:
    Page<Course> findByCategory(String category, Pageable pageable);
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Always configure <code>FetchType.LAZY</code> for all <code>@OneToMany</code> and <code>@ManyToMany</code> associations.</li>
      <li>Prevent the N+1 query problem by using <code>JOIN FETCH</code> in JPQL or <code>@EntityGraph</code>.</li>
      <li>Spring Data JPA derived query methods (e.g., <code>findByEmailAndStatus</code>) are generated automatically.</li>
      <li>Always use <code>Pageable</code> and return <code>Page&lt;T&gt;</code> for endpoints returning collections to avoid memory exhaustion.</li>
      <li>Use <code>@Transactional(readOnly = true)</code> on read methods to disable Hibernate dirty-checking overhead.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 18 ──
    {
      id: "CH-JFS-018",
      courseId: "CRS-JFS-001",
      sequence: 18,
      title: "API Security Engineering: Spring Security 6, Stateless JWT & RBAC Gates",
      description: "SecurityFilterChain, PasswordEncoder (BCrypt), OncePerRequestFilter, asymmetric/symmetric JWT validation, method security (@PreAuthorize), and CORS.",
      contentType: "Rich Text",
      durationMinutes: 55,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 18</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Spring Security 6, JWT Authentication & RBAC</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Securing enterprise endpoints against unauthorized access is non-negotiable. Modern distributed full-stack applications use stateless <strong>JSON Web Tokens (JWT)</strong>, eliminating server-side session memory and allowing seamless horizontal microservice scaling.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/b9O9NI-RJ3o" title="Spring Security 6 and JWT Tutorial" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Modern SecurityFilterChain Configuration (Spring Security 6)</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize("hasRole('ADMIN')")
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable) // Stateless REST API
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/api/v1/catalog/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Work factor 12
    }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Spring Security 6 replaces legacy <code>WebSecurityConfigurerAdapter</code> with bean-based <code>SecurityFilterChain</code>.</li>
      <li>Pass-word hashing must always use salted algorithms like BCrypt or Argon2 (never SHA-256 or MD5).</li>
      <li>Stateless REST APIs use <code>SessionCreationPolicy.STATELESS</code>, authenticating requests via JWT Bearer headers.</li>
      <li>Use <code>@EnableMethodSecurity</code> and <code>@PreAuthorize("hasAuthority('...')")</code> for fine-grained method-level RBAC.</li>
      <li>Configure CORS explicitly to whitelist only trusted frontend origin domains.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 19 ──
    {
      id: "CH-JFS-019",
      courseId: "CRS-JFS-001",
      sequence: 19,
      title: "Frontend Foundations: Semantic HTML5, Modern CSS Layouts & ES6+ JavaScript",
      description: "Semantic web architecture, responsive CSS Flexbox & CSS Grid, modern JavaScript (const/let, arrow functions, destructuring, async/await, fetch API).",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 19</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Frontend Foundations: HTML5, CSS Grid/Flexbox & ES6+</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">To be a true Full Stack Developer, you must command the browser runtime as fluently as the JVM. Modern web interfaces rely on semantic HTML5 structure, responsive CSS Grid and Flexbox layouts, and asynchronous ES6+ JavaScript.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Modern Asynchronous JavaScript: Async/Await & Fetch</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>// Asynchronous API call to Spring Boot backend:
async function fetchCourseCatalog() {
    try {
        const response = await fetch('/api/v1/catalog', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': \`Bearer \${sessionStorage.getItem('jwt_token')}\`
            }
        });

        if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: Failed to fetch catalog\`);
        }

        const data = await response.json();
        return data.courses;
    } catch (err) {
        console.error("Network error:", err);
        throw err;
    }
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>Use semantic tags (<code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;article&gt;</code>) for accessibility and SEO.</li>
      <li>Use CSS Flexbox for 1-dimensional layouts (rows or columns) and CSS Grid for 2-dimensional grid systems.</li>
      <li>JavaScript ES6 modules (<code>import</code> / <code>export</code>) keep frontend code modular and testable.</li>
      <li>Never use <code>var</code>; declare variables with <code>const</code> by default, and <code>let</code> only when reassignment is required.</li>
      <li>Async/await simplifies Promise resolution, allowing synchronous-looking try/catch error handling.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 20 ──
    {
      id: "CH-JFS-020",
      courseId: "CRS-JFS-001",
      sequence: 20,
      title: "React 19 Fundamentals: Declarative UI, JSX, Functional Components, Props & State",
      description: "Declarative programming paradigm, JSX compilation, component tree architecture, props vs state, useState hook, event handling, and key reconciliation.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 20</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">React 19 Fundamentals: Declarative UI & State Mechanics</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">React revolutionized UI development by introducing a declarative component model: UI is a pure function of State \(UI = f(state)\). React manages the Virtual DOM, diffing changes in memory and batching minimal DOM updates to the browser.</p>

  <div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:28px 0;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
    <iframe src="https://www.youtube-nocookie.com/embed/SqcY0GlETPk" title="React Tutorial for Beginners" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. Component State & The Reconciliation Key Rule</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>import { useState } from 'react';

export function CourseCard({ course, onEnroll }) {
    const [enrolled, setEnrolled] = useState(false);

    const handleEnrollClick = () => {
        setEnrolled(true);
        onEnroll(course.id);
    };

    return (
        &lt;div className="course-card" style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px' }}&gt;
            &lt;h3&gt;{course.title}&lt;/h3&gt;
            &lt;p&gt;{course.description}&lt;/p&gt;
            &lt;button 
                onClick={handleEnrollClick} 
                disabled={enrolled}
                style={{ background: enrolled ? '#94a3b8' : '#ea580c', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
            &gt;
                {enrolled ? 'Enrolled' : 'Enroll Now'}
            &lt;/button&gt;
        &lt;/div&gt;
    );
}</code></pre>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li>React uses a Virtual DOM to minimize costly direct browser DOM manipulations.</li>
      <li>Props are read-only (immutable) inputs passed down from parent components.</li>
      <li>State is private, mutable local memory managed via the <code>useState</code> hook.</li>
      <li>Always provide a stable, unique <code>key</code> (e.g., entity ID) when rendering dynamic lists.</li>
      <li>State updates are asynchronous and batched; never mutate state objects directly.</li>
    </ul>
  </div>
</div>`
    },

    // ── Chapter 21 ──
    {
      id: "CH-JFS-021",
      courseId: "CRS-JFS-001",
      sequence: 21,
      title: "Advanced React: Hooks Architecture (useEffect, useMemo, useCallback), Context API & React Router",
      description: "Lifecycle synchronization with useEffect, memory/render optimization (useMemo, useCallback), global state with Context API, and client routing with React Router v6.",
      contentType: "Rich Text",
      durationMinutes: 50,
      minimumTimeMinutes: 25,
      body: `<div class="chapter-content">
  <div class="hero-badge" style="display:inline-block;background:#ea580c;color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">Phase 3: Intermediate • Chapter 21</div>
  <h1 style="color:#0f172a;font-size:28px;font-weight:800;margin-bottom:12px;">Advanced React Hooks, Context API & Routing</h1>
  <p style="font-size:16px;line-height:1.7;color:#334155;">Scaling React applications requires mastering side-effect lifecycles, memoization to avoid redundant child renders, global authentication state management via Context, and dynamic client-side SPA routing with React Router v6.</p>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">1. The <code>useEffect</code> Dependency Array Rules</h2>
  <pre style="background:#0f172a;color:#f8fafc;padding:18px;border-radius:8px;font-family:Consolas,monospace;font-size:14px;overflow-x:auto;"><code>useEffect(() => {
    let isCancelled = false; // Prevents race conditions on fast unmount

    async function loadData() {
        const response = await fetch(\`/api/v1/courses/\${courseId}\`);
        const json = await response.json();
        if (!isCancelled) setCourse(json);
    }
    loadData();

    // Cleanup function: runs before next effect execution or component unmount
    return () => {
        isCancelled = true;
    };
}, [courseId]); // Runs on mount and whenever courseId changes!</code></pre>

  <h2 style="color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-top:32px;">2. Global Auth State with Context API</h2>
  <p style="font-size:15px;line-height:1.7;color:#334155;">React Context solves "prop drilling" by making authentication state (user profile, token, roles) accessible to any child component in the tree without manually threading props through intermediate layout containers.</p>

  <div class="takeaways-card" style="background:#ecfdf5;border-left:4px solid #10b981;padding:18px 22px;border-radius:0 8px 8px 0;margin:32px 0;">
    <h4 style="color:#065f46;margin-top:0;font-size:16px;">Key Takeaways</h4>
    <ul style="color:#047857;margin-bottom:0;padding-left:20px;font-size:14px;line-height:1.7;">
      <li><code>useEffect</code> synchronizes components with external systems (APIs, timers, DOM listeners).</li>
      <li>Always return a cleanup function from <code>useEffect</code> to cancel subscriptions or pending network requests.</li>
      <li><code>useMemo</code> caches expensive calculation results; <code>useCallback</code> caches function reference definitions.</li>
      <li>Context API is ideal for low-frequency global state like User Auth, Theme, and Language settings.</li>
      <li>React Router v6 declarative routes (<code>&lt;Routes&gt;</code>, <code>&lt;Route&gt;</code>, <code>&lt;Navigate&gt;</code>) protect private authenticated views.</li>
    </ul>
  </div>
</div>`
    }
  ],

  // ── Assessments for Phase 3 (10 MCQs per chapter = 70 questions total) ──
  assessments: [
    {
      id: "ASM-JFS-015",
      title: "Spring Core & IoC Assessment",
      chapterId: "CH-JFS-015",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-015-01", type: "MCQ", prompt: "What is the primary role of Spring's Inversion of Control (IoC) Container?", options: ["To compile Java code", "To instantiate, configure, and wire application objects (beans) throughout their lifecycle", "To manage database tables", "To host HTML files"], answer: 1, points: 10 },
        { id: "Q-JFS-015-02", type: "MCQ", prompt: "Why is Constructor Injection preferred over Field Injection (@Autowired private MyService service)?", options: ["It requires more code", "It enables immutability with final fields, prevents NPEs, and allows clean unit testing without Spring context", "It executes on a separate thread", "Spring deprecated classes"], answer: 1, points: 10 },
        { id: "Q-JFS-015-03", type: "MCQ", prompt: "What is the default bean scope in Spring Framework?", options: ["Prototype", "Singleton", "Request", "Session"], answer: 1, points: 10 },
        { id: "Q-JFS-015-04", type: "MCQ", prompt: "What stereotype annotation should be used for business logic service classes?", options: ["@Component", "@Service", "@Repository", "@Controller"], answer: 1, points: 10 },
        { id: "Q-JFS-015-05", type: "MCQ", prompt: "What annotation marks a method to execute immediately after dependency injection is complete?", options: ["@PostConstruct", "@PreDestroy", "@AfterInit", "@Start"], answer: 0, points: 10 },
        { id: "Q-JFS-015-06", type: "MCQ", prompt: "What happens when a bean declared with scope 'prototype' is requested from the ApplicationContext?", options: ["The same shared instance is returned", "A brand-new distinct instance is created and returned every time", "An exception is thrown", "The JVM garbage collects all beans"], answer: 1, points: 10 },
        { id: "Q-JFS-015-07", type: "MCQ", prompt: "What annotation enables environment-specific bean registration (e.g., loading mock payment gateway in development)?", options: ["@Profile", "@Environment", "@ConditionalOnJava", "@Scope"], answer: 0, points: 10 },
        { id: "Q-JFS-015-08", type: "MCQ", prompt: "Which interface represents the advanced Spring IoC container with event publishing and i18n support?", options: ["BeanFactory", "ApplicationContext", "ObjectFactory", "BeanRegistry"], answer: 1, points: 10 },
        { id: "Q-JFS-015-09", type: "MCQ", prompt: "What annotation allows injecting values from application.properties or application.yml?", options: ["@Value(\"${property.name}\")", "@Property", "@InjectValue", "@ConfigVar"], answer: 0, points: 10 },
        { id: "Q-JFS-015-10", type: "MCQ", prompt: "What is a circular dependency in Spring?", options: ["A bean that calls itself in recursion", "When Bean A requires Bean B, and Bean B directly or indirectly requires Bean A during construction", "A loop in a controller method", "Multiple instances of a singleton bean"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-016",
      title: "Spring Boot 3 REST APIs Assessment",
      chapterId: "CH-JFS-016",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-016-01", type: "MCQ", prompt: "What two annotations are combined within `@RestController`?", options: ["@Controller and @ResponseBody", "@Service and @Component", "@Endpoint and @Mapping", "@Entity and @Table"], answer: 0, points: 10 },
        { id: "Q-JFS-016-02", type: "MCQ", prompt: "What HTTP status code should be returned when a new resource is successfully created via POST?", options: ["200 OK", "201 Created", "204 No Content", "202 Accepted"], answer: 1, points: 10 },
        { id: "Q-JFS-016-03", type: "MCQ", prompt: "What annotation triggers automatic validation of incoming request body DTOs against Jakarta constraints?", options: ["@Validate", "@Valid", "@Check", "@Verify"], answer: 1, points: 10 },
        { id: "Q-JFS-016-04", type: "MCQ", prompt: "What annotation is used to create a centralized global exception handler in Spring Boot?", options: ["@ControllerAdvice / @RestControllerAdvice", "@ExceptionHandlerClass", "@GlobalHandler", "@ErrorCatcher"], answer: 0, points: 10 },
        { id: "Q-JFS-016-05", type: "MCQ", prompt: "What standard specification does Spring Boot 3 follow for structured HTTP API error responses?", options: ["SOAP Fault", "RFC 7807 (Problem Details for HTTP APIs)", "GraphQL Error Spec", "JSON-RPC"], answer: 1, points: 10 },
        { id: "Q-JFS-016-06", type: "MCQ", prompt: "What annotation extracts a URI template variable, such as `/api/users/{id}`?", options: ["@RequestParam", "@PathVariable", "@HeaderParam", "@QueryParam"], answer: 1, points: 10 },
        { id: "Q-JFS-016-07", type: "MCQ", prompt: "What embedded servlet container is bundled by default in spring-boot-starter-web?", options: ["Jetty", "Undertow", "Apache Tomcat", "Netty"], answer: 2, points: 10 },
        { id: "Q-JFS-016-08", type: "MCQ", prompt: "Why should Java Records be used for REST API DTOs in modern Spring Boot 3?", options: ["They are faster than primitives", "They provide immutable, concise syntax with automatic getters, equals, hashCode, and toString", "They replace JPA entities", "They execute on the GPU"], answer: 1, points: 10 },
        { id: "Q-JFS-016-09", type: "MCQ", prompt: "What annotation extracts query parameters from a URL, such as `?page=2&size=20`?", options: ["@PathVariable", "@RequestParam", "@BodyParam", "@QueryString"], answer: 1, points: 10 },
        { id: "Q-JFS-016-10", type: "MCQ", prompt: "What is the minimum Java version required to run Spring Boot 3?", options: ["Java 8", "Java 11", "Java 17", "Java 21"], answer: 2, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-017",
      title: "Spring Data JPA & Hibernate Assessment",
      chapterId: "CH-JFS-017",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-017-01", type: "MCQ", prompt: "What causes the notorious N+1 query problem in Hibernate?", options: ["Missing database primary keys", "Loading an entity with lazy relationships, and subsequently accessing each child collection in a loop, firing N individual SQL queries", "Executing queries on multiple threads", "Using PostgreSQL instead of MySQL"], answer: 1, points: 10 },
        { id: "Q-JFS-017-02", type: "MCQ", prompt: "How do you eliminate the N+1 problem in JPQL queries?", options: ["By removing all relations", "Using `JOIN FETCH` to eagerly join and retrieve the child collection in a single SQL query", "Setting all fetches to EAGER", "Increasing HikariCP pool size"], answer: 1, points: 10 },
        { id: "Q-JFS-017-03", type: "MCQ", prompt: "Why should `FetchType.EAGER` be avoided on `@OneToMany` entity mappings?", options: ["It crashes the Java compiler", "It unconditionally fetches related collections on every entity load, causing massive performance degradation and uncontrolled memory consumption", "Hibernate does not support EAGER", "EAGER deletes related rows"], answer: 1, points: 10 },
        { id: "Q-JFS-017-04", type: "MCQ", prompt: "What does `Pageable` enable in Spring Data JPA repository methods?", options: ["Automatic database indexing", "Server-side SQL `LIMIT` and `OFFSET` pagination, preventing full-table memory loading", "Thread-safe connection pooling", "Database replication"], answer: 1, points: 10 },
        { id: "Q-JFS-017-05", type: "MCQ", prompt: "What annotation identifies a class as a JPA entity mapped to a database table?", options: ["@TableEntity", "@Entity", "@Model", "@DatabaseRecord"], answer: 1, points: 10 },
        { id: "Q-JFS-017-06", type: "MCQ", prompt: "What is the effect of `@Transactional(readOnly = true)` on Spring Data operations?", options: ["Prevents reading from the database", "Optimizes performance by telling Hibernate to skip dirty-checking snapshots on retrieved entities", "Locks the database table exclusively", "Rolls back all read statements"], answer: 1, points: 10 },
        { id: "Q-JFS-017-07", type: "MCQ", prompt: "What annotation specifies the primary key of an entity?", options: ["@Key", "@Id", "@PrimaryKey", "@Column(unique=true)"], answer: 1, points: 10 },
        { id: "Q-JFS-017-08", type: "MCQ", prompt: "What is the difference between JPA and Hibernate?", options: ["JPA is the specification/standard interface; Hibernate is the concrete ORM implementation", "Hibernate is written in C++; JPA is in Java", "JPA is only for NoSQL databases", "There is no difference"], answer: 0, points: 10 },
        { id: "Q-JFS-017-09", type: "MCQ", prompt: "What generation strategy uses a native database sequence to assign primary keys in PostgreSQL?", options: ["GenerationType.IDENTITY", "GenerationType.SEQUENCE", "GenerationType.TABLE", "GenerationType.AUTO"], answer: 1, points: 10 },
        { id: "Q-JFS-017-10", type: "MCQ", prompt: "What does the `cascade = CascadeType.ALL` attribute specify on a relationship?", options: ["Deletes the database table", "Propagates all entity state transitions (PERSIST, MERGE, REMOVE) from the parent entity to its associated children", "Forces immediate commit", "Disables transactions"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-018",
      title: "Spring Security 6 & JWT Assessment",
      chapterId: "CH-JFS-018",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-018-01", type: "MCQ", prompt: "What bean replaces the deprecated `WebSecurityConfigurerAdapter` in Spring Security 6?", options: ["SecurityFilterChain", "HttpSecurityBuilder", "WebSecurityBean", "SecurityManager"], answer: 0, points: 10 },
        { id: "Q-JFS-018-02", type: "MCQ", prompt: "What are the three dot-separated components of a JSON Web Token (JWT)?", options: ["Header, Payload, Signature", "Username, Password, Salt", "Issuer, Audience, Expiry", "Protocol, Body, Checksum"], answer: 0, points: 10 },
        { id: "Q-JFS-018-03", type: "MCQ", prompt: "Why is stateless JWT authentication preferred over HTTP Sessions in microservice architectures?", options: ["JWTs are encrypted by default", "Servers do not need to store or synchronize session state across clustered instances, enabling seamless horizontal autoscaling", "JWTs prevent all cross-site scripting", "Sessions are deprecated in HTTP/2"], answer: 1, points: 10 },
        { id: "Q-JFS-018-04", type: "MCQ", prompt: "What standard HTTP header transmits the JWT token in client API requests?", options: ["Cookie: jwt=...", "Authorization: Bearer <token>", "X-Auth-Token: <token>", "Proxy-Authorization: <token>"], answer: 1, points: 10 },
        { id: "Q-JFS-018-05", type: "MCQ", prompt: "What password encoder should be used to protect credentials against brute-force attacks?", options: ["MD5PasswordEncoder", "BCryptPasswordEncoder / Argon2PasswordEncoder", "PlainTextPasswordEncoder", "SHA1PasswordEncoder"], answer: 1, points: 10 },
        { id: "Q-JFS-018-06", type: "MCQ", prompt: "What annotation enables method-level security expressions like `@PreAuthorize(\"hasRole('ADMIN')\")`?", options: ["@EnableGlobalMethodSecurity / @EnableMethodSecurity", "@SecureMethods", "@AuthorizeAll", "@RoleGuard"], answer: 0, points: 10 },
        { id: "Q-JFS-018-07", type: "MCQ", prompt: "What is CORS (Cross-Origin Resource Sharing)?", options: ["A browser security mechanism that restricts web applications from making requests to a different domain/port than the one serving the frontend", "A backend database replication system", "A protocol for video streaming", "A password hashing algorithm"], answer: 0, points: 10 },
        { id: "Q-JFS-018-08", type: "MCQ", prompt: "What class in Spring Security represents the authenticated principal details in the SecurityContextHolder?", options: ["Authentication / UserDetails", "HttpSession", "PrincipalMap", "SecurityToken"], answer: 0, points: 10 },
        { id: "Q-JFS-018-09", type: "MCQ", prompt: "Why should CSRF protection generally be disabled for purely stateless REST APIs that authenticate exclusively via Bearer tokens in headers?", options: ["Because CSRF is an obsolete vulnerability", "Because browsers do not automatically attach custom Authorization headers to cross-origin requests, making CSRF attacks impossible", "Because CSRF tokens slow down database queries", "Because Spring Security does not support CSRF"], answer: 1, points: 10 },
        { id: "Q-JFS-018-10", type: "MCQ", prompt: "What filter base class in Spring ensures a filter executes exactly once per HTTP request dispatch?", options: ["GenericFilterBean", "OncePerRequestFilter", "HttpFilter", "SingletonFilter"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-019",
      title: "Frontend Foundations Assessment",
      chapterId: "CH-JFS-019",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-019-01", type: "MCQ", prompt: "What is the primary difference between CSS Flexbox and CSS Grid?", options: ["Flexbox is for 1-dimensional layouts (rows or columns); Grid is for 2-dimensional layouts (rows AND columns simultaneously)", "Flexbox only works on mobile", "Grid cannot handle text", "Flexbox is deprecated"], answer: 0, points: 10 },
        { id: "Q-JFS-019-02", type: "MCQ", prompt: "What keyword in JavaScript declares a variable that cannot be reassigned?", options: ["let", "var", "const", "final"], answer: 2, points: 10 },
        { id: "Q-JFS-019-03", type: "MCQ", prompt: "What is the behavior of the JavaScript `fetch()` API on an HTTP 404 or 500 response?", options: ["It rejects the promise immediately into the catch block", "The promise resolves successfully, and you must check `response.ok` or `response.status` manually", "The browser reloads the page", "It throws NetworkError"], answer: 1, points: 10 },
        { id: "Q-JFS-019-04", type: "MCQ", prompt: "What JavaScript syntax feature allows extracting properties from objects: `const { title, price } = course;`?", options: ["Object Destructuring", "Spread Operator", "Rest Parameters", "Prototype Chaining"], answer: 0, points: 10 },
        { id: "Q-JFS-019-05", type: "MCQ", prompt: "What does the keyword `async` placed before a function guarantee?", options: ["The function runs on a background web worker thread", "The function automatically returns a Promise", "The function executes synchronously", "The function cannot throw errors"], answer: 1, points: 10 },
        { id: "Q-JFS-019-06", type: "MCQ", prompt: "Which HTML5 semantic element represents independent, self-contained syndicatable content?", options: ["<section>", "<div>", "<article>", "<aside>"], answer: 2, points: 10 },
        { id: "Q-JFS-019-07", type: "MCQ", prompt: "What CSS unit is relative to the font-size of the root `<html>` element?", options: ["em", "rem", "px", "vh"], answer: 1, points: 10 },
        { id: "Q-JFS-019-08", type: "MCQ", prompt: "What does `array.map(x => x * 2)` return in JavaScript?", options: ["The sum of numbers", "A new array containing each original element multiplied by 2", "Mutates the original array in place", "A boolean value"], answer: 1, points: 10 },
        { id: "Q-JFS-019-09", type: "MCQ", prompt: "What is an arrow function's behavior regarding the `this` keyword?", options: ["It binds its own dynamic `this` context", "It lexically captures the `this` value of its enclosing context", "It sets `this` to null", "It creates a new class instance"], answer: 1, points: 10 },
        { id: "Q-JFS-019-10", type: "MCQ", prompt: "What media query feature adapts CSS styling based on browser viewport width?", options: ["@media (min-width: 768px)", "@screen (width > 768)", "@responsive 768", "@viewport 768"], answer: 0, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-020",
      title: "React 19 Fundamentals Assessment",
      chapterId: "CH-JFS-020",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-020-01", type: "MCQ", prompt: "What is JSX in React?", options: ["A new programming language that replaces JavaScript", "A syntax extension for JavaScript that looks like HTML, compiling down to `React.createElement` or JSX runtime calls", "A JSON data serialization format", "A styling framework like Tailwind"], answer: 1, points: 10 },
        { id: "Q-JFS-020-02", type: "MCQ", prompt: "What is the primary difference between Props and State in React?", options: ["Props are internal and mutable; State is external", "Props are passed into components from parents and immutable; State is internally managed and mutable via setter functions", "Props only hold strings; State holds objects", "There is no difference"], answer: 1, points: 10 },
        { id: "Q-JFS-020-03", type: "MCQ", prompt: "Why must a unique `key` prop be provided when rendering a list of elements?", options: ["For CSS styling selectors", "To help React's reconciliation algorithm identify which items have changed, been added, or removed, avoiding unnecessary re-renders", "To sort the array alphabetically", "It is required by the HTML standard"], answer: 1, points: 10 },
        { id: "Q-JFS-020-04", type: "MCQ", prompt: "What occurs when you update state using `setCount(count + 1)`?", options: ["The browser immediately reloads the page", "React schedules a re-render of the component with the new state value", "The DOM is wiped clean", "State changes synchronously on the next CPU cycle"], answer: 1, points: 10 },
        { id: "Q-JFS-020-05", type: "MCQ", prompt: "Why should you never mutate state objects directly (e.g., `user.name = 'Bob'`)?", options: ["JavaScript will throw a syntax error", "React checks state references for changes; mutating the existing object retains the same memory address, preventing re-renders", "It deletes all other properties", "It corrupts the browser cache"], answer: 1, points: 10 },
        { id: "Q-JFS-020-06", type: "MCQ", prompt: "How should you update an array in React state immutably?", options: ["array.push(newItem); setArray(array);", "setArray([...array, newItem]); using the spread operator", "setArray(array.sort());", "array[0] = newItem;"], answer: 1, points: 10 },
        { id: "Q-JFS-020-07", type: "MCQ", prompt: "What hook is used to declare local state in a functional component?", options: ["useLocal()", "useState()", "useComponentState()", "useMemory()"], answer: 1, points: 10 },
        { id: "Q-JFS-020-08", type: "MCQ", prompt: "What is the rule of React component composition?", options: ["Put all code into one giant component", "Break complex UI into small, reusable, single-responsibility components composed together", "Never nest components deeper than 1 level", "Always use class inheritance"], answer: 1, points: 10 },
        { id: "Q-JFS-020-09", type: "MCQ", prompt: "How do child components communicate events back up to parent components?", options: ["By modifying the parent's props directly", "By invoking callback functions passed down as props from the parent", "By dispatching global window events", "By writing to localStorage"], answer: 1, points: 10 },
        { id: "Q-JFS-020-10", type: "MCQ", prompt: "What is the Virtual DOM in React?", options: ["A 3D rendering engine", "A lightweight in-memory JavaScript representation of the actual DOM used for high-speed diffing", "A web browser extension", "A cloud server simulation"], answer: 1, points: 10 },
      ]
    },
    {
      id: "ASM-JFS-021",
      title: "Advanced React Hooks & Routing Assessment",
      chapterId: "CH-JFS-021",
      courseId: "CRS-JFS-001",
      type: "MCQ",
      ownerId: "EMP-1003",
      approval: "Approved",
      difficulty: "Intermediate",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        { id: "Q-JFS-021-01", type: "MCQ", prompt: "When does the callback inside `useEffect(() => { ... }, [])` with an empty dependency array execute?", options: ["On every component render", "Exactly once after the initial mount", "Only before component unmount", "Never"], answer: 1, points: 10 },
        { id: "Q-JFS-021-02", type: "MCQ", prompt: "What is the purpose of the return function inside a `useEffect` callback?", options: ["To return the final JSX markup", "To perform cleanup (canceling subscriptions, clearing timers, aborting network requests) before unmount or re-execution", "To trigger another effect", "To set error state"], answer: 1, points: 10 },
        { id: "Q-JFS-021-03", type: "MCQ", prompt: "What optimization does `useMemo` provide?", options: ["Caches the rendered HTML on disk", "Memoizes the result of an expensive calculation, recalculating only when specified dependencies change", "Caches HTTP responses in indexedDB", "Runs calculations in Web Workers"], answer: 1, points: 10 },
        { id: "Q-JFS-021-04", type: "MCQ", prompt: "What is the primary purpose of the `useCallback` hook?", options: ["To call APIs in parallel", "To return a memoized version of a callback function reference that only changes when its dependencies change, preventing child re-renders", "To handle asynchronous promises", "To navigate between routes"], answer: 1, points: 10 },
        { id: "Q-JFS-021-05", type: "MCQ", prompt: "What problem does the React Context API solve?", options: ["Prop drilling (passing props through many intermediate components that do not need them)", "Slow network latency", "CSS naming conflicts", "Memory leaks in garbage collection"], answer: 0, points: 10 },
        { id: "Q-JFS-021-06", type: "MCQ", prompt: "What React Router hook accesses URL route parameters like `/courses/:id`?", options: ["useRoute()", "useParams()", "useQuery()", "useLocation()"], answer: 1, points: 10 },
        { id: "Q-JFS-021-07", type: "MCQ", prompt: "What React Router hook enables programmatic navigation (e.g., redirecting after login)?", options: ["useHistory() in v6", "useNavigate()", "useRedirect()", "useLink()"], answer: 1, points: 10 },
        { id: "Q-JFS-021-08", type: "MCQ", prompt: "What is the Golden Rule of React Hooks?", options: ["Only call hooks from inside loops", "Only call hooks at the top level of React function components or custom hooks (never inside conditions, loops, or nested functions)", "Hooks must always return numbers", "Every component must have at least 5 hooks"], answer: 1, points: 10 },
        { id: "Q-JFS-021-09", type: "MCQ", prompt: "What hook creates a mutable reference that persists across renders without triggering a re-render on change?", options: ["useState", "useRef", "useMemo", "useContext"], answer: 1, points: 10 },
        { id: "Q-JFS-021-10", type: "MCQ", prompt: "What React feature enables code-splitting routes so JavaScript chunks load on demand?", options: ["React.lazy() and <Suspense>", "React.memo()", "useTransition()", "createPortal()"], answer: 0, points: 10 },
      ]
    }
  ]
};

