"use client";

import { useContext, useEffect, useState } from "react";
import { Card, CardBody, CardFooter, Spacer, Skeleton } from "@heroui/react";
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

const ProductCard = React.memo(({ product }: { product: ProductBase }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const ctx = useContext(CurrencyAndExchangeRateContext);
  const { rateExchange } = ctx || {};
  const [error, setImageError] = useState(false);

  const {
    isInCart,
    quantity,
    handleAddToCart,
    handleRemoveFromCart,
    handleQuantityInc,
    handleQuantityDec,
    findInCartLocalStorage,
    getLocalStorageData,
  } = useCartActions(product);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card
        className="w-full max-w-[220px] bg-default-50 border border-white border-opacity-10"
        as={Link}
        href={`/products/${product.id}`}
      >
        <CardBody className="overflow-visible p-0 aspect-square">
          <Skeleton className="h-full w-full rounded-lg" />
        </CardBody>
        <CardFooter className="text-small p-2 sm:p-3">
          <div className="flex flex-col w-full gap-2">
            <div className="flex justify-between items-start gap-2">
              <Skeleton className="w-3/4 h-4 rounded-lg" />
              <Skeleton className="w-1/4 h-4 rounded-lg" />
            </div>
            <Spacer y={2} />
            <div className="flex justify-between itemssymbol-center gap-2">
              <Skeleton className="w-24 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      className="w-full max-w-[220px] bg-default-50 rounded-2xl transition-all border border-default-100 hover:border-default-300"
      shadow="none"
      as={Link}
      href={`/products/${product.id}`}
    >
      <CardBody className="overflow-hidden p-0">
        <div className="relative aspect-square w-full bg-default-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-default-200 animate-pulse" />
          )}
          <Image
            alt={product.name}
            className={`absolute inset-0 object-cover transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onError={() => setImageError(true)}
            src={error ? "/nophoto.jpeg" : product.image || "/nophoto.jpeg"}
            onLoad={() => setImageLoaded(true)}
            fill
            quality={Number(process.env.IMAGE_QUALITY)}
            loading="lazy"
            priority={false}
          />
        </div>
      </CardBody>
      <CardFooter
        className="text-small p-2 sm:p-3 max-h-[160px]
        md:min-h-[130px] xs:min-h-[120px]"
      >
        <div className="flex flex-col w-full gap-2 h-full justify-between">
          <div className="flex justify-between items-start gap-2">
            <b className="text-xs xs:text-lg md:text-base line-clamp-1 text-start">
              {product.name}
            </b>
          </div>
          <p className="text-default-500 whitespace-nowrap text-xs xs:text-sm sm:text-lg text-start">
            {rateExchange ? (
              <>
                {rateExchange.symbol}
                {(product.price * rateExchange.exchangeRate).toFixed(2)}{" "}
                {rateExchange.currency}
              </>
            ) : (
              "$" + product.price + "USD"
            )}
          </p>
          <div>
            {product.averageRating !== undefined && (
              <StarRating rating={product.averageRating} className="mb-2" />
            )}
          </div>
          <div className="flex justify-between items-center gap-2 w-full">
            <div className="flex items-center">
              <Skeleton isLoaded={!!product}>
                <QuantityAdjuster
                  quantity={quantity}
                  isInCart={isInCart}
                  handleQuantityInc={handleQuantityInc}
                  handleQuantityDec={handleQuantityDec}
                  findInCartLocalStorage={findInCartLocalStorage}
                  getLocalStorageData={getLocalStorageData}
                  productId={product.id}
                  maxLimit={product.quantity || 100}
                />
              </Skeleton>
            </div>
            <Skeleton isLoaded={!!product} className="w-full max-w-16">
              {!isInCart && !findInCartLocalStorage() ? (
                <AddToCartButton
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart();
                  }}
                />
              ) : (
                <RemoveFromCartButton
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveFromCart();
                  }}
                />
              )}
            </Skeleton>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
});

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
