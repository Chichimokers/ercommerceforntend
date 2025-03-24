"use client";

import { Header } from "@/components/header/header";
import dynamic from "next/dynamic";
import React, { ReactNode, useState, useEffect } from "react";
import { Navbar } from "@/components/navbar/nav";
import LocationModal from "@components/modals/location-modal";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useLocationStore } from "@/store/location/location-store";

const Footer = dynamic(() => import("@components/footer/footer"));
const InfoBar = dynamic(() => import("@components/info-bar"));
import { Overlay } from "@components/overlay";

export default function EcommerceLayout({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [forceLocationSelection, setForceLocationSelection] = useState(false);
  const [showInfoBar, setShowInfoBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { hasLocation } = useLocationStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const locationRequired = searchParams.get('locationRequired') === 'true';

    if (locationRequired) {
      setModalOpen(true);
      setForceLocationSelection(true);

      const newUrl = pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!hasLocation) {
      setModalOpen(true);
    }
  }, [hasLocation]);

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

  const handleCloseModal = () => {
    if (forceLocationSelection && !hasLocation) {
      return;
    }

    setModalOpen(false);

    if (forceLocationSelection && hasLocation) {
      setForceLocationSelection(false);
      router.push('/products');
    }
  };

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 h-16" setModalOpen={setModalOpen} />

      <div
        className={`fixed top-16 left-0 right-0 z-30 transition-transform duration-300 ${showInfoBar ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <React.Suspense fallback={<div className="h-12 bg-blue-100 dark:bg-gray-800 animate-pulse"></div>}>
          <InfoBar />
        </React.Suspense>
      </div>

      <main
        className="flex-grow container mx-auto max-w-full min-h-[70vh] pt-[114px]"
      >
        {children}
        {modalOpen && <Overlay onClick={forceLocationSelection ? undefined : () => setModalOpen(false)} />}
        <LocationModal
          open={modalOpen}
          onClose={handleCloseModal}
          forceSelection={forceLocationSelection}
        />
      </main>

      <Footer />

      <div className="sticky bottom-0 left-0 w-full xm:hidden mt-16 z-40">
        <Navbar className="fixed bottom-0 left-0 right-0" />
      </div>
    </>
  );
}