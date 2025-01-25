import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Montserrat",
          "Noto Sans",
          "Roboto",
          "Playfair Display",
          "Poppins",
          "ui-sans-serif",
          "system-ui",
        ],
        mono: ["var(--font-mono)"],
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      screens: {
        xs: "320px",
        xxs: "380px",
        xm: "560px",
        sm: "640px",
        md: "768px",
        xg: "900px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1850px",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
