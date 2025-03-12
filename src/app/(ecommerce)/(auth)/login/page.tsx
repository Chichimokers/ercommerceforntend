"use client";

import React, { useState } from "react";
import { Input, Link, Button, addToast } from "@heroui/react";
import { FaGoogle, FaLock } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import Image from "next/image";
import { motion } from "framer-motion";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signIn } from "next-auth/react";
import { EyeSlashFilledIcon } from "@components/images/eye-slash-icon";
import { EyeFilledIcon } from "@components/images/eye-filled";
import { useRouter } from "next/navigation";
import { FormField } from "@components/forms/form-field";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  // Validación mejorada: acepta cualquier email válido, no solo gmail
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

  const router = useRouter();
  const {
    formData,
    errors,
    isLoading,
    setIsLoading,
    handleChange,
    validateForm,
  } = useFormValidation<FormData>({ email: "", password: "" }, validationRules);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setAuthError(null);
    if (!validateForm()) return;

    try {
      setIsLoading(true);
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
      router.push("/");
    } catch (error) {
      console.error("Error de autenticación:", error);
      // No mostramos toast aquí ya que mostramos un mensaje de error en el formulario
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignin = async (provider: "google" | "facebook") => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        callbackUrl: "/"
      });
    } catch (error) {
      addToast({
        title: "Error de autenticación",
        description: `No se pudo iniciar sesión con ${provider === "google" ? "Google" : "Facebook"}`,
        color: "danger"
      });
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
      className="w-full p-6 sm:p-8"
    >
      <div className="flex flex-col items-center gap-4 mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <div className="relative w-20 h-20 mb-2">
            <Image
              src="/logo.png"
              fill
              sizes="(max-width: 768px) 80px, 100px"
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
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300 text-center">
            Bienvenido de vuelta
          </h1>
          <p className="text-center mt-2 text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
            Accede a tu cuenta para gestionar tus pedidos y envíos
          </p>
        </motion.div>
      </div>

      {authError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {authError}
          </div>
        </motion.div>
      )}

      <motion.form
        variants={formVariants}
        initial="hidden"
        animate="visible"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <motion.div variants={itemVariants}>
          <FormField label="Correo Electrónico" error={errors.email} className="mb-5">
            <Input
              startContent={<MdOutlineEmail className="h-5 w-5 text-gray-500" />}
              placeholder="tu@email.com"
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.email}
              onValueChange={(value) => handleChange("email", value)}
              autoComplete="email"
              size="lg"
              aria-label="Email"
              isInvalid={!!errors.email}
            />
          </FormField>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormField label="Contraseña" error={errors.password} className="mb-2">
            <Input
              startContent={<FaLock className="h-5 w-5 text-gray-500" />}
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
              className="rounded-xl border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
              value={formData.password}
              onValueChange={(value) => handleChange("password", value)}
              autoComplete="current-password"
              size="lg"
              aria-label="Password"
              isInvalid={!!errors.password}
            />
          </FormField>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end mb-6">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            fullWidth
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            isLoading={isLoading}
            size="lg"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center my-6">
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">O continúa con</span>
          <hr className="flex-1 border-gray-300 dark:border-gray-700" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            fullWidth
            variant="bordered"
            className="bg-white dark:bg-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            onClick={() => handleSocialSignin("google")}
            startContent={<FaGoogle className="text-lg text-red-500 mr-2" />}
            isDisabled={isLoading}
            size="lg"
          >
            Acceder con Google
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400"
        >
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Regístrate ahora
          </Link>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
