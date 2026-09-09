/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a5f',
        secondary: '#2c5282',
        accent: '#e53e3e',
        gold: '#d69e2e',
        navy: {
          DEFAULT: '#1E3A5F',
          light: '#2C5282',
          dark: '#142E4D',
        },
      },
    },
  },
  plugins: [],
};
