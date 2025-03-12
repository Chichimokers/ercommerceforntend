"use client";

import { useSession } from "next-auth/react";
import { useMemo, memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useProductContext } from "@/contexts/product-context";
import { motion } from "framer-motion";

import HeroSection from "@components/hero-section";
import { PromisesPanel } from "@components/panels/promises-panel";
import ReadyToStart from "@components/ready-to-start";
import { banners } from "@test-data/test-banners";
import { ArrowRight, TrendingUp, Star, Gift, Clock } from "lucide-react";
import EmptyState from "@components/empty-state";
import { ProductBase } from "../../types/types";
import CategoryPanel from "@components/panels/category-panel";
import Link from "next/link";

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

/*const TestimonialsSection = dynamic(
  () => import("@components/sections/testimonials-section"),
  {
    loading: () => <SectionSkeleton height="400px" />,
    ssr: false
  }
);

const FeaturedCategoriesSlider = dynamic(
  () => import("@components/sliders/featured-categories-slider"),
  {
    loading: () => <SectionSkeleton height="200px" />,
    ssr: true
  }
);*/

const ProductCardSkeleton = memo(() => (
  <div className="h-[330px] w-full bg-gray-200 dark:bg-gray-600 rounded-3xl animate-pulse" />
));

const BannerSkeleton = memo(() => (
  <div className="h-[300px] bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
));

const SectionSkeleton = memo(({ height }: { height: string }) => (
  <div
    className="w-full bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl"
    style={{ height }}
  />
));

const AnimatedSection = ({
  children,
  className = "",
  delay = 0.2
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const SectionHeader = ({
  title,
  linkText,
  linkHref,
  icon: Icon
}: {
  title: string;
  linkText?: string;
  linkHref?: string;
  icon?: React.ElementType;
}) => (
  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-default-200 dark:border-gray-700 px-8">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
      {Icon && <Icon className="text-blue-600 dark:text-blue-400" />}
      {title}
    </h2>
    {linkText && linkHref && (
      <Link
        className="mt-4 sm:mt-0 text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline transition-all group"
        href={linkHref}
      >
        {linkText}
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

const FeaturedProducts = memo(({ products }: { products: ProductBase[] }) => (
  <AnimatedSection className="px-4 py-16 sm:py-20 bg-white dark:bg-gray-800/95">
    <div className="container mx-auto">
      <SectionHeader
        title="Productos Destacados"
        linkText="Explora nuestros productos"
        linkHref="/products"
        icon={Star}
      />

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
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                href="/categories"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all hover:-translate-y-1 text-center"
              >
                Explorar categorías
              </Link>
              <Link
                href="/offers"
                className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl transition-all hover:-translate-y-1 text-center"
              >
                Ver ofertas
              </Link>
            </div>
          </EmptyState>
        )}
      </div>
    </div>
  </AnimatedSection>
));

const FlashDeals = memo(({ products }: { products: ProductBase[] }) => (
  <AnimatedSection className="px-4 py-16 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900">
    <div className="container mx-auto">
      <SectionHeader
        title="Ofertas Flash"
        linkText="Ver todas las ofertas"
        linkHref="/offers"
        icon={Clock}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 relative overflow-hidden group"
          >
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{Math.floor(Math.random() * 30) + 10}%
            </div>
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={product.image || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800 dark:text-white line-clamp-2 mb-1">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">${(product.price * 0.85).toFixed(2)}</span>
                <span className="text-gray-400 line-through text-sm">${product.price}</span>
              </div>
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${Math.floor(Math.random() * 70) + 10}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">¡Quedan pocas unidades!</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AnimatedSection>
));

const Newsletter = memo(() => (
  <AnimatedSection className="px-4 py-16 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
    <div className="container mx-auto max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full -translate-x-20 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/20 rounded-full translate-x-10 translate-y-32 blur-3xl"></div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="sm:flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Suscríbete a nuestro newsletter
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Recibe las últimas novedades, ofertas exclusivas y cupones de descuento directamente en tu email.
              </p>

              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all hover:-translate-y-1"
                >
                  Suscribirse
                </button>
              </form>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Al suscribirte aceptas nuestra Política de Privacidad. Puedes darte de baja en cualquier momento.
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="w-40 h-40 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Gift size={80} className="text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AnimatedSection>
));

export default function IndexPage() {
  const { products } = useProductContext();
  const { status } = useSession({ required: false });

  const featuredProducts = useMemo(
    () => products.slice(0, 8),
    [products]
  );

  const isAuthenticated = useMemo(
    () => status === "authenticated",
    [status]
  );

  const popularProducts = useMemo(() => {
    return [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }, [products]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <HeroSection />

      {/*<AnimatedSection delay={0.1}>
        <PromisesPanel />
      </AnimatedSection>*/}

      <AnimatedSection delay={0.2}>
        <Suspense fallback={<SectionSkeleton height="200px" />}>
          <CategoryPanel />
        </Suspense>
      </AnimatedSection>

      <FeaturedProducts products={featuredProducts} />

      <AnimatedSection className="bg-gradient-to-b from-white to-blue-50 dark:from-bg-gray-900 dark:to-gray-900" delay={0.2}>
        <div className="">
          <PublicityBannerSlider banners={banners} />
        </div>
      </AnimatedSection>

      <FlashDeals products={popularProducts} />

      {/* Testimonials - Nueva sección */}
      {/*<AnimatedSection className="py-16 bg-white dark:bg-gray-800" delay={0.3}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Lo que dicen nuestros clientes"
            icon={Star}
          />
          <Suspense fallback={<SectionSkeleton height="300px" />}>
            <TestimonialsSection />
          </Suspense>
        </div>
      </AnimatedSection>*/}

      {!isAuthenticated && (
        <>
          {/*<Newsletter />*/}
          <ReadyToStart />
        </>
      )}
    </div>
  );
}

// Display names para React DevTools
FeaturedProducts.displayName = "FeaturedProducts";
FlashDeals.displayName = "FlashDeals";
Newsletter.displayName = "Newsletter";
ProductCardSkeleton.displayName = "ProductCardSkeleton";
BannerSkeleton.displayName = "BannerSkeleton";
SectionSkeleton.displayName = "SectionSkeleton";
IndexPage.displayName = "IndexPage";
