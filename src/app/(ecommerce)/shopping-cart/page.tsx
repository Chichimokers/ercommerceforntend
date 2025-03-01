"use client";

import { useContext, useState, useMemo, useCallback, useEffect } from "react";
import { ProductGrid } from "@/components/cards/sm-cart-card";
import { CartContext } from "@/contexts/cart-context";
import { useProductContext } from "@/contexts/product-context";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";
import { useForceUpdate } from "@hooks/useForceUpdate"; // Hook para forzar re-render
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@hooks/useMobile";

const Summary = dynamic(() => import("@/components/cards/summary"));
const CartCard = dynamic(() => import("@/components/cards/cart-cards"), { ssr: false });

export default function ShoppingCartPage() {
  const { cart } = useContext(CartContext) || {};
  const { cartProducts, mutateCartProducts, isLoadingCart } = useProductContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const forceUpdate = useForceUpdate();
  const isMobile = useIsMobile(); // Determina si es móvil

  // Forzamos re-render cuando cambie el carrito
  useEffect(() => {
    mutateCartProducts();
  }, [cart, forceUpdate]);

  const productMap = useMemo(
    () => new Map(cartProducts?.map((p) => [p.id, p]) || []),
    [cartProducts, cart]
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
    if (!cart) return [];
    return cart
      .map((item) => {
        const product = productMap.get(item.id);
        // Si no existe, usa datos mínimos
        if (product) {
          return { ...product, quantity: item.cantidad };
        } else {
          return {
            id: item.id,
            quantity: item.cantidad,
            name: "Producto",
            image: "/nophoto.jpeg",
            price: 0,
            short_description: '',
            averageRating: 0,
            category: '',
            description: '',
          };
        }
      })
      .filter((p) => p !== null);
  }, [cart, productMap]);

  const subtotal = useMemo(() => calculateSubtotal(), [calculateSubtotal]);
  const hasCartProducts = cartProductsWithQuantity.length > 0;

  if (isLoadingCart || !cart) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Cargando Productos..." />
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white inline-block border-b-4 border-blue-300 pb-2">
            Tu Carrito de Compras
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {hasCartProducts && (
              <>
                {/* Vista desktop */}
                <div className="hidden md:grid grid-cols-6 gap-4 bg-gray-100 dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm items-center">
                  <div className="col-span-3 font-semibold text-gray-700 dark:text-gray-300">
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

                {/* Renderiza ProductGrid en desktop y CartCard en móvil */}
                <div className="space-y-4">
                  {cartProductsWithQuantity.map((product) =>
                    isMobile ? (
                      <CartCard
                        key={`${product.id}-${cart?.length}`}
                        productCart={product}
                      />
                    ) : (
                      <ProductGrid
                        key={product.id}
                        productCart={product}
                        className="hover:shadow-lg transition-shadow"
                      />
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {hasCartProducts && (
            <div className="lg:col-span-1">
              <Summary
                className="sticky top-24 rounded-xl shadow-lg bg-white dark:bg-gray-800"
                shipping={1}
                subtotal={subtotal}
                tax={0.15}
              />
            </div>
          )}
        </div>

        {!hasCartProducts && (
          <div className="w-full flex flex-col items-center justify-center py-12 space-y-8">
            <div className="relative w-full max-w-sm aspect-square">
              <Image
                alt="Carrito Vacío"
                className={`object-contain transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                src="/Empty_Cart.svg"
                onLoad={() => setImageLoaded(true)}
                fill
                quality={100}
                loading="eager"
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Tu carrito está esperando
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Explora nuestros productos y descubre increíbles ofertas para llenar tu carrito.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
