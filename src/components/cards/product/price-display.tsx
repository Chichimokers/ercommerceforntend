const DEFAULT_CURRENCY = "USD";

interface PriceDisplayProps {
  price: number;
  discount?: {
    min?: number;
    amount: number;
    percentage: number;
  };
  currency?: string;
  quantity: number;
}

export default function PriceDisplay({
  price,
  discount,
  currency = DEFAULT_CURRENCY,
  quantity,
}: PriceDisplayProps) {
  // Calcular precio con descuento si aplica
  const finalPrice = discount ? price - discount.amount : price;

  return (
    <div className="flex flex-col min-h-[45px]">
      <p className="font-bold text-sm sm:text-base">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency || DEFAULT_CURRENCY,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(finalPrice)}
      </p>

      {discount && discount.min && quantity >= discount.min && (
        <span className="text-xs flex flex-wrap items-center mt-0.5">
          <span className="text-gray-400 line-through mr-1">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currency || DEFAULT_CURRENCY,
            }).format(price)}
          </span>
          <span className="text-green-600 dark:text-green-500">
            (-{discount.percentage}%)
          </span>
        </span>
      )}
    </div>
  );
}