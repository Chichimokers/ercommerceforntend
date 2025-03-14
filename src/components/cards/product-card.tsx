"use client"

import React, { useContext, useMemo } from "react"
import { Card, CardBody, CardFooter, Chip, Tooltip } from "@heroui/react"
import { FaShoppingCart } from "react-icons/fa"
import Link from "next/link"
import { FaBucket } from "react-icons/fa6"
import Image from "next/image"
import type { ProductBase } from "@/types/types"
import StarRating from "../star-rating"
import useCartActions from "../actions"
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context"
import { CustomButton } from "../buttons/custom-button"
import QuantityAdjuster from "@components/buttons/quantity-selector"
import { formatCurrency } from "@components/format-currency"

const IMAGE_QUALITY = 50;
const PLACEHOLDER = "/placeholder.webp";
const ASPECT_RATIO = "aspect-square";
const DEFAULT_CURRENCY = "USD";

// Componentes pequeños separados para mejor rendimiento
const StockBadge = React.memo(({ quantity }: { quantity: number }) => {
  // Si no hay stock - chip rojo
  if (quantity === 0) {
    return (
      <Chip
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80 backdrop-blur-sm"
        color="danger"
        size="sm"
        variant="solid"
      >
        Agotado
      </Chip>
    );
  }

  // Si queda 1 unidad - chip rojo
  if (quantity === 1) {
    return (
      <Chip
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80 backdrop-blur-sm"
        color="danger"
        size="sm"
        variant="solid"
      >
        Última unidad
      </Chip>
    );
  }

  // Si quedan pocas unidades - chip amarillo
  if (quantity < 5) {
    return (
      <Chip
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80 backdrop-blur-sm"
        color="warning"
        size="sm"
        variant="solid"
      >
        Solo {quantity} unidades
      </Chip>
    );
  }

  return null;
});

const DiscountBadge = React.memo(({
  discount,
  quantity,
  rateExchange
}: {
  discount?: { reduction: number, min: number },
  quantity: number,
  rateExchange?: { exchangeRate: number, currency: string, symbol: string } | null
}) => {
  if (!discount || quantity < discount.min) return null;

  return (
    <Chip
      className="absolute top-2 right-2 text-xs z-10 bg-opacity-80 backdrop-blur-sm"
      color="warning"
      size="sm"
      variant="solid"
    >
      -{formatCurrency(
        (discount.reduction * (rateExchange?.exchangeRate || 1)),
        rateExchange?.currency,
        rateExchange?.symbol
      )} desde {discount.min} unid.
    </Chip>
  );
});

const PriceDisplay = React.memo(({
  displayPrice,
  discountedPrice,
  discount,
  originalPrice,
  currency
}: {
  displayPrice: number,
  discountedPrice: number | null,
  discount?: { reduction: number },
  originalPrice: number,
  currency: string
}) => {
  // Calcular el porcentaje de descuento una sola vez
  const discountPercentage = discount ?
    Math.round((discount.reduction * 100) / originalPrice) : 0;

  return (
    <div className="flex flex-col justify-between h-[40px]">
      <p className="font-bold text-sm sm:text-base">
        {new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: currency || DEFAULT_CURRENCY,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(discountedPrice || displayPrice)}
      </p>

      {discountedPrice && (
        <span className="text-2xs sm:text-xs flex flex-wrap items-center">
          <span className="text-gray-400 line-through mr-1">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: currency || DEFAULT_CURRENCY
            }).format(displayPrice)}
          </span>
          <span className="text-green-600 dark:text-green-500">
            (-{discountPercentage}%)
          </span>
        </span>
      )}
    </div>
  );
});

// Componente de imagen optimizada con skeleton loading
const ProductImage = React.memo(({
  src,
  alt,
  lazyLoad,
  imgClassName
}: {
  src: string,
  alt: string,
  lazyLoad: boolean,
  imgClassName?: string
}) => {
  // Props para la carga de imagen
  const imageLoadingProps = lazyLoad
    ? { loading: "lazy" as const, priority: false }
    : { loading: "eager" as const, priority: true };

  return (
    <div className={`relative w-full ${ASPECT_RATIO} bg-gray-100 dark:bg-gray-700 overflow-hidden`}>
      <Image
        src={src || PLACEHOLDER}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover transition-transform duration-300 hover:scale-105 ${imgClassName || ''}`}
        quality={IMAGE_QUALITY}
        {...imageLoadingProps}
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER;
        }}
        // Mejora la experiencia de carga con blur
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjJmMmYyIi8+PC9zdmc+"
      />
    </div>
  );
});

// Botones optimizados
export const AddToCartButton = React.memo(({
  onClick,
  disabled = false
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}) => (
  <Tooltip content={disabled ? "Sin stock disponible" : "Añadir al carrito"}>
    <div>
      <CustomButton
        className={`
          h-9 !min-w-10 !max-w-full !w-full !p-0 
          hover:shadow-lg active:scale-95 transition-all duration-200 
          rounded-xl ${disabled ? 'opacity-60 cursor-not-allowed' : ''} 
          touch-manipulation
        `}
        onClick={onClick}
        isDisabled={disabled}
        aria-label="Añadir al carrito"
      >
        <FaShoppingCart className="h-4 w-4" />
      </CustomButton>
    </div>
  </Tooltip>
));

export const RemoveFromCartButton = React.memo(({
  onClick,
  product
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  product: ProductBase
}) => (
  <Tooltip content={`Eliminar ${product.name} del carrito`}>
    <div>
      <CustomButton
        className="h-9 !min-w-10 !max-w-full !w-full !p-0 hover:shadow-lg 
                  active:scale-95 transition-all duration-200 rounded-xl 
                  bg-red-500 hover:bg-red-600 touch-manipulation"
        color="danger"
        onClick={onClick}
        aria-label={`Eliminar ${product.name} del carrito`}
      >
        <FaBucket className="h-4 w-4" />
      </CustomButton>
    </div>
  </Tooltip>
));

const ProductCard = React.memo(({
  product,
  prefetch = "none",
  className = "",
  imgClassName = "",
  lazyLoad = true
}: {
  product: ProductBase,
  prefetch?: "hover" | "viewport" | "none",
  className?: string,
  imgClassName?: string,
  lazyLoad?: boolean
}) => {
  // Context y hooks
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

  // Cálculos de precios - memoizados para evitar recálculos
  const displayPrice = useMemo(() => {
    return product.price * (rateExchange?.exchangeRate || 1);
  }, [product.price, rateExchange?.exchangeRate]);

  const discountedPrice = useMemo(() => {
    if (product.discount && quantity >= product.discount.min) {
      return displayPrice - (product.discount.reduction * (rateExchange?.exchangeRate || 1));
    }
    return null;
  }, [displayPrice, product.discount, quantity, rateExchange?.exchangeRate]);

  // URL del producto
  const productUrl = `/products/${product.id}`;

  // Detener propagación solo cuando sea necesario
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  return (
    <Link
      href={productUrl}
      prefetch={prefetch === "none" ? false : undefined}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      <Card className={`
        h-full cursor-pointer hover:shadow-md transition-all duration-300 
        bg-white dark:bg-gray-800/80 
        hover:translate-y-[-4px] 
        rounded-xl overflow-hidden
        border border-gray-200 dark:border-gray-700
        ${className}
      `}>
        <CardBody className="p-0 overflow-hidden">
          {/* Imagen optimizada */}
          <div className="relative">
            <ProductImage
              src={product.image || PLACEHOLDER}
              alt={product.name}
              lazyLoad={lazyLoad}
              imgClassName={imgClassName}
            />

            {/* Badges */}
            <StockBadge quantity={product.quantity || 0} />
            <DiscountBadge
              discount={product.discount}
              quantity={product.quantity || 0}
              rateExchange={rateExchange}
            />
          </div>

          {/* Información del producto - responsive spacing */}
          <div className="px-2 pt-2 sm:px-3 sm:pt-3 md:px-4 md:pt-4">
            {/* Título con elipsis */}
            <h3 className="text-sm sm:text-base font-medium line-clamp-1 mb-1">
              {product.name}
            </h3>

            <div className="mb-2">
              <StarRating value={product.averageRating} />
            </div>

            {/* Descripción con altura fija */}
            <div className="h-8 sm:h-10 mb-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {product.short_description || "Sin descripción disponible"}
              </p>
            </div>

            {/* Precios - componente memoizado */}
            <PriceDisplay
              displayPrice={displayPrice}
              discountedPrice={discountedPrice}
              discount={product.discount}
              originalPrice={product.price}
              currency={rateExchange?.currency || DEFAULT_CURRENCY}
            />
          </div>
        </CardBody>

        {/* Footer con controles de carrito */}
        <CardFooter className="flex justify-between items-center gap-2 p-2 sm:p-3 pt-0">
          {/* Ajustador de cantidad */}
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
              className="bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow"
            />
          </div>

          {/* Botón de carrito */}
          <div className="flex-grow">
            {isInCart ? (
              <RemoveFromCartButton
                onClick={(e) => handleButtonClick(e, handleRemoveFromCart)}
                product={product}
              />
            ) : (
              <AddToCartButton
                onClick={(e) => handleButtonClick(e, handleAddToCart)}
                disabled={product.quantity === 0}
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
});

// Display names para DevTools
StockBadge.displayName = "StockBadge";
DiscountBadge.displayName = "DiscountBadge";
PriceDisplay.displayName = "PriceDisplay";
ProductImage.displayName = "ProductImage";
ProductCard.displayName = "ProductCard";
AddToCartButton.displayName = "AddToCartButton";
RemoveFromCartButton.displayName = "RemoveFromCartButton";

export default ProductCard;
