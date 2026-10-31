export const phase2 = {
  "chapters": [
    {
      "id": "CH-RCT-007",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 7,
      "title": "React 19 Compiler (React Forget) & Automatic Memoization",
      "summary": "Understand the monumental shift in React 19: how the React Compiler automatically memoizes components, values, and functions, eliminating manual useMemo, useCallback, and React.memo while adhering to the Rules of React.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=wnPWs_9iL08",
      "body": "<h2>1. The Mental Tax of Manual Memoization</h2>\n<p>For years, writing high-performance React required developers to navigate a minefield of manual memoization hooks. Missing a dependency in <code>useCallback</code> caused stale closures; passing an unmemoized object prop caused downstream <code>React.memo</code> boundaries to shatter; and littering codebases with <code>useMemo</code> everywhere added cognitive overhead and dependency array maintenance costs.</p>\n<p>With <strong>React 19</strong>, the React team delivered the <strong>React Compiler</strong> (originally codenamed <em>React Forget</em>). The React Compiler is a build-time optimizing tool that automatically memoizes values, callback functions, and component JSX trees under the hood.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/wnPWs_9iL08' title='React 19 Compiler Explained' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. How the React Compiler Works Under the Hood</h2>\n<p>The React Compiler operates at the Babel/Vite build stage. It analyzes your JavaScript Abstract Syntax Tree (AST) using deep semantic analysis and static type information to identify independent blocks of reactivity:</p>\n<pre><code>// What YOU write in React 19 (Zero manual memoization):\nfunction ProductList({ products, category }: Props) {\n  const filtered = products.filter(p => p.category === category);\n  const handleSelect = (id: string) => trackEvent(id);\n  return &lt;Table data={filtered} onSelect={handleSelect} /&gt;;\n}\n\n// What the REACT COMPILER outputs automatically:\nfunction ProductList({ products, category }: Props) {\n  const $ = _c(6); // Internal memoization cache slots\n  let filtered;\n  if ($[0] !== products || $[1] !== category) {\n    filtered = products.filter(p => p.category === category);\n    $[0] = products; $[1] = category; $[2] = filtered;\n  } else {\n    filtered = $[2];\n  }\n  // handleSelect and JSX return are also automatically cached!\n}</code></pre>\n\n<h2>3. The Rules of React: Compiler Prerequisites</h2>\n<p>The compiler is not magic; it relies on mathematical invariants. It can only safely optimize components that adhere strictly to the <strong>Rules of React</strong>:</p>\n<ol>\n  <li><strong>Components Must Be Pure:</strong> Given the same inputs (props, state, context), a component must always return the exact same JSX output without mutating outside variables.</li>\n  <li><strong>Never Mutate Existing State or Props:</strong> Modifying arrays in-place (e.g., <code>items.push(newItem)</code>) breaks the compiler's change-detection invariants.</li>\n  <li><strong>Never Call Hooks Conditionally:</strong> Hooks must always be called at the top level of component functions.</li>\n</ol>\n<p>If a component violates these rules, the compiler gracefully opts out of optimizing that specific component and falls back to standard execution without breaking your app.</p>\n\n<h2>4. The React Compiler ESLint Plugin</h2>\n<p>To prepare codebases for the React Compiler, Meta released the <code>eslint-plugin-react-compiler</code> rule set. It flags impure behaviors, unsafe object mutations, and violations of React rules in real time in your IDE before compilation occurs.</p>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>The React 19 Compiler automates memoization at build time, eliminating manual <code>useMemo</code>, <code>useCallback</code>, and <code>React.memo</code>.</li>\n  <li>It caches computations and component trees using fine-grained internal cache slots (<code>_c</code>).</li>\n  <li>The compiler strictly requires adherence to the Rules of React (pure functions, no side-effects during render).</li>\n  <li>If a component violates purity, the compiler automatically bails out without breaking runtime execution.</li>\n  <li>Adopt <code>eslint-plugin-react-compiler</code> to validate codebase compliance.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-008",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 8,
      "title": "React 19 Actions & useActionState",
      "summary": "Simplify asynchronous workflows: understanding React 19 Actions, managing pending states, handling form submissions natively, the useActionState hook, and automatic reset on completion.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=Bw_15tqUf_Y",
      "body": "<h2>1. The Problem with Asynchronous Forms in React 18</h2>\n<p>Historically, handling a simple form submission in React required declaring at least three pieces of boilerplate state: <code>const [data, setData] = useState(...)</code>, <code>const [isLoading, setIsLoading] = useState(false)</code>, and <code>const [error, setError] = useState(null)</code>. Developers had to manually set loading flags, catch errors, and synchronize state across async fetch promises.</p>\n<p><strong>React 19 Actions</strong> elevate asynchronous operations to a first-class primitive within the React component model.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/Bw_15tqUf_Y' title='React 19 Actions and useActionState' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. What is an Action in React 19?</h2>\n<p>By definition, a function that uses async transitions is called an <strong>Action</strong>. Actions automatically manage data submission, pending states, error states, and optimistic updates on your behalf:</p>\n<ul>\n  <li><strong>Pending State:</strong> Automatically tracks whether the async operation is currently executing.</li>\n  <li><strong>Optimistic Updates:</strong> Allows client interfaces to reflect immediate user changes while the network request is in flight.</li>\n  <li><strong>Error Handling:</strong> Catches async rejections and provides graceful error state without manual try/catch boilerplate.</li>\n  <li><strong>Form Integration:</strong> Native HTML <code>&lt;form action={myAction}&gt;</code> directly accepts async action functions.</li>\n</ul>\n\n<h2>3. The `useActionState` Hook</h2>\n<p>The foundational hook for Actions is <code>useActionState</code> (previously known as <code>useFormState</code> during canary releases). It binds an action to component state and returns the current state, an action trigger, and a boolean pending indicator:</p>\n<pre><code>import { useActionState } from 'react';\n\nasync function updateProfileName(prevState: State, formData: FormData): Promise&lt;State&gt; {\n  const newName = formData.get('name') as string;\n  try {\n    const updatedUser = await api.updateName(newName);\n    return { success: true, user: updatedUser, error: null };\n  } catch (err) {\n    return { success: false, user: prevState.user, error: (err as Error).message };\n  }\n}\n\nexport function ProfileForm() {\n  const [state, formAction, isPending] = useActionState(updateProfileName, {\n    success: false,\n    user: null,\n    error: null,\n  });\n\n  return (\n    &lt;form action={formAction}&gt;\n      &lt;input name='name' defaultValue={state.user?.name} disabled={isPending} /&gt;\n      &lt;button type='submit' disabled={isPending}&gt;\n        {isPending ? 'Saving...' : 'Save Profile'}\n      &lt;/button&gt;\n      {state.error && &lt;p className='error'&gt;{state.error}&lt;/p&gt;}\n    &lt;/form&gt;\n  );\n}</code></pre>\n\n<h2>4. The `useFormStatus` Hook</h2>\n<p>When constructing deeply nested button components inside a form, passing the <code>isPending</code> boolean down through props is tedious. React 19 provides <code>useFormStatus</code>:</p>\n<pre><code>import { useFormStatus } from 'react-dom';\n\nexport function SubmitButton() {\n  // Reads pending status from the parent &lt;form&gt; automatically!\n  const { pending, data, method, action } = useFormStatus();\n\n  return (\n    &lt;button type='submit' disabled={pending} className='btn-primary'&gt;\n      {pending ? 'Submitting...' : 'Submit'}\n    &lt;/button&gt;\n  );\n}</code></pre>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>React 19 Actions turn asynchronous transitions into first-class framework primitives.</li>\n  <li><code>useActionState</code> manages action state, triggers, and the <code>isPending</code> flag in a single clean signature.</li>\n  <li>Pass actions directly to native HTML <code>&lt;form action={action}&gt;</code> attributes.</li>\n  <li><code>useFormStatus</code> reads the parent form's pending state without prop drilling.</li>\n  <li>Automatic error handling captures network failures and presents state-driven error messages.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-009",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 9,
      "title": "Optimistic UI Updates with useOptimistic",
      "summary": "Deliver instant, responsive user interfaces: understanding optimistic UI updates, the useOptimistic hook, immediate client-side rendering, error rollbacks, and reconciling server confirmations.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=b6B7P5uVq8c",
      "body": "<h2>1. The Psychology of Optimistic UI</h2>\n<p>In traditional web applications, when a user clicks 'Like' on a post or posts a comment, the interface shows a loading spinner and waits 300ms to 1,500ms for the server API to respond before updating the screen. This feels sluggish and disconnected.</p>\n<p>In modern world-class software (such as Twitter, Slack, or Linear), interfaces utilize <strong>Optimistic UI</strong>: the UI immediately renders the anticipated success state (the heart fills with color instantly), assuming the network request will succeed. If the network request unexpectedly fails, the interface gracefully rolls back to the previous state with a friendly error toast.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/b6B7P5uVq8c' title='useOptimistic Hook in React 19' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. The `useOptimistic` Hook in Action</h2>\n<p>React 19 introduces the official <code>useOptimistic</code> hook. It takes current server-confirmed state and an update reducer, returning an optimistic state snapshot and an optimistic dispatch trigger:</p>\n<pre><code>import { useOptimistic, useState } from 'react';\n\ninterface Message {\n  id: string;\n  text: string;\n  sending?: boolean;\n}\n\nexport function ChatRoom({ initialMessages }: { initialMessages: Message[] }) {\n  const [messages, setMessages] = useState&lt;Message[]&gt;(initialMessages);\n\n  // useOptimistic takes base state and a reducer function\n  const [optimisticMessages, addOptimisticMessage] = useOptimistic(\n    messages,\n    (currentMessages, newMessageText: string) => [\n      ...currentMessages,\n      { id: crypto.randomUUID(), text: newMessageText, sending: true }\n    ]\n  );\n\n  async function formAction(formData: FormData) {\n    const text = formData.get('message') as string;\n    // 1. Immediately update UI with pending message!\n    addOptimisticMessage(text);\n\n    // 2. Perform actual network mutation\n    const savedMessage = await api.sendMessage(text);\n\n    // 3. Update real state once server confirms\n    setMessages(prev => [...prev, savedMessage]);\n  }\n\n  return (\n    &lt;div&gt;\n      &lt;ul&gt;\n        {optimisticMessages.map(m =&gt; (\n          &lt;li key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}&gt;\n            {m.text} {m.sending && '(Sending...)'}\n          &lt;/li&gt;\n        ))}\n      &lt;/ul&gt;\n      &lt;form action={formAction}&gt;\n        &lt;input name='message' placeholder='Type a message...' /&gt;\n        &lt;button type='submit'&gt;Send&lt;/button&gt;\n      &lt;/form&gt;\n    &lt;/div&gt;\n  );\n}</code></pre>\n\n<h2>3. Automatic Rollback Mechanics</h2>\n<p>The true power of <code>useOptimistic</code> is its seamless synchronization with React Transitions:</p>\n<ul>\n  <li>While the async Action is in flight, React displays the optimistic state returned by your reducer.</li>\n  <li>Once the async Action completes, React automatically switches back to rendering the actual underlying <code>messages</code> state.</li>\n  <li>If the network request throws an error and fails, the optimistic update automatically vanishes without requiring manual rollback code!</li>\n</ul>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>Optimistic UI delivers instantaneous responsiveness by anticipating successful server operations.</li>\n  <li><code>useOptimistic</code> returns an optimistic state and a dispatch function for instant rendering.</li>\n  <li>It automatically reverts back to confirmed server state once the enclosing transition completes.</li>\n  <li>Network rejections automatically discard optimistic updates without complex manual rollback logic.</li>\n  <li>Use visual indicators (like 50% opacity or a clock icon) to signify in-flight optimistic items.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-010",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 10,
      "title": "The `use` Hook & Resource Loading",
      "summary": "Unlock flexible resource reading in React 19: the use() API, reading Promises directly in render, conditional Context reading, and pairing with Suspense boundaries.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=W_Q_qKqUj5k",
      "body": "<h2>1. Breaking the Rules of Hooks: The `use` API</h2>\n<p>Since React 16.8, the universal commandment of React hooks was: <em>'Never call hooks inside conditionals, loops, or nested functions.'</em></p>\n<p>In <strong>React 19</strong>, the new <strong><code>use</code></strong> API introduces a revolutionary exception. Unlike standard hooks, <code>use</code> can be called conditionally and inside loops to read resources (like Promises or Context) directly during the render pass.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/W_Q_qKqUj5k' title='The use Hook in React 19' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Reading Promises with `use()` and Suspense</h2>\n<p>In standard React, consuming an asynchronous Promise required declaring state, wrapping fetch in a <code>useEffect</code>, and managing loading flags. With <code>use</code>, components unwrap Promises directly during render:</p>\n<pre><code>import { use, Suspense } from 'react';\n\nfunction UserProfile({ userPromise }: { userPromise: Promise&lt;User&gt; }) {\n  // Unwraps the promise directly! If pending, React suspends this component.\n  const user = use(userPromise);\n  return &lt;div&gt;&lt;h1&gt;{user.name}&lt;/h1&gt;&lt;p&gt;{user.email}&lt;/p&gt;&lt;/div&gt;;\n}\n\nexport function Page() {\n  const userPromise = fetchUserData('user_123'); // Created outside render or in Server Component\n\n  return (\n    &lt;Suspense fallback={&lt;SkeletonLoader /&gt;}&gt;\n      &lt;UserProfile userPromise={userPromise} /&gt;\n    &lt;/Suspense&gt;\n  );\n}</code></pre>\n\n<h2>3. Conditional Context Reading with `use(Context)`</h2>\n<p>Standard <code>useContext</code> cannot be called inside an <code>if</code> block. <code>use(Context)</code> can be called conditionally, allowing components to read context only when needed:</p>\n<pre><code>import { use } from 'react';\nimport { ThemeContext } from './ThemeContext';\n\nexport function Heading({ text, shouldInheritTheme }: Props) {\n  if (shouldInheritTheme) {\n    // Valid in React 19! Conditional Context reading:\n    const theme = use(ThemeContext);\n    return &lt;h1 style={{ color: theme.color }}&gt;{text}&lt;/h1&gt;;\n  }\n  return &lt;h1&gt;{text}&lt;/h1&gt;;\n}</code></pre>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>The <code>use</code> API can be invoked conditionally and inside loops, unlike standard hooks.</li>\n  <li>Passing a Promise into <code>use(promise)</code> unwraps the resolved data and suspends the component.</li>\n  <li>Always pair Promise consumption in <code>use()</code> with an enclosing <code>&lt;Suspense&gt;</code> boundary.</li>\n  <li>Promises passed to <code>use</code> should be cached or created outside the component render to avoid refetch loops.</li>\n  <li><code>use(Context)</code> enables conditional context subscriptions without component splitting.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-011",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 11,
      "title": "Concurrency, Transitions & useTransition / useDeferredValue",
      "summary": "Master Concurrent React: urgent vs non-urgent state updates, keeping the UI responsive during intensive renders, startTransition, useTransition pending states, and debouncing alternatives with useDeferredValue.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=N5R6z5nK4c8",
      "body": "<h2>1. The Problem of Main Thread Blocking</h2>\n<p>Imagine a search input that filters a list of 10,000 table rows. When the user types a character, two updates occur: updating the text inside the input box, and filtering the 10,000 table rows. If filtering takes 200ms of CPU time, typing feels laggy and dropped keystrokes occur.</p>\n<p>React divides updates into two distinct priority tiers:</p>\n<ul>\n  <li><strong>Urgent Updates:</strong> Direct physical user interactions (typing in an input, clicking a button, dragging a slider). These must render immediately to maintain tactile responsiveness.</li>\n  <li><strong>Transition / Non-Urgent Updates:</strong> Transitioning views, filtering complex data lists, fetching next-tab content. Users expect these to take a brief moment.</li>\n</ul>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/N5R6z5nK4c8' title='React Transitions Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. The `useTransition` Hook</h2>\n<p><code>useTransition</code> marks state updates as non-urgent transitions that yield to high-priority events:</p>\n<pre><code>import { useState, useTransition } from 'react';\n\nexport function FilterableCatalog() {\n  const [inputVal, setInputVal] = useState('');\n  const [query, setQuery] = useState('');\n  const [isPending, startTransition] = useTransition();\n\n  function handleChange(e: React.ChangeEvent&lt;HTMLInputElement&gt;) {\n    // 1. Urgent: Updates text box immediately with zero lag\n    setInputVal(e.target.value);\n\n    // 2. Non-urgent transition: Can be interrupted if user types another letter!\n    startTransition(() => {\n      setQuery(e.target.value);\n    });\n  }\n\n  return (\n    &lt;div&gt;\n      &lt;input value={inputVal} onChange={handleChange} /&gt;\n      {isPending && &lt;span className='spinner'&gt;Updating list...&lt;/span&gt;}\n      &lt;HeavyList query={query} /&gt;\n    &lt;/div&gt;\n  );\n}</code></pre>\n\n<h2>3. The `useDeferredValue` Hook</h2>\n<p>When you do not control the state update directly (e.g., when receiving a query prop from an external parent), <code>useDeferredValue</code> achieves the same concurrent benefit by deferring prop synchronization:</p>\n<pre><code>import { useDeferredValue } from 'react';\n\nexport function SearchResults({ query }: { query: string }) {\n  // deferredQuery will lag behind query while re-rendering the heavy list\n  const deferredQuery = useDeferredValue(query);\n  const isStale = query !== deferredQuery;\n\n  return (\n    &lt;div style={{ opacity: isStale ? 0.6 : 1 }}&gt;\n      &lt;HeavyDataset query={deferredQuery} /&gt;\n    &lt;/div&gt;\n  );\n}</code></pre>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>Concurrent React segregates updates into urgent user inputs and non-urgent transitions.</li>\n  <li><code>useTransition</code> marks state updates as interruptible, preventing UI freezes during heavy rendering.</li>\n  <li><code>startTransition</code> yields to new user inputs, abandoning stale in-progress renders immediately.</li>\n  <li><code>useDeferredValue</code> defers prop values without requiring control over the setter function.</li>\n  <li>Transitions replace awkward artificial timer debouncing with native cooperative scheduling.</li>\n</ol>"
    },
    {
      "id": "CH-RCT-012",
      "courseId": "CRS-RCT-001",
      "chapterNumber": 12,
      "title": "Custom Hooks Engineering & Clean Architecture",
      "summary": "Architect reusable business logic: the philosophy of custom hooks, composing native hooks, clean API design, and production implementations of useDebounce, useLocalStorage, useMediaQuery, and useWindowScroll.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=6ThXsUwLWvc",
      "body": "<h2>1. The Philosophy of Custom Hooks</h2>\n<p>Custom hooks are the definitive mechanism for sharing stateful logic between components in modern React. Before hooks, sharing stateful logic required complex patterns like Higher-Order Components (HOCs) or Render Props, which produced deeply nested 'wrapper hell' in component trees.</p>\n<p>A <strong>Custom Hook</strong> is simply a JavaScript function whose name begins with <code>use</code> and that can invoke other React hooks (<code>useState</code>, <code>useEffect</code>, <code>useRef</code>). They encapsulate complex business rules, browser APIs, and state coordination into clean, testable units.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/6ThXsUwLWvc' title='Custom React Hooks Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Production Custom Hook Implementations</h2>\n<h3>1. `useDebounce` (Delaying Fast-Changing Values):</h3>\n<pre><code>import { useState, useEffect } from 'react';\n\nexport function useDebounce&lt;T&gt;(value: T, delayMs: number = 300): T {\n  const [debouncedValue, setDebouncedValue] = useState&lt;T&gt;(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delayMs);\n\n    return () => clearTimeout(handler);\n  }, [value, delayMs]);\n\n  return debouncedValue;\n}</code></pre>\n\n<h3>2. `useLocalStorage` (Synchronized Persistent State):</h3>\n<pre><code>export function useLocalStorage&lt;T&gt;(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {\n  const [storedValue, setStoredValue] = useState&lt;T&gt;(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n\n  const setValue = (value: T | ((prev: T) => T)) => {\n    try {\n      const valueToStore = value instanceof Function ? value(storedValue) : value;\n      setStoredValue(valueToStore);\n      window.localStorage.setItem(key, JSON.stringify(valueToStore));\n    } catch (err) {\n      console.error(err);\n    }\n  };\n\n  return [storedValue, setValue];\n}</code></pre>\n\n<h3>3. `useMediaQuery` (Reactive CSS Breakpoints):</h3>\n<pre><code>export function useMediaQuery(query: string): boolean {\n  const [matches, setMatches] = useState&lt;boolean&gt;(() =>\n    typeof window !== 'undefined' ? window.matchMedia(query).matches : false\n  );\n\n  useEffect(() => {\n    const media = window.matchMedia(query);\n    const listener = () => setMatches(media.matches);\n    media.addEventListener('change', listener);\n    return () => media.removeEventListener('change', listener);\n  }, [query]);\n\n  return matches;\n}</code></pre>\n\n<h2>3. Clean Architecture: Keeping Components Pure</h2>\n<p>In senior-level React architecture, components should act strictly as presentation controllers:</p>\n<ul>\n  <li><strong>Thin Components:</strong> Components should focus on declaring JSX layout and binding visual properties.</li>\n  <li><strong>Rich Custom Hooks:</strong> All data fetching, caching, localStorage interactions, validation timers, and event subscriptions should be extracted into dedicated custom hooks.</li>\n</ul>\n\n<h2>4. Key Takeaways</h2>\n<ol>\n  <li>Custom hooks encapsulate reusable stateful logic into modular, testable functions starting with <code>use</code>.</li>\n  <li>They eliminate wrapper hell created by legacy HOCs and Render Props.</li>\n  <li><code>useDebounce</code> delays rapid input values to prevent overwhelming network servers.</li>\n  <li><code>useLocalStorage</code> synchronizes React state with browser persistent storage with fallback safety.</li>\n  <li>Follow clean architecture: extract complex effect logic into hooks, keeping components thin and declarative.</li>\n</ol>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-RCT-007",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-007",
      "title": "Assessment: React 19 Compiler & Automatic Memoization",
      "summary": "Test your understanding of the React 19 Compiler, build-time AST transformations, automatic memoization cache slots, and the Rules of React.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-061",
          "question": "What was the primary developer pain point that the React 19 Compiler (React Forget) was created to solve?",
          "options": [
            "React apps were too large to download on 3G networks.",
            "The cognitive burden, code clutter, and stale-closure bugs associated with manual memoization via `useMemo`, `useCallback`, and `React.memo`.",
            "CSS styles could not be imported into JavaScript.",
            "TypeScript was incompatible with React."
          ],
          "correctIndex": 1,
          "explanation": "The React Compiler automates memoization at compile time, freeing developers from manually maintaining dependency arrays and memoization wrappers."
        },
        {
          "id": "Q-RCT-062",
          "question": "At what stage in the development lifecycle does the React 19 Compiler optimize component code?",
          "options": [
            "At runtime inside the user's browser via WebAssembly.",
            "At build time via an optimizing compiler plugin (Babel / Vite / Next.js) that transforms the component AST.",
            "On the backend server during SQL queries.",
            "When the app is published to the App Store."
          ],
          "correctIndex": 1,
          "explanation": "The React Compiler is a build-time compiler that analyzes code semantics and emits fine-grained memoization cache slots into the compiled JavaScript."
        },
        {
          "id": "Q-RCT-063",
          "question": "What is an internal memoization cache slot (`_c`) in the code emitted by the React Compiler?",
          "options": [
            "A database row in PostgreSQL.",
            "A fast internal array allocated per component instance where React stores and compares previous values and JSX trees.",
            "A browser cookie.",
            "A global Redux store."
          ],
          "correctIndex": 1,
          "explanation": "The compiler injects a cache array (`_c`) where inputs and outputs are memoized, avoiding re-computation when inputs remain identical."
        },
        {
          "id": "Q-RCT-064",
          "question": "What happens if a component violates the Rules of React (e.g., mutates outside variables during render)?",
          "options": [
            "The entire build process crashes.",
            "The React Compiler safely and gracefully bails out of optimizing that specific component, falling back to standard unmemoized execution.",
            "The computer reboots.",
            "The component is deleted."
          ],
          "correctIndex": 1,
          "explanation": "The compiler ensures safety first: if it detects rule violations, it skips that component and preserves existing runtime behavior."
        },
        {
          "id": "Q-RCT-065",
          "question": "Why does the React Compiler require state and props to be strictly immutable?",
          "options": [
            "Because mutative methods (like `items.push()`) alter object contents without changing the object reference, causing change-detection invariants to fail.",
            "Because JavaScript arrays do not support mutation.",
            "Because mutation is illegal under web standards.",
            "Because immutable arrays use less memory."
          ],
          "correctIndex": 0,
          "explanation": "In-place mutation hides changes from reference equality checks, preventing the compiler from detecting when outputs need recalculation."
        },
        {
          "id": "Q-RCT-066",
          "question": "What ESLint plugin is used to verify that your React codebase adheres to compiler optimization rules?",
          "options": [
            "`eslint-plugin-prettier`",
            "`eslint-plugin-react-compiler`",
            "`eslint-plugin-jest`",
            "`eslint-plugin-import`"
          ],
          "correctIndex": 1,
          "explanation": "`eslint-plugin-react-compiler` flags unsafe mutations, impure renders, and violations of React rules directly in the editor."
        },
        {
          "id": "Q-RCT-067",
          "question": "Do you need to remove existing `useMemo` and `useCallback` hooks before adopting the React 19 Compiler?",
          "options": [
            "Yes, existing hooks cause compilation to fail.",
            "No, the compiler safely understands existing memoization hooks and works seamlessly alongside them without breaking code.",
            "Yes, manual hooks are removed from the React 19 API.",
            "Only on Windows."
          ],
          "correctIndex": 1,
          "explanation": "The React Compiler is fully backwards-compatible with existing manual memoization, allowing gradual incremental adoption."
        },
        {
          "id": "Q-RCT-068",
          "question": "What does the compiler's 'Fine-Grained Memoization' mean compared to standard `React.memo`?",
          "options": [
            "It only memoizes components on Mondays.",
            "`React.memo` skips re-rendering an entire component; the compiler can memoize individual JSX subtrees and values inside a component independently.",
            "It memoizes strings but not numbers.",
            "It only works on small components."
          ],
          "correctIndex": 1,
          "explanation": "The compiler optimizes at the block and expression level, allowing parts of a component to update while keeping unaffected JSX subtrees cached."
        },
        {
          "id": "Q-RCT-069",
          "question": "Which of the following functions violates the Rules of React and prevents compiler optimization?",
          "options": [
            "A component calculating `const sum = a + b;`",
            "A component pushing items into a global array: `window.allUsers.push(user);` during render.",
            "A component returning JSX.",
            "A component using `useState`."
          ],
          "correctIndex": 1,
          "explanation": "Mutating external state during render makes the component impure and unpredictable, breaking the core invariant required for automatic memoization."
        },
        {
          "id": "Q-RCT-070",
          "question": "How does the React Compiler impact developer productivity?",
          "options": [
            "It forces developers to write more boilerplate code.",
            "It allows developers to write clean, natural JavaScript without thinking about dependency arrays or memoization wrappers, while delivering optimal performance.",
            "It slows down typing speed.",
            "It requires all code to be rewritten in C++."
          ],
          "correctIndex": 1,
          "explanation": "Automating memoization removes cognitive overhead, allowing developers to write idiomatic code without sacrificing runtime efficiency."
        }
      ]
    },
    {
      "id": "ASM-RCT-008",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-008",
      "title": "Assessment: React 19 Actions & useActionState",
      "summary": "Evaluate your skills in React 19 Actions, async transitions, useActionState, pending indicators, and useFormStatus.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-071",
          "question": "What is an 'Action' in React 19?",
          "options": [
            "A Redux action object with a `type` string.",
            "An asynchronous transition function that automatically manages submission state, pending indicators, error handling, and optimistic updates.",
            "A mouse click event.",
            "A terminal shell script."
          ],
          "correctIndex": 1,
          "explanation": "In React 19, functions that handle async state transitions are recognized as Actions, coordinating loading and errors natively."
        },
        {
          "id": "Q-RCT-072",
          "question": "What are the three values returned by the `useActionState` hook?",
          "options": [
            "`[data, loading, error]`",
            "`[state, formAction, isPending]`",
            "`[value, setValue, reset]`",
            "`[dispatch, subscribe, getState]`"
          ],
          "correctIndex": 1,
          "explanation": "`useActionState(actionFn, initialState)` returns the current state, an action trigger (for forms or buttons), and the `isPending` boolean."
        },
        {
          "id": "Q-RCT-073",
          "question": "How do you pass an Action to a native HTML `<form>` in React 19?",
          "options": [
            "`<form onSubmit={e => action(e)}>`",
            "`<form action={formAction}>`",
            "`<form method='REACT'>`",
            "`<form data-action={formAction}>`"
          ],
          "correctIndex": 1,
          "explanation": "React 19 extends the native `action` attribute on `<form>`, allowing async action functions to be passed directly."
        },
        {
          "id": "Q-RCT-074",
          "question": "What capability does `useFormStatus` provide to nested child components?",
          "options": [
            "It checks if the user has internet access.",
            "It reads the pending status and form data of the parent `<form>` without requiring props to be passed down through the tree.",
            "It validates email addresses.",
            "It submits the form automatically every second."
          ],
          "correctIndex": 1,
          "explanation": "`useFormStatus` acts like context for forms, giving child submit buttons instant access to `pending` status without prop drilling."
        },
        {
          "id": "Q-RCT-075",
          "question": "What parameter does a form Action function automatically receive as its second argument?",
          "options": [
            "A standard browser MouseEvent.",
            "A native `FormData` object containing all key-value entries from the form inputs.",
            "A JSON string.",
            "The database connection string."
          ],
          "correctIndex": 1,
          "explanation": "Form Actions receive `(prevState, formData)`, allowing effortless extraction of inputs via `formData.get('name')`."
        },
        {
          "id": "Q-RCT-076",
          "question": "What happens to native HTML form inputs when an Action completes successfully in React 19?",
          "options": [
            "The browser crashes.",
            "React automatically resets the uncontrolled form inputs to their initial values for seamless successive submissions.",
            "Inputs are permanently disabled.",
            "The form is hidden from the DOM."
          ],
          "correctIndex": 1,
          "explanation": "Uncontrolled forms submitted via Actions automatically reset upon success, streamlining workflows like comment fields and message boxes."
        },
        {
          "id": "Q-RCT-077",
          "question": "How does `useActionState` handle errors thrown during async network requests?",
          "options": [
            "It logs the user out.",
            "It catches the error and surfaces it in the returned state object, avoiding unhandled promise rejections and try/catch boilerplate.",
            "It ignores all errors silently.",
            "It displays a blue screen."
          ],
          "correctIndex": 1,
          "explanation": "Action state captures failures and allows components to render structured, state-driven error messages cleanly."
        },
        {
          "id": "Q-RCT-078",
          "question": "Can an Action be attached directly to an individual `<button formAction={action}>`?",
          "options": [
            "No, only `<form>` elements support actions.",
            "Yes, buttons support `formAction`, allowing different buttons within the same form to trigger different server actions (e.g., 'Save Draft' vs 'Publish').",
            "Only on desktop browsers.",
            "Only in Next.js."
          ],
          "correctIndex": 1,
          "explanation": "Using `formAction` on buttons enables multiple independent Actions within a single form container."
        },
        {
          "id": "Q-RCT-079",
          "question": "Why is `isPending` from `useActionState` superior to manual `const [loading, setLoading] = useState(false)`?",
          "options": [
            "`isPending` uses zero bytes of memory.",
            "`isPending` is tied directly to React's concurrent transition scheduler, guaranteeing that pending states synchronize with UI updates without race conditions.",
            "`isPending` is faster than light.",
            "Manual loading states are deprecated."
          ],
          "correctIndex": 1,
          "explanation": "React coordinates `isPending` with transitions, ensuring buttons remain disabled exactly while asynchronous rendering is in flight."
        },
        {
          "id": "Q-RCT-080",
          "question": "What was `useActionState` named during the experimental Canary release cycle?",
          "options": [
            "`useAsyncState`",
            "`useFormState`",
            "`useServerAction`",
            "`useMutationState`"
          ],
          "correctIndex": 1,
          "explanation": "It was called `useFormState` before being generalized to `useActionState` to reflect that actions operate on any async trigger, not just forms."
        }
      ]
    },
    {
      "id": "ASM-RCT-009",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-009",
      "title": "Assessment: Optimistic UI Updates with useOptimistic",
      "summary": "Test your mastery of optimistic UI updates, the useOptimistic hook, immediate client-side rendering, and automatic rollback mechanics.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-081",
          "question": "What is the primary user experience advantage of an Optimistic UI update?",
          "options": [
            "It saves battery power on mobile phones.",
            "It renders the anticipated success state immediately without waiting for server network round-trips, eliminating perceived latency.",
            "It bypasses backend authentication.",
            "It guarantees that network requests never fail."
          ],
          "correctIndex": 1,
          "explanation": "Optimistic UI makes interfaces feel instant and responsive by updating the screen immediately, assuming success while network calls proceed in the background."
        },
        {
          "id": "Q-RCT-082",
          "question": "What two parameters does the `useOptimistic` hook accept?",
          "options": [
            "A URL string and a callback function.",
            "The current confirmed base state, and an update reducer function `(currentState, optimisticValue) => newOptimisticState`.",
            "A CSS class and an HTML tag.",
            "A database table and a column name."
          ],
          "correctIndex": 1,
          "explanation": "`useOptimistic(baseState, updateFn)` takes confirmed state and a pure reducer that produces the temporary optimistic state."
        },
        {
          "id": "Q-RCT-083",
          "question": "What happens if a network mutation throws an error after an optimistic update has been rendered via `useOptimistic`?",
          "options": [
            "The optimistic state remains frozen forever.",
            "React automatically discards the optimistic state and rolls the UI back to the confirmed base state without requiring manual rollback code.",
            "The browser crashes with a fatal error.",
            "The user must reload the web page manually."
          ],
          "correctIndex": 1,
          "explanation": "Because optimistic updates are tied to the transition lifecycle, errors cause the optimistic state to clear automatically."
        },
        {
          "id": "Q-RCT-084",
          "question": "In what context must `useOptimistic` dispatches be called to ensure proper lifecycle management?",
          "options": [
            "Inside a WebWorker thread.",
            "Inside a React Transition (e.g., inside an Action or wrapped in `startTransition`).",
            "Inside a `setTimeout` callback.",
            "Inside an HTML `<script>` tag."
          ],
          "correctIndex": 1,
          "explanation": "Optimistic updates require an active transition context so React knows when the asynchronous work begins and concludes."
        },
        {
          "id": "Q-RCT-085",
          "question": "Why is it best practice to visually distinguish optimistic items from confirmed items (e.g., lower opacity or a pending spinner)?",
          "options": [
            "Because high opacity uses too much CSS memory.",
            "It provides honest transparency, signaling to the user that the item is currently being transmitted and confirmed by the server.",
            "Because WCAG requires all new items to be gray.",
            "It is required by the JavaScript compiler."
          ],
          "correctIndex": 1,
          "explanation": "Subtle indicators (like reduced opacity or a clock icon) manage expectations, reassuring users without concealing in-flight status."
        },
        {
          "id": "Q-RCT-086",
          "question": "How does `useOptimistic` reconcile when the server returns confirmed data?",
          "options": [
            "It reboots the computer.",
            "When the Action finishes, the component updates its real base state (e.g., via `setMessages`), and React seamlessly transitions from optimistic state to confirmed state.",
            "It deletes all messages from the screen.",
            "It sends an SMS to the user."
          ],
          "correctIndex": 1,
          "explanation": "Updating confirmed state replaces the temporary optimistic state smoothly without flashing or duplicate rows."
        },
        {
          "id": "Q-RCT-087",
          "question": "What kind of unique identifier should be assigned to an optimistic item before the real database ID is returned?",
          "options": [
            "Always use the number 0.",
            "A temporary client-generated UUID (such as `crypto.randomUUID()`), replaced or reconciled when the server returns the persistent database ID.",
            "The user's social security number.",
            "Leave the ID field blank."
          ],
          "correctIndex": 1,
          "explanation": "Generating a temporary client UUID satisfies React's `key` requirement until the official primary key arrives from the database."
        },
        {
          "id": "Q-RCT-088",
          "question": "Which of the following interactions is an ideal candidate for optimistic UI updates?",
          "options": [
            "Authorizing a $50,000 corporate bank wire transfer.",
            "Toggling a 'Star' or 'Like' button on a post, or adding a comment to a chat thread.",
            "Executing permanent account deletion.",
            "Booking an airline seat."
          ],
          "correctIndex": 1,
          "explanation": "Low-risk, high-frequency social interactions (likes, stars, comments) have near-zero failure rates and benefit massively from instant optimistic feedback."
        },
        {
          "id": "Q-RCT-089",
          "question": "Why shouldn't high-stakes financial transactions (e.g., stock trades) use optimistic UI confirmation?",
          "options": [
            "Because stock exchanges do not use React.",
            "Because falsely displaying success for a transaction that might be rejected due to insufficient funds creates acute legal, financial, and emotional mistrust.",
            "Because optimistic hooks only work with strings.",
            "Because banks ban CSS animations."
          ],
          "correctIndex": 1,
          "explanation": "High-consequence financial transactions demand verified confirmation before indicating success to prevent misleading users."
        },
        {
          "id": "Q-RCT-090",
          "question": "Can multiple optimistic updates be queued concurrently using `useOptimistic`?",
          "options": [
            "No, only one optimistic update can exist at any time.",
            "Yes, if the user rapidly adds multiple items, the reducer sequentially incorporates each update into the cumulative optimistic state.",
            "Only on multi-core processors.",
            "Only in Safari."
          ],
          "correctIndex": 1,
          "explanation": "The reducer function chains multiple rapid optimistic dispatches cleanly, accumulating pending changes until resolution."
        }
      ]
    },
    {
      "id": "ASM-RCT-010",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-010",
      "title": "Assessment: The `use` Hook & Resource Loading",
      "summary": "Evaluate your capability with the React 19 `use()` API, unwrapping Promises in render, conditional Context reading, and Suspense integration.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-091",
          "question": "What makes the React 19 `use` API fundamentally different from all traditional React hooks?",
          "options": [
            "`use` only works in node.js backend scripts.",
            "`use` can be called conditionally (inside `if` statements) and inside loops, breaking the traditional constraint of calling hooks only at the top level.",
            "`use` is written in Python.",
            "`use` does not support TypeScript."
          ],
          "correctIndex": 1,
          "explanation": "Unlike standard hooks, `use()` is a flexible resource reading API that can be invoked conditionally during render."
        },
        {
          "id": "Q-RCT-092",
          "question": "What happens when you pass a pending Promise into `use(promise)` inside a component?",
          "options": [
            "The browser crashes immediately.",
            "React suspends the component, pauses its rendering, and displays the nearest `<Suspense fallback={...}>` component until the promise resolves.",
            "It returns `undefined`.",
            "It converts the promise into a string."
          ],
          "correctIndex": 1,
          "explanation": "Unwrapping a pending Promise suspends the component tree, triggering the Suspense fallback until the Promise fulfills."
        },
        {
          "id": "Q-RCT-093",
          "question": "Why should Promises passed to `use(promise)` NOT be initialized directly inside the component render body?",
          "options": [
            "Because React will throw a compile error.",
            "Because recreating a new Promise on every render will cause an infinite suspension loop, as React will see a brand new pending promise on every re-render.",
            "Because Promises take up too much RAM.",
            "Because fetch requests only work once."
          ],
          "correctIndex": 1,
          "explanation": "Initializing a Promise inside render creates a new Promise every time, causing endless refetching; promises should be passed as props, cached, or created in server components."
        },
        {
          "id": "Q-RCT-094",
          "question": "How does `use(Context)` improve upon the traditional `useContext(Context)` hook?",
          "options": [
            "It makes Context 10x faster.",
            "It allows components to read Context conditionally (e.g., inside an `if` block based on props), avoiding unnecessary context subscriptions when not needed.",
            "It encrypts Context data.",
            "It eliminates the need for a Provider."
          ],
          "correctIndex": 1,
          "explanation": "`use(Context)` can be placed inside conditional blocks, allowing components to opt into context subscriptions only when specific props require it."
        },
        {
          "id": "Q-RCT-095",
          "question": "What boundary component must wrap any component that uses `use(promise)` to handle loading states?",
          "options": [
            "`<ErrorBoundary>`",
            "`<Suspense fallback={...}>`",
            "`<StrictMode>`",
            "`<Provider>`"
          ],
          "correctIndex": 1,
          "explanation": "`<Suspense>` catches suspended promises and renders the declared fallback UI (such as a skeleton loader) while data resolves."
        },
        {
          "id": "Q-RCT-096",
          "question": "What happens if a Promise passed to `use(promise)` rejects with an error?",
          "options": [
            "React silently ignores the rejection.",
            "React throws the error to the nearest `<ErrorBoundary>`, which catches it and displays a fallback error UI.",
            "The web page refreshes automatically.",
            "The promise retries 1,000 times."
          ],
          "correctIndex": 1,
          "explanation": "Promise rejections during `use()` bubble up to the nearest Error Boundary, mirroring standard synchronous exception handling."
        },
        {
          "id": "Q-RCT-097",
          "question": "Can `use()` be used to read non-Promise and non-Context resources in React 19?",
          "options": [
            "Yes, it can read local text files.",
            "Currently, `use()` is explicitly designed only to read Promises and React Context objects.",
            "It can read SQL databases directly.",
            "It can read microphone input."
          ],
          "correctIndex": 1,
          "explanation": "In React 19, `use` specifically unwraps Promises and reads Context instances."
        },
        {
          "id": "Q-RCT-098",
          "question": "How does `use()` eliminate the classic 'Waterfall' problem when fetching data across parent and child components?",
          "options": [
            "By fetching all data at midnight.",
            "Promises can be initiated in parallel at the top level and passed down as unresolved promises, allowing child components to suspend and stream concurrently.",
            "By using HTTP/1.0.",
            "Waterfalls cannot be avoided in web design."
          ],
          "correctIndex": 1,
          "explanation": "Initiating multiple promises concurrently and passing them down allows parallel resolution under Suspense streaming."
        },
        {
          "id": "Q-RCT-099",
          "question": "How does `use()` differ from `await` in JavaScript?",
          "options": [
            "There is no difference.",
            "`await` can only be used inside `async` functions; `use()` can be called inside standard synchronous component render functions.",
            "`await` is faster.",
            "`use()` is deprecated."
          ],
          "correctIndex": 1,
          "explanation": "Component functions cannot be `async` in client React; `use()` enables unwrapping promises inside synchronous functional components."
        },
        {
          "id": "Q-RCT-100",
          "question": "What type of data does `use(MyPromise)` return upon successful resolution?",
          "options": [
            "The Promise object itself.",
            "The resolved value of the Promise (type `T` for `Promise<T>`).",
            "A boolean indicating success.",
            "A JSON string."
          ],
          "correctIndex": 1,
          "explanation": "`use()` directly returns the unwrapped data payload yielded by the resolved promise."
        }
      ]
    },
    {
      "id": "ASM-RCT-011",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-011",
      "title": "Assessment: Concurrency, Transitions & useTransition",
      "summary": "Test your skills in concurrent rendering, urgent vs non-urgent state priorities, startTransition, useTransition, and useDeferredValue.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-101",
          "question": "What is an 'Urgent Update' in React's concurrency model?",
          "options": [
            "An update that sends an email alert.",
            "Direct physical user interactions (keystrokes, button clicks, drags) that demand immediate visual feedback to prevent perceptible input lag.",
            "An update that occurs every second.",
            "An update on the checkout page."
          ],
          "correctIndex": 1,
          "explanation": "Urgent updates reflect immediate human interactions that cause noticeable user frustration if delayed by even 50ms."
        },
        {
          "id": "Q-RCT-102",
          "question": "What is a 'Transition' (Non-Urgent Update) in React?",
          "options": [
            "A CSS fade-in animation.",
            "A state update marked via `startTransition` or `useTransition` that tells React the update can be interrupted or deferred if urgent user input occurs.",
            "A page navigation between two domains.",
            "A database migration."
          ],
          "correctIndex": 1,
          "explanation": "Transitions tell React that computing the new UI is lower priority; if the user clicks or types again, React pauses or abandons the transition."
        },
        {
          "id": "Q-RCT-103",
          "question": "What does the `isPending` boolean returned by `useTransition` indicate?",
          "options": [
            "Whether the user is connected to Wi-Fi.",
            "Whether a non-urgent transition is currently rendering in the background.",
            "Whether the component has unmounted.",
            "Whether the user is typing."
          ],
          "correctIndex": 1,
          "explanation": "`isPending` becomes `true` while the transition render is in progress, allowing developers to show inline spinner indicators or mute old UI."
        },
        {
          "id": "Q-RCT-104",
          "question": "How does `useTransition` prevent search inputs from lagging when filtering 10,000 items?",
          "options": [
            "It deletes 9,000 items automatically.",
            "It updates the input text urgently (keeping typing smooth) while wrapping the 10,000-item filter in `startTransition`, allowing new keystrokes to interrupt ongoing filters.",
            "It moves filtering to the GPU.",
            "It runs the filter on another server."
          ],
          "correctIndex": 1,
          "explanation": "Typing remains 100% fluid because the CPU-intensive list filtering yields immediately whenever a new keystroke arrives."
        },
        {
          "id": "Q-RCT-105",
          "question": "When should you use `useDeferredValue` instead of `useTransition`?",
          "options": [
            "When you only want to update once per hour.",
            "When you receive a value as a prop from a parent component and do not have direct access to the `setState` function to wrap in `startTransition`.",
            "When using Internet Explorer.",
            "When you do not use TypeScript."
          ],
          "correctIndex": 1,
          "explanation": "`useDeferredValue(val)` creates a deferred clone of an incoming value, automatically lagging behind while new renders compute."
        },
        {
          "id": "Q-RCT-106",
          "question": "How does `useDeferredValue` compare to traditional `setTimeout` debouncing?",
          "options": [
            "They are identical.",
            "`useDeferredValue` is adaptive: on fast devices it renders immediately with zero artificial delay, while on slow devices it defers gracefully without dropping frames.",
            "`setTimeout` is faster.",
            "`useDeferredValue` only works on numbers."
          ],
          "correctIndex": 1,
          "explanation": "Debounce imposes a fixed artificial delay (e.g., 300ms) regardless of machine speed; `useDeferredValue` is adaptive and renders as fast as the hardware allows."
        },
        {
          "id": "Q-RCT-107",
          "question": "Can asynchronous async/await functions be passed directly into `startTransition` in React 19?",
          "options": [
            "No, `startTransition` only accepts synchronous callbacks.",
            "Yes, React 19 Actions explicitly support async functions inside `startTransition`, managing pending states across async fetch calls.",
            "Only in Node.js.",
            "Only with Redux."
          ],
          "correctIndex": 1,
          "explanation": "React 19 upgraded `startTransition` to natively support asynchronous functions, defining the Action architecture."
        },
        {
          "id": "Q-RCT-108",
          "question": "What happens if a user types 'A', and before React finishes rendering the filtered list, the user types 'B'?",
          "options": [
            "React crashes with a thread error.",
            "React immediately discards the in-progress render for 'A' and starts rendering the updated state for 'AB', saving CPU cycles.",
            "React queues both renders sequentially, freezing the screen for 2x duration.",
            "React ignores the second keystroke."
          ],
          "correctIndex": 1,
          "explanation": "Concurrent React discards stale, superseded transition work, keeping the UI focused on the freshest user intent."
        },
        {
          "id": "Q-RCT-109",
          "question": "How can you visually indicate that a `useDeferredValue` is currently stale?",
          "options": [
            "Check if `value !== deferredValue`, and apply a reduced opacity (e.g., 0.6) or blur to the rendered container.",
            "Ask the user to reload the page.",
            "Show a modal dialog.",
            "Hide the component completely."
          ],
          "correctIndex": 0,
          "explanation": "Comparing `current !== deferred` reveals that a fresh render is pending, allowing subtle dimming of old content."
        },
        {
          "id": "Q-RCT-110",
          "question": "What is the impact of Concurrent React on frame rates (FPS)?",
          "options": [
            "It locks frame rates at 30 FPS.",
            "By breaking rendering into cooperative chunks and yielding to the browser event loop, it prevents main thread blocking and preserves smooth 60/120 FPS animations.",
            "It drops frame rates to 0 FPS.",
            "It has no impact."
          ],
          "correctIndex": 1,
          "explanation": "Cooperative multitasking allows browser layout and animations to execute smoothly even during intensive component reconciliations."
        }
      ]
    },
    {
      "id": "ASM-RCT-012",
      "courseId": "CRS-RCT-001",
      "chapterId": "CH-RCT-012",
      "title": "Assessment: Custom Hooks Engineering & Clean Architecture",
      "summary": "Assess your expertise in designing reusable custom hooks, encapsulating side-effects, useDebounce, useLocalStorage, and presentation-logic separation.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-RCT-111",
          "question": "What naming convention is strictly enforced by React and ESLint for custom hooks?",
          "options": [
            "They must end with `Helper` (e.g., `debounceHelper`).",
            "They must start with the lowercase prefix `use` (e.g., `useDebounce`, `useLocalStorage`).",
            "They must be named in ALL_CAPS.",
            "They must include the word `Hook`."
          ],
          "correctIndex": 1,
          "explanation": "The `use` prefix is the syntactic contract that enables the React linter to enforce the Rules of Hooks on that function."
        },
        {
          "id": "Q-RCT-112",
          "question": "Do two components that call the same custom hook share the exact same state instance?",
          "options": [
            "Yes, custom hooks are global singletons.",
            "No, each component that calls a custom hook gets its own independent, isolated instance of state and effects.",
            "Only if they have the same component name.",
            "Only in production mode."
          ],
          "correctIndex": 1,
          "explanation": "Custom hooks share stateful logic, not state data; each component invocation gets a distinct set of internal state variables."
        },
        {
          "id": "Q-RCT-113",
          "question": "What problem does the `useDebounce` hook solve when connected to a live search input?",
          "options": [
            "It translates search queries into French.",
            "It delays firing network API requests until the user stops typing for a specified interval (e.g., 300ms), preventing server bombardment.",
            "It encrypts the search query.",
            "It forces all searches to return results."
          ],
          "correctIndex": 1,
          "explanation": "Debouncing postpones execution until typing settles, cutting redundant intermediate network requests by up to 90%."
        },
        {
          "id": "Q-RCT-114",
          "question": "Why should `window.localStorage` reads inside a `useLocalStorage` hook be placed inside a lazy initializer function `useState(() => ...)`?",
          "options": [
            "Because `localStorage` is asynchronous.",
            "Synchronous `localStorage` reads are slow disk I/O; lazy initialization ensures the storage is read only once on mount, rather than on every single re-render.",
            "Because React crashes otherwise.",
            "Because `useState` requires functions."
          ],
          "correctIndex": 1,
          "explanation": "Passing an initializer function guarantees the costly disk read runs once during initial mount rather than on every subsequent render pass."
        },
        {
          "id": "Q-RCT-115",
          "question": "Why should custom hooks interacting with the `window` object include `typeof window !== 'undefined'` checks?",
          "options": [
            "To prevent hackers from closing the window.",
            "To prevent fatal crashes during Server-Side Rendering (SSR in Next.js), where code executes in a Node.js environment without a global `window` object.",
            "Because `window` is deprecated in HTML5.",
            "To support mobile devices."
          ],
          "correctIndex": 1,
          "explanation": "On server environments (SSR), `window` does not exist; guarding window access prevents server build and rendering crashes."
        },
        {
          "id": "Q-RCT-116",
          "question": "What legacy design patterns did custom hooks successfully replace in React architecture?",
          "options": [
            "CSS stylesheets and HTML tags.",
            "Higher-Order Components (HOCs) and Render Props, which created deep 'wrapper hell' and obscured prop origins.",
            "SQL databases.",
            "JavaScript classes and promises."
          ],
          "correctIndex": 1,
          "explanation": "Hooks flattened component trees by sharing logic directly within functions rather than nesting components inside complex wrapper hierarchies."
        },
        {
          "id": "Q-RCT-117",
          "question": "How does the `useMediaQuery` custom hook keep component UI synchronized with window resize events?",
          "options": [
            "By polling `window.innerWidth` every 10ms with `setInterval`.",
            "By attaching an event listener to `window.matchMedia(query)` inside a `useEffect` and updating state when the media query match changes.",
            "By refreshing the webpage on resize.",
            "By injecting CSS media queries into the DOM."
          ],
          "correctIndex": 1,
          "explanation": "`matchMedia.addEventListener('change', ...)` responds directly to browser viewport boundary crossings efficiently without polling."
        },
        {
          "id": "Q-RCT-118",
          "question": "What is the recommended design guideline regarding return values from custom hooks?",
          "options": [
            "Always return a string.",
            "Return a tuple (array `[val, setter]`) if there are 2 core elements with intuitive naming; return an object `{ data, loading, error, refetch }` if returning multiple properties.",
            "Always return `null`.",
            "Return a Promise."
          ],
          "correctIndex": 1,
          "explanation": "Tuples allow convenient renaming for 1-2 values; objects provide clear named properties and easy destructuring when scaling beyond 2 values."
        },
        {
          "id": "Q-RCT-119",
          "question": "Why should custom hooks clean up event listeners inside their `useEffect` return function?",
          "options": [
            "Because browsers limit total listeners to 5.",
            "To prevent memory leaks and zombie listeners that continue executing callbacks after the consuming component has unmounted.",
            "To make the code look professional.",
            "Because React throws a compile error otherwise."
          ],
          "correctIndex": 1,
          "explanation": "Uncleaned listeners persist in memory, holding onto references and firing callbacks against unmounted components."
        },
        {
          "id": "Q-RCT-120",
          "question": "What is the 'Clean Architecture' separation of concerns between components and custom hooks?",
          "options": [
            "Components contain all code; hooks are only used for CSS.",
            "Components serve as thin presentation layers responsible for JSX layout; custom hooks encapsulate data fetching, state coordination, and side effects.",
            "Hooks are only written by junior engineers.",
            "Components must be under 10 lines of code."
          ],
          "correctIndex": 1,
          "explanation": "Separating presentation from stateful business logic creates testable, modular codebases where UI and business rules can evolve independently."
        }
      ]
    }
  ]
};
