import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// The site is fully static — checkout and the contact form submit directly to
// Formspree (see src/config.js), so there is no backend and no /api proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so GitHub Codespaces can forward the port.
    host: true,
    port: 5173,
  },
})
