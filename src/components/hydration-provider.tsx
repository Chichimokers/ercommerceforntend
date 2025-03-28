"use client";

import { ReactNode, useEffect, useState } from "react";
import { useLocationStore } from "@/store/location/location-store";

// Exportar un contexto global para el estado de hidratación
export function HydrationProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Forzar la hidratación manual
    const hydrateStore = async () => {
      try {
        // Rehidratar el store manualmente
        await useLocationStore.persist.rehydrate();

        // Dar un pequeño tiempo para procesar
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verificar la consistencia del estado
        const state = useLocationStore.getState();
        const isComplete = Boolean(
          state.location?.province &&
          state.location?.municipality &&
          state.location.province.trim() !== "" &&
          state.location.municipality.trim() !== ""
        );

        if (state.hasLocation !== isComplete) {
          console.warn("Corrigiendo inconsistencia en estado de ubicación");
          if (isComplete) {
            state.setLocation({ ...state.location });
          } else {
            state.resetLocation();
          }
        }

        // Marcar como hidratado
        setIsHydrated(true);
        console.log("✅ Hidratación completa:", state);
      } catch (error) {
        console.error("❌ Error en la hidratación:", error);
        setIsHydrated(true); // Continuar de todos modos para no bloquear la app
      }
    };

    hydrateStore();
  }, []);

  if (!isHydrated) {
    return <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>;
  }

  return <>{children}</>;
}