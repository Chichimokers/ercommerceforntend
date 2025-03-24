"use client";

import { Button } from "@heroui/react";
import { useLocationStore } from "@/store/location/location-store";

export function LocationReset() {
  const resetLocation = useLocationStore(state => state.resetLocation);

  const handleReset = () => {
    resetLocation();

    localStorage.removeItem("user-location-storage");

    document.cookie = "user-location-storage=; path=/; max-age=0";

    window.location.reload();
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Button
      color="danger"
      variant="flat"
      onClick={handleReset}
      className="z-50 m-4"
    >
      Reiniciar Ubicación
    </Button>
  );
}