import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { webpackStats } from 'rollup-plugin-webpack-stats';

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-react-compiler',
          ['transform-react-remove-prop-types', { removeImport: true, additionalLibraries: ['prop-types'] }],
          '@babel/plugin-transform-runtime'
        ],
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              useBuiltIns: 'entry',
              corejs: 3,
              targets: {
                browsers: ['cover 95.5%', 'not dead', 'not op_mini all']
              }
            }
          ],
          [
            '@babel/preset-react',
            { runtime: 'automatic', importSource: 'react' }
          ]
        ]
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
    webpackStats()
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  resolve: {
    alias: {
      'lottie-web': 'lottie-web/build/player/lottie_light'
    }
  },
  build: {
    outDir: 'build',
    assetsDir: '',
    sourcemap: mode === 'development' ? 'inline' : true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.match(/node_modules\/react(-dom)?\//)) return 'react';
            if (id.match(/node_modules\/(react-dom\/client|scheduler)\//)) return 'react-vendors';
            return 'vendors';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
}));
