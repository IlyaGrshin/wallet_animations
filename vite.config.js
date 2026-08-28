import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig(({ command, mode }) => ({
  base: './',
  plugins: [
    react(),
    babel({
      include: /src\/.*\.[jt]sx?$/,
      // Babel runs plugins before presets, so the propTypes remover sees plain
      // components: react-compiler rewrites them into a form it no longer
      // matches, which would leave propTypes in the production bundle.
      plugins:
        mode === 'production'
          ? [
              [
                'transform-react-remove-prop-types',
                { removeImport: true, additionalLibraries: ['prop-types'] }
              ]
            ]
          : [],
      presets: [reactCompilerPreset()]
    }),
    command === 'serve' &&
      checker({
        overlay: { initialIsOpen: false },
        eslint: {
          useFlatConfig: true,
          lintCommand: "eslint 'src/**/*.{js,jsx,ts,tsx}'"
        },
        stylelint: {
          lintCommand: "stylelint 'src/**/*.scss'"
        }
      }),
    svgr({
      svgrOptions: {
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false
                }
              }
            }
          ]
        }
      }
    }),
    webpackStatsPlugin({
      filename: './build/webpack-stats.json',
      transform: (stats, _sources, bundle) => {
        // Strip source maps: with sourcemap: "hidden" they never ship to
        // the client, so counting them in RelativeCI's totals is noise.
        stats.assets = (stats.assets || []).filter(
          (a) => !a.name.endsWith('.map')
        );
        stats.chunks = (stats.chunks || []).map((chunk) => ({
          ...chunk,
          files: chunk.files.filter((f) => !f.endsWith('.map')),
        }));

        // Vite emits CSS as Rollup assets, not chunk files, so default
        // stats leave chunk.files without any .css entries and RelativeCI
        // classifies Initial CSS as 0 B. Reattach each chunk's imported
        // CSS via chunk.viteMetadata.importedCss.
        if (bundle) {
          const chunkByFile = new Map();
          stats.chunks.forEach((chunk) => {
            chunk.files.forEach((file) => chunkByFile.set(file, chunk));
          });
          Object.values(bundle).forEach((entry) => {
            if (entry.type !== 'chunk') return;
            const css = entry.viteMetadata?.importedCss;
            if (!css || css.size === 0) return;
            const target = chunkByFile.get(entry.fileName);
            if (!target) return;
            css.forEach((cssFile) => {
              if (!target.files.includes(cssFile)) target.files.push(cssFile);
            });
          });
        }

        return stats;
      },
    })
  ],
  optimizeDeps: {
    entries: 'index.html',
    // Only list deps that Vite can't statically discover (lazy-loaded via
    // dynamic import). Statically imported deps are auto-detected.
    include: ['lottie-react', 'agentation']
  },
  resolve: {
    alias: {
      '@': srcPath,
      '@components': `${srcPath}/components`,
      '@hooks': `${srcPath}/hooks`,
      '@pages': `${srcPath}/pages`,
      '@router': `${srcPath}/router`,
      '@utils': `${srcPath}/utils`,
      '@lib': `${srcPath}/lib`,
      '@icons': `${srcPath}/icons`,
      '@images': `${srcPath}/images`
    }
  },
  build: {
    outDir: 'build',
    assetsDir: '',
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        // Only pin the always-loaded libs to stable chunks for long-term
        // caching; everything else splits per usage point, so page-only deps
        // (lottie-web, markdown-to-jsx, colorthief, calligraph) stay out of
        // the startup path.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (/\/node_modules\/(motion|framer-motion|motion-dom|motion-utils)\//.test(id)) return 'motion';
        }
      }
    }
  },
  server: {
    port: 3000,
    open: false,
    warmup: {
      clientFiles: [
        './src/index.jsx',
        './src/App.jsx',
        './src/router/index.jsx',
        './src/pages/config.js',
        './src/pages/CatalogPage/index.jsx',
        './src/components/PageTransition/index.jsx',
        './src/components/Page/index.jsx',
        './src/components/Text/index.jsx',
        './src/components/Cells/index.jsx'
      ]
    }
  }
}));
