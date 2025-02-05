import { Filters } from "@/types/types";

type QueryParamHandler = (value: any) => any;

const paramHandlers: Record<string, QueryParamHandler> = {
  category: v => v.toString().split(",").map(Number).filter(Boolean),
  subcategory: v => v.toString().split(",").map(Number).filter(Boolean),
  pricerange: v => {
    const [min, max] = v.toString().split("-").map(Number);
    return (!isNaN(min) && !isNaN(max)) ? [min, max] : null;
  },
  rate: v => {
    const num = Number(v);
    return !isNaN(num) ? num : null;
  }
};

export const parseQueryToFilters = (query: any): { filters: Filters; page: number } => {
  const filters = Object.entries(paramHandlers).reduce((acc, [key, handler]) => {
    const value = query[key] ? handler(query[key]) : undefined;
    return value ? { ...acc, [key]: value } : acc;
  }, {} as Filters);

  const page = Math.max(1, Number(query.page?.[0] || query.page || 1));

  return { filters, page };
};
