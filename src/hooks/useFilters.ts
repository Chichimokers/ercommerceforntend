import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilterState } from "@/types/types";

export const useFilters = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    rating: 0,
    priceRange: [0, 1000],
  });

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");

    // Configuración optimizada de parámetros
    const queryParams = {
      category: filters.categories.join(",") || undefined,
      subcategory: filters.subcategories.join(",") || undefined,
      rate: filters.rating > 0 ? filters.rating.toString() : undefined,
      pricerange: (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000)
        ? filters.priceRange.join("-")
        : undefined
    };

    // Añadir parámetros no vacíos
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    router.push(`/products?${params.toString()}`);
  };

  return { filters, setFilters, applyFilters };
};
