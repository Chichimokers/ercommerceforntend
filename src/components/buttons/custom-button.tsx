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
  const baseClasses = clsx(
    "relative overflow-hidden rounded-xl focus:outline-none transition duration-200",
    "flex flex-row gap-2 items-center justify-center",
    !isDisabled && !isLoading && "active:brightness-75"
  );

  const colorClasses = clsx({
    'bg-blue-500 hover:bg-blue-600': color === 'primary',
    'bg-gray-500 hover:bg-gray-600': color === 'secondary',
    'bg-green-500 hover:bg-green-600': color === 'success',
    'bg-red-500 hover:bg-red-600': color === 'danger',
    '': color === 'default',
    'text-white': ['primary', 'secondary', 'success', 'danger'].includes(color),
    'text-default-800': color === 'default' || variant === 'ghost',
  });

  const sizeClasses = {
    small: "text-sm py-2 px-4",
    medium: "text-base py-2 px-6",
    large: "text-lg py-3 px-8",
  }[size];

  const variantClasses = clsx({
    'border-2 border-default-400 bg-transparent': variant === 'outlined',
    'bg-transparent hover:bg-gray-100': variant === 'ghost',
    'border-2 border-default-200 hover:border-default-400': variant === 'bordered',
  });

  const buttonClasses = clsx(
    baseClasses,
    colorClasses,
    sizeClasses,
    variantClasses,
    (isDisabled || isLoading) && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <button
      {...(style && { style })}
      aria-label={isLoading ? "Cargando..." : aria_label}
      onClick={onClick}
      type={type}
      className={buttonClasses}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
      ) : (
        <>
          {startContent && <span className="mr-2">{startContent}</span>}
          {children}
        </>
      )}
    </button>
  );
};
