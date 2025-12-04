module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#020403",
          green: "#00ff88",
          dim: "#003311",
          gray: "#0a0f0d",
          panel: "#050a0f", // Keeping old one as fallback or secondary
        }
      },
      boxShadow: {
        neon: "0 0 10px #00ff88, 0 0 20px rgba(0, 255, 136, 0.4)",
        "neon-sm": "0 0 5px #00ff88",
        "neon-box": "inset 0 0 10px rgba(0, 255, 136, 0.2), 0 0 15px rgba(0, 255, 136, 0.4)"
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        flicker: {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.98' },
        }
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'], // Hardcode a classic terminal feel if needed, or stick to default mono
      }
    }
  },
  plugins: []
};
