import { useProductContext } from "@/contexts/product-context";
import { FaTh } from "react-icons/fa";
import { Globe, Package, ShoppingCart, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { getCategoryIcon } from "../filters/categories";
import useSWR from "swr";
import { useDisclosure } from "@heroui/react";
import { useRef, useState, useEffect, useMemo } from "react";
import React from "react";
import debounce from "lodash.debounce";

// Cargar componentes bajo demanda
const LocationModal = dynamic(() => import("@/components/modals/location-modal"), {
  ssr: false,
});

// Optimización del placeholder para reducir pintura
const CategoryCard = dynamic(() => import("@/components/cards/category-cards"), {
  loading: () => (
    <div className="flex-shrink-0 snap-center w-36 md:w-40 h-36 md:h-40 bg-gray-100 dark:bg-gray-800 rounded-xl opacity-60" />
  ),
});

// Fetcher optimizado con caché y manejo de errores
const fetcher = async (url: string) => {
  try {
    const cachedData = sessionStorage.getItem(url);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    sessionStorage.setItem(url, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const CategoryPanel = () => {
  const { categories } = useProductContext();
  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}public/main`;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [shouldCenterItems, setShouldCenterItems] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Optimizar SWR con opciones de caché
  const { data, error, isLoading } = useSWR(fetchUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutos
    focusThrottleInterval: 10000,
  });

  // Función optimizada para comprobar scroll con debounce
  const checkForScrollPosition = useMemo(
    () => debounce(() => {
      if (!scrollRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Calcular si las tarjetas deben centrarse
      const totalCategoriesWidth = (categories.length + 1) * (isMobile ? 136 : 160); // ancho de tarjeta + gap
      setShouldCenterItems(clientWidth >= totalCategoriesWidth);
    }, 100),
    [categories.length, isMobile]
  );

  // Usar ResizeObserver en lugar de listeners de eventos
  useEffect(() => {
    const checkForMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkForMobile();

    const resizeObserver = new ResizeObserver(() => {
      checkForMobile();
      checkForScrollPosition();
    });

    if (scrollRef.current) {
      resizeObserver.observe(scrollRef.current);
    }

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkForScrollPosition]);

  // Optimizar funciones de scroll
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleOpenLocationModal = () => {
    onOpen();
  };

  // Optimizar para menos rerender
  const statsData = useMemo(() => ({
    products: isLoading ? "..." : data?.products ? `+${data.products}` : "+100",
    provinces: isLoading ? "..." : data?.provinces || 2,
    categories: isLoading ? "..." : data?.category || 5,
  }), [isLoading, data]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
    >
      <LocationModal
        open={isOpen}
        onClose={onClose}
        initialProvince=""
        initialMunicipality=""
      />

      {/* Fondo optimizado - menos blur y elementos */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/20 dark:bg-blue-900/5"
          style={{ willChange: "transform", transform: "translateZ(0)" }}
        />
        <div
          className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-purple-100/10 dark:bg-purple-900/5"
          style={{ willChange: "transform", transform: "translateZ(0)" }}
        />
      </div>

      <div className="py-12 px-6 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Texto y descripción - animaciones simplificadas para móvil */}
            <div
              className={`space-y-6 ${isMobile ? "" : "motion-safe:animate-fadeInLeft"}`}
              style={isMobile ? {} : { animationDelay: "200ms", animationDuration: "500ms" }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Explora nuestras ofertas para Cuba
              </h2>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-lg">
                Nos enfocamos en brindar una amplia gama de productos para las provincias de{" "}
                <span className="font-medium text-blue-700 dark:text-blue-400">Santiago de Cuba</span> y{" "}
                <span className="font-medium text-blue-700 dark:text-blue-400">Villa Clara</span>.
                Próximamente, estaremos expandiéndonos a más regiones y añadiendo nuevas categorías.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleOpenLocationModal}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm hover:shadow border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-xl transition-shadow"
                >
                  <MapPin size={18} />
                  Seleccionar ubicación
                </button>
              </div>
            </div>

            <div
              className={`grid grid-cols-2 gap-2 sm:gap-4 ${isMobile ? "" : "motion-safe:animate-fadeInUp"}`}
              style={isMobile ? {} : { animationDelay: "400ms", animationDuration: "500ms" }}
            >
              {/* Versión para pantallas pequeñas - 2x2 grid con tarjetas más pequeñas */}
              <div className="sm:hidden">
                <StatsCard
                  icon={<ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                  label="Productos"
                  value={statsData.products}
                  colorClass={colorVariants.blue}
                />
              </div>
              <div className="sm:hidden">
                <StatsCard
                  icon={<MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                  label="Provincias"
                  value={statsData.provinces}
                  colorClass={colorVariants.purple}
                />
              </div>
              <div className="sm:hidden">
                <StatsCard
                  icon={<Package className="h-5 w-5 text-green-600 dark:text-green-400" />}
                  label="Categorías"
                  value={statsData.categories}
                  colorClass={colorVariants.green}
                />
              </div>
              <div className="sm:hidden">
                <StatsCard
                  icon={<Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                  label="Expansión"
                  value="En progreso"
                  colorClass={colorVariants.amber}
                />
              </div>

              {/* Versión para pantallas medianas y grandes - tarjetas más grandes */}
              <div className="hidden sm:block">
                <StatsCard
                  icon={<ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                  label="Productos"
                  value={statsData.products}
                  colorClass={colorVariants.blue}
                  large
                />
              </div>
              <div className="hidden sm:block">
                <StatsCard
                  icon={<MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                  label="Provincias"
                  value={statsData.provinces}
                  colorClass={colorVariants.purple}
                  large
                />
              </div>
              <div className="hidden sm:block">
                <StatsCard
                  icon={<Package className="h-6 w-6 text-green-600 dark:text-green-400" />}
                  label="Categorías"
                  value={statsData.categories}
                  colorClass={colorVariants.green}
                  large
                />
              </div>
              <div className="hidden sm:block">
                <StatsCard
                  icon={<Globe className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                  label="Expansión"
                  value="En progreso"
                  colorClass={colorVariants.amber}
                  large
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 pb-2 relative z-10">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Desplazar a la izquierda"
              className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Desplazar a la derecha"
              className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`
          relative flex overflow-x-auto gap-4 py-4 px-6 pb-12 
          snap-x snap-mandatory scrollbar-hide 
          ${shouldCenterItems ? 'justify-center' : 'justify-start'}
          content-visibility-auto
        `}
        onScroll={checkForScrollPosition}
        style={{ willChange: "scroll-position", overscrollBehavior: "contain" }}
      >
        <div key="all" className="flex-shrink-0 snap-center">
          <CategoryCard
            className="w-36 h-36 md:w-40 md:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl"
            icon={<FaTh size={40} />}
            size="md"
            text="Todos"
            url="/products/"
            onLocationNeeded={handleOpenLocationModal}
          />
        </div>

        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const url = `/products?page=1&limit=30&category=${category.id}`;

          return (
            <div
              key={category.id}
              className="flex-shrink-0 snap-center"
            >
              <CategoryCard
                className="w-36 h-36 md:w-40 md:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl"
                icon={<Icon size={40} />}
                size="md"
                text={category.name}
                url={url}
                onLocationNeeded={handleOpenLocationModal}
              />
            </div>
          );
        })}

        <div className="flex-shrink-0 w-6" aria-hidden="true" />
      </div>

      <div className="flex justify-center pb-6 md:hidden">
        <div className="flex gap-1">
          <div className={`h-1 w-4 rounded-full ${canScrollLeft ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></div>
          <div className={`h-1 w-4 rounded-full ${canScrollLeft && canScrollRight ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
          <div className={`h-1 w-4 rounded-full ${canScrollRight ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'}`}></div>
        </div>
      </div>
    </div>
  );
};

// Reemplazar el componente StatsCard actual con esta versión optimizada

const StatsCard = ({ icon, label, value, colorClass, large = false }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: {
    icon: string;
    text: string;
    bg: string;
  };
  large?: boolean;
}) => (
  <div
    className={`
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      rounded-xl shadow-sm
      ${large ? 'p-3 sm:p-4' : 'p-2 sm:p-3'}
      h-full
    `}
  >
    <div className={large ? 'flex items-start gap-3' : 'flex items-center gap-2'}>
      {/* Contenedor de icono más compacto para pantallas pequeñas */}
      <div className={`
        ${colorClass.bg} rounded-lg flex-shrink-0
        flex items-center justify-center
        ${large ? 'p-2.5 sm:p-3' : 'p-1.5 sm:p-2'}
      `}>
        {icon}
      </div>

      {/* Contenedor de texto con mejor manejo de espacio */}
      <div className="min-w-0 flex-1">
        {/* Etiqueta con tamaño reducido */}
        <p className={`
          ${large ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'} 
          text-gray-500 dark:text-gray-400 
          font-medium 
          truncate
        `}>
          {label}
        </p>

        {/* Valor con manejo de palabras y ajuste dinámico */}
        <h3 className={`
          ${large ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} 
          ${colorClass.text}
          font-bold 
          mt-0.5
          break-words
          leading-tight
        `}>
          {/* Dividir en líneas si es "En progreso" en dispositivos pequeños */}
          {value === "En progreso" && !large ? (
            <>
              <span className="inline">En progreso</span>
            </>
          ) : (
            value
          )}
        </h3>
      </div>
    </div>
  </div>
);

// Definir colores como objetos para evitar clases dinámicas
const colorVariants = {
  blue: {
    icon: "text-blue-600 dark:text-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  purple: {
    icon: "text-purple-600 dark:text-purple-400",
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  green: {
    icon: "text-green-600 dark:text-green-400",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  }
};

export default CategoryPanel;
