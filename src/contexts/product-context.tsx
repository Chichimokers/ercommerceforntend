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

interface ProductContextType {
  products: ProductBase[];
  cartProducts: ProductBase[];
  isLoading: boolean;
  categories: Category[];
  totalPages?: number;
  errorStatus: boolean;
  errorMessage: string;
  isLoadingCart: boolean;
  mutateCartProducts: () => void;
  filters: Filters;
  currentPage: number;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Obtener parámetros de la URL
  const getQueryParams = useCallback(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  // Sincronización inicial con la URL
  useEffect(() => {
    if (pathname !== "/products" || searchParams.get("modal")) return;

    const queryParams = getQueryParams();
    const { filters: newFilters, page: newPage } =
      parseQueryToFilters(queryParams);

    setFilters(newFilters);
    setCurrentPage(newPage);
    setIsInitialLoad(false);
  }, [pathname, searchParams, getQueryParams]);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    if (isInitialLoad || pathname !== "/products") return;

    const queryParams = buildQueryParams(filters, currentPage, 30);
    const newUrl = `${pathname}?${queryParams}`;

    if (window.location.href !== newUrl) {
      router.replace(newUrl);
    }
  }, [filters, currentPage, pathname, isInitialLoad, router]);

  // Fetch de productos
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
  } = useProducts(baseUrl, filters, currentPage);

  // Carrito y categorías
  const {
    data: cartProducts = [],
    isLoading: isLoadingCart,
    mutate: mutateCartProducts,
  } = useCartProducts(baseUrl, productsData?.products);
  const { data: categories = [] } = useCategories(baseUrl);

  // Memoizar el contexto
  const contextValue = useMemo(
    () => ({
      products: productsData?.products || [],
      cartProducts,
      isLoading: isLoadingProducts || isLoadingCart,
      categories,
      totalPages: productsData?.totalPages,
      errorStatus: !!productsError,
      errorMessage:
        productsError?.message === "Not found products!"
          ? "No se han encontrado productos relacionados con los parámetros del filtrado"
          : productsError?.message || "",
      isLoadingCart,
      mutateCartProducts,
      filters,
      currentPage,
    }),
    [
      productsData,
      cartProducts,
      isLoadingProducts,
      isLoadingCart,
      categories,
      productsError,
      filters,
      currentPage,
      mutateCartProducts
    ]
  );

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
