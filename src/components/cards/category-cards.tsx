"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocation } from "@contexts/location-context";

const useDeviceOptimization = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) &&
      (window.devicePixelRatio < 2 || !window.requestAnimationFrame);

    const hasLowBandwidth =
      'connection' in navigator &&
      // @ts-ignore - Connection API no está completamente tipada
      (navigator.connection?.saveData || ['slow-2g', '2g'].includes(navigator.connection?.effectiveType));

    setIsLowPerformance(isLowEnd || hasLowBandwidth);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isLowPerformance, prefersReducedMotion, isTouchDevice };
};

interface CategoryCardProps {
  className?: string;
  size: string;
  icon: React.ReactNode;
  text: string;
  url: string;
  onLocationNeeded?: () => void;
  itemsCount?: number;
}

const CategoryCard = ({
  className = "",
  size,
  icon,
  text,
  url,
  onLocationNeeded,
  itemsCount,
}: CategoryCardProps) => {
  const { location } = useLocation();
  const router = useRouter();
  const { isLowPerformance, prefersReducedMotion, isTouchDevice } = useDeviceOptimization();

  // Determinar si debemos deshabilitar animaciones
  const disableAnimations = isLowPerformance || prefersReducedMotion;

  // Manejar clics de manera eficiente
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (!location || !location.province || !location.municipality) {
      if (onLocationNeeded) {
        e.preventDefault();
        onLocationNeeded();
      }
      return;
    }
  }, [location, onLocationNeeded]);

  // Clases CSS condicionales basadas en capacidades del dispositivo
  const cardClasses = `
    relative overflow-hidden h-full 
    ${className}
    ${disableAnimations
      ? 'transition-none'
      : 'transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]'}
    touch-action-safe
  `;

  // Clases para el contenedor principal que reemplaza a motion.div
  const containerClasses = `
    h-full 
    ${!disableAnimations && 'transform-gpu'} 
    ${disableAnimations ? '' : 'hover-lift'}
  `;

  // Clases para el fondo con efectos
  const bgEffectClasses = `
    absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/80 to-blue-50/40 
    dark:from-blue-900/20 dark:via-gray-800/80 dark:to-blue-900/20
    ${disableAnimations ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-300'}
  `;

  // Clases para el brillo (solo en dispositivos de alto rendimiento)
  const glowEffectClasses = `
    absolute -inset-full h-[400%] w-[400%] opacity-0 
    ${!disableAnimations && 'group-hover:opacity-20 blur-xl'}
    ${isLowPerformance ? 'hidden' : 'bg-gradient-conic from-blue-600 via-transparent to-blue-600'}
  `;

  // Clases para el icono
  const iconClasses = `
    relative h-14 w-14 flex items-center justify-center
    ${disableAnimations ? '' : 'group-hover:scale-110 transition-all duration-300'}
  `;

  // Clases para el fondo del icono
  const iconBgClasses = `
    absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full
    ${disableAnimations ? 'opacity-30' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-110 transition-all duration-300'}
  `;

  return (
    <div className={containerClasses}>
      <Card
        isPressable
        as={Link}
        href={url}
        onClick={handleCardClick}
        shadow={disableAnimations ? "sm" : "none"}
        className={`${cardClasses} group`}
      >
        {/* Fondo con gradiente - optimizado */}
        <div className={bgEffectClasses} />

        {/* Brillo en hover - solo para dispositivos de alto rendimiento */}
        {!isLowPerformance && (
          <div className={glowEffectClasses} />
        )}

        <CardBody className="p-4 sm:p-5 relative z-10">
          <div className="flex flex-col justify-center items-center h-full gap-2 sm:gap-3">
            {/* Icono con animación condicional */}
            <div className={iconClasses}>
              <div className={iconBgClasses} />
              <div className="relative z-10 text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl">
                {icon}
              </div>
            </div>

            {/* Texto de categoría - optimizado */}
            <h3 className={`
              text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 
              ${disableAnimations ? '' : 'transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
              line-clamp-2 text-center
            `}>
              {text}
            </h3>

            {/* Badge con contador - optimizado */}
            {itemsCount !== undefined && (
              <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {itemsCount > 999 ? '999+' : itemsCount}
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoryCard;

// Añade estos estilos a tu archivo global de CSS:
/*
@media (prefers-reduced-motion: no-preference) {
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-5px);
  }
}
*/
