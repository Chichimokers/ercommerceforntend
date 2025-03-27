"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocationStore } from "@store/location/location-store";
import { MapPin } from "lucide-react";
import Link from "next/link";

export default function HeroButtons() {
  const { hasLocation, location } = useLocationStore();

  return (
    <>
      {!hasLocation ? (
        <Button
          onClick={() => window.openLocationModal && window.openLocationModal()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium shadow-lg hover:shadow-blue-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base transform hover:-translate-y-1 active:translate-y-0"
          startContent={<MapPin className="text-lg" />}
          size="lg"
        >
          Seleccionar ubicacion
        </Button>
      ) : (
        <Button
          as={Link}
          href="/products"
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium shadow-lg hover:shadow-blue-500/30 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base transform hover:-translate-y-1 active:translate-y-0"
          startContent={<ShoppingCart className="text-lg" />}
          size="lg"
        >
          Explorar Productos ({location.provinceName})
        </Button>
      )
      }

    </>
  );
}