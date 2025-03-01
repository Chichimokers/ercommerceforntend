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
  const [SelectedCurrency, setSelectedCurrency] = useState<string>();
  const [isDataChanging, setIsDataChanging] = useState(false);

  // Memoizar la persistencia en localStorage
  const persistData = useCallback(
    debounce((rate: RateExchange | null, currency: string | undefined) => {
      if (rate) localStorage.setItem("rateExchange", JSON.stringify(rate));
      if (currency) localStorage.setItem("SelectedCurrency", currency);
    }, 500),
    []
  );

  // Carga inicial desde localStorage
  useEffect(() => {
    const storedRate = localStorage.getItem("rateExchange");
    const storedCurrency = localStorage.getItem("SelectedCurrency");

    if (storedRate) setRateExchange(JSON.parse(storedRate));
    if (storedCurrency) setSelectedCurrency(storedCurrency);
  }, []);

  // Fetch optimizado con manejo de estado actual
  const fetchCurrencyData = useCallback(
    debounce(async (currency?: string) => {
      try {
        const data = await getUserCurrencyAndRate(currency || SelectedCurrency);

        if (data) {
          setRateExchange(prev =>
            prev?.exchangeRate === data.exchangeRate ? prev : data
          );
          setSelectedCurrency(data.currency);
        }
      } catch (error) {
        console.error("Error al obtener la tasa de cambio:", error);
      } finally {
        setIsDataChanging(false);
      }
    }, 500),
    [SelectedCurrency]
  );

  // Persistencia automática al cambiar datos
  useEffect(() => {
    persistData(rateExchange, SelectedCurrency);
    return () => persistData.cancel();
  }, [rateExchange, SelectedCurrency, persistData]);

  // Fetch condicional optimizado
  useEffect(() => {
    if (!SelectedCurrency && !localStorage.getItem("SelectedCurrency")) {
      fetchCurrencyData();
    }
  }, [SelectedCurrency, fetchCurrencyData]);

  // Definir funciones inline con dependencias explícitas
  const updateExchangeRate = useCallback((newRate: number) => {
    setRateExchange(prev => ({
      ...(prev || { country: '', currency: 'USD', symbol: '$' }),
      exchangeRate: newRate
    }));
    localStorage.setItem('exchangeRate', newRate.toString());
  }, [setRateExchange]);

  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  }, [setSelectedCurrency]); // Dependencia explícita

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
