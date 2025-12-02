/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#020403",       // Deepest forest black
          panel: "#04140c",    // Dark emerald panel (almost black)
          surface: "#082f1c",  // Surface for inputs
          primary: "#00ff88",  // Neon Green (State of the art)
          secondary: "#10b981", // Calmer Green
          accent: "#ccff00",   // Acid Lime
          text: "#ecfdf5",     // Mint white
          muted: "#34d399",    // Muted mint
          border: "#064e3b",   // Dark green border
        }
      },
      boxShadow: {
        neon: "0 0 10px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.3)",
        "neon-strong": "0 0 20px rgba(0, 255, 136, 0.6), 0 0 40px rgba(0, 255, 136, 0.4)",
        panel: "0 8px 32px 0 rgba(0, 0, 0, 0.5)"
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'cyber-gradient': "linear-gradient(to bottom right, #020403, #051a10)",
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
