import "@styles/global.css";
import { Head } from "./head";
import { Metadata } from "next";
import { Providers } from "./providers";
import { ClientLayout } from "./client-layout";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "EsAki Shop",
    template: "%s | EsAki Shop",
  },
  description: "Creado por y para los cubanos",
  metadataBase: new URL('https://esaki-jrr.com'),
  openGraph: {
    title: "EsAki Shop",
    description: "Creado por y para los cubanos",
    type: "website",
    locale: "es_ES",
    siteName: "EsAki Shop",
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export const dynamic = 'auto';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <Head />
      <body className="min-h-screen flex flex-col antialiased text-gray-800 dark:text-gray-200">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}