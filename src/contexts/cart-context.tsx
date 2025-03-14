"use client";

import { CartItem, CartState } from "@/types/interfaces";
import debounce from "lodash.debounce";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import Cookies from 'js-cookie';

const CartContext = createContext<CartState | undefined>(undefined);

// Cookie settings
const COOKIE_NAME = "cart";
const COOKIE_EXPIRY = 1; // days
const COOKIE_PATH = "/";

// Helper for setting both storage types
const saveToStorages = (cartData: CartItem[]) => {
  // Save to localStorage
  localStorage.setItem(COOKIE_NAME, JSON.stringify(cartData));

  // Save to cookie (limited to ~4KB)
  Cookies.set(COOKIE_NAME, JSON.stringify(cartData), {
    expires: COOKIE_EXPIRY,
    path: COOKIE_PATH,
    sameSite: 'lax'
  });

  // Dispatch event for debugging
  window.dispatchEvent(new CustomEvent('cartSynced', {
    detail: { source: 'context', items: cartData.length }
  }));
};

const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart on initial render
  useEffect(() => {
    try {
      // Try localStorage first (preferred)
      const savedCart = localStorage.getItem(COOKIE_NAME);

      if (savedCart) {
        setCart(JSON.parse(savedCart));
        // Also ensure cookie is in sync
        Cookies.set(COOKIE_NAME, savedCart, {
          expires: COOKIE_EXPIRY,
          path: COOKIE_PATH,
          sameSite: 'lax'
        });
      } else {
        // Check if cookie exists as fallback
        const cookieCart = Cookies.get(COOKIE_NAME);
        if (cookieCart) {
          setCart(JSON.parse(cookieCart));
          // Sync back to localStorage
          localStorage.setItem(COOKIE_NAME, cookieCart);
        }
      }
    } catch (error) {
      console.error("Error loading cart from storage", error);
    }
  }, []);

  // Save cart when it changes
  useEffect(() => {
    const saveCart = debounce(() => {
      saveToStorages(cart);
    }, 500);

    saveCart();
    return () => saveCart.cancel();
  }, [cart]);

  const AddCartItem = useCallback(
    (product: { id: string; price: number }, mount: number) => {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.id === product.id);
        if (existingProduct) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, cantidad: item.cantidad + mount }
              : item
          );
        } else {
          return [
            ...prevCart,
            { id: product.id, cantidad: mount, price: product.price },
          ];
        }
      });
    },
    []
  );

  const DelCartItem = useCallback((product: { id: string }) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== product.id));
  }, []);

  const increaseQuantity = useCallback(
    (product: { id: string }, mount: number) => {
      setCart((prevCart) => {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + (mount || 1) }
            : item
        );
      });
    },
    []
  );

  const decreaseQuantity = useCallback(
    (product: { id: string }, mount: number) => {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.id === product.id);
        if (existingProduct && existingProduct.cantidad > 1) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, cantidad: item.cantidad - (mount || 1) }
              : item
          );
        } else {
          return prevCart.filter((item) => item.id !== product.id);
        }
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    // Clear from both storage locations
    localStorage.removeItem(COOKIE_NAME);
    Cookies.remove(COOKIE_NAME, { path: COOKIE_PATH });
    setCart([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        AddCartItem,
        DelCartItem,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };
