"use client";

import React, { useMemo, useContext, useState } from "react";
import Image from "next/image";
import { DeleteItemButton } from "../buttons/delete-product-button";
import { ProductBase } from "@/types/types";
import { CartContext } from "@/contexts/cart-context";
import useCartActions from "../actions";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import { useProductContext } from "@/contexts/product-context";
import dynamic from "next/dynamic";

const QuantityAdjuster = dynamic(() => import("../buttons/quantity-selector"));

export const ProductGrid = React.memo(
  ({ productCart, className }: { productCart: ProductBase; className?: string }) => {
    const { cart } = useContext(CartContext) || {};
    const { isInCart, handleRemoveFromCart, handleQuantityInc, handleQuantityDec } = useCartActions(productCart);
    const { cartProducts } = useProductContext();
    const product = useMemo(() => cartProducts.find((p) => p.id === productCart.id), [cartProducts, productCart.id]);
    const [imageStatus, setImageStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

    const cartQuantity = useMemo(() => {
      return cart?.find((item: { id: string }) => item.id === product?.id)?.cantidad;
    }, [cart, product]);
    const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};

    if (!product) {
      return (
        <div className="flex flex-col items-center justify-center">
          Tu carrito está vacío
        </div>
      );
    }

    return (
      <div
        className={`hidden md:grid grid-cols-5 lg:grid-cols-6 gap-6 border-b border-gray-200 dark:border-gray-700 px-4 ${className} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
      >
        <div className="py-6 flex items-center col-span-2 lg:col-span-3">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 border-gray-100 dark:border-gray-800 mr-4 shadow-lg transition-all group hover:shadow-md">
            {imageStatus !== 'loaded' && (
              <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
            )}
            <Image
              alt={product.name}
              fill
              loading="lazy"
              className="object-cover"
              onLoad={() => setImageStatus('loaded')}
              onError={() => setImageStatus('error')}
              src={imageStatus === 'error' ? '/nophoto.jpeg' : product.image || '/nophoto.jpeg'}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="font-medium text-lg text-gray-800 dark:text-white">{product.name}</div>
            <div className="text-sm text-gray-500">ID: {product.id}</div>
            <button
              onClick={handleRemoveFromCart}
              className="text-red-500 hover:opacity-80 transition-opacity text-sm font-medium"
            >
              Eliminar artículo
            </button>
          </div>
        </div>

        <div className="py-6 flex flex-col justify-center items-start text-gray-600 dark:text-gray-300">
          {rateExchange ? (
            <div className="space-y-1">
              <span className="text-xs block">Unitario</span>
              {rateExchange.symbol}
              {(product.price * rateExchange.exchangeRate).toFixed(2)}{" "}
              <span className="text-xs">{rateExchange.currency}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs block">Unitario</span>
              ${product.price.toFixed(2)} USD
            </div>
          )}
        </div>

        <div className="py-6 flex flex-col justify-center items-center">
          <QuantityAdjuster
            quantity={cartQuantity || 1}
            isInCart={isInCart}
            handleQuantityInc={handleQuantityInc}
            handleQuantityDec={handleQuantityDec}
            findInCartLocalStorage={() => !!cartQuantity}
            getLocalStorageData={() => cart?.find((item) => item.id === product.id)}
            productId={product.id}
            maxLimit={product.quantity || 100}
          />
        </div>

        <div className="py-6 flex flex-col justify-center items-start font-medium">
          {rateExchange ? (
            <div className="space-y-1">
              <span className="text-xs block">Total</span>
              {rateExchange.symbol}
              {(product.price * rateExchange.exchangeRate * product.quantity).toFixed(2)}{" "}
              <span className="text-xs">{rateExchange.currency}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs block">Total</span>
              ${(product.price * product.quantity).toFixed(2)} USD
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProductGrid.displayName = "ProductGrid";
