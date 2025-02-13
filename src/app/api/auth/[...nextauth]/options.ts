import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { decodeJWT } from "@/helpers/jwt-decode";

// Añade esta declaración de tipo en la parte superior del archivo
declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string
      email?: string
    }
  }
}

// Añade esta interfaz para el JWT
declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id?: string
      name?: string
      email?: string
    }
  }
}

// Función de renovación mejorada
async function refreshAccessToken(token: any) {
  try {
    console.log('Intentando renovar token de acceso. Refresh token:', token.refreshToken?.slice(0, 5) + '...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Refresh-Token": token.refreshToken
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const data = await response.json();
    console.log('Respuesta de renovación:', { status: response.status, data: { ...data, accessToken: data.accessToken?.slice(0, 15) + '...' } });

    if (!response.ok) throw data;

    const payload = await decodeJWT(data.accessToken);
    console.log('Token renovado exitosamente. Nuevo exp:', new Date(payload.exp * 1000).toLocaleString());

    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpires: payload.exp * 1000,
      refreshToken: data.refreshToken || token.refreshToken,
      user: {
        ...token.user,
        ...payload
      },
      error: undefined,
    };
  } catch (error) {
    console.error("Error en renovación de token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
      accessTokenExpires: Date.now() - 1000
    };
  }
}

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
      console.log('Ejecutando callback JWT', { user: user?.email, accountProvider: account?.provider });

      if (account && user) {
        console.log('Nueva autenticación detectada', {
          provider: account.provider,
          userId: user.id,
          tokenExp: new Date((account.expires_at || 0) * 1000).toLocaleString()
        });
        const finalToken = account.provider === "credentials"
          ? user.access_token
          : account.access_token;

        const payload = await decodeJWT(finalToken!);

        return {
          accessToken: finalToken,
          accessTokenExpires: payload.exp * 1000,
          refreshToken: user.refresh_token || account.refresh_token,
          user: {
            id: payload.sub,
            name: payload.name || user.name,
            email: payload.email || user.email,
            ...payload
          }
        };
      }

      // Modificar la lógica de verificación de expiración
      if (token.accessTokenExpires) {
        console.log('Entre por aqui e hice mierda todo')
        const remainingTime = Math.round(((token.accessTokenExpires as number) - Date.now()) / 1000);
        console.log(`Tiempo restante del token: ${remainingTime}s`);

        // Reducir el margen de renovación anticipada a 45 segundos
        if (remainingTime > 30) {
          console.log('Token aún válido, no se requiere renovación');
          return token;
        }
      }

      // Mejorar el control de concurrencia
      if (!token.isRefreshing) {
        console.log('Iniciando proceso de renovación de token...');
        token.isRefreshing = true;
        const newToken = await refreshAccessToken(token);
        console.log('Renovación completada', { newToken: newToken.accessToken?.slice(0, 15) + '...' });
        return {
          ...newToken,
          isRefreshing: false
        };
      }

      console.log('Renovación ya en progreso, omitiendo solicitud concurrente');
      return token;
    },
    async session({ session, token }) {
      console.log('Actualizando sesión', { user: token.user?.email });
      session.user = {
        id: token.user?.id ?? '',
        name: token.user?.name ?? '',
        email: token.user?.email ?? '',
        ...token.user
      };
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      session.expires = new Date(token.accessTokenExpires as number).toLocaleString();

      return session;
    },
    async signIn({ user, account, credentials }) {
      console.log('Iniciando proceso de signIn', { provider: account?.provider, user: user.email });

      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          console.log(`Registrando usuario social en backend: ${account.provider}`, {
            email: user.email,
            providerId: account.providerAccountId
          });
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
          console.log(`Autenticación social exitosa con ${account.provider}`);
          return true;
        } catch (error) {
          console.error(`Error en autenticación social (${account.provider}):`, error);
          return false;
        }
      } else if (account?.provider === "credentials") {
        console.log('Procesando autenticación con credenciales', { email: credentials?.email });
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
          console.log('Autenticación con credenciales exitosa', { email: credentials?.email });
          return true;
        } catch (error) {
          console.error('Error en autenticación con credenciales:', { error, email: credentials?.email });
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
