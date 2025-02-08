"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { banners } from "@/test-data/test-banners";
import { useProductContext } from "@/contexts/product-context";
import { PromisesPanel } from "@/components/panels/promises-panel";
import CategoryPanel from "@/components/panels/category-panel";
import EmptyState from "@components/empty-state";
import { ProductBase } from "../../types/types";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
      <div className="flex-1 space-y-6 mx-auto mb-8">
        <PublicityBannerSlider banners={banners} />
        <CategoryPanel />
        <PromisesPanel />
        <div className="mx-4">
          <LazyFeaturedProducts products={rating_products} />
        </div>

        <SecondaryBannerSlider
          className="rounded-xl border-4 border-default-50/50 shadow-lg"
          banners={banners}
        />
      </div>
    </div>
  );
}

const FeaturedProducts = ({ products }: { products: ProductBase[] }) => {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 pb-2 border-b-4 border-blue-100 w-max">
          Tesoros de Es Aki
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 xm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden"
            imgClassName="group-hover:brightness-110 transition-all duration-300"
          />
        ))}
        {products.length === 0 && (
          <EmptyState
            message="Descubre nuestros productos destacados"
            className="col-span-full py-12"
            iconSize={80}
          >
            <div className="flex gap-4 mt-6">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all transform hover:-translate-y-1">
                Explorar categorías
              </button>
              <button className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all transform hover:-translate-y-1">
                Ver ofertas
              </button>
            </div>
          </EmptyState>
        )}
      </div>
      <div className="mt-8 text-center justify-items-center w-full">
        <button
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-300 flex items-center gap-2 mx-auto group"
          onClick={() => router.push('/products')}
        >
          Explora el Universo Es Aki
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
};

const LazyFeaturedProducts = dynamic(
  () => Promise.resolve(FeaturedProducts),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-white rounded-xl shadow-sm">
        <div className="h-8 bg-gray-100 rounded w-64 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }
);
