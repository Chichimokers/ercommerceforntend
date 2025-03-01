import dynamic from "next/dynamic";
import { CustomButton } from "../buttons/custom-button";
import { useFilters } from "@/hooks/useFilters";
import { useState } from "react";
import FiltersSkeleton from "@components/skeletons/filters-skeleton";

const Filters = dynamic(() => import("../filters/filters"), {
  loading: () => <FiltersSkeleton />,
});

export const FilterPanel = () => {
  const { setFilters, applyFilters } = useFilters();
  const [isInvalidFilters, setIsInvalidFilters] = useState<boolean>(false);

  return (
    <div className="relative px-4 filter-panel hidden md:block md:w-64 h-[calc(100vh-64px)] overflow-y-auto hover:overflow-y-scroll z-40 shadow-sm scrollbar-hide border-r border-default-50 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 bg-white dark:bg-black px-4 z-30 border-b border-default-50">
        <h2 className="text-xl font-bold my-4">Filtros</h2>
      </div>
      <div className="mt-[64px] mb-2 py-2">
        <div className="relative min-h-[300px]">
          <Filters
            onFilterChange={setFilters}
            setIsInvalidFilters={setIsInvalidFilters}
            className="transition-opacity duration-300 ease-in-out"
          />
        </div>
      </div>
      <div className="sticky inset-x-0 bottom-0 bg-white py-4 dark:bg-black z-50">
        <CustomButton className="w-full" onClick={applyFilters} isDisabled={isInvalidFilters}>
          Aplicar filtros
        </CustomButton>
      </div>
    </div>
  );
};
