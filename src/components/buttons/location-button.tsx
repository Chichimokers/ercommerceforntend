import { Dispatch, SetStateAction } from "react"
import { CustomButton } from "./custom-button";
import { FaLocationDot } from "react-icons/fa6";
import { Button } from "@heroui/react";

export const LocationButton = ({ className, setModalOpen }: { className?: string, setModalOpen: Dispatch<SetStateAction<boolean>> }) => {
  return (
    <div>
      <Button
        onPress={() => setModalOpen(true)}
        isIconOnly
        className={`${className} !rounded-full w-10 h-10 !p-0 !border border-default-600 hover:bg-blue-50/50 dark:hover:bg-gray-900/50 hover:border-default-400 transition-none bg-blue-50/50 dark:bg-gray-900/50`}
        variant="bordered">
        <FaLocationDot size={22} opacity={0.8} className="text-default-foreground" />
      </Button>
    </div>
  );
}