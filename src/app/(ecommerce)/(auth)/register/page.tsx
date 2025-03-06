"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  addToast,
  Checkbox
} from "@heroui/react";
import Image from "next/image";
import {
  FaGoogle,
  FaLock,
  FaMailBulk,
  FaUser,
} from "react-icons/fa";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { signUp } from "@/services/authService";
import { UserData } from "@/types/types";
import VerificationModal from "@components/modals/verification-modal";
import { useModal } from "@/contexts/modal-context";
import { EyeSlashFilledIcon } from "@components/images/eye-slash-icon";
import { EyeFilledIcon } from "@components/images/eye-filled";
import { usePathname, useRouter } from "next/navigation";
import { CustomButton } from "@components/buttons/custom-button";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FormField } from "@components/forms/form-field";
import { TermsModal } from "@components/modals/terms-modal";

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

export default function SignUp() {
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

      addToast({
        title: "Registro exitoso",
        description: "Hemos enviado un código de verificación a tu correo",
        color: "success",
        classNames: {
          base: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-800 dark:to-green-900",
          title: "text-green-800 dark:text-green-100",
          description: "text-green-600 dark:text-green-200",
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al registrarse";

      addToast({
        title: "Error en registro",
        description: errorMessage,
        color: "danger",
        classNames: {
          base: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-800 dark:to-red-900",
          title: "text-red-800 dark:text-red-100",
          description: "text-red-600 dark:text-red-200",
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: "google" | "facebook") => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        redirect: false,
        callbackUrl: "/"
      });
    } catch (error) {
      console.error(`${provider} login failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl rounded-2xl shadow-md relative overflow-hidden bg-opacity-70 dark:bg-opacity-70"
    >

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full p-8 rounded-2xl shadow-xl bg-transparent"
      >
        <div className="flex flex-col items-center gap-4 mb-6">
          <Image
            alt="Company Logo"
            className="w-24 h-auto rounded-lg"
            src="/logo.png"
            width={96}
            height={96}
          />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Crea tu cuenta
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormField label="Nombre completo" error={errors.fullName} className="mb-4">
                <Input
                  startContent={<FaUser className="h-5 w-5 text-gray-500" />}
                  placeholder="Nombre completo"
                  className="rounded-lg dark:bg-gray-800 bg-gray-50"
                  value={formData.fullName}
                  onValueChange={(value) => handleInputChange("fullName", value)}
                />
              </FormField>

              <FormField label="Correo electrónico" error={errors.email} className="mb-4">
                <Input
                  startContent={<FaMailBulk className="h-5 w-5 text-gray-500" />}
                  placeholder="you@example.com"
                  className="rounded-lg dark:bg-gray-800 bg-gray-50"
                  value={formData.email}
                  onValueChange={(value) => handleInputChange("email", value)}
                />
              </FormField>

              <FormField label="Contraseña" error={errors.password} className="mb-4">
                <Input
                  startContent={<FaLock className="h-5 w-5 text-gray-500" />}
                  placeholder="••••••••"
                  type={isVisibleP ? "text" : "password"}
                  endContent={
                    <button onClick={toggleVisibilityP} className="p-1">
                      {isVisibleP ? (
                        <EyeSlashFilledIcon className="text-2xl text-gray-500" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-gray-500" />
                      )}
                    </button>
                  }
                  className="rounded-lg dark:bg-gray-800 bg-gray-50"
                  value={formData.password}
                  onValueChange={(value) => handleInputChange("password", value)}
                />
              </FormField>

              <FormField label="Confirmar contraseña" error={errors.confirmPassword} className="mb-4">
                <Input
                  startContent={<FaLock className="h-5 w-5 text-gray-500" />}
                  placeholder="••••••••"
                  type={isVisibleCP ? "text" : "password"}
                  endContent={
                    <button onClick={toggleVisibilityCP} className="p-1">
                      {isVisibleCP ? (
                        <EyeSlashFilledIcon className="text-2xl text-gray-500" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-gray-500" />
                      )}
                    </button>
                  }
                  className="rounded-lg dark:bg-gray-800 bg-gray-50"
                  value={formData.confirmPassword}
                  onValueChange={(value) => handleInputChange("confirmPassword", value)}
                />
              </FormField>

              <div className="mb-4">
                <Checkbox
                  className={`text-sm mr-[1px] ${errors.acceptTerms ? "text-danger" : "text-gray-600 dark:text-gray-300"}`}
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                >
                  Acepto los
                </Checkbox>
                <TermsModal />
                {errors.acceptTerms && (
                  <div className="text-danger text-xs mt-1">
                    {errors.acceptTerms}
                  </div>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  fullWidth
                  type="submit"
                  className="bg-blue-700 text-white font-medium py-2 rounded-lg shadow-lg"
                  isLoading={isLoading}
                >
                  {isLoading ? "Creando cuenta..." : "Registrarse ahora"}
                </Button>
              </motion.div>

              <div className="flex items-center my-4">
                <hr className="flex-1 border-gray-300" />
                <span className="px-3 text-gray-500">O</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <CustomButton
                variant="bordered"
                className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSocialSignUp('google')}
                startContent={<FaGoogle className="text-lg text-red-500" />}
              >
                <span className="text-gray-800 dark:text-gray-200">
                  Continuar con Google
                </span>
              </CustomButton>
            </motion.div>
          </form>
        </div>

        <VerificationModal
          isOpen={isVerifyOpen}
          onClose={closeVerify}
          onVerifyCode={() => {
            addToast({
              title: "Verificación exitosa",
              description: "¡Tu cuenta ha sido activada correctamente!",
              color: "success",
              classNames: {
                base: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-800 dark:to-green-900",
                title: "text-green-800 dark:text-green-100",
                description: "text-green-600 dark:text-green-200",
              }
            });
            closeVerify();
            router.push("/");
          }}
          userData={data}
        />
      </motion.div>
    </motion.div>
  );
}
