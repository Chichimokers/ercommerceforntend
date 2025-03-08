import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = `https://tasas.eltoque.com/v1/trmi`;

    const token = process.env.NEXT_PUBLIC_ELTOQUE_TOKEN;

    if (!token) {
      console.error('Missing El Toque API token');
      return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      usdRate: result.tasas?.USD || null,
    });

  } catch (error) {
    console.error('Error in exchange rate API route:', error);
    return NextResponse.json(
      { error: 'Server error processing exchange rate request' },
      { status: 500 }
    );
  }
}