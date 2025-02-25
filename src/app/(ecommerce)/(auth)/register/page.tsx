"use client";

import React, { useState } from "react";
import {
  Button,
  Input,
  Link,
} from "@heroui/react";
import Image from "next/image";
import {
  FaGoogle,
  FaLink,
  FaLock,
  FaMailBulk,
  FaUser,
} from "react-icons/fa";
import Checkbox from "@components/checkbox/checkbox";

import { useFormValidation } from "@/hooks/useFormValidation";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { SignUpProps } from "@/types/signup-props";
import { signUp } from "@/services/authService";
import { UserData } from "@/types/types";
import VerificationModal from "@components/modals/verification-modal";
import SuccessModal from "@components/modals/succes-modal";
import { useModal } from "@/contexts/modal-context";
import UnSuccessModal from "@components/modals/unsucces-modal";
import { EyeSlashFilledIcon } from "@components/images/eye-slash-icon";
import { EyeFilledIcon } from "@components/images/eye-filled";
import { usePathname, useRouter } from "next/navigation";
import { CustomButton } from "@components/buttons/custom-button";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FormField } from "@components/forms/form-field";

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

  const renderSocialButtons = () => (
    <div className="flex justify-center gap-4 w-full">
      <CustomButton
        variant="bordered"
        className="w-full bg-white/90 dark:bg-zinc-800/90 hover:bg-zinc-100 dark:hover:bg-zinc-700 backdrop-blur-sm transition-all"
        color="primary"
        onClick={() => handleSocialSignUp('google')}
        startContent={
          <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
            <FaGoogle className="text-lg text-[#4285F4] dark:text-[#669df6]" />
          </div>
        }
      >
        <span className="text-zinc-700 dark:text-zinc-200 text-sm xxs:text-medium font-medium">
          Continuar con Google
        </span>
      </CustomButton>
    </div>
  );

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-2xl bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-md relative overflow-hidden bg-opacity-70 dark:bg-opacity-70"
    >

      <div className="flex flex-col items-center gap-4 mb-8 relative z-10">
        <Image
          alt="Company Logo"
          className="w-32 h-auto transition-transform hover:scale-105"
          src="/logo.png"
          width={128}
          height={128}
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Crea tu cuenta
        </h1>
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        <form
          className="gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FormField label="Nombre completo" error={errors.fullName} className="my-4">
              <Input
                startContent={<FaUser className="h-5 w-5 text-default-400" />}
                placeholder="Nombre completo"
                className="group rounded-xl dark:bg-zinc-800 bg-zinc-50"
                classNames={{
                  input: "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700"
                }}
                value={formData.fullName}
                onValueChange={(value) => handleInputChange("fullName", value)}
              />
            </FormField>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FormField label="Correo electrónico" error={errors.email} className="my-4">
              <Input
                startContent={<FaMailBulk className="h-5 w-5 text-default-400" />}
                placeholder="you@example.com"
                className="group rounded-xl dark:bg-zinc-800 bg-zinc-50"
                classNames={{
                  input: "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700"
                }}
                value={formData.email}
                onValueChange={(value) => handleInputChange("email", value)}
              />
            </FormField>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FormField label="Contraseña" error={errors.password} className="my-4">
              <Input
                startContent={<FaLock className="h-5 w-5 text-default-400" />}
                placeholder="••••••••"
                type={isVisibleP ? "text" : "password"}
                endContent={
                  <button onClick={toggleVisibilityP} className="p-1">
                    {isVisibleP ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400" />
                    )}
                  </button>
                }
                className="group rounded-xl dark:bg-zinc-800 bg-zinc-50"
                classNames={{
                  input: "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700"
                }}
                value={formData.password}
                onValueChange={(value) => handleInputChange("password", value)}
              />
            </FormField>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FormField label="Confirmar contraseña" error={errors.confirmPassword} className="my-4">
              <Input
                startContent={<FaLock className="h-5 w-5 text-default-400" />}
                placeholder="••••••••"
                type={isVisibleCP ? "text" : "password"}
                endContent={
                  <button onClick={toggleVisibilityCP} className="p-1">
                    {isVisibleCP ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400" />
                    )}
                  </button>
                }
                className="group rounded-xl dark:bg-zinc-800 bg-zinc-50"
                classNames={{
                  input: "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700"
                }}
                value={formData.confirmPassword}
                onValueChange={(value) => handleInputChange("confirmPassword", value)}
              />
            </FormField>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Checkbox
              className={`w-max text-xs sm:text-sm ${errors.acceptTerms ? "text-danger" : ""
                }`}
              checked={formData.acceptTerms}
              onChange={(value) => handleInputChange("acceptTerms", value)}
              label="Acepto términos y condiciones"
            ></Checkbox>
          </motion.div>
          {errors.acceptTerms && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-danger text-xs"
            >
              {errors.acceptTerms}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link className="text-xs select-none cursor-pointer mt-4">
              <FaLink className="mx-1"></FaLink>
              Terminos y condiciones
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="my-4"
          >
            <Button
              fullWidth
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all mt-4"
              isLoading={isLoading}
              variant="solid"
            >
              {isLoading ? "Creando cuenta..." : "Registrarse ahora"}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-center text-xs">
              <div className="flex flex-row mb-4 w-full items-center justify-center text-center">
                <hr className="w-full" />
                <p className="text-medium mx-2">O</p>
                <hr className="w-full" />
              </div>
              {renderSocialButtons()}
            </div>
          </motion.div>
        </form>
      </div>
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
          setIsAuthorizationInProgress(false);

          router.replace(pathname, { scroll: false });
        }}
      />
      <UnSuccessModal
        isOpen={UnSuccessModalOpen}
        onClose={(val: boolean) => setUnSuccessModalOpen(val)}
        message={submitError}
      />
    </motion.div>
  );
}
