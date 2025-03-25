import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
} from "@heroui/react";
import { Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { CustomButton } from "../buttons/custom-button";
import { useFilters } from "@/hooks/useFilters";
import React, { useMemo, useState } from "react";

const Filters = dynamic(() => import("../filters/filters"));

const FilterDrawer = React.memo(function FilterDrawer({ className }: { className?: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { setFilters } = useFilters();
  const [isInvalidFilters, setIsInvalidFilters] = useState(false);

  const buttonClasses = useMemo(
    () =>
      "!fixed !h-12 !pr-12 !bottom-1/2 !right-4 !rounded-full !z-40 " +
      "!shadow-xl !border !border-default-400 transition-transform duration-300 " +
      "ease-in-out transform translate-x-12 bg-opacity-80",
    []
  );

  return (
    <>
      <CustomButton
        onClick={onOpen}
        color="secondary"
        className={buttonClasses}
        aria-label="Abrir filtros"
      >
        <Filter size={16} className="ml-0" />
      </CustomButton>

      <Drawer
        className={`rounded-none ${className} bg-white dark:bg-gray-900`}
        classNames={{
          closeButton: "absolute top-1 right-1 bg-default-100 border border-default-200",
        }}
        backdrop="opaque"
        size="sm"
        placement="left"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold px-4 my-4">Filtros</h2>
              </DrawerHeader>
              <DrawerBody>
                <React.Suspense fallback={<div></div>}>
                  <Filters
                    onFilterChange={setFilters}
                    className="transition-opacity duration-300 ease-in-out bg-white dark:bg-gray-900"
                  />
                </React.Suspense>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
});

export default FilterDrawer;
