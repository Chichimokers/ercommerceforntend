import Image from "next/image";
import { Order, Item, CurrencyData } from "@/types/types";
import { Chip } from "@heroui/react";
import CustomQRCode from "../qr-code";
import { CustomButton } from "../buttons/custom-button";
import { MapPinIcon, Package2Icon, CalendarIcon, ClockIcon } from "lucide-react";
import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CurrencyAndExchangeRateContext } from "@contexts/exchange-rate-currency-context";
import { formatCurrency } from "@components/format-currency";

const OrderItem = React.memo(({ item, rateExchange }: { item: Item, rateExchange: CurrencyData | null }) => {
  const itemPrice = (): number => {
    if (item.product.discount && item.quantity >= item.product.discount.min) {
      return (item.quantity * (item.product.price - item.product.discount.reduction) * (rateExchange?.exchangeRate || 1));
    }
    return item.product.price;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-all border border-default-200"
    >
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          alt={`Imagen de ${item.product.name}`}
          className="object-cover rounded-lg border border-default-300 shadow-sm"
          fill
          sizes="(max-width: 768px) 80px, 100px"
          src={item.product.image || "/nophoto.jpeg"}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/nophoto.jpeg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base truncate text-default-900 dark:text-white">{item.product.name}</h4>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center">
            <Package2Icon className="w-4 h-4 text-default-500 mr-1" />
            <span className="text-sm text-default-600">x{item.quantity}</span>
          </div>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency((itemPrice()), rateExchange?.currency, rateExchange?.symbol)}</span>
        </div>
      </div>
    </motion.div>
  )

});

const OrderHeader = ({ order }: { order: Order }) => {
  const orderDate = order.created_at ? new Date(order.created_at) : null;
  const formattedDate = orderDate ? orderDate.toLocaleDateString('es-ES') : 'Fecha no disponible';
  const formattedTime = orderDate ? orderDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="sticky top-0 z-10 p-5 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-default-200 flex justify-between items-start">
      <div className="space-y-2">
        <h4 className="text-xl font-bold text-default-900 dark:text-white">
          Orden #{order.id.slice(0, 6)}
        </h4>
        <div className="flex flex-col space-y-1.5">
          <p className="text-sm text-default-600 flex items-center gap-1">
            <MapPinIcon className="w-4 h-4 text-default-500" /> {order.province}
          </p>
          {orderDate && (
            <>
              <p className="text-xs text-default-500 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" /> {formattedDate}
              </p>
              <p className="text-xs text-default-500 flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" /> {formattedTime}
              </p>
            </>
          )}
        </div>
        <OrderStatus status={order.status} />
      </div>
      <div className="p-2 bg-blue-50 rounded-lg shadow-sm">
        <CustomQRCode value={order.id} />
      </div>
    </div>
  );
};

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

  const color = statusColors[status as keyof typeof statusColors] || statusColors.default;
  const statusText = spanishStatus[status as keyof typeof spanishStatus] || spanishStatus.default;

  return (
    <Chip color={color} variant="flat" radius="sm" className="mt-1">
      <span className="text-sm font-medium">{statusText}</span>
    </Chip>
  );
};

const OrderProductList = ({ items, rateExchange }: { items: Item[], rateExchange: CurrencyData | null }) => (
  <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-72 bg-gray-100/50 dark:bg-gray-900/30">
    <AnimatePresence>
      {items.map((item) => (
        <OrderItem key={item.id} item={item} rateExchange={rateExchange} />
      ))}
    </AnimatePresence>
  </div>
);

const OrderFooter = ({ order, onCancelOrder, onProceedToPayment, rateExchange }: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onProceedToPayment?: (orderId: string) => void;
  rateExchange?: CurrencyData | null;
}) => (
  <div className="sticky bottom-0 z-10 p-5 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-default-200 shadow-sm">
    <div className="flex flex-col mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-default-600">Subtotal:</span>
        <span className="text-sm font-medium text-default-700">{formatCurrency((order.subtotal * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}</span>
      </div>

      {order.total && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-default-600">Envío:</span>
          <span className="text-sm font-medium text-default-700">${formatCurrency(((order.total - order.subtotal) * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}</span>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-default-200">
        <span className="font-semibold text-default-900 dark:text-white">Total:</span>
        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
          {order.total ? formatCurrency((order.total * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol) : formatCurrency((order.subtotal * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}
        </span>
      </div>
    </div>

    {order.status === "pending" ? (
      <CustomButton
        color="danger"
        variant="filled"
        className="w-full shadow-md hover:shadow-lg font-semibold py-2.5"
        onClick={() => onCancelOrder?.(order.id)}
      >
        Cancelar Orden
      </CustomButton>
    ) : order.status === "accepted" ? (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <CustomButton
          color="primary"
          variant="filled"
          className="w-full shadow-md hover:shadow-lg font-semibold py-2.5"
          onClick={() => onProceedToPayment?.(order.id)}
        >
          Proceder al Pago
        </CustomButton>
      </motion.div>
    ) : null}
  </div>
);

const OrderComponent = ({ order, onCancelOrder, onProceedToPayment }: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onProceedToPayment?: (orderId: string) => void;
}) => {
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-default-200"
    >
      <OrderHeader order={order} />
      <OrderProductList items={order.orderItems} rateExchange={rateExchange} />
      <OrderFooter order={order} onCancelOrder={onCancelOrder} onProceedToPayment={onProceedToPayment} rateExchange={rateExchange} />
    </motion.div>
  );
};

OrderItem.displayName = "OrderItem";

export default OrderComponent;
