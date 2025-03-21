import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentMethod } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Se requiere orderId' }, { status: 400 });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      throw new Error('URL de API no configurada');
    }

    let url = `${API_URL}visa-mastercard/create-payment`;
    if (paymentMethod === 'paypal') {
      url = `${API_URL}paypal/create-payment`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.access_token || token}`
      },
      body: JSON.stringify({
        "id": orderId,
      }),
      credentials: 'include',
      signal: controller.signal,
      redirect: 'manual'
    });

    clearTimeout(timeoutId);

    if (response.status === 302 || response.status === 303 || response.status === 307) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        return NextResponse.json(
          {
            success: true,
            redirectUrl,
            message: `Pago con método ${paymentMethod} procesado correctamente`
          },
          { status: 200 }
        );
      }
    }

    try {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el servicio de pagos');
      }

      return NextResponse.json({
        success: true,
        data,
        message: `Pago con método ${paymentMethod} procesado correctamente`
      });
    } catch (error) {
      const text = await response.text();
      const metaMatch = text.match(/<meta http-equiv="refresh" content="[\d]+;URL=([^"]+)"/i);
      if (metaMatch && metaMatch[1]) {
        return NextResponse.redirect(metaMatch[1]);
      } else {
        throw new Error('El servidor devolvió HTML en lugar de una respuesta JSON válida');
      }
    }

  } catch (error) {
    console.error('Error al procesar el pago:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Tiempo de espera agotado' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}