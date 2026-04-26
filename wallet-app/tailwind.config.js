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
        wallet: {
          bg: "#0B0B0F",
          card: "#15151B",
          border: "#26262E",
          accent: "#F2C75C",
          accentDark: "#D9A93B",
          quiet: "#E26A6A",
          ok: "#4CB28E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
