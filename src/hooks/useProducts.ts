import { useMemo } from "react";
import useSWR from "swr";
import { buildQueryParams } from "./buildQueryParams";
import { Filters } from "@/types/types";

export const useProducts = (baseUrl: string, filters: Filters, page: number, location: any) => {
  const queryParams = useMemo(() => buildQueryParams(filters, page, 30, location), [filters, page]);
  const fetchUrl = `${baseUrl}/public/products?${queryParams}`;

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse?.message || response.statusText);
    }
    return response.json();
  };

  useSWR(fetchUrl, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return useSWR(fetchUrl, fetcher);
};


export const useCartProducts = (baseUrl: string, availableProducts?: any[]) => {
  const getCartIds = () => {
    try {
      const cartData = localStorage.getItem("cart");
      if (!cartData) return [];
      const cart = JSON.parse(cartData);
      return Array.isArray(cart) ? cart.map(item => item.id) : [];
    } catch {
      return [];
    }
  };

  const fetcher = async () => {
    const ids = getCartIds();
    if (!ids.length) return [];

    const finalProducts: any[] = [];
    const idsToFetch: string[] = [];

    ids.forEach(id => {
      const foundProduct = availableProducts?.find(product => product.id === id);
      if (foundProduct) {
        finalProducts.push(foundProduct);
      } else {
        idsToFetch.push(id);
      }
    });

    if (!idsToFetch.length) {
      return finalProducts;
    }

    const promises = idsToFetch.map(id =>
      fetch(`${baseUrl}/public/product-details?id=${id}`)
        .then(res => res.ok ? res.json() : null)
        .catch(() => null)
    );

    const fetchedProducts = await Promise.all(promises);
    const validFetchedProducts = fetchedProducts.filter(Boolean);

    return [...finalProducts, ...validFetchedProducts];
  };

  return useSWR('cart-products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};