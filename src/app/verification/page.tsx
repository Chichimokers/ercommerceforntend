"use client";

import VerificationCard from "@/components/cards/verification-card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerificationPage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Simulación de verificación de código (reemplazar con API real)
    setTimeout(() => {
      if (code.join("") === "123456") { // Código de ejemplo
        setIsVerified(true);
        localStorage.removeItem("orderCreation");
        router.push("/order-confirmed"); // Redirigir a página de confirmación
      } else {
        setError("Código inválido. Por favor intenta nuevamente.");
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (elementIndex: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[elementIndex] = value;
    setCode(newCode);

    // Auto-focus siguiente input
    if (value && elementIndex < 5) {
      const nextInput = document.getElementById(`code-${elementIndex + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-xl">Cargando...</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <section className="p-4 flex flex-col items-center justify-center min-h-screen shadow-lg">
        <div className="w-full max-w-md space-y-6 shadow-lg p-8 rounded-xl border border-default-100">
          <h1 className="text-3xl font-bold text-center">Verificación de Email</h1>
          <p className="text-gray-600 text-center">
            Hemos enviado un código de 6 dígitos a tu correo electrónico
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-12 h-12 text-2xl text-center border-2 rounded-lg focus:border-blue-500 focus:outline-none"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>

          <p className="text-center text-gray-600">
            ¿No recibiste el código?{' '}
            <button className="text-blue-600 hover:underline">
              Reenviar código
            </button>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 flex flex-col items-center justify-center h-full">
      <VerificationCard />
    </section>
  );
}
