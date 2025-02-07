import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
} from "@heroui/react";
import { FaFilter } from "react-icons/fa6";
import dynamic from "next/dynamic";
import { CustomButton } from "../buttons/custom-button";
import { useFilters } from "@/hooks/useFilters";
import React from "react";

const Filters = dynamic(() => import("../filters/filters"));

export default React.memo(function FilterDrawer({ className }: { className?: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { setFilters, applyFilters } = useFilters();
  const [isInvalidFilters, setIsInvalidFilters] = React.useState(false);

  const buttonClasses = React.useMemo(() =>
    "!fixed !h-12 !pr-12 !bottom-1/2 !right-4 !rounded-full !z-50 " +
    "!shadow-xl !border !border-default-400 transition-transform duration-300 " +
    "ease-in-out transform translate-x-12 bg-opacity-80 backdrop-blur-sm",
    []
  );

  const handleApplyFilters = React.useCallback((onClose: () => void) => {
    if (isInvalidFilters) return;
    applyFilters();
    onClose();
  }, [applyFilters, isInvalidFilters]);

  return (
    <>
      <CustomButton
        onClick={onOpen}
        color="secondary"
        className={buttonClasses}
        aria-label="Abrir filtros"
      >
        <FaFilter size={16} className="ml-0" />
      </CustomButton>

      <Drawer
        className={`rounded-none ${className}`}
        classNames={{
          closeButton: "absolute top-1 right-1 bg-default-100 border border-default-200",
        }}
        backdrop="blur"
        size="sm"
        placement="left"
        isDismissable={false}
        isKeyboardDismissDisabled
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold px-4 my-4">Filtros</h2>
              </DrawerHeader>
              <DrawerBody>
                <Filters
                  onFilterChange={setFilters}
                  setIsInvalidFilters={setIsInvalidFilters}
                />
              </DrawerBody>
              <DrawerFooter>
                <CustomButton
                  className="w-full mx-4 my-4"
                  onClick={() => handleApplyFilters(onClose)}
                  isDisabled={isInvalidFilters}
                  aria-disabled={isInvalidFilters}
                >
                  Aplicar filtros
                </CustomButton>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
});
