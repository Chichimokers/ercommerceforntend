/*"use client";

import { useEffect } from 'react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

export default function PerformanceModeController() {
  const deviceCapabilities = useDeviceCapabilities();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const {
      isLowPerformance,
      isUltraLowPerformance,
      prefersReducedMotion,
      prefersReducedData,
      isDataSaver
    } = deviceCapabilities;

    // Aplicar clases al HTML para estilos CSS condicionales
    if (isUltraLowPerformance) {
      document.documentElement.classList.add('ultra-low-performance-device');
      document.documentElement.classList.add('low-performance-device');
      console.log('🔽 Modo de rendimiento ultra bajo activado');
    }
    else if (isLowPerformance || prefersReducedMotion || prefersReducedData || isDataSaver) {
      document.documentElement.classList.add('low-performance-device');
      console.log('🔽 Modo de rendimiento bajo activado');
    }
    else {
      document.documentElement.classList.remove('low-performance-device');
      document.documentElement.classList.remove('ultra-low-performance-device');
    }

    // Optimizaciones para dispositivos de bajo rendimiento
    if (isLowPerformance) {
      // Desactivar animaciones costosas
      document.body.style.setProperty('--animation-duration', '0s');

      // Mejorar rendimiento táctil
      document.body.style.touchAction = 'manipulation';

      // Desactivar suavizado de fuentes si es ultra bajo rendimiento
      if (isUltraLowPerformance) {
        document.body.style.setProperty('-webkit-font-smoothing', 'none');
      }
    }

    // Limpiar al desmontar
    return () => {
      document.documentElement.classList.remove('low-performance-device');
      document.documentElement.classList.remove('ultra-low-performance-device');
      document.body.style.removeProperty('--animation-duration');
      document.body.style.removeProperty('touch-action');
      document.body.style.removeProperty('font-smooth');
      document.body.style.removeProperty('-webkit-font-smoothing');
    };
  }, [deviceCapabilities]);

  // Este componente no renderiza nada visible
  return null;
}*/