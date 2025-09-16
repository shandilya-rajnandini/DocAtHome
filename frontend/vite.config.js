import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // Import the plugin

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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'react-icons', 'lucide-react'],
          utils: ['axios', 'jspdf', 'leaflet']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
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
