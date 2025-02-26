import { Button } from "@heroui/react";
import Link from "next/link";

const SecondaryButton = ({
  text,
  icon,
  className,
  size,
  onPress,
  color,
  href,
}: {
  text?: string;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  onPress: any;
  color?: string;
  href?: string; // href is now optional
}) => {
  // Create the button component
  const button = (
    <Button
      className={className}
      color={(color as any) || "secondary"}
      size={size}
      onPress={() => onPress()}
    >
      {icon && <div>{icon}</div>}
      {text}
    </Button>
  );

  // If href is provided, wrap the button in a Link component
  if (href) {
    return (
      <Link href={href} passHref>
        {button}
      </Link>
    );
  }

  // Otherwise, just render the button
  return button;
};

export default SecondaryButton;
