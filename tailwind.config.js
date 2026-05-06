/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'color-verde-header':'rgb(0, 113, 61)',
        'color-verde-portal':'rgb(7, 101, 58)',
        'color-verde-postular':'rgb(132, 190, 24)',
        'color-verde-hover':'rgb(12, 177, 101)',
        'color-verde-oscuro':'rgb(0, 113, 61)',
        'color-verde-claro':'rgb(52, 168, 83)',
        
      },

    },
  },
  plugins: [PrimeUI],
}

