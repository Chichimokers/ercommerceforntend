"use client";

import React, { useState } from "react";
import {
  Input,
  Link,
  Button,
} from "@heroui/react";
import { FaGoogle, FaLock, FaMailBulk } from "react-icons/fa";
import Image from "next/image";

import { useFormValidation } from "@/hooks/useFormValidation";
import { LoginProps } from "@/types/login-props";
import { signIn, useSession } from "next-auth/react";
import UnSuccessModal from "@components/modals/unsucces-modal";
import SuccessModal from "@components/modals/succes-modal";
import { useModal } from "@/contexts/modal-context";
import { EyeSlashFilledIcon } from "@components/images/eye-slash-icon";
import { EyeFilledIcon } from "@components/images/eye-filled";
import { CustomButton } from "@components/buttons/custom-button";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {

  const validationRules = {
    email: {
      required: true,
      pattern: /\S+@gmail.com+/,
    },
    password: {
      required: true,
      minLength: 6,
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
  const [SubmitError, setSubmitError] = useState("");
  const [SubmitErrorModal, setSubmitErrorModal] = useState(false);
  const [SubmitSuccessModal, setSubmitSuccessModal] = useState(false);
  const { setIsAuthorizationInProgress } = useModal();
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

      if (result?.error) {
        throw new Error(result.error);
      }

      setSubmitSuccessModal(true);
      router.push('/')

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error desconocido");
      setSubmitErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
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
        className="bg-transparent hover:bg-transparent"
        color="danger"
        onClick={() => handleSocialLogin('google')}
      >
        <FaGoogle className="fill-gray-700 dark:fill-gray-100" />
      </CustomButton>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-1">
        <Image
          alt="Company Logo"
          className="w-24 h-auto"
          src="/logo.png"
          width={96}
          height={96}
        />
        <h1>Sign In</h1>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          errorMessage={errors.email}
          isInvalid={!!errors.email}
          label="Correo electrónico"
          labelPlacement="outside"
          placeholder="you@example.com"
          startContent={
            <FaMailBulk className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
          }
          type="email"
          value={formData.email}
          variant="bordered"
          onValueChange={(value) => handleChange("email", value)}
        />

        <Input
          errorMessage={errors.password}
          isInvalid={!!errors.password}
          label="Contraseña"
          labelPlacement="outside"
          placeholder="Ingrese su contraseña"
          startContent={
            <FaLock className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
          }
          value={formData.password}
          variant="bordered"
          onValueChange={(value) => handleChange("password", value)}
          type={isVisible ? "text" : "password"}
          endContent={
            <button
              aria-label="toggle password visibility"
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
        />

        <div className="text-center">
          <Link href="#" className="text-xs">
            ¿Has olvidado tu contraseña?
          </Link>
        </div>

        <div className="text-center text-xs">
          <p className="mb-2 ">O continuar con</p>
          {renderSocialButtons()}
        </div>

        {SubmitErrorModal ? (
          <UnSuccessModal
            isOpen={SubmitErrorModal}
            onClose={(val: boolean) => setSubmitErrorModal(val)}
            message={SubmitError}
          />
        ) : undefined}
      </div>

      <div className="flex flex-col gap-4">
        <Button
          fullWidth
          className="bg-blue-600"
          color="primary"
          isLoading={isLoading}
          variant="solid"
          onPress={handleSubmit}
        >
          {isLoading ? "Logging in..." : "Iniciar sesión"}
        </Button>
        <hr />
        <p className="text-center text-xs w-full">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="text-xs"
          >
            Registrar
          </Link>
        </p>
      </div>
    </div>
  );
}