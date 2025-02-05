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
      localStorage.removeItem("orderCreation");
      setIsVerified(true);
      setIsProcessing(false);
    } else if (isProcessing) {

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
