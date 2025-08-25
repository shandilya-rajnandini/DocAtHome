import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy"; // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin will explicitly copy the _redirects file to the build output directory
    viteStaticCopy({
      targets: [
        {
          src: "public/_redirects",
          dest: "",
        },
      ],
    }),
  ],
  optimizeDeps: {
    include: ["react-icons/fa"],
  },
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
