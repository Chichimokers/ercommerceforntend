"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

// Datos de ejemplo para los testimonios
const testimonials = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    role: "Cliente frecuente",
    image: "/testimonials/person1.jpg", // Ruta a imagen de testimonio
    rating: 5,
    text: "Es impresionante la calidad de los productos y la rapidez con la que llegan a mi familia en Cuba. Ha sido una experiencia confiable y el servicio al cliente es excepcional. ¡Totalmente recomendado!",
    location: "Miami, FL"
  },
  {
    id: 2,
    name: "Ana María Sánchez",
    role: "Cliente desde 2022",
    image: "/testimonials/person2.jpg",
    rating: 5,
    text: "Pensé que enviar productos a mi familia en Cuba sería complicado, pero EsAki lo ha hecho increíblemente sencillo. Los productos llegan en perfectas condiciones y mi familia está encantada.",
    location: "Madrid, España"
  },
  {
    id: 3,
    name: "Roberto González",
    role: "Cliente verificado",
    image: "/testimonials/person3.jpg",
    rating: 4,
    text: "He probado varios servicios similares, pero ninguno tiene la variedad de productos y la confiabilidad de EsAki. El seguimiento de los envíos es detallado y el soporte responde rápidamente.",
    location: "Ciudad de México, México"
  },
  {
    id: 4,
    name: "Elena Martínez",
    role: "Cliente frecuente",
    image: "/testimonials/person4.jpg",
    rating: 5,
    text: "Mi familia en La Habana siempre recibe todo en tiempo récord. La calidad de los productos es excelente y los precios son justos. EsAki se ha convertido en nuestro puente de comunicación y cariño.",
    location: "Nueva York, NY"
  }
];

// Componente para las estrellas de valoración
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            }`}
        />
      ))}
    </div>
  );
};

// Componente para un testimonio individual
const TestimonialCard = ({ testimonial, isActive }: { testimonial: typeof testimonials[0]; isActive: boolean }) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-500 ${isActive ? "opacity-100 scale-100" : "opacity-40 scale-95 pointer-events-none"
        }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0.4, y: 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="relative rounded-full overflow-hidden h-16 w-16 md:h-20 md:w-20 border-2 border-blue-100 dark:border-blue-900 flex-shrink-0">
          {/* Fallback para imágenes que podrían no existir */}
          <Image
            src={testimonial.image || "/placeholder-avatar.jpg"}
            alt={testimonial.name}
            fill
            sizes="(max-width: 768px) 64px, 80px"
            className="object-cover"
            onError={(e) => {
              // Si hay error de carga, usar placeholder
              e.currentTarget.src = "/placeholder-avatar.jpg";
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {testimonial.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                {testimonial.role}
                <span className="inline-block h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                {testimonial.location}
              </p>
            </div>
            <RatingStars rating={testimonial.rating} />
          </div>

          <div className="relative">
            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-100 dark:text-blue-900/30" />
            <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed pt-4 pl-6">
              {testimonial.text}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal de testimonios
const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const nextTestimonial = useCallback(() => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);

    return () => clearInterval(interval);
  }, [autoplay, nextTestimonial]);

  return (
    <div className="relative">
      {/* Contenedor de testimonios */}
      <div className="relative overflow-hidden py-4">
        <div className="grid grid-cols-1 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`transition-opacity duration-500 ${activeIndex === index ? 'block' : 'hidden'}`}
            >
              <TestimonialCard testimonial={testimonial} isActive={activeIndex === index} />
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center justify-center mt-8 gap-4">
        <button
          onClick={prevTestimonial}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Testimonio anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${activeIndex === index
                  ? 'bg-blue-500 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-300 dark:hover:bg-blue-700'
                }`}
              aria-label={`Ir al testimonio ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextTestimonial}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Siguiente testimonio"
        >
          <ChevronRight size={20} />
        </button>

        <button
          onClick={() => setAutoplay(prev => !prev)}
          className={`ml-2 p-2 rounded-full text-xs font-medium ${autoplay
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
        >
          {autoplay ? 'Auto' : 'Manual'}
        </button>
      </div>
    </div>
  );
};

export default TestimonialsSection;