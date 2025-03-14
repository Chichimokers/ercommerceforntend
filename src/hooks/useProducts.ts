import { useMemo, useCallback } from "react";
import useSWR, { SWRConfiguration } from "swr";
import { buildQueryParams } from "./buildQueryParams";
import { Filters, ProductBase } from "@/types/types";

const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  dedupingInterval: 5000,
};

const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || `Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

export const useProducts = (
  baseUrl: string,
  filters: Filters,
  page: number,
  location: { pathname?: string; search?: string } | Record<string, unknown>
) => {
  const locationKey = useMemo(() => {
    if (!location) return "";
    return typeof location === 'object' && 'pathname' in location
      ? `${location.pathname || ""}${location.search || ""}`
      : JSON.stringify(location);
  }, [location]);

  const queryParams = useMemo(
    () => {
      buildQueryParams(filters, page, 30, locationKey)
    },
    [filters, page, locationKey]
  );

  const fetchUrl = useMemo(
    () => `${baseUrl}/public/products?${queryParams}`,
    [baseUrl, queryParams]
  );

  return useSWR<{ products: ProductBase[]; total: number; totalPages: number }>(
    fetchUrl,
    fetcher,
    {
      ...defaultSWRConfig,
      keepPreviousData: true,
    }
  );
};

interface CartItem {
  id: string;
  quantity: number;
}

export const useCartProducts = (
  baseUrl: string,
  availableProducts: ProductBase[] = []
) => {
  const getCartItems = useCallback((): CartItem[] => {
    try {
      const cartData = localStorage.getItem("cart");
      if (!cartData) return [];

      const cart = JSON.parse(cartData);
      if (!Array.isArray(cart)) return [];

      return cart.map(item => ({
        id: item.id,
        quantity: typeof item.quantity === 'number' ? item.quantity :
          typeof item.cantidad === 'number' ? item.cantidad : 1
      }));
    } catch (error) {
      console.error("Error parsing cart data:", error);
      return [];
    }
  }, []);

  const cartFetcher = useCallback(async () => {
    const cartItems = getCartItems();
    if (!cartItems.length) return [];

    const finalProducts: (ProductBase & { cartQuantity?: number })[] = [];
    const idsToFetch: string[] = [];

    cartItems.forEach(item => {
      const foundProduct = availableProducts?.find(product => product.id === item.id);

      if (foundProduct) {
        finalProducts.push({
          ...foundProduct,
          cartQuantity: item.quantity
        });
      } else {
        idsToFetch.push(item.id);
      }
    });

    if (!idsToFetch.length) {
      return finalProducts;
    }

    try {
      const promises = idsToFetch.map(async id => {
        try {
          const cartItem = cartItems.find(item => item.id === id);
          const quantity = cartItem?.quantity || 1;

          const response = await fetch(`${baseUrl}/public/product-details?id=${id}`);
          if (!response.ok) return null;

          const product = await response.json();

          return product ? {
            ...product,
            cartQuantity: quantity
          } : null;
        } catch (error) {
          console.error(`Error fetching product ${id}:`, error);
          return null;
        }
      });

      const fetchedProducts = await Promise.all(promises);
      const validFetchedProducts = fetchedProducts.filter(Boolean) as (ProductBase & { cartQuantity?: number })[];

      return [...finalProducts, ...validFetchedProducts];
    } catch (error) {
      console.error("Error fetching cart products:", error);
      return finalProducts;
    }
  }, [baseUrl, availableProducts, getCartItems]);

  return useSWR<(ProductBase & { cartQuantity?: number })[]>(
    'cart-products',
    cartFetcher,
    {
      ...defaultSWRConfig,
      revalidateIfStale: true,
      dedupingInterval: 2000,
      refreshWhenHidden: true,
    }
  );
};