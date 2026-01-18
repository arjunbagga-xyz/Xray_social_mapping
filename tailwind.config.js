/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./dashboard.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'burn-book': ['"Rock Salt"', 'cursive'],
      }
    },
  },
  plugins: [],
}
