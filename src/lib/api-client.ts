import axios from 'axios';
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Forzar actualización de sesión
      const session = await getSession();
      if (session) {
        return apiClient.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 