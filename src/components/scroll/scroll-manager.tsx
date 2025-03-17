// src/components/scroll/scroll-manager.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ScrollManager() {
  // Rastrea si estamos usando la navegación del navegador (botón atrás)
  const isBackNavigation = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detectar navegación hacia atrás
  useEffect(() => {
    const handlePopState = () => {
      isBackNavigation.current = true;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Manejar restauración de posición de scroll
  useEffect(() => {
    // Esta función se ejecuta cada vez que cambia la ruta
    if (!isBackNavigation.current) {
      // Para navegación normal (no atrás), guardar la posición actual
      const currentPosition = window.scrollY;
      const currentPage = pathname + searchParams.toString();

      try {
        // Guardar en sessionStorage las posiciones de scroll por página
        const scrollPositions = JSON.parse(
          sessionStorage.getItem("scrollPositions") || "{}"
        );

        scrollPositions[currentPage] = currentPosition;
        sessionStorage.setItem("scrollPositions", JSON.stringify(scrollPositions));
      } catch (error) {
        console.error("Error guardando posición de scroll:", error);
      }
    } else {
      // Para navegación hacia atrás, restaurar la posición guardada
      try {
        const scrollPositions = JSON.parse(
          sessionStorage.getItem("scrollPositions") || "{}"
        );

        const currentPage = pathname + searchParams.toString();
        const savedPosition = scrollPositions[currentPage];

        if (savedPosition !== undefined) {
          // Retrasar ligeramente para permitir que la página se renderice
          setTimeout(() => {
            window.scrollTo(0, savedPosition);
          }, 0);
        }

        // Reiniciar el flag
        isBackNavigation.current = false;
      } catch (error) {
        console.error("Error restaurando posición de scroll:", error);
      }
    }
  }, [pathname, searchParams]);

  return null; // Componente sin UI
}