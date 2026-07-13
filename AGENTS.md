# wallet_animations — Agent Rules

> Telegram Web App SPA. **No SSR, no RSC, no Next.js.** When external rule
> sources mention `server-*`, API routes, `React.cache`, `useSWR`, or `nuqs` —
> they don't apply here.

## Stack

- **Vite 7** SPA · **React 19** + **React Compiler** (auto-memoization)
- **wouter** with `useHashLocation` (`src/router/`)
- **SCSS Modules** (`<Name>.module.scss`)
- **motion v12** (framer-motion-compatible) · **lottie-react** · **calligraph** · **spoiled**
- **Telegram Web App** via internal `@lib/twa` wrapper (`src/lib/twa.js`)
- Type checking: **PropTypes** · Package manager: **yarn**

## Common commands

```bash
yarn dev          # Vite dev server
yarn build        # Production build
yarn lint         # JS + SCSS lint — MUST run before declaring task done
yarn lint:js      # ESLint only
yarn lint:scss    # Stylelint only
```

## Project layout

- `src/components/<Name>/` — `index.js` (default export) + `<Name>.module.scss` + optional `*.showcase.js`
- `src/pages/config.js` — single config drives **routing and catalog**. Adding a page = component + one entry here
- `src/pages/prototypes/` — full app prototypes (Navigation, Onboarding, Trading…)
- `src/pages/showcases/` — TWA SDK demos (NavigationBar, BottomBar)
- `src/router/` — config-driven routing with lazy loading
- `src/lib/twa.js` — wrapper around Telegram WebApp; never import `@twa-dev/sdk` directly

## Critical rules

1. Files ≤ **250 lines** — refactor into hooks / sub-components / utils when larger
2. Run `yarn lint` before declaring a task done
3. **yarn** only — no npm / pnpm
4. Honor `prefers-reduced-motion` — provide reduced variant or disable
5. **No manual `memo` / `useMemo` / `useCallback`** unless profiling shows need — React Compiler handles it
6. **Reuse project primitives** — `Button`, `Text`, `GlassContainer`, `Page`, `PageTransition` instead of raw `<button>` / `<div onClick>` / inline styles
7. **SCSS Modules only** — no global CSS, no Tailwind. Documented exceptions: `src/utils/viewTransition.scss` (needs `::view-transition-*` pseudos at root), `src/components/Text/{AppleText,MaterialText}/*.scss` (needs `body.apple [variant=…]` selectors), `src/index.css` (root resets / theme vars). Do not add new globals.
8. Animate `transform` / `opacity` / `filter` / `clip-path` only — never `width` / `height` / `top` / `left`
9. Never `transition: all` — list properties explicitly
10. NEVER create markdown files unless explicitly asked
11. NEVER use emojis in code, comments, commits, or agent replies

## Components

- Each component in its own folder; `index.js` does `export default`
- PropTypes for every prop on exported components
- When overriding `<Text>` color, set the color on the **wrapping element** (CSS inheritance), not as a `style` on `<Text>` itself — `[variant]` selectors already inherit
- Inline platform-specific `<Text>` props at the call site as object literals; do not hoist them to module-level constants
- Use `useModal` hook for modal visibility, not bespoke state
- Use provided contexts (`DeviceProvider`, `AppearanceProvider`) for platform / theme

## Routing

- `wouter` with `useHashLocation` — never `history` mode (breaks inside Telegram WebView)
- Wrap routes in `PageTransition` for orchestrated animations
- Use the `Redirect` component for strict navigation control; do not call `setLocation` from render

## Platform classes (`.apple` vs `.material`)

The root `<body>` carries `.apple` (iOS / macOS) or `.material` (Android / Desktop). Components must adapt:

```jsx
<div className={cx(styles.root, isApple ? styles.apple : styles.material)}>
```

- Read platform from `DeviceProvider` context — never `navigator.userAgent`
- `.apple` — iOS easings, blur backdrops, larger radii
- `.material` — Material easings, elevation shadows
- Theme vars come from `var(--tg-theme-*)` so light / dark works

## Telegram Web App

- Use `@lib/twa` wrapper — never `@twa-dev/sdk` directly
- Respect the patched `WebApp.BackButton` behavior wired in `App.js`
- Full-bleed layouts use `env(safe-area-inset-*)` and `var(--tg-content-safe-area-inset-top)`
- `<meta name="theme-color">` matches page background; `color-scheme: dark` on `<html>` for dark themes
- Apply globally: `user-select: none` (except `<input>`/`<textarea>`), `touch-action: manipulation` (prevents double-tap zoom delay), `-webkit-tap-highlight-color` set intentionally to match design
- Test on iOS Low Power Mode and macOS Safari before shipping — common regression source

## Animation

- **Invoke the `/web-animation-design` skill for any animation work** — easing, timing, duration, springs, transitions, gestures, microinteractions, `prefers-reduced-motion`, or anything that "feels janky". It carries deeper motion guidance than the rules below; the rules here are the project-specific defaults on top of it.
- Default duration **0.2-0.3s**, hard cap **1s**
- Animations are interruptible and input-driven; they do not block user interaction
- Set `transform-origin` correctly (animate from trigger source); for SVG, use `<g>` wrapper with `transform-box: fill-box; transform-origin: center`
- Use `will-change` sparingly — only `transform` / `opacity`, only for the duration of the animation
- **Performance tiers** (prefer S, avoid D/F):
  - **S** (compositor): `transform`, `opacity`, `filter`, `clip-path`
  - **A** (main thread, triggers compositor): paint-only changes
  - **D** (layout): `width`, `height`, `margin`, `top`, `left` — avoid
  - **F** (layout thrashing): read-write loops in JS — never
- **Easings** (use over CSS built-ins):
  - **ease-out** (entering / interaction): `cubic-bezier(0.23, 1, 0.32, 1)` quint, or `cubic-bezier(0.19, 1, 0.22, 1)` expo
  - **ease-in-out** (moving on screen): `cubic-bezier(0.86, 0, 0.07, 1)` quint
  - **hover**: `ease` 200ms
  - avoid `ease-in` — makes UI feel slow
- **Glass + scale flicker:** when scaling a `GlassContainer`, Safari drops the backdrop-filter mid-animation. Skip the wrapper and put `backdrop-filter` directly on the scaled element
- **Lottie:** use `lottieRef` to control playback, never re-mount to restart
- **`PageTransition`** wraps every route and orchestrates page-level animations; do not add competing route-level transitions inside pages

## Showcases

- Co-locate as `<Component>.showcase.js` next to the component
- `src/pages/CatalogPage/` auto-generates from `src/pages/config.js` — adding to one is enough

## Installed skills (Claude Code, trigger-loaded)

Managed by [`skills`](https://github.com/vercel-labs/skills). Run `npx skills update` to refresh, `npx skills list` to inspect.

| Skill | Triggers on | Caveats |
|---|---|---|
| `vercel-react-best-practices` | React perf, bundle size, data fetching | **Vite SPA: ignore `server-*`, `async-api-routes`, `async-suspense-boundaries`, `client-swr-*`, `rendering-hydration-*` rules — Next/RSC** |
| `vercel-react-view-transitions` | route / view transitions, `<ViewTransition>` | skip Next.js-specific bits |
| `vercel-composition-patterns` | boolean-prop refactors, compound components | |
| `web-design-guidelines` | "review my UI", a11y audits, explicit review requests | **action-style — fetches rules at runtime, NOT auto-loaded when writing new code.** For day-to-day a11y/forms/UX, rely on baseline knowledge + this skill on demand |

```bash
npx skills add <repo>      # add a skill
npx skills remove <name>   # remove a skill
npx skills update          # refresh installed skills
```
