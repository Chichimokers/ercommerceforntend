"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button, Input, addToast, Checkbox } from "@heroui/react";
import Image from "next/image";
import { FaGoogle, FaLock, FaMailBulk, FaUser } from "react-icons/fa";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signUp } from "@/services/authService";
import { UserData } from "@/types/types";
import VerificationModal from "@components/modals/verification-modal";
import { useModal } from "@/contexts/modal-context";
import { EyeSlashFilledIcon } from "@components/images/eye-slash-icon";
import { EyeFilledIcon } from "@components/images/eye-filled";
import { usePathname, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormField } from "@components/forms/form-field";
import { TermsModal } from "@components/modals/terms-modal";
import Link from "next/link";
import { PrivacyPolicyModal } from "@components/modals/privacy-policy-modal";

const useDeviceCapabilities = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const hasLimitedCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    // Comprobar conexión lenta
    const hasSlowConnection =
      'connection' in navigator &&
      // @ts-ignore - Algunas propiedades de navigator.connection no están en TypeScript
      (navigator.connection?.saveData ||
        // @ts-ignore
        ['slow-2g', '2g', '3g'].includes(navigator.connection?.effectiveType));

    setIsLowPerformance(prefersReducedMotion || hasSlowConnection || (isMobileDevice && hasLimitedCPU));
  }, []);

  return { isLowPerformance };
};

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default function SignUp() {
  const { isLowPerformance } = useDeviceCapabilities();
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
  const [isVisibleCP, setIsVisibleCP] = useState(false);
  const router = useRouter();

  const toggleVisibilityP = useCallback(() => setIsVisibleP(prev => !prev), []);
  const toggleVisibilityCP = useCallback(() => setIsVisibleCP(prev => !prev), []);

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

  const handleInputChange = useCallback((
    field: keyof FormData,
    value: string | boolean
  ) => {
    handleChange(field, value);
  }, [handleChange]);

  // Submit handler optimizado
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, setIsLoading, setData, openVerify]);

  const handleSocialSignUp = useCallback(async (provider: "google" | "facebook") => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        redirect: false,
        callbackUrl: "/"
      });
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      addToast({
        title: "Error de autenticación",
        description: `No se pudo iniciar sesión con ${provider}`,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  const getAnimationClass = useCallback((baseClass: string, animClass: string) => {
    return isLowPerformance ? baseClass : `${baseClass} ${animClass}`;
  }, [isLowPerformance]);

  const handleVerificationSuccess = useCallback(() => {
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
  }, [closeVerify, router]);

  return (
    <div className={getAnimationClass("w-full p-5 sm:p-8", "animate-fadeIn")}>
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className={getAnimationClass(
          "relative w-20 h-20 mb-2",
          "animate-scaleIn"
        )}>
          <Image
            src="/logo.png"
            fill
            alt="EsAki Logo"
            className="object-contain"
            loading="eager"
            priority={true}
          />
        </div>
        <div className={getAnimationClass("text-center", "animate-fadeInDown")}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
            Crea tu cuenta
          </h1>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
            Únete a nuestra plataforma para acceder a todos los servicios
          </p>
        </div>
      </div>

      {submitError && (
        <div className={getAnimationClass(
          "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm",
          "animate-slideDown"
        )}>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {submitError}
          </div>
        </div>
      )}

      <form
        className={getAnimationClass("space-y-5", "animate-fadeIn")}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={getAnimationClass("", "animate-fadeInUp delay-100")}>
          <FormField label="Nombre completo" error={errors.fullName} className="mb-4">
            <Input
              startContent={<FaUser className="h-5 w-5 text-gray-500 flex-shrink-0" />}
              placeholder="John Doe"
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.fullName}
              onValueChange={(value) => handleInputChange("fullName", value)}
              autoComplete="name"
              size="lg"
              isInvalid={!!errors.fullName}
              aria-label="Nombre completo"
            />
          </FormField>
        </div>

        <div className={getAnimationClass("", "animate-fadeInUp delay-200")}>
          <FormField label="Correo electrónico" error={errors.email} className="mb-4">
            <Input
              startContent={<FaMailBulk className="h-5 w-5 text-gray-500 flex-shrink-0" />}
              placeholder="tu@email.com"
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.email}
              onValueChange={(value) => handleInputChange("email", value)}
              autoComplete="email"
              size="lg"
              isInvalid={!!errors.email}
              inputMode="email"
              aria-label="Correo electrónico"
            />
          </FormField>
        </div>

        <div className={getAnimationClass("", "animate-fadeInUp delay-300")}>
          <FormField label="Contraseña" error={errors.password} className="mb-4">
            <Input
              startContent={<FaLock className="h-5 w-5 text-gray-500 flex-shrink-0" />}
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
              aria-label="Contraseña"
            />
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              Mínimo 8 caracteres, con al menos una mayúscula y un número
            </p>
          </FormField>
        </div>

        <div className={getAnimationClass("", "animate-fadeInUp delay-400")}>
          <FormField label="Confirmar contraseña" error={errors.confirmPassword} className="mb-4">
            <Input
              startContent={<FaLock className="h-5 w-5 text-gray-500 flex-shrink-0" />}
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
              aria-label="Confirmar contraseña"
            />
          </FormField>
        </div>

        <div className={getAnimationClass("mb-6", "animate-fadeInUp delay-500")}>
          <div className={`flex items-center ${errors.acceptTerms ? "pb-5" : ""}`}>
            <Checkbox
              isSelected={formData.acceptTerms}
              onValueChange={(value) => handleInputChange("acceptTerms", value)}
              color="primary"
              className={errors.acceptTerms ? "text-danger" : ""}
              size="sm"
              aria-label="Aceptar términos y condiciones"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Acepto los <TermsModal /> y la <PrivacyPolicyModal />
            </span>
          </div>
          {errors.acceptTerms && (
            <p className="text-danger text-xs -mt-4">
              {errors.acceptTerms}
            </p>
          )}
        </div>

        <div className={getAnimationClass("", "animate-fadeInUp delay-600")}>
          <Button
            fullWidth
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            isLoading={isLoading}
            size="lg"
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </div>

        <div className={getAnimationClass("flex items-center my-6", "animate-fadeInUp delay-700")}>
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">O regístrate con</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        </div>

        <div className={getAnimationClass("", "animate-fadeInUp delay-800")}>
          <Button
            fullWidth
            variant="bordered"
            className="bg-white dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            onClick={() => handleSocialSignUp("google")}
            startContent={<FaGoogle className="text-lg text-red-500 mr-2" />}
            isDisabled={isLoading}
            size="lg"
            type="button"
          >
            Continuar con Google
          </Button>
        </div>

        <div
          className={getAnimationClass("text-center mt-8 text-sm text-gray-600 dark:text-gray-400", "animate-fadeInUp delay-900")}
        >
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Inicia sesión
          </Link>
        </div>
      </form>

      <VerificationModal
        isOpen={isVerifyOpen}
        onClose={closeVerify}
        onVerifyCode={handleVerificationSuccess}
        userData={data}
      />
    </div>
  );
}
