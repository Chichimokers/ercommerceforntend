import { Button, cn } from "@heroui/react";
import { LogInIcon } from "lucide-react";
import Link from "next/link";

export const LoginButton = ({ className }: { className?: string }) => {
  return (
    <Button
      className={cn(
        "cursor-pointer h-10 min-w-10 w-10 p-0 border-2 border-default-200 hover:border-default-400 bg-opacity-50 dark:bg-opacity-50 bg-white dark:bg-black rounded-full",
        className
      )}
      variant="bordered"
      color="default"
      size="sm"
      as={Link}
      href="/login"
    >
      <LogInIcon
        size={20}
        opacity={0.7}
        className="mx-auto text-default-800"
      />
    </Button>
  );
};
