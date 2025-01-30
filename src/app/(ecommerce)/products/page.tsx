"use client";

import LoadingModal from "@/components/modals/loading-modal";
import { FilterPanel } from "@/components/panels/filter-panel";
import { useProductContext } from "@/contexts/product-context";
import { Pagination } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const ProductCard = dynamic(() => import("@/components/cards/product-card"));
const FilterDrawer = dynamic(
  () => import("@/components/drawers/filter-drawer")
);

export default function ProductPage() {
  const { products, totalPages, errorStatus, errorMessage, isLoading } =
    useProductContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado local sincronizado con la URL
  const [currentPage, setCurrentPage] = useState(() => {
    return Number(searchParams.get("page")) || 1;
  });

  // Sincronización con cambios en la URL
  useEffect(() => {
    const page = Number(searchParams.get("page")) || 1;
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [searchParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());

      // Usar replace para evitar historial de navegación infinito
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });

      // Actualización optimista del estado
      setCurrentPage(page);
    },
    [pathname, router, searchParams]
  );

  return (
    <div>
      {isLoading && <LoadingModal isOpen={true} />}

      <div className="flex flex-col md:flex-row w-full min-h-screen">
        <FilterPanel />
        <div className="block md:hidden">
          <FilterDrawer className="h-full" />
        </div>
        <section className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto relative">
          {errorStatus ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <img
                  src="Empty.svg"
                  alt={errorMessage}
                  className="w-full xs:w-3/4 sm:w-2/3 md:w-1/2 h-[30vh] xs:h-[35vh] md:h-[40vh] object-contain transition-all duration-300"
                />
                <h2 className="text-lg xs:text-xl md:text-2xl text-default-500 font-medium text-center">
                  {errorMessage}
                </h2>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 xm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-2 sm:gap-2 w-full justify-items-center">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages && totalPages > 1 && (
                <div className="sticky w-full flex justify-center py-4">
                  <Pagination
                    total={totalPages}
                    initialPage={currentPage}
                    page={currentPage}
                    onChange={handlePageChange}
                    isCompact
                    showControls
                    size="md"
                    showShadow
                    key={`pagination-${currentPage}`} // Key única para resetear el componente
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
