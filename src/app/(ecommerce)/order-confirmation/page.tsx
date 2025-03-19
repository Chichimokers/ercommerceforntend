"use client";

import React, { useEffect, useState } from "react";
import { CheckCircleIcon, ShoppingBag, ClipboardCheck, Truck, CreditCard, ArrowLeftIcon, HomeIcon, Calendar, Clock, Receipt } from "lucide-react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Button } from "@heroui/react";
import { QRCodeCanvas } from "qrcode.react";
import { formatCurrency } from "@components/format-currency";
import { CurrencyAndExchangeRateContext } from "@contexts/exchange-rate-currency-context";
import PaymentMethodButton from "@hooks/usePaymentMethodSelector";
import { useRouter } from "next/navigation";

interface Order {
  receiver_name: string;
  phone: string;
  province: string;
  address: string;
  CI: string;
  subtotal: number;
  id: string;
  created_at: string;
  status: string;
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { rateExchange } = React.useContext(CurrencyAndExchangeRateContext);
  const [isAnimated, setIsAnimated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedOrder = localStorage.getItem("orderDetails");
    if (storedOrder) {
      try {
        setOrder(JSON.parse(storedOrder));
      } catch (error) {
        console.error("Error al parsear los detalles de la orden", error);
      } finally {
        localStorage.removeItem("orderDetails");
        setIsLoaded(true);
      }
    } else {
      setIsLoaded(true);
    }

    // Activar animaciones después de un breve retraso
    const timer = setTimeout(() => setIsAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const formattedDate = order
    ? new Date(order.created_at).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

  const formattedTime = order
    ? new Date(order.created_at).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

  const spanishStatus = {
    accepted: 'Aceptada',
    cancelled: 'Cancelada',
    retired: 'Retirada',
    pending: 'Pendiente',
    paid: 'Pagada',
    default: 'Pendiente',
  } as const;

  const statusColors = {
    accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300 border-red-300 dark:border-red-700',
    retired: 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    paid: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border-green-300 dark:border-green-700',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300 border-gray-300 dark:border-gray-700',
  } as const;

  const statusColor = order?.status
    ? statusColors[order.status as keyof typeof statusColors] || statusColors.default
    : statusColors.default;

  // Obtener el estado actual del pedido para el timeline
  const currentStatus = order?.status || 'pending';

  // Definir los pasos del timeline basados en el estado actual
  const timelineSteps = [
    {
      name: 'Pedido realizado',
      active: true,
      icon: ClipboardCheck
    },
    {
      name: 'Pendiente de pago',
      active: ['accepted', 'paid', 'retired'].includes(currentStatus),
      icon: CreditCard
    },
    {
      name: 'Pago confirmado',
      active: ['paid', 'retired'].includes(currentStatus),
      icon: CheckCircleIcon
    },
    {
      name: 'Enviado',
      active: ['retired'].includes(currentStatus),
      icon: Truck
    }
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 py-12">
      <Toaster
        toastOptions={{
          className: "dark:bg-gray-800 dark:text-white",
          success: { className: "border border-green-500" },
          error: { className: "border border-red-500" },
        }}
      />

      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile/orders" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            <ShoppingBag className="h-4 w-4 mr-2" />
            <span>Mis pedidos</span>
          </Link>
        </div>

        <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transition-all duration-700 ${isAnimated ? 'opacity-100 transform-none' : 'opacity-0 translate-y-8'}`}>
          {/* Header con animación de confeti */}
          <div className="relative bg-gradient-to-r from-primary to-blue-600 dark:from-primary-600 dark:to-blue-500 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('/confetti-bg.svg')] opacity-10"></div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full shrink-0 shadow-lg">
                <CheckCircleIcon className="h-12 w-12" />
              </div>

              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold">¡Pedido Confirmado!</h1>
                <p className="text-white/90 mt-2 text-lg">
                  Gracias {order?.receiver_name ? `${order.receiver_name.split(' ')[0]}` : "por tu compra"}
                </p>

                {order && (
                  <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center border border-white/20">
                      <ClipboardCheck className="h-4 w-4 mr-2 opacity-80" />
                      <span className="font-medium">Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>

                    <div className={`${statusColor} rounded-lg px-4 py-2 flex items-center border`}>
                      <span className="text-sm font-medium capitalize">
                        {spanishStatus[order?.status as keyof typeof spanishStatus] || "Pendiente"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Precio grande a la derecha */}
              {order && (
                <div className="md:ml-auto bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 text-center">
                  <div className="text-white/70 text-sm font-medium mb-1">TOTAL</div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(
                      (order.subtotal * (rateExchange?.exchangeRate || 1)),
                      rateExchange?.currency,
                      rateExchange?.symbol
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline del progreso del pedido */}
          <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between w-full">
              {timelineSteps.map((step, index) => (
                <React.Fragment key={step.name}>
                  {/* Paso del timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500
                        ${step.active
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }
                        ${isAnimated && step.active ? 'scale-110' : 'scale-100'}
                      `}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`hidden sm:block text-xs mt-2 font-medium 
                      ${step.active
                        ? 'text-primary dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>

                  {/* Línea conectora (excepto después del último paso) */}
                  {index < timelineSteps.length - 1 && (
                    <div className="flex-1 h-1 mx-2">
                      <div
                        className={`h-full ${step.active && timelineSteps[index + 1].active
                          ? 'bg-primary dark:bg-primary-400'
                          : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Cuerpo con la información del pedido */}
          <div className="p-6 md:p-8">
            {order ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Información de envío */}
                  <div className={`space-y-5 transition-all duration-700 delay-100 ${isAnimated ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
                    <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-primary" />
                      Información de envío
                    </h3>

                    <div className="space-y-4 rounded-xl bg-gray-50 dark:bg-gray-900/30 p-4 border border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Destinatario</p>
                        <p className="font-medium">{order.receiver_name}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Teléfono</p>
                        <p className="font-medium">{order.phone}</p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Dirección</p>
                        <p className="font-medium">
                          {order.address}, {order.province}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Identificación</p>
                        <p className="font-medium">{order.CI}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del pedido */}
                  <div className={`space-y-5 transition-all duration-700 delay-200 ${isAnimated ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}>
                    <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
                      <Receipt className="h-5 w-5 mr-2 text-primary" />
                      Detalles del pedido
                    </h3>

                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900/30 p-4 border border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Fecha
                          </p>
                          <p className="font-medium">{formattedDate}</p>
                        </div>

                        <div>
                          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Hora
                          </p>
                          <p className="font-medium">{formattedTime}</p>
                        </div>
                      </div>

                      <div className="flex justify-center py-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                          <QRCodeCanvas
                            value={order.id}
                            size={150}
                            className="h-[140px] w-[140px]"
                            level="H"
                          />
                          <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-400">
                            ID: {order.id.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 transition-all duration-700 delay-300 ${isAnimated ? 'opacity-100 transform-none' : 'opacity-0'}`}>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start md:items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-full shrink-0">
                      <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Próximo paso: Realizar el pago</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Revise su correo electrónico para obtener instrucciones sobre cómo completar el pago de su pedido.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No se encontraron detalles del pedido
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Es posible que hayas recargado la página o accedido directamente a esta URL
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row justify-center gap-3">
            {/* Botón de pago (reemplaza "Volver al inicio") */}
            <Button
              color="success"
              variant="shadow"
              className={`flex items-center justify-center gap-2 font-semibold transition-all duration-700 delay-400 ${isAnimated ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}
              fullWidth
              as="a"
              href="/checkout/payment"
            >
              <CreditCard size={18} />
              Proceder a pagar
            </Button>

            <PaymentMethodButton
              className="w-full"
              orderId={order!.id}
              onSuccess={() => {
                router.push('/payment/success');
              }}
              onError={(error) => {
                console.error('Error de pago:', error);
              }}
            />

            <Link href="/products" passHref>
              <Button
                color="primary"
                variant="flat"
                className={`flex items-center justify-center gap-2 transition-all duration-700 delay-500 ${isAnimated ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'}`}
                fullWidth
              >
                <ShoppingBag size={18} />
                Seguir comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
