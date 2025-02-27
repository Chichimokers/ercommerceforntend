'use client';

import { useEffect } from "react";
import { signOut, getSession } from "next-auth/react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.error || session?.expired) {
        await signOut({ redirect: false });
        window.location.href = '/login';
      }
    };

    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
} 