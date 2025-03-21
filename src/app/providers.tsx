'use client';

import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { CurrencyAndExchangeRateProvider } from "@contexts/exchange-rate-currency-context"
import { ModalProvider } from "@contexts/modal-context"
import { SessionProvider } from "next-auth/react"
import { ProductProvider } from "@contexts/product-context"
import { CartProvider } from "@contexts/cart-context"
import { ThemeProvider } from "next-themes"
import { LocationProvider } from "@contexts/location-context";
import React from "react";
import AccessTokenSynchronizer from "@services/access-token-synchronizer";
import CartSyncBackup from "@components/cart/cart-sync-backup";
import ReactQueryProvider from "@utils/providers/react-query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
    >
      <SessionProvider>
        <AccessTokenSynchronizer>
          <CurrencyAndExchangeRateProvider>
            <LocationProvider>
              <ProductProvider>
                <CartProvider>
                  <CartSyncBackup />
                  <ModalProvider>
                    <HeroUIProvider>
                      <ToastProvider />
                      <ReactQueryProvider>
                      {children}
                      </ReactQueryProvider>
                    </HeroUIProvider>
                  </ModalProvider>
                </CartProvider>
              </ProductProvider>
            </LocationProvider>
          </CurrencyAndExchangeRateProvider>
        </AccessTokenSynchronizer >
      </SessionProvider>
    </ThemeProvider >
  )
} 