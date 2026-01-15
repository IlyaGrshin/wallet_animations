Concise rules for building accessible, fast, delightful UIs Use MUST/SHOULD/NEVER to guide decisions

## Code Quality & Process

- **Checks**:
  - MUST: Automatically run linting/type checks before completing tasks.
  - MUST: Fix all errors before submission.
  - NEVER: create markdown (`.md`) files unless explicitly asked.
  - NEVER: Use emojis in agent replies.
  - SHOULD: Be direct (no "I'm right", just the solution).

- **File Limits**:
  - MUST: Keep files under **250 lines**. Refactor if larger (split components, hooks, utils).

- **React Best Practices**:
  - READ: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
  - SHOULD: Avoid `useEffect` for data transformation, user events, or state resets.
  - MUST: Use `useEffect` ONLY for external synchronization or cleanup.

## React Performance Optimization

**Impact Priority: CRITICAL → HIGH → MEDIUM → LOW**

Comprehensive performance optimization guide for React applications. Rules are prioritized by impact from critical (eliminating waterfalls, reducing bundle size) to incremental (advanced patterns).

### 1. Eliminating Waterfalls

**Impact: CRITICAL**

Waterfalls are the #1 performance killer. Each sequential await adds full network latency. Eliminating them yields the largest gains.

#### 1.1 Defer Await Until Needed

**Impact: HIGH (avoids blocking unused code paths)**

- MUST: Move `await` operations into the branches where they're actually used to avoid blocking code paths that don't need them.

**Incorrect: blocks both branches**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  
  if (skipProcessing) {
    // Returns immediately but still waited for userData
    return { skipped: true }
  }
  
  // Only this branch uses userData
  return processUserData(userData)
}
```

**Correct: only blocks when needed**

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    // Returns immediately without waiting
    return { skipped: true }
  }
  
  // Fetch only when needed
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

#### 1.2 Dependency-Based Parallelization

**Impact: CRITICAL (2-10× improvement)**

- MUST: For operations with partial dependencies, use `better-all` to maximize parallelism. It automatically starts each task at the earliest possible moment.

**Incorrect: profile waits for config unnecessarily**

```typescript
const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
])
const profile = await fetchProfile(user.id)
```

**Correct: config and profile run in parallel**

```typescript
import { all } from 'better-all'

const { user, config, profile } = await all({
  async user() { return fetchUser() },
  async config() { return fetchConfig() },
  async profile() {
    return fetchProfile((await this.$.user).id)
  }
})
```

Reference: [https://github.com/shuding/better-all](https://github.com/shuding/better-all)

#### 1.3 Prevent Waterfall Chains in API Routes

**Impact: CRITICAL (2-10× improvement)**

- MUST: In API routes and Server Actions, start independent operations immediately, even if you don't await them yet.

**Incorrect: config waits for auth, data waits for both**

```typescript
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

**Correct: auth and config start immediately**

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}
```

#### 1.4 Promise.all() for Independent Operations

**Impact: CRITICAL (2-10× improvement)**

- MUST: When async operations have no interdependencies, execute them concurrently using `Promise.all()`.

**Incorrect: sequential execution, 3 round trips**

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

**Correct: parallel execution, 1 round trip**

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

#### 1.5 Strategic Suspense Boundaries

**Impact: HIGH (faster initial paint)**

- SHOULD: Instead of awaiting data in async components before returning JSX, use Suspense boundaries to show the wrapper UI faster while data loads.

**Incorrect: wrapper blocked by data fetching**

```tsx
async function Page() {
  const data = await fetchData() // Blocks entire page
  
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

**Correct: wrapper shows immediately, data streams in**

```tsx
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Only blocks this component
  return <div>{data.content}</div>
}
```

### 2. Bundle Size Optimization

**Impact: CRITICAL**

Reducing initial bundle size improves Time to Interactive and Largest Contentful Paint.

#### 2.1 Avoid Barrel File Imports

**Impact: CRITICAL (200-800ms import cost, slow builds)**

- MUST: Import directly from source files instead of barrel files to avoid loading thousands of unused modules. **Barrel files** are entry points that re-export multiple modules (e.g., `index.js` that does `export * from './module'`).

**Incorrect: imports entire library**

```tsx
import { Check, X, Menu } from 'lucide-react'
// Loads 1,583 modules, takes ~2.8s extra in dev
```

**Correct: imports only what you need**

```tsx
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
// Loads only 3 modules (~2KB vs ~1MB)
```

#### 2.2 Conditional Module Loading

**Impact: HIGH (loads large data only when needed)**

- SHOULD: Load large data or modules only when a feature is activated.

#### 2.3 Defer Non-Critical Third-Party Libraries

**Impact: MEDIUM (loads after hydration)**

- SHOULD: Analytics, logging, and error tracking don't block user interaction. Load them after hydration using dynamic imports.

#### 2.4 Dynamic Imports for Heavy Components

**Impact: CRITICAL (directly affects TTI and LCP)**

- MUST: Use dynamic imports to lazy-load large components not needed on initial render.

#### 2.5 Preload Based on User Intent

**Impact: MEDIUM (reduces perceived latency)**

- SHOULD: Preload heavy bundles before they're needed to reduce perceived latency (e.g., on hover/focus).

### 3. Server-Side Performance

**Impact: HIGH**

#### 3.1 Cross-Request LRU Caching

**Impact: HIGH (caches across requests)**

- SHOULD: Use LRU cache for data shared across sequential requests. `React.cache()` only works within one request.

#### 3.2 Minimize Serialization at RSC Boundaries

**Impact: HIGH (reduces data transfer size)**

- MUST: Only pass fields that the client actually uses. The React Server/Client boundary serializes all object properties into strings.

#### 3.3 Parallel Data Fetching with Component Composition

**Impact: CRITICAL (eliminates server-side waterfalls)**

- MUST: Restructure with composition to parallelize data fetching. React Server Components execute sequentially within a tree.

#### 3.4 Per-Request Deduplication with React.cache()

**Impact: MEDIUM (deduplicates within request)**

- SHOULD: Use `React.cache()` for server-side request deduplication. Authentication and database queries benefit most.

#### 3.5 Use after() for Non-Blocking Operations

**Impact: MEDIUM (faster response times)**

- SHOULD: Use Next.js's `after()` to schedule work that should execute after a response is sent (logging, analytics, notifications).

### 4. Client-Side Data Fetching

**Impact: MEDIUM-HIGH**

#### 4.1 Deduplicate Global Event Listeners

**Impact: LOW (single listener for N components)**

- SHOULD: Use `useSWRSubscription()` to share global event listeners across component instances.

#### 4.2 Use SWR for Automatic Deduplication

**Impact: MEDIUM-HIGH (automatic deduplication)**

- SHOULD: Use SWR for request deduplication, caching, and revalidation across component instances.

### 5. Re-render Optimization

**Impact: MEDIUM**

#### 5.1 Defer State Reads to Usage Point

**Impact: MEDIUM (avoids unnecessary subscriptions)**

- SHOULD: Don't subscribe to dynamic state (searchParams, localStorage) if you only read it inside callbacks.

#### 5.2 Extract to Memoized Components

**Impact: MEDIUM (enables early returns)**

- SHOULD: Extract expensive work into memoized components to enable early returns before computation.

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, manual memoization with `memo()` and `useMemo()` is not necessary.

#### 5.3 Narrow Effect Dependencies

**Impact: LOW (minimizes effect re-runs)**

- MUST: Specify primitive dependencies instead of objects to minimize effect re-runs.

#### 5.4 Subscribe to Derived State

**Impact: MEDIUM (reduces re-render frequency)**

- SHOULD: Subscribe to derived boolean state instead of continuous values to reduce re-render frequency.

#### 5.5 Use Functional setState Updates

**Impact: MEDIUM (prevents stale closures and unnecessary callback recreations)**

- MUST: When updating state based on the current state value, use the functional update form of setState instead of directly referencing the state variable.

**Incorrect: requires state as dependency**

```tsx
const addItems = useCallback((newItems: Item[]) => {
  setItems([...items, ...newItems])
}, [items])  // ❌ items dependency causes recreations
```

**Correct: stable callbacks, no stale closures**

```tsx
const addItems = useCallback((newItems: Item[]) => {
  setItems(curr => [...curr, ...newItems])
}, [])  // ✅ No dependencies needed
```

#### 5.6 Use Lazy State Initialization

**Impact: MEDIUM (wasted computation on every render)**

- MUST: Pass a function to `useState` for expensive initial values. Without the function form, the initializer runs on every render even though the value is only used once.

#### 5.7 Use Transitions for Non-Urgent Updates

**Impact: MEDIUM (maintains UI responsiveness)**

- SHOULD: Mark frequent, non-urgent state updates as transitions to maintain UI responsiveness.

### 6. Rendering Performance

**Impact: MEDIUM**

#### 6.1 Animate SVG Wrapper Instead of SVG Element

**Impact: LOW (enables hardware acceleration)**

- SHOULD: Wrap SVG in a `<div>` and animate the wrapper instead. Many browsers don't have hardware acceleration for CSS3 animations on SVG elements.

#### 6.2 CSS content-visibility for Long Lists

**Impact: HIGH (faster initial render)**

- SHOULD: Apply `content-visibility: auto` to defer off-screen rendering.

#### 6.3 Hoist Static JSX Elements

**Impact: LOW (avoids re-creation)**

- SHOULD: Extract static JSX outside components to avoid re-creation.

**Note:** If your project has [React Compiler](https://react.dev/learn/react-compiler) enabled, the compiler automatically hoists static JSX elements.

#### 6.4 Optimize SVG Precision

**Impact: LOW (reduces file size)**

- SHOULD: Reduce SVG coordinate precision to decrease file size.

#### 6.5 Prevent Hydration Mismatch Without Flickering

**Impact: MEDIUM (avoids visual flicker and hydration errors)**

- MUST: When rendering content that depends on client-side storage (localStorage, cookies), avoid both SSR breakage and post-hydration flickering by injecting a synchronous script that updates the DOM before React hydrates.

#### 6.6 Use Activity Component for Show/Hide

**Impact: MEDIUM (preserves state/DOM)**

- SHOULD: Use React's `<Activity>` to preserve state/DOM for expensive components that frequently toggle visibility.

#### 6.7 Use Explicit Conditional Rendering

**Impact: LOW (prevents rendering 0 or NaN)**

- MUST: Use explicit ternary operators (`? :`) instead of `&&` for conditional rendering when the condition can be `0`, `NaN`, or other falsy values that render.

### 7. JavaScript Performance

**Impact: LOW-MEDIUM**

#### 7.1 Batch DOM CSS Changes

**Impact: MEDIUM (reduces reflows/repaints)**

- MUST: Avoid changing styles one property at a time. Group multiple CSS changes together via classes or `cssText` to minimize browser reflows.

#### 7.2 Build Index Maps for Repeated Lookups

**Impact: LOW-MEDIUM (1M ops to 2K ops)**

- SHOULD: Multiple `.find()` calls by the same key should use a Map.

#### 7.3 Cache Property Access in Loops

**Impact: LOW-MEDIUM (reduces lookups)**

- SHOULD: Cache object property lookups in hot paths.

#### 7.4 Cache Repeated Function Calls

**Impact: MEDIUM (avoid redundant computation)**

- SHOULD: Use a module-level Map to cache function results when the same function is called repeatedly with the same inputs during render.

#### 7.5 Cache Storage API Calls

**Impact: LOW-MEDIUM (reduces expensive I/O)**

- SHOULD: `localStorage`, `sessionStorage`, and `document.cookie` are synchronous and expensive. Cache reads in memory.

#### 7.6 Combine Multiple Array Iterations

**Impact: LOW-MEDIUM (reduces iterations)**

- SHOULD: Multiple `.filter()` or `.map()` calls iterate the array multiple times. Combine into one loop.

#### 7.7 Early Length Check for Array Comparisons

**Impact: MEDIUM-HIGH (avoids expensive operations when lengths differ)**

- MUST: When comparing arrays with expensive operations (sorting, deep equality, serialization), check lengths first.

#### 7.8 Early Return from Functions

**Impact: LOW-MEDIUM (avoids unnecessary computation)**

- SHOULD: Return early when result is determined to skip unnecessary processing.

#### 7.9 Hoist RegExp Creation

**Impact: LOW-MEDIUM (avoids recreation)**

- MUST: Don't create RegExp inside render. Hoist to module scope or memoize with `useMemo()`.

#### 7.10 Use Loop for Min/Max Instead of Sort

**Impact: LOW (O(n) instead of O(n log n))**

- MUST: Finding the smallest or largest element only requires a single pass through the array. Sorting is wasteful and slower.

#### 7.11 Use Set/Map for O(1) Lookups

**Impact: LOW-MEDIUM (O(n) to O(1))**

- SHOULD: Convert arrays to Set/Map for repeated membership checks.

#### 7.12 Use toSorted() Instead of sort() for Immutability

**Impact: MEDIUM-HIGH (prevents mutation bugs in React state)**

- MUST: `.sort()` mutates the array in place, which can cause bugs with React state and props. Use `.toSorted()` to create a new sorted array without mutation.

### 8. Advanced Patterns

**Impact: LOW**

#### 8.1 Store Event Handlers in Refs

**Impact: LOW (stable subscriptions)**

- SHOULD: Store callbacks in refs when used in effects that shouldn't re-subscribe on callback changes. Use `useEffectEvent` if available.

#### 8.2 useLatest for Stable Callback Refs

**Impact: LOW (prevents effect re-runs)**

- SHOULD: Access latest values in callbacks without adding them to dependency arrays. Prevents effect re-runs while avoiding stale closures.

## Package Management

- MUST: Use **yarn** for package management (do not use npm/pnpm unless explicitly requested).
- MUST: Verify dependencies with `yarn list` if needed.

## Development Patterns

- **Routing**:
  - MUST: Use `wouter` with `useHashLocation` (`src/router`).
  - MUST: Wrap routes in `PageTransition` for orchestrated animations.
  - MUST: Use the `Redirect` component for strict navigation control.

- **Component Structure**:
  - MUST: Create components in dedicated folders (`src/components/ComponentName`).
  - MUST: Use **SCSS Modules** for styling (`ComponentName.module.scss`).
  - MUST: Use `PropTypes` for runtime type checking in all components.
  - MUST: Index files (`index.js`) should export the component as default.

- **State & Context**:
  - SHOULD: Use local state for isolated UI logic.
  - MUST: Use provided contexts (`DeviceProvider`, `AppearanceProvider`) for global app state (platform, theme).
  - MUST: Use `useModal` hook pattern for managing modal visibility.


## Platform & Tech Stack

- MUST: Build for Telegram Web App (TWA) environment (`@twa-dev/sdk`).
- MUST: Use `wouter` for routing; respect the patched `WebApp.BackButton` behavior in `App.js`.
- MUST: Use `motion` libraries (framer-motion compatible) for complex animations.
- MUST: Adapt UI components for `.apple` (iOS/macOS) vs `.material` (Android/Desktop) body classes.
- MUST: Use strict CSS/Sass (no Tailwind unless requested); verify `user-select: none` is applied globally (except inputs).

## Interactions

- Keyboard
  - MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
  - MUST: Visible focus rings (`:focus-visible`; group with `:focus-within`)
  - MUST: Never `outline-none` / `outline: none` without focus replacement
  - MUST: Use `:focus-visible` over `:focus` (avoid focus ring on click)
  - MUST: Group focus with `:focus-within` for compound controls
  - MUST: Manage focus (trap, move, and return) per APG patterns
- Targets & input
  - MUST: Hit target ≥24px (mobile ≥44px) If visual <24px, expand hit area
  - MUST: Mobile `<input>` font-size ≥16px or set:
    ```html
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
    ```

  - NEVER: Disable browser zoom
  - MUST: `touch-action: manipulation` to prevent double-tap zoom; set `-webkit-tap-highlight-color` to match design
- Inputs & forms (behavior)
  - MUST: Hydration-safe inputs (no lost focus/value)
  - MUST: Inputs with `value` need `onChange` (or use `defaultValue` for uncontrolled)
  - NEVER: Block paste in `<input>/<textarea>` (never use `onPaste` + `preventDefault`)
  - MUST: Loading buttons show spinner and keep original label
  - MUST: Enter submits focused text input In `<textarea>`, ⌘/Ctrl+Enter submits; Enter adds newline
  - MUST: Keep submit enabled until request starts; then disable, show spinner, use idempotency key
  - MUST: Don't block typing; accept free text and validate after
  - MUST: Allow submitting incomplete forms to surface validation
  - MUST: Errors inline next to fields; on submit, focus first error
  - MUST: `autocomplete` + meaningful `name`; correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
  - MUST: `autocomplete="off"` on non-auth fields to avoid password manager triggers
  - MUST: Labels clickable (`htmlFor` or wrapping control)
  - SHOULD: Disable spellcheck for emails/codes/usernames (`spellCheck={false}`)
  - SHOULD: Placeholders end with ellipsis and show example pattern (eg, `+1 (123) 456-7890`, `sk-012345…`)
  - MUST: Warn on unsaved changes before navigation (`beforeunload` or router guard)
  - MUST: Compatible with password managers & 2FA; allow pasting one-time codes
  - MUST: Trim values to handle text expansion trailing spaces
  - MUST: No dead zones on checkboxes/radios; label+control share one generous hit target
- State & navigation
  - MUST: URL reflects state (deep-link filters/tabs/pagination/expanded panels) Prefer libs like [nuqs](https://nuqs.dev)
  - MUST: Back/Forward restores scroll
  - MUST: Links are links—use `<a>/<Link>` for navigation (support Cmd/Ctrl/middle-click)
- Feedback
  - SHOULD: Optimistic UI; reconcile on response; on failure show error and rollback or offer Undo
  - MUST: Confirm destructive actions or provide Undo window
  - MUST: Use polite `aria-live` for toasts/inline validation
  - SHOULD: Ellipsis (`…`) for options that open follow-ups (eg, "Rename…") and loading states (eg, "Loading…", "Saving…", "Generating…")
- Touch/drag/scroll
  - MUST: Design forgiving interactions (generous targets, clear affordances; avoid finickiness)
  - MUST: `touch-action: manipulation` (prevents double-tap zoom delay)
  - MUST: `-webkit-tap-highlight-color` set intentionally
  - MUST: Delay first tooltip in a group; subsequent peers no delay
  - MUST: Intentional `overscroll-behavior: contain` in modals/drawers/sheets
  - MUST: During drag: disable text selection, `inert` on dragged elements
  - MUST: No "dead-looking" interactive zones—if it looks clickable, it is
- Autofocus
  - SHOULD: Autofocus sparingly—desktop only, single primary input; avoid on mobile (to avoid layout shift)

## Animation

- **General**:
  - MUST: Honor `prefers-reduced-motion` (provide reduced variant or disable).
  - SHOULD: Default to `ease-out` (0.2s - 0.3s). Limit animations to <1s.
  - MUST: Animations are interruptible and input-driven.
  - NEVER: Use `transition: all`—list properties explicitly.

- **Easing Curves** (Use these over built-ins):
  - `ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)` (quint) or `cubic-bezier(0.19, 1, 0.22, 1)` (expo) — *entering/interaction*
  - `ease-in-out`: `cubic-bezier(0.86, 0, 0.07, 1)` (quint) — *moving on screen*
  - `ease-in`: Avoid (makes UI feel slow).
  - Hover: `ease` (200ms).

- **Performance (Tier List)**:
  - **S-Tier** (Compositor): `transform`, `opacity`, `filter`, `clip-path`. *Preferred.*
  - **A-Tier** (Main Thread): Trigger compositor steps.
  - **D-Tier** (Layout): `width`, `height`, `margin`, `top/left`. *AVOID.*
  - **F-Tier**: Layout thrashing (read-write loops).

- **Best Practices**:
  - MUST: Animate `transform`/`opacity` only (compositor-friendly).
  - MUST: Use `transform` instead of positioning (`top/left`).
  - MUST: Use `will-change` sparingly (`transform`, `opacity` only).
  - MUST: Virtualize large lists.
  - MUST: Correct `transform-origin` (animate from trigger source).
  - MUST: SVG transforms: use on `<g>` wrapper with `transform-box: fill-box; transform-origin: center`.

## Typography

- MUST: Use ellipsis character `…` not `...`
- MUST: Use curly quotes `"` `"` not straight `"`
- MUST: Use non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- MUST: Loading states end with `…`: `"Loading…"`, `"Saving…"`
- MUST: `font-variant-numeric: tabular-nums` for number columns/comparisons
- SHOULD: Use `text-wrap: balance` or `text-pretty` on headings (prevents widows)

## Images

- MUST: `<img>` needs explicit `width` and `height` (prevents CLS)
- MUST: Below-fold images: `loading="lazy"`
- MUST: Above-fold critical images: `priority` or `fetchpriority="high"`

## Layout

- SHOULD: Optical alignment; adjust by ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- SHOULD: Balance icon/text lockups (stroke/weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (use env(safe-area-inset-*) and var(--tg-content-safe-area-inset-top))
- MUST: Full-bleed layouts need `env(safe-area-inset-*)` for notches
- MUST: Avoid unwanted scrollbars: `overflow-x-hidden` on containers, fix content overflow
- SHOULD: Flex/grid over JS measurement for layout


## Content & Accessibility

- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (" "); avoid widows/orphans
- MUST: Tabular numbers for comparisons (`font-variant-numeric: tabular-nums` or a mono like Geist Mono)
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Don't ship the schema—visuals may omit labels but accessible names still exist
- MUST: Use the ellipsis character `…` (not ``)
- MUST: `scroll-margin-top` on headings for anchored links; include a "Skip to content" link; hierarchical `<h1–h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers/currency (use `Intl.DateTimeFormat`, `Intl.NumberFormat`; detect via `Accept-Language`/`navigator.languages`, not IP)
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in the Accessibility Tree
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- SHOULD: Right-clicking the nav logo surfaces brand assets
- MUST: Use non-breaking spaces to glue terms: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`, `Vercel&nbsp;SDK`
- MUST: Form controls need `<label>` or `aria-label`
- MUST: Interactive elements need keyboard handlers (`onKeyDown`/`onKeyUp`)
- MUST: `<button>` for actions, `<a>`/`<Link>` for navigation (not `<div onClick>`)
- MUST: Images need `alt` (or `alt=""` if decorative)
- MUST: Decorative icons need `aria-hidden="true"`
- MUST: Async updates (toasts, validation) need `aria-live="polite"`
- MUST: Text containers handle long content: `truncate`, `line-clamp-*`, or `break-words`
- MUST: Flex children need `min-w-0` to allow text truncation
- MUST: Handle empty states—don't render broken UI for empty strings/arrays
- SHOULD: Use `text-wrap: balance` or `text-pretty` on headings (prevents widows)

## Performance

- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid unnecessary reflows/repaints
- MUST: No layout reads in render (`getBoundingClientRect`, `offsetHeight`, `offsetWidth`, `scrollTop`)
- MUST: Batch DOM reads/writes; avoid interleaving
- MUST: Mutations (`POST/PATCH/DELETE`) target <500 ms
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap (keystroke cost)
- MUST: Virtualize large lists (>50 items: use `virtua`, `content-visibility: auto`)
- MUST: Preload only above-the-fold images; lazy-load the rest
- MUST: Prevent CLS from images (explicit dimensions or reserved space)
- SHOULD: Add `<link rel="preconnect">` for CDN/asset domains
- SHOULD: Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`

## Dark Mode & Theming

- MUST: `color-scheme: dark` on `<html>` for dark themes (fixes scrollbar, inputs)
- MUST: `<meta name="theme-color">` matches page background
- MUST: Native `<select>`: explicit `background-color` and `color` (Windows dark mode)
- MUST: Use Telegram Theme Variables (`var(--tg-theme-bg-color)`, `var(--tg-theme-button-color)`, etc.) for seamless theming.

## Hydration Safety

- MUST: Inputs with `value` need `onChange` (or use `defaultValue` for uncontrolled)
- MUST: Date/time rendering: guard against hydration mismatch (server vs client)
- MUST: `suppressHydrationWarning` only where truly needed

## Hover & Interactive States

- MUST: Buttons/links need `hover:` state (visual feedback)
- MUST: Interactive states increase contrast: hover/active/focus more prominent than rest

## Content & Copy

- SHOULD: Active voice: "Install the CLI" not "The CLI will be installed"
- SHOULD: Title Case for headings/buttons (Chicago style)
- SHOULD: Numerals for counts: "8 deployments" not "eight"
- MUST: Specific button labels: "Save API Key" not "Continue"
- MUST: Error messages include fix/next step, not just problem
- SHOULD: Second person; avoid first person
- SHOULD: `&` over "and" where space-constrained

## Anti-patterns (NEVER do these)

- NEVER: `user-scalable=no` or `maximum-scale=1` disabling zoom
- NEVER: `onPaste` with `preventDefault`
- NEVER: `transition: all`
- NEVER: `outline-none` without focus-visible replacement
- NEVER: Inline `onClick` navigation without `<a>`
- NEVER: `<div>` or `<span>` with click handlers (should be `<button>`)
- NEVER: Images without dimensions
- NEVER: Large arrays `.map()` without virtualization
- NEVER: Form inputs without labels
- NEVER: Icon buttons without `aria-label`
- NEVER: Hardcoded date/number formats (use `Intl.*`)

## Design

- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child ≤ parent; concentric
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- MUST: Increase contrast on `:hover/:active/:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid gradient banding (use masks when needed)

