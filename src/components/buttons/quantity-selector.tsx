import React from "react";
import { EditProductQuantityButton } from "./edit-product-quantity-button";

const QuantityAdjuster = ({
  quantity,
  handleQuantityInc,
  handleQuantityDec,
  productId,
  maxLimit,
  className,
}: {
  quantity: number;
  isInCart: boolean;
  handleQuantityInc: () => void;
  handleQuantityDec: () => void;
  findInCartLocalStorage: () => boolean;
  getLocalStorageData: (productId: string) => { cantidad: number } | undefined;
  productId: string;
  maxLimit: number;
  className?: string;
}) => {
  return (
    <div className={`${className} flex h-8 w-max md:w-[90] lg:w-[100] xl:max-w-[110] items-center rounded-full border border-neutral-200 dark:border-neutral-700`}>
      <EditProductQuantityButton
        type="minus"
        onClick={(e) => {
          e.preventDefault();
          if (quantity > 1) {
            handleQuantityDec();
          }
        }}
      />
      <p className="flex w-4 sm:w-6 items-center justify-center px-1 text-center border-l border-r border-neutral-200 dark:border-neutral-700">
        <span
          className="text-xs sm:text-sm"
          onClick={(e) => e.preventDefault()}
        >
          {Math.min(quantity, maxLimit)}
        </span>
      </p>
      <EditProductQuantityButton
        type="plus"
        onClick={(e) => {
          e.preventDefault();
          if (quantity < maxLimit) handleQuantityInc();
        }}
      />
    </div>
  );
};

export default QuantityAdjuster;
