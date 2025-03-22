"use client";

import { useEffect } from "react";
import { useLocationStore } from "./location-store";

export default function LocationInitializer() {
  const { location, hasLocation } = useLocationStore();

  useEffect(() => {
    if (hasLocation) {
      console.debug("Ubicación cargada:", location);
    }
  }, [location, hasLocation]);

  return null;
}