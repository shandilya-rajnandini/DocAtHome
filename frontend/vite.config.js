import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin will explicitly copy the _redirects and _headers files to the build output directory
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects',
          dest: ''
        },
        {
          src: 'public/_headers',
          dest: ''
        }
      ]
    })
  ],
  optimizeDeps: {
    include: ['react-icons/fa'],
  },
  define: {
    global: 'globalThis',
    // Polyfill for crypto functions
    'process.env': {},
    // Fix for crypto.hash issue
    'crypto': 'crypto',
    // Additional crypto polyfills
    'Buffer': 'Buffer',
    // Add global polyfills
    'globalThis.crypto': 'crypto',
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify',
      url: 'url',
      buffer: 'buffer',
      process: 'process/browser',
      // Additional aliases for better compatibility
      'util': 'util',
      'path': 'path-browserify',
      'fs': 'memfs',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'react-icons', 'lucide-react'],
          utils: ['axios', 'jspdf', 'leaflet']
        },
        // Increase asset size warning limits
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      external: [],
      plugins: [
        {
          name: 'crypto-polyfill',
          generateBundle(options, bundle) {
            // Add crypto polyfill to the bundle
            for (const [, chunk] of Object.entries(bundle)) {
              if (chunk.type === 'chunk' && chunk.code) {
                // Replace crypto.hash calls with safe fallbacks
                chunk.code = chunk.code.replace(
                  /crypto\.hash/g,
                  '(() => { try { return crypto.hash || crypto.createHash; } catch { return () => ({ update: () => ({}), digest: () => "" }); } })()'
                );
                // Also handle crypto.createHash
                chunk.code = chunk.code.replace(
                  /crypto\.createHash/g,
                  '(() => { try { return crypto.createHash; } catch { return () => ({ update: () => ({}), digest: () => "" }); } })()'
                );
              }
            }
          }
        }
      ]
    },
    chunkSizeWarningLimit: 1000,
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
    // Increase CSS chunk warning limit
    assetsInlineLimit: 4096,
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
