"use client";

import { FilterPanel } from "@/components/panels/filter-panel";
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

export default function ProductPage() {
  const { products, totalPages, error, isLoading } = useProductContext();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const { data: categories = [] } = useCategories(baseUrl);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const deviceData = useDeviceDetection();

  const currentPage = Number(searchParams.get("page")) || 1;

  const [isReturningFromProductDetail, setIsReturningFromProductDetail] = useState(false);
  const mainSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScrollPosition = sessionStorage.getItem("productListScrollPosition");
      const savedPath = sessionStorage.getItem("productListPath");
      const currentPath = pathname + searchParams.toString();
      const isSamePath = savedPath === currentPath;

      if (savedScrollPosition && isSamePath) {
        requestAnimationFrame(() => {
          setIsReturningFromProductDetail(true);
          if (mainSectionRef.current) {
            mainSectionRef.current.scrollTop = parseInt(savedScrollPosition, 10);
            window.scrollTo(0, parseInt(savedScrollPosition, 10));
          }
        });
      }
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleProductClick = () => {
      if (mainSectionRef.current) {
        sessionStorage.setItem("productListScrollPosition",
          String(mainSectionRef.current.scrollTop || window.scrollY));
        sessionStorage.setItem("productListPath",
          pathname + searchParams.toString());
      }
    };

    const productLinks = document.querySelectorAll('a[href^="/products/"]');
    productLinks.forEach(link => {
      link.addEventListener('click', handleProductClick);
    });

    return () => {
      productLinks.forEach(link => {
        link.removeEventListener('click', handleProductClick);
      });
    };
  }, [pathname, searchParams, products]);

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
    if (isReturningFromProductDetail) {
      setIsReturningFromProductDetail(false);
      return;
    }

    requestAnimationFrame(() => {
      if (mainSectionRef.current) {
        mainSectionRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [isReturningFromProductDetail]);

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
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              prefetch="viewport"
              lazyLoad={true}
            />
          ))}
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
              className="shadow-sm bg-white dark:bg-gray-800 px-2 py-1 rounded-full"
            />
          </div>
        )}
      </>
    );
  }, [isLoading, error, products, totalPages, currentPage, handlePageChange, handleReset,
    categoryName, filtersApplied, deviceData]);

  const shouldOptimizeSeverely = deviceData.isDataSaver ||
    deviceData.effectiveType === 'slow-2g' ||
    deviceData.effectiveType === '2g';

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {!deviceData.isMobile && !shouldOptimizeSeverely ? (
        <Suspense fallback={<div className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800/50" />}>
          <FilterPanel />
        </Suspense>
      ) : (
        <div className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800/50"></div>
      )}

      {deviceData.isMobile && !shouldOptimizeSeverely && (
        <FilterDrawer />
      )}

      <section
        ref={mainSectionRef}
        className={`flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto relative ${deviceData.isLowPerformance ? '' : 'fade-in'}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: deviceData.prefersReducedMotion ? 'auto' : 'smooth'
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
    </div>
  );
}

EmptyState.displayName = "EmptyState";
ErrorState.displayName = "ErrorState";
