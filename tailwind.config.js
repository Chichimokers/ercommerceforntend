import { heroui } from "@heroui/theme";

//pero aqui va otro
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/providers/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/types/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
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
        "fade-in": "fade-in 0.3s ease-out forwards",
        'wave': 'wave 10s ease-in-out infinite',
        'wave-slow': 'wave-slow 8s ease-in-out infinite',
        'float': 'float 10s ease-in-out infinite',
        'float-reverse': 'float-reverse 12s ease-in-out infinite',
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
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
