/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        'coin-slide': {
          '0%': { transform: 'translateX(-10vw)' },
          '50%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-10vw)' },
        }
      },
      animation: {
        'coin-patrol': 'coin-slide 15s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}