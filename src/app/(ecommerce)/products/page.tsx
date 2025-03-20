"use client";

import { useProductContext } from "@/contexts/product-context";
import { Pagination, Spinner, Chip, Button, Tooltip } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, memo, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useCategories } from "@hooks/useCategories";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { FaArrowLeft, FaShoppingBag } from "react-icons/fa";
import { AlertCircle } from "lucide-react";
import LucideIcons from "@components/lazy-imports/lucide-icons";
import { useInView } from "react-intersection-observer";
import { throttle } from "lodash";
import UltraLightMode, { UltraLightSkeleton } from '@/components/performance/ultra-light-mode';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

const ProductCard = dynamic(
  () => import("@/components/cards/product/product-card").then(mod => ({ default: mod.default })),
  {
    loading: () => <ProductCardSkeleton />,
  }
);

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

const FilterPanel = dynamic(() =>
  import("@/components/panels/filter-panel")
    .then(mod => ({ default: mod.FilterPanel })),
  {
    ssr: false,
    loading: () => <div className="w-64 bg-gray-100 dark:bg-gray-800/50"></div>
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

const LazyProductCard = memo(({ product, index, totalCount }: { product: any, index: number, totalCount: number }) => {
  // Usar useInView para cargar solo cuando es visible
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
    threshold: 0.1
  });

  // Calcular prioridad - prioridad mayor para los primeros elementos visibles
  const priority = index < 6;

  return (
    <div ref={ref} className="relative w-full transition-opacity duration-300"
      style={{
        height: !inView ? '280px' : 'auto',
        opacity: inView ? 1 : 0,
        minHeight: '280px'
      }}>
      {inView ? (
        <ProductCard
          key={product.id}
          product={product}
          prefetch={priority ? "hover" : "viewport"}
          lazyLoad={!priority}
        />
      ) : (
        <ProductCardSkeleton minimal={index > 12} />
      )}
    </div>
  );
});

LazyProductCard.displayName = 'LazyProductCard';

const ProductCardSkeleton = memo(({ minimal = false }: { minimal?: boolean }) => {
  if (minimal) {
    return (
      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="h-full bg-gray-100 dark:bg-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-3/5 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 animate-pulse"></div>
      </div>
    </div>
  );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

// Componente principal que NO usa useSearchParams directamente
export default function ProductPage() {
  const deviceData = useDeviceDetection();
  const shouldOptimizeSeverely = deviceData.isDataSaver ||
    deviceData.effectiveType === 'slow-2g' ||
    deviceData.effectiveType === '2g' ||
    deviceData.isLowPerformance;

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {!deviceData.isMobile ? (
        <FilterPanel />
      ) : (
        <div className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800/50"></div>
      )}

      {deviceData.isMobile && !shouldOptimizeSeverely && (
        <FilterDrawer />
      )}

      <Suspense fallback={
        <section className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto relative">
          <div className="flex flex-col justify-center items-center min-h-[50vh]">
            <Spinner size={deviceData.isMobile ? "md" : "lg"} color="primary" />
            {!deviceData.isMobile && !deviceData.isLowPerformance && !deviceData.isDataSaver && (
              <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando productos...</p>
            )}
          </div>
        </section>
      }>
        <ProductPageContent deviceData={deviceData} shouldOptimizeSeverely={shouldOptimizeSeverely} />
      </Suspense>
    </div>
  );
}

// Componente secundario que SÍ usa useSearchParams
function ProductPageContent({ deviceData, shouldOptimizeSeverely }: {
  deviceData: ReturnType<typeof useDeviceDetection>,
  shouldOptimizeSeverely: boolean
}) {
  const { products, totalPages, error, isLoading } = useProductContext();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const { data: categories = [] } = useCategories(baseUrl);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado para controlar la cantidad de elementos a mostrar inicialmente
  const [visibleItems, setVisibleItems] = useState(30);
  const currentPage = Number(searchParams.get("page")) || 1;
  const mainSectionRef = useRef<HTMLElement>(null);

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
    // Evitar animaciones en dispositivos de gama baja para ahorrar recursos
    const behavior = deviceData.isLowPerformance ? 'auto' : 'smooth';

    requestAnimationFrame(() => {
      if (mainSectionRef.current) {
        mainSectionRef.current.scrollTo({ top: 0, behavior });
      }

      window.scrollTo({ top: 0, behavior });
    });
  }, [deviceData.isLowPerformance]);

  // Función para cargar más elementos cuando se hace scroll
  const loadMoreItems = useCallback(throttle(() => {
    // Solo cargamos más si no estamos en proceso de carga
    if (!isLoading && products.length > visibleItems) {
      const newVisibleItems = Math.min(visibleItems + (deviceData.isMobile ? 4 : 8), products.length);
      setVisibleItems(newVisibleItems);
    }
  }, 200), [visibleItems, products.length, isLoading, deviceData.isMobile]);

  // Manejar evento de scroll para cargar más elementos
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (mainSectionRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mainSectionRef.current;
        // Si estamos cerca del final, cargamos más
        if (scrollHeight - scrollTop - clientHeight < 600) {
          loadMoreItems();
        }
      }
    }, 100);

    const section = mainSectionRef.current;
    if (section) {
      section.addEventListener('scroll', handleScroll);
      return () => section.removeEventListener('scroll', handleScroll);
    }
  }, [loadMoreItems]);

  const renderContent = useCallback(() => {
    if (isLoading) {
      const { isMobile, isLowPerformance, isDataSaver } = deviceData;
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
          "grid grid-cols-2 xm:grid-cols-3 sm:grid-cols-3 md:grid-cols-2 xg:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full"
        }>
          {products.slice(0, visibleItems).map((product, index) => (
            <LazyProductCard
              key={product.id}
              product={product}
              index={index}
              totalCount={products.length}
            />
          ))}

          {visibleItems < products.length && (
            <div className="col-span-full flex justify-center py-8">
              <Button
                color="primary"
                variant="bordered"
                onClick={() => loadMoreItems()}
                isDisabled={deviceData.isLowPerformance}
                disableAnimation={deviceData.isLowPerformance}
              >
                Cargar más productos
              </Button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="sticky bottom-0 w-full flex justify-center py-6 mt-6 bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              showControls
              size="lg"
              color="primary"
            />
          </div>
        )}
      </>
    );
  }, [isLoading, error, products, totalPages, currentPage, handlePageChange, handleReset,
    categoryName, filtersApplied, deviceData, visibleItems, loadMoreItems]);

  useEffect(() => {
    setVisibleItems(30);
  }, [currentPage, searchParams.toString(), deviceData.isMobile]);

  return (
    <section
      ref={mainSectionRef}
      className={`flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto relative`}
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: deviceData.prefersReducedMotion || deviceData.isLowPerformance ? 'auto' : 'smooth',
        boxShadow: deviceData.isLowPerformance ? 'none' : undefined,
        willChange: 'scroll-position',
        backfaceVisibility: 'hidden'
      }}
    >
      {renderContent()}
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
  );
}

EmptyState.displayName = "EmptyState";
ErrorState.displayName = "ErrorState";
