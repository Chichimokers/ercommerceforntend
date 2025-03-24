"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Location {
  province: string;
  municipality: string;
  [key: string]: any;
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
        const isComplete = Boolean(
          newLocation.province &&
          newLocation.municipality &&
          newLocation.province.trim() !== "" &&
          newLocation.municipality.trim() !== ""
        );

        //console.log("Estableciendo ubicación:", newLocation, "isComplete:", isComplete);

        set({
          location: newLocation,
          hasLocation: isComplete
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
        return Boolean(
          location.province &&
          location.municipality &&
          location.province.trim() !== "" &&
          location.municipality.trim() !== ""
        );
      }
    }),
    {
      name: "user-location-storage",
      // Configuración explícita de almacenamiento
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (e) {
            console.error("Error al leer ubicación:", e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(name, serialized);
            // También establecer como cookie para el middleware
            document.cookie = `${name}=${encodeURIComponent(serialized)}; path=/; max-age=31536000; SameSite=Lax`;
          } catch (e) {
            console.error("Error al guardar ubicación:", e);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
            // También eliminar la cookie
            document.cookie = `${name}=; path=/; max-age=0`;
          } catch (e) {
            console.error("Error al eliminar ubicación:", e);
          }
        }
      },
      // Solo persistir estas propiedades
      partialize: (state) => ({
        location: state.location,
        hasLocation: state.hasLocation
      }) as unknown as LocationStore,
      // Verificar consistencia al cargar
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Re-calcular hasLocation basado en los valores
          const isComplete = Boolean(
            state.location?.province &&
            state.location?.municipality &&
            state.location.province.trim() !== "" &&
            state.location.municipality.trim() !== ""
          );

          // Actualizar si es necesario
          if (state.hasLocation !== isComplete) {
            /*console.log("Corrigiendo hasLocation:", {
              prev: state.hasLocation,
              corrected: isComplete,
              location: state.location
            });*/
            state.hasLocation = isComplete;
          }

          /*console.log("🔄 Estado de ubicación rehidratado:",
            isComplete ? `${state.location.province}, ${state.location.municipality}` :
              "No configurada o incompleta"
          );*/
        }
      }
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

export function useSetLocation() {
  const { setLocation } = useLocationStore();

  const updateLocation = (province: string, municipality: string) => {
    setLocation({ province, municipality });
  };

  return { updateLocation };
}