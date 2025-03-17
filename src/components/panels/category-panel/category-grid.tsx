// src/components/panels/category-panel/category-grid.tsx
import { FaTh } from "react-icons/fa";
import { getCategoryIcon } from "../../filters/categories";
import CategoryCard from "@/components/cards/category-cards";

export interface CategoryGridProps {
  categories: { id: string; name: string }[];
  isMobile?: boolean;
}

export default function CategoryGrid({
  categories,
  isMobile = false,
}: CategoryGridProps) {
  return (
    <div className="flex flex-nowrap gap-3 sm:gap-4 overflow-x-auto">
      {/* Tarjeta "Todos" */}
      <div className="flex-shrink-0">
        <CategoryCard
          className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
          icon={<FaTh size={32} />}
          size="md"
          text="Todos"
          url="/products/"
        />
      </div>

      {/* Listado de categorías */}
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.name);
        const url = `/products?page=1&limit=30&category=${category.id}`;

        return (
          <div
            key={category.id}
            className="flex-shrink-0"
          >
            <CategoryCard
              className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              icon={<Icon size={32} />}
              size={isMobile ? "sm" : "md"}
              text={category.name}
              url={url}
            />
          </div>
        );
      })}
      <div className="flex-shrink-0 w-4 sm:w-6" aria-hidden="true" />
    </div>
  );
}