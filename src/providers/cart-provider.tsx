"use client";

import React, { ReactNode, createContext, useContext } from "react";
import { useCart } from "@/store/cart/cart-store";
import { CartState } from "@/types/interfaces";

// Crear el mismo contexto que el original
export const CartContext = createContext<CartState | undefined>(undefined);

// Hook de compatibilidad para componentes que todavía usan useContext
export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}

// Componente de compatibilidad que simula el provider original
export function CartProvider({ children }: { children: ReactNode }) {
  // Usar el hook de compatibilidad que obtiene datos del store Zustand
  const cartState = useCart();

  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
}