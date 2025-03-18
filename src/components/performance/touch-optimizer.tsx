"use client";

import { useEffect } from 'react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

export default function TouchOptimizer() {
  const { isMobile, isLowPerformance } = useDeviceCapabilities();

  useEffect(() => {
    if (!isMobile) return;

    document.body.style.touchAction = 'manipulation';

    if (isLowPerformance) {
      const preventZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchstart', preventZoom, { passive: false });

      return () => {
        document.removeEventListener('touchstart', preventZoom);
      };
    }
  }, [isMobile, isLowPerformance]);

  return null;
}