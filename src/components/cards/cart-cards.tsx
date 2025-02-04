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
    const { cart, DelCartItem } = useContext(CartContext) || {};
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
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const cartQuantity = useMemo(() => {
      return cart?.find((item: { id: string }) => item.id === product?.id)
        ?.cantidad;
    }, [cart, product]);
    const ctx = useContext(CurrencyAndExchangeRateContext);
    const { rateExchange } = ctx || {};

    if (!product) {
      return (
        <div className="flex flex-col items-center justify-center">
          Your cart is empty
        </div>
      );
    }

    return (
      <li
        className={`flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700 ${className}`}
      >
        <div className="relative flex w-full flex-row justify-between px-1 py-4 z-0">
          <div className="absolute z-40 -ml-1 -mt-2">
            <Skeleton className="w-8 h-8 rounded-full" isLoaded={!!product}>
              <DeleteItemButton onPress={handleRemoveFromCart} />
            </Skeleton>
          </div>

          <div className="flex flex-row gap-4">
            <div className="relative w-16 h-16 aspect-square overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 mr-4">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-default-200 animate-pulse" />
              )}
              <Image
                alt={product.name}
                quality={Number(process.env.IMAGE_QUALITY)}
                loading="lazy"
                priority={false}
                className="absolute inset-0 w-full h-full object-cover rounded-md"
                fill
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                src={
                  imageError
                    ? "/nophoto.jpeg"
                    : product.image || "/nophoto.jpeg"
                }
              />
            </div>

            <div className="flex flex-1 flex-col text-base">
              <Skeleton
                className="w-[120px] h-5 rounded-lg"
                isLoaded={!!product.name}
              >
                <span className="leading-tight truncate block w-[120px] md:w-max">
                  {product.name}
                </span>
              </Skeleton>
            </div>
          </div>

          {/* Precio y controles */}
          <div className="flex h-16 flex-col justify-between">
            <Skeleton
              className="w-20 h-5 rounded-lg"
              isLoaded={!!product.price}
            >
              <Price
                amount={
                  rateExchange
                    ? (product.price * rateExchange.exchangeRate).toString()
                    : product.price.toString()
                }
                className="flex space-y-2 text-sm"
                currencyCode={rateExchange?.currency || "USD"}
              />
            </Skeleton>

            <Skeleton className="rounded-full" isLoaded={!!product}>
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
            </Skeleton>
          </div>
        </div>
      </li>
    );
  }
);

CartCard.displayName = "CartCard";

export default CartCard;
