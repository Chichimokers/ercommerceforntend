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
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-12 xs:px-8 xl:px-0">
      <div className="inline-block max-w-6xl w-full px-4">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold text-default-800 tracking-tight">
            Tu Carrito de Compras
          </h1>
          <div className="h-1 w-24 bg-primary-500 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div className="col-span-2 space-y-6">
            {hasCartProducts && (
              <>
                <div className="grid-cols-6 gap-4 hidden md:grid bg-default-100/50 px-6 py-4 rounded-xl shadow-sm items-center">
                  <div className="font-semibold col-span-3 text-default-600">Producto</div>
                  <div className="font-semibold text-center text-default-600">Precio Unitario</div>
                  <div className="font-semibold text-center text-default-600">Cantidad</div>
                  <div className="font-semibold text-center text-default-600">Total</div>
                </div>

                <div className="space-y-4">
                  {cartProductsWithQuantity.map((product) => (
                    <React.Fragment key={product.id}>
                      <ProductGrid
                        product={product}
                        className="hidden md:grid hover:shadow-lg transition-shadow"
                      />
                      <CartCard
                        className="md:hidden shadow-md hover:shadow-lg transition-all"
                        productCart={product}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
          </div>

          {hasCartProducts && (
            <div className="col-span-1 snap-center xs:col-span-2 md:col-span-1">
              <Summary
                className="sticky top-24 rounded-xl shadow-lg bg-background"
                shipping={1}
                subtotal={subtotal}
                tax={0.15}
              />
            </div>
          )}
        </div>

        {!hasCartProducts && (
          <div className="w-full flex flex-col items-center justify-center py-12 space-y-8">
            <div className="relative w-full max-w-md aspect-square">
              <Image
                alt="Carrito Vacío"
                className={`object-contain transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                src="/Empty_Cart.svg"
                onLoad={() => setImageLoaded(true)}
                fill
                quality={100}
                loading="eager"
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-default-800">
                Tu carrito está esperando
              </h2>
              <p className="text-default-500 dark:text-default-400 max-w-md">
                Explora nuestros productos y descubre increíbles ofertas para llenar tu carrito
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
