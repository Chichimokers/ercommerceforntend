import { ProductBase } from "@/types/types";
import Link from "next/link";
import ProductImage from "./product-image";
import StockBadge from "./badges/stock-badge";
import DiscountBadge from "./badges/discount-badge";
import PriceDisplay from "./price-display";
//import StarRating from "@/components/star-rating";
import ProductInteraction from "./client/product-interaction";
import useCartActions from "@components/actions";
import { useCurrencyStore } from "@store/currency/currency-store";

const PLACEHOLDER = "/placeholder.webp";

export interface ProductCardProps {
  product: ProductBase;
  prefetch?: "hover" | "viewport" | "none";
  className?: string;
  imgClassName?: string;
  lazyLoad?: boolean;
}

export default function ProductCard({
  product,
  prefetch = "none",
  className = "",
  imgClassName = "",
  lazyLoad = true,
}: ProductCardProps) {
  const productUrl = `/products/${product.id}`;
  const { rateExchange } = useCurrencyStore();
  const { quantity } = useCartActions(product);

  const cardBaseClasses = `
    h-full rounded-3xl overflow-hidden
    bg-white dark:bg-gray-800/80 
    border border-gray-200 dark:border-gray-700
    transition-all duration-300 hover:border-default-400 
    dark:hover:border-default-400
    ${className}
  `;

  const hasDiscount = !!product.discount;
  const basePrice = product.price * (rateExchange?.exchangeRate || 1);
  const discountAmount = (product.discount?.reduction || 0) * (rateExchange?.exchangeRate || 1);

  return (
    <Link
      href={productUrl}
      className="group relative block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ touchAction: "pan-y pan-x" }}
    >
      <div className={cardBaseClasses}>
        <div className="p-0 overflow-hidden">
          <div className="relative">
            <ProductImage
              src={product.image || PLACEHOLDER}
              alt={product.name}
              lazyLoad={lazyLoad}
              className={imgClassName}
            />

            <StockBadge quantity={product.quantity || 0} />
            {hasDiscount && (
              <DiscountBadge
                discount={product.discount}
                rateExchange={rateExchange}
                quantity={product.quantity}
              />
            )}
          </div>

          <div className="px-2 pt-2 sm:px-3 sm:pt-3 md:px-4 md:pt-4">
            <h3 className="text-sm sm:text-base font-medium line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>

            {/*<div className="mb-2">
              <StarRating value={product.averageRating} />
            </div>*/}

            <div className="h-10 mb-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {product.short_description || "Sin descripción disponible"}
              </p>
            </div>

            <div className="min-h-[45px]">
              <PriceDisplay
                price={basePrice}
                discount={hasDiscount ? {
                  min: product.discount?.min,
                  amount: discountAmount,
                  percentage: Math.round((discountAmount * 100) / (product.price * (rateExchange?.exchangeRate || 1))),
                } : undefined}
                currency={rateExchange?.currency || "USD"}
                quantity={quantity}
              />
            </div>
          </div>
        </div>

        <ProductInteraction
          product={product}
          prefetch={prefetch}
        />
      </div>
    </Link>
  );
}