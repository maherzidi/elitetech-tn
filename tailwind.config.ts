import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palette sombre (anciennement bleu-navy, désormais noir profond assorti au logo)
        navy: {
          950: "#0A0A0B",
          900: "#131314",
          800: "#1C1C1F",
          700: "#28282C",
          600: "#3A3A40",
        },
        accent: {
          DEFAULT: "#F5811F",
          dark: "#D96B10",
          light: "#FF9D4D",
        },
        amber: {
          DEFAULT: "#FFB020",
          dark: "#E69A0D",
        },
        ink: "#15130F",
        paper: "#F7F6F4",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
