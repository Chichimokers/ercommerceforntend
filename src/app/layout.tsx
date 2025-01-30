"use client";

import { theme } from "antd"
import { HeroUIProvider } from "@heroui/react"
import { CurrencyAndExchangeRateProvider } from "@contexts/exchange-rate-currency-context"
import { ModalProvider } from "@contexts/modal-context"
import { ConfigProvider } from "antd";
import { Head } from "./head";
import { RefineContext } from "./_refine_context"
import { SessionProvider } from "next-auth/react"
import AuthLayout from "@components/layout/auth-layout"
import { ProductProvider } from "@contexts/product-context"
import { CartProvider } from "@contexts/cart-context"
import { ThemeProvider } from "next-themes"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <Head />
      <body className="min-h-screen flex flex-col">
        <RefineContext>
          <SessionProvider>
            <CurrencyAndExchangeRateProvider>
              <ModalProvider>
                <ProductProvider>
                  <CartProvider>
                    <AuthLayout>
                      <ThemeProvider
                        disableTransitionOnChange
                        enableSystem
                        attribute="class"
                        defaultTheme="system"
                      >
                        <ConfigProvider
                          theme={{
                            algorithm: theme.defaultAlgorithm,
                          }}
                        >
                          <HeroUIProvider>
                            {/* Elementos globales como analytics, theme providers */}
                            {children}
                          </HeroUIProvider>
                        </ConfigProvider>
                      </ThemeProvider>
                    </AuthLayout>
                  </CartProvider>
                </ProductProvider>
              </ModalProvider>
            </CurrencyAndExchangeRateProvider>
          </SessionProvider>
        </RefineContext>
      </body>
    </html>
  )
}