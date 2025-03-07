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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
    >
      <SessionProvider>
        <CurrencyAndExchangeRateProvider>
          <LocationProvider>
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
          </LocationProvider>
        </CurrencyAndExchangeRateProvider>
      </SessionProvider>
    </ThemeProvider >
  )
} 