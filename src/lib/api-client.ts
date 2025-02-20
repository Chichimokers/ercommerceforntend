import axios from 'axios';
import { getSession, signOut } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      try {
        console.log('Estoy trabajando');
        originalRequest._retry = true;
        const session = await getSession();

        // Forzar actualización del token
        const newSession = await apiClient.post('/auth/refresh-token', {
          refresh_token: session?.refresh_token
        });

        // Actualizar sesión de NextAuth
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: newSession.data.access_token,
            refresh_token: newSession.data.refresh_token
          })
        });

        // Reintentar solicitud original
        originalRequest.headers.Authorization = `Bearer ${newSession.data.access_token}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('Error renovando token:', refreshError);
        await signOut({ redirect: false });
        window.location.href = '/?modal=login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 