/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      },
      boxShadow: {
        hairline: "0 1px 0 rgba(255,255,255,0.08) inset",
        glow: "0 24px 80px rgba(255,255,255,0.08)"
      }
    }
  },
  plugins: []
};
