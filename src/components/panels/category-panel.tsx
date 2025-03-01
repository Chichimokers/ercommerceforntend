import { useProductContext } from "@/contexts/product-context";
import { FaTh } from "react-icons/fa";
import { Globe, Package, ShoppingCart, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { getCategoryIcon } from "../filters/categories";
import Link from "next/link";

// Carga dinámica del componente de tarjeta con placeholder mientras carga
const CategoryCard = dynamic(() => import("@/components/cards/category-cards"), {
  loading: () => (
    <div className="flex-shrink-0 snap-center w-36 md:w-40 h-36 md:h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
  ),
});

const CategoryPanel = () => {
  const { categories, products } = useProductContext();

  const totalProducts = products?.length || 0;

  return (
    <div className="relative group">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-6 transition-colors duration-300">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100">
              Explora nuestras ofertas para Cuba
            </h2>
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Nos enfocamos en brindar una amplia gama de productos para las provincias de{" "}
              <strong>Santiago de Cuba</strong> y <strong>Villa Clara</strong>.
              Próximamente, estaremos expandiéndonos a más regiones y añadiendo nuevas categorías
              para cubrir todas tus necesidades. ¡Comienza a explorar ahora!
            </p>
            <Link
              href="/products"
              className="inline-block mt-4 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg transition-transform active:scale-95"
            >
              Ver todos los productos
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="block text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalProducts > 0 ? `+${totalProducts}` : "+100"}
              </span>
              <span className="block text-xs md:text-sm text-gray-700 dark:text-gray-300">
                Productos
              </span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="block text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                2
              </span>
              <span className="block text-xs md:text-sm text-gray-700 dark:text-gray-300">
                Provincias
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="block text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {categories?.length || 5}
              </span>
              <span className="block text-xs md:text-sm text-gray-700 dark:text-gray-300">
                Categorías
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="block text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                Creciendo
              </span>
              <span className="block text-xs md:text-sm text-gray-700 dark:text-gray-300">
                Nuevas ofertas
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          className="w-full h-16 text-white dark:text-gray-800"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            fillOpacity="1"
            d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,192C840,213,960,203,1080,186.7C1200,171,1320,149,1380,138.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Panel de categorías */}
      <div className="relative flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide px-4 py-16 bg-white dark:bg-gray-800">
        {/* Tarjeta "Todos" */}
        <div key="all" className="flex-shrink-0 snap-center animate-fade-in-left">
          <CategoryCard
            className="w-36 md:w-40 h-36 md:h-40 transition-all duration-300 ease-out border-2 border-gray-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400 bg-white/80 dark:bg-gray-800 backdrop-blur-sm hover:shadow-xl"
            icon={
              <span className="relative text-blue-600 dark:text-blue-300 transition-transform duration-300 group-hover:scale-110">
                <FaTh />
                <span className="absolute inset-0 bg-gradient-to-br from-white/30 dark:from-gray-700/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </span>
            }
            size="lg"
            text="Todos"
            url="/products/"
          />
        </div>

        {/* Tarjetas dinámicas para cada categoría */}
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.name);
          const url = `/products?page=1&limit=30&category=${category.id}`;

          return (
            <div
              key={category.id}
              className="flex-shrink-0 snap-center"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CategoryCard
                className="w-36 md:w-40 h-36 md:h-40 transition-all duration-300 ease-out border-2 border-gray-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400 bg-white/80 dark:bg-gray-800 backdrop-blur-sm hover:shadow-xl animate-fade-in-left"
                icon={
                  <span className="relative text-blue-600 dark:text-blue-300 transition-transform duration-300 group-hover:scale-110">
                    <Icon />
                    <span className="absolute inset-0 bg-gradient-to-br from-white/30 dark:from-gray-700/30 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
