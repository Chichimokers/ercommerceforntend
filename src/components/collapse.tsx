import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapseProps {
  /**
   * Determina si el contenido está visible
   */
  open: boolean;

  /**
   * Duración de la animación en segundos
   */
  duration?: number;

  /**
   * Contenido a mostrar/ocultar
   */
  children: React.ReactNode;

  /**
   * Clase CSS personalizada
   */
  className?: string;

  /**
   * Efecto de animación
   */
  animation?: "height" | "fade" | "both";
}

/**
 * Componente Collapse que muestra/oculta contenido con animación
 */
const Collapse = ({
  open,
  duration = 0.3,
  children,
  className = "",
  animation = "both"
}: CollapseProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(0);

  // Actualizar altura cuando cambia el contenido o el estado
  useEffect(() => {
    if (!contentRef.current) return;

    if (open) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      // Cambiar a "auto" después de la animación para permitir contenido dinámico
      const timer = setTimeout(() => {
        setHeight("auto");
      }, duration * 1000);

      return () => clearTimeout(timer);
    } else {
      // Primero establecer la altura específica antes de animarla a cero
      if (height === "auto") {
        setHeight(contentRef.current.scrollHeight);
        // Forzar un reflow
        contentRef.current.offsetHeight;
      }

      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [open, children, duration]);

  // Variantes de animación para Framer Motion
  const variants = {
    open: {
      height: height === "auto" ? "auto" : `${height}px`,
      opacity: 1
    },
    closed: {
      height: "0px",
      opacity: animation === "height" ? 1 : 0
    }
  };

  return (
    <AnimatePresence initial={false}>
      <motion.div
        ref={contentRef}
        className={`overflow-hidden ${className}`}
        initial="closed"
        animate={open ? "open" : "closed"}
        variants={variants}
        transition={{
          duration: duration,
          ease: "easeInOut"
        }}
        style={{
          pointerEvents: open ? "auto" : "none",
          visibility: height === 0 && !open ? "hidden" : "visible"
        }}
        aria-hidden={!open}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Collapse;