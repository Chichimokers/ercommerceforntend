"use client";

import React, { useContext, useMemo, useState } from "react";
import { ProductBase } from "@/types/types";
import useCartActions from "../actions";
import { CartContext } from "@/contexts/cart-context";
import Image from "next/image";
import { Link } from "@heroui/react";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import dynamic from "next/dynamic";

const QuantityAdjuster = dynamic(() => import("../buttons/quantity-selector"));

export const ProductGrid = React.memo(
  ({ product, className }: { product: ProductBase; className?: string }) => {
    const { cart, DelCartItem } = useContext(CartContext) || {};
    const {
      handleRemoveFromCart,
      handleQuantityDec,
      handleQuantityInc,
      quantity,
      isInCart,
    } = useCartActions(product);
    const ctx = useContext(CurrencyAndExchangeRateContext);
    const { rateExchange } = ctx || {};
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const cartQuantity = useMemo(() => {
      return cart?.find((item: { id: string }) => item.id === product?.id)
        ?.cantidad;
    }, [cart, product]);

    if (!product) {
      return (
        <div className="flex flex-col items-center justify-center">
          Your cart is empty
        </div>
      );
    }

    return (
      <>
        <div
          className={`hidden md:grid grid-cols-5 gap-4 border-b border-default-200 ${className}`}
        >
          <div className="py-4 flex items-center col-span-2">
            <div className="relative h-[72] w-[72] flex-shrink-0 overflow-hidden rounded-xl border border-default-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 mr-4 shadow-md">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-default-200 animate-pulse" />
              )}
              <Image
                src={
                  imageError
                    ? "/nophoto.jpeg"
                    : product.image || "/nophoto.jpeg"
                }
                alt={product.name}
                className="rounded-lg object-cover h-full w-full"
                fill
                quality={Number(process.env.IMAGE_QUALITY)}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
                priority={false}
              />
            </div>
            <div className="flex-1">
              <div className="w-full">{product.name}</div>
              <div className="text-sm text-gray-500">ID: {product.id}</div>
              <Link
                onPress={() => handleRemoveFromCart()}
                className="text-sm select-none cursor-pointer"
              >
                Remover
              </Link>
            </div>
          </div>
          <div className="py-4 flex flex-col justify-center items-center">
            {rateExchange ? (
              <>
                {rateExchange.symbol}
                {(product.price * rateExchange.exchangeRate).toFixed(2)}{" "}
                {rateExchange.currency}
              </>
            ) : (
              "$" + product.price.toFixed(2) + "USD"
            )}
          </div>
          <div className="py-4 flex flex-col justify-center items-center">
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
              maxLimit={product.quantity}
            />
          </div>
          <div className="py-4 flex flex-col justify-center items-center">
            {rateExchange ? (
              <>
                {rateExchange.symbol}
                {(
                  product.price *
                  rateExchange.exchangeRate *
                  product.quantity
                ).toFixed(2)}{" "}
                {rateExchange.currency}
              </>
            ) : (
              "$" + (product.price * product.quantity).toFixed(2) + "USD"
            )}
          </div>
        </div>
      </>
    );
  }
);

ProductGrid.displayName = "ProductGrid";
