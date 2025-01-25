import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
