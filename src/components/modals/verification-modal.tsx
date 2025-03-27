"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resendVerification, sendVerification } from "@/services/authService";
import { signIn } from "next-auth/react";
import { CheckCircle, AlertCircle, MailIcon, Loader } from "lucide-react";
import { Portal } from "@/components/ui/portal"; // Importar el componente Portal

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyCode: () => void;
  userData?: {
    email: string;
    password: string;
    [key: string]: any;
  };
}

export default function VerificationModal({
  isOpen,
  onClose,
  onVerifyCode,
  userData,
}: VerificationModalProps) {
  const INITIAL_TIME = 120; // 2 minutos
  const TIME_PENALTY = 30;

  // Reemplazar el estado timeRemaining por estos dos
  const [expirationTime, setExpirationTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME);

  const [verificationCode, setVerificationCode] = useState(Array(6).fill(''));
  const [focusedInput, setFocusedInput] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  useEffect(() => {
    if (isOpen) {
      setVerificationCode(Array(6).fill(''));
      setFocusedInput(0);
      setErrorMessage('');
      setShowSuccess(false);
      setExpirationTime(null); // Resetear el tiempo de expiración
      setTimeRemaining(INITIAL_TIME);

      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Efecto para manejar el enfoque automático cuando cambia focusedInput
  useEffect(() => {
    if (isOpen && inputRefs.current[focusedInput]) {
      inputRefs.current[focusedInput].focus();
    }
  }, [focusedInput, isOpen]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Manejo del temporizador
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isOpen && !expirationTime) {
      // Establecer tiempo de expiración cuando se abre el modal
      const expTime = Date.now() + INITIAL_TIME * 1000;
      setExpirationTime(expTime);
      setErrorMessage('');
      setTimerActive(true);
      setCanResend(false);
    }

    if (isOpen && expirationTime) {
      // Comprobar el tiempo restante cada 500ms
      intervalId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));

        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(intervalId);
          setTimerActive(false);
          setCanResend(true);
          setErrorMessage('¡Código expirado! Por favor solicita uno nuevo');
        }
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, expirationTime]);

  // Formatear tiempo como MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Manejo del código OTP
  const handleOtpChange = (index: number, value: string) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Mover al siguiente campo si se ingresó un valor
    if (value && index < 5) {
      setFocusedInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Mover al campo anterior con backspace si el campo actual está vacío
    if (e.key === 'Backspace') {
      if (!verificationCode[index] && index > 0) {
        e.preventDefault();
        setFocusedInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setFocusedInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      setFocusedInput(index + 1);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      // Limpiar el valor actual
      const newCode = [...verificationCode];
      newCode[index] = '';
      setVerificationCode(newCode);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toLowerCase();

    // Verificar que solo contenga letras minúsculas y números
    if (!/^[a-z0-9]+$/.test(pastedData)) {
      return;
    }

    // Tomar solo los primeros 6 caracteres
    const chars = pastedData.substring(0, 6).split('');
    const newCode = [...verificationCode];

    // Llenar el código con los caracteres pegados
    chars.forEach((char, index) => {
      if (index < 6) {
        newCode[index] = char;
      }
    });

    setVerificationCode(newCode);

    // Enfocar el siguiente campo vacío o el último si todos están llenos
    const nextEmptyIndex = newCode.findIndex(val => !val);
    setFocusedInput(nextEmptyIndex >= 0 ? nextEmptyIndex : 5);
  };

  // Enviar código para verificación
  const handleSubmit = useCallback(async () => {
    const codeString = verificationCode.join('');

    // Validar longitud
    if (codeString.length !== 6) {
      setErrorMessage('El código debe tener exactamente 6 caracteres.');
      return;
    }

    // Validar formato
    if (!/^[a-z0-9]+$/.test(codeString)) {
      setErrorMessage('El código solo puede contener letras minúsculas y números.');
      return;
    }

    if (!userData) {
      setErrorMessage('Error: Datos de usuario no disponibles.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const userDataWithCode = { ...userData, code: codeString, username: userData.username };
      console.log(userDataWithCode)
      // Enviar verificación
      await sendVerification(userDataWithCode);


      // Iniciar sesión
      const signInResponse = await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (!signInResponse?.ok) {
        throw new Error(
          signInResponse?.error?.includes("CredentialsSignin")
            ? "Credenciales inválidas o usuario no verificado"
            : signInResponse?.error || "Error de autenticación"
        );
      }

      // Mostrar animación de éxito antes de cerrar
      setShowSuccess(true);
      setSuccessMessage('¡Verificación exitosa!');

      // Cerrar después de mostrar éxito
      setTimeout(() => {
        onVerifyCode();
      }, 1500);

    } catch (error) {
      console.error("Error en verificación:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error en el proceso de verificación"
      );
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, userData, onVerifyCode]);

  // Reenviar código
  const handleResendCode = async () => {
    if (!userData) {
      setErrorMessage("Error: No se proporcionaron datos de usuario.");
      return;
    }

    setIsResending(true);
    setErrorMessage('');

    try {
      await resendVerification({ ...userData, username: userData.username });
      setSuccessMessage("Se ha reenviado el código a su correo.");
      setShowSuccess(true);

      // Establecer nueva hora de expiración
      const newExpTime = Date.now() + INITIAL_TIME * 1000;
      setExpirationTime(newExpTime);
      setTimeRemaining(INITIAL_TIME);
      setCanResend(false);

      // Ocultar mensaje de éxito después de un tiempo
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al reenviar el código. Verifique su correo."
      );

      // Añadir penalización al tiempo de expiración actual
      if (expirationTime) {
        const penalizedTime = expirationTime + TIME_PENALTY * 1000;
        setExpirationTime(penalizedTime);
      }
    } finally {
      setIsResending(false);
    }
  };

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición del scroll
      const scrollY = window.scrollY;

      // Bloquear el scroll añadiendo clases al body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Mantener el ancho para evitar saltos

      return () => {
        // Restaurar el scroll cuando el componente se desmonte
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY); // Volver a la posición original
      };
    }
  }, [isOpen]);

  if (!isOpen || !isMounted) return null;

  // Extraer el contenido del modal en una variable
  const modalContent = (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        isolation: 'isolate',
        zIndex: 999999,
      }}
    >
      {/* Resto del JSX sin cambios */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={e => e.stopPropagation()}
        style={{ zIndex: 0 }}
      />

      <div
        className="relative z-10 w-full max-w-md p-4"
        style={{ maxHeight: '90vh' }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-gray-800 rounded-xl w-full overflow-hidden relative shadow-2xl"
          >
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white dark:bg-gray-800 flex flex-col items-center justify-center z-10 p-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                >
                  <CheckCircle size={60} className="text-green-500 mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {successMessage}
                </h3>
              </motion.div>
            )}

            {/* Header - Sin botón de cierre */}
            <div className="flex justify-center items-center p-5 border-b border-gray-200 dark:border-gray-700 z-50">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Verifica tu correo electrónico
              </h3>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <MailIcon className="text-blue-500 flex-shrink-0" size={20} />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Se ha enviado un código de verificación a{" "}
                  <span className="font-semibold">
                    {userData?.email || "tu correo electrónico"}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Ingresa el código de 6 dígitos
                </label>
                <div className="flex justify-center gap-2 mb-4">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^[a-z0-9]$/i.test(val) || val === '') {
                          handleOtpChange(index, val.toLowerCase());
                        }
                      }}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onFocus={() => setFocusedInput(index)}
                      onPaste={handlePaste}
                      className={`w-10 h-10 xxs:w-12 xxs:h-12 md:w-14 md:h-14 text-center text-xl font-bold rounded-lg outline-none transition-all duration-200
                        ${!!errorMessage
                          ? "border-2 border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}
                        focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20`}
                    />
                  ))}
                </div>

                {/* Mensaje de error */}
                {errorMessage && (
                  <div className="mt-2 flex items-start gap-2 text-red-500">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{errorMessage}</span>
                  </div>
                )}

                {/* Temporizador */}
                {timeRemaining > 0 && (
                  <div className="mt-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Expira en {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de reenvío */}
              {canResend && (
                <div className="text-center mb-4">
                  <button
                    onClick={handleResendCode}
                    disabled={isResending}
                    className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all 
                    ${isResending
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                        : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"}`}
                  >
                    {isResending ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      "Reenviar código"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Footer - Solo botón de verificar */}
            <div className="flex justify-center p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <button
                onClick={handleSubmit}
                disabled={verificationCode.some(digit => !digit) || isLoading || canResend}
                className={`w-full px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2
                  ${verificationCode.some(digit => !digit) || canResend
                    ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"}`}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar código"
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  return <Portal>{modalContent}</Portal>;
}
