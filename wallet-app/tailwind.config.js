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
          bg: "#0B0C10",
          card: "#14151C",
          border: "#272A35",
          accent: "#E0FF4F",
          accentDark: "#C8E639",
          quiet: "#FF4A60",
          ok: "#00E5FF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
