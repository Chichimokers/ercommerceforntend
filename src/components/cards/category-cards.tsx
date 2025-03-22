"use client";

import React, { useCallback, memo } from "react";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { useLocationStore } from "@store/location/location-store";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import Image from "next/image";

interface CategoryCardProps {
  className?: string;
  size: string;
  icon: React.ReactNode;
  text: string;
  url: string;
  onLocationNeeded?: () => void;
  itemsCount?: number;
  imageUrl?: string;
}

// Versión optimizada de CategoryCard para dispositivos de bajo rendimiento
const LightCategoryCard = memo(({
  className = "",
  icon,
  text,
  url,
  itemsCount,
  onLocationNeeded
}: CategoryCardProps) => {
  const { location, hasLocation } = useLocationStore();

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (!location || !location.province || !location.municipality) {
      if (onLocationNeeded) {
        e.preventDefault();
        onLocationNeeded();
      }
    }
  }, [location, onLocationNeeded]);

  return (
    <Card
      isHoverable
      isPressable
      as={Link}
      href={url}
      onClick={handleCardClick}
      shadow="none"
      className={`relative overflow-hidden h-full ${className}`}
      style={{ touchAction: "pan-x pan-y" }}
    >
      <CardBody className="p-4 relative">
        <div className="flex flex-col justify-center items-center h-full gap-2">
          <div className="relative h-12 w-12 flex items-center justify-center">
            <div className="relative z-10 text-blue-600 dark:text-blue-400 text-2xl">
              {icon}
            </div>
          </div>

          <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 text-center">
            {text}
          </h3>

          {itemsCount !== undefined && (
            <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {itemsCount > 999 ? '999+' : itemsCount}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
});

LightCategoryCard.displayName = 'LightCategoryCard';

const CategoryCard = ({
  className = "",
  size,
  icon,
  text,
  url,
  onLocationNeeded,
  itemsCount,
  imageUrl,
}: CategoryCardProps) => {
  const { location, hasLocation } = useLocationStore();
  const deviceData = useDeviceDetection();

  // Determinar si debemos deshabilitar animaciones
  const disableAnimations = deviceData.isLowPerformance || deviceData.prefersReducedMotion;

  // Nota: Movemos este retorno condicional después de declarar todos los hooks
  // para evitar el error "Rendered fewer hooks than expected"
  const needsLightVersion = deviceData.isLowPerformance || deviceData.effectiveType === 'slow-2g';

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

  const handleTouchStart = useCallback(() => {
    if (deviceData.isLowPerformance) {
      return;
    }
    // Para dispositivos normales, solo evitamos que otros handlers capturen el evento
  }, [deviceData.isLowPerformance]);

  // Ahora que hemos declarado todos los hooks necesarios, podemos hacer el return temprano
  if (needsLightVersion) {
    return (
      <LightCategoryCard
        className={className}
        size={size}
        icon={icon}
        text={text}
        url={url}
        onLocationNeeded={onLocationNeeded}
        itemsCount={itemsCount}
      />
    );
  }

  // Clases CSS condicionales basadas en capacidades del dispositivo - optimizadas
  const cardClasses = `
    relative overflow-hidden h-full 
    ${className}
    ${disableAnimations
      ? 'transition-none'
      : deviceData.isDataSaver
        ? 'transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]'
        : 'transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]'}
    touch-action-safe
  `;

  // Clases para el contenedor principal - optimizadas para rendimiento
  const containerClasses = `
    h-full 
    ${(!disableAnimations && !deviceData.isDataSaver) ? 'transform-gpu' : ''} 
    ${disableAnimations ? '' : 'hover-lift'}
  `;

  // Clases para el fondo con efectos
  const bgEffectClasses = `
    absolute inset-0 bg-blue-50/40
    dark:bg-blue-900/20
    ${disableAnimations ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-300'}
  `;

  // Clases para el brillo (solo en dispositivos de alto rendimiento)
  const glowEffectClasses = `
    absolute -inset-full h-[400%] w-[400%] opacity-0 
    ${!disableAnimations && 'group-hover:opacity-20 '}
    ${deviceData.isLowPerformance ? 'hidden' : 'bg-blue-600'}
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
    <div
      className={containerClasses}
      style={{ touchAction: "pan-x pan-y" }} // Permitir ambos scrolls
    >
      <Card
        isPressable
        as={Link}
        href={url}
        onClick={handleCardClick}
        shadow={disableAnimations ? "sm" : "none"}
        className={`${cardClasses} group`}
        style={{ touchAction: "pan-x pan-y" }} // Permitir ambos scrolls
        // Eventos touch capturados pero permitiendo propagación
        onTouchStart={handleTouchStart}
      >
        {/* Fondo con gradiente - optimizado */}
        <div className={bgEffectClasses} />

        {/* Brillo en hover - solo para dispositivos de alto rendimiento */}
        {!deviceData.isLowPerformance && (
          <div className={glowEffectClasses} />
        )}

        <CardBody className="p-4 sm:p-5 relative z-10">
          <div className="flex flex-col justify-center items-center h-full gap-2 sm:gap-3">
            {/* Icono con animación condicional */}
            <div className={iconClasses}>
              <div className={iconBgClasses} />
              <div className="relative z-10 text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl">
                {/* Si hay una imagen, la usamos optimizada, si no, usamos el icono */}
                {imageUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={text}
                      fill
                      sizes="48px"
                      loading="lazy"
                      placeholder="empty"
                      className="object-cover"
                      quality={deviceData.isDataSaver ? 30 : 60}
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ) : (
                  icon
                )}
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
