import { CardBody, Card } from "@heroui/react";
import Price from "@/components/price";
import { useRouter } from "next/navigation";
import { FaQuestionCircle } from "react-icons/fa";
import React, { useContext } from "react";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import { CustomButton } from "../buttons/custom-button";

const OrderSummary = ({
  className,
  subtotal,
  shipping,
}: {
  className?: string;
  subtotal: number;
  shipping: number;
}) => {
  const router = useRouter();
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const { currency, exchangeRate = 1 } = rateExchange || {};

  // Función helper para cálculos de conversión
  const convertAmount = (amount: number) => (amount * exchangeRate).toFixed(2);

  // Componente reutilizable para ítems del resumen
  const SummaryItem = ({ label, amount, hasTooltip }: {
    label: string;
    amount: number;
    hasTooltip?: boolean
  }) => (
    <div className="flex justify-between items-center text-xs xs:text-sm">
      <span className="text-foreground flex items-center gap-1">
        {label}
        {hasTooltip && <FaQuestionCircle className="text-default-400 text-[10px] xs:text-xs" />}
      </span>
      <Price
        amount={convertAmount(amount)}
        currencyCode={currency || "USD"}
        className="font-medium"
      />
    </div>
  );

  const handleCreateOrder = () => {
    localStorage.setItem("orderCreation", "true");
    router.push("/buy");
  };

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <Card
        className="w-full sm:w-[400px] md:w-[450px]
                  shadow-none  bg-white dark:bg-gray-800/75
                  border border-default-200 rounded-xl mx-auto"
      >
        <CardBody className="gap-2 p-3 xs:p-4">
          <div className="space-y-3">
            <h2 className="text-base xs:text-lg font-bold text-primary">
              Resumen del pedido
            </h2>

            <div className="space-y-2">
              <SummaryItem label="Subtotal" amount={subtotal} />
              <SummaryItem label="Envío" amount={shipping} hasTooltip />
            </div>

            <div className="pt-3 mt-2 border-t border-default-200">
              <div className="flex justify-between items-center">
                <span className="text-sm xs:text-base font-bold text-foreground">
                  Total
                </span>
                <Price
                  amount={convertAmount(subtotal + shipping)}
                  currencyCode={currency || "USD"}
                  className="text-sm xs:text-base font-bold"
                />
              </div>
            </div>

            <CustomButton
              color="primary"
              className="w-full py-2 text-xs xs:text-sm font-semibold
                       shadow-lg hover:shadow-xl transition-all duration-300"
              size="medium"
              onClick={handleCreateOrder}
            >
              Finalizar Compra
            </CustomButton>

            <p className="text-[10px] xs:text-xs text-default-400 text-center">
              Se incluye el coste de embalaje
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OrderSummary;
