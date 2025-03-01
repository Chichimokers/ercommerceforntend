"use client";
import React from "react";
import Link from "next/link";

export default function ReadyToStart() {
  return (
    <section
      className="
        relative 
        bg-[url('/images/hero-bg.jpg')] 
        bg-cover 
        bg-center 
        bg-no-repeat
      "
    >
      {/* Capa oscura semitransparente para mayor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800" />

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold">
          ¿Todo listo para empezar?
        </h2>
        <p className="max-w-xl text-base md:text-lg leading-relaxed">
          ¡Regístrate hoy mismo para explorar millones de productos de
          proveedores de confianza!
          Dale a tu negocio el impulso que necesita.
        </p>

        {/* Botón principal de CTA */}
        <Link href="/login">
          <button
            className="
              inline-block 
              px-8 
              py-3 
              bg-orange-500 
              hover:bg-orange-600 
              text-white 
              font-semibold 
              rounded-full 
              shadow-lg 
              transition-transform 
              transform 
              hover:-translate-y-1
              active:scale-95
            "
          >
            Inicia sesión
          </button>
        </Link>
      </div>

      {/* Olas decorativas en la parte inferior */}
      <WaveDivider />
    </section>
  );
}

/**
 * Olas decorativas (Wave Divider) en la parte inferior
 * Ajusta el color con fill=\"currentColor\" según tu preferencia
 */
function WaveDivider() {
  return (
    <div className="relative -mt-1">
      <svg
        className="w-full h-16 text-white dark:text-gray-900"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          fillOpacity="1"
          d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,192C840,213,960,203,1080,186.7C1200,171,1320,149,1380,138.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        ></path>
      </svg>
    </div>
  );
}
