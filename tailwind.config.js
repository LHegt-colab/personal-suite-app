/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a5f5f',
          light: '#2a7f7f',
          dark: '#0a4f4f',
        },
        accent: {
          DEFAULT: '#4dd0e1',
          light: '#6dd9e8',
          dark: '#2dc7d8',
        },
      },
    },
  },
  plugins: [],
}
