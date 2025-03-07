import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startContent?: React.ReactNode;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ startContent, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {startContent && (
          <span className="absolute left-3 text-gray-400">{startContent}</span>
        )}
        <input
          ref={ref}
          className={`pl-${startContent ? "10" : "3"} py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-900/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors w-full outline-none ${className}`}
          {...props}
        />
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
