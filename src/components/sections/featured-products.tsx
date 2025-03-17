"use client";

import dynamic from "next/dynamic";
import { useIsMobile } from "@hooks/useMobile";
import { CardSkeleton } from "@components/skeletons/card-skeleton";

const ProductCard = dynamic(
  () => import("@/components/cards/product/product-card"),
  {
    loading: () => <CardSkeleton />,
    ssr: false
  }
);

export default function FeaturedProductsClient({ products }: { products: any[] }) {
  const isMobile = useIsMobile();

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 px-2 sm:px-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          prefetch="none"
          imgClassName="object-cover"
          lazyLoad={index >= (isMobile ? 2 : 6)}
        />
      ))}
    </div>
  );
}