import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the ASP.NET Core backend so the browser only ever
      // talks to one origin in development — no CORS involved.
      '/api': {
        target: 'http://localhost:5054',
        changeOrigin: true,
      },
    },
  },
})
