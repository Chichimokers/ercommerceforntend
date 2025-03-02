'use client';

import dynamic from "next/dynamic";
import useSWR, { mutate } from "swr";
import { Accordion, AccordionItem, Divider, Skeleton, Spinner } from "@heroui/react";
import { Order } from "@/types/types";
import { FaExclamationTriangle, FaShoppingCart } from "react-icons/fa";
import { CustomButton } from "@components/buttons/custom-button";
import Link from "next/link";

const OrderList = dynamic(() => import("@/components/order-list"), {
  ssr: false,
  loading: () => (
    <>
      {/* Versión móvil */}
      <div className="flex md:hidden">
        <Accordion variant="splitted" className="w-full">
          {[...Array(3)].map((_, i) => (
            <AccordionItem
              key={i}
              startContent={
                <div className="flex flex-col gap-1 w-full">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              }
            >
              <div className="space-y-4 p-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Versión escritorio */}
      <div className="hidden md:grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="order-card-container animate-pulse">
            <div className="order-card-content">
              {/* Encabezado */}
              <div className="px-4 pt-4 space-y-3">
                <div className="flex justify-between items-start gap-4 min-w-[260px]">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-28 w-28 rounded-md" />
                </div>


                <Divider />
              </div>

              {/* Lista de productos */}
              <div className="px-4 space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex gap-4 p-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
});

const OrdersPage = () => {
  const API_URL = "/api/orders";

  function mapOrder(orders: any[]): Order[] {
    return orders.map((order) => ({
      id: String(order.id),
      CI: order.CI,
      address: order.address,
      status: order.status,
      subtotal: Number(order.subtotal),
      total: order.total ? Number(order.total) : undefined,
      phone: order.phone,
      province: order.province,
      receiver_name: order.receiver_name,
      stripe_id: order.stripe_id || undefined,
      orderItems: order.orderItems.map((item: any) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          short_description: item.product.short_description,
          price: Number(item.product.price),
          quantity: item.product.quantity,
          image: item.product.image || null,
        },
        quantity: item.quantity,
      })),
    }));
  }

  const fetcher = async (url: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'No orders found'
            : `Error ${response.status}: ${response.statusText}`
        );
      }
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  };

  const { data: orders, error, isLoading } = useSWR(API_URL, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 60000,
  });

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[400px] py-8 px-4 mt-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <FaExclamationTriangle className="h-12 w-12 text-red-400" />
          {error.message === 'No orders found' ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-800">No hay pedidos registrados</h2>
              <p className="text-gray-500 max-w-md">
                Parece que aún no has realizado ningún pedido. ¡Explora nuestros productos y haz tu primer compra!
              </p>
              <CustomButton className="mt-4">
                <Link href="/products">Ver productos</Link>
              </CustomButton>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Error de conexión</h2>
              <p className="text-gray-500 max-w-md">
                Ocurrió un problema al cargar tus pedidos. Por favor intenta nuevamente más tarde.
              </p>
              <CustomButton className="mt-4" variant="filled" onClick={() => mutate(API_URL)}>
                Reintentar
              </CustomButton>
            </>
          )}
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 mt-16">
        <Spinner color="primary" className="h-12 w-12" />
        <p className="text-lg text-gray-600 animate-pulse">Buscando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 md:py-12 px-4 mt-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
          Historial de Pedidos
        </h1>
        <p className="text-gray-500">Revisa el estado de tus compras recientes</p>
      </div>

      {orders?.length ? (
        <OrderList orders={mapOrder(orders)} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
          <FaShoppingCart className="h-16 w-16 text-gray-300" />
          <h2 className="text-2xl font-semibold text-gray-800">Carrito vacío</h2>
          <p className="text-gray-500 max-w-md">
            Aún no tienes pedidos registrados. Cuando hagas una compra, aparecerán aquí todos los detalles.
          </p>
          <CustomButton className="mt-4">
            <Link href="/products">Continuar comprando</Link>
          </CustomButton>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(OrdersPage), { ssr: false }) as React.ComponentType;
