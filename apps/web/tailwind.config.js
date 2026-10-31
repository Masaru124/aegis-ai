/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        void: "#07080b",
        surface: {
          DEFAULT: "#0d0f15",
          raised: "#131620",
          card: "#10121a",
          subtle: "#181b26",
          border: "rgba(255, 255, 255, 0.08)",
          borderActive: "rgba(0, 245, 212, 0.35)",
        },
        cyan: {
          DEFAULT: "#00f5d4",
          dim: "rgba(0, 245, 212, 0.12)",
          glow: "rgba(0, 245, 212, 0.25)",
        },
        amber: {
          DEFAULT: "#ff9e00",
          dim: "rgba(255, 158, 0, 0.12)",
          glow: "rgba(255, 158, 0, 0.25)",
        },
        crimson: {
          DEFAULT: "#ff385c",
          dim: "rgba(255, 56, 92, 0.12)",
          glow: "rgba(255, 56, 92, 0.25)",
        },
        steel: {
          400: "#8b95a5",
          500: "#5c6677",
          600: "#3d4554",
          700: "#272c37",
          800: "#1a1e27",
          900: "#10131b",
        },
      },
      boxShadow: {
        tactile: "0 1px 0 0 rgba(255, 255, 255, 0.08) inset, 0 4px 16px rgba(0, 0, 0, 0.4)",
        "cyan-glow": "0 0 20px -3px rgba(0, 245, 212, 0.35)",
        "amber-glow": "0 0 20px -3px rgba(255, 158, 0, 0.35)",
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.65 },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};
