import { cn } from "@heroui/react";
import { useModal } from "@/contexts/modal-context";
import { FaUser } from "react-icons/fa6";
import { CustomButton } from "./custom-button";

export const LoginButton = ({ className }: { className?: string }) => {
  const { openLogin } = useModal();
  return (
    <CustomButton
      className={cn(
        "cursor-pointer h-10 border-2 border-default-200 hover:border-default-400 bg-opacity-50 dark:bg-opacity-50 bg-white dark:bg-black !rounded-full group !px-0 !transition-none",
        className
      )}
      variant="bordered"
      color="default"
      onClick={() => openLogin()}
    >
      <div className="flex flex-row items-center">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-black flex flex-col justify-center z-10 border-y-2 border-r-2 border-default-200 border-collapse hover:border-default-400 bg-opacity-50 group-hover:border-default-400">
          <FaUser
            size={20}
            opacity={0.7}
            className="mx-auto text-default-800"
          />
        </div>

        <span className="mx-2 my-auto text-default-600">Iniciar sesion</span>
      </div>
    </CustomButton>
  );
};
