"use client";

import { useSession } from "next-auth/react";
import { useMemo, memo } from "react";
import dynamic from "next/dynamic";
import { useProductContext } from "@/contexts/product-context";

import HeroSection from "@components/hero-section";
import { PromisesPanel } from "@components/panels/promises-panel";
import ReadyToStart from "@components/ready-to-start";
import { banners } from "@test-data/test-banners";
import { ArrowRight } from "lucide-react";
import EmptyState from "@components/empty-state";
import { ProductBase } from "../../types/types";
import CategoryPanel from "@components/panels/category-panel";

// Lazy-loaded components with optimized loading states
const ProductCard = dynamic(
  () => import("@/components/cards/product-card"),
  {
    loading: () => <ProductCardSkeleton />,
    ssr: false
  }
);

const PublicityBannerSlider = dynamic(
  () => import("@/components/sliders/publicity-banner-slider"),
  {
    loading: () => <BannerSkeleton />,
    ssr: true
  }
);

const ProductCardSkeleton = memo(() => (
  <div className="h-[330px] w-full bg-gray-200 dark:bg-gray-600 rounded-3xl animate-pulse" />
));

const BannerSkeleton = memo(() => (
  <div className="h-[300px] bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
));

const FeaturedProducts = memo(({ products }: { products: any[] }) => (
  <div className="px-4 py-20 bg-white dark:bg-gray-800">
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-default-200 pb-2">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
        Productos Destacados
      </h2>
      <button
        className="mt-4 sm:mt-0 text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline transition-colors"
        onClick={() => window.location.href = "/products"}
      >
        Explora nuestros productos
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
      </button>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          prefetch="viewport"
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
));

export default function IndexPage() {
  const { products } = useProductContext();
  const { status } = useSession({ required: false });

  const featuredProducts = useMemo(
    () => products.slice(0, 4),
    [products]
  );

  const isAuthenticated = useMemo(
    () => status === "authenticated",
    [status]
  );

  return (
    <div className="bg-default-50">
      <HeroSection />

      <PromisesPanel />

      <CategoryPanel />

      <FeaturedProducts products={featuredProducts} />

      <PublicityBannerSlider banners={banners} />

      {!isAuthenticated &&
        <ReadyToStart />
      }

    </div>
  );
}

FeaturedProducts.displayName = "FeaturedProducts";
ProductCardSkeleton.displayName = "ProductCardSkeleton";
BannerSkeleton.displayName = "BannerSkeleton";
IndexPage.displayName = "IndexPage";
