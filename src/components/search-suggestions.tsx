import Link from "next/link";
import { ProductBase } from "../types/types";
import Image from "next/image";

export const SearchSuggestions = ({
  suggestions,
  onSelect,
}: {
  suggestions: ProductBase[];
  onSelect: () => void;
}) => {
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-96 overflow-y-auto">
      <div className="p-2 space-y-2">
        {suggestions.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={onSelect}
          >
            <Image
              src={product.image || '/placeholder-product.jpg'}
              alt={product.name}
              loading="eager"
              priority
              className="w-10 h-10 object-cover rounded-md mr-3"
              width={40}
              height={40}
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {product.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ${product.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 