"use client";

import { Header } from "@/components/header/header";
import dynamic from "next/dynamic";
import React, { ReactNode } from "react";
import { Navbar } from "@/components/navbar/nav";

const Footer = dynamic(() => import("@components/footer/footer"));

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>

      <Header className="fixed top-0 left-0 right-0 h-16" />

      <main
        className="flex-grow container mx-auto max-w-[1920px] min-h-[70vh]"
      >
        {children}
      </main>

      <Footer />

      <nav className="sticky bottom-0 left-0 w-full xm:hidden z-50">
        <Navbar />
      </nav>
    </>
  );
}
