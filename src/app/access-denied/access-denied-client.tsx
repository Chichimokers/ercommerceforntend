"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AccessDeniedClient() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason");

  const getMessage = () => {
    switch (reason) {
      case "admin_required":
        return "Se requieren permisos de administrador para acceder a esta sección.";
      default:
        return "No tienes permisos suficientes para acceder a este recurso.";
    }
  };

  return (
    <div className="p-5 text-center">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Acceso Denegado
      </h1>

      <div className="flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
        <AlertCircle className="mr-2 h-5 w-5" />
        <span className="font-medium">Error 403</span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {getMessage()}
      </p>

      <div className="flex flex-col space-y-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a inicio
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Iniciar sesión con otra cuenta
        </Link>
      </div>
    </div>
  );
}
