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
import { useLocationStore } from "@store/location/location-store";
import { useCartStore } from "@/store/cart/cart-store";

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
  const { location } = useLocationStore();

  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [cartProducts, setCartProducts] = useState<ProductBase[]>([]);

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
    data: cartProductsData = [],
    isLoading: isLoadingCart,
    mutate: mutateCartProductsOld,
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

  const mutateCartProducts = useCallback(async () => {
    const cartItems = useCartStore.getState().cart;

    if (!cartItems?.length) {
      setCartProducts([]);
      return;
    }

    const cartIds = cartItems.map(item => item.id);

    const availableProducts = productsData?.products.filter((product: ProductBase) =>
      cartIds.includes(product.id)
    ) || [];

    const missingIds = cartIds.filter(id =>
      !availableProducts.some((product: ProductBase) => product.id === id)
    );

    if (!missingIds.length) {
      setCartProducts(availableProducts);
      return;
    }

    // Buscar los productos faltantes en la API
    try {
      const promises = missingIds.map(id =>
        fetch(`${baseUrl}/public/product-details?id=${id}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const fetchedProducts = await Promise.all(promises);
      const validFetchedProducts = fetchedProducts.filter(Boolean);

      // Combinar los productos disponibles localmente con los obtenidos de la API
      setCartProducts([...availableProducts, ...validFetchedProducts]);
    } catch (error) {
      console.error("Error fetching cart products:", error);
    }
  }, [productsData, baseUrl, setCartProducts]);

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
