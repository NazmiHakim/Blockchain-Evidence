import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Gunakan Dedicated Gateway Pinata jika tersedia, fallback ke public
  const pinataGateway = env.VITE_PINATA_GATEWAY
    ? `https://${env.VITE_PINATA_GATEWAY}`
    : 'https://gateway.pinata.cloud'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy /ipfs/* ke Pinata Gateway untuk menghindari CORS
        '/ipfs': {
          target: pinataGateway,
          changeOrigin: true,
          secure: true,
        }
      }
    }
  }
})
