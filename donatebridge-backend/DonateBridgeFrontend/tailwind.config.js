/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf4f6',
          100: '#f6e8ee',
          200: '#eed1dd',
          300: '#e1acc1',
          400: '#cd7fa0',
          500: '#b4547c',
          600: '#912f56', // Primary brand color
          700: '#7e2448',
          800: '#69203c',
          900: '#581e35',
          950: '#350d1d',
          DEFAULT: '#912f56',
        },
        canvas: {
          DEFAULT: '#eaf2ef', // Primary background color
          card: '#ffffff',
          subtle: '#e2ede9',
          muted: '#d5e4df',
          border: '#cfded8',
        },
        charcoal: {
          DEFAULT: '#23332f', // Main text
          muted: '#66736f',   // Secondary text
          subtle: '#8f9c98',
          border: '#d0ddd8',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(35, 51, 47, 0.05), 0 1px 2px -1px rgba(35, 51, 47, 0.05)',
        elevated: '0 4px 6px -1px rgba(35, 51, 47, 0.07), 0 2px 4px -2px rgba(35, 51, 47, 0.05)',
        modal: '0 20px 25px -5px rgba(35, 51, 47, 0.1), 0 8px 10px -6px rgba(35, 51, 47, 0.08)',
      },
    },
  },
  plugins: [],
}
