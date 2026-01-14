/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        shiffa: {
          50: '#ecf8f3',
          100: '#d5efe4',
          200: '#abdccd',
          300: '#7fc7b3',
          400: '#4fb096',
          500: '#2f947a',
          600: '#1f7a64',
          700: '#1a6353',
          800: '#174f44',
          900: '#144038',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

