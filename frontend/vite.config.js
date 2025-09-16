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
    'process.env': {},
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
        // (Removed insecure crypto shim; use proper browser crypto in code instead)
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
