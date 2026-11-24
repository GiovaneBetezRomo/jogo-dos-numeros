import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        valorant: {
          bg: "#0B1219",
          surface: "#111B26",
          card: "#162230",
          border: "#253548",
          red: "#FF4655",
          redHover: "#FF5E6B",
          cyan: "#00F0FF",
          purple: "#9D4EDD",
          gold: "#FFB800",
          text: "#ECE8E1",
          muted: "#8B9BB4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-rajdhani)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        "glow-red": "0 0 25px rgba(255, 70, 85, 0.35)",
        "glow-cyan": "0 0 25px rgba(0, 240, 255, 0.28)",
        "glow-purple": "0 0 25px rgba(157, 78, 221, 0.3)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(90vh) rotate(540deg)", opacity: "0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "slide-up": "slide-up 0.35s ease-out forwards",
        "confetti-fall": "confetti-fall 2.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
