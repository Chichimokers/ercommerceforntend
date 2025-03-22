"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart/cart-store";
import Cookies from 'js-cookie';

export function CartSyncBackup() {
  const cart = useCartStore(state => state.cart);

  useEffect(() => {
    try {
      if (Array.isArray(cart)) {
        Cookies.set("cart", JSON.stringify(cart), {
          expires: 1,
          path: "/",
          sameSite: 'lax'
        });
      }
    } catch (error) {
      console.error("Error syncing cart cookies:", error);
    }
  }, [cart]);

  return null; // Componente invisible
}