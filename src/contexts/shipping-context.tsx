"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

interface ShippingContextType {
  shippingPrice: number | null;
  setShippingPrice: (price: number) => void;
  totalWeight: number;
  setTotalWeight: (weight: number) => void;
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export function ShippingProvider({ children }: { children: React.ReactNode }) {

  const [shippingPrice, setShippingPriceState] = useState<number | null>(null);
  const [totalWeight, setTotalWeightState] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedPrice = localStorage.getItem('shippingPrice');
    const savedWeight = localStorage.getItem('totalWeight');

    if (savedPrice) {
      setShippingPriceState(parseFloat(savedPrice));
    }

    if (savedWeight) {
      setTotalWeightState(parseFloat(savedWeight));
    }

    setIsLoaded(true);
  }, []);

  const setShippingPrice = (price: number) => {
    setShippingPriceState(price);
    localStorage.setItem('shippingPrice', price.toString());
  };

  const setTotalWeight = (weight: number) => {
    setTotalWeightState(weight);
    localStorage.setItem('totalWeight', weight.toString());
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ShippingContext.Provider value={{
      shippingPrice,
      setShippingPrice,
      totalWeight,
      setTotalWeight
    }}>
      {children}
    </ShippingContext.Provider>
  );
}

export function useShipping() {
  const context = useContext(ShippingContext);
  if (context === undefined) {
    throw new Error("useShipping must be used within a ShippingProvider");
  }
  return context;
}