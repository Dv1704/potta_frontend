/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
   extend: {
  animation: {
    'float-slow': 'float 6s ease-in-out infinite',
    'float-slower': 'float 8s ease-in-out infinite',
    'float-small': 'float 5s ease-in-out infinite',
    'float-reverse': 'float-rev 10s ease-in-out infinite',
  },
  keyframes: {
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-15px)' },
    },
    'float-rev': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(15px)' },
    },
  }
}
  },
  plugins: [],
}