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

interface ProductCardProps {
  product: ProductBase
  prefetch?: "hover" | "viewport" | "none"
  className?: string
  imgClassName?: string
  lazyLoad?: boolean
}

// Componente para mostrar el stock del producto
const StockBadge = ({ quantity }: { quantity: number }) => {
  if (quantity === 0) {
    return (
      <Chip
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80 backdrop-blur-sm"
        color="danger"
        size="sm"
        variant="solid"
      >
        No hay unidades en stock
      </Chip>
    );
  }

  if (quantity === 1) {
    return (
      <Chip
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80 backdrop-blur-sm"
        color="danger"
        size="sm"
        variant="solid"
      >
        Queda 1 unidad en stock
      </Chip>
    );
  }

  if (quantity < 5) {
    return (
      <Chip
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80 backdrop-blur-sm"
        color="danger"
        size="sm"
        variant="solid"
      >
        {quantity} unidades en stock
      </Chip>
    );
  }

  return null;
};

// Componente para mostrar el descuento
const DiscountBadge = ({
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
};

// Componente para mostrar el precio
const PriceDisplay = ({
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
  return (
    <div className="flex flex-col justify-between h-[40]">
      <p className="font-bold text-small">
        {new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: currency || "EUR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(discountedPrice || displayPrice)}
      </p>

      {discountedPrice && (
        <span className="text-xs">
          <span className="text-gray-400 line-through mr-2">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: currency || "EUR"
            }).format(displayPrice)}
          </span>
          <span className="text-green-600 dark:text-green-500">
            (-{discount && (((discount.reduction) * 100) / originalPrice).toFixed(0)}%)
          </span>
        </span>
      )}
    </div>
  );
};

const ProductCard = React.memo(({
  product,
  prefetch = "none",
  className = "",
  imgClassName = "",
  lazyLoad = true
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

  // Cálculos de precios
  const displayPrice = useMemo(() => {
    return product.price * (rateExchange?.exchangeRate || 1);
  }, [product.price, rateExchange?.exchangeRate]);

  const discountedPrice = useMemo(() => {
    if (product.discount && quantity >= product.discount.min) {
      return displayPrice - (product.discount.reduction * (rateExchange?.exchangeRate || 1));
    }
    return null;
  }, [displayPrice, product.discount, quantity, rateExchange?.exchangeRate]);

  const productUrl = `/products/${product.id}`;

  // Props para la carga de imagen
  const imageLoadingProps = lazyLoad
    ? { loading: "lazy" as const, priority: false }
    : { loading: "eager" as const, priority: true };

  const handleLinkClick = (e: React.MouseEvent) => {
    // Permitir que los eventos dentro de las tarjetas no naveguen
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
    }
  };

  return (
    <Link
      href={productUrl}
      prefetch={prefetch === "none" ? false : undefined}
      onClick={handleLinkClick}
      className="block"
    >
      <Card className={`
        h-full cursor-pointer hover:shadow-md transition-all duration-300 
        bg-white dark:bg-gray-800/80 
        hover:translate-y-[-4px] 
        rounded-xl overflow-hidden
        ${className}
      `}>
        <CardBody className="p-0 overflow-hidden">
          {/* Imagen del producto */}
          <div className="relative w-full aspect-square">
            <Image
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${imgClassName}`}
              quality={75}
              {...imageLoadingProps}
              onError={(e) => {
                // Fallback para imágenes que no cargan
                (e.target as HTMLImageElement).src = "/placeholder.jpg";
              }}
            />

            {/* Badges de stock y descuento */}
            <StockBadge quantity={product.quantity || 0} />
            <DiscountBadge
              discount={product.discount}
              quantity={product.quantity || 0}
              rateExchange={rateExchange}
            />
          </div>

          {/* Detalles del producto */}
          <div className="p-4">
            <h3 className="text-medium font-medium line-clamp-1 mb-1">{product.name}</h3>

            {product.averageRating !== undefined && (
              <div className="mb-2">
                <StarRating value={product.averageRating} />
              </div>
            )}

            <div className="h-[40px] mb-2">
              <p className="text-small text-default-500 line-clamp-2">
                {product.short_description || "Sin descripción disponible"}
              </p>
            </div>

            {/* Precios */}
            <PriceDisplay
              displayPrice={displayPrice}
              discountedPrice={discountedPrice}
              discount={product.discount}
              originalPrice={product.price}
              currency={rateExchange?.currency || "EUR"}
            />
          </div>
        </CardBody>

        {/* Footer con controles de carrito */}
        <CardFooter className="flex justify-between items-center gap-2 p-3 pt-0">
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
          <div className="w-full">
            {isInCart ? (
              <RemoveFromCartButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFromCart();
                }}
                product={product}
              />
            ) : (
              <AddToCartButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={product.quantity === 0}
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
});

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
          h-9 !min-w-10 !max-w-20 !w-full !p-0 xs:w-auto shrink-0 
          hover:shadow-lg active:scale-95 transition-all duration-200 
          rounded-xl ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
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
        className="h-9 !min-w-10 !max-w-20 !w-full !p-0 xs:w-auto shrink-0 hover:shadow-lg active:scale-95 transition-all duration-200 rounded-xl bg-red-500 hover:bg-red-600"
        color="danger"
        onClick={onClick}
        aria-label={`Eliminar ${product.name} del carrito`}
      >
        <FaBucket className="h-4 w-4" />
      </CustomButton>
    </div>
  </Tooltip>
));

ProductCard.displayName = "ProductCard";
AddToCartButton.displayName = "AddToCartButton";
RemoveFromCartButton.displayName = "RemoveFromCartButton";

export default ProductCard;
