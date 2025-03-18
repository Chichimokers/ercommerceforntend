import React, { Suspense } from "react";
import { Shield } from "lucide-react";
import AccessDeniedClient from "./access-denied-client";

const LoadingFallback = () => (
  <div className="p-5 text-center">
    <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
  </div>
);

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-5 bg-red-600 flex justify-center">
          <Shield className="h-16 w-16 text-white" />
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <AccessDeniedClient />
        </Suspense>
      </div>
    </div>
  );
}
