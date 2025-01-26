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
        console.log("Credenciales recibidas:", credentials);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
            {
              method: "POST",
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (!res.ok) {
            const errorText = await res.text();
            console.error("Error del servidor:", errorText);
            throw new Error(errorText);
          }

          const user = await res.json();
          console.log("Respuesta del servidor:", res);
          console.log("Usuario:", user);
          console.log("Credenciales:", credentials);

          if (res.ok && user) {
            const payload = await decodeJWT(user.access_token);
            console.log("Payload decodificado:", payload);

            return {
              id: payload.sub,
              name: payload.username,
              email: credentials?.email,
              access_token: user.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        console.log("Token y usuario:", { token, user, account });

        if (account?.provider === "credentials" && user.access_token) {
          token.accessToken = user.access_token;
          token.id = user.id;
        } else if (account) {
          token.accessToken = account.access_token;
          token.id = user.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async signIn({ user, account, credentials }) {
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
          throw new Error(`Error de credenciales: ${account.provider}`);
        }
        console.log("Credenciales para inicio de sesión:", credentials);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email.value,
                password: credentials.password.value,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error en credenciales");
          }

          return true;
        } catch (error) {
          console.error(
            "Error en inicio de sesión:",
            error instanceof Error ? error.message : "Error desconocido"
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
