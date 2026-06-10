# wallet_animations

A Telegram Web App SPA showcasing wallet UI animations, components and full
prototype flows. Built as a Vite single-page app — no SSR, no Next.js.

## Stack

- **Vite 7** SPA, **React 19** with the **React Compiler** (auto-memoization)
- **wouter** routing in hash mode (`useHashLocation`) — required inside the
  Telegram WebView
- **SCSS Modules** (`<Name>.module.scss`)
- **motion v12** (framer-motion-compatible), **lottie-react**, **calligraph**,
  **spoiled**, **markdown-to-jsx**
- Telegram Web App via the internal `@lib/twa` wrapper (never import
  `@twa-dev/sdk` directly)
- Type checking via **PropTypes**
- Package manager: **Yarn 4** (`yarn@4.5.3`)

## Quick start

```bash
yarn install
yarn dev        # http://localhost:3000
```

Node 20+ is required (Vite 7).

## Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Vite dev server on port 3000 (entry: `src/index.js`) |
| `yarn build` | Production build into `build/` |
| `yarn preview` | Preview the production build locally |
| `yarn lint` | Lint JS + SCSS — run before declaring a task done |
| `yarn lint:js` | ESLint only |
| `yarn lint:scss` | Stylelint only |
| `yarn format` | Prettier write over `src/` |
| `yarn screenshot:story` | Render story screenshots (`scripts/screenshot-story.js`) |

## Project layout

- `src/components/<Name>/` — `index.js` (default export) +
  `<Name>.module.scss` + optional `*.showcase.js`
- `src/pages/config.js` — single config that drives both routing and the
  catalog; adding a page = a component plus one entry here
- `src/pages/prototypes/` — full app prototypes (Wallet, Onboarding,
  Trading, Navigation…)
- `src/pages/showcases/` — Telegram SDK demos (NavigationBar, BottomBar,
  HapticFeedback)
- `src/pages/CatalogPage/` — auto-generated catalog from `pages/config.js`
- `src/router/` — config-driven routing with lazy loading
- `src/hooks/` — `DeviceProvider` (platform) and `AppearanceProvider` (theme)
- `src/lib/twa/` — wrapper around the Telegram WebApp SDK
- `src/icons/`, `src/images/`, `src/utils/`

## Platform adaptation

The root `<body>` carries `.apple` (iOS / macOS) or `.material`
(Android / Desktop); components read the platform from `DeviceProvider` and
adapt easings, blur, radii and elevation accordingly. Theme variables come
from `var(--tg-theme-*)`, so light and dark both work.

## Build configuration

- Code splitting into `react`, `react-vendors`, `vendors` and app chunks
- SVG imported as React components via `?react` (`vite-plugin-svgr`):
  ```js
  import Icon from './icon.svg?react';
  ```
- `babel.config.js` enables the React Compiler and strips PropTypes in
  production
- Bundle stats reported to RelativeCI in CI

## Conventions

See `AGENTS.md` for the full contributor rules — file size limits, animation
performance tiers, the SCSS-Modules-only policy, and project primitives to
reuse (`Button`, `Text`, `GlassContainer`, `Page`, `PageTransition`).

## License

Released under the [MIT License](LICENSE).
