/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aqua:   '#00d4ff',
        gold:   '#f0c040',
        deep:   '#020d1a',
        abyss:  '#010810',
        water1: '#0a2a4a',
      },
      fontFamily: {
        cinzel:  ['"Cinzel Decorative"', 'serif'],
        raleway: ['Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

