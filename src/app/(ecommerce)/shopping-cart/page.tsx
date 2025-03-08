"use client";

import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import { CartContext } from "@/contexts/cart-context";
import { Spinner } from "@heroui/react";
import { useProductContext } from "@/contexts/product-context";
import CartCard from "@/components/cards/cart-cards";
import SmCartCard from "@/components/cards/sm-cart-card";
import OrderSummary from "@components/cards/summary";
import EmptyCart from "@components/empty/empty-cart";

export default function ShoppingCartPage() {
  const { cart } = useContext(CartContext) || {};
  const { cartProducts, isLoading } = useProductContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const productMap = useMemo(
    () => new Map(cartProducts?.map((p) => [p.id, p]) || []),
    [cartProducts]
  );

  const calculateSubtotal = useCallback(
    () =>
      cart
        ? cart.reduce((total, item) => {
          const product = productMap.get(item.id);
          if (!product) return total;

          let itemPrice = product.price;

          if (product.discount && item.cantidad >= product.discount.min) {
            itemPrice = itemPrice - product.discount.reduction;
          }
          return total + (itemPrice * item.cantidad);
        }, 0)
        : 0,
    [cart, productMap]
  );

  const cartProductsWithQuantity = useMemo(() => {
    if (!cart || !cartProducts.length) return [];

    return cartProducts.filter(product =>
      cart.some(item => item.id === product.id)
    );
  }, [cart, cartProducts]);

  const hasCartProducts = useMemo(() =>
    cartProductsWithQuantity.length > 0,
    [cartProductsWithQuantity]
  );

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Cargando Productos..." />
      </div>
    );
  }

  return (
    <section className="py-12 mt-16 sm:px-4">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white inline-block border-b-4 border-blue-300 pb-2">
            Tu Carrito de Compras
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {hasCartProducts ? (
              <>
                <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 bg-gray-100 dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm items-center">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    Producto
                  </div>
                  <div className="font-semibold text-center text-gray-700 dark:text-gray-300">
                    Precio Unitario
                  </div>
                  <div className="font-semibold text-center text-gray-700 dark:text-gray-300">
                    Cantidad
                  </div>
                  <div className="font-semibold text-center text-gray-700 dark:text-gray-300">
                    Total
                  </div>
                </div>

                <div className="space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
                  {cartProductsWithQuantity.map((product) =>
                    isMobile ? (
                      <CartCard
                        key={`${product.id}-mobile-${cart?.length}`}
                        productCart={product}
                      />
                    ) : (
                      <SmCartCard
                        key={`${product.id}-desktop-${cart?.length}`}
                        product={product}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-4"
                      />
                    )
                  )}
                </div>
              </>
            ) : (
              <EmptyCart />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary subtotal={calculateSubtotal()} shipping={1} />
          </div>
        </div>
      </div>
    </section>
  );
}