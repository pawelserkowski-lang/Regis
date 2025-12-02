module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: { cyber: { bg: "#050a0f", panel: "#0f172a", primary: "#2dd4bf", accent: "#f59e0b" }},
    boxShadow: { neon: "0 0 30px rgba(45,212,191,0.5)" }
  }}
};
