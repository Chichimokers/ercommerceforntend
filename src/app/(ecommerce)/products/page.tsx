"use client";

import { FilterPanel } from "@/components/panels/filter-panel";
import { useProductContext } from "@/contexts/product-context";
import { Pagination, Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const ProductCard = dynamic(() => import("@/components/cards/product-card").then(mod => ({
  default: mod.default,
  loading: () => <div className="h-80 w-full bg-default-100 rounded-xl" />
})), { ssr: false });
const FilterDrawer = dynamic(
  () => import("@/components/drawers/filter-drawer"),
  {
    ssr: false,
    loading: () => <Spinner className="p-4" />
  }
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="bg-default-100 rounded-xl h-80"
                >
                  <div className="h-48 bg-gradient-to-r from-default-200 to-default-100 animate-shimmer rounded-t-xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-default-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-default-200 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-default-200 rounded w-1/3 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 w-full justify-items-center">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    prefetch="hover"
                  />
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
            </>
          )}
        </motion.section>
      </div>
    </div>
  );
}
