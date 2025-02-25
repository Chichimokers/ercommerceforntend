"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import React from "react";
import { CheckCircle, Edit, ScrollText, Package, CreditCard, Truck, Undo2, Lock } from "lucide-react";

const icons = {
  CheckCircle,
  Edit,
  ScrollText,
  Package,
  CreditCard,
  Truck,
  Undo2,
  Lock
};

//Calmate perra
type SectionIcon = keyof typeof icons;

export const TermsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium transition-colors group"
      >
        Términos y Condiciones
        <span className="block h-0.5 max-w-0 bg-primary-600 group-hover:max-w-full transition-all duration-300" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-lg flex items-start justify-center p-4 pt-20 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="relative bg-gradient-to-br from-white to-gray-50 dark:from-default-100 dark:to-default-90 rounded-2xl shadow-2xl max-w-3xl w-full p-8 mb-8 min-h-[400px]"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-default-100 dark:hover:bg-default-50 transition-all hover:scale-105"
              aria-label="Cerrar"
            >
              <X className="w-7 h-7 text-default-600 dark:text-default-400" />
            </button>

            <div className="flex flex-col h-full">
              <div className="text-center mb-6">
                <div className="bg-primary-100/50 dark:bg-primary-900/20 w-max mx-auto p-4 rounded-2xl mb-4">
                  <ScrollText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  Términos y Condiciones
                </h2>
              </div>

              <div className="prose dark:prose-invert flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-default-200 dark:scrollbar-thumb-default-50">
                {[
                  {
                    title: "1. Aceptación de los Términos",
                    icon: "Lock" as SectionIcon,
                    content: "Al utilizar nuestro sitio web y realizar compras, aceptas estar sujeto a estos términos y condiciones."
                  },
                  {
                    title: "2. Proceso de Compra",
                    icon: "Package" as SectionIcon,
                    content: "Los productos están sujetos a disponibilidad. Nos reservamos el derecho de cancelar pedidos por errores en precios o inventario."
                  },
                  {
                    title: "3. Pagos",
                    icon: "CreditCard" as SectionIcon,
                    content: "Aceptamos principales métodos de pago electrónicos. Los precios incluyen impuestos aplicables."
                  },
                  {
                    title: "4. Envíos",
                    icon: "Truck" as SectionIcon,
                    content: "Los tiempos de entrega son estimados. No nos hacemos responsables por retrasos de empresas de transporte."
                  },
                  {
                    title: "5. Devoluciones",
                    icon: "Undo2" as SectionIcon,
                    content: "Productos defectuosos pueden devolverse dentro de los 7 días posteriores a la recepción. Deben estar en su empaque original."
                  },
                  {
                    title: "6. Privacidad",
                    icon: "Lock" as SectionIcon,
                    content: "Protegemos tus datos personales según nuestra Política de Privacidad. No compartimos información con terceros sin consentimiento."
                  },
                  {
                    title: "7. Propiedad Intelectual",
                    icon: "ScrollText" as SectionIcon,
                    content: "Todo el contenido del sitio (logos, textos, imágenes) es propiedad exclusiva de la empresa."
                  },
                  {
                    title: "8. Modificaciones",
                    icon: "Edit" as SectionIcon,
                    content: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación."
                  }
                ].map((section, index) => (
                  <div key={index} className="group relative pl-10 mb-6 last:mb-0">
                    <div className="absolute left-0 top-1.5 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      {React.createElement(icons[section.icon], {
                        className: "w-4 h-4 text-default-600"
                      })}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-default-800">
                      {section.title}
                    </h3>
                    <p className="text-default-600 leading-relaxed">
                      {section.content}
                    </p>
                    {index < 7 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-default-200 to-transparent dark:via-default-600 my-6" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-default-100 hover:bg-default-200 text-default-600 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}; 