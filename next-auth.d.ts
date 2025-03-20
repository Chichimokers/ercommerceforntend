import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
    idToken: string;
    access_token?: string;
    error?: string;
    expires?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
    access_token?: string;
    refresh_token?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}