"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense
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
  minPrice: number;
  maxPrice: number;
  error: any;
  errorStatus: boolean;
  errorMessage: string;
  isLoadingCart: boolean;
  mutateCartProducts: () => void;
  filters: Filters;
  currentPage: number;
  hasMoreProducts: boolean;
  fetchNextPage: () => void;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  totalPages: 1,
  minPrice: 0,
  maxPrice: 1000,
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
  hasMoreProducts: false,
  fetchNextPage: () => { },
});
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

// Componente principal que proporciona el límite de Suspense
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Suspense fallback={null}>
      <ProductProviderContent>
        {children}
      </ProductProviderContent>
    </Suspense>
  );
};

// Componente interno que usa useSearchParams
const ProductProviderContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { location } = useLocation();

  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);

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

  const fetchNextPage = useCallback(() => {
    const currentPage = Number(searchParams.get("page")) || 1;
    const newPage = currentPage + 1;

    if (newPage <= productsData?.totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, productsData?.totalPages, router, pathname]);

  useEffect(() => {
    if (productsData) {
      const totalItems = productsData.totalItems || productsData.products.length || 0;
      setHasMoreProducts(productsData.products.length < totalItems);
    }
  }, [productsData]);

  const contextValue = useMemo(() => ({
    products: productsData?.products || [],
    totalPages: productsData?.totalPages || 1,
    minPrice: productsData?.minPrice || 0,
    maxPrice: productsData?.maxPrice || 1000,
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
    hasMoreProducts,
    fetchNextPage,
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
    hasMoreProducts,
    fetchNextPage,
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
