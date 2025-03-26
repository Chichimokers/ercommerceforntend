import { CardBody, Card, Tooltip, Divider } from "@heroui/react";
import React from "react";
import { formatCurrency } from "@components/format-currency";
import { Box, Truck, Info, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProductBase } from "../../types/types";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useCurrencyStore } from "@store/currency/currency-store";

interface OrderSummaryProps {
  className?: string;
  subtotal: number;
  weight: number;
  shipping: number;
  isLoadingPrice?: boolean;
  error?: any;
  cartItems?: ProductBase[];
  meetsMinimumAmount?: boolean; // Nueva propiedad
  minimumAmount?: number; // Nueva propiedad
}

// Componente Skeleton para usar durante la carga
export const OrderSummarySkeleton = () => {
  // Usar el hook de detección de dispositivo para optimizar el skeleton
  const deviceData = useDeviceDetection();

  if (deviceData.isLowPerformance) {
    return (
      <div className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl mx-auto">
      <CardBody className="gap-3 p-4 sm:p-5">
        <div className="flex justify-between items-center mb-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>

        <Divider className="my-1.5" />

        <div className="space-y-3">
          <div className="flex justify-between items-center py-1.5">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        </div>
      </CardBody>
    </Card>
  );
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  className,
  subtotal,
  weight,
  shipping,
  isLoadingPrice = false,
  error = null,
  cartItems = [],
  meetsMinimumAmount = true, // Valor predeterminado
  minimumAmount = 0 // Valor predeterminado
}) => {
  const deviceData = useDeviceDetection();
  const { rateExchange } = useCurrencyStore();
  const { currency, exchangeRate = 1, symbol } = rateExchange || {};

  const total = subtotal + shipping;

  const SummaryItem = ({
    label,
    amount,
    icon,
    hasTooltip = false,
    tooltipText
  }: {
    label: string;
    amount: number;
    icon?: React.ReactNode;
    hasTooltip?: boolean;
    tooltipText?: string;
  }) => (
    <div
      className="flex justify-between items-center py-1.5"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {label}
        </span>
        {hasTooltip && (
          <Tooltip
            content={tooltipText || "Costo calculado según peso y ubicación"}
            placement="top"
          >
            <Info size={14} className="text-blue-500 cursor-help" />
          </Tooltip>
        )}
      </div>
      <span className="text-sm font-medium">
        {formatCurrency(amount * exchangeRate, currency, symbol)}
      </span>
    </div>
  );

  // Crear una función de navegación condicionada
  const handleCheckoutClick = (e: React.MouseEvent) => {
    // Si no cumple el monto mínimo, prevenir la navegación
    if (!meetsMinimumAmount) {
      e.preventDefault();

      // Opcional: desplazar a la alerta
      const warningElement = document.querySelector('.minimum-amount-warning');
      warningElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Opcional: destacar la alerta temporalmente
      if (warningElement) {
        warningElement.classList.add('highlight-warning');
        setTimeout(() => {
          warningElement.classList.remove('highlight-warning');
        }, 1500);
      }

      return;
    }

    // Si hay productos pero está cargando o hay error, también prevenir
    if (isLoadingPrice || !!error) {
      e.preventDefault();
      return;
    }
  };

  return (
    <Card
      className={`${className} w-full shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl mx-auto ${!deviceData.isLowPerformance && !deviceData.isDataSaver ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}`}
      disableAnimation={deviceData.isLowPerformance}
    >
      <CardBody className="gap-3 p-4 sm:p-5">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-blue-500" />
            Resumen del pedido
          </h2>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium px-2.5 py-1 rounded-md flex items-center">
            <Box size={12} className="mr-1" />
            {weight.toFixed(2)} kg
          </span>
        </div>

        <Divider className="my-1.5" />

        <div className="space-y-1">
          <SummaryItem
            label="Subtotal"
            amount={subtotal}
          />
          <SummaryItem
            label="Envío"
            amount={shipping}
            hasTooltip
            tooltipText="Costo de envío calculado según peso y ubicación"
            icon={<Truck size={14} />}
          />
        </div>

        <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 dark:text-white">
              Total
            </span>
            <span
              className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400"
            >
              {formatCurrency(total * exchangeRate, currency, symbol)}
            </span>
          </div>
        </div>

        {/* Mensaje de advertencia si no cumple con el mínimo */}
        {!meetsMinimumAmount && cartItems.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg minimum-amount-warning">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
              El pedido mínimo debe ser de ${minimumAmount.toFixed(2)}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
              Te faltan ${(minimumAmount - subtotal).toFixed(2)} para completar el mínimo requerido.
            </p>
          </div>
        )}

        <div className="mt-4">
          <Link
            href={cartItems.length === 0 ? "#" : "/checkout"}
            onClick={handleCheckoutClick}
            className={`w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300
              ${cartItems.length === 0
                ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                : meetsMinimumAmount
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow"}
            `}
            aria-disabled={cartItems.length === 0 || !meetsMinimumAmount}
          >
            <ShoppingBag size={18} />
            {cartItems.length === 0
              ? "No hay productos"
              : !meetsMinimumAmount
                ? `Completa el mínimo ($${minimumAmount})`
                : "Proceder al pago"}
          </Link>

          {/* Solo mostrar información adicional en dispositivos de alto rendimiento */}
          {!deviceData.isLowPerformance && !deviceData.isDataSaver && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center flex justify-center items-center gap-1">
              <Info size={12} />
              Se incluye el coste de embalaje y gestión
            </div>
          )}
        </div>

        {error && (
          <div
            className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded"
          >
            Error al calcular el envío. Por favor intenta nuevamente.
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OrderSummary;
