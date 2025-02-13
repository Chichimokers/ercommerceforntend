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
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              body: JSON.stringify(credentials),
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Authentication failed');
          }

          const { access_token } = await res.json();
          const payload = await decodeJWT(access_token);

          return {
            id: payload.sub,
            name: payload.username,
            email: credentials?.email,
            access_token: access_token,
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
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user, account, credentials }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/${account.provider}`,
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
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
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
