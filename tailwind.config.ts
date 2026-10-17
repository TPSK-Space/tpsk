import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/(landing)/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/space/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/landing/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/space/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand: neon tosca
        neon: {
          DEFAULT: "#00ffd0",
          hover: "#4dffdf",
          soft: "rgba(0, 255, 208, 0.1)",
          border: "rgba(0, 255, 208, 0.3)",
        },
        // Earthy accents
        amber: {
          warm: "#f59e0b",
          glow: "rgba(245, 158, 11, 0.3)",
        },
        emerald: {
          deep: "#10b981",
          glow: "rgba(16, 185, 129, 0.25)",
        },
        // Surface levels (black theme)
        ink: {
          base: "#0a0a0a",
          surface: "#121212",
          elevated: "#161616",
          hover: "#1e1e1e",
        },
      },
      fontFamily: {
        serif: ["Georgia", "ui-serif", "serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 255, 208, 0.15)",
        "glow-lg": "0 0 40px rgba(0, 255, 208, 0.25)",
        "earth-amber": "0 0 25px rgba(245, 158, 11, 0.25)",
        "earth-emerald": "0 0 25px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;