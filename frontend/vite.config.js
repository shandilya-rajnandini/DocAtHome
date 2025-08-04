import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy'; // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin will explicitly copy the _redirects file to the build output directory
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects',
          dest: ''
        }
      ]
    })
  ],
  // You can keep your optimizeDeps section if you had one
  optimizeDeps: {
    include: ['react-icons/fa'],
  },
});