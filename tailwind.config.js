/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',       // slate-900
          card: '#1E293B',     // slate-800
          border: '#334155',   // slate-700
          hover: '#475569',    // slate-600
          text: '#F8FAFC',     // slate-50
          muted: '#94A3B8'     // slate-400
        },
        brand: {
          primary: '#8B5CF6',  // Neon Purple
          secondary: '#EC4899',// Neon Pink
          accent: '#10B981',   // Emerald Green
          cyan: '#06B6D4'      // Neon Cyan
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 180ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-in': 'slide-in 240ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'slide-out': 'slide-out 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'scale-in': 'scale-in 150ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-in': {
          'from': { transform: 'translateX(100%)' },
          'to': { transform: 'translateX(0)' },
        },
        'slide-out': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(100%)' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
