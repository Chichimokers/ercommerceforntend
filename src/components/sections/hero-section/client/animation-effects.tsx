"use client";

import { useEffect, useState } from "react";

export default function AnimationEffects() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Activar animaciones después de cargar
  useEffect(() => {
    setIsLoaded(true);

    // Aplicar animaciones a elementos específicos
    const backgroundImage = document.querySelector('#hero-background-image');
    if (backgroundImage) {
      (backgroundImage as HTMLElement).style.transform = 'scale(1)';
    }

    // Agregar clase de animación a elementos
    document.querySelectorAll('.hero-animate').forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('opacity-100', 'translate-y-0');
      }, 100 * index);
    });
  }, []);

  return (
    <>
      {/* No renderiza HTML, solo aplica efectos */}
      <style jsx global>{`
        .hero-animate {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        
        #hero-background-image {
          transition: transform 0.5s ease-out;
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
}