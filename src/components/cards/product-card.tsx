"use client"

import React, { useContext, useMemo, useCallback, useState, useEffect } from "react"
import { Card, CardBody, CardFooter, Chip } from "@heroui/react"
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

// Constantes para configuración y optimización
const PLACEHOLDER = "/placeholder.webp";
const ASPECT_RATIO = "aspect-square";
const DEFAULT_CURRENCY = "USD";

// Hook optimizado para detección de dispositivos - usado solo una vez por componente
const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isLowPerformance: false,
    prefersReducedMotion: false,
    effectiveType: '4g',
    isDataSaver: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Hacer una sola lectura de todas las propiedades del dispositivo
    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let connectionInfo = {
      saveData: false,
      effectiveType: '4g'
    };

    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        connectionInfo = {
          saveData: conn.saveData === true,
          effectiveType: conn.effectiveType || '4g'
        };
      }
    }

    // Detectar dispositivos de bajo rendimiento - criterio simplificado
    const isLowEnd =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
      connectionInfo.effectiveType === 'slow-2g' ||
      connectionInfo.saveData === true ||
      mobileCheck;

    setDeviceInfo({
      isMobile: mobileCheck,
      isLowPerformance: isLowEnd,
      prefersReducedMotion: motionQuery.matches,
      effectiveType: connectionInfo.effectiveType,
      isDataSaver: connectionInfo.saveData
    });

    // Solo para cambios en preferencias de movimiento - no afecta al rendimiento inicial
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setDeviceInfo(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return deviceInfo;
};

// Componentes pequeños con correcta memoización
const StockBadge = React.memo(function StockBadge({ quantity }: { quantity: number }) {
  // Si no hay stock - chip rojo
  if (quantity === 0) {
    return (
      <Chip
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80"
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
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80"
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
        className="absolute bottom-2 left-2 text-xs z-10 bg-opacity-80"
        color="warning"
        size="sm"
        variant="solid"
      >
        {quantity} unid.
      </Chip>
    );
  }

  return null;
});

const DiscountBadge = React.memo(function DiscountBadge({
  discount,
  quantity,
  rateExchange
}: {
  discount?: { reduction: number, min: number },
  quantity: number,
  rateExchange?: { exchangeRate: number, currency: string, symbol: string } | null
}) {
  if (!discount || quantity < discount.min) return null;

  return (
    <Chip
      className="absolute top-2 right-2 text-xs z-10 bg-opacity-80"
      color="warning"
      size="sm"
      variant="solid"
    >
      -{formatCurrency(
        (discount.reduction * (rateExchange?.exchangeRate || 1)),
        rateExchange?.currency,
        rateExchange?.symbol
      )} desde {discount.min}u
    </Chip>
  );
});

// Correcta aplicación de React.memo para el componente de imagen
const ProductImage = React.memo(function ProductImage({
  src,
  alt,
  lazyLoad,
  imgClassName,
  deviceInfo
}: {
  src: string,
  alt: string,
  lazyLoad: boolean,
  imgClassName?: string,
  deviceInfo: {
    isMobile: boolean,
    isLowPerformance: boolean
  }
}) {
  // Props para la carga de imagen optimizados según dispositivo
  const imageLoadingProps = lazyLoad
    ? { loading: "lazy" as const }
    : { loading: "eager" as const, priority: true };

  // Simplificar clase para móvil - evitar transiciones costosas
  const imgClass = deviceInfo.isMobile || deviceInfo.isLowPerformance
    ? `object-cover ${imgClassName || ''}`
    : `object-cover transition-transform duration-300 group-hover:scale-[1.03] ${imgClassName || ''}`;

  // Calidad y tamaños optimizados según dispositivo
  const qualityValue = deviceInfo.isLowPerformance ? 30 : (deviceInfo.isMobile ? 40 : 80);
  const simpleSizes = deviceInfo.isLowPerformance
    ? "50vw"
    : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw";

  return (
    <div className={`relative w-full ${ASPECT_RATIO} bg-gray-100 dark:bg-gray-700 overflow-hidden`}>
      <Image
        src={src || PLACEHOLDER}
        alt={alt}
        fill
        sizes={simpleSizes}
        className={imgClass}
        quality={qualityValue}
        {...imageLoadingProps}
        placeholder="empty"
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER;
        }}
      />
    </div>
  );
});

// Imagen ultra ligera para dispositivos lentos
const UltraLightProductImage = React.memo(function UltraLightProductImage({
  src,
  alt,
  imgClassName
}: {
  src: string,
  alt: string,
  imgClassName?: string
}) {
  return (
    <div className={`relative w-full ${ASPECT_RATIO} bg-gray-100 dark:bg-gray-700 overflow-hidden`}>
      <img
        src={src || PLACEHOLDER}
        alt={alt}
        className={`object-cover w-full h-full ${imgClassName || ''}`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER;
        }}
      />
    </div>
  );
});

// Función para renderizar precios - memoizada
const PriceDisplay = React.memo(function PriceDisplay({
  displayPrice,
  discountedPrice,
  percentOff,
  currency
}: {
  displayPrice: number,
  discountedPrice: number | null,
  percentOff: number,
  currency: string
}) {
  // Formatear precios una sola vez
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(discountedPrice || displayPrice);

  const formattedOriginal = discountedPrice ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || DEFAULT_CURRENCY
  }).format(displayPrice) : null;

  return (
    <div className="flex flex-col min-h-[40px]">
      <p className="font-bold text-sm sm:text-base">
        {formattedPrice}
      </p>

      {discountedPrice && formattedOriginal && (
        <span className="text-xs flex flex-wrap items-center">
          <span className="text-gray-400 line-through mr-1">{formattedOriginal}</span>
          <span className="text-green-600 dark:text-green-500">(-{percentOff}%)</span>
        </span>
      )}
    </div>
  );
});

// Botones optimizados
export const AddToCartButton = React.memo(function AddToCartButton({
  onClick,
  disabled = false,
  isMobile = false
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  isMobile?: boolean
}) {
  // Classes optimized based on device
  const buttonClass = `
    h-9 !min-w-10 !max-w-full !w-full !p-0
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${isMobile ? 'transition-opacity' : 'hover:shadow active:scale-95 transition-transform'}
    rounded-xl touch-action-pan-y
  `;

  return (
    <div>
      <CustomButton
        className={buttonClass}
        onClick={onClick}
        isDisabled={disabled}
        aria-label="Añadir al carrito"
      >
        <FaShoppingCart className="h-4 w-4" />
      </CustomButton>
    </div>
  );
});

export const RemoveFromCartButton = React.memo(function RemoveFromCartButton({
  onClick,
  isMobile = false
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  isMobile?: boolean
}) {
  // Classes optimized based on device
  const buttonClass = `
    h-9 !min-w-10 !max-w-full !w-full !p-0
    ${isMobile ? 'bg-red-500' : 'bg-red-500 hover:bg-red-600 hover:shadow active:scale-95 transition-transform'}
    rounded-xl touch-action-pan-y
  `;

  return (
    <div>
      <CustomButton
        className={buttonClass}
        color="danger"
        onClick={onClick}
        aria-label="Eliminar del carrito"
      >
        <FaBucket className="h-4 w-4" />
      </CustomButton>
    </div>
  );
});

// Componente principal optimizado - versión ligera
const LightProductCard = React.memo(function LightProductCard({
  product,
  prefetch,
  onNavigate,
  rateExchange,
  formattedPrice,
  isInCart,
  handleAddToCart,
  handleRemoveFromCart,
  handleButtonClick
}: {
  product: ProductBase;
  prefetch: "hover" | "viewport" | "none";
  onNavigate: () => void;
  rateExchange: any;
  formattedPrice: string;
  isInCart: boolean;
  handleAddToCart: () => void;
  handleRemoveFromCart: () => void;
  handleButtonClick: (e: React.MouseEvent, callback: () => void) => void;
}) {
  const productUrl = `/products/${product.id}`;

  return (
    <Link
      href={productUrl}
      prefetch={prefetch === "none" ? false : undefined}
      className="block"
      onClick={onNavigate}
    >
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-2 h-full">
        <UltraLightProductImage src={product.image || PLACEHOLDER} alt={product.name} />

        <div className="p-2">
          <h3 className="text-sm font-medium truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
            {product.short_description?.slice(0, 60) || "Sin descripción"}
          </p>
          <div className="font-bold text-sm mt-1">{formattedPrice}</div>
        </div>

        <div className="pt-1">
          <button
            onClick={(e) => handleButtonClick(e, isInCart ? handleRemoveFromCart : handleAddToCart)}
            className={`w-full text-xs py-2 px-2 rounded ${isInCart ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
            disabled={product.quantity === 0}
          >
            {product.quantity === 0 ? 'Sin stock' : (isInCart ? 'Quitar' : 'Añadir')}
          </button>
        </div>
      </div>
    </Link>
  );
});

// Componente principal
const ProductCard = React.memo(function ProductCard({
  product,
  prefetch = "none",
  className = "",
  imgClassName = "",
  lazyLoad = true,
  onNavigate = () => { }
}: {
  product: ProductBase,
  prefetch?: "hover" | "viewport" | "none",
  className?: string,
  imgClassName?: string,
  lazyLoad?: boolean,
  onNavigate?: () => void
}) {
  // Contexto y hooks - usar una sola vez
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

  // Detección de dispositivo - una sola vez
  const deviceInfo = useDeviceDetection();
  const { isMobile, isLowPerformance, prefersReducedMotion, effectiveType } = deviceInfo;

  // Pre-calcular todos los valores necesarios de una vez
  const priceInfo = useMemo(() => {
    const basePrice = product.price * (rateExchange?.exchangeRate || 1);
    let discountAmount = 0;

    // Comprobar descuento
    const hasDiscount = product.discount && quantity >= product.discount.min;
    if (hasDiscount) {
      discountAmount = (product?.discount?.reduction || 0) * (rateExchange?.exchangeRate || 1);
    }

    const discountedPrice = hasDiscount ? basePrice - discountAmount : null;
    const percentOff = hasDiscount ?
      Math.round((discountAmount * 100) / basePrice) : 0;

    // Formatear precio para versión ultra ligera
    const formattedString = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: rateExchange?.currency || DEFAULT_CURRENCY,
    }).format(discountedPrice || basePrice);

    return {
      basePrice,
      discountedPrice,
      percentOff,
      formattedString,
      hasDiscount
    };
  }, [product.price, product.discount, rateExchange, quantity]);

  // URL del producto
  const productUrl = `/products/${product.id}`;

  // Detener propagación solo cuando sea necesario (una sola función)
  const handleButtonClick = useCallback((e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  }, []);

  // Para dispositivos lentos, usar versión ultra ligera
  const isUltraLightVersion = isLowPerformance &&
    (effectiveType === 'slow-2g' || effectiveType === '2g');

  if (isUltraLightVersion) {
    return (
      <LightProductCard
        product={product}
        prefetch={prefetch}
        onNavigate={onNavigate}
        rateExchange={rateExchange}
        formattedPrice={priceInfo.formattedString}
        isInCart={isInCart}
        handleAddToCart={handleAddToCart}
        handleRemoveFromCart={handleRemoveFromCart}
        handleButtonClick={handleButtonClick}
      />
    );
  }

  // Clases base sin transiciones costosas para móvil
  const cardBaseClasses = isMobile || isLowPerformance
    ? `h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`
    : `h-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group hover:shadow-md ${className}`;

  return (
    <Link
      href={productUrl}
      prefetch={prefetch === "none" ? false : undefined}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      onClick={onNavigate}
      style={{ touchAction: 'manipulation' }}
    >
      <Card
        className={cardBaseClasses}
        disableAnimation={isMobile || isLowPerformance || prefersReducedMotion}
      >
        <CardBody className="p-0 overflow-hidden">
          <div className="relative">
            <ProductImage
              src={product.image || PLACEHOLDER}
              alt={product.name}
              lazyLoad={lazyLoad}
              imgClassName={imgClassName}
              deviceInfo={deviceInfo}
            />

            {/* Badges - solo si no es dispositivo de bajo rendimiento */}
            {!isLowPerformance && (
              <>
                <StockBadge quantity={product.quantity || 0} />
                {priceInfo.hasDiscount && (
                  <DiscountBadge
                    discount={product.discount}
                    quantity={quantity}
                    rateExchange={rateExchange}
                  />
                )}
              </>
            )}
          </div>

          <div className="px-2 pt-2 sm:px-3 sm:pt-3">
            {/* Título del producto */}
            <h3 className="text-sm font-medium line-clamp-1 mb-1">
              {product.name}
            </h3>

            {/* Reducir componentes para móviles */}
            {!isMobile && !isLowPerformance && (
              <div className="mb-2">
                <StarRating value={product.averageRating} />
              </div>
            )}

            <div className={`${isMobile ? 'h-8' : 'h-10'} mb-2`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {product.short_description || "Sin descripción"}
              </p>
            </div>

            <PriceDisplay
              displayPrice={priceInfo.basePrice}
              discountedPrice={priceInfo.discountedPrice}
              percentOff={priceInfo.percentOff}
              currency={rateExchange?.currency || DEFAULT_CURRENCY}
            />
          </div>
        </CardBody>

        <CardFooter className="flex justify-between items-center gap-2 p-2 sm:p-3 pt-0">
          {/* Control de cantidad simplificado para móviles */}
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
              className="bg-white dark:bg-gray-700"
            />
          </div>

          {/* Botón de carrito */}
          <div className="flex-grow">
            {isInCart ? (
              <RemoveFromCartButton
                onClick={(e) => handleButtonClick(e, handleRemoveFromCart)}
                isMobile={isMobile}
              />
            ) : (
              <AddToCartButton
                onClick={(e) => handleButtonClick(e, handleAddToCart)}
                disabled={product.quantity === 0}
                isMobile={isMobile}
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
});

export default ProductCard;
