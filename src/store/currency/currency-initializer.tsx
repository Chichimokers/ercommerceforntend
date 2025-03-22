"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "./currency-store";

export default function CurrencyInitializer() {
  const { rateExchange, fetchCurrencyData, backgroundRefresh } = useCurrencyStore();

  useEffect(() => {
    if (rateExchange) {
      const timer = setTimeout(() => {
        backgroundRefresh();
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      fetchCurrencyData();
    }
  }, [rateExchange, fetchCurrencyData, backgroundRefresh]);

  return null;
}