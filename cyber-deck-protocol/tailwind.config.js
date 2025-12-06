module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#000000',
        'cyber-green': '#00FF41',
        'cyber-dim': '#003B00',
        'cyber-alert': '#FF0000',
        'cyber-amber': '#FFB000',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      }
    }
  },
  plugins: []
};
