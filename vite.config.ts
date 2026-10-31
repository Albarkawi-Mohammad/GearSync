import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: '127.0.0.1',
    watch: {
      ignored: ['**/.git/**', '**/.agents/**', '**/dist/**']
    }
  },
  optimizeDeps: {
    noDiscovery: true,
    include: []
  },
  plugins: [
    react()
  ],
})
