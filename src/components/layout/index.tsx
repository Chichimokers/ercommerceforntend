"use client";

import { Head } from "@app/head";
import { Header } from "@/components/header/header";
import Footer from "@/components/footer/footer";
import React from "react";
import { Navbar } from "@/components/navbar/nav";

export const Layout = ({
  children,
  isProductsPage,
}: {
  children: React.ReactNode;
  isProductsPage?: boolean;
}) => {
  return (
    <>
      <div className="relative flex flex-col">
        <Header className="fixed top-0 left-0 right-0 z-50 shadow-sm" />
        <main className="container mx-auto max-w-[1920px] flex-grow">
          {children}
        </main>
        {!isProductsPage && <Footer />}

        <div className="sticky bottom-0 left-0 w-full flex xm:hidden z-50">
          <Navbar />
        </div>
      </div>
    </>
  );
};
