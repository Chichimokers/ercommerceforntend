import { useMemo } from "react";
import useSWR from "swr";
import { buildQueryParams } from "./buildQueryParams";
import { Filters } from "@/types/types";

export const useProducts = (baseUrl: string, filters: Filters, page: number) => {
  const queryParams = useMemo(() => buildQueryParams(filters, page, 30), [filters, page]);
  const fetchUrl = `${baseUrl}/public/products?${queryParams}`;

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse?.message || response.statusText);
    }
    return response.json();
  };

  return useSWR(fetchUrl, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });
};


export const useCartProducts = (baseUrl: string, availableProducts?: any[]) => {
  const getCartIds = (): string[] => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(cart) ? cart.map(item => item.id) : [];
    } catch {
      return [];
    }
  };

  const fetchProductDetails = async (id: string) => {
    try {
      const response = await fetch(`${baseUrl}/public/product-details?id=${id}`);
      return response.ok ? response.json() : null;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
  };

  const fetcher = async () => {
    const ids = getCartIds();
    if (!ids.length) return [];

    const [existingProducts, idsToFetch] = ids.reduce((acc, id) => {
      const product = availableProducts?.find(p => p.id === id);
      product ? acc[0].push(product) : acc[1].push(id);
      return acc;
    }, [[], []] as [any[], string[]]);

    if (!idsToFetch.length) return existingProducts;

    const fetchedProducts = await Promise.allSettled(
      idsToFetch.map(fetchProductDetails)
    );

    const validProducts = fetchedProducts
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => (result as PromiseFulfilledResult<any>).value);

    return [...existingProducts, ...validProducts];
  };

  return useSWR(['cart-products', getCartIds()], fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });
};