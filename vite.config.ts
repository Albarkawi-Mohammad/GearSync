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
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-is',
      'canvas-confetti'
    ]
  },
  plugins: [
    react()
  ],
})
