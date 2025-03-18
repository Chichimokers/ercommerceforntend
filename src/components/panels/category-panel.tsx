"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useProductContext } from "@/contexts/product-context";
import { FaTh } from "react-icons/fa";
import {
  MapPin,
  SparkleIcon,
  Package,
  Globe,
  ShoppingCart
} from "lucide-react";
import dynamic from "next/dynamic";
import { getCategoryIcon } from "../filters/categories";
import useSWR from "swr";
import { useDisclosure } from "@heroui/react";
import debounce from "lodash.debounce";
import throttle from "lodash.throttle";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

// Carga perezosa optimizada con tamaño de paquete reducido
const LocationModal = dynamic(() => import("@/components/modals/location-modal"), {
  ssr: false,
  loading: () => <div className="h-60 w-full" />, // Placeholder mínimo
});

// Optimización del placeholder con altura explícita para evitar CLS
const CategoryCard = dynamic(() => import("@/components/cards/category-cards"), {
  loading: () => (
    <div className="flex-shrink-0 snap-center w-36 h-36 rounded-xl opacity-60 bg-gray-100 dark:bg-gray-800 animate-pulse" />
  ),
});

const fetcher = async (url: string) => {
  try {
    const cachedData = sessionStorage.getItem(url);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Caché válida por 5 minutos en móviles (conserva batería)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch (error) {

  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const data = await response.json();

    // Guardar en caché con timestamp
    sessionStorage.setItem(
      url,
      JSON.stringify({ data, timestamp: Date.now() })
    );

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const SimpleStatsCard = React.memo(({ icon, label, value, colorClass }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: {
    icon: string;
    text: string;
    bg: string;
    gradient: string;
  };
}) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 h-full shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`${colorClass.bg} rounded-lg flex-shrink-0 p-2`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide truncate">
          {label}
        </p>
        <h3 className={`text-base font-bold mt-0.5 ${colorClass.text}`}>
          {value}
        </h3>
      </div>
    </div>
  </div>
));

SimpleStatsCard.displayName = "SimpleStatsCard";

const CategoryPanel = () => {
  const { categories } = useProductContext();
  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}public/main`;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deviceData = useDeviceDetection();

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldCenterItems, setShouldCenterItems] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(deviceData.isMobile || true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasNetworkImage, setHasNetworkImage] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { data } = useSWR(isVisible ? fetchUrl : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: deviceData.isLowPerformance ? 1800000 : 900000, // 30 min en vez de 15 min para dispositivos de bajo rendimiento
    focusThrottleInterval: 60000,
    errorRetryCount: deviceData.isDataSaver ? 0 : 1, // Sin reintentos para modo ahorro de datos
  });

  useEffect(() => {
    if (!scrollRef.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasNetworkImage(true);
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  const checkForScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;

    if (isScrolling && deviceData.isLowPerformance) {
      // Si ya está scrolling y es dispositivo de bajo rendimiento, saltarse cálculos
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = Math.max(1, scrollWidth - clientWidth);

    // Optimización para casos extremos (inicio/fin) - menos cálculos
    let nextScrollPosition;
    if (scrollLeft <= 2) {
      nextScrollPosition = 0;
    } else if (scrollLeft >= maxScroll - 5) {
      nextScrollPosition = 1;
    } else {
      // Ajuste para asegurar que llega a 1.0 cuando está al final
      nextScrollPosition = Math.min(scrollLeft / maxScroll, 0.98);
    }

    if (Math.abs(nextScrollPosition - scrollPosition) > 0.01) {
      setScrollPosition(nextScrollPosition);
    }

    if (!deviceData.isLowPerformance || !shouldCenterItems) {
      const totalCategWidth = (categories.length + 1) * 148;
      const shouldCenter = clientWidth >= totalCategWidth;
      if (shouldCenter !== shouldCenterItems) {
        setShouldCenterItems(shouldCenter);
      }
    }
  }, [categories.length, scrollPosition, isScrolling, deviceData.isLowPerformance, shouldCenterItems]);

  const throttledCheck = useMemo(
    () => throttle(
      checkForScrollPosition,
      deviceData.isLowPerformance ? 200 : 100,
      { leading: true, trailing: true }
    ),
    [checkForScrollPosition, deviceData.isLowPerformance]
  );

  // Mantener también una versión con debounce para eventos menos frecuentes como resize
  const debouncedCheck = useMemo(
    () => debounce(
      checkForScrollPosition,
      deviceData.isLowPerformance ? 250 : 150,
      { leading: false, trailing: true }
    ),
    [checkForScrollPosition, deviceData.isLowPerformance]
  );

  useEffect(() => {
    // Optimización: usar mediaQuery en lugar de evento resize para detectar móvil
    const checkForMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);

      if (isMobileDevice && scrollTrackRef.current) {
        scrollTrackRef.current.style.display = 'block';
      } else if (scrollTrackRef.current) {
        scrollTrackRef.current.style.display = 'none';
      }
    };

    // Realizar comprobación inicial
    checkForMobile();
    checkForScrollPosition();

    // Usando MediaQueryList para optimizar la detección de cambios de tamaño
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(!e.matches);

      if (!e.matches && scrollTrackRef.current) {
        scrollTrackRef.current.style.display = 'block';
      } else if (scrollTrackRef.current) {
        scrollTrackRef.current.style.display = 'none';
      }

      // Usar debounced check para evitar cálculos frecuentes
      debouncedCheck();
    };

    // Usar ResizeObserver sólo para el contenedor de categorías, no para la ventana entera
    if (typeof ResizeObserver !== 'undefined' && !deviceData.isLowPerformance) {
      const resizeObserver = new ResizeObserver(() => {
        debouncedCheck(); // Usar debouncedCheck en lugar de callCheck directo
      });

      if (containerRef.current) resizeObserver.observe(containerRef.current);

      mediaQuery.addEventListener('change', handleMediaChange);

      return () => {
        resizeObserver.disconnect();
        mediaQuery.removeEventListener('change', handleMediaChange);
      };
    }

    // Fallback para navegadores sin ResizeObserver
    mediaQuery.addEventListener('change', handleMediaChange);
    const handleResize = debounce(checkForMobile, 200);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkForScrollPosition, debouncedCheck, deviceData.isLowPerformance]);

  const scrollLeft = useCallback(() => {
    if (!scrollRef.current) return;

    // Reducir la cantidad de scroll en dispositivos lentos para mejorar rendimiento
    const scrollPercentage = deviceData.isLowPerformance ? 0.5 : 0.75;
    const scrollAmount = scrollRef.current.clientWidth * scrollPercentage;

    // Usar scrollBy nativo para mejor rendimiento
    // Para dispositivos de bajo rendimiento o modo ahorro de datos, siempre usar 'auto'
    const scrollBehavior = (isMobile || deviceData.isLowPerformance || deviceData.isDataSaver) ? 'auto' : 'smooth';

    requestAnimationFrame(() => {
      scrollRef.current?.scrollBy({
        left: -scrollAmount,
        behavior: scrollBehavior
      });
    });
  }, [isMobile, deviceData.isLowPerformance, deviceData.isDataSaver]);

  const scrollRight = useCallback(() => {
    if (!scrollRef.current) return;

    // Reducir la cantidad de scroll en dispositivos lentos para mejorar rendimiento
    const scrollPercentage = deviceData.isLowPerformance ? 0.5 : 0.75;
    const scrollAmount = scrollRef.current.clientWidth * scrollPercentage;

    // Para dispositivos de bajo rendimiento o modo ahorro de datos, siempre usar 'auto'
    const scrollBehavior = (isMobile || deviceData.isLowPerformance || deviceData.isDataSaver) ? 'auto' : 'smooth';

    requestAnimationFrame(() => {
      scrollRef.current?.scrollBy({
        left: scrollAmount,
        behavior: scrollBehavior
      });
    });
  }, [isMobile, deviceData.isLowPerformance, deviceData.isDataSaver]);

  const handleOpenLocationModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const statsData = useMemo(() => ({
    products: data?.products ? `+${data.products}` : "+100",
    provinces: data?.provinces || 2,
    categories: data?.category || 5,
  }), [data]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // Crear una versión más eficiente del manejador de scroll usando throttle
    // para limitar el número de actualizaciones de estado
    const handleScroll = throttle(() => {
      setIsScrolling(true);
      throttledCheck();

      // Desactivar el estado de scrolling después de un corto periodo
      // para permitir otras actualizaciones visuales
      setTimeout(() => setIsScrolling(false), 100);
    }, deviceData.isLowPerformance ? 150 : 100, { leading: true, trailing: true });

    // Optimización para dispositivos táctiles
    const handleTouchStart = () => {
      // En dispositivos de bajo rendimiento, cancelar animaciones al iniciar touch
      if (deviceData.isLowPerformance && scrollElement.style) {
        scrollElement.style.scrollBehavior = 'auto';
      }
    };

    // Detectar final de eventos táctiles con optimizaciones
    const handleTouchEnd = debounce(() => {
      // Pequeño retraso para permitir que el scroll termine, más corto en dispositivos rápidos
      setTimeout(() => {
        checkForScrollPosition(); // Usar la función directa para actualizar inmediatamente

        // Restaurar comportamiento de scroll suave si es apropiado
        if (!deviceData.isLowPerformance && scrollElement.style) {
          scrollElement.style.scrollBehavior = '';
        }
      }, deviceData.isLowPerformance ? 100 : 50);
    }, 50, { leading: false, trailing: true });

    // Usar options passive para mejorar rendimiento de scroll
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      scrollElement.removeEventListener('touchstart', handleTouchStart);
      scrollElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [throttledCheck, checkForScrollPosition, deviceData.isLowPerformance]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
    >
      {isOpen && (
        <LocationModal
          open={isOpen}
          onClose={onClose}
          initialProvince=""
          initialMunicipality=""
        />
      )}

      {/* Fondo decorativo - optimizado para rendimiento */}
      {isMobile ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {!deviceData.isLowPerformance && !deviceData.isDataSaver && (
            <>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-100/20 dark:bg-blue-900/10 blur-md" />
              <div className="absolute top-10 -left-10 w-30 h-30 rounded-full bg-purple-100/20 dark:bg-purple-900/10 blur-md" />
            </>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {!deviceData.isLowPerformance && !deviceData.isDataSaver && (
            <>
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100/30 to-blue-300/10 dark:from-blue-800/10 dark:to-blue-900/5 blur-xl" />
              <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-gradient-to-tr from-purple-100/20 to-purple-300/10 dark:from-purple-800/10 dark:to-purple-900/5 blur-lg" />
              <div className="absolute bottom-10 right-1/4 w-32 h-32 rounded-full bg-gradient-to-tl from-teal-100/10 to-teal-300/5 dark:from-teal-800/10 dark:to-teal-900/5 blur-md" />
            </>
          )}
        </div>
      )}

      <div className="py-6 sm:py-12 px-4 sm:px-6 relative z-10">
        <div className="mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                <span className="inline-flex items-center gap-2">
                  Explora nuestras ofertas para Cuba
                  <SparkleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                </span>
              </h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-lg">
                Nos enfocamos en brindar una amplia gama de productos para las provincias de{" "}
                <span className="font-medium bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Santiago de Cuba</span> y{" "}
                <span className="font-medium bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">Villa Clara</span>.
                Próximamente, estaremos expandiéndonos a más regiones.
              </p>
              <div className="pt-2 sm:pt-3">
                <button
                  onClick={handleOpenLocationModal}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl transition-colors"
                  aria-label="Seleccionar ubicación"
                >
                  <MapPin size={16} className="sm:animate-bounce" />
                  <span className="text-sm sm:text-base">Seleccionar ubicación</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-0">
              {isMobile && (
                <>
                  <SimpleStatsCard
                    icon={<ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    label="Productos"
                    value={statsData.products}
                    colorClass={colorVariants.blue}
                  />
                  <SimpleStatsCard
                    icon={<MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    label="Provincias"
                    value={statsData.provinces}
                    colorClass={colorVariants.purple}
                  />
                  <SimpleStatsCard
                    icon={<Package className="h-5 w-5 text-green-600 dark:text-green-400" />}
                    label="Categorías"
                    value={statsData.categories}
                    colorClass={colorVariants.green}
                  />
                  <SimpleStatsCard
                    icon={<Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                    label="Expansión"
                    value="En progreso"
                    colorClass={colorVariants.amber}
                  />
                </>
              )}

              {!isMobile && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`
          relative flex overflow-x-auto gap-3 sm:gap-4 py-3 px-4 sm:py-4 sm:px-6 pb-8 sm:pb-12
          snap-x snap-mandatory scrollbar-hide will-change-scroll
          ${shouldCenterItems ? 'justify-center' : 'justify-start'}
        `}

        onScroll={debouncedCheck}
      >
        <div key="all" className="flex-shrink-0 snap-center">
          <CategoryCard
            className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            icon={<FaTh size={32} />}
            size="md"
            text="Todos"
            url="/products/"
            onLocationNeeded={handleOpenLocationModal}
          />
        </div>

        {(hasNetworkImage || !isMobile) && categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const url = `/products?page=1&limit=30&category=${category.id}`;

          return (
            <div
              key={category.id}
              className="flex-shrink-0 snap-center"
            >
              <CategoryCard
                className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                icon={<Icon size={32} />}
                size={isMobile ? "sm" : "md"}
                text={category.name}
                url={url}
                onLocationNeeded={handleOpenLocationModal}
              />
            </div>
          );
        })}

        <div className="flex-shrink-0 w-4 sm:w-6" aria-hidden="true" />
      </div>

      {isMobile && (
        <div className="flex justify-center gap-2 pb-3 sm:pb-6 md:hidden">
          {Array.from({ length: 6 }).map((_, index) => {
            const isActive = index / 6 <= scrollPosition;
            return (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-150 ${isActive
                  ? 'bg-blue-500 scale-100'
                  : 'bg-gray-300 dark:bg-gray-600 scale-75'
                  }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ icon, label, value, colorClass, large = false }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: {
    icon: string;
    text: string;
    bg: string;
    gradient: string;
  };
  large?: boolean;
}) => (
  <div className={`
    bg-white dark:bg-gray-800 
    border border-gray-100 dark:border-gray-700
    rounded-xl p-4 sm:p-5 h-full shadow-lg
  `}>
    <div className={large ? 'flex items-start gap-4' : 'flex items-center gap-3'}>
      <div className={`${colorClass.bg} rounded-xl flex-shrink-0 p-3`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide truncate">
          {label}
        </p>
        <h3 className={`text-lg sm:text-xl font-bold mt-1 ${colorClass.text}`}>
          {value}
        </h3>
      </div>
    </div>
  </div>
);

const colorVariants = {
  blue: {
    icon: "text-white",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  purple: {
    icon: "text-white",
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600"
  },
  green: {
    icon: "text-white",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    gradient: "bg-gradient-to-br from-green-500 to-green-600"
  },
  amber: {
    icon: "text-white",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    gradient: "bg-gradient-to-br from-amber-500 to-amber-600"
  }
};

export default CategoryPanel;
