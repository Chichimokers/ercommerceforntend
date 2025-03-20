import { formatCurrency } from "@/components/format-currency";
import { Chip } from "@heroui/react";

interface DiscountBadgeProps {
  discount?: { reduction: number; min: number };
  rateExchange?: { exchangeRate: number; currency: string; symbol: string } | null;
  quantity: number;
}

export default function DiscountBadge({
  discount,
  rateExchange = { exchangeRate: 1, currency: "USD", symbol: "$" },
  quantity,
}: DiscountBadgeProps) {
  if (!discount || quantity < discount.min) return null;

  const discountAmount = discount.reduction * (rateExchange?.exchangeRate || 1);

  return (
    <Chip color="warning" className="absolute top-2 right-2">
      -{formatCurrency(
        discountAmount,
        rateExchange?.currency,
        rateExchange?.symbol
      )} desde {discount.min} unid.
    </Chip>
  );
}