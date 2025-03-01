import "next-auth";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    accessTokenExpires?: number;
    refresh_token?: string;
    error?: string;
    expired?: boolean;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    access_token?: string;
    refresh_token?: string;
    exp?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    access_token?: string;
  }
}
