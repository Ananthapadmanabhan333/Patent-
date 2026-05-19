/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#030712",
        glassBg: "rgba(17, 24, 39, 0.7)",
        glassBorder: "rgba(255, 255, 255, 0.08)",
        glassBorderHover: "rgba(255, 255, 255, 0.15)",
        neonTeal: "#14b8a6",
        neonPurple: "#a855f7",
        neonBlue: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glowTeal: "0 0 20px rgba(20, 184, 166, 0.15)",
        glowPurple: "0 0 20px rgba(168, 85, 247, 0.15)",
        glowBlue: "0 0 20px rgba(59, 130, 246, 0.15)",
      }
    },
  },
  plugins: [],
}
