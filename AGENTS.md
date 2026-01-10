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
  - NEVER: Block paste in `<input>/<textarea>`
  - MUST: Loading buttons show spinner and keep original label
  - MUST: Enter submits focused text input In `<textarea>`, ⌘/Ctrl+Enter submits; Enter adds newline
  - MUST: Keep submit enabled until request starts; then disable, show spinner, use idempotency key
  - MUST: Don't block typing; accept free text and validate after
  - MUST: Allow submitting incomplete forms to surface validation
  - MUST: Errors inline next to fields; on submit, focus first error
  - MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
  - SHOULD: Disable spellcheck for emails/codes/usernames
  - SHOULD: Placeholders end with ellipsis and show example pattern (eg, `+1 (123) 456-7890`, `sk-012345…`)
  - MUST: Warn on unsaved changes before navigation
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
  - MUST: Delay first tooltip in a group; subsequent peers no delay
  - MUST: Intentional `overscroll-behavior: contain` in modals/drawers
  - MUST: During drag, disable text selection and set `inert` on dragged element/containers
  - MUST: No "dead-looking" interactive zones—if it looks clickable, it is
- Autofocus
  - SHOULD: Autofocus on desktop when there's a single primary input; rarely on mobile (to avoid layout shift)

## Animation

- **General**:
  - MUST: Honor `prefers-reduced-motion`.
  - SHOULD: Default to `ease-out` (0.2s - 0.3s). Limit animations to <1s.
  - MUST: Animations are interruptible and input-driven.

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
  - MUST: Use `transform` instead of positioning (`top/left`).
  - MUST: Use `will-change` sparingly (`transform`, `opacity` only).
  - MUST: Virtualize large lists.
  - MUST: Correct `transform-origin` (animate from trigger source).

## Layout

- SHOULD: Optical alignment; adjust by ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- SHOULD: Balance icon/text lockups (stroke/weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (use env(safe-area-inset-*) and var(--tg-content-safe-area-inset-top))
- MUST: Avoid unwanted scrollbars; fix overflows


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
- MUST: Locale-aware dates/times/numbers/currency
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in the Accessibility Tree
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- SHOULD: Right-clicking the nav logo surfaces brand assets
- MUST: Use non-breaking spaces to glue terms: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`, `Vercel&nbsp;SDK`

## Performance

- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid unnecessary reflows/repaints
- MUST: Mutations (`POST/PATCH/DELETE`) target <500 ms
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap (keystroke cost)
- MUST: Virtualize large lists (eg, `virtua`)
- MUST: Preload only above-the-fold images; lazy-load the rest
- MUST: Prevent CLS from images (explicit dimensions or reserved space)

## Design

- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child ≤ parent; concentric
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- MUST: Use Telegram Theme Variables (`var(--tg-theme-bg-color)`, `var(--tg-theme-button-color)`, etc.) for seamless theming.

- MUST: Increase contrast on `:hover/:active/:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid gradient banding (use masks when needed)

