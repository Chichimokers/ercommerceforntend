import { BoxesIcon } from "lucide-react";
import { getCategoryIcon } from "../../filters/categories";
import CategoryCard from "@/components/cards/category-cards";

export interface CategoryGridProps {
  categories: { id: string; name: string }[];
  onLocationNeeded: () => void;
}

export default function CategoryGrid({
  categories,
  onLocationNeeded,
}: CategoryGridProps) {
  return (
    <div className="flex flex-nowrap gap-3 sm:gap-4 overflow-x-clip p-2">
      <div className="flex-shrink-0">
        <CategoryCard
          className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm"
          icon={<BoxesIcon size={40} />}
          text="Todos"
          url="/products/"
          onLocationNeeded={onLocationNeeded}
        />
      </div>

      {categories.map((category) => {
        const Icon = getCategoryIcon(category.name);
        const url = `/products?page=1&limit=30&category=${category.id}`;

        return (
          <div
            key={category.id}
            className="flex-shrink-0"
          >
            <CategoryCard
              className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm"
              icon={<Icon size={40} />}
              text={category.name}
              url={url}
              onLocationNeeded={onLocationNeeded}
            />
          </div>
        );
      })}
      <div className="flex-shrink-0 w-4 sm:w-6" aria-hidden="true" />
    </div>
  );
}