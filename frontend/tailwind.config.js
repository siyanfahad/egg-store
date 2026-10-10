/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EC',
        charcoal: '#2A2822',
        muted: '#7A7564',
        forest: {
          DEFAULT: '#3F5D3A',
          dark: '#2E4429',
          light: '#5A7D54',
        },
        gold: {
          DEFAULT: '#D9A441',
          light: '#EBCB8C',
        },
        border: '#E6DFD0',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
