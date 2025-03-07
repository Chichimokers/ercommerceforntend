"use client";

import { Header } from "@/components/header/header";
import dynamic from "next/dynamic";
import React, { ReactNode, useState } from "react";
import { Navbar } from "@/components/navbar/nav";
import LocationModal from "@components/modals/location-modal";

const Footer = dynamic(() => import("@components/footer/footer"));
import { Overlay } from "@components/overlay";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>

      <Header className="fixed top-0 left-0 right-0 h-16" setModalOpen={setModalOpen} />

      <main
        className="flex-grow container mx-auto max-w-[1920px] min-h-[70vh]"
      >
        {children}
        {modalOpen && <Overlay onClick={() => setModalOpen(false)} />}
        <LocationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>

      <Footer />

      <nav className="sticky bottom-0 left-0 w-full xm:hidden z-50">
        <Navbar />
      </nav>
    </>
  );
}
