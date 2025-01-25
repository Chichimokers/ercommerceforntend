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
    if (filters.categories.length)
      params.set("category", filters.categories.join(","));
    if (filters.subcategories.length)
      params.set("subcategory", filters.subcategories.join(","));
    if (filters.rating) params.set("rate", filters.rating.toString());
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) {
      params.set("pricerange", filters.priceRange.join("-"));
    }
    router.push(`/products?${params.toString()}`);
  };

  return { filters, setFilters, applyFilters };
};
