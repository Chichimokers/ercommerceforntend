import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentMethod } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Se requiere orderId' }, { status: 400 });
    }

    // Obtener token y verificar autenticación
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    // Validar que el usuario está autenticado
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Usar la URL base desde variables de entorno
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      throw new Error('URL de API no configurada');
    }

    // Seleccionar endpoint según método de pago
    let url = `${API_URL}visa-mastercard/create-payment`;
    if (paymentMethod === 'paypal') {
      url = `${API_URL}paypal/create-payment`;
    }

    // Llamada al API con timeout para evitar esperas indefinidas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

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
      // Importante: NO seguir redirecciones automáticamente
      redirect: 'manual'
    });

    clearTimeout(timeoutId);

    // Verificar si es una redirección
    if (response.status === 302 || response.status === 303 || response.status === 307) {
      const redirectUrl = response.headers.get('location');

      if (redirectUrl) {
        // Devolver la URL para redirección en el cliente
        return NextResponse.json({
          success: true,
          redirectUrl,
          message: `Redirigiendo a pasarela de pago`
        });
      }
    }

    // Si no es redirección, intentar parsear como JSON
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
      // Si falla al parsear JSON, podría ser HTML u otro formato
      const text = await response.text();

      if (text.includes('<!doctype') || text.includes('<html')) {
        // Es HTML, probablemente una página de error o de redirección
        throw new Error('El servidor devolvió HTML en lugar de una respuesta JSON válida');
      } else {
        throw new Error('Formato de respuesta no reconocido');
      }
    }

  } catch (error) {
    console.error('Error al procesar el pago:', error);

    // Manejar errores específicos
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Tiempo de espera agotado' },
        { status: 504 } // Timeout
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