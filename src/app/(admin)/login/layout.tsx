import { authOptions } from "@app/api/auth/[...nextauth]/options";
import { Layout as BaseLayout } from "@components/layout";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({ children }: React.PropsWithChildren) {
  const data = await getData();

  if (!data.session?.user) {
    const path = new URL(data.headers.get('x-url') || "", "http://localhost").pathname;
    return redirect(`${path}?modal=login`);
  }

  return <BaseLayout>{children}</BaseLayout>;
}

async function getData() {
  const session = await getServerSession(authOptions);
  const headers = await import("next/headers");
  return {
    session,
    headers: headers.headers()
  };
}
