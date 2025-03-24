"use client";

import { useEffect } from "react";
import { useLocationStore } from "./location-store";
import { usePathname, useRouter } from "next/navigation";
import { addToast } from "@heroui/react";

export default function LocationInitializer() {
  const { location, hasLocation } = useLocationStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hasLocation && pathname !== "/" && !pathname.startsWith("/login")) {
      if (!pathname.startsWith("/products")) {
        addToast({
          title: "Ubicación no configurada",
          description: "Para ver productos disponibles en tu área, configura tu ubicación",
          color: "warning",
        });
      }
    }

    if (hasLocation) {
      console.debug("Ubicación cargada:", location);
    }
  }, [location, hasLocation, pathname, router]);

  return null;
}