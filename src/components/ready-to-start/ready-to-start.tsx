// No "use client" here - componente servidor

import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ClientInteractivity from "./client/interactivity";

export default function ReadyToStart() {
  return (
    <section
      id="ready-to-start"
      className="
        relative 
        overflow-hidden
        bg-indigo-100
        dark:bg-blue-950
        py-20 sm:py-28
      "
    >
      {/* Fondo estático para SSR inicial */}
      {/*<div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[url('/images/grid-pattern.svg')]"></div>
        <div className="absolute top-0 -left-48 w-96 h-96 bg-blue-400 dark:bg-blue-700 rounded-full mix-blend-multiply opacity-10 dark:opacity-5" />
        <div className="absolute bottom-0 -right-48 w-96 h-96 bg-purple-400 dark:bg-purple-700 rounded-full mix-blend-multiply opacity-10 dark:opacity-5" />
      </div>*/}

      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent mb-6">
            ¿Todo listo para empezar?
          </h2>

          <p className="text-base md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-10 max-w-xl mx-auto">
            ¡Regístrate hoy mismo para explorar millones de productos de
            proveedores de confianza! Dale a tu negocio el impulso que necesita.
          </p>

          {/* Botones estáticos (se reemplazarán con versiones animadas en el cliente) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
            <Link href="/login" className="contents">
              <span className="
                inline-flex items-center gap-2
                px-8 py-4
                bg-blue-600
                text-white font-bold
                rounded-xl
                shadow-lg
              ">
                <span>Inicia sesión</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>

            <Link href="/register" className="contents">
              <span className="
                inline-flex items-center gap-2
                px-8 py-4
                bg-white
                text-blue-600 border-2 border-blue-100
                dark:bg-gray-800
                dark:text-blue-400 dark:border-blue-900/50
                font-bold rounded-xl
                shadow-sm
              ">
                <span>Crear cuenta</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
          </div>

          <div className="flex items-center justify-center mt-10 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>100% seguro y confidencial</span>
          </div>
        </div>
      </div>

      {/* Ola estática para SSR inicial */}
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

      {/* Componente cliente para efectos interactivos - cargado después del SSR */}
      <Suspense fallback={null}>
        <ClientInteractivity />
      </Suspense>
    </section>
  );
}