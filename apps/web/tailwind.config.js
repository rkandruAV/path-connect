/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#1a2a3a',
          950: '#131e2b',
        },
        cream: {
          50: '#fdfcfa',
          100: '#faf8f5',
          200: '#f5f0ea',
        },
        accent: {
          50: '#fef9f0',
          100: '#fdf0d5',
          200: '#fbe4b0',
          300: '#f5d08c',
          400: '#e8b84a',
          500: '#d4a853',
          600: '#b8922e',
          700: '#946f1e',
          800: '#6d5118',
          900: '#4a3712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
