"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Location {
  province: string;
  municipality: string;
}

interface LocationStore {
  // Estado
  location: Location;
  hasLocation: boolean;

  // Acciones
  setLocation: (location: Location) => void;
  resetLocation: () => void;
  isLocationComplete: () => boolean;
}

// Valor predeterminado para inicialización
const defaultLocation: Location = {
  province: "",
  municipality: ""
};

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      location: defaultLocation,
      hasLocation: false,

      // Acciones
      setLocation: (newLocation: Location) => {
        if (!newLocation.province || !newLocation.municipality) {
          console.warn("Intentando establecer una ubicación incompleta");
        }

        set({
          location: newLocation,
          hasLocation: Boolean(newLocation.province && newLocation.municipality)
        });
      },

      resetLocation: () => {
        set({
          location: defaultLocation,
          hasLocation: false
        });
      },

      isLocationComplete: () => {
        const { location } = get();
        return Boolean(location.province && location.municipality);
      }
    }),
    {
      // Configuración de persistencia
      name: "user-location-storage",
      // Solo persistir la ubicación
      partialize: (state) => ({ location: state.location })
    }
  )
);

// Función auxiliar para usar en componentes que requieren ubicación
export function useRequireLocation(): {
  hasLocation: boolean;
  location: Location;
  isComplete: boolean;
} {
  const { location, hasLocation, isLocationComplete } = useLocationStore();
  const isComplete = isLocationComplete();

  return {
    hasLocation,
    location,
    isComplete
  };
}

// Hook para simplificar la configuración de la ubicación
export function useSetLocation() {
  const { setLocation } = useLocationStore();

  const updateLocation = (province: string, municipality: string) => {
    setLocation({ province, municipality });
  };

  return { updateLocation };
}