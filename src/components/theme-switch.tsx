"use client";

import { FC, useState, useEffect } from "react";
import { Button, Tooltip } from "@heroui/react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (theme) {
      document.documentElement.classList.remove(theme);
    }
    document.documentElement.classList.add(newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    setIsMounted(true);
  }, [setTheme]);

  if (!isMounted) return <div className="w-10 h-10" />;

  return (
    <Tooltip
      className="h-auto"
      content={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      delay={200}
    >
      <Button
        onPress={toggleTheme}
        isIconOnly
        className={`${className} !rounded-full w-10 h-10 !p-0 !border border-default-600 hover:bg-blue-50/50 dark:hover:bg-gray-900/50 hover:border-default-400 transition-none bg-blue-50/50 dark:bg-gray-900/50`}
        variant="bordered"
        aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      >
        {theme === "light" ? (
          <MoonIcon size={22} opacity={0.8} className="text-default-foreground" />
        ) : (
          <SunIcon size={22} opacity={0.8} className="text-default-foreground" />
        )}
      </Button>
    </Tooltip>
  );
};
