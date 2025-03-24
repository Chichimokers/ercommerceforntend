// src/app/(ecommerce)/client-components/product-provider.tsx
"use client";

import { ReactNode, useMemo } from "react";
import { useProductContext } from "@contexts/product-context";
import { Star } from "lucide-react";
import SectionHeader from "@components/sections/section-header";
import FeaturedProductsClient from "@components/sections/featured-products";
//import FlashDealsClient from "@components/sections/flash-deals";

interface ProductProviderProps {
  children: ReactNode;
}

export default function ProductProvider({ children }: ProductProviderProps) {
  const { products } = useProductContext();

  const featuredProducts = useMemo(() =>
    products.slice(0, 8),
    [products]
  );

  return (
    <>
      {children}

      <section className="py-12 sm:py-16">
        <SectionHeader
          title="Productos Destacados"
          linkText="Ver todos"
          linkHref="/products"
          icon={Star}
        />
        <FeaturedProductsClient products={featuredProducts} />
      </section>

      {/*<section className="px-2 sm:px-4 py-12">
        <SectionHeader
          title="Ofertas Flash"
          linkText="Ver todas"
          linkHref="/offers"
          icon={Clock}
        />
        <FlashDealsClient products={popularProducts} />
      </section>*/}
    </>
  );
}