import { categoryIcons } from "../filters/categories";
import { useProductContext } from "@/contexts/product-context";
import { FaTh, FaQuestion } from "react-icons/fa";
import dynamic from "next/dynamic";

// Carga dinámica de componentes
const CategoryCard = dynamic(() => import("@/components/cards/category-cards"));

const CategoryPanel = () => {
  const { categories } = useProductContext();

  const getCategoryIcon = (categoryName: string) => {
    const Icon = categoryIcons[categoryName as keyof typeof categoryIcons];
    return Icon || FaQuestion; // Icono por defecto para categorías desconocidas
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="flex flex-row overflow-x-auto gap-2 snap-x snap-mandatory scrollbar-hide px-2 py-6">
        <div key="all" className="flex-shrink-0 snap-center">
          <CategoryCard
            className="text-xs w-32 md:w-36 h-32 md:h-36 transition-all transition-border group border-2 border-default-400 dark:bg-opacity-0 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
            icon={
              <FaTh className="transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
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
                className="text-xs w-32 md:w-36 h-32 md:h-36 transition-all transition-border group border-2 border-default-400 dark:bg-opacity-0 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400"
                icon={
                  <Icon className="transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
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
