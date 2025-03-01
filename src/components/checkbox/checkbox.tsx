import React from "react";

interface CheckboxProps {
  label?: string;
  children?: React.ReactNode
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  children,
  checked,
  onChange,
  className = "",
}) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita el comportamiento predeterminado para prevenir problemas con el foco
    onChange(!checked);
  };

  return (
    <div
      className={`flex items-center cursor-pointer gap-2 group hover:bg-default-200 p-1 transition-all rounded-md ${className}`}
      onClick={handleToggle} // Cambia el estado al hacer clic en el contenedor
    >
      <div
        className={`relative w-6 h-6 border-2 rounded-md transition-all 
        ${checked
            ? "bg-blue-500 border-blue-500"
            : "bg-default-50 border-default-300 group-hover:bg-default-200"
          }`}
      >
        <input
          id={label || "checkbox"}
          type="checkbox"
          checked={checked}
          readOnly // Solo lectura para evitar doble manejo del estado
          className="absolute w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className={`absolute inset-0 flex items-center justify-center text-white transition-opacity 
          ${checked ? "opacity-100" : "opacity-0"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {label ? (
        <label
          htmlFor={label || "checkbox"}
          className="text-base text-default-600 cursor-pointer"
        >
          {label}
        </label>
      ) :
        children
      }

    </div>
  );
};

export default Checkbox;
