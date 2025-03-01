import { FaExchangeAlt, FaHandshake, FaShieldAlt, FaTh } from "react-icons/fa";
import dynamic from "next/dynamic";

const PromisesCard = dynamic(() => import("../cards/promises-card"), {
  loading: () => (
    <div
      className="group w-full h-full bg-gray-200 dark:bg-gray-700 bg-opacity-40 backdrop-blur-sm px-8 py-20 rounded-xl animate-pulse"
    >
      <div className="h-12 w-12 mb-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      <div className="h-6 w-3/4 mb-3 rounded-xl bg-gray-300 dark:bg-gray-600"></div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
        <div className="h-4 w-5/6 rounded bg-gray-300 dark:bg-gray-600"></div>
        <div className="h-4 w-2/3 rounded bg-gray-300 dark:bg-gray-600"></div>
      </div>
    </div>
  )
});

export const PromisesPanel = () => {
  return (
    <section className="relative">
      {/* Fondo con degradado */}
      <div className="bg-blue-50 dark:bg-gray-900 py-12 px-4 sm:px-6 md:px-8 sm:py-12 md:py-20 transition-colors duration-300">

        {/* Título de sección (opcional) */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100">
            ¿Por qué elegirnos?
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-2">
            Descubre nuestras principales ventajas para tu negocio
          </p>
        </div>

        {/* Contenedor de tarjetas con wave divider abajo */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <PromisesCard
              description="Explora productos y proveedores para tu negocio entre millones de ofertas en todo el mundo."
              icon={<FaTh />}
              title="Millones de ofertas comerciales"
            />
            <PromisesCard
              description="Asegura la calidad de producción con proveedores verificados, con tus pedidos protegidos desde el pago hasta la entrega."
              icon={<FaShieldAlt />}
              title="Calidad y transacciones garantizadas"
            />
            <PromisesCard
              description="Obtén descuentos exclusivos, protección mejorada y soporte adicional para impulsar tu negocio en cada paso."
              icon={<FaHandshake />}
              title="Experiencia comercial personalizada"
            />
            <PromisesCard
              description="Realiza pedidos sin complicaciones, desde la búsqueda de productos hasta la gestión de pagos y cumplimiento."
              icon={<FaExchangeAlt />}
              title="Solución comercial integral"
            />
          </div>

          {/* Wave divider en la parte inferior */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] -z-10">
            <svg
              className="relative block w-[calc(100%+1.3px)] h-20 text-white dark:text-gray-900"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
            >
              <path
                fill="currentColor"
                d="M321.39,56.16c59.65,0,90.66,28.13,131.82,48.55C504.52,118.13,545.28,120,585,120c75.31,0,148.08-27.89,218.17-57.42,70.07-29.53,138.26-59,213.24-59,48.47,0,95.86,13.52,143.59,27.05V0H0V27.05C60.19,8.05,120.37,56.16,180.56,56.16Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
