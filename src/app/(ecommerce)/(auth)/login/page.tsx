"use client";

import React, { useState } from "react";
import { Input, Link, Button, addToast } from "@heroui/react";
import { FaGoogle, FaLock, FaMailBulk } from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";
import { useFormValidation } from "@/hooks/useFormValidation";
import { signIn } from "next-auth/react";
import { EyeSlashFilledIcon } from "@components/images/eye-slash-icon";
import { EyeFilledIcon } from "@components/images/eye-filled";
import { CustomButton } from "@components/buttons/custom-button";
import { useRouter } from "next/navigation";
import { FormField } from "@components/forms/form-field";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const validationRules = {
    email: { required: true, pattern: /\S+@gmail.com+/ },
    password: { required: true, minLength: 6 },
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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      addToast({ title: "Sesión iniciada", description: "Has ingresado correctamente", color: "success" });
      router.push("/");
    } catch (error) {
      addToast({ title: "Error de autenticación", description: "Credenciales incorrectas", color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignin = async (provider: "google" | "facebook") => {
    try {
      setIsLoading(true);
      await signIn(provider, {
        redirect: false,
        callbackUrl: "/"
      });
    } catch (error) {
      addToast({ title: "Error de autenticación", description: "Credenciales incorrectas", color: "danger" });
      console.error(`${provider} login failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full p-8 rounded-2xl shadow-md"
    >
      <div className="flex flex-col items-center gap-4 mb-6">
        <Image src="/logo.png" width={100} height={100} alt="Logo" className="rounded-lg" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bienvenido de vuelta</h1>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <FormField label="Correo Electrónico" error={errors.email} className="mb-4">
          <Input
            startContent={<FaMailBulk className="h-5 w-5 text-gray-500" />}
            placeholder="you@example.com"
            className="rounded-lg dark:bg-gray-800 bg-gray-50"
            value={formData.email}
            onValueChange={(value) => handleChange("email", value)}
          />
        </FormField>

        <FormField label="Contraseña" error={errors.password}>
          <Input
            startContent={<FaLock className="h-5 w-5 text-gray-500" />}
            placeholder="••••••••"
            type={isVisible ? "text" : "password"}
            endContent={
              <button type="button" onClick={toggleVisibility} className="p-1">
                {isVisible ? <EyeSlashFilledIcon className="text-2xl text-gray-500" /> : <EyeFilledIcon className="text-2xl text-gray-500" />}
              </button>
            }
            className="rounded-lg dark:bg-gray-800 bg-gray-50"
            value={formData.password}
            onValueChange={(value) => handleChange("password", value)}
          />
        </FormField>

        <div className="text-center my-4">
          <Link href="#" className="text-blue-500 text-sm hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            fullWidth
            type="submit"
            className="bg-blue-700 text-white font-medium py-2 rounded-lg shadow-lg"
            isLoading={isLoading}
          >
            {isLoading ? "Ingresando..." : "Iniciar sesión"}
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
          onClick={() => handleSocialSignin("google")}
          startContent={<FaGoogle className="text-lg text-red-500" />}
        >
          <span className="text-gray-800 dark:text-gray-200">Continuar con Google</span>
        </CustomButton>
      </form>
    </motion.div>
  );
}
