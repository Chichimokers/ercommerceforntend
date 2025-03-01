'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const GoogleCallbackHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    // Lógica de autenticación con el código
    router.push('/dashboard');
  }, [searchParams, router]);

  return null; // O un spinner de carga
};

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Verificando autenticación...</div>}>
      <GoogleCallbackHandler />
    </Suspense>
  );
} 