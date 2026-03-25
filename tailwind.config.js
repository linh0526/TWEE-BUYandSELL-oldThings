/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1A1A1A", // Dark text
        secondary: "#FF7524", // Kinetic Orange
        "secondary-container": "#FFF0E6", // Lighter orange for selection
        background: "#FFFFFF",
        surface: "#FAFAFA",
        "surface-container-low": "#F5F5F5",
        "surface-container": "#F2F2F2",
        "surface-container-high": "#EBEBEB",
        "surface-bright": "#E0E0E0",
        "on-surface-variant": "#717171",
        outline: "rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
    },
  },
  plugins: [],
}