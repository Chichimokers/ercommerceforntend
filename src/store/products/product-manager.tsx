"use client";

import { Suspense } from "react";
import { useProductManager } from "@/store/products/product-store";

// Componente interno que usa hooks que pueden suspender
function ProductManagerInner() {
  useProductManager();
  return null;
}

// Componente exportado que envuelve con Suspense
export default function ProductManager() {
  return (
    <Suspense fallback={null}>
      <ProductManagerInner />
    </Suspense>
  );
}