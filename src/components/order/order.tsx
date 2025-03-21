import React, { useContext, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Order, Item, CurrencyData } from "@/types/types";
import { Chip, Button, Divider } from "@heroui/react";
import { QRCodeCanvas } from "qrcode.react";
import { MapPinIcon, Package2Icon, CalendarIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, XIcon, AlertTriangleIcon } from "lucide-react";
import { CurrencyAndExchangeRateContext } from "@contexts/exchange-rate-currency-context";
import { formatCurrency } from "@components/format-currency";
import PaymentMethodButton from "@hooks/usePaymentMethodSelector";
import Collapse from "@components/collapse";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

// Modal para mostrar el QR en tamaño grande
const QRModal = ({
  isOpen,
  onClose,
  orderId
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId: string
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()} /* Evitar que se cierre al hacer clic dentro */
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <XIcon size={20} />
        </button>

        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">QR de la orden</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Código #{orderId.slice(0, 6)}
          </p>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-lg mb-4">
          <QRCodeCanvas
            value={orderId}
            size={280}
            bgColor="#FFFFFF"
            level="H"
            className="mx-auto"
          />
        </div>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Acerca la cámara de tu dispositivo para escanear
        </p>
      </div>
    </div>,
    document.body
  );
};

// Modificación del componente OrderHeader para incluir la funcionalidad del modal
const OrderHeader = ({ order, isSticky = true }: { order: Order, isSticky?: boolean }) => {
  const orderDate = order.created_at ? new Date(order.created_at) : null;
  const formattedDate = orderDate ? orderDate.toLocaleDateString('es-ES') : 'Fecha no disponible';
  const formattedTime = orderDate ? orderDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
  const [qrModalOpen, setQrModalOpen] = useState(false);

  return (
    <>
      <div className={`${isSticky ? 'sticky top-0 z-10' : ''} p-4 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex justify-between items-start`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Orden #{order.id.slice(0, 6)}
            </h4>
          </div>
          <div className="flex flex-col space-y-1">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <MapPinIcon className="w-3.5 h-3.5 text-gray-500" /> {order.province}
            </p>
            {orderDate && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" /> {formattedDate}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" /> {formattedTime}
                </p>
              </>
            )}
          </div>
          <OrderStatus status={order.status} />
        </div>

        {/* QR con interacción para abrir modal */}
        <div
          className="p-2 bg-blue-50 rounded-lg shadow-sm cursor-pointer hover:scale-105 transition-all active:scale-95"
          onClick={() => setQrModalOpen(true)}
          aria-label="Ampliar código QR"
        >
          <div className="relative">
            <QRCodeCanvas
              value={order.id}
              size={96}
              bgColor="#FFFFFF"
              level="H"
            />
            <div className="absolute inset-0 bg-white/0 hover:bg-white/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="m15 3 6 6m0 0-6 6m6-6H8a5 5 0 0 0 0 10h5"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del QR */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        orderId={order.id}
      />
    </>
  );
};

const OrderItem = React.memo(({ item, rateExchange }: { item: Item, rateExchange: CurrencyData | null }) => {
  const itemPrice = (): number => {
    if (!item.product) return 0;

    if (item.product.discount && item.quantity >= item.product.discount.min) {
      const discountAmount = item.product.price * (item.product.discount.reduction / 100);
      return (item.quantity * (item.product.price - discountAmount) * (rateExchange?.exchangeRate || 1));
    }
    return (item.product.price * item.quantity * (rateExchange?.exchangeRate || 1));
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
        <Image
          alt={`Imagen de ${item.product?.name || 'producto'}`}
          className="object-cover rounded-md"
          fill
          sizes="(max-width: 768px) 64px, 80px"
          src={item.product?.image || "/nophoto.jpeg"}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/nophoto.jpeg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm sm:text-base truncate text-gray-900 dark:text-white">
          {item.product?.name}
        </h4>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center">
            <Package2Icon className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">x{item.quantity}</span>
          </div>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(itemPrice(), rateExchange?.currency, rateExchange?.symbol)}
          </span>
        </div>
      </div>
    </div>
  );
});

const OrderStatus = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: "primary" | "danger" | "warning" | "success" | "default", label: string, icon: React.ReactNode }> = {
    accepted: { color: "primary", label: "Aceptada", icon: <CheckIcon size={14} /> },
    cancelled: { color: "danger", label: "Cancelada", icon: <XIcon size={14} /> },
    retired: { color: "danger", label: "Retirada", icon: <XIcon size={14} /> },
    pending: { color: "warning", label: "Pendiente", icon: <ClockIcon size={14} /> },
    payd: { color: "success", label: "Pagada", icon: <CheckIcon size={14} /> },
    paid: { color: "success", label: "Pagada", icon: <CheckIcon size={14} /> }
  };

  const { color, label, icon } = statusConfig[status as keyof typeof statusConfig] ||
    { color: "default", label: "Estado desconocido", icon: <AlertTriangleIcon size={14} /> };

  return (
    <Chip
      startContent={icon}
      color={color}
      variant="flat"
      radius="sm"
      className="text-xs sm:text-sm font-medium"
    >
      {label}
    </Chip>
  );
};

const OrderProductList = ({
  items,
  rateExchange,
  expanded,
  onToggle,
  isMobile
}: {
  items: Item[];
  rateExchange: CurrencyData | null;
  expanded: boolean;
  onToggle: () => void;
  isMobile: boolean;
}) => {
  return (
    <div className={`px-4 py-2 ${!isMobile && "bg-gray-100/50 dark:bg-gray-900/30"}`}>
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">
          Productos ({items.length})
        </h4>

        <button
          onClick={onToggle}
          className="flex items-center gap-1 py-2 px-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <span>Ocultar productos</span>
              <ChevronUpIcon size={16} />
            </>
          ) : (
            <>
              <span>Ver productos</span>
              <ChevronDownIcon size={16} />
            </>
          )}
        </button>
      </div>

      <Collapse open={expanded}>
        <div className="space-y-2 mt-3 mb-1 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <OrderItem key={item.id} item={item} rateExchange={rateExchange} />
          ))}
        </div>
      </Collapse>
    </div>
  );
};

const OrderFooter = ({
  order,
  onCancelOrder,
  rateExchange,
  isMobile
}: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onProceedToPayment?: (orderId: string) => void;
  rateExchange?: CurrencyData | null;
  paymentMethod?: string;
  handlePaymentMethodSelect?: (method: string) => void;
  onExpandButtonClick?: () => void;
  isExpanded?: boolean;
  isMobile: boolean;
}) => {
  const router = useRouter();

  return (
    <div className={`${isMobile ? '' : 'sticky bottom-0 z-10'} p-4 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-sm`}>
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatCurrency((order.subtotal * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Precio de envio:</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatCurrency((order.shipping_price * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
          <span className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(((order.subtotal + order.shipping_price) * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}
          </span>
        </div>
      </div>

      {order.status === "pending" && (
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            color="danger"
            variant="light"
            className="w-full font-semibold py-2"
            onClick={() => onCancelOrder?.(order.id)}
          >
            Cancelar Orden
          </Button>
          <PaymentMethodButton
            className="w-full"
            orderId={order.id}
            onSuccess={() => {
              router.push('/payment/success');
            }}
            onError={(error) => {
              console.error('Error de pago:', error);
            }}
          />
        </div>
      )}

    </div>
  );
};

const OrderComponent = ({
  order,
  onCancelOrder,
  onProceedToPayment,
  compact = false,
  className = "",
}: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onProceedToPayment?: (orderId: string) => void;
  compact?: boolean;
  className?: string;
}) => {
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showItems, setShowItems] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePaymentMethodSelect = useCallback((method: string) => {
    setPaymentMethod(method);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleShowItems = useCallback(() => {
    setShowItems(prev => !prev);
  }, []);

  return (
    <div className={`${className} w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-collapse border-gray-200 dark:border-gray-700`}>
      <OrderHeader order={order} isSticky={!compact} />

      <OrderProductList
        items={order.orderItems}
        rateExchange={rateExchange}
        expanded={showItems}
        onToggle={toggleShowItems}
        isMobile={isMobile}
      />

      {isMobile && <Divider />}

      <OrderFooter
        order={order}
        onCancelOrder={onCancelOrder}
        onProceedToPayment={onProceedToPayment}
        rateExchange={rateExchange}
        paymentMethod={paymentMethod}
        handlePaymentMethodSelect={handlePaymentMethodSelect}
        onExpandButtonClick={toggleExpand}
        isExpanded={isExpanded}
        isMobile={isMobile}
      />
    </div>
  );
};

OrderItem.displayName = "OrderItem";

export default OrderComponent;
