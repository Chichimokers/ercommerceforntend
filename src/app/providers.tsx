'use client';

import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { CurrencyAndExchangeRateProvider } from "@contexts/exchange-rate-currency-context"
import { ModalProvider } from "@contexts/modal-context"
import { SessionProvider } from "next-auth/react"
import AuthLayout from "@components/layout/auth-layout"
import { ProductProvider } from "@contexts/product-context"
import { CartProvider } from "@contexts/cart-context"
import { ThemeProvider } from "next-themes"
import { LocationProvider } from "@contexts/location-context";
import { ShippingProvider } from "@contexts/shipping-context";
import React from "react";
import AccessTokenSynchronizer from "@services/access-token-synchronizer";

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
              <ShippingProvider>
                <ProductProvider>
                  <CartProvider>
                    <ModalProvider>
                      <HeroUIProvider>
                        <ToastProvider />
                        <AuthLayout>
                          {children}
                        </AuthLayout>
                      </HeroUIProvider>
                    </ModalProvider>
                  </CartProvider>
                </ProductProvider>
              </ShippingProvider>
            </LocationProvider>
          </CurrencyAndExchangeRateProvider>
        </AccessTokenSynchronizer >
      </SessionProvider>
    </ThemeProvider >
  )
} 