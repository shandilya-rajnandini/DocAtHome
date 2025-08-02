import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
<<<<<<< HEAD
    include: ['react-icons/fa'], 
=======
    include: ['react-icons'], // Add this line
>>>>>>> 7895a1ac95dd9ec20f9eac1f2bc3740396ee7f69
  },
});