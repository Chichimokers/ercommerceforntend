import React, { useMemo, useContext, useState } from "react";
import { Skeleton } from "@heroui/react";
import Image from "next/image";
import { DeleteItemButton } from "../buttons/delete-product-button";
import { ProductBase } from "@/types/types";
import { CartContext } from "@/contexts/cart-context";
import useCartActions from "../actions";

import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import QuantityAdjuster from "../buttons/quantity-selector";
import Price from "../price";
import { useProductContext } from "@/contexts/product-context";
//hay que cambiar no considero necesario buscarlo otraves en los productos cuando ya se hace en el otro componente
//solo no quise ser tan intrusivo  (no mas intrusivo de lo que fui :) sorry de antemano por to lo que cambie )
const CartCard = React.memo(
  ({
    productCart,
    className,
  }: {
    productCart: ProductBase;
    className?: string;
  }) => {
    const { cart } = useContext(CartContext) || {};
    const {
      isInCart,
      quantity,
      handleRemoveFromCart,
      handleQuantityInc,
      handleQuantityDec,
    } = useCartActions(productCart);
    const { cartProducts } = useProductContext();
    const product = useMemo(
      () => cartProducts.find((p) => p.id === productCart.id),
      [cartProducts, productCart.id]
    );
    const [imageStatus, setImageStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

    const cartQuantity = useMemo(() => {
      return cart?.find((item: { id: string }) => item.id === product?.id)
        ?.cantidad;
    }, [cart, product]);
    const ctx = useContext(CurrencyAndExchangeRateContext);
    const { rateExchange } = ctx || {};

    if (!product) {
      return (
        <div className="flex justify-center items-center p-4 text-neutral-500">
          Tu carrito está vacío
        </div>
      );
    }

    return (
      <li className={`flex w-full border-b border-neutral-300 dark:border-neutral-700 ${className} px-2 py-4`}>
        <div className="relative flex w-full gap-4">
          <div className="absolute top-0 left-0 z-10">
            <DeleteItemButton onPress={handleRemoveFromCart} />
          </div>

          <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
            {imageStatus !== 'loaded' && (
              <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
            )}
            <Image
              alt={productCart.name}
              fill
              loading="lazy"
              className="object-cover"
              onLoad={() => setImageStatus('loaded')}
              onError={() => setImageStatus('error')}
              src={imageStatus === 'error' ? '/nophoto.jpeg' : productCart.image || '/nophoto.jpeg'}
            />
          </div>

          <div className="flex flex-col flex-1 gap-2">
            <h3 className="font-medium line-clamp-2">{productCart.name}</h3>

            <div className="flex items-center justify-between">
              <Price
                amount={(productCart.price * (rateExchange?.exchangeRate || 1)).toFixed(2)}
                currencyCode={rateExchange?.currency || "USD"}
                className="text-sm font-semibold"
              />

              <QuantityAdjuster
                quantity={cartQuantity || quantity}
                isInCart={isInCart}
                handleQuantityInc={handleQuantityInc}
                handleQuantityDec={handleQuantityDec}
                findInCartLocalStorage={() => !!cartQuantity}
                getLocalStorageData={() =>
                  cart?.find((item) => item.id === product.id)
                }
                productId={product.id}
                maxLimit={product.quantity || 100}
              />
            </div>
          </div>
        </div>
      </li>
    );
  }
);

CartCard.displayName = "CartCard";

export default CartCard;
