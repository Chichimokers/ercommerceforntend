import React from "react";
import { Layout as BaseLayout } from "@components/layout";

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout>{children}</BaseLayout>;
}
