"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw, HelpCircle, ShoppingCart, ChevronRight } from "lucide-react";

// Componente principal que NO usa useSearchParams directamente
export default function PaymentErrorPage() {
  return (
    <div className="min-h-screen bg-red-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-500 p-6 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h1 className="text-white text-3xl font-bold mt-4">Error en el pago</h1>
            <p className="text-red-100 mt-2">
              No pudimos procesar tu pago correctamente
            </p>
          </div>

          {/* Envolver el contenido con Suspense para manejar useSearchParams */}
          <Suspense fallback={
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-red-500 border-red-200 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando detalles del error...</p>
            </div>
          }>
            <PaymentErrorContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Componente secundario que SÍ usa useSearchParams
function PaymentErrorContent() {
  const searchParams = useSearchParams();

  const errorCode = searchParams?.get('code') || 'unknown';
  const errorMessage = searchParams?.get('message') || 'Ha ocurrido un error al procesar tu pago';
  const orderId = searchParams?.get('order_id') || 'N/A';

  const getErrorExplanation = (code: string) => {
    switch (code) {
      case 'card_declined':
        return 'Tu tarjeta ha sido rechazada por el banco. Por favor, verifica los fondos disponibles o utiliza otro método de pago.';
      case 'expired_card':
        return 'La tarjeta que utilizaste ha expirado. Por favor, utiliza una tarjeta vigente.';
      case 'insufficient_funds':
        return 'No hay fondos suficientes en la tarjeta. Por favor, utiliza otra tarjeta o método de pago.';
      case 'invalid_cvc':
        return 'El código de seguridad (CVC) ingresado no es válido.';
      case 'processing_error':
        return 'Ocurrió un error al procesar el pago. Este problema podría ser temporal.';
      default:
        return 'Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta con atención al cliente.';
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="border border-red-200 dark:border-red-900/30 rounded-xl p-5 mb-6 bg-red-50 dark:bg-red-900/10">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">Detalles del error</h3>
          <div className="space-y-3">
            {orderId !== 'N/A' && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Número de pedido</span>
                <span className="font-medium text-gray-900 dark:text-gray-200">{orderId}</span>
              </div>
            )}
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
              <span className="text-gray-600 dark:text-gray-400">Código de error</span>
              <span className="font-mono text-red-600 dark:text-red-400">{errorCode}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">
            ¿Qué ha ocurrido?
          </h3>

          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {errorMessage}
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              {getErrorExplanation(errorCode)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">
            ¿Qué puedo hacer ahora?
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mt-1">
                <RefreshCw size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-gray-800 dark:text-gray-200 font-medium">Intentar nuevamente</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Puedes intentar procesar tu pago nuevamente, posiblemente con otro método de pago.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mt-1">
                <HelpCircle size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-gray-800 dark:text-gray-200 font-medium">Contactar con soporte</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Si el problema persiste, nuestro equipo de soporte estará encantado de ayudarte.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/shopping-cart"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex-1"
          >
            <ShoppingCart size={18} />
            Volver al carrito
            <ChevronRight size={16} />
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors flex-1"
          >
            <ArrowLeft size={18} />
            Ir al inicio
          </Link>
        </div>
      </div>

      <div className="text-center border-t border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          ¿Necesitas ayuda con tu pedido?{' '}
          <Link href="/contacto" className="text-red-600 dark:text-red-400 hover:underline">
            Contacta con nuestro equipo
          </Link>.
        </p>
      </div>
    </>
  );
}