import React, { useState, useMemo } from "react";
import { Accordion, AccordionItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip } from "@heroui/react";
import OrderComponent from "./order/order";
import { Order } from "@/types/types";
import { ShoppingBag, FilterIcon, Package2Icon, Calendar, ArrowDownAZ, ArrowDownWideNarrow } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface OrderListProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => void;
  onProceedToPayment?: (orderId: string) => void;
  isLoading?: boolean;
}

const OrderStatusChip = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: "primary" | "danger" | "warning" | "success" | "default", label: string }> = {
    accepted: { color: "primary", label: "Aceptada" },
    cancelled: { color: "danger", label: "Cancelada" },
    retired: { color: "danger", label: "Retirada" },
    pending: { color: "warning", label: "Pendiente" },
    payd: { color: "success", label: "Pagada" },
    paid: { color: "success", label: "Pagada" }
  };

  const { color, label } = statusConfig[status] ||
    { color: "default", label: status || "Desconocido" };

  return (
    <Chip
      color={color}
      variant="flat"
      size="sm"
      className="capitalize font-medium"
    >
      {label}
    </Chip>
  );
};

const OrderList: React.FC<OrderListProps> = ({
  orders = [],
  onCancelOrder,
  onProceedToPayment,
  isLoading = false
}) => {
  // Estados para filtrado y ordenamiento
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Órdenes procesadas (filtradas y ordenadas)
  const processedOrders = useMemo(() => {
    // Filtrar por estado
    let filteredOrders = filterStatus
      ? orders.filter(order => order.status === filterStatus)
      : orders;

    // Ordenar por el criterio seleccionado
    return [...filteredOrders].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return a.status.localeCompare(b.status);
      }
    });
  }, [orders, filterStatus, sortBy]);

  // Estado para el acordeón móvil
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));

  // Estados únicos para el filtro
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    orders.forEach(order => {
      if (order.status) statuses.add(order.status);
    });
    return Array.from(statuses);
  }, [orders]);

  // Encontrar la cantidad por estado
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(order => {
      if (order.status) {
        counts[order.status] = (counts[order.status] || 0) + 1;
      }
    });
    return counts;
  }, [orders]);

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl h-48 w-full" />
        ))}
      </div>
    );
  }

  // Si no hay órdenes, mostrar un mensaje
  if (!orders || orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center p-12 text-center"
      >
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
          No hay pedidos disponibles
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          Aún no tienes ningún pedido en tu historial. Cuando realices compras, aparecerán aquí.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros y ordenamiento */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Mis pedidos
          </h2>
          <Chip size="sm" color="primary" variant="flat">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </Chip>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por estado - implementación compatible */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                startContent={<FilterIcon size={16} />}
                endContent={filterStatus && (
                  <Chip size="sm" color="primary" variant="dot" className="ml-1">
                    1
                  </Chip>
                )}
              >
                {filterStatus ? `Filtrado: ${filterStatus}` : "Filtrar"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtrar por estado"
              selectionMode="single"
              selectedKeys={filterStatus ? new Set([filterStatus]) : new Set()}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setFilterStatus(selected === filterStatus ? null : selected);
              }}
            >
              {[
                <DropdownItem key="all" onPress={() => setFilterStatus(null)}>
                  Todos ({orders.length})
                </DropdownItem>,
                ...uniqueStatuses.map((status) => (
                  <DropdownItem key={status} textValue={status}>
                    <div className="flex items-center justify-between w-full">
                      <span className="capitalize">{status}</span>
                      <Chip size="sm">{statusCounts[status] || 0}</Chip>
                    </div>
                  </DropdownItem>
                ))
              ]}
            </DropdownMenu>
          </Dropdown>

          {/* Ordenamiento */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                size="sm"
                startContent={
                  sortBy === "date"
                    ? <ArrowDownWideNarrow size={16} />
                    : <ArrowDownAZ size={16} />
                }
              >
                Ordenar
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Opciones de ordenamiento"
              selectionMode="single"
              selectedKeys={new Set([sortBy])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as "date" | "status";
                if (selected) setSortBy(selected);
              }}
            >
              <DropdownItem key="date">Por fecha</DropdownItem>
              <DropdownItem key="status">Por estado</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Vista móvil con acordeón */}
      <div className="md:hidden">
        <Accordion
          variant="splitted"
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
          className="gap-4 flex flex-col"
          itemClasses={{
            base: "border p-0 border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4",
            trigger: "px-4 py-3",
            content: "px-0 pt-0 pb-0"
          }}
        >
          {processedOrders.map((order) => (
            <AccordionItem
              key={order.id}
              aria-label={`Pedido ${order.id.slice(0, 6)}`}
              title={
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Pedido #{order.id.slice(0, 6)}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={12} />
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <OrderStatusChip status={order.status} />
                </div>
              }
              startContent={
                <div className="flex items-center justify-center mr-4">
                  <Package2Icon className="text-blue-500" size={24} />
                </div>
              }
            >
              <OrderComponent
                className="border-x-0 border-b-0"
                order={order}
                onCancelOrder={onCancelOrder}
                onProceedToPayment={onProceedToPayment}
                compact={true}
              />
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Vista escritorio con grid */}
      <div className="hidden md:grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence>
          {processedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.1, 0.5)
              }}
            >
              <OrderComponent
                key={order.id}
                order={order}
                onCancelOrder={onCancelOrder}
                onProceedToPayment={onProceedToPayment}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderList;
