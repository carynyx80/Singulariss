import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium Singularis theme: near-black green-tinted base + emerald accent
        base: "#080B09",
        ink: {
          950: "#080B09",
          900: "#0C1210",
          850: "#0D1512",
          800: "#111A16",
          700: "#1A2622",
          600: "#2A3B34",
        },
        paper: "#F4F7F5",
        muted: "#9AA8A2",
        accent: {
          DEFAULT: "#10B981",
          bright: "#34D399",
          deep: "#065F46",
          dark: "#0B7A55",
          faint: "#0E2A21",
        },
        warn: "#EAB308",
        danger: "#E5484D",
        success: "#10B981",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(16, 185, 129, 0.35)",
        "glow-sm": "0 0 24px -6px rgba(16, 185, 129, 0.28)",
        card: "0 8px 32px -12px rgba(0, 0, 0, 0.6)",
      },
      backgroundImage: {
        "emerald-radial": "radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,0.14), transparent 70%)",
        "emerald-soft": "linear-gradient(180deg, rgba(16,185,129,0.10), rgba(16,185,129,0.02))",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
