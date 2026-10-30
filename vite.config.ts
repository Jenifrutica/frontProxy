import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/services/inventory': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/services/orders': { target: 'http://localhost:8082', changeOrigin: true },
      '/api/services/payments': { target: 'http://localhost:8083', changeOrigin: true },
      '/api/metrics': { target: 'http://localhost:8084', changeOrigin: true },
    },
  },
});
