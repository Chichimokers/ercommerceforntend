'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@heroui/react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiArrowLeft } from 'react-icons/fi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 dark:sm:border-gray-700 sm:pl-6">
              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center">
                  <div className="flex-shrink-0 mx-auto sm:mx-0 mb-4 sm:mb-0 sm:mr-4">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                      <FiAlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight sm:text-5xl">
                      ¡Ups! Algo salió mal
                    </h1>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Estamos trabajando para resolver este problema lo antes posible.
                    </p>

                    {/* Mostrar el mensaje de error si estamos en desarrollo */}
                    {process.env.NODE_ENV === 'development' && error.message && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800">
                        <p className="text-sm text-red-800 dark:text-red-300 font-mono">
                          {error.message}
                        </p>
                        {error.digest && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            ID: {error.digest}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-10 flex justify-center sm:justify-start space-x-3">
                  <Button
                    onClick={() => reset()}
                    color="primary"
                    startContent={<FiRefreshCw className="h-5 w-5" />}
                    className="font-medium"
                  >
                    Intentar de nuevo
                  </Button>

                  <Button
                    as={Link}
                    href="/"
                    variant="bordered"
                    color="default"
                    startContent={<FiHome className="h-5 w-5" />}
                    className="font-medium"
                  >
                    Ir a inicio
                  </Button>

                  <Button
                    onClick={() => window.history.back()}
                    variant="light"
                    startContent={<FiArrowLeft className="h-5 w-5" />}
                    className="font-medium"
                  >
                    Volver atrás
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sugerencias adicionales */}
        <div className="mt-10 max-w-sm mx-auto text-center">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Puedes intentar lo siguiente:
          </h2>
          <ul className="mt-3 text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <li>• Actualizar la página</li>
            <li>• Verificar tu conexión a internet</li>
            <li>• Limpiar la caché del navegador</li>
            <li>• Volver a iniciar sesión</li>
          </ul>

          <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
            Si el problema persiste, por favor contacta a nuestro servicio de soporte.
          </p>
        </div>
      </div>
    </div>
  );
}