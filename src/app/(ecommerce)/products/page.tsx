"use client";

import { FilterPanel } from "@/components/panels/filter-panel";
import { useProductContext } from "@/contexts/product-context";
import { Pagination } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const ProductCard = dynamic(() => import("@/components/cards/product-card"));
const FilterDrawer = dynamic(
  () => import("@/components/drawers/filter-drawer")
);

export default function ProductPage() {
  const { products, totalPages, error, isLoading } = useProductContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        <FilterPanel />
        <div className="block md:hidden">
          <FilterDrawer className="h-full" />
        </div>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto relative"
        >
          {isLoading ? (
            <AnimatePresence mode="sync">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    className="flex-1 max-w-[240px]"
                  >
                    <div className="animate-pulse bg-default-50/80 rounded-3xl border border-default-100">
                      <div className="relative aspect-square w-full bg-default-100 rounded-t-3xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-default-200 to-default-300 animate-pulse rounded-t-3xl" />
                      </div>
                      <div className="p-3 sm:p-4 space-y-4 h-[180]">
                        <div className="h-6 bg-default-200 rounded-full w-3/4" />
                        <div className="h-5 bg-default-200 rounded-full w-1/2" />
                        <div className="h-5 bg-default-200 rounded-full w-1/2" />
                        <div className="flex justify-between items-center gap-2 mt-2">
                          <div className="h-9 bg-default-200 rounded-lg w-3/5" />
                          <div className="h-9 w-16 bg-default-200 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/Empty.svg"
                alt={error}
                width={400}
                height={300}
                className="w-3/4 md:w-1/2 h-[40vh] object-contain"
              />
              <h2 className="text-lg md:text-xl text-default-500 text-center">
                {error}
              </h2>
            </div>
          ) : (
            <motion.div
              key={`products-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full justify-items-center">
                {products.map((product) => (
                  <div key={product.id}>
                    <ProductCard
                      product={product}
                      prefetch="hover"
                      className="overflow-hidden"
                    />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="sticky w-full flex justify-center py-4">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    isCompact
                    showControls
                    size="md"
                  />
                </div>
              )}
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
