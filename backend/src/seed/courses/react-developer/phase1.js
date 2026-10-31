export const phase1 = {
  "chapters": [
    {
      "id": "CH-RCT-001",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 1,
      "title": "Modern JavaScript & React Mental Models: Virtual DOM to Fiber",
      "summary": "Understand how React truly works under the hood: ES6+ foundational idioms, closures in UI lifecycles, the JavaScript event loop, Virtual DOM mechanics, React Fiber reconciliation architecture, the Diffing Algorithm, and state immutability.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=N3AkSS5h2MA",
      "body": "<h2>1. The Evolution of Declarative UI</h2>\n<p>Before React, web user interfaces were constructed through <strong>imperative DOM manipulation</strong> using native JavaScript or libraries like jQuery. In an imperative model, developers wrote explicit step-by-step instructions to mutate the browser Document Object Model (DOM): find an element by ID, clear its contents, create a child node, set class attributes, and append it.</p>\n<p>As applications grew in complexity, keeping mutable DOM nodes synchronized with asynchronous backend server state became an unmaintainable nightmare. UI bugs, memory leaks, and race conditions proliferated because state was scattered across both the JavaScript memory heap and the DOM tree.</p>\n<p>React revolutionized frontend engineering by introducing the <strong>Declarative Component Paradigm</strong>:</p>\n<pre><code>UI = f(state)</code></pre>\n<p>In React, developers do not manipulate DOM nodes directly. Instead, they declare what the UI should look like for a given state at any point in time. When state changes, React automatically recalculates the UI and updates the browser DOM efficiently.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/N3AkSS5h2MA' title='How React Works Under the Hood' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Modern JavaScript Prerequisites for React</h2>\n<p>To write idiomatic React, developers must master core ES6+ language features:</p>\n<ul>\n  <li><strong>Closures in Functions:</strong> A function retains access to variables declared in its outer lexical scope even after that outer function has returned. In React, every component render creates a new closure that captures props and state for that specific execution cycle.</li>\n  <li><strong>Destructuring & Spread Operator (<code>...</code>):</strong> Enables shallow cloning of objects and arrays without mutating the original memory reference, which is vital for React state immutability.</li>\n  <li><strong>The Event Loop & Microtask Queue:</strong> Promises (microtasks) resolve before browser repaints and macrotasks (such as <code>setTimeout</code>). Understanding microtask timing explains how React batches state updates.</li>\n</ul>\n\n<h2>3. The Virtual DOM vs Browser Real DOM</h2>\n<p>The browser's native DOM is a tree of C++ objects representing HTML nodes. Direct mutations to the browser DOM are computationally expensive because altering node dimensions, styling, or positioning triggers continuous <strong>Style Calculation, Layout (Reflow), and Paint</strong> cycles across the GPU and CPU.</p>\n<p>The <strong>Virtual DOM (VDOM)</strong> is an in-memory, lightweight JavaScript object representation of the real DOM. Creating and mutating plain JavaScript objects in memory is thousands of times faster than touching real DOM nodes.</p>\n\n<h2>4. The React Fiber Reconciliation Architecture</h2>\n<p>Prior to React 16, React used the 'Stack Reconciler'. Reconciliation was synchronous and recursive: once React started comparing the previous and next component trees, it could not be paused. On complex dashboards with thousands of nodes, this monopolized the browser's single main thread, causing dropped animation frames (jank) and frozen user inputs.</p>\n<p>In React 16, the core engine was completely re-architected into <strong>React Fiber</strong>. Fiber is an internal reimplementation of the call stack specifically designed for UI rendering:</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Phase</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Name</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Execution Type</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Core Responsibilities</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Phase 1</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Render / Reconciliation Phase</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Asynchronous & Interruptible</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Walks the Fiber tree, calls component functions, calculates diffs, and assigns side-effect tags. React can pause this phase to yield to high-priority browser events (user clicks, keystrokes).</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Phase 2</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Commit Phase</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Synchronous & Uninterruptible</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Takes the calculated effect list from Phase 1 and mutates the physical browser DOM in a single rapid batch to prevent visual flicker. Fires layout effects and lifecycle hooks.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>5. The Diffing Algorithm & The Rule of Keys</h2>\n<p>Finding the absolute minimum number of mutations to transform one arbitrary tree into another has a computational complexity of O(n³). If an interface contained 1,000 elements, calculating tree diffs would require 1 billion operations. React achieves a blazing-fast <strong>O(n) linear complexity</strong> by employing two heuristic assumptions:</p>\n<ol>\n  <li><strong>Two elements of different types produce different trees:</strong> If an element changes from <code>&lt;div&gt;</code> to <code>&lt;section&gt;</code>, React tears down the old tree, destroys child state, and rebuilds the new sub-tree from scratch.</li>\n  <li><strong>The Developer can hint at element stability with <code>key</code> props:</strong> When rendering dynamic lists, elements must have a unique, stable <code>key</code>. Keys allow React to match children in the original tree with children in the subsequent tree (detecting insertions, deletions, and moves).</li>\n</ol>\n<h3>Why Array Indices as Keys is an Anti-Pattern:</h3>\n<p>Using array indices (<code>key={index}</code>) causes severe state corruption when items are inserted, deleted, or sorted. The key `0` remains attached to the first DOM row, causing uncontrolled form inputs or component state to stick to the wrong item.</p>\n\n<h2>6. Key Takeaways</h2>\n<ol>\n  <li>React models UI as a pure declarative projection of state: <code>UI = f(state)</code>.</li>\n  <li>Closures capture props and state for each specific component execution cycle.</li>\n  <li>The Virtual DOM minimizes expensive browser reflow and repaint cycles.</li>\n  <li>React Fiber splits rendering into an interruptible Render phase and a synchronous Commit phase.</li>\n  <li>React's O(n) heuristic diffing algorithm requires unique, stable keys for dynamic list rendering.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-002",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 2,
      "title": "JSX, Components, Props & TypeScript Strict Typings",
      "summary": "Write bulletproof React components with TypeScript: JSX compilation to React.createElement, Functional Components without React.FC, PropsWithChildren, Discriminated Unions for conditional props, and Generic Components.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=yUGFpQGv1rU",
      "body": "<h2>1. The Reality of JSX</h2>\n<p><strong>JSX (JavaScript XML)</strong> looks like HTML inside JavaScript, but it is not HTML. JSX is a syntax extension that transpiles down to standard JavaScript function calls. In modern React (React 17+ and React 19), the JSX transform automatically invokes the runtime without requiring manual <code>import React from 'react'</code>:</p>\n<pre><code>// What you write in JSX:\nconst button = &lt;button className='btn-primary' onClick={handleClick}&gt;Submit&lt;/button&gt;;\n\n// What the compiler outputs (React JSX runtime):\nimport { jsx as _jsx } from 'react/jsx-runtime';\nconst button = _jsx('button', {\n  className: 'btn-primary',\n  onClick: handleClick,\n  children: 'Submit'\n});</code></pre>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/yUGFpQGv1rU' title='TypeScript in React Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Functional Components: Why We Deprecate `React.FC`</h2>\n<p>In the early days of TypeScript with React, developers commonly typed components using <code>const MyComponent: React.FC&lt;Props&gt; = ...</code>. Modern production codebases avoid <code>React.FC</code> for several reasons:</p>\n<ul>\n  <li>Historically, <code>React.FC</code> implicitly injected an optional <code>children</code> prop into every component, even if the component was never designed to accept children (e.g., an icon button).</li>\n  <li>It makes typing <strong>Generic Components</strong> awkwardly verbose.</li>\n  <li>Standard TypeScript function definitions provide cleaner syntax, superior type inference, and direct prop destructuring.</li>\n</ul>\n\n<h3>Modern Idiomatic Component Signature:</h3>\n<pre><code>interface ButtonProps extends React.ButtonHTMLAttributes&lt;HTMLButtonElement&gt; {\n  variant?: 'primary' | 'secondary' | 'danger';\n  isLoading?: boolean;\n  children: React.ReactNode;\n}\n\nexport function Button({\n  variant = 'primary',\n  isLoading = false,\n  children,\n  disabled,\n  ...rest\n}: ButtonProps) {\n  return (\n    &lt;button disabled={disabled || isLoading} className={`btn btn-${variant}`} {...rest}&gt;\n      {isLoading ? &lt;Spinner /&gt; : children}\n    &lt;/button&gt;\n  );\n}</code></pre>\n\n<h2>3. Discriminated Unions for Mutually Exclusive Props</h2>\n<p>A common UI bug occurs when components receive conflicting props (e.g., passing both an <code>href</code> link and an <code>onClick</code> button handler). TypeScript <strong>Discriminated Unions</strong> eliminate invalid state combinations at compile time:</p>\n<pre><code>type ButtonAsLinkProps = {\n  as: 'link';\n  href: string;\n  onClick?: never;\n  children: React.ReactNode;\n};\n\ntype ButtonAsButtonProps = {\n  as: 'button';\n  href?: never;\n  onClick: () => void;\n  children: React.ReactNode;\n};\n\ntype ActionTriggerProps = ButtonAsLinkProps | ButtonAsButtonProps;\n\nexport function ActionTrigger(props: ActionTriggerProps) {\n  if (props.as === 'link') {\n    return &lt;a href={props.href}&gt;{props.children}&lt;/a&gt;;\n  }\n  return &lt;button onClick={props.onClick}&gt;{props.children}&lt;/button&gt;;\n}</code></pre>\n\n<h2>4. Generic Components in TypeScript</h2>\n<p>When building reusable UI elements like dropdown pickers or tables, the component should accept arbitrary data structures while preserving complete type safety for consumers:</p>\n<pre><code>interface SelectProps&lt;T&gt; {\n  items: T[];\n  value: T;\n  onChange: (item: T) => void;\n  renderLabel: (item: T) => string;\n  keyExtractor: (item: T) => string | number;\n}\n\nexport function Select&lt;T&gt;({\n  items,\n  value,\n  onChange,\n  renderLabel,\n  keyExtractor,\n}: SelectProps&lt;T&gt;) {\n  return (\n    &lt;ul className='select-list'&gt;\n      {items.map((item) =&gt; (\n        &lt;li key={keyExtractor(item)} onClick={() =&gt; onChange(item)}&gt;\n          {renderLabel(item)}\n        &lt;/li&gt;\n      ))}\n    &lt;/ul&gt;\n  );\n}</code></pre>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>JSX transpiles into <code>_jsx</code> function calls that produce lightweight virtual DOM descriptors.</li>\n  <li>Avoid <code>React.FC</code>; use standard TypeScript function declarations with explicit prop interfaces.</li>\n  <li>Extend native HTML attributes (e.g., <code>ButtonHTMLAttributes</code>) to inherit standard DOM attributes.</li>\n  <li>Discriminated Unions enforce mutually exclusive props at compile time, eliminating invalid runtime states.</li>\n  <li>Generic components allow reusable UI widgets to handle typed data structures with complete type safety.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-003",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 3,
      "title": "State, Event Handling & Synthetic Events",
      "summary": "Master component reactivity: useState mechanics, functional state updates, automatic batching across asynchronous boundaries in React 18/19, React's SyntheticEvent system, event delegation, and controlled vs uncontrolled form components.",
      "readingTimeMinutes": 37,
      "videoUrl": "https://www.youtube.com/watch?v=O6P86hr94u8",
      "body": "<h2>1. State: The Memory of a Component</h2>\n<p>In React, normal local variables do not persist across renders; when a function component finishes executing, its local execution frame is cleared by garbage collection. To persist data across re-renders and trigger UI updates, React provides the <code>useState</code> hook.</p>\n<p>State should be treated as <strong>read-only / immutable</strong>. Directly mutating a state object (e.g., <code>user.name = 'Alice'</code>) fails to trigger a re-render because React performs a shallow reference equality check (<code>Object.is</code>) on the state pointer.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/O6P86hr94u8' title='React State and Event Handling' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Functional State Updates & Race Conditions</h2>\n<p>When an upcoming state calculation depends on the prior state value, relying on the raw state variable can produce stale closure bugs if multiple updates occur in rapid succession:</p>\n<pre><code>// Flawed: Stale state reading\nfunction handleIncrement() {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n  // Result: count only increments by 1, because 'count' was evaluated once during this render closure\n}\n\n// Correct: Functional state updater\nfunction handleIncrementFunctional() {\n  setCount(prev => prev + 1);\n  setCount(prev => prev + 1);\n  setCount(prev => prev + 1);\n  // Result: count increments by 3 accurately because each update queues a pure updater function\n}</code></pre>\n\n<h2>3. Automatic Batching Across React 18 and React 19</h2>\n<p><strong>Batching</strong> is React's optimization where multiple state update calls are grouped into a single re-render cycle for performance. In legacy React 17, batching only occurred within native React event handlers (like <code>onClick</code>). State updates inside Promises, <code>setTimeout</code>, or async callbacks triggered multiple sequential re-renders.</p>\n<p>In <strong>React 18 and React 19</strong>, <strong>Automatic Batching</strong> is enabled everywhere by default. Whether updates occur in a fetch callback, setTimeout, or event listener, React combines them into a single commit to the DOM.</p>\n\n<h2>4. React's SyntheticEvent System & Event Delegation</h2>\n<p>React does not attach event listeners directly to individual DOM nodes. If you render a table with 1,000 clickable rows, attaching 1,000 individual event listeners would consume massive memory.</p>\n<ul>\n  <li><strong>Event Delegation at Root:</strong> React attaches a single global event listener at the root container (<code>#root</code>) for each event type. When an event fires, it bubbles up to the root, where React identifies the target component and dispatches the event.</li>\n  <li><strong>SyntheticEvent:</strong> React wraps native browser events in a cross-browser <code>SyntheticEvent</code> object. This guarantees identical event properties and behaviors across Chrome, Safari, Firefox, and Edge.</li>\n  <li><strong>Accessing Native Event:</strong> If native low-level DOM event data is required, it is accessible via <code>e.nativeEvent</code>.</li>\n</ul>\n\n<h2>5. Controlled vs Uncontrolled Components</h2>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Dimension</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Controlled Components</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Uncontrolled Components</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Source of Truth</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>React State (<code>value={val} onChange={setVal}</code>)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Browser DOM (<code>ref={inputRef} defaultValue={val}</code>)</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Re-renders</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Re-renders on every keystroke.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Zero re-renders while typing. Values queried on submit.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Best Use Case</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Real-time validation, dynamic masking, dependent fields.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Ultra-high-performance large forms (React Hook Form, file uploads).</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>6. Key Takeaways</h2>\n<ol>\n  <li>Treat React state as strictly immutable; never mutate existing objects directly.</li>\n  <li>Always use functional state updates (<code>setCount(prev => prev + 1)</code>) when new state depends on prior state.</li>\n  <li>Automatic Batching in React 18/19 groups state updates across promises, timeouts, and native listeners.</li>\n  <li>SyntheticEvents normalize browser inconsistencies and leverage root event delegation for memory efficiency.</li>\n  <li>Controlled inputs bind value to React state; uncontrolled inputs query the DOM via refs on submit.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-004",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 4,
      "title": "Side Effects, Lifecycles & useEffect Deep Dive",
      "summary": "Understand synchronization and component lifecycles: the mental model of useEffect, cleanup functions and subscription teardowns, dependency array reference equality, eliminating useEffect anti-patterns, and synchronizing with external stores.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=0ZJgIjIuY7U",
      "body": "<h2>1. The Mental Model of useEffect: Synchronization, Not Lifecycles</h2>\n<p>One of the biggest misconceptions in modern React is treating <code>useEffect</code> as a 1:1 replacement for class component lifecycle methods (<code>componentDidMount</code>, <code>componentDidUpdate</code>, <code>componentWillUnmount</code>).</p>\n<p><code>useEffect</code> is a mechanism for <strong>synchronizing your component with external systems</strong>—systems outside of React's declarative state control, such as browser DOM APIs, WebSockets, analytical telemetry, or network timers.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/0ZJgIjIuY7U' title='useEffect Deep Dive Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Anatomy of the Effect Hook</h2>\n<pre><code>useEffect(() => {\n  // 1. Setup Phase: Synchronize with external system\n  const connection = chatAPI.connect(roomId);\n\n  // 2. Cleanup Function: Teardown synchronization before next run or unmount\n  return () => {\n    connection.disconnect();\n  };\n}, [roomId]); // 3. Dependency Array: Re-run effect only if roomId reference changes</code></pre>\n\n<h3>The Role of Cleanup Functions:</h3>\n<p>Cleanup functions are critical to prevent memory leaks and race conditions. Before an effect runs again with new props, React <em>first invokes the previous effect's cleanup function</em> to tear down the old subscription.</p>\n<p>In React 18/19 Strict Mode in local development, React intentionally mounts, unmounts, and re-mounts every component to verify that effect setup and cleanup functions are perfectly symmetric and resilient.</p>\n\n<h2>3. Dependency Array Mechanics & Referential Equality</h2>\n<p>React evaluates the dependency array using <code>Object.is</code> reference comparison. Passing complex objects or inline functions into dependencies causes infinite re-render loops:</p>\n<pre><code>// Dangerous: Object created inline has a new memory reference every render!\nconst options = { threshold: 0.5 };\nuseEffect(() => {\n  const observer = new IntersectionObserver(callback, options);\n  return () => observer.disconnect();\n}, [options]); // Causes infinite effect execution!</code></pre>\n\n<h2>4. Eliminating useEffect Anti-Patterns</h2>\n<p>According to the official React documentation (<em>'You Might Not Need an Effect'</em>), over 60% of effects in production apps are redundant and can be replaced with cleaner declarative alternatives:</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Common Anti-Pattern</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Why It Fails</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>The Clean Idiomatic Solution</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Transforming Data for Rendering:</strong> Updating state in an effect after props change.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Triggers an unnecessary second render pass, causing layout jitter.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Calculate derived values directly during render: <code>const fullName = firstName + ' ' + lastName;</code></td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Handling User Events:</strong> Triggering an analytics event or checkout API call via an effect observing state.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Difficult to trace causality; effects can re-fire unintentionally on unrelated state shifts.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Place event-driven actions directly inside the event handler (<code>onClick</code>).</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Fetching Data on Mount:</strong> Writing raw <code>fetch</code> inside an un-debounced <code>useEffect</code>.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Suffers from race conditions, missing caching, no retry logic, and waterfalls.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Use a dedicated server-state library (TanStack Query) or modern Server Components.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>Use <code>useEffect</code> exclusively to synchronize components with external non-React systems.</li>\n  <li>Every effect that subscribes to external listeners must return a corresponding cleanup function.</li>\n  <li>Strict Mode double-mounting verifies that setup and cleanup functions are resilient.</li>\n  <li>Calculate derived state directly during render instead of storing it in extra state via effects.</li>\n  <li>Handle user event logic inside event handlers rather than observing state shifts in effects.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-005",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 5,
      "title": "Memory, References & Optimization: useRef, useMemo & useCallback",
      "summary": "Optimize component execution and manage references: useRef for mutable instance variables and DOM nodes, useMemo for computationally expensive algorithms, useCallback for referential stability of function props, and React.memo.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=DEPwA3mv_R8",
      "body": "<h2>1. The Spectrum of Memory & Reference Hooks</h2>\n<p>React components re-execute their entire function body on every render. Every variable, object literal, and inline callback declared inside the component is recreated from scratch in memory. While JavaScript engines are exceptionally fast at allocating memory, unnecessary object recreations can break downstream child optimizations and trigger severe performance degradation.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/DEPwA3mv_R8' title='useMemo, useCallback and useRef Explained' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. useRef: Mutable Storage Without Re-Renders</h2>\n<p>The <code>useRef</code> hook returns a persistent object containing a single mutable property: <code>{ current: value }</code>. Unlike state, <strong>mutating ref.current does NOT trigger a re-render</strong>.</p>\n<h3>Primary Applications of useRef:</h3>\n<ol>\n  <li><strong>Direct DOM Node Access:</strong> Focusing input fields, measuring element scroll positions, or integrating with imperative third-party canvas or chart libraries (D3.js, Chart.js).</li>\n  <li><strong>Storing Instance Variables:</strong> Keeping track of timer IDs (<code>setInterval</code>), previous prop values, or abort controllers across render cycles without causing infinite render loops.</li>\n</ol>\n\n<h2>3. useMemo: Caching Expensive Computations</h2>\n<p><code>useMemo</code> caches the result of a CPU-intensive calculation between renders, only recalculating when specified dependencies change:</p>\n<pre><code>const visibleTodos = useMemo(() => {\n  // Expensive sorting and filtering across 10,000 items\n  return filterAndSortLargeDataset(todos, filterMode, sortOrder);\n}, [todos, filterMode, sortOrder]);</code></pre>\n<h3>When to use useMemo:</h3>\n<ul>\n  <li>When the computation takes > 1ms of CPU time (verifiable with <code>console.time</code>).</li>\n  <li>When creating an object or array that is passed as a dependency to another hook (preventing infinite loops).</li>\n  <li>When passing a complex object prop to a child component wrapped in <code>React.memo</code>.</li>\n</ul>\n\n<h2>4. useCallback: Preserving Referential Stability</h2>\n<p>In JavaScript, <code>function() {} !== function() {}</code>; two distinct function declarations never share referential equality. Every time a parent component re-renders, any inline callback function passed to child components receives a new memory address, defeating child memoization.</p>\n<p><code>useCallback</code> caches the <em>function definition itself</em> between renders:</p>\n<pre><code>const handleDelete = useCallback((id: string) => {\n  deleteItemFromBackend(id);\n  setItems(prev => prev.filter(item => item.id !== id));\n}, []); // Empty dependencies ensures this function reference remains identical across all renders</code></pre>\n\n<h2>5. React.memo for Child Component Pure Rendering</h2>\n<p>By default, when a parent component renders, <em>all of its child components re-render unconditionally</em>, even if their props have not changed. Wrapping a child component in <code>React.memo</code> performs a shallow prop comparison:</p>\n<pre><code>export const ExpensiveListRow = React.memo(function ExpensiveListRow({ item, onDelete }: RowProps) {\n  return &lt;div&gt;...&lt;/div&gt;;\n});</code></pre>\n<p>If <code>item</code> has not changed and <code>onDelete</code> was wrapped in <code>useCallback</code>, React skips rendering <code>ExpensiveListRow</code> completely, saving massive rendering time on large lists.</p>\n\n<h2>6. Key Takeaways</h2>\n<ol>\n  <li><code>useRef</code> stores mutable values that persist across renders without triggering a re-render.</li>\n  <li><code>useMemo</code> caches the return value of expensive computations across render cycles.</li>\n  <li><code>useCallback</code> caches function instances to preserve referential stability for child props.</li>\n  <li><code>React.memo</code> skips child component re-renders when props pass shallow equality checks.</li>\n  <li>Over-optimizing with memoization everywhere introduces memory overhead; optimize based on profiler data.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-006",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 6,
      "title": "Context API & Prop Drilling Mitigation",
      "summary": "Manage global cross-cutting data: createContext, useContext, solving the prop drilling antipattern, Provider composition patterns, avoiding Context re-render performance bottlenecks, and modular state partitioning.",
      "readingTimeMinutes": 37,
      "videoUrl": "https://www.youtube.com/watch?v=5LrDIWkK_Bc",
      "body": "<h2>1. The Problem of Prop Drilling</h2>\n<p>In standard React architecture, data flows unidirectionally from parent to child via props. When a piece of state (such as the current authenticated user, UI color theme, or localization language) is needed by a component deeply nested 8 levels down the component tree, every intermediate parent must accept and forward the prop—even if they have zero need for that data.</p>\n<p>This maintenance headache is known as <strong>Prop Drilling</strong>. It couples unrelated components and makes refactoring structural layouts painful.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/5LrDIWkK_Bc' title='React Context API Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Modern Context Architecture with Custom Hooks</h2>\n<p>Professional React architectures avoid exposing raw Context objects directly. Instead, they encapsulate the Context within a dedicated Provider component and export a safe custom consumer hook:</p>\n<pre><code>interface AuthContextType {\n  user: User | null;\n  login: (credentials: Credentials) => Promise&lt;void&gt;;\n  logout: () => void;\n}\n\nconst AuthContext = createContext&lt;AuthContextType | undefined&gt;(undefined);\n\nexport function AuthProvider({ children }: { children: React.ReactNode }) {\n  const [user, setUser] = useState&lt;User | null&gt;(null);\n\n  const login = useCallback(async (creds: Credentials) => {\n    const authenticatedUser = await authApi.login(creds);\n    setUser(authenticatedUser);\n  }, []);\n\n  const logout = useCallback(() => setUser(null), []);\n\n  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);\n\n  return &lt;AuthContext.Provider value={value}&gt;{children}&lt;/AuthContext.Provider&gt;;\n}\n\nexport function useAuth(): AuthContextType {\n  const context = useContext(AuthContext);\n  if (!context) {\n    throw new Error('useAuth must be used within an AuthProvider');\n  }\n  return context;\n}</code></pre>\n\n<h2>3. The Context Performance Trap</h2>\n<p>A critical architectural reality of the React Context API: <strong>every component that calls <code>useContext(MyContext)</code> will re-render whenever the Context <code>value</code> reference changes</strong>, completely bypassing <code>React.memo</code>.</p>\n<h3>The Antipattern: Monolithic Giant Context:</h3>\n<p>If an application stores <code>{ user, theme, cartItems, notifications, searchFilter }</code> in a single global Context, typing a single character into the search filter updates the Context value, triggering simultaneous re-renders across all navbar icons, shopping cart widgets, and profile avatars.</p>\n\n<h2>4. Solution: Context Splitting & Modular Providers</h2>\n<p>To guarantee elite performance, split Contexts by operational update frequency:</p>\n<ul>\n  <li><strong>Separate State from Dispatch:</strong> Create one Context for data that changes frequently (<code>CartStateContext</code>) and a separate Context for immutable action dispatchers (<code>CartDispatchContext</code>). Components that only dispatch actions never re-render when cart items change!</li>\n  <li><strong>Domain Partitioning:</strong> Separate <code>AuthContext</code> (infrequent updates) from <code>ThemeContext</code> and <code>RealTimeNotificationContext</code>.</li>\n</ul>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>Context solves prop drilling by providing ambient data access anywhere in the component tree.</li>\n  <li>Always encapsulate Context behind a Provider and export a type-safe custom consumer hook.</li>\n  <li>Throw a clear error in custom consumer hooks when used outside their corresponding Provider.</li>\n  <li>Every consumer re-renders when Context value changes; avoid monolithic giant context objects.</li>\n  <li>Split Context into independent domain slices and separate state data from action dispatchers.</li>\n</ol>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-RCT-001",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-001",
      "title": "Assessment: Modern JavaScript & React Mental Models",
      "summary": "Test your comprehension of declarative UI, Virtual DOM, React Fiber phases (Render vs Commit), Diffing heuristics, and the rule of keys.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-001",
          "question": "What is the defining difference between Imperative UI programming and React's Declarative paradigm?",
          "options": [
            "Imperative code runs faster in web browsers.",
            "Imperative programming specifies step-by-step DOM mutations; Declarative React specifies what the UI should look like for a given state (UI = f(state)).",
            "Declarative UI can only be written in Python.",
            "Imperative UI does not support CSS."
          ],
          "correctIndex": 1,
          "explanation": "In declarative React, developers declare UI as a pure projection of state, leaving DOM updates and tree mutations to the underlying reconciliation engine."
        },
        {
          "id": "Q-RCT-002",
          "question": "Why is direct mutation of the browser's native DOM computationally expensive?",
          "options": [
            "Because DOM mutations cost real money on cloud hosting.",
            "Because altering DOM nodes triggers expensive browser Style Calculations, Layout Reflows, and GPU Painting passes.",
            "Because browsers limit DOM mutations to 10 per hour.",
            "Because HTML does not support JavaScript."
          ],
          "correctIndex": 1,
          "explanation": "Touching the browser DOM forces the layout engine to recalculate geometric bounds and repaint pixels, which is orders of magnitude slower than in-memory JavaScript operations."
        },
        {
          "id": "Q-RCT-003",
          "question": "What major performance problem did the React Fiber reconciler solve that plagued the legacy Stack Reconciler?",
          "options": [
            "The Stack Reconciler could not render images.",
            "The Stack Reconciler was synchronous and recursive, blocking the main thread during deep tree reconciliations; Fiber introduced interruptible, cooperative scheduling.",
            "Fiber eliminated the need for JavaScript.",
            "Fiber reduced file download sizes to zero."
          ],
          "correctIndex": 1,
          "explanation": "React Fiber allows the reconciliation (Render) phase to be paused, prioritized, or aborted so the browser main thread can respond immediately to user clicks and keystrokes."
        },
        {
          "id": "Q-RCT-004",
          "question": "Which phase of React Fiber execution is SYNCHRONOUS and UNINTERRUPTIBLE?",
          "options": [
            "The Render Phase",
            "The Reconciliation Phase",
            "The Commit Phase",
            "The Compilation Phase"
          ],
          "correctIndex": 2,
          "explanation": "The Commit phase applies calculated mutations to the actual browser DOM synchronously in a single rapid batch to prevent visual UI tearing and flickering."
        },
        {
          "id": "Q-RCT-005",
          "question": "How does React achieve an O(n) linear tree diffing complexity instead of the theoretical O(n³) general tree comparison?",
          "options": [
            "By using quantum computing.",
            "By applying two heuristics: elements of different types generate completely different trees, and elements in dynamic lists are tracked via developer-supplied `key` props.",
            "By diffing only every third element.",
            "By ignoring CSS class names."
          ],
          "correctIndex": 1,
          "explanation": "React's heuristic diffing assumes elements of different types produce different trees and uses unique keys to track list items, reducing complexity from O(n³) to O(n)."
        },
        {
          "id": "Q-RCT-006",
          "question": "Why is using array index (e.g., `key={index}`) an antipattern for dynamic, re-orderable lists in React?",
          "options": [
            "Because indices take up too much memory.",
            "When items are inserted, deleted, or sorted, indices shift, causing React to associate internal component state and DOM inputs with the wrong data rows.",
            "Because TypeScript throws a compile error.",
            "Because array indices are not numbers."
          ],
          "correctIndex": 1,
          "explanation": "Indices are positional, not identity-based; modifying list order scrambles stateful DOM inputs when keys are tied to positions rather than unique item IDs."
        },
        {
          "id": "Q-RCT-007",
          "question": "What is a JavaScript 'Closure', and why is it foundational to understanding React component renders?",
          "options": [
            "A tag that closes an HTML element.",
            "A function's ability to retain access to variables in its outer lexical scope even after that outer function has executed, preserving state bindings per render.",
            "A syntax error that halts execution.",
            "A method to close browser tabs."
          ],
          "correctIndex": 1,
          "explanation": "Every component render is a fresh function call whose closures capture props, state, and event handlers specific to that render's snapshot in time."
        },
        {
          "id": "Q-RCT-008",
          "question": "What happens in the browser when a state change occurs in React?",
          "options": [
            "The browser reloads the entire HTML page from the web server.",
            "React calculates the new Virtual DOM tree, diffs it against the previous Fiber tree, and applies the minimal set of required mutations to the real DOM.",
            "React clears all local storage.",
            "The user's session is terminated."
          ],
          "correctIndex": 1,
          "explanation": "React reconciles the Virtual DOM in memory and computes the exact delta of DOM changes needed, updating only affected nodes."
        },
        {
          "id": "Q-RCT-009",
          "question": "What is the primary benefit of state immutability in React applications?",
          "options": [
            "It saves hard drive disk space.",
            "It allows React to perform fast reference equality checks (`Object.is`) to instantly determine if data has changed, avoiding deep object traversals.",
            "It prevents users from inspecting the DOM.",
            "It eliminates the need for unit testing."
          ],
          "correctIndex": 1,
          "explanation": "Because immutable updates create new object references, React can verify whether state changed by comparing memory pointers in a single CPU cycle."
        },
        {
          "id": "Q-RCT-010",
          "question": "In the JavaScript event loop, what executes first upon the completion of a synchronous script block?",
          "options": [
            "Macrotasks (e.g., `setTimeout` callbacks)",
            "Microtasks (e.g., Promise `.then` callbacks)",
            "Browser garbage collection",
            "Network HTTP requests"
          ],
          "correctIndex": 1,
          "explanation": "Microtasks (Promises) have higher priority and drain completely before the event loop processes macrotasks or schedules browser repaints."
        }
      ]
    },
    {
      "id": "ASM-RCT-002",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-002",
      "title": "Assessment: JSX, Components, Props & TypeScript Typings",
      "summary": "Evaluate your capability in JSX transforms, modern functional component signatures without React.FC, Discriminated Unions for props, and Generic Components.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-011",
          "question": "What does the JSX expression `<div className='box'>Hello</div>` actually transpile into in modern React?",
          "options": [
            "A raw HTML string sent to `document.write`.",
            "A call to `_jsx('div', { className: 'box', children: 'Hello' })` producing a virtual DOM object descriptor.",
            "A binary WebAssembly blob.",
            "A SQL query."
          ],
          "correctIndex": 1,
          "explanation": "JSX is syntactic sugar that compiles down to `_jsx` runtime function calls, producing lightweight virtual DOM tree descriptors."
        },
        {
          "id": "Q-RCT-012",
          "question": "Why does the React TypeScript community advise against typing components as `React.FC` in modern applications?",
          "options": [
            "Because `React.FC` is deprecated by Microsoft.",
            "`React.FC` historically injected an implicit `children` prop on every component and makes typing Generic Components unnecessarily awkward and verbose.",
            "`React.FC` reduces browser performance by 50%.",
            "`React.FC` does not support CSS styling."
          ],
          "correctIndex": 1,
          "explanation": "Standard function signatures provide better type inference, explicit control over children, and seamless generic parameter support."
        },
        {
          "id": "Q-RCT-013",
          "question": "What is the primary benefit of using TypeScript 'Discriminated Unions' when defining component prop types?",
          "options": [
            "It translates React code into Swift.",
            "It prevents invalid, contradictory combinations of props at compile time (e.g., passing both an `href` link and an `onClick` button handler).",
            "It automatically compresses image assets.",
            "It enables dark mode."
          ],
          "correctIndex": 1,
          "explanation": "Discriminated unions use a common literal discriminant property to make mutually exclusive props type-safe, eliminating illegal prop states at compile time."
        },
        {
          "id": "Q-RCT-014",
          "question": "How should a custom Button component be typed so it inherits all native HTML `<button>` attributes (like `disabled`, `type`, `aria-label`)?",
          "options": [
            "By writing out all 100 HTML attributes manually.",
            "By having its props interface extend `React.ButtonHTMLAttributes<HTMLButtonElement>`.",
            "By typing props as `any`.",
            "By wrapping the button in an `<iframe>`."
          ],
          "correctIndex": 1,
          "explanation": "Extending `ButtonHTMLAttributes<HTMLButtonElement>` automatically provides full TypeScript typing for all standard HTML button attributes."
        },
        {
          "id": "Q-RCT-015",
          "question": "What is a 'Generic Component' in React with TypeScript?",
          "options": [
            "A boring component with no styles.",
            "A component parameterized by a type variable (e.g., `<T,>`), allowing it to accept and render arbitrary data types with complete type safety for consumers.",
            "A component that works across all web browsers.",
            "A component that requires no props."
          ],
          "correctIndex": 1,
          "explanation": "Generic components allow reusable components (like lists and select dropdowns) to operate flexibly over diverse data models while preserving type inference."
        },
        {
          "id": "Q-RCT-016",
          "question": "What type should be used for a component prop that accepts any valid renderable React content (strings, numbers, JSX elements, fragments, or null)?",
          "options": [
            "`string`",
            "`React.ReactNode`",
            "`HTMLElement`",
            "`React.ReactElement`"
          ],
          "correctIndex": 1,
          "explanation": "`React.ReactNode` is the comprehensive union type representing any primitive or virtual element that React can safely render into the DOM."
        },
        {
          "id": "Q-RCT-017",
          "question": "In the new React JSX transform (React 17+ / React 19), why is `import React from 'react'` no longer required at the top of component files?",
          "options": [
            "Because React was removed from NPM.",
            "The compiler automatically imports the required JSX runtime functions (`_jsx`) from `react/jsx-runtime` behind the scenes.",
            "Because browsers now understand JSX natively.",
            "Because Vite writes all JavaScript code."
          ],
          "correctIndex": 1,
          "explanation": "Modern JSX compilation imports functions directly from the runtime package, removing the historical requirement to keep React in scope."
        },
        {
          "id": "Q-RCT-018",
          "question": "What TypeScript utility type extracts the exact prop types of an existing component?",
          "options": [
            "`React.ComponentProps<typeof MyComponent>`",
            "`typeof MyComponent.props`",
            "`ExtractProps<MyComponent>`",
            "`PropsOf<MyComponent>`"
          ],
          "correctIndex": 0,
          "explanation": "`React.ComponentProps<T>` extracts the inferred or defined prop types of any React component or native HTML element."
        },
        {
          "id": "Q-RCT-019",
          "question": "Why should default values for optional props be assigned via JavaScript object destructuring rather than `defaultProps`?",
          "options": [
            "Because `defaultProps` is deprecated for function components in modern React and creates typing mismatches with TypeScript.",
            "Because destructuring uses less memory.",
            "Because `defaultProps` only works in class components.",
            "Both A and C are correct."
          ],
          "correctIndex": 3,
          "explanation": "`defaultProps` is deprecated for functional components in modern React; assigning defaults in parameter destructuring is the official standard."
        },
        {
          "id": "Q-RCT-020",
          "question": "What happens if a component renders `null` in React?",
          "options": [
            "The browser crashes with a null pointer exception.",
            "React renders nothing to the DOM, leaving the DOM untouched at that node location.",
            "React renders the string 'null' on screen.",
            "React throws a warning in the console."
          ],
          "correctIndex": 1,
          "explanation": "Returning `null` instructs React's reconciliation engine to skip DOM rendering for that component entirely."
        }
      ]
    },
    {
      "id": "ASM-RCT-003",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-003",
      "title": "Assessment: State, Event Handling & Synthetic Events",
      "summary": "Test your mastery of useState immutability, functional updates, automatic batching across async boundaries, SyntheticEvent delegation, and controlled components.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-021",
          "question": "Why does mutating a state object directly (e.g., `user.name = 'Alice'`) fail to trigger a component re-render in React?",
          "options": [
            "Because state objects are permanently frozen by the operating system.",
            "React relies on reference equality (`Object.is`); since the object memory address did not change, React assumes state is unchanged and skips re-rendering.",
            "Because JavaScript does not allow object property mutation.",
            "Because only strings can be stored in state."
          ],
          "correctIndex": 1,
          "explanation": "React checks if `Object.is(prevState, nextState)` is true; mutating in-place leaves the memory reference identical, so React aborts the render."
        },
        {
          "id": "Q-RCT-022",
          "question": "When should you use a functional state update (e.g., `setCount(prev => prev + 1)`) instead of passing a value directly (`setCount(count + 1)`)?",
          "options": [
            "Only on mobile devices.",
            "Whenever the new state value depends on the previous state value, preventing stale closure values during batched updates or async transitions.",
            "Whenever you are working with numbers.",
            "Only when using Redux."
          ],
          "correctIndex": 1,
          "explanation": "Functional updaters receive the guaranteed latest state at execution time, preventing stale closure values when updates are queued."
        },
        {
          "id": "Q-RCT-023",
          "question": "What does 'Automatic Batching' in React 18 and React 19 do?",
          "options": [
            "It automatically downloads npm packages in batches.",
            "It groups multiple state updates into a single re-render, even inside Promises, setTimeout callbacks, and native event handlers.",
            "It executes multiple API requests in parallel.",
            "It compresses JavaScript bundles."
          ],
          "correctIndex": 1,
          "explanation": "React 18/19 extended batching across all asynchronous boundaries, ensuring components only render once even after multiple async state calls."
        },
        {
          "id": "Q-RCT-024",
          "question": "How does React's SyntheticEvent system optimize memory when managing thousands of interactive table rows?",
          "options": [
            "By clearing the browser cache every minute.",
            "By utilizing event delegation, attaching a single shared event listener at the root container rather than thousands of individual listeners to each DOM node.",
            "By converting events into WebSockets.",
            "By running event handlers on a background thread."
          ],
          "correctIndex": 1,
          "explanation": "React delegates events at the root node, catching bubbling events and mapping them to components without overloading memory with listeners."
        },
        {
          "id": "Q-RCT-025",
          "question": "What defines a 'Controlled Component' in React form architecture?",
          "options": [
            "A form controlled by an AI chatbot.",
            "An input element whose value is driven entirely by React state and updated via an `onChange` event handler.",
            "An input that cannot be edited by the user.",
            "A form protected by CAPTCHA."
          ],
          "correctIndex": 1,
          "explanation": "Controlled inputs have React state as their single source of truth, managing input value and changes through component state."
        },
        {
          "id": "Q-RCT-026",
          "question": "What is an 'Uncontrolled Component'?",
          "options": [
            "A component that crashes frequently.",
            "An input element that stores its own state internally in the browser DOM, accessed in React via a `ref` on form submission.",
            "A component with no CSS styles.",
            "A component without TypeScript."
          ],
          "correctIndex": 1,
          "explanation": "Uncontrolled components leave state in the DOM; React reads the value on demand (e.g., via `inputRef.current.value`), avoiding re-renders on keystrokes."
        },
        {
          "id": "Q-RCT-027",
          "question": "How can you access the browser's underlying native browser event from a React SyntheticEvent?",
          "options": [
            "`e.realEvent`",
            "`e.nativeEvent`",
            "`e.originalEvent`",
            "`e.browserEvent`"
          ],
          "correctIndex": 1,
          "explanation": "React exposes the original underlying browser event via the `e.nativeEvent` property on the SyntheticEvent wrapper."
        },
        {
          "id": "Q-RCT-028",
          "question": "What does calling `e.preventDefault()` inside a form's `onSubmit` handler achieve?",
          "options": [
            "It clears all input values.",
            "It prevents the browser's default behavior of reloading the entire web page and submitting an HTTP POST request.",
            "It prevents errors from being logged.",
            "It closes the browser window."
          ],
          "correctIndex": 1,
          "explanation": "Standard HTML forms reload the page on submit; `preventDefault()` stops this browser default so React can handle submission asynchronously."
        },
        {
          "id": "Q-RCT-029",
          "question": "What is the result of calling `setCount(count + 1)` three times sequentially within the same event handler when `count` is initially 0?",
          "options": [
            "`count` becomes 3.",
            "`count` becomes 1, because all three calls evaluated `0 + 1` from the same render closure snapshot.",
            "`count` becomes 0.",
            "React throws an infinite loop error."
          ],
          "correctIndex": 1,
          "explanation": "All three calls read `count` as 0 from the current closure; to achieve 3, functional updates (`setCount(c => c + 1)`) must be used."
        },
        {
          "id": "Q-RCT-030",
          "question": "How can you opt out of React 18 automatic batching if an urgent DOM update must be rendered immediately?",
          "options": [
            "`ReactDOM.flushSync(() => { setState(...) })`",
            "`React.forceUpdate()`",
            "`window.renderNow()`",
            "Automatic batching cannot be bypassed."
          ],
          "correctIndex": 0,
          "explanation": "`flushSync` forces React to execute the enclosed callback synchronously and immediately flush changes to the DOM."
        }
      ]
    },
    {
      "id": "ASM-RCT-004",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-004",
      "title": "Assessment: Side Effects, Lifecycles & useEffect Deep Dive",
      "summary": "Evaluate your expertise in useEffect synchronization, cleanup functions, referential equality in dependencies, and eliminating common useEffect antipatterns.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-031",
          "question": "What is the primary architectural purpose of the `useEffect` hook in modern React?",
          "options": [
            "To replicate `componentDidMount` and `componentWillUnmount` exactly.",
            "To synchronize the component with external systems (such as browser APIs, WebSockets, or network timers) outside of React's state loop.",
            "To replace CSS media queries.",
            "To fetch data on every button click."
          ],
          "correctIndex": 1,
          "explanation": "React views `useEffect` not as lifecycle callbacks, but as a declarative synchronization bridge between React state and outside external systems."
        },
        {
          "id": "Q-RCT-032",
          "question": "When does React execute the cleanup function returned by a `useEffect` callback?",
          "options": [
            "Only when the browser tab is closed.",
            "Before the effect re-runs with new dependencies, and when the component unmounts from the DOM.",
            "Immediately before the effect executes for the first time.",
            "Only when an error occurs."
          ],
          "correctIndex": 1,
          "explanation": "Cleanups tear down existing connections or listeners right before the effect runs again with updated dependencies, as well as on final unmount."
        },
        {
          "id": "Q-RCT-033",
          "question": "Why does React Strict Mode in development intentionally execute effects twice (mount -> unmount -> mount)?",
          "options": [
            "It is a known bug in React that cannot be fixed.",
            "To stress-test and verify that effect setup and cleanup functions are perfectly symmetric and properly clean up subscriptions to prevent production memory leaks.",
            "To test network bandwidth.",
            "To verify the user's internet speed."
          ],
          "correctIndex": 1,
          "explanation": "Double-mounting verifies that your teardown logic works cleanly, ensuring components can mount and unmount repeatedly without leaving orphan listeners."
        },
        {
          "id": "Q-RCT-034",
          "question": "Why is calculating derived state inside an effect (e.g., listening to `items` to set `totalPrice`) considered an antipattern?",
          "options": [
            "Because math is not allowed in React.",
            "It triggers an unnecessary second re-render cycle and can cause visual layout jitter; derived values should be calculated directly during render.",
            "Because `useEffect` cannot read numbers.",
            "Because derived state causes memory leaks."
          ],
          "correctIndex": 1,
          "explanation": "Setting state inside an effect forces React to complete the first render and immediately trigger a second render; deriving during render is instantaneous."
        },
        {
          "id": "Q-RCT-035",
          "question": "What comparison method does React use to check whether values in the `useEffect` dependency array have changed?",
          "options": [
            "Deep recursive JSON comparison",
            "Shallow reference equality via `Object.is`",
            "Loose equality (`==`)",
            "String comparison"
          ],
          "correctIndex": 1,
          "explanation": "React compares dependencies using `Object.is`; recreating objects or functions on every render causes dependencies to fail equality and re-run effects."
        },
        {
          "id": "Q-RCT-036",
          "question": "Where should business logic triggered directly by a user action (like submitting a payment or tracking a button click) be executed?",
          "options": [
            "Inside a `useEffect` that watches a `isSubmitted` state boolean.",
            "Directly inside the user event handler function (e.g., `handleClick` or `handleSubmit`).",
            "Inside a CSS stylesheet.",
            "Inside the component's return JSX statement."
          ],
          "correctIndex": 1,
          "explanation": "Event-driven causality belongs directly inside event handlers, where the user intent occurs, rather than indirectly observing state flags in effects."
        },
        {
          "id": "Q-RCT-037",
          "question": "What happens if you omit the dependency array entirely: `useEffect(() => { ... })`?",
          "options": [
            "The effect runs only once on mount.",
            "The effect executes after every single render of the component.",
            "The effect never executes.",
            "React throws a compile error."
          ],
          "correctIndex": 1,
          "explanation": "Without a dependency array, the effect runs unconditionally after every render pass."
        },
        {
          "id": "Q-RCT-038",
          "question": "What happens when you pass an empty dependency array: `useEffect(() => { ... }, [])`?",
          "options": [
            "The effect executes after every render.",
            "The effect executes only once after the component mounts into the DOM, and cleans up when it unmounts.",
            "The effect is disabled permanently.",
            "The effect runs on every click."
          ],
          "correctIndex": 1,
          "explanation": "An empty array tells React the effect has zero dependencies that change over time, so it runs once on mount and cleans up on unmount."
        },
        {
          "id": "Q-RCT-039",
          "question": "Why does writing raw `fetch` requests inside `useEffect` without an AbortController cause race conditions?",
          "options": [
            "Because HTTP requests are illegal in React.",
            "If the user triggers multiple rapid requests (e.g., typing in a search bar), an earlier slower network response may resolve after a later faster response, displaying stale data.",
            "Because browsers cancel fetch requests after 1 second.",
            "Because fetch requires Redux."
          ],
          "correctIndex": 1,
          "explanation": "Unsynchronized async responses can arrive out of order; using cleanup with `AbortController` ensures stale in-flight requests are cancelled."
        },
        {
          "id": "Q-RCT-040",
          "question": "Which ESLint plugin rule automatically warns developers when dependencies are missing from a `useEffect` dependency array?",
          "options": [
            "`react/no-direct-mutation-state`",
            "`react-hooks/exhaustive-deps`",
            "`react/jsx-key`",
            "`react/display-name`"
          ],
          "correctIndex": 1,
          "explanation": "`react-hooks/exhaustive-deps` analyzes the effect body to verify all referenced external variables are declared in the dependency array."
        }
      ]
    },
    {
      "id": "ASM-RCT-005",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-005",
      "title": "Assessment: Memory, References & Optimization Hooks",
      "summary": "Test your skills in useRef for DOM nodes and instance variables, useMemo computational caching, useCallback referential stability, and React.memo.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-041",
          "question": "What is the primary functional difference between `useState` and `useRef`?",
          "options": [
            "`useState` stores strings; `useRef` stores numbers.",
            "Updating `useState` triggers a component re-render; mutating `useRef.current` persists the value across renders without triggering a re-render.",
            "`useRef` is only available in Next.js.",
            "There is no difference; they are aliases."
          ],
          "correctIndex": 1,
          "explanation": "`useRef` provides mutable storage that survives re-renders silently, making it ideal for timer IDs, DOM handles, and previous state snapshots."
        },
        {
          "id": "Q-RCT-042",
          "question": "What does the `useMemo` hook cache?",
          "options": [
            "It caches the return value of an expensive calculation, recalculating only when specified dependencies change.",
            "It caches image files in the browser service worker.",
            "It caches HTML files on the server.",
            "It caches user passwords in cookies."
          ],
          "correctIndex": 0,
          "explanation": "`useMemo` memorizes the computed result of a function, skipping re-computation on subsequent renders if dependencies remain unchanged."
        },
        {
          "id": "Q-RCT-043",
          "question": "What does the `useCallback` hook cache?",
          "options": [
            "The return value of an API request.",
            "The function definition itself, preserving referential stability across renders to prevent unnecessary re-renders of memoized child components.",
            "The user's scroll position.",
            "CSS animation frames."
          ],
          "correctIndex": 1,
          "explanation": "`useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`, preserving the function's memory identity across render cycles."
        },
        {
          "id": "Q-RCT-044",
          "question": "When does wrapping a child component with `React.memo` actually prevent that child from re-rendering?",
          "options": [
            "Always, under all circumstances.",
            "Only when the parent component re-renders but all props passed to the child pass a shallow equality check (`prevProps === nextProps`).",
            "Only when the child component has no state.",
            "Only on production servers."
          ],
          "correctIndex": 1,
          "explanation": "`React.memo` performs shallow comparison on incoming props; if props are referentially identical, it skips re-rendering the child."
        },
        {
          "id": "Q-RCT-045",
          "question": "Why does passing an inline callback `onClick={() => doSomething(id)}` defeat a child component's `React.memo` optimization?",
          "options": [
            "Because inline functions throw syntax errors in TypeScript.",
            "Because a new arrow function instance with a brand new memory reference is created on every parent render, failing shallow equality comparison.",
            "Because `React.memo` does not support click handlers.",
            "Because inline functions run on the server."
          ],
          "correctIndex": 1,
          "explanation": "New function instances break shallow equality (`() => {} !== () => {}`), causing `React.memo` to conclude props changed and re-render."
        },
        {
          "id": "Q-RCT-046",
          "question": "How can you programmatically focus an HTML `<input>` element on component mount using `useRef`?",
          "options": [
            "`document.getElementById('input').focus()`",
            "Attach a `ref={inputRef}` to the input and call `inputRef.current?.focus()` inside a `useEffect`.",
            "Call `inputRef.focus()` inside the return statement.",
            "Set `autoFocus={false}`."
          ],
          "correctIndex": 1,
          "explanation": "Binding a ref to a DOM node populates `ref.current` with the underlying HTML element after mounting, allowing imperative calls like `.focus()`."
        },
        {
          "id": "Q-RCT-047",
          "question": "Why is wrapping every single function in `useCallback` considered an optimization antipattern?",
          "options": [
            "Because `useCallback` has its own memory and execution cost (allocating dependency arrays and closure checks); premature optimization adds overhead with zero gain.",
            "Because `useCallback` is deprecated in React 19.",
            "Because browsers limit callbacks to 10 per page.",
            "Because `useCallback` breaks TypeScript typings."
          ],
          "correctIndex": 0,
          "explanation": "Memoization has a cost: creating dependency arrays and performing checks on every render. If a child component is cheap to render, memoization adds net overhead."
        },
        {
          "id": "Q-RCT-048",
          "question": "What is a legitimate use case for storing data in `useRef` rather than `useState`?",
          "options": [
            "Rendering a user's name on screen.",
            "Storing a `setInterval` or `setTimeout` timer ID so it can be cleared in an effect cleanup without triggering unwanted re-renders when set.",
            "Toggling between dark mode and light mode.",
            "Displaying an error alert banner."
          ],
          "correctIndex": 1,
          "explanation": "Timer IDs, scroll positions, and cancellation tokens are internal operational details that should not trigger UI re-renders when updated."
        },
        {
          "id": "Q-RCT-049",
          "question": "How does `useMemo` prevent infinite re-render loops when passing an object into a `useEffect` dependency array?",
          "options": [
            "By converting the object into a string.",
            "By preserving the object's exact memory reference across renders as long as its internal dependencies have not changed.",
            "By deleting the object from memory.",
            "By disabling `useEffect`."
          ],
          "correctIndex": 1,
          "explanation": "`useMemo` keeps the object pointer identical between renders, preventing `useEffect` from seeing a new reference on every render cycle."
        },
        {
          "id": "Q-RCT-050",
          "question": "What tool should engineers use to measure whether a component actually needs `useMemo` or `React.memo`?",
          "options": [
            "The React DevTools Profiler (measuring render durations, render causes, and flamegraphs).",
            "A stopwatch app on a smartphone.",
            "Google Analytics pageview counts.",
            "The VS Code file size indicator."
          ],
          "correctIndex": 0,
          "explanation": "The React Profiler records exact render times and flags which components re-rendered and why, guiding data-driven optimization."
        }
      ]
    },
    {
      "id": "ASM-RCT-006",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-006",
      "title": "Assessment: Context API & Prop Drilling Mitigation",
      "summary": "Assess your expertise in createContext, custom consumer hooks, Provider composition, Context re-render traps, and modular state partitioning.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-051",
          "question": "What problem does the React Context API primarily solve in component architecture?",
          "options": [
            "It speeds up internet connection latency.",
            "It eliminates 'Prop Drilling' by allowing deeply nested components to access shared data without manually passing props through every intermediate layer.",
            "It compiles React into WebAssembly.",
            "It stores data permanently in MySQL."
          ],
          "correctIndex": 1,
          "explanation": "Context provides an ambient broadcast mechanism, allowing components anywhere within a Provider sub-tree to access data directly."
        },
        {
          "id": "Q-RCT-052",
          "question": "Why should a custom consumer hook (e.g., `useAuth`) throw an error if `useContext(AuthContext)` returns `undefined`?",
          "options": [
            "To crash the user's browser.",
            "To fail fast with a clear, actionable developer warning if a component attempts to consume the context without being wrapped in its required `AuthProvider`.",
            "Because TypeScript requires all hooks to throw errors.",
            "To prevent hackers from reading the context."
          ],
          "correctIndex": 1,
          "explanation": "Checking for `undefined` guards against developer error, preventing cryptic 'cannot read property of undefined' crashes with an explicit instructional error."
        },
        {
          "id": "Q-RCT-053",
          "question": "What is the primary performance vulnerability of the React Context API?",
          "options": [
            "Context uses 100% of GPU resources.",
            "Every component that subscribes to a Context will re-render whenever the Context `value` changes, even if the component only uses an unaffected property of the value.",
            "Context cannot store strings.",
            "Context only works in production builds."
          ],
          "correctIndex": 1,
          "explanation": "Context does not support fine-grained property subscriptions; any change to the value object triggers re-renders across all consumer components."
        },
        {
          "id": "Q-RCT-054",
          "question": "How should a Provider's `value` object be structured to prevent accidental re-renders of all consumers on every parent render?",
          "options": [
            "Pass an inline object: `value={{ user, logout }}`",
            "Wrap the value object in `useMemo`: `const value = useMemo(() => ({ user, logout }), [user, logout]);`",
            "Convert the value object to a JSON string.",
            "Do not pass any value."
          ],
          "correctIndex": 1,
          "explanation": "Without `useMemo`, an inline object literal generates a new memory address on every parent render, forcing all consumers to re-render unnecessarily."
        },
        {
          "id": "Q-RCT-055",
          "question": "What is the 'Context Splitting' pattern?",
          "options": [
            "Splitting a JavaScript file into two halves.",
            "Separating a single monolithic context into multiple focused contexts (e.g., separating frequent state updates from static action dispatchers) to isolate re-renders.",
            "Running context on two CPU cores.",
            "Deleting unused context providers."
          ],
          "correctIndex": 1,
          "explanation": "Dividing context into independent domain slices (and separating state from dispatchers) ensures components only re-render when their specific data updates."
        },
        {
          "id": "Q-RCT-056",
          "question": "Why is placing dispatch functions (like `login`, `logout`) in a separate Context from state data (like `user`) highly performant?",
          "options": [
            "Because functions cannot be stored with objects in JavaScript.",
            "Because dispatch functions remain referentially stable; components that only need to trigger actions will never re-render when state data changes.",
            "Because dispatch functions run on a web worker.",
            "It is required by the React compiler."
          ],
          "correctIndex": 1,
          "explanation": "Action triggers remain static; isolating them in a DispatchContext prevents action-triggering buttons from re-rendering when data changes."
        },
        {
          "id": "Q-RCT-057",
          "question": "What is the recommended design pattern for structuring a multi-provider application tree to avoid deeply nested 'Provider Hell'?",
          "options": [
            "Eliminate all providers and use global `window` variables.",
            "Create a composite `AppProviders` component that nests and orchestrates all individual providers cleanly in one place.",
            "Put all application code inside a single component.",
            "Use inline styles."
          ],
          "correctIndex": 1,
          "explanation": "A clean `AppProviders` composer combines Auth, Theme, Query, and Toast providers into a tidy higher-level component, keeping `App.tsx` readable."
        },
        {
          "id": "Q-RCT-058",
          "question": "When is standard Component Composition (passing components via `children`) a better alternative to creating a new Context?",
          "options": [
            "When data only needs to bypass 1 or 2 intermediate layout wrappers (like a Card or Sidebar) rather than being globally accessible everywhere.",
            "Never; Context is always superior.",
            "Only on mobile apps.",
            "When using Internet Explorer."
          ],
          "correctIndex": 0,
          "explanation": "Simple prop drilling across 1 or 2 layout containers is often solved more cleanly by passing pre-configured components as `children`, avoiding Context overhead."
        },
        {
          "id": "Q-RCT-059",
          "question": "What happens if a component calls `useContext(MyContext)` but there is no `MyContext.Provider` above it in the tree?",
          "options": [
            "React throws a fatal runtime exception.",
            "The hook returns the default value passed to `createContext(defaultValue)` when the context was initialized.",
            "The hook returns `null`.",
            "The component unmounts itself."
          ],
          "correctIndex": 1,
          "explanation": "In the absence of a matching Provider ancestor, `useContext` falls back to the default value specified in `createContext(defaultValue)`."
        },
        {
          "id": "Q-RCT-060",
          "question": "Why is React Context NOT an optimal replacement for high-velocity global server state (like live stock tickers or complex cache management)?",
          "options": [
            "Because Context cannot handle numbers.",
            "Because Context lacks built-in caching, background refetching, deduping, and fine-grained selector re-render isolation, causing performance bottlenecks under high update rates.",
            "Because Context was deprecated in React 18.",
            "Because Context only works with local mock data."
          ],
          "correctIndex": 1,
          "explanation": "Context is a dependency injection tool, not a full state manager; high-velocity server state requires specialized tools like TanStack Query or Zustand."
        }
      ]
    }
  ]
};
