/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d8efff',
          500: '#0ea5e9',
          700: '#0369a1'
        }
      }
    }
  },
  plugins: []
};
