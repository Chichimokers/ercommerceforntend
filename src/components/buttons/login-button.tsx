import { Button, cn, Tooltip } from "@heroui/react";
import { LogInIcon } from "lucide-react";
import Link from "next/link";

export const LoginButton = ({ className }: { className?: string }) => {
  return (
    <Tooltip
      className="h-auto"
      content={
        "Iniciar sesion"
      }
      delay={200}
    >
      <Button
        className={cn(
          "cursor-pointer h-10 min-w-10 w-10 p-0 border border-default-600 hover:border-default-400 bg-blue-50/50 dark:bg-gray-900/50 rounded-full",
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
    </Tooltip>
  );
};
