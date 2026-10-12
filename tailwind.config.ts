import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "pelusa-gold": {
          DEFAULT: "#FFB800",
          hover: "#E5A600",
          light: "#FFC933",
        },
        "pelusa-black": "#0A0A0A",
        "pelusa-dark": "#121212",
        "pelusa-card": "#18181B",
      },
    },
  },
  plugins: [],
};

export default config;
