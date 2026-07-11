/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        card: "#ffffff",
        "card-hover": "#f1f5f9",
        border: "#e2e8f0",
        primary: {
          DEFAULT: "#2563eb", // Corporate blue
          hover: "#1d4ed8",
        },
        secondary: {
          DEFAULT: "#059669", // Emerald green
          hover: "#047857",
        },
        slack: {
          met: "#059669",
          violated: "#dc2626",
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
