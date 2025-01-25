import dynamic from "next/dynamic";
import useSWR from "swr";
import { Spinner } from "@heroui/react";
import { Order } from "@/types/types";

const OrderList = dynamic(() => import("@/components/order-list"));

export default function OrdersPage() {
  const API_URL = "/api/orders";

  function mapOrder(orders: any[]): Order[] {
    const data: Order[] = [];
    orders.map((order) => {
      data.push({
        id: String(order.id), // Convertir el ID a string si viene como número
        CI: order.CI,
        address: order.address,
        status: order.status,
        subtotal: parseFloat(order.subtotal), // Convertir subtotal a número
        total: order.total ? parseFloat(order.total) : undefined, // Convertir total a número si existe
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
            price: parseFloat(item.product.price), // Convertir el precio a número
            quantity: item.product.quantity,
            image: item.product.image || null,
          },
          quantity: item.quantity,
        })),
      });
    });
    return data;
  }

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching data");
    }

    return response.json();
  };

  const {
    data: orders,
    error,
    isLoading,
  } = useSWR(API_URL, fetcher, {
    fallbackData: null,
  });

  if (error) {
    console.error(error);
    return (
      <section className="flex items-center justify-center py-8 px-2">
        <p className="text-red-500">Error al cargar las órdenes.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-2 md:py-10">
      <h1 className="text-2xl font-bold text-center">Tus pedidos</h1>
      {isLoading ? (
        <Spinner color="primary" />
      ) : orders?.length ? (
        <OrderList orders={mapOrder(orders)} />
      ) : (
        <p className="text-center text-gray-500">No tienes pedidos aún.</p>
      )}
    </div>
  );
}
