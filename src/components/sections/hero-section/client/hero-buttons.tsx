"use client";

import { useRouter } from "next/navigation";
import { FiShoppingCart } from "react-icons/fi";
import { Button } from "@heroui/react";
import { useLocation } from "@contexts/location-context";

export default function HeroButtons() {
  const router = useRouter();
  const { location } = useLocation();

  const handleButtonClick = (e: React.MouseEvent) => {
    if (!location || !location.province || !location.municipality) {
      e.preventDefault();
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
        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium shadow-lg hover:shadow-blue-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base transform hover:-translate-y-1 active:translate-y-0"
        startContent={<FiShoppingCart className="text-lg" />}
        size="lg"
      >
        Explorar Productos
      </Button>
    </>
  );
}