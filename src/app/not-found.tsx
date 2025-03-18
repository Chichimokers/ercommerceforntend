"use client";

import { Authenticated, ErrorComponent } from "@refinedev/core";
import { Suspense } from "react";

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-500 border-blue-200 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}

function NotFoundContent() {
  return (
    <Authenticated key="not-found" fallback={<UnauthenticatedErrorComponent />}>
      <ErrorComponent />
    </Authenticated>
  );
}

function UnauthenticatedErrorComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Página no encontrada</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          La página que estás buscando no existe o no tienes permisos para acceder a ella.
        </p>
        <div className="flex justify-center">
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
