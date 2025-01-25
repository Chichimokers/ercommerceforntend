"use client";

import { Head } from "@app/head";
import { Header } from "@/components/header/header";
import React from "react";
import { Navbar } from "@/components/navbar/nav";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Head />
      <div className="relative flex flex-col">
        <Header className="fixed top-0 left-0 right-0 z-50 shadow-sm" />
        <main className="container mx-auto max-w-[1920px] flex-grow">
          {children}
        </main>

        <div className="sticky bottom-0 left-0 w-full flex xm:hidden z-50">
          <Navbar />
        </div>
      </div>
    </>
  );
}
