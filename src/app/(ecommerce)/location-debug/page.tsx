"use client";

import { useState, useEffect } from 'react';
import { useLocationStore } from '@/store/location/location-store';
import { LocationReset } from '@store/location/location-reset';

export default function LocationDebug() {
  const [cookieData, setCookieData] = useState<string | null>(null);
  const { location, hasLocation } = useLocationStore();

  useEffect(() => {
    // Leer la cookie directamente
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    try {
      const rawCookie = getCookieValue('user-location-storage');
      setCookieData(rawCookie ? JSON.parse(decodeURIComponent(rawCookie)) : null);
    } catch (e) {
      console.error('Error parsing location cookie:', e);
      setCookieData(null);
    }
  }, [location]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="flex flex-col justify-center items-center right-4 bg-white dark:bg-gray-800 p-4 rounded z-50 text-xs overflow-auto">
      <h4 className="font-bold mb-2">Depuración de Ubicación</h4>
      <div>
        <p><strong>hasLocation:</strong> {String(hasLocation)}</p>
        <p><strong>Provincia:</strong> "{location?.province || 'No definida'}"</p>
        <p><strong>Municipio:</strong> "{location?.municipality || 'No definido'}"</p>
        <hr className="my-2" />
        <p><strong>Cookie:</strong></p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(cookieData, null, 2)}
        </pre>
      </div>
      <LocationReset />
    </div>
  );
}