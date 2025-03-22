'use client';

import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { ModalProvider } from "@contexts/modal-context"
import { SessionProvider } from "next-auth/react"
import { ProductProvider } from "@contexts/product-context"
import { CartProvider } from "@contexts/cart-context"
import { ThemeProvider } from "next-themes"
import React from "react";
import AccessTokenSynchronizer from "@services/access-token-synchronizer";
import CartSyncBackup from "@components/cart/cart-sync-backup";
import CurrencyInitializer from "@store/currency/currency-initializer";
import LocationInitializer from "@store/location/location-initializer";
import ProductManager from "@store/products/product-manager";

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
          <CurrencyInitializer />
          <LocationInitializer />
          <ProductManager />
          <ProductProvider>
            <CartProvider>
              <CartSyncBackup />
              <ModalProvider>
                <HeroUIProvider>
                  <ToastProvider />
                  {children}
                </HeroUIProvider>
              </ModalProvider>
            </CartProvider>
          </ProductProvider>
        </AccessTokenSynchronizer >
      </SessionProvider>
    </ThemeProvider >
  )
} 