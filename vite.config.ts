import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/qr-pay-code/',
  plugins: [react()],
  server: {
    watch: {
      usePolling: true
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'bootstrap-vendor': ['bootstrap', 'react-bootstrap'],
          'qr-vendor': ['qrcode.react'],
          'utils-vendor': ['@spayd/core', 'ibankit', '@google/genai']
        }
      }
    }
  }
} as any)