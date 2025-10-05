/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ← ESSA LINHA É OBRIGATÓRIA!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}