'use client';

import { HeroUIProvider, ToastProvider } from "@heroui/react"
import { SessionProvider } from "next-auth/react"
import { ProductProvider } from "@contexts/product-context"
import { CartProvider } from "@providers/cart-provider";
import { ThemeProvider } from "next-themes"
import React, { useEffect } from "react";
import AccessTokenSynchronizer from "@services/access-token-synchronizer";
import { CartSyncBackup } from "@components/cart/cart-sync-backup";
import CurrencyInitializer from "@store/currency/currency-initializer";
import LocationInitializer from "@store/location/location-initializer";
import ProductManager from "@store/products/product-manager";
import CartDebugger from "@store/cart/cart-debugger";
import { useLocationStore } from "@store/location/location-store";
import { HydrationProvider } from "@components/hydration-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useLocationStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
    >
      <SessionProvider>
        <HydrationProvider>
          <AccessTokenSynchronizer>
            <CurrencyInitializer />
            <LocationInitializer />
            <ProductManager />
            <CartDebugger />
            <ProductProvider>
              <CartProvider>
                <CartSyncBackup />
                <HeroUIProvider>
                  <ToastProvider />
                  {children}
                </HeroUIProvider>
              </CartProvider>
            </ProductProvider>
          </AccessTokenSynchronizer >
        </HydrationProvider>
      </SessionProvider>
    </ThemeProvider >
  )
} 