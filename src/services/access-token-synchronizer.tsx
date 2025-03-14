import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AccessTokenSynchronizer({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.access_token && !session?.error) {
      fetch('/api/auth/sync-token')
        .then(res => {
          if (!res.ok) {
            console.warn('Error al sincronizar token de acceso');
          }
        })
        .catch(err => {
          console.error('Error de red al sincronizar token', err);
        });
    }
  }, [session?.access_token, session?.error]);

  return <>{children}</>;
}