"use client";

import React, { useMemo } from 'react';
import { Spinner } from '@heroui/react';
import useSWR from 'swr';
import ProductCard from '@/components/cards/product-card';
import { ProductBase } from '@/types/types';
import { useRelatedProducts } from '@hooks/useRelatedProducts';

interface RelatedProductsProps {
  productId: string;
  category?: string;
  limit?: number;
}

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch related products');
  return res.json();
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  productId,
  category,
  limit = 4
}) => {
  const { relatedProducts, loading, error } = useRelatedProducts(productId);

  const renderProducts = useMemo(() => {
    if (
      !productId ||
      !Array.isArray(relatedProducts) ||
      relatedProducts.length === 0
    ) {
      return [];
    }

    return relatedProducts.filter(
      (product) => product?.id !== productId && Boolean(product)
    );
  }, [relatedProducts, productId]);

  if (!productId) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full py-12 flex justify-center">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        Error loading related products
      </div>
    );
  }

  if (renderProducts.length === 0) {
    return (
      <div className="w-full p-4 text-gray-500 dark:text-gray-400 text-center">
        No related products found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {renderProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default RelatedProducts;