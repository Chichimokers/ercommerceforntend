import { CurrencyData } from "../types/types";
import clsx from "clsx";

const Price = ({
  amount,
  className,
  quantity,
  discount,
  rateExchange = {
    country: "United States",
    currency: "USD",
    symbol: "$",
    exchangeRate: 1,
  },
  currencyCodeClassName,
}: {
  amount: string;
  className?: string;
  quantity: number;
  discount?: { min: number; reduction: number; };
  rateExchange?: CurrencyData;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => (
  <p className={clsx("flex items-center", className)}>
    {`${discount && quantity >= discount.min ? new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: rateExchange.currency,
    }).format(parseFloat(amount) - (discount.reduction * rateExchange.exchangeRate))
      :
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: rateExchange.currency,
      }).format(parseFloat
        (amount))
      }`}
  </p>


);

export default Price;