import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://novox-dashboard.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/scraper-api': {
        target: 'https://novox-job-scraper.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/scraper-api/, '')
      }
    }
  }
})
