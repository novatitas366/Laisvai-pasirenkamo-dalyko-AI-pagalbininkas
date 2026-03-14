/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd5fe',
          300: '#8eb9fd',
          400: '#5994fa',
          500: '#3370f5',
          600: '#1e50ea',
          700: '#163cd8',
          800: '#1832af',
          900: '#192f89',
          950: '#141f54',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
