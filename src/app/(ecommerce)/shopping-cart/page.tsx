"use client";

import { ProductGrid } from "@/components/cards/sm-cart-card";
import { CartContext } from "@/contexts/cart-context";
import { useProductContext } from "@/contexts/product-context";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { useContext, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import React from "react";

const Summary = dynamic(() => import("@/components/cards/summary"));
const CartCard = dynamic(() => import("@/components/cards/cart-cards"));

export default function ShoppingCartPage() {
  const { cart } = useContext(CartContext) || {};
  const { cartProducts, isLoadingCart } = useProductContext();
  const [imageLoaded, setImageLoaded] = useState(false);

  const productMap = useMemo(
    () => new Map(cartProducts?.map((p) => [p.id, p]) || []),
    [cartProducts]
  );

  const calculateSubtotal = useCallback(
    () =>
      cart
        ? cart.reduce((total, item) => {
          const product = productMap.get(item.id);
          return total + item.cantidad * (product?.price ?? 0);
        }, 0)
        : 0,
    [cart, productMap]
  );

  const cartProductsWithQuantity = useMemo(() => {
    if (!cart || !productMap.size) return [];
    return cart
      .map((item) => {
        const product = productMap.get(item.id);
        return product ? { ...product, quantity: item.cantidad } : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [cart, productMap]);

  const subtotal = useMemo(() => calculateSubtotal(), [calculateSubtotal]);

  const hasCartProducts = cartProductsWithQuantity.length > 0;

  if (isLoadingCart || !cart) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner label="Cargando Productos..." />
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 xs:px-8 xl:px-0">
      <div className="inline-block max-w-6xl w-full">
        <h1 className="text-3xl font-bold">Carro de compras</h1>
        <hr className="mt-3 opacity-100 dark:opacity-30" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="col-span-2">
            {hasCartProducts && (
              <div className="flex flex-col gap-4">
                <div className="grid-cols-5 gap-4 pb-2 hidden md:grid">
                  <div className="font-bold col-span-2">Producto</div>
                  <div className="font-bold text-center">Precio</div>
                  <div className="font-bold text-center">Cantidad</div>
                  <div className="font-bold text-center">Subtotal</div>
                </div>

                {cartProductsWithQuantity.map((product) => (
                  <React.Fragment key={product.id}>
                    <ProductGrid product={product} className="hidden md:grid" />
                    <CartCard className="md:hidden" productCart={product} />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {hasCartProducts && (
            <div className="col-span-1 snap-center xs:col-span-2 md:col-span-1">
              <Summary
                className="sticky top-20"
                shipping={1}
                subtotal={subtotal}
                tax={0.15}
              />
            </div>
          )}
        </div>
        {!hasCartProducts && (
          <div className="w-full flex flex-col items-center justify-center py-8">
            <div className="relative w-full xs:w-3/4 sm:w-2/3 md:w-1/2 h-[30vh] xs:h-[35vh] md:h-[40vh]">
              <Image
                alt="Carrito Vacío"
                className={`object-contain transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                src="/Empty_Cart.svg"
                onLoad={() => setImageLoaded(true)}
                fill
                quality={80}
                loading="lazy"
              />
            </div>
            <h2 className="text-lg xs:text-xl md:text-2xl text-default-500 font-medium text-center mt-4">
              No hay productos en el carrito
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}
