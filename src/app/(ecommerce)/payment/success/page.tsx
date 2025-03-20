"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ChevronRight, ArrowLeft, Clock } from "lucide-react";

// Componente principal que NO usa useSearchParams
export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-white text-3xl font-bold mt-4">¡Gracias por tu compra!</h1>
            <p className="text-blue-100 mt-2">Tu pedido ha sido procesado correctamente</p>
          </div>

          {/* Envolver el contenido con Suspense para manejar useSearchParams */}
          <Suspense fallback={
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-500 border-blue-200 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando detalles del pedido...</p>
            </div>
          }>
            <ThankYouContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Componente secundario que SÍ usa useSearchParams
function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);

  const orderId = searchParams?.get('order_id') || 'N/A';
  const total = searchParams?.get('total') || '0';

  React.useEffect(() => {
    setMounted(true);

    const launchConfetti = () => {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 }
        });

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    };

    if (typeof window !== 'undefined') {
      setTimeout(launchConfetti, 500);
    }
  }, []);

  if (!mounted) return (
    <div className="p-6 flex justify-center">
      <p className="text-gray-600 dark:text-gray-400">Inicializando...</p>
    </div>
  );

  return (
    <>
      <div className="p-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">Detalles del pedido</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Número de pedido</span>
              <span className="font-medium text-gray-900 dark:text-gray-200">{orderId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Fecha</span>
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {new Date().toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-bold text-green-600">{total ? `${total}` : 'Calculando...'}</span>
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">
            ¿Qué sucede ahora?
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mt-1">
                <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-gray-800 dark:text-gray-200 font-medium">Pedido confirmado</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Hemos recibido tu pedido y estamos preparándolo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mt-1">
                <Clock size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-gray-800 dark:text-gray-200 font-medium">Preparación en curso</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Recibirás un email con los detalles y el seguimiento de tu pedido.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/pedidos"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex-1"
          >
            <ShoppingBag size={18} />
            Ver mis pedidos
            <ChevronRight size={16} />
          </Link>

          <Link
            href="/products"
            className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors flex-1"
          >
            <ArrowLeft size={18} />
            Volver a la tienda
          </Link>
        </div>
      </div>

      <div className="text-center border-t border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Si tienes alguna duda sobre tu pedido, no dudes en{' '}
          <Link href={`/mailto: ${process.env.EMAIL}`} className="text-blue-600 dark:text-blue-400 hover:underline">
            contactarnos
          </Link>.
        </p>
      </div>
    </>
  );
}