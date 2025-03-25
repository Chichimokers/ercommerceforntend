"use client";

import React, { useContext, useMemo, useState, useEffect, useCallback, memo } from "react";
import { CartContext } from "@/contexts/cart-context";
import { Spinner, Button, Divider } from "@heroui/react";
import { useProductContext } from "@/contexts/product-context";
import CartCard from "@/components/cards/cart-cards";
import SmCartCard from "@/components/cards/sm-cart-card";
import OrderSummary from "@components/cards/summary";
import EmptyCart from "@components/empty/empty-cart";
import { useLocationStore } from "@store/location/location-store";
import useSWR from "swr";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useCartStore } from "@store/cart/cart-store";

const MINIMUM_ORDER_AMOUNT = 85; // Mínimo requerido en dólares

interface ShippingPriceRequest {
  total_weight: number;
  municipality: string;
}

const CartItem = memo(({ product, isMobile }: { product: any, isMobile: boolean }) => {
  return (
    <div key={product.id} className="cart-item">
      {isMobile ? (
        <CartCard
          key={`${product.id}-mobile`}
          productCart={product}
        />
      ) : (
        <SmCartCard
          key={`${product.id}-desktop`}
          product={product}
          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 px-6 py-4"
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id &&
    prevProps.isMobile === nextProps.isMobile;
});

CartItem.displayName = 'CartItem';

const OrderSummarySkeleton = memo(() => (
  <div className="rounded-xl bg-white dark:bg-gray-800 shadow-md p-6 space-y-4">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
    </div>
    <Divider />
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
  </div>
));

OrderSummarySkeleton.displayName = 'OrderSummarySkeleton';

export default function ShoppingCartPage() {
  const { cart, clearCart } = useCartStore();
  const { cartProducts, mutateCartProducts } = useProductContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const { location } = useLocationStore();

  const deviceData = useDeviceDetection();
  const isMobile = deviceData.isMobile;

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

  const meetsMinimumAmount = useMemo(() => {
    return subtotal >= MINIMUM_ORDER_AMOUNT;
  }, [subtotal]);

  useEffect(() => {
    setIsMounted(true);

    const initialRenderTimer = setTimeout(() => {
      setIsInitialRender(false);
    }, 500);

    return () => {
      clearTimeout(initialRenderTimer);
    };
  }, []);

  const cartItems = useMemo(() => {
    if (cart.length === 0) return [];

    return cartProducts.filter(product =>
      cart.some(item => item.id === product.id)
    );
  }, [cart, cartProducts]);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center max-w-[100vw] overflow-hidden">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <section
      className="py-8 px-2 sm:py-12 sm:px-4 overflow-hidden max-w-full"
      style={{
        willChange: deviceData.isLowPerformance ? 'scroll-position' : 'auto',
        backfaceVisibility: 'hidden'
      }}
    >
      <div className="container mx-auto max-w-[100vw] overflow-x-hidden">
        <header className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white inline-flex items-center">
            <ShoppingBag className="mr-2 h-8 w-8 text-blue-500" />
            <span className="border-b-4 border-blue-300 pb-1">Carrito de Compras</span>
          </h1>

          <Link href="/products" className="mt-4 sm:mt-0 inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Continuar comprando
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full overflow-hidden">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.length > 0 ? (
              <>
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

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cartItems.map((product) => (
                      <CartItem
                        key={`cart-item-${product.id}`}
                        product={product}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>

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
                        disableAnimation={deviceData.isLowPerformance}
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
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 max-w-full overflow-hidden">
              {isLoadingPrice ? (
                <OrderSummarySkeleton />

              ) : (
                <OrderSummary
                  subtotal={subtotal}
                  shipping={shippingPrice}
                  weight={totalWeight}
                  isLoadingPrice={isLoadingPrice}
                  cartItems={cartItems}
                  error={error}
                  meetsMinimumAmount={meetsMinimumAmount} // Nueva propiedad
                  minimumAmount={MINIMUM_ORDER_AMOUNT} // Pasar el mínimo requerido
                />
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  Error al calcular el envío. Por favor intenta nuevamente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}