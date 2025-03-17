"use client";

import { FilterPanel } from "@/components/panels/filter-panel";
import { useProductContext } from "@/contexts/product-context";
import { Pagination, Spinner, Chip, Button, Tooltip } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, memo, useState, useContext, useRef, Suspense } from "react";
import Link from "next/link";
import { useCategories } from "@hooks/useCategories";
import { ProductBase } from "../../../types/types";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import useCartActions from "@/components/actions";
import Image from "next/image";
import { formatCurrency } from "@/components/format-currency";
import QuantityAdjuster from "@/components/buttons/quantity-selector";
import { AddToCartButton, RemoveFromCartButton } from "@/components/cards/product-card";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { FaArrowLeft, FaShoppingBag } from "react-icons/fa";
import { AlertCircle } from "lucide-react";
import LucideIcons from "@components/lazy-imports/lucide-icons";

// Usando el hook centralizado de detección de dispositivo
// Este es un hook legacy mantenido por compatibilidad
const useDeviceCapabilities = () => {
  const [deviceData, setDeviceData] = useState({
    isLowPerformance: false,
    isMobile: false,
    prefersReducedMotion: false,
    connectionType: 'unknown',
    effectiveType: '4g',
    isDataSaver: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCapabilities = () => {
      // Detección de preferencias de movimiento
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      // Detección de dispositivo móvil
      const isMobile = window.innerWidth < 768 ||
        ('ontouchstart' in window && window.matchMedia?.('(pointer: coarse)').matches);

      // Verificar hardware de bajo rendimiento
      const isLowEnd =
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        ('connection' in navigator && (navigator as any).connection?.saveData) ||
        (typeof window.performance !== 'undefined' &&
          (window.performance as any).memory &&
          (window.performance as any).memory.jsHeapSizeLimit < 2147483648); // < 2GB

      // Información sobre la conexión para optimizaciones adicionales
      let connectionType = 'unknown';
      let effectiveType = '4g';
      let isDataSaver = false;

      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        connectionType = conn?.type || 'unknown';
        effectiveType = conn?.effectiveType || '4g';
        isDataSaver = conn?.saveData || false;
      }

      setDeviceData({
        isLowPerformance: prefersReducedMotion || isLowEnd || isDataSaver || ['slow-2g', '2g'].includes(effectiveType),
        isMobile,
        prefersReducedMotion,
        connectionType,
        effectiveType,
        isDataSaver
      });
    };

    // Verificación inicial
    checkCapabilities();

    // Reaccionar a cambios en el tamaño de la ventana
    const handleResize = () => {
      setDeviceData(prev => ({
        ...prev,
        isMobile: window.innerWidth < 768
      }));
    };

    window.addEventListener('resize', handleResize);

    // Optimizar la ejecución para no bloquear el hilo principal
    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(checkCapabilities);
      return () => {
        cancelIdleCallback(idleId);
        window.removeEventListener('resize', handleResize);
      };
    } else {
      const timeoutId = setTimeout(checkCapabilities, 300);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return deviceData;
};

// Skeleton optimizado con menor complejidad CSS
const ProductCardSkeleton = memo(() => (
  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
    <div className="h-3/5 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 animate-pulse"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 animate-pulse"></div>
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

// ProductCard cargado dinámicamente con opciones de prioridad para mejorar el LCP
const ProductCard = dynamic(
  () => import("@/components/cards/product-card").then(mod => ({ default: mod.default })),
  {
    loading: () => <ProductCardSkeleton />,
    ssr: false
  }
);

// Drawer cargado con prioridad baja para mejorar rendimiento inicial
const FilterDrawer = dynamic(
  () =>
    Promise.all([
      import("@/components/drawers/filter-drawer"),
      new Promise(resolve => setTimeout(resolve, 800))
    ]).then(([module]) => module),
  {
    loading: () => (
      <div className="w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 opacity-20"></div>
      </div>
    ),
    ssr: false
  }
);

const EmptyState = memo(({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-8 mb-6">
      <FaShoppingBag className="h-12 w-12 text-blue-500" />
    </div>
    <h3 className="text-2xl font-bold tracking-tight mb-2 text-gray-800 dark:text-gray-100">
      No se encontraron productos
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
      No hay productos disponibles con los filtros seleccionados.
      Prueba con otros filtros o mira todos nuestros productos.
    </p>
    <Button
      onClick={onReset}
      color="primary"
      size="lg"
      startContent={<FaArrowLeft className="h-4 w-4" />}
      className="font-medium"
    >
      Ver todos los productos
    </Button>
  </div>
));

const ErrorState = memo(({ error, onReset }: { error: unknown, onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-8 mb-6">
      <AlertCircle className="h-12 w-12 text-red-500" />
    </div>
    <h2 className="text-2xl font-bold tracking-tight mb-2 text-gray-800 dark:text-gray-100">
      {error instanceof Error ? error.message : "Ha ocurrido un error"}
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
      No se pudieron cargar los productos.
      Esto puede deberse a problemas de conexión o a un error temporal.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        onClick={onReset}
        color="primary"
        size="lg"
        className="font-medium"
      >
        Intentar de nuevo
      </Button>
      <Button
        as={Link}
        href="/"
        color="default"
        variant="bordered"
        size="lg"
        className="font-medium"
      >
        Volver al inicio
      </Button>
    </div>
  </div>
));

const ProductItem = memo(({
  product,
  index,
  viewMode,
  deviceData
}: {
  product: ProductBase;
  index: number;
  viewMode: "grid" | "list";
  deviceData: {
    isLowPerformance: boolean;
    isMobile: boolean;
    prefersReducedMotion: boolean;
    connectionType: string;
    effectiveType: string;
    isDataSaver: boolean;
  };
}) => {
  const { isLowPerformance, isMobile, isDataSaver } = deviceData;
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const {
    handleQuantityInc,
    handleQuantityDec,
    getLocalStorageData,
    findInCartLocalStorage,
    handleAddToCart,
    handleRemoveFromCart,
    isInCart,
    quantity
  } = useCartActions(product);

  const displayPrice = useMemo(() =>
    product.price * (rateExchange?.exchangeRate || 1)
    , [product.price, rateExchange?.exchangeRate]);

  const discountedPrice = useMemo(() => {
    if (!product.discount || !product.discount.reduction || quantity < (product.discount.min || 0)) {
      return null;
    }

    return displayPrice - product.discount.reduction;
  }, [displayPrice, product.discount, quantity]);

  const itemStyle = useMemo(() => {
    const baseStyles = "w-full " + (viewMode === "list"
      ? "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
      : "");

    if (isLowPerformance || isDataSaver) {
      return baseStyles;
    }

    const shouldAnimate = index < 8;
    return shouldAnimate ? `${baseStyles} fade-in-product delay-${Math.min(index, 3)}` : baseStyles;
  }, [viewMode, isLowPerformance, isDataSaver, index]);

  if (viewMode === "grid") {
    return (
      <div className={itemStyle}>
        <ProductCard
          product={product}
          prefetch={isMobile || isDataSaver ? "none" : "viewport"}
          className="overflow-hidden relative h-full"
        />
      </div>
    );
  }

  return (
    <div className={itemStyle}>
      <Link href={`/products/${product.id}`}>
        <div className="flex flex-row items-stretch p-3">
          <div className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
            <Image
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100px, 128px"
              className="object-cover"
              loading="lazy"
              quality={deviceData.isMobile || deviceData.isLowPerformance ? 30 : 50}
              fetchPriority="high"
              decoding="async"
            />
            {product.quantity < 5 && product.quantity > 1 && (
              <Chip
                className="absolute bottom-1 left-1 text-xs z-10 bg-opacity-80"
                color="danger"
                size="sm"
                variant="solid"
              >
                {product.quantity}u
              </Chip>
            )}
            {product.quantity === 1 && (
              <Chip
                className="absolute bottom-1 left-1 text-xs z-10 bg-opacity-80"
                color="danger"
                size="sm"
                variant="solid"
              >
                ¡Última!
              </Chip>
            )}
            {product.quantity === 0 && (
              <Chip
                className="absolute bottom-1 left-1 text-xs z-10 bg-opacity-80"
                color="danger"
                size="sm"
                variant="solid"
              >
                Agotado
              </Chip>
            )}
          </div>
          <div className="flex-grow flex flex-col justify-between ml-3 py-1">
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white line-clamp-1">
                {product.name}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {product.short_description || "Sin descripción"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(discountedPrice || displayPrice, rateExchange?.currency, rateExchange?.symbol)}
                </span>

                {discountedPrice && (
                  <span className="text-xs">
                    <span className="text-gray-400 line-through">
                      {formatCurrency(displayPrice, rateExchange?.currency, rateExchange?.symbol)}
                    </span>
                  </span>
                )}
                {product.discount && product.quantity >= product.discount.min && (
                  <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                    Ahorro: {formatCurrency(product.discount.reduction * (rateExchange?.exchangeRate || 1),
                      rateExchange?.currency, rateExchange?.symbol)} a partir de {product.discount.min} productos
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center">
                <div onClick={e => e.preventDefault()} className="flex-shrink-0 mr-2">
                  <QuantityAdjuster
                    quantity={quantity}
                    isInCart={isInCart}
                    handleQuantityInc={handleQuantityInc}
                    handleQuantityDec={handleQuantityDec}
                    findInCartLocalStorage={findInCartLocalStorage}
                    getLocalStorageData={getLocalStorageData}
                    productId={product.id}
                    maxLimit={product.quantity || 0}
                    className="bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
                  />
                </div>

                <div onClick={e => e.preventDefault()}>
                  {isInCart ? (
                    <RemoveFromCartButton
                      onClick={(e) => {
                        handleRemoveFromCart();
                        e.preventDefault();
                      }}
                      product={product}
                    />
                  ) : (
                    <AddToCartButton
                      onClick={(e) => {
                        handleAddToCart();
                        e.preventDefault();
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.deviceData.isLowPerformance === nextProps.deviceData.isLowPerformance &&
    prevProps.index === nextProps.index
  );
});

export default function ProductPage() {
  const { products, totalPages, error, isLoading } = useProductContext();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const { data: categories = [] } = useCategories(baseUrl);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const deviceData = useDeviceDetection();
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('productViewMode') as "grid" | "list" || "grid";
      return deviceData.isMobile ? "grid" : savedMode;
    }
    return "grid";
  });

  const currentPage = Number(searchParams.get("page")) || 1;

  // Guardar preferencia de vista en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !deviceData.isMobile) {
      localStorage.setItem('productViewMode', viewMode);
    }
  }, [viewMode, deviceData.isMobile]);

  const mainSectionRef = useRef<HTMLElement>(null);

  const handleReset = useCallback(() => {
    router.push('/products', { scroll: true });
  }, [router]);

  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    scrollToTop();
  }, [pathname, router, searchParams, currentPage]);

  const filtersApplied = useMemo(() => {
    let count = 0;
    if (searchParams.has("category")) count++;
    if (searchParams.has("subcategory")) count++;
    if (searchParams.has("pricerange")) count++;
    if (searchParams.has("rate")) count++;
    return count;
  }, [searchParams]);

  // Optimizar cambio de vista para reducir trabajo de renderizado
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const newMode = prev === "grid" ? "list" : "grid";
      if (typeof window !== 'undefined') {
        localStorage.setItem('productViewMode', newMode);
      }
      return newMode;
    });
  }, []);
  const categoryName = useMemo(() => {
    const categoryId = searchParams.get("category");
    if (!categoryId || !categories || categories.length === 0) return "Todos los productos";

    if (categoryId.includes(",")) {
      return "Múltiples categorías";
    }

    const category = categories.find((cat: any) => cat &&
      String(cat.id) === String(categoryId));

    return category?.name || "Todos los productos";
  }, [searchParams, categories]);

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      if (mainSectionRef.current) {
        mainSectionRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  const renderContent = useCallback(() => {
    if (isLoading) {
      const { isMobile, isLowPerformance, isDataSaver } = deviceData;
      // Optimizar la carga para dispositivos móviles o de bajo rendimiento
      const loadingText = isMobile || isLowPerformance || isDataSaver ? null :
        <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando productos...</p>;

      return (
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
          <Spinner size={isMobile ? "md" : "lg"} color="primary" />
          {loadingText}
        </div>
      );
    }

    if (error) {
      return <ErrorState error={error} onReset={handleReset} />;
    }

    if (products.length === 0) {
      return <EmptyState onReset={handleReset} />;
    }

    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2">
          <div className="mb-3 sm:mb-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {categoryName || "Todos los productos"}
                {filtersApplied > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full px-2 py-0.5">
                    {filtersApplied}
                  </span>
                )}
              </h2>
              <Chip size="sm" color="primary" variant="flat">
                {products.length} {products.length === 1 ? 'producto' : 'productos'}
              </Chip>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!deviceData.isMobile && (
              <Tooltip content={viewMode === "grid" ? "Ver como lista" : "Ver como cuadrícula"}>
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  onClick={toggleViewMode}
                  aria-label={viewMode === "grid" ? "Ver como lista" : "Ver como cuadrícula"}
                >
                  {typeof window !== 'undefined' ? (
                    viewMode === "grid" ?
                      <span className="flex items-center justify-center w-5 h-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <line x1="3" y1="12" x2="21" y2="12" />
                          <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                      </span> :
                      <span className="flex items-center justify-center w-5 h-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      </span>
                  ) : (
                    <span className="w-5 h-5" />
                  )}
                </Button>
              </Tooltip>
            )}

            {filtersApplied > 0 && (
              <Button
                variant="light"
                size="sm"
                onClick={handleReset}
                className="text-sm"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        <div className={
          viewMode === "grid"
            ? "grid grid-cols-2 xm:grid-cols-3 sm:grid-cols-3 md:grid-cols-2 xg:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full"
            : "grid grid-cols-1 gap-3 w-full"
        }>
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              index={index}
              viewMode={viewMode}
              deviceData={deviceData}
            />
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 0 && (
          <div className="sticky bottom-0 w-full flex justify-center py-6 mt-6 bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              showControls
              size="lg"
              color="primary"
              className="shadow-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full"
            />
          </div>
        )}
      </>
    );
  }, [isLoading, error, products, totalPages, currentPage, handlePageChange, handleReset,
    categoryName, filtersApplied, viewMode, toggleViewMode, deviceData]);

  // Determinar si debemos aplicar optimizaciones agresivas basadas en conexión o rendimiento
  const shouldOptimizeSeverely = deviceData.isDataSaver ||
    deviceData.effectiveType === 'slow-2g' ||
    deviceData.effectiveType === '2g';

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Solo cargar FilterPanel en desktop cuando no sea una conexión muy lenta */}
      {!deviceData.isMobile && !shouldOptimizeSeverely ? (
        <Suspense fallback={<div className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800/50" />}>
          <FilterPanel />
        </Suspense>
      ) : (
        <div className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800/50"></div>
      )}

      {/* Solo mostrar drawer en móvil si no es una conexión muy lenta */}
      {deviceData.isMobile && !shouldOptimizeSeverely && (
        <FilterDrawer />
      )}

      <section
        ref={mainSectionRef}
        className={`flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto relative ${deviceData.isLowPerformance ? '' : 'fade-in'}`}
        style={{
          // Configuración CSS para mejorar el rendimiento de scroll en dispositivos móviles
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: deviceData.prefersReducedMotion ? 'auto' : 'smooth'
        }}
      >
        {renderContent()}

        {/* Solo mostrar botón de scroll en desktop y sin animación en dispositivos de bajo rendimiento */}
        {!deviceData.isMobile && (
          <div className="hidden md:block fixed bottom-6 right-6 z-30">
            <Tooltip content="Volver arriba">
              <Button
                isIconOnly
                color="primary"
                size="lg"
                className={`shadow-md ${!deviceData.isLowPerformance && !deviceData.prefersReducedMotion ? 'animate-bounce-subtle' : ''}`}
                onClick={scrollToTop}
                aria-label="Volver arriba"
              >
                {typeof LucideIcons !== 'undefined' ? (
                  <LucideIcons.ArrowUpRight />
                ) : (
                  <span className="w-5 h-5" />
                )}
              </Button>
            </Tooltip>
          </div>
        )}
      </section>
    </div>
  );
}

EmptyState.displayName = "EmptyState";
ErrorState.displayName = "ErrorState";
ProductItem.displayName = "ProductItem";
