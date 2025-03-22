import { CardBody, Card, Tooltip, Divider, Button } from "@heroui/react";
import React, { memo } from "react";
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
}

// Componente Skeleton para usar durante la carga
export const OrderSummarySkeleton = () => {
  // Usar el hook de detección de dispositivo para optimizar el skeleton
  const deviceData = useDeviceDetection();

  // Para dispositivos de muy bajo rendimiento, usamos un skeleton aún más simplificado
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
        {/* Esqueleto para el encabezado */}
        <div className="flex justify-between items-center mb-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>

        <Divider className="my-1.5" />

        {/* Esqueleto para los elementos del resumen */}
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

// Versión ligera del resumen para dispositivos de bajo rendimiento
const LightOrderSummary = memo(({
  subtotal,
  weight,
  shipping,
  error,
  cartItems = [],
  exchangeRate = 1,
  currency = 'USD',
  symbol = '$'
}: OrderSummaryProps & {
  exchangeRate?: number;
  currency?: string;
  symbol?: string;
}) => {
  const total = subtotal + shipping;

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Resumen del pedido
        </h2>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-0.5 rounded">
          {weight.toFixed(1)} kg
        </span>
      </div>

      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

      <div className="space-y-1.5">
        <LightSummaryItem
          label="Subtotal"
          amount={subtotal * exchangeRate}
        />
        <LightSummaryItem
          label="Envío"
          amount={shipping * exchangeRate}
          icon={<Truck size={14} />}
        />
      </div>

      <div className="pt-3 mt-1 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            Total
          </span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(total * exchangeRate, currency, symbol)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <Button
          as={Link}
          href="/checkout"
          size="md"
          color="primary"
          className="w-full font-medium"
          isDisabled={!!error || cartItems.length === 0}
          disableAnimation={true}
        >
          Proceder al pago
        </Button>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">
          Error al calcular el envío.
        </div>
      )}
    </div>
  );
});

// Versión ligera del elemento de resumen para dispositivos lentos
const LightSummaryItem = memo(({
  label,
  amount,
  icon
}: {
  label: string;
  amount: number;
  icon?: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-1.5">
    <div className="flex items-center gap-2">
      {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </div>
    <span className="text-sm font-medium">
      {formatCurrency(amount, 'USD', '$')}
    </span>
  </div>
));

LightSummaryItem.displayName = 'LightSummaryItem';

LightOrderSummary.displayName = 'LightOrderSummary';

const OrderSummary: React.FC<OrderSummaryProps> = ({
  className,
  subtotal,
  weight,
  shipping,
  isLoadingPrice = false,
  error = null,
  cartItems = [],
}) => {
  const deviceData = useDeviceDetection();
  const { rateExchange } = useCurrencyStore();
  const { currency, exchangeRate = 1, symbol } = rateExchange || {};

  const total = subtotal + shipping;

  // Renderizar versión ligera para dispositivos de bajo rendimiento
  if (deviceData.isLowPerformance || deviceData.effectiveType === 'slow-2g' || deviceData.isDataSaver) {
    return (
      <LightOrderSummary
        subtotal={subtotal}
        weight={weight}
        shipping={shipping}
        error={error}
        cartItems={cartItems}
        exchangeRate={exchangeRate}
        currency={currency}
        symbol={symbol}
      />
    );
  }

  // Componente de elemento individual del resumen con funcionalidades completas
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

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <div
        className="w-full"
      >
        <Card
          className={`w-full shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl mx-auto ${!deviceData.isLowPerformance && !deviceData.isDataSaver ? 'bg-white dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}`}
          disableAnimation={deviceData.isLowPerformance}
        >
          <CardBody className="gap-3 p-4 sm:p-5">
            {/* Encabezado */}
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

            {/* Detalles del resumen */}
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

            <div className="mt-4">
              <Button
                as={Link}
                href="/checkout"
                size="lg"
                color="primary"
                className="w-full font-medium shadow-sm transition-all duration-300 hover:shadow-md hover:opacity-95"
                isDisabled={isLoadingPrice || !!error || cartItems.length === 0}
                startContent={<ShoppingBag size={18} />}
                disableAnimation={deviceData.isLowPerformance}
              >
                Proceder al pago
              </Button>

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
      </div>
    </div>
  );
};

export default OrderSummary;
