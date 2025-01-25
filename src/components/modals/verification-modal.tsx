import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputOtp,
} from "@heroui/react";
import { UserData } from "@/types/types";
import { resendVerification, sendVerification } from "@/services/authService";
import { signIn } from "next-auth/react";
import { useModal } from "@/contexts/modal-context";
import SuccessModal from "./succes-modal";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyCode: () => void;
  userData?: UserData;
}

export default function VerificationModal({
  isOpen,
  onClose,
  onVerifyCode,
  userData,
}: VerificationModalProps) {
  const initState = {
    verificationCode: "",
    errorMessage: "",
    isLoading: false,
    timerActive: false,
    messageForSuccesModal: "",
    openSuccessModal: false,
    isLoadingResend: false,
    accessToResendButton: false,
    timeRemaining: 120,
  };

  const [state, setState] = useState(initState);
  const { setIsAuthorizationInProgress } = useModal();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const validateCodeLength = useCallback((code: string) => {
    if (code.length !== 6) {
      return "El código debe tener exactamente 6 caracteres.";
    }
    return "";
  }, []);

  const validateCodeFormat = useCallback((code: string) => {
    if (!/^[a-z0-9]+$/.test(code)) {
      return "El código solo puede contener letras minúsculas y números.";
    }
    return "";
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isOpen && state.timeRemaining > 0) {
      setState((prev) => ({
        ...prev,
        errorMessage: "",
        timerActive: true,
        accessToResendButton: false,
      }));

      intervalId = setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            clearInterval(intervalId);
            return {
              ...prev,
              timeRemaining: 0,
              timerActive: false,
              accessToResendButton: true,
              errorMessage: "Tiempo de verificación agotado",
            };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen]);

  const handleResendCode = async () => {
    if (!userData) {
      console.error("Error: No se proporcionaron datos de usuario.");
      return;
    }

    setState((prev) => ({ ...prev, isLoadingResend: true }));

    try {
      await resendVerification(userData);
      setState((prev) => ({
        ...prev,
        messageForSuccesModal: "Se ha reenviado el código a su correo.",
        openSuccessModal: true,
        timeRemaining: initState.timeRemaining, // Reinicia el temporizador
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Error al reenviar el código. Verifique su correo.",
        isLoadingResend: false,
        timeRemaining: prev.timeRemaining + 30, // Aumenta el tiempo en caso de fallo
      }));
    }
  };

  const handleSubmit = useCallback(async () => {
    const lengthError = validateCodeLength(state.verificationCode);
    if (lengthError) {
      setState((prev) => ({ ...prev, errorMessage: lengthError }));
      return;
    }

    const formatError = validateCodeFormat(state.verificationCode);
    if (formatError) {
      setState((prev) => ({ ...prev, errorMessage: formatError }));
      return;
    }

    if (!userData) {
      console.error("Error: No se proporcionaron datos de usuario.");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, errorMessage: "" }));

    try {
      const userDataWithCode = { ...userData, code: state.verificationCode };

      await sendVerification(userDataWithCode);

      const signInResponse = await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (!signInResponse?.ok)
        throw new Error(
          signInResponse?.error === "CredentialsSignin"
            ? "Intenta luego :)"
            : "No eres tú soy yo..."
        );

      setIsAuthorizationInProgress(true);
      onVerifyCode();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        errorMessage:
          error instanceof Error
            ? error.message === "Code expired or not found"
              ? "El código ha expirado o no existe"
              : "Código inválido"
            : "Ocurrió un error al verificar el código.",
        isLoading: false,
      }));
    }
  }, [
    userData,
    state.verificationCode,
    validateCodeLength,
    validateCodeFormat,
    setIsAuthorizationInProgress,
    onVerifyCode,
  ]);

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, errorMessage: "" }));
    onClose();
  }, [onClose]);

  const handleCodeChange = useCallback((code: string) => {
    setState((prev) => ({ ...prev, verificationCode: code }));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      isDismissable={false}
      onClose={handleCancel}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader>
          <h3>Verifica tu correo electrónico</h3>
        </ModalHeader>
        <ModalBody>
          <p>Se ha enviado un código de verificación a tu correo electrónico</p>
          <div className="grid gap-1 text-center justify-center">
            <InputOtp
              color="primary"
              length={6}
              value={state.verificationCode}
              size="lg"
              allowedKeys="[a-z0-9]"
              variant="bordered"
              aria-label="Código de verificación"
              onValueChange={handleCodeChange}
              isInvalid={!!state.errorMessage}
              textAlign="center"
              errorMessage={state.errorMessage}
            />
            {state.timeRemaining > 0 && (
              <small className="text-default-500 italic">
                Tiempo para que expire: {formatTime(state.timeRemaining)}
              </small>
            )}
            {state.accessToResendButton && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  isDisabled={state.isLoadingResend}
                  onPress={handleResendCode}
                  isLoading={state.isLoadingResend}
                  variant="light"
                  color={state.isLoadingResend ? "default" : "primary"}
                >
                  <small className="italic">Reenviar Código</small>
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onPress={handleSubmit}
            isDisabled={
              state.accessToResendButton ||
              state.isLoading ||
              state.verificationCode.length !== 6
            }
            isLoading={state.isLoading}
            color="default"
            variant={
              state.accessToResendButton || state.verificationCode.length !== 6
                ? "bordered"
                : "solid"
            }
            className={`transition-all duration-300 ease-in-out ${
              state.accessToResendButton || state.verificationCode.length !== 6
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105 hover:shadow-md"
            }`}
          >
            Verificar Código
          </Button>
          <Button color="danger" onPress={handleCancel}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
      <SuccessModal
        isOpen={state.openSuccessModal}
        message={state.messageForSuccesModal}
        onClose={() =>
          setState((prev) => ({ ...initState, timerActive: true }))
        }
      />
    </Modal>
  );
}
