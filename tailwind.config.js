/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lemons-orange': '#FF8731',
        'lemons-purple': '#8756FA',
        'lemons-black': '#03091B',
        'lemons-white': '#FFFFFF', // Assuming pure white or off-white, the book says #03091B for white in a typo, but we'll use #FFFFFF and the background colors below
        'lemons-light-purple': '#B385FF',
        'lemons-light-orange': '#FF9E54',
        'lemons-light-orange-bg': '#FFF5EE',
        'lemons-light-purple-bg': '#F8F6FF',
      },
      fontFamily: {
        serif: ['Recoleta Alt', 'serif'],
        sans: ['Open Runde', 'sans-serif'],
        hand: ['Figma Hand', 'cursive'],
      }
    },
  },
  plugins: [],
}