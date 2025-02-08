"use client";

import { useEffect, useState } from "react";
import ProductCard from "@components/cards/product-card";
import { useSearchParams } from "next/navigation";
import { ProductBase } from "../../../types/types";

export default function SearchPage() {
  const [results, setResults] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}public/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query })
      })
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Resultados para:
        <span className="ml-2 text-primary-600">{query}</span>
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 xm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="group">
              <div className="h-72 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl" />
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 xm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {results.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto mb-6 text-gray-400 dark:text-gray-500">
            <svg className="w-24 h-24 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No encontramos resultados
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Intenta con términos de búsqueda diferentes
          </p>
        </div>
      )}
    </div>
  );
} 