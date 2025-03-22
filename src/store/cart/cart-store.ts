"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types/interfaces";
import Cookies from 'js-cookie';

// Cookie settings
const COOKIE_NAME = "cart";
const COOKIE_EXPIRY = 1; // days
const COOKIE_PATH = "/";

// Custom storage para sincronizar con cookies además del localStorage
const customStorage = {
  getItem: (name: string) => {
    // Priorizar localStorage sobre cookies
    const value = localStorage.getItem(name);
    if (value) return value;

    // Fallback a cookies
    const cookieValue = Cookies.get(name);
    return cookieValue || null;
  },

  setItem: (name: string, value: string) => {
    // Guardar en localStorage con formato de Zustand
    localStorage.setItem(name, value);

    try {
      // Parsear el valor para obtener los items del carrito
      const parsedValue = JSON.parse(value);
      const cartItems = parsedValue.state.cart || [];

      // Guardar en cookies en dos formatos

      // 1. Formato Zustand (para la persistencia del store)
      Cookies.set(name, value, {
        expires: COOKIE_EXPIRY,
        path: COOKIE_PATH,
        sameSite: 'lax'
      });

      // 2. Formato legacy (para el middleware) - NUEVO
      Cookies.set("cart-legacy", JSON.stringify(cartItems), {
        expires: COOKIE_EXPIRY,
        path: COOKIE_PATH,
        sameSite: 'lax'
      });

      // Dispatch event para debugging
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartSynced', {
          detail: {
            source: 'zustand',
            items: cartItems.length
          }
        }));
      }
    } catch (error) {
      console.error("Error saving cart to cookie", error);
    }
  },

  removeItem: (name: string) => {
    // Limpiar de todos los almacenamientos
    localStorage.removeItem(name);
    Cookies.remove(name, { path: COOKIE_PATH });
    Cookies.remove("cart-legacy", { path: COOKIE_PATH });
  }
};

// Tipos de la store
interface CartStore {
  // Estado
  cart: CartItem[];

  // Acciones
  addItem: (product: { id: string; price: number }, quantity: number) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string, amount?: number) => void;
  decreaseQuantity: (productId: string, amount?: number) => void;
  clearCart: () => void;
}

// Creación de la store con persistencia
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      cart: [],

      // Acciones
      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.id === product.id);

          if (existingItem) {
            // Actualizar cantidad si el producto ya existe
            return {
              cart: state.cart.map(item =>
                item.id === product.id
                  ? { ...item, cantidad: item.cantidad + quantity }
                  : item
              )
            };
          } else {
            // Añadir nuevo producto
            return {
              cart: [
                ...state.cart,
                { id: product.id, cantidad: quantity, price: product.price }
              ]
            };
          }
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          cart: state.cart.filter(item => item.id !== productId)
        }));
      },

      increaseQuantity: (productId, amount = 1) => {
        set((state) => ({
          cart: state.cart.map(item =>
            item.id === productId
              ? { ...item, cantidad: item.cantidad + amount }
              : item
          )
        }));
      },

      decreaseQuantity: (productId, amount = 1) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.id === productId);

          if (existingItem && existingItem.cantidad > amount) {
            // Disminuir cantidad
            return {
              cart: state.cart.map(item =>
                item.id === productId
                  ? { ...item, cantidad: item.cantidad - amount }
                  : item
              )
            };
          } else {
            // Eliminar el producto si la cantidad sería 0 o menos
            return {
              cart: state.cart.filter(item => item.id !== productId)
            };
          }
        });
      },

      clearCart: () => {
        set({ cart: [] });
      }
    }),
    {
      name: COOKIE_NAME,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

// Hook para compatibilidad con el código existente
export function useCart() {
  const {
    cart,
    addItem,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart
  } = useCartStore();

  return {
    cart,
    AddCartItem: addItem,
    DelCartItem: (product: { id: string }) => removeItem(product.id),
    increaseQuantity: (product: { id: string }, mount: number) => increaseQuantity(product.id, mount),
    decreaseQuantity: (product: { id: string }, mount: number) => decreaseQuantity(product.id, mount),
    clearCart
  };
}