/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          950: '#26140b',
          900: '#331b10',
          850: '#382115',
          800: '#482b1e',
          700: '#5c3827',
          600: '#754732',
          500: '#945c42',
        },
        caramel: {
          700: '#8c4e24',
          600: '#a35f2f',
          500: '#b5743d',
          400: '#c98a53',
          300: '#dda473',
          200: '#ebc29f',
          100: '#f6dfcd',
        },
        cream: {
          50: '#fbf8f4',
          100: '#f7f1eb',
          200: '#ece1d5',
          300: '#dfd1c3',
          400: '#c8b6a3',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
