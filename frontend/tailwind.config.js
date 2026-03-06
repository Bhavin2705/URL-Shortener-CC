/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cabinet Grotesk"', '"DM Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          50:  '#F7F7F8',
          100: '#EFEFF2',
          200: '#E0E0E6',
          300: '#C8C8D4',
          400: '#9898AD',
          500: '#6B6B85',
          600: '#4A4A64',
          700: '#32324A',
          800: '#1F1F32',
          900: '#0F0F1A',
          950: '#07070F',
        },
        brand: {
          DEFAULT: '#6C63FF',
          50:  '#F0EFFE',
          100: '#E2E0FE',
          200: '#C5C0FC',
          300: '#A89FFB',
          400: '#8B7FF9',
          500: '#6C63FF',
          600: '#4F44E0',
          700: '#3830B8',
          800: '#261F8F',
          900: '#151268',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        amber: {
          400: '#FBBF24',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6C63FF 0%, #A89FFB 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0F0F1A 0%, #1F1F32 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow': '0 0 40px rgba(108, 99, 255, 0.25)',
        'glow-sm': '0 0 20px rgba(108, 99, 255, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 16px 40px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseBrand:{ '0%,100%': { boxShadow: '0 0 0 0 rgba(108,99,255,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(108,99,255,0)' } },
        slideIn:   { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
