/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Montserrat Alternates"', 'sans-serif'],
        'body': ['"Be Vietnam Pro"', 'sans-serif'],
      },
      colors: {
        neutral: {
          850: '#1f1f1f', 
        }
      }
    },
  },
  plugins: [],
}