"use client";

import { ThemeProvider } from "next-themes";
import { Head } from "./head";
import { Header } from "@/components/header/header";
import Footer from "@/components/footer/footer";
import React, { ReactNode } from "react";
import { Navbar } from "@/components/navbar/nav";
import { RefineContext } from "./_refine_context";
import { ProductProvider } from "@contexts/product-context";
import { ModalProvider } from "@contexts/modal-context";
import { CartProvider } from "@contexts/cart-context";
import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { CurrencyAndExchangeRateProvider } from "@contexts/exchange-rate-currency-context";
import AuthLayout from "@components/layout/auth-layout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
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
                        <HeroUIProvider>
                          {/* Header fijo con altura definida */}
                          <Header className="fixed top-0 left-0 right-0 z-50 shadow-sm h-16" />

                          {/* Contenedor principal con padding para el header */}
                          <main
                            className="flex-grow container mx-auto max-w-[1920px]"
                            style={{ paddingTop: "1rem" }} // 80px = h-16 (4rem) + 1rem
                          >
                            {children}
                          </main>

                          <Footer />

                          {/* Navbar móvil */}
                          <nav className="sticky bottom-0 left-0 w-full xm:hidden z-50">
                            <Navbar />
                          </nav>
                        </HeroUIProvider>
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
  );
}
