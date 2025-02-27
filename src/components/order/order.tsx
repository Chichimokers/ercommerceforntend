import Image from "next/image";
import { Order, Item } from "@/types/types";
import { Chip } from "@heroui/react";
import CustomQRCode from "../qr-code";
import { CustomButton } from "../buttons/custom-button";
import React from "react";
import { Divider } from "@heroui/react";
import { MapPinIcon } from "lucide-react";

// Componente memoizado para items
const OrderItem = React.memo(({ item }: { item: Item }) => (
  <div className="flex items-center gap-4 p-2 hover:bg-default-50 transition-colors rounded-md">
    <Image
      alt={`Imagen de ${item.product.name}`}
      className="w-16 h-16 object-cover rounded-md shadow border border-default-200"
      height={100}
      width={100}
      src={item.product.image || "/nophoto.jpeg"}
      unoptimized
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/nophoto.jpeg";
      }}
    />
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-base truncate">{item.product.name}</h4>
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-sm text-default-600">Cantidad: {item.quantity}</span>
        <span className="text-sm font-semibold text-default-900">
          ${item.product.price.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
));

OrderItem.displayName = 'OrderItem';

// Subcomponente para el encabezado
const OrderHeader = ({ order }: { order: Order }) => {

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 pt-4">
      <div className="flex justify-between items-start gap-4 min-w-[260px]">
        <div className="space-y-2">
          <h4 className="text-xl font-semibold">Orden #{order.id.slice(0, 6)}</h4>
          <p className="text-sm text-default-600">
            <MapPinIcon className="inline mr-1" />
            {order.province}
          </p>
          <OrderStatus status={order.status} />
        </div>
        <CustomQRCode value={order.id} />
      </div>
      <Divider className="mt-4" />
    </div>
  );
}

// Componente para el estado con colores consistentes
const OrderStatus = ({ status }: { status: Order['status'] }) => {
  const statusColors = {
    accepted: 'primary',
    cancelled: 'danger',
    pending: 'warning',
    paid: 'success',
    default: 'default',
  } as const;

  const spanishStatus = {
    accepted: 'Aceptada',
    cancelled: 'Cancelada',
    pending: 'Pendiente',
    paid: 'Pagada',
    default: 'Desconocido',
  } as const;

  return (
    <Chip color={statusColors[status as keyof typeof statusColors]} variant="flat" radius="sm">
      <span className="font-medium text-sm">{spanishStatus[status as keyof typeof statusColors]}</span>
    </Chip>
  );
};

// Componente para la lista de productos
const OrderProductList = ({ items }: { items: Item[] }) => (
  <div className="overflow-y-auto flex-1 p-4 space-y-2">
    {items.map((item) => (
      <OrderItem key={item.id} item={item} />
    ))}
  </div>
);

// Componente para el pie de orden
const OrderFooter = ({ order, onCancelOrder }: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
}) => (
  <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm p-4 border-t border-default-200">
    <div className="flex justify-between items-center mb-4">
      <span className="font-semibold">Total:</span>
      <span className="text-lg font-bold text-primary">
        ${order.subtotal.toFixed(2)}
      </span>
    </div>
    <CustomButton
      color="danger"
      variant="filled"
      className="w-full shadow-lg"
      onClick={() => onCancelOrder?.(order.id)}
      isDisabled={order.status !== 'Procesando'}
    >
      Cancelar Orden
    </CustomButton>
  </div>
);

// Componente principal optimizado
const OrderComponent = ({ order, onCancelOrder }: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
}) => (
  <div className="order-card-container">
    <div className="order-card-content">
      <OrderHeader order={order} />
      <OrderProductList items={order.orderItems} />
      <OrderFooter order={order} onCancelOrder={onCancelOrder} />
    </div>
  </div>
);

export default OrderComponent;
