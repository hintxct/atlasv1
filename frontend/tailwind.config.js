/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06080B',
          900: '#0A0D10',
          850: '#121311',
          800: '#191A16',
          700: '#22231D',
          600: '#2D2E26',
        },
        gold: {
          200: '#F0D9A8',
          300: '#E8C987',
          400: '#D4AF6A',
          500: '#C9A96E',
          600: '#A98A50',
          700: '#8A6F3E',
        },
        ivory: {
          100: '#F5F0E6',
          200: '#EDE6D6',
          300: '#DDD3BE',
          400: '#C4B89F',
          500: '#B8B0A0',
          600: '#A49B8A',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        xs: ['0.9375rem', { lineHeight: '1.55' }],
        sm: ['1.0625rem', { lineHeight: '1.65' }],
        base: ['1.125rem', { lineHeight: '1.65' }],
      },
      animation: {
        'fade-up': 'fade-up .8s cubic-bezier(.22,1,.36,1) both',
        'glow': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float-slow 6s ease-in-out infinite',
        'spin-slow': 'spin 14s linear infinite',
      },
    },
  },
  plugins: [],
}
