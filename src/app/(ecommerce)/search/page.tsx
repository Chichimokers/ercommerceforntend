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
            fetch('http://localhost:8080/public/search', {
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Resultados para: {query}
            </h1>

            {loading ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {results.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <p>No se encontraron resultados</p>
            )}
        </div>
    );
} 