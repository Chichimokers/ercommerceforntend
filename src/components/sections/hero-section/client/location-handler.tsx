"use client";

import { ReactNode, useEffect } from "react";
import { useDisclosure } from "@heroui/react";
import dynamic from "next/dynamic";

const LocationModal = dynamic(
  () => import("@/components/modals/location-modal"),
  {
    ssr: false,
    loading: () => <div className="hidden" />
  }
);

interface LocationHandlerProps {
  children: ReactNode;
}

export default function LocationHandler({ children }: LocationHandlerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    window.openLocationModal = onOpen;

    return () => {
      delete window.openLocationModal;
    };
  }, [onOpen]);

  return (
    <>
      {isOpen && (
        <LocationModal
          open={isOpen}
          onClose={onClose}
          initialProvince=""
          initialMunicipality=""
        />
      )}

      {children}
    </>
  );
}

declare global {
  interface Window {
    openLocationModal?: () => void;
  }
}