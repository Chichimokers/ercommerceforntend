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
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          startContent={<MapPin className="text-lg" />}
          size="lg"
        >
          Seleccionar ubicacion
        </Button>
      ) : (
        <Button
          as={Link}
          href="/products"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          size="lg"
        >
          Explorar Productos ({location.provinceName})
        </Button>
      )
      }

    </>
  );
}