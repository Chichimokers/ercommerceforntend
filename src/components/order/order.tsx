import Image from "next/image";
import { Order, Item } from "@/types/types";
import { Chip } from "@heroui/react";
import CustomQRCode from "../qr-code";
import { CustomButton } from "../buttons/custom-button";
import { MapPinIcon } from "lucide-react";
import React from "react";

const OrderItem = React.memo(({ item }: { item: Item }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-900/50 shadow-sm hover:shadow-md transition-all border border-default-200">
    <Image
      alt={`Imagen de ${item.product.name}`}
      className="w-16 h-16 object-cover rounded-lg border border-default-300 shadow-sm"
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
      <h4 className="font-semibold text-base truncate text-default-900 dark:text-white">{item.product.name}</h4>
      <div className="flex justify-between items-center">
        <span className="text-sm text-default-600">Cantidad: {item.quantity}</span>
        <span className="text-sm font-semibold text-primary">${item.product.price.toFixed(2)}</span>
      </div>
    </div>
  </div>
));

const OrderHeader = ({ order }: { order: Order }) => (
  <div className="sticky top-0 z-10 px-5 pt-5 pb-3 border-b border-default-200 flex justify-between items-start">
    <div className="space-y-2">
      <h4 className="text-lg font-bold text-default-900 dark:text-white">Orden #{order.id.slice(0, 6)}</h4>
      <p className="text-sm text-default-600 flex items-center gap-1">
        <MapPinIcon className="w-4 h-4 text-default-500" /> {order.province}
      </p>
      <OrderStatus status={order.status} />
    </div>
    <CustomQRCode value={order.id} />
  </div>
);

const OrderStatus = ({ status }: { status: Order['status'] }) => {
  const statusColors = {
    accepted: "primary",
    cancelled: "danger",
    retired: "danger",
    pending: "warning",
    paid: "success",
    default: "default",
  } as const;

  const spanishStatus = {
    accepted: "Aceptada",
    cancelled: "Cancelada",
    retired: "Retirada",
    pending: "Pendiente",
    paid: "Pagada",
    default: "Desconocido",
  } as const;

  return (
    <Chip color={statusColors[status as keyof typeof statusColors]} variant="flat" radius="sm" className="mt-1">
      <span className="text-sm font-medium">{spanishStatus[status as keyof typeof spanishStatus]}</span>
    </Chip>
  );
};

const OrderProductList = ({ items }: { items: Item[] }) => (
  <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-60">
    {items.map((item) => (
      <OrderItem key={item.id} item={item} />
    ))}
  </div>
);

const OrderFooter = ({ order, onCancelOrder, onProceedToPayment }: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onProceedToPayment?: (orderId: string) => void;
}) => (
  <div className="sticky bottom-0 z-10 p-5 border-t border-default-200 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <span className="font-semibold text-default-900 dark:text-white">Total:</span>
      <span className="text-xl font-bold text-primary">${order.subtotal.toFixed(2)}</span>
    </div>
    {order.status === "pending" ? (
      <CustomButton
        color="danger"
        variant="filled"
        className="w-full shadow-lg"
        onClick={() => onCancelOrder?.(order.id)}
      >
        Cancelar Orden
      </CustomButton>
    ) : order.status === "accepted" ? (
      <CustomButton
        color="primary"
        variant="filled"
        className="w-full shadow-lg"
        onClick={() => onProceedToPayment?.(order.id)}
      >
        Proceder al Pago
      </CustomButton>
    ) : null}
  </div>
);

const OrderComponent = ({ order, onCancelOrder, onProceedToPayment }: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onProceedToPayment?: (orderId: string) => void;
}) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-default-200">
      <OrderHeader order={order} />
      <OrderProductList items={order.orderItems} />
      <OrderFooter order={order} onCancelOrder={onCancelOrder} onProceedToPayment={onProceedToPayment} />
    </div>
  );
};

OrderItem.displayName = "OrderItem"

export default OrderComponent;
