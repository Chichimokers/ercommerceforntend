"use client";

import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import { CartContext } from "@/contexts/cart-context";
import { Spinner, Button, Divider } from "@heroui/react";
import { useProductContext } from "@/contexts/product-context";
import CartCard from "@/components/cards/cart-cards";
import SmCartCard from "@/components/cards/sm-cart-card";
import OrderSummary from "@components/cards/summary";
import EmptyCart from "@components/empty/empty-cart";
import { useLocation } from "@contexts/location-context";
import useSWR from "swr";
import { useShipping } from "@/contexts/shipping-context";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Tipos para mejor documentación del código
interface ShippingPriceRequest {
  total_weight: number;
  municipality: string;
}

export default function ShoppingCartPage() {
  const { cart, clearCart } = useContext(CartContext) || {};
  const { cartProducts, isLoading, mutateCartProducts } = useProductContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { location } = useLocation();
  const { setShippingPrice, setTotalWeight } = useShipping();

  useEffect(() => {
    mutateCartProducts();
  }, [mutateCartProducts]);

  const totalWeight = useMemo(() => {
    if (!cart || !cartProducts.length) return 0;

    const productMap = new Map(cartProducts.map(p => [p.id, p]));

    return cart.reduce((total, item) => {
      const product = productMap.get(item.id);
      if (!product) return total;
      return total + (product.weight * item.cantidad);
    }, 0);
  }, [cart, cartProducts]);

  // Fetcher para SWR con validación
  const fetchShippingPrice = useCallback(async (url: string) => {
    if (totalWeight === 0 || !location.municipality) {
      return 0;
    }

    const payload: ShippingPriceRequest = {
      total_weight: totalWeight,
      municipality: location.municipality
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || response.statusText);
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching shipping price:", error);
      throw error;
    }
  }, [totalWeight, location.municipality]);

  const { data: shippingPrice, error, isLoading: isLoadingPrice } = useSWR(
    () => totalWeight > 0 ? `${process.env.NEXT_PUBLIC_API_URL}public/shipping-price` : null,
    fetchShippingPrice,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
      errorRetryCount: 3,
    }
  );

  const subtotal = useMemo(() => {
    if (!cart || !cartProducts.length) return 0;

    const productMap = new Map(cartProducts.map(p => [p.id, p]));

    return cart.reduce((total, item) => {
      const product = productMap.get(item.id);
      if (!product) return total;

      let itemPrice = product.price;
      if (product.discount && item.cantidad >= product.discount.min) {
        itemPrice -= product.discount.reduction;
      }

      return total + (itemPrice * item.cantidad);
    }, 0);
  }, [cart, cartProducts]);

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Actualizar contexto cuando cambian los precios
  useEffect(() => {
    if (shippingPrice !== undefined && !isLoadingPrice) {
      setShippingPrice(shippingPrice);
    }

    setTotalWeight(totalWeight);
  }, [shippingPrice, isLoadingPrice, totalWeight, setShippingPrice, setTotalWeight]);

  // Productos en el carrito
  const cartItems = useMemo(() => {
    if (!cart || !cartProducts.length) return [];

    return cartProducts.filter(product =>
      cart.some(item => item.id === product.id)
    );
  }, [cart, cartProducts]);

  // Estado de carga inicial
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="py-8 sm:py-12 sm:px-4"
      >
        <div className="container mx-auto">
          {/* Header con animación y navegación */}
          <motion.header
            className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white inline-flex items-center">
              <ShoppingBag className="mr-2 h-8 w-8 text-blue-500" />
              <span className="border-b-4 border-blue-300 pb-1">Carrito de Compras</span>
            </h1>

            <Link href="/products" className="mt-4 sm:mt-0 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Continuar comprando
            </Link>
          </motion.header>

          {/* Cuerpo del carrito con animación */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Panel principal del carrito */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {cartItems.length > 0 ? (
                <>
                  {/* Encabezados de columnas */}
                  <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 bg-gray-50 dark:bg-gray-800 px-6 py-3 rounded-xl shadow-sm items-center">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      Producto
                    </div>
                    <div className="font-medium text-center text-gray-700 dark:text-gray-300">
                      Precio
                    </div>
                    <div className="font-medium text-center text-gray-700 dark:text-gray-300">
                      Cantidad
                    </div>
                    <div className="font-medium text-center text-gray-700 dark:text-gray-300">
                      Total
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {cartItems.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: cartItems.indexOf(product) * 0.1
                          }}
                        >
                          {isMobile ? (
                            <CartCard
                              key={`${product.id}-mobile-${cart?.length}`}
                              productCart={product}
                            />
                          ) : (
                            <SmCartCard
                              key={`${product.id}-desktop-${cart?.length}`}
                              product={product}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 px-6 py-4"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Acciones adicionales */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {cartItems.length} {cartItems.length === 1 ? 'producto' : 'productos'} en el carrito
                        </div>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onClick={clearCart}
                        >
                          Vaciar carrito
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyCart />
              )}
            </motion.div>

            {/* Panel de resumen */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="sticky top-20">
                {isLoadingPrice ? (
                  <div className="w-full rounded-xl bg-white dark:bg-gray-800 shadow-md p-6 space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                    </div>
                    <Divider />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <OrderSummary
                    subtotal={subtotal}
                    shipping={shippingPrice}
                    weight={totalWeight}
                    isLoadingPrice={isLoadingPrice}
                    cartItems={cartItems}
                    error={error}
                  />
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                    Error al calcular el envío. Por favor intenta nuevamente.
                  </div>
                )}


              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}