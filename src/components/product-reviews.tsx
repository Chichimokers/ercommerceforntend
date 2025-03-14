"use client";

import React from 'react';
import useSWR from 'swr';
import ReviewSection from './review-section';

interface ProductReviewsProps {
  productId: string;
}

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch review data');
  return res.json();
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { data, error, isLoading } = useSWR(
    `/api/reviews/summary?productId=${productId}`,
    fetcher
  );

  if (isLoading) {
    return <div className="p-8 text-center">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        Error loading reviews
      </div>
    );
  }

  return (
    <ReviewSection
      productId={productId}
      initialReviews={data.reviews}
      averageRating={data.averageRating}
      reviewCount={data.total}
    />
  );
};

export default ProductReviews;