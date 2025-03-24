"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { Input, Button, addToast } from "@heroui/react";
import { OutlineEmailIcon, GoogleIcon } from "@components/icons/icons";
import { Lock } from "lucide-react";
import Image from "next/image";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signIn } from "next-auth/react";
import { EyeSlashFilledIcon } from "@components/images/eye-slash-icon";
import { EyeFilledIcon } from "@components/images/eye-filled";
import { useRouter } from "next/navigation";
import { FormField } from "@components/forms/form-field";
import Link from "next/link";
import { useCartStore } from "@/store/cart/cart-store";

interface FormData {
  email: string;
  password: string;
}

// Componente interno que maneja toda la funcionalidad que usa useSearchParams
function LoginForm() {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('to') || '/';
  const from = searchParams.get('from');

  const router = useRouter();
  const cart = useCartStore(state => state.cart);

  const validationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Por favor, introduce un correo electrónico válido"
    },
    password: {
      required: true,
      minLength: 6,
      message: "La contraseña debe tener al menos 6 caracteres"
    },
  };

  const {
    formData,
    errors,
    isLoading,
    setIsLoading,
    handleChange,
    validateForm,
  } = useFormValidation<FormData>({ email: "", password: "" }, validationRules);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = useCallback(() => setIsVisible(prev => !prev), []);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Efectos con useSearchParams
  useEffect(() => {
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl');

    if (error) {
      addToast({
        title: "Error de autenticación",
        description: "No se pudo iniciar sesión",
        color: "danger"
      });
    } else if (callbackUrl) {
      const timer = setTimeout(() => {
        router.push(callbackUrl);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (from === 'protected') {
      addToast({
        title: "Acceso restringido",
        description: "Inicia sesión para acceder a esta página",
        color: "warning"
      });
    }
  }, [from]);

  const handleSubmit = useCallback(async () => {
    setAuthError(null);
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setHasInteracted(true);

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setAuthError("Las credenciales proporcionadas no son correctas");
        throw new Error(result.error);
      }

      addToast({
        title: "¡Bienvenido de vuelta!",
        description: "Has iniciado sesión correctamente",
        color: "success"
      });

      if (redirectTo.startsWith('/checkout') && (!cart || cart.length === 0)) {
        addToast({
          title: "Carrito vacío",
          description: "Añade productos al carrito para realizar el checkout",
          color: "warning"
        });
        router.push('/products');
      } else {
        router.push(redirectTo);
      }

    } catch (error) {
      console.error("Error de autenticación:", error);
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, formData.password, validateForm, router, redirectTo, cart]);

  const handleSocialSignin = useCallback(async (provider: "google" | "facebook") => {
    try {
      setIsLoading(true);
      setHasInteracted(true);

      await signIn(provider, {
        callbackUrl: redirectTo
      });
    } catch (error) {
      addToast({
        title: "Error de autenticación",
        description: `No se pudo iniciar sesión con ${provider === "google" ? "Google" : "Facebook"}`,
        color: "danger"
      });
    } finally {
      setIsLoading(false);
    }
  }, [redirectTo]);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  }, [handleSubmit]);

  return (
    <form
      className={"space-y-5"}
      onSubmit={onSubmit}
    >
      {authError && (
        <div className={
          "mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
        }>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {authError}
          </div>
        </div>
      )}

      <div>
        <FormField label="Correo Electrónico" error={errors.email} className="mb-5">
          <Input
            startContent={
              <OutlineEmailIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            }
            placeholder="tu@email.com"
            className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70"
            value={formData.email}
            onValueChange={(value) => handleChange("email", value)}
            autoComplete="email"
            size="lg"
            aria-label="Email"
            isInvalid={!!errors.email}
            inputMode="email"
            enterKeyHint="next"
          />
        </FormField>
      </div>

      {/* Resto de los campos del formulario... */}
      <div>
        <FormField label="Contraseña" error={errors.password} className="mb-2">
          <Input
            startContent={
              <Lock className="h-5 w-5 text-gray-500 flex-shrink-0" />
            }
            placeholder="••••••••"
            type={isVisible ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={toggleVisibility}
                className="focus:outline-none"
                aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {isVisible ?
                  <EyeSlashFilledIcon className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" /> :
                  <EyeFilledIcon className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
                }
              </button>
            }
            className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70"
            value={formData.password}
            onValueChange={(value) => handleChange("password", value)}
            autoComplete="current-password"
            size="lg"
            aria-label="Password"
            isInvalid={!!errors.password}
            enterKeyHint="go"
          />
        </FormField>
      </div>

      <div className={"flex justify-end"}>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div className={"pt-1"}>
        <Button
          fullWidth
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          isLoading={isLoading}
          size="lg"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>

      {/* Divider */}
      <div className={"flex items-center my-6"}>
        <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">O continúa con</span>
        <hr className="flex-1 border-gray-300 dark:border-gray-700" />
      </div>

      <div>
        <Button
          fullWidth
          variant="bordered"
          className="bg-white dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200"
          onClick={() => handleSocialSignin("google")}
          startContent={<GoogleIcon className="text-lg text-red-500 mr-2" />}
          isDisabled={isLoading}
          size="lg"
          type="button"
        >
          Acceder con Google
        </Button>
      </div>

      <div className={"text-center mt-8 text-sm text-gray-600 dark:text-gray-400"}>
        ¿No tienes una cuenta?{" "}
        <Link
          href="/register"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Regístrate ahora
        </Link>
      </div>
    </form>
  );
}

// Componente principal que no usa useSearchParams
export default function Login() {
  return (
    <div className="w-full p-6 sm:p-8">
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="relative w-20 h-20 mb-2">
          <Image
            src="/logo.png"
            fill
            alt="EsAki Logo"
            className="object-contain"
            loading="eager"
            priority={true}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
            Bienvenido de vuelta
          </h1>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
            Accede a tu cuenta para gestionar tus pedidos y envíos
          </p>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-5 animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mt-6"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mt-10"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

