/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.15' },
          '50%':       { opacity: '0.35' },
        },
        revealUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        slideUp:  'slideUp 0.3s ease',
        breathe:  'breathe 4s ease-in-out infinite',
        revealUp: 'revealUp 0.6s ease both',
      },
    },
  },
  plugins: [],
};
