"use client";

import { useSession } from "next-auth/react";
import { useMemo, memo, Suspense, lazy, useState, useEffect, useCallback, useRef } from "react";
import { useProductContext } from "@/contexts/product-context";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Star, Clock } from "lucide-react";

import HeroSection from "@components/hero-section";

const ProductCard = dynamic(
  () => import("@/components/cards/product-card"),
  {
    loading: () => <ProductCardSkeleton />,
    ssr: false
  }
);

const ProductCardSkeleton = memo(() => (
  <div className="h-[330px] w-full bg-gray-200 dark:bg-gray-600 rounded-3xl animate-pulse" />
));

const SectionSkeleton = memo(({ height = "200px" }: { height?: string }) => (
  <div
    className="w-full bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl"
    style={{ height }}
  />
));

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  priority = false
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  priority?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(priority);
  const ref = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, [priority]);

  if (isMobile) {
    return (
      <section
        ref={ref}
        className={className}
        style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}
      >
        {isVisible ? children : <div style={{ height: 200 }} />}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`
      }}
    >
      {isVisible ? children : <div style={{ height: 200 }} />}
    </section>
  );
};

const SectionHeader = memo(({
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
  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-default-200 dark:border-gray-700 px-4 sm:px-8">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
      {Icon && <Icon className="text-blue-600 dark:text-blue-400" />}
      {title}
    </h2>
    {linkText && linkHref && (
      <Link
        className="mt-4 sm:mt-0 text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline"
        href={linkHref}
      >
        {linkText}
        <ArrowRight className="w-5 h-5" />
      </Link>
    )}
  </div>
));

const CategoryPanel = dynamic(
  () => import("@components/panels/category-panel"),
  {
    loading: () => <SectionSkeleton height="300px" />,
    ssr: false
  }
);

const ReadyToStart = dynamic(
  () => import("@components/ready-to-start"),
  {
    loading: () => <SectionSkeleton height="400px" />,
    ssr: false
  }
);

const VirtualizedProductGrid = memo(({ products }: { products: any[] }) => {
  const isMobile = useIsMobile();
  const itemsPerRow = isMobile ? 2 : window.innerWidth > 1280 ? 6 : window.innerWidth > 768 ? 4 : 3;

  const visibleRows = Math.ceil(products.length / itemsPerRow);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 px-2 sm:px-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          prefetch="none"
          imgClassName="object-cover"
          lazyLoad={index >= itemsPerRow}
        />
      ))}
    </div>
  );
});

const FeaturedProducts = memo(({ products }: { products: any[] }) => {
  if (products.length === 0) return null;

  return (
    <AnimatedSection className="py-12 sm:py-16" priority={true}>
      <SectionHeader
        title="Productos Destacados"
        linkText="Ver todos"
        linkHref="/products"
        icon={Star}
      />
      <VirtualizedProductGrid products={products.slice(0, 8)} />
    </AnimatedSection>
  );
});

const FlashDeals = memo(({ products }: { products: any[] }) => {
  if (products.length === 0) return null;

  return (
    <AnimatedSection className="px-2 sm:px-4 py-12">
      <SectionHeader
        title="Ofertas Flash"
        linkText="Ver todas"
        linkHref="/offers"
        icon={Clock}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex gap-4 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              -{Math.floor(Math.random() * 30) + 10}%
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={product.image || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                width={96}
                height={96}
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">¡Pocas unidades!</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
});

export default function IndexPage() {
  const { products } = useProductContext();
  const { status } = useSession({ required: false });

  const isAuthenticated = status === "authenticated";

  const featuredProducts = useMemo(() =>
    products.slice(0, 8),
    [products]
  );

  const popularProducts = useMemo(() => {
    if (products.length <= 4) return products;

    const selectedIndices = new Set<number>();
    while (selectedIndices.size < 4 && selectedIndices.size < products.length) {
      selectedIndices.add(Math.floor(Math.random() * products.length));
    }

    return Array.from(selectedIndices).map(i => products[i]);
  }, [products]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <HeroSection />

      <Suspense fallback={<SectionSkeleton height="300px" />}>
        <CategoryPanel />
      </Suspense>

      <FeaturedProducts products={featuredProducts} />

      <FlashDeals products={popularProducts} />

      {!isAuthenticated && (
        <Suspense fallback={<SectionSkeleton height="400px" />}>
          <ReadyToStart />
        </Suspense>
      )}
    </div>
  );
}

VirtualizedProductGrid.displayName = 'VirtualizedProductGrid';
FeaturedProducts.displayName = 'FeaturedProducts';
FlashDeals.displayName = 'FlashDeals';
ProductCardSkeleton.displayName = 'ProductCardSkeleton';
SectionSkeleton.displayName = 'SectionSkeleton';
SectionHeader.displayName = 'SectionHeader';
