"use client";

import { Header } from "@/components/header/header";
import dynamic from "next/dynamic";
import React, { ReactNode, useState, useEffect } from "react";
import { Navbar } from "@/components/navbar/nav";
import LocationModal from "@components/modals/location-modal";

const Footer = dynamic(() => import("@components/footer/footer"));
const InfoBar = dynamic(() => import("@components/info-bar"));
import { Overlay } from "@components/overlay";


export default function EcommerceLayout({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showInfoBar, setShowInfoBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlInfoBar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 5) {
        setShowInfoBar(true);
      }
      else if (currentScrollY > lastScrollY && currentScrollY > 5) {
        setShowInfoBar(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlInfoBar);

    return () => {
      window.removeEventListener("scroll", controlInfoBar);
    };
  }, [lastScrollY]);

  useEffect(() => {
    if (!localStorage.getItem("location")) {
      setModalOpen(true);
    }
  }
    , []);

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 h-16" setModalOpen={setModalOpen} />

      <div
        className={`fixed top-16 left-0 right-0 z-30 transition-transform duration-300 ${showInfoBar ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <InfoBar />
      </div>

      <main
        className="flex-grow container mx-auto max-w-[1920px] min-h-[70vh] pt-[114px]"
      >
        {children}
        {modalOpen && <Overlay onClick={() => setModalOpen(false)} />}
        <LocationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>

      <Footer />

      <div className="sticky bottom-0 left-0 w-full xm:hidden z-50">
        <Navbar className="fixed bottom-0 left-0 right-0" />
      </div>
    </>
  );
}