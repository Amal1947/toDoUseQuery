/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Add this line to ensure all React files are processed
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
