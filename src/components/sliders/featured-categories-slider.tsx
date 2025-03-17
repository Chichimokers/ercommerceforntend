"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Datos de categorías destacadas
const featuredCategories = [
  {
    id: "electronics",
    name: "Electrónica",
    image: "/categories/electronics.jpg",
    color: "from-blue-500/20 to-blue-600/20",
    darkColor: "from-blue-900/30 to-blue-800/30",
    count: 542
  },
  {
    id: "groceries",
    name: "Alimentos",
    image: "/categories/groceries.jpg",
    color: "from-green-500/20 to-green-600/20",
    darkColor: "from-green-900/30 to-green-800/30",
    count: 687
  },
  {
    id: "home",
    name: "Hogar",
    image: "/categories/home.jpg",
    color: "from-amber-500/20 to-amber-600/20",
    darkColor: "from-amber-900/30 to-amber-800/30",
    count: 324
  },
  {
    id: "beauty",
    name: "Belleza",
    image: "/categories/beauty.jpg",
    color: "from-pink-500/20 to-pink-600/20",
    darkColor: "from-pink-900/30 to-pink-800/30",
    count: 263
  },
  {
    id: "clothing",
    name: "Ropa",
    image: "/categories/clothing.jpg",
    color: "from-purple-500/20 to-purple-600/20",
    darkColor: "from-purple-900/30 to-purple-800/30",
    count: 428
  },
  {
    id: "health",
    name: "Salud",
    image: "/categories/health.jpg",
    color: "from-red-500/20 to-red-600/20",
    darkColor: "from-red-900/30 to-red-800/30",
    count: 195
  },
  {
    id: "toys",
    name: "Juguetes",
    image: "/categories/toys.jpg",
    color: "from-indigo-500/20 to-indigo-600/20",
    darkColor: "from-indigo-900/30 to-indigo-800/30",
    count: 176
  },
  {
    id: "gifts",
    name: "Regalos",
    image: "/categories/gifts.jpg",
    color: "from-teal-500/20 to-teal-600/20",
    darkColor: "from-teal-900/30 to-teal-800/30",
    count: 254
  }
];

// Componente de Tarjeta de Categoría
const CategoryCard = ({ category }: { category: typeof featuredCategories[0] }) => {
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="group relative h-[180px] flex-shrink-0 overflow-hidden rounded-2xl transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {/* Fondo de la tarjeta */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${category.color} dark:${category.darkColor} group-hover:opacity-90 transition-opacity`}></div>

      {/* Imagen de fondo con efecto de zoom */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <Image
          src={category.image || "/placeholder-category.jpg"}
          alt={category.name}
          fill
          className="object-cover opacity-70 dark:opacity-50 group-hover:opacity-80 dark:group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-category.jpg";
          }}
        />
      </div>

      {/* Overlay para mejor legibilidad */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent"></div>

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col items-start transition-transform group-hover:translate-y-[-5px]">
        <h3 className="font-bold text-xl text-white drop-shadow-md">
          {category.name}
        </h3>
        <span className="text-sm text-gray-200 bg-black/30 px-2 py-0.5 rounded-full mt-1">
          {category.count} productos
        </span>
      </div>
    </Link>
  );
};

// Componente principal del slider
const FeaturedCategoriesSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Manejar el desplazamiento horizontal
  const handleScroll = () => {
    if (!sliderRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

    // Verificar si se puede desplazar a la izquierda o a la derecha
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10); // Tolerancia de 10px
  };

  // Desplazamiento a la izquierda
  const scrollLeft = () => {
    if (!sliderRef.current) return;

    const scrollAmount = sliderRef.current.clientWidth * 0.75; // 75% del ancho visible
    sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  // Desplazamiento a la derecha
  const scrollRight = () => {
    if (!sliderRef.current) return;

    const scrollAmount = sliderRef.current.clientWidth * 0.75; // 75% del ancho visible
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Configurar evento de desplazamiento
  useEffect(() => {
    const slider = sliderRef.current;

    if (slider) {
      slider.addEventListener("scroll", handleScroll);
      // Verificar el estado inicial de desplazamiento
      handleScroll();

      // Verificar el estado de desplazamiento cuando cambie el tamaño de la ventana
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      if (slider) {
        slider.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      {/* Botón de desplazamiento izquierdo */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: canScrollLeft ? 1 : 0 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg disabled:opacity-0 transition-opacity"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        aria-label="Desplazar a la izquierda"
      >
        <ChevronLeft size={24} className="text-gray-700 dark:text-gray-200" />
      </motion.button>

      {/* Contenedor del slider */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featuredCategories.map((category) => (
          <div
            key={category.id}
            className="w-[280px] min-w-[280px] flex-shrink-0 snap-start"
          >
            <CategoryCard category={category} />
          </div>
        ))}
      </div>

      {/* Botón de desplazamiento derecho */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: canScrollRight ? 1 : 0 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg disabled:opacity-0 transition-opacity"
        onClick={scrollRight}
        disabled={!canScrollRight}
        aria-label="Desplazar a la derecha"
      >
        <ChevronRight size={24} className="text-gray-700 dark:text-gray-200" />
      </motion.button>

      {/* Estilo para ocultar la barra de desplazamiento */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FeaturedCategoriesSlider;