/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fire: {
          spark: '#FFE4B5',
          flame: '#FF6B35',
          wildfire: '#FF4500',
          prairie: '#228B22',
          ember: '#FF8C00',
          ash: '#696969',
        },
      },
    },
  },
  plugins: [],
}