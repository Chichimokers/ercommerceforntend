import { NextResponse } from 'next/server';

// Cache duration in seconds
const CACHE_DURATION = 3600; // 1 hour

// In-memory cache (will reset on server restart)
let cachedData: {
  result: any;
  timestamp: number;
} | null = null;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedData && (now - cachedData.timestamp) < (CACHE_DURATION * 1000)) {
      console.log("Returning cached exchange rate data");
      return NextResponse.json({
        usdRate: cachedData.result.tasas?.USD || null,
        timestamp: new Date(cachedData.timestamp).toISOString(),
        source: "cache"
      });
    }

    console.log("Fetching fresh exchange rate data");
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

    cachedData = {
      result,
      timestamp: now
    };

    return NextResponse.json({
      usdRate: result.tasas?.USD || null,
      timestamp: new Date().toISOString(),
      source: "fresh"
    });
  } catch (error) {
    console.error('Error in exchange rate API:', error);

    if (cachedData) {
      return NextResponse.json({
        usdRate: cachedData.result.tasas?.USD || null,
        timestamp: new Date(cachedData.timestamp).toISOString(),
        source: "stale_cache"
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch exchange rate data' },
      { status: 500 }
    );
  }
}