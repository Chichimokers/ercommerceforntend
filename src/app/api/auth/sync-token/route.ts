import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createAccessTokenCookie } from '@/helpers/cookie-handler';

export async function GET(request: NextRequest) {
  try {
    console.log("⚙️ Inicio de sincronización de token");

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("🔍 Token obtenido:", token ? "Sí" : "No");
    console.log(token)

    if (!token || !token.access_token) {
      console.error("❌ No hay token disponible para sincronizar");
      return NextResponse.json(
        { error: 'No token available' },
        { status: 401 }
      );
    }

    console.log("💾 Guardando access_token en cookie");
    createAccessTokenCookie(
      token.access_token as string,
      token.accessTokenExpires as number,
      token.user?.role as string
    );

    console.log("✅ Token sincronizado exitosamente");
    return NextResponse.json({
      success: true,
      tokenInfo: {
        expires: token.accessTokenExpires
          ? new Date(token.accessTokenExpires).toISOString()
          : null
      }
    });
  } catch (error) {
    console.error("❌ Error en sincronización:", error);
    return NextResponse.json(
      { error: 'Failed to synchronize token' },
      { status: 500 }
    );
  }
}