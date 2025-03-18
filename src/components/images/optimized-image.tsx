import React, { useMemo } from 'react';
import Image, { ImageProps } from 'next/image';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

interface OptimizedImageProps extends Omit<ImageProps, 'quality'> {
  fallbackSrc?: string;
  lowQualitySrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = '/placeholder.webp',
  lowQualitySrc,
  priority,
  className,
  ...props
}: OptimizedImageProps) {
  const deviceCapabilities = useDeviceCapabilities();

  const {
    isLowPerformance,
    isUltraLowPerformance,
    effectiveType,
    isDataSaver,
    prefersReducedData
  } = deviceCapabilities;

  const quality = useMemo(() => {
    if (isUltraLowPerformance || effectiveType === 'slow-2g') return 10;
    if (isLowPerformance || effectiveType === '2g' || isDataSaver || prefersReducedData) return 30;
    if (deviceCapabilities.isMobile) return 50;
    return 75;
  }, [isLowPerformance, isUltraLowPerformance, effectiveType, isDataSaver, prefersReducedData, deviceCapabilities.isMobile]);

  const imageSrc = isUltraLowPerformance && lowQualitySrc ? lowQualitySrc : src;

  const sizes = useMemo(() => {
    if (isUltraLowPerformance) return '50vw';
    if (deviceCapabilities.isMobile) return '90vw';
    return '(max-width: 640px) 90vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw';
  }, [isUltraLowPerformance, deviceCapabilities.isMobile]);

  const loading = useMemo(() => {
    if (priority) return undefined;
    return 'lazy';
  }, [priority]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      loading={loading}
      sizes={sizes}
      placeholder={isUltraLowPerformance ? undefined : 'blur'}
      blurDataURL={isUltraLowPerformance ? undefined : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjwvc3ZnPg=='}
      className={`${className || ''} ${isLowPerformance ? 'transition-none' : 'transition-opacity duration-300'}`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = fallbackSrc;
      }}
      {...props}
    />
  );
}