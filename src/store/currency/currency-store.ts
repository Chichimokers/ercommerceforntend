"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCachedUserCurrencyAndRate } from "@/helpers/user-location";
import { CurrencyData } from "@/types/types";
import React from "react";

interface CurrencyStore {
  // Estado
  rateExchange: CurrencyData | null;
  selectedCurrency: string | null;
  isDataChanging: boolean;
  isInitialized: boolean;

  // Acciones
  updateExchangeRate: (newRate: number) => void;
  handleCurrencyChange: (newCurrency: string) => void;
  fetchCurrencyData: (showLoading?: boolean) => Promise<void>;
  backgroundRefresh: () => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      rateExchange: null,
      selectedCurrency: null,
      isDataChanging: false,
      isInitialized: false,

      // Acciones
      updateExchangeRate: (newRate: number) => {
        set((state) => {
          if (!state.rateExchange) {
            return {
              rateExchange: {
                currency: 'USD',
                symbol: '$',
                exchangeRate: newRate
              }
            };
          }

          return {
            rateExchange: {
              ...state.rateExchange,
              exchangeRate: newRate
            }
          };
        });
      },

      handleCurrencyChange: (newCurrency: string) => {
        set({ selectedCurrency: newCurrency });

        // Obtener nuevos datos de tasa de cambio cuando cambia la moneda
        const { fetchCurrencyData } = get();
        fetchCurrencyData();
      },

      fetchCurrencyData: async (showLoading = true) => {
        const state = get();

        try {
          if (showLoading) {
            set({ isDataChanging: true });
          }

          const data = await getCachedUserCurrencyAndRate(state.selectedCurrency || undefined);

          if (data) {
            set({
              rateExchange: data,
              isInitialized: true,
              ...(state.selectedCurrency ? {} : { selectedCurrency: data.currency })
            });
          }
        } catch (error) {
          console.error('Error fetching currency data:', error);
        } finally {
          if (showLoading) {
            set({ isDataChanging: false });
          }
        }
      },

      backgroundRefresh: () => {
        const { fetchCurrencyData } = get();
        fetchCurrencyData(false);
      }
    }),
    {
      // Configuración de persistencia en localStorage
      name: "currency-storage",
      // Solo persistir estas propiedades
      partialize: (state) => ({
        rateExchange: state.rateExchange,
        selectedCurrency: state.selectedCurrency
      })
    }
  )
);

// Hook de inicialización para usar en el componente raíz
export function useCurrencyInitializer() {
  const { rateExchange, backgroundRefresh, fetchCurrencyData } = useCurrencyStore();

  React.useEffect(() => {
    if (rateExchange) {
      // Actualizar en segundo plano después de un tiempo
      const timer = setTimeout(() => {
        backgroundRefresh();
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Cargar datos iniciales
      fetchCurrencyData();
    }
  }, [rateExchange, backgroundRefresh, fetchCurrencyData]);

  return null;
}