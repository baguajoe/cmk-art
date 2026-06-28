import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so GitHub Codespaces can forward the port.
    host: true,
    port: 5173,
    // Dev proxy: requests the frontend makes to /api/* are forwarded to the
    // Flask backend. This lets React code call fetch('/api/contact') with no
    // hardcoded host and avoids CORS issues during development.
    //
    // If your backend runs on a different port, change the target below
    // (and/or set the PORT env var when starting Flask).
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
