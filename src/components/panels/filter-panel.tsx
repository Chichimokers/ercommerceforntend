import dynamic from "next/dynamic";
import { useFilters } from "@/hooks/useFilters";
import { useState } from "react";
import FiltersSkeleton from "@components/skeletons/filters-skeleton";
import React from "react";

const Filters = dynamic(() => import("../filters/filters"), {
  loading: () => <FiltersSkeleton />,
});

export const FilterPanel = () => {
  const { setFilters, applyFilters } = useFilters();
  const [isInvalidFilters, setIsInvalidFilters] = useState<boolean>(false);

  return (
    <div className="relative px-4 filter-panel hidden md:block md:w-64 h-[calc(100vh-114px)] overflow-y-auto hover:overflow-y-scroll z-20 shadow-sm scrollbar-hide border-r border-default-50 transition-all duration-300">
      <div className="absolute inset-x-0 top-0 px-4 z-30 border-b border-default-50">
        <h2 className="text-xl font-bold my-4">Filtros</h2>
      </div>
      <div className="mt-[64px] mb-2 py-2">
        <div className="relative min-h-[300px]">
          <React.Suspense fallback={<FiltersSkeleton />}>
            <Filters
              onFilterChange={setFilters}
              setIsInvalidFilters={setIsInvalidFilters}
              className="transition-opacity duration-300 ease-in-out bg-white dark:bg-gray-900"
            />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};
