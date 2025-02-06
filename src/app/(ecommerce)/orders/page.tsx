'use client';

import dynamic from "next/dynamic";
import useSWR from "swr";
import { Spinner } from "@heroui/react";
import { Order } from "@/types/types";

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
    console.error(error);
    return (
      <section className="flex flex-col items-center justify-center py-8 px-2">
        {error.message === 'No orders found' ? (
          <p className="text-center text-gray-500">No tienes pedidos aún.</p>
        ) : (
          <p className="text-red-500">Error al cargar las órdenes.</p>
        )}
      </section>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Spinner color="primary" />
        <p className="mt-4 text-gray-500">Cargando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-2 md:py-10">
      <h1 className="text-2xl font-bold text-center">Tus pedidos</h1>
      {orders?.length ? (
        <OrderList orders={mapOrder(orders)} />
      ) : (
        <p className="text-center text-gray-500">No tienes pedidos aún.</p>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(OrdersPage), { ssr: false }) as React.ComponentType;
