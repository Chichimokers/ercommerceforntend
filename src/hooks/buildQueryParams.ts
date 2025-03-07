import { Filters } from "@/types/types";

export const buildQueryParams = (filters: Filters, page: number, limit: number, location: any): string => {
  const params = new URLSearchParams();

  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (filters.category?.length) params.append("category", filters.category.join(","));
  if (filters.subcategory?.length) params.append("subcategory", filters.subcategory.join(","));
  if (filters.pricerange?.length === 2) params.append("pricerange", `${filters.pricerange[0]}-${filters.pricerange[1]}`);
  if (filters.rate !== undefined) params.append("rate", filters.rate.toString());
  if (location !== undefined) params.append("province", location.province)

  return params.toString();
};