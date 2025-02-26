import { Button } from "@heroui/react";

const PrimaryButton = ({
  text,
  icon,
  className,
  size,
  type,
  onPress,
  isDisabled,
}: {
  text?: string;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  onPress?: Function;
  isDisabled?: boolean;
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Button
        className={className}
        color="primary"
        size={size}
        type={type || "button"}
        onPress={() => onPress && onPress()}
        isDisabled={isDisabled}
      >
        {icon && <div>{icon}</div>}
        {text}
      </Button>
    </div>
  );
};

export default PrimaryButton;
