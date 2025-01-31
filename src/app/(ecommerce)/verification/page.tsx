"use client";

import VerificationCard from "@/components/cards/verification-card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerificationPage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const orderCreation = localStorage.getItem("orderCreation");

    if (orderCreation) {
      // Procesar y eliminar la clave
      localStorage.removeItem("orderCreation");
      setIsVerified(true);
      setIsProcessing(false); // Indica que se ha terminado de procesar
    } else if (isProcessing) {
      // Redirigir solo si aún no hemos procesado la verificación
      router.replace("/shopping-cart");
    }
  }, [router, isProcessing]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-xl">Cargando...</p>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return (
    <section className="p-4 flex flex-col items-center justify-center h-full">
      <VerificationCard />
    </section>
  );
}
