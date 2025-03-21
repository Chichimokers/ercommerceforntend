import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      throw new Error("Backend API URL not configured");
    }

    const apiUrl = `${backendUrl}payments/capture-payment/${orderId}`;
    const backendResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.access_token || undefined}`
      }
    });

    const data = await backendResponse.json();

    return NextResponse.json({
      success: true,
      data: data,
      message: "Pago capturado correctamente"
    });
  } catch (error: any) {
    console.error("Error capturing payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error"
      },
      { status: 500 }
    );
  }
}