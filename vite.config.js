import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.lottie'],
  server: {
    proxy: {
      // Esto redirige las peticiones de API a tu backend real
      '/api': {
        target: 'http://127.0.0.1:8000', // URL de tu Laravel/Backend
        changeOrigin: true,
        secure: false,

      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})