import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    interface NetworkInformation {
      saveData: boolean;
      effectiveType: string;
    }

    const connection = 'connection' in navigator ?
      (navigator as any).connection as NetworkInformation : undefined;
    const isLowPowerMode = connection !== undefined &&
      (connection.saveData ||
        ['slow-2g', '2g', '3g'].includes(connection.effectiveType));

    if (isLowPowerMode || (isMobile && navigator.hardwareConcurrency <= 4)) {
      setPrefersReducedMotion(true);
    }

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return prefersReducedMotion;
}