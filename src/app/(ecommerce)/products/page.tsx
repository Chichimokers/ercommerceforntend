"use client";

import { FilterPanel } from "@/components/panels/filter-panel";
import { useProductContext } from "@/contexts/product-context";
import { Pagination, Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomButton } from "@components/buttons/custom-button";
import { ShoppingBag, AlertCircle } from "lucide-react";

const ProductCard = dynamic(
  () => import("@/components/cards/product-card"),
  { loading: () => <div className="w-full aspect-[3/4] animate-pulse bg-muted rounded-md" /> }
);

const FilterDrawer = dynamic(
  () => import("@/components/drawers/filter-drawer"),
  { loading: () => <div className="w-full h-12 animate-pulse bg-muted rounded-md" /> }
);

const EmptyState = memo(({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="rounded-full bg-muted p-6 mb-4">
      <ShoppingBag className="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 className="text-2xl font-semibold tracking-tight mb-1">No se encontraron productos</h3>
    <p className="text-muted-foreground mb-6">
      No hay productos disponibles con los filtros seleccionados.
    </p>
    <CustomButton
      onClick={onReset}
      variant="filled"
    >
      Ver todos los productos
    </CustomButton>
  </div>
));

const ErrorState = memo(({ error, onReset }: { error: unknown, onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="rounded-full bg-red-100 p-6 mb-4">
      <AlertCircle className="h-10 w-10 text-red-500" />
    </div>
    <h2 className="text-2xl font-semibold tracking-tight mb-1">
      {error instanceof Error ? error.message : "Ha ocurrido un error"}
    </h2>
    <p className="text-muted-foreground mb-6">
      No se pudieron cargar los productos para esta categoría.
    </p>
    <CustomButton
      onClick={onReset}
      variant="filled"
    >
      Ver todos los productos
    </CustomButton>
  </div>
));

const ProductItem = memo(({ product }: { product: any }) => (
  <div className="w-full">
    <ProductCard
      product={product}
      prefetch="hover"
      className="overflow-hidden relative"
    />
  </div>
));

export default function ProductPage() {
  const { products, totalPages, error, isLoading } = useProductContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  const handleReset = useCallback(() => {
    window.location.href = '/products';
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, isLoading]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }), []);

  const renderContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full justify-items-center">
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 0 && (
          <div className="sticky w-full flex justify-center py-4">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              isCompact
              showControls
              size="lg"
            />
          </div>
        )}
      </>
    );
  }, [isLoading, error, products, totalPages, currentPage, handlePageChange, handleReset]);

  return (
    <div className="mt-16">
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        <FilterPanel />
        <div className="block md:hidden">
          <FilterDrawer className="h-full" />
        </div>
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`products-${currentPage}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}

EmptyState.displayName = "EmptyState";
ErrorState.displayName = "ErrorState";
ProductItem.displayName = "ProductItem";
