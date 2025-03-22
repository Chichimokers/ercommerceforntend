"use client";

import React, { useState, useEffect, memo, useMemo } from 'react';
import Image from 'next/image';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

// Constantes para configuración y optimización
const PLACEHOLDER = "/placeholder.webp";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onError?: () => void;
  style?: React.CSSProperties;
}

const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes = '100vw',
  priority = false,
  quality: userQuality,
  onError,
  style,
}: OptimizedImageProps) => {
  const [error, setError] = useState(false);
  const deviceData = useDeviceDetection();
  const { isMobile, isLowPerformance, effectiveType, isDataSaver, prefersReducedMotion } = deviceData;

  // Determinar uso de imagen nativa en lugar de Image de Next.js
  const useNativeImg = useMemo(() => {
    return isLowPerformance && (effectiveType === 'slow-2g' || effectiveType === '2g' || isDataSaver);
  }, [isLowPerformance, effectiveType, isDataSaver]);

  // Calcular la calidad de imagen óptima basada en tipo de dispositivo y conexión
  const optimizedQuality = useMemo(() => {
    if (userQuality) return userQuality;

    if (isDataSaver) return 10;
    if (effectiveType === 'slow-2g') return 10;
    if (effectiveType === '2g') return 20;
    if (effectiveType === '3g') return 40;

    if (isLowPerformance) return 30;
    if (isMobile) return 60;

    return 80; // Calidad por defecto para desktop
  }, [userQuality, isLowPerformance, isMobile, effectiveType, isDataSaver]);

  // Simplificar sizeo para dispositivos de bajo rendimiento
  const optimizedSizes = useMemo(() => {
    if (isLowPerformance || isDataSaver) {
      return '100vw';
    }

    return sizes;
  }, [sizes, isLowPerformance, isDataSaver]);

  // Propiedades para la carga optimizada
  const loadingProps = useMemo(() => {
    if (priority) {
      return { loading: 'eager' as const, priority: true };
    }

    return { loading: 'lazy' as const, priority: false };
  }, [priority]);

  // Clases CSS optimizadas
  const imageClasses = useMemo(() => {
    const baseClasses = className || '';

    // Para dispositivos que prefieren reducir el movimiento, quitar transiciones
    if (prefersReducedMotion || isLowPerformance) {
      return baseClasses.replace(/transition|animate|hover:scale|duration/g, '');
    }

    return baseClasses;
  }, [className, prefersReducedMotion, isLowPerformance]);

  // Manejador de error común
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    (e.target as HTMLImageElement).src = PLACEHOLDER;
    if (onError) onError();
  };

  // Usar imagen nativa para dispositivos de muy bajo rendimiento
  if (useNativeImg) {
    const imgStyle: React.CSSProperties = {
      ...style,
    };

    if (fill) {
      imgStyle.objectFit = 'cover';
      imgStyle.width = '100%';
      imgStyle.height = '100%';
      imgStyle.position = 'absolute';
      imgStyle.inset = 0;
    }

    return (
      <img
        src={error ? PLACEHOLDER : src}
        alt={alt}
        width={width}
        height={height}
        className={imageClasses}
        style={imgStyle}
        loading="lazy"
        onError={handleImageError}
      />
    );
  }

  // Usar Next.js Image con configuración optimizada para otros dispositivos
  if (fill) {
    return (
      <Image
        src={error ? PLACEHOLDER : src}
        alt={alt}
        fill
        sizes={optimizedSizes}
        className={imageClasses}
        quality={optimizedQuality}
        {...loadingProps}
        style={style}
        placeholder="empty"
        onError={handleImageError}
      />
    );
  }

  return (
    <Image
      src={error ? PLACEHOLDER : src}
      alt={alt}
      width={width || 100}
      height={height || 100}
      className={imageClasses}
      sizes={optimizedSizes}
      quality={optimizedQuality}
      {...loadingProps}
      style={style}
      placeholder="empty"
      onError={handleImageError}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
