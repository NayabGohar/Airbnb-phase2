import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/places': {
        target: 'http://localhost:4000', // Proxy '/places' to the backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/places/, '/places'), // Keep the path as '/places'
      },
    },
  },
});
