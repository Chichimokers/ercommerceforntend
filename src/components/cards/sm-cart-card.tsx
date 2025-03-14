"use client";

import React, { useMemo, useContext, useState } from "react";
import Image from "next/image";
import { ProductBase } from "@/types/types";
import { CartContext } from "@/contexts/cart-context";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import { formatCurrency } from "@components/format-currency";
import { Badge, Chip, Tooltip } from "@heroui/react";
import { DeleteItemButton } from "../buttons/delete-product-button";
import useCartActions from "../actions";
import QuantityAdjuster from "../buttons/quantity-selector";

interface SmCartCardProps {
  product: ProductBase;
  className?: string;
}

const SmCartCard = React.memo(({ product, className = "" }: SmCartCardProps) => {
  const { cart } = useContext(CartContext) || {};
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const [imageStatus, setImageStatus] = useState<'loading' | 'error' | 'loaded'>('loading');
  const { isInCart, handleRemoveFromCart, handleQuantityInc, handleQuantityDec } = useCartActions(product);

  const cartQuantity = useMemo(() => {
    return cart?.find((item) => item.id === product.id)?.cantidad || 0;
  }, [cart, product.id]);

  const unitPrice = useMemo(() => {
    if (!rateExchange) return product.price;
    return product.price * (rateExchange.exchangeRate || 1);
  }, [product.price, rateExchange]);

  const discountPercentage = useMemo(() => {
    if (!product.discount || cartQuantity < product.discount.min) return 0;
    return ((product.discount.reduction * 100) * (rateExchange?.exchangeRate || 1)) / unitPrice;
  }, [product.discount, cartQuantity]);

  const totalPrice = useMemo(() => {
    if (!unitPrice || cartQuantity <= 0) return 0;
    const discountMultiplier = discountPercentage > 0 ? (100 - discountPercentage) / 100 : 1;
    return unitPrice * cartQuantity * discountMultiplier;
  }, [unitPrice, cartQuantity, discountPercentage]);

  return (
    <div className={`grid grid-cols-[2fr,1fr,1fr,1fr] items-center border-b border-neutral-200 dark:border-neutral-700 py-3 ${className}`}>
      <div className="flex items-center pr-4">
        <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden mr-3">
          {imageStatus !== 'loaded' && (
            <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
          )}
          <Image
            src={imageStatus === 'error' ? '/nophoto.jpeg' : product.image || '/nophoto.jpeg'}
            alt={product.name}
            fill
            sizes="64px"
            className="object-cover rounded-xl"
            onLoad={() => setImageStatus('loaded')}
            onError={() => setImageStatus('error')}
            loading="lazy"
          />
          <div className="absolute top-0 left-0 z-10">
            <DeleteItemButton onPress={handleRemoveFromCart} />
          </div>
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-100">
            {product.name}
          </h4>

          {product.discount && (
            <Tooltip
              content={`Compra ${product.discount.min} o más para obtener un descuento del ${((product.discount.reduction * 100) / unitPrice).toFixed(2)}%`}
              placement="bottom"
            >
              <span className="text-xs text-default-600 cursor-help hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                Descuento disponible
              </span>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="text-center">
        <div className="text-sm font-medium">
          {rateExchange && formatCurrency(unitPrice, rateExchange.currency, rateExchange.symbol)}
        </div>

        {discountPercentage > 0 && (
          <Chip size="sm" variant="flat" color="danger" className="mx-auto mt-1">
            -{discountPercentage.toFixed(2)}%
          </Chip>
        )}
      </div>

      <div className="flex justify-center">
        <QuantityAdjuster
          quantity={cartQuantity}
          isInCart={isInCart}
          handleQuantityInc={handleQuantityInc}
          handleQuantityDec={handleQuantityDec}
          findInCartLocalStorage={() => !!cartQuantity}
          getLocalStorageData={() => cart?.find((item) => item.id === product.id)}
          productId={product.id}
          maxLimit={product.quantity || 100}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {rateExchange && formatCurrency(totalPrice, rateExchange.currency, rateExchange.symbol)}
        </p>

        {discountPercentage > 0 && (
          <p className="text-xs text-gray-500 line-through">
            {rateExchange && formatCurrency(unitPrice * cartQuantity, rateExchange.currency, rateExchange.symbol)}
          </p>
        )}
      </div>
    </div>
  );
});

SmCartCard.displayName = "SmCartCard";

export default SmCartCard;