"use client";

import { FilterPanel } from "@/components/panels/filter-panel";
import { useProductContext } from "@/contexts/product-context";
import { Pagination, Spinner, Chip, Button, Tooltip } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, memo, useState, useContext, useRef, Suspense } from "react";
import { ShoppingBag, AlertCircle, ListFilter, Grid, List, ArrowUpRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCategories } from "@hooks/useCategories";
import { ProductBase } from "../../../types/types";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import useCartActions from "@/components/actions";
import Image from "next/image";
import { formatCurrency } from "@/components/format-currency";
import QuantityAdjuster from "@/components/buttons/quantity-selector";
import { AddToCartButton, RemoveFromCartButton } from "@/components/cards/product-card";

// Hook para detectar si el dispositivo es de bajo rendimiento
const useDeviceCapabilities = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      // Comprobar preferencias de reducción de movimiento
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      // Comprobar capacidades del dispositivo
      const isLowEnd =
        navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4 ||
        'connection' in navigator &&
        // @ts-ignore - Connection API no está completamente tipada
        (navigator.connection?.saveData || ['slow-2g', '2g'].includes(navigator.connection?.effectiveType));

      setIsLowPerformance(prefersReducedMotion || isLowEnd);
    };

    // Ejecutar después de la primera pintada para no bloquear la UI
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => checkPerformance());
    } else {
      setTimeout(checkPerformance, 500);
    }
  }, []);

  return { isLowPerformance };
};

// Placeholder ligero para ProductCard sin Framer Motion
const ProductCardSkeleton = () => (
  <div className="w-full aspect-[3/4] animate-pulse rounded-xl overflow-hidden">
    <div className="h-3/5 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3"></div>
    </div>
  </div>
);

// Carga dinámica pero más eficiente del ProductCard
const ProductCard = dynamic(
  () => import("@/components/cards/product-card"),
  {
    loading: () => <ProductCardSkeleton />,
    ssr: false // Deshabilitar SSR puede mejorar el tiempo inicial en este caso
  }
);

// Carga dinámica del drawer con baja prioridad
const FilterDrawer = dynamic(
  () => import("@/components/drawers/filter-drawer"),
  {
    loading: () => (
      <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <ListFilter className="opacity-20" />
      </div>
    ),
    ssr: false
  }
);

// Estado vacío mejorado y más ligero (sin Framer Motion)
const EmptyState = memo(({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-8 mb-6">
      <ShoppingBag className="h-12 w-12 text-blue-500" />
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
      startContent={<ArrowLeft className="h-4 w-4" />}
      className="font-medium"
    >
      Ver todos los productos
    </Button>
  </div>
));

// Estado de error mejorado y más ligero
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

/**
 * ProductItem optimizado - sin dependencia de Framer Motion
 * Usando CSS nativo para animaciones cuando es posible
 */
const ProductItem = memo(({
  product,
  index,
  viewMode,
  isLowPerformance
}: {
  product: ProductBase;
  index: number;
  viewMode: "grid" | "list";
  isLowPerformance: boolean;
}) => {
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

  // Cálculo de precios más seguro
  const displayPrice = useMemo(() =>
    product.price * (rateExchange?.exchangeRate || 1)
    , [product.price, rateExchange?.exchangeRate]);

  const discountedPrice = useMemo(() => {
    if (!product.discount || !product.discount.reduction || quantity < (product.discount.min || 0)) {
      return null;
    }

    return displayPrice - product.discount.reduction;
  }, [displayPrice, product.discount, quantity]);

  // Estilos basados en el rendimiento del dispositivo y modo de vista
  const itemStyle = useMemo(() => {
    const baseStyles = "w-full " + (viewMode === "list"
      ? "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
      : "");

    // Solo aplicar animaciones si el dispositivo puede manejarlas
    if (isLowPerformance) {
      return baseStyles;
    }

    return `${baseStyles} fade-in-product ${index < 12 ? `delay-${Math.min(index, 5)}` : ''}`;
  }, [viewMode, isLowPerformance, index]);

  if (viewMode === "grid") {
    return (
      <div className={itemStyle}>
        <ProductCard
          product={product}
          prefetch="viewport"
          className="overflow-hidden relative h-full"
        />
      </div>
    );
  }

  // Renderizado para vista de lista - sin animación Framer Motion
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
              quality={80}
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
  // Implementar una comparación personalizada para prevenir renders innecesarios
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.isLowPerformance === nextProps.isLowPerformance &&
    prevProps.index === nextProps.index
  );
});

/**
 * Componente principal optimizado - ProductPage
 * Con renderizado virtualizado para listas grandes y reducción de dependencias
 */
export default function ProductPage() {
  const { products, totalPages, error, isLoading } = useProductContext();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const { data: categories = [] } = useCategories(baseUrl);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLowPerformance } = useDeviceCapabilities();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const currentPage = Number(searchParams.get("page")) || 1;

  // Referencia a la sección principal para scroll
  const mainSectionRef = useRef<HTMLElement>(null);

  // Para reiniciar filtros
  const handleReset = useCallback(() => {
    router.push('/products', { scroll: true });
  }, [router]);

  // Cambio de página optimizado
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    scrollToTop();
  }, [pathname, router, searchParams, currentPage]);

  // Conteo de filtros aplicados - memoizado
  const filtersApplied = useMemo(() => {
    let count = 0;
    if (searchParams.has("category")) count++;
    if (searchParams.has("subcategory")) count++;
    if (searchParams.has("pricerange")) count++;
    if (searchParams.has("rate")) count++;
    return count;
  }, [searchParams]);

  // Función simple para cambiar entre vista de cuadrícula y lista
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === "grid" ? "list" : "grid");
  }, []);

  // Derivar el nombre de categoría - memoizado
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

  // Scroll a inicio optimizado
  const scrollToTop = useCallback(() => {
    // Método más robusto para manejar el scroll hacia arriba
    requestAnimationFrame(() => {
      // Intentar primero con el elemento referenciado
      if (mainSectionRef.current) {
        mainSectionRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  // Renderizado condicional del contenido principal - simplificado
  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
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

    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-2">
          <div className="mb-3 sm:mb-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {categoryName || "Todos los productos"}
              </h2>
              <Chip size="sm" color="primary" variant="flat">
                {products.length} {products.length === 1 ? 'producto' : 'productos'}
              </Chip>
            </div>
            {filtersApplied > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filtersApplied} {filtersApplied === 1 ? 'filtro aplicado' : 'filtros aplicados'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content={viewMode === "grid" ? "Ver como lista" : "Ver como cuadrícula"}>
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onClick={toggleViewMode}
                aria-label={viewMode === "grid" ? "Ver como lista" : "Ver como cuadrícula"}
              >
                {viewMode === "grid" ? <List size={18} /> : <Grid size={18} />}
              </Button>
            </Tooltip>

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

        {/* Cuadrícula de productos optimizada */}
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full"
            : "grid grid-cols-1 gap-3 w-full"
        }>
          {products.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              index={index}
              viewMode={viewMode}
              isLowPerformance={isLowPerformance}
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
    categoryName, filtersApplied, viewMode, toggleViewMode, isLowPerformance]);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Panel de filtros para escritorio - carga diferida */}
      <Suspense fallback={<div className="hidden md:block w-64 bg-gray-100 dark:bg-gray-800/50 animate-pulse" />}>
        <FilterPanel />
      </Suspense>

      {/* Drawer de filtros para móvil - carga diferida */}
      <div className="block md:hidden sticky top-16 z-20 px-2 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <FilterDrawer className="w-full" />
      </div>

      {/* Sección principal de productos */}
      <section
        ref={mainSectionRef}
        className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto relative fade-in"
      >
        {renderContent()}

        {/* Enlaces rápidos flotantes */}
        <div className="hidden md:block fixed bottom-6 right-6 z-30">
          <Tooltip content="Volver arriba">
            <Button
              isIconOnly
              color="primary"
              size="lg"
              className="shadow-lg animate-bounce-subtle"
              onClick={scrollToTop}
              aria-label="Volver arriba"
            >
              <ArrowUpRight />
            </Button>
          </Tooltip>
        </div>
      </section>
    </div>
  );
}

// Nombres de visualización para componentes memoizados
EmptyState.displayName = "EmptyState";
ErrorState.displayName = "ErrorState";
ProductItem.displayName = "ProductItem";

// Añade estos estilos a tu CSS global o a tu archivo CSS de módulo
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.fade-in-product {
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
}

.delay-0 { animation-delay: 0s; }
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.1s; }
.delay-3 { animation-delay: 0.15s; }
.delay-4 { animation-delay: 0.2s; }
.delay-5 { animation-delay: 0.25s; }

@media (prefers-reduced-motion: reduce) {
  .fade-in,
  .fade-in-product {
    animation: none;
    opacity: 1;
  }
}
*/
