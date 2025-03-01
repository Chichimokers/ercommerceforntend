"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { banners } from "@/test-data/test-banners";
import { useProductContext } from "@/contexts/product-context";
import { PromisesPanel } from "@/components/panels/promises-panel";
import CategoryPanel from "@/components/panels/category-panel";
import EmptyState from "@components/empty-state";
import { ProductBase } from "@/types/types";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

// Nuevos componentes de diseño
import HeroSection from "@components/hero-section";
import NewsletterSubscription from "@components/newsletter-subscription";
import ReadyToStart from "@components/ready-to-start";

// Carga dinámica de ProductCard con placeholder mientras carga
const ProductCard = dynamic(() => import("@/components/cards/product-card"), {
  loading: () => (
    <div className="h-[330px] w-full bg-gray-200 dark:bg-gray-600 rounded-3xl animate-pulse" />
  ),
});

// Slider publicitario con placeholder
const PublicityBannerSlider = dynamic(
  () => import("@/components/sliders/publicity-banner-slider"),
  {
    loading: () => (
      <div className="h-[300px] bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
    ),
  }
);

export default function IndexPage() {
  const { products } = useProductContext();
  // Seleccionamos los primeros 4 productos destacados, por ejemplo
  const rating_products = useMemo(() => products.slice(0, 4), [products]);

  return (
    <div className="bg-default-50">

      <HeroSection />

      <PromisesPanel />

      <CategoryPanel />

      <LazyFeaturedProducts products={rating_products} />

      <PublicityBannerSlider banners={banners} />

      <ReadyToStart />

    </div>
  );
}

const FeaturedProducts = ({ products }: { products: ProductBase[] }) => {
  const router = useRouter();

  return (
    <div className="px-4 py-20 bg-white dark:bg-gray-800">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-default-200 pb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Productos Destacados
        </h2>
        <button
          className="mt-4 sm:mt-0 text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline transition-colors"
          onClick={() => router.push("/products")}
        >
          Explora nuestros productos
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
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
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-transform transform hover:-translate-y-1">
                Explorar categorías
              </button>
              <button className="px-8 py-3 bg-gray-800 hover:bg-gray-800 text-white rounded-xl transition-transform transform hover:-translate-y-1">
                Ver ofertas
              </button>
            </div>
          </EmptyState>
        )}
      </div>
    </div>
  );
};

const LazyFeaturedProducts = dynamic(
  () => Promise.resolve(FeaturedProducts),
  {
    loading: () => (
      <>
        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-64 mx-4"></div>
        <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </>
    ),
  }
);
