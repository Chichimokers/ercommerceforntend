"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { VisaIcon, MastercardIcon, PaypalIcon } from "@components/icons/icons";
import { CreditCard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/react";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectMethod: (method: string) => Promise<any>;
  initialMethod?: string;
}

const CustomRadio = ({
  value,
  selectedValue,
  onChange,
  children,
  disabled = false
}: {
  value: string;
  selectedValue: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const isSelected = value === selectedValue;

  return (
    <div
      onClick={() => !disabled && onChange(value)}
      className={`
        cursor-pointer border rounded-lg p-4 transition-all w-full
        ${isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      role="radio"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onChange(value);
        }
      }}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex items-center justify-center">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${isSelected
                ? "border-blue-500 dark:border-blue-400"
                : "border-gray-400 dark:border-gray-500"}
            `}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            )}
          </div>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

const CustomButton = ({
  children,
  onClick,
  color = "default",
  disabled = false,
  loading = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: "default" | "primary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) => {
  const colorStyles = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
    primary: "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700",
    danger: "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all
        ${colorStyles[color]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${loading ? "relative !text-transparent" : ""}
        ${className}
      `}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {children}
    </button>
  );
};

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onOpenChange,
  onSelectMethod,
  initialMethod = ""
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>(initialMethod);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (initialMethod) {
      setSelectedMethod(initialMethod);
    }
  }, [initialMethod]);

  useEffect(() => {
    if (isOpen && !initialMethod) {
      setSelectedMethod("");
    }
  }, [isOpen, initialMethod]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSubmitting, onOpenChange]);

  const handleConfirm = async () => {
    if (selectedMethod) {
      setIsSubmitting(true);
      try {
        await onSelectMethod(selectedMethod);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const paymentMethods = [
    {
      id: "visa",
      name: "VISA",
      icon: <VisaIcon width={50} height={50} />,
      description: "Tarjeta de crédito o débito VISA",
    },
    {
      id: "mastercard",
      name: "Mastercard",
      icon: <MastercardIcon width={50} height={50} />,
      description: "Tarjeta de crédito o débito Mastercard",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: <PaypalIcon width={50} height={50} />,
      description: "Cuenta PayPal",
    }
  ];

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40"
            onClick={() => !isSubmitting && onOpenChange(false)}
            aria-hidden="true"
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md mx-auto overflow-hidden z-10"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
              <h2
                id="payment-modal-title"
                className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"
              >
                <CreditCard className="text-blue-500" size={20} />
                <span>Selecciona un método de pago</span>
              </h2>

              {!isSubmitting && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <CustomRadio
                    key={method.id}
                    value={method.id}
                    selectedValue={selectedMethod}
                    onChange={setSelectedMethod}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center">
                        {method.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">
                          {method.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </CustomRadio>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
              <Button
                color="danger"
                className="bg-transparent hover:bg-default-200"
                onPress={() => !isSubmitting && onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <CustomButton
                color="primary"
                onClick={handleConfirm}
                disabled={!selectedMethod || isSubmitting}
                loading={isSubmitting}
              >
                Confirmar y pagar
              </CustomButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PaymentMethodModal;