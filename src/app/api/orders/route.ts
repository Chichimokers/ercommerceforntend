import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}userpublic/orders`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token?.accessToken ?? ""}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error en la respuesta de la API:", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
} 