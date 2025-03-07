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

const CartContext = createContext<CartState | undefined>(undefined);

const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const saveCart = debounce(() => {
      localStorage.setItem("cart", JSON.stringify(cart));
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
    localStorage.removeItem("cart");
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
