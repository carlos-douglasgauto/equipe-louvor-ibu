/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        worship: {
          50: '#f4f6fb',
          100: '#e7ecf6',
          200: '#cbd7ed',
          300: '#9fb9df',
          400: '#6c96ce',
          500: '#4877be',
          600: '#345da2',
          700: '#2b4b84',
          800: '#26406d',
          900: '#1b2943',
          950: '#0f172a',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
