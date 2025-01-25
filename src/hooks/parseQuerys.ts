import { Filters } from "@/types/types";

export const parseQueryToFilters = (query: any): { filters: Filters; page: number } => {
    const filters: Filters = {};
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1);
  
    if (query.category) {
      filters.category = query.category.toString().split(",").map(Number).filter(Boolean);
    }
    if (query.subcategory) {
      filters.subcategory = query.subcategory.toString().split(",").map(Number).filter(Boolean);
    }
    if (query.pricerange) {
      const [min, max] = query.pricerange.toString().split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) filters.pricerange = [min, max];
    }
    if (query.rate) {
      const rate = Number(query.rate);  
      if (!isNaN(rate)) filters.rate = rate;
    }
  
    return { filters, page };
  };
  