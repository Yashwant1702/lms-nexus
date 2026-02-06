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
        // Custom color palette
        cream: {
          50: '#fcfcf9',
          100: '#fffffd',
        },
        charcoal: {
          700: '#1f2121',
          800: '#262828',
        },
        primary: {
          300: '#32b8c6',
          400: '#2da6b2',
          500: '#21808d',
          600: '#1d7480',
          700: '#1a6873',
          800: '#2996a1',
        },
        secondary: {
          500: '#764ba2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'hard': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}
