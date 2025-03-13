"use client"

import { useContext, useMemo } from "react"
import { Card, CardBody, CardFooter, Chip } from "@heroui/react"
import React from "react"
import { FaShoppingCart } from "react-icons/fa"
import Link from "next/link"
import { FaBucket } from "react-icons/fa6"
import type { ProductBase } from "@/types/types"
import StarRating from "../star-rating"
import useCartActions from "../actions"
import Image from "next/image"
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context"
import { CustomButton } from "../buttons/custom-button"
import QuantityAdjuster from "@components/buttons/quantity-selector"
import { formatCurrency } from "@components/format-currency"

interface ProductCardProps {
  product: ProductBase
  prefetch?: "hover" | "viewport" | "none"
  className?: string
  imgClassName?: string
  lazyLoad?: boolean // Nueva prop para controlar la carga de imágenes
}

const ProductCard = React.memo(({
  product,
  prefetch = "none",
  className = "",
  imgClassName = "",
  lazyLoad = true // Por defecto, carga diferida activada
}: ProductCardProps) => {
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const {
    handleQuantityInc,
    handleQuantityDec,
    getLocalStorageData,
    findInCartLocalStorage,
    handleAddToCart,
    handleRemoveFromCart,
    isInCart,
    quantity
  } = useCartActions(product);

  const displayPrice = useMemo(() => {
    return product.price * (rateExchange?.exchangeRate || 1);
  }, [product.price, rateExchange]);

  const discountedPrice = useMemo(() => {
    if (product.discount && quantity >= product.discount.min) {
      return displayPrice - (product.discount.reduction * (rateExchange?.exchangeRate || 1));
    }
    return null;
  }, [displayPrice, product.discount, quantity, rateExchange]);

  const productUrl = useMemo(() => `/products/${product.id}`, [product.id]);

  const linkProps = useMemo(() => {
    return {
      href: productUrl,
      prefetch: prefetch === "none" ? false : undefined,
    };
  }, [productUrl, prefetch]);

  const imageLoadingProps = useMemo(() => {
    if (lazyLoad) {
      return {
        loading: "lazy" as const,
        priority: false
      };
    } else {
      return {
        loading: "eager" as const,
        priority: true
      };
    }
  }, [lazyLoad]);

  return (
    <Link {...linkProps}>
      <Card className={`cursor-pointer hover:shadow-md transition-shadow bg-blue/50 dark:bg-gray-800/50 ${className}`}>
        <CardBody className="p-0 overflow-hidden">
          <div className="relative w-full aspect-square">
            <Image
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-300 hover:scale-105 ${imgClassName}`}
              quality={80}
              {...imageLoadingProps}
            />

            {product.quantity < 5 && product.quantity > 1 && (
              <Chip
                className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80"
                color="danger"
                size="sm"
                variant="solid"
              >
                {product.quantity} unidades en stock
              </Chip>
            )}
            {product.quantity === 1 && (
              <Chip
                className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80"
                color="danger"
                size="sm"
                variant="solid"
              >
                Queda 1 unidad en stock
              </Chip>
            )}
            {product.quantity === 0 && (
              <Chip
                className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80"
                color="danger"
                size="sm"
                variant="solid"
              >
                No hay unidades en stock
              </Chip>
            )}

            {product.discount && product.quantity > product.discount.min && (
              <Chip
                className="absolute top-2 right-2 text-xs z-10 bg-opacity-80"
                color="warning"
                size="sm"
                variant="solid"
              >
                -{formatCurrency((product.discount.reduction * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)} desde {product.discount.min} unid.
              </Chip>
            )}
          </div>

          <div className="p-3">
            <h3 className="text-medium font-medium line-clamp-1">{product.name}</h3>

            {/*product.averageRating !== undefined && (
              <StarRating rating={product.averageRating} />
            )*/}
            <div className="h-[40px]">
              <p className="text-small text-default-500 line-clamp-2">
                {product.short_description}
              </p>
            </div>
          </div>

          <div className="px-3 flex flex-col justify-between h-8">
            <p className="font-bold text-small">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: rateExchange?.currency || "USD"
              }).format(discountedPrice || displayPrice)}
            </p>

            {discountedPrice && (
              <span className="text-xs">
                <span className="text-gray-400 line-through mr-2">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: rateExchange?.currency || "USD"
                  }).format(displayPrice)}
                </span>
                <span className="text-green-600 dark:text-green-500">
                  (-{product.discount && (((product.discount.reduction) * 100) / product.price).toFixed(2)}%)
                </span>
              </span>
            )}
          </div>
        </CardBody>

        <CardFooter className="flex justify-between items-center gap-2">
          <QuantityAdjuster
            quantity={quantity}
            isInCart={isInCart}
            handleQuantityInc={handleQuantityInc}
            handleQuantityDec={handleQuantityDec}
            findInCartLocalStorage={findInCartLocalStorage}
            getLocalStorageData={getLocalStorageData}
            productId={product.id}
            maxLimit={product.quantity || 0}
            className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          />

          {isInCart ? (
            <RemoveFromCartButton
              onClick={(e) => {
                handleRemoveFromCart()
                e.preventDefault()
              }}
              product={product}
            />
          ) : (
            <AddToCartButton
              onClick={(e) => {
                handleAddToCart()
                e.preventDefault()
              }}
            />
          )}
        </CardFooter>
      </Card>
    </Link>
  );
});

export const AddToCartButton = React.memo(({
  onClick
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}) => (
  <CustomButton
    className="h-9 !min-w-10 !max-w-20 !p-0 xs:w-auto shrink-0 hover:shadow-lg active:scale-95 transition-all duration-200 rounded-xl"
    onClick={onClick}
    aria-label="Añadir al carrito"
  >
    <FaShoppingCart className="h-4 w-4" />
  </CustomButton>
));

export const RemoveFromCartButton = React.memo(({
  onClick,
  product
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  product: ProductBase
}) => (
  <CustomButton
    className="h-9 !min-w-10 !max-w-20 !p-0 xs:w-auto shrink-0 hover:shadow-lg active:scale-95 transition-all duration-200 rounded-xl bg-red-500 hover:bg-red-600"
    color="danger"
    onClick={onClick}
    aria-label={`Eliminar ${product.name} del carrito`}
  >
    <FaBucket className="h-4 w-4" />
  </CustomButton>
));

ProductCard.displayName = "ProductCard";
AddToCartButton.displayName = "AddToCartButton";
RemoveFromCartButton.displayName = "RemoveFromCartButton";

export default ProductCard;
