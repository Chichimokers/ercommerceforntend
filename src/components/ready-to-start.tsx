"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ReadyToStart() {
  const [isVisible, setIsVisible] = useState(false);

  // Detectar cuando el componente entra en la vista
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const currentElement = document.getElementById("ready-to-start");
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
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
      {/* Fondo con patrón dinámico */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[url('/images/grid-pattern.svg')]"></div>
        <motion.div
          className="absolute top-0 -left-48 w-96 h-96 bg-blue-400 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
          animate={{
            x: isVisible ? [0, 30, 0] : 0,
            y: isVisible ? [0, 15, 0] : 0,
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 -right-48 w-96 h-96 bg-purple-400 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
          animate={{
            x: isVisible ? [0, -20, 0] : 0,
            y: isVisible ? [0, -10, 0] : 0,
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            delay: 1,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent mb-6">
            ¿Todo listo para empezar?
          </h2>

          <p className="text-base md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-10 max-w-xl mx-auto">
            ¡Regístrate hoy mismo para explorar millones de productos de
            proveedores de confianza! Dale a tu negocio el impulso que necesita.
          </p>

          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/login">
                <button
                  className="
                    group
                    inline-flex items-center gap-2
                    px-8 
                    py-4
                    bg-blue-600 
                    hover:bg-blue-700
                    text-white 
                    font-bold
                    rounded-xl
                    shadow-lg 
                    hover:shadow-blue-500/30
                    transition-all 
                    duration-300
                  "
                  aria-label="Iniciar sesión"
                >
                  <span>Inicia sesión</span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/register">
                <button
                  className="
                    inline-flex items-center gap-2
                    px-8 
                    py-4
                    bg-white
                    hover:bg-gray-50
                    text-blue-600
                    border-2
                    border-blue-100
                    dark:bg-gray-800
                    dark:hover:bg-gray-750
                    dark:text-blue-400
                    dark:border-blue-900/50
                    font-bold
                    rounded-xl
                    shadow-sm
                    hover:shadow-md
                    transition-all 
                    duration-300
                  "
                  aria-label="Registrarse"
                >
                  Crear cuenta
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Insignia de confianza */}
          <motion.div
            className="flex items-center justify-center mt-10 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>100% seguro y confidencial</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Olas decorativas en la parte inferior */}
      <WaveDivider />
    </section>
  );
}

/**
 * Olas decorativas mejoradas con animación
 */
function WaveDivider() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
      <svg
        className="relative w-full h-16 sm:h-24 text-white dark:text-gray-900"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          initial={{ opacity: 0, d: "M0,32L48,48C96,64,192,96,288,96C384,96,480,64,576,48C672,32,768,32,864,58.7C960,85,1056,139,1152,149.3L1200,160L1200,320L0,320Z" }}
          animate={{
            opacity: 1,
            d: "M0,32L48,37.3C96,43,192,53,288,80C384,107,480,149,576,154.7C672,160,768,128,864,112C960,96,1056,96,1152,101.3L1200,107L1200,320L0,320Z"
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          fill="currentColor"
          fillOpacity="1"
        />

        <motion.path
          initial={{ opacity: 0, d: "M0,160L48,138.7C96,117,192,75,288,74.7C384,75,480,117,576,149.3C672,181,768,203,864,192C960,181,1056,139,1152,133.3L1200,128L1200,320L0,320Z" }}
          animate={{
            opacity: 0.6,
            d: "M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,186.7C672,181,768,139,864,128C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L0,320Z"
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5
          }}
          fill="currentColor"
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
}
