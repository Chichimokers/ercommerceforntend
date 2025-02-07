'use client';

import dynamic from "next/dynamic";
import useSWR, { mutate } from "swr";
import { Spinner } from "@heroui/react";
import { Order } from "@/types/types";
import { FaExclamationTriangle, FaShoppingCart } from "react-icons/fa";
import { CustomButton } from "@components/buttons/custom-button";
import Link from "next/link";

const OrderList = dynamic(() => import("@/components/order-list"), {
  ssr: false,
  loading: () => <Spinner color="primary" />
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
      <section className="flex flex-col items-center justify-center min-h-[400px] py-8 px-4">
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
              <h2 className="text-2xl font-semibold text-gray-800">Error de conexión</h2>
              <p className="text-gray-500 max-w-md">
                Ocurrió un problema al cargar tus pedidos. Por favor intenta nuevamente más tarde.
              </p>
              <CustomButton className="mt-4" variant="outlined" onClick={() => mutate(API_URL)}>
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner color="primary" className="h-12 w-12" />
        <p className="text-lg text-gray-600 animate-pulse">Buscando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 md:py-12 px-4">
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
