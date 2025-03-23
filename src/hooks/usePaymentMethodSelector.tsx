"use client";

import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { VisaIcon, MastercardIcon, PaypalIcon } from "@components/icons/icons";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";

// Importamos el modal con carga dinámica para el cliente
const PaymentMethodModal = dynamic(
  () => import("@components/modals/payment-method-modal"),
  { ssr: false }
);

interface PaymentMethodButtonProps {
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
  variant?: "solid" | "ghost" | "flat" | "bordered" | "light" | "faded" | "shadow" | undefined;
  color?: "primary" | "secondary" | "danger" | "success" | "warning";
}

const PaymentMethodButton = ({
  orderId,
  onSuccess,
  onError,
  className = "",
  variant = "solid",
  color = "primary",
}: PaymentMethodButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [modalAttempt, setModalAttempt] = useState(0);

  // Este efecto asegura que el componente solo se ejecute completamente en el cliente
  useEffect(() => {
    setIsMounted(true);

    // Depuración para identificar cualquier estado inesperado
    console.log("PaymentMethodButton montado");

    return () => {
      console.log("PaymentMethodButton desmontado");
      setIsMounted(false);
    };
  }, []);

  // Procesar el pago con el método seleccionado
  const handlePayment = async (method: string) => {
    try {
      console.log("Procesando pago con método:", method);
      setIsLoading(true);
      setSelectedMethod(method);

      toast.loading(`Procesando pago con ${getMethodName(method)}...`, { id: 'payment-toast' });

      const response = await fetch(`/api/payment`, {

        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, paymentMethod: method }),
        credentials: 'include',
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || `Error en la respuesta: ${response.status}`;
        } catch {
          errorMessage = responseText || `Error en la respuesta: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || 'Error al procesar el pago');
      }

      if (responseData.redirectUrl) {
        toast.success(`Redirigiendo a pasarela de pago...`, { id: 'payment-toast' });
        window.location.href = responseData.redirectUrl;
        return responseData;
      }

      toast.success(`Pago con ${getMethodName(method)} procesado correctamente`, { id: 'payment-toast' });
      if (onSuccess) {
        onSuccess();
      }
      return responseData.data;
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error(
        `Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        { id: 'payment-toast' }
      );
      if (onError) {
        onError(error);
      }
      return null;
    } finally {
      if (!window.location.href.includes('stripe.com') && !window.location.href.includes('paypal.com')) {
        setIsLoading(false);
        setIsModalOpen(false);
      }
    }
  };

  const getMethodName = (methodId: string): string => {
    switch (methodId) {
      case "visa": return "VISA";
      case "mastercard": return "Mastercard";
      case "paypal": return "PayPal";
      default: return "método seleccionado";
    }
  };

  const getPaymentIcon = () => {
    switch (selectedMethod) {
      case "visa": return <VisaIcon className="text-lg text-white" />;
      case "mastercard": return <MastercardIcon className="text-lg text-white" />;
      case "paypal": return <PaypalIcon className="text-lg text-white" />;
      default: return <CreditCard className="text-lg text-white" />;
    }
  };

  const handleOpenModal = () => {
    console.log("Intento de abrir modal:", modalAttempt + 1);
    setModalAttempt(prev => prev + 1);

    setTimeout(() => {
      setIsModalOpen(true);
      console.log("Modal abierto:", true);
    }, 50);
  };

  if (!isMounted) {
    return (
      <button
        className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-lg w-full md:w-auto ${className}`}
        disabled
      >
        <span className="opacity-0">Cargando...</span>
      </button>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenModal}
        isLoading={isLoading}
        className={className}
        startContent={getPaymentIcon()}
        variant={variant}
        color={color}
      >
        {isLoading
          ? "Procesando pago..."
          : selectedMethod
            ? `Pagar con ${getMethodName(selectedMethod)}`
            : "Pagar"
        }
      </Button>

      <PaymentMethodModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelectMethod={handlePayment}
        initialMethod={selectedMethod}
      />
    </>
  );
};

export default PaymentMethodButton;