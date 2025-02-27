"use client";

import React, { useEffect, useState } from "react";
import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

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

  useEffect(() => {
    // Se espera que al crear la orden hayas guardado sus detalles en localStorage
    const storedOrder = localStorage.getItem("orderDetails");
    if (storedOrder) {
      try {
        setOrder(JSON.parse(storedOrder));
      } catch (error) {
        console.error("Error al parsear los detalles de la orden", error);
      }
    }
  }, []);

  const formattedDate = order
    ? new Date(order.created_at).toLocaleString("es-ES", {
      dateStyle: "long",
      timeStyle: "short"
    })
    : "";

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4 py-8">
      <Toaster
        toastOptions={{
          className: "dark:bg-zinc-800 dark:text-white",
          success: { className: "border border-green-500" },
          error: { className: "border border-red-500" },
        }}
      />
      <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-lg p-8 max-w-3xl w-full">
        <div className="flex flex-col items-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">¡Pedido Confirmado!</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
            Gracias por tu compra, {order ? order.receiver_name : "usuario"}. Hemos recibido tu pedido y se encuentra en estado <span className="capitalize">{order?.status}</span>.
          </p>
        </div>

        {order ? (
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Número de Pedido:</span>
              <span className="text-gray-600 dark:text-gray-400">{order.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Fecha del Pedido:</span>
              <span className="text-gray-600 dark:text-gray-400">{formattedDate}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Destinatario:</span>
              <span className="text-gray-600 dark:text-gray-400">{order.receiver_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Teléfono:</span>
              <span className="text-gray-600 dark:text-gray-400">{order.phone}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Dirección de Envío:</span>
              <span className="text-gray-600 dark:text-gray-400 text-right">
                {order.address} - {order.province}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Carnet de Identidad:</span>
              <span className="text-gray-600 dark:text-gray-400">{order.CI}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total a Pagar:</span>
              <span className="text-gray-600 dark:text-gray-400">
                €{order.subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">No se encontraron detalles del pedido.</p>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
