/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#e0ecff',
          500: '#0b3b8c',
          600: '#082d6b',
          700: '#06204c',
        }
      }
    },
  },
  plugins: [],
}
