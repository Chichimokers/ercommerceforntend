import { cn } from "@heroui/react";
import { useModal } from "@/contexts/modal-context";
import { LogInIcon } from "lucide-react";
import { CustomButton } from "./custom-button";

export const LoginButton = ({ className }: { className?: string }) => {
  const { openLogin } = useModal();
  return (
    <CustomButton
      className={cn(
        "cursor-pointer h-10 w-10 border-2 border-default-200 hover:border-default-400 bg-opacity-50 dark:bg-opacity-50 bg-white dark:bg-black !rounded-full group !px-0 !transition-none",
        className
      )}
      variant="bordered"
      color="default"
      onClick={() => openLogin()}
    >
      <LogInIcon
        size={20}
        opacity={0.7}
        className="mx-auto text-default-800"
      />
    </CustomButton>
  );
};
