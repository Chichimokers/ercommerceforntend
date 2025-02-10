"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { Card, CardBody, CardFooter, Skeleton } from "@heroui/react";
import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import Link from "next/link";
import { FaBucket } from "react-icons/fa6";
import { ProductBase } from "@/types/types";
import StarRating from "../star-rating";
import QuantityAdjuster from "../buttons/quantity-selector";
import useCartActions from "../actions";
import Image from "next/image";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import { CustomButton } from "../buttons/custom-button";
import { CardSkeleton } from "@components/skeletons/card-skeleton";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface MediaState {
  loaded: boolean;
  error: boolean;
}

interface ProductCardProps {
  product: ProductBase;
  prefetch?: "hover" | "click" | "none";
  className?: string;
  imgClassName?: string;
}

const ProductCard = React.memo(({ product, prefetch = "none", className, imgClassName }: ProductCardProps) => {
  const [mediaState, setMediaState] = useState<MediaState>({ loaded: false, error: false });
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const cartActions = useCartActions(product);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePrefetch = useCallback(() => {
    if (prefetch === "hover") {
      router.prefetch(`/product/${product.id}`);
    }
  }, [prefetch, product.id, router]);

  if (!isMounted) return <CardSkeleton />;

  return (
    <Card
      className={`${className} h-full w-full bg-default-50/80 rounded-3xl transition-all border border-default-100 hover:border-default-300 hover:shadow-lg`}
      shadow="none"
      as={Link}
      href={`/products/${product.id}`}
      onMouseEnter={prefetch === "hover" ? handlePrefetch : undefined}
      onPress={prefetch === "click" ? handlePrefetch : undefined}
    >
      <CardBody className="overflow-hidden p-0">
        <div className="relative aspect-square w-full bg-default-100 group">
          <OptimizedImage
            imgClassName={`${imgClassName} group-hover:scale-105 transition-transform duration-300`}
            product={product}
            mediaState={mediaState}
            setMediaState={setMediaState}
          />
        </div>
      </CardBody>

      <CardFooter className="text-small p-3 sm:p-4 max-h-[180px] md:min-h-[140px] xs:min-h-[130px]">
        <div className="flex flex-col w-full gap-2 h-full justify-between">
          <ProductHeader name={product.name} />
          <PriceDisplay
            price={product.price}
            rateExchange={rateExchange || undefined}
          />
          <RatingContainer rating={product.averageRating} />
          <CartControls
            product={product}
            cartActions={cartActions}
          />
        </div>
      </CardFooter>
    </Card>
  );
});

const OptimizedImage = React.memo(({ product, mediaState, setMediaState, imgClassName }:
  { product: ProductBase, mediaState: MediaState, setMediaState: React.Dispatch<React.SetStateAction<MediaState>>, imgClassName?: string }) => (
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
      className={`${imgClassName} absolute inset-0 object-cover transition-all duration-300 ${mediaState.loaded ? "opacity-100" : "opacity-0"
        }`}
      src={mediaState.error ? "/nophoto.jpeg" : product.image || "/nophoto.jpeg"}
      onLoad={() => setMediaState(prev => ({ ...prev, loaded: true }))}
      onError={() => setMediaState(prev => ({ ...prev, error: true }))}
      fill
      quality={Number(process.env.IMAGE_QUALITY)}
      loading="lazy"
    />
  </>
));

OptimizedImage.displayName = 'OptimizedImage'

const ProductHeader = React.memo(({ name }: { name: string }) => (
  <b className="text-sm xs:text-md md:text-lg line-clamp-1 text-start font-semibold text-default-700 leading-tight">
    {name}
  </b>
));

ProductHeader.displayName = 'ProductHeader'

const PriceDisplay = React.memo(({ price, rateExchange }:
  { price: number, rateExchange?: { symbol: string; exchangeRate: number; currency: string } }) => (
  <p className="text-default-600 whitespace-nowrap text-sm xs:text-md sm:text-lg text-start font-medium">
    {rateExchange
      ? `${rateExchange.symbol}${(price * rateExchange.exchangeRate).toFixed(2)} ${rateExchange.currency}`
      : `$${price} USD`}
  </p>
));

PriceDisplay.displayName = 'PriceDisplay'

const RatingContainer = React.memo(({ rating }: { rating?: number }) => (
  <div>
    <StarRating rating={rating} className="mb-2" />
  </div>
));

RatingContainer.displayName = 'RatingContainer'

const CartControls = React.memo(({ product, cartActions }:
  { product: ProductBase, cartActions: ReturnType<typeof useCartActions> }) => (
  <div className="flex justify-between items-center gap-2 w-full">
    <div className="flex items-center">
      <Skeleton isLoaded={!!product}>
        <QuantityAdjuster
          className="h-16"
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
        <AddToCartButton onClick={(e) => {
          e.preventDefault()
          cartActions.handleAddToCart()
        }

        } />
      ) : (
        <RemoveFromCartButton onClick={(e) => {
          e.preventDefault()
          cartActions.handleRemoveFromCart()
        }
        }
        />
      )}
    </Skeleton>
  </div>
));

CartControls.displayName = 'CartControls'

const AddToCartButton = React.memo(
  ({
    onClick,
  }: {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <CustomButton
      className="h-9 w-10 !p-0 xs:w-full shrink-0 hover:opacity-90 
                active:scale-95 hover:scale-105 transition-all duration-200"
      color="primary"
      onClick={onClick}
    >
      <FaShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 animate-[bounce_300ms]" />
    </CustomButton>
  )
);

const RemoveFromCartButton = React.memo(
  ({
    onClick,
  }: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <CustomButton
      className="h-9 w-10 !p-0 xs:w-full shrink-0 hover:opacity-90  
                active:scale-95 hover:scale-105 transition-all duration-200"
      color="danger"
      onClick={onClick}
    >
      <FaBucket className="h-4 w-4 sm:h-5 sm:w-5 animate-[shake_400ms]" />
    </CustomButton>
  )
);

ProductCard.displayName = "ProductCard";
AddToCartButton.displayName = "AddToCartButton";
RemoveFromCartButton.displayName = "RemoveFromCartButton";

export default ProductCard;