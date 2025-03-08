"use client";

import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from "react";
import { getCachedUserCurrencyAndRate } from "@/helpers/user-location";
import { CurrencyData } from "../types/types";


interface CurrencyContextValue {
  rateExchange: CurrencyData | null;
  selectedCurrency: string | null;
  isDataChanging: boolean;
  updateExchangeRate: (newRate: number) => void;
  handleCurrencyChange: (newCurrency: string) => void;
  fetchCurrencyData: () => Promise<void>;
}

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
  const context = useContext(CurrencyAndExchangeRateContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyAndExchangeRateProvider");
  }
  return context;
};

export const CurrencyAndExchangeRateProvider = ({ children }: { children: ReactNode }) => {
  const [rateExchange, setRateExchange] = useState<CurrencyData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [isDataChanging, setIsDataChanging] = useState(false);

  // Load initial values from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }

    const savedExchangeData = localStorage.getItem("exchangeRateData");
    if (savedExchangeData) {
      try {
        const parsedData = JSON.parse(savedExchangeData);
        setRateExchange(parsedData);
      } catch (error) {
        console.error("Failed to parse saved exchange rate data:", error);
      }
    }
  }, []);

  // Fetch currency data from API
  const fetchCurrencyData = useCallback(async () => {
    try {
      setIsDataChanging(true);

      const data = await getCachedUserCurrencyAndRate(selectedCurrency || undefined);

      if (data) {
        setRateExchange(data);

        if (!selectedCurrency) {
          setSelectedCurrency(data.currency);
          localStorage.setItem('selectedCurrency', data.currency);
        }

        // Save full data object to localStorage
        localStorage.setItem('exchangeRateData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching currency data:', error);
    } finally {
      setIsDataChanging(false);
    }
  }, [selectedCurrency]);

  // Initialize data if needed
  useEffect(() => {
    if (!rateExchange) {
      fetchCurrencyData();
    }
  }, [fetchCurrencyData, rateExchange]);

  // Update rate when selectedCurrency changes
  useEffect(() => {
    if (selectedCurrency && (!rateExchange || rateExchange.currency !== selectedCurrency)) {
      fetchCurrencyData();
    }
  }, [selectedCurrency, rateExchange, fetchCurrencyData]);

  // Handle rate updates
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

  // Handle currency changes
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
