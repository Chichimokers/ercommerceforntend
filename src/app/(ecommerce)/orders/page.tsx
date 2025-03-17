'use client';

import dynamic from "next/dynamic";
import useSWR, { mutate } from "swr";
import { Accordion, AccordionItem, Divider, Spinner, Select, SelectItem, Badge, Chip, Button, Tooltip } from "@heroui/react";
import { Order } from "@/types/types";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import {
  ShoppingBag,
  AlertTriangle,
  Clock,
  CalendarDays,
  Search,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  TruckIcon,
  PackageOpen,
} from "lucide-react";

// Importación dinámica optimizada
const OrderList = dynamic(() => import("@/components/order-list"), {
  ssr: false,
  loading: () => <OrderSkeleton />
});

// Modal con carga diferida
const CancelOrderModal = dynamic(() => import("@components/modals/cancel-order-modal.tsx"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md">
        <Spinner size="lg" color="primary" />
      </div>
    </div>
  )
});

// Componente de esqueleto extraído para reutilización
const OrderSkeleton = () => (
  <>
    {/* Versión móvil */}
    <div className="flex md:hidden w-full">
      <Accordion variant="splitted" className="w-full">
        {[...Array(3)].map((_, i) => (
          <AccordionItem
            key={i}
            startContent={
              <div className="flex flex-col gap-1 w-full">
                <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
            }
          >
            <div className="space-y-4 p-2">
              <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>

    {/* Versión escritorio con diseño mejorado */}
    <div className="hidden md:grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
          {/* Encabezado */}
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-6 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="h-8 w-28 rounded-full bg-gray-200 dark:bg-gray-700 mt-2" />
              </div>
              <div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          <Divider />

          {/* Lista de productos simulada */}
          <div className="px-4 py-2 space-y-2">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex gap-3 py-2">
                <div className="h-16 w-16 rounded-md bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-1/2 rounded-md bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>

          <Divider />

          {/* Pie */}
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  </>
);

// Estado vacío elegante
const EmptyOrdersState = ({ onGoShopping }: { onGoShopping: () => void }) => (
  <div
    className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 p-4"
  >
    <div className="relative">
      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full scale-150 blur-xl opacity-70" />
      <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-md">
        <ShoppingBag className="h-16 w-16 text-blue-500" />
      </div>
    </div>
    <div className="space-y-3 max-w-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">No tienes pedidos activos</h2>
      <p className="text-gray-500 dark:text-gray-400">
        Aún no has realizado ninguna compra. Explora nuestros productos y descubre todo lo que tenemos para ti.
      </p>
    </div>
    <Button
      color="primary"
      size="lg"
      startContent={<ShoppingBag size={18} />}
      onClick={onGoShopping}
      className="font-medium shadow-sm mt-2"
    >
      Explorar productos
    </Button>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div
    className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 p-4"
  >
    <div className="relative">
      <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full scale-150 blur-xl opacity-70" />
      <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-md">
        <AlertTriangle className="h-16 w-16 text-red-500" />
      </div>
    </div>
    <div className="space-y-3 max-w-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        {message === 'No orders found'
          ? 'No hay pedidos registrados'
          : 'Error al cargar pedidos'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        {message === 'No orders found'
          ? 'Parece que aún no has realizado ningún pedido. ¡Explora nuestros productos y haz tu primera compra!'
          : 'No pudimos cargar tus pedidos. Por favor, inténtalo nuevamente más tarde.'}
      </p>
    </div>
    <Button
      color={message === 'No orders found' ? "primary" : "danger"}
      variant={message === 'No orders found' ? "solid" : "bordered"}
      size="lg"
      startContent={message === 'No orders found' ? <ShoppingBag size={18} /> : <RefreshCcw size={18} />}
      onClick={onRetry}
      className="font-medium shadow-sm mt-2"
    >
      {message === 'No orders found' ? 'Explorar productos' : 'Reintentar'}
    </Button>
  </div>
);

// Estado de carga elegante
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full scale-150 blur-xl opacity-70 animate-pulse" />
      <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-md">
        <Spinner size="lg" color="primary" />
      </div>
    </div>
    <p className="text-lg text-gray-600 dark:text-gray-400 animate-pulse">
      Cargando tu historial de pedidos...
    </p>
  </div>
);

type ChipColorType = "default" | "warning" | "primary" | "success" | "danger" | "secondary" | undefined;

const getOrderStatusDetails = (status: string): { color: ChipColorType, label: string, icon: React.ReactNode } => {
  const statusMap: Record<string, { color: ChipColorType, label: string, icon: React.ReactNode }> = {
    'placed': { color: 'warning', label: 'Pedido Recibido', icon: <Clock size={16} /> },
    'confirmed': { color: 'primary', label: 'Confirmado', icon: <CheckCircle2 size={16} /> },
    'shipped': { color: 'success', label: 'Enviado', icon: <TruckIcon size={16} /> },
    'delivered': { color: 'success', label: 'Entregado', icon: <PackageOpen size={16} /> },
    'cancelled': { color: 'danger', label: 'Cancelado', icon: <XCircle size={16} /> },
    'processing': { color: 'secondary', label: 'Procesando', icon: <RefreshCcw size={16} /> },
    'default': { color: 'default', label: 'Desconocido', icon: <AlertTriangle size={16} /> }
  };

  return (status in statusMap ? statusMap[status as keyof typeof statusMap] : statusMap['default']);
};

const OrdersPage = () => {
  const API_URL = "/api/orders";
  const { data: session } = useSession({ required: false });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [searchText, setSearchText] = useState<string>("");

  // Optimizado fetcher con mejor manejo de errores y timeout
  const fetcher = async (url: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // Timeout aumentado a 8 segundos

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`
        },
        signal: controller.signal,
        cache: "no-store"
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => null);
        throw new Error(
          response.status === 404
            ? 'No orders found'
            : `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };

  const { data: orders, error, isLoading, mutate: refreshOrders } = useSWR(
    session ? API_URL : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      dedupingInterval: 60000,
      refreshInterval: 300000, // Refresca cada 5 minutos
      onErrorRetry: (error, _, __, revalidate, { retryCount }) => {
        if (error.message === 'No orders found' || retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      }
    }
  );

  // Función optimizada para cancelar pedidos
  const handleCancelClick = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowCancelModal(true);
  };

  // Función para confirmar cancelación de pedido
  const confirmCancelOrder = async () => {
    if (!selectedOrder || !session?.access_token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}userpublic/retire-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId: selectedOrder }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Error: ${response.status}`);
      }

      // Actualización optimista de la UI
      refreshOrders();

    } catch (error) {
      console.error("Error al cancelar la orden:", error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setShowCancelModal(false);
      setSelectedOrder(null);
    }
  };

  // Función para mapear órdenes
  function mapOrder(orders: any[]): Order[] {
    if (!Array.isArray(orders)) return [];

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
      created_at: order.created_at,
      orderItems: Array.isArray(order.orderItems) ? order.orderItems.map((item: any) => ({
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
      })) : [],
    }));
  }

  const filteredAndSortedOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    let processedOrders = mapOrder(orders);

    if (statusFilter !== "all") {
      processedOrders = processedOrders.filter(order => order.status === statusFilter);
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      processedOrders = processedOrders.filter(order =>
        order.receiver_name?.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower) ||
        order.orderItems.some(item =>
          item.product.name.toLowerCase().includes(searchLower)
        )
      );
    }

    return processedOrders.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      if (sortOrder === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  }, [orders, statusFilter, sortOrder, searchText]);

  const navigateToProducts = () => {
    window.location.href = "/products";
  };

  const retryLoading = () => {
    refreshOrders();
  };

  const clearAllFilters = () => {
    setStatusFilter("all");
    setSearchText("");
    setSortOrder("newest");
  };

  const hasFiltersApplied = statusFilter !== "all" || searchText.trim() !== "";

  const NoResultsMessage = () => (
    <div
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl p-8 flex flex-col items-center justify-center text-center my-6"
    >
      <Search className="h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        No hay pedidos que coincidan con tu búsqueda
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
        Prueba con otros criterios de filtrado o ajusta tu búsqueda para encontrar lo que buscas.
      </p>
    </div>
  );

  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={error.message === 'No orders found' ? navigateToProducts : retryLoading}
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingState />
    );
  }

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <EmptyOrdersState onGoShopping={navigateToProducts} />
    );
  }

  return (
    <div className="mx-auto py-8 md:py-12 px-4 max-w-7xl">
      <div
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
          <CalendarDays className="mr-3 h-8 w-8 text-blue-500" />
          <span className="border-b-4 border-blue-300 pb-1">Historial de Pedidos</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 md:text-lg">
          Revisa y gestiona todos tus pedidos en un solo lugar
        </p>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-all"
            />
          </div>
        </div>
      </div>

      {/*<Tooltip content="Actualizar pedidos">
        <Button
          isIconOnly
          variant="flat"
          color="primary"
          aria-label="Recargar pedidos"
          className="min-w-unit-10 w-unit-10 h-unit-10 self-end"
          onClick={() => refreshOrders()}
        >
          <RefreshCcw size={18} />
        </Button>
      </Tooltip>*/}

      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {statusFilter !== "all" && (
            <Chip
              color={getOrderStatusDetails(statusFilter).color}
              size="sm"
              variant="flat"
              startContent={getOrderStatusDetails(statusFilter).icon}
              onClose={() => setStatusFilter("all")}
            >
              {getOrderStatusDetails(statusFilter).label}
            </Chip>
          )}
          {searchText && (
            <Chip
              color="default"
              size="sm"
              variant="flat"
              startContent={<Search size={14} />}
              onClose={() => setSearchText('')}
            >
              "{searchText}"
            </Chip>
          )}
        </div>
      </div>

      <div
        key={`orders-${statusFilter}-${sortOrder}-${searchText}`}
      >
        {filteredAndSortedOrders.length > 0 ? (
          <OrderList
            orders={filteredAndSortedOrders}
            onCancelOrder={handleCancelClick}
          />
        ) : (
          <NoResultsMessage />
        )}
      </div>

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelOrder}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(OrdersPage), { ssr: false }) as React.ComponentType;
