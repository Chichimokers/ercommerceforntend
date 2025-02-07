"use client";

import React, { useContext, useMemo, useState } from "react";
import { ProductBase } from "@/types/types";
import useCartActions from "../actions";
import { CartContext } from "@/contexts/cart-context";
import Image from "next/image";
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
          className={`hidden md:grid grid-cols-5 lg:grid-cols-6 gap-6 border-b border-default-200 dark:border-default-700 px-4 ${className} 
            hover:bg-default-50 transition-colors`}
        >
          <div className="py-6 flex items-center col-span-2 lg:col-span-3">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-default-100 dark:border-default-800 mr-4 
              shadow-lg hover:shadow-md transition-all group">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-default-100 animate-pulse rounded-xl" />
              )}
              <Image
                src={
                  imageError
                    ? "/nophoto.jpeg"
                    : product.image || "/nophoto.jpeg"
                }
                alt={product.name}
                className="rounded-xl object-cover h-full w-full transform group-hover:scale-105 transition-transform duration-300"
                fill
                quality={Number(process.env.IMAGE_QUALITY)}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="lazy"
                priority={false}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="font-medium text-lg text-default-700">{product.name}</div>
              <div className="text-sm text-default-500">ID: {product.id}</div>
              <button
                onClick={() => handleRemoveFromCart()}
                className="text-danger-500 hover:opacity-80 transition-opacity text-sm font-medium"
              >
                Eliminar artículo
              </button>
            </div>
          </div>

          <div className="py-6 flex flex-col justify-center items-start text-default-600">
            {rateExchange ? (
              <div className="space-y-1">
                <span className="text-xs text-default-500 block">Unitario</span>
                {rateExchange.symbol}
                {(product.price * rateExchange.exchangeRate).toFixed(2)}{" "}
                <span className="text-xs">{rateExchange.currency}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs text-default-500 block">Unitario</span>
                ${product.price.toFixed(2)} USD
              </div>
            )}
          </div>

          <div className="py-6 flex flex-col justify-center items-center">
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

          <div className="py-6 flex flex-col justify-center items-start text-default-800 font-medium">
            {rateExchange ? (
              <div className="space-y-1">
                <span className="text-xs text-default-500 block">Total</span>
                {rateExchange.symbol}
                {(
                  product.price *
                  rateExchange.exchangeRate *
                  product.quantity
                ).toFixed(2)}{" "}
                <span className="text-xs">{rateExchange.currency}</span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-xs text-default-500 block">Total</span>
                ${(product.price * product.quantity).toFixed(2)} USD
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);

ProductGrid.displayName = "ProductGrid";
