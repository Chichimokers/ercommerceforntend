"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
} from "@heroui/react";
import Image from "next/image";
import {
  FaFacebook,
  FaGoogle,
  FaLink,
  FaLock,
  FaMailBulk,
  FaUser,
} from "react-icons/fa";
import Checkbox from "../checkbox/checkbox";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { SignUpProps } from "@/types/signup-props";
import { signUp } from "@/services/authService";
import { UserData } from "@/types/types";
import VerificationModal from "./verification-modal";
import SuccessModal from "./succes-modal";
import { useModal } from "@/contexts/modal-context";
import UnSuccessModal from "./unsucces-modal";
import { EyeSlashFilledIcon } from "../images/eye-slash-icon";
import { EyeFilledIcon } from "../images/eye-filled";
import { usePathname, useRouter } from "next/navigation";
import { CustomButton } from "../buttons/custom-button";
import { signIn } from "next-auth/react";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
}

export default function SignUp({
  title,
  onSwitchToOther,
  isOpen,
  onOpenChange,
  closeModals,
}: SignUpProps) {
  const windowWidth = useWindowWidth();
  const {
    isVerifyOpen,
    openVerify,
    closeVerify,
    setIsAuthorizationInProgress,
    data,
    setData,
  } = useModal();
  const [submitError, setSubmitError] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [UnSuccessModalOpen, setUnSuccessModalOpen] = useState(false);
  const [isVisibleP, setIsVisibleP] = React.useState(false);
  const toggleVisibilityP = () => setIsVisibleP(!isVisibleP);
  const [isVisibleCP, setIsVisibleCP] = React.useState(false);
  const toggleVisibilityCP = () => setIsVisibleCP(!isVisibleCP);
  const router = useRouter();
  const pathname = usePathname();
  const validationRules = {
    fullName: {
      required: true,
      minLength: 4,
    },
    email: {
      required: true,
      pattern: /\S+@\S+\.\S+/,
    },
    password: {
      required: true,
      minLength: 8,
      custom: (value: string) => {
        if (!/(?=.*[A-Z])/.test(value))
          return "La contraseña debe contener al menos una letra mayúscula";
        if (!/(?=.*[0-9])/.test(value))
          return "La contraseña debe contener al menos un número";
        return true;
      },
    },
    confirmPassword: {
      required: true,
      matches: "password",
    },
    acceptTerms: {
      custom: (value: boolean) =>
        value || "Debe aceptar los términos y condiciones",
    },
  };

  const {
    formData,
    errors,
    isLoading,
    setIsLoading,
    handleChange,
    validateForm,
  } = useFormValidation(
    {
      fullName: data?.username || "",
      email: data?.email || "",
      password: data?.password || "",
      confirmPassword: data?.password || "",
      acceptTerms: !data ? false : true,
    },
    validationRules
  );

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    handleChange(field, value);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setSubmitError("");
      const user: UserData = {
        email: formData.email,
        password: formData.password,
        username: formData.fullName,
      };

      await signUp(user);
      setData(user);
      openVerify();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Error al registrarse"
      );
      setUnSuccessModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: "google" | "facebook") => {
    try {
      setIsLoading(true);
      console.log(`${provider} Registro, haga clic en`);
    } catch (error) {
      console.error(`${provider} fallo en el registro:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSocialButtons = () => (
    <div className="flex justify-center gap-4 w-full">
      <CustomButton
        variant="bordered"
        className="bg-transparent hover:bg-transparent"
        color="danger"
        onClick={() => signIn('google')}
      >
        <FaGoogle className="fill-gray-700 dark:fill-gray-100" />
      </CustomButton>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <Modal
        aria-labelledby="signup-modal"
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        closeButton
        classNames={{
          closeButton: "absolute top-2 right-2",
        }}
        shadow="md"
        size="lg"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="max-w-[95vw] xxs:max-w-[90vw] sm:max-w-lg">
          {(onClose) => (
            <div className="p-2 xxs:p-4">
              <ModalHeader className="flex flex-col items-center gap-1">
                <Image
                  alt="Company Logo"
                  className="w-24 h-auto"
                  src="/logo.png"
                  width={96}
                  height={96}
                />
                {title}
              </ModalHeader>

              <ModalBody className="flex flex-col gap-2 max-h-[calc(100vh-14rem)] overflow-y-auto">
                <section className="grid grid-cols-1 xm:grid-cols-2 gap-2">
                  <Input
                    className="w-full"
                    classNames={{
                      errorMessage: "text-[10px] xxs:text-xs",
                      label: "text-xs xxs:text-sm",
                    }}
                    errorMessage={errors.fullName}
                    isInvalid={!!errors.fullName}
                    label={windowWidth > 380 ? "Nombre completo" : undefined}
                    labelPlacement="outside"
                    placeholder="Nombre completo"
                    size={windowWidth <= 380 ? "sm" : "md"}
                    startContent={
                      <FaUser
                        className={`text-default-400 pointer-events-none flex-shrink-0 ${windowWidth <= 380 ? "text-sm" : "text-xl"
                          }`}
                      />
                    }
                    value={formData.fullName}
                    variant="bordered"
                    onValueChange={(value) =>
                      handleInputChange("fullName", value)
                    }
                  />

                  <Input
                    className="w-full"
                    classNames={{
                      errorMessage: "text-[10px] xxs:text-xs",
                      label: "text-xs xxs:text-sm",
                    }}
                    errorMessage={errors.email}
                    isInvalid={!!errors.email}
                    label={windowWidth > 380 ? "Correo electrónico" : undefined}
                    labelPlacement="outside"
                    placeholder="you@example.com"
                    size={windowWidth <= 380 ? "sm" : "md"}
                    startContent={
                      <FaMailBulk
                        className={`text-default-400 pointer-events-none flex-shrink-0 ${windowWidth <= 380 ? "text-sm" : "text-xl"
                          }`}
                      />
                    }
                    type="email"
                    value={formData.email}
                    variant="bordered"
                    onValueChange={(value) => handleInputChange("email", value)}
                  />

                  <Input
                    className="w-full"
                    classNames={{
                      errorMessage: "text-[10px] xxs:text-xs",
                      label: "text-xs xxs:text-sm",
                    }}
                    errorMessage={errors.password}
                    isInvalid={!!errors.password}
                    label={windowWidth > 380 ? "Contraseña" : undefined}
                    labelPlacement="outside"
                    placeholder="Crear contraseña"
                    size={windowWidth <= 380 ? "sm" : "md"}
                    startContent={
                      <FaLock
                        className={`text-default-400 pointer-events-none flex-shrink-0 ${windowWidth <= 380 ? "text-sm" : "text-xl"
                          }`}
                      />
                    }
                    type={isVisibleP ? "text" : "password"}
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibilityP}
                      >
                        {isVisibleP ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    value={formData.password}
                    variant="bordered"
                    onValueChange={(value) =>
                      handleInputChange("password", value)
                    }
                  />

                  <Input
                    className="w-full"
                    classNames={{
                      errorMessage: "text-[10px] xxs:text-xs",
                      label: "text-xs xxs:text-sm",
                    }}
                    errorMessage={errors.confirmPassword}
                    isInvalid={!!errors.confirmPassword}
                    label={
                      windowWidth > 380 ? "Confirmar contraseña" : undefined
                    }
                    labelPlacement="outside"
                    placeholder={
                      !(windowWidth > 559)
                        ? "Confirma tu contraseña"
                        : "Contraseña"
                    }
                    size={windowWidth <= 380 ? "sm" : "md"}
                    startContent={
                      <FaLock
                        className={`text-default-400 pointer-events-none flex-shrink-0 ${windowWidth <= 380 ? "text-sm" : "text-xl"
                          }`}
                      />
                    }
                    type={isVisibleCP ? "text" : "password"}
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibilityCP}
                      >
                        {isVisibleCP ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    value={formData.confirmPassword}
                    variant="bordered"
                    onValueChange={(value) =>
                      handleInputChange("confirmPassword", value)
                    }
                  />
                </section>
                <Checkbox
                  className={`w-max text-xs sm:text-sm ${errors.acceptTerms ? "text-danger" : ""
                    }`}
                  checked={formData.acceptTerms}
                  onChange={(value) => handleInputChange("acceptTerms", value)}
                  label="Acepto los términos y condiciones"
                ></Checkbox>
                {errors.acceptTerms && (
                  <p className="text-danger text-xs">{errors.acceptTerms}</p>
                )}

                <Link className="text-xs select-none cursor-pointer">
                  <FaLink className="mx-1"></FaLink>
                  Terminos y condiciones
                </Link>

                <div className="text-center text-sm">
                  <p className="mb-2 text-xs">O regístrese con</p>
                  {renderSocialButtons()}
                </div>
              </ModalBody>

              <ModalFooter className="flex flex-col gap-2">
                <Button
                  fullWidth
                  className="bg-blue-600"
                  color="primary"
                  isLoading={isLoading}
                  variant="solid"
                  onPress={handleSubmit}
                >
                  {isLoading ? "Creating Account..." : "Crear una cuenta"}
                </Button>
                <hr />
                <p className="text-center text-xs">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    className="text-xs"
                    href="#"
                    size="sm"
                    onPress={() => {
                      onSwitchToOther?.();
                    }}
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
      <VerificationModal
        isOpen={isVerifyOpen}
        onClose={() => {
          closeVerify();
        }}
        onVerifyCode={() => {
          setSuccessModalOpen(true);
        }}
        userData={data}
      />
      <SuccessModal
        message={"¡Verificación Exitosa!"}
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          closeModals();
          setIsAuthorizationInProgress(false);

          // Usando el router de next/navigation
          router.replace(pathname, { scroll: false });
        }}
      />
      <UnSuccessModal
        isOpen={UnSuccessModalOpen}
        onClose={(val: boolean) => setUnSuccessModalOpen(val)}
        message={submitError}
      />
    </div>
  );
}
