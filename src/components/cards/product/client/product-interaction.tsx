"use client";

import { ProductBase } from "@/types/types";
import useCartActions from "@/components/actions";
import { useContext, useMemo } from "react";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import { CartButtons } from "./cart-buttons";
import QuantityAdjuster from "@components/buttons/quantity-selector";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

interface ProductInteractionProps {
  product: ProductBase;
  prefetch?: "hover" | "viewport" | "none";
}

export default function ProductInteraction({
  product,
}: ProductInteractionProps) {
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const { isMobile } = useDeviceDetection();

  const {
    handleQuantityInc,
    handleQuantityDec,
    getLocalStorageData,
    findInCartLocalStorage,
    handleAddToCart,
    handleRemoveFromCart,
    isInCart,
    quantity,
  } = useCartActions(product);

  const displayPrice = useMemo(() => {
    return product.price * (rateExchange?.exchangeRate || 1);
  }, [product.price, rateExchange?.exchangeRate]);

  const discountedPrice = useMemo(() => {
    if (product.discount && quantity >= product.discount.min) {
      return displayPrice - (product.discount.reduction * (rateExchange?.exchangeRate || 1));
    }
    return null;
  }, [displayPrice, product.discount, quantity, rateExchange?.exchangeRate]);

  const handleInteractionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="flex justify-between items-center gap-2 p-2 sm:p-3 border-t border-gray-100 dark:border-gray-700 w-full"
      onClick={handleInteractionClick}
    >
      <div className="flex-shrink-0">
        <QuantityAdjuster
          quantity={quantity}
          isInCart={isInCart}
          handleQuantityInc={handleQuantityInc}
          handleQuantityDec={handleQuantityDec}
          findInCartLocalStorage={findInCartLocalStorage}
          getLocalStorageData={getLocalStorageData}
          productId={product.id}
          maxLimit={product.quantity || 0}
          className={`bg-white dark:bg-gray-700 ${isMobile ? '' : 'shadow-sm hover:shadow-md transition-shadow'}`}
        />
      </div>

      <div className="flex-grow">
        <CartButtons
          product={product}
          isInCart={isInCart}
          handleAddToCart={handleAddToCart}
          handleRemoveFromCart={handleRemoveFromCart}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}