import React from "react";
import { Layout as BaseLayout } from "@components/layout";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout>{children}</BaseLayout>;
}
