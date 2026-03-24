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
        primary: "#F9F9F9",
        secondary: "#FF7524",
        "secondary-container": "#A04100",
        background: "#0E0E0E",
        surface: "#0E0E0E",
        "surface-container-low": "#131313",
        "surface-container": "#1A1A1A",
        "surface-container-high": "#20201F",
        "surface-bright": "#2C2C2C",
        "on-surface-variant": "#ADAAAA",
        outline: "rgba(224, 224, 224, 0.15)", // Ghost Border at 15%
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
    },
  },
  plugins: [],
}