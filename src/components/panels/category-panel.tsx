import { useProductContext } from "@/contexts/product-context";
import { FaTh } from "react-icons/fa";
import dynamic from "next/dynamic";
import { getCategoryIcon } from "../filters/categories";

// Carga dinámica de componentes
const CategoryCard = dynamic(() => import("@/components/cards/category-cards"));

const CategoryPanel = () => {
  const { categories } = useProductContext();

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/20 to-transparent dark:via-blue-900/10 pointer-events-none" />
      <div className="flex flex-row overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide px-4 py-8">
        <div key="all" className="flex-shrink-0 snap-center">
          <CategoryCard
            className="text-sm w-36 md:w-40 h-36 md:h-40 transition-all duration-300 ease-out group-hover:brightness-100 border-2 border-default-200 hover:border-blue-500/80 dark:border-default-600 dark:hover:border-blue-300 bg-white/90 dark:bg-default-100 backdrop-blur-sm hover:shadow-lg"
            icon={
              <span className="relative text-blue-600/90 dark:text-blue-300/90 transition-transform group-hover:scale-110">
                <FaTh />
                <span className="absolute inset-0 bg-gradient-to-br from-white/30 dark:from-neutral-700/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            }
            size="lg"
            text="Todos"
            url="/products/"
          />
        </div>
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const url = `/products?page=1&limit=30&category=${category.id}`;

          return (
            <div key={category.id} className="flex-shrink-0 snap-center">
              <CategoryCard
                className="text-sm w-36 md:w-40 h-36 md:h-40 transition-all duration-300 ease-out group-hover:brightness-100 border-2 border-default-200 hover:border-blue-500/80 dark:border-default-600 dark:hover:border-blue-300 bg-white/90 dark:bg-default-100 backdrop-blur-sm hover:shadow-lg"
                icon={
                  <span className="relative text-blue-600/90 dark:text-blue-300/90 transition-transform group-hover:scale-110">
                    <Icon />
                    <span className="absolute inset-0 bg-gradient-to-br from-white/30 dark:from-neutral-700/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                }
                size="lg"
                text={category.name}
                url={url}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPanel;
