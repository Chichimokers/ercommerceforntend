"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const featuredCategories = [
  {
    id: "electronics",
    name: "Electrónica",
    image: "/categories/electronics.jpg",
    color: "bg-blue-600/20",
    darkColor: "bg-blue-800/30",
    count: 542
  },
  {
    id: "groceries",
    name: "Alimentos",
    image: "/categories/groceries.jpg",
    color: "bg-green-600/20",
    darkColor: "bg-green-800/30",
    count: 687
  },
  {
    id: "home",
    name: "Hogar",
    image: "/categories/home.jpg",
    color: "bg-amber-600/20",
    darkColor: "bg-amber-800/30",
    count: 324
  },
  {
    id: "beauty",
    name: "Belleza",
    image: "/categories/beauty.jpg",
    color: "bg-pink-600/20",
    darkColor: "bg-pink-800/30",
    count: 263
  },
  {
    id: "clothing",
    name: "Ropa",
    image: "/categories/clothing.jpg",
    color: "bg-purple-600/20",
    darkColor: "bg-purple-800/30",
    count: 428
  },
  {
    id: "health",
    name: "Salud",
    image: "/categories/health.jpg",
    color: "bg-red-600/20",
    darkColor: "bg-red-800/30",
    count: 195
  },
  {
    id: "toys",
    name: "Juguetes",
    image: "/categories/toys.jpg",
    color: "bg-indigo-600/20",
    darkColor: "bg-indigo-800/30",
    count: 176
  },
  {
    id: "gifts",
    name: "Regalos",
    image: "/categories/gifts.jpg",
    color: "bg-teal-600/20",
    darkColor: "bg-teal-800/30",
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
      <div className={`absolute inset-0 ${category.color} dark:${category.darkColor} group-hover:opacity-90 transition-opacity`}></div>

      {/* Imagen de fondo con efecto de zoom */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <Image
          src={category.image || "/placeholder-category.jpg"}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover opacity-70 dark:opacity-50 group-hover:opacity-80 dark:group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-category.jpg";
          }}
        />
      </div>

      {/* Overlay para mejor legibilidad */}
      <div className="absolute inset-0 z-10 bg-black/60"></div>

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col items-start transition-transform group-hover:translate-y-[-5px]">
        <h3 className="font-bold text-xl text-white">
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

    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    const slider = sliderRef.current;

    if (slider) {
      slider.addEventListener("scroll", handleScroll);
      handleScroll();

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
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg disabled:opacity-0 transition-opacity"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        aria-label="Desplazar a la izquierda"
      >
        <ChevronLeft size={24} className="text-gray-700 dark:text-gray-200" />
      </button>

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

      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg disabled:opacity-0 transition-opacity"
        onClick={scrollRight}
        disabled={!canScrollRight}
        aria-label="Desplazar a la derecha"
      >
        <ChevronRight size={24} className="text-gray-700 dark:text-gray-200" />
      </button>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FeaturedCategoriesSlider;