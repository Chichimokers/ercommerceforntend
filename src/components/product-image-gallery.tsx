"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { Button, Skeleton } from '@heroui/react';

interface ProductImageGalleryProps {
  images: string[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  lazyLoad?: boolean;
  enableZoom?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images = [],
  selectedIndex = 0,
  onSelect,
  lazyLoad = true,
  enableZoom = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0.5, y: 0.5 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Asegurar que tenemos al menos una imagen
  if (!images.length) {
    images = ['/placeholder.jpg'];
  }

  // Resetear estado de zoom al cambiar de imagen
  useEffect(() => {
    setIsZoomed(false);
    setImageLoaded(false);
    setLoading(true);
    setImgSrc(''); // Importante: resetear la URL de la imagen
  }, [currentIndex]);

  // Manejar cambios de índice de manera segura
  const handleIndexChange = useCallback((newIndex: number) => {
    if (isZoomed) setIsZoomed(false);

    const safeIndex = ((newIndex % images.length) + images.length) % images.length;
    setCurrentIndex(safeIndex);
    if (onSelect) {
      onSelect(safeIndex);
    }
  }, [currentIndex, images.length, isZoomed, onSelect]);

  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleIndexChange(currentIndex - 1);
  }, [currentIndex, handleIndexChange]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleIndexChange(currentIndex + 1);
  }, [currentIndex, handleIndexChange]);

  // Capturar la URL real de la imagen - CLAVE PARA SOLUCIONAR EL PROBLEMA
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoading(false);
    setImageLoaded(true);

    // Obtenemos la URL real de la imagen ya cargada por Next.js
    // Esta es la solución al problema de imagen negra
    if (e.currentTarget.src) {
      setImgSrc(e.currentTarget.src);
    } else {
      // Fallback a la URL original si no podemos obtener la URL optimizada
      setImgSrc(images[currentIndex]);
    }
  }, [currentIndex, images]);

  const handleZoom = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    if (!enableZoom || !imageLoaded) return;

    if (!isZoomed) {
      const container = imageContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setZoomPosition({
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y))
        });
      }
    }

    setIsZoomed(!isZoomed);
  }, [enableZoom, isZoomed, imageLoaded]);

  // Manejar movimiento durante el zoom
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isZoomed || !imageContainerRef.current || !enableZoom) return;

    const container = imageContainerRef.current;
    const rect = container.getBoundingClientRect();

    // Calcular posición relativa (0 a 1)
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setZoomPosition({ x, y });
  }, [isZoomed, enableZoom]);

  return (
    <div className="relative">
      {/* Contenedor principal de la imagen */}
      <div
        ref={imageContainerRef}
        className={`
          relative w-full aspect-square 
          bg-gray-100 dark:bg-gray-800 
          rounded-lg overflow-hidden mb-4
          ${enableZoom && imageLoaded ? (isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in') : 'cursor-default'}
        `}
        onClick={handleZoom}
        onMouseMove={handleMouseMove}
        style={isZoomed ? { cursor: 'crosshair' } : {}}
      >
        {loading && (
          <Skeleton className="absolute inset-0 z-0" />
        )}

        {/* Imagen normal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              ref={imageRef}
              src={images[currentIndex]}
              alt={`Imagen del producto ${currentIndex + 1}`}
              fill
              className={`
                object-contain
                ${isZoomed ? 'opacity-0' : 'opacity-100'} 
                transition-opacity duration-200
              `}
              priority={!lazyLoad || currentIndex === 0}
              loading={lazyLoad && currentIndex !== 0 ? 'lazy' : 'eager'}
              onLoad={handleImageLoad}
              onError={() => {
                setLoading(false);
                console.error("Error loading image:", images[currentIndex]);
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Imagen ampliada para zoom */}
        {enableZoom && imageLoaded && isZoomed && imgSrc && (
          <div
            className="absolute inset-0 z-10 transition-opacity duration-200"
            style={{
              backgroundImage: `url("${imgSrc}")`,
              backgroundPosition: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
              backgroundSize: '250%',
              backgroundRepeat: 'no-repeat',
            }}
            aria-label="Imagen ampliada"
          />
        )}

        {/* Indicador de zoom */}
        {enableZoom && imageLoaded && !isZoomed && (
          <div className="absolute bottom-3 right-3 z-10 bg-black/60 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity">
            <FaSearchPlus size={16} aria-hidden="true" />
            <span className="sr-only">Clic para ampliar</span>
          </div>
        )}

        {/* Indicador de zoom activo */}
        {enableZoom && imageLoaded && isZoomed && (
          <div className="absolute bottom-3 right-3 z-20 bg-black/60 text-white p-2 rounded-full opacity-70 hover:opacity-100 transition-opacity">
            <FaSearchMinus size={16} aria-hidden="true" />
            <span className="sr-only">Clic para reducir</span>
          </div>
        )}

        {/* Flechas de navegación */}
        {images.length > 1 && (
          <>
            <Button
              isIconOnly
              variant="flat"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-black/60 z-20 shadow-md rounded-full"
              onClick={handlePrevious}
              aria-label="Imagen anterior"
            >
              <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-black/60 z-20 shadow-md rounded-full"
              onClick={handleNext}
              aria-label="Imagen siguiente"
            >
              <FaArrowRight className="text-gray-700 dark:text-gray-300" />
            </Button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto pb-2 snap-x scrollbar-thin">
          {images.map((src, index) => (
            <button
              key={index}
              className={`relative w-16 h-16 rounded-md overflow-hidden snap-start
                ${index === currentIndex
                  ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                  : 'ring-1 ring-gray-200 dark:ring-gray-700'
                }`}
              onClick={(e) => {
                e.stopPropagation();
                handleIndexChange(index);
              }}
              aria-label={`Ver imagen ${index + 1}`}
              aria-current={index === currentIndex}
            >
              <Image
                src={src}
                alt={`Miniatura ${index + 1}`}
                fill
                className="object-cover"
                loading={lazyLoad ? 'lazy' : 'eager'}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;