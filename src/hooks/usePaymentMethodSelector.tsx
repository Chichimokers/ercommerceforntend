"use client";

import React, { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { VisaIcon, MastercardIcon, PaypalIcon } from "@components/icons/icons";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";

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

  useEffect(() => {
    setIsMounted(true);

    console.log("PaymentMethodButton montado");

    return () => {
      console.log("PaymentMethodButton desmontado");
      setIsMounted(false);
    };
  }, []);

  function isNetworkError(error) {
    return error instanceof TypeError &&
      (error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('Body'));
  }

  const handlePayment = async (method: string, retryCount = 0) => {
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
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Respuesta no es JSON válido:", responseText.substring(0, 500));
        throw new Error(
          response.ok
            ? "Respuesta inesperada del servidor"
            : `Error ${response.status}: ${response.statusText}`
        );
      }

      if (!response.ok) {
        throw new Error(responseData?.error || `Error en la respuesta: ${response.status}`);
      }

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

      if (isNetworkError(error) && retryCount < 2) {
        console.log(`Reintentando petición (${retryCount + 1}/2)...`);
        toast.loading(`Reintentando conexión...`, { id: 'payment-toast' });

        await new Promise(r => setTimeout(r, 500 * (retryCount + 1)));
        return handlePayment(method, retryCount + 1);
      }

      toast.error(
        `Error al procesar el pago: ${error instanceof Error ? error.message : 'Error de conexión'}`,
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