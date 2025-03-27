"use client";

import React, { useCallback, memo } from "react";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { useLocationStore } from "@store/location/location-store";
import Image from "next/image";

interface CategoryCardProps {
  className?: string;
  icon: React.ReactNode;
  text: string;
  url: string;
  onLocationNeeded?: () => void;
  imageUrl?: string;
}

// Versión optimizada de CategoryCard para dispositivos de bajo rendimiento
const LightCategoryCard = memo(({
  className = "",
  icon,
  text,
  url,
  onLocationNeeded
}: CategoryCardProps) => {
  const { location } = useLocationStore();

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

        </div>
      </CardBody>
    </Card>
  );
});

LightCategoryCard.displayName = 'LightCategoryCard';

const CategoryCard = ({
  className = "",
  icon,
  text,
  url,
  onLocationNeeded,
  imageUrl,
}: CategoryCardProps) => {
  const { location } = useLocationStore();

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (!location || !location.province || !location.municipality) {
      if (onLocationNeeded) {
        e.preventDefault();
        onLocationNeeded();
      }
      return;
    }
  }, [location, onLocationNeeded]);

  // Clases CSS condicionales basadas en capacidades del dispositivo - optimizadas
  const cardClasses = `
    relative overflow-hidden h-full 
    transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]'
    touch-action-safe
    ${className}
  `;

  // Clases para el contenedor principal - optimizadas para rendimiento
  const containerClasses = `h-full`;

  // Clases para el fondo con efectos
  const bgEffectClasses = `
    absolute inset-0 bg-blue-50/40
    dark:bg-blue-900/20
  `;

  // Clases para el icono
  const iconClasses = `
    relative h-14 w-14 flex items-center justify-center
  `;

  // Clases para el fondo del icono
  const iconBgClasses = `
    absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full
    opacity-30
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
        shadow={"sm"}
        className={`${cardClasses} group`}
        style={{ touchAction: "pan-x pan-y" }}
      >
        <div className={bgEffectClasses} />

        <CardBody className="p-4 sm:p-5 relative z-10">
          <div className="flex flex-col justify-center items-center h-full gap-2 sm:gap-3">
            <div className={iconClasses}>
              <div className={iconBgClasses} />
              <div className="relative z-10 text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl">
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
                      quality={60}
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

            <h3 className={`
              text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200
              line-clamp-2 text-center
            `}>
              {text}
            </h3>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoryCard;
