/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sonar: {
          darkest: "#040810",
          card: "#0a1322",
          border: "#162844",
          cyan: "#00f2ff",
          green: "#00ff88",
          amber: "#ffaa00",
          red: "#ff3366",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
