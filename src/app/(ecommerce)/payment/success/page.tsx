"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ChevronRight, ArrowLeft, Clock } from "lucide-react";

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const orderId = searchParams?.get('order_id') || 'N/A';
  const total = searchParams?.get('total') || '0';

  useEffect(() => {
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
            </motion.div>
            <h1 className="text-white text-3xl font-bold mt-4">¡Gracias por tu compra!</h1>
            <p className="text-blue-100 mt-2">Tu pedido ha sido procesado correctamente</p>
          </div>

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
                  <span className="font-bold text-green-600">{total ? `${total}€` : 'Calculando...'}</span>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">
                ¿Qué sucede ahora?
              </h3>

              <div className="space-y-4">
                <motion.div
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mt-1">
                    <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 dark:text-gray-200 font-medium">Pedido confirmado</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Hemos recibido tu pedido y estamos preparándolo.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mt-1">
                    <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 dark:text-gray-200 font-medium">Preparación en curso</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Recibirás un email con los detalles y el seguimiento de tu pedido.
                    </p>
                  </div>
                </motion.div>
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
        </motion.div>
      </div>
    </div>
  );
}