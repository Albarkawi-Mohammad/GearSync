/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0C0B0E',
          subtle: '#111015',
          shell: '#16151C',
        },
        surface: {
          1: '#1D1B24',
          2: '#25232E',
          3: '#2E2B39',
          well: '#121117',
          glass: 'rgba(29, 27, 36, 0.78)',
        },
        accent: {
          DEFAULT: '#FF5E36',
          hover: '#FF7452',
          muted: 'rgba(255, 94, 54, 0.14)',
          amber: '#F59E0B',
          emerald: '#10B981',
          indigo: '#818CF8',
          sky: '#38BDF8',
          rose: '#F43F5E',
        },
        content: {
          primary: '#F7F6F9',
          secondary: '#A6A2B5',
          muted: '#6E6A7E',
          inverse: '#0C0B0E',
        },
        dark: {
          bg: '#0C0B0E',
          card: '#1D1B24',
          border: '#2B2836',
          hover: '#363244',
          text: '#F7F6F9',
          muted: '#A6A2B5'
        },
        brand: {
          primary: '#FF5E36',
          secondary: '#F59E0B',
          accent: '#10B981',
          cyan: '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'shell': '2rem',
        'card': '1.5rem',
        'card-lg': '1.75rem',
        'pill': '9999px',
      },
      boxShadow: {
        'shell': '0 24px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card-hover': '0 18px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        'accent-glow': '0 8px 24px -4px rgba(255, 94, 54, 0.4)',
        'inner-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-in': 'fade-in 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-in': 'slide-in 260ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'slide-out': 'slide-out 200ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'scale-in': 'scale-in 160ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(4px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
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
          'from': { transform: 'scale(0.96)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
