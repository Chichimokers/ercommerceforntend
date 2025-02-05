"use client";

import { useContext, useEffect, useState } from "react";
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

interface MediaState {
  loaded: boolean;
  error: boolean;
}

const ProductCard = React.memo(({ product }: { product: ProductBase }) => {
  const [mediaState, setMediaState] = useState<MediaState>({ loaded: false, error: false });
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const cartActions = useCartActions(product);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <CardSkeleton />;

  return (
    <Card
      className="w-full max-w-[220px] bg-default-50 rounded-2xl transition-all border border-default-100 hover:border-default-300"
      shadow="none"
      as={Link}
      href={`/products/${product.id}`}
    >
      <CardBody className="overflow-hidden p-0">
        <div className="relative aspect-square w-full bg-default-100">
          {!mediaState.loaded && (
            <div className="absolute inset-0 bg-default-200 animate-pulse" />
          )}
          <OptimizedImage
            product={product}
            mediaState={mediaState}
            setMediaState={setMediaState}
          />
        </div>
      </CardBody>

      <CardFooter className="text-small p-2 sm:p-3 max-h-[160px] md:min-h-[130px] xs:min-h-[120px]">
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

const OptimizedImage = React.memo(({ product, mediaState, setMediaState }:
  { product: ProductBase, mediaState: MediaState, setMediaState: React.Dispatch<React.SetStateAction<MediaState>> }) => (
  <Image
    alt={product.name}
    className={`absolute inset-0 object-cover transition-all duration-300 ${mediaState.loaded ? "opacity-100" : "opacity-0"}`}
    src={mediaState.error ? "/nophoto.jpeg" : product.image || "/nophoto.jpeg"}
    onLoad={() => setMediaState(prev => ({ ...prev, loaded: true }))}
    onError={() => setMediaState(prev => ({ ...prev, error: true }))}
    fill
    quality={Number(process.env.IMAGE_QUALITY)}
    loading="lazy"
  />
));

OptimizedImage.displayName = 'OptimizedImage'

const ProductHeader = React.memo(({ name }: { name: string }) => (
  <b className="text-xs xs:text-lg md:text-base line-clamp-1 text-start">
    {name}
  </b>
));

ProductHeader.displayName = 'ProductHeader'

const PriceDisplay = React.memo(({ price, rateExchange }:
  { price: number, rateExchange?: { symbol: string; exchangeRate: number; currency: string } }) => (
  <p className="text-default-500 whitespace-nowrap text-xs xs:text-sm sm:text-lg text-start">
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
      className="h-8 w-8 !p-0 xs:w-full shrink-0"
      color="primary"
      onClick={onClick}
    >
      <FaShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
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
      className="h-8 w-8 !p-0 xs:w-full shrink-0"
      color="danger"
      onClick={onClick}
    >
      <FaBucket className="h-3 w-3 sm:h-4 sm:w-4" />
    </CustomButton>
  )
);

ProductCard.displayName = "ProductCard";
AddToCartButton.displayName = "AddToCartButton";
RemoveFromCartButton.displayName = "RemoveFromCartButton";

export default ProductCard;
