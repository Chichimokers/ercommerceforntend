"use client";

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
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <SessionProvider>
            <RefineContext>
              <CurrencyAndExchangeRateProvider>
                <ProductProvider>
                  <CartProvider>
                    <ModalProvider>
                      <ConfigProvider>
                        <HeroUIProvider>
                          <AuthLayout>
                            {children}
                          </AuthLayout>
                        </HeroUIProvider>
                      </ConfigProvider>
                    </ModalProvider>
                  </CartProvider>
                </ProductProvider>
              </CurrencyAndExchangeRateProvider>
            </RefineContext>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}