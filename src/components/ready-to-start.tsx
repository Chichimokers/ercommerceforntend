"use client";
import React, { useEffect, useState, memo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface OptimizedWaveDividerProps {
  prefersReducedMotion: boolean;
}

interface BackgroundEffectsProps {
  isVisible: boolean;
  prefersReducedMotion: boolean;
}

interface CTAButtonsProps {
  isVisible: boolean;
  prefersReducedMotion: boolean;
}

// Componente principal optimizado
export default function ReadyToStart() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Intersection Observer simplificado
  useEffect(() => {
    // Solo usar el observer si no estamos en un dispositivo con preferencias de movimiento reducido
    if (document && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Desconectar después de activar una vez
          }
        },
        { threshold: 0.1, rootMargin: '100px' } // Umbral más bajo y margin para detectar antes
      );

      const currentElement = document.getElementById("ready-to-start");
      if (currentElement) {
        observer.observe(currentElement);
      }

      return () => {
        if (currentElement) observer.disconnect();
      };
    } else {
      // Fallback para navegadores sin soporte o dispositivos de bajo rendimiento
      setIsVisible(true);
    }
  }, []);

  return (
    <section
      id="ready-to-start"
      className="
        relative 
        overflow-hidden
        bg-gradient-to-br from-blue-50 to-indigo-100
        dark:from-gray-900 dark:to-blue-900
        py-20 sm:py-28
      "
    >
      {/* Fondo optimizado con cargas condicionales */}
      <BackgroundEffects isVisible={isVisible} prefersReducedMotion={prefersReducedMotion} />

      {/* Contenido principal optimizado */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center">
        <div
          className={`max-w-3xl transition-all duration-700 ease-out ${isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-8"
            }`}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent mb-6">
            ¿Todo listo para empezar?
          </h2>

          <p className="text-base md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-10 max-w-xl mx-auto">
            ¡Regístrate hoy mismo para explorar millones de productos de
            proveedores de confianza! Dale a tu negocio el impulso que necesita.
          </p>

          <CTAButtons isVisible={isVisible} prefersReducedMotion={prefersReducedMotion} />

          {/* Insignia de confianza optimizada */}
          <div
            className={`flex items-center justify-center mt-10 text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-700 ease-out delay-300 ${isVisible ? "opacity-100" : "opacity-0"
              }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>100% seguro y confidencial</span>
          </div>
        </div>
      </div>

      <OptimizedWaveDivider prefersReducedMotion={prefersReducedMotion} />
    </section>
  );
}

const BackgroundEffects = memo<BackgroundEffectsProps>(({ isVisible, prefersReducedMotion }) => {
  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[url('/images/grid-pattern.svg')]"></div>
        <div className="absolute top-0 -left-48 w-96 h-96 bg-blue-400 dark:bg-blue-700 rounded-full mix-blend-multiply opacity-10 dark:opacity-5" />
        <div className="absolute bottom-0 -right-48 w-96 h-96 bg-purple-400 dark:bg-purple-700 rounded-full mix-blend-multiply opacity-10 dark:opacity-5" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[url('/images/grid-pattern.svg')]"></div>

      <div
        className={`
          absolute top-0 -left-48 w-96 h-96 
          bg-blue-400 dark:bg-blue-700 rounded-full 
          mix-blend-multiply opacity-20 dark:opacity-10
          transition-transform duration-[10s] ease-in-out
          ${isVisible ? 'animate-float' : ''}
        `}
        style={{
          filter: 'blur(24px)',
          willChange: 'transform',
        }}
      ></div>

      <div
        className={`
          absolute bottom-0 -right-48 w-96 h-96 
          bg-purple-400 dark:bg-purple-700 rounded-full 
          mix-blend-multiply opacity-20 dark:opacity-10
          transition-transform duration-[12s] ease-in-out
          ${isVisible ? 'animate-float-reverse' : ''}
        `}
        style={{
          filter: 'blur(24px)',
          willChange: 'transform',
          animationDelay: '1s'
        }}
      ></div>
    </div>
  );
});

const CTAButtons = memo<CTAButtonsProps>(({ isVisible, prefersReducedMotion }) => {
  const baseButtonClass = `
    transition-all duration-300 ease-out
    ${isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-4"}
  `;

  const loginButtonClass = `
    ${baseButtonClass}
    transition-delay-200
    group
    inline-flex items-center gap-2
    px-8 py-4
    bg-blue-600 hover:bg-blue-700
    text-white font-bold
    rounded-xl
    shadow-lg hover:shadow-blue-500/30
  `;

  const registerButtonClass = `
    ${baseButtonClass}
    transition-delay-300
    inline-flex items-center gap-2
    px-8 py-4
    bg-white hover:bg-gray-50
    text-blue-600 border-2 border-blue-100
    dark:bg-gray-800 dark:hover:bg-gray-750
    dark:text-blue-400 dark:border-blue-900/50
    font-bold rounded-xl
    shadow-sm hover:shadow-md
  `;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
      <Link href="/login" className="contents">
        <div className={loginButtonClass}>
          <span>Inicia sesión</span>
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
      <Link href="/register" className="contents">
        <div className={registerButtonClass}>
          <span>Crear cuenta</span>
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>

  );
});


const OptimizedWaveDivider = memo<OptimizedWaveDividerProps>(({ prefersReducedMotion }) => {
  if (prefersReducedMotion) {
    return (
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
        <svg
          className="relative w-full h-16 sm:h-24 text-white dark:text-gray-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,101.3L1200,107L1200,320L0,320Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // Versión animada pero más eficiente para dispositivos normales
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
      <svg
        className="relative w-full h-16 sm:h-24 text-white dark:text-gray-900"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          className="animate-wave-slow"
          d="M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,101.3L1200,107L1200,320L0,320Z"
          fill="currentColor"
          fillOpacity="1"
        />
        <path
          className="animate-wave opacity-30"
          d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,186.7C672,181,768,139,864,128C960,117,1056,139,1152,144L1200,144L1200,320L0,320Z"
          fill="currentColor"
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
});
