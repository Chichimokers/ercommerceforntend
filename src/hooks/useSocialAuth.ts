'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useSocialAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Guardar tokens en localStorage
      if (session.accessToken) {
        localStorage.setItem('accessToken', session.accessToken);
        localStorage.setItem('refreshToken', session.refreshToken || '');
      }

      // Redirigir después de login exitoso
      router.push('/');
    }
  }, [status, session, router]);

  return { session, status };
} 