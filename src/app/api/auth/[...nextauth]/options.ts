import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJWT } from "@/helpers/jwt-decode";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID as string,
      clientSecret: process.env.FACEBOOK_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
            {
              method: "POST",
              body: JSON.stringify(credentials),
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            console.error('Error en la respuesta:', {
              status: res.status,
              error: errorData,
              credentials: credentials?.email
            });
            throw new Error(errorData.message || 'Falló la autenticación');
          }

          const { access_token, refresh_token } = await res.json();
          const payload = await decodeJWT(access_token);

          return {
            id: payload.sub,
            name: payload.username,
            email: credentials?.email,
            access_token: access_token,
            refresh_token: refresh_token,
          };

        } catch (error) {
          console.error("Error de autenticación:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const logPrefix = `[JWT][${user?.email || 'sin-usuario'}]`;
      console.log(`${logPrefix} Inicio callback. Token actual:`, {
        exp: token.accessTokenExpires ? new Date(Number(token.accessTokenExpires)).toISOString() : 'n/a',
        refresh: String(token.refreshToken)?.slice(-10) || 'n/a',
        isRefreshing: token.isRefreshing
      });

      if (user && account) {
        console.log(`${logPrefix} Nuevo login detectado (${account.provider})`, {
          user_id: user.id,
          token_exp: new Date(Number(token.accessTokenExpires) || Date.now()).toISOString()
        });
      }

      if (token.accessToken && !token.accessTokenExpires) {
        const payload = await decodeJWT(token.accessToken);
        token.accessTokenExpires = payload.exp * 1000; // Asegurar milisegundos
        console.log(`${logPrefix} Token inicial. Expira:`, new Date(Number(token.accessTokenExpires)).toISOString());
        console.log('Payload decodificado:', payload);
      }

      const MARGEN_RENOVACION = 30 * 1000; // 2 minutos antes de expirar
      const TIEMPO_MINIMO_RENOVACION = 10 * 1000; // 10 segundos entre renovaciones

      if (Date.now() < Number(token.accessTokenExpires) - MARGEN_RENOVACION
        || (token.lastRenewAttempt && Date.now() - Number(token.lastRenewAttempt) < TIEMPO_MINIMO_RENOVACION)) {
        return token;
      }

      // Rotación de tokens
      if (token.refreshToken) {
        console.log(`${logPrefix} Token expirado. Intentando renovar con refresh token...`);
        try {
          token.isRefreshing = true; // Bloquear nuevas renovaciones

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Refresh-Token": token.refreshToken as string
            },
            body: JSON.stringify({
              refreshToken: token.refreshToken,
              currentAccessToken: token.accessToken // Validar en backend
            }),
          });

          // Agregar logging de diagnóstico
          console.log(`${logPrefix} Estado de respuesta: ${response.status}`);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }

          const { accessToken, refreshToken } = await response.json();
          const payload = await decodeJWT(accessToken);

          console.log(`${logPrefix} Nuevo accessToken expira en:`,
            new Date(Date.now() + (payload.exp * 1000)).toISOString());
          return {
            ...token,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpires: payload.exp * 1000,
            id: payload.sub
          };

        } catch (error) {
          console.error(`${logPrefix} Error renovando token:`, {
            error: error instanceof Error ? error.message : 'Error desconocido',
            stack: error instanceof Error ? error.stack?.split('\n')[0] : undefined
          });
          delete token.isRefreshing; // Liberar bloqueo
          return { ...token, error: "RefreshAccessTokenError" };
        } finally {
          delete token.isRefreshing; // Asegurar liberación del bloqueo
        }
      }

      // Manejo inicial del token
      if (user) {
        const finalToken = account?.provider === "credentials"
          ? user.access_token
          : account?.access_token;

        if (!finalToken) {
          throw new Error('Token de acceso no encontrado');
        }
        const payload = await decodeJWT(finalToken);

        console.log(`${logPrefix} Nuevo token generado para usuario:`, user.email, 'Expiración:', new Date(payload.exp * 1000).toLocaleTimeString());

        return {
          accessToken: finalToken,
          refreshToken: user?.refresh_token,
          accessTokenExpires: payload.exp * 1000,
          id: payload.sub,
          name: user.name,
          email: user.email
        };
      }

      // Añadir verificación de expiración global
      if (token.error === "RefreshAccessTokenError") {
        await fetch('/api/auth/signout', { method: 'POST' }); // Forzar logout en el backend
        return { ...token, expired: true };
      }

      // Si el token está expirado y no se puede renovar
      if (token.accessTokenExpires && Date.now() > Number(token.accessTokenExpires)) {
        return { ...token, error: "TokenExpired" };
      }

      return token;
    },
    async session({ session, token }) {
      console.log(`[Sesión][${session.user?.email}] Actualizando sesión`, {
        token_error: token.error,
        token_exp: token.accessTokenExpires ? new Date(Number(token.accessTokenExpires)).toISOString() : 'n/a'
      });
      // Propagación del estado de expiración
      if (token.error || token.expired) {
        session.error = token.error ? String(token.error) : "SessionExpired";
        session.expired = Boolean(token.expired);
      }
      return session;
    },
    async signIn({ user, account, credentials }) {
      console.log(`[Login][${user.email}] Intento con ${account?.provider}`, {
        provider_id: account?.providerAccountId,
        method: account?.type
      });
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/${account.provider}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                providerId: account.providerAccountId,
              }),
            }
          );

          if (!res.ok) {
            throw new Error(`Failed to log in with ${account.provider}`);
          }

          return true;
        } catch (error) {
          console.error("Error durante el inicio de sesión social:", error);
          return false;
        }
      } else if (account?.provider === "credentials") {
        if (!credentials) {
          throw new Error(`Failed to log in with ${account.provider}`);
        }
        console.log("Credenciales para inicio de sesión:", credentials);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          console.log(
            `email: ${credentials.user}\n
            password: ${credentials.password} 
            `

          )

          if (!response.ok) {
            throw new Error("Failed to log in with credentials");
          }

          return true;
        } catch (error) {
          console.error(
            "Error durante el inicio de sesión con credenciales:",
            error
          );
          return false;
        }
      }

      return true;
    },
  },
  pages: {
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
