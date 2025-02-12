import { signIn, SessionProvider, getSession } from "next-auth/react";

// Verificar cada 30 segundos (ajustable)
const CHECK_INTERVAL = 59 * 1000;

export const startTokenAutoRefresh = () => {
  if (typeof window === 'undefined') return () => { };

  let checkTimer: NodeJS.Timeout;

  const checkToken = async () => {
    const session = await getSession();

    if (!session?.accessTokenExpires) return;

    // Calcular tiempo restante en minutos
    const expires = new Date(session.accessTokenExpires).getTime();
    const timeRemaining = expires - Date.now();

    if (timeRemaining < 300000) {
      console.log('Renovando token automáticamente...');
      await signIn('credentials', {
        redirect: false,
        callbackUrl: window.location.href
      });
    }
  };

  // Iniciar verificación periódica
  const startChecking = () => {
    checkTimer = setInterval(checkToken, CHECK_INTERVAL);

    // Verificación adicional cuando la pestaña gana foco
    window.addEventListener('focus', checkToken);
  };

  // Limpiar al desmontar
  const stopChecking = () => {
    clearInterval(checkTimer);
    window.removeEventListener('focus', checkToken);
  };

  // Controlar pestañas inactivas
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      startChecking();
    } else {
      stopChecking();
    }
  });

  startChecking();
  return stopChecking;
}; 