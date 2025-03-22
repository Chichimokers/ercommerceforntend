import React, { useMemo, useContext, useState } from "react";
import Image from "next/image";
import { DeleteItemButton } from "../buttons/delete-product-button";
import { ProductBase } from "@/types/types";
import { CartContext } from "@/contexts/cart-context";
import useCartActions from "../actions";
import QuantityAdjuster from "../buttons/quantity-selector";
import { formatCurrency } from "@components/format-currency";
import { useProductContext } from "@contexts/product-context";
import { useCurrencyStore } from "@store/currency/currency-store";
import { useCartStore } from "@store/cart/cart-store";

const CartCard = React.memo(
  ({
    productCart,
    className,
  }: {
    productCart: ProductBase;
    className?: string;
  }) => {
    const { cart } = useCartStore() || {};
    const { isInCart, handleRemoveFromCart, handleQuantityInc, handleQuantityDec } = useCartActions(productCart);
    const { cartProducts } = useProductContext();
    const product = useMemo(() => cartProducts.find((p) => p.id === productCart.id), [cartProducts, productCart.id]);
    const [imageStatus, setImageStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

    const cartQuantity = useMemo(() => {
      return cart?.find((item: { id: string }) => item.id === product?.id)?.cantidad || 0;
    }, [cart, product]);

    const { rateExchange } = useCurrencyStore();

    const unitPrice = useMemo(() => {
      if (!product || !rateExchange) return 0;
      return product.price * (rateExchange.exchangeRate || 1);
    }, [product, rateExchange]);

    const discountPercentage = useMemo(() => {
      if (!product?.discount || cartQuantity < product.discount.min) return 0;
      return ((product.discount.reduction * (rateExchange?.exchangeRate || 1)) * 100) / unitPrice;
    }, [product, cartQuantity]);

    const totalPrice = useMemo(() => {
      if (!unitPrice || cartQuantity <= 0) return 0;
      const discountMultiplier = discountPercentage > 0 ? (100 - discountPercentage) / 100 : 1;
      return unitPrice * cartQuantity * discountMultiplier;
    }, [unitPrice, cartQuantity, discountPercentage]);

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

          <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
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

            <div className="flex flex-row items-center justify-between gap-2">
              <div className="flex flex-col">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium">{formatCurrency(unitPrice, rateExchange?.currency || "USD", rateExchange?.symbol)}</span>

                  {discountPercentage > 0 && (
                    <span className="ml-2 text-green-600 dark:text-green-500">
                      (-{discountPercentage.toFixed(2)}%)
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold">
                  Total: <span className="text-blue-600 dark:text-blue-500">{formatCurrency(totalPrice, rateExchange?.currency || "USD", rateExchange?.symbol)}</span>
                </div>
              </div>

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

            {product.discount && cartQuantity < product.discount.min && (
              <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                Compra {product.discount.min} unidades o más para obtener un {(((product.discount.reduction * (rateExchange?.exchangeRate || 1)) * 100) / unitPrice).toFixed(2)}% de descuento
              </div>
            )}
          </div>
        </div>
      </li>
    );
  }
);

CartCard.displayName = "CartCard";

export default CartCard;