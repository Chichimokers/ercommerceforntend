"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { banners } from "@/test-data/test-banners";
import { useProductContext } from "@/contexts/product-context";
import { PromisesPanel } from "@/components/panels/promises-panel";
import CategoryPanel from "@/components/panels/category-panel";
import EmptyState from "@components/empty-state";
import { ProductBase } from "../../types/types";

const ProductCard = dynamic(() => import("@/components/cards/product-card"));
const PublicityBannerSlider = dynamic(
  () => import("@/components/sliders/publicity-banner-slider"),
  { loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded-lg" /> }
);

const SecondaryBannerSlider = dynamic(
  () => import("@/components/sliders/publicity-banner-slider"),
  { ssr: false }
);

export default function IndexPage() {
  const { products } = useProductContext();
  const rating_products = useMemo(() => products.slice(0, 4), [products]);

  return (
    <div>
      <div className="flex-1">
        <PublicityBannerSlider banners={banners} />
        <div className="my-4">
          <CategoryPanel />
        </div>
        <PromisesPanel />
      </div>
      <LazyFeaturedProducts products={rating_products} />
      <div className="mb-4 mx-2">
        <SecondaryBannerSlider
          className="rounded-lg"
          banners={banners}
        />
      </div>
    </div>
  );
}

const FeaturedProducts = ({ products }: { products: ProductBase[] }) => (
  <div className="mb-4 mx-2">
    <h2 className="text-2xl font-bold mb-4 text-center">Productos Destacados</h2>
    <div className="grid grid-cols-2 gap-2 justify-items-center xm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {products.length === 0 && (
        <EmptyState
          message="No hay productos destacados"
          className="col-span-full"
          iconSize={64}
        >
          <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Recargar
          </button>
        </EmptyState>
      )}
    </div>
  </div>
);

const LazyFeaturedProducts = dynamic(
  () => Promise.resolve(FeaturedProducts),
  { loading: () => <div className="h-96 animate-pulse bg-gray-50" /> }
);
