'use client';

import { useState, useEffect, useMemo } from 'react';

// Tipos para mejor autocompleto y prevención de errores
export interface DeviceCapabilities {
  // Características del dispositivo
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // Rendimiento y optimización
  isLowPerformance: boolean;
  isUltraLowPerformance: boolean;
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;

  // Conexión
  connectionType: string;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  isDataSaver: boolean;

  // Hardware
  cpuCores: number;
  memoryLimit: number;

  // Sistema
  isReactNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  // Valores predeterminados (asumen el peor escenario para SSR)
  const defaultCapabilities: DeviceCapabilities = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    isLowPerformance: false,
    isUltraLowPerformance: false,
    prefersReducedMotion: false,
    prefersReducedData: false,
    connectionType: 'unknown',
    effectiveType: '4g',
    isDataSaver: false,
    cpuCores: 4,
    memoryLimit: 8192,
    isReactNative: false,
    isIOS: false,
    isAndroid: false
  };

  // Estado para almacenar los valores detectados
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(defaultCapabilities);

  // Detectar todas las características una sola vez al montar
  useEffect(() => {
    // Comprobación para Server-Side Rendering
    if (typeof window === 'undefined') return;

    try {
      // Detección de tamaño de pantalla
      const detectScreenSize = () => {
        const width = window.innerWidth;
        let screenSize: DeviceCapabilities['screenSize'] = 'xs';
        if (width >= 640) screenSize = 'sm';
        if (width >= 768) screenSize = 'md';
        if (width >= 1024) screenSize = 'lg';
        if (width >= 1280) screenSize = 'xl';
        if (width >= 1536) screenSize = '2xl';
        return screenSize;
      };

      // Detección de tipo de dispositivo
      const isMobile = window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia && window.matchMedia('(max-width: 767px)').matches);

      const isTablet = !isMobile && window.innerWidth < 1024;
      const isDesktop = window.innerWidth >= 1024;

      // Detección de sistema operativo
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isReactNative = typeof (window as any).ReactNativeWebView !== 'undefined';

      // Detección de preferencias de usuario
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;

      // Detección de hardware
      const cpuCores = navigator.hardwareConcurrency || 2;

      // Detección de memoria (si está disponible)
      let memoryLimit = 8192; // 8GB por defecto
      if ('deviceMemory' in navigator) {
        memoryLimit = (navigator as any).deviceMemory * 1024 || 8192; // Convertir GB a MB
      }

      // Detección de red
      let connectionType = 'unknown';
      let effectiveType: DeviceCapabilities['effectiveType'] = '4g';
      let isDataSaver = false;

      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        connectionType = conn?.type || 'unknown';
        effectiveType = (conn?.effectiveType || '4g') as DeviceCapabilities['effectiveType'];
        isDataSaver = conn?.saveData || false;
      }

      // Detección de rendimiento
      // Dispositivos de rendimiento ultra bajo: conexiones lentas, modo ahorro de datos, pocos núcleos
      const isUltraLowPerformance =
        effectiveType === 'slow-2g' ||
        isDataSaver ||
        cpuCores <= 2 ||
        memoryLimit < 2048; // menos de 2GB

      // Dispositivos de rendimiento bajo: conexiones moderadas, menos núcleos que la media
      const isLowPerformance =
        isUltraLowPerformance ||
        effectiveType === '2g' ||
        cpuCores <= 4 ||
        memoryLimit < 4096 || // menos de 4GB
        prefersReducedMotion ||
        prefersReducedData;

      // Consolidar todos los valores detectados
      setCapabilities({
        isMobile,
        isTablet,
        isDesktop,
        screenSize: detectScreenSize(),
        isLowPerformance,
        isUltraLowPerformance,
        prefersReducedMotion,
        prefersReducedData,
        connectionType,
        effectiveType,
        isDataSaver,
        cpuCores,
        memoryLimit,
        isReactNative,
        isIOS,
        isAndroid
      });

      // Detectar cambios de tamaño de pantalla
      const handleResize = () => {
        setCapabilities(prev => ({
          ...prev,
          screenSize: detectScreenSize(),
          isMobile: window.innerWidth < 768,
          isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
          isDesktop: window.innerWidth >= 1024,
        }));
      };

      // Escuchar cambios de tamaño de pantalla
      window.addEventListener('resize', handleResize);

      // Limpiar al desmontar
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error('Error detectando capacidades del dispositivo:', error);
      // Mantener los valores predeterminados en caso de error
    }
  }, []);

  // Exportar las capacidades detectadas
  return capabilities;
}

export default useDeviceCapabilities;