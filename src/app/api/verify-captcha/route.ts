import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token CAPTCHA no proporcionado'
      }, { status: 400 });
    }

    console.log('Verificando token CAPTCHA...');

    // Usar la variable de entorno o la clave de prueba de Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

    // Construir el cuerpo de la solicitud en el formato correcto
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    // Verificar el código de estado HTTP
    if (!response.ok) {
      console.error(`Error HTTP: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        success: false,
        message: `Error en la API de reCAPTCHA: ${response.status}`,
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('Respuesta completa de reCAPTCHA:', data);

    if (!data.success) {
      console.error('Verificación de CAPTCHA fallida:', {
        'error-codes': data['error-codes'],
        full_response: data
      });

      // Crear un mensaje más descriptivo basado en los códigos de error
      let errorMessage = 'Verificación de CAPTCHA fallida';
      if (data['error-codes'] && Array.isArray(data['error-codes'])) {
        const errorCode = data['error-codes'][0];

        const errorMessages = {
          'missing-input-secret': 'Falta la clave secreta de reCAPTCHA',
          'invalid-input-secret': 'La clave secreta de reCAPTCHA no es válida',
          'missing-input-response': 'Falta el token de respuesta del reCAPTCHA',
          'invalid-input-response': 'El token de respuesta del reCAPTCHA no es válido',
          'bad-request': 'La solicitud no es válida o está malformada',
          'timeout-or-duplicate': 'El token ha expirado o ya ha sido utilizado'
        };

        errorMessage = errorMessages[errorCode as keyof typeof errorMessages] || errorMessage;
      }

      return NextResponse.json({
        success: false,
        message: errorMessage,
        errors: data['error-codes']
      }, { status: 400 });
    }

    // Éxito
    return NextResponse.json({
      success: true,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname
    });
  } catch (error) {
    console.error('Error inesperado en la verificación de CAPTCHA:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno en la verificación'
    }, { status: 500 });
  }
}