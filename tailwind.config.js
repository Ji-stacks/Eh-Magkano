/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Your custom palette
        primary: '#0F766E',   // Main Brand Color (Teal)
        secondary: '#115E59', // Darker Teal (for headers/active states)
        background: '#EAEAEA', // Light Gray (App background)
        surface: '#FFFFFF',    // White (Cards/Modals)
      }
    },
  },
  plugins: [],
}