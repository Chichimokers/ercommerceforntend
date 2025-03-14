"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function DebugAuth() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    // Obtener cookies para mostrar
    const allCookies = document.cookie.split(';').map(c => c.trim());
    setCookies(allCookies);
  }, []);

  const testSyncRoute = async () => {
    try {
      setTestResult("Probando sincronización...");
      const res = await fetch('/api/auth/sync-token');
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Autenticación</h1>

      <div className="mb-6 p-4 rounded">
        <h2 className="font-bold mb-2">Estado de sesión:</h2>
        <pre className="whitespace-pre-wrap p-2 rounded border">
          {status === "loading"
            ? "Cargando..."
            : JSON.stringify({ status, user: session?.user, expires: session?.expires }, null, 2)
          }
        </pre>
      </div>

      <div className="mb-6 p-4 rounded">
        <h2 className="font-bold mb-2">Cookies actuales:</h2>
        <ul className="p-2 rounded border">
          {cookies.map((cookie, i) => (
            <li key={i}>{cookie}</li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <button
          onClick={testSyncRoute}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          Probar ruta de sincronización
        </button>

        {testResult && (
          <div className="mt-2 p-2 rounded">
            <pre>{testResult}</pre>
          </div>
        )}
      </div>

      <div className="mt-4">
        <a
          href="/admin"
          className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 mr-2 inline-block"
        >
          Probar acceso admin
        </a>

        <a
          href="/"
          className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-400 inline-block"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}