## Wallet Animations – Vite Setup

The project now runs on [Vite](https://vite.dev/).

### Scripts

`yarn dev` – start local development (http://localhost:3000) (entry: `src/index.js`)

`yarn build` – production build into `build/`

`yarn preview` – locally preview the production build

`yarn lint` – run ESLint

### Configuration Highlights

- Code splitting into `react`, `react-vendors`, `vendors`, plus application chunks
- SVG imported as React components via `?react` (`vite-plugin-svgr`)
- Uses `babel.config.js` (React Compiler + prop-types removal in production)
- Alias: `lottie-web` → `lottie_light`

### SVG Import Example
```
import Icon from './icon.svg?react'
```

### Optimization Notes
- Add dynamic `import()` for heavy prototype pages if needed
- Tune `build.chunkSizeWarningLimit` in `vite.config.js` if bundle size warnings appear

### Animations
Lazy Motion usage and lightweight Lottie build to reduce bundle size.

### Linting & Style
`yarn lint` for JS/JSX. Stylelint configured for SCSS modules.

### Quick Start
```
yarn install
yarn dev
```

### Environment
Node 18+ required.

### Housekeeping
Legacy Webpack config was removed. If you still find references to it, they can be safely deleted.

### Next Ideas
- Add bundle analyzer (e.g. rollup-plugin-visualizer)
- Introduce tests (Vitest/Jest) if needed
