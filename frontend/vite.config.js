import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /ipfs/* ke Pinata Gateway untuk menghindari CORS
      '/ipfs': {
        target: 'https://gateway.pinata.cloud',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
