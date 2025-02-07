import clsx from "clsx";
import React from "react";

interface CustomButtonProps {
  aria_label?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "danger" | "default";
  size?: "small" | "medium" | "large";
  variant?: "filled" | "outlined" | "ghost" | "bordered";
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  isLoading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  aria_label = "",
  style = {},
  children,
  color = "primary",
  size = "medium",
  variant = "filled",
  className = "",
  type = "button",
  onClick,
  isDisabled = false,
  startContent,
  isLoading = false,
}) => {
  const baseClasses = `relative overflow-hidden rounded-xl focus:outline-none transition duration-200 ${!isDisabled && "active:brightness-75"} flex flex-row gap-2 items-center justify-center`;
  const colorClasses = {
    primary: `bg-blue-500 text-white ${!isDisabled && "hover:bg-blue-600"}`,
    secondary: `bg-gray-500 text-white ${!isDisabled && "hover:bg-gray-600"}`,
    success: `bg-green-500 text-white ${!isDisabled && "hover:bg-green-600"}`,
    danger: `bg-red-500 text-white ${!isDisabled && "hover:bg-red-600"}`,
    default: `bg-white dark:bg-black text-default-800`,
  };
  const sizeClasses = {
    small: "text-sm py-2 px-4",
    medium: "text-base py-2 px-6",
    large: "text-lg py-3 px-8",
  };
  const variantClasses = {
    filled: ``,
    outlined: `border-2 border-current bg-transparent text-current`,
    ghost: `bg-transparent text-current ${!isDisabled && "hover:bg-gray-100"}`,
    bordered: `!text-default-800 border-2 border-default-200 ${!isDisabled && "hover:border-default-400"}`,
  };

  // Estilos específicos para botones desactivados
  const disabledClasses = "opacity-50 cursor-not-allowed active:brightness-100";

  const buttonClasses = clsx(
    baseClasses,
    colorClasses[color],
    sizeClasses[size],
    variantClasses[variant],
    (isDisabled || isLoading) && disabledClasses, // Aplica estilos si está deshabilitado o cargando
    className,
  );

  return (
    <button
      style={{ ...style }}
      aria-label={aria_label}
      onClick={onClick}
      type={type}
      className={`${buttonClasses} ${variant === "ghost" && "text-default-800"
        }`}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        </div>
      ) : (
        <>
          {startContent && <span className="mr-2">{startContent}</span>}
          {children}
        </>
      )}
    </button>
  );
};
