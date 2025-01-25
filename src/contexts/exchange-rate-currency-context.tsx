"use client";

import { getUserCurrencyAndRate } from "@/helpers/user-location";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import debounce from "lodash.debounce";

interface RateExchange {
  country: string;
  currency: string;
  exchangeRate: number;
  symbol: string;
}

interface caerState {
  SelectedCurrency: string | undefined;
  rateExchange: RateExchange | null;
  setSelectedCurrency: React.Dispatch<React.SetStateAction<string | undefined>>;
  isDataChanging: boolean;
  setIsDataChanging: React.Dispatch<React.SetStateAction<boolean>>;
}

const CurrencyAndExchangeRateContext = createContext<caerState | undefined>(
  undefined
);

const CurrencyAndExchangeRateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rateExchange, setRateExchange] = useState<RateExchange | null>(null);
  const [SelectedCurrency, setSelectedCurrency] = useState<string | undefined>(
    undefined
  );
  const [isDataChanging, setIsDataChanging] = useState<boolean>(false);

  const fetchCurrencyData = useCallback(
    debounce(async () => {
      try {
        const data = await getUserCurrencyAndRate(SelectedCurrency);

        if (data && data.exchangeRate !== rateExchange?.exchangeRate) {
          setRateExchange(data);
        }
        setSelectedCurrency(data?.currency);

        setIsDataChanging(false);
      } catch (error) {
        console.error("Error al obtener la tasa de cambio:", error);
        setIsDataChanging(false);
      }
    }, 500),
    [SelectedCurrency, rateExchange]
  );

  useEffect(() => {
    const saveToLocalStorage = debounce(() => {
      if (rateExchange) {
        localStorage.setItem("rateExchange", JSON.stringify(rateExchange));
      }

      if (SelectedCurrency) {
        localStorage.setItem("SelectedCurrency", SelectedCurrency);
      }
    }, 500);

    saveToLocalStorage();

    return () => saveToLocalStorage.cancel();
  }, [rateExchange, SelectedCurrency]);

  useEffect(() => {
    const storedRateExchange = localStorage.getItem("rateExchange");
    const storedSelectedCurrency = localStorage.getItem("SelectedCurrency");

    if (storedRateExchange) {
      setRateExchange(JSON.parse(storedRateExchange));
    }
    if (storedSelectedCurrency) {
      setSelectedCurrency(storedSelectedCurrency);
    }
  }, []);

  useEffect(() => {
    const isLocalRateExchange = localStorage.getItem("rateExchange") !== null;
    const isLocalSelectedCurrency =
      localStorage.getItem("SelectedCurrency") !== null;

    if (
      (!SelectedCurrency &&
        !(isLocalRateExchange && isLocalSelectedCurrency)) ||
      isDataChanging
    ) {
      fetchCurrencyData();
    }
  }, [SelectedCurrency, fetchCurrencyData]);

  return (
    <CurrencyAndExchangeRateContext.Provider
      value={{
        rateExchange,
        SelectedCurrency,
        setSelectedCurrency,
        isDataChanging,
        setIsDataChanging,
      }}
    >
      {children}
    </CurrencyAndExchangeRateContext.Provider>
  );
};

export { CurrencyAndExchangeRateContext, CurrencyAndExchangeRateProvider };
