import { authProvider } from "@providers/auth-provider";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { authenticated } = await authProvider.check();

  // Verificar si existe la sesión del usuario
  const isAuthenticated = request.cookies.get("session");
  // Verificar si el carrito tiene items
  const hasCartItems = request.cookies.get("cartItems");
  // Verificar si el email está validado
  const isEmailValidated = request.cookies.get("emailValidated");

  // Si intenta acceder a /buy sin cumplir los requisitos
  /*if (request.nextUrl.pathname === "/buy") {
    if (!isAuthenticated || !hasCartItems || !isEmailValidated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }*/

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!authenticated) {
      return NextResponse.redirect(
        new URL(`/login?to=${request.nextUrl.pathname}`, request.url)
      );
    }
  }

  if (authenticated && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/buy",
};
