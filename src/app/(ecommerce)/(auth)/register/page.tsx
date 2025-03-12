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
import Link from "next/link";
import { PrivacyPolicyModal } from "@components/modals/privacy-policy-modal";

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
  const [isVisibleP, setIsVisibleP] = useState(false);
  const toggleVisibilityP = () => setIsVisibleP(!isVisibleP);
  const [isVisibleCP, setIsVisibleCP] = useState(false);
  const toggleVisibilityCP = () => setIsVisibleCP(!isVisibleCP);
  const router = useRouter();
  const pathname = usePathname();

  const validationRules = {
    fullName: {
      required: true,
      minLength: 4,
      message: "Por favor ingresa tu nombre completo (mínimo 4 caracteres)"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Por favor ingresa un correo electrónico válido"
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
      message: "Las contraseñas no coinciden"
    },
    acceptTerms: {
      custom: (value: boolean) =>
        value || "Debes aceptar los términos y condiciones",
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
      setSubmitError(errorMessage);

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

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full p-5 sm:p-8"
    >
      <div className="flex flex-col items-center gap-4 mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <div className="relative w-16 h-16 mb-2">
            <Image
              src="/logo.png"
              fill
              sizes="(max-width: 768px) 64px, 80px"
              alt="EsAki Logo"
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
            Crea tu cuenta
          </h1>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
            Únete a nuestra plataforma para acceder a todos los servicios
          </p>
        </motion.div>
      </div>

      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {submitError}
          </div>
        </motion.div>
      )}

      <motion.form
        variants={formVariants}
        initial="hidden"
        animate="visible"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <motion.div variants={itemVariants}>
          <FormField label="Nombre completo" error={errors.fullName} className="mb-4">
            <Input
              startContent={<FaUser className="h-5 w-5 text-gray-500" />}
              placeholder="John Doe"
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.fullName}
              onValueChange={(value) => handleInputChange("fullName", value)}
              autoComplete="name"
              size="lg"
              isInvalid={!!errors.fullName}
            />
          </FormField>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormField label="Correo electrónico" error={errors.email} className="mb-4">
            <Input
              startContent={<FaMailBulk className="h-5 w-5 text-gray-500" />}
              placeholder="tu@email.com"
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.email}
              onValueChange={(value) => handleInputChange("email", value)}
              autoComplete="email"
              size="lg"
              isInvalid={!!errors.email}
            />
          </FormField>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormField label="Contraseña" error={errors.password} className="mb-4">
            <Input
              startContent={<FaLock className="h-5 w-5 text-gray-500" />}
              placeholder="••••••••"
              type={isVisibleP ? "text" : "password"}
              endContent={
                <button
                  type="button"
                  onClick={toggleVisibilityP}
                  className="focus:outline-none"
                  aria-label={isVisibleP ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {isVisibleP ?
                    <EyeSlashFilledIcon className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" /> :
                    <EyeFilledIcon className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
                  }
                </button>
              }
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.password}
              onValueChange={(value) => handleInputChange("password", value)}
              autoComplete="new-password"
              size="lg"
              isInvalid={!!errors.password}
            />
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Mínimo 8 caracteres, con al menos una mayúscula y un número
            </p>
          </FormField>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormField label="Confirmar contraseña" error={errors.confirmPassword} className="mb-4">
            <Input
              startContent={<FaLock className="h-5 w-5 text-gray-500" />}
              placeholder="••••••••"
              type={isVisibleCP ? "text" : "password"}
              endContent={
                <button
                  type="button"
                  onClick={toggleVisibilityCP}
                  className="focus:outline-none"
                  aria-label={isVisibleCP ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {isVisibleCP ?
                    <EyeSlashFilledIcon className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" /> :
                    <EyeFilledIcon className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
                  }
                </button>
              }
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.confirmPassword}
              onValueChange={(value) => handleInputChange("confirmPassword", value)}
              autoComplete="new-password"
              size="lg"
              isInvalid={!!errors.confirmPassword}
            />
          </FormField>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <div className={`flex items-center ${errors.acceptTerms ? "pb-5" : ""}`}>
            <Checkbox
              isSelected={formData.acceptTerms}
              onValueChange={(value) => handleInputChange("acceptTerms", value)}
              color="primary"
              className={errors.acceptTerms ? "text-danger" : ""}
              size="sm"
            >

            </Checkbox>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Acepto los <TermsModal /> y la <PrivacyPolicyModal />
            </span>
          </div>
          {errors.acceptTerms && (
            <p className="text-danger text-xs -mt-4">
              {errors.acceptTerms}
            </p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            fullWidth
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            isLoading={isLoading}
            size="lg"
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center my-6">
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">O regístrate con</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            fullWidth
            variant="bordered"
            className="bg-white dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            onClick={() => handleSocialSignUp("google")}
            startContent={<FaGoogle className="text-lg text-red-500 mr-2" />}
            isDisabled={isLoading}
            size="lg"
          >
            Continuar con Google
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400"
        >
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Inicia sesión
          </Link>
        </motion.div>
      </motion.form>

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
  );
}
