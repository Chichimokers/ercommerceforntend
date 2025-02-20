"use client"

import { useContext, useEffect, useState, useCallback } from "react"
import { Card, CardBody, CardFooter, Skeleton } from "@heroui/react"
import React from "react"
import { FaShoppingCart } from "react-icons/fa"
import Link from "next/link"
import { FaBucket } from "react-icons/fa6"
import type { ProductBase } from "@/types/types"
import StarRating from "../star-rating"
import QuantityAdjuster from "../buttons/quantity-selector"
import useCartActions from "../actions"
import Image from "next/image"
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context"
import { CustomButton } from "../buttons/custom-button"
import { CardSkeleton } from "@components/skeletons/card-skeleton"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface MediaState {
  loaded: boolean
  error: boolean
}

interface ProductCardProps {
  product: ProductBase
  prefetch?: "hover" | "click" | "none"
  className?: string
  imgClassName?: string
}

const ProductCard = React.memo(({ product, prefetch = "none", className, imgClassName }: ProductCardProps) => {
  const [mediaState, setMediaState] = useState<MediaState>({ loaded: false, error: false })
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {}
  const cartActions = useCartActions(product)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handlePrefetch = useCallback(() => {
    if (prefetch === "hover") {
      router.prefetch(`/product/${product.id}`)
    }
  }, [prefetch, product.id, router])

  if (!isMounted) return <CardSkeleton />

  return (
    <Card
      className={`${className} group w-full flex-1 min-h-[330px] flex flex-col rounded-3xl border border-default-200 hover:border-deafult-300 transition-all hover:shadow-lg overflow-hidden bg-default-50/50`}
      shadow="none"
      as={Link}
      href={`/products/${product.id}`}
      onMouseEnter={prefetch === "hover" ? handlePrefetch : undefined}
      onPress={prefetch === "click" ? handlePrefetch : undefined}
      role="article"
      aria-labelledby={`product-title-${product.id}`}
    >
      <CardBody className="overflow-hidden p-0 flex-none aspect-square w-full">
        <div className="relative w-full h-full bg-default-100 aspect-square">
          <OptimizedImage
            imgClassName={`${imgClassName} object-cover w-full h-full transition-transform duration-300 group-hover:scale-105`}
            product={product}
            mediaState={mediaState}
            setMediaState={setMediaState}
            aria-label={`Imagen de ${product.name}`}
          />
        </div>
      </CardBody>

      <CardFooter className="text-small px-2 sm:px-3 flex flex-col w-full py-3">
        <div className="flex flex-col h-full justify-between gap-2 w-full">
          <ProductHeader
            name={product.name}
            id={product.id}
          />

          <div className="flex flex-col justify-between gap-2">
            <PriceDisplay price={product.price} rateExchange={rateExchange || undefined} />
            <RatingContainer rating={product.averageRating} />
          </div>

          <CartControls product={product} cartActions={cartActions} />
        </div>
      </CardFooter>
    </Card>
  )
})

const OptimizedImage = React.memo(
  ({
    product,
    mediaState,
    setMediaState,
    imgClassName,
  }: {
    product: ProductBase
    mediaState: MediaState
    setMediaState: React.Dispatch<React.SetStateAction<MediaState>>
    imgClassName?: string
  }) => (
    <>
      {!mediaState.loaded && (
        <motion.div
          layoutId={`skeleton-${product.id}`}
          className="absolute inset-0 bg-gradient-to-br from-default-200 to-default-300"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <Image
        alt={product.name}
        className={`${imgClassName} absolute inset-0 w-full h-full object-cover transition-all duration-300 ${mediaState.loaded ? "opacity-100" : "opacity-0"
          }`}
        src={mediaState.error ? "/nophoto.jpeg" : product.image || "/nophoto.jpeg"}
        onLoad={() => setMediaState((prev) => ({ ...prev, loaded: true }))}
        onError={() => setMediaState((prev) => ({ ...prev, error: true }))}
        fill
        quality={Number(process.env.IMAGE_QUALITY)}
        loading="lazy"
      />
    </>
  ),
)

OptimizedImage.displayName = "OptimizedImage"

const ProductHeader = React.memo(({ name, id }: { name: string; id: string }) => (
  <b
    id={`product-title-${id}`}
    className="text-sm xs:text-md line-clamp-2 h-[2.6em] leading-tight font-semibold text-default-700"
    aria-label={name}
  >
    {name}
  </b>
))

ProductHeader.displayName = "ProductHeader"

const PriceDisplay = React.memo(
  ({
    price,
    rateExchange,
  }: { price: number; rateExchange?: { symbol: string; exchangeRate: number; currency: string } }) => (
    <p
      className="text-default-600 whitespace-nowrap text-sm xs:text-md text-start font-bold"
      aria-label={`Precio: ${price} USD`}
    >
      {rateExchange
        ? `${rateExchange.symbol}${(price * rateExchange.exchangeRate).toFixed(2)} ${rateExchange.currency}`
        : `$${price} USD`}
    </p>
  ),
)

PriceDisplay.displayName = "PriceDisplay"

const RatingContainer = React.memo(({ rating }: { rating?: number }) => (
  <div className="flex items-center gap-1">
    <StarRating rating={rating} />
  </div>
))

RatingContainer.displayName = "RatingContainer"

const CartControls = React.memo(
  ({ product, cartActions }: { product: ProductBase; cartActions: ReturnType<typeof useCartActions> }) => (
    <div className="flex justify-between items-center gap-2 w-full min-w-0 mt-1">
      <div className="flex items-center">
        <Skeleton isLoaded={!!product}>
          <QuantityAdjuster
            quantity={cartActions.quantity}
            isInCart={cartActions.isInCart}
            handleQuantityInc={cartActions.handleQuantityInc}
            handleQuantityDec={cartActions.handleQuantityDec}
            findInCartLocalStorage={cartActions.findInCartLocalStorage}
            getLocalStorageData={cartActions.getLocalStorageData}
            productId={product.id}
            maxLimit={product.quantity || 100}
          />
        </Skeleton>
      </div>
      <Skeleton isLoaded={!!product} className="w-full max-w-16">
        {!cartActions.isInCart && !cartActions.findInCartLocalStorage() ? (
          <AddToCartButton
            onClick={(e) => {
              e.preventDefault()
              cartActions.handleAddToCart()
            }}
            product={product}
          />
        ) : (
          <RemoveFromCartButton
            onClick={(e) => {
              e.preventDefault()
              cartActions.handleRemoveFromCart()
            }}
            product={product}
          />
        )}
      </Skeleton>
    </div>
  ),
)

CartControls.displayName = "CartControls"

const AddToCartButton = React.memo(
  ({
    onClick,
    product,
  }: {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    product: ProductBase;
  }) => (
    <CustomButton
      className="h-9 w-10 !p-0 xs:w-full shrink-0 hover:shadow-lg 
                active:scale-95 transition-all duration-200"
      color="primary"
      onClick={onClick}
      aria-label={`Añadir ${product.name} al carrito`}
    >
      <FaShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 animate-[bounce_300ms]" />
      <span className="sr-only">Añadir al carrito</span>
    </CustomButton>
  ),
)

const RemoveFromCartButton = React.memo(
  ({
    onClick,
    product,
  }: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    product: ProductBase;
  }) => (
    <CustomButton
      className="h-9 w-10 !p-0 xs:w-full shrink-0 hover:shadow-lg 
                active:scale-95 transition-all duration-200"
      color="danger"
      onClick={onClick}
      aria-label={`Eliminar ${product.name} del carrito`}
    >
      <FaBucket className="h-4 w-4 sm:h-5 sm:w-5 animate-[shake_400ms]" />
      <span className="sr-only">Eliminar del carrito</span>
    </CustomButton>
  ),
)

ProductCard.displayName = "ProductCard"
AddToCartButton.displayName = "AddToCartButton"
RemoveFromCartButton.displayName = "RemoveFromCartButton"

export default ProductCard

