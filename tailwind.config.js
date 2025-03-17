import { heroui } from "@heroui/theme";

//pero aqui va otro
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
        'wave': 'wave 18s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
        'wave-slow': 'wave 25s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite',
        'float': 'float 10s ease-in-out infinite',
        'float-reverse': 'floatReverse 12s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
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
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-25%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(20px)' },
        },
      },
      utilities: {
        '.animation-delay-100': {
          'animation-delay': '100ms',
        },
        '.animation-delay-200': {
          'animation-delay': '200ms',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
