"use client";

import { create } from "zustand";
import { Filters, ProductBase, Category, Location } from "@/types/types";
import { buildQueryParams } from "@/hooks/buildQueryParams";
import { parseQueryToFilters } from "@/hooks/parseQuerys";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocationStore } from "@/store/location/location-store";
import { useEffect, useCallback } from "react";

// Interfaces
interface ProductState {
  // Datos
  products: ProductBase[];
  cartProducts: ProductBase[];
  categories: Category[];

  // Estado de la UI
  isLoading: boolean;
  isLoadingCart: boolean;

  // Paginación y filtros
  filters: Filters;
  currentPage: number;
  totalPages: number;
  hasMoreProducts: boolean;

  // Precios
  minPrice: number;
  maxPrice: number;

  // Estado de error
  error: any;
  errorStatus: boolean;
  errorMessage: string;

  // Meta
  isInitialLoad: boolean;
  isUrlUpdating: boolean; // Nuevo estado para prevenir bucles
  location?: Location; // Ubicación actual para filtrado
}

interface ProductActions {
  // Acciones básicas
  setProducts: (products: ProductBase[], totalPages: number, minPrice: number, maxPrice: number) => void;
  setCartProducts: (products: ProductBase[]) => void;
  setCategories: (categories: Category[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsLoadingCart: (isLoading: boolean) => void;
  setError: (error: any) => void;
  setFilters: (filters: Filters) => void;
  setPage: (page: number) => void;
  setHasMoreProducts: (hasMore: boolean) => void;
  setInitialLoad: (value: boolean) => void;
  setIsUrlUpdating: (value: boolean) => void; // Nueva acción

  // Acciones complejas
  mutateCartProducts: () => void;
  fetchNextPage: () => void;
  fetchProducts: (baseUrl: string, filters: Filters, page: number, location: Location) => Promise<void>;
  fetchCartProducts: (baseUrl: string, availableProducts?: ProductBase[]) => Promise<void>;
  fetchCategories: (baseUrl: string) => Promise<void>;
  processQueryParams: (queryParams: Record<string, string>) => void;
}

// Store de Zustand
type ProductStore = ProductState & ProductActions;

const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export const useProductStore = create<ProductStore>()((set, get) => ({
  // Estado inicial
  products: [],
  cartProducts: [],
  categories: [],
  isLoading: false,
  isLoadingCart: false,
  filters: {},
  currentPage: 1,
  totalPages: 1,
  hasMoreProducts: false,
  minPrice: 0,
  maxPrice: 1000,
  error: null,
  errorStatus: false,
  errorMessage: "",
  isInitialLoad: true,
  isUrlUpdating: false, // Nuevo: para evitar bucles

  // Acciones básicas
  setProducts: (products, totalPages, minPrice, maxPrice) => set({
    products,
    totalPages,
    minPrice: minPrice || 0,
    maxPrice: maxPrice || 1000
  }),

  setCartProducts: (products) => set({
    cartProducts: products
  }),

  setCategories: (categories) => set({
    categories
  }),

  setIsLoading: (isLoading) => set({
    isLoading
  }),

  setIsLoadingCart: (isLoading) => set({
    isLoadingCart: isLoading
  }),

  setError: (error) => set({
    error,
    errorStatus: !!error,
    errorMessage: error?.message === "Not found products!"
      ? "No se han encontrado productos relacionados con los parámetros del filtrado"
      : error?.message || ""
  }),

  setFilters: (filters) => set({
    filters
  }),

  setPage: (page) => set({
    currentPage: page
  }),

  setHasMoreProducts: (hasMore) => set({
    hasMoreProducts: hasMore
  }),

  setInitialLoad: (value) => set({
    isInitialLoad: value
  }),

  setIsUrlUpdating: (value) => set({
    isUrlUpdating: value
  }),

  // Acciones complejas
  mutateCartProducts: async () => {
    const { fetchCartProducts } = get();
    await fetchCartProducts(baseUrl, get().products);
  },

  fetchProducts: async (baseUrl, filters, page, location) => {
    // Solo proceder si no hay una carga en curso
    if (get().isLoading) return;

    const { setIsLoading, setProducts, setError, setHasMoreProducts } = get();

    setIsLoading(true);
    try {
      const queryParams = buildQueryParams(filters, page, 30, location);
      const response = await fetch(`${baseUrl}/public/products?${queryParams}`);

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse?.message || response.statusText);
      }

      const data = await response.json();
      setProducts(
        data.products || [],
        data.totalPages || 1,
        data.minPrice || 0,
        data.maxPrice || 1000
      );

      // Verificar si hay más productos
      const totalItems = data.totalItems || data.products.length || 0;
      setHasMoreProducts(data.products.length < totalItems);

      setError(null);
    } catch (error) {
      setError(error);
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  },

  fetchCartProducts: async (baseUrl, availableProducts = []) => {
    const { setIsLoadingCart, setCartProducts, setError } = get();

    setIsLoadingCart(true);
    try {
      // Obtener IDs del carrito del localStorage
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

      const ids = getCartIds();
      if (!ids.length) {
        setCartProducts([]);
        return;
      }

      const finalProducts: ProductBase[] = [];
      const idsToFetch: string[] = [];

      // Primero buscar en los productos ya cargados
      ids.forEach(id => {
        const foundProduct = availableProducts?.find(product => product.id === id);
        if (foundProduct) {
          finalProducts.push(foundProduct);
        } else {
          idsToFetch.push(id);
        }
      });

      if (!idsToFetch.length) {
        setCartProducts(finalProducts);
        return;
      }

      // Luego buscar los productos restantes en la API
      const promises = idsToFetch.map(id =>
        fetch(`${baseUrl}/public/product-details?id=${id}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const fetchedProducts = await Promise.all(promises);
      const validFetchedProducts = fetchedProducts.filter(Boolean);

      setCartProducts([...finalProducts, ...validFetchedProducts]);
    } catch (error) {
      console.error("Error fetching cart products:", error);
      setError(error);
    } finally {
      setIsLoadingCart(false);
    }
  },

  fetchCategories: async (baseUrl) => {
    try {
      const response = await fetch(`${baseUrl}/public/categories`);
      if (!response.ok) {
        console.error("Error fetching categories");
        return;
      }

      const data = await response.json();
      get().setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },

  processQueryParams: (queryParams) => {
    const { filters: newFilters, page: newPage } = parseQueryToFilters(queryParams);

    // Comparar los filtros actuales con los nuevos para evitar actualizaciones innecesarias
    const currentFilters = get().filters;
    const currentPage = get().currentPage;
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(newFilters);
    const pageChanged = currentPage !== newPage;

    if (filtersChanged) {
      get().setFilters(newFilters);
    }

    if (pageChanged) {
      get().setPage(newPage);
    }

    if (!get().isInitialLoad && (filtersChanged || pageChanged)) {
      get().fetchProducts(baseUrl, newFilters, newPage, get().location || { province: '', municipality: '' });
    } else {
      get().setInitialLoad(false);
    }
  },

  fetchNextPage: () => {
    // Esta función es un placeholder - la implementación real se hace en el hook
  }
}));

// Hook simplificado para inicializar y sincronizar
export function useProductManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { location } = useLocationStore();

  // CORRECCIÓN: Usar selectores individuales para evitar bucles infinitos
  const filters = useProductStore(state => state.filters);
  const currentPage = useProductStore(state => state.currentPage);
  const isInitialLoad = useProductStore(state => state.isInitialLoad);
  const isUrlUpdating = useProductStore(state => state.isUrlUpdating);
  const totalPages = useProductStore(state => state.totalPages);

  // Extraer funciones (no causan rerenderizados)
  const {
    processQueryParams,
    fetchProducts,
    fetchCategories,
    setIsUrlUpdating,
  } = useProductStore();

  // El resto del código permanece igual

  // Obtener parámetros de búsqueda
  const getQueryParams = useCallback(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  // Efecto para procesar los parámetros de URL cuando cambian
  useEffect(() => {
    if (pathname !== "/products" || searchParams.get("modal")) return;
    if (isUrlUpdating) return; // Evitar bucles

    const queryParams = getQueryParams();
    processQueryParams(queryParams);
  }, [pathname, searchParams, getQueryParams, processQueryParams, isUrlUpdating]);

  // Efecto para actualizar la URL cuando cambian los filtros o la página
  useEffect(() => {
    if (isInitialLoad || pathname !== "/products" || isUrlUpdating) return;

    // Marcar que estamos actualizando la URL para evitar bucles
    setIsUrlUpdating(true);

    const queryParams = buildQueryParams(filters, currentPage, 30, location);
    const newUrl = `${pathname}?${queryParams}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (currentUrl !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }

    // Desmarcar después de un breve retraso
    const timer = setTimeout(() => {
      setIsUrlUpdating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [filters, currentPage, pathname, isInitialLoad, router, location, setIsUrlUpdating, isUrlUpdating]);

  // Cargar categorías al inicio
  useEffect(() => {
    fetchCategories(baseUrl);
  }, [fetchCategories]);

  // Función para cargar la siguiente página
  const fetchNextPage = useCallback(() => {
    const currentPageFromUrl = Number(searchParams.get("page")) || 1;
    const newPage = currentPageFromUrl + 1;

    if (newPage <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, totalPages, router, pathname]);

  // Actualizar fetchNextPage sin causar un re-renderizado
  useEffect(() => {
    useProductStore.setState({
      fetchNextPage,
      // Incluir la ubicación actual en el estado para que fetchProducts la utilice
      location
    });
  }, [fetchNextPage, location]);

  return null;
}

// Hook para usar el contexto en componentes (para compatibilidad)
export function useProductContext() {
  // Selector para obtener solo los datos que se usan en el antiguo ProductContext
  return useProductStore(state => ({
    products: state.products,
    cartProducts: state.cartProducts,
    isLoading: state.isLoading,
    categories: state.categories,
    totalPages: state.totalPages,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    error: state.error,
    errorStatus: state.errorStatus,
    errorMessage: state.errorMessage,
    isLoadingCart: state.isLoadingCart,
    mutateCartProducts: state.mutateCartProducts,
    filters: state.filters,
    currentPage: state.currentPage,
    hasMoreProducts: state.hasMoreProducts,
    fetchNextPage: state.fetchNextPage,
  }));
}