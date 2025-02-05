"use client";

import { Header } from "@/components/header/header";
import Footer from "@/components/footer/footer";
import React, { ReactNode } from "react";
import { Navbar } from "@/components/navbar/nav";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      < Header className="fixed top-0 left-0 right-0 z-50 shadow-sm h-16 border-b border-default-50" />

      < main
        className="flex-grow container mx-auto max-w-[1920px] min-h-[70vh]"
        style={{ paddingTop: "4rem" }
        }
      >
        {children}
      </main >

      <Footer />

      <nav className="sticky bottom-0 left-0 w-full xm:hidden z-50">
        <Navbar />
      </nav>
    </>
  );
}
