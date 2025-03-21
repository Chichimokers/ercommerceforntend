"use client";

import React, { useState, useEffect } from "react";
import { FaCreditCard } from "react-icons/fa";
import { SiVisa, SiMastercard, SiPaypal } from "react-icons/si";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { useSession } from "next-auth/react";

const CustomButton = ({
  onClick,
  children,
  isLoading,
  className,
  startIcon,

}: {
  onClick: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  startIcon?: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    className={`
      flex items-center justify-center gap-2 px-4 py-2 
      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
      text-white font-medium rounded-lg transition-colors
      w-full md:w-auto disabled:opacity-70 disabled:cursor-not-allowed
      ${className || ''}
    `}
  >
    {isLoading ? (
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : startIcon}
    {children}
  </button>
);

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
      case "visa": return <SiVisa className="text-lg text-white" />;
      case "mastercard": return <SiMastercard className="text-lg text-white" />;
      case "paypal": return <SiPaypal className="text-lg text-white" />;
      default: return <FaCreditCard className="text-lg text-white" />;
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