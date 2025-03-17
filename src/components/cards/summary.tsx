import { CardBody, Card, Tooltip, Divider, Button } from "@heroui/react";
import React, { useContext } from "react";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import { formatCurrency } from "@components/format-currency";
import { Box, Truck, Info, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProductBase } from "../../types/types";

interface OrderSummaryProps {
  className?: string;
  subtotal: number;
  weight: number;
  shipping: number;
  isLoadingPrice?: boolean;
  error?: any;
  cartItems?: ProductBase[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  className,
  subtotal,
  weight,
  shipping,
  isLoadingPrice = false,
  error = null,
  cartItems = [],
}) => {
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const { currency, exchangeRate = 1, symbol } = rateExchange || {};

  const total = subtotal + shipping;

  // Componente de elemento individual del resumen
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
        <Card className="w-full shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl mx-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/90">
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
              >
                Proceder al pago
              </Button>

              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center flex justify-center items-center gap-1">
                <Info size={12} />
                Se incluye el coste de embalaje y gestión
              </div>
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
