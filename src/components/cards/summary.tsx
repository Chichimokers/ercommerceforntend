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
  tax,
}: {
  className?: string;
  subtotal: number;
  shipping: number;
  tax: number;
}) => {
  const router = useRouter();
  const ctx = useContext(CurrencyAndExchangeRateContext);
  const { rateExchange } = ctx || {};
  const { currency, exchangeRate, symbol } = rateExchange || {};
  const handleCreateOrder = () => {
    // Guardar un indicador en el almacenamiento local
    localStorage.setItem("orderCreation", "true");

    router.push("/verification");
  };

  return (
    <div className={`flex justify-center w-full ${className}`}>
      <Card
        className="w-full sm:w-[400px] md:w-[450px]
                  bg-background shadow-none
                  border border-default-200 rounded-xl mx-auto"
      >
        <CardBody className="gap-2 p-3 xs:p-4">
          <div className="space-y-3">
            <h2 className="text-base xs:text-lg font-bold text-primary">
              Resumen del pedido
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs xs:text-sm">
                <span className="text-foreground">Subtotal</span>
                <Price
                  amount={(subtotal * (exchangeRate || 1)).toFixed(2)}
                  currencyCode={currency || "USD"}
                  className="font-medium"
                />
              </div>

              <div className="flex justify-between items-center text-xs xs:text-sm">
                <span className="text-foreground flex items-center gap-1">
                  Envío
                  <FaQuestionCircle className="text-default-400 text-[10px] xs:text-xs" />
                </span>
                <Price
                  amount={(shipping * (exchangeRate || 1)).toFixed(2)}
                  currencyCode={currency || "USD"}
                  className="font-medium"
                />
              </div>

              <div className="flex justify-between items-center text-xs xs:text-sm">
                <span className="text-foreground flex items-center gap-1">
                  Impuestos
                  <FaQuestionCircle className="text-default-400 text-[10px] xs:text-xs" />
                </span>
                <Price
                  amount={(tax * (exchangeRate || 1)).toFixed(2)}
                  currencyCode={currency || "USD"}
                  className="font-medium"
                />
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-default-200">
              <div className="flex justify-between items-center">
                <span className="text-sm xs:text-base font-bold text-foreground">
                  Total
                </span>
                <Price
                  amount={(
                    (subtotal + shipping + tax) *
                    (exchangeRate || 1)
                  ).toFixed(2)}
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
