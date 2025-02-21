import { heroui } from "@heroui/react";

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
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
          },
          screens: {
            xxs: "380px",
            xs: "480px",
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
      plugins: [
        heroui(),
        import("@tailwindcss/typography"),
        import("@tailwindcss/forms"),
      ],
    },
  },
};

export default config;
