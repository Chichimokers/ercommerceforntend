"use client";

import { memo } from "react";

function FlashDealsClient({ products }: { products: any[] }) {
  if (products.length === 0) return null;

  return (
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
  );
}

export default FlashDealsClient;