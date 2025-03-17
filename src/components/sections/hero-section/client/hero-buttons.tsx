"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiShoppingCart, FiInfo } from "react-icons/fi";
import { Button } from "@heroui/react";
import { useLocation } from "@contexts/location-context";

export default function HeroButtons() {
  const router = useRouter();
  const { location } = useLocation();

  // Manejador de eventos del botón usando la función expuesta por LocationHandler
  const handleButtonClick = (e: React.MouseEvent) => {
    if (!location || !location.province || !location.municipality) {
      e.preventDefault();
      // Usar la función expuesta por el LocationHandler
      if (window.openLocationModal) {
        window.openLocationModal();
      }
    } else {
      router.push("/products");
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium shadow-lg hover:shadow-blue-500/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
        startContent={<FiShoppingCart className="text-lg" />}
        size="lg"
      >
        Explorar Productos
      </Button>

      <Button
        as={Link}
        href="/about"
        variant="bordered"
        className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
        startContent={<FiInfo className="text-lg" />}
        size="lg"
      >
        Conocer más
      </Button>
    </>
  );
}