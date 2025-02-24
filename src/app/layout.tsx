import "@styles/global.css";
import { Head } from "./head";
import { Metadata } from "next";
import { Providers } from "./providers";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  title: "EsAki Shop",
  description: "Creado por y para los cubanos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <Head />
      <body className="min-h-screen flex flex-col">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}