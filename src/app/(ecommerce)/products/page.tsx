"use client";

import { useProductContext } from "@/contexts/product-context";
import { Pagination, Spinner, Chip, Button, Tooltip } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, memo, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useCategories } from "@hooks/useCategories";
import { FaArrowLeft, FaShoppingBag } from "react-icons/fa";
import { AlertCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import LucideIcons from "@components/lazy-imports/lucide-icons";
import { throttle } from "lodash";
import UltraLightMode, { UltraLightSkeleton } from '@/components/performance/ultra-light-mode';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

// Importación dinámica del grid virtualizado para cuando tengamos buena conexión/dispositivo
const VirtualizedProductGrid = dynamic(
  () => import("@/components/product-grid/virtualized-product-grid"),
  {
    loading: () => (
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} minimal />)}
      </div>
    ),
    ssr: false // React-window no funciona con SSR
  }
);

// Importación del componente de control de rendimiento
const PerformanceModeController = dynamic(
  () => import('@/components/performance/performance-mode-controller'),
  { ssr: false }
);

const ProductCard = dynamic(
  () => import("@/components/cards/product/product-card"),
  {
    loading: () => <ProductCardSkeleton />,
  }
);

const FilterDrawer = dynamic(
  () => import("@/components/drawers/filter-drawer"),
  {
    loading: () => (
      <div className="w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
    ),
    ssr: false
  }
);

const FilterPanel = dynamic(() =>
  import("@/components/panels/filter-panel")
    .then(mod => ({ default: mod.FilterPanel })),
  {
    ssr: false,
    loading: () => <div className="w-64 bg-gray-100 dark:bg-gray-800/50"></div>
  }
);

// Define interface for product type
interface Product {
  id: string | number;
  name: string;
  image?: string;
  short_description?: string;
  price: number;
}

// Define props interface for the component
interface UltraLightProductListProps {
  products: Product[];
}

// Componente ultra ligero para dispositivos de muy bajo rendimiento
const UltraLightProductList = memo(({ products }: UltraLightProductListProps) => {
  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="grid grid-cols-1 gap-2">
        {products.slice(0, 15).map(product => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md mr-3 flex-shrink-0">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{product.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {product.short_description?.slice(0, 40)}
              </p>
              <p className="text-sm font-bold mt-1">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {products.length > 15 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          Mostrando 15 de {products.length} productos
        </div>
      )}
    </div>
  );
});

UltraLightProductList.displayName = 'UltraLightProductList';

const EmptyState = memo(({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
    <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-4 mb-4">
      <FaShoppingBag className="h-6 w-6 text-blue-500" />
    </div>
    <h3 className="text-xl font-bold mb-1 text-gray-800 dark:text-gray-100">
      No se encontraron productos
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">
      No hay productos con los filtros seleccionados.
    </p>
    <Button
      onClick={onReset}
      color="primary"
      size="sm"
      startContent={<FaArrowLeft className="h-3 w-3" />}
    >
      Ver todos los productos
    </Button>
  </div>
));

const ErrorState = memo(({ error, onReset }: { error: unknown, onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
    <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-4 mb-4">
      <AlertCircle className="h-6 w-6 text-red-500" />
    </div>
    <h2 className="text-xl font-bold mb-1 text-gray-800 dark:text-gray-100">
      Error al cargar
    </h2>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">
      No se pudieron cargar los productos.
    </p>
    <Button
      onClick={onReset}
      color="primary"
      size="sm"
    >
      Intentar de nuevo
    </Button>
  </div>
));

// Versión optimizada de LazyProductCard para dispositivos normales
const LazyProductCard = memo(({ product, index, totalCount, deviceCapabilities }: {
  product: any,
  index: number,
  totalCount: number,
  deviceCapabilities: any
}) => {
  // Solo usar InView para dispositivos con buen rendimiento
  const shouldOptimizeLoading = !deviceCapabilities.isLowPerformance;
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: shouldOptimizeLoading ? '200px 0px' : '50px 0px',
    threshold: 0.1,
    skip: !shouldOptimizeLoading
  });

  // Para dispositivos de bajo rendimiento, considerar todo como en vista
  const isReallyInView = shouldOptimizeLoading ? inView : true;

  // Prioridad alta solo para los primeros elementos en dispositivos de buen rendimiento
  const priority = index < (deviceCapabilities.isLowPerformance ? 3 : 6);

  // Altura de placeholder ajustada según tipo de dispositivo
  const placeholderHeight = deviceCapabilities.isMobile ?
    (deviceCapabilities.isLowPerformance ? '240px' : '280px') :
    '320px';

  return (
    <div ref={ref} className="relative w-full transition-opacity duration-100"
      style={{
        height: !isReallyInView ? placeholderHeight : 'auto',
        opacity: isReallyInView ? 1 : 0,
        minHeight: placeholderHeight
      }}>
      {isReallyInView ? (
        <ProductCard
          key={product.id}
          product={product}
          prefetch={priority ? "hover" : "none"}
          lazyLoad={!priority}
        />
      ) : (
        <ProductCardSkeleton minimal={index > 6 || deviceCapabilities.isLowPerformance} />
      )}
    </div>
  );
});

LazyProductCard.displayName = 'LazyProductCard';

// Versión ultra simplificada del skeleton para rendimiento óptimo
const ProductCardSkeleton = memo(({ minimal = false }: { minimal?: boolean }) => {
  if (minimal) {
    return (
      <div className="w-full aspect-[3/4] rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"></div>
    );
  }

  return (
    <div className="w-full aspect-[3/4] rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="h-3/5 bg-gray-100 dark:bg-gray-700"></div>
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

interface DeviceCapabilities {
  isLowPerformance: boolean;
  [key: string]: any; // Allow for other properties
}

// Hook for optimizing scroll performance on low-end devices
function useOptimizedScroll(
  ref: React.RefObject<HTMLElement | null>,
  deviceCapabilities: DeviceCapabilities
): void {
  useEffect(() => {
    if (!ref.current || !deviceCapabilities.isLowPerformance) return;

    let scrollTimeoutId: NodeJS.Timeout;
    let lastScrollTime: number = 0;
    const scrollThrottle: number = 100; // ms entre eventos de scroll

    const handleScroll = (): void => {
      const now: number = Date.now();
      if (now - lastScrollTime < scrollThrottle) return;

      lastScrollTime = now;
      document.documentElement.classList.add('is-scrolling');

      clearTimeout(scrollTimeoutId);
      scrollTimeoutId = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 150);
    };

    // We've already checked that ref.current is not null above
    const section = ref.current;
    section.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      section.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeoutId);
    };
  }, [ref, deviceCapabilities.isLowPerformance]);
}

export default function ProductPage() {
  // State y contextos
  const { products, totalPages, error, isLoading, hasMoreProducts, fetchNextPage } = useProductContext();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const { data: categories = [] } = useCategories(baseUrl);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detección avanzada de dispositivos
  const deviceCapabilities = useDeviceCapabilities();
  const mainSectionRef = useRef<HTMLElement>(null);

  // Usar el optimizador de scroll para dispositivos de bajo rendimiento
  useOptimizedScroll(mainSectionRef, deviceCapabilities);

  // Estado para controlar la cantidad de elementos a mostrar inicialmente
  const [visibleItems, setVisibleItems] = useState(deviceCapabilities.isLowPerformance ? 15 : 30);
  const currentPage = Number(searchParams.get("page")) || 1;

  // Determinar si debemos usar el modo ultra ligero
  const shouldUseUltraLightMode = deviceCapabilities.isUltraLowPerformance ||
    deviceCapabilities.effectiveType === 'slow-2g' ||
    deviceCapabilities.isDataSaver;

  // Determinar si debemos usar grid virtualizado en lugar de carga normal
  const shouldUseVirtualizedGrid = !shouldUseUltraLightMode &&
    products.length > 50 &&
    !deviceCapabilities.isUltraLowPerformance;

  const handleReset = useCallback(() => {
    router.push('/products', { scroll: false });
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
    // Comportamiento suave solo para dispositivos de buen rendimiento
    const behavior = deviceCapabilities.prefersReducedMotion || deviceCapabilities.isLowPerformance ? 'auto' : 'smooth';

    if (mainSectionRef.current) {
      mainSectionRef.current.scrollTo({ top: 0, behavior });
    }
  }, [deviceCapabilities.prefersReducedMotion, deviceCapabilities.isLowPerformance]);

  // Función para cargar más elementos cuando se hace scroll - optimizada para bajo rendimiento
  const loadMoreItems = useCallback(throttle(() => {
    if (!isLoading && products.length > visibleItems) {
      // Cargar menos elementos a la vez en dispositivos de bajo rendimiento
      const increment = deviceCapabilities.isLowPerformance ? 4 : (deviceCapabilities.isMobile ? 6 : 12);
      const newVisibleItems = Math.min(visibleItems + increment, products.length);
      setVisibleItems(newVisibleItems);
    }
  }, deviceCapabilities.isLowPerformance ? 300 : 200),
    [visibleItems, products.length, isLoading, deviceCapabilities]);

  // Manejar evento de scroll para cargar más elementos
  useEffect(() => {
    // Solo activar scroll infinito si no usamos grid virtualizado
    if (shouldUseVirtualizedGrid) return;

    // Throttle más intenso para dispositivos de bajo rendimiento
    const handleScroll = throttle(() => {
      if (mainSectionRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mainSectionRef.current;
        const threshold = deviceCapabilities.isLowPerformance ? 300 : 600;

        if (scrollHeight - scrollTop - clientHeight < threshold) {
          loadMoreItems();
        }
      }
    }, deviceCapabilities.isLowPerformance ? 300 : 100);

    const section = mainSectionRef.current;
    if (section) {
      section.addEventListener('scroll', handleScroll, { passive: true });
      return () => section.removeEventListener('scroll', handleScroll);
    }
  }, [loadMoreItems, shouldUseVirtualizedGrid, deviceCapabilities.isLowPerformance]);

  // Reset visibleItems cuando cambia la página o los filtros
  useEffect(() => {
    setVisibleItems(deviceCapabilities.isLowPerformance ? 15 : 30);
  }, [currentPage, searchParams.toString(), deviceCapabilities.isLowPerformance]);

  // Renderizar contenido principal
  const renderContent = useCallback(() => {
    if (isLoading && products.length === 0) {
      // Skeleton más simple para dispositivos de bajo rendimiento
      if (deviceCapabilities.isLowPerformance) {
        return (
          <div className="flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          </div>
        );
      }

      return (
        <div className="flex flex-col justify-center items-center py-12">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando productos...</p>
        </div>
      );
    }

    if (error) {
      return <ErrorState error={error} onReset={handleReset} />;
    }

    if (products.length === 0) {
      return <EmptyState onReset={handleReset} />;
    }

    // Cabecera común para todos los modos
    const header = (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1">
        <div className="mb-2 sm:mb-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {categoryName}
            {filtersApplied > 0 && (
              <span className="ml-2 inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full px-2 py-0.5">
                {filtersApplied}
              </span>
            )}
          </h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </div>
        </div>

        {filtersApplied > 0 && (
          <Button
            variant="light"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    );

    // COMPONENTES ESPECÍFICOS SEGÚN TIPO DE DISPOSITIVO

    // 1. Modo ultra ligero para dispositivos muy lentos
    if (shouldUseUltraLightMode) {
      return (
        <>
          {header}
          <UltraLightProductList products={products} />
        </>
      );
    }

    if (shouldUseVirtualizedGrid) {
      const { screenSize: originalScreenSize, ...restDeviceCapabilities } = deviceCapabilities;
      const deviceInfo = {
        ...restDeviceCapabilities,
        screenSize: (() => {
          if (originalScreenSize === "xs" || originalScreenSize === "sm") return "small";
          if (originalScreenSize === "md") return "medium";
          if (originalScreenSize === "lg") return "large";
          return "desktop"; // xl and 2xl
        })() as "small" | "medium" | "large" | "desktop"
      };

      return (
        <>
          {header}
          <VirtualizedProductGrid
            products={products}
            isLoading={isLoading}
            hasNextPage={hasMoreProducts}
            loadNextPage={fetchNextPage}
            deviceData={deviceInfo}
          />
        </>
      );
    }

    // 3. Grid normal para listas más cortas o dispositivos de rendimiento medio
    return (
      <>
        {header}
        <div className={
          `grid grid-cols-${deviceCapabilities.isLowPerformance ? "2" : "2"} 
           xm:grid-cols-${deviceCapabilities.isLowPerformance ? "2" : "3"}
           sm:grid-cols-${deviceCapabilities.isLowPerformance ? "3" : "3"} 
           md:grid-cols-${deviceCapabilities.isLowPerformance ? "2" : "3"}
           lg:grid-cols-${deviceCapabilities.isLowPerformance ? "3" : "4"}
           xl:grid-cols-${deviceCapabilities.isLowPerformance ? "4" : "5"}
           2xl:grid-cols-${deviceCapabilities.isLowPerformance ? "5" : "6"}
           gap-${deviceCapabilities.isLowPerformance ? "1" : "2"} w-full`
        }>
          {products.slice(0, visibleItems).map((product, index) => (
            <LazyProductCard
              key={product.id}
              product={product}
              index={index}
              totalCount={products.length}
              deviceCapabilities={deviceCapabilities}
            />
          ))}
        </div>

        {/* Botón "Cargar más" y paginación */}
        {visibleItems < products.length && (
          <div className="flex justify-center py-4">
            <Button
              color="primary"
              variant="light"
              size="sm"
              onClick={() => loadMoreItems()}
              className="text-sm"
            >
              Ver más productos
            </Button>
          </div>
        )}
      </>
    );
  }, [
    isLoading, error, products, categoryName, filtersApplied, handleReset,
    visibleItems, loadMoreItems, deviceCapabilities, shouldUseUltraLightMode,
    shouldUseVirtualizedGrid, hasMoreProducts, fetchNextPage
  ]);

  return (
    <>
      {/* Controlador de modo de rendimiento - aplica optimizaciones globales */}
      <PerformanceModeController />

      <div className="flex flex-col md:flex-row w-full min-h-screen">
        {/* Panel de filtros adaptado según dispositivo */}
        {!deviceCapabilities.isMobile ? (
          <FilterPanel />
        ) : (
          <div className="hidden md:block w-64"></div>
        )}

        {/* Drawer de filtros solo para móviles con buen rendimiento */}
        {deviceCapabilities.isMobile && !shouldUseUltraLightMode && (
          <FilterDrawer />
        )}

        <section
          ref={mainSectionRef}
          className={`flex-1 flex flex-col p-2 sm:p-3 overflow-y-auto relative`}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: deviceCapabilities.prefersReducedMotion || deviceCapabilities.isLowPerformance ? 'auto' : 'smooth',
            // Eliminar efectos costosos en dispositivos de baja potencia
            willChange: deviceCapabilities.isLowPerformance ? 'auto' : 'scroll-position',
          }}
        >
          {renderContent()}

          {/* Paginación inferior - simplificada para dispositivos de bajo rendimiento */}
          {totalPages > 1 && !shouldUseVirtualizedGrid && (
            <div className="sticky bottom-0 w-full flex justify-center py-4 mt-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                showControls
                size={deviceCapabilities.isLowPerformance ? "md" : "lg"}
                color="primary"
                className="shadow-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full"
              />
            </div>
          )}

          {/* Botón "Volver arriba" - Solo para desktop */}
          {!deviceCapabilities.isMobile && !deviceCapabilities.isLowPerformance && (
            <div className="hidden md:block fixed bottom-6 right-6 z-30">
              <Tooltip content="Volver arriba">
                <Button
                  isIconOnly
                  color="primary"
                  size="lg"
                  onClick={scrollToTop}
                  aria-label="Volver arriba"
                  className="shadow-md"
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
    </>
  );
}

EmptyState.displayName = "EmptyState";
ErrorState.displayName = "ErrorState";
