/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        card: "#111622",
        "card-hover": "#171e2e",
        border: "#1f293d",
        primary: {
          DEFAULT: "#00f0ff", // Glowing cyan
          hover: "#00c8d6",
        },
        secondary: {
          DEFAULT: "#10b981", // Emerald green
          hover: "#059669",
        },
        slack: {
          met: "#10b981",
          violated: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
