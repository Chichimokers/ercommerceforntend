"use client";

import { HeroUIProvider } from "@heroui/react"
import { CurrencyAndExchangeRateProvider } from "@contexts/exchange-rate-currency-context"
import { ModalProvider } from "@contexts/modal-context"
import "@styles/global.css";
import { Head } from "./head";
import { SessionProvider, signOut } from "next-auth/react"
import AuthLayout from "@components/layout/auth-layout"
import { ProductProvider } from "@contexts/product-context"
import { CartProvider } from "@contexts/cart-context"
import { ThemeProvider } from "next-themes"
import { useEffect } from "react"
//import { startTokenAutoRefresh } from "@/lib/auth/autoRefresh"
import { getSession } from "next-auth/react"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  /*useEffect(() => {
    const cleanup = startTokenAutoRefresh()
    return () => cleanup()
  }, [])*/

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.error || session?.expired) {
        await signOut({ redirect: false });
        window.location.href = '/?modal=login';
      }
    };

    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

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
            <CurrencyAndExchangeRateProvider>
              <ProductProvider>
                <CartProvider>
                  <ModalProvider>
                    <HeroUIProvider>
                      <AuthLayout>
                        {children}
                      </AuthLayout>
                    </HeroUIProvider>
                  </ModalProvider>
                </CartProvider>
              </ProductProvider>
            </CurrencyAndExchangeRateProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}