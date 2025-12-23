import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Listen on all addresses in Docker
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://server:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_API_URL || 'http://server:4000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
