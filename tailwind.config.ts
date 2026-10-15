import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0E14",
          900: "#0F131A",
          850: "#12161D",
          800: "#151B25",
          700: "#232B38",
          600: "#3B4763",
        },
        paper: "#F2F4F7",
        muted: "#8B94A3",
        accent: {
          DEFAULT: "#2E6BFF",
          dark: "#1F56D6",
        },
        warn: "#EAB308",
        danger: "#E5484D",
        success: "#22A06B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
