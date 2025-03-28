"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Función auxiliar para detectar el entorno
const isBrowser = typeof window !== 'undefined';

// Métodos seguros para interactuar con localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error al leer localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (error) {
      console.error('Error al escribir localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
      document.cookie = `${key}=; path=/; max-age=0`;
    } catch (error) {
      console.error('Error al eliminar de localStorage:', error);
    }
  }
};

interface Location {
  province: string;
  municipality: string;
  provinceName?: string;
  municipalityName?: string;
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
        // Validaciones adicionales para evitar datos incompletos
        if (!newLocation) {
          console.warn("Intentando establecer ubicación con datos nulos");
          return;
        }

        const isComplete = Boolean(
          newLocation.province &&
          newLocation.municipality &&
          newLocation.province.trim() !== "" &&
          newLocation.municipality.trim() !== ""
        );

        console.log("Estableciendo ubicación:", {
          province: newLocation.province,
          municipality: newLocation.municipality,
          isComplete
        });

        // Si no está completo y es una actualización (no un reseteo)
        if (!isComplete && (newLocation.province || newLocation.municipality)) {
          console.warn("Intentando establecer ubicación incompleta");
        }

        // Actualizar el estado y forzar escritura en localStorage y cookie
        set({
          location: newLocation,
          hasLocation: isComplete
        });

        // Verificación extra
        if (isBrowser) {
          setTimeout(() => {
            try {
              const stored = localStorage.getItem("user-location-storage");
              if (stored) {
                const parsedStored = JSON.parse(stored);
                console.log("Verificación post-escritura:", parsedStored.state.hasLocation);
              }
            } catch { }
          }, 50);
        }
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
          const value = safeLocalStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          const serialized = JSON.stringify(value);
          safeLocalStorage.setItem(name, serialized);
        },
        removeItem: (name) => {
          safeLocalStorage.removeItem(name);
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

  const updateLocation = (province: string, municipality: string, provinceName?: string, municipalityName?: string) => {
    const newLocation = { province, municipality, provinceName, municipalityName };
    setLocation(newLocation);
  };

  return { updateLocation };
}