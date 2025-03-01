import { FaExchangeAlt, FaHandshake, FaShieldAlt, FaTh } from "react-icons/fa";
import dynamic from "next/dynamic";

const PromisesCard = dynamic(() => import("../cards/promises-card"), {
  loading: () => (
    <div
      className="group w-full h-full bg-gray-200 dark:bg-gray-700 bg-opacity-40 backdrop-blur-sm p-6 rounded-xl animate-pulse"
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
    <div className="w-full mx-auto grid grid-cols-1 xxs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 bg-blue-100  dark:bg-indigo-950 dark:bg-opacity-40 p-8 border-y border-default-50">
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
        description="Obtén beneficios seleccionados, como descuentos exclusivos, protección mejorada y soporte adicional, para ayudar a hacer crecer tu negocio en cada paso del camino."
        icon={<FaHandshake />}
        title="Experiencia comercial personalizada"
      />
      <PromisesCard
        description="Realiza pedidos sin problemas, desde la búsqueda de productos/proveedores hasta la gestión de pedidos, pagos y cumplimiento."
        icon={<FaExchangeAlt />}
        title="Solución comercial integral"
      />
    </div>
  );
};
