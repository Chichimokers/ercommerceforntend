import { heroui } from "@heroui/theme";
//commit vacio
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/(ecommerce)/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/(admin)/**/*.{js,ts,jsx,tsx,mdx}",
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
