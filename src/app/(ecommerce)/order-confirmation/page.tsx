"use client";

import React, { useEffect, useState } from "react";
import { CheckCircleIcon, ShoppingBag, ClipboardCheck, Truck, ArrowLeftIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Button } from "@heroui/react";
import { QRCodeCanvas } from "qrcode.react";
import { formatCurrency } from "@components/format-currency";
import { CurrencyAndExchangeRateContext } from "@contexts/exchange-rate-currency-context";

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
    default: 'Desconocido',
  } as const;

  const statusColors = {
    accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300',
    retired: 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300',
  } as const;

  const statusColor = order?.status
    ? statusColors[order.status as keyof typeof statusColors] || statusColors.default
    : statusColors.default;

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4 py-12"
    >
      <Toaster
        toastOptions={{
          className: "dark:bg-gray-800 dark:text-white",
          success: { className: "border border-green-500" },
          error: { className: "border border-red-500" },
        }}
      />

      <div className="w-full max-w-3xl">
        <div
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            <span>Volver al inicio</span>
          </Link>

          <Link href="/profile/orders" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            <ShoppingBag className="h-4 w-4 mr-2" />
            <span>Mis pedidos</span>
          </Link>
        </div>

        <div
          className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-300 p-8 text-white">

            <div className="flex items-center">
              <div
                className="bg-white/20 backdrop-blur-sm p-4 rounded-full mr-4"
              >
                <CheckCircleIcon className="h-10 w-10" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">¡Pedido Confirmado!</h1>
                <p className="text-white/80 mt-1">
                  Gracias {order?.receiver_name ? `${order.receiver_name}` : "por tu compra"}
                </p>
              </div>
            </div>

            {order && (
              <div className="mt-5 flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center">
                  <ClipboardCheck className="h-4 w-4 mr-2 opacity-80" />
                  <span className="text-sm">Pedido #{order.id.slice(0, 8)}</span>
                </div>

                <div className={`${statusColor} rounded-lg px-4 py-2 flex items-center`}>
                  <span className="text-sm font-medium capitalize">
                    {spanishStatus[order?.status as keyof typeof spanishStatus] || "Estado desconocido"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cuerpo con la información del pedido */}
          <div className="p-6 md:p-8">
            {order ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Información de envío */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-primary-500" />
                      Información de envío
                    </h3>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Destinatario</p>
                      <p className="font-medium">{order.receiver_name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                      <p className="font-medium">{order.phone}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                      <p className="font-medium">
                        {order.address}, {order.province}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Identificación</p>
                      <p className="font-medium">{order.CI}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2 text-primary-500" />
                      Detalles del pedido
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
                        <p className="font-medium">{formattedDate}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hora</p>
                        <p className="font-medium">{formattedTime}</p>
                      </div>
                    </div>

                    <div className="flex justify-center p-4 mt-2">
                      <div className="p-3 bg-white rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <QRCodeCanvas
                          value={order.id}
                          size={150}
                          className="h-[120px] w-[120px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    Recibirá un correo cuando su pedido sea revisado por la administración para proceder al pago.
                  </p>
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
            <Link href="/" passHref>
              <Button
                color="default"
                variant="flat"
                className="flex items-center justify-center gap-2"
                fullWidth
              >
                <HomeIcon size={18} />
                Volver al inicio
              </Button>
            </Link>

            <Link href="/products" passHref>
              <Button
                color="primary"
                variant="shadow"
                className="flex items-center justify-center gap-2"
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
