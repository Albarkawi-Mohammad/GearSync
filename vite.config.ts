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
      'react-router',
      'react-router-dom',
      'cookie',
      'set-cookie-parser',
      'react-is',
      'use-sync-external-store',
      'use-sync-external-store/with-selector',
      'use-sync-external-store/shim/with-selector',
      'react-redux',
      'recharts',
      'lucide-react',
      'canvas-confetti'
    ]
  },
  plugins: [
    react()
  ],
})
