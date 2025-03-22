"use client";

import { useCallback } from "react";
import { useDisclosure } from "@heroui/react";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const LocationModal = dynamic(() => import("@/components/modals/location-modal"), {
  ssr: false,
  loading: () => <div className="h-60 w-full" />
});

export default function LocationButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpenLocationModal = useCallback(() => {
    onOpen();
  }, [onOpen]);

  return (
    <>
      <button
        onClick={handleOpenLocationModal}
        className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl transition-colors"
        aria-label="Seleccionar ubicación"
      >
        <MapPin size={16} className="sm:animate-bounce" />
        <span className="text-sm sm:text-base">Seleccionar ubicación</span>
      </button>

      {isOpen && (
        <LocationModal
          open={isOpen}
          onClose={onClose}
          initialProvince=""
          initialMunicipality=""
        />
      )}
    </>
  );
}