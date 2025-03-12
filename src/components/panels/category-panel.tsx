import { useProductContext } from "@/contexts/product-context";
import { FaTh } from "react-icons/fa";
import { Globe, Package, ShoppingCart, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { getCategoryIcon } from "../filters/categories";
import useSWR from "swr";
import { useDisclosure } from "@heroui/react";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import React from "react";

const LocationModal = dynamic(() => import("@/components/modals/location-modal"), {
  ssr: false,
});

const CategoryCard = dynamic(() => import("@/components/cards/category-cards"), {
  loading: () => (
    <div className="flex-shrink-0 snap-center w-36 md:w-40 h-36 md:h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />
  ),
});

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse?.message || response.statusText);
  }
  return response.json();
};

const CategoryPanel = () => {
  const { categories } = useProductContext();
  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}public/main`;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data, error, isLoading } = useSWR(fetchUrl, fetcher);

  // Función para comprobar si se puede desplazar
  const checkForScrollPosition = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Comprobar el scroll cuando se cambia la ventana o se monta el componente
  useEffect(() => {
    checkForScrollPosition();
    window.addEventListener("resize", checkForScrollPosition);
    return () => {
      window.removeEventListener("resize", checkForScrollPosition);
    };
  }, []);

  // Funciones para desplazar las tarjetas
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    setTimeout(checkForScrollPosition, 500);
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    setTimeout(checkForScrollPosition, 500);
  };

  const handleOpenLocationModal = () => {
    onOpen();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-gray-900/90 dark:via-gray-800 dark:to-gray-800 shadow-inner"
    >
      <LocationModal
        open={isOpen}
        onClose={onClose}
        initialProvince=""
        initialMunicipality=""
      />

      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/30 dark:bg-blue-900/10 blur-3xl"></div>
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-purple-100/20 dark:bg-purple-900/10 blur-3xl"></div>
      </div>

      <div className="py-16 px-6 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Texto y descripción */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Explora nuestras ofertas para Cuba
              </h2>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-lg">
                Nos enfocamos en brindar una amplia gama de productos para las provincias de{" "}
                <span className="font-medium text-blue-700 dark:text-blue-400">Santiago de Cuba</span> y{" "}
                <span className="font-medium text-blue-700 dark:text-blue-400">Villa Clara</span>.
                Próximamente, estaremos expandiéndonos a más regiones y añadiendo nuevas categorías
                para cubrir todas tus necesidades.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleOpenLocationModal}
                  className="inline-flex items-center gap-2 bg-blue-white dark:bg-gray-900/20 shadow-sm hover:shadow-lg border border-default-200 backdrop-blur-3xl text-default-800 font-medium py-2 px-4 rounded-xl transition-all"
                >
                  <MapPin size={18} />
                  Seleccionar ubicación
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
            >
              {/* Productos y Provincias - Fila combinada en móviles pequeños */}
              <div className="flex flex-col xs:hidden gap-3">
                {/* Tarjeta de Productos */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Productos</p>
                      <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {isLoading ? "..." : data?.products ? `+${data.products}` : "+100"}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Provincias */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Provincias</p>
                      <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {isLoading ? "..." : data?.provinces || 2}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjetas individuales para pantallas más grandes */}
              {/* Productos */}
              <div className="hidden xs:block bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Productos</p>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {isLoading ? "..." : data?.products ? `+${data.products}` : "+100"}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Provincias */}
              <div className="hidden xs:block bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Provincias</p>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {isLoading ? "..." : data?.provinces || 2}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Categorías y Expansión - Fila combinada en móviles pequeños */}
              <div className="flex flex-col xs:hidden gap-3">
                {/* Tarjeta de Categorías */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Categorías</p>
                      <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                        {isLoading ? "..." : data?.category || 5}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Tarjeta de Expansión */}
                <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Expansión</p>
                      <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        En progreso
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categorías - para pantallas más grandes */}
              <div className="hidden xs:block bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Categorías</p>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {isLoading ? "..." : data?.category || 5}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Expansión - para pantallas más grandes */}
              <div className="hidden xs:block bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Expansión</p>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      En progreso
                    </h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 pb-8 relative z-10">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative flex overflow-x-auto gap-6 py-4 px-6 pb-12 snap-x snap-mandatory scrollbar-hide items-center justify-center"
        onScroll={checkForScrollPosition}
      >
        <div key="all" className="flex-shrink-0 snap-center">
          <CategoryCard
            className="w-40 h-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl"
            icon={<FaTh size={26} />}
            size="md"
            text="Todos"
            url="/products/"
            onLocationNeeded={handleOpenLocationModal}
          />
        </div>
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
                className="w-40 h-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl"
                icon={React.createElement(Icon, { size: 40 } as React.ComponentProps<typeof Icon>)}
                size="lg"
                text={category.name}
                url={url}
                onLocationNeeded={handleOpenLocationModal}
              />
            </div>
          );
        })}

        {/* Espacio adicional para el último elemento */}
        <div className="flex-shrink-0 w-6" aria-hidden="true" />
      </div>

      {/* Indicador de scroll en dispositivos móviles */}
      <div className="flex justify-center pb-6 md:hidden">
        <div className="flex gap-1">
          <div className={`h-1 w-4 rounded-full ${canScrollLeft ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></div>
          <div className={`h-1 w-4 rounded-full ${canScrollLeft && canScrollRight ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
          <div className={`h-1 w-4 rounded-full ${canScrollRight ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryPanel;
