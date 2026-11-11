import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /api calls are proxied to the Express server during development
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
})
