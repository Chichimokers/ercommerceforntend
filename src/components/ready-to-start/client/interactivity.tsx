"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import AnimatedBackground from "./animated-background";
import AnimatedButtons from "./animated-buttons";
import AnimatedWaveDivider from "./animated-wave-divider";

export default function ClientInteractivity() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Usar observador de intersección para detectar cuándo es visible
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const element = document.getElementById("ready-to-start");
    if (element) {
      observer.observe(element);
      return () => observer.disconnect();
    }

    // Fallback si no se encuentra el elemento
    setIsVisible(true);
    return () => { };
  }, []);

  if (prefersReducedMotion) {
    // Si prefiere movimiento reducido, no renderizamos nada adicional
    return null;
  }

  return (
    <>
      <AnimatedBackground
        isVisible={isVisible}
        prefersReducedMotion={prefersReducedMotion}
      />

      <AnimatedButtons
        isVisible={isVisible}
      />

      <AnimatedWaveDivider />
    </>
  );
}