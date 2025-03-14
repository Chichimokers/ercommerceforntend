"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Category, Filters, ProductBase } from "@/types/types";
import { buildQueryParams } from "@/hooks/buildQueryParams";
import { parseQueryToFilters } from "@/hooks/parseQuerys";
import { useCategories } from "@/hooks/useCategories";
import { useProducts, useCartProducts } from "@/hooks/useProducts";
import { useLocation } from "./location-context";

interface ProductContextType {
  products: ProductBase[];
  cartProducts: ProductBase[];
  isLoading: boolean;
  categories: Category[];
  totalPages: number;
  error: any;
  errorStatus: boolean;
  errorMessage: string;
  isLoadingCart: boolean;
  mutateCartProducts: () => void;
  filters: Filters;
  currentPage: number;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  cartProducts: [],
  isLoadingCart: false,
  mutateCartProducts: () => { },
  filters: {},
  currentPage: 1,
  categories: [],
  errorStatus: false,
  errorMessage: "",
});
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { location } = useLocation()

  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getQueryParams = useCallback(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  useEffect(() => {
    if (pathname !== "/products" || searchParams.get("modal")) return;

    const queryParams = getQueryParams();
    const { filters: newFilters, page: newPage } =
      parseQueryToFilters(queryParams);

    setFilters(newFilters);
    setPage(newPage);
    setIsInitialLoad(false);
  }, [pathname, searchParams, getQueryParams]);

  useEffect(() => {
    if (isInitialLoad || pathname !== "/products") return;

    const queryParams = buildQueryParams(filters, page, 30, location);
    const newUrl = `${pathname}?${queryParams}`;

    if (window.location.href !== newUrl) {
      router.replace(newUrl);
    }
  }, [filters, page, pathname, isInitialLoad, router, location]);

  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
  } = useProducts(baseUrl, filters, page, location);

  const {
    data: cartProducts = [],
    isLoading: isLoadingCart,
    mutate: mutateCartProducts,
  } = useCartProducts(baseUrl, productsData?.products);
  const { data: categories = [] } = useCategories(baseUrl);

  const contextValue = useMemo(() => ({
    products: productsData?.products || [],
    totalPages: productsData?.totalPages || 1,
    isLoading: isLoadingProducts,
    error: productsError,
    cartProducts,
    isLoadingCart,
    mutateCartProducts,
    categories,
    filters,
    currentPage: page,
    errorStatus: !!productsError,
    errorMessage:
      productsError?.message === "Not found products!"
        ? "No se han encontrado productos relacionados con los parámetros del filtrado"
        : productsError?.message || "",
  }), [
    productsData,
    isLoadingProducts,
    productsError,
    cartProducts,
    isLoadingCart,
    mutateCartProducts,
    categories,
    filters,
    page,
  ]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error(
      "useProductContext debe usarse dentro de un ProductProvider"
    );
  }
  return context;
};
