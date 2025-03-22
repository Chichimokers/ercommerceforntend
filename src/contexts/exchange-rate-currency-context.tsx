"use client";

import { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCachedUserCurrencyAndRate } from "@/helpers/user-location";
import { CurrencyData } from "@/types/types";
import { useCurrencyStore } from "@store/currency/currency-store";

interface CurrencyContextValue {
  rateExchange: CurrencyData | null;
  selectedCurrency: string | null;
  isDataChanging: boolean;
  updateExchangeRate: (newRate: number) => void;
  handleCurrencyChange: (newCurrency: string) => void;
  fetchCurrencyData: () => Promise<void>;
}

// Default values from localStorage to prevent initial null state
const getInitialState = () => {
  if (typeof window === 'undefined') return { rateExchange: null, selectedCurrency: null };

  const savedCurrency = localStorage.getItem("selectedCurrency") || null;
  let savedRateExchange = null;

  try {
    const savedData = localStorage.getItem("exchangeRateData");
    if (savedData) {
      savedRateExchange = JSON.parse(savedData);
    }
  } catch (e) {
    console.error("Failed to parse saved exchange rate data");
  }

  return {
    rateExchange: savedRateExchange,
    selectedCurrency: savedCurrency
  };
};

const defaultContextValue: CurrencyContextValue = {
  rateExchange: null,
  selectedCurrency: null,
  isDataChanging: false,
  updateExchangeRate: () => { },
  handleCurrencyChange: () => { },
  fetchCurrencyData: async () => { }
};

export const CurrencyAndExchangeRateContext = createContext<CurrencyContextValue>(defaultContextValue);

export const useCurrency = () => {
  const context = useCurrencyStore();
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyAndExchangeRateProvider");
  }
  return context;
};

export const CurrencyAndExchangeRateProvider = ({ children }: { children: ReactNode }) => {

  const initialState = getInitialState();
  const [rateExchange, setRateExchange] = useState<CurrencyData | null>(initialState.rateExchange);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(initialState.selectedCurrency);
  const [isDataChanging, setIsDataChanging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(!!initialState.rateExchange);

  const fetchCurrencyData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsDataChanging(true);
      }

      const data = await getCachedUserCurrencyAndRate(selectedCurrency || undefined);

      if (data) {
        setRateExchange(data);
        setIsInitialized(true);

        if (!selectedCurrency) {
          setSelectedCurrency(data.currency);
          localStorage.setItem('selectedCurrency', data.currency);
        }

        localStorage.setItem('exchangeRateData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching currency data:', error);
    } finally {
      if (showLoading) {
        setIsDataChanging(false);
      }
    }
  }, [selectedCurrency]);

  const backgroundRefresh = useCallback(() => {
    fetchCurrencyData(false);
  }, [fetchCurrencyData]);

  useEffect(() => {

    if (rateExchange) {

      const timer = setTimeout(() => {
        backgroundRefresh();
      }, 2000);
      return () => clearTimeout(timer);
    }

    else {
      fetchCurrencyData();
    }
  }, [fetchCurrencyData, backgroundRefresh, rateExchange]);

  useEffect(() => {
    if (selectedCurrency && (!rateExchange || rateExchange.currency !== selectedCurrency)) {
      fetchCurrencyData();
    }
  }, [selectedCurrency, rateExchange, fetchCurrencyData]);

  const updateExchangeRate = useCallback((newRate: number) => {
    setRateExchange(prev => {
      if (!prev) return {
        currency: 'USD',
        symbol: '$',
        exchangeRate: newRate
      };

      const updated = {
        ...prev,
        exchangeRate: newRate
      };

      localStorage.setItem('exchangeRateData', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency);
  }, []);

  return (
    <CurrencyAndExchangeRateContext.Provider
      value={{
        rateExchange,
        selectedCurrency,
        isDataChanging,
        updateExchangeRate,
        handleCurrencyChange,
        fetchCurrencyData
      }}
    >
      {children}
    </CurrencyAndExchangeRateContext.Provider>
  );
};