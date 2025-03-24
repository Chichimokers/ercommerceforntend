"use client";

import { useEffect, useState } from 'react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

export default function MemoryManager() {
  const { isLowPerformance, isUltraLowPerformance } = useDeviceCapabilities();
  const [memoryWarning, setMemoryWarning] = useState(false);

  useEffect(() => {
    if (!isLowPerformance) return;

    const interval = isUltraLowPerformance ? 15000 : 30000;

    const cleanupMemory = () => {
      if (window.caches) {
        window.caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('image-cache')) {
              caches.delete(cacheName);
            }
          });
        });
      }

      if ('memory' in window.performance) {
        const memoryInfo = (window.performance as any).memory;
        if (memoryInfo && memoryInfo.jsHeapSizeLimit) {
          if (memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
            setMemoryWarning(true);
            if (global.gc) {
              try {
                global.gc();
              } catch (e) {
                console.error('No se pudo ejecutar GC');
              }
            }
          } else {
            setMemoryWarning(false);
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupMemory();
      }
    };

    const memoryInterval = setInterval(cleanupMemory, interval);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if ('onlowmemory' in window) {
      (window as any).addEventListener('lowmemory', cleanupMemory);
    }

    return () => {
      clearInterval(memoryInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ('onlowmemory' in window) {
        (window as any).removeEventListener('lowmemory', cleanupMemory);
      }
    };
  }, [isLowPerformance, isUltraLowPerformance]);

  if (memoryWarning) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-800 p-2 text-xs text-center text-yellow-800 dark:text-yellow-200 z-50">
        Memoria baja. Considera refrescar la página.
      </div>
    );
  }

  return null;
}