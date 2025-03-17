import { formatCurrency } from "@/components/format-currency";

interface DiscountBadgeProps {
  discount?: { reduction: number; min: number };
  rateExchange?: { exchangeRate: number; currency: string; symbol: string } | null;
}

export default function DiscountBadge({
  discount,
  rateExchange = { exchangeRate: 1, currency: "USD", symbol: "$" }
}: DiscountBadgeProps) {
  if (!discount) return null;

  const discountAmount = discount.reduction * (rateExchange?.exchangeRate || 1);

  return (
    <div className="absolute top-2 right-2 text-xs z-10 bg-amber-500 text-white px-2 py-1 rounded-full bg-opacity-90 backdrop-blur-sm">
      -{formatCurrency(
        discountAmount,
        rateExchange?.currency,
        rateExchange?.symbol
      )} desde {discount.min} unid.
    </div>
  );
}