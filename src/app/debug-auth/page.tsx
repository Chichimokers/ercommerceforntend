"use client";

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function DebugAuth() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<string>('');
  const [serverCookies, setServerCookies] = useState<any[]>([]);

  useEffect(() => {
    setCookies(document.cookie.split(';').map(c => c.trim()));
  }, []);

  const handleSyncToken = async () => {
    try {
      setSyncResult('Sincronizando...');
      const res = await fetch('/api/auth/sync-token');
      const data = await res.json();
      setSyncResult(JSON.stringify(data, null, 2));

      // Actualizar lista de cookies
      setCookies(document.cookie.split(';').map(c => c.trim()));
    } catch (error) {
      setSyncResult('Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico de Autenticación</h1>

      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-lg font-medium mb-2">Estado de sesión</h2>
        <div className="p-3 rounded overflow-auto max-h-60">
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-lg font-medium mb-2">Cookies actuales</h2>
        <ul className="list-disc pl-5 p-3 rounded">
          {cookies.length === 0 ? (
            <li className="text-red-500">No hay cookies</li>
          ) : (
            cookies.map((cookie, i) => <li key={i}>{cookie}</li>)
          )}
        </ul>
      </div>

      <div className="mb-6 p-4 rounded-lg border">
        <h2 className="text-lg font-medium mb-2">Cookies en el servidor (incluyendo HttpOnly)</h2>
        {serverCookies.length === 0 ? (
          <p className="text-red-500 p-3">Cargando cookies del servidor...</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Nombre</th>
                <th className="text-left">Valor</th>
                <th className="text-left">HttpOnly</th>
                <th className="text-left">Path</th>
              </tr>
            </thead>
            <tbody>
              {serverCookies.map((cookie, i) => (
                <tr key={i} className={i % 2 === 0 ? "" : ""}>
                  <td className="p-2">{cookie.name}</td>
                  <td className="p-2">{cookie.value}</td>
                  <td className="p-2">{cookie.httpOnly ? "Sí" : "No"}</td>
                  <td className="p-2">{cookie.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleSyncToken}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Forzar sincronización de token
        </button>

        {status === 'authenticated' ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Cerrar sesión
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Iniciar sesión
          </button>
        )}
      </div>

      {syncResult && (
        <div className="p-4 rounded-lg border">
          <h3 className="font-medium mb-2">Resultado de sincronización:</h3>
          <pre className="p-3 rounded overflow-auto max-h-40">{syncResult}</pre>
        </div>
      )}
    </div>
  );
}