"use client";

import { FC, useState, useEffect } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, Tooltip, useSwitch } from "@heroui/react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  const onChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);
    // Guardar en localStorage
    localStorage.setItem("theme", newTheme);
    // Actualizar el atributo class en el elemento html para Tailwind
    if (theme) {
      document.documentElement.classList.remove(theme);
    }
    document.documentElement.classList.add(newTheme);
  };

  useEffect(() => {
    // Recuperar el tema guardado
    const savedTheme = localStorage.getItem("theme") || "light";

    // Aplicar el tema inmediatamente
    setTheme(savedTheme);
    setIsMounted(true);
  }, [setTheme]);

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: theme === "light",
    onChange,
  });

  // Prevent Hydration Mismatch
  if (!isMounted) return <div className="w-10 h-10" />;

  return (
    <Tooltip
      className="h-auto"
      content={
        isSelected ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
      }
      delay={200}
    >
      <Component
        aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
        {...getBaseProps({
          className: clsx(
            "px-px flex flex-col items-center justify-center border border-default-600 h-10 w-10 rounded-full hover:border-default-400 cursor-pointer bg-blue-50/50 dark:bg-gray-900/50",
            className,
            classNames?.base
          ),
        })}
      >
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          className={slots.wrapper({
            class: clsx(
              [
                "bg-transparent",
                "rounded-xl",
                "flex items-center justify-center",
                "group-data-[selected=true]:bg-transparent",
                "!text-default-foreground hover:text-default-400",
                "pt-px",
                "px-0",
                "mx-0",
              ],
              classNames?.wrapper,
            ),
          })}
        >
          {isSelected ? (
            <MoonFilledIcon size={22} opacity={0.8} />
          ) : (
            <SunFilledIcon size={22} opacity={0.8} />
          )}
        </div>
      </Component>
    </Tooltip>
  );
};
