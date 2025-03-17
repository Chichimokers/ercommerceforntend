import Link from "next/link";
import { ProductBase } from "../types/types";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Componente que muestra sugerencias de búsqueda
 * @param suggestions - Lista de productos sugeridos
 * @param onSelect - Función que maneja la selección de una sugerencia
 * @param searchTerm - Término de búsqueda actual del usuario
 */
export const SearchSuggestions = ({
  suggestions,
  onSelect,
  searchTerm,
}: {
  suggestions: ProductBase[];
  onSelect: (term: string) => void;
  searchTerm: string;
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  // Si no hay sugerencias y hay un término de búsqueda válido, mostramos un mensaje
  if (suggestions.length === 0) {
    if (searchTerm && searchTerm.length >= 3) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron resultados para "{searchTerm}"
            </p>
            <Link
              href={`/search?q=${encodeURIComponent(searchTerm)}`}
              className="mt-2 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => onSelect(searchTerm)}
            >
              Buscar en todos los productos →
            </Link>
          </div>
        </motion.div>
      );
    }
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden max-h-[400px] overflow-y-auto"
    >
      <h3 className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
        Sugerencias ({suggestions.length})
      </h3>

      <motion.div
        className="p-2 space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {suggestions.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="overflow-hidden"
          >
            <Link
              href={`/products/${product.id}`}
              className="flex items-center p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => onSelect(product.name)}
            >
              <div className="relative w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md flex-shrink-0 overflow-hidden mr-3">
                <Image
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  loading="eager"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {product.name}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    ${product.price}
                  </p>
                  {product.quantity > 0 ? (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                      En stock
                    </span>
                  ) : (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded-full">
                      Agotado
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {suggestions.length >= 3 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={`/search?q=${encodeURIComponent(searchTerm)}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => onSelect(searchTerm)}
          >
            Ver todos los resultados para "{searchTerm}" →
          </Link>
        </div>
      )}
    </motion.div>
  );
};