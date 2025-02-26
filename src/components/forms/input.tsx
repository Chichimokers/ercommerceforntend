import { Input } from "@heroui/react";

const InputComponent = ({
  className,
  label,
  placeholder,
  type,
  required,
}: {
  className?: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}) => {
  return (
    <div className="w-full flex flex-col gap-4 z-0 items-center justify-center">
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        <Input
          className={className}
          label={label}
          placeholder={placeholder}
          required={required}
          type={type}
          variant="bordered"
        />
      </div>
    </div>
  );
};

export default InputComponent;
